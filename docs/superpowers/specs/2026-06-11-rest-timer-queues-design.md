# Rest Timer con Cloudflare Queues delaySeconds

## Problem

The current rest timer relies on `setTimeout` + Cache API in the app's main thread.
When the phone is locked or the app is backgrounded, JavaScript execution pauses.
The timer completion notification fires only when the user reopens the app — it
never arrives at the correct time. iOS also kills Service Worker timers after ~30s.

## Solution

Use Cloudflare Queues with `delaySeconds` to schedule a push notification at the
exact end time. When the user starts a rest timer, the app sends the endTime to
the Worker, which enqueues a message with `delaySeconds`. When the delay expires,
the Queue consumer sends a Web Push notification to the device — even if the
phone is locked or the app is closed.

Additionally, the app keeps a client-side fallback (`setTimeout` +
`visibilitychange` → Cache API recovery) so that when the app IS open, the timer
completes instantly without waiting for the push.

## Architecture

```
┌─ Client ──────────────────────────────────────┐
│                                                │
│  [⚡ Iniciar] tap                               │
│    ├── Botón bloqueado 3s (visual)            │
│    ├── Cache API: /rest-pending ← {exercise}   │
│    └── sendPushNotification("Tap para iniciar")│
│                                                │
│  notificación tap → clients.openWindow()       │
│    ├── App init → read /rest-pending            │
│    ├── _startRestTimer(name, restSec, ...)     │
│    │   └── Cache API: /rest-timer/pending      │
│    └── scheduleRestTimer(endTime, ...)         │
│        └── POST /api/rest-timer/start          │
│                                                │
│  _completeRest() → toast + re-show ORIGINAL   │
│    └── POST /api/rest-timer/cancel            │
│                                                │
│  visibilitychange → _checkRestTimer()          │
│    └── Cache API recovery                      │
└────────────────────────────────────────────────┘

┌─ Worker ───────────────────────────────────────┐
│                                                 │
│  POST /api/rest-timer/start                     │
│    ├── Calcula delay = endTime - Date.now()     │
│    └── env.REST_TIMER_QUEUE.send(body, {        │
│          delaySeconds: Math.ceil(delay/1000)    │
│        })                                       │
│                                                 │
│  POST /api/rest-timer/cancel                    │
│    └── env.PUSH_KV.put(`cancel_${tag}`, '1')   │
│                                                 │
│  queue(batch, env) (consumer)                   │
│    ├── Lee cancel_${tag} de KV                  │
│    ├── Si cancelado → skip (y borra flag)       │
│    ├── sendWebPush("⏰ Descanso terminado")     │
│    └── sendWebPush(ORIGINAL: "Tap para iniciar")│
│                                                 │
│  POST /api/push/send (sin cambios)              │
│    └── empty push → SW lee Cache API           │
└────────────────────────────────────────────────┘
```

## Push Payload: Server-Originated vs Client-Originated

There are two types of push notifications in this system:

### Client-originated (existing flow)
The app calls `sendPushNotification()` which:
1. Writes notification data to Cache API `push-pending`
2. Calls `POST /api/push/send` → Worker sends empty push (VAPID only)
3. SW `push` event fires → reads from `push-pending` → shows notification

### Server-originated (new flow via Queue consumer)
The Queue consumer calls `sendWebPush()` directly with an encrypted payload:
1. Worker encrypts `{ title, body, tag, url, restSeconds, exerciseId }` using Web Push encryption
2. Push arrives at device with actual payload
3. SW `push` event fires → reads from `e.data.json()` → shows notification

The SW `push` handler needs to support BOTH paths: try `e.data.json()` first,
fall back to Cache API (`push-pending`).

## Files Modified

### `push-worker/wrangler.toml`
Add Queues producer and consumer bindings:
```toml
[[queues.producers]]
binding = "REST_TIMER_QUEUE"
queue = "rest-timers"

[[queues.consumers]]
queue = "rest-timers"
max_batch_size = 1
max_batch_timeout = 5
```

### `push-worker/src/index.js`
Add three new handlers:
- `POST /api/rest-timer/start` — receives `{ endTime, deviceId, tag, title, body }`, calculates delay, sends to Queue
- `POST /api/rest-timer/cancel` — receives `{ tag }`, writes cancel flag to KV
- `export default { ..., queue(batch, env) }` — consumer: checks cancel flag, sends push, deletes flag

