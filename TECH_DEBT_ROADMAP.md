# Tech Debt & Refactoring Roadmap

Generated from: PROJECT_OVERVIEW.md, MODULES.md, MODULE_REVIEW_*.md (8 module reviews)

---

## Critical (fix now)

| # | Description | Why It Matters | Effort | Files | Dependencies |
|---|-------------|----------------|--------|-------|-------------|
| C1 | **No schema validation on JSON import** — `importLogsAndSettings()` calls `JSON.parse` and writes directly to all 4 stores without validation | Data corruption risk: a crafted JSON can overwrite any store with malformed objects, inject `__proto__` pollution, or set orphaned foreign keys | S | `storage.js:436-444` | None |
| C2 | **Race condition in `today.js` async chain** — ✅ FIXED: generation counter guard | Affects every workout session — the core user flow | — | — | — |
| C3 | **Missing `_state` global guard in today.js** — ✅ FIXED: `_state` initialization guard | Crash on coach card regeneration | — | — | — |
| C4 | **`setInterval` timer leak in `today.js`** — ✅ FIXED: proper cleanup on unmount | Multiple concurrent intervals, stale timer updates, memory leak | — | — | — |
| C5 | **No `pushsubscriptionchange` handler in Service Worker** — when iOS rotates the push subscription endpoint, the Worker has a stale subscription | Push notifications silently fail; user sees "push enabled" but receives nothing | M | `sw.js` | None |
| C6 | **No request body validation on Cloudflare Worker** — all 7 POST endpoints call `req.json()` without type/schema checks | Malformed requests produce opaque 500 errors instead of helpful 400s; error messages leak internal details | M | `push-worker/src/index.js` (all endpoints) | None |
| C7 | **No request size limits on Worker** — no Content-Length checks on any endpoint | Memory exhaustion risk; oversized prompts can exceed Llama 3.1's 8K context window | S | `push-worker/src/index.js` (entry point) | None |
| C8 | **User profile sent to AI endpoint** — `programCoach()` sends full settings (height, weight, sex, age, occupation) to Workers AI | Unnecessary PII exposure to AI inference pipeline; AGENTS.md explicitly says "no user profile data" for AI endpoints | S | `app.js:programCoach()`, `push-worker/src/index.js:159` | None |

**Execution order**: C1, C6, C7, C8 (data integrity & security), then C5 (push reliability). Total: ~4-6 hours.

---

## High (next sprint)

