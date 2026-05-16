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
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
        <div style="font-family:'Space Grotesk',sans-serif;font-size:26px;font-weight:700;color:#fafafa;letter-spacing:-0.8px;line-height:1.1">${exercise.name}</div>
        <button onclick="window.open('https://www.google.com/search?tbm=vid&q=${encodeURIComponent(exercise.name)}','_blank')" style="flex-shrink:0;width:36px;height:36px;border-radius:10px;border:0;background:rgba(255,255,255,0.06);cursor:pointer;display:flex;align-items:center;justify-content:center;touch-action:manipulation" aria-label="Search on Google">
          <svg width="17" height="17" viewBox="0 0 48 48" fill="none"><path d="M43.6 24.5c0-1.6-.1-3.1-.4-4.6H24v8.7h11c-.5 2.6-1.9 4.9-4 6.4v5.3h6.5c3.8-3.5 6-8.7 6-15.8z" fill="#4285F4"/><path d="M24 44c5.4 0 10-1.8 13.3-4.9l-6.5-5.3c-1.8 1.2-4.1 2-6.8 2-5.3 0-9.8-3.6-11.4-8.4H5v5.5C8.3 39.8 15.7 44 24 44z" fill="#34A853"/><path d="M12.6 27.4c-.8-2.4-.8-4.9 0-7.2v-5.5H5c-2.7 5.4-2.7 11.8 0 17.2l7.6-6.5z" fill="#FBBC05"/><path d="M24 10.3c2.9 0 5.5 1 7.5 3l5.6-5.6C33.8 4.6 29.4 3 24 3 15.7 3 8.3 7.2 5 13.7l7.6 6c1.6-4.8 6.1-8.4 11.4-8.4z" fill="#EA4335"/></svg>
        </button>
      </div>
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
      <button class="stepper-btn" style="width:72px;height:72px;border-radius:18px;border:0;background:rgba(255,255,255,0.06);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:32px;color:#fafafa;touch-action:manipulation;flex-shrink:0">−</button>
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px">
        <input type="text" inputmode="decimal" value="${pending || ''}" placeholder="0" style="background:transparent;border:0;outline:none;text-align:center;width:100%;font-family:'JetBrains Mono',monospace;font-size:44px;font-weight:500;color:${loggedToday ? accent : '#fafafa'};letter-spacing:-2px;line-height:1;padding:0">
        <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:1.6px;text-transform:uppercase;color:rgba(255,255,255,0.45)">${units}</div>
      </div>
      <button class="stepper-btn" style="width:72px;height:72px;border-radius:18px;border:0;background:rgba(255,255,255,0.06);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:32px;color:#fafafa;touch-action:manipulation;flex-shrink:0">+</button>`
    card.appendChild(stepperRow)

    const isDirty = () => pending !== (pendingWeight !== null ? pendingWeight : 0)
    const logBtn = document.createElement('button')
    logBtn.style.cssText = `margin-top:18px;width:100%;padding:13px 18px;border-radius:12px;border:0;cursor:pointer;font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:700;letter-spacing:-0.1px;display:flex;align-items:center;justify-content:center;gap:8px;transition:all 0.2s;position:relative;z-index:1`
    card.appendChild(logBtn)
    scrollEl.appendChild(card)

    // Clear button
    const clearBtn = document.createElement('button')
    clearBtn.style.cssText = `margin:8px auto 0;display:${loggedToday ? 'block' : 'none'};padding:10px 14px;background:transparent;border:0;cursor:pointer;color:rgba(255,255,255,0.4);font-family:'Space Grotesk',sans-serif;font-size:13px;letter-spacing:0.2px;touch-action:manipulation`
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
          <div style="height:90px;position:relative;background:#1a1a1a;background-image:repeating-linear-gradient(135deg,rgba(255,255,255,0.018) 0 16px,rgba(255,255,255,0.045) 16px 32px);display:flex;align-items:center;justify-content:center"><div style="font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:1.2px;color:rgba(255,255,255,0.4);text-transform:uppercase;position:absolute;top:8px;left:10px">ALT ${i + 1}</div><svg width="64" height="64" viewBox="0 0 512 512" fill="#000000"><g><g><rect x="205.135" y="126.02" style="fill:#EBEBEB" width="77.82" height="41.194"/><path style="fill:#EBEBEB" d="M255.924,144.219v4.797c0,10.051-8.148,18.198-18.275,18.198H18.275C8.148,167.214,0,159.067,0,149.016v-4.797c0-10.051,8.148-18.199,18.275-18.199h219.374C247.776,126.02,255.924,134.168,255.924,144.219z"/><path style="fill:#424242" d="M112.009,146.275c0,7.158-0.152,14.163-0.304,20.94c-1.066,31.448-4.492,58.404-9.137,75.003c-1.675,5.787-3.502,10.279-5.406,13.325c-1.599,2.589-3.198,4.112-4.95,4.416c-0.304,0.152-0.533,0.152-0.838,0.152H44.925c-3.274,0-6.396-4.34-9.213-12.031c-5.635-15.686-9.823-45.382-11.041-80.866c-0.153-6.777-0.304-13.782-0.304-20.94c0-6.929,0.076-13.706,0.304-20.254c1.447-42.794,7.158-77.288,14.62-89.09c1.295-2.056,2.665-3.503,4.036-4.035c0.533-0.229,1.066-0.381,1.599-0.381h46.449c0.304,0,0.533,0,0.838,0.152c1.751,0.304,3.35,1.827,4.95,4.417c1.904,3.046,3.731,7.615,5.406,13.402c4.645,16.752,8.071,43.859,9.137,75.536C111.933,132.568,112.009,139.346,112.009,146.275z"/><path style="fill:#222323" d="M110.791,146.275c0,7.158-0.076,14.163-0.304,20.94c-0.914,31.448-3.883,58.404-7.919,75.003c-1.599,6.396-3.35,11.269-5.178,14.315c-1.447,2.36-2.97,3.579-4.492,3.579c-0.229,0-0.457,0-0.686-0.152c-8.452-1.979-15.382-41.27-16.904-92.745c-0.229-6.777-0.305-13.782-0.305-20.94c0-6.929,0.076-13.706,0.305-20.254c1.447-51.779,8.376-91.374,16.904-93.354c0.229-0.152,0.457-0.152,0.686-0.152c1.522,0,3.046,1.219,4.492,3.579c1.827,3.046,3.579,7.919,5.178,14.392c4.112,16.752,7.081,43.859,7.919,75.536C110.715,132.568,110.791,139.346,110.791,146.275z"/><g><path style="fill:#424242" d="M188.459,146.275c0,7.081-0.076,14.087-0.305,20.94c0,4.188-0.152,8.376-0.304,12.488c-2.284,61.602-10.736,108.202-21.092,112.543c-0.533,0.304-1.066,0.381-1.599,0.381h-52.54c-5.863,0-11.193-13.63-15.229-36.093c-0.152-0.305-0.152-0.686-0.228-0.99c-3.96-22.387-6.777-53.378-7.463-88.329c-0.228-6.853-0.304-13.858-0.304-20.94c0-6.853,0.076-13.63,0.228-20.254c0.762-35.179,3.503-66.399,7.539-88.938c0.076-0.305,0.076-0.686,0.228-0.99C101.425,13.63,106.755,0,112.618,0h52.54c0.533,0,1.066,0.076,1.599,0.381c10.356,4.34,18.884,51.246,21.092,113.075c0.152,4.112,0.304,8.3,0.381,12.564C188.383,132.645,188.459,139.422,188.459,146.275z"/><path style="fill:#222323" d="M191.581,146.275c0,7.081-0.076,14.087-0.304,20.94c0,4.112-0.152,8.148-0.304,12.107c-2.361,64.952-11.574,113.304-22.615,113.304c-0.533,0-1.066-0.076-1.599-0.381c-11.041-4.645-19.95-57.338-21.397-125.031c-0.228-6.853-0.305-13.858-0.305-20.94c0-6.853,0.076-13.63,0.229-20.254c1.523-67.998,10.432-120.995,21.473-125.64C167.291,0.076,167.824,0,168.357,0c11.117,0,20.331,48.656,22.615,113.837c0.152,3.96,0.304,8.072,0.381,12.184C191.505,132.645,191.581,139.422,191.581,146.275z"/></g><rect x="200.795" y="126.02" style="opacity:0.1;fill:#040000" width="14.772" height="41.194"/><path style="fill:#EBEBEB" d="M204.678,125.716v41.804c0,6.168-3.96,11.269-8.833,11.269l-4.873,0.533l-3.122,0.381l-23.224,2.741c-0.076,0-0.076,0-0.076,0c-0.304,0-0.457-0.228-0.457-0.609c0,0-1.294-4.036-2.132-14.62c-0.381-5.178-0.685-11.955-0.685-20.635c0-7.843,0.381-14.848,0.914-20.559c0.837-8.985,1.904-14.696,1.904-14.696c0-0.305,0.152-0.533,0.457-0.533c0-0.076,0-0.076,0.076-0.076l23.224,2.741l3.122,0.381l4.873,0.609C200.718,114.446,204.678,119.548,204.678,125.716z"/></g><g><rect x="229.045" y="126.02" style="fill:#EBEBEB" width="77.82" height="41.194"/><path style="fill:#EBEBEB" d="M512,144.219v4.797c0,10.051-8.148,18.198-18.275,18.198H274.351c-0.99,0-1.98-0.076-2.894-0.228c-8.756-1.371-15.381-8.909-15.381-17.97v-4.797c0-10.051,8.148-18.199,18.275-18.199h219.374C503.852,126.02,512,134.168,512,144.219z"/><path style="fill:#424242" d="M487.633,146.275c0,7.158-0.152,14.163-0.304,20.94c-0.076,1.675-0.152,3.274-0.229,4.95c0,1.599-0.076,3.198-0.228,4.797c-0.229,4.797-0.533,9.442-0.837,14.01c-0.229,2.285-0.381,4.493-0.609,6.625c-0.152,2.056-0.381,4.112-0.609,6.092c-0.914,8.985-2.132,17.209-3.427,24.366c-0.304,1.752-0.685,3.503-0.99,5.102c-2.741,12.64-6.015,21.473-9.67,25.128c-0.305,0.304-0.609,0.533-0.914,0.761c-0.838,0.685-1.828,1.066-2.741,1.066h-46.448c-0.152,0-0.304-0.076-0.457-0.076c-0.152,0-0.229,0-0.381-0.076c-0.076,0.076-0.152,0-0.229,0c-1.675-0.457-3.198-1.979-4.721-4.416c-1.904-3.046-3.731-7.538-5.33-13.325c-4.721-16.6-8.148-43.555-9.213-75.003c-0.152-6.777-0.305-13.782-0.305-20.94c0-6.929,0.076-13.706,0.305-20.254c1.066-31.677,4.492-58.784,9.213-75.536c1.599-5.787,3.427-10.356,5.33-13.402c1.523-2.437,3.046-3.96,4.721-4.417c0.076,0,0.152-0.076,0.229,0c0.152-0.076,0.228-0.076,0.381-0.076c0.152-0.076,0.304-0.076,0.457-0.076h46.448c0.305,0,0.609,0.076,0.914,0.152c0.229,0,0.381,0.076,0.533,0.152c1.295,0.457,2.513,1.599,3.655,3.274c0.381,0.457,0.685,0.99,0.99,1.523c1.218,2.132,2.436,4.797,3.502,8.071c0.305,0.761,0.533,1.522,0.762,2.361c1.904,6.091,3.579,13.63,4.949,22.463c0.229,1.142,0.381,2.284,0.533,3.426c0.229,1.37,0.457,2.817,0.609,4.264c0.533,3.427,0.914,7.081,1.294,10.813c0.152,1.371,0.304,2.817,0.457,4.264c0.304,2.894,0.533,5.863,0.762,8.833c0.228,3.046,0.457,6.092,0.609,9.29c0.305,4.797,0.533,9.67,0.686,14.62C487.557,132.568,487.633,139.346,487.633,146.275z"/><path style="fill:#222323" d="M436.997,146.275c0,7.158-0.076,14.163-0.305,20.94c-1.523,51.017-8.3,90.08-16.676,92.745c-0.076,0-0.152,0.076-0.228,0c-0.152,0.076-0.229,0.152-0.381,0.076c-0.076,0-0.152,0.076-0.305,0.076c-0.457,0-0.914-0.152-1.371-0.381c-0.304-0.152-0.609-0.304-0.914-0.609c-0.761-0.533-1.447-1.371-2.132-2.513l-0.076-0.076c-1.828-3.046-3.579-7.919-5.102-14.315c-4.112-16.6-7.081-43.555-7.995-75.003c-0.228-6.777-0.304-13.782-0.304-20.94c0-6.929,0.076-13.706,0.304-20.254c0.838-31.677,3.807-58.784,7.995-75.536c1.523-6.473,3.274-11.346,5.102-14.392l0.076-0.076c0.686-1.142,1.371-1.98,2.132-2.513c0.304-0.304,0.609-0.457,0.914-0.609c0.457-0.229,0.914-0.381,1.371-0.381c0.152,0,0.229,0,0.305,0.076c0.152-0.076,0.228,0,0.381,0.076c0.076-0.076,0.152,0,0.228,0c8.376,2.665,15.229,42.032,16.676,93.354C436.921,132.568,436.997,139.346,436.997,146.275z"/><g><path style="fill:#424242" d="M422.606,146.275c0,7.081-0.076,14.087-0.305,20.94c-0.685,34.951-3.502,65.942-7.462,88.329c0,0.304-0.076,0.609-0.152,0.914c0,0.076-0.076,0.076-0.076,0.076c-0.076,0.914-0.229,1.827-0.457,2.665c-0.305,1.827-0.686,3.579-1.066,5.254c-0.305,1.218-0.533,2.437-0.837,3.655c-0.533,2.36-1.142,4.645-1.752,6.701c0,0,0,0.076,0,0.153c-0.609,1.98-1.218,3.807-1.751,5.482c-0.686,1.752-1.371,3.35-2.056,4.721c-0.609,1.371-1.294,2.589-1.98,3.579c-0.381,0.533-0.685,0.99-1.066,1.371c-0.305,0.457-0.686,0.761-0.99,1.066c-0.305,0.304-0.609,0.533-0.914,0.685c-0.229,0.152-0.457,0.305-0.685,0.381c-0.152,0.076-0.381,0.152-0.609,0.228c-0.304,0.076-0.685,0.152-1.066,0.152h-52.54c-0.533,0-1.066-0.076-1.599-0.381c-0.076,0-0.076,0-0.152-0.076c-10.28-4.721-18.656-51.17-20.94-112.467c-0.152-4.112-0.305-8.3-0.305-12.488c-0.228-6.853-0.304-13.858-0.304-20.94c0-6.853,0.076-13.63,0.228-20.254c0.076-3.96,0.152-7.843,0.305-11.651c0-0.304,0.076-0.609,0.076-0.914c2.208-61.83,10.736-108.735,21.092-113.075C345.775,0.076,346.308,0,346.841,0h52.54c5.635,0,10.812,12.564,14.772,33.427c0.076,0.381,0.152,0.838,0.228,1.219c0.153,0.457,0.229,0.914,0.229,1.447c0,0,0.076,0,0.076,0.076c0.076,0.304,0.152,0.609,0.152,0.914c4.036,22.539,6.777,53.758,7.538,88.938C422.529,132.645,422.606,139.422,422.606,146.275z"/><path style="fill:#222323" d="M366.943,146.275c0,7.081-0.076,14.087-0.305,20.94c-1.447,67.389-10.279,119.929-21.244,124.955c-0.076,0.076-0.076,0.076-0.152,0.076c-0.533,0.304-1.066,0.381-1.599,0.381c-0.381,0-0.686-0.076-1.066-0.152c-0.152-0.076-0.304-0.076-0.533-0.228c-0.304-0.076-0.533-0.229-0.761-0.381c-2.589-1.599-5.026-5.939-7.31-12.412c-1.142-3.35-2.284-7.31-3.35-11.802c0,0,0-0.076,0-0.152c-0.533-2.208-1.066-4.645-1.523-7.158c-0.761-3.807-1.447-7.919-2.132-12.184c-0.914-5.787-1.752-12.031-2.437-18.731c0-0.381-0.076-0.838-0.152-1.295c-0.228-2.893-0.533-5.863-0.838-8.909c-0.685-7.005-1.218-14.392-1.675-22.082c-0.076-1.979-0.228-3.883-0.304-5.863c-0.228-3.883-0.381-7.919-0.533-11.955c-0.152-3.96-0.304-7.995-0.304-12.107c-0.229-6.853-0.304-13.858-0.304-20.94c0-6.853,0.076-13.63,0.228-20.254c0.076-2.817,0.152-5.635,0.229-8.376c0-1.294,0.076-2.589,0.152-3.807C323.312,48.656,332.526,0,343.643,0c0.533,0,1.066,0.076,1.599,0.381c8.071,3.35,14.925,32.438,18.732,74.165c1.371,15.61,2.361,32.971,2.741,51.474C366.867,132.645,366.943,139.422,366.943,146.275z"/></g><rect x="296.433" y="126.02" style="opacity:0.1;fill:#040000" width="14.772" height="41.194"/><path style="fill:#EBEBEB" d="M350.725,146.579c0,8.68-0.305,15.457-0.685,20.635c-0.837,10.584-2.132,14.62-2.132,14.62c0,0.381-0.152,0.609-0.457,0.609c0,0,0,0-0.076,0l-23.224-2.741l-3.122-0.381l-4.873-0.533c-4.873,0-8.833-5.102-8.833-11.269v-41.804c0-6.168,3.96-11.27,8.833-11.27l4.873-0.609l3.122-0.381l0.914-0.076l22.31-2.665c0.076,0,0.076,0,0.076,0.076c0.304,0,0.457,0.228,0.457,0.533c0,0,1.066,5.711,1.904,14.696C350.344,131.731,350.725,138.736,350.725,146.579z"/></g></g><path style="opacity:0.1;fill:#040000" d="M512,144.219v4.797c0,10.051-8.148,18.198-18.275,18.198h-6.396c-0.076,1.675-0.152,3.274-0.229,4.95c0,1.599-0.076,3.198-0.228,4.797c-0.229,4.797-0.533,9.442-0.837,14.01c-0.229,2.209-0.381,4.417-0.609,6.625c-0.152,2.056-0.381,4.112-0.609,6.092c-0.914,8.985-2.132,17.209-3.427,24.366c-0.304,1.752-0.685,3.503-0.99,5.102c-2.741,12.64-6.015,21.473-9.67,25.128c-0.305,0.304-0.609,0.533-0.914,0.761c-0.838,0.685-1.828,1.066-2.741,1.066h-46.448c-0.152,0-0.304-0.076-0.457-0.076c0,0-0.076-0.076-0.152-0.076s-0.152-0.076-0.228-0.076s-0.152,0.076-0.229,0.076c0,0-0.076,0.076-0.152,0.076c-0.076,0-0.152,0.076-0.305,0.076c-0.457,0-0.914-0.152-1.371-0.381c-0.304-0.152-0.609-0.304-0.914-0.609c-0.761-0.609-1.447-1.523-2.132-2.665c0,0.076,0,0.076,0,0.152c-0.228,0.914-0.381,1.752-0.533,2.589c-0.305,1.827-0.686,3.579-1.066,5.254c-0.305,1.218-0.533,2.437-0.837,3.655c-0.533,2.36-1.142,4.569-1.752,6.701c0,0,0,0.076,0,0.153c-0.609,1.98-1.218,3.807-1.751,5.482c-0.686,1.752-1.371,3.35-2.056,4.721c-0.609,1.371-1.294,2.589-1.98,3.579c-0.381,0.533-0.685,0.99-1.066,1.371c-0.305,0.457-0.686,0.761-0.99,1.066c-0.305,0.304-0.609,0.533-0.914,0.685c-0.229,0.152-0.457,0.305-0.685,0.381c-0.152,0.076-0.381,0.152-0.609,0.228c-0.304,0.076-0.685,0.152-1.066,0.152h-52.54c-0.457,0-0.99-0.229-1.447-0.457c-0.076,0-0.076-0.076-0.152-0.076c-0.076,0-0.076,0.076-0.152,0.076c-0.457,0.228-0.99,0.457-1.447,0.457c-0.381,0-0.686-0.076-1.066-0.152c-0.152-0.076-0.304-0.076-0.533-0.228c-0.304-0.076-0.533-0.229-0.761-0.381c-2.589-1.599-5.026-5.939-7.31-12.412c-1.142-3.35-2.284-7.31-3.35-11.802c0,0,0-0.076,0-0.152c-0.533-2.208-1.066-4.645-1.523-7.158c-0.761-3.807-1.447-7.919-2.132-12.184c-0.837-5.787-1.675-12.031-2.437-18.731c0-0.381-0.076-0.838-0.152-1.295c-0.228-2.893-0.533-5.863-0.838-8.909c-0.685-7.005-1.218-14.392-1.675-22.082c-0.076-1.979-0.228-3.883-0.304-5.863c-0.228-3.883-0.381-7.919-0.533-11.955l-4.873-0.533c-4.873,0-8.833-5.102-8.833-11.269v-0.305h-36.093l41.194-41.194l8.453-8.376l3.198-3.274l0.99-0.99l38.91-38.834l48.581-48.581c0.533,2.361,1.066,4.873,1.599,7.462c0.076,0.381,0.152,0.838,0.228,1.219c0.076,0.457,0.153,0.914,0.304,1.37c0,0.076,0,0.076,0,0.153c0.686-1.142,1.371-2.056,2.132-2.665c0.304-0.304,0.609-0.457,0.914-0.609c0.457-0.229,0.914-0.381,1.371-0.381c0.152,0,0.229,0,0.305,0.076c0.076,0,0.152,0.076,0.152,0.076c0.076,0,0.152,0.076,0.229,0.076s0.152-0.076,0.228-0.076s0.152-0.076,0.152-0.076c0.152-0.076,0.304-0.076,0.457-0.076h46.448c0.305,0,0.609,0.076,0.914,0.152c0.229,0,0.381,0.076,0.533,0.152c1.295,0.457,2.513,1.599,3.655,3.274c0.381,0.457,0.685,0.99,0.99,1.523c1.218,2.132,2.436,4.797,3.502,8.071c0.305,0.761,0.533,1.522,0.762,2.361c1.904,6.091,3.579,13.63,4.949,22.463c0.229,1.142,0.381,2.284,0.533,3.426c0.229,1.37,0.457,2.817,0.609,4.264c0.533,3.427,0.914,7.081,1.294,10.813c0.152,1.371,0.304,2.817,0.457,4.264c0.304,2.894,0.533,5.863,0.762,8.833c0.228,3.046,0.457,6.168,0.609,9.29c0.305,4.797,0.533,9.67,0.686,14.62h6.396C503.852,126.02,512,134.168,512,144.219z"/></svg><div style="width:28px;height:28px;border-radius:8px;background:rgba(212,255,58,0.14);color:${accent};display:flex;align-items:center;justify-content:center;position:absolute;top:8px;right:8px;font-size:13px;font-weight:700">↺</div>
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
