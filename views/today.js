// ── Today screen ──

let _step = 0
let _exercisesSkipped = false

function mountToday(container, { program, weekIdx, dayIndex, settings, accent, onOpenExercise, exercises }) {
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
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const dateStr = `${monthNames[now.getMonth()]} ${now.getDate()} · ${now.getFullYear()}`
  const weekDayName = dayNames[jsDay]

  if (!day || day.name === 'Rest') {
    renderRestDay(page, { weekDayName, dateStr, accent, weekObj })
    return
  }

  const warmupMuscles = day.exercises.map((ex) => {
    const resolved = { ...ex, ...(exercisesById[ex.exerciseId] || {}) }
    return resolved.muscle
  }).filter(Boolean)

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

  // Accordion flow
  const accordionEl = document.createElement('div')
  accordionEl.style.cssText = 'margin-top:20px'
  page.appendChild(accordionEl)

  function renderAccordion() {
    accordionEl.innerHTML = ''
    const inner = document.createElement('div')
    inner.style.cssText = 'display:flex;flex-direction:column;gap:2px;padding:0 20px'
    accordionEl.appendChild(inner)

    const steps = [
      { num: 1, label: 'Calentamiento' },
      { num: 2, label: 'Ejercicios' },
      { num: 3, label: 'Estiramientos' },
    ]

    steps.forEach((s, idx) => {
      const status = idx < _step ? 'completed' : (idx === _step ? 'current' : 'pending')

      const header = document.createElement('button')
      header.style.cssText = `display:flex;align-items:center;gap:10px;width:100%;padding:14px 16px;border-radius:14px;border:0.5px solid rgba(255,255,255,0.06);cursor:default;color:inherit;font-family:'Space Grotesk',sans-serif;font-size:15px;font-weight:600;text-align:left;background:${status === 'current' ? '#141414' : 'transparent'};transition:all 0.2s`

      const badge = document.createElement('div')
      if (status === 'completed') {
        badge.style.cssText = `width:26px;height:26px;border-radius:50%;background:${accent};display:flex;align-items:center;justify-content:center;flex-shrink:0`
        badge.innerHTML = `<svg width="12" height="9" viewBox="0 0 12 9" fill="none"><path d="M1 4.5l3.5 3.5L11 1" stroke="#0a0a0a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`
      } else if (status === 'current') {
        badge.style.cssText = `width:26px;height:26px;border-radius:50%;background:${accent}22;border:1.5px solid ${accent};display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:600;color:${accent}`
        badge.textContent = s.num
      } else {
        badge.style.cssText = `width:26px;height:26px;border-radius:50%;border:1.5px solid rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:500;color:rgba(255,255,255,0.3)`
        badge.textContent = s.num
      }

      const labelSpan = document.createElement('span')
      labelSpan.textContent = s.label
      labelSpan.style.color = status === 'pending' ? 'rgba(255,255,255,0.3)' : '#fafafa'

      const statusLabel = document.createElement('span')
      statusLabel.style.cssText = `margin-left:auto;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:1.2px;text-transform:uppercase`
      if (status === 'completed') {
        statusLabel.style.color = accent
        statusLabel.textContent = 'Listo'
      } else if (status === 'current') {
        statusLabel.style.color = 'rgba(255,255,255,0.4)'
        statusLabel.textContent = 'En curso'
      } else {
        statusLabel.style.color = 'rgba(255,255,255,0.15)'
        statusLabel.textContent = 'Pendiente'
      }

      header.appendChild(badge)
      header.appendChild(labelSpan)
      header.appendChild(statusLabel)
      inner.appendChild(header)

      if (status === 'current') {
        const body = document.createElement('div')
        body.style.cssText = 'animation:fadeUp 0.3s ease;padding:4px 0 8px'

        if (idx === 0) renderWarmupBody(body)
        else if (idx === 1) renderExercisesBody(body)
        else if (idx === 2) renderStretchBody(body)

        inner.appendChild(body)
      }
    })
  }

  function renderWarmupBody(container) {
    const items = resolvePanelItems(warmupMuscles, 'warmup')
    if (items.length === 0) { _step = 1; renderAccordion(); return }
    container.appendChild(WarmupPanelContent({
      muscles: warmupMuscles,
      accent,
      onComplete: () => {
        showCenterToast({
          svg: TOAST_SVG_WATCH,
          message: 'Inicia tu Smart Watch',
          duration: 3000,
          accent,
          onDone: () => { _step = 1; renderAccordion() }
        })
      }
    }))
  }

  function renderExercisesBody(container) {
    const topRow = document.createElement('div')
    topRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:10px'
    const skipBtn = document.createElement('button')
    skipBtn.style.cssText = `display:flex;align-items:center;gap:8px;padding:8px 14px;border-radius:8px;border:0.5px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.03);cursor:pointer;color:rgba(255,255,255,0.6);font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:500;touch-action:manipulation`
    skipBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="0.5" y="0.5" width="13" height="13" rx="3" stroke="currentColor" stroke-width="1.5"/></svg> Marcar todo listo (sin peso)`
    skipBtn.addEventListener('click', () => { _exercisesSkipped = true; _step = 2; renderAccordion() })
    topRow.appendChild(skipBtn)
    container.appendChild(topRow)

    const list = document.createElement('div')
    list.style.cssText = 'display:flex;flex-direction:column;gap:10px'
    container.appendChild(list)

    day.exercises.forEach((ex) => {
      const resolved = { ...ex, ...(exercisesById[ex.exerciseId] || {}) }
      list.appendChild(createExerciseRow(resolved, accent, settings?.units || 'kg', onOpenExercise))
    })

    setTimeout(async () => {
      if (_step !== 1) return
      const dateStr = new Date().toISOString().slice(0, 10)
      const logs = await Storage.getLogsForDate(dateStr)
      const allLogged = day.exercises.every(ex => logs.some(l => l.exerciseId === (ex.exerciseId || ex.id)))
      if ((allLogged || _exercisesSkipped) && _step === 1) { _step = 2; renderAccordion() }
    }, 200)
  }

  function renderStretchBody(container) {
    const items = resolvePanelItems(warmupMuscles, 'stretch')
    if (items.length === 0) { _step = 3; renderAccordion(); return }
    container.appendChild(StretchingPanelContent({
      muscles: warmupMuscles,
      accent,
      onComplete: () => {
        showCenterToast({
          svg: TOAST_IMG_TRAINER,
          message: 'Pedro te felicita',
          duration: 3000,
          accent,
          onDone: () => { _step = 3; renderAccordion() }
        })
      }
    }))
  }

  renderAccordion()
  loadLoggedWeights(day.exercises, accent)
}

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
