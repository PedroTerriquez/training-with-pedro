# Module 7 Review: Service Worker

**File:** `sw.js` (90 lines)

**Complexity:** Low. 4 event handlers (install, activate, fetch, message, push, notificationclick), 25 cached assets, single cache version.

---

## Architecture & Boundaries

| Aspect | Assessment |
|--------|-----------|
| **Role** | Offline support via cache-first network fallback; Web Push receiver; notification click handling |
| **Cache strategy** | Network-first (fetch → cache on success → cache fallback on failure) — documented as "network-first strategy with cache fallback" |
| **Cache version** | Hardcoded `'v1'` string |
| **Push handling** | Two paths: legacy `postMessage` → `showNotification()` and modern Web Push `push` event → `showNotification()` |
| **Lifecycle** | `skipWaiting()` on install → `clients.claim()` + delete old caches on activate |

---

## Findings

### 🔴 High (1)

#### H1. No `pushsubscriptionchange` handler
When a push subscription expires (which happens periodically on iOS — see Apple's push service behavior), the Service Worker receives a `pushsubscriptionchange` event. The app currently has **no handler** for this:

```js
// Missing entirely
self.addEventListener('pushsubscriptionchange', (e) => { ... })
```

Without this, if the push service rotates the subscription endpoint:
- The Cloudflare Worker has a stale subscription in KV
- Push notifications silently fail
- The user sees "push enabled" in settings but receives no notifications
- The Worker handles 410 at send time (line 74 in `index.js`) but only after one failed send per expiry cycle

**Recommendation:** Add a `pushsubscriptionchange` handler that fetches the new subscription to the app's push endpoint:
```js
self.addEventListener('pushsubscriptionchange', (e) => {
  e.waitUntil(
    self.registration.pushManager.subscribe({ ...e.oldSubscription?.options })
      .then((sub) => fetch(PUSH_SERVER_URL + '/api/push/subscribe', {
        method: 'POST', body: JSON.stringify(sub),
        headers: { 'Content-Type': 'application/json' }
      }))
  )
})
```

---

### 🟡 Medium (3)

#### M1. All cache errors silently swallowed — `sw.js:29`
```js
caches.open(CACHE).then((cache) => cache.addAll(ASSETS).catch(() => {}))
```
The `.catch(() => {})` at line 29 silently swallows ALL cache add failures. If any single asset fails to cache (network error, bad URL, missing file), the install still succeeds but the app has a broken cache. The `skipWaiting()` at line 31 then activates the SW immediately, serving broken cached responses for the missing asset.

**Recommendation:** Log the error but don't block install:
```js
cache.addAll(ASSETS).catch((err) => console.warn('SW cache error:', err.message))
```

#### M2. Cross-origin requests intercepted without check — `sw.js:46-55`
The `fetch` handler at line 46-55 handles ALL GET requests without origin filtering:
```js
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return
  e.respondWith(
    fetch(e.request).then((res) => { ... }).catch(() => caches.match(e.request))
  )
})
```

This affects images loaded from `free-exercise-db` (external CDN), Google Analytics (if added later), or any embedded content. These external requests:
- Go network-first (expected behavior for third-party)
- Get cached in the app's cache (polluting it with external resources)
- On network failure, fall back to `caches.match(e.request)` which almost certainly misses for external URLs

For `free-exercise-db` images, the network-first behavior is correct (we want live images), but the cache pollution is unnecessary.

**Recommendation:** Add origin filter or use a dedicated cache for third-party assets:
```js
if (!e.request.url.startsWith(self.location.origin) && !e.request.url.includes('free-exercise-db')) return
```

#### M3. Push notification tags are all unique — `sw.js:75`
```js
tag: data.tag || `push-${Date.now()}`
```
Every push notification gets a unique tag. Combined with `requireInteraction: true`, this means:
- Each notification is shown separately in the notification center
- The user must manually dismiss each one
- If the workout has 8+ exercises, the notification center fills up
- iOS limits notification stacking behavior

**Recommendation:** Use a meaningful tag for replaceable notifications (e.g., `'workout-progress'`) so only the latest notification is visible:
```js
tag: data.tag || 'workout-progress'
```

---

### 🟢 Low (6)

#### L1. Hardcoded cache version — `sw.js:1`
```js
const CACHE = 'v1'
```
There is no mechanism to update this. The AGENTS.md says "bump CACHE version in sw.js if changing cached assets" but this is a manual step easily forgotten. Consider committing to install event to use a date-based or hash-based version.

#### L2. Asset list hardcoded — `sw.js:2-25`
25 assets are hardcoded as relative paths. This list can drift from actual files (missed new files, deleted files, renamed files). The comment in AGENTS.md notes this should be updated manually on every deploy.

#### L3. `index.html` registers SW twice — `sw.js` (cross-file)
As documented in MODULE_REVIEW_App_Shell_Router.md, `index.html` has an inline SW registration and `app.js` also registers it. The browser deduplicates via scope URL matching, so this is harmless but redundant.

#### L4. No cached HTML navigation fallback — `sw.js:46`
The fetch handler only matches requests against the `ASSETS` cache. Navigation requests (user navigates to `./history`, `./settings`, etc.) that fail on network fall back to `caches.match()` which looks for the exact request URL, not `index.html`. In a SPA, the correct fallback for any navigation failure is `index.html`.

**Recommendation:** Add a navigation fallback:
```js
.catch(() => {
  if (e.request.mode === 'navigate') return caches.match('./index.html')
  return caches.match(e.request)
})
```

#### L5. `notificationclick` opens new window on miss — `sw.js:81-90`
```js
clients.matchAll({ type: 'window', includeUncontrolled: true }).then((cls) => {
  if (cls.length > 0) { cls[0].focus(); return }
  clients.openWindow(url)  // opens new window — could be second app instance
})
```
In a PWA with `display: standalone`, `clients.openWindow('./')` opens a new browser tab, not the PWA window. This creates a second instance of the app in a browser tab.

**Recommendation:** Navigate existing client to the URL instead:
```js
if (cls.length > 0) {
  cls[0].focus()
  if (url !== './') cls[0].navigate(url)
  return
}
```

#### L6. Legacy `message` handler still active — `sw.js:58-67`
```js
self.addEventListener('message', (e) => {
  if (e.data?.type === 'notify') {
    self.registration.showNotification(...)
  }
})
```
This handler supports the old `postMessage` → `showNotification()` flow. The app has migrated to Web Push, so this code path is dead. Should be removed once the migration is fully verified.

---

## Summary

| Severity | Count | Key Issues |
|----------|-------|------------|
| 🔴 High | 1 | No `pushsubscriptionchange` handler — silent notification expiry |
| 🟡 Medium | 3 | Silently swallowed cache errors; no origin filter in fetch; unique push tags |
| 🟢 Low | 6 | Hardcoded version; hardcoded asset list; double registration; no navigation fallback; `openWindow` creates new instance; legacy handler |

**Most impactful fix:** Add `pushsubscriptionchange` handler (H1) — without it, push notifications silently break when iOS rotates the subscription endpoint.
