# Exercise Image Resolution Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Fix all broken/mismatched exercise images via keyword-based resolution + GIF fallback, updating 68 dictionary entries and adding a runtime resolver.

**Architecture:** Add `data/image-directories.js` (500 known directories), add `resolveImageByKeywords()` + GIF fallback to `resolveExerciseMedia()`, fix 68 `_IMG()` and 5 `_GIF()` calls in the dictionary, update UI for GIF-as-image case.

**Tech Stack:** Vanilla JS, no build step, works on iPhone PWA.

---

### Task 1: Create `data/image-directories.js`

**Files:**
- Create: `data/image-directories.js`

- [ ] **Step 1: Create the file** with a `Set` containing all 500 directory names from free-exercise-db

```js
// Generated from yuhonas/free-exercise-db/contents/exercises
// 500 directories that actually exist
const FREE_EXERCISE_DIRS = new Set([
  '3_4_Sit-Up',
  '90_90_Hamstring',
  'Ab_Crunch_Machine',
  // ... all 500
])
```

- [ ] **Step 2: Write the script** that reads `/tmp/free_exercise_db_dirs.txt` and generates the JS file with proper formatting

Run: `cat /tmp/free_exercise_db_dirs.txt | wc -l` → 500

The output file should export `FREE_EXERCISE_DIRS` as a global `Set` on `window`.

- [ ] **Step 3: Add the script include** to `index.html` after `data/exercise-dictionary.js`

```html
<script src="data/image-directories.js"></script>
```

---

### Task 2: Add `resolveImageByKeywords()` + update `resolveExerciseMedia()`

**Files:**
- Modify: `data/exercise-dictionary.js` (add function, update `resolveExerciseMedia()`)

- [ ] **Step 1: Add equipment keyword mapping** and the `resolveImageByKeywords()` function before `resolveExerciseMedia()`

```js
// Equipment keyword → directory prefix mapping
const EQUIPMENT_PREFIXES = [
  { pattern: /polea|poleas|cuerda/i, prefix: 'Cable_' },
  { pattern: /mancuerna|mancuernas/i, prefix: 'Dumbbell_' },
  { pattern: /barra/i, prefix: 'Barbell_' },
  { pattern: /máquina|maquina|smith/i, prefix: 'Machine_' }, // smith uses Machine prefix too
  { pattern: /lastrada|lastradas/i, prefix: 'Weighted_' },
]

// Spanish movement → English directory name parts
const SPANISH_MOVEMENT_MAP = {
  'press': 'Press',
  'elevacion': 'Raise',
  'elevaciones': 'Raise',
  'curl': 'Curl',
  'jalon': 'Pulldown',
  'remo': 'Row',
  'extension': 'Extension',
  'sentadilla': 'Squat',
  'zancada': 'Lunge',
  'peso muerto': 'Deadlift',
  'dominada': 'Chin-Up',
  'fondo': 'Dip',
  'flexion': 'Push-Up',
  'plancha': 'Plank',
}

function resolveImageByKeywords(name) {
  if (!name) return null
  const norm = _normExercise(name)
  
  // Build candidate directory names by trying equipment prefixes + movement translation
  const candidates = []
  
  // Extract movement-related words (after stripping equipment words)
  const movementWords = norm.replace(/(polea|poleas|cuerda|mancuerna|mancuernas|barra|maquina|máquina|smith|lastrada|lastradas|con|en|de|para|por|del|la|las|los|el|un|una)\b/gi, '').trim().split(/\s+/).filter(Boolean)
  
  // Generate a snake_case candidate from movement words
  if (movementWords.length > 0) {
    const engTokens = movementWords.map(w => {
      const eng = SPANISH_MOVEMENT_MAP[w] || w.charAt(0).toUpperCase() + w.slice(1)
      return eng
    })
    candidates.push(engTokens.join('_'))
  }
  
  // Try each equipment prefix
  for (const { pattern, prefix } of EQUIPMENT_PREFIXES) {
    if (pattern.test(norm)) {
      for (const suffix of candidates) {
        const dir = prefix + suffix
        if (dir && FREE_EXERCISE_DIRS.has(dir)) return dir
      }
      // Try prefix alone + movement words (already has prefix )
    }
  }
  
  // If no equipment keyword found, try all prefixes
  if (!EQUIPMENT_PREFIXES.some(e => e.pattern.test(norm))) {
    for (const suffix of candidates) {
      for (const { prefix } of EQUIPMENT_PREFIXES) {
        const dir = prefix + suffix
        if (dir && FREE_EXERCISE_DIRS.has(dir)) return dir
      }
      // Also try without any prefix
      if (suffix && FREE_EXERCISE_DIRS.has(suffix)) return suffix
    }
  }
  
  return null
}
```

