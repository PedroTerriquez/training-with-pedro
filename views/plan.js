// ── Plan screen ──
// Week selector + day grid + day-level reschedule editor
// Order is always 7 elements (Mon-Sun). Empty slots show "Libre".

let _planWeekIdx = 0
let _planExpandedDayIdx = null
let _planAutoExpanded = false
let _planEditing = false
let _planSelectedSwapIdx = null
let _planEditingOrder = null

const DAY_NAMES_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

function mountPlan(container, { program, weekIdx, dayIndex, accent, onOpenExercise, onWeekChange, exercises, rescheduleOrder, onUpdateRescheduleOrder }) {
  container.innerHTML = ''
  const page = document.createElement('div')
  page.className = 'page'
  container.appendChild(page)

  if (!program) {
    page.innerHTML = `<div style="padding:56px 20px;text-align:center;color:rgba(255,255,255,0.4);font-size:14px">Ningún programa seleccionado. Ve a Tú para crear uno.</div>`
    return
  }

  const weeks = program.weeks || []
  _planWeekIdx = typeof weekIdx === 'number' ? weekIdx : _planWeekIdx
  if (_planWeekIdx >= weeks.length) _planWeekIdx = 0

  const week = weeks[_planWeekIdx] || weeks[0]
  const defaultOrder = [0, 1, 2, 3, 4, 5, 6]
  const committedOrder = (rescheduleOrder && rescheduleOrder.length === 7) ? rescheduleOrder : defaultOrder
  const exercisesById = Object.fromEntries((exercises || []).map(e => [e.id, e]))

  const order = _planEditing ? (_planEditingOrder || committedOrder) : committedOrder
  const changes = committedOrder.reduce((n, v, i) => n + (v !== i ? 1 : 0), 0)
  const currentWeekIdx = typeof weekIdx === 'number' ? weekIdx : 0

  // Header with Reprogramar / Listo toggle
  const header = document.createElement('div')
  header.style.cssText = 'padding:56px 20px 16px;display:flex;align-items:flex-end;justify-content:space-between;gap:12px'
  header.innerHTML = `
    <div style="min-width:0">
      <div style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:1.6px;color:rgba(255,255,255,0.45);text-transform:uppercase">${_planEditing ? 'Reprogramar' : 'Tu programa'}</div>
      <div style="font-family:'Space Grotesk',sans-serif;font-size:38px;font-weight:700;color:#fafafa;letter-spacing:-1.5px;line-height:1;margin-top:4px">${_planEditing ? 'Mover.' : 'Plan.'}</div>
    </div>
    <button id="plan-reprogram-btn" style="flex-shrink:0;padding:9px 15px;border-radius:9999px;cursor:pointer;border:${_planEditing ? '0' : `0.5px solid ${accent}55`};background:${_planEditing ? accent : 'transparent'};color:${_planEditing ? '#0a0a0a' : accent};font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:700;letter-spacing:-0.1px;display:flex;align-items:center;gap:6px;margin-bottom:2px">
      ${_planEditing ? 'Listo' : `<svg width="15" height="15" viewBox="0 0 17 17" fill="none"><path d="M11.5 2.5l3 3-3 3M14 5.5H5.5a3 3 0 00-3 3M5.5 14.5l-3-3 3-3M3 11.5h8.5a3 3 0 003-3" stroke="${accent}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg> Reprogramar`}
    </button>`

  const reprogramBtn = header.querySelector('#plan-reprogram-btn')
  reprogramBtn.addEventListener('click', () => {
    if (_planEditing) {
      if (typeof onUpdateRescheduleOrder === 'function' && _planEditingOrder) {
        onUpdateRescheduleOrder(_planEditingOrder)
      }
      _planEditing = false
      _planSelectedSwapIdx = null
      _planEditingOrder = null
    } else {
      _planEditing = true
      _planEditingOrder = [...committedOrder]
      _planSelectedSwapIdx = null
      _planWeekIdx = currentWeekIdx
      mountPlan(container, { program, weekIdx, dayIndex, accent, onOpenExercise, onWeekChange, exercises, rescheduleOrder, onUpdateRescheduleOrder })
    }
  })
  page.appendChild(header)

  // ── Editing mode ──
  if (_planEditing) {
    renderPlanEditing(page, { week, order: _planEditingOrder, accent, currentWeekIdx, defaultOrder, container, planProps: { program, weekIdx, dayIndex, accent, onOpenExercise, onWeekChange, exercises, rescheduleOrder, onUpdateRescheduleOrder } })
    return
  }

  // ── Normal mode ──

  // Changes banner
  if (changes > 0) {
    const bannerWrap = document.createElement('div')
    bannerWrap.style.cssText = 'padding:0 20px;margin-bottom:14px'
    bannerWrap.innerHTML = `
      <button id="plan-changes-banner" style="width:100%;text-align:left;cursor:pointer;background:${accent}0d;border:0.5px solid ${accent}33;border-radius:14px;padding:11px 14px;display:flex;align-items:center;gap:10px;color:inherit">
        <div style="width:7px;height:7px;border-radius:50%;background:${accent};box-shadow:0 0 7px ${accent};flex-shrink:0"></div>
        <div style="flex:1;min-width:0">
          <div style="font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:600;color:#fafafa;letter-spacing:-0.2px">Semana reprogramada · ${changes} ${changes === 1 ? 'cambio' : 'cambios'}</div>
          <div style="font-size:10.5px;color:rgba(255,255,255,0.5);margin-top:1px">Temporal · 7 días</div>
        </div>
        <span style="font-family:'Space Grotesk',sans-serif;font-size:12px;font-weight:700;color:${accent};flex-shrink:0">Editar</span>
      </button>`
    const bannerBtn = bannerWrap.querySelector('#plan-changes-banner')
    bannerBtn.addEventListener('click', () => {
      _planEditing = true
      _planEditingOrder = [...committedOrder]
      _planSelectedSwapIdx = null
      mountPlan(container, { program, weekIdx, dayIndex, accent, onOpenExercise, onWeekChange, exercises, rescheduleOrder, onUpdateRescheduleOrder })
    })
    page.appendChild(bannerWrap)
  }

  // Week tabs
  if (weeks.length > 0) {
    const tabs = document.createElement('div')
    tabs.id = 'plan-week-tabs'
    tabs.style.cssText = 'padding:0 20px;display:flex;gap:8px;margin-bottom:18px'
    weeks.forEach((w, i) => {
      const on = _planWeekIdx === i
      const btn = document.createElement('button')
      btn.dataset.weekIndex = i
      btn.style.cssText = `flex:1;padding:12px 8px;border:0;cursor:pointer;background:${on ? '#1f1f1f' : 'transparent'};border:${on ? `0.5px solid ${w.accent || accent}66` : '0.5px solid rgba(255,255,255,0.06)'};border-radius:14px;color:${on ? '#fafafa' : 'rgba(255,255,255,0.5)'};text-align:left;position:relative`
      btn.innerHTML = `
        <div style="font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:1.4px;color:${on ? (w.accent || accent) : 'rgba(255,255,255,0.4)'};text-transform:uppercase">${w.tag || ''}</div>
        <div style="font-family:'Space Grotesk',sans-serif;font-size:15px;font-weight:700;margin-top:2px;letter-spacing:-0.3px">${w.name}</div>
        <div style="font-size:11px;color:rgba(255,255,255,0.45);margin-top:1px">${w.subtitle || ''}</div>`
      btn.addEventListener('click', async () => {
        _planWeekIdx = i
        _planExpandedDayIdx = null
        _planAutoExpanded = false
        const s = await Storage.getSettings()
        s.currentWeekIdx = i
        await Storage.saveSettings(s)
        if (typeof onWeekChange === 'function') onWeekChange(i)
        else mountPlan(container, { program, weekIdx: i, dayIndex, accent, onOpenExercise, exercises, rescheduleOrder, onUpdateRescheduleOrder })
      })
      tabs.appendChild(btn)
    })
    page.appendChild(tabs)

    // Auto-expand today's day on initial render and week switches
    if (_planExpandedDayIdx === null && !_planAutoExpanded) {
      _planExpandedDayIdx = typeof dayIndex === 'number' && dayIndex >= 0 ? dayIndex : 0
      _planAutoExpanded = true
    }

    // Days grid — always 7 slots (Mon-Sun)
    const daysGrid = document.createElement('div')
    daysGrid.id = 'plan-days-grid'
    daysGrid.style.cssText = 'padding:0 20px;display:flex;flex-direction:column;gap:10px'
    for (let i = 0; i < 7; i++) {
      const originalIdx = order[i]
      const hasWorkout = originalIdx < week.days.length
      const day = hasWorkout ? week.days[originalIdx] : null
      const isToday = i === dayIndex && _planWeekIdx === currentWeekIdx
      const isMoved = hasWorkout && originalIdx !== i
      const isRest = !hasWorkout || day.name === 'Rest' || day.name === 'Descanso'
      const isExpanded = _planExpandedDayIdx === i

      const dayContainer = document.createElement('div')
      dayContainer.dataset.dayIndex = i
      dayContainer.style.cssText = `background:#141414;border-radius:18px;border:${isToday ? `1px solid ${accent}` : '0.5px solid rgba(255,255,255,0.06)'};overflow:hidden`

      const card = document.createElement('div')
      card.style.cssText = `padding:16px;position:relative;display:flex;gap:14px;align-items:center`
      if (hasWorkout && !isRest) card.style.cursor = 'pointer'

      card.innerHTML = `
        <div style="width:42px;height:42px;flex-shrink:0;border-radius:12px;background:${isRest ? 'rgba(155,209,255,0.1)' : 'rgba(255,255,255,0.05)'};display:flex;flex-direction:column;align-items:center;justify-content:center;border:${isToday ? `0.5px solid ${accent}` : '0.5px solid rgba(255,255,255,0.05)'}">
          <div style="font-family:'JetBrains Mono',monospace;font-size:8px;letter-spacing:1.2px;color:rgba(255,255,255,0.45);text-transform:uppercase">${DAY_NAMES_SHORT[i]}</div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:16px;font-weight:500;color:#fafafa;line-height:1">${i + 1}</div>
        </div>
        <div style="flex:1;min-width:0">
          ${hasWorkout ? `
          <div style="display:flex;align-items:center;gap:6px">
            <div style="font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:600;color:#fafafa;letter-spacing:-0.3px">${day.name}</div>
            ${isToday ? `<div style="width:6px;height:6px;border-radius:50%;background:${accent};box-shadow:0 0 6px ${accent}"></div>` : ''}
          </div>
          <div style="font-size:11px;color:rgba(255,255,255,0.5);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${day.subtitle || ''}</div>
          ${isMoved ? `<div style="display:inline-flex;align-items:center;gap:4px;margin-top:6px;padding:3px 8px;border-radius:9999px;background:${accent}18;border:0.5px solid ${accent}3a;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.8px;text-transform:uppercase;color:${accent};font-weight:600;white-space:nowrap">↔ desde ${DAY_NAMES_SHORT[originalIdx]}</div>` : ''}
          ` : `
          <div style="font-family:'Space Grotesk',sans-serif;font-size:15px;font-weight:500;color:rgba(255,255,255,0.35)">Sin entrenamiento</div>
          `}
        </div>
        <div style="text-align:right">
          ${hasWorkout && !isRest ? `
            <div style="font-family:'JetBrains Mono',monospace;font-size:14px;color:#fafafa;font-weight:500">${day.exercises.length}</div>
            <div style="font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:1.2px;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-top:1px">ejercicios</div>
          ` : `<div style="font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:1.2px;text-transform:uppercase;color:#9bd1ff">${isRest ? 'DESC' : '—'}</div>`}
        </div>`

      if (hasWorkout && !isRest) {
        card.addEventListener('click', () => {
          _planExpandedDayIdx = isExpanded ? null : i
          mountPlan(container, { program, weekIdx: _planWeekIdx, dayIndex, accent, onOpenExercise, onWeekChange, exercises, rescheduleOrder, onUpdateRescheduleOrder })
        })
      }

      dayContainer.appendChild(card)

      if (isExpanded && hasWorkout && !isRest) {
        const expanded = document.createElement('div')
        expanded.style.cssText = 'padding:0 16px 16px'
        day.exercises.forEach((ex) => {
          const resolved = { ...ex, ...(exercisesById[ex.exerciseId] || {}) }
          expanded.appendChild(createPlanExerciseRow(resolved, accent, onOpenExercise))
        })
        dayContainer.appendChild(expanded)
        requestAnimationFrame(() => loadPlanWeights(day.exercises))
      }

      daysGrid.appendChild(dayContainer)
    }
    page.appendChild(daysGrid)
  }
}

