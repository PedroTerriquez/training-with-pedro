// ── Today screen (Hoy) — redesigned with PhaseCard + ProgressRing + TimerRing ──

let _phase = 1
let _startedAt = null
let _endedAt = null
let _phaseCardOpen = null
let _todayExDone = 0
let _timerInterval = null
let _completionToastShown = false
let _effortValue = null
let _coachResult = null
let _coachLoading = false
let _coachCardMode = false
let _effortModalShowing = false
let _sessionDate = ''
let _coachDay = null
let _coachEffort = null
let _warmupSheetShown = false
let _stretchSheetShown = false
let _mountGen = 0

function mountToday(container, { program, weekIdx, dayIndex, settings, accent, onOpenExercise, exercises, swaps, rescheduleOrder }) {
  swaps = swaps || {}
  const gen = ++_mountGen
  if (_timerInterval) { clearInterval(_timerInterval); _timerInterval = null }
  _completionToastShown = false
  _effortValue = null
  _coachResult = null
  _effortModalShowing = false
  const todayDate = getToday()
  if (_sessionDate !== todayDate) {
    _phase = 1
    _startedAt = null
    _endedAt = null
    _phaseCardOpen = null
    _todayExDone = 0
    _sessionDate = todayDate
    _warmupSheetShown = false
    _stretchSheetShown = false
    _coachCardMode = false
    _effortValue = null
    _coachResult = null
  }
  // Restore session state from settings (survives page reload)
  if (settings.sessionState?.date === todayDate) {
    _phase = settings.sessionState.phase || 1
    _todayExDone = settings.sessionState.todayExDone || 0
  }
  container.innerHTML = ''
  const page = document.createElement('div')
  page.className = 'page'
  container.appendChild(page)

  const now = new Date()
  const jsDay = now.getDay()
  const detectedDayIdx = (dayIndex >= 0 ? dayIndex : (jsDay + 6) % 7)
  const exercisesById = Object.fromEntries((exercises || []).map(e => [e.id, e]))
  function resolveExId(exerciseId) { return swaps[exerciseId] || exerciseId }
  const weekObj = program?.weeks[weekIdx]
  const defaultDaysOrder = [0,1,2,3,4,5,6]
  const order = (rescheduleOrder && rescheduleOrder.length === 7) ? rescheduleOrder : defaultDaysOrder
  const originalDayIdx = order[detectedDayIdx < order.length ? detectedDayIdx : 0]
  const day = weekObj?.days[originalDayIdx]
  // Show coach card on reload if analysis already exists for today
  if (settings.lastCoachAnalysis?.date === todayDate) {
    _coachCardMode = true
    _coachEffort = settings.lastCoachAnalysis.effort || 'good'
    _coachDay = day
  }
  const isRescheduled = originalDayIdx !== detectedDayIdx
  const DAYS_LONG = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  const dateStr = `${monthNames[now.getMonth()]} ${now.getDate()} · ${now.getFullYear()}`
  const weekDayName = dayNames[jsDay]

  if (!day || day.name === 'Rest' || day.name === 'Descanso') {
    renderRestDay(page, { weekDayName, dateStr, accent, weekObj, weekIdx })
    return
  }

  if (_coachCardMode) {
    const analysis = (!_coachLoading && settings.lastCoachAnalysis?.date === getToday()) ? settings.lastCoachAnalysis : null
    renderCoachCard(page, analysis, accent, dateStr, weekDayName, exercises, swaps)
    return
  }

  const warmupMuscles = day.exercises.map((ex) => {
    const resolved = { ...ex, ...(exercisesById[resolveExId(ex.exerciseId)] || {}) }
    return resolved.muscle
  }).filter(Boolean)

  const warmupItems = resolvePanelItems(warmupMuscles, 'warmup')
  const stretchItems = resolvePanelItems(warmupMuscles, 'stretch')
  const hasWarmup = warmupItems.length > 0
  const hasStretch = stretchItems.length > 0
  const exercisesTotal = day.exercises.length
  const totalSteps = (hasWarmup ? 1 : 0) + exercisesTotal + (hasStretch ? 1 : 0)
  const exDone = _todayExDone
  const doneSteps = (_phase >= 2 ? 1 : 0) + exDone + (_phase >= 4 ? 1 : 0)
  const pct = totalSteps > 0 ? Math.round((doneSteps / totalSteps) * 100) : 0

  // Timer auto-start/stop
  if (doneSteps > 0 && !_startedAt) _startedAt = Date.now()
  if (totalSteps > 0 && doneSteps === totalSteps && _startedAt && !_endedAt) _endedAt = Date.now()
  if (_endedAt && doneSteps < totalSteps) _endedAt = null

  // Auto-open warmup detail sheet if not done (first load or after undo)
  if (!_warmupSheetShown && hasWarmup && _phase < 2) {
    _warmupSheetShown = true
    setTimeout(() => {
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
    }, 300)
  }

  // Auto-open stretch detail sheet when exercises are done and warmup is complete
  if (!_stretchSheetShown && hasStretch && _phase >= 3 && _phase < 4) {
    _stretchSheetShown = true
    setTimeout(() => {
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
    }, 300)
  }

  function refreshView() {
    mountToday(container, { program, weekIdx, dayIndex, settings, accent, onOpenExercise, exercises, swaps, rescheduleOrder })
  }

  function persistPhase() {
    settings.sessionState = { date: todayDate, phase: _phase, todayExDone: _todayExDone }
    Storage.saveSettings(settings)
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
          ${isRescheduled ? `<div style="display:inline-flex;align-items:center;gap:5px;margin-top:9px;padding:4px 10px;border-radius:9999px;background:${accent}18;border:0.5px solid ${accent}3a;font-family:'JetBrains Mono',monospace;font-size:9.5px;letter-spacing:0.6px;text-transform:uppercase;color:${accent};font-weight:600">↔ Reprogramado · lo de ${DAYS_LONG[originalDayIdx]}</div>` : ''}
        </div>
      <div id="hero-rings" style="display:flex;align-items:center;gap:10px;flex-shrink:0">
        ${ProgressRing({ pct, done: doneSteps, total: totalSteps, accent })}
      </div>
    </div>`
  // Append TimerRing as DOM element (it has event listeners, can't go via innerHTML)
  const ringsContainer = hero.querySelector('#hero-rings')
  const timerRingEl = TimerRing({ startedAt: _startedAt, endedAt: _endedAt, accent, complete: totalSteps > 0 && doneSteps === totalSteps, onReset: () => { _startedAt = null; _endedAt = null; refreshView() } })
  ringsContainer.appendChild(timerRingEl)

  // Enviar al Watch button
  const watchBtn = document.createElement('button')
  watchBtn.id = 'today-watch-btn'
  watchBtn.style.cssText = 'display:flex;align-items:center;gap:4px;padding:4px 10px;border-radius:8px;border:0.5px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.03);cursor:pointer;color:rgba(255,255,255,0.5);font-family:\'Space Grotesk\',sans-serif;font-size:11px;font-weight:500;touch-action:manipulation;transition:all 0.2s'
  watchBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> ⌚'
  watchBtn.title = 'Enviar al Watch'
  watchBtn.addEventListener('click', async () => {
    if (Notification.permission === 'denied') {
      showToast('Permiso denegado. Actívalo en Ajustes.', true)
      return
    }
    if (Notification.permission === 'default') {
      const result = await Notification.requestPermission()
      if (result !== 'granted') {
        showToast('Permiso necesario', true)
        return
      }
    }
    // Subscribe for push notifications after permission granted
    await subscribePush()
    showCenterToast({
      svg: '<span style="font-size:24px">⌚</span>',
      message: 'Enviado al Watch',
      duration: 1500,
      accent,
      onDone: () => {},
    })
  })
  ringsContainer.appendChild(watchBtn)
  ringsContainer.appendChild(watchBtn)
  const timerDisplayEl = timerRingEl.querySelector('[data-timer-display]')
  const timerSweepEl = timerRingEl.querySelector('[data-timer-sweep]')
  page.appendChild(hero)

  // ── WARM-UP ──
  if (hasWarmup) {
    const section = document.createElement('div')
    section.id = 'today-warmup-section'
    section.style.paddingTop = '22px'
    page.appendChild(section)
    section.appendChild(PhaseCard({
      kind: 'warmup',
      phase: '01',
      title: 'Calentamiento',
      subtitle: `${Math.ceil(warmupItems.length * 1.5)} min · dinámico`,
      accentColor: '#9bd1ff',
      movements: warmupItems,
      done: _phase >= 2,
      onToggle: () => {
        const wasDone = _phase >= 2
        _phase = wasDone ? 1 : 2
        _phaseCardOpen = null
        persistPhase()
        if (!wasDone) {
          if (settings.hasWatch) {
            showCenterToast({
              svg: TOAST_SVG_WATCH,
              message: 'Inicia tu Smart Watch',
              duration: 1500,
              accent,
              onDone: refreshView,
            })
          } else {
            refreshView()
          }
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
  exSection.id = 'today-exercises-section'
  exSection.style.paddingTop = '22px'
  page.appendChild(exSection)

  if (hasWarmup && _phase < 2) {
    const exLabel = document.createElement('div')
    exLabel.id = 'today-ex-label'
    exLabel.style.cssText = 'padding:0 20px;margin-bottom:10px;display:flex;align-items:center;gap:8px;font-family:JetBrains Mono,monospace;font-size:10px;letter-spacing:1.6px;text-transform:uppercase;color:rgba(255,255,255,0.55);font-weight:600;white-space:nowrap'
    exLabel.innerHTML = `<span style="width:4px;height:4px;border-radius:50%;background:${accent};flex-shrink:0;display:inline-block"></span><span>Fase 02 · Entrenamiento</span><span style="margin-left:auto;color:rgba(255,255,255,0.4);letter-spacing:0.4px">${exDone} / ${exercisesTotal}</span>`
    exSection.appendChild(exLabel)
    exSection.appendChild(LockedPhase({
      title: 'Termina el calentamiento primero',
      detail: 'Tus ejercicios aparecerán aquí cuando marques la Fase 01 como hecha.',
    }))
  } else if (_phase >= 3) {
    const doneBanner = document.createElement('div')
    doneBanner.id = 'today-ex-done-banner'
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
    exList.id = 'today-ex-list'
    exList.style.cssText = 'display:flex;flex-direction:column;gap:10px;padding:0 20px'
    exSection.appendChild(exList)

    const topRow = document.createElement('div')
    topRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:2px'
    const skipBtn = document.createElement('button')
    skipBtn.id = 'today-skip-btn'
    skipBtn.style.cssText = `display:flex;align-items:center;gap:8px;padding:8px 14px;border-radius:8px;border:0.5px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.03);cursor:pointer;color:rgba(255,255,255,0.6);font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:500;touch-action:manipulation`
    skipBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="0.5" y="0.5" width="13" height="13" rx="3" stroke="currentColor" stroke-width="1.5"/></svg> Marcar todo listo (sin peso)`
    skipBtn.addEventListener('click', () => {
      _phase = 3
      _todayExDone = exercisesTotal
      persistPhase()
      const start = _startedAt || Date.now()
      const sec = Math.floor((Date.now() - start) / 1000)
      const mm = Math.floor(sec / 60)
      const ss = sec % 60
      const tiempo = mm > 0 ? `${mm} min ${ss} seg` : `${ss} seg`
      showCenterToast({
        svg: TOAST_IMG_TRAINER,
        message: 'ESTIRA',
        subtitle: `Ya no tienes 20 añitos bb<br><span style="display:inline-flex;align-items:center;gap:4px;margin-top:4px"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> ${tiempo}</span>`,
        duration: 3000,
        accent,
        onDone: refreshView,
      })
    })
    topRow.appendChild(skipBtn)
    exList.appendChild(topRow)

    day.exercises.forEach((ex) => {
      const altId = resolveExId(ex.exerciseId)
      const resolved = { ...ex, exerciseId: altId, ...(exercisesById[altId] || {}) }
      exList.appendChild(createExerciseRow(resolved, accent, settings?.units || 'kg', onOpenExercise))
    })
  }

  // ── STRETCH ──
  if (hasStretch) {
    const stSection = document.createElement('div')
    stSection.id = 'today-stretch-section'
    stSection.style.paddingTop = '22px'
    page.appendChild(stSection)

    if (hasWarmup && _phase < 2) {
      stSection.appendChild(LockedPhase({
        id: 'today-locked-warmup-stretch',
        title: 'Termina el calentamiento primero',
        detail: 'Tus estiramientos aparecerán cuando completes todos los ejercicios.',
      }))
    } else if (_phase < 3) {
      stSection.appendChild(LockedPhase({
        id: 'today-locked-training-stretch',
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
        done: _phase >= 4,
        onToggle: () => {
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
        muscles: warmupMuscles,
        mode: 'stretch',
      }))
    }
  }

  // Live timer tick — updates DOM in-place, no full re-render
  if (_startedAt && !_endedAt) {
    _timerInterval = setInterval(() => {
      if (gen !== _mountGen) { clearInterval(_timerInterval); _timerInterval = null; return }
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
  Storage.getLogsForDate(getToday()).then((logs) => {
    if (gen !== _mountGen) return
    const done = _phase >= 3 ? exercisesTotal : day.exercises.filter(ex => {
      const displayedId = resolveExId(ex.exerciseId || ex.id)
      return logs.some(l => l.exerciseId === displayedId)
    }).length
    if (done !== _todayExDone) {
      const prev = _todayExDone
      _todayExDone = done
      if (_phase < 3) {

      }
      persistPhase()
      refreshView()
      if (done >= exercisesTotal && prev < exercisesTotal && _phase < 3 && !_completionToastShown) {
        _phase = 3
        persistPhase()
        _completionToastShown = true
        const start = _startedAt || Date.now()
        const sec = Math.floor((Date.now() - start) / 1000)
        const mm = Math.floor(sec / 60)
        const ss = sec % 60
        const tiempo = mm > 0 ? `${mm} min ${ss} seg` : `${ss} seg`
        showCenterToast({
          svg: TOAST_IMG_TRAINER,
          message: 'Estira bb',
          subtitle: `Ya no tienes 20 añitos<br><span style="display:inline-flex;align-items:center;gap:4px;margin-top:4px"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> ${tiempo}</span>`,
          duration: 3000,
          accent,
          onDone: () => {
            refreshView()
          },
        })
      }
    }

    // ── Coach Analysis trigger ──
    const allPhasesComplete = _phase >= (hasStretch ? 4 : 3)
    if (allPhasesComplete && !_effortValue && !_coachCardMode && !_effortModalShowing && !document.getElementById('effort-overlay')) {
      _effortModalShowing = true
      setTimeout(() => {
        if (gen !== _mountGen) return
        if (_effortValue || _coachCardMode || document.getElementById('effort-overlay')) return
        showEffortSelector({
          accent,
          day,
          exercises,
          onEffort: async (effort) => {
            _coachDay = day
            _coachEffort = effort
            _effortValue = effort
            _effortModalShowing = false
            _coachLoading = true
            _coachCardMode = true
            _coachDay = day
            _coachEffort = effort
            refreshView()
            runCoachAnalysis(day, effort, day.duration || 60, exercises, settings, swaps).then(async (result) => {
              _coachResult = result
              _coachLoading = false
              const s = await Storage.getSettings()
              s.lastCoachAnalysis = { date: getToday(), effort: _coachEffort, ...result }
              await Storage.saveCoachAnalysis(s.lastCoachAnalysis)
              settings.lastCoachAnalysis = s.lastCoachAnalysis
              refreshView()
            }).catch(() => {
              _coachLoading = false
              refreshView()
            })
          }
        })
      }, 600)
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
  container.dataset.phase = kind
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
function LockedPhase({ title, detail, id }) {
  const div = document.createElement('div')
  if (id) div.id = id
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
  btn.dataset.exerciseId = ex.exerciseId || ex.id || ''
  btn.style.cssText = `background:#141414;border-radius:18px;padding:14px;border:0.5px solid rgba(255,255,255,0.06);cursor:pointer;text-align:left;display:flex;align-items:stretch;gap:14px;color:inherit;position:relative;transition:border-color 0.2s`

  const imgUrl = ex.imgUrl || (typeof getExerciseImageFromDictionary === 'function' ? getExerciseImageFromDictionary(ex.name || '') : '') || ''
  btn.innerHTML = `
    <div style="width:64px;height:64px;flex-shrink:0;border-radius:12px;position:relative;overflow:hidden;background:#1c1c1c;border:0.5px solid rgba(255,255,255,0.04)">${imgUrl ? `<img src="${imgUrl}" alt="" style="width:100%;height:100%;object-fit:cover">` : `<div style="width:100%;height:100%;background-image:repeating-linear-gradient(135deg,rgba(255,255,255,0.018) 0 12px,rgba(255,255,255,0.05) 12px 24px)"></div>`}</div>
    <div style="flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center">
      <div style="font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:600;color:#fafafa;letter-spacing:-0.3px;line-height:1.3;overflow-wrap:break-word">${ex.name}</div>
      <div style="font-size:12px;color:rgba(255,255,255,0.5);margin-top:3px">${ex.muscle}</div>
    </div>
    <div style="display:flex;flex-direction:column;align-items:flex-end;justify-content:flex-start;gap:4px;max-width:40%;padding-top:6px">
      <div style="font-family:'JetBrains Mono',monospace;font-size:22px;font-weight:500;color:#fafafa;letter-spacing:-0.8px;line-height:1;text-align:right;overflow-wrap:break-word">${ex.sets}<span style="color:rgba(255,255,255,0.35);margin:0 3px">×</span>${ex.reps}</div>
    </div>`

  const weightEl = document.createElement('div')
  weightEl.style.cssText = 'font-family:JetBrains Mono,monospace;font-size:11px;color:rgba(255,255,255,0.55);letter-spacing:0.2px;white-space:nowrap;font-weight:400'
  weightEl.id = `weight-${ex.exerciseId || ex.id}`
  btn.querySelector('div:last-child').appendChild(weightEl)

  btn.addEventListener('click', () => {
    if (!_startedAt) _startedAt = Date.now()
    onOpen(ex)
  })

  Storage.getLogsForDate(getToday()).then((logs) => {
    const log = logs.find((l) => l.exerciseId === (ex.exerciseId || ex.id))
    if (log) {
      btn.style.borderColor = `${accent}33`
      weightEl.innerHTML = `<span style="color:${accent};font-weight:500">${log.weight}${units}</span> <span style="font-size:8px;letter-spacing:1.2px;text-transform:uppercase;color:${accent}">hoy</span>`
      const badge = btn.querySelector('div:first-child')
      badge.innerHTML += `<div style="position:absolute;top:6px;right:6px;width:16px;height:16px;border-radius:50%;background:${accent};display:flex;align-items:center;justify-content:center;box-shadow:0 0 12px ${accent}66"><svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5l2.5 2.5L8 1" stroke="#0a0a0a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`
    } else if (_phase >= 3) {
      btn.style.borderColor = `${accent}33`
      weightEl.innerHTML = `<span style="color:${accent};font-weight:500">✓</span> <span style="font-size:8px;letter-spacing:1.2px;text-transform:uppercase;color:${accent}">hoy</span>`
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

// ── Coach Analysis Card (post-session) ──
function renderCoachCard(page, analysis, accent, dateStr, weekDayName, exercises, swaps) {
  const isLoading = _coachLoading
  let bodyHtml = ''
  if (isLoading) {
    bodyHtml = `
          <div style="display:flex;flex-direction:column;align-items:center;gap:14px;padding:8px 0">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation:spin 1s linear infinite">
              <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/>
              <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
              <line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/>
              <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
            </svg>
            <div style="font-family:'Space Grotesk',sans-serif;font-size:14px;color:rgba(255,255,255,0.6);letter-spacing:-0.05px">Analizando tu sesión…</div>
          </div>`
  } else if (analysis) {
    const verdictColor = analysis.verdict === 'positive' ? accent : analysis.verdict === 'warning' ? '#ff9f43' : 'rgba(255,255,255,0.85)'
    const verdictIcon = analysis.verdict === 'positive' ? '💪' : analysis.verdict === 'warning' ? '⚠️' : '👍'
    const recs = analysis.recommendations || []
    const recsHtml = recs.length > 0
      ? '<div style="margin-top:16px;border-top:0.5px solid rgba(255,255,255,0.06);padding-top:12px"><div style="font-family:\'JetBrains Mono\',monospace;font-size:9px;letter-spacing:1.4px;text-transform:uppercase;color:' + accent + ';font-weight:600;margin-bottom:8px">Recomendaciones</div>' + recs.map(r => '<div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:6px"><span style="color:' + accent + ';font-size:11px;flex-shrink:0">→</span><span style="font-size:13px;color:rgba(255,255,255,0.8);line-height:1.4">' + r + '</span></div>').join('') + '</div>'
      : ''
    const nextAdvice = analysis.next_session_advice
      ? '<div style="margin-top:12px;border-top:0.5px solid rgba(255,255,255,0.06);padding-top:12px"><div style="font-family:\'JetBrains Mono\',monospace;font-size:9px;letter-spacing:1.4px;text-transform:uppercase;color:' + accent + ';font-weight:600;margin-bottom:6px">Próxima sesión</div><div style="font-size:13px;color:rgba(255,255,255,0.7);line-height:1.5">' + analysis.next_session_advice + '</div></div>'
      : ''
    bodyHtml = `
          <div style="display:flex;gap:10px;align-items:flex-start">
            <div style="font-size:24px;flex-shrink:0;margin-top:2px">${verdictIcon}</div>
            <div style="font-family:'Space Grotesk',sans-serif;font-size:16px;line-height:1.65;color:${verdictColor};letter-spacing:-0.1px">${analysis.analysis}</div>
          </div>
          ${recsHtml}
          ${nextAdvice}
          <div style="margin-top:8px;display:flex;gap:6px;align-items:center">
            <span style="font-size:9px;font-family:'JetBrains Mono',monospace;letter-spacing:0.6px;color:rgba(255,255,255,0.2);text-transform:uppercase">${analysis._provider || 'llama'}</span>
          </div>`
  }
  page.innerHTML = `
    <div id="today-coach-card">
    <div style="padding:56px 20px 12px">
      <div style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:1.6px;color:rgba(255,255,255,0.45);text-transform:uppercase">${dateStr}</div>
      <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-top:4px">
        <div style="font-family:'Space Grotesk',sans-serif;font-size:38px;font-weight:700;color:#fafafa;letter-spacing:-1.5px;line-height:1">${weekDayName}.</div>
      </div>
    </div>
    <div style="padding:20px">
      <div id="coach-card-regen" style="border-radius:24px;border:0.5px solid rgba(255,255,255,0.06);background:#141414;padding:24px;overflow:hidden;position:relative;cursor:${isLoading ? 'default' : 'pointer'};transition:border-color 0.15s">
        <div style="position:absolute;top:-40px;right:-40px;width:200px;height:200px;border-radius:50%;background:${accent};opacity:0.08;filter:blur(60px)"></div>
        <div style="position:relative;z-index:1">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
            <div style="width:52px;height:52px;border-radius:14px;overflow:hidden;flex-shrink:0;box-shadow:0 4px 20px rgba(0,0,0,0.4)"><img src="data/Gemini_Generated_Image_skjbz4skjbz4skjb.png" alt="Pedro" style="width:100%;height:100%;object-fit:cover"></div>
            <div>
              <div style="font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:1.4px;text-transform:uppercase;color:${accent};font-weight:600">Tu coach Pedro</div>
              <div style="font-size:11px;color:rgba(255,255,255,0.45);margin-top:1px">${isLoading ? '' : 'Toca para regenerar ↻'}</div>
            </div>
          </div>
          ${bodyHtml}
        </div>
      </div>
    </div>
    </div>`

  // Regeneration handler (only when not loading)
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

// ── Effort Selector Modal ──
function showEffortSelector({ accent, day, exercises, onEffort }) {
  const overlay = document.createElement('div')
  overlay.id = 'effort-overlay'
  overlay.style.cssText = 'position:fixed;inset:0;z-index:200;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;padding:24px'
  const card = document.createElement('div')
  card.style.cssText = `background:#141414;border-radius:24px;padding:28px 24px;max-width:340px;width:100%;border:0.5px solid rgba(255,255,255,0.08);box-shadow:0 20px 60px rgba(0,0,0,0.5);animation:fadeUp 0.25s ease-out`
  card.innerHTML = `
    <div style="text-align:center;margin-bottom:20px">
      <div style="font-size:32px;margin-bottom:8px">🧑‍🏫</div>
      <div style="font-family:'Space Grotesk',sans-serif;font-size:20px;font-weight:700;color:#fafafa;letter-spacing:-0.3px">¿Cómo sentiste la sesión?</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.5);margin-top:6px">Esto ayuda a Pedro a darte mejor feedback</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:8px">
      <button class="effort-btn" data-effort="easy" style="padding:14px;border-radius:14px;border:0.5px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.04);cursor:pointer;text-align:left;display:flex;align-items:center;gap:12px;color:inherit;transition:all 0.15s">
        <div style="width:40px;height:40px;border-radius:10px;background:${accent}1a;display:flex;align-items:center;justify-content:center;font-size:20px;border:0.5px solid ${accent}33">💪</div>
        <div>
          <div style="font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:600;color:#fafafa">Fácil</div>
          <div style="font-size:11px;color:rgba(255,255,255,0.45);margin-top:2px">Podía más, para subir peso</div>
        </div>
      </button>
      <button class="effort-btn" data-effort="good" style="padding:14px;border-radius:14px;border:0.5px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.04);cursor:pointer;text-align:left;display:flex;align-items:center;gap:12px;color:inherit;transition:all 0.15s">
        <div style="width:40px;height:40px;border-radius:10px;background:${accent}1a;display:flex;align-items:center;justify-content:center;font-size:20px;border:0.5px solid ${accent}33">👍</div>
        <div>
          <div style="font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:600;color:#fafafa">Justo</div>
          <div style="font-size:11px;color:rgba(255,255,255,0.45);margin-top:2px">Peso correcto, lo planeado</div>
        </div>
      </button>
      <button class="effort-btn" data-effort="heavy" style="padding:14px;border-radius:14px;border:0.5px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.04);cursor:pointer;text-align:left;display:flex;align-items:center;gap:12px;color:inherit;transition:all 0.15s">
        <div style="width:40px;height:40px;border-radius:10px;background:${accent}1a;display:flex;align-items:center;justify-content:center;font-size:20px;border:0.5px solid ${accent}33">😮‍💨</div>
        <div>
          <div style="font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:600;color:#fafafa">Pesado</div>
          <div style="font-size:11px;color:rgba(255,255,255,0.45);margin-top:2px">Me costó trabajo</div>
        </div>
      </button>
      <button class="effort-btn" data-effort="failure" style="padding:14px;border-radius:14px;border:0.5px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.04);cursor:pointer;text-align:left;display:flex;align-items:center;gap:12px;color:inherit;transition:all 0.15s">
        <div style="width:40px;height:40px;border-radius:10px;background:rgba(255,107,107,0.12);display:flex;align-items:center;justify-content:center;font-size:20px;border:0.5px solid rgba(255,107,107,0.3)">🛑</div>
        <div>
          <div style="font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:600;color:#fafafa">Al fallo</div>
          <div style="font-size:11px;color:rgba(255,255,255,0.45);margin-top:2px">Llegué al fallo muscular, no daba más</div>
        </div>
      </button>
    </div>`
  overlay.appendChild(card)
  document.body.appendChild(overlay)

  card.querySelectorAll('.effort-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      overlay.remove()
      onEffort(btn.dataset.effort)
    })
  })
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
