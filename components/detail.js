// ── ExerciseDetail bottom sheet ──
// Renders Workout tab (stepper + tips + alternatives) and History tab (chart + sessions)

function mountExerciseDetail(container, { exercise, accent, units, onClose, onLog }) {
  let tab = 'workout'
  let pendingWeight = null
  let loggedToday = false

  function render() {
    container.innerHTML = ''
    const scrollEl = document.createElement('div')
    scrollEl.style.cssText = `color:#fafafa;padding-bottom:40px`
    container.appendChild(scrollEl)

    // Hero
    const heroWrap = document.createElement('div')
    heroWrap.style.padding = '16px 16px 0'
    heroWrap.appendChild(ExercisePlaceholder({ name: exercise.name, muscle: exercise.muscle, accent, size: 'xl', imgUrl: exercise.imgUrl }))
    scrollEl.appendChild(heroWrap)

    // Header
    const header = document.createElement('div')
    header.style.padding = '16px 20px 0'
    header.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;flex-wrap:wrap">
        <span class="pill" style="background:rgba(255,255,255,0.08);color:#fafafa">${exercise.muscle}</span>
      </div>
      <div style="font-family:'Space Grotesk',sans-serif;font-size:26px;font-weight:700;color:#fafafa;letter-spacing:-0.8px;line-height:1.1">${exercise.name}</div>
      <div style="display:flex;gap:18px;margin-top:18px;padding-top:16px;border-top:0.5px solid rgba(255,255,255,0.08)">
        ${StatBlock({ value: exercise.sets, label: 'Sets' }).outerHTML}
        ${StatBlock({ value: exercise.reps, label: 'Reps' }).outerHTML}
        ${StatBlock({ value: exercise.rest, label: 'Rest', unit: 's' }).outerHTML}
      </div>`
    scrollEl.appendChild(header)

    // Segmented control
    const seg = document.createElement('div')
    seg.style.cssText = `margin:24px 20px 0;display:flex;padding:3px;border-radius:11px;background:rgba(255,255,255,0.04);border:0.5px solid rgba(255,255,255,0.06)`
    ;['workout', 'history'].forEach((t) => {
      const btn = document.createElement('button')
      const on = tab === t
      btn.style.cssText = `flex:1;padding:8px 0;border:0;cursor:pointer;background:${on ? '#262626' : 'transparent'};color:${on ? '#fafafa' : 'rgba(255,255,255,0.5)'};font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:600;letter-spacing:-0.1px;border-radius:8px`
      btn.textContent = t === 'workout' ? 'Workout' : 'History'
      btn.addEventListener('click', () => { tab = t; render() })
      seg.appendChild(btn)
    })
    scrollEl.appendChild(seg)

    if (tab === 'workout') renderWorkoutTab(scrollEl)
    else renderHistoryTab(scrollEl)
  }

  function renderWorkoutTab(scrollEl) {
    const STEP = 5
    const initial = pendingWeight !== null ? pendingWeight : 0
    let pending = initial

    // Weight stepper card
    const stepperWrap = document.createElement('div')
    stepperWrap.style.cssText = 'margin-top:22px;margin-bottom:10px'
    stepperWrap.appendChild(SectionLabel({ children: "Today's working weight", accent }))
    scrollEl.appendChild(stepperWrap)

    const card = document.createElement('div')
    card.style.cssText = `margin:0 20px;background:#141414;border-radius:20px;padding:20px;border:0.5px solid ${loggedToday ? `${accent}33` : 'rgba(255,255,255,0.06)'};position:relative;overflow:hidden`
    card.innerHTML = loggedToday ? `<div style="position:absolute;top:-50px;right:-50px;width:180px;height:180px;border-radius:50%;background:${accent};opacity:0.08;filter:blur(50px)"></div>` : ''

    const stepperRow = document.createElement('div')
    stepperRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:14px;position:relative;z-index:1'
    stepperRow.innerHTML = `
      <button class="stepper-btn">−</button>
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px">
        <input type="text" inputmode="decimal" value="${pending || ''}" placeholder="0" style="background:transparent;border:0;outline:none;text-align:center;width:100%;font-family:'JetBrains Mono',monospace;font-size:44px;font-weight:500;color:${loggedToday ? accent : '#fafafa'};letter-spacing:-2px;line-height:1;padding:0">
        <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:1.6px;text-transform:uppercase;color:rgba(255,255,255,0.45)">${units} · ${STEP}${units} steps</div>
      </div>
      <button class="stepper-btn">+</button>`
    card.appendChild(stepperRow)

    const isDirty = () => pending !== (pendingWeight !== null ? pendingWeight : 0)
    const logBtn = document.createElement('button')
    logBtn.style.cssText = `margin-top:18px;width:100%;padding:13px 18px;border-radius:12px;border:0;cursor:pointer;font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:700;letter-spacing:-0.1px;display:flex;align-items:center;justify-content:center;gap:8px;transition:all 0.2s;position:relative;z-index:1`
    card.appendChild(logBtn)
    scrollEl.appendChild(card)

    // Clear button
    const clearBtn = document.createElement('button')
    clearBtn.style.cssText = `margin:8px auto 0;display:${loggedToday ? 'block' : 'none'};padding:8px;background:transparent;border:0;cursor:pointer;color:rgba(255,255,255,0.4);font-family:'Space Grotesk',sans-serif;font-size:11px;letter-spacing:0.2px`
    clearBtn.textContent = "Clear today's log"
    scrollEl.appendChild(clearBtn)

    function updateLogBtn() {
      const dirty = isDirty()
      if (loggedToday && !dirty) {
        logBtn.style.background = `${accent}22`
        logBtn.style.color = accent
        logBtn.style.boxShadow = 'none'
        logBtn.innerHTML = `<svg width="14" height="11" viewBox="0 0 14 11" fill="none"><path d="M1 5.5l4 4 8-8.5" stroke="${accent}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg> Logged · ${pending}${units}`
      } else if (loggedToday && dirty) {
        logBtn.style.background = accent
        logBtn.style.color = '#0a0a0a'
        logBtn.style.boxShadow = `0 6px 20px ${accent}33`
        logBtn.innerHTML = `Update · ${pending}${units}`
      } else {
        logBtn.style.background = accent
        logBtn.style.color = '#0a0a0a'
        logBtn.style.boxShadow = `0 6px 20px ${accent}33`
        logBtn.innerHTML = `Log workout · ${pending}${units}`
      }
      clearBtn.style.display = loggedToday ? 'block' : 'none'
    }
    updateLogBtn()

    // Stepper button events
    const decBtn = stepperRow.querySelectorAll('.stepper-btn')[0]
    const incBtn = stepperRow.querySelectorAll('.stepper-btn')[1]
    const input = stepperRow.querySelector('input')

    decBtn.addEventListener('click', () => {
      pending = Math.max(0, +(pending - STEP).toFixed(1))
      input.value = pending || ''
      updateLogBtn()
    })
    incBtn.addEventListener('click', () => {
      pending = +(pending + STEP).toFixed(1)
      input.value = pending
      updateLogBtn()
    })
    input.addEventListener('input', (e) => {
      const v = e.target.value.replace(/[^0-9.]/g, '')
      pending = v === '' ? 0 : parseFloat(v)
      updateLogBtn()
    })
    logBtn.addEventListener('click', async () => {
      if (pending === 0) return
      const savedLog = await onLog(exercise.id, pending)
      pendingWeight = pending
      loggedToday = true
      if (savedLog) {
        exercise.logs = [...(exercise.logs || []), savedLog]
      }
      updateLogBtn()
    })
    clearBtn.addEventListener('click', async () => {
      pendingWeight = null
      loggedToday = false
      pending = 0
      input.value = ''
      updateLogBtn()
    })

    // Tips
    const tipsLabel = document.createElement('div')
    tipsLabel.style.cssText = 'margin-top:26px;margin-bottom:10px'
    tipsLabel.appendChild(SectionLabel({ children: 'Form cues', accent }))
    scrollEl.appendChild(tipsLabel)

    const tipsCard = document.createElement('div')
    tipsCard.style.cssText = 'margin:0 20px;background:#141414;border-radius:18px;padding:14px;border:0.5px solid rgba(255,255,255,0.06)'
    const tips = exercise.tips && exercise.tips.length ? exercise.tips : ['Control the eccentric (lowering) — 2 seconds minimum', 'Full range of motion beats heavy partials', 'Breathe out on the exertion, in on the return']
    tipsCard.innerHTML = tips.map((tip, i) => `
      <div style="display:flex;gap:12px;padding:8px 4px;${i < tips.length - 1 ? 'border-bottom:0.5px solid rgba(255,255,255,0.04)' : ''}">
        <div style="width:18px;height:18px;border-radius:50%;background:rgba(212,255,58,0.12);color:${accent};font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:600;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px">${i + 1}</div>
        <div style="flex:1;font-size:13px;color:rgba(255,255,255,0.78);line-height:1.45">${tip}</div>
      </div>`).join('')
    scrollEl.appendChild(tipsCard)

    // Alternatives
    const alts = exercise.alternatives && exercise.alternatives.length ? exercise.alternatives : []
    if (alts.length > 0) {
      const altLabel = document.createElement('div')
      altLabel.style.cssText = 'margin-top:26px;margin-bottom:10px'
      altLabel.appendChild(SectionLabel({ children: "Can't do it? Try one of these", accent }))
      scrollEl.appendChild(altLabel)

      const altScroll = document.createElement('div')
      altScroll.style.cssText = 'display:flex;gap:10px;padding:0 20px;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;-webkit-overflow-scrolling:touch;padding-bottom:6px'
      altScroll.innerHTML = alts.map((alt, i) => `
        <div style="flex-shrink:0;width:200px;scroll-snap-align:start;background:#141414;border-radius:18px;border:0.5px solid rgba(255,255,255,0.06);overflow:hidden">
          <div style="height:90px;position:relative;background:#1a1a1a;background-image:repeating-linear-gradient(135deg,rgba(255,255,255,0.018) 0 16px,rgba(255,255,255,0.045) 16px 32px)">
            <div style="font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:1.2px;color:rgba(255,255,255,0.4);text-transform:uppercase;position:absolute;top:8px;left:10px">ALT ${i + 1}</div>
            <div style="width:28px;height:28px;border-radius:8px;background:rgba(212,255,58,0.14);color:${accent};display:flex;align-items:center;justify-content:center;position:absolute;top:8px;right:8px;font-size:13px;font-weight:700">↺</div>
          </div>
          <div style="padding:12px">
            <div style="font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:600;color:#fafafa;letter-spacing:-0.3px;line-height:1.2">${alt.name}</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.5);margin-top:6px;line-height:1.4">${alt.reason}</div>
          </div>
        </div>`).join('')
      scrollEl.appendChild(altScroll)
    }
  }

  function renderHistoryTab(scrollEl) {
    const allTime = exercise.logs && exercise.logs.length ? Math.max(...exercise.logs.map((l) => l.weight)) : 0
    const last = exercise.logs && exercise.logs.length ? exercise.logs[exercise.logs.length - 1] : null
    const first = exercise.logs && exercise.logs.length ? exercise.logs[0] : null
    const totalGain = first && last ? last.weight - first.weight : 0
    const pct = first ? ((totalGain / first.weight) * 100).toFixed(1) : '0'

    const data = exercise.logs || []

    // Stats grid
    const statsGrid = document.createElement('div')
    statsGrid.style.cssText = 'padding:22px 20px 0;display:grid;grid-template-columns:repeat(3,1fr);gap:8px'
    const stats = [
      { label: 'All-time', val: allTime, color: accent },
      { label: 'Current', val: last ? last.weight : 0, color: '#fafafa' },
      { label: '6-week Δ', val: (totalGain >= 0 ? '+' : '') + totalGain.toFixed(1), color: totalGain >= 0 ? accent : '#ff6b6b' },
    ]
    statsGrid.innerHTML = stats.map((s) => `
      <div style="background:#141414;border-radius:14px;padding:12px;border:0.5px solid rgba(255,255,255,0.06)">
        <div style="font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:1.2px;text-transform:uppercase;color:rgba(255,255,255,0.45)">${s.label}</div>
        <div style="margin-top:6px;font-family:'JetBrains Mono',monospace;font-size:20px;font-weight:500;color:${s.color};letter-spacing:-0.5px">${s.val}<span style="font-size:11px;color:rgba(255,255,255,0.4);margin-left:2px">${units}</span></div>
      </div>`).join('')
    scrollEl.appendChild(statsGrid)

    // Chart
    if (data.length > 0) {
      const chartWrap = document.createElement('div')
      chartWrap.style.cssText = 'padding:20px 20px 0'
      chartWrap.innerHTML = `
        <div style="background:#141414;border-radius:18px;padding:14px;border:0.5px solid rgba(255,255,255,0.06)">
          <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px">
            <div style="font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:600;color:#fafafa">Weight per session</div>
            <span class="pill" style="background:rgba(255,255,255,0.08);color:#fafafa">${pct >= 0 ? '+' : ''}${pct}%</span>
          </div>
          ${LineChart({ data, width: 324, height: 170, color: accent, unit: units })}
        </div>`
      scrollEl.appendChild(chartWrap)
    }

    // Session list
    const sessLabel = document.createElement('div')
    sessLabel.style.cssText = 'margin-top:22px;margin-bottom:10px'
    sessLabel.appendChild(SectionLabel({ children: 'Past sessions', accent }))
    scrollEl.appendChild(sessLabel)

    const sessList = document.createElement('div')
    sessList.style.cssText = 'padding:0 20px;display:flex;flex-direction:column;gap:8px'
    if (data.length === 0) {
      sessList.innerHTML = `<div style="padding:20px;text-align:center;font-size:13px;color:rgba(255,255,255,0.4)">No sessions logged yet. Start tracking!</div>`
    } else {
      sessList.innerHTML = [...data].reverse().map((sess, i) => {
        const idx = data.length - 1 - i
        const prev = idx > 0 ? data[idx - 1] : null
        const delta = prev ? +(sess.weight - prev.weight).toFixed(1) : null
        const isPR = sess.weight === allTime
        const isToday = sess.date === new Date().toISOString().slice(0, 10)
        return `
          <div style="background:#141414;border-radius:14px;padding:12px 14px;border:${isToday ? `0.5px solid ${accent}55` : '0.5px solid rgba(255,255,255,0.06)'};display:flex;align-items:center;gap:14px;position:relative;overflow:hidden">
            ${isToday ? `<div style="position:absolute;top:0;bottom:0;left:0;width:2px;background:${accent}"></div>` : ''}
            <div style="flex:1;min-width:0">
              <div style="font-family:'JetBrains Mono',monospace;font-size:12px;color:${isToday ? accent : 'rgba(255,255,255,0.7)'};letter-spacing:0.4px;${isToday ? 'text-transform:uppercase;font-weight:600' : ''}">${sess.date}</div>
              ${delta !== null && delta !== 0 ? `<div style="display:inline-flex;align-items:center;gap:3px;margin-top:4px;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.4px;color:${delta > 0 ? accent : '#ff6b6b'};background:${delta > 0 ? `${accent}14` : 'rgba(255,107,107,0.12)'};padding:2px 7px;border-radius:6px"><span>${delta > 0 ? '▲' : '▼'}</span><span>${delta > 0 ? '+' : ''}${delta}${units}</span></div>` : ''}
              ${delta === 0 ? `<div style="display:inline-block;margin-top:4px;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.6px;color:rgba(255,255,255,0.4);background:rgba(255,255,255,0.04);padding:2px 7px;border-radius:6px">— hold</div>` : ''}
            </div>
            <div style="text-align:right">
              <div style="font-family:'JetBrains Mono',monospace;font-size:18px;font-weight:500;color:${isPR ? accent : '#fafafa'};letter-spacing:-0.4px">${sess.weight}<span style="font-size:10px;color:rgba(255,255,255,0.4);margin-left:2px">${units}</span></div>
              ${isPR ? `<div style="font-family:'JetBrains Mono',monospace;font-size:8px;letter-spacing:1.4px;color:${accent};margin-top:2px">★ PR</div>` : ''}
            </div>
          </div>`
      }).join('')
    }
    scrollEl.appendChild(sessList)
  }

  render()
}
