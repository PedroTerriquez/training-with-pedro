# Coach Pedro AI — Project Overview

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Vanilla HTML/CSS/JS | — |
| Persistence | IndexedDB (4 object stores) | — |
| Backup | localStorage (auto-mirror on every write) | — |
| Push Notifications | Web Push API + Cloudflare Worker | — |
| AI Inference | Cloudflare Workers AI — Llama 3.1 8B | — |
| Service Worker | Network-first with cache fallback | — |
| Fonts | Space Grotesk (UI), JetBrains Mono (data) | Google Fonts |
| Icons | Inline SVG (no icon library) | — |
| Charts | Custom SVG (Sparkline, LineChart) | — |
| Server Dependencies | `web-push` (npm) | ^3.6.7 |
| CI/CD | Wrangler CLI (Cloudflare Workers) | — |
| Deployment | GitHub Pages (static) + Cloudflare Workers (serverless) | — |

**No build step.** No frameworks. No bundlers. No package manager for the frontend. The app is a single-page application opened directly from `index.html` or served from any static host.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser (PWA)                           │
│                                                                 │
│  index.html → loads scripts in dependency order                 │
│       ↓                                                        │
│  app.js (SPA Router + State + Event Bus)                       │
│    ├── views/today.js    → mountToday()                         │
│    ├── views/plan.js     → mountPlan()                          │
│    ├── views/history.js  → mountHistory()                       │
│    ├── views/you.js      → mountYou()                           │
│    └── components/                                              │
│         ├── ui.js         → Chip, Sheet, TabBar, StatBlock      │
│         ├── chart.js      → Sparkline, LineChart                │
│         ├── detail.js     → mountExerciseDetail() + Coach FAB   │
│         └── warmup.js     → WarmupPanelContent + Stretching     │
│                                                                 │
│  db.js  ←── storage.js (Storage object) ←── IndexedDB           │
│                    ↕ (auto-mirror)                              │
│              localStorage (backup)                              │
│                                                                 │
│  sw.js  ←── Service Worker (network-first + push events)        │
│              ↕ Web Push Protocol                                │
└────────────────────────────────┬────────────────────────────────┘
                                 │ HTTPS (fetch)
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Cloudflare Worker (serverless)                  │
│  push-worker/src/index.js                                       │
│                                                                 │
│  POST /api/push/subscribe     → KV store (sub_${deviceId})      │
│  POST /api/push/unsubscribe   → KV delete                       │
│  POST /api/push/start         → empty push (wake SW) → Apple    │
│  POST /api/rest-timer/start   → Queue → delayed empty push      │
│  POST /api/rest-timer/cancel  → KV cancel flag                  │
│  POST /api/ai/import          → Workers AI → JSON program       │
│  POST /api/ai/coach           → Workers AI → session analysis   │
│  POST /api/ai/program-coach   → Workers AI → program mods       │
│  POST /api/ai/exercise-coach  → Workers AI → multi-turn chat    │
│                                                                 │
│  Push: payload-less (manual VAPID); SW reads text from cache    │
│  Secrets: VAPID_PRIVATE_KEY, VAPID_PUBLIC_KEY, VAPID_EMAIL      │
│  KV: PUSH_KV (per-device subs)  ·  Queue: rest-timers           │
└─────────────────────────────────────────────────────────────────┘
```

> **Push notifications:** per-device, payload-less wake-ups + local-cache rendering
> (iOS drops encrypted payloads). Full architecture, the multi-device model, and the
> "trust on-device display, not Apple's 201" finding are in
> [`docs/PUSH_NOTIFICATIONS_FINDINGS.md`](docs/PUSH_NOTIFICATIONS_FINDINGS.md).

### Data Flow (runtime)

1. **`init()` → `loadState()`** — opens IndexedDB, loads all 4 stores into `_state`, renders shell + tab bar + screen
2. **On data loss detection** — if `hasUsedApp` flag exists but exercises array is empty, auto-restores from localStorage backup
3. **User actions** → `Storage.*` methods → IndexedDB write → `backupAll()` (localStorage mirror) → `refresh()` → re-render
4. **Weight logging** → Detail sheet → `onLog()` → `Storage.logWeight()` → appends to `exerciseLogs`
5. **Re-render** → `refresh()` → reloads all state from IndexedDB → `renderScreen()` → calls the current view's mount function
6. **AI requests** → UI function → `fetch(POST /api/ai/*)` → Cloudflare Worker → Workers AI → parsed JSON/response → state update + re-render

---

## Directory Structure

```
/
├── index.html                  # App shell: meta tags, font preconnects, stylesheet, manifest link, script tags in dependency order, SW registration
├── styles.css                  # CSS custom properties (design tokens), global resets, keyframe animations, utility classes
├── app.js                      # SPA router, global state (_state), event bus, push notification management, AI import/coach functions, app lifecycle
├── db.js                       # IndexedDB abstraction layer: openDB, CRUD helpers (getAll, get, put, del, getByIndex), generateId
├── storage.js                  # Data service layer (Storage object): all business-logic CRUD, CSV import/export, JSON import/export, dictionary migration, backup/restore
├── data.js                     # Static recovery tips array (RECOVERY_TIPS) displayed on rest days
├── exercise-images.js          # Remote exercise image lookup via free-exercise-db (GitHub raw JSON), with local dictionary fallback and fuzzy matching
├── manifest.json               # PWA manifest (display standalone, icons, theme color)
├── sw.js                       # Service Worker: cache ASSETS on install, network-first fetch, local postMessage notifications, Web Push event handler, notification click handler
├── push-config.js              # Gitignored runtime config: PUSH_SERVER_URL + VAPID_PUBLIC_KEY
├── push-config.example.js      # Template for push-config.js, committed to repo
├── AGENTS.md                   # Comprehensive project context for AI coding assistants
├── PROJECT_OVERVIEW.md         # ← This file
├── opencode.json               # OpenCode plugin configuration (superpowers)
├── .gitignore                  # .env, *.bak, .DS_Store, node_modules/
│
├── data/                       # Static data modules loaded as scripts
│   ├── ai-prompt.js            # AI_SYSTEM_PROMPT, AI_COACH_PROMPT, AI_PROGRAM_COACH_PROMPT, AI_EXERCISE_COACH_PROMPT, buildAIDictionary()
│   ├── exercise-dictionary.js  # EXERCISE_DICTIONARY array (~1885 lines) — single source of truth for exercise metadata (name, muscle, image, gif, tips, alternatives)
│   ├── warmup.js               # WARMUP_DATA per-muscle warmup/stretch routines, IMG_BASE/EX_GIF_BASE constants, resolvePanelItems(), makeCheckableRow(), img() helper
│   └── Gemini_Generated_Image_*.png  # Static image asset (Pedro the trainer)
│
├── components/                 # Reusable UI components
│   ├── ui.js                   # Chip, SectionLabel, StatBlock, ExercisePlaceholder, TabBar (4-tab bottom nav), Sheet (bottom sheet), showCenterToast
│   ├── chart.js                # Sparkline (mini line chart), LineChart (full-size with area fill, grid, labels)
│   ├── detail.js               # mountExerciseDetail() — bottom sheet with 4 tabs (Workout/Registrar, Cues/Consejos, Swap/Alternativas, History/Historial), Coach FAB, openCoachChat() multi-turn overlay
│   └── warmup.js               # WarmupPanelContent, StretchingPanelContent, mountWarmupDetail() — per-muscle warmup/stretch exercise sheets with checkable rows and nav
│
├── views/                      # Screen mount functions (one per route)
│   ├── today.js                # mountToday() — auto-detects day, renders PhaseCard with progress ring, warmup/stretch panels, exercise cards, timer, effort modal, coach card
│   ├── plan.js                 # mountPlan() — week tabs, day cards with exercise lists, day-level drag-free reschedule editor
│   ├── history.js              # mountHistory() — exercise list with muscle filter chips, sparkline per exercise, last weight + delta
│   └── you.js                  # mountYou() — 3-tab screen: Datos (settings, AI import, CSV/JSON import/export, maintenance), Ejercicios (CRUD), Programas (CRUD + Program Coach)
│
├── icons/                      # PWA icons
│   ├── icon-192.png
│   └── icon-512.png
│
├── push-worker/                # Cloudflare Worker project (separate deploy)
│   ├── src/index.js            # Worker entry point: 7 POST endpoints (push subscribe/unsubscribe/send, AI import/coach/program-coach/exercise-coach)
│   ├── wrangler.toml           # Worker config: name, main, compatibility_date, AI binding, VAPID_EMAIL var
│   ├── package.json            # npm package: web-push dependency, wrangler scripts
│   ├── package-lock.json
│   ├── .env.example            # Template for local env vars
│   └── .wrangler/              # Wrangler build artifacts (gitignored)
│
└── training-with-pedro/        # Design prototype (React JSX files) — visual reference only, NOT used at runtime
    ├── project/
    ├── app.jsx, today.jsx, detail.jsx, screens.jsx, ui.jsx, ...
    └── Training with Pedro.html
```

---

## Core Modules & Responsibilities

### `db.js` — IndexedDB Gateway
- **Purpose**: Low-level IndexedDB operations with Promise wrappers
- **Exposes**: `openDB()`, `getAll(storeName)`, `get(storeName, id)`, `put(storeName, data)`, `del(storeName, id)`, `getByIndex(storeName, indexName, value)`, `generateId()`
- **Dependencies**: None
- **Depended on by**: `storage.js`

### `storage.js` — Data Service Layer
- **Purpose**: Business-logic CRUD for all 4 stores, CSV/JSON import/export, dictionary migration, localStorage backup
- **Exposes**: `Storage.getExercises()`, `Storage.saveExercise()`, `Storage.deleteExercise()`, `Storage.findOrCreateExerciseByName()`, `Storage.getLogsForExercise()`, `Storage.logWeight()`, `Storage.getPrograms()`, `Storage.saveProgram()`, `Storage.getSettings()`, `Storage.saveSettings()`, `Storage.migrateExercisesToDictionary()`, `Storage.exportLogsAndSettings()`, `Storage.importLogsAndSettings()`, `backupAll()`, `restoreFromBackup()`
- **Also defines**: `showToast()`
- **Dependencies**: `db.js`
- **Depended on by**: `app.js`, all views

### `app.js` — Application Shell
- **Purpose**: SPA router, global state management, event bus, app lifecycle, push notification management, AI integration functions
- **Exposes**: `init()`, `refresh()`, `handleRoute()`, `renderShell()`, `renderScreen()`, `openDetailSheet()`, `subscribePush()`, `unsubscribePush()`, `sendPushNotification()`, `importWithAI()`, `programCoach()`, `exerciseCoachChat()`, `runCoachAnalysis()`, `installPWA()`, `notifyWatch()`
- **Global state**: `_state` object (route, settings, programs, exercises, exerciseLogs, activeProgram, detailExercise, sheetOpen, tempSwaps)
- **Dependencies**: `storage.js`, `components/ui.js`, `components/chart.js`, `components/warmup.js`, `components/detail.js`, all views, `data/ai-prompt.js`, `push-config.js`
- **Depended on by**: `index.html` (last script loaded)

### `components/ui.js` — UI Primitives
- **Purpose**: Reusable atomic UI components
- **Exposes**: `Chip()`, `SectionLabel()`, `StatBlock()`, `ExercisePlaceholder()`, `TabBar()`, `Sheet()`, `showCenterToast()`
- **Dependencies**: None (pure DOM creation)

### `components/chart.js` — Charting
- **Purpose**: SVG-based line charts
- **Exposes**: `Sparkline()`, `LineChart()`
- **Dependencies**: None

### `components/detail.js` — Exercise Detail Sheet
- **Purpose**: Full exercise detail with workout logging, technique cues, alternative exercises, history, and Coach AI chat
- **Exposes**: `mountExerciseDetail()`, `openCoachChat()`
- **Internal state**: `_coachChatThread[]`, `_coachChatLoading`
- **Dependencies**: `app.js` (for `exerciseCoachChat()`), `components/ui.js` (Sheet, SectionLabel), `components/chart.js` (LineChart)

### `components/warmup.js` — Warmup & Stretching
- **Purpose**: Per-muscle warmup/stretch exercise panels with checkable rows
- **Exposes**: `WarmupPanelContent()`, `StretchingPanelContent()`, `mountWarmupDetail()`
- **Internal helpers**: `resolvePanelItems()`, `makeCheckableRow()`, `makePanelContent()`
- **Dependencies**: `data/warmup.js` (WARMUP_DATA)

### `views/today.js` — Today Screen
- **Purpose**: Auto-detects day of week, renders workout session with PhaseCards (warmup → exercises → stretch), timer, effort modal, coach analysis card
- **Exposes**: `mountToday()`
- **Internal state**: `_phase`, `_startedAt`, `_endedAt`, `_todayExDone`, `_coachResult`, `_effortValue`, etc.
- **Dependencies**: `components/warmup.js`, `app.js` (for `runCoachAnalysis`, `sendPushNotification`)

### `views/plan.js` — Plan Screen
- **Purpose**: Week selector tabs + day grid with exercise lists, day-level reschedule editor
- **Exposes**: `mountPlan()`
- **Internal state**: `_planWeekIdx`, `_planExpandedDayIdx`, `_planEditing`, `_planEditingOrder`
- **Dependencies**: `components/ui.js`

### `views/history.js` — History Screen
- **Purpose**: Exercise list with muscle filter chips, per-exercise sparklines, last weight + delta
- **Exposes**: `mountHistory()`
- **Internal state**: `_historyFilter`
- **Dependencies**: `components/chart.js` (Sparkline), `storage.js`

### `views/you.js` — You Screen
- **Purpose**: Profile settings, exercise CRUD, program CRUD, AI import, CSV/JSON import/export, dictionary normalization, program coach
- **Exposes**: `mountYou()`
- **Internal state**: `_youTab`
- **Dependencies**: `storage.js`, `app.js` (for `importWithAI`, `programCoach`), `data/ai-prompt.js`

### `push-worker/src/index.js` — Cloudflare Worker
- **Purpose**: 7 POST endpoints for push notifications and AI inference
- **Endpoints**:
  - `POST /api/push/subscribe` — stores subscription in KV
  - `POST /api/push/unsubscribe` — deletes subscription from KV
  - `POST /api/push/send` — sends encrypted push via web-push
  - `POST /api/ai/coach` — session analysis via Workers AI
  - `POST /api/ai/import` — text-to-program via Workers AI
  - `POST /api/ai/program-coach` — program modifications/questions via Workers AI
  - `POST /api/ai/exercise-coach` — multi-turn exercise chat via Workers AI
- **Dependencies**: `web-push` (npm), `env.AI` (Workers AI binding), `env.PUSH_KV` (KV namespace)

---

## Entry Points

| Entry Point | Trigger | Description |
|---|---|---|
| `index.html` | Browser load | Serves app shell, loads all scripts, triggers `DOMContentLoaded` → `init()` |
| `#today` (default) | Hash route | Auto-detect day, show session or rest day |
| `#plan` | Hash route | Week selector + day grid |
| `#history` | Hash route | Exercise list with muscle filter + sparklines |
| `#you` | Hash route | Stats, settings, CRUD, import/export |
| `#detail=<id>` | Hash route | Opens exercise detail bottom sheet |
| `sw.js` `install` | Service Worker lifecycle | Caches asset list |
| `sw.js` `activate` | Service Worker lifecycle | Deletes old caches |
| `sw.js` `fetch` | Network request | Network-first, cache fallback |
| `sw.js` `message` | `postMessage` from app | Local `showNotification()` |
| `sw.js` `push` | Web Push event | `showNotification()` from push payload |
| `sw.js` `notificationclick` | User taps notification | Opens/closes window |
| Cloudflare Worker | HTTP POST | 7 endpoints (push + AI) |

---

## Data Models

### `exercises` (Object Store)
| Field | Type | Description |
|---|---|---|
| `id` | string | Auto-generated (`id-` + 12 random base36 chars) |
| `name` | string | User-defined exercise name |
| `muscle` | string | Muscle group (e.g. "Pecho", "Espalda") |
| `imgUrl` | string | Optional exercise image URL |
| `gifUrl` | string | Optional exercise GIF URL |
| `tips` | string[] | Form cue list (e.g. ["Retrae escápulas", "Controla el descenso"]) |
| `alternatives` | `{ name, reason }[]` | Alternative exercises with reason |

### `exerciseLogs` (Object Store)
| Field | Type | Description |
|---|---|---|
| `id` | string | Auto-generated |
| `exerciseId` | string | FK → `exercises.id` |
| `date` | string | "YYYY-MM-DD" format |
| `weight` | number | Lifted weight |
| `units` | string | "kg" or "lb" |
| `sets` | number | Optional: actual sets performed |
| `reps` | number | Optional: actual reps performed |

Indexes: `exerciseId`, `date` (both non-unique)

### `programs` (Object Store)
| Field | Type | Description |
|---|---|---|
| `id` | string | Auto-generated |
| `name` | string | e.g. "Push / Pull / Legs" |
| `weeks` | `Week[]` | Array of week objects |

Week structure:
```json
{
  "name": "Week A",
  "subtitle": "Volume",
  "tag": "BUILD",
  "days": [{
    "name": "Push",
    "subtitle": "Chest · Shoulders · Triceps",
    "duration": 65,
    "exercises": [{
      "exerciseId": "ex-bench",
      "sets": 4,
      "reps": "6-8",
      "rest": 180
    }]
  }]
}
```

**Key rule**: Sets, reps, and rest live on the program exercise instance, NOT on the exercise definition. Duplicate `exerciseId` values are allowed across different days.

### `settings` (Object Store, singleton)
| Field | Type | Default | Description |
|---|---|---|---|
| `id` | string | `"settings"` | Fixed key |
| `activeProgramId` | string | `null` | Currently active program |
| `currentWeekIdx` | number | `0` | Current week index |
| `units` | string | `"kg"` | Display units |
| `accentColor` | string | `"#d4ff3a"` | UI accent color |
| `userName` | string | `"Pedro"` | User display name |
| `height` | string | `""` | Height in cm |
| `weight` | string | `""` | Body weight |
| `sex` | string | `""` | Sex (Masculino/Femenino/Otro) |
| `age` | string | `""` | Age |
| `goal` | string | `""` | Training goal |
| `experience` | string | `""` | Experience level |
| `occupation` | string | `""` | Occupation |
| `pushServerUrl` | string | `""` | Push notification server URL |
| `pushSubscribed` | boolean | `false` | Push subscription status |
| `lastCoachAnalysis` | object | `null` | Last AI coach analysis result |
| `sessionState` | object | `null` | Current session state (phase, done count) |
| `rescheduleWeekOrder` | object | `{}` | Per-week day reorder mappings |
| `lastUpdate` | string | `""` | ISO timestamp of last state update |

---

## Configuration & Environment

### Client-side (`push-config.js`, gitignored)
| Variable | Required | Description |
|---|---|---|
| `PUSH_SERVER_URL` | Yes | Cloudflare Worker URL (e.g. `https://coach-pedro-ai.pollothe.workers.dev`) |
| `VAPID_PUBLIC_KEY` | Yes | Web Push VAPID public key |

### Service Worker (`sw.js`)
| Constant | Description |
|---|---|
| `CACHE = 'v1'` | Cache version — bump on deploy to refresh cached assets |
| `ASSETS` | Array of asset paths to cache on install |

### Cloudflare Worker (`wrangler.toml` + secrets)
| Binding/Source | Type | Required | Description |
|---|---|---|---|
| `[ai]` binding | Wrangler config | Yes | Workers AI binding (free tier) |
| `PUSH_KV` | KV namespace | Yes | Stores push subscription JSON |
| `VAPID_PUBLIC_KEY` | `wrangler secret` | Yes | VAPID public key |
| `VAPID_PRIVATE_KEY` | `wrangler secret` | Yes | VAPID private key (ONLY real secret) |
| `VAPID_EMAIL` | `wrangler secret` | Yes | Contact email for VAPID auth |
| `VAPID_EMAIL` fallback | `wrangler.toml` `[vars]` | No | Default `mailto:pedro@example.com` |

### Cloudflare Worker (`wrangler.toml`)
| Field | Value | Description |
|---|---|---|
| `name` | `"coach-pedro-ai"` | Worker name |
| `main` | `"src/index.js"` | Entry point |
| `compatibility_date` | `"2025-05-30"` | Workers runtime version |
| `compatibility_flags` | `["nodejs_compat"]` | Node.js compatibility for web-push |
| `workers_dev` | `true` | Enable workers.dev subdomain |

---

## Build & Deploy

### Frontend (Zero Build)
- No build step. Open `index.html` directly in browser or serve from any static host.
- **GitHub Pages**: push repo, enable Pages from `main` branch, root directory.
- On **deploy**: bump `CACHE` version in `sw.js` if changing cached assets.
- Service Worker installs in background, takes control on next launch (open app twice).

### Cloudflare Worker (cd push-worker)
```bash
npm install
npx wrangler deploy          # Deploy to Cloudflare
npx wrangler dev             # Local dev with wrangler
```

**Setup steps** (one-time):
1. Create Cloudflare account (free, no credit card)
2. `wrangler login` — authorize via browser
3. `wrangler kv:namespace create PUSH_KV` → paste ID into `wrangler.toml`
4. `npx web-push generate-vapid-keys` → copy keys
5. `wrangler secret put VAPID_PRIVATE_KEY VAPID_PUBLIC_KEY VAPID_EMAIL`
6. `wrangler deploy` → note the worker URL
7. Update `push-config.js` with worker URL and VAPID public key

### Version Tracking
- `APP_VERSION` in `app.js` is a static string (e.g. `v1.1 · 2026-06-03`)
- Update with every deploy to reflect the actual deployment date

---

## Key Design Decisions

1. **Exercises are standalone entities** — programs reference them by ID. This allows the same exercise to appear in multiple programs/days with different sets/reps/rest.

2. **Logs are flat** — no workout grouping. Each `exerciseLog` = one weight entry for one exercise on one date. History is computed by scanning logs per `exerciseId`, sorted by date.

3. **No seed data** — app starts empty. User creates exercises/programs or imports via CSV/AI.

4. **localStorage backup mirror** — every IndexedDB write triggers `backupAll()`. On app init, if data is lost (iOS purge), auto-restores from localStorage.

5. **Week-day mapping** — Mon=0 through Sun=6 (converted from JS's Sun=0 via `(jsDay + 6) % 7`).

6. **Reschedule** — day-to-day reordering is stored per-program-per-week as an index permutation array in settings. Temporary (7 days) — not persisted to the program itself.

7. **Push notifications** — single subscription (one device). Uses Web Push for iOS Notification Center + Apple Watch support.

8. **AI features** — all powered by Cloudflare Workers AI (Llama 3.1 8B, free tier). No API keys needed. The Worker acts as proxy: client sends text → Worker calls AI → returns parsed JSON.
