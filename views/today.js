// ── Today screen ──
// Shows today's workout or rest day

function mountToday(container, { program, weekIdx, dayIndex, settings, accent, onOpenExercise }) {
  container.innerHTML = ''
  const page = document.createElement('div')
  page.className = 'page'
  container.appendChild(page)

  const now = new Date()
  const jsDay = now.getDay()
  const detectedDayIdx = (jsDay + 6) % 7
  const dayIdx = dayIndex >= 0 ? dayIndex : detectedDayIdx
  const weekObj = program?.weeks[weekIdx]
  const day = weekObj?.days[dayIdx]
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const dateStr = `${monthNames[now.getMonth()]} ${now.getDate()} · ${now.getFullYear()}`
  const weekDayName = dayNames[jsDay]

  if (!day || day.name === 'Rest') {
    renderRestDay(page, { weekDayName, dateStr, accent, weekObj })
    return
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

  // Session hero
  const hero = document.createElement('div')
  hero.style.padding = '8px 20px 4px'
  hero.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:1.6px;color:${accent};text-transform:uppercase;font-weight:600">
      <div style="width:6px;height:6px;border-radius:50%;background:${accent};box-shadow:0 0 8px ${accent};animation:pulse 2s infinite"></div>
      Today's session
    </div>
    <div style="margin-top:6px;font-family:'Space Grotesk',sans-serif;font-size:34px;font-weight:700;color:#fafafa;letter-spacing:-1.2px;line-height:1.02">${day.name} Day</div>
    <div style="margin-top:6px;font-size:13.5px;color:rgba(255,255,255,0.55)">${day.subtitle || ''}</div>`
  page.appendChild(hero)

  // Section label
  const secLabel = document.createElement('div')
  secLabel.style.cssText = 'margin-top:28px;margin-bottom:12px'
  secLabel.appendChild(SectionLabel({ children: 'Exercises', accent }))
  page.appendChild(secLabel)

  // Exercise list
  const list = document.createElement('div')
  list.style.cssText = 'display:flex;flex-direction:column;gap:10px;padding:0 20px'
  page.appendChild(list)

  day.exercises.forEach((ex) => {
    const row = createExerciseRow(ex, accent, settings?.units || 'kg', onOpenExercise)
    list.appendChild(row)
  })

  // Load logged weights
  loadLoggedWeights(day.exercises, accent)
}

function createExerciseRow(ex, accent, units, onOpen) {
  const btn = document.createElement('button')
  btn.className = 'exercise-row'
  btn.style.cssText = `background:#141414;border-radius:18px;padding:14px;border:0.5px solid rgba(255,255,255,0.06);cursor:pointer;text-align:left;display:flex;align-items:stretch;gap:14px;color:inherit;position:relative;transition:border-color 0.2s`

  btn.innerHTML = `
    <div style="width:64px;height:64px;flex-shrink:0;border-radius:12px;position:relative;overflow:hidden;background:#1c1c1c;background-image:repeating-linear-gradient(135deg,rgba(255,255,255,0.018) 0 12px,rgba(255,255,255,0.05) 12px 24px);border:0.5px solid rgba(255,255,255,0.04)"></div>
    <div style="flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center">
      <div style="font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:600;color:#fafafa;letter-spacing:-0.3px;line-height:1.2;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${ex.name}</div>
      <div style="font-size:12px;color:rgba(255,255,255,0.5);margin-top:3px">${ex.muscle}</div>
    </div>
    <div style="display:flex;flex-direction:column;align-items:flex-end;justify-content:center;gap:4px;flex-shrink:0">
      <div style="font-family:'JetBrains Mono',monospace;font-size:22px;font-weight:500;color:#fafafa;letter-spacing:-0.8px;line-height:1;white-space:nowrap">${ex.sets}<span style="color:rgba(255,255,255,0.35);margin:0 3px">×</span>${ex.reps}</div>
    </div>`

  const weightEl = document.createElement('div')
  weightEl.style.cssText = 'font-family:JetBrains Mono,monospace;font-size:11px;color:rgba(255,255,255,0.55);letter-spacing:0.2px;white-space:nowrap;font-weight:400'
  weightEl.id = `weight-${ex.exerciseId || ex.id}`
  btn.querySelector('div:last-child').appendChild(weightEl)

  btn.addEventListener('click', () => onOpen(ex))

  // Check if logged
  Storage.getLogsForDate(new Date().toISOString().slice(0, 10)).then((logs) => {
    const log = logs.find((l) => l.exerciseId === (ex.exerciseId || ex.id))
    if (log) {
      btn.style.borderColor = `${accent}33`
      weightEl.innerHTML = `<span style="color:${accent};font-weight:500">${log.weight}${units}</span> <span style="font-size:8px;letter-spacing:1.2px;text-transform:uppercase;color:${accent}">today</span>`
      const badge = btn.querySelector('div:first-child')
      badge.innerHTML += `<div style="position:absolute;top:6px;right:6px;width:16px;height:16px;border-radius:50%;background:${accent};display:flex;align-items:center;justify-content:center;box-shadow:0 0 12px ${accent}66"><svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5l2.5 2.5L8 1" stroke="#0a0a0a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`
    } else {
      // Try last log
      Storage.getLogsForExercise(ex.exerciseId || ex.id).then((logs) => {
        if (logs.length > 0) {
          const last = logs[logs.length - 1]
          weightEl.innerHTML = `<span>${last.weight}${units}</span> <span style="font-size:8px;letter-spacing:1.2px;text-transform:uppercase;color:rgba(255,255,255,0.35);opacity:0.8">last</span>`
        }
      })
    }
  })

  return btn
}

async function loadLoggedWeights(exercises, accent) {
  const dateStr = new Date().toISOString().slice(0, 10)
  const logs = await Storage.getLogsForDate(dateStr)
  exercises.forEach((ex) => {
    const log = logs.find((l) => l.exerciseId === (ex.exerciseId || ex.id))
    const el = document.getElementById(`weight-${ex.exerciseId || ex.id}`)
    if (!el) return
    if (log) {
      el.innerHTML = `<span style="color:${accent};font-weight:500">${log.weight}${log.units}</span> <span style="font-size:8px;letter-spacing:1.2px;text-transform:uppercase;color:${accent};opacity:0.8">today</span>`
    }
  })
}

function renderRestDay(container, { weekDayName, dateStr, accent, weekObj }) {
  container.innerHTML = `
    <div style="padding:56px 20px 0">
      <div style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:1.6px;color:rgba(255,255,255,0.45);text-transform:uppercase">${dateStr}</div>
      <div style="font-family:'Space Grotesk',sans-serif;font-size:38px;font-weight:700;color:#fafafa;letter-spacing:-1.5px;line-height:1;margin-top:4px">${weekDayName}.</div>
    </div>
    <div style="padding:20px;margin-top:8px">
      <div style="padding:28px;border-radius:24px;background:linear-gradient(155deg,#1a1a1a 0%,#0e0e0e 100%);border:0.5px solid rgba(255,255,255,0.08);position:relative;overflow:hidden">
        <div style="position:absolute;top:-40px;right:-40px;width:200px;height:200px;border-radius:50%;background:#9bd1ff;opacity:0.1;filter:blur(60px)"></div>
        <div style="position:relative;z-index:1">
          <span class="pill" style="background:rgba(155,209,255,0.15);color:#9bd1ff">REST DAY</span>
          <div style="margin-top:12px;font-family:'Space Grotesk',sans-serif;font-size:30px;font-weight:700;color:#fafafa;letter-spacing:-1px;line-height:1.1">Recovery is where you grow.</div>
          <div style="margin-top:8px;font-size:13px;color:rgba(255,255,255,0.55);line-height:1.5">No lifting today. Take it easy.</div>
        </div>
      </div>
    </div>
    <div style="margin-top:18px;margin-bottom:12px"></div>
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