- [ ] **Step 2: Update `resolveExerciseMedia()`** to use the keyword resolver + GIF fallback

```js
function resolveExerciseMedia(exercise) {
  const entry = exercise?.dictId ? getEntryById(exercise.dictId) : null
  
  let imgUrl = exercise?.imgUrl || entry?.image || ''
  
  // If dictionary image is broken (directory not in known set), try keyword resolver
  if (imgUrl) {
    const dirMatch = imgUrl.match(/\/exercises\/(.+?)\/0\.jpg$/)
    if (dirMatch && !FREE_EXERCISE_DIRS.has(dirMatch[1])) {
      imgUrl = ''
    }
  }
  
  if (!imgUrl) {
    const keywordDir = resolveImageByKeywords(exercise?.name || '')
    if (keywordDir) {
      imgUrl = _IMG(keywordDir)
    }
  }
  
  const gifUrl = entry?.gif || getExerciseGifUrl(exercise?.name || '') || null
  
  // GIF fallback: if no imgUrl but gifUrl exists, use gifUrl as imgUrl
  if (!imgUrl && gifUrl) {
    imgUrl = gifUrl
  }
  
  return { imgUrl: imgUrl || '', gifUrl }
}
```

---

### Task 3: Fix 68 broken dictionary entries

**Files:**
- Modify: `data/exercise-dictionary.js` (update `_IMG()` calls)

Analysis of each broken entry and its correct directory:

**Pecho (Chest):**
| id | Current dir | Correct dir |
|---|---|---|
| `press-inclinado-maquina-smith` | `Smith_Machine_Incline_Bench_Press` | `Smith_Machine_Bench_Press` |
| `fondos-lastrados` | `Weighted_Dips` | `Dips_-_Chest_Version` |
| `fondos-maquina-asistida` | `Assisted_Chest_Dip_(Kneeling)` | `Dip_Machine` |

**Espalda (Back):**
| id | Current dir | Correct dir |
|---|---|---|
| `dominadas-lastradas` | `Pullups` | `Chin-Up` |
| `dominadas-asistidas-maquina` | `Machine_Assisted_Pullup` | `Band_Assisted_Pull-Up` |
| `dominadas-asistidas-neutro` | `Assisted_Chin-Up` | `Mixed_Grip_Chin` |
| `jalon-al-pecho-supino` | `Underhand_Cable_Pulldowns` | `Close-Grip_Front_Lat_Pulldown` |
| `jalon-al-pecho-polea` | `Wide-Grip_Lat_Pulldown` | `Full_Range-Of-Motion_Lat_Pulldown` |
| `jalon-amplio` | `Wide-Grip_Lat_Pulldown` | `Full_Range-Of-Motion_Lat_Pulldown` |
| `jalon-estrecho-polea` | `V-Bar_Pulldown` | `Close-Grip_Front_Lat_Pulldown` |
| `remo-t` | `T-Bar_Row_with_Handle` | `Lying_T-Bar_Row` |
| `remo-sentado-polea` | `Seated_Cable_Rows` | `Low_Pulley_Row_To_Neck` |
| `pull-over-polea` | `Straight-Arm_Pulldown` | `Cable_Deadlifts` |

**Hombros (Shoulders):**
| id | Current dir | Correct dir |
|---|---|---|
| `press-hombros-maquina` | `Machine_Shoulder_(Military)_Press` | `Machine_Shoulder_Military_Press` |
| `elevaciones-laterales-mancuernas` | `Side_Lateral_Raise` | `Dumbbell_Lateral_Raise` |
| `elevaciones-laterales-maquina` | `Machine_Shoulder_(Military)_Press` | `Machine_Lateral_Raise` |
| `elevaciones-laterales-polea` | `Cable_Seated_Lateral_Raise` | `Cable_Standing_Lateral_Raise` |
| `elevaciones-laterales-polea-detras` | `Cable_Seated_Lateral_Raise` | `Cable_Standing_Lateral_Raise` |
| `pulley-cable-lateral-raise-crossover-detras` | `Cable_Seated_Lateral_Raise` | `Cable_Standing_Lateral_Raise` |
| `elevaciones-frontales-mancuernas` | `Dumbbell_Front_Raise` | `Front_Dumbbell_Raise` |
| `pec-deck-invertido` | `Reverse_Flyes` | `Cable_Rear_Delt_Fly` |
| `pajaros-mancuernas` | `Bent_Over_Dumbbell_Reverse_Fly_With_Head_On_Bench` | `Bent_Over_Dumbbell_Rear_Delt_Raise_With_Head_On_Bench` |
| `remo-polea-unilateral` | `Seated_Cable_Rows` | `Kneeling_Single-Arm_High_Pulley_Row` |

