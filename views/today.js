// ── Today screen (Hoy) — redesigned with PhaseCard + ProgressRing + TimerRing ──

let _warmupDone = false
let _stretchDone = false
let _exercisesSkipped = false
let _startedAt = null
let _endedAt = null
let _phaseCardOpen = null
let _todayExDone = 0
let _timerInterval = null
let _completionToastShown = false

function mountToday(container, { program, weekIdx, dayIndex, settings, accent, onOpenExercise, exercises }) {
  if (_timerInterval) { clearInterval(_timerInterval); _timerInterval = null }
  _completionToastShown = false
  container.innerHTML = ''
  const page = document.createElement('div')
  page.className = 'page'
  container.appendChild(page)

  const now = new Date()
  const jsDay = now.getDay()
  const detectedDayIdx = (jsDay + 6) % 7
  const dayIdx = dayIndex >= 0 ? dayIndex : detectedDayIdx
  const exercisesById = Object.fromEntries((exercises || []).map(e => [e.id, e]))
  const weekObj = program?.weeks[weekIdx]
  const day = weekObj?.days[dayIdx]
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  const dateStr = `${monthNames[now.getMonth()]} ${now.getDate()} · ${now.getFullYear()}`
  const weekDayName = dayNames[jsDay]

  if (!day || day.name === 'Rest' || day.name === 'Descanso') {
    renderRestDay(page, { weekDayName, dateStr, accent, weekObj, weekIdx })
    return
  }

  const warmupMuscles = day.exercises.map((ex) => {
    const resolved = { ...ex, ...(exercisesById[ex.exerciseId] || {}) }
    return resolved.muscle
  }).filter(Boolean)

  const warmupItems = resolvePanelItems(warmupMuscles, 'warmup')
  const stretchItems = resolvePanelItems(warmupMuscles, 'stretch')
  const hasWarmup = warmupItems.length > 0
  const hasStretch = stretchItems.length > 0
  const exercisesTotal = day.exercises.length
  const totalSteps = (hasWarmup ? 1 : 0) + exercisesTotal + (hasStretch ? 1 : 0)
  const exDone = _todayExDone
  const doneSteps = (_warmupDone ? 1 : 0) + exDone + (_stretchDone ? 1 : 0)
  const pct = totalSteps > 0 ? Math.round((doneSteps / totalSteps) * 100) : 0

  // Timer auto-start/stop
  if (doneSteps > 0 && !_startedAt) _startedAt = Date.now()
  if (totalSteps > 0 && doneSteps === totalSteps && _startedAt && !_endedAt) _endedAt = Date.now()
  if (_endedAt && doneSteps < totalSteps) _endedAt = null

  // Auto-open warmup card if not done (first load or after undo)
  if (_phaseCardOpen === null && hasWarmup && !_warmupDone) {
    _phaseCardOpen = 'warmup'
  }

  // Auto-open stretch card when exercises are done and warmup is complete
  if (_phaseCardOpen === null && hasStretch && (!hasWarmup || _warmupDone) && exDone >= exercisesTotal && !_stretchDone) {
    _phaseCardOpen = 'stretch'
  }

  function refreshView() {
    mountToday(container, { program, weekIdx, dayIndex, settings, accent, onOpenExercise, exercises })
  }

  // Header
  const header = document.createElement('div')
  header.style.padding = '56px 20px 12px'
  header.innerHTML = `
    <div style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:1.6px;color:rgba(255,255,255,0.45);text-transform:uppercase">${dateStr}</div>
    <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-top:4px">
      <div style="font-family:'Space Grotesk',sans-serif;font-size:38px;font-weight:700;color:#fafafa;letter-spacing:-1.5px;line-height:1">${weekDayName}.</div>
      ${weekObj ? `<span class="pill" style="background:rgba(212,255,58,0.12);color:${accent}">${weekObj.name}${weekObj.tag ? ' · ' + weekObj.tag : ''}</span>` : ''}
    </div>`
  page.appendChild(header)

  // Hero with session title + ProgressRing + TimerRing
  const hero = document.createElement('div')
  hero.style.padding = '8px 20px 4px'
  hero.innerHTML = `
    <div style="display:flex;align-items:center;gap:14px">
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;gap:8px;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:1.6px;color:${accent};text-transform:uppercase;font-weight:600;white-space:nowrap">
          Sesión de hoy
        </div>
        <div style="margin-top:6px;font-family:'Space Grotesk',sans-serif;font-size:34px;font-weight:700;color:#fafafa;letter-spacing:-1.2px;line-height:1.02">${day.name}</div>
        <div style="margin-top:6px;font-size:13.5px;color:rgba(255,255,255,0.55)">${day.subtitle || ''}</div>
      </div>
      <div id="hero-rings" style="display:flex;align-items:center;gap:10px;flex-shrink:0">
        ${ProgressRing({ pct, done: doneSteps, total: totalSteps, accent })}
      </div>
    </div>`
  // Append TimerRing as DOM element (it has event listeners, can't go via innerHTML)
  const ringsContainer = hero.querySelector('#hero-rings')
  const timerRingEl = TimerRing({ startedAt: _startedAt, endedAt: _endedAt, accent, complete: totalSteps > 0 && doneSteps === totalSteps, onReset: () => { _startedAt = null; _endedAt = null; refreshView() } })
  ringsContainer.appendChild(timerRingEl)
  const timerDisplayEl = timerRingEl.querySelector('[data-timer-display]')
  const timerSweepEl = timerRingEl.querySelector('[data-timer-sweep]')
  page.appendChild(hero)

  // ── WARM-UP ──
  if (hasWarmup) {
    const section = document.createElement('div')
    section.style.paddingTop = '22px'
    page.appendChild(section)
    section.appendChild(PhaseCard({
      kind: 'warmup',
      phase: '01',
      title: 'Calentamiento',
      subtitle: `${Math.ceil(warmupItems.length * 1.5)} min · dinámico`,
      accentColor: '#9bd1ff',
      movements: warmupItems,
      done: _warmupDone,
      onToggle: () => {
        const wasDone = _warmupDone
        _warmupDone = !_warmupDone
        _phaseCardOpen = null
        if (!wasDone) {
          showCenterToast({
            svg: TOAST_SVG_WATCH,
            message: 'Inicia tu Smart Watch',
            duration: 2000,
            accent,
            onDone: refreshView,
          })
        } else {
          refreshView()
        }
      },
      muscles: warmupMuscles,
      mode: 'warmup',
    }))
  }

  // ── EXERCISES ──
  const exSection = document.createElement('div')
  exSection.style.paddingTop = '22px'
  page.appendChild(exSection)

  if (hasWarmup && !_warmupDone) {
    const exLabel = document.createElement('div')
    exLabel.style.cssText = 'padding:0 20px;margin-bottom:10px;display:flex;align-items:center;gap:8px;font-family:JetBrains Mono,monospace;font-size:10px;letter-spacing:1.6px;text-transform:uppercase;color:rgba(255,255,255,0.55);font-weight:600;white-space:nowrap'
    exLabel.innerHTML = `<span style="width:4px;height:4px;border-radius:50%;background:${accent};flex-shrink:0;display:inline-block"></span><span>Fase 02 · Entrenamiento</span><span style="margin-left:auto;color:rgba(255,255,255,0.4);letter-spacing:0.4px">${exDone} / ${exercisesTotal}</span>`
    exSection.appendChild(exLabel)
    exSection.appendChild(LockedPhase({
      title: 'Termina el calentamiento primero',
      detail: 'Tus ejercicios aparecerán aquí cuando marques la Fase 01 como hecha.',
    }))
  } else if (_exercisesSkipped || exDone >= exercisesTotal) {
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
    const exList = document.createElement('div')
    exList.style.cssText = 'display:flex;flex-direction:column;gap:10px;padding:0 20px'
    exSection.appendChild(exList)

    const topRow = document.createElement('div')
    topRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:2px'
    const skipBtn = document.createElement('button')
    skipBtn.style.cssText = `display:flex;align-items:center;gap:8px;padding:8px 14px;border-radius:8px;border:0.5px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.03);cursor:pointer;color:rgba(255,255,255,0.6);font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:500;touch-action:manipulation`
    skipBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="0.5" y="0.5" width="13" height="13" rx="3" stroke="currentColor" stroke-width="1.5"/></svg> Marcar todo listo (sin peso)`
    skipBtn.addEventListener('click', () => {
      _exercisesSkipped = true
      _todayExDone = exercisesTotal
      const start = _startedAt || Date.now()
      const sec = Math.floor((Date.now() - start) / 1000)
      const mm = Math.floor(sec / 60)
      const ss = sec % 60
      const tiempo = mm > 0 ? `${mm} min ${ss} seg` : `${ss} seg`
      showCenterToast({
        svg: TOAST_IMG_TRAINER,
        message: 'Pedro te felicita',
        subtitle: `Ya no tienes 20 bb<br><span style="display:inline-flex;align-items:center;gap:4px;margin-top:4px"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> ${tiempo}</span>`,
        duration: 3000,
        accent,
        onDone: refreshView,
      })
    })
    topRow.appendChild(skipBtn)
    exList.appendChild(topRow)

    day.exercises.forEach((ex) => {
      const resolved = { ...ex, ...(exercisesById[ex.exerciseId] || {}) }
      exList.appendChild(createExerciseRow(resolved, accent, settings?.units || 'kg', onOpenExercise))
    })
  }

  // ── STRETCH ──
  if (hasStretch) {
    const stSection = document.createElement('div')
    stSection.style.paddingTop = '22px'
    page.appendChild(stSection)

    if (hasWarmup && !_warmupDone) {
      stSection.appendChild(LockedPhase({
        title: 'Termina el calentamiento primero',
        detail: 'Tus estiramientos aparecerán cuando completes todos los ejercicios.',
      }))
    } else if (exDone < exercisesTotal && !_exercisesSkipped) {
      stSection.appendChild(LockedPhase({
        title: 'Termina el entrenamiento primero',
        detail: `Completa los ${exercisesTotal - exDone} ejercicio(s) restante(s) para ver tus estiramientos.`,
      }))
    } else {
      stSection.appendChild(PhaseCard({
        kind: 'stretch',
        phase: '03',
        title: 'Estiramiento',
        subtitle: `${Math.ceil(stretchItems.length * 1.5)} min · estático`,
        accentColor: '#c89bff',
        movements: stretchItems,
        done: _stretchDone,
        onToggle: () => {
          _stretchDone = !_stretchDone
          _phaseCardOpen = null
          refreshView()
        },
        muscles: warmupMuscles,
        mode: 'stretch',
      }))
    }
  }

  // Live timer tick — updates DOM in-place, no full re-render
  if (_startedAt && !_endedAt) {
    _timerInterval = setInterval(() => {
      if (_endedAt) { clearInterval(_timerInterval); _timerInterval = null; return }
      const totalSec = Math.floor((Date.now() - _startedAt) / 1000)
      const hh = Math.floor(totalSec / 3600)
      const mm = Math.floor((totalSec % 3600) / 60)
      const ss = totalSec % 60
      const pad = (n) => String(n).padStart(2, '0')
      if (timerDisplayEl) timerDisplayEl.textContent = hh > 0 ? `${hh}:${pad(mm)}` : `${pad(mm)}:${pad(ss)}`
      if (timerSweepEl) {
        const c = parseFloat(timerSweepEl.dataset.timerC) || 185.35
        timerSweepEl.setAttribute('stroke-dasharray', `${(totalSec % 3600) / 3600 * c} ${c}`)
      }
    }, 1000)
  }

  // Async load today's logs to update counts
  Storage.getLogsForDate(new Date().toISOString().slice(0, 10)).then((logs) => {
    const done = _exercisesSkipped ? exercisesTotal : day.exercises.filter(ex => logs.some(l => l.exerciseId === (ex.exerciseId || ex.id))).length
    if (done !== _todayExDone) {
      const prev = _todayExDone
      _todayExDone = done
      refreshView()
      if (done >= exercisesTotal && prev < exercisesTotal && !_exercisesSkipped && !_completionToastShown) {
        _completionToastShown = true
        const start = _startedAt || Date.now()
        const sec = Math.floor((Date.now() - start) / 1000)
        const mm = Math.floor(sec / 60)
        const ss = sec % 60
        const tiempo = mm > 0 ? `${mm} min ${ss} seg` : `${ss} seg`
        showCenterToast({
          svg: TOAST_IMG_TRAINER,
          message: 'Pedro te felicita',
          subtitle: `Ya no tienes 20 bb<br><span style="display:inline-flex;align-items:center;gap:4px;margin-top:4px"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> ${tiempo}</span>`,
          duration: 3000,
          accent,
          onDone: () => {
            _phaseCardOpen = 'stretch'
            refreshView()
          },
        })
      }
    }
  })
}

// ── Progress Ring ──
function ProgressRing({ pct, done, total, accent, size = 64 }) {
  const stroke = 5
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const dash = (pct / 100) * c
  const div = document.createElement('div')
  div.style.cssText = `width:${size}px;height:${size}px;position:relative;flex-shrink:0`
  div.innerHTML = `
    <svg width="${size}" height="${size}" style="transform:rotate(-90deg)">
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" stroke="rgba(255,255,255,0.08)" stroke-width="${stroke}" fill="none"/>
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" stroke="${accent}" stroke-width="${stroke}" fill="none" stroke-linecap="round" stroke-dasharray="${dash} ${c}" style="transition:stroke-dasharray 0.4s cubic-bezier(0.4,0,0.2,1)"/>
    </svg>
    <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0">
      <div style="font-family:'JetBrains Mono',monospace;font-size:14px;font-weight:500;color:#fafafa;letter-spacing:-0.4px;line-height:1">${done}<span style="color:rgba(255,255,255,0.35)">/${total}</span></div>
      <div style="font-family:'JetBrains Mono',monospace;font-size:8px;letter-spacing:1.2px;text-transform:uppercase;color:rgba(255,255,255,0.45);margin-top:2px">${pct}%</div>
    </div>`
  return div.outerHTML
}

// ── Timer Ring ──
function TimerRing({ startedAt, endedAt, accent, complete, onReset, size = 64 }) {
  const stroke = 5
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const now = Date.now()
  const elapsedMs = startedAt ? Math.max(0, (endedAt || now) - startedAt) : 0
  const totalSec = Math.floor(elapsedMs / 1000)
  const hh = Math.floor(totalSec / 3600)
  const mm = Math.floor((totalSec % 3600) / 60)
  const ss = totalSec % 60
  const pad = (n) => String(n).padStart(2, '0')
  const display = hh > 0 ? `${hh}:${pad(mm)}` : `${pad(mm)}:${pad(ss)}`
  const sweepPct = (totalSec % 3600) / 3600
  const dash = sweepPct * c

  if (!startedAt) {
    const el = document.createElement('div')
    el.style.cssText = `width:${size}px;height:${size}px;position:relative;flex-shrink:0;border-radius:50%;border:0.5px dashed rgba(255,255,255,0.12);display:flex;flex-direction:column;align-items:center;justify-content:center`
    el.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7.6" r="5" stroke="rgba(255,255,255,0.4)" stroke-width="1.2"/><path d="M7 5.2V7.6l1.7 1.1" stroke="rgba(255,255,255,0.4)" stroke-width="1.2" stroke-linecap="round"/><path d="M5.5 1.5h3" stroke="rgba(255,255,255,0.4)" stroke-width="1.2" stroke-linecap="round"/></svg>
      <div style="margin-top:4px;font-family:'JetBrains Mono',monospace;font-size:8px;letter-spacing:1.2px;text-transform:uppercase;color:rgba(255,255,255,0.4)">Listo</div>`
    return el
  }

  const ringColor = complete && endedAt ? accent : `${accent}cc`
  const labelColor = complete && endedAt ? accent : 'rgba(255,255,255,0.45)'
  const labelText = complete && endedAt ? 'Total' : 'Tiempo'

  const btn = document.createElement('button')
  btn.title = complete && endedAt ? 'Clic para reiniciar' : 'Alt+clic para reiniciar'
  btn.style.cssText = `width:${size}px;height:${size}px;position:relative;flex-shrink:0;background:transparent;border:0;padding:0;cursor:pointer;color:inherit`
  btn.innerHTML = `
    <svg width="${size}" height="${size}" style="transform:rotate(-90deg);position:absolute;inset:0">
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" stroke="${complete && endedAt ? `${accent}33` : 'rgba(255,255,255,0.08)'}" stroke-width="${stroke}" fill="none"/>
      <circle data-timer-sweep="" data-timer-c="${c}" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke="${ringColor}" stroke-width="${stroke}" fill="none" stroke-linecap="round" stroke-dasharray="${complete && endedAt ? `${c} 0` : `${dash} ${c}`}" style="transition:stroke-dasharray 0.6s linear"/>
    </svg>
    <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">
      <div data-timer-display="" style="font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:500;color:#fafafa;letter-spacing:-0.4px;line-height:1;font-variant-numeric:tabular-nums">${display}</div>
      <div style="font-family:'JetBrains Mono',monospace;font-size:8px;letter-spacing:1.2px;text-transform:uppercase;color:${labelColor};margin-top:3px">${labelText}</div>
    </div>`
  btn.addEventListener('click', (e) => { if (e.altKey || (complete && endedAt)) onReset() })
  return btn
}

