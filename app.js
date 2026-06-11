// ── App Shell ──
// Router, state management, event bus

const APP_VERSION = 'v1.44 · 2026-06-09 · Streak threshold 5→4 days/week + implementer commit policy'

// ── Push Notification Config ──
// PUSH_SERVER_URL and VAPID_PUBLIC_KEY are loaded from push-config.js
// (loaded via <script> tag before this file in index.html)

let _state = {
  route: 'today',
  settings: null,
  programs: [],
  exercises: [],
  exerciseLogs: [],
  activeProgram: null,
  detailExercise: null,
  sheetOpen: false,
  tempSwaps: {}, // exerciseId → alternativeExerciseId (today-only)
}

let _rootEl = null
let _appEl = null
let _screenContainer = null
let _tabBarEl = null
let _deferredPrompt = null

async function init() {
  _rootEl = document.getElementById('root')
  _rootEl.innerHTML = ''

  await loadState()

  if (localStorage.getItem('hasUsedApp') && _state.exercises.length === 0) {
    try {
      await Storage.restoreFromBackup()
      await loadState()
    } catch (e) {
      showToast('❌ No se pudieron recuperar datos guardados', true)
    }
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then((reg) => {
      // Activate new SW immediately if waiting
      if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' })
      // Detect new SW installation
      reg.addEventListener('updatefound', () => {
        const sw = reg.installing
        sw.addEventListener('statechange', () => {
          if (sw.state === 'installed' && navigator.serviceWorker.controller) {
            sw.postMessage({ type: 'SKIP_WAITING' })
          }
        })
      })
    }).catch(() => {})
    // Reload when new SW takes control
    let refreshing = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return
      refreshing = true
      window.location.reload()
    })
  }

  // PWA install prompt (Chrome Android)
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    _deferredPrompt = e
  })

  // Auto-subscribe for push if permission already granted (VAPID key required)
  if (PUSH_SERVER_URL && VAPID_PUBLIC_KEY && 'Notification' in window && Notification.permission === 'granted') {
    subscribePush()
  }

  renderShell()

  window.addEventListener('hashchange', handleRoute)
  window.appRefresh = refresh
  window.silentRefresh = async () => {
    _state.settings = await Storage.getSettings()
    _state.programs = await Storage.getPrograms()
    _state.exercises = await Storage.getExercises()
    _state.activeProgram = _state.settings.activeProgramId
      ? _state.programs.find((p) => p.id === _state.settings.activeProgramId)
      : _state.programs[0] || null
    _state.settings.lastUpdate = new Date().toISOString()
    await Storage.saveSettings(_state.settings)
  }

  _checkRestTimer()
  _cleanupStaleNotifications()
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      _checkRestTimer()
      _cleanupStaleNotifications()
    }
  })
}

async function loadState() {
  _state.settings = await Storage.getSettings()
  _state.programs = await Storage.getPrograms()
  _state.exercises = await Storage.getExercises()
  _state.activeProgram = _state.settings.activeProgramId
    ? _state.programs.find((p) => p.id === _state.settings.activeProgramId)
    : _state.programs[0] || null

  handleRoute()
}

function handleRoute() {
  const hash = window.location.hash.slice(1) || 'today'

  // Check if it's a detail route
  if (hash.startsWith('detail=')) {
    const id = hash.replace('detail=', '')
    const ex = _state.exercises.find((e) => e.id === id)
    if (ex) {
      openDetailSheet(ex)
    }
    return
  }

  _state.route = hash
  if (_screenContainer) {
    renderScreen()
  }
}

function renderShell() {
  _rootEl.innerHTML = ''

  _appEl = document.createElement('div')
  _appEl.style.cssText = 'position:relative;min-height:100vh;background:#0a0a0a;overflow:hidden'

  _screenContainer = document.createElement('div')
  _screenContainer.id = 'screen-container'
  _appEl.appendChild(_screenContainer)

  _rootEl.appendChild(_appEl)

  renderScreen()
}

