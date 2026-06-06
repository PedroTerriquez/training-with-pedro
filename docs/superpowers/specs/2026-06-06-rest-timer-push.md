# Rest Timer via Push Notification Actions

## Summary
Replace automatic push notifications with a manual "Iniciar" button in the exercise detail sheet. The user taps it to send a push notification containing the exercise name + sets/reps. Long-pressing that notification reveals a "Descansar Xs" action that starts a countdown timer in the Service Worker. When the timer completes, a generic notification appears for 10 seconds then auto-dismisses. The user can restart the timer multiple times from the same notification.

## Flow

```
[Detalle ejercicio]
  Botón [⚡ Iniciar] → push instantáneo
    │
    ▼
Notificación informativa: "Press Banca · 4×6-8"
  Tag único: `rest-${Date.now()}`
  Tap normal → no-op
  Long-press → acción [Descansar 180s]
    │ (tap acción)
    ▼
SW: waitUntil(timer 180s)
    │ termina
    ▼
"⏰ Descanso terminado" → 10s → auto-close (no-op on tap)
    │
Usuario repite long-press sobre misma notif → otro timer
    │
Registra peso → app avanza al siguiente ejercicio
  → Botón [⚡ Iniciar] con nuevo ejercicio
```

## Changes

### `sw.js`
- `push` event: if `restSeconds > 0`, add `actions: [{ action: 'start-rest', title: 'Descansar Xs' }]`. Store `restSeconds`, `title`, `body` in `data`.
- `notificationclick`: 
  - If `e.action === 'start-rest'`: `e.waitUntil()` with timer → await `restSeconds * 1000` → `showNotification('⏰ Descanso terminado', { tag: 'rest-done', requireInteraction: false })` → await 10s → find & close all `rest-done` notifications.
  - If no `e.action` → no-op (do nothing, not even close? Actually close notification but don't open window).

Wait - the user said the notification "no debe hacer nada" unless long-press action. So on normal tap we should just close the notification but not focus/open window.

### `app.js`
- Remove `await new Promise(r => setTimeout(r, 5000))` from `sendPushNotification()`
- Add optional `restSeconds` parameter, pass to body JSON

### `views/today.js`
- Remove all 4 calls to `sendPushNotification()` and `window.notifyWatch()` (lines ~210-213, ~252-256, ~429-436)

### `components/detail.js`
- Add `[⚡ Iniciar]` button between prev/next navigation pills
- On click: `sendPushNotification(exercise.name, \`${exercise.sets}×${exercise.reps}\`, \`rest-${Date.now()}\`, exercise.rest)`

### `push-worker/src/index.js`
- Read `restSeconds` from request body
- Pass into `JSON.stringify()` payload as `restSeconds`

### Notification behavior
- Exercise notification: `requireInteraction: true`, tag unique per notification
- "Descanso terminado": `requireInteraction: false`, tag `'rest-done'`, auto-closed after 10s via SW setTimeout
- Tap on exercise notification: close, no window focus
- Tap on rest-done notification: no-op (auto-closes via timeout)
