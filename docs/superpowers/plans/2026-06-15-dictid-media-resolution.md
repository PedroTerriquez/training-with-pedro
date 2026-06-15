# dictId Media Resolution Implementation Plan

> **For agentic workers:** Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Centralize exercise image/GIF resolution using `dictId` as the primary FK to the dictionary, and remove the remote fallback in `exercise-images.js`.

**Architecture:** A single `resolveExerciseMedia(exercise)` function in `exercise-dictionary.js` encapsulates the chain: `imgUrl` (user) > `dictId` > name lookup. The remote fetch to free-exercise-db is deleted since the local dictionary covers everything.

**Tech Stack:** Vanilla JS, no dependencies.

---

### Task 1: Add `_DICT_BY_ID`, `getEntryById()`, `resolveExerciseMedia()` to exercise-dictionary.js

**Files:**
- Modify: `data/exercise-dictionary.js:1793-1813`
- Modify: `data/exercise-dictionary.js:1879-1885`

- [ ] **Add `_DICT_BY_ID` Map after `_DICT_INDEX`**

Insert after line 1813 (`})()`):

```js
const _DICT_BY_ID = (() => {
  const map = new Map()
  for (const entry of EXERCISE_DICTIONARY) {
    map.set(entry.id, entry)
  }
  return map
})()
```

- [ ] **Add `getEntryById()` and `resolveExerciseMedia()`**

Insert `getEntryById` after `findExerciseEntry` (after line 1823), and `resolveExerciseMedia` after `getExerciseImageFromDictionary` (after line 1877), then update exports:

```js
function getEntryById(dictId) {
  if (!dictId || !dictId.startsWith('dict_')) return null
  return _DICT_BY_ID.get(dictId.slice(5)) || null
}
```

Insert before `window.EXERCISE_DICTIONARY`:

```js
function resolveExerciseMedia(exercise) {
  const entry = exercise?.dictId ? getEntryById(exercise.dictId) : null
  return {
    imgUrl: exercise?.imgUrl || entry?.image || getExerciseImageFromDictionary(exercise?.name || '') || '',
    gifUrl: entry?.gif || getExerciseGifUrl(exercise?.name || '') || null,
  }
}
```

Then update the exports at the bottom (line 1879-1885):

```js
window.EXERCISE_DICTIONARY = EXERCISE_DICTIONARY
window.normalizeExerciseName = normalizeExerciseName
window.findExerciseEntry = findExerciseEntry
window.findExerciseEntryFuzzy = findExerciseEntryFuzzy
window.getEntryById = getEntryById
window.resolveExerciseMedia = resolveExerciseMedia
window.translateExerciseToEnglish = translateExerciseToEnglish
window.translateExerciseToSpanish = translateExerciseToSpanish
window.getExerciseImageFromDictionary = getExerciseImageFromDictionary
```

### Task 2: Simplify exercise-images.js

**Files:**
- Modify: `exercise-images.js` (full rewrite to ~15 lines)

- [ ] **Replace entire file with only `getExerciseGifUrl()`**

```js
function getExerciseGifUrl(exerciseName) {
  if (!exerciseName) return null
  const e = findExerciseEntry(exerciseName) || findExerciseEntryFuzzy(exerciseName)
  return e && e.gif ? e.gif : null
}

window.getExerciseGifUrl = getExerciseGifUrl
```

### Task 3: Update app.js — 3 callsites to use resolveExerciseMedia()

**Files:**
- Modify: `app.js:288-289` — prevExercise
- Modify: `app.js:301-302` — nextExercise
- Modify: `app.js:313-322` — detailEx

- [ ] **Update prevExercise block (lines 284-290)**

Replace:
```js
              prevExercise = {
                ...prevProgEx,
                name: resolved.name,
                muscle: resolved.muscle,
                imgUrl: resolved.imgUrl || getExerciseImageFromDictionary(resolved.name) || '',
                gifUrl: getExerciseGifUrl(resolved.name) || null,
              }
```

With:
```js
              const prevMedia = resolveExerciseMedia(resolved)
              prevExercise = {
                ...prevProgEx,
                name: resolved.name,
                muscle: resolved.muscle,
                imgUrl: prevMedia.imgUrl,
                gifUrl: prevMedia.gifUrl,
              }
```

- [ ] **Update nextExercise block (lines 297-303)**

Replace:
```js
              nextExercise = {
                ...nextProgEx,
                name: resolved.name,
                muscle: resolved.muscle,
                imgUrl: resolved.imgUrl || getExerciseImageFromDictionary(resolved.name) || '',
                gifUrl: getExerciseGifUrl(resolved.name) || null,
              }
```

With:
```js
              const nextMedia = resolveExerciseMedia(resolved)
              nextExercise = {
                ...nextProgEx,
                name: resolved.name,
                muscle: resolved.muscle,
                imgUrl: nextMedia.imgUrl,
                gifUrl: nextMedia.gifUrl,
              }
```

- [ ] **Update detailEx block (lines 313-323)**

Replace:
```js
  const gifUrl = getExerciseGifUrl(exercise.name) || null

  const detailEx = {
    ...exercise,
    sets: progEx?.sets || exercise.sets || 3,
    reps: progEx?.reps || exercise.reps || '10',
    rest: progEx?.rest || exercise.rest || 60,
    imgUrl: exercise.imgUrl || getExerciseImageFromDictionary(exercise.name) || '',
    logs: logs.sort((a, b) => a.date.localeCompare(b.date)),
    gifUrl,
  }
```

With:
```js
  const exMedia = resolveExerciseMedia(exercise)

  const detailEx = {
    ...exercise,
    sets: progEx?.sets || exercise.sets || 3,
    reps: progEx?.reps || exercise.reps || '10',
    rest: progEx?.rest || exercise.rest || 60,
    imgUrl: exMedia.imgUrl,
    logs: logs.sort((a, b) => a.date.localeCompare(b.date)),
    gifUrl: exMedia.gifUrl,
  }
```

### Task 4: Update plan.js — 1 callsite

**Files:**
- Modify: `views/plan.js:349`

- [ ] **Update plan exercise row**

Replace line 349:
```js
  const imgUrl = ex.imgUrl || (typeof getExerciseImageFromDictionary === 'function' ? getExerciseImageFromDictionary(ex.name || '') : '') || ''
```

With:
```js
  const imgUrl = resolveExerciseMedia(ex).imgUrl
```

### Task 5: Version bump + commit

- [ ] **Run bump-version script**

```bash
bash scripts/bump-version.sh
```

- [ ] **Stage all changed files**

```bash
git add data/exercise-dictionary.js exercise-images.js app.js views/plan.js
```

- [ ] **Commit**

```bash
git commit -m "feat(v1.61): dictId media resolution — resolveExerciseMedia() centralized; remove remote fallback"
```