async function renderScreen() {
  if (!_screenContainer) return

  if (_tabBarEl && _tabBarEl.parentNode) {
    _tabBarEl.parentNode.removeChild(_tabBarEl)
  }
  const accent = _state.settings?.accentColor || '#d4ff3a'
  _tabBarEl = TabBar({
    active: _state.route,
    onChange: (tab) => {
      _state.route = tab
      window.location.hash = tab
      renderScreen()
    },
    accent,
  })
  _appEl.appendChild(_tabBarEl)

  _screenContainer.innerHTML = ''

  // Compute reschedule order for the current week
  const weekOrder = _state.settings?.rescheduleWeekOrder || {}
  const progId = _state.activeProgram?.id || 'prog'
  const weekIdx = _state.settings?.currentWeekIdx || 0
  const rescheduleKey = progId + '-week-' + weekIdx
  const defaultOrder = [0,1,2,3,4,5,6]
  const savedOrder = weekOrder[rescheduleKey]
  const rescheduleOrder = savedOrder?.length === 7 ? savedOrder : defaultOrder

  const onUpdateRescheduleOrder = async (newOrder) => {
    const s = await Storage.getSettings()
    if (!s.rescheduleWeekOrder) s.rescheduleWeekOrder = {}
    const key = (_state.activeProgram?.id || 'prog') + '-week-' + (_state.settings?.currentWeekIdx || 0)
    s.rescheduleWeekOrder[key] = newOrder
    await Storage.saveSettings(s)
    _state.settings = s
    renderScreen()
  }

  switch (_state.route) {
    case 'today':
      mountToday(_screenContainer, {
        program: _state.activeProgram,
        weekIdx: _state.settings?.currentWeekIdx || 0,
        dayIndex: -1,
        settings: _state.settings,
        exercises: _state.exercises,
        accent,
        swaps: _state.tempSwaps,
        rescheduleOrder,
        onOpenExercise: openDetailSheet,
      })
      break
    case 'plan':
      mountPlan(_screenContainer, {
        program: _state.activeProgram,
        weekIdx: _state.settings?.currentWeekIdx || 0,
        dayIndex: getTodayDayIndex(),
        accent,
        exercises: _state.exercises,
        rescheduleOrder,
        onUpdateRescheduleOrder,
        onOpenExercise: openDetailSheet,
        onWeekChange: (idx) => {
          _state.settings.currentWeekIdx = idx
          renderScreen()
        },
      })
      break
    case 'history':
      mountHistory(_screenContainer, {
        accent,
        units: _state.settings?.units || 'kg',
        onOpenExercise: openDetailSheet,
        program: _state.activeProgram,
        weekIdx: _state.settings?.currentWeekIdx || 0,
        onRefresh: refresh,
        exercises: _state.exercises,
      })
      break
    case 'you':
      mountYou(_screenContainer, {
        accent,
        units: _state.settings?.units || 'kg',
        settings: _state.settings,
        onRefresh: refresh,
      })
      break
    default:
      mountToday(_screenContainer, {
        program: _state.activeProgram,
        weekIdx: _state.settings?.currentWeekIdx || 0,
        dayIndex: -1,
        settings: _state.settings,
        exercises: _state.exercises,
        accent,
        swaps: _state.tempSwaps,
        onOpenExercise: openDetailSheet,
      })
  }
}

function getTodayDayIndex() {
  const jsDay = new Date().getDay()
  return (jsDay + 6) % 7
}

