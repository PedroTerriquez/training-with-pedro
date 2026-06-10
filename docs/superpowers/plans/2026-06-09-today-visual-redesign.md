# Today Visual Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update visual style of `views/today.js` to match reference designs in `training-with-pedro/today.jsx` and `training-with-pedro/session.jsx` — header, PhaseCards, layout, CoachCard, rest day.

**Architecture:** Single file change (`views/today.js`). Header rework (~20 lines), PhaseCard full rewrite (~80 lines), layout restructure (~15 lines), renderCoachCard rewrite (~100 lines), rest day header polish (~5 lines).

**Tech Stack:** Vanilla HTML/CSS/JS, no build step, no tests

---

### Task 1: Header — remove ProgressRing + watch-btn, add "● Hoy en el gimnasio" style

**Files:**
- Modify: `views/today.js:154-217`

- [ ] **Step 1: Remove ProgressRing import/usage**

In `views/today.js`, the header section builds `hero-rings` with both `ProgressRing()` and `TimerRing()`. Remove `ProgressRing()` call and the `today-watch-btn`. Keep only `TimerRing`.

In `render()` (around line 177-178), change:
```js
<div id="hero-rings" style="display:flex;align-items:center;gap:10px;flex-shrink:0">
  ${ProgressRing({ pct, done: doneSteps, total: totalSteps, accent })}
</div>
```
to:
```js
<div id="hero-rings" style="display:flex;align-items:center;gap:10px;flex-shrink:0"></div>
```

- [ ] **Step 2: Remove watch-btn node creation**

Remove lines 187-214 (the entire `watchBtn` creation and `ringsContainer.appendChild(watchBtn)`).

- [ ] **Step 3: Update header HTML to match reference**

Replace the header div (lines 154-162) with:
```js
const header = document.createElement('div')
header.style.padding = '56px 20px 12px'
header.innerHTML = `
  <div style="display:flex;align-items:center;gap:8px;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:1.8px;color:${accent};text-transform:uppercase;font-weight:600">
    <span style="width:6px;height:6px;border-radius:50%;background:${accent};box-shadow:0 0 8px ${accent};animation:pulse 2s infinite;display:inline-block"></span>
    Hoy en el gimnasio
  </div>
  <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin-top:7px">
    <div style="font-family:'Space Grotesk',sans-serif;font-size:42px;font-weight:700;color:#fafafa;letter-spacing:-1.8px;line-height:0.98">${day.name}</div>
    ${weekObj ? `<span class="pill" style="background:rgba(212,255,58,0.12);color:${accent};margin-bottom:4px">${weekObj.name}${weekObj.tag ? ' · ' + weekObj.tag : ''}</span>` : ''}
  </div>
  <div style="margin-top:5px;font-size:13px;color:rgba(255,255,255,0.5)">${day.subtitle || ''}</div>
  ${isRescheduled ? `<div style="display:inline-flex;align-items:center;gap:5px;margin-top:9px;padding:4px 10px;border-radius:9999px;background:${accent}18;border:0.5px solid ${accent}3a;font-family:'JetBrains Mono',monospace;font-size:9.5px;letter-spacing:0.6px;text-transform:uppercase;color:${accent};font-weight:600">↔ Reprogramado · lo de ${DAYS_LONG[originalDayIdx]}</div>` : ''}`
page.appendChild(header)
```

