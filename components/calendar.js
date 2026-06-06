const CAL_DOW = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const CAL_DOW_LONG = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const CAL_MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

function calStripTime(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()) }
function calKey(d) { return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate() }
function calDowMon(d) { return (d.getDay() + 6) % 7 }
function calMonday(d) { const m = calStripTime(d); m.setDate(m.getDate() - calDowMon(m)); return m }
function calAddDays(d, n) { const x = calStripTime(d); x.setDate(x.getDate() + n); return x }
function calDayDiff(a, b) { return Math.round((calStripTime(a) - calStripTime(b)) / 86400000) }

function makeDayStatusFn(today, logsByDate, program, weeks, weekIdx, exerciseMap) {
  today = calStripTime(today)
  const todayMonday = calMonday(today)
  const startDate = calAddDays(todayMonday, -7 * 9)

  function resolveEx(e) {
    if (e.name) return e
    const def = exerciseMap ? exerciseMap[e.exerciseId] : null
    return { ...e, name: def ? def.name : e.exerciseId, muscle: def ? def.muscle : '' }
  }

  return function(date) {
    date = calStripTime(date)
    const dow = calDowMon(date)
    const weekDiff = Math.round((calMonday(date) - todayMonday) / (7 * 86400000))
    const wi = ((weekIdx + weekDiff) % weeks + weeks) % weeks
    const day = program.weeks[wi].days[dow]
    const isRest = !day || day.name === 'Descanso'
    let raw = (day && day.exercises && day.exercises.length) ? day.exercises : []
    if (!isRest && !raw.length) raw = program.weeks[0].days[dow].exercises || []
    const exercises = raw.map(resolveEx)

    const key = calKey(date)
    const logs = logsByDate.get(key) || []
    const hasWeight = logs.some(l => l.weight > 0 && l.exerciseId !== '__day__')
    const hasDayMark = logs.some(l => l.exerciseId === '__day__')

    let status
    if (hasWeight || hasDayMark) status = 'done'
    else if (date > today) status = 'future'
    else if (date < startDate) status = 'none'
    else if (isRest) status = 'rest'
    else status = 'missed'

    return { date, dow, weekIdx: wi, day, isRest, exercises, status, logs }
  }
}

function computeWeekStreak(today, logsByDate) {
  today = calStripTime(today)
  const thisMonday = calMonday(today)
  let count = 0

  for (let w = 0; w < 200; w++) {
    const weekStart = calAddDays(thisMonday, -w * 7)
    const weekEnd = calAddDays(weekStart, 6)

    if (weekStart > today) continue

    const effectiveEnd = weekEnd > today ? today : weekEnd

    let total = 0
    for (let d = calStripTime(weekStart); d <= effectiveEnd; d = calAddDays(d, 1)) {
      const logs = logsByDate.get(calKey(d)) || []
      if (logs.some(l => l.weight > 0 || l.exerciseId === '__day__')) total++
    }

    if (total >= 5) {
      count++
    } else if (weekEnd <= today) {
      break
    }
  }

  return count
}

function computeBestWeekStreak(startDate, today, logsByDate) {
  today = calStripTime(today)
  startDate = calStripTime(startDate)
  const startMonday = calMonday(startDate)
  const thisMonday = calMonday(today)
  let best = 0, cur = 0

  for (let w = 0; ; w++) {
    const weekStart = calAddDays(startMonday, w * 7)
    if (weekStart > thisMonday) break

    const weekEnd = calAddDays(weekStart, 6)
    const effectiveEnd = weekEnd > today ? today : weekEnd

    let total = 0
    for (let d = weekStart; d <= effectiveEnd; d = calAddDays(d, 1)) {
      const logs = logsByDate.get(calKey(d)) || []
      if (logs.some(l => l.weight > 0 || l.exerciseId === '__day__')) total++
    }

    if (total >= 5) {
      cur++
      best = Math.max(best, cur)
    } else if (weekEnd <= today) {
      cur = 0
    }
  }

  return best
}

