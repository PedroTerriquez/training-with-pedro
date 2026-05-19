// ── Plan screen ──
// Week selector + day grid

let _planWeekIdx = 0
let _planExpandedDayIdx = null

function mountPlan(container, { program, weekIdx, dayIndex, accent, onOpenExercise, onWeekChange, exercises }) {
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
  const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
  const exercisesById = Object.fromEntries((exercises || []).map(e => [e.id, e]))

  // Header
  const header = document.createElement('div')
  header.style.padding = '56px 20px 16px'
  header.innerHTML = `
    <div style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:1.6px;color:rgba(255,255,255,0.45);text-transform:uppercase">Tu programa</div>
    <div style="font-family:'Space Grotesk',sans-serif;font-size:38px;font-weight:700;color:#fafafa;letter-spacing:-1.5px;line-height:1;margin-top:4px">Plan.</div>`
  page.appendChild(header)

  // Week tabs
  if (weeks.length > 0) {
    const tabs = document.createElement('div')
    tabs.style.cssText = 'padding:0 20px;display:flex;gap:8px;margin-bottom:18px'
    weeks.forEach((w, i) => {
      const on = _planWeekIdx === i
      const btn = document.createElement('button')
      btn.style.cssText = `flex:1;padding:12px 8px;border:0;cursor:pointer;background:${on ? '#1f1f1f' : 'transparent'};border:${on ? `0.5px solid ${w.accent || accent}66` : '0.5px solid rgba(255,255,255,0.06)'};border-radius:14px;color:${on ? '#fafafa' : 'rgba(255,255,255,0.5)'};text-align:left;position:relative`
      btn.innerHTML = `
        <div style="font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:1.4px;color:${on ? (w.accent || accent) : 'rgba(255,255,255,0.4)'};text-transform:uppercase">${w.tag || ''}</div>
        <div style="font-family:'Space Grotesk',sans-serif;font-size:15px;font-weight:700;margin-top:2px;letter-spacing:-0.3px">${w.name}</div>
        <div style="font-size:11px;color:rgba(255,255,255,0.45);margin-top:1px">${w.subtitle || ''}</div>`
      btn.addEventListener('click', async () => {
        _planWeekIdx = i
        _planExpandedDayIdx = null
        const s = await Storage.getSettings()
        s.currentWeekIdx = i
        await Storage.saveSettings(s)
        if (typeof onWeekChange === 'function') onWeekChange(i)
        else mountPlan(container, { program, weekIdx: i, dayIndex, accent, onOpenExercise, exercises })
      })
      tabs.appendChild(btn)
    })
    page.appendChild(tabs)

    // Days grid
    const daysGrid = document.createElement('div')
    daysGrid.style.cssText = 'padding:0 20px;display:flex;flex-direction:column;gap:10px'
    week.days.forEach((day, i) => {
      const isToday = i === dayIndex && _planWeekIdx === weekIdx
      const isRest = day.name === 'Rest' || day.name === 'Descanso'
      const isExpanded = _planExpandedDayIdx === i

      const dayContainer = document.createElement('div')
      dayContainer.style.cssText = `background:#141414;border-radius:18px;border:${isToday ? `1px solid ${accent}` : '0.5px solid rgba(255,255,255,0.06)'};overflow:hidden`

      const card = document.createElement('div')
      card.style.cssText = `padding:16px;position:relative;display:flex;gap:14px;align-items:center`
      if (!isRest) card.style.cursor = 'pointer'

      card.innerHTML = `
        <div style="width:42px;height:42px;flex-shrink:0;border-radius:12px;background:${isRest ? 'rgba(155,209,255,0.1)' : 'rgba(255,255,255,0.05)'};display:flex;flex-direction:column;align-items:center;justify-content:center;border:${isToday ? `0.5px solid ${accent}` : '0.5px solid rgba(255,255,255,0.05)'}">
          <div style="font-family:'JetBrains Mono',monospace;font-size:8px;letter-spacing:1.2px;color:rgba(255,255,255,0.45);text-transform:uppercase">${dayNames[i]}</div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:16px;font-weight:500;color:#fafafa;line-height:1">${i + 1}</div>
        </div>
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:6px">
            <div style="font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:600;color:#fafafa;letter-spacing:-0.3px">${day.name}</div>
            ${isToday ? `<div style="width:6px;height:6px;border-radius:50%;background:${accent};box-shadow:0 0 6px ${accent}"></div>` : ''}
          </div>
          <div style="font-size:11px;color:rgba(255,255,255,0.5);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${day.subtitle || ''}</div>
        </div>
        <div style="text-align:right">
          ${!isRest ? `
            <div style="font-family:'JetBrains Mono',monospace;font-size:14px;color:#fafafa;font-weight:500">${day.exercises.length}</div>
            <div style="font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:1.2px;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-top:1px">${day.duration}m</div>
          ` : `      <div style="font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:1.2px;text-transform:uppercase;color:#9bd1ff">DESC</div>`}
        </div>`

      if (!isRest) {
        card.addEventListener('click', () => {
          _planExpandedDayIdx = isExpanded ? null : i
          mountPlan(container, { program, weekIdx: _planWeekIdx, dayIndex, accent, onOpenExercise, onWeekChange, exercises })
        })
      }

      dayContainer.appendChild(card)

      if (isExpanded && !isRest) {
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
    })
    page.appendChild(daysGrid)
  }
}

function createPlanExerciseRow(ex, accent, onOpen) {
  const btn = document.createElement('button')
  btn.style.cssText = 'width:100%;background:rgba(255,255,255,0.03);border-radius:14px;padding:12px;border:0;cursor:pointer;text-align:left;display:flex;align-items:center;gap:12px;color:inherit;margin-bottom:8px'
  btn.innerHTML = `
    <div style="width:44px;height:44px;flex-shrink:0;border-radius:10px;background:#1c1c1c;border:0.5px solid rgba(255,255,255,0.04);display:flex;align-items:center;justify-content:center;font-size:18px;overflow:hidden">
      ${ex.imgUrl ? `<img src="${ex.imgUrl}" alt="" style="width:100%;height:100%;object-fit:cover">` : `<div style="width:100%;height:100%;background-image:repeating-linear-gradient(135deg,rgba(255,255,255,0.018) 0 10px,rgba(255,255,255,0.05) 10px 20px)"></div>`}
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
