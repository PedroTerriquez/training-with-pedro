// ── App Shell ──
// Router, state management, event bus

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

  renderShell()

  window.addEventListener('hashchange', handleRoute)
  window.appRefresh = refresh
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
                imgUrl: resolved.imgUrl,
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
                imgUrl: resolved.imgUrl,
              }
            }
          }
          break
        }
      }
      if (progEx) break
    }
  }

  const detailEx = {
    ...exercise,
    sets: progEx?.sets || exercise.sets || 3,
    reps: progEx?.reps || exercise.reps || '10',
    rest: progEx?.rest || exercise.rest || 60,
    logs: logs.sort((a, b) => a.date.localeCompare(b.date)),
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
          return log ? { id: log, exerciseId, date: new Date().toISOString().slice(0, 10), weight, units: savedUnits, sets, reps } : null
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

  renderShell()
}

document.addEventListener('DOMContentLoaded', init)
