# Coach Pedro AI — Project Context

## Stack
- Vanilla HTML/CSS/JS, no frameworks, no build step
- IndexedDB for all persistence (4 object stores)
- Mobile-only (iPhone PWA), dark mode only
- No desktop — Safari standalone PWA is the only target
- Static site deployable to GitHub Pages
- Entry: `index.html` (single-file SPA with hash routing)

## Platform Context
- **Device**: iPhone with iOS (PWA installed from Safari)
- **Browser**: Safari (PWA standalone mode)
- **Notifications**: Web Push via Cloudflare Worker; `showNotification()` actions NOT supported on iOS
- **Watch mirror**: Notifications mirror to Apple Watch, but long-press actions don't work on iOS — fallback to tap-to-start-timer in `sw.js`. Tap notification → timer starts, "⏱️ Xs · ejercicio" confirmation appears for 2s → when timer completes, "⏰ Descanso terminado" shows for 10s

## Project Structure
```
/index.html              → App shell, font loading, script includes
/styles.css              → CSS variables, design tokens, global styles
/app.js                  → SPA router, state management, event bus, mount, importWithAI
/db.js                   → IndexedDB open/CRUD helpers (openDB, getAll, get, put, del, getByIndex, generateId)
/storage.js              → Data service layer (Storage object), showToast, backupAll, restoreFromBackup
/data.js                 → RECOVERY_TIPS (displayed on rest days)
/data/ai-prompt.js       → AI_SYSTEM_PROMPT + buildAIDictionary() for Gemini import
/components/
  ui.js              → Chip, SectionLabel, StatBlock, ExercisePlaceholder, TabBar, Sheet
  chart.js           → Sparkline, LineChart (SVG-based)
  detail.js          → mountExerciseDetail() — bottom sheet with Workout + History tabs
/views/
  today.js           → mountToday() — auto-detects day, shows session or rest day
  plan.js            → mountPlan() — week selector + day grid
  history.js         → mountHistory() — exercise list with muscle filter + sparklines
  you.js             → mountYou() — stats, settings, exercise CRUD, program CRUD, JSON import/export, AI import
/push-worker/
  src/index.js       → Cloudflare Worker: push notifications + AI import proxy to Gemini
  wrangler.toml      → Worker config
  package.json       → web-push dependency
/AGENTS.md           ← This file
```

## Schema (4 IndexedDB object stores)

### `exercises`
| Field | Type | Notes |
|---|---|---|
| `id` | string | Auto-generated |
| `name` | string | User-defined |
| `muscle` | string | e.g. "Chest" |
| `imgUrl` | string | Optional, editable |
| `tips` | string[] | Form cue list |
| `alternatives` | { name, reason }[] | |

### `exerciseLogs`
| Field | Type | Notes |
|---|---|---|
| `id` | string | Auto-generated |
| `exerciseId` | string | FK → exercises.id |
| `date` | string | "YYYY-MM-DD" |
| `weight` | number | |
| `units` | string | "kg" or "lb" |

Indexes: `exerciseId`, `date`

### `programs`
| Field | Type | Notes |
|---|---|---|
| `id` | string | Auto-generated |
| `name` | string | e.g. "Push / Pull / Legs" |
| `weeks` | Week[] | Array of weeks |

Week structure:
```
{
  name: "Week A", subtitle: "Volume", tag: "BUILD",
  days: [{
    name: "Push", subtitle: "Chest · Shoulders · Triceps", duration: 65,
    exercises: [{ exerciseId: "ex-bench", sets: 4, reps: "6-8", rest: 180 }]
  }]
}
```

Sets, reps, rest LIVE on the program exercise instance, NOT on the exercise definition.

### `settings` (singleton)
```
{ id: "settings", activeProgramId, currentWeekIdx, units, accentColor, hasWatch }
```

`hasWatch`: `boolean` — defaults to `false`. Controls whether the "Inicia tu Smart Watch" toast shows after warmup.

