# Module Review: App Shell & Router

**Files:**
- `app.js` (797 lines)
- `index.html` (36 lines)
- `styles.css` (205 lines)

**Total:** ~1,038 lines across 3 files.

**Dependencies:** All other modules loaded as global scripts before `app.js`. Depends on `push-config.js` (optional).

**Entry point:** `DOMContentLoaded` → `init()` in `app.js:797`.

---

## 1. Architecture & Boundaries

This module is the **application kernel** — it owns:

- **SPA lifecycle:** bootstrap (`init` → `loadState` → `renderShell` → `handleRoute`)
- **Hash-based router:** `handleRoute()` dispatches `#today`, `#plan`, `#history`, `#you`, `#detail=<id>`
- **Central state:** `_state` object with settings, programs, exercises, logs, route, sheet state, temp swaps
- **Event bus via callbacks:** `openDetailSheet`, `refresh`, `silentRefresh`, `installPWA`, `notifyWatch`
- **AI integration facade:** `importWithAI`, `programCoach`, `exerciseCoachChat`, `runCoachAnalysis`
- **Push notification management:** `subscribePush`, `unsubscribePush`, `sendPushNotification`
- **Design tokens:** CSS custom properties in `:root`

**Boundary observation:** `app.js` mixes concerns — the router, state management, push logic, and 4 AI integrations all live in one file. At 797 lines, it's the second-largest file, and the AI functions alone account for ~330 lines (42%).

---

## 2. Findings

### Finding AR-1: Service Worker registered twice (Medium)

**File:** `index.html:34` and `app.js:43-45`

```html
<!-- index.html line 34 -->
<script>if('serviceWorker'in navigator){navigator.serviceWorker.register('sw.js').catch(()=>{})}</script>
```

```js
// app.js line 43
if ('serviceWorker in navigator') {
  navigator.serviceWorker.register('sw.js').catch(() => {})
}
```

Two independent SW registrations. The browser is idempotent (second call returns same registration), but both are redundant. If `sw.js` changes, the update flow is triggered twice. If one fails and the other succeeds, the failure is silently swallowed.

**Recommendation:** Remove the inline script from `index.html:34`. Keep only the `app.js` registration which runs after full app bootstrap.

---

### Finding AR-2: No loading state on cold start (Medium)

**File:** `app.js:28-72`

`init()` does:
1. `loadState()` — 3 sequential IndexedDB reads + `handleRoute()` (no-op since `_screenContainer` is null)
2. Backup restore check
3. SW registration
4. `renderShell()` — creates DOM and calls `renderScreen()`

Between steps 1-3, the DOM is empty. On slow devices or if IndexedDB is large (many logs), users see a blank white/black screen for potentially 1-3 seconds.

**Recommendation:** Add a skeleton loading state. Set `_rootEl.innerHTML` to a simple spinner or branded splash before `loadState()`. Clear it in `renderShell()`.

---

### Finding AR-3: `loadState` calls `handleRoute` before DOM is ready (Low)

**File:** `app.js:74-83`

```js
async function loadState() {
  _state.settings = await Storage.getSettings()
  // ...
  handleRoute() // _screenContainer is null here!
}
```

`handleRoute()` checks `if (_screenContainer)` on line 99 and skips `renderScreen()`. Then `renderShell()` calls `renderScreen()` on line 116. This works but is dead code in the happy path. If a future refactor changes the guard, this breaks silently.

**Recommendation:** In `loadState()`, only update state. Don't call `handleRoute()`. Let `renderShell()` be the single render trigger.

---

### Finding AR-4: Detail route pollutes browser history (Low)

**File:** `app.js:89-96, 339`

```js
// handleRoute for #detail=<id>
if (hash.startsWith('detail=')) {
  // ...
  return // <-- doesn't set _state.route, doesn't call renderScreen
}

// In openDetailSheet:
_state.sheetOpen = true
document.body.appendChild(overlay)
```

Opening a detail sheet sets `window.location.hash = 'detail=...'`, creating a browser history entry. Closing it resets the hash. This means:
- The back button navigates through exercise history
- If user opens 5 exercise details, they need 5 back-button presses to leave the page
- `_state.route` is stale during detail view (still holds the previous route)

**Recommendation:** Use `history.replaceState` instead of `location.hash` for sheet navigation, or use a sheet-specific state that doesn't pollute hash history. Or document this as intended behavior if exercise back-button navigation is desired.

