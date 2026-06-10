# Today Screen Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace lists in Today screen with PhaseCards + Play buttons → full-screen detail with GIFs + swipe

**Architecture:** 4 files modified (ui.js → Sheet full-screen; warmup.js → full-screen + GIF + swipe + cleanup; detail.js → hero + swipe; today.js → PhaseCards, Fase 02 Play button, remove dead code)

**Tech Stack:** Vanilla HTML/CSS/JS, no build step, no tests

---

### Task 1: Sheet full-screen (ui.js)

**Files:**
- Modify: `components/ui.js:114-142`

- [ ] **Step 1: Change max-height from 92% to 98%**

In `Sheet()` function (line 124), change:
```
max-height:92%
```
to:
```
max-height:98%
```

- [ ] **Step 2: Reduce border-radius from 28px to 16px**

Same line, change:
```
border-radius:28px 28px 0 0
```
to:
```
border-radius:16px 16px 0 0
```

- [ ] **Step 3: Add close button (✕) in top-right corner**

After the handle element (after `sheet.appendChild(handle)` on line 127), insert:
```js
const closeBtn = document.createElement('button')
closeBtn.style.cssText = 'position:absolute;top:12px;right:14px;width:32px;height:32px;border-radius:50%;border:0.5px solid rgba(255,255,255,0.1);background:rgba(0,0,0,0.45);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:110;padding:0;color:rgba(255,255,255,0.75)'
closeBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 2l10 10M12 2L2 12"/></svg>'
closeBtn.addEventListener('click', (e) => { e.stopPropagation(); cleanup(); onClose() })
sheet.style.position = 'relative'
sheet.appendChild(closeBtn)
```

- [ ] **Step 4: Verify changes are consistent**

Re-read `components/ui.js:114-142` to confirm all 3 changes are in place.

---

### Task 2: warmup.js — full-screen + GIF + swipe + cleanup

**Files:**
- Modify: `components/warmup.js:188-324`

- [ ] **Step 1: Change sheet to full-screen (98% height, 16px border-radius)**

In `mountWarmupDetail()`, line 200, change:
```
max-height:92%;border-radius:28px 28px 0 0
```
to:
```
max-height:98%;border-radius:16px 16px 0 0
```

- [ ] **Step 2: Set sheet position to relative and add close button**

After the handle element (after `sheet.appendChild(handle)` on line 204), add:
```js
sheet.style.position = 'relative'
const closeBtn = document.createElement('button')
closeBtn.style.cssText = 'position:absolute;top:12px;right:14px;width:32px;height:32px;border-radius:50%;border:0.5px solid rgba(255,255,255,0.1);background:rgba(0,0,0,0.45);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:110;padding:0;color:rgba(255,255,255,0.75)'
closeBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 2l10 10M12 2L2 12"/></svg>'
closeBtn.addEventListener('click', (e) => { e.stopPropagation(); close() })
sheet.appendChild(closeBtn)
```

- [ ] **Step 3: Increase hero image height from 280px to 400px**

Line 271, change:
```
height:280px
```
to:
```
height:400px
```

- [ ] **Step 4: Convert hero image to use GIF with crossfade (like detail.js)**

Replace lines 273-277 (the `if (item.imgUrl)` block):
```js
const imgLayer = document.createElement('div')
imgLayer.style.cssText = 'position:absolute;inset:0;transition:opacity .35s;pointer-events:none'
if (item.imgUrl) imgLayer.style.background = `#161616 url(${item.imgUrl}) center/cover no-repeat`
else imgLayer.style.display = 'none'

const gifLayer = document.createElement('div')
gifLayer.style.cssText = 'position:absolute;inset:0;transition:opacity .35s;pointer-events:none'
const gifUrl = item.gifUrl || ''
if (gifUrl) {
  const gifImg = document.createElement('img')
  gifImg.src = gifUrl
  gifImg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;user-select:none'
  gifLayer.appendChild(gifImg)
} else gifLayer.style.display = 'none'

let showGif = false
gifLayer.style.opacity = '0'
imgLayer.style.opacity = '1'
hero.appendChild(imgLayer)
hero.appendChild(gifLayer)

