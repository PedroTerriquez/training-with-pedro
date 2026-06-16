# Exercise Image Resolution — Keyword + GIF Fallback

## Problem

64 of 159 exercise dictionary entries (40%) reference image directories that don't exist in
[yuhonas/free-exercise-db](https://github.com/yuhonas/free-exercise-db). These entries show a
broken 404 image. 4 additional entries have an equipment-type mismatch (e.g., a dumbbell exercise
shown with a cable machine photo). GIFs from [ExerciseGymGifsDB](https://github.com/JahelCuadrado/ExerciseGymGifsDB)
are generally correct.

## Solution: Hybrid Keyword Resolution + GIF Fallback

Three-layer resolution for `imgUrl`:

1. **Dictionary entry** (existing) — `entry.image` from `_IMG('directory')`
2. **Keyword-based resolver** (new) — parse exercise name → equipment + movement → best-match directory
3. **GIF fallback** (new) — use the GIF URL as the static image when no valid photo directory is found

## Components

### A. `data/image-directories.js` (new)

Exports a `Set` of all 500 directory names that actually exist in
`yuhonas/free-exercise-db/tree/main/exercises/`. Used to validate candidate matches from the
keyword resolver.

### B. `resolveImageByKeywords(name, muscle)` function

Added to `data/exercise-dictionary.js`. Algorithm:

1. **Extract equipment keyword**
   Map Spanish equipment words → English prefix:
   - `polea|poleas|cuerda` → `Cable`
   - `mancuerna|mancuernas` → `Dumbbell`
   - `barra` → `Barbell`
   - `máquina|maquina` → `Machine`
   - `smith` → `Smith`
   - `lastrada|lastradas` → `Weighted`
   (no keyword → try all equipment prefixes)

2. **Extract base movement** — Strip equipment keywords from name, then translate
   the remaining movement phrase to English.

3. **Search available directories** — Build candidate directory names
   `{Equipment}_{Movement}` and score them against the known directory list.
   Also search by token overlap (like the existing fuzzy match).

4. **Return** directory name or `null`.

### C. Update `resolveExerciseMedia()`

```
imgUrl = exercise?.imgUrl          // 1. user override
      || entry?.image              // 2. dictionary (if directory exists)
      || _IMG(resolveImageByKeywords(name, muscle))  // 3. keyword match
      || exercise?.gifUrl          // 4. GIF fallback (use GIF as static)
      || ''

gifUrl = entry?.gif                // 1. dictionary
      || getExerciseGifUrl(name)   // 2. fuzzy lookup
      || null
```

### D. Fix dictionary entries (68 total)

- 64 entries with non-existent directories → update `_IMG()` to correct directory
- 4 entries with equipment mismatch → fix `_IMG()` to correct directory
- 5 entries with wrong GIF → fix `_GIF()` to correct path

### E. UI adjustment for GIF-as-image

When `imgUrl` is the same as `gifUrl` (GIF fallback active):
- In `detail.js`: Auto-show GIF (`showGif = true`), hide the crossfade toggle since there's no separate static photo
- In `ui.js` `ExercisePlaceholder()`: Show GIF as background if no static image available

## Implementation Order

1. Create `data/image-directories.js` with the 500 existing directory names
2. Add `resolveImageByKeywords()` to `data/exercise-dictionary.js`
3. Update `resolveExerciseMedia()` with the hybrid resolution chain
4. Fix the 64+4 broken dictionary entries
5. Fix the 5 wrong GIF entries
6. Update UI components (`detail.js`, `ui.js`) for GIF fallback
7. Test: verify all dictionary entries resolve to an image
8. Bump version + commit
