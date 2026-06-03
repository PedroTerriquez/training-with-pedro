const GENERIC_WARMUP = [
  { name: 'Círculos de Brazos', imgUrl: img('Arm_Circles/0.jpg'), tag: 'calentar', desc: 'De pie con brazos extendidos. Haz círculos adelante 15 s, luego inverso.' },
  { name: 'Rotación de Tronco', imgUrl: img('Torso_Rotation/0.jpg'), tag: 'calentar', desc: 'Pies al ancho de hombros, rota torso a cada lado. 15 reps.' },
  { name: 'Estiramiento de Gato', imgUrl: img('Cat_Stretch/0.jpg'), tag: 'calentar', desc: 'En cuatro patas, alterna redondear y arquear espalda. 10 reps.' },
  { name: 'Oruga', imgUrl: img('Inchworm/0.jpg'), tag: 'calentar', desc: 'Inclínate, camina manos a plancha, camina pies a manos, levántate. 8 reps.' },
  { name: 'Zancada con Giro', imgUrl: img('Crossover_Reverse_Lunge/0.jpg'), tag: 'calentar', desc: 'Da un paso largo atrás cruzado, baja rodilla trasera. 8 reps cada lado.' },
  { name: 'Estocadas Divididas', imgUrl: img('Split_Squats/0.jpg'), tag: 'calentar', desc: 'Pies separados, baja rodilla trasera al piso. 8 reps cada lado.' },
  { name: 'Mejor Estiramiento del Mundo', imgUrl: img('Worlds_Greatest_Stretch/0.jpg'), tag: 'estirar', desc: 'Desde plancha, pie al lado de la mano, rota torso. Sostén 15 s cada lado.' },
  { name: 'Abrazo de Rodillas al Pecho', imgUrl: img('Hug_Knees_To_Chest/0.jpg'), tag: 'estirar', desc: 'Acostado, abraza rodillas al pecho, mece suavemente. Sostén 20-30 s.' },
  { name: 'Postura de Niño', imgUrl: img('Childs_Pose/0.jpg'), tag: 'estirar', desc: 'Rodillas al piso, siéntate sobre talones, brazos al frente. Sostén 20-30 s.' },
  { name: 'Espinal Acostado', imgUrl: img('Spinal_Stretch/0.jpg'), tag: 'estirar', desc: 'Acostado, gira rodillas dobladas a un lado, brazos abiertos. Sostén 20 s cada lado.' },
  { name: 'Media Langosta', imgUrl: img('One_Half_Locust/0.jpg'), tag: 'estirar', desc: 'Acostado boca abajo, levanta una pierna y brazo opuesto. Sostén 15 s cada lado.' },
  { name: 'Superman', imgUrl: img('Superman/0.jpg'), tag: 'estirar', desc: 'Acostado boca abajo, levanta brazos y piernas simultáneamente. Sostén 15 s.' },
]

const GENERIC_WARMUP_ONLY = GENERIC_WARMUP.filter(ex => ex.tag === 'calentar')
const GENERIC_STRETCH_ONLY = GENERIC_WARMUP.filter(ex => ex.tag === 'estirar')

function resolvePanelItems(muscles, mode) {
  const keys = getUniqueWarmupMuscles(muscles)
  const items = []
  if (keys.length > 0) {
    keys.forEach(key => {
      const data = WARMUP_DATA[key]
      if (!data) return
      const pool = mode === 'warmup' ? data.warmup : data.stretch
      if (pool) pool.forEach(ex => items.push({ ...ex, imgUrl: IMG_MAP[ex.name] || '', tag: MUSCLE_DISPLAY[key] || key }))
    })
  }
  return items.length > 0 ? items : (mode === 'warmup' ? GENERIC_WARMUP_ONLY : GENERIC_STRETCH_ONLY)
}