### `app.js`
1. Add `scheduleRestTimer(endTime, tag, title, body)` — POSTs to `/api/rest-timer/start`
2. Add `cancelRestTimer(tag)` — POSTs to `/api/rest-timer/cancel`
3. Add `_checkPendingRest()` — on init, reads Cache API `/rest-pending` and `/rest-pending-from-push` → if found, start timer
4. `_completeRest()` now also calls `cancelRestTimer(tag)` + `sendPushNotification()` to re-show ORIGINAL + writes to `/rest-pending`
5. `sendPushNotification()` should NOT include `restSeconds` anymore (no auto-timer)

### `components/detail.js`
- [⚡ Iniciar] handler: block button 3s, write to Cache API `/rest-pending`, send push
- Does NOT call `_startRestTimer()` anymore — timer starts when user taps notification

### `sw.js`
- `push` event: read from `e.data.json()` first (server-originated encrypted push), fall back to Cache API `push-pending` (client-originated empty push). If the push has `exerciseData` (ORIGINAL re-show), write it to Cache API `/rest-pending-from-push` so the app finds it on open
- `notificationclick`: always call `clients.openWindow('./')` and close notification. Remove the old "⏱️ Xs" confirmation logic

## Data Flow per User Action

### [⚡ Iniciar] tap
1. Button disabled + visual feedback for 3s
2. Cache API: `caches.open('rest-pending') → put('/pending', { exerciseId, name, sets, reps, restSec })`
3. `sendPushNotification(name, "3×10 · Tap para iniciar descanso", tag, 0)` — no restSeconds
4. After 3s, re-enable button

### User taps notification
1. SW `notificationclick` → `clients.openWindow('./')`
2. App JS loads, runs `init()`
3. `init()` calls new function `_checkPendingRest()`
4. `_checkPendingRest()` reads Cache API `/rest-pending`
5. If found: `_startRestTimer(name, restSec, tag, sets, reps)` + delete `/rest-pending`
6. `_startRestTimer()` stores endTime in Cache API `/rest-timer/pending` + starts setTimeout
7. ALSO calls `scheduleRestTimer(endTime, tag, ...)` → POST to Worker → Queue

### Timer completes (client-side, app open)
1. `_completeRest()` fires
2. `showToast("⏰ Descanso terminado")`
3. `cancelRestTimer(tag)` → POST to Worker → KV cancel flag
4. `sendPushNotification(name, "3×10 · Tap para iniciar descanso", newTag, 0)` — re-show ORIGINAL
5. Write to Cache API `/rest-pending` for next cycle

### Timer completes (server-side, phone locked)
1. Queue consumer fires after exact delay
2. Reads `cancel_${tag}` from KV — if set, skip (user already completed client-side)
3. If not cancelled: `sendWebPush("⏰ Bench Press — Descanso terminado")`
4. Then `sendWebPush("Bench Press 3×10 · Tap para iniciar descanso")` — re-show ORIGINAL
5. Delete cancel flag from KV

### User reopens app after server-side push
1. App loads → no `/rest-pending` (already consumed on first tap)
2. User taps the ORIGINAL notification → SW opens app
3. SW's `push` event received the ORIGINAL payload with `exerciseData` and wrote it to Cache API `/rest-pending-from-push`
4. App's `_checkPendingRest()` reads `/rest-pending-from-push` → found → starts timer
5. After consuming, deletes `/rest-pending-from-push`

### User manually opens app (not from notification)
1. `_checkPendingRest()` checks Cache API
2. If `/rest-pending` or `/rest-timer/pending` exists → check if timer expired
3. If expired: `_completeRest()`
4. If not expired: re-set setTimeout for remaining time

## Cancel Flow

When user completes a rest (client-side detects it), or when user manually dismisses:
1. `cancelRestTimer(tag)` → Worker writes `cancel_${tag}` to KV with TTL 1h
2. Queue consumer checks this flag before sending push
3. If flag exists: delete flag, skip sending
4. If Queue message already consumed and push sent: no harm (duplicate "terminado" is harmless)

## Edge Cases

| Case | Handling |
|------|----------|
| User taps ⚡ multiple times | Button blocked 3s + tag changes each time |
| Queue consumer fires after cancel | Check KV flag → skip |
| App opens manually during timer | `_checkPendingRest()` → `_checkRestTimer()` recovers |
| Timer expires while app open | setTimeout fires → `_completeRest()` → cancels Queue |
| Queue delay +1s rounding | Math.ceil((endTime - now) / 1000) — push may arrive ~1s early but never late |
| Push re-shows ORIGINAL but app already re-started cycle | Tag mismatch — user sees stale notification, harmless |
