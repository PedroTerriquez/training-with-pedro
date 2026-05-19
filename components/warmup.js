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

function WarmupSection({ muscles, accent }) {
  const section = document.createElement('div')
  section.style.cssText = 'margin-top:20px;padding:0 20px'

  const keys = getUniqueWarmupMuscles(muscles)

  const header = document.createElement('button')
  header.style.cssText = `display:flex;align-items:center;gap:8px;width:100%;background:rgba(255,255,255,0.03);border:0.5px solid rgba(255,255,255,0.06);border-radius:14px;padding:12px 14px;cursor:pointer;color:inherit;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:1.6px;text-transform:uppercase;font-weight:600`
  let expanded = false

  const dot = document.createElement('span')
  dot.style.cssText = `width:6px;height:6px;border-radius:50%;background:${accent || '#d4ff3a'};flex-shrink:0`

  const label = document.createElement('span')
  label.textContent = 'Calentamiento y Estiramiento'

  const chevron = document.createElement('span')
  chevron.style.cssText = 'margin-left:auto;transition:transform 0.25s;font-size:14px;color:rgba(255,255,255,0.4)'
  chevron.textContent = '▾'

  header.appendChild(dot)
  header.appendChild(label)
  header.appendChild(chevron)
  section.appendChild(header)

  const body = document.createElement('div')
  body.style.cssText = 'overflow:hidden;max-height:0;transition:max-height 0.35s ease, opacity 0.25s ease;opacity:0'
  section.appendChild(body)

  const inner = document.createElement('div')
  inner.style.cssText = 'display:flex;flex-direction:column;gap:10px;padding-top:10px'

  if (keys.length > 0) {
    keys.forEach((key) => {
      const data = WARMUP_DATA[key]
      if (!data) return
      const group = document.createElement('div')
      group.style.cssText = 'border-radius:14px;background:#141414;border:0.5px solid rgba(255,255,255,0.06);overflow:hidden'

      if (data.warmup && data.warmup.length > 0) {
        if (data.warmup.length > 0) {
          data.warmup.forEach(ex => group.appendChild(makeRow(ex, 'calentar', accent)))
        }
      }
      if (data.stretch && data.stretch.length > 0) {
        data.stretch.forEach(ex => group.appendChild(makeRow(ex, 'estirar', accent)))
      }
      inner.appendChild(group)
    })
  } else {
    GENERIC_WARMUP.forEach((ex) => {
      const rowWrap = document.createElement('div')
      rowWrap.style.cssText = 'border-radius:14px;background:#141414;border:0.5px solid rgba(255,255,255,0.06);overflow:hidden'
      rowWrap.appendChild(makeRow(ex, ex.tag, accent))
      inner.appendChild(rowWrap)
    })
  }

  body.appendChild(inner)

  header.addEventListener('click', () => {
    expanded = !expanded
    chevron.style.transform = expanded ? 'rotate(180deg)' : ''
    body.style.maxHeight = expanded ? body.scrollHeight + 200 + 'px' : '0'
    body.style.opacity = expanded ? '1' : '0'
  })

  return section
}

function makeRow(ex, tag, accent) {
  const el = document.createElement('div')
  el.style.cssText = 'display:flex;gap:14px;padding:14px;border-bottom:0.5px solid rgba(255,255,255,0.04)'

  const imgWrap = document.createElement('div')
  imgWrap.style.cssText = 'width:80px;height:80px;border-radius:14px;overflow:hidden;background:#1c1c1c;flex-shrink:0;border:0.5px solid rgba(255,255,255,0.04)'

  if (ex.imgUrl) {
    const imgEl = document.createElement('img')
    imgEl.src = ex.imgUrl
    imgEl.alt = ex.name
    imgEl.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block'
    imgWrap.appendChild(imgEl)
  } else {
    imgWrap.style.backgroundImage = 'repeating-linear-gradient(135deg,rgba(255,255,255,0.018) 0 12px,rgba(255,255,255,0.05) 12px 24px)'
  }

  const isStallbar = ex.desc && ex.desc.startsWith('STALLBAR:')

  const info = document.createElement('div')
  info.style.cssText = 'flex:1;min-width:0;display:flex;flex-direction:column;gap:4px'

  const nameRow = document.createElement('div')
  nameRow.style.cssText = 'display:flex;align-items:center;gap:8px;flex-wrap:wrap'

  const nameEl = document.createElement('div')
  nameEl.style.cssText = `font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:600;color:#fafafa;letter-spacing:-0.3px;line-height:1.3;overflow-wrap:break-word`
  nameEl.textContent = ex.name

  nameRow.appendChild(nameEl)

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
  descEl.style.cssText = 'font-size:12px;color:rgba(255,255,255,0.55);line-height:1.45;margin-top:2px'
  descEl.textContent = isStallbar ? ex.desc.slice(10) : (ex.desc || '')

  info.appendChild(tagEl)
  info.appendChild(nameRow)
  info.appendChild(descEl)
  el.appendChild(imgWrap)
  el.appendChild(info)

  return el
}
