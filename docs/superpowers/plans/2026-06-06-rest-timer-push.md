# Rest Timer via Push Actions — Implementation Plan

> **Execution:** Inline in current session (no subagents needed).

**Goal:** Replace auto-notifications with manual ⚡ Iniciar button that sends a push with rest timer action.

**Files to modify:** `sw.js`, `app.js`, `views/today.js`, `components/detail.js`, `push-worker/src/index.js`

---

### Task 1: `app.js` — Remove delay, add restSeconds param

**Modify:** `app.js:428-440`

Remove the 5-second delay. Add `restSeconds` parameter to `sendPushNotification()`.

### Task 2: `push-worker/src/index.js` — Pass restSeconds through payload

**Modify:** `push-worker/src/index.js:188,205-210`

Read `restSeconds` from request body. Include in the encrypted push payload.

### Task 3: `sw.js` — Push event actions + notificationclick timer

**Modify:** `sw.js:73-94`

- `push` event: add `actions` with "Descansar Xs" when `restSeconds > 0`
- `notificationclick`: handle `start-rest` action with timer via `waitUntil`, auto-close "rest-done" after 10s
- Non-action tap: close notification, no window focus

### Task 4: `views/today.js` — Remove all push notification triggers

**Modify:** `views/today.js:210-213, 252-256, 429-436`

Remove all 4 `sendPushNotification()` + `notifyWatch()` calls.

### Task 5: `components/detail.js` — Add ⚡ Iniciar button

**Modify:** `components/detail.js:24-59`

Add an `[⚡ Iniciar]` button between the prev/next navigation pills. On click, call `sendPushNotification(exercise.name, `${sets}×${reps}`, tag, rest)`.

### Task 6: Bump version

Run `bash scripts/bump-version.sh` to sync `app.js` and `sw.js` versions.
