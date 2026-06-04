# Module 6 Review: Screen Views

**Files:** `views/today.js` (867 lines), `views/plan.js` (379 lines), `views/history.js` (83 lines), `views/you.js` (1289 lines)

**Complexity:** Critical. `you.js` is the largest file in the project (1,289 lines), `today.js` is the third-largest (867 lines). Together they account for ~30% of all JS in the app.

---

## Architecture & Boundaries

| Aspect | Assessment |
|--------|-----------|
| **Entry points** | `mountToday()`, `mountPlan()`, `mountHistory()`, `mountYou()` — each receives a container + context (accent, units, exercises, etc.) |
| **Rendering strategy** | Full DOM rebuild on every state change via `container.innerHTML = ''` + mount. Every interaction (tab switch, filter, expand) unmounts and remounts |
| **State management** | Module-level `let` variables scoped to each view file — reset on mount but shared across calls within a file. `you.js` uses a tab-switch pattern (`_youTab`) |
| **Data flow** | Views call `Storage.*` async methods directly. Components like `PhaseCard`, `Sparkline`, `StatBlock` are imported as globals (no imports) |
| **Dependencies** | `views/today.js` → `components/warmup.js` (`resolvePanelItems`, `makePanelContent`), `app.js` (`sendPushNotification`, `subscribePush`, `runCoachAnalysis`, `_state`). Strong coupling to app globals |

---

## Findings

### 🔴 High (4)

#### H1. Aborted render race condition — `today.js:401-484`
`mountToday()` fires an async `Storage.getLogsForDate()` call at line 401 that can resolve **after** the view has already been unmounted and remounted (e.g. by the timer interval or by PhaseCard toggle). When it resolves at line 401-484, it calls `refreshView()` at line 426, which calls `mountToday()` again — potentially starting a second async chain. The `_todayExDone`, `_phase`, and `_coachLoading` state mutations at lines 406-446 run without checking if the view is still mounted:

```js
Storage.getLogsForDate(date).then((logs) => {
  if (done !== _todayExDone) {
    _todayExDone = done  // may have been updated by a newer render
    refreshView()         // triggers mountToday again
  }
})
```

**Risk:** Double-render, lost state transitions (especially phase advance + coach analysis), duplicated push notifications.

**Recommendation:** Add a generation counter or cancellation token. Increment at `mountToday()` entry, check at async callback:
```js
let _gen = 0
function mountToday(...) {
  const gen = ++_gen
  Storage.getLogsForDate(date).then((logs) => {
    if (gen !== _gen) return
    // ...
  })
}
```

#### H2. Missing `_state` globals — `today.js:765`
The coach card regeneration handler references `_state.exercises` and `_state.tempSwaps` at line 765:

```js
const result = await runCoachAnalysis(_coachDay, _coachEffort, _coachDay.duration || 60,
  _state.exercises || [], s, _state.tempSwaps || {})
```

`_state` is **never defined** in `today.js` or anywhere in the view layer. It leaks from `app.js` as a global. If the module is loaded or `mountToday` is called before `app.js` initializes `_state`, this throws `ReferenceError`.

**Risk:** Crash on coach card regeneration if `_state` has a different shape or name in production.