Note: The `isRescheduled` badge logic should remain in the header (it's currently in the hero, move it up).

- [ ] **Step 4: Move `ringsContainer` and `TimerRing` after header**

After the header, create the rings container and append TimerRing. The header and timer ring should be side by side. Actually, keep the existing flow: header → rings container (with TimerRing) → sections.

The TimerRing element should remain where it is after the header, just without ProgressRing and watch-btn.

- [ ] **Step 5: Remove `ProgressRing` function**

Delete the entire `ProgressRing` function (lines 448-466).

---

### Task 2: PhaseCard redesign — SectionCard style

**Files:**
- Modify: `views/today.js:514-562`

- [ ] **Step 1: Replace PhaseCard function**

Replace the entire `PhaseCard` function with the redesigned version that matches `SectionCard` from the reference:

```js
function PhaseCard({ kind, phase, title, subtitle, accentColor, done, onPlay, locked, movements, isNext, progress }) {
  const container = document.createElement('div')
  container.dataset.phase = kind
  const accent = accentColor

  container.style.cssText = `flex:1;min-height:0;position:relative;overflow:hidden;border-radius:22px;cursor:${done || locked ? 'default' : 'pointer'};padding:18px 18px 16px;box-sizing:border-box;background:${done ? `linear-gradient(150deg, ${accent}1f 0%, #131313 60%)` : '#141414'};border:${done ? `1px solid ${accent}` : locked ? '0.5px dashed rgba(255,255,255,0.12)' : isNext ? `1px solid ${accent}66` : '0.5px solid rgba(255,255,255,0.07)'};box-shadow:${done ? `0 0 0 4px ${accent}12, 0 10px 30px ${accent}1a` : isNext ? `0 8px 28px ${accent}12` : 'none'};display:flex;flex-direction:column;justify-content:space-between;transition:border-color 0.3s, box-shadow 0.3s, background 0.3s`

  // Watermark glyph
  const glyph = kind === 'warmup'
    ? `<svg width="150" height="150" viewBox="0 0 20 20" fill="none"><path d="M10 17.5c3.31 0 6-2.69 6-6 0-2.5-1.5-4.5-3-6-1 1.5-2 2-2 2s-1-2.5-1-5c-2 1.5-6 4-6 9 0 3.31 2.69 6 6 6z" stroke="${accent}" stroke-width="1.4" stroke-linejoin="round" fill="${accent}" fill-opacity="0.12"/></svg>`
    : kind === 'training'
    ? `<svg width="150" height="150" viewBox="0 0 20 20" fill="none"><path d="M3 7v6M5.5 5.5v9M14.5 5.5v9M17 7v6M5.5 10h9" stroke="${accent}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`
    : `<svg width="150" height="150" viewBox="0 0 20 20" fill="none"><path d="M10 17c3.5-2 7-5 7-9 0-1-.5-2-1.5-3-3 2-7 4-7 9 0 1 .5 2 1.5 3z" stroke="${accent}" stroke-width="1.4" stroke-linejoin="round" fill="${accent}" fill-opacity="0.12"/><path d="M10 17c-3.5-2-7-5-7-9 0-1 .5-2 1.5-3 3 2 7 4 7 9 0 1-.5 2-1.5 3z" stroke="${accent}" stroke-width="1.4" stroke-linejoin="round" fill="${accent}" fill-opacity="0.05"/></svg>`

  container.innerHTML = `
    <div style="position:absolute;right:-18px;bottom:-22px;opacity:${done ? 0.16 : 0.05};color:${accent};pointer-events:none;transition:opacity 0.3s">${glyph}</div>
    ${(done || isNext) ? `<div style="position:absolute;top:-70px;left:-40px;width:200px;height:200px;border-radius:50%;background:${accent};opacity:${done ? 0.12 : 0.07};filter:blur(60px);pointer-events:none"></div>` : ''}
    <div style="position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:8px">
      <div style="display:flex;align-items:center;gap:7px;font-family:'JetBrains Mono',monospace;font-size:9.5px;letter-spacing:1.5px;text-transform:uppercase;color:${done ? accent : locked ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.42)'};font-weight:600">
        <span>Fase ${phase}</span>
      </div>
      ${done
        ? `<span style="display:inline-flex;align-items:center;gap:5px;padding:4px 9px 4px 7px;border-radius:9999px;background:${accent};font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:1.2px;text-transform:uppercase;font-weight:700;color:#0a0a0a;box-shadow:0 4px 12px ${accent}55;animation:fadeUp 0.3s ease-out"><svg width="10" height="8" viewBox="0 0 11 9" fill="none"><path d="M1 4.5l3 3L10 1" stroke="#0a0a0a" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg> Completado</span>`
        : isNext
        ? `<span style="display:inline-flex;align-items:center;gap:5px;padding:4px 9px;border-radius:9999px;background:${accent}1a;border:0.5px solid ${accent}40;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:1.2px;text-transform:uppercase;font-weight:600;color:${accent}"><span style="width:5px;height:5px;border-radius:50%;background:${accent};box-shadow:0 0 6px ${accent};animation:pulse 1.6s infinite;display:inline-block"></span> Sigue</span>`
        : ''}
    </div>
    <div style="position:relative;z-index:1">
      <div style="font-family:'Space Grotesk',sans-serif;font-size:27px;font-weight:700;color:#fafafa;letter-spacing:-0.8px;line-height:1">${locked ? 'Bloqueado' : title}</div>
      <div style="margin-top:4px;font-size:12.5px;color:${locked ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.5)'};overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${locked ? 'Completa la fase anterior primero' : subtitle}</div>
    </div>
    <div style="position:relative;z-index:1;display:flex;align-items:flex-end;justify-content:space-between;gap:12px">
      <div style="min-width:0">
        <div style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.3px;color:rgba(255,255,255,0.62);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${!locked ? (kind === 'work' || kind === 'training' ? `${day.exercises.length} ejercicios` : `${(movements || []).length} movimientos`) : ''}</div>
        ${progress && !locked ? `
          <div style="margin-top:7px;display:flex;align-items:center;gap:7px">
            <div style="width:64px;height:4px;border-radius:2px;background:rgba(255,255,255,0.1);overflow:hidden">
              <div style="height:100%;border-radius:2px;background:${accent};width:${progress.total ? (progress.done / progress.total) * 100 : 0}%;transition:width 0.4s"></div>
            </div>
            <span style="font-family:'JetBrains Mono',monospace;font-size:10px;color:${progress.done > 0 ? accent : 'rgba(255,255,255,0.45)'};letter-spacing:0.4px">${progress.done}/${progress.total}</span>
          </div>` : ''}
      </div>
      ${!locked
        ? `<div style="width:56px;height:56px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:${done ? 'transparent' : accent};border:${done ? `1.5px solid ${accent}` : '0'};box-shadow:${done ? 'none' : `0 8px 22px ${accent}55`};transition:all 0.2s">${
            done
              ? `<svg width="22" height="17" viewBox="0 0 22 17" fill="none"><path d="M1 9l6.5 6.5L21 1.5" stroke="${accent}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`
              : `<svg width="20" height="22" viewBox="0 0 20 22" fill="none" style="margin-left:3px"><path d="M3 2.6v16.8a1 1 0 001.52.85l13.8-8.4a1 1 0 000-1.7L4.52 1.75A1 1 0 003 2.6z" fill="#0a0a0a"/></svg>`
          }</div>`
        : `<div style="width:38px;height:38px;border-radius:11px;background:rgba(255,255,255,0.04);border:0.5px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="7" rx="1.5" stroke="rgba(255,255,255,0.45)" stroke-width="1.4"/><path d="M5 7V5a3 3 0 016 0v2" stroke="rgba(255,255,255,0.45)" stroke-width="1.4"/></svg></div>`
      }
    </div>`

  if (!done && !locked && onPlay) {
    container.addEventListener('click', onPlay)
  }
  return container
}
```