async function openDetailSheet(exercise) {
  if (_state.sheetOpen) return
  const accent = _state.settings?.accentColor || '#d4ff3a'
  const units = _state.settings?.units || 'kg'

  const logs = await Storage.getLogsForExercise(exercise.id)

  // Find the program exercise config (sets/reps/rest) and prev/next exercise
  let progEx = null
  let prevExercise = null
  let nextExercise = null
  if (_state.activeProgram) {
    for (const week of _state.activeProgram.weeks) {
      for (const day of week.days) {
        const idx = day.exercises.findIndex((e) => e.exerciseId === exercise.id)
        if (idx !== -1) {
          progEx = day.exercises[idx]
          const prevProgEx = day.exercises[idx - 1]
          if (prevProgEx) {
            const resolved = _state.exercises.find((e) => e.id === prevProgEx.exerciseId)
            if (resolved) {
              prevExercise = {
                ...prevProgEx,
                name: resolved.name,
                muscle: resolved.muscle,
                imgUrl: resolved.imgUrl || getExerciseImageFromDictionary(resolved.name) || '',
                gifUrl: getExerciseGifUrl(resolved.name) || null,
              }
            }
          }
          const nextProgEx = day.exercises[idx + 1]
          if (nextProgEx) {
            const resolved = _state.exercises.find((e) => e.id === nextProgEx.exerciseId)
            if (resolved) {
              nextExercise = {
                ...nextProgEx,
                name: resolved.name,
                muscle: resolved.muscle,
                imgUrl: resolved.imgUrl || getExerciseImageFromDictionary(resolved.name) || '',
                gifUrl: getExerciseGifUrl(resolved.name) || null,
              }
            }
          }
          break
        }
      }
      if (progEx) break
    }
  }

  const gifUrl = getExerciseGifUrl(exercise.name) || null

  const detailEx = {
    ...exercise,
    sets: progEx?.sets || exercise.sets || 3,
    reps: progEx?.reps || exercise.reps || '10',
    rest: progEx?.rest || exercise.rest || 60,
    imgUrl: exercise.imgUrl || getExerciseImageFromDictionary(exercise.name) || '',
    logs: logs.sort((a, b) => a.date.localeCompare(b.date)),
    gifUrl,
  }

  const overlay = Sheet({
    open: true,
    onClose: () => {
      document.body.style.overflow = ''
      _state.sheetOpen = false
      window.location.hash = _state.route
      refresh()
    },
    children: () => {
      const div = document.createElement('div')
      mountExerciseDetail(div, {
        exercise: detailEx,
        accent,
        units,
        exercises: _state.exercises,
        prevExercise,
        nextExercise,
        onOpenExercise: openDetailSheet,
        onSwapExercise: async (originalId, altId) => {
          _state.tempSwaps[originalId] = altId
          document.body.style.overflow = ''
          _state.sheetOpen = false
          if (overlay.parentNode) overlay.parentNode.removeChild(overlay)
          window.location.hash = _state.route
          await refresh()
        },
        onPrev: () => {
          document.body.style.overflow = ''
          _state.sheetOpen = false
          if (overlay.parentNode) overlay.parentNode.removeChild(overlay)
          const prevBase = _state.exercises.find(e => e.id === prevExercise.exerciseId)
          if (prevBase) openDetailSheet(prevBase)
        },
        onNext: () => {
          document.body.style.overflow = ''
          _state.sheetOpen = false
          if (overlay.parentNode) overlay.parentNode.removeChild(overlay)
          const nextBase = _state.exercises.find(e => e.id === nextExercise.exerciseId)
          if (nextBase) openDetailSheet(nextBase)
        },
        onClose: () => {
          _state.sheetOpen = false
          window.location.hash = _state.route
          refresh()
        },
        onLog: async (exerciseId, weight, sets, reps) => {
          const savedUnits = _state.settings?.units || 'kg'
          const log = await Storage.logWeight(exerciseId, weight, savedUnits, sets, reps)
          return log ? { id: log, exerciseId, date: getToday(), weight, units: savedUnits, sets, reps } : null
        },
      })
      return div
    },
  })

  _state.sheetOpen = true
  document.body.appendChild(overlay)
}

async function refresh() {
  _state.settings = await Storage.getSettings()
  _state.settings.lastUpdate = new Date().toISOString()
  await Storage.saveSettings(_state.settings)
  _state.programs = await Storage.getPrograms()
  _state.exercises = await Storage.getExercises()
  _state.activeProgram = _state.settings.activeProgramId
    ? _state.programs.find((p) => p.id === _state.settings.activeProgramId)
    : _state.programs[0] || null

  document.documentElement.style.setProperty('--accent', _state.settings?.accentColor || '#d4ff3a')

  try {
    await Storage.backupAll()
  } catch (e) {
    showToast('⚠️ Error al guardar: ' + e.message, true)
  }

  renderScreen()
}

// ── Push Notification Management ──

