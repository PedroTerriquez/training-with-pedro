# Module Decomposition

Modules ordered by dependency (foundational first).

---

## Module 1: Persistence Layer

- **Files**: `db.js`, `storage.js`
- **Purpose**: IndexedDB abstraction and all data operations — CRUD for 4 object stores, localStorage backup mirror, CSV/JSON import/export, dictionary migration.
- **Boundaries**: `db.js` is the raw IndexedDB gateway with Promise wrappers. `storage.js` builds on it with the `Storage` singleton object that provides business-logic operations (find-or-create, delete with cascade, log weight with dedup, etc.). Also includes `showToast()`, `backupAll()`, `restoreFromBackup()`.
- **Internal Dependencies**: None
- **External Dependencies**: None (IndexedDB is a browser API)
- **Entry Points**:
  - `openDB()`, `getAll()`, `get()`, `put()`, `del()`, `getByIndex()`, `generateId()`
  - `Storage.getExercises()`, `.saveExercise()`, `.deleteExercise()`, `.findOrCreateExerciseByName()`
  - `Storage.getLogsForExercise()`, `.logWeight()`, `.getLogsForDate()`
  - `Storage.getPrograms()`, `.getProgram()`, `.saveProgram()`, `.deleteProgram()`
  - `Storage.getSettings()`, `.saveSettings()`, `.saveCoachAnalysis()`, `.getCoachAnalysis()`
  - ~~`Storage.importProgramFromCSV()`, `.exportProgramToCSV()`~~ (removed)
  - ~~`Storage.importExercisesFromCSV()`~~ (removed)
  - `Storage.migrateExercisesToDictionary()`
  - `Storage.exportLogsAndSettings()`, `.importLogsAndSettings()`
  - `backupAll()`, `restoreFromBackup()`
- **Data Flow**: Caller → `Storage.*` → `db.js` helpers → IndexedDB read/write. On every write, `backupAll()` mirrors to localStorage. On init/data loss, `restoreFromBackup()` reads localStorage → writes back to IndexedDB. Imports (CSV/JSON) parse text → resolve exercise IDs → persist.
- **Complexity**: High — 451 lines (`storage.js` + `db.js`), handles 4 store schemas, CSV parsing with quoting, cascade deletes across 3 stores, find-or-create with fuzzy dictionary matching, two-phase migration with force flag, bidirectional backup.

---

## Module 2: Static Data

- **Files**: `data/ai-prompt.js`, `data/exercise-dictionary.js`, `data/warmup.js`, `data.js`, `exercise-images.js`
- **Purpose**: All static datasets, AI prompts, exercise metadata, warmup/stretch routines, and remote image lookup logic. Pure data + lookup functions, no mutating state.
- **Boundaries**: Loaded as global scripts (no module system). `data.js` sets `window.RECOVERY_TIPS`. `data/ai-prompt.js` exports `AI_SYSTEM_PROMPT`, `AI_COACH_PROMPT`, `AI_PROGRAM_COACH_PROMPT`, `AI_EXERCISE_COACH_PROMPT`, and `buildAIDictionary()`. `data/exercise-dictionary.js` defines `EXERCISE_DICTIONARY` (~1885 lines). `data/warmup.js` defines `WARMUP_DATA`, `IMG_BASE`, `EX_GIF_BASE`, `resolvePanelItems()`. `exercise-images.js` provides remote image lookup via free-exercise-db with local fallback and fuzzy matching.
- **Internal Dependencies**: `data/warmup.js` provides `IMG_BASE` which `data/exercise-dictionary.js` uses. `data/exercise-dictionary.js` provides `EXERCISE_DICTIONARY` which `data/ai-prompt.js` reads via `buildAIDictionary()`.
- **External Dependencies**: free-exercise-db GitHub raw JSON (runtime fetch in `exercise-images.js`), jsDelivr CDN (`EX_GIF_BASE`)
- **Entry Points**:
  - `RECOVERY_TIPS` (global array)
  - `AI_SYSTEM_PROMPT`, `AI_COACH_PROMPT`, `AI_PROGRAM_COACH_PROMPT`, `AI_EXERCISE_COACH_PROMPT` (global strings)
  - `buildAIDictionary()` — returns lightweight exercise dictionary subset
  - `EXERCISE_DICTIONARY` (global array)
  - `findExerciseEntry()`, `findExerciseEntryFuzzy()`, `getExerciseImageFromDictionary()` (from `exercise-dictionary.js`)
  - `WARMUP_DATA` (global object), `resolvePanelItems()` (by muscle/mode)
  - `loadExerciseDB()`, `findExerciseImageUrl()`, `getExerciseGifUrl()`