**Bíceps:**
| id | Current dir | Correct dir |
|---|---|---|
| `curl-predicador-barra-ez` | `Preacher_Curl` | `Close-Grip_EZ_Bar_Curl` |
| `curl-bayesiano-polea` | `Standing_Biceps_Cable_Curl` | `High_Cable_Curls` |
| `curl-polea-baja-recto` | `Standing_Biceps_Cable_Curl` | `High_Cable_Curls` |
| `curl-predicador-mancuerna` *(mismatch)* | `Cable_Preacher_Curl` | `Dumbbell_Bicep_Curl` |

**Tríceps:**
| id | Current dir | Correct dir |
|---|---|---|
| `jalon-triceps-polea-barra-recta` | `Triceps_Pushdown` | `Cable_Incline_Pushdown` |
| `jalon-triceps-polea-cuerda` | `Triceps_Pushdown_-_Rope_Attachment` | `Cable_Rope_Overhead_Triceps_Extension` |
| `extension-sobre-cabeza-mancuerna` | `Seated_Triceps_Press` | `Dumbbell_One-Arm_Triceps_Extension` |
| `patada-triceps-mancuerna` | `Tricep_Dumbbell_Kickback` | `Kneeling_Cable_Triceps_Extension` |
| `patada-triceps-polea` | `Tricep_Dumbbell_Kickback` | `Kneeling_Cable_Triceps_Extension` |
| `press-triceps-maquina` | `Seated_Triceps_Press` | `Machine_Triceps_Extension` |
| `press-triceps-maquina-unilateral` | `Seated_Triceps_Press` | `Machine_Triceps_Extension` |

**Piernas (Legs):**
| id | Current dir | Correct dir |
|---|---|---|
| `sentadilla-maquina-smith` | `Smith_Machine_Squat` | `Hack_Squat` |
| `sentadilla-sissy` | `Sissy_Squat` | `Leg_Extensions` |
| `sentadilla-bulgara-cuadriceps` | `Dumbbell_Bench_Step_Up` | `Dumbbell_Squat_To_A_Bench` |
| `sentadilla-bulgara-gluteo` | `Split_Squat_with_Dumbbells` | `Elevated_Back_Lunge` |
| `zancada-inversa-mancuernas` | `Dumbbell_Lunge` | `Dumbbell_Rear_Lunge` |
| `step-ups-cajon-mancuernas` | `Dumbbell_Bench_Step_Up` | `Dumbbell_Step_Ups` |
| `peso-muerto-rumano-barra` | `Stiff-Legged_Barbell_Deadlift` | `Barbell_Deadlift` |
| `rdl-mancuernas` | `Dumbbell_Stiff_Leg_Deadlift` | `Dumbbell_Deadlift` |
| `curl-piernas-sentado` | `Seated_Leg_Curl` | `Lying_Leg_Curls` |
| `peso-muerto-sumo-barra` | `Sumo_Deadlift` | `Barbell_Deadlift` |
| `peso-muerto-hexagonal` | `Trap_Bar_Deadlift` | `Barbell_Deadlift` |

**Glúteos:**
| id | Current dir | Correct dir |
|---|---|---|
| `hip-thrust-maquina` *(mismatch)* | `Barbell_Hip_Thrust` | `Machine_Hip_Thrust` (if exists) or `Barbell_Hip_Thrust` |
| `extension-gluteo-maquina` *(mismatch)* | `Barbell_Glute_Bridge` | `Machine_Glute_Extension` (if exists) or `Barbell_Glute_Bridge` |

**Pantorrillas (Calves):**
| id | Current dir | Correct dir |
|---|---|---|
| `elevacion-pantorrillas-pie-barra` | `Standing_Barbell_Calf_Raise` | `Donkey_Calf_Raises` |
| `elevacion-pantorrillas-pie-maquina` | `Standing_Calf_Raises` | `Calf_Press_On_The_Leg_Press_Machine` |
| `elevacion-pantorrillas-sentado` | `Seated_Calf_Raise` | `Donkey_Calf_Raises` |
| `elevacion-pantorrillas-mancuerna-sentado` | `Seated_Calf_Raise` | `Seated_Calf_Raise` *(unclear)* |

