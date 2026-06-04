# Week Streak — Racha basada en semanas

**Date:** 2026-06-04
**Status:** Approved
**Designer:** Coach Pedro AI

## Problem

The current streak (racha) measures **consecutive days** of training, where `done` and `rest` days both preserve the streak. The user wants the streak to reflect **weekly consistency**: how many consecutive weeks they've completed 5+ exercise logs, regardless of which specific days.

## Solution

Replace the day-based `computeStreak()` and `computeBestStreak()` functions with week-based versions. The calendar grid (day-level statuses, month view, detail panel) remains unchanged.

## Week definition

A week runs **Monday 00:00 to Sunday 23:59** (local time). This matches the existing `calMonday()` / `calDowMon()` helpers that convert JS Sunday=0 to Monday=0.

## New streak logic

### Count logs per week

Counts all exerciseLogs entries where `weight > 0` OR `exerciseId === '__day__'` within a Mon-Sun range.

```
function countWeekLogs(weekStart, weekEnd, logsByDate) → number
```

### computeWeekStreak(today, logsByDate)

```
1. Get the Monday of today's week (thisMonday)
2. Walk backward week by week (w = 0, 1, 2, ...)
3. For each week:
   a. Count logs in Mon-Sun range (clip end to today for partial week)
   b. If count >= 5 → increment streak
   c. Else if it's a COMPLETE past week (ended before today) → BREAK
   d. Else (partial current week with < 5) → skip, don't break
4. Return streak count
```

**Key rules:**
- Current partial week: counts toward streak only if already has 5+ logs
- Complete past week: must have 5+ logs to continue streak
- Complete past week with < 5 logs: streak breaks
- Partial week with < 5 logs: doesn't break streak, doesn't count

### computeBestWeekStreak(startDate, today, logsByDate)

Scans every week from startDate to today. Tracks consecutive weeks with 5+ logs. Records the maximum. Same reset rules: complete week with < 5 resets, partial week with < 5 does not.

## UI changes

All changes are in `components/calendar.js`:

| Element | Before | After |
|---|---|---|
| Streak number text | `42 días seguidos` | `6 semanas seguidas` |
| Best streak label | `Mejor racha: 85 días` | `Mejor racha: 12 semanas` |
| Motivational message | "Llevas X días sin fallar" | "Llevas X semanas cumpliendo" (or similar) |
| 14-day bar | Shows recent days | Unchanged |

## No changes to

- `views/history.js` — tabs, data prep, mounting, exerciseMap, logsByDate construction
- `storage.js`, `db.js`, `app.js` — no schema or data service changes
- Calendar grid (`CalCell`, `DayDetail`, month navigation) — unchanged
- `__day__` markers and "Marcar como hecho" button — unchanged

## Acceptance criteria

1. Streak shows number of **weeks**, not days
2. A week counts if it has 5+ exerciseLog entries (Mon-Sun)
3. Days of the week don't matter — any 5 logs in Mon-Sun = completed week
4. Current partial week counts toward streak if already has 5+ logs
5. Best streak scans all history weeks and finds max consecutive
6. Calendar grid visuals (done/missed/rest per day) remain unchanged
