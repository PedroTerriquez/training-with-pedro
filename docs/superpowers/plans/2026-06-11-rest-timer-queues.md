# Rest Timer con Cloudflare Queues delaySeconds — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the broken client-side-only rest timer with Cloudflare Queues `delaySeconds` so notifications arrive at the correct time even when the phone is locked.

**Architecture:** User taps [⚡ Iniciar] → sends push notification with "Tap para iniciar descanso" → user taps notification → app opens → timer starts → app sends endTime to Worker → Worker enqueues message with `delaySeconds` → Queue consumer sends push at exact endTime. Client-side `setTimeout` + `visibilitychange` recovery for instant response when app is open.

**Tech Stack:** Cloudflare Workers + Queues + KV, Web Push, SW Cache API

---

### Task 1: Add Queues bindings to wrangler.toml

**Files:**
- Modify: `push-worker/wrangler.toml`

- [ ] **Step 1: Add Queues producer + consumer to wrangler.toml**

```toml
[[queues.producers]]
binding = "REST_TIMER_QUEUE"
queue = "rest-timers"

[[queues.consumers]]
queue = "rest-timers"
max_batch_size = 1
max_batch_timeout = 5
```

- [ ] **Step 2: Commit**

```bash
git add push-worker/wrangler.toml
git commit -m "feat: add Queues bindings for rest timer"
```

---

### Task 2: Worker — POST /api/rest-timer/start

**Files:**
- Modify: `push-worker/src/index.js`

Adds a new endpoint that receives `{ endTime, deviceId, tag, title, body, exerciseId, sets, reps }`, calculates `delaySeconds`, and enqueues the message.

- [ ] **Step 1: Add the endpoint handler before the final `return respond('Not Found', 404)`**

```js
if (url.pathname === '/api/rest-timer/start') {
  try {
    const { endTime, deviceId, tag, title, body, exerciseId, sets, reps } = await req.json()
    if (!endTime || !deviceId || !tag) return respond({ error: 'endTime, deviceId, tag required' }, 400)
    const now = Date.now()
    const delayMs = endTime - now
    if (delayMs <= 0) return respond({ error: 'endTime already passed' }, 400)
    const delaySec = Math.ceil(delayMs / 1000)
    await env.REST_TIMER_QUEUE.send({ deviceId, tag, title, body, exerciseId, sets, reps }, { delaySeconds: delaySec })
    return respond({ status: 'scheduled', delaySec })
  } catch (err) {
    return respond({ error: err.message }, 500)
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add push-worker/src/index.js
git commit -m "feat: add POST /api/rest-timer/start endpoint"
```

---

### Task 3: Worker — POST /api/rest-timer/cancel

**Files:**
- Modify: `push-worker/src/index.js`

Adds a cancel endpoint that writes a flag to KV so the Queue consumer can skip sending.

- [ ] **Step 1: Add the cancel endpoint before `return respond('Not Found', 404)`**

```js
if (url.pathname === '/api/rest-timer/cancel') {
  try {
    const { tag } = await req.json()
    if (tag) await env.PUSH_KV.put(`cancel_${tag}`, '1', { expirationTtl: 3600 })
    return respond('ok')
  } catch (err) {
    return respond({ error: err.message }, 500)
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add push-worker/src/index.js
git commit -m "feat: add POST /api/rest-timer/cancel endpoint"
```

---

### Task 4: Worker — Queue consumer handler

**Files:**
- Modify: `push-worker/src/index.js`

Adds the `queue()` export that consumes messages from the rest-timers queue, checks cancel flag, and sends push notifications.

- [ ] **Step 1: Add the queue handler as a new export alongside the existing `fetch`**

