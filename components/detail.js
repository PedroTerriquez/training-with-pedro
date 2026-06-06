// ── ExerciseDetail bottom sheet ──
// Renders Workout tab (stepper + sets/reps opt-in), Cues tab, Swap tab, and History tab

function parseRepsDefault(rep) {
  if (typeof rep === 'number') return rep
  const m = String(rep).match(/(\d+)(?:\s*-\s*(\d+))?/)
  if (!m) return 8
  return parseInt(m[2] || m[1], 10)
}

function mountExerciseDetail(container, { exercise, accent, units, exercises, onOpenExercise, onSwapExercise, onClose, onLog, prevExercise, onPrev, nextExercise, onNext }) {
  const todayStr = getToday()
  const todayLog = exercise.logs?.find(l => l.date === todayStr) || null
  const lastLog = exercise.logs?.length ? exercise.logs[exercise.logs.length - 1] : null

  let tab = 'workout'
  let savedWeight = todayLog ? todayLog.weight : null
  let pendingWeight = todayLog ? todayLog.weight : (lastLog ? lastLog.weight : 0)
  let loggedToday = !!todayLog
  let trackSR = todayLog?.sets !== undefined && todayLog?.reps !== undefined
  let pendingSets = trackSR ? todayLog.sets : exercise.sets
  let pendingReps = trackSR ? todayLog.reps : parseRepsDefault(exercise.reps)

  // ── Exercise Navigation — prev/next pills ──
  function renderNavPills() {
    const wrap = document.createElement('div')
    wrap.style.cssText = 'padding:10px 14px 0;display:flex;gap:8px'

    function navPill(dir) {
      const isPrev = dir === 'prev'
      const exercise = isPrev ? prevExercise : nextExercise
      const onClick = isPrev ? onPrev : onNext
      const disabled = !exercise
      const label = isPrev ? 'Anterior' : 'Siguiente'
      const fallback = isPrev ? 'Primero' : 'Último'
      const arrowColor = disabled ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.85)'

      const arrow = isPrev
        ? `<path d="M10 5H1m0 0l4-4M1 5l4 4" stroke="${arrowColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`
        : `<path d="M1 5h9m0 0L6 1m4 4L6 9" stroke="${arrowColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`

      const btn = document.createElement('button')
      btn.style.cssText = `flex:1;min-width:0;background:${disabled ? 'rgba(255,255,255,0.02)' : '#141414'};border:0.5px solid rgba(255,255,255,0.06);border-radius:12px;padding:8px 12px;cursor:${disabled ? 'default' : 'pointer'};color:inherit;text-align:left;display:flex;align-items:center;gap:9px;flex-direction:${isPrev ? 'row' : 'row-reverse'};opacity:${disabled ? 0.45 : 1};transition:background 0.15s`
      if (!disabled) btn.addEventListener('click', onClick)
      btn.innerHTML = `
        <div style="width:26px;height:26px;border-radius:8px;background:${disabled ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)'};border:0.5px solid rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <svg width="11" height="10" viewBox="0 0 11 10" fill="none" style="flex-shrink:0">${arrow}</svg>
        </div>
        <div style="flex:1;min-width:0;display:flex;flex-direction:column;align-items:${isPrev ? 'flex-start' : 'flex-end'};gap:1px">
          <div style="font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:1.3px;text-transform:uppercase;color:${disabled ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.45)'};font-weight:600;line-height:1">${label}</div>
          <div style="font-family:'Space Grotesk',sans-serif;font-size:12px;font-weight:600;color:${disabled ? 'rgba(255,255,255,0.3)' : '#fafafa'};letter-spacing:-0.1px;line-height:1.25;width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:${isPrev ? 'left' : 'right'}">${exercise ? exercise.name : fallback}</div>
        </div>`
      return btn
    }

    wrap.appendChild(navPill('prev'))
    wrap.appendChild(navPill('next'))
    return wrap
  }

  function render() {
    container.innerHTML = ''
    const scrollEl = document.createElement('div')
    scrollEl.style.cssText = `color:#fafafa;padding-bottom:40px`
    container.appendChild(scrollEl)

    // Navigation prev/next pills
    scrollEl.appendChild(renderNavPills())

    // Hero — IMG ↔ GIF crossfade (no carousel, no swipe)
    const heroWrap = document.createElement('div')
    heroWrap.style.padding = '12px 14px 0'
    const searchUrl = encodeURIComponent(exercise.name + ' exercise')
    const h = 240
    const hero = document.createElement('div')
    hero.style.cssText = `height:${h}px;border-radius:18px;overflow:hidden;position:relative;background:#161616;${loggedToday ? `border:1px solid ${accent};box-shadow:0 0 0 4px ${accent}1a,0 8px 32px ${accent}22` : 'border:0.5px solid rgba(255,255,255,0.06)'};box-sizing:border-box;display:flex;flex-direction:column;justify-content:space-between`

    // Media layers — img (background), gif (overlaid <img>)
    const media = document.createElement('div')
    media.style.cssText = 'position:absolute;inset:0'
    const imgLayer = document.createElement('div')
    imgLayer.style.cssText = 'position:absolute;inset:0;transition:opacity .35s;pointer-events:none'
    const gifLayer = document.createElement('div')
    gifLayer.style.cssText = 'position:absolute;inset:0;transition:opacity .35s;pointer-events:none'

    if (exercise.imgUrl) imgLayer.style.background = `#161616 url(${exercise.imgUrl}) center/cover no-repeat`
    else imgLayer.style.display = 'none'

    if (exercise.gifUrl) {
      const gifImg = document.createElement('img')
      gifImg.src = exercise.gifUrl
      gifImg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;user-select:none'
      gifLayer.appendChild(gifImg)
    } else gifLayer.style.display = 'none'

    let showGif = false
    gifLayer.style.opacity = '0'
    imgLayer.style.opacity = '1'
    media.appendChild(imgLayer)
    media.appendChild(gifLayer)
    hero.appendChild(media)

    // Crossfade toggle
    const hasBoth = exercise.imgUrl && exercise.gifUrl
    if (hasBoth) {
      const pill = document.createElement('button')
      pill.style.cssText = `position:absolute;top:10px;right:10px;z-index:5;width:32px;height:32px;border-radius:50%;border:0.5px solid rgba(255,255,255,0.1);background:rgba(0,0,0,0.45);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0`
      pill.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.75)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6"/><path d="M2.5 12a9 9 0 0 1 15.5-5L21.5 8"/><path d="M2.5 22v-6h6"/><path d="M21.5 12a9 9 0 0 1-15.5 5L2.5 16"/></svg>`
      pill.addEventListener('click', (e) => {
        e.stopPropagation()
        showGif = !showGif
        gifLayer.style.opacity = showGif ? '1' : '0'
        imgLayer.style.opacity = showGif ? '0' : '1'
      })
      hero.appendChild(pill)
    }

    // Top row: muscle pill + accent dot or HECHO HOY badge
    const topRow = document.createElement('div')
    topRow.style.cssText = 'display:flex;justify-content:space-between;align-items:flex-start;position:relative;z-index:1'
    topRow.innerHTML = `
      <span style="display:inline-flex;align-items:center;padding:4px 10px;border-radius:9999px;background:rgba(0,0,0,0.45);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:0.5px solid rgba(255,255,255,0.1);font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:1.2px;font-weight:500;color:rgba(255,255,255,0.85);text-transform:uppercase;white-space:nowrap">${exercise.muscle}</span>
      ${loggedToday
        ? `<span style="display:inline-flex;align-items:center;gap:5px;padding:4px 10px 4px 8px;border-radius:9999px;background:${accent};font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:1.2px;font-weight:700;color:#0a0a0a;text-transform:uppercase;white-space:nowrap;box-shadow:0 4px 12px ${accent}55;animation:fadeUp 0.3s ease-out">
            <svg width="11" height="9" viewBox="0 0 11 9" fill="none"><path d="M1 4.5l3 3L10 1" stroke="#0a0a0a" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            HECHO HOY
          </span>`
        : `<div style="width:8px;height:8px;border-radius:50%;background:${accent};box-shadow:0 0 10px ${accent};flex-shrink:0;margin-top:6px"></div>`
      }`
    hero.appendChild(topRow)
    // Bottom row: name + sets/reps pill + search buttons
    const bottomRow = document.createElement('div')
    bottomRow.style.cssText = 'display:flex;align-items:flex-end;justify-content:space-between;gap:12px;position:relative;z-index:1'
    bottomRow.innerHTML = `
      <div style="flex:1;min-width:0">
        <div style="font-family:'Space Grotesk',sans-serif;font-size:26px;font-weight:700;color:#fafafa;letter-spacing:-0.6px;line-height:1.05;text-shadow:0 2px 8px rgba(0,0,0,0.4)">${exercise.name}</div>
        <div style="margin-top:8px;display:inline-flex;align-items:center;gap:6px;background:rgba(0,0,0,0.42);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);padding:5px 12px;border-radius:9999px;border:0.5px solid rgba(255,255,255,0.1);font-family:'JetBrains Mono',monospace;font-size:14px;color:rgba(255,255,255,0.85);white-space:nowrap">
          <span style="font-weight:500">${exercise.sets}</span>
          <span style="color:rgba(255,255,255,0.45)">×</span>
          <span style="font-weight:500">${exercise.reps}</span>
          <span style="margin-left:4px;font-size:9px;letter-spacing:1.4px;text-transform:uppercase;color:rgba(255,255,255,0.5);font-weight:500">sets×reps</span>
        </div>
      </div>
      <div class="hero-search-btns" style="display:flex;gap:8px;flex-shrink:0;align-items:center;position:relative;z-index:3">
        <a class="hero-google-btn" href="https://www.google.com/search?tbm=vid&q=${searchUrl}" target="_blank" rel="noopener noreferrer" style="width:38px;height:38px;border-radius:50%;border:0.5px solid rgba(255,255,255,0.18);background:rgba(0,0,0,0.55);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.3);text-decoration:none" aria-label="Buscar en Google">
          <svg width="15" height="15" viewBox="0 0 48 48" fill="none"><path d="M43.6 24.5c0-1.6-.1-3.1-.4-4.6H24v8.7h11c-.5 2.6-1.9 4.9-4 6.4v5.3h6.5c3.8-3.5 6-8.7 6-15.8z" fill="#4285F4"/><path d="M24 44c5.4 0 10-1.8 13.3-4.9l-6.5-5.3c-1.8 1.2-4.1 2-6.8 2-5.3 0-9.8-3.6-11.4-8.4H5v5.5C8.3 39.8 15.7 44 24 44z" fill="#34A853"/><path d="M12.6 27.4c-.8-2.4-.8-4.9 0-7.2v-5.5H5c-2.7 5.4-2.7 11.8 0 17.2l7.6-6.5z" fill="#FBBC05"/><path d="M24 10.3c2.9 0 5.5 1 7.5 3l5.6-5.6C33.8 4.6 29.4 3 24 3 15.7 3 8.3 7.2 5 13.7l7.6 6c1.6-4.8 6.1-8.4 11.4-8.4z" fill="#EA4335"/></svg>
        </a>
        <a class="hero-tiktok-btn" href="snssdk1233://search/trending?keyword=${searchUrl}" style="width:38px;height:38px;border-radius:50%;border:0.5px solid rgba(255,255,255,0.18);background:rgba(0,0,0,0.55);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.3);text-decoration:none" aria-label="Buscar en TikTok">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
        </a>
      </div>`
    hero.appendChild(bottomRow)
    heroWrap.appendChild(hero)
    scrollEl.appendChild(heroWrap)

    // TikTok: try snssdk1233 internal scheme first, fall back to tiktok:// after 350ms
    // if the app didn't take over. The anchor href is the no-JS fallback.
    const heroTiktok = heroWrap.querySelector('.hero-tiktok-btn')
    if (heroTiktok) {
      heroTiktok.addEventListener('click', (e) => {
        e.preventDefault()
        const primary = `snssdk1233://search/trending?keyword=${searchUrl}`
        const fallback = `tiktok://search?keyword=${searchUrl}`
        let switched = false
        const onHide = () => { switched = true }
        document.addEventListener('visibilitychange', onHide, { once: true })
        window.location.href = primary
        setTimeout(() => {
          document.removeEventListener('visibilitychange', onHide)
          if (!switched) window.location.href = fallback
        }, 350)
      })
    }

    // Prescription strip — 4-cell dashboard
    const lastW = lastLog ? lastLog.weight : 0
    const strip = document.createElement('div')
    strip.style.cssText = 'padding:14px 20px 0'
    strip.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(4,1fr);background:#141414;border-radius:14px;border:0.5px solid rgba(255,255,255,0.06);overflow:hidden">
        <div style="padding:11px 6px;border-right:0.5px solid rgba(255,255,255,0.05);text-align:center">
          <div style="font-family:'JetBrains Mono',monospace;font-size:8.5px;letter-spacing:1.4px;text-transform:uppercase;color:rgba(255,255,255,0.4);font-weight:600">series</div>
          <div style="margin-top:4px;font-family:'JetBrains Mono',monospace;font-size:17px;font-weight:500;color:#fafafa;letter-spacing:-0.5px;line-height:1">${exercise.sets}</div>
        </div>
        <div style="padding:11px 6px;border-right:0.5px solid rgba(255,255,255,0.05);text-align:center">
          <div style="font-family:'JetBrains Mono',monospace;font-size:8.5px;letter-spacing:1.4px;text-transform:uppercase;color:rgba(255,255,255,0.4);font-weight:600">reps</div>
          <div style="margin-top:4px;font-family:'JetBrains Mono',monospace;font-size:17px;font-weight:500;color:#fafafa;letter-spacing:-0.5px;line-height:1">${exercise.reps}</div>
        </div>
        <div style="padding:11px 6px;border-right:0.5px solid rgba(255,255,255,0.05);text-align:center">
          <div style="font-family:'JetBrains Mono',monospace;font-size:8.5px;letter-spacing:1.4px;text-transform:uppercase;color:rgba(255,255,255,0.4);font-weight:600">desc.</div>
          <div style="margin-top:4px;font-family:'JetBrains Mono',monospace;font-size:17px;font-weight:500;color:#fafafa;letter-spacing:-0.5px;line-height:1">${exercise.rest}s</div>
        </div>
        <div style="padding:11px 6px;text-align:center">
          <div style="font-family:'JetBrains Mono',monospace;font-size:8.5px;letter-spacing:1.4px;text-transform:uppercase;color:rgba(255,255,255,0.4);font-weight:600">última</div>
          <div style="margin-top:4px;font-family:'JetBrains Mono',monospace;font-size:17px;font-weight:500;color:${lastW > 0 ? accent : '#fafafa'};letter-spacing:-0.5px;line-height:1">${lastW > 0 ? `${lastW}${units}` : '—'}</div>
        </div>
      </div>`
    scrollEl.appendChild(strip)

    // Segmented control — 4 tabs
    const seg = document.createElement('div')
    seg.style.cssText = `margin:14px 20px 0;display:flex;padding:3px;border-radius:11px;background:rgba(255,255,255,0.04);border:0.5px solid rgba(255,255,255,0.06)`
    const tabs = [
      { id: 'workout', label: 'Registrar', dot: loggedToday },
      { id: 'cues', label: 'Consejos', badge: (exercise.tips || []).length },
      { id: 'swap', label: 'Alternativas', badge: (exercise.alternatives || []).length },
      { id: 'history', label: 'Historial' },
    ]
    tabs.forEach((t) => {
      const btn = document.createElement('button')
      const on = tab === t.id
      btn.style.cssText = `flex:1;padding:9px 0;border:0;cursor:pointer;background:${on ? '#262626' : 'transparent'};color:${on ? '#fafafa' : 'rgba(255,255,255,0.5)'};font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:600;letter-spacing:-0.1px;border-radius:8px;display:flex;align-items:center;justify-content:center;gap:5px;transition:all 0.15s`
      let inner = t.label
      if (t.dot) inner += `<span style="width:6px;height:6px;border-radius:50%;background:${accent};box-shadow:0 0 6px ${accent};display:inline-block;margin-left:4px"></span>`
      else if (t.badge !== undefined && !on) inner += `<span style="font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:600;color:rgba(255,255,255,0.35);background:rgba(255,255,255,0.05);padding:1px 5px;border-radius:9999px;letter-spacing:0">${t.badge}</span>`
      btn.innerHTML = inner
      btn.addEventListener('click', () => { tab = t.id; render() })
      seg.appendChild(btn)
    })
    scrollEl.appendChild(seg)

    if (tab === 'workout') renderWorkoutTab(scrollEl)
    else if (tab === 'cues') renderCuesTab(scrollEl)
    else if (tab === 'swap') renderSwapTab(scrollEl, exercises, onOpenExercise, onSwapExercise)
    else renderHistoryTab(scrollEl)
  }

  function renderWorkoutTab(scrollEl) {
    const STEP = 5

    // Weight stepper card
    const wrap = document.createElement('div')
    wrap.style.cssText = 'padding:14px 20px 0'
    scrollEl.appendChild(wrap)

    const card = document.createElement('div')
    card.style.cssText = `background:#141414;border-radius:20px;padding:18px 18px 16px;border:0.5px solid ${loggedToday ? `${accent}33` : 'rgba(255,255,255,0.06)'};position:relative;overflow:hidden;box-shadow:${loggedToday ? `0 8px 32px ${accent}11` : '0 6px 20px rgba(0,0,0,0.2)'}`
    card.innerHTML = loggedToday ? `<div style="position:absolute;top:-60px;right:-60px;width:200px;height:200px;border-radius:50%;background:${accent};opacity:0.09;filter:blur(60px)"></div>` : ''

    // Eyebrow
    const eyebrow = document.createElement('div')
    eyebrow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;position:relative;z-index:1;margin-bottom:10px'
    eyebrow.innerHTML = `<div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:1.6px;text-transform:uppercase;color:rgba(255,255,255,0.5);font-weight:600">Peso de hoy</div>`
    if (loggedToday) {
      const badge = document.createElement('div')
      badge.style.cssText = `display:inline-flex;align-items:center;gap:5px;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:1.3px;text-transform:uppercase;color:${accent};font-weight:600;background:${accent}1a;padding:3px 8px;border-radius:9999px`
      badge.innerHTML = `<span style="width:5px;height:5px;border-radius:50%;background:${accent};box-shadow:0 0 6px ${accent}"></span> Guardado`
      eyebrow.appendChild(badge)
    }
    card.appendChild(eyebrow)

    // Stepper row
    const stepperRow = document.createElement('div')
    stepperRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:12px;position:relative;z-index:1'
    stepperRow.innerHTML = `
      <button class="stepper-dec" style="width:54px;height:54px;border-radius:50%;border:0.5px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.06);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:28px;color:#fafafa;touch-action:manipulation;flex-shrink:0;padding:0;line-height:1;transition:all 0.15s,transform 0.08s">−</button>
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px">
        <input type="text" inputmode="decimal" value="${pendingWeight || ''}" placeholder="0" style="background:transparent;border:0;outline:none;text-align:center;width:100%;font-family:'JetBrains Mono',monospace;font-size:48px;font-weight:500;color:${loggedToday ? accent : '#fafafa'};letter-spacing:-2.2px;line-height:1;padding:0">
        <div style="font-family:'JetBrains Mono',monospace;font-size:9.5px;letter-spacing:1.6px;text-transform:uppercase;color:rgba(255,255,255,0.45);white-space:nowrap">${units} <span style="opacity:0.5;margin:0 4px">·</span> incrementos de ${STEP}${units}</div>
      </div>
      <button class="stepper-inc" style="width:54px;height:54px;border-radius:50%;border:0.5px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.06);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:28px;color:#fafafa;touch-action:manipulation;flex-shrink:0;padding:0;line-height:1;transition:all 0.15s,transform 0.08s">+</button>`
    card.appendChild(stepperRow)

    // Sets/reps opt-in
    const srWrap = document.createElement('div')
    srWrap.style.cssText = 'position:relative;z-index:1'
    card.appendChild(srWrap)

    if (!trackSR) {
      const srBtn = document.createElement('button')
      srBtn.style.cssText = `margin-top:12px;width:100%;padding:8px 10px;border-radius:9px;cursor:pointer;background:transparent;border:0.5px dashed rgba(255,255,255,0.15);color:rgba(255,255,255,0.55);font-family:'Space Grotesk',sans-serif;font-size:11.5px;font-weight:500;display:flex;align-items:center;justify-content:center;gap:6px;position:relative;z-index:1`
      srBtn.innerHTML = `<span style="font-size:13px;line-height:1;font-weight:400">＋</span> Registrar series y repeticiones`
      srBtn.addEventListener('click', () => { trackSR = true; render() })
      srWrap.appendChild(srBtn)
    } else {
      const srInner = document.createElement('div')
      srInner.style.cssText = 'margin-top:12px;animation:fadeUp 0.2s ease-out'
      srInner.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
          <div style="font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:1.4px;text-transform:uppercase;color:rgba(255,255,255,0.5);font-weight:600">Series y repeticiones</div>
          <button class="sr-remove" style="background:transparent;border:0;cursor:pointer;color:rgba(255,255,255,0.4);font-family:'Space Grotesk',sans-serif;font-size:10.5px;padding:2px 4px">× quitar</button>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <div class="mini-stepper" data-key="sets" style="background:rgba(255,255,255,0.04);border:0.5px solid rgba(255,255,255,0.08);border-radius:10px;padding:8px 8px 8px 11px;display:flex;align-items:center;gap:5px">
            <div style="flex:1;min-width:0">
              <div style="font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:1.2px;text-transform:uppercase;color:rgba(255,255,255,0.45)">Series</div>
              <div style="margin-top:2px;font-family:'JetBrains Mono',monospace;font-size:20px;font-weight:500;color:#fafafa;line-height:1;letter-spacing:-0.5px">${pendingSets}</div>
              <div style="margin-top:2px;font-family:'JetBrains Mono',monospace;font-size:9px;color:rgba(255,255,255,0.4);letter-spacing:0.4px;white-space:nowrap">plan · ${exercise.sets}</div>
            </div>
            <div style="display:flex;flex-direction:column;gap:3px">
              <button class="mini-inc" style="width:28px;height:24px;border-radius:6px;background:rgba(255,255,255,0.06);border:0.5px solid rgba(255,255,255,0.1);color:#fafafa;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;line-height:1">+</button>
              <button class="mini-dec" style="width:28px;height:24px;border-radius:6px;background:rgba(255,255,255,0.06);border:0.5px solid rgba(255,255,255,0.1);color:#fafafa;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;line-height:1">−</button>
            </div>
          </div>
          <div class="mini-stepper" data-key="reps" style="background:rgba(255,255,255,0.04);border:0.5px solid rgba(255,255,255,0.08);border-radius:10px;padding:8px 8px 8px 11px;display:flex;align-items:center;gap:5px">
            <div style="flex:1;min-width:0">
              <div style="font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:1.2px;text-transform:uppercase;color:rgba(255,255,255,0.45)">Reps</div>
              <div style="margin-top:2px;font-family:'JetBrains Mono',monospace;font-size:20px;font-weight:500;color:#fafafa;line-height:1;letter-spacing:-0.5px">${pendingReps}</div>
              <div style="margin-top:2px;font-family:'JetBrains Mono',monospace;font-size:9px;color:rgba(255,255,255,0.4);letter-spacing:0.4px;white-space:nowrap">plan · ${exercise.reps}</div>
            </div>
            <div style="display:flex;flex-direction:column;gap:3px">
              <button class="mini-inc" style="width:28px;height:24px;border-radius:6px;background:rgba(255,255,255,0.06);border:0.5px solid rgba(255,255,255,0.1);color:#fafafa;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;line-height:1">+</button>
              <button class="mini-dec" style="width:28px;height:24px;border-radius:6px;background:rgba(255,255,255,0.06);border:0.5px solid rgba(255,255,255,0.1);color:#fafafa;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;line-height:1">−</button>
            </div>
          </div>
        </div>`
      srWrap.appendChild(srInner)

      srInner.querySelector('.sr-remove').addEventListener('click', () => { trackSR = false; render() })
      srInner.querySelectorAll('.mini-stepper').forEach((el) => {
        const key = el.dataset.key
        const inc = el.querySelector('.mini-inc')
        const dec = el.querySelector('.mini-dec')
        inc.addEventListener('click', () => {
          if (key === 'sets') { pendingSets = Math.min(20, pendingSets + 1) }
          else { pendingReps = Math.min(50, pendingReps + 1) }
          updateLogBtn()
          el.querySelector('div:nth-child(1) div:nth-child(2)').textContent = key === 'sets' ? pendingSets : pendingReps
        })
        dec.addEventListener('click', () => {
          if (key === 'sets') { pendingSets = Math.max(1, pendingSets - 1) }
          else { pendingReps = Math.max(1, pendingReps - 1) }
          updateLogBtn()
          el.querySelector('div:nth-child(1) div:nth-child(2)').textContent = key === 'sets' ? pendingSets : pendingReps
        })
      })
    }

    wrap.appendChild(card)

    // Log + Clear buttons
    const logBtn = document.createElement('button')
    logBtn.style.cssText = `margin-top:14px;width:100%;padding:14px 18px;border-radius:11px;border:0;cursor:pointer;font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:700;letter-spacing:-0.1px;display:flex;align-items:center;justify-content:center;gap:8px;transition:all 0.2s;position:relative;z-index:1`
    card.appendChild(logBtn)

    const clearBtn = document.createElement('button')
    clearBtn.style.cssText = `margin-top:4px;width:100%;padding:5px;background:transparent;border:0;cursor:pointer;color:rgba(255,255,255,0.4);font-family:'Space Grotesk',sans-serif;font-size:10.5px;letter-spacing:0.2px;position:relative;z-index:1`

    async function handleSave() {
      if (pendingWeight === 0) return
      const savedLog = await onLog(exercise.id, pendingWeight, trackSR ? pendingSets : undefined, trackSR ? pendingReps : undefined)
      if (savedLog) {
        savedWeight = pendingWeight
        loggedToday = true
        const idx = (exercise.logs || []).findIndex(l => l.date === savedLog.date && l.exerciseId === savedLog.exerciseId)
        if (idx >= 0) exercise.logs[idx] = savedLog
        else exercise.logs = [...(exercise.logs || []), savedLog]
      }
      render()
    }

    function updateLogBtn() {
      const dirty = loggedToday && pendingWeight !== savedWeight
      if (loggedToday && !dirty) {
        logBtn.style.background = `${accent}22`
        logBtn.style.color = accent
        logBtn.style.boxShadow = 'none'
        logBtn.innerHTML = `<svg width="13" height="10" viewBox="0 0 14 11" fill="none"><path d="M1 5.5l4 4 8-8.5" stroke="${accent}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg> Guardado · ${pendingWeight}${units}`
        logBtn.onclick = null
        clearBtn.style.display = 'block'
      } else {
        logBtn.style.background = accent
        logBtn.style.color = '#0a0a0a'
        logBtn.style.boxShadow = `0 6px 20px ${accent}33`
        logBtn.innerHTML = `Registrar · ${pendingWeight}${units}`
        logBtn.onclick = handleSave
        clearBtn.style.display = loggedToday ? 'block' : 'none'
      }
    }
    updateLogBtn()
    card.appendChild(clearBtn)

    // Events
    const input = stepperRow.querySelector('input')
    const decBtn = stepperRow.querySelector('.stepper-dec')
    const incBtn = stepperRow.querySelector('.stepper-inc')

    decBtn.addEventListener('click', () => {
      pendingWeight = Math.max(0, +(pendingWeight - STEP).toFixed(1))
      input.value = pendingWeight || ''
      updateLogBtn()
    })
    incBtn.addEventListener('click', () => {
      pendingWeight = +(pendingWeight + STEP).toFixed(1)
      input.value = pendingWeight
      updateLogBtn()
    })
    input.addEventListener('input', (e) => {
      const v = e.target.value.replace(/[^0-9.]/g, '')
      pendingWeight = v === '' ? 0 : parseFloat(v)
      updateLogBtn()
    })
    clearBtn.addEventListener('click', async () => {
      loggedToday = false
      savedWeight = null
      pendingWeight = lastLog ? lastLog.weight : 0
      trackSR = false
      render()
    })
  }

  function renderCuesTab(scrollEl) {
    const tips = exercise.tips && exercise.tips.length ? exercise.tips : []
    const wrap = document.createElement('div')
    wrap.style.cssText = 'padding:18px 20px 30px'
    wrap.innerHTML = `
      <div style="display:flex;align-items:baseline;gap:8px;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:1.6px;text-transform:uppercase;color:rgba(255,255,255,0.5);font-weight:600;margin-bottom:14px">
        <div style="width:4px;height:4px;border-radius:50%;background:${accent}"></div>
        Consejos de técnica
        ${tips.length > 0 ? `<span style="margin-left:auto;color:rgba(255,255,255,0.3);letter-spacing:0.4px">${tips.length} consejos</span>` : ''}
      </div>`
    if (tips.length === 0) {
      wrap.innerHTML += `<div style="padding:16px 0;font-size:13px;color:rgba(255,255,255,0.4);text-align:center">No hay consejos registrados para este ejercicio.</div>`
    } else {
      const ol = document.createElement('ol')
      ol.style.cssText = 'margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:0'
      tips.forEach((tip, i) => {
        const li = document.createElement('li')
        li.style.cssText = `display:flex;gap:14px;align-items:flex-start;padding:14px 0;${i === 0 ? '' : 'border-top:0.5px solid rgba(255,255,255,0.06)'}`
        li.innerHTML = `
          <div style="font-family:'JetBrains Mono',monospace;font-size:22px;font-weight:500;color:${accent};opacity:0.6;min-width:32px;flex-shrink:0;line-height:1;letter-spacing:-1px;font-variant-numeric:tabular-nums">${String(i + 1).padStart(2, '0')}</div>
          <div style="flex:1;font-size:15px;line-height:1.5;color:rgba(255,255,255,0.88);font-family:'Space Grotesk',sans-serif;letter-spacing:-0.1px">${tip}</div>`
        ol.appendChild(li)
      })
      wrap.appendChild(ol)

      const hint = document.createElement('div')
      hint.style.cssText = `margin-top:18px;padding:14px;background:rgba(255,255,255,0.025);border-radius:12px;border:0.5px dashed rgba(255,255,255,0.1);display:flex;gap:10px;align-items:center`
      hint.innerHTML = `
        <div style="font-size:18px">💡</div>
        <div style="flex:1;font-size:11.5px;line-height:1.45;color:rgba(255,255,255,0.55)">¿Necesitas verlo? Toca el botón <strong style="color:rgba(255,255,255,0.85)">Google</strong> o <strong style="color:rgba(255,255,255,0.85)">TikTok</strong> en la foto del ejercicio arriba.</div>`
      wrap.appendChild(hint)
    }
    scrollEl.appendChild(wrap)
  }

  function renderSwapTab(scrollEl, exercises, onOpenExercise, onSwapExercise) {
    const alts = exercise.alternatives && exercise.alternatives.length ? exercise.alternatives : []
    const wrap = document.createElement('div')
    wrap.style.cssText = 'padding:18px 20px 30px'
    wrap.innerHTML = `
      <div style="display:flex;align-items:baseline;gap:8px;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:1.6px;text-transform:uppercase;color:rgba(255,255,255,0.5);font-weight:600;margin-bottom:14px">
        <div style="width:4px;height:4px;border-radius:50%;background:${accent}"></div>
        ¿No puedes hacerlo? Cambia por
        ${alts.length > 0 ? `<span style="margin-left:auto;color:rgba(255,255,255,0.3);letter-spacing:0.4px">${alts.length} opciones</span>` : ''}
      </div>`
    if (alts.length === 0) {
      wrap.innerHTML += `<div style="padding:16px 0;font-size:13px;color:rgba(255,255,255,0.4);text-align:center">No hay alternativas registradas para este ejercicio.</div>`
    } else {
      const list = document.createElement('div')
      list.style.cssText = 'display:flex;flex-direction:column;gap:10px'
      alts.forEach((alt, i) => {
        const matched = (exercises || []).find((e) => e.name.toLowerCase() === alt.name.toLowerCase())

        const card = document.createElement('button')
        card.style.cssText = `background:#141414;border-radius:16px;border:0.5px solid rgba(255,255,255,0.06);overflow:hidden;display:flex;gap:0;cursor:${matched ? 'pointer' : 'default'};text-align:left;color:inherit;width:100%;padding:0`
        card.innerHTML = `
          <div style="width:120px;flex-shrink:0;background:#1a1a1a;background-image:repeating-linear-gradient(135deg,rgba(255,255,255,0.018) 0 14px,rgba(255,255,255,0.045) 14px 28px);position:relative;display:flex;align-items:center;justify-content:center">
            <div style="width:48px;height:48px;border-radius:14px;background:rgba(255,255,255,0.06);color:${accent};display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:500;border:0.5px solid ${accent}33">↺</div>
            <div style="position:absolute;bottom:8px;left:8px;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:1.2px;text-transform:uppercase;color:rgba(255,255,255,0.45)">ALT ${String(i + 1).padStart(2, '0')}</div>
          </div>
          <div style="flex:1;padding:18px 20px;display:flex;flex-direction:column;justify-content:center;min-width:0">
            <div style="font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:600;color:#fafafa;letter-spacing:-0.3px;line-height:1.3;overflow-wrap:break-word">${alt.name}</div>
            <div style="font-size:13px;color:rgba(255,255,255,0.55);margin-top:6px;line-height:1.5">${alt.reason}</div>
            <div class="alt-search-btns" style="display:flex;gap:6px;margin-top:12px">
              <a class="alt-google-btn" href="https://www.google.com/search?tbm=vid&q=${encodeURIComponent(alt.name + ' exercise')}" target="_blank" rel="noopener noreferrer" style="width:30px;height:30px;border-radius:50%;border:0.5px solid rgba(255,255,255,0.15);background:rgba(0,0,0,0.4);cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;padding:0;text-decoration:none;position:relative;z-index:1" aria-label="Buscar en Google">
                <svg width="13" height="13" viewBox="0 0 48 48" fill="none"><path d="M43.6 24.5c0-1.6-.1-3.1-.4-4.6H24v8.7h11c-.5 2.6-1.9 4.9-4 6.4v5.3h6.5c3.8-3.5 6-8.7 6-15.8z" fill="#4285F4"/><path d="M24 44c5.4 0 10-1.8 13.3-4.9l-6.5-5.3c-1.8 1.2-4.1 2-6.8 2-5.3 0-9.8-3.6-11.4-8.4H5v5.5C8.3 39.8 15.7 44 24 44z" fill="#34A853"/><path d="M12.6 27.4c-.8-2.4-.8-4.9 0-7.2v-5.5H5c-2.7 5.4-2.7 11.8 0 17.2l7.6-6.5z" fill="#FBBC05"/><path d="M24 10.3c2.9 0 5.5 1 7.5 3l5.6-5.6C33.8 4.6 29.4 3 24 3 15.7 3 8.3 7.2 5 13.7l7.6 6c1.6-4.8 6.1-8.4 11.4-8.4z" fill="#EA4335"/></svg>
              </a>
              <a class="alt-tiktok-btn" data-q="${encodeURIComponent(alt.name + ' exercise')}" href="snssdk1233://search/trending?keyword=${encodeURIComponent(alt.name + ' exercise')}" style="width:30px;height:30px;border-radius:50%;border:0.5px solid rgba(255,255,255,0.15);background:rgba(0,0,0,0.4);cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;padding:0;text-decoration:none;position:relative;z-index:1" aria-label="Buscar en TikTok">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="white"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
              </a>
            </div>`
        list.appendChild(card)

        // Alt search anchors — stop click from bubbling to the card (which navigates)
        card.querySelectorAll('.alt-google-btn').forEach((a) => {
          a.addEventListener('click', (e) => e.stopPropagation())
        })
        card.querySelectorAll('.alt-tiktok-btn').forEach((a) => {
          a.addEventListener('click', (e) => {
            e.stopPropagation()
            e.preventDefault()
            const q = a.dataset.q
            const primary = `snssdk1233://search/trending?keyword=${q}`
            const fallback = `tiktok://search?keyword=${q}`
            let switched = false
            const onHide = () => { switched = true }
            document.addEventListener('visibilitychange', onHide, { once: true })
            window.location.href = primary
            setTimeout(() => {
              document.removeEventListener('visibilitychange', onHide)
              if (!switched) window.location.href = fallback
            }, 350)
          })
        })

        if (matched) {
          card.addEventListener('click', async () => {
            if (onSwapExercise) await onSwapExercise(exercise.id, matched.id)
            if (onOpenExercise) onOpenExercise(matched)
          })
        } else {
          card.addEventListener('click', () => {
            if (typeof showToast === 'function') {
              showToast(`"${alt.name}" no está en tu biblioteca. Agrégalo desde la pantalla Tú.`, true)
            }
          })
        }
      })
      wrap.appendChild(list)
    }
    scrollEl.appendChild(wrap)
  }

  function renderHistoryTab(scrollEl) {
    const allTime = exercise.logs && exercise.logs.length ? Math.max(...exercise.logs.map((l) => l.weight)) : 0
    const last = exercise.logs && exercise.logs.length ? exercise.logs[exercise.logs.length - 1] : null
    const first = exercise.logs && exercise.logs.length ? exercise.logs[0] : null
    const totalGain = first && last ? last.weight - first.weight : 0
    const pct = first ? ((totalGain / first.weight) * 100).toFixed(1) : '0'

    // Include pending today log if logged this session
    const data = exercise.logs || []

    // Stats grid
    const statsGrid = document.createElement('div')
    statsGrid.style.cssText = 'padding:22px 20px 0;display:grid;grid-template-columns:repeat(3,1fr);gap:8px'
    const stats = [
      { label: 'Máx total', val: allTime, color: accent },
      { label: 'Actual', val: last ? last.weight : 0, color: '#fafafa' },
      { label: 'Δ 6 sem.', val: (totalGain >= 0 ? '+' : '') + totalGain.toFixed(1), color: totalGain >= 0 ? accent : '#ff6b6b' },
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
            <div style="font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:600;color:#fafafa">Peso por sesión</div>
            <span class="pill" style="background:rgba(255,255,255,0.08);color:#fafafa">${pct >= 0 ? '+' : ''}${pct}%</span>
          </div>
          ${LineChart({ data, width: 324, height: 170, color: accent, unit: units })}
        </div>`
      scrollEl.appendChild(chartWrap)
    }

    // Session list
    const sessLabel = document.createElement('div')
    sessLabel.style.cssText = 'margin-top:22px;margin-bottom:10px'
    sessLabel.appendChild(SectionLabel({ children: 'Sesiones anteriores', accent }))
    scrollEl.appendChild(sessLabel)

    const sessList = document.createElement('div')
    sessList.style.cssText = 'padding:0 20px;display:flex;flex-direction:column;gap:8px'
    if (data.length === 0) {
      sessList.innerHTML = `<div style="padding:20px;text-align:center;font-size:13px;color:rgba(255,255,255,0.4)">No hay sesiones registradas. ¡Empieza a registrar!</div>`
    } else {
      sessList.innerHTML = [...data].reverse().map((sess, i) => {
        const idx = data.length - 1 - i
        const prev = idx > 0 ? data[idx - 1] : null
        const delta = prev ? +(sess.weight - prev.weight).toFixed(1) : null
        const isPR = sess.weight === allTime
        const isToday = sess.date === todayStr
        const srText = isToday && sess.sets && sess.reps ? `${sess.sets}×${sess.reps}` : null
        return `
          <div style="background:#141414;border-radius:14px;padding:12px 14px;border:${isToday ? `0.5px solid ${accent}55` : '0.5px solid rgba(255,255,255,0.06)'};display:flex;align-items:center;gap:14px;position:relative;overflow:hidden">
            ${isToday ? `<div style="position:absolute;top:0;bottom:0;left:0;width:2px;background:${accent}"></div>` : ''}
            <div style="flex:1;min-width:0">
              <div style="display:flex;align-items:baseline;gap:8px">
                <div style="font-family:'JetBrains Mono',monospace;font-size:12px;color:${isToday ? accent : 'rgba(255,255,255,0.7)'};letter-spacing:0.4px;${isToday ? 'text-transform:uppercase;font-weight:600' : ''}">${sess.date}</div>
                ${srText ? `<div style="font-family:'JetBrains Mono',monospace;font-size:10px;color:rgba(255,255,255,0.5);letter-spacing:0.4px">${srText}</div>` : ''}
              </div>
              ${delta !== null && delta !== 0 ? `<div style="display:inline-flex;align-items:center;gap:3px;margin-top:4px;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.4px;color:${delta > 0 ? accent : '#ff6b6b'};background:${delta > 0 ? `${accent}14` : 'rgba(255,107,107,0.12)'};padding:2px 7px;border-radius:6px"><span>${delta > 0 ? '▲' : '▼'}</span><span>${delta > 0 ? '+' : ''}${delta}${units}</span></div>` : ''}
              ${delta === 0 ? `<div style="display:inline-block;margin-top:4px;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.6px;color:rgba(255,255,255,0.4);background:rgba(255,255,255,0.04);padding:2px 7px;border-radius:6px">— mantén</div>` : ''}
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

  // ── Coach FAB (top-right) ──
  const fab = document.createElement('button')
  fab.style.cssText = `position:fixed;right:20px;top:72px;z-index:110;display:flex;align-items:center;gap:8px;padding:10px 16px 10px 12px;border-radius:9999px;border:0;cursor:pointer;background:${accent};color:#0a0a0a;font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:700;letter-spacing:-0.2px;box-shadow:0 8px 24px ${accent}55;touch-action:manipulation`
  fab.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
      <path d="M2.5 8.2c0-2.8 2.9-5 6.5-5s6.5 2.2 6.5 5-2.9 5-6.5 5c-.7 0-1.4-.08-2-.23L3.2 14.7l.5-2.4C2.95 11.4 2.5 9.9 2.5 8.2z" stroke="#0a0a0a" stroke-width="1.5" stroke-linejoin="round" fill="none"/>
      <circle cx="9" cy="8.2" r="0.95" fill="#0a0a0a"/>
      <circle cx="6" cy="8.2" r="0.95" fill="#0a0a0a"/>
      <circle cx="12" cy="8.2" r="0.95" fill="#0a0a0a"/>
    </svg>
    Coach IA`
  fab.addEventListener('click', () => openCoachChat(exercise, accent))
  container.appendChild(fab)
}

// ── Exercise Coach Chat Overlay ──

let _coachChatThread = []
let _coachChatLoading = false

function openCoachChat(exercise, accent) {
  _coachChatThread = []

  const overlay = document.createElement('div')
  overlay.style.cssText = 'position:fixed;inset:0;z-index:200;pointer-events:auto'

  const backdrop = document.createElement('div')
  backdrop.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,0.45)'
  backdrop.addEventListener('click', () => overlay.remove())
  overlay.appendChild(backdrop)

  const panel = document.createElement('div')
  panel.style.cssText = 'position:absolute;left:0;right:0;bottom:0;top:0;background:#0c0c0d;display:flex;flex-direction:column'

  panel.innerHTML = `
    <div style="flex-shrink:0;padding:52px 16px 12px;border-bottom:0.5px solid rgba(255,255,255,0.06);display:flex;align-items:center;gap:12px">
      <div style="width:40px;height:40px;border-radius:12px;flex-shrink:0;background:${accent}1c;border:0.5px solid ${accent}3a;display:flex;align-items:center;justify-content:center">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2.5 8.2c0-2.8 2.9-5 6.5-5s6.5 2.2 6.5 5-2.9 5-6.5 5c-.7 0-1.4-.08-2-.23L3.2 14.7l.5-2.4C2.95 11.4 2.5 9.9 2.5 8.2z" stroke="${accent}" stroke-width="1.5" stroke-linejoin="round" fill="none"/><circle cx="9" cy="8.2" r="0.95" fill="${accent}"/><circle cx="6" cy="8.2" r="0.95" fill="${accent}"/><circle cx="12" cy="8.2" r="0.95" fill="${accent}"/></svg>
      </div>
      <div style="flex:1;min-width:0">
        <div style="font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:700;color:#fafafa;letter-spacing:-0.3px">Coach IA</div>
        <div style="font-size:11.5px;color:rgba(255,255,255,0.5);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${exercise.name}</div>
      </div>
      <button id="coach-close-btn" style="width:34px;height:34px;border-radius:50%;flex-shrink:0;cursor:pointer;background:rgba(255,255,255,0.07);border:0.5px solid rgba(255,255,255,0.1);color:#fafafa;display:flex;align-items:center;justify-content:center;padding:0">
        <svg width="13" height="13" viewBox="0 0 13 13"><path d="M1 1l11 11M12 1L1 12" stroke="#fafafa" stroke-width="1.6" stroke-linecap="round"/></svg>
      </button>
    </div>
    <div id="coach-msgs" style="flex:1;overflow-y:auto;padding:18px 16px 8px">
      <div id="coach-bubbles" style="display:flex;flex-direction:column;gap:12px"></div>
    </div>
    <div id="coach-quick-chips" style="flex-shrink:0;padding:10px 16px 8px;display:flex;gap:8px;overflow-x:auto;scrollbar-width:none"></div>
    <div id="coach-pain-picker" style="flex-shrink:0;padding:12px 16px;border-top:0.5px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.015);display:none">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:9px">
        <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:1.4px;text-transform:uppercase;color:rgba(255,255,255,0.55);font-weight:600">¿Dónde lo sientes?</div>
        <button id="coach-pain-cancel" style="background:transparent;border:0;cursor:pointer;padding:2px;color:rgba(255,255,255,0.4);font-family:'Space Grotesk',sans-serif;font-size:11px">× cancelar</button>
      </div>
      <div id="coach-pain-parts" style="display:flex;flex-wrap:wrap;gap:7px"></div>
    </div>
    <div style="flex-shrink:0;padding:6px 16px 28px;display:flex;align-items:flex-end;gap:9px">
      <div style="flex:1;background:rgba(255,255,255,0.05);border:0.5px solid rgba(255,255,255,0.12);border-radius:22px;padding:4px 6px 4px 16px;display:flex;align-items:center">
        <input id="coach-input" type="text" placeholder="Escribe tu pregunta…" style="flex:1;background:transparent;border:0;outline:none;color:#fafafa;font-family:'Space Grotesk',sans-serif;font-size:14px;padding:8px 0;min-width:0">
      </div>
      <button id="coach-send-btn" style="width:44px;height:44px;border-radius:50%;flex-shrink:0;padding:0;cursor:pointer;background:${accent};border:0;display:flex;align-items:center;justify-content:center;transition:background 0.15s">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 15V3M9 3l-5 5M9 3l5 5" stroke="#0a0a0a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
    </div>`

  overlay.appendChild(panel)
  document.body.appendChild(overlay)

  const msgsEl = document.getElementById('coach-msgs')
  const bubblesEl = document.getElementById('coach-bubbles')
  const inputEl = document.getElementById('coach-input')
  const sendBtn = document.getElementById('coach-send-btn')
  const chipsEl = document.getElementById('coach-quick-chips')
  const painPicker = document.getElementById('coach-pain-picker')
  const painParts = document.getElementById('coach-pain-parts')
  const painCancel = document.getElementById('coach-pain-cancel')

  function bodyPartsFor(muscle) {
    const m = (muscle || '').toLowerCase()
    const lower = ['Rodilla', 'Cadera', 'Espalda baja', 'Tobillo', 'Isquios']
    const upperPush = ['Hombro', 'Codo', 'Muñeca', 'Pecho', 'Cuello']
    const upperPull = ['Hombro', 'Codo', 'Espalda baja', 'Muñeca', 'Cuello']
    if (/(pierna|cuád|cuad|femoral|glúteo|gluteo|pantorrilla|sóleo|soleo|isquio)/.test(m)) return lower.concat(['Hombro'])
    if (/(espalda|dorsal|trapecio|bíceps|biceps|remo)/.test(m)) return upperPull.concat(['Antebrazo'])
    return upperPush.concat(['Espalda baja'])
  }

  const parts = bodyPartsFor(exercise.muscle)

  // Quick chips
  const chips = [
    { label: 'Mejorar técnica', msg: '¿Cómo mejoro mi técnica en este ejercicio?' },
    { label: '⚠️ Me duele algo', pain: true },
    { label: '¿Voy muy pesado?', msg: '¿Cómo sé si estoy usando demasiado peso?' },
    { label: 'Variante fácil', msg: 'Dame una variante más fácil de este ejercicio.' },
  ]
  chips.forEach(c => {
    const btn = document.createElement('button')
    btn.textContent = c.label
    btn.style.cssText = `flex-shrink:0;padding:8px 13px;border-radius:9999px;cursor:pointer;background:${c.pain ? `${accent}16` : 'rgba(255,255,255,0.05)'};border:${c.pain ? `0.5px solid ${accent}3a` : '0.5px solid rgba(255,255,255,0.1)'};color:${c.pain ? accent : 'rgba(255,255,255,0.8)'};font-family:'Space Grotesk',sans-serif;font-size:12.5px;font-weight:600;white-space:nowrap`
    if (c.pain) {
      btn.addEventListener('click', () => {
        painPicker.style.display = 'block'
        chipsEl.style.display = 'none'
      })
    } else {
      btn.addEventListener('click', () => sendMessage(c.msg))
    }
    chipsEl.appendChild(btn)
  })

  // Pain parts
  parts.forEach(p => {
    const btn = document.createElement('button')
    btn.textContent = p
    btn.style.cssText = `padding:8px 13px;border-radius:9999px;cursor:pointer;background:${accent}14;border:0.5px solid ${accent}3a;color:${accent};font-family:'Space Grotesk',sans-serif;font-size:12.5px;font-weight:600`
    btn.addEventListener('click', () => {
      sendMessage(`Siento molestia en ${p.toLowerCase()} al hacer este ejercicio. ¿Qué ajusto?`)
      painPicker.style.display = 'none'
      chipsEl.style.display = 'flex'
    })
    painParts.appendChild(btn)
  })

  painCancel.addEventListener('click', () => {
    painPicker.style.display = 'none'
    chipsEl.style.display = 'flex'
  })

  function scrollToBottom() {
    if (msgsEl) msgsEl.scrollTop = msgsEl.scrollHeight
  }

  function addBubble(role, text, provider) {
    const isUser = role === 'user'
    const div = document.createElement('div')
    div.style.cssText = `display:flex;gap:8px;align-items:flex-end;flex-direction:${isUser ? 'row-reverse' : 'row'};align-self:${isUser ? 'flex-end' : 'flex-start'};max-width:86%`
    const avatar = !isUser ? `<div style="width:26px;height:26px;border-radius:8px;flex-shrink:0;background:${accent}1c;border:0.5px solid ${accent}3a;display:flex;align-items:center;justify-content:center"><svg width="13" height="13" viewBox="0 0 18 18" fill="none"><path d="M2.5 8.2c0-2.8 2.9-5 6.5-5s6.5 2.2 6.5 5-2.9 5-6.5 5c-.7 0-1.4-.08-2-.23L3.2 14.7l.5-2.4C2.95 11.4 2.5 9.9 2.5 8.2z" stroke="${accent}" stroke-width="1.5" stroke-linejoin="round" fill="none"/><circle cx="9" cy="8.2" r="0.95" fill="${accent}"/><circle cx="6" cy="8.2" r="0.95" fill="${accent}"/><circle cx="12" cy="8.2" r="0.95" fill="${accent}"/></svg></div>` : ''
    const providerBadge = (!isUser && provider) ? `<div style="margin-top:4px;font-size:9px;font-family:'JetBrains Mono',monospace;letter-spacing:0.6px;color:rgba(255,255,255,0.25);text-transform:uppercase">${provider}</div>` : ''
    div.innerHTML = `${avatar}<div style="display:flex;flex-direction:column;align-items:${isUser ? 'flex-end' : 'flex-start'}"><div style="background:${isUser ? accent : '#17171a'};color:${isUser ? '#0a0a0a' : 'rgba(255,255,255,0.92)'};border:${isUser ? 0 : '0.5px solid rgba(255,255,255,0.07)'};border-radius:${isUser ? '16px 16px 4px 16px' : '4px 16px 16px 16px'};padding:11px 14px;font-family:'Space Grotesk',sans-serif;font-size:14px;line-height:1.5;letter-spacing:-0.1px;white-space:pre-wrap;word-break:break-word;font-weight:${isUser ? 600 : 400}">${text}</div>${providerBadge}</div>`
    bubblesEl.appendChild(div)
  }

  // Greeting
  const greeting = `¡Qué onda! 👋 Soy tu coach para «${exercise.name}». Pregúntame sobre técnica, peso, o si algo te molesta y lo ajustamos.`
  addBubble('assistant', greeting)
  scrollToBottom()

  async function sendMessage(text) {
    const msg = (text || inputEl.value).trim()
    if (!msg || _coachChatLoading) return
    inputEl.value = ''
    painPicker.style.display = 'none'
    chipsEl.style.display = 'flex'

    _coachChatThread.push({ role: 'user', content: msg })
    addBubble('user', msg)
    scrollToBottom()

    _coachChatLoading = true
    sendBtn.style.background = 'rgba(255,255,255,0.08)'
    sendBtn.disabled = true

    // Typing dots
    const typingDiv = document.createElement('div')
    typingDiv.id = 'coach-typing'
    typingDiv.style.cssText = 'display:flex;gap:8px;align-items:flex-end;align-self:flex-start;max-width:86%'
    typingDiv.innerHTML = `
      <div style="width:26px;height:26px;border-radius:8px;flex-shrink:0;background:${accent}1c;border:0.5px solid ${accent}3a;display:flex;align-items:center;justify-content:center">
        <svg width="13" height="13" viewBox="0 0 18 18" fill="none"><path d="M2.5 8.2c0-2.8 2.9-5 6.5-5s6.5 2.2 6.5 5-2.9 5-6.5 5c-.7 0-1.4-.08-2-.23L3.2 14.7l.5-2.4C2.95 11.4 2.5 9.9 2.5 8.2z" stroke="${accent}" stroke-width="1.5" stroke-linejoin="round" fill="none"/><circle cx="9" cy="8.2" r="0.95" fill="${accent}"/><circle cx="6" cy="8.2" r="0.95" fill="${accent}"/><circle cx="12" cy="8.2" r="0.95" fill="${accent}"/></svg>
      </div>
      <div style="background:#17171a;border-radius:4px 16px 16px 16px;border:0.5px solid rgba(255,255,255,0.07);padding:12px 14px;display:flex;gap:4px;align-items:center">
        <span style="width:6px;height:6px;border-radius:50%;background:${accent};opacity:0.25;animation:coachBlink 1.2s 0s infinite ease-in-out"></span>
        <span style="width:6px;height:6px;border-radius:50%;background:${accent};opacity:0.25;animation:coachBlink 1.2s 0.18s infinite ease-in-out"></span>
        <span style="width:6px;height:6px;border-radius:50%;background:${accent};opacity:0.25;animation:coachBlink 1.2s 0.36s infinite ease-in-out"></span>
      </div>`
    bubblesEl.appendChild(typingDiv)
    scrollToBottom()

    try {
      const alternatives = (exercise.alternatives || []).map(a => a.name)
      const result = await exerciseCoachChat(exercise.name, exercise.muscle, alternatives, _coachChatThread)
      const reply = result?.reply || 'No tengo respuesta ahora mismo.'

      typingDiv.remove()
      _coachChatThread.push({ role: 'assistant', content: reply })
      addBubble('assistant', reply, result?._provider)
      scrollToBottom()
    } catch (err) {
      typingDiv.remove()
      addBubble('assistant', 'Ups, hubo un error. Intenta de nuevo.')
      scrollToBottom()
    } finally {
      _coachChatLoading = false
      sendBtn.style.background = accent
      sendBtn.disabled = false
    }
  }

  // Events
  document.getElementById('coach-close-btn').addEventListener('click', () => overlay.remove())
  sendBtn.addEventListener('click', () => sendMessage())
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); sendMessage() }
  })
}
