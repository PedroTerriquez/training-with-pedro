// ── ExerciseDetail bottom sheet ──
// Renders Workout tab (stepper + sets/reps opt-in), Cues tab, Swap tab, and History tab

function parseRepsDefault(rep) {
  if (typeof rep === 'number') return rep
  const m = String(rep).match(/(\d+)(?:\s*-\s*(\d+))?/)
  if (!m) return 8
  return parseInt(m[2] || m[1], 10)
}

function mountExerciseDetail(container, { exercise, accent, units, exercises, onOpenExercise, onSwapExercise, onClose, onLog, prevExercise, onPrev, nextExercise, onNext }) {
  const todayStr = new Date().toISOString().slice(0, 10)
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

    let showGif = !!exercise.gifUrl
    gifLayer.style.opacity = showGif ? '1' : '0'
    imgLayer.style.opacity = showGif ? '0' : '1'
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
        <a class="hero-tiktok-btn" href="tiktok://search?keyword=${searchUrl}" style="width:38px;height:38px;border-radius:50%;border:0.5px solid rgba(255,255,255,0.18);background:rgba(0,0,0,0.55);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.3);text-decoration:none" aria-label="Buscar en TikTok">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
        </a>
      </div>`
    hero.appendChild(bottomRow)
    heroWrap.appendChild(hero)
    scrollEl.appendChild(heroWrap)

    // TikTok app → web fallback: try tiktok:// scheme, if app not installed redirect to web search
    const heroTiktok = heroWrap.querySelector('.hero-tiktok-btn')
    if (heroTiktok) {
      heroTiktok.addEventListener('click', (e) => {
        e.preventDefault()
        const appUrl = `tiktok://search?keyword=${searchUrl}`
        const webUrl = `https://www.tiktok.com/search?q=${searchUrl}`
        let opened = false
        document.addEventListener('visibilitychange', () => { opened = true }, { once: true })
        window.location.href = appUrl
        setTimeout(() => {
          if (!opened) window.location.href = webUrl
        }, 500)
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
        exercise.logs = [...(exercise.logs || []), savedLog]
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
              <a class="alt-tiktok-btn" data-q="${encodeURIComponent(alt.name + ' exercise')}" href="tiktok://search?keyword=${encodeURIComponent(alt.name + ' exercise')}" style="width:30px;height:30px;border-radius:50%;border:0.5px solid rgba(255,255,255,0.15);background:rgba(0,0,0,0.4);cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;padding:0;text-decoration:none;position:relative;z-index:1" aria-label="Buscar en TikTok">
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
            const appUrl = `tiktok://search?keyword=${q}`
            const webUrl = `https://www.tiktok.com/search?q=${q}`
            let opened = false
            document.addEventListener('visibilitychange', () => { opened = true }, { once: true })
            window.location.href = appUrl
            setTimeout(() => {
              if (!opened) window.location.href = webUrl
            }, 500)
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
}
