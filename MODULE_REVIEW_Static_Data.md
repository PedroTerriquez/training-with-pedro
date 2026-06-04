# Module Review: Static Data

**Files:**
- `data/ai-prompt.js` (181 lines)
- `data/exercise-dictionary.js` (1885 lines)
- `data/warmup.js` (313+ lines)
- `data.js` (9 lines)
- `exercise-images.js` (96 lines)

**Total:** ~2,484 lines across 5 files.

**Dependencies:** None internal — all are loaded as global scripts via `<script>` tags in `index.html`.

**Depended on by:** `storage.js` (CSV import, migration), `exercise-images.js` (instant image lookup), `app.js` (AI prompts), `views/you.js` (AI import).

---

## 1. Architecture & Boundaries

This module is a **data repository with supporting utilities** — it owns:

- **Static exercise metadata** (names, translations, images, tips, alternatives)
- **AI system prompts** (4 endpoints)
- **Warmup/stretch routines** per muscle group
- **Recovery tips** for rest days
- **Remote image URL resolution** with fallback chain

**Boundary observation:** `exercise-images.js` straddles the line between data and logic. It starts with a `const EXERCISE_DB_URL` (data config) but contains fuzzy matching logic that duplicates what `exercise-dictionary.js` already has. Consider merging the fuzzy matching into a shared utility.

---

## 2. Findings

### Finding SD-1: Duplicated fuzzy matching logic (Medium)

**Files:** `data/exercise-dictionary.js:1828-1862` vs `exercise-images.js:21-47`

Two nearly identical token-based fuzzy matchers exist in separate files:

| Aspect | exercise-dictionary.js | exercise-images.js |
|---|---|---|
| Function | `findExerciseEntryFuzzy` | `matchScore` |
| Threshold | 0.5 (configurable) | 0.3 (hardcoded) |
| Token filter | min 2 chars | min 2 chars |
| Scoring | Exact=1, Substring=0.8+, TokenRatio×0.8 | Exact=1, Substring=0.8+, TokenRatio×0.8 |
| Iteration target | `_DICT_INDEX` entries | `free-exercise-db` entries |

The algorithms are structurally identical but operate on different datasets. If the fuzzy matcher is improved or fixed, both must be updated.

**Recommendation:** Extract a shared `fuzzyMatch(query, candidates, { threshold, tokenMinLength })` utility. Both callers then just provide the dataset and threshold.

---

### Finding SD-2: Eager dictionary index with no lazy alternative (Low)

**File:** `data/exercise-dictionary.js:1793-1813`

`_DICT_INDEX` is built via IIFE at module load time. For each of 122+ entries, it normalizes:
- `entry.es`
- `entry.en`  
- Each of `entry.aliases[]`

That's roughly 500+ normalized keys. At ~2-5ms, this is negligible for the data size. However, the IIFE runs regardless of whether the dictionary is ever queried.

**Impact:** None measurable at this scale. Noted for awareness.

---

### Finding SD-3: Alias collision silently suppressed (Low)

**File:** `data/exercise-dictionary.js:1802-1807`

```js
if (map.has(k)) {
  const existing = map.get(k)
  if (existing.id !== entry.id) {
    console.warn(`[exercise-dictionary] alias collision: ...`)
  }
  continue
}
```

When two entries share a normalized alias, the second is silently skipped. The `console.warn` is invisible in production. If, for example, "press hombro" aliases to both "Press Militar con Barra" and "Press Arnold Sentado", one match silently wins.

**Recommendation:** During development, surface collisions more visibly (e.g., `console.error` or a dev-only DOM warning). Document expected collision resolution (first-wins).

---

### Finding SD-4: Incomplete CSV import entries (Low)

**File:** `data/exercise-dictionary.js:1534-1778`

The last section (labeled "CSV Import (exercises (1).csv)") contains ~53 entries with:
- Empty `en: ''`
- Empty `gif: ''`
- Single-element `aliases: []`
- Redundant/similar entries to existing ones (e.g., `jalon-de-triceps-en-polea` vs `jalon-triceps-barra`)

These were likely auto-generated from a user's CSV import and never deduplicated or completed.

**Recommendation:** Audit and either merge these into the main sections with proper `en`/`gif`/`aliases` fields, or remove them. Having both `jalon-triceps-barra` and `jalon-de-triceps-en-polea` with different `tips` and `alternatives` creates confusion in the UI.

---

### Finding SD-5: Unnormalized `muscle` values across entries (Medium)

**File:** `data/exercise-dictionary.js` (multiple entries)

The `muscle` field is free text with multiple patterns:

| Pattern | Examples |
|---|---|
| Single muscle | `"Pecho"`, `"Bíceps"` |
| Sub-target | `"Pecho (Superior)"`, `"Pecho (Inferior)"`, `"Hombro (Anterior)"` |
| Compound (2 muscles) | `"Pecho, Tríceps"`, `"Isquiotibiales, Glúteos"` |
| Compound + sub | `"Cuádriceps (Aislamiento)"` |
| Compound + compound | `"Antebrazos, Trapecio, Core"` |
| Inconsistency | `"Espalda"` vs `"Dorsal"` vs `"Dorsal, Romboides"` (same muscle group) |

**Impact on filtering:** The History screen's muscle filter (`views/history.js`) likely does string matching against this field. A filter for "Espalda" won't match entries tagged "Dorsal" or "Dorsal, Romboides". A filter for "Pecho" won't match "Pecho (Superior)" without substring matching.

