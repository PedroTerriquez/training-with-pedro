# Training with Pedro — Project Context

## Stack
- Vanilla HTML/CSS/JS, no frameworks, no build step
- IndexedDB for all persistence (4 object stores)
- Mobile-first, dark mode only
- Static site deployable to GitHub Pages
- Entry: `index.html` (single-file SPA with hash routing)

## Project Structure
```
/index.html          → App shell, font loading, script includes
/styles.css          → CSS variables, design tokens, global styles
/app.js              → SPA router, state management, event bus, mount
/db.js               → IndexedDB open/CRUD helpers (openDB, getAll, get, put, del, getByIndex, generateId, seedIfEmpty)
/storage.js          → Data service layer (Storage object with all business logic)
/data.js             → SEED_DATA (exercises + programs + settings + RECOVERY_TIPS + day/month name constants)
/components/
  ui.js              → Chip, SectionLabel, StatBlock, ExercisePlaceholder, TabBar, Sheet
  chart.js           → Sparkline, LineChart (SVG-based)
  detail.js          → mountExerciseDetail() — bottom sheet with Workout + History tabs
/views/
  today.js           → mountToday() — auto-detects day, shows session or rest day
  plan.js            → mountPlan() — week selector + day grid
  history.js         → mountHistory() — exercise list with muscle filter + sparklines
  you.js             → mountYou() — stats, settings, exercise CRUD, program CRUD, CSV import
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
{ id: "settings", activeProgramId, currentWeekIdx, units, accentColor }
```

## Key Design Decisions
- Exercises are standalone entities — programs reference them by ID
- Programs own the per-instance sets/reps/rest for each exercise
- Duplicate exercise IDs allowed in same program (different days)
- Logs are flat exerciseLogs — no workout grouping. Each log = one weight entry for one exercise on one date
- History is computed by scanning exerciseLogs per exerciseId, sorted by date
- First launch seeds: default program + exercises from SEED_DATA, empty logs (no mock history)
- Full CRUD on exercises and programs (You screen)
- CSV import: week, day, exercise_name, muscle, sets, reps, rest_sec — auto-creates exercises by name
- User picks active program from You screen; Today/Plan use active program
- Week-day mapping: Mon=0 through Sun=6 (converted from JS's Sun=0 via (jsDay+6)%7)
- Logging weight from Today auto-creates exerciseLog entry; no "start workout" ceremony

## Screens
| Route | View | File |
|---|---|---|
| `#today` (default) | Auto-detect day, show session or rest day | views/today.js |
| `#plan` | Week tabs + day cards | views/plan.js |
| `#history` | Exercise list + muscle filter + sparklines | views/history.js |
| `#you` | Stats + settings + CRUD + CSV | views/you.js |
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
1. `init()` → `seedIfEmpty()` → `loadState()` → `renderShell()` → `renderScreen()`
2. User actions call `Storage.*` methods → IndexedDB → `refresh()` → re-render
3. `window.appRefresh()` exposed for external re-render triggers
4. Weight logging: Detail sheet → `onLog()` → `Storage.logWeight()` → append to exerciseLogs

## Prior Art
Design prototype in `training-with-pedro/project/` — use for visual reference only
The static data in SEED_DATA is for initial seeding; IndexedDB is the source of truth at runtime

## Build/Deploy
No build step. Open `index.html` directly in browser or deploy to any static host.
GitHub Pages: push repo, enable Pages from main branch, root directory.