function _urlBase64ToUint8Array(str) {
  const padding = '='.repeat((4 - str.length % 4) % 4)
  const b64 = (str + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(b64)
  return Uint8Array.from(raw, c => c.charCodeAt(0))
}

async function _deviceId() {
  let id = localStorage.getItem('push_device_id')
  if (!id) {
    id = 'dev_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8)
    localStorage.setItem('push_device_id', id)
  }
  return id
}

async function subscribePush() {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    console.warn('subscribePush: permission not granted')
    if (typeof showToast === 'function') showToast('Permiso de notificaciones no concedido', true)
    return false
  }
  if (!('serviceWorker' in navigator) || !PUSH_SERVER_URL) {
    console.warn('subscribePush: no SW or no PUSH_SERVER_URL')
    if (typeof showToast === 'function') showToast('Service Worker o URL no disponible', true)
    return false
  }
  try {
    const reg = await navigator.serviceWorker.ready
    let sub = await reg.pushManager.getSubscription()
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: _urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })
    }
    const res = await fetch(`${PUSH_SERVER_URL}/api/push/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription: sub.toJSON(), deviceId: await _deviceId() }),
    })
    if (!res.ok) {
      const txt = await res.text()
      console.error('Push subscribe error:', res.status, txt)
      if (typeof showToast === 'function') showToast(`Worker error: ${res.status}`, true)
      return false
    }
    const s = await Storage.getSettings()
    s.pushSubscribed = true
    await Storage.saveSettings(s)
    return true
  } catch (e) {
    console.error('subscribePush failed:', e)
    if (typeof showToast === 'function') showToast(`Error: ${e.message}`, true)
    return false
  }
}

async function unsubscribePush() {
  if (!('serviceWorker' in navigator)) return
  try {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    if (sub) await sub.unsubscribe()
    if (PUSH_SERVER_URL) {
      await fetch(`${PUSH_SERVER_URL}/api/push/unsubscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: await _deviceId() }),
      })
    }
    const s = await Storage.getSettings()
    s.pushSubscribed = false
    await Storage.saveSettings(s)
  } catch (_) {}
}

async function sendPushNotification(title, body, tag, restSeconds) {
  const s = await Storage.getSettings()
  if (!s.pushSubscribed) {
    console.warn('sendPush: not subscribed')
    if (typeof showToast === 'function') showToast('No suscrito a push', true)
    return false
  }
  if (!PUSH_SERVER_URL) {
    console.warn('sendPush: no server URL')
    if (typeof showToast === 'function') showToast('PUSH_SERVER_URL no configurado', true)
    return false
  }
  // Write notification data to Cache API so SW can read it on empty push
  try {
    const cache = await caches.open('push-pending')
    await cache.put('/pending', new Response(JSON.stringify({ title, body: body + ' ▸', tag: tag || 'workout', restSeconds })))
  } catch (_) {}
  // Wait 2s before sending push so Apple Watch has time to sync
  await new Promise(r => setTimeout(r, 2000))
  try {
    const res = await fetch(`${PUSH_SERVER_URL}/api/push/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId: await _deviceId() }),
    })
    if (!res.ok) {
      const txt = await res.text()
      console.error('sendPush error:', res.status, txt)
      if (typeof showToast === 'function') showToast(`Worker error: ${res.status}: ${txt}`, true)
      return false
    }
    return true
  } catch (e) {
    console.error('sendPush failed:', e)
    if (typeof showToast === 'function') showToast(`Error: ${e.message}`, true)
    return false
  }
}

// ── AI Import ──

const AI_IMPORT_ENABLED = typeof PUSH_SERVER_URL !== 'undefined' && PUSH_SERVER_URL

async function importWithAI(text, onProgress) {
  if (!AI_IMPORT_ENABLED) {
    throw new Error('PUSH_SERVER_URL no configurado. Revisa push-config.js')
  }

  const res = await fetch(`${PUSH_SERVER_URL}/api/ai/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      systemPrompt: typeof buildImportPrompt === 'function' ? buildImportPrompt() : '',
    }),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || 'Error del servidor')
  }

  if (data.error === true) {
    throw new Error(data.message || 'La IA no pudo procesar la rutina')
  }

  if (!data.weeks || !data.weeks.length) {
    throw new Error('La IA no pudo interpretar la rutina. Intenta con más detalles.')
  }

  const programName = data.program_name || 'Programa IA ' + getToday()

  let totalExercises = 0
  for (const w of data.weeks) {
    for (const d of (w.days || [])) {
      totalExercises += (d.exercises || []).length
    }
  }

  let processed = 0
  const weeks = []
  for (const w of data.weeks) {
    const days = []
    for (const d of (w.days || [])) {
      const exercises = []
      for (const ex of (d.exercises || [])) {
        processed++
        if (onProgress) onProgress(processed, totalExercises, ex.exercise_name)
        const exercise = await Storage.findOrCreateExerciseByName(ex.exercise_name, ex.muscle || '')
        exercises.push({
          exerciseId: exercise.id,
          sets: ex.sets || 3,
          reps: String(ex.reps || '10'),
          rest: ex.rest_sec || 90,
        })
      }
      days.push({
        name: d.name || 'Día',
        subtitle: d.subtitle || '',
        duration: d.duration_min || 60,
        exercises,
      })
    }
    weeks.push({
      name: w.name || 'Semana 1',
      subtitle: w.subtitle || '',
      tag: w.tag || '',
      days,
    })
  }

  const program = {
    id: await generateId(),
    name: programName,
    weeks,
  }

  await Storage.saveProgram(program)

  const settings = await Storage.getSettings()
  settings.activeProgramId = program.id
  await Storage.saveSettings(settings)

  _state.programs = await Storage.getPrograms()
  _state.exercises = await Storage.getExercises()
  _state.settings = await Storage.getSettings()
  _state.activeProgram = program

  return program
}