**Recommendation:** Pass exercises and swaps as mount parameters (they're already passed to `mountToday` at line 21 as `exercises` and `swaps`). Store them in the module scope for regeneration:
```js
let _cachedExercises = [], _cachedSwaps = {}
function mountToday(container, { exercises, swaps, ... }) {
  _cachedExercises = exercises || []
  _cachedSwaps = swaps || {}
  // ...
}
```

#### H3. `setInterval` survival after unmount — `today.js:384-398`
The live timer interval at line 384-398 runs every 1 second updating `timerDisplayEl` and `timerSweepEl` — both DOM references captured by closure. When `mountToday` is called again (on any state change), the **old interval keeps running** even though the new mount creates a new interval at line 23 (`if (_timerInterval) { clearInterval(_timerInterval) }`).

**Issue:** The guard at line 23 runs only at function **entry**, but the new `setInterval` at line 385 is also set during that same call. If two `mountToday` calls overlap (e.g., race condition from H1), `_timerInterval` gets overwritten by the second call before the first call finishes, and the first interval leaks.

**Risk:** Multiple concurrent intervals, stale timer updates, memory leak.

**Recommendation:** Always clear before setting, and use a local reference:
```js
clearInterval(_timerInterval)
_timerInterval = setInterval(() => { ... })
```

#### H4. `you.js` size and structure — 1,289 lines
At 1,289 lines, `you.js` handles 4 concerns:
- Profile/settings rendering + event binding (renderStats, 250+ lines)
- Exercise CRUD (renderExercises + showExerciseEdit + deleteExercise, 270 lines)
- Program CRUD (renderPrograms + showProgramEdit + helpers, 350 lines)
- Data management (AI import, CSV/JSON import/export, dictionary migration, 220 lines)

This is the largest file in the project and the hardest to navigate. All functions share module-level scope with `_youTab`.

**Recommendation:** Split into at least 3 files:
- `views/you-stats.js` — profile settings + data management
- `views/you-exercises.js` — exercise CRUD
- `views/you-programs.js` — program CRUD
Or keep a single orchestrator `you.js` that imports from `components/` sub-delegates.

---

### 🟡 Medium (5)

#### M1. `watchBtn` appended twice — `today.js:214-215`
```js
ringsContainer.appendChild(watchBtn)
ringsContainer.appendChild(watchBtn)  // line 215 — duplicate
```
The second append **moves** the element (doesn't duplicate it in DOM) but this is clearly unintentional copy-paste residue.

#### M2. Full DOM rebuild on every interaction across all views
Every view recursively remounts itself on any state change (tab switch in `you.js`, filter chip in `history.js`, week selection in `plan.js`, exercise complete in `today.js`). While this is acceptable for a mobile-first app without virtual DOM, it causes:
- Flash on every interaction (though transitions via `animation:fadeUp` help)
- All async `Storage.*` calls re-fire
- All event listeners re-bind (may miss clicks during render)
- Component state reset (e.g., expanded exercise list in plan.js collapses)

**Recommendation:** Selective DOM updates (change attribute, toggle class) for the timer ring, progress ring, and exercise completed state are the right pattern — replicate it for filter chips and tab bars.

#### M3. `deleteProgram()` uses `confirm()` — `you.js:1268`
```js
if (!confirm(`¿Eliminar "${program.name}"?`)) return
```
The rest of the app uses custom overlay modals for confirmation. `confirm()` produces a browser-native dialog that:
- Looks inconsistent on mobile (especially on iOS PWA in standalone mode)
- Cannot be styled
- Shows the page URL in the dialog

#### M4. Repetitive settings save pattern — `you.js:268-323`
Seven input handlers (height, weight, sex, age, goal, experience, occupation, accent) all repeat this pattern:
```js
const s = await Storage.getSettings()
s.X = value
await Storage.saveSettings(s)
```
This means 7 sequential IndexedDB reads + writes every time a user changes a setting. The accent color handler at line 260 additionally calls `onRefresh()` which remounts the entire view.

**Recommendation:** Debounce inputs (especially the accent color, which fires on every color picker move). Batch `getSettings` / `saveSettings` with a debounced writer.

#### M5. Program edit modal calls `Storage.getExercises()` twice — `you.js:1072,1170`
At line 1072 on modal open, and again at line 1170 on save:
```js
const allExercises = await Storage.getExercises()  // open
const freshExercises = await Storage.getExercises()  // save (fresh reference)
```
The comment at line 1169 says "Fetch fresh in case exercises were created during editing" — but exercises cannot be created during program editing. The datalist at line 1118 also uses the stale `allExercises` reference.

---

### 🟢 Low (8)

#### L1. `history.js` muscle filter derives from first fragment only — `history.js:22`
```js
const muscles = ['Todos', ...new Set(exercises.map((e) => e.muscle.split('/')[0].split(/[,\s]+/)[0]))]
```
Compound muscles like "Hombros/hombro lateral" or "Espalda/bíceps" are truncated to the first segment. This means filtering by "Hombros" shows exercises where muscle starts with "Hombros" but hides exercises with muscle "Hombros/hombro lateral" unless the filter is cleared.

#### L2. `plan.js` reschedule order defaulting — `plan.js:30`
```js
const committedOrder = (rescheduleOrder && rescheduleOrder.length === 7) ? rescheduleOrder : defaultOrder
```
If `rescheduleOrder` is `undefined` or not exactly 7 elements, it silently defaults to `[0,1,2,3,4,5,6]`. A partially applied reschedule (e.g., 4 swaps instead of 7) gets silently discarded.

#### L3. `today.js` effort selector 600ms timeout — `today.js:453`
```js
setTimeout(() => { ... showEffortSelector(...) }, 600)
```
The effort selector appears after a hardcoded 600ms delay when all phases are complete. If the user switches views within that window, the overlay still appears and attaches to `document.body`.

#### L4. `today.js` coach card uses `_state` globals — `today.js:765`
See H2. Also uses `window.silentRefresh` at `you.js:395` without guard:
```js
if (window.silentRefresh) await window.silentRefresh()
```
This is a global function set by `app.js`. If the pattern changes, this silently no-ops.

#### L5. `history.js` exercise body allows empty logs — `history.js:60-80`
```js
enriched.forEach((e) => {
  const last = e.logs.length > 0 ? e.logs[e.logs.length - 1].weight : 0
  const first = e.logs.length > 0 ? e.logs[0].weight : 0
  const delta = last - first
```
Exercises with zero logs show "0" as current weight, "+0" as delta, and a flat sparkline. The sparkline component with empty data still renders an SVG path (just a flat line).

#### L6. `you.js` `setTimeout(() => ..., 0)` event binding pattern — `you.js:248`
All event binding in `renderStats()` is deferred to the next microtask. If any element is missing (e.g., `document.getElementById('units-btn')` returns null), the `addEventListener` call silently fails. This happens 15+ times.

**Recommendation:** Extract to a helper that logs a warning:
```js
function onEl(id, event, handler) {
  const el = document.getElementById(id)
  if (el) el.addEventListener(event, handler)
  else console.warn(`Element #${id} not found for event binding`)
}
```

#### L7. `today.js` timer circumference hardcoded — `today.js:394`
```js
const c = parseFloat(timerSweepEl.dataset.timerC) || 185.35
```
The fallback value `185.35` is the circumference for a 64px ring with 5px stroke: `2 * π * ((64-5)/2) = 2 * π * 29.5 = 185.35`. If the ring size ever changes, this fallback mismatch creates a visual bug.

#### L8. `you.js` profile name has no sanitization — `you.js:16`
```js
<span id="user-name" contenteditable>${settings.userName || 'Pedro'}</span>
```
`contenteditable` allows arbitrary HTML injection. Save at line 363 uses `textContent.trim()` which is safe, but the initial render doesn't escape. If `settings.userName` somehow contained HTML, it would render as markup.

---

## Summary

| Severity | Count | Key Issues |
|----------|-------|------------|
| 🔴 High | 4 | Race condition in `today.js` async chain; missing `_state` global; interval leak; `you.js` file size |
| 🟡 Medium | 5 | Duplicate append; full DOM rebuild pattern; `confirm()` in PWA; repetitive settings I/O; double exercise fetch |
| 🟢 Low | 8 | Muscle filter truncation; reschedule validation; effort selector timer; coach card globals; zero-log display; silent event binding; hardcoded circumference; contenteditable HTML |

**Most impactful fix:** Address the race condition in `today.js` (H1) with a generation counter — it affects every workout session. Then split `you.js` (H4) into focused sub-files.
