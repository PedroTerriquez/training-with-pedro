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
  sheet.style.cssText = 'position:absolute;left:0;right:0;bottom:0;background:#0e0e0e;border-radius:16px 16px 0 0;max-height:92%;overflow:hidden;box-shadow:0 -20px 40px rgba(0,0,0,0.5);border:0.5px solid rgba(255,255,255,0.08);display:flex;flex-direction:column'

  const handle = document.createElement('div')
  handle.style.cssText = 'width:36px;height:5px;border-radius:3px;background:rgba(255,255,255,0.18);margin:10px auto 0;flex-shrink:0'
  sheet.appendChild(handle)

  const closeBtn = document.createElement('button')
  closeBtn.style.cssText = 'position:absolute;top:14px;right:14px;width:36px;height:36px;border-radius:50%;border:0.5px solid rgba(255,255,255,0.12);background:rgba(0,0,0,0.55);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:200;padding:0;color:rgba(255,255,255,0.85)'
  closeBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 2l10 10M12 2L2 12"/></svg>'
  closeBtn.addEventListener('click', (e) => { e.stopPropagation(); close() })
  overlay.appendChild(closeBtn)

  const body = document.createElement('div')
  body.style.cssText = 'overflow:auto;flex:1'
  sheet.appendChild(body)
  overlay.appendChild(sheet)
  document.body.appendChild(overlay)
  document.body.style.overflow = 'hidden'

  let _idx = 0
  let _swiping = false
  const total = items.length
  const label = mode === 'warmup' ? 'calentamiento' : 'estiramiento'
  initSwipe(body)

  const WARMUP_GIF_MAP = {
    "Flexiones Dinámicas Excéntricas contra Pared": "pectorals/push-up-wall",
    "Dislocaciones de Pecho y Hombro con Banda": "pectorals/dynamic-chest-stretch-male",
    "Estiramiento de Pecho en Esquina de Pared": "pectorals/chest-and-front-of-shoulder-stretch",
    "Estiramiento Un Brazo Contra Pared": "lats/one-arm-against-wall",
    "Apertura de Pecho Pasiva en Espaldera": "pectorals/behind-head-chest-stretch",
    "Movilidad Escapular en Y-T-W": "delts/band-y-raise",
    "Giros Externos con Banda Dinámicos": "delts/cable-standing-shoulder-external-rotation",
    "Estiramiento del Deltoides Posterior Cruzado": "delts/rear-deltoid-stretch",
    "Estiramiento del Deltoides Anterior Sentado": "pectorals/chest-and-front-of-shoulder-stretch",
    "Tracción Escapular Colgado": "traps/scapular-pull-up",
    "Flexiones en Diamante sobre Pared": "pectorals/push-up-wall",
    "Extensiones de Codo al Aire Activas": "triceps/overhead-triceps-stretch",
    "Estiramiento de Tríceps por Detrás de la Cabeza": "triceps/overhead-triceps-stretch",
    "Elongación de Tríceps contra Pared": "triceps/triceps-stretch",
    "Estiramiento de Bíceps en Pared con Pulgar Abajo": "lats/one-arm-against-wall",
    "Gato-Camello Dinámico": "spine/spine-stretch",
    "Oruga Walkout Dinámica": "abs/inchworm",
    "Torsión Espinal en el Suelo Estática": "glutes/bent-knee-lying-twist-male",
    "Colgado Asistido Descompresivo": "traps/scapular-pull-up",
    "Desplazamiento Escapular de Pie": "serratus-anterior/scapula-push-up",
    "Estiramiento de Espalda Media con Brazos Cruzados al Frente": "upper-back/upper-back-stretch",
    "Inclinaciones Laterales en Flecha": "lats/standing-lateral-stretch",
    "Estiramiento Lateral del Dorsal en Pared": "lats/kneeling-lat-stretch",
    "Dorsales Inclinado en Barra Media": "lats/kneeling-lat-stretch",
    "Encogimientos Escapulares Dinámicos": "traps/dumbbell-shrug",
    "Depresiones Escapulares Activas de Pie": "traps/scapular-pull-up",
    "Estiramiento del Trapecio Superior Asistido": "levator-scapulae/neck-side-stretch",
    "Estiramiento de Trapecio Medio Cruzando Hombros": "upper-back/upper-back-stretch",
    "Trapecio Superior por Inclinación Lateral": "levator-scapulae/neck-side-stretch",
    "Desplantes Inversos Dinámicos": "glutes/barbell-rear-lunge",
    "Estiramiento de Cuádriceps Acostado Boca Abajo": "quads/assisted-prone-lying-quads-stretch",
    "Estiramiento de Cuádriceps Clásico de Pie": "quads/intermediate-hip-flexor-and-quad-stretch",
    "Buenos Días Dinámicos con Manos en Nuca": "hamstrings/barbell-good-morning",
    "Patadas Frankenstein Dinámicas": "glutes/frankenstein-squat",
    "Estiramiento de Isquiotibiales con Banda en Suelo": "hamstrings/hamstring-stretch",
    "Estiramiento Isquiotibial Unilateral en Banco": "hamstrings/leg-up-hamstring-stretch",
    "Femoral Elevado en Barra Media": "hamstrings/leg-up-hamstring-stretch",
    "Puentes de Glúteo Dinámicos con Pausa": "glutes/pelvic-tilt-into-bridge",
    "Figura 4 Acostado Boca Arriba": "glutes/assisted-lying-gluteus-and-piriformis-stretch",
    "Postura de la Paloma Pasiva en Suelo": "glutes/seated-piriformis-stretch",
    "Elevaciones de Talón de Pie Continuas": "calves/bodyweight-standing-calf-raise",
    "Estiramiento de Gemelo en Escalón Pasivo": "calves/calf-stretch-with-hands-against-wall",
    "Estiramiento de Gemelo contra Pared con Pierna Recta": "calves/calf-stretch-with-hands-against-wall",
    "Elevación de Talones Sentado al Aire": "calves/seated-calf-stretch-male",
    "Estiramiento de Sóleo contra Pared con Rodilla Flexionada": "calves/calf-stretch-with-hands-against-wall",
    "Escarabajo Muerto (Dead Bug) Básico": "abs/dead-bug",
    "Plancha Alta con Toques de Hombro": "abs/shoulder-tap",
    "Postura de la Cobra Estática en Suelo": "spine/sphinx",
    "Cobra Abdominal Asistida en Barra Baja": "spine/upward-facing-dog",
    "Círculos de Muñecas con Puños Cerrados": "forearms/wrist-circles",
    "Estiramiento de Flexores de Muñeca de Rodillas": "forearms/side-wrist-pull-stretch",
    "Estiramiento de Extensores de Muñeca": "forearms/side-wrist-pull-stretch",
    "Estiramiento Lateral de Cuello Asistido": "levator-scapulae/neck-side-stretch",
    "Estiramiento de la Musculatura Cervical Posterior": "levator-scapulae/side-push-neck-stretch",
    "Tracción Cervical Angular por Inclinación de Torso": "levator-scapulae/neck-side-stretch",

    // --- CDN-extended matches ---
    "Tríceps Apoyado en Barra Alta": "triceps/overhead-triceps-stretch",
    "Flexiones de Bíceps Dinámicas con Rotación": "biceps/dumbbell-alternate-biceps-curl",
    "Rotaciones de Brazo Completo (Tornillo)": "delts/dumbbell-standing-around-world",
    "Estiramiento de Bíceps Sentado con Manos Atrás": "pectorals/chest-and-front-of-shoulder-stretch",
    "Bícep Invertido en Barra Baja": "lats/one-arm-against-wall",
    "Postura del Niño con Enfoque Lumbar": "lats/kneeling-lat-stretch",
    "Deslizamientos en Pared (Wall Angels)": "serratus-anterior/scapula-push-up",
    "Estiramiento del Enhebrado de Aguja": "upper-back/upper-back-stretch",
    "Tracción Escapular con Pies Apoyados": "traps/scapular-pull-up",
    "Transición de Plancha Alta a Perro Boca Abajo": "glutes/pike-to-cobra-push-up",
    "Postura de Cachorro con Codos Apoyados": "lats/kneeling-lat-stretch",
    "Sentadillas Libres a Ritmo Controlado": "glutes/barbell-full-squat",
    "Couch Stretch Asistido": "quads/intermediate-hip-flexor-and-quad-stretch",
    "Patadas Hidrantes en Cuadrupedia": "glutes/glute-bridge-march",
    "Figura 4 de Pie con Sentadilla Asistida": "glutes/seated-piriformis-stretch",
    "Saltos Cortos sobre Metatarsos (Pogo Hops)": "calves/bodyweight-standing-calf-raise",
    "Gemelo en Barra Inferior con Descenso de Talón": "calves/standing-calf-raise-on-a-staircase",
    "Balanceo de Rodilla hacia Adelante en Cuclillas": "quads/squat-to-overhead-reach",
    "Estiramiento de Sóleo en Cuclillas con Apoyo": "quads/all-fours-squad-stretch",
    "Sóleo Profundo Asistido en Barra Inferior": "calves/calf-stretch-with-hands-against-wall",
    "Estiramiento Corporal Completo en Supino": "spine/spine-stretch",
    "Pulsaciones Rápidas de Apertura de Manos (Air Flashes)": "forearms/finger-curls",
    "Flexores de Antebrazo en Barra Media": "forearms/side-wrist-pull-stretch",
    "Retracciones Cervicales Activas (Chin Tucks)": "levator-scapulae/side-push-neck-stretch",
    "Semicírculos Cervicales Inferiores": "levator-scapulae/neck-side-stretch",
  }

  function resolveGifUrl(name) {
    const path = WARMUP_GIF_MAP[name]
    if (path) return _GIF(path)
    return ''
  }

  function close() {
    document.body.style.overflow = ''
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay)
  }

  function render(slideFrom) {
    body.innerHTML = ''
    if (_swiping) return
    const item = items[_idx]
    item.gifUrl = resolveGifUrl(item.name)

    // Nav pills + Hecho button (between prev/next)
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
      if (!disabled) btn.addEventListener('click', () => {
        if (_swiping) return
        const c = body.querySelector('[data-sw]')
        if (c) {
          _swiping = true
          c.style.transition = 'transform 0.15s ease, opacity 0.15s ease'
          c.style.transform = `translateX(${isPrev ? '30%' : '-30%'})`
          c.style.opacity = '0'
          setTimeout(() => { _idx = targetIdx; _swiping = false; render(isPrev ? 'left' : 'right') }, 150)
        } else {
          _idx = targetIdx; render()
        }
      })
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
    // Hecho button — between prev and next, similar to Iniciar in detail
    const hechoBtn = document.createElement('button')
    hechoBtn.style.cssText = `flex-shrink:0;border:0;cursor:pointer;color:#0a0a0a;background:${accent};border-radius:12px;padding:8px 16px;font-family:'Space Grotesk',sans-serif;font-size:12px;font-weight:700;letter-spacing:-0.1px;display:flex;align-items:center;gap:7px;touch-action:manipulation;box-shadow:0 4px 16px ${accent}44`
    hechoBtn.innerHTML = `<svg width="14" height="11" viewBox="0 0 14 11" fill="none"><path d="M1 5.5l4 4L13 1.5" stroke="#0a0a0a" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg> Hecho`
    hechoBtn.addEventListener('click', () => {
      close()
      if (onComplete) onComplete()
    })
    navWrap.appendChild(hechoBtn)
    navWrap.appendChild(navPill('next'))
    body.appendChild(navWrap)

    // Counter badge (stays outside swipeEl so it stays put)
    const counter = document.createElement('div')
    counter.style.cssText = 'padding:8px 14px 0;display:flex;align-items:center;gap:8px'
    counter.innerHTML = `
      <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:1.4px;color:rgba(255,255,255,0.45);font-weight:500">${_idx + 1} / ${total}</div>
      <div style="flex:1;height:3px;border-radius:2px;background:rgba(255,255,255,0.06);overflow:hidden">
        <div style="height:100%;border-radius:2px;background:${accent};width:${((_idx + 1) / total) * 100}%"></div>
      </div>`
    body.appendChild(counter)

    // Swipeable content wrapper
    const sw = document.createElement('div')
    sw.setAttribute('data-sw', '')
    body.appendChild(sw)

    // Hero image
    const heroWrap = document.createElement('div')
    heroWrap.style.cssText = 'padding:12px 14px 0'
    const hero = document.createElement('div')
    hero.style.cssText = 'height:400px;border-radius:18px;overflow:hidden;position:relative;background:#161616;border:0.5px solid rgba(255,255,255,0.06);display:flex;flex-direction:column;justify-content:space-between'

    // Extract static poster from GIF first frame (perfect match)
    function posterFromGif(url, cb) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        try {
          const c = document.createElement('canvas')
          c.width = img.naturalWidth; c.height = img.naturalHeight
          c.getContext('2d').drawImage(img, 0, 0)
          cb(c.toDataURL('image/jpeg', 0.85))
        } catch (_) { cb('') }
      }
      img.onerror = () => cb('')
      img.src = url
    }

    // Media layers — img (static poster), gif (animated overlay)
    const media = document.createElement('div')
    media.style.cssText = 'position:absolute;inset:0'
    const imgLayer = document.createElement('div')
    imgLayer.style.cssText = 'position:absolute;inset:0;transition:opacity .35s;pointer-events:none'
    const gifLayer = document.createElement('div')
    gifLayer.style.cssText = 'position:absolute;inset:0;transition:opacity .35s;pointer-events:none'

    // Static poster: start with free-exercise-db image, upgrade to GIF first frame
    if (item.imgUrl) imgLayer.style.background = `#161616 url(${item.imgUrl}) center/cover no-repeat`
    if (item.gifUrl) {
      posterFromGif(item.gifUrl, (dataUrl) => {
        if (dataUrl) imgLayer.style.background = `#161616 url(${dataUrl}) center/cover no-repeat`
      })
    }
    if (!item.imgUrl && !item.gifUrl) imgLayer.style.display = 'none'

    if (item.gifUrl) {
      const gifImg = document.createElement('img')
      gifImg.src = item.gifUrl
      gifImg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;user-select:none'
      gifLayer.appendChild(gifImg)
    } else gifLayer.style.display = 'none'

    let showGif = !!item.gifUrl
    gifLayer.style.opacity = showGif ? '1' : '0'
    imgLayer.style.opacity = showGif ? '0' : '1'
    media.appendChild(imgLayer)
    media.appendChild(gifLayer)
    hero.appendChild(media)

    if (item.gifUrl) {
      const togglePill = document.createElement('button')
      togglePill.style.cssText = 'position:absolute;top:10px;right:10px;z-index:5;width:32px;height:32px;border-radius:50%;border:0.5px solid rgba(255,255,255,0.1);background:rgba(0,0,0,0.45);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;color:rgba(255,255,255,0.75)'
      togglePill.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6"/><path d="M2.5 12a9 9 0 0 1 15.5-5L21.5 8"/><path d="M2.5 22v-6h6"/><path d="M21.5 12a9 9 0 0 1-15.5 5L2.5 16"/></svg>'
      togglePill.addEventListener('click', (e) => {
        e.stopPropagation()
        showGif = !showGif
        gifLayer.style.opacity = showGif ? '1' : '0'
        imgLayer.style.opacity = showGif ? '0' : '1'
      })
      hero.appendChild(togglePill)
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
    sw.appendChild(heroWrap)

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
    sw.appendChild(descWrap)



    // Slide-in animation
    if (slideFrom) {
      sw.style.transform = `translateX(${slideFrom === 'right' ? '60%' : '-60%'})`
      sw.style.opacity = '0'
      requestAnimationFrame(() => {
        sw.style.transition = 'transform 0.35s cubic-bezier(0.22,1,0.36,1), opacity 0.35s ease'
        sw.style.transform = 'translateX(0)'
        sw.style.opacity = '1'
        setTimeout(() => {
          sw.style.transition = ''
          sw.style.transform = ''
          sw.style.opacity = ''
        }, 400)
      })
    }
  }

  function initSwipe(el) {
    let startX = 0, startY = 0
    el.addEventListener('touchstart', (e) => {
      const t = e.touches[0]
      startX = t.clientX; startY = t.clientY
    }, { passive: true })
    el.addEventListener('touchmove', (e) => {
      if (_swiping) return
      const t = e.touches[0]
      const dx = t.clientX - startX
      const dy = t.clientY - startY
      if (Math.abs(dx) > Math.abs(dy) * 0.7) {
        const c = el.querySelector('[data-sw]')
        if (c) {
          c.style.transform = `translateX(${dx * 0.3}px)`
          c.style.opacity = `${1 - Math.abs(dx) * 0.002}`
        }
      }
    }, { passive: true })
    el.addEventListener('touchend', (e) => {
      if (_swiping) return
      const c = el.querySelector('[data-sw]')
      const t = e.changedTouches[0]
      const dx = t.clientX - startX
      const dy = t.clientY - startY
      if (Math.abs(dx) < 50 || Math.abs(dy) > Math.abs(dx) * 0.7) {
        if (c) {
          c.style.transition = 'transform 0.25s ease, opacity 0.25s ease'
          c.style.transform = 'translateX(0)'
          c.style.opacity = '1'
        }
        return
      }
      if (dx < 0 && _idx < total - 1) {
        _swiping = true
        if (c) {
          c.style.transition = 'transform 0.15s ease, opacity 0.15s ease'
          c.style.transform = 'translateX(-30%)'
          c.style.opacity = '0'
          setTimeout(() => { _idx++; _swiping = false; render('right') }, 150)
        } else {
          _idx++; render()
        }
      } else if (dx > 0 && _idx > 0) {
        _swiping = true
        if (c) {
          c.style.transition = 'transform 0.15s ease, opacity 0.15s ease'
          c.style.transform = 'translateX(30%)'
          c.style.opacity = '0'
          setTimeout(() => { _idx--; _swiping = false; render('left') }, 150)
        } else {
          _idx--; render()
        }
      } else {
        if (c) {
          c.style.transition = 'transform 0.25s ease, opacity 0.25s ease'
          c.style.transform = 'translateX(0)'
          c.style.opacity = '1'
        }
      }
    }, { passive: true })
  }

  render()
}