// ── Program Coach ──

async function programCoach(text, program, settings) {
  if (!PUSH_SERVER_URL) return { message: 'Configura push-config.js para usar el coach IA.' }

  // Resolve exercise IDs to names
  const exercises = await Storage.getExercises()
  const exMap = {}
  for (const e of exercises) exMap[e.id] = e.name

  const programCopy = JSON.parse(JSON.stringify(program))
  for (const w of programCopy.weeks || []) {
    for (const d of w.days || []) {
      for (const ex of d.exercises || []) {
        ex.exercise_name = exMap[ex.exerciseId] || ex.exerciseId
        delete ex.exerciseId
      }
    }
  }

  const userProfile = {
    user_name: settings.userName || '',
    age: settings.age || '',
    sex: settings.sex || '',
    body_weight: settings.weight ? `${settings.weight}${settings.units || 'kg'}` : '',
    height_cm: settings.height || '',
    goal: settings.goal || '',
    experience: settings.experience || '',
    occupation: settings.occupation || '',
    units: settings.units || 'kg',
  }

  const exerciseNames = program.weeks.flatMap(w =>
    w.days.flatMap(d => d.exercises.map(ex => exMap[ex.exerciseId]))
  ).filter(Boolean)
  const dictionary = typeof buildAIDictionary === 'function' ? buildAIDictionary(exerciseNames) : []

  try {
    const res = await fetch(`${PUSH_SERVER_URL}/api/ai/program-coach`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        currentProgram: programCopy,
        userProfile,
        systemPrompt: typeof buildProgramCoachPrompt === 'function' ? buildProgramCoachPrompt() : '',
        dictionary,
      }),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Error del servidor')

    if (data.program && data.program.weeks && data.program.weeks.length) {
      // Create the program from the AI's JSON
      const programName = data.program.program_name || 'Coach IA ' + getToday()
      const weeks = []

      for (const w of data.program.weeks) {
        const days = []
        for (const d of (w.days || [])) {
          const exercises = []
          for (const ex of (d.exercises || [])) {
            const exercise = await Storage.findOrCreateExerciseByName(ex.exercise_name, ex.muscle || '')
            exercises.push({
              exerciseId: exercise.id,
              sets: ex.sets || 3,
              reps: String(ex.reps || '10'),
              rest: ex.rest_sec || 90,
            })
          }
          days.push({
            name: d.name || 'Día',
            subtitle: d.subtitle || '',
            duration: d.duration_min || 60,
            exercises,
          })
        }
        weeks.push({
          name: w.name || 'Semana 1',
          subtitle: w.subtitle || '',
          tag: w.tag || '',
          days,
        })
      }

      const newProgram = {
        id: await generateId(),
        name: programName,
        weeks,
      }

      await Storage.saveProgram(newProgram)

      const s = await Storage.getSettings()
      s.activeProgramId = newProgram.id
      await Storage.saveSettings(s)

      _state.programs = await Storage.getPrograms()
      _state.exercises = await Storage.getExercises()
      _state.settings = await Storage.getSettings()
      _state.activeProgram = newProgram

      return newProgram
    }

    return { message: data.message || 'Listo.', _provider: data._provider || 'llama' }
  } catch (err) {
    return { message: 'Error: ' + err.message }
  }
}