- **Data Flow**: Consumers reference global variables directly. Image/gif URL lookups resolve from dictionary first (instant), then remote free-exercise-db (async fetch).
- **Complexity**: Medium — ~2200 lines total (dictionary alone is ~1885), no cyclomatic complexity except fuzzy matching and prompt engineering.

---

## Module 3: App Shell & Router

- **Files**: `app.js`, `index.html`, `styles.css`, `push-config.js`
- **Purpose**: Application lifecycle, SPA hash routing, global state management, tab bar rendering, screen dispatch, push notification management, all AI integration functions (`importWithAI`, `programCoach`, `exerciseCoachChat`, `runCoachAnalysis`), PWA install prompt.
- **Boundaries**: `index.html` loads all scripts in dependency order. `styles.css` provides design tokens and global styles. `app.js` owns `_state` (route, settings, programs, exercises, exerciseLogs, activeProgram, sheetOpen, tempSwaps) and exposes the lifecycle: `init()` → `loadState()` → `renderShell()` → `renderScreen()`. `renderScreen()` reads `_state.route` and calls the corresponding view mount function with user data. `refresh()` reloads all state from IndexedDB and re-renders.
- **Internal Dependencies**: All views (`views/*.js`), `components/*.js`, `storage.js`, `data/ai-prompt.js`, `push-config.js`
- **External Dependencies**: None (browser APIs: hashchange, serviceWorker, Notification, indexedDB)
- **Entry Points**:
  - `init()` — called on `DOMContentLoaded`
  - `refresh()` — full state reload + re-render (exposed as `window.appRefresh`)
  - `handleRoute()` — hash change handler
  - `openDetailSheet(exercise)` — opens exercise bottom sheet
  - `subscribePush()`, `unsubscribePush()`, `sendPushNotification()`
  - `importWithAI(text)` → program creation from AI
  - `programCoach(text, program, settings)` → coach-driven program modification
  - `exerciseCoachChat(name, muscle, alternatives, messages)` → multi-turn chat
  - `runCoachAnalysis(day, effort, duration, exercises, settings, swaps)` → session analysis
  - `installPWA()`, `notifyWatch()`
  - `APP_VERSION` (static version string)
- **Data Flow**: `init()` → `loadState()` (Storage.* → IndexedDB) → `renderShell()` → `renderScreen()` → view mount function → user interacts → view calls `Storage.*` → `refresh()` → re-render. AI flows: view → `app.js` function → `fetch(POST /api/ai/*)` → Cloudflare Worker → response → state mutation → re-render.
- **Complexity**: High — 797 lines, coordinates the entire app lifecycle, manages push subscriptions, handles 4 AI integration flows with error handling, owns global mutable state.

---

## Module 4: UI Primitives

- **Files**: `components/ui.js`, `components/chart.js`
- **Purpose**: Reusable atomic UI components with no business logic. `ui.js` provides layout/shell elements (TabBar, Sheet, Chip, SectionLabel, StatBlock, ExercisePlaceholder, showCenterToast). `chart.js` provides SVG sparkline and full line chart.
- **Boundaries**: Pure DOM creation functions. No state (except DOM elements). No storage access. No knowledge of the domain model beyond what's passed as arguments.
- **Internal Dependencies**: None
- **External Dependencies**: None
- **Entry Points**:
  - `Chip({ children, color, textColor, style })` — inline pill label
  - `SectionLabel({ children, accent })` — labeled section divider with accent dot
  - `StatBlock({ value, label, unit, accent, size })` — metric display block
  - `ExercisePlaceholder({ name, muscle, accent, size, imgUrl, actions })` — exercise card with optional image overlay
  - `TabBar({ active, onChange, accent })` — 4-tab glassmorphism bottom navigation (Today, Plan, History, You)
  - `Sheet({ open, onClose, children })` — bottom sheet overlay with drag handle
  - `showCenterToast({ svg, message, subtitle, duration, accent, onDone })` — full-screen toast overlay
  - `Sparkline({ data, width, height, color })` — mini inline line chart (returns SVG string)
  - `LineChart({ data, width, height, color, unit })` — full-size SVG line chart with area fill, grid, date labels
- **Data Flow**: Calls pass plain objects as arguments. Functions return DOM elements (or SVG strings for charts). No side effects.
- **Complexity**: Low — 233 lines total, no import graph, pure view functions.

---

## Module 5: Feature Components