- [ ] **Step 2: Update PhaseCard calls to pass new props**

Update the 3 PhaseCard calls:
- Warmup: add `isNext={_phase === 1}` (if warmup is next), pass `movements={warmupItems}`
- Training: add `isNext={_phase === 2}`, add `progress={{ done: exDone, total: exercisesTotal }}`
- Stretch: add `isNext={_phase === 3}`, pass `movements={stretchItems}`

---

### Task 3: Layout — proportional cards with flex:1

**Files:**
- Modify: `views/today.js` — sections container

- [ ] **Step 1: Wrap section cards in a flex:1 container**

The three sections (warmup, exercises, stretch) are currently in separate divs with `paddingTop: 22px`. Wrap them in a container with:
```js
const sectionsWrap = document.createElement('div')
sectionsWrap.style.cssText = 'flex:1;min-height:0;margin-top:16px;display:flex;flex-direction:column;gap:11px'
page.appendChild(sectionsWrap)
```

Then append warmup section, exercises section, and stretch section into `sectionsWrap` instead of `page`.

- [ ] **Step 2: Ensure page uses flex column + full height**

Make sure the `page` div has `height: 100%; boxSizing: border-box; display: flex; flex-direction: column` so the sections fill the remaining space.

---

### Task 4: CoachCard redesign — SessionSummary reference

