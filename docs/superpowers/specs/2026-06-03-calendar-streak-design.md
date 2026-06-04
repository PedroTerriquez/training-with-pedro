# Motivational Calendar + Streak ("Racha de días ejercitados")

**Date:** 2026-06-03
**Status:** Approved design

## Overview

Port the `MotivationCalendar` prototype from `training-with-pedro/calendar.jsx` to production as a vanilla DOM component. The calendar shows exercise attendance history, computes a current/best streak, and integrates into the History screen as a second tab.

## Location

- New in-page tab **"Constancia"** inside the History screen, alongside the existing **"Ejercicios"** tab
- NOT a new app-level tab bar entry — lives within the existing History view

## Data Model — No Schema Changes

`exerciseLogs` store is the single source of truth:

| Log | Meaning | Calendar status |
|---|---|---|
| `{ exerciseId: "ex-xxx", weight: 80 }` | Trained + logged weight | `done` |
| `{ exerciseId: "__day__", weight: null }` | Trained, no weight logged | `done` |
| (no log) + training day per program | Did not train | `missed` |
| (no log) + rest day per program | Scheduled rest | `rest` |

Query: one `getAll('exerciseLogs')` call → build `Map<calKey, logs[]>` in memory.

## Day Status Algorithm

```
function dayStatus(date, today, logsByDate, program, weeks, weekIdx):
  dow = (date.getDay() + 6) % 7           // 0=Mon..6=Sun
  weekDiff = round((monday(date) - monday(today)) / 7)
  wi = ((weekIdx + weekDiff) % weeks + weeks) % weeks
  day = program.weeks[wi].days[dow]
  isRest = !day || day.name === 'Descanso'
  logs = logsByDate.get(calKey(date)) || []
  hasWeight = logs.some(l => l.weight > 0)
  hasDayMark = logs.some(l => l.exerciseId === '__day__')

  if (hasWeight || hasDayMark)   return "done"
  if (date > today)               return "future"
  if (date < startDate)           return "none"
  if (isRest)                     return "rest"
  return "missed"
```

History window: 10 weeks back from today's Monday. Before that = `"none"`.

## Streak Computation

**`computeStreak(dayStatusFn, today)`:**
- If today is still-pending training → start from yesterday
- Walk backward day by day (max 800 iterations)
- Count `done` + `rest` as streak-preserving
- Break on `missed` or `none`
- Return consecutive count

**`computeBestStreak(dayStatusFn, today, startDate)`:**
- Walk from startDate to today
- Reset counter on `missed`
- Track max consecutive `done`/`rest`/`today` days

Rest days NEVER break the streak. Only `missed` days break it.

## Components

Single file: `components/calendar.js`

| Export | Purpose |
|---|---|
| `renderCalendarView(container, opts)` | Mount the full calendar into a container |
| `date helpers` | `calStripTime`, `calKey`, `calDowMon`, `calMonday`, `calAddDays`, `calDayDiff` |

### Internal visual sections

1. **Streak Hero Card** — gradient card with:
   - Flame SVG icon (from prototype)
   - Current streak number + "días seguidos"
   - Best streak ("Mejor racha: X días")
   - 14-day "don't break the chain" bar strip
   - Motivational text

2. **Month Grid** — card with:
   - Navigation arrows (prev/next month, 10-week history limit)
   - Month/year header + "X entrenamientos" count
   - DOW labels (L M X J V S D)
   - 7-column grid of `CalCell` buttons
   - Legend (Entrenado / Descanso / Faltaste / Hoy)

3. **Day Detail Panel** — card with:
   - Date label + day name
   - Status pill (Completado / Hoy·pendiente / Descanso / No fuiste / Programado / Sin datos)
   - Exercise list for that day (name, muscle, sets×reps)
   - "Marcar como hecho" button for past training days with no logs → inserts `__day__` log

### CalCell visual states

| Status | Appearance |
|---|---|
| `done` | Accent bg, accent dot, accent border |
| `today` | Accent outline, glow ring |
| `rest` | Dim text, gray dot |
| `missed` | Red outline, red text |
| `future` | Very dim text |
| `none` | Barely visible text |

## Integration into History view

- `views/history.js`: wrap current content in a container with a 2-tab in-page selector
- Tab **Ejercicios**: existing filter chips + exercise list with sparklines
- Tab **Constancia**: `renderCalendarView()` call
- Tab bar style: two buttons at top, active has underline/accent fill, matching app design language

## Edge Cases

- **Empty state**: no exercises, no programs → show empty calendar with "Crea un programa para ver tu constancia"
- **No logs yet**: all days show as scheduled (rest/future) or missed
- **Midnight boundary**: use local date via `calStripTime`, no timezone issues
- **Week rotation boundary**: program may have multiple weeks rotating; use modulo math
- **Rescheduled days**: `rescheduleOrder` only applies to current week (it's ephemeral, not persisted historically). Past dates always use base program rotation. This is an acceptable limitation — the calendar shows what was originally scheduled.
- **Program change mid-history**: use current active program; past schedule is reconstructed from current rotation. If user switches programs, past history is shown relative to the new program's rotation.

## Files Affected

| File | Change |
|---|---|
| `components/calendar.js` | **NEW** — ~280 lines |
| `views/history.js` | Modify — add in-page tab bar, wrap content |
| `index.html` | Add `<script src="components/calendar.js">` |

No changes to `storage.js`, `db.js`, `app.js`, or `styles.css`.