// ── Exercise Coach Chat ──

async function exerciseCoachChat(exerciseName, muscle, alternatives, messages) {
  if (!PUSH_SERVER_URL) return { reply: 'Configura push-config.js para usar el coach IA.' }

  try {
    const res = await fetch(`${PUSH_SERVER_URL}/api/ai/exercise-coach`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        exercise_name: exerciseName,
        muscle,
        alternatives,
        messages,
      }),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Error')

    return { reply: data.reply || 'No tengo respuesta ahora.', _provider: data._provider || 'llama' }
  } catch (err) {
    return { reply: 'Error al contactar al coach: ' + err.message }
  }
}

// ── Coach Analysis ──

async function runCoachAnalysis(day, effort, durationMin, exercises, settings, swaps) {
  settings = settings || {}
  swaps = swaps || {}
  if (!PUSH_SERVER_URL) return { analysis: 'Buen trabajo hoy. Sigue así.', verdict: 'neutral' }

  const exercisesById = Object.fromEntries((exercises || []).map(e => [e.id, e]))
  const exerciseData = []

  for (const progEx of (day.exercises || [])) {
    const resolvedId = swaps[progEx.exerciseId] || progEx.exerciseId
    const exDef = exercisesById[resolvedId] || {}
    const logs = await Storage.getLogsForExercise(resolvedId)
    logs.sort((a, b) => a.date.localeCompare(b.date))

    const todayLog = logs.find(l => l.date === getToday())
    const weights = logs.filter(l => l.weight > 0).map(l => l.weight)
    const maxWeight = weights.length > 0 ? Math.max(...weights) : 0
    const isPR = todayLog ? todayLog.weight >= maxWeight : false

    let plateauSessions = 0
    if (weights.length >= 3) {
      const last3 = weights.slice(-3)
      if (last3.every(w => w === last3[0])) plateauSessions = 3
      else if (weights.length >= 4) {
        const last4 = weights.slice(-4)
        if (last4.every(w => w === last4[0])) plateauSessions = 4
      }
    }

    const prevWeight = weights.length >= 2 ? weights[weights.length - 2] : null
    const prevPrevWeight = weights.length >= 3 ? weights[weights.length - 3] : null

    exerciseData.push({
      name: exDef.name || progEx.exerciseId,
      muscle: exDef.muscle || '',
      planned_sets: progEx.sets || 3,
      planned_reps: String(progEx.reps || '10'),
      actual_sets: todayLog?.sets ?? progEx.sets ?? 3,
      actual_reps: todayLog?.reps ?? String(progEx.reps ?? '10'),
      load_weight: todayLog ? todayLog.weight : null,
      prev_weight: prevWeight,
      prev_prev_weight: prevPrevWeight,
      is_pr: isPR,
      is_plateau: plateauSessions >= 3,
      plateau_sessions: plateauSessions,
    })
  }

  const totalVolume = exerciseData.reduce((sum, ex) => {
    const reps = typeof ex.actual_reps === 'number' ? ex.actual_reps : (parseInt(ex.actual_reps) || 0)
    return sum + (ex.load_weight || 0) * (ex.actual_sets || 0) * reps
  }, 0)

  const units = settings.units || 'kg'
  const sessionData = {
    day_name: day.name || 'Entrenamiento',
    date: getToday(),
    duration_min: durationMin || 0,
    effort: { easy: 'fácil', good: 'justo', heavy: 'pesado', failure: 'al fallo' }[effort] || effort,
    units,
    user_profile: {
      user_name: settings.userName || '',
      age: settings.age || '',
      sex: settings.sex || '',
      body_weight: settings.weight ? `${settings.weight}${units}` : '',
      goal: settings.goal || '',
      experience: settings.experience || '',
    },
    exercises: exerciseData,
    total_volume: `${Math.round(totalVolume)}${units}`,
  }

  try {
    const res = await fetch(`${PUSH_SERVER_URL}/api/ai/coach`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionData, systemPrompt: typeof buildCoachPrompt === 'function' ? buildCoachPrompt() : '' }),
    })

    const data = await res.json()
    if (data.error) throw new Error(data.error)

    const result = {
      date: sessionData.date,
      analysis: data.analysis || 'Buen trabajo hoy. Sigue así.',
      verdict: data.verdict || 'neutral',
      _provider: data._provider || 'llama',
    }

    await Storage.saveCoachAnalysis(result)
    return result
  } catch (err) {
    const fallback = { date: sessionData.date, analysis: 'Buen trabajo hoy. Sigue así y no olvides descansar bien.', verdict: 'neutral', _provider: 'llama' }
    await Storage.saveCoachAnalysis(fallback)
    return fallback
  }
}