| # | Description | Why It Matters | Effort | Files | Dependencies |
|---|-------------|----------------|--------|-------|-------------|
| H1 | **`you.js` is 1,289 lines** — handles 4 concerns (stats, exercises, programs, data management) with module-level scope | Hardest file to navigate and modify; functions share implicit state; risk of regression | L | `views/you.js` | None |
| H2 | **`runCoachAnalysis` high coupling** — 100-line function coupling network I/O, data access, business logic (PR/plateau detection), and state persistence | Cannot unit test PR/plateau logic in isolation; cannot reuse for non-AI summaries | M | `app.js:649-747` | None |
| H3 | **No error boundary for view mount** — if any `mount*()` throws, entire screen is blank with no error message; `_state.sheetOpen` stays `true` if detail sheet mount fails | App stuck on mount failure; user must refresh; data loss risk if unsaved state | M | `app.js:158-214` | None |
| H4 | **No loading state on cold start** — `init()` loads IndexedDB + checks backup + registers SW before `renderShell()` creates DOM | 1-3 second blank screen on slow devices or large datasets (many logs) | S | `app.js:28-72` | None |
| H5 | **Service Worker registered twice** — inline script in `index.html:34` + `app.js:43-45` | Redundant SW registration; update flow triggered twice; silent failure path | S | `index.html:34`, `app.js:43-45` | None |
| H6 | **Inconsistent `PUSH_SERVER_URL` guards** — 6 of 7 references use bare `PUSH_SERVER_URL` which throws `ReferenceError` if `push-config.js` fails to load | App crashes if push-config.js is blocked by CSP, 404, or network error | S | `app.js:54,396,407,421,515,624,652` | None |
| H7 | **Full DOM rebuild on every interaction** — all 4 views unmount/remount on every state change (tab switch, filter, week select, exercise complete) | Flash on interaction; all async Storage calls re-fire; event listeners re-bind; component state resets | L | All 4 view files | None |
| H8 | **`backupAll()` fired without await** — called as fire-and-forget in `saveProgram()` | Program save succeeds but backup silently missing; `restoreFromBackup()` restores stale data on iOS purge | S | `storage.js:170-173` | None |
| H9 | **`JSON.parse` unprotected in `importLogsAndSettings`** — no try/catch around `JSON.parse(jsonStr)` | SyntaxError propagates unhandled; app may enter partially updated state | S | `storage.js:436-437` | C1 (overlapping fix) |
| H10 | **Every DB operation opens/closes new IndexedDB connection** — `db.js` helpers call `openDB()` on every operation and close on completion | `loadState()` creates 4 connections; CSV import creates 50+; `onupgradeneeded` fires every time | M | `db.js:6-24` | None |
| H11 | **`backupAll()` serializes full dataset on every write** — fetches ALL data, `JSON.stringify`, `localStorage.setItem` on each write | Blocks main thread; may hit 5-10MB localStorage quota with thousands of logs | M | `storage.js:14-29` | None |
| H12 | **Repeated JSON extraction pattern in Worker** — same 10-line markdown fence + JSON.parse code duplicated across 3 endpoints | Bug fix or improvement requires updating 3 copies | S | `push-worker/src/index.js:96-108,133-146,171-182` | C6 |
| H13 | **No rate limiting on Worker AI endpoints** — no protection against spam | Could exhaust free Workers AI tier (10K neurons/day) from buggy client or infinite retry loop | M | `push-worker/src/index.js` | None |
| H14 | **`low max_tokens` truncates AI output** — `/api/ai/import` uses 1024 tokens for generating full program JSON | Complex programs (4+ weeks) get truncated JSON → `JSON.parse` fails → 502 error | S | `push-worker/src/index.js:129,167` | C6 |
| H15 | **Duplicated fuzzy matching logic** — `exercise-dictionary.js:1828-1862` and `exercise-images.js:21-47` have structurally identical token-based matchers on different datasets | Bug fix or improvement must update both copies | S | `data/exercise-dictionary.js`, `exercise-images.js` | None |
| H16 | **Unnormalized `muscle` values across dictionary** — free-text field with 5+ inconsistent patterns ("Espalda" vs "Dorsal" vs "Dorsal, Romboides") | History filter can't match entries with inconsistent muscle naming | M | `data/exercise-dictionary.js` (multiple entries) | None |

**Execution order**: H1 (split you.js) enables independent work on H7 (DOM rebuild pattern). H3+H4 (error boundary + loading state) are quick UX wins. H5+H6 (SW registration, push guards) prevent crash scenarios. H8-H11 (persistence issues) improve data integrity. H12-H14 (Worker cleanup) should follow C6.

---

## Medium (next quarter)