---

### Finding AR-5: Inconsistent `PUSH_SERVER_URL` safety checks (Medium)

**File:** `app.js:54, 396, 407, 421, 515, 624, 652`

| Location | Check Pattern | Safe? |
|---|---|---|
| Line 54 | `if (PUSH_SERVER_URL && ...)` | ReferenceError if undefined |
| Line 396 | `if (PUSH_SERVER_URL)` | ReferenceError if undefined |
| Line 407 | `if (!s.pushSubscribed \|\| !PUSH_SERVER_URL)` | ReferenceError if undefined |
| Line 421 | `typeof PUSH_SERVER_URL !== 'undefined'` | Safe |
| Line 515 | `if (!PUSH_SERVER_URL)` | ReferenceError if undefined |
| Line 624 | `if (!PUSH_SERVER_URL)` | ReferenceError if undefined |
| Line 652 | `if (!PUSH_SERVER_URL)` | ReferenceError if undefined |

If `push-config.js` fails to load (404, blocked by CSP, network error), `PUSH_SERVER_URL` is undeclared and throws `ReferenceError`. Only line 421 handles this.

**Recommendation:** Either:
- Always define `PUSH_SERVER_URL` and `VAPID_PUBLIC_KEY` in `push-config.js` with fallback defaults (e.g., empty string)
- Or guard all references with `typeof PUSH_SERVER_URL !== 'undefined'`

If using empty-string fallback: `const PUSH_SERVER_URL = PUSH_SERVER_URL || ''` — but `const` redeclaration throws. Use `var` in push-config.js, or use the `typeof` guard pattern consistently.

---

### Finding AR-6: `runCoachAnalysis` has high coupling (Medium)

**File:** `app.js:649-747`

`runCoachAnalysis` accepts 6 parameters and directly calls:
- `Storage.getLogsForExercise()` (for each exercise)
- `Storage.saveCoachAnalysis()` (to persist result)

It also computes:
- PR detection (line 666)
- Plateau detection (lines 668-676)
- Total volume (lines 697-700)

The function is ~100 lines and couples network I/O, data access, business logic, and state persistence. This makes it difficult to:
- Unit test the PR/plateau logic in isolation
- Reuse in a non-AI context (e.g., "your last 3 sessions" summary)
- Mock for development without real Storage and network access

**Recommendation:** Split into smaller functions:
- `computeExerciseStats(exercises, logs)` — returns structured analysis data
- `buildSessionData(day, effort, duration, settings)` — builds the payload
- `callCoachAI(sessionData)` — network call
- Keep `saveCoachAnalysis` in the caller

---

### Finding AR-7: `refresh` updates `lastUpdate` on every render (Low)

**File:** `app.js:343-362`

```js
async function refresh() {
  _state.settings = await Storage.getSettings()
  _state.settings.lastUpdate = new Date().toISOString()
  await Storage.saveSettings(_state.settings)
  // ...
}
```

Every view re-render (route change, after logging weight, after editing exercises) triggers a settings write to IndexedDB + backup. This is useful for the "last pushed version" timestamp but creates write amplification — each render = one IndexedDB write + one full localStorage backup.

**Impact:** On a session with 20 exercise log entries, that's 20 unnecessary settings writes.

**Recommendation:** Differentiate between "state changed" refresh and "just re-rendering" refresh. Only update `lastUpdate` when actual user data changed, not on every route navigation.

---

### Finding AR-8: Duplicated state loading logic (Low)

**File:** `app.js:74-83` and `app.js:343-361`

`loadState()` and `refresh()` share identical logic:

```js
// Both do:
_state.settings = await Storage.getSettings()
_state.programs = await Storage.getPrograms()
_state.exercises = await Storage.getExercises()
_state.activeProgram = _state.settings.activeProgramId
  ? _state.programs.find(p => p.id === _state.settings.activeProgramId)
  : _state.programs[0] || null
```

~20 lines duplicated. `loadState` is called once on init, `refresh` is called on every re-render.

**Recommendation:** Extract `async function reloadState()` and call it from both places.

---

### Finding AR-9: No error boundary for view mount (Medium)

**File:** `app.js:158-214`

```js
switch (_state.route) {
  case 'today': mountToday(...); break
  case 'plan': mountPlan(...); break
  // ...
}
```

