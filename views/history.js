// ── History screen ──
// All exercises with muscle filter, sparklines, last weight

let _historyFilter = 'All'

function mountHistory(container, { accent, units, onOpenExercise }) {
  container.innerHTML = ''
  const page = document.createElement('div')
  page.className = 'page'
  container.appendChild(page)

  // Header
  const header = document.createElement('div')
  header.style.padding = '56px 20px 16px'
  header.innerHTML = `
    <div style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:1.6px;color:rgba(255,255,255,0.45);text-transform:uppercase">Lifting history</div>
    <div style="font-family:'Space Grotesk',sans-serif;font-size:38px;font-weight:700;color:#fafafa;letter-spacing:-1.5px;line-height:1;margin-top:4px">Progress.</div>`
  page.appendChild(header)

  // Load exercises
  Storage.getExercises().then(async (exercises) => {
    const muscles = ['All', ...new Set(exercises.map((e) => e.muscle.split('/')[0].split(' ')[0]))]

    // Filter chips
    const chips = document.createElement('div')
    chips.style.cssText = 'display:flex;gap:8px;padding:0 20px 16px;overflow-x:auto;scrollbar-width:none'
    muscles.forEach((m) => {
      const on = _historyFilter === m
      const btn = document.createElement('button')
      btn.style.cssText = `flex-shrink:0;padding:6px 12px;border-radius:9999px;border:0;cursor:pointer;background:${on ? accent : 'rgba(255,255,255,0.05)'};color:${on ? '#0a0a0a' : 'rgba(255,255,255,0.7)'};font-family:'Space Grotesk',sans-serif;font-size:12px;font-weight:600;letter-spacing:-0.1px`
      btn.textContent = m
      btn.addEventListener('click', () => { _historyFilter = m; mountHistory(container, { accent, units, onOpenExercise }) })
      chips.appendChild(btn)
    })
    page.appendChild(chips)

    // Filter
    const filtered = _historyFilter === 'All'
      ? exercises
      : exercises.filter((e) => e.muscle.startsWith(_historyFilter))

    if (filtered.length === 0) {
      const empty = document.createElement('div')
      empty.style.cssText = 'padding:40px 20px;text-align:center;font-size:13px;color:rgba(255,255,255,0.4)'
      empty.textContent = 'No exercises found.'
      page.appendChild(empty)
      return
    }

    // Enrich each exercise with its logs
    const enriched = await Promise.all(filtered.map(async (e) => {
      const logs = await Storage.getLogsForExercise(e.id)
      return { ...e, logs }
    }))

    // List
    const list = document.createElement('div')
    list.style.cssText = 'padding:0 20px;display:flex;flex-direction:column;gap:10px'

    enriched.forEach((e) => {
      const last = e.logs.length > 0 ? e.logs[e.logs.length - 1].weight : 0
      const first = e.logs.length > 0 ? e.logs[0].weight : 0
      const delta = last - first
      const allTime = e.logs.length > 0 ? Math.max(...e.logs.map((l) => l.weight)) : 0

      const btn = document.createElement('button')
      btn.style.cssText = `background:#141414;border-radius:16px;padding:14px;border:0.5px solid rgba(255,255,255,0.06);cursor:pointer;text-align:left;display:flex;align-items:center;gap:12px;color:inherit`
      btn.innerHTML = `
        <div style="flex:1;min-width:0">
          <div style="font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:600;color:#fafafa;letter-spacing:-0.3px;line-height:1.2;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${e.name}</div>
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
    page.appendChild(list)
  })
}