function makeCheckableRow(ex, tag, accent, { checked, onToggle }) {
  const el = document.createElement('div')
  el.style.cssText = 'display:flex;gap:14px;padding:14px;border-bottom:0.5px solid rgba(255,255,255,0.04);cursor:pointer;transition:opacity 0.2s'
  el.style.opacity = checked ? '0.5' : '1'

  const cb = document.createElement('div')
  cb.style.cssText = `width:24px;height:24px;border-radius:50%;border:2px solid ${checked ? accent : 'rgba(255,255,255,0.2)'};flex-shrink:0;margin-top:4px;transition:all 0.2s;display:flex;align-items:center;justify-content:center;background:${checked ? accent : 'transparent'}`
  if (checked) cb.innerHTML = `<svg width="12" height="9" viewBox="0 0 12 9" fill="none"><path d="M1 4.5l3.5 3.5L11 1" stroke="#0a0a0a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`

  const imgWrap = document.createElement('div')
  imgWrap.style.cssText = 'width:64px;height:64px;border-radius:12px;overflow:hidden;background:#1c1c1c;flex-shrink:0;border:0.5px solid rgba(255,255,255,0.04)'
  if (ex.imgUrl) {
    const imgEl = document.createElement('img')
    imgEl.src = ex.imgUrl
    imgEl.alt = ex.name
    imgEl.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block'
    imgWrap.appendChild(imgEl)
  } else {
    imgWrap.style.backgroundImage = 'repeating-linear-gradient(135deg,rgba(255,255,255,0.018) 0 12px,rgba(255,255,255,0.05) 12px 24px)'
  }

  const info = document.createElement('div')
  info.style.cssText = 'flex:1;min-width:0;display:flex;flex-direction:column;gap:4px'

  const nameRow = document.createElement('div')
  nameRow.style.cssText = 'display:flex;align-items:center;gap:8px;flex-wrap:wrap'

  const nameEl = document.createElement('div')
  nameEl.style.cssText = `font-family:'Space Grotesk',sans-serif;font-size:15px;font-weight:600;color:${checked ? 'rgba(255,255,255,0.5)' : '#fafafa'};letter-spacing:-0.2px;line-height:1.3;overflow-wrap:break-word;text-decoration:${checked ? 'line-through' : 'none'}`
  nameEl.textContent = ex.name
  nameRow.appendChild(nameEl)

  const isStallbar = ex.desc && ex.desc.startsWith('STALLBAR - ')
  if (isStallbar) {
    const stallbarBadge = document.createElement('span')
    stallbarBadge.textContent = 'STALLBAR'
    stallbarBadge.style.cssText = `align-self:flex-start;font-family:'JetBrains Mono',monospace;font-size:8px;letter-spacing:1.2px;text-transform:uppercase;padding:1px 6px;border-radius:4px;background:#f59e0b;color:#0a0a0a;line-height:1.4`
    nameRow.appendChild(stallbarBadge)
  }

  const tagEl = document.createElement('span')
  tagEl.style.cssText = `align-self:flex-start;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:1.2px;text-transform:uppercase;padding:2px 8px;border-radius:4px;background:${accent || '#d4ff3a'}1a;color:${accent || '#d4ff3a'}`
  tagEl.textContent = tag

  const descEl = document.createElement('div')
  descEl.style.cssText = `font-size:12px;color:${checked ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.55)'};line-height:1.45;margin-top:2px`
  descEl.textContent = isStallbar ? ex.desc.slice(12) : (ex.desc || '')

  info.appendChild(tagEl)
  info.appendChild(nameRow)
  info.appendChild(descEl)
  el.appendChild(cb)
  el.appendChild(imgWrap)
  el.appendChild(info)

  el.addEventListener('click', (e) => {
    e.stopPropagation()
    onToggle()
  })

  return { el, cb }
}