| # | Description | Why It Matters | Effort | Files | Dependencies |
|---|-------------|----------------|--------|-------|-------------|
| M1 | **`detail.js` is 802 lines** — third largest file; 5 nested render functions in `mountExerciseDetail` | Hard to navigate; closure-based state makes testing difficult | M | `components/detail.js` | None |
| M2 | **Repetitive settings save pattern** — 7 input handlers each call `Storage.getSettings()` + mutate + `Storage.saveSettings()` sequentially | 7 IndexedDB reads + 7 writes when changing multiple settings; no debounce on accent color picker | S | `views/you.js:268-323` | None |
| M3 | **Program edit modal fetches exercises twice** — once on open, once on save (with stale reference) | Unnecessary IndexedDB read; stale datalist during editing | S | `views/you.js:1072,1170` | None |
| M4 | **Silently swallowed cache errors in SW** — `cache.addAll(ASSETS).catch(() => {})` on install | If any asset fails to cache, SW activates with broken cache serving stale responses | S | `sw.js:29` | None |
| M5 | **No origin filter in SW fetch handler** — all GET requests intercepted without origin check | External CDN requests get cached in app cache (pollution); cache miss on network failure for external URLs | S | `sw.js:46-55` | None |
| M6 | **Unique push notification tags** — each push gets `push-${Date.now()}` tag with `requireInteraction: true` | Notification center fills up during workout; user must manually dismiss each one | S | `sw.js:75` | None |
| M7 | **Detail route pollutes browser history** — `location.hash = 'detail=...'` creates history entries per exercise | Back button navigates through exercise history stack; 5 back-presses to leave page | S | `app.js:89-96,339` | None |
| M8 | **Write amplification on every refresh** — `refresh()` updates `_state.settings.lastUpdate` and saves settings on every re-render | Each exercise log entry = 1 IndexedDB write + 1 full localStorage backup | S | `app.js:343-362` | H7 (same render path) |
| M9 | **Duplicated `loadState` logic** — `loadState()` and `refresh()` share ~20 lines of identical state loading code | Bug fix to state loading must update both places | S | `app.js:74-83, 343-361` | None |
| M10 | **`getLogsForDate` does full table scan** — ignores existing `date` index; loads ALL log entries then filters in JS | Performance degradation with thousands of logs across months | S | `storage.js:156-159` | H10 (DB connection caching) |
| M11 | **`findOrCreateExerciseByName` loads all exercises** — `getAll('exercises')` called on every CSV row | During large CSV import (~50 rows), 50 full table scans; no name index exists | S | `storage.js:123-126` | H10 |
| M12 | **Stale data risk in cascade delete** — `deleteExercise` reads programs outside transaction; multi-tab race condition | Orphaned exercise references in programs if another tab modifies simultaneously | S | `storage.js:97-121` | None |
| M13 | **Import writes each item in separate transaction** — `importLogsAndSettings` issues individual `put()` per item | 2500 sequential transactions for large import (500 exercises + 2000 logs) | M | `storage.js:441-444` | H10 |
| M14 | **UI toast logic lives in data layer** — `showToast()` defined in `storage.js` creates DOM and manages timers | Violates separation of concerns; storage.js depends on DOM existence | S | `storage.js:1-10` | None |
| ~~M15~~ | ~~**`parseCSVLine` utility in wrong module** — REMOVED: CSV import/export deleted~~ | — | — | — | — |
| M16 | **Default settings object has no migration pattern** — `getSettings()` returns inline defaults; existing users get `undefined` for new fields | New schema fields silently return `undefined` for existing users until they save | S | `storage.js:180-183` | None |
| M17 | **`restoreFromBackup` issues individual puts** — opens separate connection per restored item | 500 connections on restore with large backup | M | `storage.js:37-41` | H10 |
| M18 | **Low `max_tokens` also affects `/api/ai/program-coach`** — 2048 tokens for complex program modifications | Risk of truncated program JSON for medium-to-complex programs (comment confirms) | S | `push-worker/src/index.js:167` | None |
| M19 | **Eager dictionary index build** — `_DICT_INDEX` built via IIFE regardless of whether dictionary is queried | Negligible at current scale (122 entries) but could surprise with larger datasets | S | `data/exercise-dictionary.js:1793-1813` | None |
| M20 | **Alias collision silently suppressed** — duplicate normalized aliases logged to `console.warn` only | Invisible in production; "press hombro" could silently match wrong exercise | S | `data/exercise-dictionary.js:1802-1807` | None |
| M21 | **Incomplete CSV import entries in dictionary** — last section (~53 entries) has empty `en`, empty `gif`, single `aliases` | Confusing UI: duplicate similar entries with different tips/alternatives | M | `data/exercise-dictionary.js:1534-1778` | None |
| M22 | **`bodyPartsFor` doesn't cover all muscle groups** — "Antebrazos", "Cadena Posterior", "Abdomen" fall through to wrong body parts | Users with pain in uncovered muscle groups get inappropriate body part suggestions | S | `components/detail.js:675-683` | None |
| M23 | **Chart logic duplication** — Sparkline and LineChart duplicate ~60% of logic (value extraction, min/max, point mapping) | Bug fix to chart rendering must update 2 components | S | `components/chart.js` | None |