## Key Design Decisions
- Exercises are standalone entities — programs reference them by ID
- Programs own the per-instance sets/reps/rest for each exercise
- Duplicate exercise IDs allowed in same program (different days)
- Logs are flat exerciseLogs — no workout grouping. Each log = one weight entry for one exercise on one date
- History is computed by scanning exerciseLogs per exerciseId, sorted by date
- No seed data — app starts empty, user creates exercises/programs or imports JSON/CSV (CSV import removed)
- User picks active program from You screen; Today/Plan use active program
- Week-day mapping: Mon=0 through Sun=6 (converted from JS's Sun=0 via (jsDay+6)%7)
- Logging weight from Today auto-creates exerciseLog entry; no "start workout" ceremony

## Screens
| Route | View | File |
|---|---|---|
| `#today` (default) | Auto-detect day, show session or rest day | views/today.js |
| `#plan` | Week tabs + day cards | views/plan.js |
| `#history` | Exercise list + muscle filter + sparklines | views/history.js |
| `#you` | Stats + settings + CRUD + JSON import/export + AI import | views/you.js |
| (bottom sheet) | Exercise detail (Workout + History tabs) | components/detail.js |

## Design Tokens
- `--bg`: #0a0a0a
- `--surface`: #141414
- `--text`: #fafafa
- `--accent`: #d4ff3a (configurable via settings)
- `--border`: rgba(255,255,255,0.06)
- Fonts: Space Grotesk (headings/UI), JetBrains Mono (data/numbers)
- Corners: 14-18px cards, 20-28px sheets, 9999px tab bar
- Tab bar: glassmorphism with backdrop-filter blur

## Data Flow
1. `init()` → `loadState()` (if data lost → `restoreFromBackup()`) → `renderShell()` → `renderScreen()`
2. User actions call `Storage.*` methods → IndexedDB → `backupAll()` (localStorage mirror) → `refresh()` → re-render
3. `window.appRefresh()` exposed for external re-render triggers
4. Weight logging: Detail sheet → `onLog()` → `Storage.logWeight()` → append to exerciseLogs

## PWA & Notifications
- PWA configured via `manifest.json` (display standalone, icons, theme #0a0a0a)
- Service Worker (`sw.js`): network-first strategy with cache fallback; deletes old caches on activate
- Notifications: local via `postMessage` → SW → `showNotification()`. Works on iPhone but NOT on Apple Watch
- **Apple Watch limitation**: Without Web Push API (server-sent via PushManager.subscribe()), the PWA never appears in iOS Notification Settings → Watch app → Notifications. Local `showNotification()` can't be mirrored to Watch
- ⌚ button on Today screen requests permission, notifications fire sequentially: warmup done → next exercise → ... → complete
- To deploy: push to `main`. Open PWA twice to activate new SW (installs in background, takes control on next launch)

## Data Management (You screen)
Four grouped sections under Perfil → Datos tab:
- **Importar con IA** (new): Textarea + button → sends to Gemini → creates program + exercises
- **Importar**: 2 rows (Ejercicios (CSV/JSON), Logs+ajustes JSON) — CSV import removed
- **Exportar**: 2 rows (Ejercicios JSON, Programa JSON, Logs+ajustes JSON) — CSV export removed
- **Mantenimiento**: Normalizar ejercicios con diccionario (Aplicar / Forzar)

Previously had a separate "Migrar datos" section — removed and merged JSON import into Importar, JSON export into Exportar.

## Prior Art
Design prototype in `training-with-pedro/project/` — use for visual reference only
IndexedDB is the source of truth at runtime

## Build/Deploy
No build step. Open `index.html` directly in browser or deploy to any static host.
GitHub Pages: push repo, enable Pages from main branch, root directory.
On deploy: bump CACHE version in sw.js if changing cached assets; network-first strategy auto-serves fresh content.

## Push Notifications (Web Push via Cloudflare Worker)

Added 2026-05-28. Replaces local-only `postMessage`→`showNotification()` with Web Push
so notifications appear in iOS Notification Center and can mirror to Apple Watch.
Single subscription (one device at a time).

### Architecture
```
today.js → sendPushNotification()
                  ↓
           fetch(POST /api/push/send)
                  ↓
        Cloudflare Worker + KV store
                  ↓
        Web Push Protocol (encrypted payload)
                  ↓
        Service Worker `push` event
                  ↓
        showNotification() → iOS Notification Center → Apple Watch
```

### Files Created
```
push-worker/
  wrangler.toml     → Worker config (KV binding, VAPID env vars)
  src/index.js      → 3 endpoints: subscribe, unsubscribe, send
  package.json      → web-push dependency
  .env.example      → VAPID key template (git-committed, no secrets)
push-config.example.js → Config template, committed (copy to push-config.js)
```

### Files Modified
| File | Change Summary |
|---|---|
| `sw.js` | Added `push` event listener; updated `notificationclick` to read `data.url` from push payload |
| `app.js` | Added `subscribePush()`, `unsubscribePush()`, `sendPushNotification()`; auto-subscribe on `init()` if permission already granted |
| `views/today.js` | Added `sendPushNotification()` alongside every `window.notifyWatch()` call; `await subscribePush()` in ⌚ button flow |
| `views/you.js` | Added "Notificaciones push" toggle row in Ajustes rápidos |
| `storage.js` | Added `pushSubscribed: false`, `pushServerUrl: ''` to default settings |
| `index.html` | Added `<script src="push-config.js">` before `app.js` |
| `.gitignore` | Added `push-config.js`, `.env`, `*.bak` |

### Config / Secrets (Nothing Secret in Repo)

**`push-config.js`** (gitignored) — holds two values, both intentionally public:
- `PUSH_SERVER_URL` — Cloudflare Worker URL (visible in JS source to every user)
- `VAPID_PUBLIC_KEY` — Cryptographic public key (Web Push spec: designed to be public)

**`wrangler secret`** (never touches repo):
- `VAPID_PRIVATE_KEY` — The ONLY real secret. Set via `wrangler secret put`.
- `VAPID_EMAIL` — Contact email for VAPID authentication

**Why VAPID_PUBLIC_KEY is safe in the repo:**
It's a public key (like an SSH public key). Every Web Push tutorial puts it in the
client-side code. The security of Web Push relies on the private key, which never
leaves Cloudflare's secret store.

### How to set up (Manual Steps)

#### 1. Create Cloudflare Account
1. Go to https://dash.cloudflare.com/sign-up
2. Sign up with email (free plan — no credit card required)
3. Verify email, log into dashboard

#### 2. Install Wrangler CLI
```bash
npm install -g wrangler
```

#### 3. Login to Cloudflare
```bash
wrangler login
# Opens browser — authorize access
```

#### 4. Create KV Namespace
```bash
cd push-worker
npx wrangler kv:namespace create PUSH_KV
```
Copy the returned ID — paste into `push-worker/wrangler.toml`:
```toml
[[kv_namespaces]]
binding = "PUSH_KV"
id = "the-copied-id"
```

#### 4.5 Create Queue for Delayed Notifications
```bash
npx wrangler queues create rest-timers
```

#### 5. Generate VAPID Keys
```bash
npx web-push generate-vapid-keys
```
Output:
```
Public Key: BGs...
Private Key: ...
```

#### 6. Set Secrets in Cloudflare
```bash
npx wrangler secret put VAPID_PRIVATE_KEY    # paste the private key
npx wrangler secret put VAPID_PUBLIC_KEY     # paste the public key too (Worker needs it for web-push)
npx wrangler secret put VAPID_EMAIL          # mailto:your@email.com
```

#### 7. Deploy the Worker
```bash
npm install
npx wrangler deploy
```
Output includes the worker URL, e.g. `https://pedro-push.<subdomain>.workers.dev`

#### 8. Update push-config.js with real values
Edit `push-config.js` (in project root):
```js
const PUSH_SERVER_URL = 'https://pedro-push.<subdomain>.workers.dev'
const VAPID_PUBLIC_KEY = 'BGs...'  // same public key from step 5
```

### How the Notifications Flow Works

1. User taps ⌚ button on Today screen → requests Notification permission
2. If granted → `subscribePush()` calls `PushManager.subscribe()` with VAPID public key
3. Subscription JSON (`{ endpoint, keys: { p256dh, auth } }`) → POST to Worker `/subscribe` → stored in KV
4. When warmup completes / exercise logged / workout finishes → `sendPushNotification()` → POST to Worker `/send`
5. Worker reads subscription from KV → encrypts payload with public key → sends to push service (Apple/Google)
6. Push service delivers to device → Service Worker `push` event fires → `showNotification()`
7. On iOS: notification appears in Notification Center → Settings → can mirror to Apple Watch

### How to Rollback / Remove Everything

#### Revert all file changes:
```bash
git checkout -- sw.js app.js views/today.js views/you.js storage.js index.html
rm -rf push-worker/ push-config.js push-config.example.js .gitignore
```

#### Additional cleanup:
- Delete the Worker: `npx wrangler delete`
- Delete KV namespace via Cloudflare dashboard
- Restore `.gitignore` if it existed before (delete it if it didn't)

#### Or restore from backup:
```bash
cp sw.js.bak sw.js && cp app.js.bak app.js && cp views/today.js.bak views/today.js && cp views/you.js.bak views/you.js && cp storage.js.bak storage.js
```

### Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| Push not arriving | VAPID keys mismatch | Public key in `push-config.js` must match the one in `wrangler secret put VAPID_PUBLIC_KEY` |
| 404 on subscribe | Worker URL wrong | Check `PUSH_SERVER_URL` in `push-config.js`; run `wrangler deploy` again |
| 403 on subscribe | KV not bound | Verify `kv_namespaces` ID in `wrangler.toml` |
| Subscription expired | Push service cleaned up endpoint | Worker auto-deletes expired subs (410 response) |
| Not working on Watch | iOS needs at least one push while backgrounded | Open app, trigger ⌚, close PWA, then check Watch settings |
| "No se pudo activar" toast | push-config.js not configured | Fill in `PUSH_SERVER_URL` and `VAPID_PUBLIC_KEY` |

## AI Import (Cloudflare Workers AI)

Added 2026-05-30. User pastes a plain-text routine in the You screen → sent to Cloudflare Worker → Workers AI → JSON → app auto-creates exercises + program.

### Architecture
```
you.js textarea → importWithAI(text)
                       ↓
                fetch(POST /api/ai/import)
                       ↓
              Cloudflare Worker (same as push)
                       ↓
              Llama 3.1 8B (Cloudflare Workers AI, free tier)
                       ↓
              JSON { program_name, weeks[...days[...exercises[...]]] }
                       ↓
              findOrCreateExerciseByName() for each exercise
                       ↓
              Storage.saveProgram() → auto-activate
```

### Files Created
| File | Purpose |
|---|---|
| `data/ai-prompt.js` | `AI_SYSTEM_PROMPT` system instruction for Gemini + `buildAIDictionary()` to extract a lightweight subset of the exercise dictionary |

### Files Modified
| File | Change |
|---|---|
| `push-worker/src/index.js` | Added `POST /api/ai/import` route — receives `{ text, systemPrompt, dictionary }`, calls `env.AI.run('@cf/meta/llama-3.1-8b-instruct-fast')`, returns parsed JSON |
| `app.js` | Added `importWithAI(text)` — sends to Worker, resolves exercises via `findOrCreateExerciseByName()`, builds and saves program |
| `views/you.js` | Added "Importar con IA" section in Datos tab (above Importar) with textarea + button + status |
| `index.html` | Added `<script src="data/ai-prompt.js">` after exercise-dictionary.js |
| `AGENTS.md` | This documentation |

### Data Flow
1. User pastes routine in You → Datos → "Importar con IA" section
2. Clicks "Importar con IA"
3. `importWithAI(text)` bundles `{ text, systemPrompt: AI_SYSTEM_PROMPT, dictionary: buildAIDictionary() }`
4. POSTs to `{PUSH_SERVER_URL}/api/ai/import`
5. Worker calls `env.AI.run('@cf/meta/llama-3.1-8b-instruct-fast')` with the prompt + dictionary + user text
6. Gemini returns structured JSON with program/week/day/exercise data
7. Client iterates exercises: `Storage.findOrCreateExerciseByName(name, muscle)` for each (uses dictionary, auto-fills image/tips)
8. Builds program object from weeks/days with exerciseId references
9. `Storage.saveProgram(program)` + sets as active program
10. Toast + refresh

### Setup
No setup required. Cloudflare Workers AI is enabled by the `[ai]` binding in `wrangler.toml`.
The free tier includes 10,000 neurons/day — enough for thousands of AI imports per day.

To deploy:
```bash
cd push-worker && npx wrangler deploy
```

## Version Tracking

- `APP_VERSION` in `app.js` is a static string (e.g. `v1.1 · 2026-06-03`), NOT a runtime date.
- **`CACHE` in `sw.js` must always match the minor number** from `APP_VERSION` (e.g. v1.4 → CACHE v4). They're in sync.
- **Bump the minor version +1 with every commit** (e.g. `v1.2` → `v1.3`), not just the date. This ensures the SW update detection (`updateViaCache: 'none'` + `SKIP_WAITING` + `controllerchange` → `reload`) always triggers correctly.
- **Update the date** to match the commit date.
- **Keep the description concise** (~10 words) capturing the key changes of the current commit.
- **Update the description in `app.js`** before every commit — it must reflect the actual changes in that commit, not previous ones.
- `views/you.js` displays `APP_VERSION` from the global constant defined in `app.js` (line 201: `const ver = typeof APP_VERSION !== 'undefined' ? APP_VERSION : ''`). Only edit `app.js` to change the version.
- **Before every commit**, run `bash scripts/bump-version.sh` to bump both `app.js` minor version and `sw.js` CACHE in sync.

## Implementer Agent — Commit Policy

When the `implementer` subagent finishes its work, it MUST:
1. **Update `APP_VERSION`** in `app.js` (bump minor, update date, concise description of changes)
2. **Update `CACHE`** in `sw.js` to match the new minor version
3. **Run `bash scripts/bump-version.sh`** to automate steps 1–2 (if the script has bugs, do it manually)
4. **`git add`** all changed files (only relevant ones, no untracked docs/artifacts)
5. **`git commit`** with a descriptive message including the version
6. **Run `npm test`** (i.e. `npx playwright test`) — if it fails, fix the test. **Do NOT proceed to push until tests pass.**
7. **`git push`** — only after all tests pass

Use `git status`, `git diff`, `git log --oneline -3` before committing to verify state. Never commit untracked files outside the scope of the task (e.g. docs/, training-with-pedro/).

## ADR: Rest Timer & Delayed Notifications (Worker Queue)

**Decision:** The "⏰ Descanso terminado" notification is delivered primarily via the Cloudflare Worker Queue (`rest-timers`). The app-side `_completeRest()` uses `notifyWatch()` as a local notification fallback so the user always receives feedback, whether the Web Push succeeds or not.

**Rationale:** iOS suspends all JavaScript (setTimeout, fetch, postMessage) when the app is backgrounded. The only reliable way to deliver a notification at the exact rest duration is through a server-timed mechanism that does not depend on the app being open. However, Web Push can fail silently (expired subscription, VAPID mismatch, push service unreachable), so a local `notifyWatch()` fallback in `_completeRest()` ensures the user always gets the "Descanso terminado" notification when the app is foregrounded.

**RULES:**
1. `_completeRest()` in `app.js` shows a toast + calls `notifyWatch()` as local fallback + re-stores data in `rest-pending` cache. It MUST NOT call `sendPushNotification()` (Web Push).
2. The Worker queue (`rest-timers` via `env.REST_TIMER_QUEUE.send()`) is the PRIMARY mechanism for delivering "⏰ Descanso terminado" at the precise restSec delay, even when the app is closed.
3. `scheduleRestTimer()` in `app.js` sends `endTime - 10000` as `pushEndTime` to the Worker — the push arrives 10s before the rest period ends, giving the user a heads-up.
4. `cancelRestTimer()` in `app.js` sends POST to `/api/rest-timer/cancel` — Worker sets a KV cancel flag so the queue skips delivery.

### Exact Flow

```
detail.js [⚡ Iniciar]
  │
  ├── 1. Store { name, restSec, sets, reps, exerciseId } in Cache API (rest-pending)
  │
  ├── 2. sendPushNotification(exercise.name, "4×8-10 · Tap para iniciar descanso", tag)
  │       │
  │       ├── Writes to push-pending cache (SW reads on empty push)
  │       └── POST /api/push/send { deviceId }
  │             └── Worker sends EMPTY push (VAPID auth only, Content-Length: 0)
  │                   └── SW push event → reads push-pending cache → showNotification()
  │
  ├── 3. SI sendPushNotification() falla:
  │       ├── subscribePush() refresca suscripción (unsubscribe + subscribe fresco)
  │       ├── Reintenta sendPushNotification()
  │       └── Si aún falla → notifyWatch() → postMessage → SW → showNotification()
  │
  └── Notification appears on device (even if app closed)

User TAPS notification
  │
  ├── SW notificationclick → stores `/from-notification` flag in rest-pending cache
  └── clients.openWindow('./') → app loads

_checkPendingRest() on init/visibilitychange/focus
  │
  ├── Reads `/from-notification` flag from rest-pending cache
  ├── Reads exercise data from rest-pending cache
  ├── Calls scheduleRestTimer(name, restSec, tag, sets, reps, exerciseId)
  │       │
  │       ├── Stores endTime = Date.now() + restSec*1000 in rest-timer cache
  │       ├── POST /api/rest-timer/start { endTime, pushEndTime: endTime - 10000, deviceId, tag, title, body, exerciseId, sets, reps, restSec }
  │       │     └── Worker: delaySec = Math.ceil((pushEndTime - now) / 1000)
  │       │           └── env.REST_TIMER_QUEUE.send({ ... }, { delaySeconds: delaySec })
  │       │           └── Push arrives ~10s BEFORE rest ends, user knows it's almost done
  │       │
  │       └── setTimeout(_checkRestTimer, restSec*1000 + 2000)  ← app-side timer (only for UI banner)

App-side timer expires (if app is open)
  │
  └── _checkRestTimer() → _completeRest()
        │
        ├── _hideRestTimerBanner()
        ├── showToast("⏰ Press Banca — Descanso terminado")
        ├── notifyWatch("⏰ Press Banca", "Descanso terminado — Tap para iniciar")  ← fallback local
        └── Re-store { name, restSec, sets, reps, exerciseId } in rest-pending cache for next cycle

Worker queue fires (delaySec seconds, push ~10s before rest ends)
  │
  ├── Checks KV for cancel_{tag} — skips if cancelled
  ├── Reads subscription from KV: sub_{deviceId}
  └── sendWebPush(sub, { title: "⏰ Press Banca", body: "Descanso terminado — Tap para iniciar", tag, exerciseData })
        │
        └── SW push event → showNotification("⏰ Press Banca · Descanso terminado")
              │
              ├── Arrives even if app is closed/backgrounded ← CRITICAL
              └── User taps → notificationclick → stores `/from-notification` + opens app → next cycle

```

### Error Recovery (v1.70)

If the push service returns a 410 (expired subscription), the Worker:
- Deletes the expired subscription from KV
- Returns 410 to the client
- Client calls `subscribePush()` with fresh `unsubscribe()` + `subscribe()` cycle
- Retries `sendPushNotification()`

If all Web Push attempts fail:
- `notifyWatch()` sends a local notification via postMessage → SW → `showNotification()`
- Works only when the app is alive/SW active, but covers the foreground case

### Cancel Flow

```
User taps banner "X" or timer completes → cancelRestTimer(tag)
  │
  ├── Clears rest-timer cache + rest-pending cache
  └── POST /api/rest-timer/cancel { tag, deviceId }
        └── Worker: KV.put(`cancel_${tag}`, '1', { expirationTtl: 3600 })
              └── Queue handler skips delivery if cancel flag exists
```

### Key Points
- The Worker queue delivers at EXACTLY the scheduled delay — iOS cannot interfere because the push goes through Apple's push service
- The push arrives **10s before** the rest period ends (`pushEndTime = endTime - 10000`), so the user sees "Descanso terminado" right when the rest finishes
- The app-side setTimeout is ONLY for the UI countdown banner and toast; it is NOT the delivery mechanism
- If the app is closed when the timer expires: only the push arrives (no toast), which is correct
- If the app is open: toast + push both arrive (toast is immediate, push may have slight network delay)
- On visibilitychange to visible, `_checkRestTimer()` recovers pending timers from Cache API for UI recovery
- `scheduleRestTimer()` calls BOTH the Worker queue AND starts setTimeout — removing either breaks the system
- `subscribePush()` always calls `unsubscribe()` before `subscribe()` to replace expired endpoints
- `notifyWatch()` in `_completeRest()` was added (v1.70) because the Worker queue alone was insufficient — Web Push can fail silently

### Files
| File | Lines | Role |
|---|---|---|
| `app.js` | `scheduleRestTimer()` | Stores endTime in cache, POSTs to Worker queue with pushEndTime, starts app-side setTimeout |
| `app.js` | `_checkRestTimer()` | Reads Cache API, calculates remaining, triggers `_completeRest()` |
| `app.js` | `_completeRest()` | Toast + `notifyWatch()` fallback + re-store |
| `app.js` | `_checkPendingRest()` | Detects notification tap, starts new rest cycle via `scheduleRestTimer()` |
| `app.js` | `cancelRestTimer()` | Clears cache, POSTs cancel to Worker |
| `app.js` | `subscribePush()` | Always unsubscribes before subscribe to refresh expired endpoints |
| `sw.js` | `notificationclick` | Stores from-notification flag, opens app |
| `push-worker/src/index.js` | `POST /api/push/send` | Sends empty push, handles 410 (deletes expired sub) |
| `push-worker/src/index.js` | `POST /api/rest-timer/start` | Schedules queue message with exact delaySeconds using pushEndTime |
| `push-worker/src/index.js` | `queue()` handler | Sends encrypted Web Push with "⏰ Descanso terminado" |
| `push-worker/src/index.js` | `POST /api/rest-timer/cancel` | Sets KV cancel flag |
| `components/detail.js` | `[⚡ Iniciar]` | Stores in cache, calls `sendPushNotification()` with notifyWatch fallback |

## Coach IA — Program Coach (Tú → Programas)

Added 2026-06-03. User can ask questions or request modifications to the active program in the Programs tab.

### Architecture
```
you.js renderPrograms() → textarea → programCoach(text, program, settings)
                                       ↓
                            fetch(POST /api/ai/program-coach)
                                       ↓
                              Cloudflare Worker + Workers AI
                                       ↓
                              JSON { program: {...} }  OR  { message: "..." }
                                       ↓
                If "program" → Storage.saveProgram() + auto-activate → refresh
                If "message" → display as coach response card
```

### Files Modified
| File | Change |
|---|---|
| `data/ai-prompt.js` | Added `AI_PROGRAM_COACH_PROMPT` system prompt |
| `push-worker/src/index.js` | Added `POST /api/ai/program-coach` endpoint |
| `app.js` | Added `programCoach()` function |
| `views/you.js` | Added Coach IA textarea + response card in `renderPrograms()` |

### How it works
1. User types a question or modification (e.g. "Cambia press banca por press inclinado", "¿Está balanceada mi rutina?")
2. Sends current program (with exercise names resolved), user profile, and dictionary to Worker
3. AI decides: if modification → return JSON program; if question → return text
4. Client detects JSON → creates new program + activates it; text → shows response

## Coach IA — Exercise Coach (per-exercise chat)

Added 2026-06-03. Floating "Coach IA" button (FAB) in the exercise detail bottom sheet opens a multi-turn chat.

### Architecture
```
detail.js → Coach FAB → openCoachChat(exercise)
                            ↓
                   Chat overlay (full-screen, fixed)
                            ↓
                   User types / quick chips
                            ↓
                exerciseCoachChat(name, muscle, alts, messages)
                            ↓
                fetch(POST /api/ai/exercise-coach)
                            ↓
                   Cloudflare Worker + Workers AI
                            ↓
                { reply: "..." } → appended to chat
```

### Files Modified
| File | Change |
|---|---|
| `data/ai-prompt.js` | Added `AI_EXERCISE_COACH_PROMPT` (also embedded in Worker as fallback) |
| `push-worker/src/index.js` | Added `POST /api/ai/exercise-coach` endpoint |
| `app.js` | Added `exerciseCoachChat()` function |
| `components/detail.js` | Added FAB button + full chat overlay + `openCoachChat()` |
| `styles.css` | Added `@keyframes coachBlink` for typing dots |

### How it works
1. User taps "Coach IA" FAB in exercise detail sheet
2. Chat overlay opens with greeting, quick chips (Mejorar técnica, Me duele algo, ¿Voy muy pesado?, Variante fácil)
3. "Me duele algo" → shows body-part picker based on exercise muscle group
4. Messages sent to Worker with full conversation history + exercise context
5. AI replies with coaching advice in Mexican Spanish
6. Multi-turn: maintains thread for follow-up questions

### Data sent to Worker
Only exercise name, muscle, alternatives list, and message history — NO user profile data.