If any `mount*` function throws during rendering (e.g., accessing a property on undefined), the entire screen remains blank with no error message. The app is stuck — user must refresh.

`openDetailSheet` is also vulnerable: if `mountExerciseDetail` throws, `_state.sheetOpen` remains `true`, preventing any future detail sheet from opening.

**Recommendation:** Wrap each mount call in try/catch. On error, show a fallback message in `_screenContainer` and log the error. For detail sheet, reset `_state.sheetOpen = false` in a `finally` block.

---

### Finding AR-10: TabBar is recreated on every route change (Info)

**File:** `app.js:122-135`

```js
if (_tabBarEl && _tabBarEl.parentNode) {
  _tabBarEl.parentNode.removeChild(_tabBarEl)
}
const accent = _state.settings?.accentColor || '#d4ff3a'
_tabBarEl = TabBar({ ... })
_appEl.appendChild(_tabBarEl)
```

Every route change removes and recreates the TabBar component. This causes a DOM reflow + potential flash as the component remounts. TabBar is stateless (just active tab + change handler), so it could be rendered once.

**Recommendation:** Render TabBar once in `renderShell()` and update only the `active` property. The `TabBar` function could return a component with an `update(active)` method.

---

### Finding AR-11: Inline styles in JS (~25 lines) for PWA install overlay (Low)

**File:** `app.js:758-782`

The `installPWA()` function builds a DOM overlay with 25 lines of inline `style.cssText` and `innerHTML` strings. This makes the overlay hard to theme, maintain, or preview.

**Recommendation:** Move the PWA install overlay styles into CSS classes in `styles.css`. Use a template string with class names instead of inline styles.

---

### Finding AR-12: `tempSwaps` accumulates memory across route changes (Info)

**File:** `app.js:19, 302-308`

```js
_state.tempSwaps = {} // exerciseId → alternativeExerciseId (today-only)
```

Swaps are never cleaned up. If a user swaps 20 exercises over a session, all 20 entries remain in `_state.tempSwaps` until page reload. Since this is a "today-only" feature, stale swaps from yesterday's session persist.

**Recommendation:** Clear `_state.tempSwaps` when the route changes to a non-today view, or on a new day (compare today's date to the oldest swap entry).

---

### Finding AR-13: CSS `user-select: none` on body prevents text selection (Info)

**File:** `styles.css:41-42`

```css
body {
  user-select: none;
  -webkit-user-select: none;
}
```

This prevents users from selecting/copying text in the app. While intentional for a mobile PWA (prevents accidental selection during touch scrolling), it also prevents:
- Copying exercise names or tips
- Selecting text in textarea/input fields (most browsers override this for inputs, but some don't)

**Recommendation:** If text selection is ever needed in specific areas (like the AI coach textarea), add `user-select: text` to those elements.

---

### Finding AR-14: `styles.css` has unused keyframe animation `pulse` (Info)

**File:** `styles.css:54-57`

```css
@keyframes pulse { ... }
```

This keyframe is defined but not referenced by any class or element in the codebase. It may have been used in an older version or is reserved for future use.

**Recommendation:** Remove unused CSS declarations, or add a comment noting the intent.

---

### Finding AR-15: `index.html` already passed `<title>` (Info)

The document title "Coach Pedro AI" is set in `<title>`. This is correct for the PWA manifest and search results.

---

## 3. Summary

| Severity | Count | Key Issues |
|---|---|---|
| High | 0 | — |
| Medium | 4 | AR-1 (SW double registration), AR-2 (no loading state), AR-5 (inconsistent PUSH_SERVER_URL guards), AR-6 (runCoachAnalysis coupling), AR-9 (no error boundary) |
| Low | 5 | AR-3 (dead handleRoute call), AR-4 (history pollution), AR-7 (write amplification), AR-8 (duplicated loadState), AR-11 (inline styles) |
| Info | 4 | AR-10 (TabBar recreation), AR-12 (stale tempSwaps), AR-13 (user-select), AR-14 (unused animation) |

**Overall:** The App Shell module is a well-structured SPA kernel for its size. The router is clean and the state management pattern is consistent. The main risks are: no loading state (cold-start UX), no error boundary (blank screen on mount failure), inconsistent global variable guards (crashes if push-config fails), and high coupling in `runCoachAnalysis`.