---

## Low (when convenient)

| # | Description | Effort |
|---|-------------|--------|
| L1 | **Contenteditable profile name accepts arbitrary HTML** — `settings.userName` rendered as innerHTML if it contains markup | S |
| L2 | **Hardcoded timer circumference fallback** — `185.35` is tied to specific ring size; breaks visually if ring dimensions change | S |
| L3 | **Muscle filter truncates compound muscles** — `history.js` takes first segment of `"Hombros/hombro lateral"` → filter misses second muscle | S |
| L4 | **Reschedule order silently defaults to identity** — partial reschedule (4/7 days) silently discarded instead of preserving applied swaps | S |
| L5 | **Effort selector appears after unmount** — 600ms timeout fires even if user already navigated away; overlay attaches to `document.body` | S |
| L6 | **Zero-log exercises show "0" as current weight** — flat sparkline renders; confusing for users who haven't logged yet | S |
| L7 | **Silent event binding in you.js** — 15+ `setTimeout(() => ..., 0)` deferred bindings fail silently if element is missing | S |
| L8 | **`watchBtn` appended twice** — duplicate `appendChild` at `today.js:214-215` (moves element, harmless but copy-paste residue) | S |
| L9 | **Hardcoded cache version in SW** — manual `CACHE = 'v1'` bump easily forgotten on deploy | S |
| L10 | **Hardcoded asset list in SW** — 25 paths hardcoded; can drift from actual files | M |
| L11 | **`openWindow` creates browser tab instead of PWA window** — `notificationclick` opens second app instance in browser tab on PWA | S |
| L12 | **Legacy `message` handler still active in SW** — old `postMessage` → `showNotification()` path is dead code after Web Push migration | S |
| L13 | **No navigation fallback in SW** — SPA navigation failures do not fall back to `index.html` | S |
| L14 | **CORS permissive on Worker** — `Access-Control-Allow-Origin: *` on a public `workers.dev` subdomain | S |
| L15 | **`VAPID_EMAIL` fallback placeholder** — `'mailto:pedro@example.com'` is not a valid contact; push services may throttle | S |
| L16 | **Template variable injection in exercise coach prompt** — `exercise_name` and `muscle` not sanitized before prompt interpolation | S |
| L17 | **Load order dependency between warmup.js and exercise-dictionary.js** — no runtime guard if script order changes | S |
| L18 | **Single CDN point of failure for exercise images** — `raw.githubusercontent.com` main branch URLs not pinned | S |
| L19 | **`buildAIDictionary` memoization comment missing** — assumes `EXERCISE_DICTIONARY` is immutable at runtime | S |
| ~~L20~~ | ~~**Error messages in import toasts may include PII** — REMOVED: CSV import/export deleted~~ | — |
| ~~L21~~ | ~~**Broken indentation in try/catch blocks** — REMOVED: CSV try/catch blocks deleted~~ | — |
| L22 | **Inline styles in `installPWA()`** — 25 lines of `style.cssText` in JS makes overlay hard to theme | S |
| L23 | **`tempSwaps` never cleaned up** — stale swap entries persist across days until page reload | S |
| L24 | **`user-select: none` prevents text selection** — can't copy exercise names or tips | S |
| L25 | **Unused `pulse` CSS keyframe** — defined but not referenced anywhere | S |
| L26 | **SectionLabel mixes innerHTML + appendChild** — two DOM construction strategies for one component (functionally correct) | S |
| L27 | **`getComputedStyle(document.body).fontFamily` called on every render** — synchronous layout on every TabBar render | S |
| L28 | **Sheet doesn't handle Escape key** — desktop users must click backdrop to close | S |
| L29 | **`ExercisePlaceholder` renders `actions` as innerHTML** — XSS surface if actions ever contains user data | S |
| L30 | **Toast queue not handled** — consecutive toasts in same frame overwrite; first is lost | S |
| L31 | **TikTok deep link uses Chinese app scheme first** — `snssdk1233://` delays opening on international devices | S |
| L32 | **Weight stepper allows multiple dots** — `replace(/[^0-9.]/g, '')` lets `1.2.3` pass through `parseFloat` as `1.23` | S |
| L33 | **Chat overlay doesn't persist across sheet closes** — thread resets on every reopen (acceptable but notable) | S |
| L34 | **No input sanitization in chat bubbles** — AI reply rendered as `innerHTML` (theoretical XSS from prompt injection) | S |

