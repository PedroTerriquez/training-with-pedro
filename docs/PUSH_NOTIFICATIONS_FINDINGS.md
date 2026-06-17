# Push Notifications — Findings & Architecture

_Last updated: 2026-06-17 (v1.74)_

## TL;DR

On this app's target platform (**iOS Safari PWA + Apple Watch**), **encrypted Web Push
payloads (RFC 8291 / `aes128gcm`) are NOT reliably shown on the device**, even though
Apple's push service accepts them. The working mechanism is a **payload-less ("empty")
push that only wakes the Service Worker**, which then reads the notification content
from a local Cache. The whole rest-timer notification cycle is built on this.

## The decisive evidence

While debugging "no notification arrives on Iniciar", we tailed the Worker
(`wrangler tail`) during a real device click. The log showed:

```
POST /api/push/start                         → 200 (Worker OK)
[PUSH_RESULT] endpoint: web.push.apple.com…  status: 201   ← Apple ACCEPTED the push
```

…yet **no notification appeared on the device.**

**Key insight:** Apple returning **201** only means Apple accepted the encrypted blob
for relay. It does **not** mean the device displayed it. If the RFC 8291 encryption is
even slightly off, the browser fails to decrypt the payload and **silently drops it** —
the `push` event may not even fire. So `201` is not proof of delivery.

This explains the project's history: a previous iteration built an "empty push + cache"
hack and littered `sendWebPush` with `[PUSH_DEBUG]` crypto logs. The encrypted path was
being fought with and likely never worked end-to-end on iOS; only the empty-push
notification (the immediate "Tap para iniciar") was ever actually visible. The
encrypted delayed "Descanso terminado" almost certainly never showed.

### Regression we introduced and fixed

In v1.74's first cut we "unified" everything onto the encrypted `sendWebPush` path
(it looked cleaner). That **broke the only notification that used to work**, because
encrypted pushes don't render on the device. Fixed by moving **all** pushes to the
empty-push + cache mechanism.

## Why empty push + local cache is the right design here

- This is a **single-device PWA**. The data needed to render a notification is always
  available locally, so the push doesn't need to *carry* anything — it only needs to
  **wake the Service Worker**.
- Empty pushes need **no decryption**, so there's no fragile crypto in the delivery path.
- An empty push wakes the SW even when the app is closed/backgrounded, and the SW can
  read CacheStorage, so the perpetual cycle works without the app in the foreground.

## How it works now (v1.74)

```
CLICK "Iniciar"
  ├─ stage push-pending /pending = { kind:'start', exerciseData }   (local cache)
  ├─ wait 2s (Apple Watch sync)
  └─ POST /api/push/start  →  Worker sends EMPTY push (VAPID auth, Content-Length:0)
        └─ SW push event: no payload → read push-pending → showStartNotification()

TAP "Tap para iniciar descanso"   (notificationclick, kind:'start')
  ├─ SW writes rest-pending /pending = exerciseData + /from-notification flag, focuses app
  └─ app onStartNotificationTap():
        ├─ stage push-pending /pending = { kind:'done', exerciseData }
        ├─ POST /api/rest-timer/start  (endTime = now + rest*1000 − 10000)  → Worker Queue
        └─ startRestBanner()  (decorative, best-effort)

DELAYED empty push fires (~rest − 10s; latency compensation)
  └─ SW push event: no payload → read push-pending {done} →
        showDoneNotification("Descanso terminado")  +  showStartNotification()  +  closeDoneAfter(20s)

TAP "Descanso terminado" (kind:'done') → only opens the app, no timer.
```

### Source of truth & roles
- The **delayed empty push** is the source of truth for "rest over" (works with the
  app closed / on the Watch). The in-app **banner is decorative**, best-effort.
- **Stable tags** `rest-start` / `rest-done` → notifications replace instead of stacking
  (never more than one of each). `closeDoneAfter(20000)` best-effort dismisses
  "Descanso terminado" after 20s (reliable on desktop; the SW may be killed first on iOS,
  so the stable tag is the real guarantee against accumulation).

## Caches involved (single device)

| Cache | Key | Written by | Read by |
|---|---|---|---|
| `push-pending` | `/pending` | client `_stageNotification` (Iniciar click, tap) | SW `push` handler (empty push) |
| `rest-pending` | `/pending` | SW `notificationclick` (kind:start) | app `onStartNotificationTap` |
| `rest-pending` | `/from-notification` | SW `notificationclick` (kind:start) | app `onStartNotificationTap` |
| `rest-timer` | `/pending` | app `startRestBanner` | app `_checkRestTimer` (banner) |

## Worker endpoints

- `POST /api/push/subscribe` / `unsubscribe` — manage the device subscription in KV.
- `POST /api/push/start` — send an **empty** push to wake the SW (immediate "start").
- `POST /api/rest-timer/start` — enqueue a delayed message; the `queue` consumer sends
  an **empty** push at `delaySeconds = ceil((endTime − now)/1000)` (= `rest − 10s`).
- `POST /api/rest-timer/cancel` — mark a queued timer cancelled (KV flag).
- AI endpoints (`/api/ai/*`) are unrelated to push.

`sendEmptyPush()` is the only push sender. The old encrypted `sendWebPush` + manual
HKDF/AES-GCM code and `[PUSH_DEBUG]` logs were removed.

## Multi-device / multi-user isolation

The system is **per-device by design** — multiple people can use the app and each one
only receives their own rest notifications. There is no shared inbox and no risk of one
user receiving another's notifications.

How it works:

- On first use, each device mints a random **`deviceId`** and stores it in `localStorage`
  (`app.js` `_deviceId()`, e.g. `dev_l8x2k_a9f3`). Think of it as a personal locker number.
- On subscribe, that device's push subscription is saved in the Worker's KV under
  **`sub_${deviceId}`**.
- Every push action (`/api/push/start`, `/api/rest-timer/start`, `/api/rest-timer/cancel`)
  sends the caller's `deviceId`; the Worker only ever delivers to **that** device's
  subscription. The Queue message also carries the `deviceId`, so the delayed push goes
  back to the same device.
- The staged notification text lives in **each device's own CacheStorage** (`push-pending`),
  so notification content is never shared either.

Caveats (not bugs, just properties of the design):

- **Per-device, not per-account.** There is no login. One person on two devices = two
  lockers (they'd be notified on both). Linking a user's devices would require adding
  authentication/accounts.
- **Clearing site data** drops the `deviceId`; the user must re-enable notifications (a new
  id is minted). The old subscription stays orphaned in KV until it returns `410` on a send
  and gets cleaned up.
- **No auth on the deviceId.** It's the only key. Random + secret, so it's not guessable in
  practice, but anyone who learned another device's id could trigger pushes to it. Add login
  if you ever handle sensitive data.

## Gotchas / future notes

- **If you ever need to send a real payload** (e.g. multi-device, or content the device
  can't know locally), the encrypted path must be re-derived and **verified by actual
  on-device display**, not by the push service's HTTP status. Don't trust `201`.
- A push can arrive while `push-pending` holds a spec from a *different* exercise (e.g.
  user taps Iniciar on exercise B while A's rest is pending). With a single cache slot the
  last writer wins; acceptable for now, but note it if the cycle ever feels "wrong".
- iOS web push requires the PWA to be **installed to the Home Screen** and notification
  permission **granted**; verify both when "nothing shows".
- Diagnose delivery with `cd push-worker && npx wrangler tail` and watch for
  `[PUSH_RESULT] empty status: …` while clicking on the device.
```
