# Module Review: Feature Components

**Files:**
- `components/chart.js` (66 lines)
- `components/detail.js` (802 lines)

**Total:** 868 lines across 2 files.

**Dependencies:** `components/ui.js` (SectionLabel, Sheet), `data/exercise-dictionary.js` (image lookup), `app.js` (exerciseCoachChat).

---

## 1. Architecture & Boundaries

This module owns two distinct concerns:

**Charts** (`chart.js`): Pure SVG generators that return HTML strings. No DOM manipulation.

**Exercise Detail** (`detail.js`): A full-featured bottom sheet component with 4 tabs (Workout, Cues, Swap, History) plus an embedded Coach AI chat overlay. Manages local state for the weight stepper, sets/reps tracking, tab switching, and chat thread.

---

## 2. Findings

### Finding FC-1: `detail.js` is the third largest file at 802 lines (Medium)

**File:** `components/detail.js`

Behind only `data/exercise-dictionary.js` (1885 lines) and `views/you.js` (1289 lines). The file contains:
- `parseRepsDefault` utility
- `mountExerciseDetail` (main render, ~608 lines)
- `openCoachChat` (chat overlay, ~186 lines)
- Module-level state: `_coachChatThread`, `_coachChatLoading`

The `mountExerciseDetail` function alone contains 5 nested render functions (`renderNavPills`, `render`, `renderWorkoutTab`, `renderCuesTab`, `renderSwapTab`, `renderHistoryTab`), each managing DOM creation, event binding, and state mutations via closure.

**Recommendation:** Split into two files — `components/detail.js` for the exercise detail sheet and `components/coach-chat.js` for the chat overlay.

---

### Finding FC-2: Module-level chat thread state leaks across exercises (Medium)

**File:** `components/detail.js:613-614`

```js
let _coachChatThread = []
let _coachChatLoading = false
```

These are module-level variables. `openCoachChat` resets `_coachChatThread = []` on line 617, but if:
1. User opens chat for Exercise A
2. Sends 3 messages (thread = 3 messages)
3. Closes chat overlay without calling any cleanup
4. Opens chat for Exercise B
5. Thread is reset to `[]` — this is actually correct because `openCoachChat` resets it

So the leak is actually handled by the reset in `openCoachChat`. However, `_coachChatLoading` could be true from a previous session if an error occurred after the flag was set but before it was reset. The `finally` block on line 789 handles this. **No issue in practice.**

---

### Finding FC-3: TikTok deep link uses Chinese app scheme (Info)

**File:** `components/detail.js:149, 163, 469, 484`

```js
const primary = `snssdk1233://search/trending?keyword=${searchUrl}`
const fallback = `tiktok://search?keyword=${searchUrl}`
```

The primary scheme `snssdk1233://` is TikTok's internal Chinese app URI scheme. On non-Chinese devices, this may fail silently or open the wrong app. The `visibilitychange` timeout pattern (lines 158-173) detects if the app took over. If not, it falls back to `tiktok://` after 350ms.

**Impact:** On most international devices, the primary scheme does nothing, and the 350ms delay is felt before the fallback fires. This is a minor UX annoyance.

**Recommendation:** Test the primary scheme on target devices. Consider using `tiktok://` directly or removing the primary scheme if `snssdk1233://` is non-functional.

---

### Finding FC-4: Weight stepper input accepts non-numeric input (Low)

**File:** `components/detail.js:388-392`

```js
input.addEventListener('input', (e) => {
  const v = e.target.value.replace(/[^0-9.]/g, '')
  pendingWeight = v === '' ? 0 : parseFloat(v)
  updateLogBtn()
})
```

The `replace(/[^0-9.]/g, '')` removes non-numeric characters but allows multiple dots (e.g., `1.2.3` → `1.23` via parseFloat). This is a minor edge case.

**Recommendation:** Use a stricter regex: `/^(\d+\.?\d*)$/`

---

### Finding FC-5: Chart components duplicate min/max and point mapping logic (Low)

**File:** `components/chart.js:1-66`

`Sparkline` (lines 1-19) and `LineChart` (lines 21-66) both:
1. Extract values from data objects (`.weight ?? .top`)
2. Compute `min`, `max`, `range`
3. Map data to `{ x, y }` coordinates
4. Build SVG path string