if (item.imgUrl && gifUrl) {
  const togglePill = document.createElement('button')
  togglePill.style.cssText = 'position:absolute;top:10px;right:10px;z-index:5;width:32px;height:32px;border-radius:50%;border:0.5px solid rgba(255,255,255,0.1);background:rgba(0,0,0,0.45);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0'
  togglePill.style.cssText += ';color:rgba(255,255,255,0.75)'
  togglePill.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6"/><path d="M2.5 12a9 9 0 0 1 15.5-5L21.5 8"/><path d="M2.5 22v-6h6"/><path d="M21.5 12a9 9 0 0 1-15.5 5L2.5 16"/></svg>'
  togglePill.addEventListener('click', (e) => {
    e.stopPropagation()
    showGif = !showGif
    gifLayer.style.opacity = showGif ? '1' : '0'
    imgLayer.style.opacity = showGif ? '0' : '1'
  })
  hero.appendChild(togglePill)
}
```

- [ ] **Step 5: Add GIF URL mapping using EX_GIF_BASE**

After the `const total = items.length` (line 214) and before the `close()` function, add a GIF resolution helper:
```js
function resolveGifUrl(name) {
  const gifName = {
    'Flexiones Dinámicas Excéntricas contra Pared': 'Incline_Push-Up',
    'Dislocaciones de Pecho y Hombro con Banda': 'Shoulder_Dislocates',
    'Giros Externos con Banda Dinámicos': 'External_Shoulder_Rotation',
    'Movilidad Escapular en Y-T-W': 'Y-T-W_Shoulder_Mobility',
    'Flexiones en Diamante sobre Pared': 'Diamond_Push-Up_(Against_Wall)',
    'Extensiones de Codo al Aire Activas': 'Overhead_Triceps_Extension',
    'Flexiones de Bíceps Dinámicas con Rotación': 'Bicep_Curls_(Dynamic)',
    'Rotaciones de Brazo Completo (Tornillo)': 'Shoulder_Circles',
    'Gato-Camello Dinámico': 'Cat-Cow_Stretch',
    'Oruga Walkout Dinámica': 'Inchworm',
    'Deslizamientos en Pared (Wall Angels)': 'Wall_Angels',
    'Desplazamiento Escapular de Pie': 'Scapular_Push-Up',
    'Transición de Plancha Alta a Perro Boca Abajo': 'Downward-Facing_Dog_to_Plank',
    'Inclinaciones Laterales en Flecha': 'Side_Bends_(Standing)',
    'Encogimientos Escapulares Dinámicos': 'Shoulder_Shrugs',
    'Depresiones Escapulares Activas de Pie': 'Scapular_Retraction',
    'Sentadillas Libres a Ritmo Controlado': 'Bodyweight_Squat',
    'Desplantes Inversos Dinámicos': 'Reverse_Lunge',
    'Buenos Días Dinámicos con Manos en Nuca': 'Good_Morning_(Bodyweight)',
    'Patadas Frankenstein Dinámicas': 'Frankenstein_Walk',
    'Puentes de Glúteo Dinámicos con Pausa': 'Glute_Bridge',
    'Patadas Hidrantes en Cuadrupedia': 'Fire_Hydrant',
    'Saltos Cortos sobre Metatarsos (Pogo Hops)': 'Pogo_Jump',
    'Elevaciones de Talón de Pie Continuas': 'Standing_Calf_Raises',
    'Círculos de Brazos': 'Arm_Circles',
    'Rotación de Tronco': 'Torso_Rotation',
    'Estiramiento de Gato': 'Cat_Stretch',
    'Oruga': 'Inchworm',
    'Zancada con Giro': 'Crossover_Reverse_Lunge',
    'Estocadas Divididas': 'Split_Squats',
    'Mejor Estiramiento del Mundo': 'Worlds_Greatest_Stretch',
    'Abrazo de Rodillas al Pecho': 'Hug_Knees_To_Chest',
    'Postura de Niño': 'Childs_Pose',
    'Espinal Acostado': 'Spinal_Stretch',
    'Media Langosta': 'One_Half_Locust',
    'Superman': 'Superman',
    'Estiramiento de Pecho en Esquina de Pared': 'Chest_Stretch_at_Wall',
    'Estiramiento Un Brazo Contra Pared': 'Chest_Stretch_at_Doorway',
    'Apertura de Pecho Pasiva en Espaldera': 'Chest_Stretch_(Arms_Back)',
    'Estiramiento del Deltoides Posterior Cruzado': 'Cross_Body_Shoulder_Stretch',
    'Estiramiento del Deltoides Anterior Sentado': 'Shoulder_Stretch_(Seated)',
    'Tracción Escapular Colgado': 'Scapular_Hang',
    'Estiramiento de Tríceps por Detrás de la Cabeza': 'Overhead_Triceps_Stretch',
    'Elongación de Tríceps contra Pared': 'Triceps_Stretch_at_Wall',
    'Tríceps Apoyado en Barra Alta': 'Triceps_Stretch_(Overhead)',
    'Estiramiento de Bíceps en Pared con Pulgar Abajo': 'Bicep_Stretch_at_Wall',
    'Estiramiento de Bíceps Sentado con Manos Atrás': 'Bicep_Stretch_(Seated)',
    'Bícep Invertido en Barra Baja': 'Bicep_Stretch_(Low_Bar)',
    'Postura del Niño con Enfoque Lumbar': 'Childs_Pose',
    'Torsión Espinal en el Suelo Estática': 'Spinal_Twist_(Supine)',
    'Colgado Asistido Descompresivo': 'Dead_Hang',
    'Estiramiento del Enhebrado de Aguja': 'Thread_the_Needle',
    'Estiramiento de Espalda Media con Brazos Cruzados al Frente': 'Upper_Back_Stretch_(Crossed_Arms)',
    'Tracción Escapular con Pies Apoyados': 'Scapular_Retraction_Hang',
    'Estiramiento Lateral del Dorsal en Pared': 'Lat_Stretch_at_Wall',
    'Postura de Cachorro con Codos Apoyados': 'Puppy_Pose',
    'Dorsales Inclinado en Barra Media': 'Lat_Stretch_(Mid_Bar)',
    'Estiramiento del Trapecio Superior Asistido': 'Upper_Trap_Stretch',
    'Estiramiento de Trapecio Medio Cruzando Hombros': 'Mid_Trap_Stretch',
    'Trapecio Superior por Inclinación Lateral': 'Upper_Trap_Stretch_(Lateral)',
    'Estiramiento de Cuádriceps Acostado Boca Abajo': 'Quad_Stretch_(Prone)',
    'Estiramiento de Cuádriceps Clásico de Pie': 'Quad_Stretch_(Standing)',
    'Couch Stretch Asistido': 'Couch_Stretch',
    'Estiramiento de Isquiotibiales con Banda en Suelo': 'Hamstring_Stretch_with_Band',
    'Estiramiento Isquiotibial Unilateral en Banco': 'Hamstring_Stretch_(Bench)',
    'Femoral Elevado en Barra Media': 'Hamstring_Stretch_(Mid_Bar)',
    'Figura 4 Acostado Boca Arriba': 'Figure_4_Stretch_(Supine)',
    'Postura de la Paloma Pasiva en Suelo': 'Pigeon_Pose',
    'Figura 4 de Pie con Sentadilla Asistida': 'Figure_4_Stretch_(Standing)',
    'Estiramiento de Gemelo en Escalón Pasivo': 'Calf_Stretch_on_Step',
    'Estiramiento de Gemelo contra Pared con Pierna Recta': 'Calf_Stretch_at_Wall',
  }[name]
  return gifName ? _GIF(gifName) : ''
}
```

Then in the `render()` function, set `gifUrl` on each item before rendering. After `const item = items[_idx]` (line 224), add:
```js
item.gifUrl = resolveGifUrl(item.name)
```

- [ ] **Step 6: Add swipe gesture support**

After the `render()` function and before the initial `render()` call, add:
```js
function initSwipe(el) {
  let startX = 0, startY = 0
  el.addEventListener('touchstart', (e) => {
    const t = e.touches[0]
    startX = t.clientX
    startY = t.clientY
  }, { passive: true })
  el.addEventListener('touchend', (e) => {
    const t = e.changedTouches[0]
    const dx = t.clientX - startX
    const dy = t.clientY - startY
    if (Math.abs(dx) < 50) return
    if (Math.abs(dy) > Math.abs(dx) * 0.7) return
    if (dx < 0 && _idx < total - 1) { _idx++; render(); initSwipe(body) }
    if (dx > 0 && _idx > 0) { _idx--; render(); initSwipe(body) }
  }, { passive: true })
}
```

Then at the end of `render()`, after all content is appended to `body`, add:
```js
initSwipe(body)
```

- [ ] **Step 7: Remove unused functions**

Delete these functions entirely from the file:
- `makeCheckableRow()` (lines 33-94)
- `makePanelContent()` (lines 96-177)
- `WarmupPanelContent()` (lines 179-181)
- `StretchingPanelContent()` (lines 183-185)
- `GENERIC_WARMUP` array and related constants (lines 1-17) — only if not referenced elsewhere. Check: `resolvePanelItems()` in `data/warmup.js` uses `GENERIC_WARMUP_ONLY`/`GENERIC_STRETCH_ONLY`. So keep them in `data/warmup.js`. Remove only from `components/warmup.js`.

Actually, `components/warmup.js` lines 1-17 define `GENERIC_WARMUP` etc, but `data/warmup.js` already has its own `WARMUP_DATA` and `resolvePanelItems`. The `components/warmup.js` is a separate file from `data/warmup.js`. Let me verify by checking what's in each file.

The `components/warmup.js` file has its own `GENERIC_WARMUP` at lines 1-14. Check if `data/warmup.js` also has one. Looking at the grep results, `data/warmup.js` has `WARMUP_DATA` and `resolvePanelItems`. The `components/warmup.js` has `GENERIC_WARMUP`, `GENERIC_WARMUP_ONLY`, `GENERIC_STRETCH_ONLY`, `resolvePanelItems`, `makeCheckableRow`, `makePanelContent`, `WarmupPanelContent`, `StretchingPanelContent`, `mountWarmupDetail`.

Since `resolvePanelItems` is also in `data/warmup.js` and `components/warmup.js` both import/use it, let me check if the one in `components/warmup.js` is the same function or a redefinition. Looking at the file content, `components/warmup.js` defines `resolvePanelItems` at line 19. But `data/warmup.js` also exports `resolvePanelItems`. In the global script scope (no modules), they'd be redefinitions.

Let me check which `resolvePanelItems` is used in `today.js`. In `today.js` line 93-94, it calls `resolvePanelItems(warmupMuscles, 'warmup')`. Since both files would define this in global scope, whichever loads last wins. Let me check the script load order in `index.html`.

Actually, let me check which `resolvePanelItems` is the one actually used. Since I removed the checkable panel functions, `resolvePanelItems` in `components/warmup.js` is only used by `mountWarmupDetail` to resolve the items passed to it. But actually, looking at the code:

In `today.js`:
```js
const warmupItems = resolvePanelItems(warmupMuscles, 'warmup')
const stretchItems = resolvePanelItems(warmupMuscles, 'stretch')
```

And then these items are passed to `mountWarmupDetail({ items: warmupItems, ... })`.

In `mountWarmupDetail`, the `items` are already resolved — so it doesn't need `resolvePanelItems` itself.

But `today.js` imports `resolvePanelItems` from somewhere. Looking at the script load order... Actually both files define it globally. The one that loads last wins. Let me check `index.html` to see order.

I'll check this during implementation. For now, I know I need to keep `resolvePanelItems` accessible to `today.js`. If it's defined in `data/warmup.js`, I can safely remove it from `components/warmup.js`.

Let me be conservative: I'll only remove functions that are clearly unused by other files:
- `makeCheckableRow()` — only called by `makePanelContent()` in same file
- `makePanelContent()` — only called by `WarmupPanelContent()` and `StretchingPanelContent()` in same file
- `WarmupPanelContent()` — only potentially called by PhaseCard in today.js
- `StretchingPanelContent()` — same

Let me search for these usages to be sure.

I'll handle this during implementation.

---

### Task 3: detail.js — hero height + swipe

**Files:**
- Modify: `components/detail.js:118-120` (hero height) and add swipe

- [ ] **Step 1: Increase hero image height from 240px to 360px**

Line 118, change:
```js
const h = 240
```
to:
```js
const h = 360
```

- [ ] **Step 2: Add swipe gesture support**

After the `renderNavPills()` function (ends at line 102) and before `render()` function, add a swipe handler:

```js
function initSwipe(el, onLeft, onRight) {
  let startX = 0, startY = 0
  el.addEventListener('touchstart', (e) => {
    const t = e.touches[0]
    startX = t.clientX
    startY = t.clientY
  }, { passive: true })
  el.addEventListener('touchend', (e) => {
    const target = e.target
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.closest('button') || target.closest('a')) return
    const t = e.changedTouches[0]
    const dx = t.clientX - startX
    const dy = t.clientY - startY
    if (Math.abs(dx) < 50) return
    if (Math.abs(dy) > Math.abs(dx) * 0.7) return
    if (dx < 0 && onLeft) onLeft()
    if (dx > 0 && onRight) onRight()
  }, { passive: true })
}
```

In the `render()` function, after `container.appendChild(scrollEl)` (line 109), add:
```js
initSwipe(scrollEl, () => nextExercise && onNext(), () => prevExercise && onPrev())
```

---

### Task 4: today.js — PhaseCards, Play buttons, remove lists

**Files:**
- Modify: `views/today.js`

Overview: Three main changes:
1. Simplify PhaseCard: remove expand toggle, remove checkable list content, add Play button
2. Fase 02 (exercises): replace exercise list + skip btn with PhaseCard Play button
3. Remove unused functions (`createExerciseRow`)

- [ ] **Step 1: Simplify PhaseCard function**

Replace the `PhaseCard` function (lines 539-621) to remove expand behavior and list content:

```js
function PhaseCard({ kind, phase, title, subtitle, accentColor, done, onPlay, locked, movements, muscles, mode }) {
  const container = document.createElement('div')
  container.dataset.phase = kind
  const accent = accentColor

  container.style.cssText = `margin:0 20px;background:#141414;border-radius:18px;border:${done ? `0.5px solid ${accent}55` : locked ? '0.5px dashed rgba(255,255,255,0.12)' : '0.5px solid rgba(255,255,255,0.06)'};overflow:hidden;position:relative;transition:border-color 0.2s`

  if (done) {
    const stripe = document.createElement('div')
    stripe.style.cssText = `position:absolute;top:0;bottom:0;left:0;width:2px;background:${accent}`
    container.appendChild(stripe)
  }

  const headerBtn = document.createElement('button')
  headerBtn.style.cssText = 'width:100%;padding:14px 16px;background:transparent;border:0;cursor:pointer;color:inherit;text-align:left;display:flex;align-items:center;gap:12px'
  headerBtn.innerHTML = `
    <div style="width:42px;height:42px;border-radius:12px;background:${done ? `${accent}22` : 'rgba(255,255,255,0.04)'};border:${done ? `0.5px solid ${accent}44` : '0.5px solid rgba(255,255,255,0.05)'};display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all 0.2s">
      ${done ? `<svg width="18" height="14" viewBox="0 0 18 14" fill="none"><path d="M1 7l5.5 5.5L17 1.5" stroke="${accent}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>` : kind === 'warmup'
        ? `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 17.5c3.31 0 6-2.69 6-6 0-2.5-1.5-4.5-3-6-1 1.5-2 2-2 2s-1-2.5-1-5c-2 1.5-6 4-6 9 0 3.31 2.69 6 6 6z" stroke="${accent}" stroke-width="1.6" stroke-linejoin="round" fill="${accent}" fill-opacity="0.12"/></svg>`
        : `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 17c3.5-2 7-5 7-9 0-1-.5-2-1.5-3-3 2-7 4-7 9 0 1 .5 2 1.5 3z" stroke="${accent}" stroke-width="1.6" stroke-linejoin="round" fill="${accent}" fill-opacity="0.12"/><path d="M10 17c-3.5-2-7-5-7-9 0-1 .5-2 1.5-3 3 2 7 4 7 9 0 1-.5 2-1.5 3z" stroke="${accent}" stroke-width="1.6" stroke-linejoin="round" fill="${accent}" fill-opacity="0.05"/></svg>`}
    </div>
    <div style="flex:1;min-width:0">
      <div style="display:flex;align-items:baseline;gap:8px;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:1.4px;text-transform:uppercase;color:${done ? accent : locked ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.45)'};font-weight:600">
        <span>Fase ${phase}</span>
        ${done ? `<span style="color:${accent}">· Completa</span>` : locked ? `<span style="color:rgba(255,255,255,0.3)">· Bloqueada</span>` : ''}
      </div>
      <div style="margin-top:3px;font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:600;color:${locked ? 'rgba(255,255,255,0.4)' : '#fafafa'};letter-spacing:-0.3px;line-height:1.2">${title}</div>
      <div style="font-size:11.5px;color:${locked ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.5)'};margin-top:2px;white-space:nowrap">${subtitle}${movements ? ` · ${movements.length} movimientos` : ''}</div>
    </div>
    ${!done && !locked
      ? `<div style="flex-shrink:0;display:flex;align-items:center;gap:6px;padding:8px 14px;border-radius:10px;background:${accent};color:#0a0a0a;font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:700;letter-spacing:-0.1px;touch-action:manipulation">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 1l10 6-10 6V1z" fill="currentColor"/></svg>
          Iniciar
        </div>`
      : locked
        ? `<div style="flex-shrink:0;width:38px;height:38px;border-radius:11px;background:rgba(255,255,255,0.04);border:0.5px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="7" rx="1.5" stroke="rgba(255,255,255,0.45)" stroke-width="1.4"/><path d="M5 7V5a3 3 0 016 0v2" stroke="rgba(255,255,255,0.45)" stroke-width="1.4"/></svg>
          </div>`
        : ''
    }`

  if (!done && !locked && onPlay) {
    headerBtn.addEventListener('click', onPlay)
  }
  container.appendChild(headerBtn)
  return container
}
```