function makePanelContent({ muscles, accent, mode, onComplete }) {
  const container = document.createElement('div')
  container.style.cssText = 'display:flex;flex-direction:column;gap:10px;padding-top:10px'

  const items = resolvePanelItems(muscles, mode)
  if (items.length === 0) {
    container.innerHTML = `<div style="padding:14px 0;font-size:13px;color:rgba(255,255,255,0.4);text-align:center">No ${mode === 'warmup' ? 'calentamiento' : 'estiramiento'} sugerido para hoy</div>`
    return container
  }

  const checkedSet = new Set()
  const rows = []

  function updateCompletion() {
    const allDone = checkedSet.size === items.length
    if (allDone && onComplete) onComplete()
  }

  const markAllBtn = document.createElement('button')
  markAllBtn.style.cssText = `display:flex;align-items:center;gap:8px;padding:8px 14px;border-radius:8px;border:0.5px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.03);cursor:pointer;color:rgba(255,255,255,0.6);font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:500;transition:all 0.2s;align-self:flex-start;touch-action:manipulation`
  markAllBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="0.5" y="0.5" width="13" height="13" rx="3" stroke="currentColor" stroke-width="1.5"/></svg> Marcar todo como listo`

  markAllBtn.addEventListener('click', (e) => {
    e.stopPropagation()
    checkedSet.clear()
    items.forEach((_, idx) => checkedSet.add(idx))
    rows.forEach(({ el, cb, index }) => {
      const checked = true
      cb.style.borderColor = accent
      cb.style.background = accent
      cb.innerHTML = `<svg width="12" height="9" viewBox="0 0 12 9" fill="none"><path d="M1 4.5l3.5 3.5L11 1" stroke="#0a0a0a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`
      el.style.opacity = '0.5'
      el.querySelector('div:last-child div:nth-child(2) div:first-child').style.color = 'rgba(255,255,255,0.5)'
      el.querySelector('div:last-child div:nth-child(2) div:first-child').style.textDecoration = 'line-through'
      el.querySelector('div:last-child > div:last-child').style.color = 'rgba(255,255,255,0.3)'
    })
    updateCompletion()
  })

  const topRow = document.createElement('div')
  topRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between'
  topRow.appendChild(markAllBtn)
  container.appendChild(topRow)

  items.forEach((ex, idx) => {
    const result = makeCheckableRow(ex, ex.tag, accent, {
      checked: checkedSet.has(idx),
      onToggle: () => {
        if (checkedSet.has(idx)) {
          checkedSet.delete(idx)
        } else {
          checkedSet.add(idx)
        }
        renderCheckState(idx)
        updateCompletion()
      }
    })
    result.index = idx

    function renderCheckState(index) {
      const row = rows.find(r => r.index === index)
      if (!row) return
      const checked = checkedSet.has(index)
      row.cb.style.borderColor = checked ? accent : 'rgba(255,255,255,0.2)'
      row.cb.style.background = checked ? accent : 'transparent'
      row.cb.innerHTML = checked ? `<svg width="12" height="9" viewBox="0 0 12 9" fill="none"><path d="M1 4.5l3.5 3.5L11 1" stroke="#0a0a0a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>` : ''
      row.el.style.opacity = checked ? '0.5' : '1'
      const nameEl = row.el.querySelector('div:last-child div:nth-child(2) div:first-child')
      if (nameEl) {
        nameEl.style.color = checked ? 'rgba(255,255,255,0.5)' : '#fafafa'
        nameEl.style.textDecoration = checked ? 'line-through' : 'none'
      }
      const descEl = row.el.querySelector('div:last-child > div:last-child')
      if (descEl) descEl.style.color = checked ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.55)'
    }

    rows.push(result)
    container.appendChild(result.el)
  })

  return container
}

function WarmupPanelContent({ muscles, accent, onComplete }) {
  return makePanelContent({ muscles, accent, mode: 'warmup', onComplete })
}

function StretchingPanelContent({ muscles, accent, onComplete }) {
  return makePanelContent({ muscles, accent, mode: 'stretch', onComplete })
}