// ── Phase Card (warmup / stretch) ──
function PhaseCard({ kind, phase, title, subtitle, accentColor, movements, done, onToggle, muscles, mode }) {
  const container = document.createElement('div')
  const isOpen = _phaseCardOpen === kind
  const accent = accentColor

  container.style.cssText = `margin:0 20px;background:#141414;border-radius:18px;border:${done ? `0.5px solid ${accent}55` : '0.5px solid rgba(255,255,255,0.06)'};overflow:hidden;position:relative;transition:border-color 0.2s`

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
      <div style="display:flex;align-items:baseline;gap:8px;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:1.4px;text-transform:uppercase;color:${done ? accent : 'rgba(255,255,255,0.45)'};font-weight:600">
        <span>Fase ${phase}</span>
        ${done ? `<span style="color:${accent}">· Completa</span>` : ''}
      </div>
      <div style="margin-top:3px;font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:600;color:#fafafa;letter-spacing:-0.3px;line-height:1.2">${title}</div>
      <div style="font-size:11.5px;color:rgba(255,255,255,0.5);margin-top:2px;white-space:nowrap">${subtitle} · ${movements.length} movimientos</div>
    </div>
    <div style="flex-shrink:0;transform:${isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};transition:transform 0.2s;color:rgba(255,255,255,0.4)">
      <svg width="14" height="9" viewBox="0 0 14 9" fill="none"><path d="M1 1l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </div>`

  headerBtn.addEventListener('click', () => {
    _phaseCardOpen = isOpen ? null : kind
    // Trigger a re-render by refreshing the parent container's content
    const parent = container.parentNode
    if (parent) {
      const newCard = PhaseCard({ kind, phase, title, subtitle, accentColor, movements, done, onToggle, muscles, mode })
      parent.replaceChild(newCard, container)
    }
  })
  container.appendChild(headerBtn)

  if (isOpen) {
    const body = document.createElement('div')
    body.style.cssText = 'animation:fadeUp 0.2s ease-out;padding:0 16px 14px'
    body.innerHTML = `<div style="border-top:0.5px solid rgba(255,255,255,0.05);padding-top:8px"></div>`
    const innerBody = body.querySelector('div')

    // Use checkable panel from warmup.js if available
    const items = resolvePanelItems(muscles, mode)
    if (items.length > 0) {
      const checkableContent = makePanelContent({ muscles, accent, mode, onComplete: onToggle })
      innerBody.appendChild(checkableContent)
    } else {
      movements.forEach((m, i) => {
        const row = document.createElement('div')
        row.style.cssText = 'display:flex;align-items:flex-start;gap:12px;padding:8px 0;border-bottom:' + (i < movements.length - 1 ? '0.5px solid rgba(255,255,255,0.04)' : '0')
        row.innerHTML = `
          <div style="font-family:'JetBrains Mono',monospace;font-size:10px;color:${accent};opacity:0.7;font-weight:500;padding-top:2px;width:18px;flex-shrink:0">${String(i + 1).padStart(2, '0')}</div>
          <div style="flex:1;min-width:0">
            <div style="font-family:'Space Grotesk',sans-serif;font-size:13.5px;font-weight:500;color:#fafafa;letter-spacing:-0.1px;line-height:1.25">${m.name}</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.5);margin-top:2px;font-family:'JetBrains Mono',monospace;letter-spacing:0.2px">${m.detail}</div>
          </div>`
        innerBody.appendChild(row)
      })
    }

    const toggleBtn = document.createElement('button')
    toggleBtn.style.cssText = `margin-top:12px;width:100%;padding:10px;border-radius:10px;border:0;cursor:pointer;background:${done ? 'transparent' : accent};color:${done ? accent : '#0a0a0a'};border:${done ? `0.5px solid ${accent}55` : '0'};font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:700;letter-spacing:-0.1px;display:flex;align-items:center;justify-content:center;gap:6px;transition:all 0.2s`
    toggleBtn.innerHTML = done
      ? '↺ Deshacer'
      : `✓ Marcar ${kind === 'warmup' ? 'calentamiento' : 'estiramiento'} como hecho`
    toggleBtn.addEventListener('click', (e) => { e.stopPropagation(); onToggle() })
    innerBody.appendChild(toggleBtn)

    container.appendChild(body)
  }

  return container
}