- **Files**: `components/warmup.js`, `components/detail.js`
- **Purpose**: Self-contained interactive feature panels embedded into screens. `warmup.js` provides per-muscle warmup/stretch exercise lists with checkboxes and a detail sheet with navigation. `detail.js` provides the exercise detail bottom sheet (4 tabs: workout logging, cues, swap, history) plus a multi-turn Coach AI chat overlay.
- **Boundaries**: Each is a complete interactive subsystem. `warmup.js` reads `WARMUP_DATA` and renders checkable rows with mark-all-done, plus a separate drill-down sheet. `detail.js` owns `_coachChatThread[]` and `_coachChatLoading` module-level state, renders a weight stepper with set/rep toggles, and handles TikTok deep linking.
- **Internal Dependencies**:
  - `warmup.js` depends on `data/warmup.js` (WARMUP_DATA, resolvePanelItems)
  - `detail.js` depends on `components/ui.js` (Sheet, SectionLabel), `components/chart.js` (LineChart), `app.js` (`exerciseCoachChat`)
- **External Dependencies**: None
- **Entry Points**:
  - `WarmupPanelContent({ muscles, accent, onComplete })` — checkable warmup row list
  - `StretchingPanelContent({ muscles, accent, onComplete })` — checkable stretch row list
  - `mountWarmupDetail({ items, mode, accent, onComplete })` — full warmup/stretch detail sheet with prev/next nav
  - `mountExerciseDetail(container, { exercise, accent, units, exercises, onOpenExercise, onSwapExercise, onClose, onLog, prevExercise, onPrev, nextExercise, onNext })` — full exercise detail sheet
  - `openCoachChat(exercise, accent)` — multi-turn Coach AI chat overlay
- **Data Flow**: Warmup: muscles in → panel content out → user checks → `onComplete` callback. Detail: exercise config + logs in → 4-tab UI → user logs weight → `onLog` callback → `Storage.logWeight()` → re-render. Coach: user messages → `exerciseCoachChat()` → AI reply → appended to chat thread.
- **Complexity**: High — 1126 lines total (`detail.js` = 802, `warmup.js` = 324). Detail sheet has inline render functions with 4 tab states, stepper logic, sets/reps opt-in, TikTok URL scheme fallback. Warmup module has checkbox state management, mark-all, and drill-down navigation.

---

## Module 6: Screen Views

- **Files**: `views/today.js`, `views/plan.js`, `views/history.js`, `views/you.js`
- **Purpose**: Full-screen view mount functions dispatched by the router. Each owns its own module-level state variables and handles a distinct user-facing feature.
- **Boundaries**: Each view is independent — no shared code between them. They mount into a container element passed by `renderScreen()`. Module-level state resets on route change. Each view can read from `Storage` directly or receive data via props.
- **Internal Dependencies**:
  - `today.js` — `components/warmup.js`, `app.js` (runCoachAnalysis, sendPushNotification)
  - `plan.js` — `components/ui.js`
  - `history.js` — `components/chart.js` (Sparkline), `storage.js`
  - `you.js` — `storage.js`, `app.js` (importWithAI, programCoach), `data/ai-prompt.js`
- **External Dependencies**: None
- **Entry Points**:
  - `mountToday(container, { program, weekIdx, dayIndex, settings, accent, onOpenExercise, exercises, swaps, rescheduleOrder })` — session UI with phases, timer, effort modal, coach analysis card
  - `mountPlan(container, { program, weekIdx, dayIndex, accent, onOpenExercise, onWeekChange, exercises, rescheduleOrder, onUpdateRescheduleOrder })` — week tabs + day grid + reschedule editor
  - `mountHistory(container, { accent, units, onOpenExercise })` — muscle filter + exercise list with sparklines
  - `mountYou(container, { accent, units, settings, onRefresh })` — 3-tab profile (Datos, Ejercicios, Programas) with full CRUD and import/export
- **Data Flow**: `renderScreen()` → reads `_state` → calls view mount with data → view renders DOM and attaches event handlers → user actions call `Storage.*` or `app.js` functions → `refresh()` → re-render.
- **Complexity**:
  - `today.js`: **High** — 867 lines, 19 module-level state variables, 4-phase session flow, timer, effort modal, coach analysis integration, push notification sequencing, warmup/stretch panel management, session state persistence in settings
  - `plan.js`: **Medium** — 379 lines, week tab navigation, day card rendering, day-level reschedule editor with drag-free swap UI
  - `history.js`: **Low** — 83 lines, filter chips + exercise list + sparklines
  - `you.js`: **High** — 1289 lines, 3-tab layout, settings form with auto-save, exercise CRUD (create/edit/delete with confirmation), program CRUD with week/day/exercise editing, CSV/JSON import/export with file dialogs, AI import textarea with progress, program coach textarea + response card, dictionary normalization with force mode, Unicode BOM handling