```js
async queue(batch, env) {
  for (const msg of batch.messages) {
    const { deviceId, tag, title, body, exerciseId, sets, reps } = msg.body
    // Check cancel flag
    const cancelled = await env.PUSH_KV.get(`cancel_${tag}`)
    if (cancelled) {
      await env.PUSH_KV.delete(`cancel_${tag}`)
      msg.ack()
      continue
    }
    // Send "terminado" push
    const raw = await env.PUSH_KV.get(`sub_${deviceId}`)
    if (!raw) { msg.ack(); continue }
    const sub = JSON.parse(raw)
    const vapidPub = env.VAPID_PUBLIC_KEY
    const vapidPriv = env.VAPID_PRIVATE_KEY
    const vapidEmail = env.VAPID_EMAIL || 'mailto:pedro@example.com'
    if (!vapidPub || !vapidPriv) { msg.retry({ delaySeconds: 10 }); continue }
    try {
      await sendWebPush(sub, { title: `⏰ ${title}`, body: 'Descanso terminado', tag: `done-${tag}`, url: './', restSeconds: 0, exerciseId }, vapidPub, vapidPriv, vapidEmail)
      // Re-show ORIGINAL notification for next cycle
      await sendWebPush(sub, { title, body: `${sets}×${reps} · Tap para iniciar descanso`, tag: `cycle-${Date.now()}`, url: './', restSeconds: 0, exerciseId, exerciseData: { exerciseId, title, sets, reps, restSec: 0 } }, vapidPub, vapidPriv, vapidEmail)
    } catch (err) {
      if (err.statusCode === 410) await env.PUSH_KV.delete(`sub_${deviceId}`)
      msg.retry({ delaySeconds: 10 })
      continue
    }
    msg.ack()
  }
}
```

- [ ] **Step 2: Add the `restSeconds` and `exerciseData` field to `sendWebPush` payload — ensure the encrypted payload includes these fields**

The existing `sendWebPush(sub, payload, ...)` already sends `JSON.stringify(payload)`. Just ensure the payload includes `restSeconds: 0` and `exerciseData` when provided.

- [ ] **Step 3: Commit**

```bash
git add push-worker/src/index.js
git commit -m "feat: add Queue consumer handler for rest timer"
```

---

### Task 5: SW — push event handler with encrypted payload support

**Files:**
- Modify: `sw.js`

The current `push` event only reads from Cache API `push-pending`. Modify it to try `e.data.json()` first (for server-originated encrypted pushes).

- [ ] **Step 1: Replace the push event listener**

```js
self.addEventListener('push', (e) => {
  e.waitUntil((async () => {
    let data = {}
    // Try encrypted payload first (server-originated push)
    if (e.data) {
      try { data = e.data.json() } catch {}
    }
    // Fall back to Cache API (client-originated empty push)
    if (!data.title) {
      try {
        const cache = await caches.open('push-pending')
        const res = await cache.match('/pending')
        if (res) {
          data = await res.json()
          await cache.delete('/pending')
        }
      } catch {}
    }
    if (!data.title) return
    // If this is an ORIGINAL re-show with exerciseData, store for app to pick up
    if (data.exerciseData) {
      try {
        const cache = await caches.open('rest-pending')
        await cache.put('/pending-from-push', new Response(JSON.stringify(data.exerciseData)))
      } catch {}
    }
    const title = data.title || 'Coach Pedro AI'
    const body = data.body || ''
    const opts = {
      body,
      icon: 'icons/icon-192.png',
      tag: data.tag || `push-${Date.now()}`,
      requireInteraction: true,
      data: { url: data.url || './', restSeconds: data.restSeconds || 0, title, body, exerciseId: data.exerciseId || '' },
    }
    // No actions — iOS doesn't support them, and we handle tap via clients.openWindow
    await self.registration.showNotification(title, opts)
  })())
})
```

- [ ] **Step 2: Commit**

```bash
git add sw.js
git commit -m "feat: SW push handler reads encrypted payload + stores rest-pending-from-push"
```

---

### Task 6: SW — notificationclick always opens app

**Files:**
- Modify: `sw.js`

Replace the current `notificationclick` with a simple handler that opens the app.

- [ ] **Step 1: Replace the notificationclick listener**

```js
self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  const url = e.notification.data?.url || './'
  e.waitUntil(clients.openWindow(url))
})
```

- [ ] **Step 2: Commit**

```bash
git add sw.js
git commit -m "feat: SW notificationclick always opens app"
```

---

### Task 7: app.js — scheduleRestTimer + cancelRestTimer

**Files:**
- Modify: `app.js`

Add two new functions that communicate with the Worker.

- [ ] **Step 1: Add scheduleRestTimer function near sendPushNotification**