**Abdomen (Core):**
| id | Current dir | Correct dir |
|---|---|---|
| `plancha` | `Plank` | `Plank` ... check if exists |
| `v-ups` | `V-Up` | `V-Up` |

**Antebrazos (Forearms):**
| id | Current dir | Correct dir |
|---|---|---|
| `curl-muneca` | `Barbell_Wrist_Curl` | `Barbell_Wrist_Curl` *(unclear)* |

**CSV-imported entries (no GIF):**
These are legacy entries that were added via CSV import. They don't have GIFs and their directories don't exist. Need to find correct directories.

| id | Current dir | Likely correct |
|---|---|---|
| `plancha-abdominal-plank` | `Plank` | `Plank` |
| `maquina-abduccion-sentada` | `Thigh_Abductor` | `Adductor` |
| `jalon-triceps-polea` | `Triceps_Pushdown` | `Cable_Incline_Pushdown` |
| `elevacion-pantorrillas` | `Standing_Calf_Raises` | `Standing_Calf_Raises` |
| `b-stance-rdl` | `Romanian_Deadlift` | `Single_Leg_Deadlift` |
| `pull-through-polea` | `Cable_Pull_Through` | `Cable_Deadlifts` |
| `dominadas-asistidas` | `Pullups` | `Band_Assisted_Pull-Up` |
| `plancha-lateral` | `Side_Bridge` | `Side_Bridge` |
| `step-ups` | `Dumbbell_Bench_Step_Up` | `Dumbbell_Step_Ups` |
| `lagartijas` | `Pushups` | `Pushups` |
| `zancada-cruzada` | `Side_Lunge` | `Side_Lunge` |
| `jalon-al-pecho` | `Wide-Grip_Lat_Pulldown` | `Full_Range-Of-Motion_Lat_Pulldown` |

Fix each entry in `data/exercise-dictionary.js` by updating the `_IMG()` call.

---

### Task 4: Fix 5 wrong GIF entries

**Files:**
- Modify: `data/exercise-dictionary.js` (update `_GIF()` calls)

| id | Current GIF | Correct GIF |
|---|---|---|
| `remo-polea-unilateral` | `delts/cable-upright-row` | `upper-back/cable-seated-row` |
| `elevaciones-laterales-polea-detras` | `delts/cable-standing-cross-over-high-reverse-fly` | `delts/cable-one-arm-lateral-raise` |
| `pulley-cable-lateral-raise-crossover-detras` | `delts/cable-standing-cross-over-high-reverse-fly` | `delts/cable-one-arm-lateral-raise` |
| `hip-thrust-maquina` | `glutes/resistance-band-hip-thrusts-on-knees-female` | `glutes/barbell-hip-thrust` |
| `extension-gluteo-maquina` | `glutes/sled-45-leg-press` | `glutes/barbell-glute-bridge` |

Fix each `_GIF()` call in the dictionary.

---

### Task 5: Update UI for GIF fallback

**Files:**
- Modify: `components/detail.js` (lines 149-179)
- Modify: `components/ui.js` (lines 41-66)

**detail.js changes:**
When `imgUrl === gifUrl` (GIF is being used as the static image):
- Set `showGif = true` by default (GIF layer visible)
- Hide the crossfade toggle button (or show it disabled)
- `imgLayer` gets the GIF as CSS background

**ui.js changes:**
When `ExercisePlaceholder()` has `imgUrl` that is a GIF:
- No change needed - the background image will display the GIF animated

---

### Task 6: Verify all entries

- [ ] **Step 1: Check no broken images remain**
  - For each of the 68 previously broken entries, verify the new `_IMG()` directory exists in `FREE_EXERCISE_DIRS`

- [ ] **Step 2: Check UI renders correctly**
  - Load the app in a browser
  - Verify exercises show correct images in detail sheet and plan view

- [ ] **Step 3: Check GIF fallback works**
  - For entries where no valid directory was found, verify the GIF shows as the primary image

---

### Task 7: Version bump + commit

**Files:**
- Modify: `app.js` (APP_VERSION)
- Modify: `sw.js` (CACHE)

- [ ] **Step 1: Run bump script**
  ```bash
  bash scripts/bump-version.sh
  ```

- [ ] **Step 2: Add and commit**
  ```bash
  git add data/image-directories.js data/exercise-dictionary.js index.html components/detail.js components/ui.js app.js sw.js
  git commit -m "feat: exercise image keyword resolver + GIF fallback (v1.X)"
  ```

- [ ] **Step 3: Run tests**
  ```bash
  npm test
  ```

- [ ] **Step 4: Push if tests pass**
  ```bash
  git push
  ```