**Files:**
- Modify: `views/today.js:581-665`

- [ ] **Step 1: Replace `renderCoachCard` function**

Replace the entire `renderCoachCard` function with the reference-aligned version:

```js
function renderCoachCard(page, analysis, accent, dateStr, weekDayName, exercises, swaps) {
  const isLoading = _coachLoading
  const dayName = _coachDay?.name || 'Sesión'

  // Stats from analysis or defaults
  const items = exercises || []
  const prCount = analysis?.prCount || 0
  const volume = analysis?.volume || 0

  let aiContent = ''
  if (isLoading) {
    aiContent = `
      <div style="margin-top:16px;display:flex;align-items:center;gap:10px">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation:spin 1s linear infinite">
          <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/>
          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
          <line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/>
          <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
        </svg>
        <span style="font-size:13px;color:rgba(255,255,255,0.55)">Analizando tu entrenamiento…</span>
      </div>`
  } else if (analysis) {
    const destacados = analysis.destacados || []
    const consejos = analysis.consejos || []
    const resumen = analysis.analysis || analysis.resumen || ''
    const titulo = analysis.titulo || '¡Buen trabajo!'

    const destacadosHtml = destacados.length > 0
      ? `<div style="display:flex;flex-wrap:wrap;gap:7px;margin-top:14px">${destacados.map(d => `<span style="display:inline-flex;align-items:center;gap:5px;padding:6px 11px;border-radius:9999px;background:${accent}16;border:0.5px solid ${accent}3a;font-family:'Space Grotesk',sans-serif;font-size:11.5px;font-weight:600;color:${accent}"><span style="width:4px;height:4px;border-radius:50%;background:${accent}"></span>${d}</span>`).join('')}</div>`
      : ''

    const consejosHtml = consejos.length > 0
      ? `<div style="margin-top:16px;padding-top:14px;border-top:0.5px solid rgba(255,255,255,0.07)"><div style="font-family:'JetBrains Mono',monospace;font-size:9.5px;letter-spacing:1.4px;text-transform:uppercase;color:rgba(255,255,255,0.45);font-weight:600;margin-bottom:10px">Consejos</div><div style="display:flex;flex-direction:column;gap:11px">${consejos.map((c, i) => `<div style="display:flex;gap:11px;align-items:flex-start"><div style="font-family:'JetBrains Mono',monospace;font-size:12px;color:${accent};opacity:0.7;width:16px;flex-shrink:0;padding-top:1px">${String(i + 1).padStart(2, '0')}</div><div style="flex:1;font-size:13px;line-height:1.5;color:rgba(255,255,255,0.82);font-family:'Space Grotesk',sans-serif;letter-spacing:-0.1px">${c}</div></div>`).join('')}</div></div>`
      : ''

    const erroredHtml = analysis._fallback
      ? `<div style="margin-top:12px;font-size:10.5px;color:rgba(255,255,255,0.4);font-family:'JetBrains Mono',monospace;letter-spacing:0.3px">Resumen sin conexión · valores locales</div>`
      : ''

    aiContent = `
      <div style="margin-top:12px;font-size:14.5px;line-height:1.55;color:rgba(255,255,255,0.9);font-family:'Space Grotesk',sans-serif;letter-spacing:-0.1px">${resumen}</div>
      ${destacadosHtml}
      ${consejosHtml}
      ${erroredHtml}`
  }

  page.innerHTML = `
    <div id="today-coach-card" style="height:100%;box-sizing:border-box;overflow-y:auto;padding:56px 16px 104px">
      <div style="padding:0 4px;position:relative">
        <div style="display:flex;align-items:center;gap:8px;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:1.8px;text-transform:uppercase;color:${accent};font-weight:600">
          <span style="width:24px;height:24px;border-radius:8px;background:${accent};display:inline-flex;align-items:center;justify-content:center;box-shadow:0 4px 14px ${accent}66">
            <svg width="13" height="10" viewBox="0 0 13 10" fill="none"><path d="M1 5l3.5 3.5L12 1" stroke="#0a0a0a" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>
          ${dayName} · completado
        </div>
        <div style="margin-top:12px;font-family:'Space Grotesk',sans-serif;font-size:34px;font-weight:700;color:#fafafa;letter-spacing:-1.3px;line-height:1.02">
          ${isLoading ? 'Cerrando tu sesión…' : (analysis?.titulo || '¡Buen trabajo!')}
        </div>
      </div>

      <div style="margin-top:18px;display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
        <div style="background:#141414;border-radius:16px;padding:14px 12px;border:0.5px solid rgba(255,255,255,0.06);text-align:center">
          <div style="font-family:'JetBrains Mono',monospace;font-size:26px;font-weight:500;color:#fafafa;letter-spacing:-1px;line-height:1">${items.length}</div>
          <div style="margin-top:6px;font-family:'JetBrains Mono',monospace;font-size:8.5px;letter-spacing:1.2px;text-transform:uppercase;color:rgba(255,255,255,0.45)">Ejercicios</div>
        </div>
        <div style="background:#141414;border-radius:16px;padding:14px 12px;border:0.5px solid rgba(255,255,255,0.06);text-align:center">
          <div style="font-family:'JetBrains Mono',monospace;font-size:26px;font-weight:500;color:#fafafa;letter-spacing:-1px;line-height:1">${volume >= 1000 ? (volume / 1000).toFixed(1) + 'k' : volume}</div>
          <div style="margin-top:6px;font-family:'JetBrains Mono',monospace;font-size:8.5px;letter-spacing:1.2px;text-transform:uppercase;color:rgba(255,255,255,0.45)">Volumen</div>
        </div>
        <div style="background:#141414;border-radius:16px;padding:14px 12px;border:0.5px solid rgba(255,255,255,0.06);text-align:center">
          <div style="font-family:'JetBrains Mono',monospace;font-size:26px;font-weight:500;color:${prCount > 0 ? accent : '#fafafa'};letter-spacing:-1px;line-height:1">${prCount}</div>
          <div style="margin-top:6px;font-family:'JetBrains Mono',monospace;font-size:8.5px;letter-spacing:1.2px;text-transform:uppercase;color:rgba(255,255,255,0.45)">PRs</div>
        </div>
      </div>

      <div id="coach-card-regen" style="margin-top:14px;border-radius:20px;padding:18px;background:linear-gradient(165deg,#181818 0%,#111 100%);border:0.5px solid ${accent}2e;position:relative;overflow:hidden;cursor:${isLoading ? 'default' : 'pointer'};transition:border-color 0.15s">
        <div style="position:absolute;top:-50px;right:-40px;width:180px;height:180px;border-radius:50%;background:${accent};opacity:0.08;filter:blur(55px);pointer-events:none"></div>
        <div style="position:relative;z-index:1">
          <div style="display:flex;align-items:center;gap:7px;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:1.6px;text-transform:uppercase;color:${accent};font-weight:600">
            <span style="width:22px;height:22px;border-radius:7px;background:${accent}1f;display:inline-flex;align-items:center;justify-content:center">
              <svg width="13" height="13" viewBox="0 0 18 18" fill="none"><path d="M2.5 8.2c0-2.8 2.9-5 6.5-5s6.5 2.2 6.5 5-2.9 5-6.5 5c-.7 0-1.4-.08-2-.23L3.2 14.7l.5-2.4C2.95 11.4 2.5 9.9 2.5 8.2z" stroke="${accent}" stroke-width="1.5" stroke-linejoin="round" fill="none"/><circle cx="9" cy="8.2" r="0.95" fill="${accent}"/><circle cx="6" cy="8.2" r="0.95" fill="${accent}"/><circle cx="12" cy="8.2" r="0.95" fill="${accent}"/></svg>
            </span>
            Resumen del coach
          </div>
          ${aiContent}
        </div>
      </div>
    </div>`

  // Regeneration handler
  if (!isLoading && _coachDay && _coachEffort) {
    const regenEl = document.getElementById('coach-card-regen')
    if (regenEl) {
      regenEl.addEventListener('click', async () => {
        _coachLoading = true
        _coachResult = null
        if (typeof window.appRefresh === 'function') window.appRefresh()
        const s = await Storage.getSettings()
        try {
          const result = await runCoachAnalysis(_coachDay, _coachEffort, _coachDay.duration || 60, exercises || [], s, swaps || {})
          _coachResult = result
          _coachLoading = false
          const settings = await Storage.getSettings()
          settings.lastCoachAnalysis = { date: getToday(), effort: _coachEffort, ...result }
          await Storage.saveCoachAnalysis(settings.lastCoachAnalysis)
          if (typeof window.appRefresh === 'function') window.appRefresh()
        } catch {
          _coachLoading = false
          if (typeof window.appRefresh === 'function') window.appRefresh()
        }
      })
    }
  }
}
```

