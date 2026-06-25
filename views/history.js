let _historyFilter = 'Todos'
let _historyTab = 'constancia'
let _lastOpts = {}

function mountHistory(container, opts) {
  _lastOpts = opts
  const { accent, units, onOpenExercise, program, weekIdx, onRefresh, exercises } = opts
  container.innerHTML = ''
  const page = document.createElement('div')
  page.className = 'page'
  container.appendChild(page)

  const header = document.createElement('div')
  header.style.padding = '56px 20px 16px'
  header.innerHTML = `
    <div style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:1.6px;color:rgba(255,255,255,0.45);text-transform:uppercase">Historial</div>
    <div style="font-family:'Space Grotesk',sans-serif;font-size:38px;font-weight:700;color:#fafafa;letter-spacing:-1.5px;line-height:1;margin-top:4px">Progreso.</div>`
  page.appendChild(header)

  const tabs = document.createElement('div')
  tabs.style.cssText = 'display:flex;gap:0;margin:0 20px 16px;background:rgba(255,255,255,0.04);border-radius:12px;padding:3px'
  ;['constancia', 'ejercicios'].forEach((id) => {
    const on = _historyTab === id
    const btn = document.createElement('button')
    btn.style.cssText = `flex:1;padding:9px 0;border:0;border-radius:9px;cursor:pointer;background:${on ? '#1f1f1f' : 'transparent'};color:${on ? '#fafafa' : 'rgba(255,255,255,0.5)'};font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:600;letter-spacing:-0.1px`
    btn.textContent = id === 'constancia' ? 'Constancia' : 'Ejercicios'
    btn.addEventListener('click', () => { _historyTab = id; mountHistory(container, { accent, units, onOpenExercise, program, weekIdx, onRefresh, exercises }) })
    tabs.appendChild(btn)
  })
  page.appendChild(tabs)

  const content = document.createElement('div')
  page.appendChild(content)

  if (_historyTab === 'constancia') {
    renderConstanciaTab(content, { accent, units, program, weekIdx, onRefresh, exercises })
  } else {
    renderEjerciciosTab(content, { accent, units, onOpenExercise })
  }
}

async function renderConstanciaTab(container, { accent, units, program, weekIdx, onRefresh, exercises }) {
  if (!program || !program.weeks || program.weeks.length === 0) {
    container.innerHTML = '<div style="padding:60px 20px;text-align:center;font-size:13px;color:rgba(255,255,255,0.4)">Selecciona un programa en Tú → Programas para ver tu constancia.</div>'
    return
  }

  const exerciseMap = {}
  if (exercises) {
    exercises.forEach(e => { exerciseMap[e.id] = { name: getExerciseDisplayName(e), muscle: e.muscle } })
  }

  const allLogs = await Storage.getAllLogs()
  const logsByDate = new Map()
  allLogs.forEach(l => {
    const key = l.date.replace(/-/g, '') * 1
    if (!logsByDate.has(key)) logsByDate.set(key, [])
    logsByDate.get(key).push(l)
  })

  renderCalendarView(container, {
    accent,
    logsByDate,
    program,
    weeks: program.weeks.length,
    weekIdx: weekIdx || 0,
    units,
    today: new Date(),
    refresh: onRefresh || (() => mountHistory(container, { accent, units, program, weekIdx, onRefresh, exercises })),
    exerciseMap,
  })
}

function renderEjerciciosTab(container, { accent, units, onOpenExercise }) {
  Storage.getExercises().then(async (exercises) => {
    const muscles = ['Todos', ...new Set(exercises.map((e) => e.muscle.split('/')[0].split(/[,\s]+/)[0]))]

    const chips = document.createElement('div')
    chips.style.cssText = 'display:flex;gap:8px;padding:0 20px 16px;overflow-x:auto;scrollbar-width:none'
    muscles.forEach((m) => {
      const on = _historyFilter === m
      const btn = document.createElement('button')
      btn.style.cssText = `flex-shrink:0;padding:8px 14px;border-radius:9999px;border:0;cursor:pointer;background:${on ? accent : 'rgba(255,255,255,0.05)'};color:${on ? '#0a0a0a' : 'rgba(255,255,255,0.7)'};font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:600;letter-spacing:-0.1px;touch-action:manipulation`
      btn.textContent = m
      btn.addEventListener('click', () => { _historyFilter = m; mountHistory(container, { ..._lastOpts }) })
      chips.appendChild(btn)
    })
    container.appendChild(chips)

    const filtered = _historyFilter === 'Todos'
      ? exercises
      : exercises.filter((e) => e.muscle.startsWith(_historyFilter))

    if (filtered.length === 0) {
      const empty = document.createElement('div')
      empty.style.cssText = 'padding:40px 20px;text-align:center;font-size:13px;color:rgba(255,255,255,0.4)'
      empty.textContent = 'No se encontraron ejercicios.'
      container.appendChild(empty)
      return
    }

    const enriched = await Promise.all(filtered.map(async (e) => {
      const logs = await Storage.getLogsForExercise(e.id)
      return { ...e, logs }
    }))

    const list = document.createElement('div')
    list.style.cssText = 'padding:0 20px 100px;display:flex;flex-direction:column;gap:10px'

    enriched.forEach((e) => {
      const last = e.logs.length > 0 ? e.logs[e.logs.length - 1].weight : 0
      const first = e.logs.length > 0 ? e.logs[0].weight : 0
      const delta = last - first
      const allTime = e.logs.length > 0 ? Math.max(...e.logs.map((l) => l.weight)) : 0

      const btn = document.createElement('button')
      btn.style.cssText = `background:#141414;border-radius:16px;padding:14px;border:0.5px solid rgba(255,255,255,0.06);cursor:pointer;text-align:left;display:flex;align-items:center;gap:12px;color:inherit`
      btn.innerHTML = `
        <div style="flex:1;min-width:0">
          <div style="font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:600;color:#fafafa;letter-spacing:-0.3px;line-height:1.2;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${getExerciseDisplayName(e)}</div>
          <div style="font-size:11px;color:rgba(255,255,255,0.45);margin-top:2px">${e.muscle}</div>
        </div>
        ${e.logs.length > 0 ? Sparkline({ data: e.logs, width: 70, height: 26, color: delta >= 0 ? accent : '#ff6b6b' }) : '<div style="width:70px;height:26px"></div>'}
        <div style="text-align:right;min-width:56px">
          <div style="font-family:'JetBrains Mono',monospace;font-size:16px;font-weight:500;color:#fafafa;letter-spacing:-0.3px">${last}<span style="font-size:9px;color:rgba(255,255,255,0.4);margin-left:1px">${units}</span></div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.6px;color:${delta >= 0 ? accent : '#ff6b6b'};margin-top:1px">${delta >= 0 ? '+' : ''}${delta.toFixed(1)}</div>
        </div>`
      btn.addEventListener('click', () => onOpenExercise(e))
      list.appendChild(btn)
    })
    container.appendChild(list)
  })
}
