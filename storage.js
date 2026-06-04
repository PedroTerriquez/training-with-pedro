function showToast(message, isError = false) {
  const existing = document.getElementById('backup-toast')
  if (existing) existing.remove()
  const toast = document.createElement('div')
  toast.id = 'backup-toast'
  toast.textContent = message
  toast.style.cssText = `position:fixed;bottom:100px;left:50%;transform:translateX(-50%);padding:10px 18px;border-radius:12px;z-index:9999;font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:500;background:${isError ? '#2a0f0f' : '#1a1a1a'};color:${isError ? '#ff6b6b' : '#fafafa'};border:0.5px solid ${isError ? 'rgba(255,107,107,0.25)' : 'rgba(255,255,255,0.08)'};backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);max-width:80%;text-align:center;transition:opacity 0.3s;`
  document.body.appendChild(toast)
  setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300) }, 3500)
}

const BACKUP_PREFIX = 'idb_backup_'

async function backupAll() {
  try {
    const data = {
      exercises: await getAll('exercises'),
      exerciseLogs: await getAll('exerciseLogs'),
      programs: await getAll('programs'),
      settings: [(await get('settings', 'settings'))].filter(Boolean),
    }
    for (const key of Object.keys(data)) {
      localStorage.setItem(BACKUP_PREFIX + key, JSON.stringify(data[key]))
    }
    localStorage.setItem('hasUsedApp', 'true')
    localStorage.setItem('lastBackupDate', new Date().toISOString())
  } catch (e) {
    showToast('⚠️ Backup automático falló: ' + e.message, true)
  }
}

async function restoreFromBackup() {
  const stores = ['exercises', 'exerciseLogs', 'programs', 'settings']
  for (const store of stores) {
    const raw = localStorage.getItem(BACKUP_PREFIX + store)
    if (!raw) continue
    try {
      const items = JSON.parse(raw)
      for (const item of items) {
        await put(store, item)
      }
    } catch (e) {
      showToast('⚠️ No se pudo restaurar ' + store + ': ' + e.message, true)
    }
  }
  showToast('✅ Datos recuperados desde backup automático')
}