// ── Locked Phase ──
function LockedPhase({ title, detail }) {
  const div = document.createElement('div')
  div.style.cssText = 'margin:0 20px;background:rgba(255,255,255,0.02);border-radius:18px;padding:18px 16px;border:0.5px dashed rgba(255,255,255,0.12);display:flex;gap:12px;align-items:center'
  div.innerHTML = `
    <div style="width:38px;height:38px;border-radius:11px;background:rgba(255,255,255,0.04);border:0.5px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:center;flex-shrink:0">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="7" rx="1.5" stroke="rgba(255,255,255,0.45)" stroke-width="1.4"/><path d="M5 7V5a3 3 0 016 0v2" stroke="rgba(255,255,255,0.45)" stroke-width="1.4"/></svg>
    </div>
    <div style="flex:1;min-width:0">
      <div style="font-family:'Space Grotesk',sans-serif;font-size:13.5px;font-weight:600;color:rgba(255,255,255,0.85);letter-spacing:-0.2px;line-height:1.3">${title}</div>
      <div style="font-size:11.5px;color:rgba(255,255,255,0.45);margin-top:3px;line-height:1.4">${detail}</div>
    </div>`
  return div
}

// ── Exercise Row ──
function createExerciseRow(ex, accent, units, onOpen) {
  const btn = document.createElement('button')
  btn.className = 'exercise-row'
  btn.style.cssText = `background:#141414;border-radius:18px;padding:14px;border:0.5px solid rgba(255,255,255,0.06);cursor:pointer;text-align:left;display:flex;align-items:stretch;gap:14px;color:inherit;position:relative;transition:border-color 0.2s`

  const hasImg = ex.imgUrl
  btn.innerHTML = `
    <div style="width:64px;height:64px;flex-shrink:0;border-radius:12px;position:relative;overflow:hidden;background:#1c1c1c;border:0.5px solid rgba(255,255,255,0.04)">${hasImg ? `<img src="${ex.imgUrl}" alt="" style="width:100%;height:100%;object-fit:cover">` : `<div style="width:100%;height:100%;background-image:repeating-linear-gradient(135deg,rgba(255,255,255,0.018) 0 12px,rgba(255,255,255,0.05) 12px 24px)"></div>`}</div>
    <div style="flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center">
      <div style="font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:600;color:#fafafa;letter-spacing:-0.3px;line-height:1.3;overflow-wrap:break-word">${ex.name}</div>
      <div style="font-size:12px;color:rgba(255,255,255,0.5);margin-top:3px">${ex.muscle}</div>
    </div>
    <div style="display:flex;flex-direction:column;align-items:flex-end;justify-content:flex-start;gap:4px;flex-shrink:0;padding-top:6px">
      <div style="font-family:'JetBrains Mono',monospace;font-size:22px;font-weight:500;color:#fafafa;letter-spacing:-0.8px;line-height:1;white-space:nowrap">${ex.sets}<span style="color:rgba(255,255,255,0.35);margin:0 3px">×</span>${ex.reps}</div>
    </div>`

  const weightEl = document.createElement('div')
  weightEl.style.cssText = 'font-family:JetBrains Mono,monospace;font-size:11px;color:rgba(255,255,255,0.55);letter-spacing:0.2px;white-space:nowrap;font-weight:400'
  weightEl.id = `weight-${ex.exerciseId || ex.id}`
  btn.querySelector('div:last-child').appendChild(weightEl)

  btn.addEventListener('click', () => {
    if (!_startedAt) _startedAt = Date.now()
    onOpen(ex)
  })

  Storage.getLogsForDate(new Date().toISOString().slice(0, 10)).then((logs) => {
    if (_exercisesSkipped) {
      btn.style.borderColor = `${accent}33`
      weightEl.innerHTML = `<span style="color:${accent};font-weight:500">✓</span> <span style="font-size:8px;letter-spacing:1.2px;text-transform:uppercase;color:${accent}">hoy</span>`
      const badge = btn.querySelector('div:first-child')
      badge.innerHTML += `<div style="position:absolute;top:6px;right:6px;width:16px;height:16px;border-radius:50%;background:${accent};display:flex;align-items:center;justify-content:center;box-shadow:0 0 12px ${accent}66"><svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5l2.5 2.5L8 1" stroke="#0a0a0a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`
      return
    }
    const log = logs.find((l) => l.exerciseId === (ex.exerciseId || ex.id))
    if (log) {
      btn.style.borderColor = `${accent}33`
      weightEl.innerHTML = `<span style="color:${accent};font-weight:500">${log.weight}${units}</span> <span style="font-size:8px;letter-spacing:1.2px;text-transform:uppercase;color:${accent}">hoy</span>`
      const badge = btn.querySelector('div:first-child')
      badge.innerHTML += `<div style="position:absolute;top:6px;right:6px;width:16px;height:16px;border-radius:50%;background:${accent};display:flex;align-items:center;justify-content:center;box-shadow:0 0 12px ${accent}66"><svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5l2.5 2.5L8 1" stroke="#0a0a0a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`
    } else {
      Storage.getLogsForExercise(ex.exerciseId || ex.id).then((logs) => {
        if (logs.length > 0) {
          const last = logs[logs.length - 1]
          weightEl.innerHTML = `<span>${last.weight}${units}</span> <span style="font-size:8px;letter-spacing:1.2px;text-transform:uppercase;color:rgba(255,255,255,0.35);opacity:0.8">última</span>`
        }
      })
    }
  })

  return btn
}