Then, in `mountToday()`:

- [ ] **Step 2: Update warmup PhaseCard usage**

Replace the PhaseCard call for warmup (lines 226-257) with the new simplified version — already done since we modified the function. But change the `onToggle` call to `onPlay`. The warmup card should use the same `mountWarmupDetail({...})` call but triggered by the Play button instead of toggle.

Replace (lines 226-257):
```js
section.appendChild(PhaseCard({
  kind: 'warmup',
  phase: '01',
  title: 'Calentamiento',
  subtitle: `${Math.ceil(warmupItems.length * 1.5)} min · dinámico`,
  accentColor: '#9bd1ff',
  movements: warmupItems,
  done: _phase >= 2,
  onToggle: () => { ... },
  muscles: warmupMuscles,
  mode: 'warmup',
}))
```
with:
```js
section.appendChild(PhaseCard({
  kind: 'warmup',
  phase: '01',
  title: 'Calentamiento',
  subtitle: `${Math.ceil(warmupItems.length * 1.5)} min · dinámico`,
  accentColor: '#9bd1ff',
  movements: warmupItems,
  done: _phase >= 2,
  locked: false,
  onPlay: () => {
    mountWarmupDetail({
      items: warmupItems,
      mode: 'warmup',
      accent,
      onComplete: () => {
        _phase = 2
        _phaseCardOpen = null
        persistPhase()
        refreshView()
      },
    })
  },
}))
```