// ── Reschedule Editor (tap-to-swap) ──
function renderPlanEditing(page, { week, order, accent, currentWeekIdx, defaultOrder, container, planProps }) {
  const editOrder = order
  const editingChanges = editOrder.reduce((n, v, i) => n + (v !== i ? 1 : 0), 0)

  // Banner
  const banner = document.createElement('div')
  banner.style.cssText = 'padding:0 20px;margin-bottom:14px'
  banner.innerHTML = `
    <div style="background:${accent}0d;border:0.5px solid ${accent}33;border-radius:16px;padding:13px 14px;display:flex;align-items:center;gap:12px">
      <div style="width:34px;height:34px;border-radius:10px;flex-shrink:0;background:${accent}1c;color:${accent};display:flex;align-items:center;justify-content:center">
        <svg width="17" height="17" viewBox="0 0 17 17" fill="none"><path d="M11.5 2.5l3 3-3 3M14 5.5H5.5a3 3 0 00-3 3M5.5 14.5l-3-3 3-3M3 11.5h8.5a3 3 0 003-3" stroke="${accent}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
      <div style="flex:1;min-width:0">
        <div style="font-family:'Space Grotesk',sans-serif;font-size:13.5px;font-weight:600;color:#fafafa;letter-spacing:-0.2px">Reprogramando esta semana</div>
        <div style="font-size:11px;color:rgba(255,255,255,0.5);margin-top:2px;line-height:1.35">Los 7 días de la semana. Intercambia con espacios libres.</div>
      </div>
      <button id="plan-reset-btn" style="flex-shrink:0;padding:7px 11px;border-radius:9999px;border:0;cursor:${editingChanges === 0 ? 'default' : 'pointer'};background:${editingChanges === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.08)'};color:${editingChanges === 0 ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.85)'};font-family:'Space Grotesk',sans-serif;font-size:12px;font-weight:600">Restablecer</button>
    </div>`
  const resetBtn = banner.querySelector('#plan-reset-btn')
  resetBtn.addEventListener('click', () => {
    if (editingChanges === 0) return
    _planEditingOrder = [...defaultOrder]
    _planSelectedSwapIdx = null
    mountPlan(container, planProps)
  })
  page.appendChild(banner)

  // Shift-all button ("Me salté un día")
  const shiftWrap = document.createElement('div')
  shiftWrap.style.cssText = 'padding:0 20px;margin-bottom:16px'
  shiftWrap.innerHTML = `
    <button id="plan-shift-btn" style="width:100%;text-align:left;cursor:pointer;background:#141414;border:0.5px solid rgba(255,255,255,0.08);border-radius:16px;padding:13px 14px;display:flex;align-items:center;gap:13px;color:inherit">
      <div style="width:38px;height:38px;border-radius:11px;flex-shrink:0;background:rgba(255,255,255,0.05);border:0.5px solid rgba(255,255,255,0.07);display:flex;align-items:center;justify-content:center;font-family:'JetBrains Mono',monospace;font-size:18px;color:${accent}">→</div>
      <div style="flex:1;min-width:0">
        <div style="font-family:'Space Grotesk',sans-serif;font-size:14.5px;font-weight:600;color:#fafafa;letter-spacing:-0.2px">Me salté un día</div>
        <div style="font-size:11.5px;color:rgba(255,255,255,0.5);margin-top:2px;line-height:1.35">Corre cada entrenamiento un día hacia adelante (Lun→Mar, Mar→Mié…).</div>
      </div>
      <div style="flex-shrink:0;padding:8px 12px;border-radius:10px;background:${accent};color:#0a0a0a;font-family:'Space Grotesk',sans-serif;font-size:12.5px;font-weight:700;white-space:nowrap">Desplazar</div>
    </button>`
  const shiftBtn = shiftWrap.querySelector('#plan-shift-btn')
  shiftBtn.addEventListener('click', () => {
    _planEditingOrder = editOrder.map((_, i) => editOrder[(i - 1 + 7) % 7])
    _planSelectedSwapIdx = null
    mountPlan(container, planProps)
  })
  page.appendChild(shiftWrap)

  // Instruction line
  const instr = document.createElement('div')
  instr.style.cssText = 'padding:0 20px;margin-bottom:10px;display:flex;align-items:center;gap:8px;font-family:\'JetBrains Mono\',monospace;font-size:10px;letter-spacing:1.4px;text-transform:uppercase;color:rgba(255,255,255,0.42);font-weight:600'
  instr.innerHTML = `<span style="width:4px;height:4px;border-radius:50%;background:${accent};flex-shrink:0"></span><span>Toca dos días para intercambiarlos (incluye espacios libres)</span>`
  page.appendChild(instr)

  // Day cards — always 7 slots
  const dayList = document.createElement('div')
  dayList.style.cssText = 'padding:0 20px;display:flex;flex-direction:column;gap:10px'
  for (let calIdx = 0; calIdx < 7; calIdx++) {
    const originalIdx = editOrder[calIdx]
    const hasWorkout = originalIdx < week.days.length
    const day = hasWorkout ? week.days[originalIdx] : null
    const isToday = calIdx === currentWeekIdx
    const isMoved = hasWorkout && originalIdx !== calIdx
    const isSelected = _planSelectedSwapIdx === calIdx
    dayList.appendChild(createRescheduleDayCard({
      day,
      calIdx,
      originalIdx,
      hasWorkout,
      accent,
      isToday,
      isMoved,
      isSelected,
      onTap: () => {
        if (_planSelectedSwapIdx === null) {
          _planSelectedSwapIdx = calIdx
          mountPlan(container, planProps)
        } else if (_planSelectedSwapIdx === calIdx) {
          _planSelectedSwapIdx = null
          mountPlan(container, planProps)
        } else {
          const newOrder = [...editOrder]
          const tmp = newOrder[_planSelectedSwapIdx]
          newOrder[_planSelectedSwapIdx] = newOrder[calIdx]
          newOrder[calIdx] = tmp
          _planEditingOrder = newOrder
          _planSelectedSwapIdx = null
          mountPlan(container, planProps)
        }
      },
    }))
  }
  page.appendChild(dayList)
}