function FlameGlyph({ color, size }) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none">
    <path d="M12.5 2.5c.8 3-1.4 4.6-2.7 6.2C8.3 10.6 7 12.2 7 14.5a5 5 0 0010 0c0-1.9-.8-3.4-1.7-4.7-.3 1-.9 1.7-1.8 2 .6-2.2-.2-4.7-2-6.3-.1.9-.5 1.6-1 2.2.8-1.9.6-3.7-.2-5.2z" fill="${color}" stroke="${color}" stroke-width="1" stroke-linejoin="round" />
    <path d="M10 15.5c0-1.2.8-2.1 1.7-2.9.5 1 1.4 1.3 1.4 2.6a1.8 1.8 0 01-3.1 1.2c-.1-.3 0-.6 0-.9z" fill="#0a0a0a" opacity="0.55" />
  </svg>`
}

function CalNavBtn({ dir, enabled }) {
  const label = dir === 'prev' ? 'Mes anterior' : 'Mes siguiente'
  return `<button aria-label="${label}" style="width:34px;height:34px;border-radius:10px;flex-shrink:0;padding:0;cursor:${enabled ? 'pointer' : 'default'};background:${enabled ? 'rgba(255,255,255,0.06)' : 'transparent'};border:0.5px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:center;opacity:${enabled ? 1 : 0.3}">
    <svg width="9" height="14" viewBox="0 0 9 14" fill="none" style="transform:${dir === 'next' ? 'scaleX(-1)' : 'none'}"><path d="M7.5 1L1.5 7l6 6" stroke="#fafafa" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
  </button>`
}

function DumbbellGlyph({ color, size }) {
  const s = size || 16
  return `<svg width="${s}" height="${s}" viewBox="0 0 24 14" fill="none">
    <rect x="8.5" y="5" width="7" height="4" rx="1.2" fill="${color}" stroke="${color}" stroke-width="0.3"/>
    <rect x="1.5" y="1.5" width="5.5" height="11" rx="2.2" fill="${color}" stroke="${color}" stroke-width="0.3"/>
    <rect x="17" y="1.5" width="5.5" height="11" rx="2.2" fill="${color}" stroke="${color}" stroke-width="0.3"/>
  </svg>`
}

function CalCell({ date, rec, accent, selected }) {
  const n = date.getDate()
  let bg = 'transparent', color = 'rgba(255,255,255,0.7)', border = '0.5px solid transparent', dot = null, glow = 'none'
  if (rec.status === 'done') {
    bg = `${accent}1f`; color = accent; border = `0.5px solid ${accent}3a`
  } else if (rec.status === 'today') {
    border = `1px solid ${accent}`; color = accent; glow = `0 0 0 3px ${accent}1f`
  } else if (rec.status === 'rest') {
    color = 'rgba(255,255,255,0.4)'; dot = 'rgba(255,255,255,0.25)'
  } else if (rec.status === 'missed') {
    border = '0.5px solid #ff6b6b66'; color = '#ff8a7a'
  } else if (rec.status === 'future') {
    color = 'rgba(255,255,255,0.22)'
  } else {
    color = 'rgba(255,255,255,0.18)'
  }
  const missedDot = rec.status === 'missed' ? `<span style="position:absolute;top:4px;right:5px;width:5px;height:5px;border-radius:50%;background:#ff6b6b"></span>` : ''
  const glyph = rec.status === 'done' ? DumbbellGlyph({ color: accent, size: 16 }) : `<span style="width:4px;height:4px;border-radius:50%;background:${dot || 'transparent'}"></span>`
  return `<button style="position:relative;aspect-ratio:1/1;min-height:38px;border-radius:11px;cursor:pointer;padding:0;background:${selected ? (rec.status === 'done' ? `${accent}33` : 'rgba(255,255,255,0.08)') : bg};border:${selected ? `1px solid ${accent}` : border};box-shadow:${selected ? 'none' : glow};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px">
    <span style="font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:500;color:${selected && rec.status !== 'done' ? '#fafafa' : color};line-height:1">${n}</span>
    ${glyph}
    ${missedDot}
  </button>`
}

function CalLegend({ swatch, ring, label }) {
  return `<div style="display:flex;align-items:center;gap:6px">
    <span style="width:11px;height:11px;border-radius:4px;background:${swatch};border:${ring ? `1.5px solid ${ring}` : 0};flex-shrink:0"></span>
    <span style="font-size:10.5px;color:rgba(255,255,255,0.55);font-family:'Space Grotesk',sans-serif">${label}</span>
  </div>`
}

function DayDetail({ rec, accent, units, today }) {
  const meta = {
    done: { pill: 'Completado', pc: accent, pbg: `${accent}1c` },
    today: { pill: 'Hoy · pendiente', pc: accent, pbg: `${accent}1c` },
    rest: { pill: 'Descanso', pc: '#9bd1ff', pbg: 'rgba(155,209,255,0.14)' },
    missed: { pill: 'No fuiste', pc: '#ff8a7a', pbg: 'rgba(255,107,107,0.14)' },
    future: { pill: 'Programado', pc: 'rgba(255,255,255,0.6)', pbg: 'rgba(255,255,255,0.06)' },
    none: { pill: 'Sin datos', pc: 'rgba(255,255,255,0.5)', pbg: 'rgba(255,255,255,0.05)' },
  }[rec.status] || { pill: '', pc: accent, pbg: `${accent}1c` }

  const d = rec.date
  const dateLabel = `${CAL_DOW_LONG[rec.dow]} ${d.getDate()} de ${CAL_MONTHS[d.getMonth()].toLowerCase()}`
  const showExercises = !rec.isRest && rec.status !== 'none' && rec.exercises.length > 0
  const dim = rec.status === 'missed' || rec.status === 'future'
  const canMark = rec.status === 'missed'

  let html = `<div style="background:#141414;border-radius:20px;padding:18px;border:${rec.status === 'missed' ? '0.5px solid rgba(255,107,107,0.25)' : '0.5px solid rgba(255,255,255,0.06)'}">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px">
      <div style="min-width:0">
        <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:1.2px;text-transform:uppercase;color:rgba(255,255,255,0.45)">${dateLabel}</div>
        <div style="font-family:'Space Grotesk',sans-serif;font-size:22px;font-weight:700;color:#fafafa;letter-spacing:-0.6px;margin-top:4px;line-height:1.05">${rec.isRest ? 'Descanso' : rec.day ? rec.day.name : ''}</div>
        ${!rec.isRest && rec.day ? `<div style="font-size:12px;color:rgba(255,255,255,0.5);margin-top:3px">${rec.day.subtitle || ''}</div>` : ''}
      </div>
      <div style="flex-shrink:0;padding:5px 11px;border-radius:9999px;background:${meta.pbg};color:${meta.pc};font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.6px;text-transform:uppercase;font-weight:600;white-space:nowrap">${meta.pill}</div>
    </div>`

  if (rec.isRest) {
    html += `<div style="margin-top:14px;padding:14px;border-radius:14px;background:rgba(155,209,255,0.06);border:0.5px solid rgba(155,209,255,0.18);font-size:12.5px;color:rgba(255,255,255,0.7);line-height:1.5">Día de recuperación. Descansar también es entrenar — mantiene viva tu racha.</div>`
  }

  if (rec.status === 'missed') {
    html += `<div style="margin-top:14px;padding:14px;border-radius:14px;background:rgba(255,107,107,0.06);border:0.5px solid rgba(255,107,107,0.2);font-size:12.5px;color:rgba(255,255,255,0.7);line-height:1.5">No registraste este entrenamiento. Estaba programado <strong style="color:#fafafa">${rec.day ? rec.day.name : ''}</strong>${rec.day && rec.day.subtitle ? ` (${rec.day.subtitle})` : ''}.</div>`
    html += `<button id="cal-mark-day" style="margin-top:12px;width:100%;padding:12px;border-radius:14px;border:0.5px solid ${accent}55;background:${accent}1c;color:${accent};font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:600;cursor:pointer">Marcar como hecho</button>`
  }

  if (showExercises) {
    html += `<div style="margin-top:14px;opacity:${dim ? 0.5 : 1}">
      <div style="font-family:'JetBrains Mono',monospace;font-size:9.5px;letter-spacing:1.4px;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:8px;display:flex;align-items:center;gap:8px">
        <span>${rec.status === 'done' ? 'Lo que hiciste' : rec.status === 'today' ? 'Lo que toca hoy' : 'Programado'}</span>
        <span style="flex:1;height:0.5px;background:rgba(255,255,255,0.08)"></span>
        <span>${rec.exercises.length} ejercicios</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:2px">`
    rec.exercises.forEach((e, j) => {
      const log = rec.logs ? rec.logs.find(l => l.exerciseId !== '__day__' && l.exerciseId === e.exerciseId) : null
      const weightStr = log && log.weight > 0 ? `${log.weight}<span style="font-size:9px;color:rgba(255,255,255,0.4);margin-left:1px">${log.units || units}</span>` : ''
      html += `<div style="display:flex;align-items:center;gap:11px;padding:9px 0">
        <div style="width:22px;flex-shrink:0;font-family:'JetBrains Mono',monospace;font-size:10px;color:${accent};opacity:0.7">${String(j + 1).padStart(2, '0')}</div>
        <div style="flex:1;min-width:0">
          <div style="font-family:'Space Grotesk',sans-serif;font-size:13.5px;font-weight:500;color:#fafafa;letter-spacing:-0.1px;line-height:1.25">${e.name}</div>
          <div style="font-size:10.5px;color:rgba(255,255,255,0.45);margin-top:1px">${e.muscle || ''}</div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;flex-shrink:0">
          ${weightStr ? `<span style="font-family:'JetBrains Mono',monospace;font-size:14px;font-weight:500;color:#fafafa">${weightStr}</span>` : ''}
          ${weightStr ? `<span style="width:1px;height:14px;background:rgba(255,255,255,0.08);flex-shrink:0"></span>` : ''}
          <span style="font-family:'JetBrains Mono',monospace;font-size:12.5px;color:rgba(255,255,255,0.8);white-space:nowrap">${e.sets}<span style="color:rgba(255,255,255,0.35);margin:0 2px">×</span>${e.reps}</span>
        </div>
      </div>`
    })
    html += `</div></div>`
  }

  html += `</div>`
  return html
}