```js
async function scheduleRestTimer(endTime, tag, title, body, exerciseId, sets, reps) {
  const s = await Storage.getSettings()
  if (!s.pushSubscribed || !PUSH_SERVER_URL) return false
  try {
    const res = await fetch(`${PUSH_SERVER_URL}/api/rest-timer/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endTime, deviceId: await _deviceId(), tag, title, body, exerciseId, sets, reps }),
    })
    return res.ok
  } catch (e) {
    console.error('scheduleRestTimer failed:', e)
    return false
  }
}
```

- [ ] **Step 2: Add cancelRestTimer function**

```js
async function cancelRestTimer(tag) {
  if (!PUSH_SERVER_URL) return
  try {
    await fetch(`${PUSH_SERVER_URL}/api/rest-timer/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tag }),
    })
  } catch (e) {
    console.error('cancelRestTimer failed:', e)
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add app.js
git commit -m "feat: add scheduleRestTimer + cancelRestTimer"
```

---

### Task 8: app.js — _checkPendingRest on init

**Files:**
- Modify: `app.js`

On app load, check Cache API for pending rest exercise and start the timer if found.

- [ ] **Step 1: Modify _startRestTimer to accept exerciseId**

Change the function signature and stored data:
```js
window._startRestTimer = async (name, restSec, tag, sets, reps, exerciseId) => {
  const endTime = Date.now() + restSec * 1000
  try {
    const cache = await caches.open('rest-timer')
    await cache.put('/pending', new Response(JSON.stringify({ endTime, name, tag, restSec, sets, reps, exerciseId })))
  } catch (_) {}
  if (window._restTimerId) clearTimeout(window._restTimerId)
  window._restTimerId = setTimeout(_checkRestTimer, restSec * 1000)
}
```

- [ ] **Step 2: Add _checkPendingRest function**

```js
async function _checkPendingRest() {
  try {
    const cache = await caches.open('rest-pending')
    const res = await cache.match('/pending') || await cache.match('/pending-from-push')
    if (!res) return
    const data = await res.json()
    await cache.delete('/pending')
    await cache.delete('/pending-from-push')
    if (data.restSec && data.restSec > 0 && data.name) {
      const tag = `rest-${Date.now()}`
      const endTime = Date.now() + data.restSec * 1000
      _startRestTimer(data.name, data.restSec, tag, data.sets || 3, data.reps || '10', data.exerciseId || '')
      scheduleRestTimer(endTime, tag, data.name, `${data.sets || 3}×${data.reps || '10'}`, data.exerciseId || '', data.sets || 3, data.reps || '10')
    }
  } catch (_) {}
}
```

- [ ] **Step 2: Call _checkPendingRest() in init() after loadState**

Find the line in `init()` where state is loaded and add:
```js
_checkPendingRest()
```

- [ ] **Step 3: Commit**

```bash
git add app.js
git commit -m "feat: add _checkPendingRest on init"
```

---

### Task 9: app.js — modify _completeRest

**Files:**
- Modify: `app.js`

When the timer completes, cancel the server-side scheduled push and re-show the ORIGINAL notification for the next cycle.

- [ ] **Step 1: Modify _completeRest to cancel Queue + re-show ORIGINAL + store rest-pending**

```js
async function _completeRest(data) {
  if (typeof showToast === 'function') showToast(`⏰ ${data.name} — Descanso terminado`)
  // Cancel server-side scheduled push
  if (data.tag) cancelRestTimer(data.tag)
  // Store rest-pending so next tap starts another cycle
  try {
    const cache = await caches.open('rest-pending')
    await cache.put('/pending', new Response(JSON.stringify({ name: data.name, restSec: data.restSec, sets: data.sets, reps: data.reps, exerciseId: data.exerciseId })))
  } catch (_) {}
  // Re-show ORIGINAL notification via push
  const newTag = `cycle-${Date.now()}`
  await sendPushNotification(data.name, `${data.sets}×${data.reps} · Tap para iniciar descanso`, newTag, 0)
}
```

- [ ] **Step 2: Commit**

```bash
git add app.js
git commit -m "feat: _completeRest cancels Queue + re-shows ORIGINAL"
```

---

### Task 10: app.js — modify sendPushNotification

**Files:**
- Modify: `app.js`

The current `sendPushNotification` includes `restSeconds` which makes the SW show the old "⏱️ Xs" confirmation. Remove it since the timer no longer starts from the notification tap — it starts when the app opens.

- [ ] **Step 1: In sendPushNotification, change `restSeconds` to 0**

Find the line:
```js
await cache.put('/pending', new Response(JSON.stringify({ title, body: body + ' ▸', tag: tag || 'workout', restSeconds })))
```
Replace with:
```js
await cache.put('/pending', new Response(JSON.stringify({ title, body, tag: tag || 'workout', restSeconds: 0 })))
```

Also remove the `restSeconds` parameter from the function signature if it's no longer passed externally. Change:
```js
async function sendPushNotification(title, body, tag, restSeconds) {
```
to:
```js
async function sendPushNotification(title, body, tag) {
```

- [ ] **Step 2: Commit**

```bash
git add app.js
git commit -m "refactor: sendPushNotification no longer passes restSeconds"
```

---

### Task 11: components/detail.js — modify ⚡ handler

**Files:**
- Modify: `components/detail.js`

The [⚡ Iniciar] button should: block itself for 3s, write to Cache API `/rest-pending`, and send push. It should NOT start the timer directly (timer starts when user taps notification).

- [ ] **Step 1: Replace the ⚡ click handler**

```js
iniciarBtn.addEventListener('click', async () => {
  if (!('Notification' in window)) return
  if (Notification.permission === 'default') {
    const result = await Notification.requestPermission()
    if (result !== 'granted') {
      if (typeof showToast === 'function') showToast('Permiso necesario para notificaciones', true)
      return
    }
  }
  if (Notification.permission === 'denied') {
    if (typeof showToast === 'function') showToast('Permiso denegado. Actívalo en Ajustes del sistema.', true)
    return
  }
  // Block button 3s
  iniciarBtn.disabled = true
  iniciarBtn.style.opacity = '0.4'
  // Store exercise data for when app opens via notification tap
  try {
    const cache = await caches.open('rest-pending')
    await cache.put('/pending', new Response(JSON.stringify({
      name: exercise.name,
      restSec: exercise.rest,
      sets: exercise.sets,
      reps: exercise.reps,
      exerciseId: exercise.id || '',
    })))
  } catch (_) {}
  // Send push with exercise info
  const tag = `rest-${Date.now()}`
  const body = `${exercise.sets}×${exercise.reps} · Tap para iniciar descanso`
  let sent = false
  if (typeof sendPushNotification === 'function') {
    sent = await sendPushNotification(exercise.name, body, tag)
    if (!sent && typeof subscribePush === 'function') {
      const ok = await subscribePush()
      if (ok) sent = await sendPushNotification(exercise.name, body, tag)
    }
  }
  if (!sent) {
    if (typeof window.notifyWatch === 'function') {
      await window.notifyWatch(exercise.name, body, { restSeconds: 0, tag })
    }
  }
  if (typeof showToast === 'function') {
    showToast(sent ? `✓ ${exercise.name}` : `⚠ ${exercise.name} (local)`)
  }
  // Unblock after 3s
  setTimeout(() => {
    iniciarBtn.disabled = false
    iniciarBtn.style.opacity = '1'
  }, 3000)
})
```

- [ ] **Step 2: Commit**

```bash
git add components/detail.js
git commit -m "feat: ⚡ only stores pending + sends push, timer starts on notification tap"
```

---

### Task 12: Deploy Worker + verify

**Files:**
- Modify: `push-worker/`

- [ ] **Step 1: Create the queue in Cloudflare**

```bash
cd push-worker && npx wrangler queues create rest-timers
```

Verify the queue exists:
```bash
npx wrangler queues list
```

- [ ] **Step 2: Deploy the Worker**

```bash
npx wrangler deploy
```

- [ ] **Step 3: Smoke test**

Open the PWA on iPhone, tap [⚡ Iniciar] on an exercise, verify:
1. Button blocks for 3s
2. Push notification arrives: "Press Bench 3×10 · Tap para iniciar descanso"
3. Tap notification → app opens
4. Timer starts (check Cache API in Safari dev tools if possible, or observe that "⏰ Descanso terminado" appears after rest seconds)
5. After timer completes: "⏰ Descanso terminado" toast + ORIGINAL notification re-appears

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "v1.47 · Rest timer with Cloudflare Queues delaySeconds"
```
