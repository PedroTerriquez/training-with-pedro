// ── Today screen (Hoy) — reference visual: today.jsx + session.jsx ──

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

const TOPIC_LABELS = {
  comparativa: 'comparativa',
  racha: 'racha',
  esfuerzo_volumen: 'esfuerzo/vol',
  tiempo_intensidad: 'tiempo/intens',
  recuperacion: 'recuperación',
  progreso_global: 'progreso',
  retrospectiva_semanal: 'retrospectiva',
}

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
  page.style.cssText = 'height:100%;box-sizing:border-box;padding:58px 16px 104px;display:flex;flex-direction:column'
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
  if (settings.lastCoachAnalysis?.date === todayDate && settings.lastCoachAnalysis?.weekIdx === weekIdx) {
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

  if (!program && (!exercises || exercises.length === 0)) {
    renderEmptyState(page, { accent })
    return
  }

  if (!day || day.name === 'Rest' || day.name === 'Descanso') {
    renderRestDay(page, { weekDayName, dateStr, accent, weekObj, weekIdx })
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

  // Header — reference style: ● Hoy en el gimnasio + day name 42px + week chip + subtitle
  const header = document.createElement('div')
  header.style.cssText = 'flex-shrink:0;padding:0 4px 2px'
  header.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:1.8px;color:${accent};text-transform:uppercase;font-weight:600">
      <span style="width:6px;height:6px;border-radius:50%;background:${accent};box-shadow:0 0 8px ${accent};animation:pulse 2s infinite;display:inline-block"></span>
      Hoy en el gimnasio
    </div>
    <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin-top:7px">
      <div style="font-family:'Space Grotesk',sans-serif;font-size:42px;font-weight:700;color:#fafafa;letter-spacing:-1.8px;line-height:0.98">${day.name}</div>
      <div style="display:flex;align-items:center;gap:10px;flex-shrink:0">
        ${weekObj ? `<span class="pill" style="background:${accent}1c;color:${accent};margin-bottom:4px">${weekObj.name}${weekObj.tag ? ' · ' + weekObj.tag : ''}</span>` : ''}
        <div id="hero-rings" style="display:flex;align-items:center;flex-shrink:0"></div>
      </div>
    </div>
    <div style="margin-top:5px;font-size:13px;color:rgba(255,255,255,0.5)">${day.subtitle || ''}</div>
    ${isRescheduled ? `<div style="display:inline-flex;align-items:center;gap:5px;margin-top:9px;padding:4px 10px;border-radius:9999px;background:${accent}18;border:0.5px solid ${accent}3a;font-family:'JetBrains Mono',monospace;font-size:9.5px;letter-spacing:0.6px;text-transform:uppercase;color:${accent};font-weight:600">↔ Reprogramado · lo de ${DAYS_LONG[originalDayIdx]}</div>` : ''}`
  page.appendChild(header)

  // TimerRing — appended as DOM element (has event listeners)
  const ringsContainer = document.getElementById('hero-rings')
  const timerRingEl = TimerRing({ startedAt: _startedAt, endedAt: _endedAt, accent, complete: totalSteps > 0 && doneSteps === totalSteps, onReset: () => { _startedAt = null; _endedAt = null; refreshView() } })
  ringsContainer.appendChild(timerRingEl)
  const timerDisplayEl = timerRingEl.querySelector('[data-timer-display]')
  const timerSweepEl = timerRingEl.querySelector('[data-timer-sweep]')

  // ── Coach card or Phase cards ──
  if (_coachCardMode) {
    const analysis = (!_coachLoading && settings.lastCoachAnalysis?.date === getToday()) ? settings.lastCoachAnalysis : null
    renderCoachCard(page, analysis, accent, dateStr, weekDayName, exercises, swaps, weekIdx)
  } else {
  const sectionsWrap = document.createElement('div')
  sectionsWrap.style.cssText = 'flex:1;min-height:0;margin-top:16px;display:flex;flex-direction:column;gap:11px'
  page.appendChild(sectionsWrap)

  // Warmup
  if (hasWarmup) {
    const warmupNext = _phase < 2
    sectionsWrap.appendChild(PhaseCard({
      kind: 'warmup',
      phase: '01',
      title: 'Calentamiento',
      subtitle: 'Activación dinámica',
      accentColor: '#9bd1ff',
      movements: warmupItems,
      done: _phase >= 2,
      locked: false,
      isNext: warmupNext,
      onPlay: () => {
        mountWarmupDetail({
          items: warmupItems,
          mode: 'warmup',
          accent,
          onComplete: _phase < 2 ? () => {
            _phase = 2
            _phaseCardOpen = null
            persistPhase()
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
          } : undefined,
        })
      },
    }))
  }

  // Training
  const trainingDone = _phase >= 3
  const trainingLocked = hasWarmup && _phase < 2
  const trainingNext = !trainingDone && !trainingLocked

  function openFirstUnloggedExercise() {
    Storage.getLogsForDate(getToday()).then(todayLogs => {
      const firstUnlogged = day.exercises.find(ex => {
        const exId = resolveExId(ex.exerciseId || ex.id)
        return !todayLogs.some(l => l.exerciseId === exId && l.weight > 0)
      }) || day.exercises[0]
      if (firstUnlogged) {
        const resolved = { ...firstUnlogged, ...(exercisesById[resolveExId(firstUnlogged.exerciseId)] || {}) }
        onOpenExercise(resolved)
      }
    })
  }

  sectionsWrap.appendChild(PhaseCard({
    kind: 'training',
    phase: '02',
    title: 'Entrenamiento',
    subtitle: day.subtitle || `${day.exercises.length} ejercicios`,
    accentColor: accent,
    movements: day.exercises,
    done: trainingDone,
    locked: trainingLocked,
    isNext: trainingNext,
    progress: { done: exDone, total: exercisesTotal },
    onPlay: trainingLocked ? undefined : openFirstUnloggedExercise,
  }))

  // Stretch
  if (hasStretch) {
    const stretchDone = _phase >= 4
    const stretchLockedByWarmup = hasWarmup && _phase < 2
    const stretchLockedByTraining = !stretchLockedByWarmup && _phase < 3
    const stretchNext = !stretchDone && !stretchLockedByWarmup && !stretchLockedByTraining
    if (stretchDone) {
      sectionsWrap.appendChild(PhaseCard({
        kind: 'stretch',
        phase: '03',
        title: 'Estiramiento',
        subtitle: 'Enfriamiento estático',
        accentColor: '#c89bff',
        movements: stretchItems,
        done: true,
        locked: false,
        isNext: false,
        onPlay: () => {
          mountWarmupDetail({
            items: stretchItems,
            mode: 'stretch',
            accent,
            onComplete: undefined,
          })
        },
      }))
    } else if (stretchLockedByWarmup) {
      sectionsWrap.appendChild(LockedPhase({
        id: 'today-locked-warmup-stretch',
        title: 'Termina el calentamiento primero',
        detail: 'Tus estiramientos aparecerán cuando completes todos los ejercicios.',
      }))
    } else if (stretchLockedByTraining) {
      sectionsWrap.appendChild(LockedPhase({
        id: 'today-locked-training-stretch',
        title: 'Termina el entrenamiento primero',
        detail: `Completa los ${exercisesTotal - exDone} ejercicio(s) restante(s) para ver tus estiramientos.`,
      }))
    } else {
      sectionsWrap.appendChild(PhaseCard({
        kind: 'stretch',
        phase: '03',
        title: 'Estiramiento',
        subtitle: 'Enfriamiento estático',
        accentColor: '#c89bff',
        movements: stretchItems,
        done: false,
        locked: false,
        isNext: stretchNext,
        onPlay: () => {
          _stretchSheetShown = true
          mountWarmupDetail({
            items: stretchItems,
            mode: 'stretch',
            accent,
            onComplete: _phase < 4 ? () => {
              _phase = 4
              _phaseCardOpen = null
              persistPhase()
              refreshView()
            } : undefined,
          })
        },
      }))
    }
  }
  } // end else (normal phase cards)

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
      return logs.some(l => l.exerciseId === displayedId && l.weight > 0)
    }).length
    if (done !== _todayExDone) {
      const prev = _todayExDone
      _todayExDone = done
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
    if (allPhasesComplete && !_effortValue && !_coachCardMode && !_effortModalShowing && !document.getElementById('effort-overlay') && !document.getElementById('streak-overlay')) {
      const showEffort = () => {
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
                s.lastCoachAnalysis = { date: getToday(), effort: _coachEffort, weekIdx, ...result }
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
      if (settings.streakShownDate !== getToday()) {
        computeStreak(getToday()).then(streak => {
          if (gen !== _mountGen) return
          if (_effortValue || _coachCardMode || _effortModalShowing || document.getElementById('effort-overlay') || document.getElementById('streak-overlay')) return
          showStreakCelebration({
            streak: Math.max(1, streak),
            accent,
            onDone: () => {
              settings.streakShownDate = getToday()
              Storage.saveSettings(settings)
              showEffort()
            },
          })
        })
      } else {
        showEffort()
      }
    }
  })
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

// ── Phase Card (warmup / training / stretch) — SectionCard reference style ──
function PhaseCard({ kind, phase, title, subtitle, accentColor, done, onPlay, locked, movements, isNext, progress }) {
  const container = document.createElement('div')
  container.dataset.phase = kind
  const a = accentColor

  const kindGlyph = (knd, clr) => {
    if (knd === 'warmup') return `<svg width="150" height="150" viewBox="0 0 20 20" fill="none"><path d="M10 17.5c3.31 0 6-2.69 6-6 0-2.5-1.5-4.5-3-6-1 1.5-2 2-2 2s-1-2.5-1-5c-2 1.5-6 4-6 9 0 3.31 2.69 6 6 6z" stroke="${clr}" stroke-width="1.4" stroke-linejoin="round" fill="${clr}" fill-opacity="0.12"/></svg>`
    if (knd === 'training') return `<svg width="150" height="150" viewBox="0 0 20 20" fill="none"><path d="M3 7v6M5.5 5.5v9M14.5 5.5v9M17 7v6M5.5 10h9" stroke="${clr}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`
    return `<svg width="150" height="150" viewBox="0 0 20 20" fill="none"><path d="M10 17c3.5-2 7-5 7-9 0-1-.5-2-1.5-3-3 2-7 4-7 9 0 1 .5 2 1.5 3z" stroke="${clr}" stroke-width="1.4" stroke-linejoin="round" fill="${clr}" fill-opacity="0.12"/><path d="M10 17c-3.5-2-7-5-7-9 0-1 .5-2 1.5-3 3 2 7 4 7 9 0 1-.5 2-1.5 3z" stroke="${clr}" stroke-width="1.4" stroke-linejoin="round" fill="${clr}" fill-opacity="0.05"/></svg>`
  }

  const meta = movements ? `${movements.length} movimientos` : subtitle
  const pct = progress ? (progress.total > 0 ? (progress.done / progress.total) * 100 : 0) : null

  container.style.cssText = `flex:1;min-height:0;position:relative;overflow:hidden;border-radius:22px;cursor:${locked ? 'default' : 'pointer'};padding:18px 18px 16px;box-sizing:border-box;background:${done ? `linear-gradient(150deg, ${a}1f 0%, #131313 60%)` : '#141414'};border:${locked ? '0.5px dashed rgba(255,255,255,0.08)' : done ? `1px solid ${a}` : isNext ? `1px solid ${a}66` : '0.5px solid rgba(255,255,255,0.07)'};box-shadow:${locked ? 'none' : done ? `0 0 0 4px ${a}12, 0 10px 30px ${a}1a` : isNext ? `0 8px 28px ${a}12` : 'none'};opacity:${locked ? 0.55 : 1};display:flex;flex-direction:column;justify-content:space-between;transition:border-color 0.3s, box-shadow 0.3s, background 0.3s`
  container.innerHTML = `
    <div style="position:absolute;right:-18px;bottom:-22px;opacity:${done ? 0.16 : 0.05};color:${a};pointer-events:none;transition:opacity 0.3s">${kindGlyph(kind, a)}</div>
    ${!locked && (done || isNext) ? `<div style="position:absolute;top:-70px;left:-40px;width:200px;height:200px;border-radius:50%;background:${a};opacity:${done ? 0.12 : 0.07};filter:blur(60px);pointer-events:none"></div>` : ''}
    <div style="position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:8px">
      <div style="display:flex;align-items:center;gap:7px;font-family:'JetBrains Mono',monospace;font-size:9.5px;letter-spacing:1.5px;text-transform:uppercase;color:${done ? a : 'rgba(255,255,255,0.42)'};font-weight:600">
        <span>Fase ${phase}</span>
      </div>
      ${done ? `<span style="display:inline-flex;align-items:center;gap:5px;padding:4px 9px 4px 7px;border-radius:9999px;background:${a};font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:1.2px;text-transform:uppercase;font-weight:700;color:#0a0a0a;box-shadow:0 4px 12px ${a}55"><svg width="10" height="8" viewBox="0 0 11 9" fill="none"><path d="M1 4.5l3 3L10 1" stroke="#0a0a0a" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>Completado</span>`
        : isNext ? `<span style="display:inline-flex;align-items:center;gap:5px;padding:4px 9px;border-radius:9999px;background:${a}1a;border:0.5px solid ${a}40;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:1.2px;text-transform:uppercase;font-weight:600;color:${a}"><span style="width:5px;height:5px;border-radius:50%;background:${a};box-shadow:0 0 6px ${a};display:inline-block"></span>Sigue</span>` : ''}
    </div>
    <div style="position:relative;z-index:1">
      <div style="font-family:'Space Grotesk',sans-serif;font-size:27px;font-weight:700;color:#fafafa;letter-spacing:-0.8px;line-height:1">${title}</div>
      <div style="margin-top:4px;font-size:12.5px;color:rgba(255,255,255,0.5);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${subtitle}</div>
    </div>
    <div style="position:relative;z-index:1;display:flex;align-items:flex-end;justify-content:space-between;gap:12px">
      <div style="min-width:0">
        <div style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.3px;color:rgba(255,255,255,0.62);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${meta}</div>
        ${progress ? `<div style="margin-top:7px;display:flex;align-items:center;gap:7px"><div style="width:64px;height:4px;border-radius:2px;background:rgba(255,255,255,0.1);overflow:hidden"><div style="height:100%;border-radius:2px;background:${a};width:${pct}%;transition:width 0.4s"></div></div><span style="font-family:'JetBrains Mono',monospace;font-size:10px;color:${progress.done > 0 ? a : 'rgba(255,255,255,0.45)'};letter-spacing:0.4px">${progress.done}/${progress.total}</span></div>` : ''}
      </div>
      <div style="width:56px;height:56px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:${done ? 'transparent' : locked ? 'rgba(255,255,255,0.05)' : a};border:${done ? `1.5px solid ${a}` : locked ? '0.5px solid rgba(255,255,255,0.08)' : '0'};box-shadow:${done || locked ? 'none' : `0 8px 22px ${a}55`};transition:all 0.2s">${done ? `<svg width="22" height="17" viewBox="0 0 22 17" fill="none"><path d="M1 9l6.5 6.5L21 1.5" stroke="${a}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>` : locked ? `<svg width="20" height="22" viewBox="0 0 20 22" fill="none" style="margin-left:3px"><path d="M3 2.6v16.8a1 1 0 001.52.85l13.8-8.4a1 1 0 000-1.7L4.52 1.75A1 1 0 003 2.6z" fill="rgba(255,255,255,0.25)"/></svg>` : `<svg width="20" height="22" viewBox="0 0 20 22" fill="none" style="margin-left:3px"><path d="M3 2.6v16.8a1 1 0 001.52.85l13.8-8.4a1 1 0 000-1.7L4.52 1.75A1 1 0 003 2.6z" fill="#0a0a0a"/></svg>`}</div>
    </div>`

  if (!locked && onPlay) {
    container.addEventListener('click', onPlay)
  }
  return container
}

// ── Locked Phase ──
function LockedPhase({ title, detail, id }) {
  const div = document.createElement('div')
  if (id) div.id = id
  div.style.cssText = 'flex:1;min-height:0;border-radius:22px;padding:18px 18px 16px;box-sizing:border-box;background:rgba(255,255,255,0.02);border:0.5px dashed rgba(255,255,255,0.12);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;text-align:center'
  div.innerHTML = `
    <svg width="22" height="22" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="7" rx="1.5" stroke="rgba(255,255,255,0.3)" stroke-width="1.4"/><path d="M5 7V5a3 3 0 016 0v2" stroke="rgba(255,255,255,0.3)" stroke-width="1.4"/></svg>
    <div style="font-family:'Space Grotesk',sans-serif;font-size:15px;font-weight:600;color:rgba(255,255,255,0.5);letter-spacing:-0.2px;line-height:1.3">${title}</div>
    <div style="font-size:12px;color:rgba(255,255,255,0.35);line-height:1.4">${detail}</div>`
  return div
}

// ── Coach Analysis — SessionSummary reference style ──
async function renderCoachCard(page, analysis, accent, dateStr, weekDayName, exercises, swaps, weekIdx) {
  const isLoading = _coachLoading
  const items = _coachDay?.exercises?.map(e => ({ name: e.name, muscle: e.muscle })) || []

  let volume = 0
  let prCount = 0
  try {
    const todayLogs = await Storage.getLogsForDate(getToday())
    const dayExercises = _coachDay?.exercises || []
    for (const log of todayLogs) {
      if (!log.weight) continue
      const progEx = dayExercises.find(e => (swaps[e.exerciseId] || e.exerciseId) === log.exerciseId)
      const sets = log.sets ?? progEx?.sets ?? 0
      let reps = log.reps ?? progEx?.reps ?? 0
      if (typeof reps === 'string') reps = parseInt(reps) || 0
      volume += log.weight * sets * reps
    }
    const exIds = [...new Set(todayLogs.map(l => l.exerciseId))]
    for (const exId of exIds) {
      const todayLog = todayLogs.find(l => l.exerciseId === exId && l.weight > 0)
      if (!todayLog) continue
      const allLogs = await Storage.getLogsForExercise(exId)
      const prevLogs = allLogs.filter(l => l.date !== getToday() && l.weight > 0)
      if (prevLogs.length > 0 && todayLog.weight > 0 && todayLog.weight >= Math.max(...prevLogs.map(l => l.weight))) prCount++
    }
  } catch (e) { /* fallback to 0 */ }

  const wrap = document.createElement('div')
  wrap.style.cssText = 'flex:1;min-height:0;overflow-y:auto;margin-top:16px'
  page.appendChild(wrap)

  let bodyHtml = ''
  if (isLoading) {
    bodyHtml = `<div style="margin-top:16px;display:flex;align-items:center;gap:10px">
      <div style="width:20px;text-align:center">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation:spin 1s linear infinite"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>
      </div>
      <span style="font-size:13px;color:rgba(255,255,255,0.55)">Analizando tu entrenamiento…</span>
    </div>`
  } else if (analysis) {
    const destacados = analysis.recommendations?.slice(0, 3) || []
    const consejos = analysis.next_session_advice ? [analysis.next_session_advice] : []
    const resumen = analysis.analysis || ''
    bodyHtml = `
      <div style="margin-top:12px;font-size:14.5px;line-height:1.55;color:rgba(255,255,255,0.9);font-family:'Space Grotesk',sans-serif;letter-spacing:-0.1px">${resumen}</div>
      ${destacados.length > 0 ? `<div style="display:flex;flex-wrap:wrap;gap:7px;margin-top:14px">${destacados.map(d => `<span style="display:inline-flex;align-items:center;gap:5px;padding:6px 11px;border-radius:9999px;background:${accent}16;border:0.5px solid ${accent}3a;font-family:'Space Grotesk',sans-serif;font-size:11.5px;font-weight:600;color:${accent}"><span style="width:4px;height:4px;border-radius:50%;background:${accent};display:inline-block"></span>${d}</span>`).join('')}</div>` : ''}
      ${consejos.length > 0 ? `<div style="margin-top:16px;padding-top:14px;border-top:0.5px solid rgba(255,255,255,0.07)"><div style="font-family:'JetBrains Mono',monospace;font-size:9.5px;letter-spacing:1.4px;text-transform:uppercase;color:rgba(255,255,255,0.45);font-weight:600;margin-bottom:10px">Consejos</div><div style="display:flex;flex-direction:column;gap:11px">${consejos.map((c, i) => `<div style="display:flex;gap:11px;align-items:flex-start"><div style="font-family:'JetBrains Mono',monospace;font-size:12px;color:${accent};opacity:0.7;width:16px;flex-shrink:0;padding-top:1px;text-align:right">${String(i + 1).padStart(2, '0')}</div><div style="flex:1;font-size:13px;line-height:1.5;color:rgba(255,255,255,0.82);font-family:'Space Grotesk',sans-serif;letter-spacing:-0.1px">${c}</div></div>`).join('')}</div></div>` : ''}
      <div style="margin-top:12px;display:flex;align-items:center;gap:8px;font-size:9px;font-family:'JetBrains Mono',monospace;letter-spacing:0.6px;text-transform:uppercase">
        <span style="color:rgba(255,255,255,0.35)">${TOPIC_LABELS[analysis._topic] || analysis._topic || ''}</span>
      </div>`
  }

  wrap.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
      <div style="background:#141414;border-radius:16px;padding:14px 12px;border:0.5px solid rgba(255,255,255,0.06);text-align:center">
        <div style="font-family:'JetBrains Mono',monospace;font-size:26px;font-weight:500;color:#fafafa;letter-spacing:-1px;line-height:1">${items.length}</div>
        <div style="margin-top:6px;font-family:'JetBrains Mono',monospace;font-size:8.5px;letter-spacing:1.2px;text-transform:uppercase;color:rgba(255,255,255,0.45)">Ejercicios</div>
      </div>
      <div style="background:#141414;border-radius:16px;padding:14px 12px;border:0.5px solid rgba(255,255,255,0.06);text-align:center">
        <div style="font-family:'JetBrains Mono',monospace;font-size:26px;font-weight:500;color:#fafafa;letter-spacing:-1px;line-height:1">${volume > 0 ? Math.round(volume) : '—'}</div>
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
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="${accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/><circle cx="12" cy="12" r="10"/></svg>
          </span>
          Resumen del coach
        </div>
        ${bodyHtml}
      </div>
    </div>
    <button id="coach-card-reset" style="margin-top:16px;width:100%;padding:13px;border-radius:12px;cursor:pointer;background:transparent;border:0.5px solid rgba(255,255,255,0.12);color:rgba(255,255,255,0.6);font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:600;letter-spacing:-0.1px;display:flex;align-items:center;justify-content:center;gap:7px">
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M13 8a5 5 0 11-1.5-3.6M13 2v3h-3" stroke="rgba(255,255,255,0.6)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      Reiniciar día
    </button>`

  if (!isLoading && _coachDay && _coachEffort) {
    const regenEl = wrap.querySelector('#coach-card-regen')
    if (regenEl) {
      regenEl.addEventListener('click', async () => {
        _coachLoading = true; _coachResult = null
        if (typeof window.appRefresh === 'function') window.appRefresh()
        const s = await Storage.getSettings()
        try {
          const result = await runCoachAnalysis(_coachDay, _coachEffort, _coachDay.duration || 60, exercises || [], s, swaps || {})
          _coachResult = result; _coachLoading = false
          const settings = await Storage.getSettings()
          settings.lastCoachAnalysis = { date: getToday(), effort: _coachEffort, weekIdx, ...result }
          await Storage.saveCoachAnalysis(settings.lastCoachAnalysis)
          if (typeof window.appRefresh === 'function') window.appRefresh()
        } catch { _coachLoading = false; if (typeof window.appRefresh === 'function') window.appRefresh() }
      })
    }
    const resetEl = wrap.querySelector('#coach-card-reset')
    if (resetEl) {
      resetEl.addEventListener('click', async () => {
        const s = await Storage.getSettings()
        delete s.lastCoachAnalysis
        await Storage.saveSettings(s)
        _coachCardMode = false
        _coachLoading = false
        _coachResult = null
        _coachDay = null
        _coachEffort = null
        if (typeof window.appRefresh === 'function') window.appRefresh()
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


// ── Streak (weekly grouping) ──
function getMonday(date) {
  const d = new Date(date)
  const monOffset = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - monOffset)
  d.setHours(12, 0, 0, 0)
  return d
}

function formatDate(d) { return d.toISOString().slice(0, 10) }

async function computeStreak(todayDateStr) {
  const allLogs = await Storage.getAllLogs()
  const trained = new Set()
  for (const log of allLogs) {
    if (log.weight && log.weight > 0) trained.add(log.date)
  }
  const today = new Date(todayDateStr + 'T12:00:00Z')
  const currentMonday = getMonday(today)
  let streak = 0
  for (let i = 0; i < 7; i++) {
    const d = new Date(currentMonday)
    d.setDate(currentMonday.getDate() + i)
    if (d > today) break
    if (trained.has(formatDate(d))) streak++
  }
  let weekStart = new Date(currentMonday)
  weekStart.setDate(weekStart.getDate() - 7)
  while (true) {
    let count = 0
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart)
      d.setDate(weekStart.getDate() + i)
      if (trained.has(formatDate(d))) count++
    }
    if (count >= 4) { streak += 7; weekStart.setDate(weekStart.getDate() - 7) }
    else break
  }
  return streak
}

function showStreakCelebration({ streak, accent, onDone }) {
  const overlay = document.createElement('div')
  overlay.id = 'streak-overlay'
  overlay.style.cssText = 'position:fixed;inset:0;z-index:300;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;padding:24px;animation:fadeIn 0.3s ease'

  const box = document.createElement('div')
  box.style.cssText = 'display:flex;flex-direction:column;align-items:center'

  const flame = document.createElement('div')
  flame.style.cssText = 'font-size:80px;line-height:1;animation:flameBounce 0.6s ease infinite alternate'
  flame.textContent = '🔥'

  const count = document.createElement('div')
  count.style.cssText = "font-family:'Space Grotesk',sans-serif;font-size:96px;font-weight:700;color:#fafafa;letter-spacing:-4px;line-height:1;margin-top:4px"
  count.textContent = '0'

  const label = document.createElement('div')
  label.style.cssText = "font-family:'JetBrains Mono',monospace;font-size:13px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.5);margin-top:6px"
  label.textContent = 'Días consecutivos'

  const sub = document.createElement('div')
  sub.style.cssText = `font-family:'Space Grotesk',sans-serif;font-size:17px;font-weight:600;color:${accent};margin-top:14px;opacity:0;animation:fadeUp 0.4s ease 0.8s forwards`
  sub.textContent = '¡Sigue así!'

  box.append(flame, count, label, sub)
  overlay.appendChild(box)
  document.body.appendChild(overlay)

  let current = 0
  const steps = Math.min(streak, 30)
  const inc = Math.max(1, Math.ceil(streak / steps))
  const interval = setInterval(() => {
    current = Math.min(current + inc, streak)
    count.textContent = current
    if (current >= streak) clearInterval(interval)
  }, 40)

  setTimeout(() => {
    overlay.style.transition = 'opacity 0.3s ease'
    overlay.style.opacity = '0'
    setTimeout(() => {
      overlay.remove()
      onDone()
    }, 300)
  }, 2600)
}

// ── Rest Day ──
function renderRestDay(container, { weekDayName, dateStr, accent, weekObj, weekIdx }) {
  container.innerHTML = `
    <div style="padding:58px 20px 0">
      <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:1.8px;color:${accent};text-transform:uppercase;font-weight:600">Hoy</div>
      <div style="font-family:'Space Grotesk',sans-serif;font-size:42px;font-weight:700;color:#fafafa;letter-spacing:-1.8px;line-height:1;margin-top:6px">Descanso.</div>
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

// ── Empty State (first-time user, no data) ──
function renderEmptyState(page, { accent }) {
  page.innerHTML = `
    <div style="flex:1;display:flex;flex-direction:column;padding:58px 20px 0">
      <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:1.8px;color:${accent};text-transform:uppercase;font-weight:600">Bienvenido</div>
      <div style="font-family:'Space Grotesk',sans-serif;font-size:42px;font-weight:700;color:#fafafa;letter-spacing:-1.8px;line-height:1;margin-top:6px">Entrenemos.</div>
      <div style="margin-top:20px;padding:24px;border-radius:22px;background:linear-gradient(155deg,#1a1a1a 0%,#0e0e0e 100%);border:0.5px solid rgba(255,255,255,0.08);position:relative;overflow:hidden">
        <div style="position:absolute;top:-40px;right:-40px;width:200px;height:200px;border-radius:50%;background:${accent};opacity:0.08;filter:blur(60px);pointer-events:none"></div>
        <div style="position:relative;z-index:1">
          <div style="width:40px;height:40px;border-radius:12px;background:${accent}1a;display:flex;align-items:center;justify-content:center;font-size:20px;margin-bottom:14px;border:0.5px solid ${accent}33">🔒</div>
          <div style="font-family:'Space Grotesk',sans-serif;font-size:20px;font-weight:700;color:#fafafa;letter-spacing:-0.6px;line-height:1.15">Tus datos, solo en tu teléfono</div>
          <div style="margin-top:10px;font-size:13.5px;color:rgba(255,255,255,0.6);line-height:1.55">Esta app no almacena nada en servidores. Todo lo que registras — ejercicios, pesos, programas — vive únicamente en este celular.</div>
          <div style="margin-top:18px;padding:14px;border-radius:14px;background:rgba(255,255,255,0.03);border:0.5px solid rgba(255,255,255,0.06)">
            <div style="display:flex;align-items:center;gap:8px;font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:600;color:#fafafa;letter-spacing:-0.2px">
              <span>📋</span>
              <span>No pierdas tu progreso</span>
            </div>
            <div style="margin-top:6px;font-size:12.5px;color:rgba(255,255,255,0.5);line-height:1.5">Haz un respaldo cada 2 semanas desde <strong style="color:${accent}">Perfil → Datos → Exportar</strong>. Así siempre podrás recuperar tu historial si algo le pasa al teléfono.</div>
          </div>
          <button id="empty-state-start" style="margin-top:20px;width:100%;padding:15px;border-radius:14px;border:none;background:${accent};color:#0a0a0a;font-family:'Space Grotesk',sans-serif;font-size:15px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;letter-spacing:-0.2px">
            Comenzar
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>
      <div style="margin-top:auto;text-align:center;padding:24px 0 30px">
        <div style="font-size:12px;color:rgba(255,255,255,0.3);font-family:'JetBrains Mono',monospace;letter-spacing:1px">Toca Comenzar para configurar tu rutina</div>
      </div>
    </div>`
  
  document.getElementById('empty-state-start')?.addEventListener('click', () => {
    window.location.hash = 'you'
  })
}
