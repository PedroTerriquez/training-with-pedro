# Rest Timer Visible Banner

## Summary
A persistent countdown timer bar at the top of the screen that appears when the user opens the app from a rest-timer push notification. Shows exercise name, remaining time, and progress. Visible on all routes (today, plan, history, you).

## Motivation
The current rest timer only shows a brief toast (`⏱️ Xs · Press Banca`) that disappears after 3.5s. When the user taps the push notification to open the app, they want to see the timer counting down in a persistent location.

## Design

### Location
Fixed bar at the **top of the viewport**, above the screen content, below the device status bar. Same z-index category as `showToast` (z-index: 9999). Visible on every route.

### Visual Structure
```
┌──────────────────────────────────────────┐
│ ⏱️  Press Banca              1:23   ◉──── │
└──────────────────────────────────────────┘
```

| Element | Details |
|---|---|
| Left icon | `⏱️` (rest timer symbol) |
| Exercise name | From `rest-timer/pending` Cache API data |
| Center spacer | Flex-grow |
| Time remaining | `mm:ss` format, JetBrains Mono font |
| Progress ring | Small SVG circle at right, fills clockwise as timer progresses |
| Background | `--surface` (#141414), bottom border `--border` |
| Height | 52px |
| Padding | 14px horizontal |

### Flow

#### 1. App opens from notification tap
`init()` → `_checkPendingRest()` reads `rest-pending` Cache → checks `rest-timer/pending` for `endTime`:
- If `endTime > now`: `_showRestTimerBanner(data, remaining)` creates the banner at top of `_appEl`
- If expired: shows "terminado" toast + re-shows exercise notification (current behavior unchanged)

#### 2. While timer runs
- `_checkRestTimer()` fires on its existing `setTimeout` schedule
- When it detects `remaining > 0`, it updates the banner: time display + progress ring + re-schedules itself
- No duplicate banner; `_restTimerBannerEl` global tracks existence

#### 3. Timer completes
`_completeRest()` → calls `_hideRestTimerBanner()` (removes DOM element, nulls global) → then proceeds with "terminado" toast + notification re-show.

#### 4. User cancels
Tap on the banner → confirm via `cancelRestTimer(tag)` → hides banner → toast "Descanso cancelado".

#### 5. Visibility change (phone lock/unlock, app switch)
`document.visibilitychange → visible` already calls `_checkRestTimer()`. The banner update logic is the same — if timer still active, banner shows/updates. If timer completed while app was away, `_completeRest` hides banner and shows done toast.

### Components Modified

| File | Change |
|---|---|
| `app.js` | Add `_restTimerBannerEl` global, `_showRestTimerBanner()`, `_hideRestTimerBanner()`. Modify `_checkPendingRest()` to call `_showRestTimerBanner()` instead of `showToast`. Modify `_completeRest()` to call `_hideRestTimerBanner()`. Modify `_checkRestTimer()` to update the banner when `remaining > 0`. |
| `styles.css` | Add `.rest-timer-banner` styles (positioning, typography, progress ring keyframes) |

### Functions (new)

#### `_showRestTimerBanner(data, remainingMs)`
Creates a fixed top bar with:
- `<div id="rest-timer-banner">` appended to `_appEl` (not `document.body` — stays inside the app shell)
- Left: `⏱️ ${data.name}`
- Right: formatted `mm:ss` + small SVG progress ring
- Click handler: `cancelRestTimer(data.tag)` + hide banner + toast "Descanso cancelado"
- Stores `_restTimerEndTime = data.endTime` for progress calculation
- Stores `_restTimerDuration = data.restSec * 1000` for progress calculation
- Returns the banner element

#### `_hideRestTimerBanner()`
- Removes `#rest-timer-banner` if exists
- Nulls global references

#### `_updateRestTimerBanner(remainingMs)`
- Updates the `mm:ss` display
- Updates the SVG progress ring arc
- If `remainingMs <= 0`, calls `_hideRestTimerBanner()`

### Progress Ring
Small SVG circle (20×20px):
- Background arc: full gray circle (stroke: `rgba(255,255,255,0.08)`)
- Progress arc: `--accent` color, `stroke-dasharray`/`stroke-dashoffset` calculated as `1 - (remaining / total)`
- Rotated -90deg so progress starts from top
- Stroke width: 3px

### Remaining Time Format
`mm:ss` using JetBrains Mono:
```js
const m = Math.floor(sec / 60)
const s = sec % 60
display = `${m}:${String(s).padStart(2, '0')}`
```

### Cancel Behavior
Tap on banner:
1. `cancelRestTimer(data.tag)` — calls Worker to cancel the queue, clears cache
2. `_hideRestTimerBanner()`
3. `showToast("Descanso cancelado")` — brief confirmation

### Edge Cases

| Scenario | Behavior |
|---|---|
| Timer expires while app closed | Queue consumer sends "terminado" push. User taps → app opens → `_checkPendingRest` sees expired endTime → shows "terminado" toast + re-shows exercise notification. No banner. |
| Timer expires while app in background (another app) | `visibilitychange → visible` fires `_checkRestTimer()` → `remaining <= 0` → `_completeRest()` hides banner + shows done toast |
| User opens app from springboard (not notification) | `_checkPendingRest` checks `rest-pending` cache → if data exists and timer active → shows banner. If no data (no pending rest), no banner. |
| Rapid ⚡ taps | Banner shows for latest exercise. Previous timer's `cancelRestTimer` fires (from `scheduleRestTimer`). |
| Timer completed while banner was showing | `_completeRest` → `_hideRestTimerBanner()` → done toast |
| User taps banner to cancel during timer | Toast "Descanso cancelado", no further notifications for that tag |

### Non-Goals
- No changes to the Queue consumer or push notification flow
- No changes to the ⚡ button or detail sheet
- No changes to the Worker endpoints
- No changes to the SW push/notificationclick handlers
