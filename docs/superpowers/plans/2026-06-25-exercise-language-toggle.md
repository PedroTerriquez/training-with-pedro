# Exercise Language Toggle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a setting to toggle exercise names between Spanish (`es`) and English (`en`) using the existing dictionary translations.

**Architecture:** A single helper `getExerciseDisplayName(exerciseOrName, lang)` reads `window.exerciseLang` (set during `loadState()`); it looks up the exercise by `dictId` or name in `EXERCISE_DICTIONARY` and returns the appropriate language name. All display sites call this helper instead of reading `e.name` directly.

**Tech Stack:** Vanilla JS, exercise-dictionary.js already has `es`/`en` fields on every entry.

---

### Task 1: Add `getExerciseDisplayName()` helper to exercise-dictionary.js

**Files:**
- Modify: `data/exercise-dictionary.js:1885-1889`
- Test: `data/exercise-dictionary.js:2015-2023` (window export)

- [ ] **Step 1: Add the helper function**

Insert after `getExerciseImageFromDictionary` (line 1889) and before `EQUIPMENT_RULES` (line 1892):

```js
function getExerciseDisplayName(exerciseOrName, lang) {
  lang = lang || (typeof window !== 'undefined' && window.exerciseLang) || 'es'
  const entry = exerciseOrName?.dictId
    ? getEntryById(exerciseOrName.dictId)
    : findExerciseEntry(typeof exerciseOrName === 'string' ? exerciseOrName : exerciseOrName?.name || '')
  if (entry) return lang === 'en' ? entry.en : entry.es
  if (typeof exerciseOrName === 'object' && exerciseOrName?.name) return exerciseOrName.name
  if (typeof exerciseOrName === 'string') return exerciseOrName
  return ''
}
```

- [ ] **Step 2: Export to window**

Add to the window exports block (after line 2022):
```js
window.getExerciseDisplayName = getExerciseDisplayName
```

---

### Task 2: Add `language: 'es'` to default settings

**Files:**
- Modify: `storage.js:324`

- [ ] **Step 1: Add field to default settings**

Change line 324 from:
```js
return s || { id: 'settings', ... , username: '' }
```
to include `language: 'es'`:
```js
return s || { id: 'settings', ... , username: '', language: 'es' }
```

The exact line to edit (add `language: 'es'` at the end, before closing `}`):
```
Old: ...rescheduleWeekOrder: {}, username: '' }
New: ...rescheduleWeekOrder: {}, username: '', language: 'es' }
```

---

### Task 3: Set `window.exerciseLang` on settings load

**Files:**
- Modify: `app.js:91` and `app.js:119-120`

- [ ] **Step 1: Set global in `silentRefresh`**

In the `silentRefresh` function around line 91, after `_state.settings = await Storage.getSettings()`:
```js
window.exerciseLang = _state.settings?.language || 'es'
```

- [ ] **Step 2: Set global in `loadState`**

After line 119 (`_state.settings = await Storage.getSettings()`), add:
```js
window.exerciseLang = _state.settings?.language || 'es'
```

- [ ] **Step 3: Set global in `refresh`**

After line 443 (`_state.settings = await Storage.getSettings()` in the `refresh` function), add:
```js
window.exerciseLang = _state.settings?.language || 'es'
```

---

### Task 4: Add language toggle to Ajustes rápidos in You screen

**Files:**
- Modify: `views/you.js:103` (insert row before "Instalar app")

- [ ] **Step 1: Add toggle row in quick settings**

Insert this row after the "Notificaciones" row (after line 102) and before "Instalar app" (line 103):

```js
quickCard.appendChild(row(null, 'Ejercicios', `<button id="lang-toggle-btn" style="padding:6px 12px;border-radius:8px;border:0.5px solid rgba(255,255,255,0.1);cursor:pointer;background:${settings.language === 'en' ? `${accent}22` : 'transparent'};color:${settings.language === 'en' ? accent : 'rgba(255,255,255,0.55)'};font-family:'Space Grotesk',sans-serif;font-size:12px;font-weight:600;touch-action:manipulation">${settings.language === 'en' ? 'English' : 'Español'}</button>`))
```

- [ ] **Step 2: Wire up the toggle event**

In the events block (inside `setTimeout`), add after the accent input handler or at a logical spot:

```js
const langBtn = document.getElementById('lang-toggle-btn')
if (langBtn) {
  langBtn.addEventListener('click', async () => {
    const s = await Storage.getSettings()
    s.language = s.language === 'en' ? 'es' : 'en'
    await Storage.saveSettings(s)
    if (onRefresh) onRefresh()
  })
}
```

---

### Task 5: Replace exercise name displays in `views/plan.js`

**Files:**
- Modify: `views/plan.js:355`