function installPWA() {
  const accent = _state.settings?.accentColor || '#d4ff3a'
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  if (_deferredPrompt && isMobile) {
    _deferredPrompt.prompt()
    _deferredPrompt.userChoice.then(() => { _deferredPrompt = null })
    return
  }
  // Show instructions (desktop or iOS fallback)
  const overlay = document.createElement('div')
  overlay.style.cssText = 'position:fixed;inset:0;z-index:200;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;padding:24px'
  const card = document.createElement('div')
  card.style.cssText = `background:#141414;border-radius:24px;padding:28px 24px 24px;max-width:340px;width:100%;border:0.5px solid rgba(255,255,255,0.08);box-shadow:0 20px 60px rgba(0,0,0,0.5);animation:fadeUp 0.25s ease-out;text-align:center`
  card.innerHTML = `
    <div style="font-size:36px;margin-bottom:8px">📲</div>
    <div style="font-family:'Space Grotesk',sans-serif;font-size:20px;font-weight:700;color:#fafafa;letter-spacing:-0.3px;margin-bottom:16px">Instalar app</div>
    <div style="display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:18px">
      <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
        <div style="width:64px;height:64px;border-radius:16px;background:rgba(255,255,255,0.06);border:0.5px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:center;font-size:28px">⎙</div>
        <div style="font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.6px;text-transform:uppercase;color:rgba(255,255,255,0.4)">Compartir</div>
      </div>
      <div style="color:rgba(255,255,255,0.25);font-size:20px">→</div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
        <div style="width:64px;height:64px;border-radius:16px;background:rgba(255,255,255,0.06);border:0.5px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:center;font-size:28px">+</div>
        <div style="font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.6px;text-transform:uppercase;color:rgba(255,255,255,0.4)">Pantalla inicio</div>
      </div>
      <div style="color:rgba(255,255,255,0.25);font-size:20px">→</div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
        <div style="width:64px;height:64px;border-radius:16px;background:${accent}18;border:0.5px solid ${accent}33;display:flex;align-items:center;justify-content:center;font-size:28px;color:${accent}">✓</div>
        <div style="font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.6px;text-transform:uppercase;color:${accent}">Listo</div>
      </div>
    </div>
    <div style="font-size:12px;color:rgba(255,255,255,0.5);line-height:1.5;margin-bottom:18px;padding:0 4px">Solo funciona en Safari. Presiona <strong style="color:#fafafa">Compartir</strong> <span style="display:inline-block;padding:1px 5px;background:rgba(255,255,255,0.08);border-radius:4px;font-size:11px">⎙</span> y elige <strong style="color:#fafafa">Agregar a pantalla de inicio</strong>.</div>
    <button id="pwa-close" style="padding:10px 24px;border-radius:12px;border:0;background:rgba(255,255,255,0.08);color:#fafafa;font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:600;cursor:pointer">Entendido</button>`
  overlay.appendChild(card)
  document.body.appendChild(overlay)
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove() })
  card.querySelector('#pwa-close').addEventListener('click', () => overlay.remove())
}