// ── Rest Day ──
function renderRestDay(container, { weekDayName, dateStr, accent, weekObj, weekIdx }) {
  container.innerHTML = `
    <div style="padding:56px 20px 0">
      <div style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:1.6px;color:rgba(255,255,255,0.45);text-transform:uppercase">${dateStr}</div>
      <div style="font-family:'Space Grotesk',sans-serif;font-size:38px;font-weight:700;color:#fafafa;letter-spacing:-1.5px;line-height:1;margin-top:4px">${weekDayName}.</div>
    </div>
    <div style="padding:20px;margin-top:8px">
      <div style="padding:28px;border-radius:24px;background:linear-gradient(155deg,#1a1a1a 0%,#0e0e0e 100%);border:0.5px solid rgba(255,255,255,0.08);position:relative;overflow:hidden">
        <div style="position:absolute;top:-40px;right:-40px;width:200px;height:200px;border-radius:50%;background:#9bd1ff;opacity:0.1;filter:blur(60px)"></div>
        <div style="position:relative;z-index:1">
          <span class="pill" style="background:rgba(155,209,255,0.15);color:#9bd1ff">DESCANSO</span>
          <div style="margin-top:12px;font-family:'Space Grotesk',sans-serif;font-size:30px;font-weight:700;color:#fafafa;letter-spacing:-1px;line-height:1.1">La recuperación es donde creces.</div>
          <div style="margin-top:8px;font-size:13px;color:rgba(255,255,255,0.55);line-height:1.5">Sin pesas hoy. Tómalo con calma${weekObj ? ' y prepara tu cuerpo para la ' + (weekIdx >= 2 ? 'Semana A' : 'próxima sesión') : ''}.</div>
        </div>
      </div>
    </div>
    <div style="margin-top:18px;margin-bottom:12px">
      <div class="section-label" style="--accent:#9bd1ff">Lista de recuperación</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:10px;padding:0 20px">
      ${RECOVERY_TIPS.map((tip) => `
        <div style="display:flex;gap:14px;padding:14px;background:#141414;border-radius:16px;border:0.5px solid rgba(255,255,255,0.06);align-items:center">
          <div style="font-size:26px">${tip.icon}</div>
          <div style="flex:1">
            <div style="font-family:'Space Grotesk',sans-serif;font-size:15px;font-weight:600;color:#fafafa">${tip.title}</div>
            <div style="font-size:12px;color:rgba(255,255,255,0.55);margin-top:2px">${tip.body}</div>
          </div>
        </div>`).join('')}
    </div>`
}
