# dictId Media Resolution — Single Source of Truth for Exercise Images & GIFs

**Date:** 2026-06-15
**Status:** Approved
**Version:** v1.0

## Problem

Exercise images and GIFs are resolved by **name matching** against the dictionary
(`getExerciseImageFromDictionary()`, `getExerciseGifUrl()`). This is fragile:

- If a user renames an exercise, name-based lookup fails (returns `''`).
- The fallback chain is scattered across 4+ callsites in `app.js` and `plan.js`.
- `exercise-images.js` has a remote fetch to `free-exercise-db` (~13MB JSON from
  GitHub raw) as fallback — a network request that is rarely successful since the
  local dictionary already covers almost everything.

## Solution

Use `dictId` (a stable FK → dictionary entry) as the primary resolver for images
and GIFs. The chain becomes:

1. `exercise.imgUrl` — user's override (always wins)
2. `dictId` → `getEntryById()` → `entry.image` — stable dictionary link
3. `getExerciseImageFromDictionary(name)` — name-based fallback
4. Empty string (image hidden)

Same for GIFs, except no user override (no `exercise.gifUrl` field):

1. `dictId` → `getEntryById()` → `entry.gif`
2. `getExerciseGifUrl(name)` — name-based fallback
3. `null` (GIF hidden)

## Changes

### 1. `data/exercise-dictionary.js` — New functions

**`_DICT_BY_ID` Map** — built alongside `_DICT_INDEX`. Keyed by `entry.id`:

```js
const _DICT_BY_ID = (() => {
  const map = new Map()
  for (const entry of EXERCISE_DICTIONARY) {
    map.set(entry.id, entry)
  }
  return map
})()
```

**`getEntryById(dictId)`** — strips `'dict_'` prefix, looks up by id:

```js
function getEntryById(dictId) {
  if (!dictId || !dictId.startsWith('dict_')) return null
  return _DICT_BY_ID.get(dictId.slice(5)) || null
}
```

**`resolveExerciseMedia(exercise)`** — central resolver for both img + gif:

```js
function resolveExerciseMedia(exercise) {
  const entry = exercise?.dictId ? getEntryById(exercise.dictId) : null
  return {
    imgUrl: exercise?.imgUrl || entry?.image || getExerciseImageFromDictionary(exercise?.name || '') || '',
    gifUrl: entry?.gif || getExerciseGifUrl(exercise?.name || '') || null,
  }
}
```

Export:
```js
window.getEntryById = getEntryById
window.resolveExerciseMedia = resolveExerciseMedia
```

### 2. `exercise-images.js` — Remove remote fallback

Delete:
- `loadExerciseDB()` — fetch to free-exercise-db
- `findExerciseImageUrl()` — the full fallback chain (replaced by `resolveExerciseMedia`)
- `normalizeName()`, `tokenizeName()`, `matchScore()` — helpers only used by remote fallback
- `EXERCISE_DB_URL` constant

Keep:
- `getExerciseGifUrl(name)` — still used as name-based fallback inside `resolveExerciseMedia`

The file becomes ~15 lines.

### 3. `app.js` — Update 3 callsites

All three use the same pattern. Replace:

```js
// Before
imgUrl: resolved.imgUrl || getExerciseImageFromDictionary(resolved.name) || '',
gifUrl: getExerciseGifUrl(resolved.name) || null,

// After
const { imgUrl, gifUrl } = resolveExerciseMedia(resolved)
// ... spread into object
```

**Callsites:**

| Line | Context | Change |
|---|---|---|
| 288-289 | `prevExercise` in detail sheet | Use `resolveExerciseMedia(resolved)` |
| 301-302 | `nextExercise` in detail sheet | Same |
| 313-320 | `detailEx` (current exercise) | Same — replaces both `imgUrl` and `gifUrl` |

### 4. `plan.js` — Update 1 callsite

Line 349:

```js
// Before
const imgUrl = ex.imgUrl || getExerciseImageFromDictionary(ex.name || '') || ''

// After
const imgUrl = resolveExerciseMedia(ex).imgUrl
```

(GIF not used in plan cards.)

### 5. Files unchanged

- `components/detail.js:149` — uses `exercise.imgUrl` already resolved upstream
- `components/ui.js:46` — uses `imgUrl` prop already resolved upstream

## Normalization (Aplicar / Forzar)

No changes needed. The existing migration (`_assignDictIdsAndNormalize`) already
fills `imgUrl`/`gifUrl` from the dictionary if empty. The new runtime resolver
(`resolveExerciseMedia`) is orthogonal.

## Data Flow

```
Normalize (persist)
  dictEntry.image → exercise.imgUrl (stored in IndexedDB)
  dictEntry.gif → exercise.gifUrl (stored in IndexedDB)

Runtime display
  resolveExerciseMedia(exercise)
    → imgUrl: exercise.imgUrl || entry.image || getExerciseImageFromDictionary(name)
    → gifUrl: entry.gif || getExerciseGifUrl(name)
```

## Testing

- Existing tests should pass unchanged (`tests/flow.spec.js`, `tests/notifications.spec.js`)
- No new test coverage planned; pure refactor of the resolution chain