function renderCalendarView(container, { accent, logsByDate, program, weeks, weekIdx, units, today, refresh, exerciseMap }) {
  container.innerHTML = ''
  today = calStripTime(today || new Date())
  const dayStatusFn = makeDayStatusFn(today, logsByDate || new Map(), program, weeks, weekIdx, exerciseMap)

  const streak = computeWeekStreak(today, logsByDate || new Map())
  const startDate = calAddDays(calMonday(today), -7 * 9)
  const best = computeBestWeekStreak(startDate, today, logsByDate || new Map())

  let viewMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  let selected = today

  function render() {
    const monthStart = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1)
    const lead = calDowMon(monthStart)
    const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate()
    const selRec = dayStatusFn(selected)

    const canPrev = calMonday(monthStart) >= startDate
    const canNext = (viewMonth.getFullYear() < today.getFullYear()) ||
      (viewMonth.getFullYear() === today.getFullYear() && viewMonth.getMonth() < today.getMonth())

    let monthDone = 0
    const cells = []
    for (let i = 0; i < lead; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d)
      cells.push(date)
      if (dayStatusFn(date).status === 'done') monthDone++
    }

    const chain = []
    for (let i = 13; i >= 0; i--) chain.push(dayStatusFn(calAddDays(today, -i)))

    const html = `
      <div>
        <div style="padding:0 20px">
          <div style="background:linear-gradient(160deg,#181818 0%,#111 100%);border-radius:20px;padding:18px;border:0.5px solid ${accent}2e;position:relative;overflow:hidden">
            <div style="position:absolute;top:-55px;right:-45px;width:180px;height:180px;border-radius:50%;background:${accent};opacity:0.09;filter:blur(55px);pointer-events:none"></div>
            <div style="position:relative;z-index:1">
              <div style="display:flex;align-items:flex-start;gap:14px">
                <div style="width:52px;height:52px;border-radius:15px;flex-shrink:0;background:${accent}1c;border:0.5px solid ${accent}3a;display:flex;align-items:center;justify-content:center">${FlameGlyph({ color: accent, size: 26 })}</div>
                <div style="flex:1;min-width:0">
                  <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:1.6px;text-transform:uppercase;color:${accent};font-weight:600">Racha actual</div>
                  <div style="display:flex;align-items:baseline;gap:8px;margin-top:3px">
                    <span style="font-family:'Space Grotesk',sans-serif;font-size:40px;font-weight:700;color:#fafafa;letter-spacing:-1.8px;line-height:0.9">${streak}</span>
                    <span style="font-family:'Space Grotesk',sans-serif;font-size:15px;font-weight:600;color:rgba(255,255,255,0.6)">${streak === 1 ? 'semana seguida' : 'semanas seguidas'}</span>
                  </div>
                  <div style="font-size:11.5px;color:rgba(255,255,255,0.5);margin-top:4px">Mejor racha: <span style="color:rgba(255,255,255,0.8);font-weight:600">${best} ${best === 1 ? 'semana' : 'semanas'}</span></div>
                </div>
              </div>
              <div style="margin-top:16px">
                <div style="display:flex;gap:4px;align-items:flex-end;justify-content:space-between">
                  ${chain.map((r, i) => {
                    const tall = r.status === 'done' || r.status === 'today'
                    let bg = 'rgba(255,255,255,0.08)'
                    if (r.status === 'done') bg = accent
                    else if (r.status === 'today') bg = `${accent}55`
                    else if (r.status === 'missed') bg = '#ff6b6b'
                    else if (r.status === 'rest') bg = 'rgba(255,255,255,0.14)'
                    return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:5px">
                      <div style="width:100%;height:${tall ? 26 : 14}px;border-radius:5px;background:${bg};border:${r.status === 'today' ? `1px solid ${accent}` : r.status === 'missed' ? '1px solid #ff6b6b' : 0};box-shadow:${r.status === 'done' ? `0 0 8px ${accent}66` : 'none'}"></div>
                      <div style="font-family:'JetBrains Mono',monospace;font-size:8px;color:${i === 13 ? accent : 'rgba(255,255,255,0.3)'}">${CAL_DOW[r.dow]}</div>
                    </div>`
                  }).join('')}
                </div>
                <div style="margin-top:11px;font-size:11.5px;line-height:1.4;color:rgba(255,255,255,0.6);font-family:'Space Grotesk',sans-serif">
                  ${selRec.status === 'today' && !selRec.isRest
                    ? `Hoy toca <span style="color:${accent};font-weight:600">${selRec.day ? selRec.day.name : ''}</span> — no rompas la cadena`
                    : streak > 0
                      ? `Llevas <span style="color:${accent};font-weight:600">${streak} ${streak === 1 ? 'semana' : 'semanas'}</span> cumpliendo. ¡Sigue así!`
                      : `Arranca esta semana con 5 sesiones para comenzar tu racha.`}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style="padding:12px 20px 0">
          <div style="background:#141414;border-radius:20px;padding:16px;border:0.5px solid rgba(255,255,255,0.06)">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
              <div id="cal-prev">${CalNavBtn({ dir: 'prev', enabled: canPrev })}</div>
              <div style="text-align:center">
                <div style="font-family:'Space Grotesk',sans-serif;font-size:17px;font-weight:700;color:#fafafa;letter-spacing:-0.4px">${CAL_MONTHS[viewMonth.getMonth()]} ${viewMonth.getFullYear()}</div>
                <div style="font-family:'JetBrains Mono',monospace;font-size:9.5px;letter-spacing:0.6px;color:rgba(255,255,255,0.45);margin-top:2px">${monthDone} entrenamientos</div>
              </div>
              <div id="cal-next">${CalNavBtn({ dir: 'next', enabled: canNext })}</div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px;margin-bottom:6px">
              ${CAL_DOW.map(d => `<div style="text-align:center;font-family:'JetBrains Mono',monospace;font-size:9.5px;letter-spacing:0.5px;color:rgba(255,255,255,0.35)">${d}</div>`).join('')}
            </div>
            <div id="cal-grid" style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px">
              ${cells.map((c, i) => {
                if (!c) return '<div></div>'
                const r = dayStatusFn(c)
                const isSel = calKey(c) === calKey(selected)
                return `<div data-date="${calKey(c)}">${CalCell({ date: c, rec: r, accent, selected: isSel })}</div>`
              }).join('')}
            </div>
            <div style="display:flex;gap:14px;flex-wrap:wrap;margin-top:14px;padding-top:13px;border-top:0.5px solid rgba(255,255,255,0.06)">
              ${CalLegend({ swatch: accent, label: 'Entrenado' })}
              ${CalLegend({ swatch: 'rgba(255,255,255,0.18)', label: 'Descanso' })}
              ${CalLegend({ swatch: 'transparent', ring: '#ff6b6b', label: 'Faltaste' })}
              ${CalLegend({ swatch: 'transparent', ring: accent, label: 'Hoy' })}
            </div>
          </div>
        </div>

        <div id="cal-detail" style="padding:12px 20px 100px">
          ${DayDetail({ rec: selRec, accent, units, today })}
        </div>
      </div>`

    container.innerHTML = html

    const prevBtn = container.querySelector('#cal-prev button')
    const nextBtn = container.querySelector('#cal-next button')
    if (prevBtn && canPrev) prevBtn.addEventListener('click', () => { viewMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1); render() })
    if (nextBtn && canNext) nextBtn.addEventListener('click', () => { viewMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1); render() })

    container.querySelectorAll('#cal-grid > div[data-date]').forEach(el => {
      el.querySelector('button')?.addEventListener('click', () => {
        const key = parseInt(el.dataset.date)
        for (let d = 1; d <= daysInMonth; d++) {
          const dt = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d)
          if (calKey(dt) === key) { selected = dt; render(); break }
        }
      })
    })

    const markBtn = container.querySelector('#cal-mark-day')
    if (markBtn) {
      markBtn.addEventListener('click', async () => {
        const dateStr = toLocalDateStr(selected)
        await Storage.logWeight('__day__', null, 'kg', null, null, dateStr)
        if (typeof refresh === 'function') refresh()
      })
    }
  }

  render()
}

Object.assign(window, { renderCalendarView })