---

## Suggested Execution Order

### Sprint 1: Fix Critical Issues (~1 week)

1. **C2+C3+C4** — ✅ DONE: today.js race condition, _state guard, timer leak
2. **C1** — Add schema validation to `importLogsAndSettings()`
3. **C6+C7** — Add request body validation + size limits to Worker
4. **C8** — Filter user profile before sending to AI (send only goal + experience)
5. **C5** — Add `pushsubscriptionchange` handler to SW
6. **H5+H6** — Remove duplicate SW registration; fix `PUSH_SERVER_URL` guards
7. **H3+H4** — Add error boundary to renderScreen; add skeleton loading state

### Sprint 2: Data Integrity & Performance (~1 week)

8. **H8+H9** — Fix backup await; add try/catch to JSON.parse
9. **H10** — Cache DB connection in db.js
10. **H11** — Add localStorage size check to backupAll()
11. **M10+M11** — Use date index for getLogsForDate; consider name index for exercises
12. **M2** — Debounce settings saves
13. **H1** — Split you.js into 3 files (you-stats.js, you-exercises.js, you-programs.js)

### Sprint 3: Worker & AI Cleanup (~1 week)

14. **H12+H13** — Extract JSON extraction helper; add rate limiting to Worker
15. **H14+M18** — Bump max_tokens to 2048+ across AI endpoints
16. **H15** — Extract shared fuzzyMatch utility
17. **H16** — Normalize muscle values; add canonical `muscleGroup` field
18. **M22** — Fix `bodyPartsFor` coverage for all muscle groups

### Sprint 4: Architecture Improvements (~2 weeks)

19. **H2** — Split runCoachAnalysis into compute/build/call layers
20. **H7** — Selective DOM updates (start with filter chips and tab bars)
21. **M1** — Split detail.js into detail.js + coach-chat.js
22. **M7+M8+M9** — Use replaceState for sheets; differentiate refresh types; extract reloadState()
23. **M14** — Move showToast to ui.js (parseCSVLine deleted — CSV removed)
24. **M4+M5+M6** — Log cache errors; add origin filter to SW fetch; use constant push tag
25. **M12+M13+M17** — Batch IndexedDB transactions across write operations

### Sprint 5: Polish & Low Hanging Fruits (~1 week)

26. **L1-L34** — All low-priority items (batch by file)
27. **M19+M20+M21** — Dictionary cleanup (alias collisions, incomplete entries)
28. **M23** — Extract shared chart utility

### Groupable items (same file/area, do together)

| Group | Items | File(s) |
|-------|-------|---------|
| today.js rework | C2, C3, C4, L2, L5, L8 | ✅ DONE (C2, C3, C4) | `views/today.js` |
| Worker hardening | C6, C7, C8, H12, H13, H14, M18, L14, L15 | `push-worker/src/index.js` |
| SW cleanup | C5, M4, M5, M6, L9, L10, L11, L12, L13 | `sw.js` |
| Persistence overhaul | C1, H8, H9, H10, H11, M10, M11, M12, M13, M14, M16, M17 | `db.js`, `storage.js` |
| App shell hardening | H3, H4, H5, H6, H7, M7, M8, M9 | `app.js`, `index.html` |
| Dictionary normalization | H16, M19, M20, M21 | `data/exercise-dictionary.js` |
| Component splitting | H1, M1, M23 | `views/you.js`, `components/detail.js` |
| Chart dedup | M23, FC-5 | `components/chart.js` |