- [ ] **Step 1: Replace `${ex.name || 'Desconocido'}`**

Change line 355 from:
```js
<div style="...">${ex.name || 'Desconocido'}</div>
```
to:
```js
<div style="...">${getExerciseDisplayName(ex) || 'Desconocido'}</div>
```

---

### Task 6: Replace exercise name displays in `views/history.js`

**Files:**
- Modify: `views/history.js:50` and `views/history.js:120`

- [ ] **Step 1: Translate name in exercise map**

Change line 50 from:
```js
exercises.forEach(e => { exerciseMap[e.id] = { name: e.name, muscle: e.muscle } })
```
to:
```js
exercises.forEach(e => { exerciseMap[e.id] = { name: getExerciseDisplayName(e), muscle: e.muscle } })
```

- [ ] **Step 2: Replace display in list**

Change line 120 from:
```js
<div style="...">${e.name}</div>
```
to:
```js
<div style="...">${getExerciseDisplayName(e)}</div>
```

---

### Task 7: Replace exercise name displays in `components/detail.js`

**Files:**
- Modify: `components/detail.js:51`, `components/detail.js:198`, `components/detail.js:525`

- [ ] **Step 1: Nav pill name (line 51)**

Change:
```js
${exercise ? exercise.name : fallback}
```
to:
```js
${exercise ? getExerciseDisplayName(exercise) : fallback}
```

- [ ] **Step 2: Hero header (line 198)**

Change:
```js
<div style="...">${exercise.name}</div>
```
to:
```js
<div style="...">${getExerciseDisplayName(exercise)}</div>
```

- [ ] **Step 3: Alternative name (line 525)**

Change:
```js
<div style="...">${alt.name}</div>
```
to:
```js
<div style="...">${getExerciseDisplayName(alt.name)}</div>
```

---

### Task 8: Replace exercise name displays in `components/calendar.js`

**Files:**
- Modify: `components/calendar.js:214`

- [ ] **Step 1: Exercise row in day popup**

Change line 214 from:
```js
<div style="...">${e.name}</div>
```
to:
```js
<div style="...">${getExerciseDisplayName(e)}</div>
```

---

### Task 9: Replace exercise name in rest timer banner `app.js`

**Files:**
- Modify: `app.js:1193`

- [ ] **Step 1: Rest timer banner name**

Change line 1193 from:
```js
<span class="rtb-name">${data.name}</span>
```
to:
```js
<span class="rtb-name">${getExerciseDisplayName(data)}</span>
```

---

### Task 10: Add language toggle test to flow.spec.js

**Files:**
- Modify: `tests/flow.spec.js` (add `dictId` to seed exercises, add `language` to settings, add test section)

- [ ] **Step 1: Add `dictId` to each seed exercise**

In `SEED.exercises`, add `dictId` to each entry:
- Press Banca (line ~21): add `dictId: 'dict_press-banca-barra',` after `name: 'Press Banca',`
- Press Militar (line ~33): add `dictId: 'dict_press-militar-barra',` after `name: 'Press Militar',`
- Sentadilla (line ~44): add `dictId: 'dict_sentadilla-barra-back-squat',` after `name: 'Sentadilla',`
- Peso Muerto (line ~55): add `dictId: 'dict_peso-muerto-convencional',` after `name: 'Peso Muerto',`

- [ ] **Step 2: Add `language: 'es'` to seed settings**

After `rescheduleWeekOrder: {},` in `SEED.getSettings()`, add:
```
language: 'es',
```

- [ ] **Step 3: Append language toggle test at end of test**

Before the closing `})` of the test (after line 459), add:

```js
// ── Step 15: Language Toggle — Exercise Names ──
await page.evaluate(() => { location.hash = '#you' })
await page.waitForTimeout(500)

// Verify toggle exists in Spanish mode
const langBtn = page.locator('#lang-toggle-btn')
await expect(langBtn).toBeVisible()
await expect(langBtn).toContainText('Español')

// Click to switch to English
await langBtn.click()
await page.waitForTimeout(500)

// Navigate to History — exercise names should be in English
await page.evaluate(() => { location.hash = '#history' })
await page.waitForTimeout(500)
await expect(page.locator('body')).toContainText('Barbell Bench Press')
await expect(page.locator('body')).toContainText('Barbell Back Squat')

// Toggle back to Spanish
await page.evaluate(() => { location.hash = '#you' })
await page.waitForTimeout(500)
const langBtn2 = page.locator('#lang-toggle-btn')
await expect(langBtn2).toContainText('English')
await langBtn2.click()
await page.waitForTimeout(500)

// Verify Spanish names restored
await page.evaluate(() => { location.hash = '#history' })
await page.waitForTimeout(500)
await expect(page.locator('body')).toContainText('Press Banca')
```