window.notifyWatch = async (title, body, opts = {}) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  try {
    const reg = await navigator.serviceWorker.ready
    if (reg.active) reg.active.postMessage({ type: 'notify', title, body, icon: 'icons/icon-192.png', tag: opts.tag || 'workout', restSeconds: opts.restSeconds || 0, requireInteraction: opts.requireInteraction !== false })
  } catch (_) {}
}

window._startRestTimer = async (name, restSec, tag, sets, reps) => {
  const endTime = Date.now() + restSec * 1000
  try {
    const cache = await caches.open('rest-timer')
    await cache.put('/pending', new Response(JSON.stringify({ endTime, name, tag, restSec, sets, reps })))
  } catch (_) {}
  if (window._restTimerId) clearTimeout(window._restTimerId)
  window._restTimerId = setTimeout(_checkRestTimer, restSec * 1000)
}

async function _checkRestTimer() {
  try {
    const cache = await caches.open('rest-timer')
    const res = await cache.match('/pending')
    if (!res) return
    const data = await res.json()
    const remaining = data.endTime - Date.now()
    if (remaining <= 0) {
      await cache.delete('/pending')
      if (window._restTimerId) { clearTimeout(window._restTimerId); window._restTimerId = null }
      await _completeRest(data)
    } else {
      if (window._restTimerId) clearTimeout(window._restTimerId)
      window._restTimerId = setTimeout(_checkRestTimer, remaining)
    }
  } catch (_) {}
}

async function _completeRest(data) {
  if (typeof showToast === 'function') showToast(`⏰ ${data.name} — Descanso terminado`)
  const doneTag = `done-${Date.now()}`
  const closeAt = Date.now() + 60000
  // Store close schedule so _cleanupStaleNotifications can close it
  try {
    const cache = await caches.open('rest-timer')
    const existing = await cache.match('/close-pending')
    const items = existing ? await existing.json() : []
    items.push({ tag: doneTag, closeAt })
    await cache.put('/close-pending', new Response(JSON.stringify(items)))
  } catch (_) {}
  // Best-effort SW timer backup
  try {
    const reg = await navigator.serviceWorker.ready
    if (reg.active) reg.active.postMessage({ type: 'schedule-close', tag: doneTag, delay: 60000 })
  } catch (_) {}
  // App timer — fires only if app stays alive
  setTimeout(async () => {
    try {
      const reg = await navigator.serviceWorker.ready
      if (reg.active) reg.active.postMessage({ type: 'close-tag', tag: doneTag })
    } catch (_) {}
  }, 60000)
  await window.notifyWatch(`TIMER DE DESCANSO ${data.restSec}s`, data.name, { tag: doneTag, requireInteraction: false })
  if (data.sets && data.reps) {
    await window.notifyWatch(data.name, `${data.sets}×${data.reps}`, { restSeconds: data.restSec, tag: `cycle-${Date.now()}` })
  }
}

async function _cleanupStaleNotifications() {
  try {
    const cache = await caches.open('rest-timer')
    const res = await cache.match('/close-pending')
    if (!res) return
    const items = await res.json()
    const now = Date.now()
    const active = items.filter(item => item.closeAt > now)
    if (active.length === 0) {
      await cache.delete('/close-pending')
    } else {
      await cache.put('/close-pending', new Response(JSON.stringify(active)))
    }
    for (const item of items) {
      if (item.closeAt <= now) {
        const reg = await navigator.serviceWorker.ready
        if (reg.active) reg.active.postMessage({ type: 'close-tag', tag: item.tag })
      }
    }
  } catch (_) {}
}

document.addEventListener('DOMContentLoaded', init)