- [ ] **Step 3: Update Fase 02 (Entrenamiento) — replace list with PhaseCard + Play**

Replace the entire exercise section (lines 261-328) with a simplified version. The section should show:
- Label "Fase 02 · Entrenamiento" + progress count
- If locked (warmup not done): LockedPhase
- If done (phase >= 3): done banner
- If active: PhaseCard with Play button

Replace lines 260-328 with:
```js
// ── EXERCISES ──
const exSection = document.createElement('div')
exSection.id = 'today-exercises-section'
exSection.style.paddingTop = '22px'
page.appendChild(exSection)

if (hasWarmup && _phase < 2) {
  const exLabel = document.createElement('div')
  exLabel.style.cssText = 'padding:0 20px;margin-bottom:10px;display:flex;align-items:center;gap:8px;font-family:JetBrains Mono,monospace;font-size:10px;letter-spacing:1.6px;text-transform:uppercase;color:rgba(255,255,255,0.55);font-weight:600;white-space:nowrap'
  exLabel.innerHTML = `<span style="width:4px;height:4px;border-radius:50%;background:${accent};flex-shrink:0;display:inline-block"></span><span>Fase 02 · Entrenamiento</span>`
  exSection.appendChild(exLabel)
  exSection.appendChild(LockedPhase({
    title: 'Termina el calentamiento primero',
    detail: 'Tus ejercicios aparecerán aquí cuando marques la Fase 01 como hecha.',
  }))
} else if (_phase >= 3) {
  const doneBanner = document.createElement('div')
  doneBanner.style.cssText = `margin:0 20px;background:#141414;border-radius:18px;padding:14px 16px;border:0.5px solid ${accent}55;display:flex;align-items:center;gap:12px`
  doneBanner.innerHTML = `
    <div style="width:42px;height:42px;border-radius:12px;background:${accent}22;border:0.5px solid ${accent}44;display:flex;align-items:center;justify-content:center;flex-shrink:0">
      <svg width="18" height="14" viewBox="0 0 18 14" fill="none"><path d="M1 7l5.5 5.5L17 1.5" stroke="${accent}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </div>
    <div style="font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:1.4px;text-transform:uppercase;color:${accent};font-weight:600"><span>Fase 02 · Completa</span></div>`
  exSection.appendChild(doneBanner)
} else {
  const exLabel = document.createElement('div')
  exLabel.style.cssText = 'padding:0 20px;margin-bottom:10px;display:flex;align-items:center;gap:8px;font-family:JetBrains Mono,monospace;font-size:10px;letter-spacing:1.6px;text-transform:uppercase;color:rgba(255,255,255,0.55);font-weight:600;white-space:nowrap'
  exLabel.innerHTML = `<span style="width:4px;height:4px;border-radius:50%;background:${accent};flex-shrink:0;display:inline-block"></span><span>Fase 02 · Entrenamiento</span><span style="margin-left:auto;color:rgba(255,255,255,0.4);letter-spacing:0.4px">${exDone} / ${exercisesTotal}</span>`
  exSection.appendChild(exLabel)
  const firstEx = day.exercises[0]
  const firstResolved = firstEx ? { ...firstEx, ...(exercisesById[resolveExId(firstEx.exerciseId)] || {}) } : null
  exSection.appendChild(PhaseCard({
    kind: 'training',
    phase: '02',
    title: 'Entrenamiento',
    subtitle: `${day.exercises.length} ejercicios`,
    accentColor: accent,
    movements: day.exercises,
    done: false,
    locked: false,
    onPlay: () => {
      if (firstResolved) onOpenExercise(firstResolved)
    },
  }))
}
```

- [ ] **Step 4: Update stretch PhaseCard usage**

Replace the PhaseCard call for stretch (lines 350-374) with the new simplified version:

Replace:
```js
stSection.appendChild(PhaseCard({
  kind: 'stretch',
  phase: '03',
  title: 'Estiramiento',
  subtitle: `${Math.ceil(stretchItems.length * 1.5)} min · estático`,
  accentColor: '#c89bff',
  movements: stretchItems,
  done: _phase >= 4,
  onToggle: () => {
    _stretchSheetShown = true
    mountWarmupDetail({ ... })
  },
  muscles: warmupMuscles,
  mode: 'stretch',
}))
```
with:
```js
stSection.appendChild(PhaseCard({
  kind: 'stretch',
  phase: '03',
  title: 'Estiramiento',
  subtitle: `${Math.ceil(stretchItems.length * 1.5)} min · estático`,
  accentColor: '#c89bff',
  movements: stretchItems,
  done: _phase >= 4,
  locked: false,
  onPlay: () => {
    _stretchSheetShown = true
    mountWarmupDetail({
      items: stretchItems,
      mode: 'stretch',
      accent,
      onComplete: () => {
        _phase = 4
        _phaseCardOpen = null
        persistPhase()
        refreshView()
      },
    })
  },
}))
```

- [ ] **Step 5: Remove `createExerciseRow` function**

Delete the entire `createExerciseRow` function (lines 640-690).

- [ ] **Step 6: Clean up imports and references**

Search for any remaining references to `createExerciseRow`, `makeCheckableRow`, `makePanelContent`, `WarmupPanelContent`, `StretchingPanelContent` in today.js and remove them. The `LockedPhase` and `PhaseCard` references should remain.

Also check that `resolvePanelItems` is still accessible. If today.js uses `resolvePanelItems` (line 93-94), it must be defined in another file (data/warmup.js). Verify by reading `data/warmup.js` to confirm it exports `resolvePanelItems`.

- [ ] **Step 7: Final read-through**

Re-read `views/today.js` to verify:
- No `createExerciseRow` references
- No expand/checkable list in PhaseCard (warmup/stretch)
- No skip button
- Fase 02 uses PhaseCard with Play → `onOpenExercise`
- All 3 PhaseCards use the new simplified signature
