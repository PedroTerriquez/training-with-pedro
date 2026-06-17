# Push Worker (`coach-pedro-ai`)

Cloudflare Worker that backs the PWA's **push notifications** and **AI features**.
It is the only server-side component; the app itself is a static PWA on GitHub Pages.

> Architecture & the iOS empty-push design: [`../docs/PUSH_NOTIFICATIONS_FINDINGS.md`](../docs/PUSH_NOTIFICATIONS_FINDINGS.md).

## What it does

- **Push subscriptions** — stores one Web Push subscription per device in KV
  (`sub_${deviceId}`).
- **Rest-timer notifications** — sends payload-less ("empty") pushes that wake the
  Service Worker; the SW renders the notification from a local cache. Delayed
  "Descanso terminado" pushes are scheduled through a **Cloudflare Queue**.
- **AI** — routes coach/import/program/exercise requests to Gemini (with a Llama 3.1
  fallback on Workers AI).

## Endpoints

| Route | Purpose |
|---|---|
| `POST /api/push/subscribe` | Save `{ subscription, deviceId }` to KV. |
| `POST /api/push/unsubscribe` | Delete a device's subscription. |
| `POST /api/push/start` | Send an **empty** push now → SW shows "Tap para iniciar descanso". |
| `POST /api/rest-timer/start` | Enqueue a delayed empty push (`delaySeconds = ceil((endTime-now)/1000)`, i.e. `rest − 10s`). |
| `POST /api/rest-timer/cancel` | Mark a queued timer cancelled (KV flag `cancel_${tag}`). |
| `POST /api/ai/coach` · `/import` · `/program-coach` · `/exercise-coach` | AI inference. |

The `queue` consumer drains `rest-timers`, skips cancelled tags, and sends the delayed
empty push via `sendEmptyPush()`.

## Bindings (see `wrangler.toml`)

| Binding | Resource |
|---|---|
| `PUSH_KV` | KV namespace — subscriptions + cancel flags. |
| `REST_TIMER_QUEUE` | Queue `rest-timers` (producer + consumer). |
| `AI` | Workers AI (Llama fallback). |

## Secrets / vars

Set once with `npx wrangler secret put <NAME>`:

- `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` — generate with `npx web-push generate-vapid-keys`.
  The **public** key also goes into the app's `push-config.js`.
- `GEMINI_API_KEY` — optional; without it AI falls back to Workers AI (Llama).
- `VAPID_EMAIL` — set as a plain var in `wrangler.toml` (`mailto:` contact for VAPID).

## Develop & deploy

```bash
cd push-worker
npm install
npm run dev      # wrangler dev (local)
npm run deploy   # wrangler deploy → https://coach-pedro-ai.pollothe.workers.dev
```

After deploying, the app at `push-config.js` must point `PUSH_SERVER_URL` at this Worker.

## Debugging delivery

```bash
cd push-worker
npx wrangler tail                 # live logs while you click on a real device
# watch for: [PUSH_RESULT] empty status: 201   ← Apple accepted the push
```

**Important:** Apple returning `201` only means it accepted the push for relay — it is
**not** proof the device displayed it. (Encrypted payloads can be accepted and then
silently dropped on-device; that's why we use empty pushes. See the findings doc.)