**Recommendation:** Add a `muscleGroup` field (canonical) alongside `muscle` (display), or enforce a controlled vocabulary. At minimum, document the filter's matching strategy (exact, substring, or token-based).

---

### Finding SD-6: Load order dependency via global variable (Low)

**File:** `data/exercise-dictionary.js:5` references `IMG_BASE` from `data/warmup.js:1`

```js
const _IMG = (p) => IMG_BASE + p + '/0.jpg'
```

`exercise-dictionary.js` uses `IMG_BASE` (defined in `warmup.js`) and `_GIF` (also in `warmup.js`). The `index.html` script order must be:

```
warmup.js → exercise-dictionary.js → ... → exercise-images.js
```

This is documented in a comment on exercise-dictionary.js line 3, but there's no runtime guard. If someone reorders the script tags, `IMG_BASE` is `undefined` and all images silently fail.

**Recommendation:** Add a runtime check at the top of exercise-dictionary.js:

```js
if (typeof IMG_BASE === 'undefined') throw new Error('warmup.js must load before exercise-dictionary.js')
```

---

### Finding SD-7: Hardcoded CDN URLs with single point of failure (Low)

**Files:** `data/warmup.js:1,6` and `exercise-images.js:1`

```js
const IMG_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/'
const EX_GIF_BASE = 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/'
const EXERCISE_DB_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json'
```

Three external CDN URLs. `EX_GIF_BASE` pins a version (`@v1.1.0`) — good. But the two `raw.githubusercontent.com` URLs point to `main` branch, which could change or become unavailable.

**Impact:** If GitHub raw is unreachable (rate limiting, outage, repo deleted), images and GIFs fail. The `findExerciseImageUrl` function in `exercise-images.js` already catches fetch errors and returns null, so it degrades gracefully — but there's no user feedback that images failed to load.

**Recommendation:** Consider adding a fallback CDN or pinning the free-exercise-db to a commit hash. The `EX_GIF_BASE` already pins — apply the same pattern to the other URLs.

---

### Finding SD-8: `buildAIDictionary` memoization never invalidated (Low)

**File:** `data/ai-prompt.js:172-180`

```js
let AI_DICTIONARY_SUBSET = null
function buildAIDictionary() {
  if (AI_DICTIONARY_SUBSET) return AI_DICTIONARY_SUBSET
  AI_DICTIONARY_SUBSET = EXERCISE_DICTIONARY.map(...)
  return AI_DICTIONARY_SUBSET
}
```

The subset is computed once and cached. If `EXERCISE_DICTIONARY` is mutated at runtime (e.g., user adds exercises via the UI), the cache is stale. In practice, `EXERCISE_DICTIONARY` is static at runtime — exercises are stored in IndexedDB, not the dictionary. So this is correct today but could surprise a future developer.

**Recommendation:** Add a comment explaining the assumption: "EXERCISE_DICTIONARY is immutable at runtime; this cache is safe."

---

### Finding SD-9: AI exercise coach prompt uses template variables (Info)

**File:** `data/ai-prompt.js:142-168`

The `AI_EXERCISE_COACH_PROMPT` contains `{exercise_name}`, `{muscle}`, `{alternatives}` placeholders. These must be replaced at the call site. For example:

```js
const prompt = AI_EXERCISE_COACH_PROMPT
  .replace('{exercise_name}', name)
  .replace('{muscle}', muscle)
  .replace('{alternatives}', JSON.stringify(alts))
```

(Verified in `app.js`: confirmed this replacement pattern exists. No issue, just documenting the dependency.)

---

### Finding SD-10: WARMUP_DATA descriptions are very verbose (Info)

**File:** `data/warmup.js`

Each warmup/stretch entry's `desc` field is 4-8 lines of detailed Spanish instructions. While this provides excellent user guidance, it makes the file large (~5KB per entry ≈ 313+ lines for ~40 entries). The data is inlined rather than fetched from a remote source.

**Impact:** None — this is a design choice. The file is loaded once at app startup and the data is used on-demand. At ~30KB the warmup data is the largest static payload.

---

### Finding SD-11: `exercise-images.js` exposes only one function to window (Info)

**File:** `exercise-images.js:96`

```js
window.getExerciseGifUrl = getExerciseGifUrl
```

But `findExerciseImageUrl` is the more comprehensive function (3-tier fallback). It's not exposed globally. If another view needs images (e.g., `detail.js`), it only gets GIF URLs via `getExerciseGifUrl`, missing the remote fallback.

**Verification needed:** Check whether `detail.js` or other components call `getExerciseGifUrl` and whether they need `findExerciseImageUrl` instead.

---

## 3. Summary

| Severity | Count | Key Issues |
|---|---|---|
| High | 0 | — |
| Medium | 2 | SD-1 (duplicated fuzzy matching), SD-5 (unnormalized muscle values) |
| Low | 6 | SD-2 (eager index), SD-3 (silent alias collision), SD-4 (incomplete CSV entries), SD-6 (load order dependency), SD-7 (single CDN point of failure), SD-8 (stale cache) |
| Info | 3 | SD-9 (template variables), SD-10 (verbose descriptions), SD-11 (partial window exposure) |

**Overall:** The Static Data module is well-structured for its no-build-step constraint. The dictionary is comprehensive (122+ exercises with translations, aliases, images, and tips). The main actionable issues are: deduplicate the fuzzy matcher, normalize muscle group values, and surface alias collisions.