const Storage = {
  backupAll,
  restoreFromBackup,
  // ── Exercises ──
  async getExercises() {
    return getAll('exercises')
  },

  async getExercise(id) {
    return get('exercises', id)
  },

  async saveExercise(exercise) {
    return put('exercises', exercise)
  },

  async deleteExercise(id) {
    const logs = await getByIndex('exerciseLogs', 'exerciseId', id)
    const programs = await getAll('programs')
    const db = await openDB()
    const tx = db.transaction(['exercises', 'exerciseLogs', 'programs'], 'readwrite')
    tx.objectStore('exercises').delete(id)
    for (const log of logs) {
      tx.objectStore('exerciseLogs').delete(log.id)
    }
    for (const prog of programs) {
      let changed = false
      for (const week of prog.weeks) {
        for (const day of week.days) {
          const before = day.exercises.length
          day.exercises = day.exercises.filter((e) => e.exerciseId !== id)
          if (day.exercises.length !== before) changed = true
        }
      }
      if (changed) tx.objectStore('programs').put(prog)
    }
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => { resolve(); db.close() }
      tx.onerror = () => { reject(tx.error); db.close() }
    })
  },

  async findOrCreateExerciseByName(name, muscle) {
    const all = await getAll('exercises')
    const match = all.find((e) => e.name.toLowerCase() === name.toLowerCase())
    if (match) return match
    const dictEntry = typeof findExerciseEntry === 'function' ? (findExerciseEntry(name) || findExerciseEntryFuzzy(name)) : null
    const imgUrl = dictEntry?.image || ''
    const gifUrl = dictEntry?.gif || ''
    const exercise = { id: await generateId(), name, muscle: muscle || dictEntry?.muscle || '', imgUrl, gifUrl, tips: dictEntry?.tips ? [...dictEntry.tips] : [], alternatives: dictEntry?.alternatives ? dictEntry.alternatives.map(a => ({...a})) : [] }
    await put('exercises', exercise)
    return exercise
  },

  // ── Exercise Logs ──
  async getLogsForExercise(exerciseId) {
    return getByIndex('exerciseLogs', 'exerciseId', exerciseId)
  },

  async logWeight(exerciseId, weight, units, sets, reps, dateStr) {
    dateStr = dateStr || new Date().toISOString().slice(0, 10)
    const all = await getByIndex('exerciseLogs', 'exerciseId', exerciseId)
    const existing = all.find(l => l.date === dateStr)
    const log = {
      id: existing ? existing.id : await generateId(),
      exerciseId,
      date: dateStr,
      weight,
      units,
    }
    if (sets !== undefined) log.sets = sets
    if (reps !== undefined) log.reps = reps
    return put('exerciseLogs', log)
  },

  async getAllLogs() {
    return getAll('exerciseLogs')
  },

  async getLogsForDate(dateStr) {
    const all = await getAll('exerciseLogs')
    return all.filter((l) => l.date === dateStr)
  },

  // ── Programs ──
  async getPrograms() {
    return getAll('programs')
  },

  async getProgram(id) {
    return get('programs', id)
  },

  async saveProgram(program) {
    await put('programs', program)
    backupAll()
  },

  async deleteProgram(id) {
    return del('programs', id)
  },

  // ── Settings ──
  async getSettings() {
    const s = await get('settings', 'settings')
    return s || { id: 'settings', activeProgramId: null, currentWeekIdx: 0, units: 'kg', accentColor: '#d4ff3a', userName: 'Pedro', height: '', weight: '', sex: '', age: '', goal: '', experience: '', occupation: '', pushServerUrl: '', pushSubscribed: false, lastCoachAnalysis: null, lastUpdate: '', sessionState: null, rescheduleWeekOrder: {} }
  },

  async saveSettings(settings) {
    return put('settings', { ...settings, id: 'settings' })
  },

  async saveCoachAnalysis(analysis) {
    const s = await Storage.getSettings()
    s.lastCoachAnalysis = analysis
    await Storage.saveSettings(s)
  },

  async getCoachAnalysis() {
    const s = await Storage.getSettings()
    return s.lastCoachAnalysis || null
  },

  // ── One-time migration: apply dictionary to existing IndexedDB exercises ──
  // Normal mode (force=false): only fill empty fields, never overwrite user data.
  // Force mode   (force=true): overwrite ALL fields from dictionary entry.
  async migrateExercisesToDictionary({ force = false } = {}) {
    const FLAG = 'dict_migration_v1'
    if (!force && localStorage.getItem(FLAG) === 'done') return { migrated: 0, skipped: 0, total: 0, alreadyDone: true }
    if (typeof findExerciseEntry !== 'function') return { migrated: 0, skipped: 0, total: 0, dictMissing: true }

    const exercises = await getAll('exercises')
    let migrated = 0
    let skipped = 0

    for (const ex of exercises) {
      const dictEntry = findExerciseEntry(ex.name) || findExerciseEntryFuzzy(ex.name)
      if (!dictEntry) { skipped++; continue }

      let changed = false

      if (force || ex.name !== dictEntry.es) {
        if (ex.name !== dictEntry.es) { ex.name = dictEntry.es; changed = true }
      }
      if ((force || !ex.imgUrl) && dictEntry.image) {
        ex.imgUrl = dictEntry.image; changed = true
      }
      if ((force || !ex.gifUrl) && dictEntry.gif) {
        ex.gifUrl = dictEntry.gif; changed = true
      }
      if ((force || !ex.muscle) && dictEntry.muscle) {
        ex.muscle = dictEntry.muscle; changed = true
      }
      if ((force || !ex.tips || ex.tips.length === 0) && dictEntry.tips && dictEntry.tips.length > 0) {
        ex.tips = [...dictEntry.tips]; changed = true
      }
      if ((force || !ex.alternatives || ex.alternatives.length === 0) && dictEntry.alternatives && dictEntry.alternatives.length > 0) {
        ex.alternatives = dictEntry.alternatives.map((a) => ({ ...a })); changed = true
      }
      if (ex.alternatives && ex.alternatives.length > 0) {
        for (const alt of ex.alternatives) {
          const altDict = findExerciseEntry(alt.name)
          if (altDict && alt.name !== altDict.es) {
            alt.name = altDict.es; changed = true
          }
        }
      }

      if (changed) {
        await put('exercises', ex)
        migrated++
      }
    }

    localStorage.setItem(FLAG, 'done')
    console.info(`[dictionary migration] migrated=${migrated} skipped=${skipped} total=${exercises.length}`)
    return { migrated, skipped, total: exercises.length }
  },

  // ── JSON Export/Import (cross-context migration) ──
  async exportLogsAndSettings() {
    const data = {
      exercises: await getAll('exercises'),
      programs: await getAll('programs'),
      exerciseLogs: await getAll('exerciseLogs'),
      settings: await get('settings', 'settings') || null,
      exportedAt: new Date().toISOString(),
    }
    return JSON.stringify(data, null, 2)
  },

  async importLogsAndSettings(jsonStr) {
    const data = JSON.parse(jsonStr)
    if (!data.exerciseLogs && !data.exercises && !data.programs) {
      throw new Error('JSON inválido — no contiene datos')
    }
    if (data.exercises) for (const item of data.exercises) await put('exercises', item)
    if (data.programs) for (const item of data.programs) await put('programs', item)
    if (data.exerciseLogs) for (const item of data.exerciseLogs) await put('exerciseLogs', item)
    if (data.settings) await put('settings', data.settings)
    return {
      exercises: (data.exercises || []).length,
      programs: (data.programs || []).length,
      logs: (data.exerciseLogs || []).length,
    }
  },
}