// ── Warmup/Stretch Exercise Detail Sheet ──
function mountWarmupDetail({ items, mode, accent, onComplete }) {
  if (!items || items.length === 0) return

  const overlay = document.createElement('div')
  overlay.style.cssText = 'position:fixed;inset:0;z-index:100;pointer-events:auto'

  const backdrop = document.createElement('div')
  backdrop.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,0.45);transition:background 0.25s'
  backdrop.addEventListener('click', close)
  overlay.appendChild(backdrop)

  const sheet = document.createElement('div')
  sheet.style.cssText = 'position:absolute;left:0;right:0;bottom:0;background:#0e0e0e;border-radius:28px 28px 0 0;max-height:92%;overflow:hidden;box-shadow:0 -20px 40px rgba(0,0,0,0.5);border:0.5px solid rgba(255,255,255,0.08);display:flex;flex-direction:column'

  const handle = document.createElement('div')
  handle.style.cssText = 'width:36px;height:5px;border-radius:3px;background:rgba(255,255,255,0.18);margin:10px auto 0;flex-shrink:0'
  sheet.appendChild(handle)

  const body = document.createElement('div')
  body.style.cssText = 'overflow:auto;flex:1'
  sheet.appendChild(body)
  overlay.appendChild(sheet)
  document.body.appendChild(overlay)
  document.body.style.overflow = 'hidden'

  let _idx = 0
  const total = items.length
  const label = mode === 'warmup' ? 'calentamiento' : 'estiramiento'

  function close() {
    document.body.style.overflow = ''
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay)
  }

  function render() {
    body.innerHTML = ''
    const item = items[_idx]

    // Nav pills
    const navWrap = document.createElement('div')
    navWrap.style.cssText = 'padding:10px 14px 0;display:flex;gap:8px'

    function navPill(dir) {
      const isPrev = dir === 'prev'
      const targetIdx = isPrev ? _idx - 1 : _idx + 1
      const disabled = targetIdx < 0 || targetIdx >= total
      const label = isPrev ? 'Anterior' : 'Siguiente'
      const arrowColor = disabled ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.85)'
      const arrow = isPrev
        ? `<path d="M10 5H1m0 0l4-4M1 5l4 4" stroke="${arrowColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`
        : `<path d="M1 5h9m0 0L6 1m4 4L6 9" stroke="${arrowColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`
      const btn = document.createElement('button')
      btn.style.cssText = `flex:1;min-width:0;background:${disabled ? 'rgba(255,255,255,0.02)' : '#141414'};border:0.5px solid rgba(255,255,255,0.06);border-radius:12px;padding:8px 12px;cursor:${disabled ? 'default' : 'pointer'};color:inherit;text-align:left;display:flex;align-items:center;gap:9px;flex-direction:${isPrev ? 'row' : 'row-reverse'};opacity:${disabled ? 0.45 : 1}`
      if (!disabled) btn.addEventListener('click', () => { _idx = targetIdx; render() })
      btn.innerHTML = `
        <div style="width:26px;height:26px;border-radius:8px;background:${disabled ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)'};border:0.5px solid rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <svg width="11" height="10" viewBox="0 0 11 10" fill="none" style="flex-shrink:0">${arrow}</svg>
        </div>
        <div style="flex:1;min-width:0;display:flex;flex-direction:column;align-items:${isPrev ? 'flex-start' : 'flex-end'};gap:1px">
          <div style="font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:1.3px;text-transform:uppercase;color:${disabled ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.45)'};font-weight:600;line-height:1">${label}</div>
          <div style="font-family:'Space Grotesk',sans-serif;font-size:12px;font-weight:600;color:#fafafa;letter-spacing:-0.1px;line-height:1.25;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:${isPrev ? 'left' : 'right'};width:100%">${items[targetIdx]?.name || (isPrev ? 'Primero' : 'Último')}</div>
        </div>`
      return btn
    }

    navWrap.appendChild(navPill('prev'))
    navWrap.appendChild(navPill('next'))
    body.appendChild(navWrap)

    // Counter badge
    const counter = document.createElement('div')
    counter.style.cssText = 'padding:8px 14px 0;display:flex;align-items:center;gap:8px'
    counter.innerHTML = `
      <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:1.4px;color:rgba(255,255,255,0.45);font-weight:500">${_idx + 1} / ${total}</div>
      <div style="flex:1;height:3px;border-radius:2px;background:rgba(255,255,255,0.06);overflow:hidden">
        <div style="height:100%;border-radius:2px;background:${accent};width:${((_idx + 1) / total) * 100}%;transition:width 0.2s"></div>
      </div>`
    body.appendChild(counter)

    // Hero image
    const heroWrap = document.createElement('div')
    heroWrap.style.cssText = 'padding:12px 14px 0'
    const hero = document.createElement('div')
    hero.style.cssText = 'height:280px;border-radius:18px;overflow:hidden;position:relative;background:#161616;border:0.5px solid rgba(255,255,255,0.06);display:flex;flex-direction:column;justify-content:space-between'

    if (item.imgUrl) {
      hero.style.background = `#161616 url(${item.imgUrl}) center/cover no-repeat`
    } else {
      hero.style.backgroundImage = 'repeating-linear-gradient(135deg,rgba(255,255,255,0.018) 0 24px,rgba(255,255,255,0.04) 24px 48px)'
    }

    // Top row: muscle tag + STALLBAR badge
    const topRow = document.createElement('div')
    topRow.style.cssText = 'display:flex;align-items:flex-start;position:relative;z-index:1;padding:12px;gap:6px'
    topRow.innerHTML = `
      <span style="display:inline-flex;align-items:center;padding:4px 10px;border-radius:9999px;background:rgba(0,0,0,0.45);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);border:0.5px solid rgba(255,255,255,0.1);font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:1.2px;font-weight:500;color:rgba(255,255,255,0.85);text-transform:uppercase">${item.tag || ''}</span>
      ${item.desc && item.desc.startsWith('STALLBAR - ') ? '<span style="display:inline-flex;align-items:center;padding:3px 8px;border-radius:4px;background:#f59e0b;font-family:\'JetBrains Mono\',monospace;font-size:8px;letter-spacing:1.2px;text-transform:uppercase;color:#0a0a0a;font-weight:600">STALLBAR</span>' : ''}`
    hero.appendChild(topRow)

    // Bottom row: exercise name
    const bottomRow = document.createElement('div')
    bottomRow.style.cssText = 'padding:12px;position:relative;z-index:1'
    bottomRow.innerHTML = `
      <div style="font-family:'Space Grotesk',sans-serif;font-size:24px;font-weight:700;color:#fafafa;letter-spacing:-0.5px;line-height:1.1;text-shadow:0 2px 8px rgba(0,0,0,0.5)">${item.name}</div>`
    hero.appendChild(bottomRow)

    heroWrap.appendChild(hero)
    body.appendChild(heroWrap)

    // Description
    const descWrap = document.createElement('div')
    descWrap.style.cssText = 'padding:14px 18px 0'
    const descText = item.desc && item.desc.startsWith('STALLBAR - ') ? item.desc.slice(12) : (item.desc || '')
    descWrap.innerHTML = `
      <div style="display:flex;align-items:baseline;gap:8px;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:1.6px;text-transform:uppercase;color:rgba(255,255,255,0.5);font-weight:600;margin-bottom:10px">
        <div style="width:4px;height:4px;border-radius:50%;background:${accent}"></div>
        Cómo hacerlo
      </div>
      <div style="font-size:14px;line-height:1.7;color:rgba(255,255,255,0.82);font-family:'Space Grotesk',sans-serif;letter-spacing:-0.05px">${descText}</div>`
    body.appendChild(descWrap)

    // Complete button
    const btnWrap = document.createElement('div')
    btnWrap.style.cssText = 'padding:18px 14px 30px'
    const completeBtn = document.createElement('button')
    completeBtn.style.cssText = `width:100%;padding:16px;border-radius:14px;border:0;cursor:pointer;background:${accent};color:#0a0a0a;font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:700;letter-spacing:-0.2px;display:flex;align-items:center;justify-content:center;gap:10px;touch-action:manipulation;box-shadow:0 8px 32px ${accent}44`
    completeBtn.innerHTML = `<svg width="18" height="14" viewBox="0 0 18 14" fill="none"><path d="M1 7l5.5 5.5L17 1.5" stroke="#0a0a0a" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg> Marcar ${label} como hecho`
    completeBtn.addEventListener('click', () => {
      close()
      if (onComplete) onComplete()
    })
    btnWrap.appendChild(completeBtn)
    body.appendChild(btnWrap)
  }

  render()
}