~60% of the logic is duplicated. LineChart adds Y-axis ticks, area fill, and date labels.

**Recommendation:** Extract a shared `buildChartPoints(data, width, height, pad)` utility that handles value extraction, min/max with breathing room, and point mapping.

---

### Finding FC-6: Sparkline returns empty string for < 2 data points (Info)

**File:** `components/chart.js:2`

```js
if (!data || data.length < 2) return ''
```

This returns an empty string, which the caller inserts as HTML. If a caller uses `innerHTML = Sparkline({...})`, the DOM receives an empty string (no-op). If a caller uses `appendChild` with a string, it throws.

**Recommendation:** Since both chart functions return strings (not DOM elements), callers must use `innerHTML` or similar. Document the return type clearly.

---

### Finding FC-7: `bodyPartsFor` doesn't cover all muscle groups (Low)

**File:** `components/detail.js:675-683`

```js
function bodyPartsFor(muscle) {
  const m = (muscle || '').toLowerCase()
  const lower = ['Rodilla', 'Cadera', 'Espalda baja', 'Tobillo', 'Isquios']
  const upperPush = ['Hombro', 'Codo', 'Muñeca', 'Pecho', 'Cuello']
  const upperPull = ['Hombro', 'Codo', 'Espalda baja', 'Muñeca', 'Cuello']
  if (/(pierna|cuád|cuad|femoral|glúteo|gluteo|pantorrilla|sóleo|soleo|isquio)/.test(m)) return lower.concat(['Hombro'])
  if (/(espalda|dorsal|trapecio|bíceps|biceps|remo)/.test(m)) return upperPull.concat(['Antebrazo'])
  return upperPush.concat(['Espalda baja'])
}
```

Muscle groups not covered by the regex:
- `"Antebrazos"` — regex doesn't match, falls to upperPush (correct-ish)
- `"Cadena Posterior"` — no match, falls to upperPush (incorrect — should be lower)
- `"Abdomen, Oblicuos"` — no match, falls to upperPush (incorrect)
- `"Pecho, Tríceps"` — no match (tríceps ≠ triceps?), falls to upperPush (correct)

**Impact:** Users asking about pain in uncategorized muscle groups get inappropriate body part suggestions (e.g., back pain → Hombro, Codo, Muñeca).

**Recommendation:** Add more regex patterns or use a fallback that covers all known `muscle` values from the dictionary. Default to lower body for unknown muscles (safety-first).

---

### Finding FC-8: Chat overlay doesn't persist across detail sheet closes (Info)

**File:** `components/detail.js:613-802`

The coach chat overlay is created in memory and destroyed when closed. The thread (`_coachChatThread`) is reset to empty array on `openCoachChat`. If a user:
1. Opens detail sheet
2. Opens coach chat, asks 3 questions
3. Closes coach chat
4. Closes detail sheet
5. Reopens detail sheet
6. Opens coach chat → history is gone

This is acceptable for a coaching chat (not a messaging app), but worth noting.

---

### Finding FC-9: No input sanitization in chat bubbles (Info)

**File:** `components/detail.js:731-738`

```js
div.innerHTML = `...${text}...`
```

The assistant's reply text is injected as `innerHTML`. In theory, if the AI response contains `<script>` or HTML, it gets rendered. In practice, the AI is prompted to return plain text, and the reply passes through `exerciseCoachChat` in `app.js` which sends/receives JSON. Risk is theoretical.

**Recommendation:** Consider `textContent` for the reply text portion, or explicitly escape HTML entities.

---

## 3. Summary

| Severity | Count | Key Issues |
|---|---|---|
| High | 0 | — |
| Medium | 2 | FC-1 (detail.js size), FC-2 (module-level state) |
| Low | 2 | FC-4 (input validation), FC-5 (chart logic duplication), FC-7 (bodyPartsFor coverage) |
| Info | 3 | FC-3 (TikTok scheme), FC-6 (return type), FC-8 (chat persistence), FC-9 (XSS surface) |

**Overall:** The Feature Components module is where most of the UI complexity lives. The Exercise Detail component is well-organized for a vanilla-JS file but overdue for a split (detail + coach chat). The charts are clean SVG generators with minor duplication. The main risk areas are the size and complexity of detail.js.