function createRescheduleDayCard({ day, calIdx, originalIdx, hasWorkout, accent, isToday, isMoved, isSelected, onTap }) {
  const card = document.createElement('div')
  card.style.cssText = `background:#141414;border-radius:18px;padding:14px 12px 14px 16px;border:${isSelected ? `1px solid ${accent}` : isToday ? `1px solid ${accent}aa` : '0.5px solid rgba(255,255,255,0.06)'};cursor:pointer;display:flex;gap:13px;align-items:center;color:inherit;position:relative;${isSelected ? `box-shadow:0 0 0 4px ${accent}1f` : ''}transition:border-color 0.18s,box-shadow 0.18s`

  // Calendar badge
  const badge = document.createElement('div')
  badge.style.cssText = `width:42px;height:46px;flex-shrink:0;border-radius:12px;background:${isToday ? `${accent}18` : 'rgba(255,255,255,0.05)'};display:flex;flex-direction:column;align-items:center;justify-content:center;border:${isToday ? `0.5px solid ${accent}66` : '0.5px solid rgba(255,255,255,0.05)'}`
  badge.innerHTML = `
    <div style="font-family:'JetBrains Mono',monospace;font-size:8px;letter-spacing:1.2px;color:${isToday ? accent : 'rgba(255,255,255,0.45)'};text-transform:uppercase">${DAY_NAMES_SHORT[calIdx]}</div>
    <div style="font-family:'JetBrains Mono',monospace;font-size:16px;font-weight:500;color:#fafafa;line-height:1.1">${calIdx + 1}</div>`
  card.appendChild(badge)

  // Workout info
  const info = document.createElement('div')
  info.style.cssText = 'flex:1;min-width:0'
  if (hasWorkout) {
    info.innerHTML = `
      <div style="display:flex;align-items:center;gap:6px">
        <div style="font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:600;color:#fafafa;letter-spacing:-0.3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${day.name}</div>
        ${isToday ? `<div style="width:6px;height:6px;border-radius:50%;background:${accent};box-shadow:0 0 6px ${accent};flex-shrink:0"></div>` : ''}
      </div>
      <div style="font-size:11px;color:rgba(255,255,255,0.5);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${isToday ? 'Hoy' : ''}${isToday && (isMoved || day.subtitle) ? ' · ' : ''}${day.subtitle || ''}</div>
      ${isMoved ? `<div style="display:inline-flex;align-items:center;gap:4px;margin-top:7px;padding:3px 8px;border-radius:9999px;background:${accent}18;border:0.5px solid ${accent}3a;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.8px;text-transform:uppercase;color:${accent};font-weight:600;white-space:nowrap">↔ desde ${DAY_NAMES_SHORT[originalIdx]}</div>` : ''}`
  } else {
    info.innerHTML = `<div style="font-family:'Space Grotesk',sans-serif;font-size:15px;font-weight:500;color:rgba(255,255,255,0.35);margin-top:2px">Sin entrenamiento</div>`
  }
  card.appendChild(info)

  // Exercises count + duration
  const meta = document.createElement('div')
  meta.style.cssText = 'text-align:right;flex-shrink:0;min-width:30px'
  if (hasWorkout) {
    meta.innerHTML = `
      <div style="font-family:'JetBrains Mono',monospace;font-size:14px;color:#fafafa;font-weight:500">${(day.exercises || []).length}</div>
      <div style="font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-top:1px">${day.duration || '?'}m</div>`
  } else {
    meta.innerHTML = `<div style="font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:1.2px;text-transform:uppercase;color:#9bd1ff">Libre</div>`
  }
  card.appendChild(meta)

  card.addEventListener('click', onTap)
  return card
}