---

## Module 7: Service Worker

- **Files**: `sw.js`
- **Purpose**: Offline caching (network-first strategy), local notification relay (via `postMessage`), Web Push event handling, notification click with URL navigation.
- **Boundaries**: Runs in a separate worker context, no direct access to IndexedDB (by design), no DOM. Communicates with the app via `postMessage` and the browser's push service. Cached assets are listed statically in `ASSETS` array.
- **Internal Dependencies**: None
- **External Dependencies**: None (browser APIs: Cache, clients, self.registration)
- **Entry Points**:
  - `install` event — caches `ASSETS` array; calls `skipWaiting()`
  - `activate` event — claims clients, deletes old cache versions
  - `fetch` event — network-first: fetch → cache on success → fallback to cache
  - `message` event — receives `{ type: 'notify', title, body, icon, tag }` → calls `showNotification()`
  - `push` event — parses JSON payload → calls `showNotification()` with `requireInteraction: true`; unique tag per push for persistent notifications
  - `notificationclick` event — closes notification, focuses existing window or opens `data.url` (defaults to `./`)
- **Data Flow**: Push: browser push service → `push` event → `showNotification()`. Local: `notifyWatch()` → `postMessage` → `message` event → `showNotification()`. Cache: fetch → try network → store response → return; on failure, return cached.
- **Complexity**: Low — 90 lines, straightforward event handlers, no business logic.

---

## Module 8: Cloudflare Worker

- **Files**: `push-worker/src/index.js`, `push-worker/wrangler.toml`, `push-worker/package.json`
- **Purpose**: Serverless backend for push notifications and AI inference. Provides 7 POST endpoints handling push subscription lifecycle and 4 AI interaction patterns using Workers AI (Llama 3.1 8B).
- **Boundaries**: Deployed independently via `wrangler deploy`. Communicates with the client app via HTTPS. Stores a single push subscription in KV. Calls Workers AI via `env.AI.run()`. CORS-enabled for all origins.
- **Internal Dependencies**: `web-push` npm package (^3.6.7) for VAPID-based push encryption. `env.AI` (Workers AI binding). `env.PUSH_KV` (KV namespace).
- **External Dependencies**: `web-push` (npm), Cloudflare Workers AI runtime
- **Entry Points**:
  - `POST /api/push/subscribe` — validates JSON body → stores in KV under `'subscription'` key
  - `POST /api/push/unsubscribe` — deletes `'subscription'` from KV
  - `POST /api/push/send` — reads subscription from KV → encrypts payload with VAPID → sends via `web-push.sendNotification()` → auto-deletes on 410 (expired subscription)
  - `POST /api/ai/coach` — receives `{ sessionData, systemPrompt }` → Workers AI call → strips markdown fences → parses JSON → returns `{ analysis, verdict }`
  - `POST /api/ai/import` — receives `{ text, systemPrompt }` → Workers AI call → strips markdown fences → parses JSON → returns structured program
  - `POST /api/ai/program-coach` — receives `{ text, currentProgram, userProfile, systemPrompt, dictionary }` → Workers AI call → tries JSON parse → if has `weeks` returns `{ program }`, else returns `{ message }`
  - `POST /api/ai/exercise-coach` — receives `{ exercise_name, muscle, alternatives, messages }` → builds system prompt with context → Workers AI call → returns `{ reply }`
- **Data Flow**: Client `fetch(POST url)` → Worker parses JSON → KV read/write or Workers AI call → parse/handle response → return JSON to client. CORS headers on every response.
- **Complexity**: Medium — 241 lines, 7 endpoints, shared CORS/util pattern, web-push with 410 handling, 4 AI endpoints with different prompt construction and response parsing strategies (JSON extraction from markdown fences, fallback text detection).

---

## Dependency Graph

```
Static Data (2) ───────────────┐
                                ▼
UI Primitives (4)    Persistence Layer (1)
       │                     │
       ├──────┐              ├──────┐
       │      ▼              ▼      │
       │  Feature Comp (5)   App Shell (3)
       │      │              │      │
       │      ├──────────────┤      │
       │      ▼              ▼      ▼
       │            Screen Views (6)
       │
       └── Service Worker (7) (separate context)
       
Cloudflare Worker (8) (separate deployment, HTTPS only)
```

- Solid arrows = direct dependency
- Module 1 (Persistence) is the most depended-on
- Module 2 (Static Data) is loaded first in `index.html` but only needed by storage and components at runtime
- Modules 7 (SW) and 8 (Worker) are isolated — they communicate only via browser push events and HTTPS fetch
- Module 4 (UI Primitives) has zero dependencies — pure functions