---

### Task 5: Rest day header polish

**Files:**
- Modify: `views/today.js:724-752`

- [ ] **Step 1: Update rest day header**

Replace the rest day header (lines 726-729) with:
```js
<div style="padding:56px 20px 0">
  <div style="display:flex;align-items:center;gap:8px;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:1.8px;color:${accent};text-transform:uppercase;font-weight:600">
    <span style="width:6px;height:6px;border-radius:50%;background:${accent};box-shadow:0 0 8px ${accent};animation:pulse 2s infinite;display:inline-block"></span>
    Hoy en el gimnasio
  </div>
  <div style="font-family:'Space Grotesk',sans-serif;font-size:42px;font-weight:700;color:#fafafa;letter-spacing:-1.8px;line-height:0.98;margin-top:7px">${weekDayName}.</div>
</div>
```

---

### Task 6: Cleanup orphan references

**Files:**
- Modify: `views/today.js`

- [ ] **Step 1: Remove unused variables**

Check for any remaining references to `ProgressRing`, `pct`, `doneSteps`, `totalSteps` that may cause errors after removal. The `pct` variable is used in `ProgressRing` — after removing the ring, remove `pct` calculation too (line 101: `const pct = totalSteps > 0 ? Math.round((doneSteps / totalSteps) * 100) : 0`).

- [ ] **Step 2: Verify no dead code remains**

Search for: `ProgressRing`, `watch-btn`, `today-watch-btn`, `_warmupSheetShown`, `_stretchSheetShown` — ensure all are cleanly handled.

- [ ] **Step 3: Final read-through**

Re-read the full file to ensure consistency and that the `isNext` logic in PhaseCard calls correctly detects which section should show "Sigue".