// ── Plan Exercise Row ──
function createPlanExerciseRow(ex, accent, onOpen) {
  const btn = document.createElement('button')
  btn.dataset.exerciseId = ex.exerciseId || ex.id || ''
  btn.style.cssText = 'width:100%;background:rgba(255,255,255,0.03);border-radius:14px;padding:12px;border:0;cursor:pointer;text-align:left;display:flex;align-items:center;gap:12px;color:inherit;margin-bottom:8px'
  const imgUrl = ex.imgUrl || (typeof getExerciseImageFromDictionary === 'function' ? getExerciseImageFromDictionary(ex.name || '') : '') || ''
  btn.innerHTML = `
    <div style="width:44px;height:44px;flex-shrink:0;border-radius:10px;background:#1c1c1c;border:0.5px solid rgba(255,255,255,0.04);display:flex;align-items:center;justify-content:center;font-size:18px;overflow:hidden">
      ${imgUrl ? `<img src="${imgUrl}" alt="" style="width:100%;height:100%;object-fit:cover">` : `<div style="width:100%;height:100%;background-image:repeating-linear-gradient(135deg,rgba(255,255,255,0.018) 0 10px,rgba(255,255,255,0.05) 10px 20px)"></div>`}
    </div>
    <div style="flex:1;min-width:0">
      <div style="font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:600;color:#fafafa;letter-spacing:-0.2px;overflow-wrap:break-word">${ex.name || 'Desconocido'}</div>
      <div style="font-size:11px;color:rgba(255,255,255,0.5);margin-top:2px">${ex.muscle || ''}</div>
    </div>
    <div style="display:flex;flex-direction:column;align-items:flex-end;gap:2px;flex-shrink:0">
      <div style="font-family:'JetBrains Mono',monospace;font-size:17px;font-weight:500;color:#fafafa;letter-spacing:-0.5px;white-space:nowrap">${ex.sets}<span style="color:rgba(255,255,255,0.35);margin:0 2px">×</span>${ex.reps}</div>
      <div style="font-family:'JetBrains Mono',monospace;font-size:10px;color:rgba(255,255,255,0.35)" id="plan-weight-${ex.exerciseId || ex.id}"></div>
    </div>`
  btn.addEventListener('click', (e) => {
    e.stopPropagation()
    onOpen(ex)
  })
  return btn
}

async function loadPlanWeights(exercises) {
  for (const ex of exercises) {
    const exId = ex.exerciseId || ex.id
    if (!exId) continue
    try {
      const logs = await Storage.getLogsForExercise(exId)
      if (logs.length > 0) {
        const last = logs[logs.length - 1]
        const el = document.getElementById('plan-weight-' + exId)
        if (el) {
          el.textContent = last.weight + (last.units || '')
          el.style.color = 'rgba(255,255,255,0.55)'
        }
      }
    } catch (e) {
      // ignore
    }
  }
}
