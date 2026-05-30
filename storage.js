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

function parseCSVLine(line) {
  const result = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        current += ch
      }
    } else {
      if (ch === '"') {
        inQuotes = true
      } else if (ch === ',') {
        result.push(current.trim())
        current = ''
      } else {
        current += ch
      }
    }
  }
  result.push(current.trim())
  return result
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

  async logWeight(exerciseId, weight, units, sets, reps) {
    const dateStr = new Date().toISOString().slice(0, 10)
    const log = {
      id: await generateId(),
      exerciseId,
      date: dateStr,
      weight,
      units,
    }
    if (sets !== undefined) log.sets = sets
    if (reps !== undefined) log.reps = reps
    return put('exerciseLogs', log)
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
    return s || { id: 'settings', activeProgramId: null, currentWeekIdx: 0, units: 'kg', accentColor: '#d4ff3a', userName: 'Pedro', height: '', weight: '', sex: '', pushServerUrl: '', pushSubscribed: false }
  },

  async saveSettings(settings) {
    return put('settings', { ...settings, id: 'settings' })
  },

  // ── CSV Import ──
  async importProgramFromCSV(text) {
    try {
    const lines = text.trim().split('\n')
    if (lines.length < 2) throw new Error('CSV must have a header row and at least one data row')
    const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase())
    const weekIdx = headers.indexOf('week')
    const dayIdx = headers.indexOf('day')
    const daySubtitleIdx = headers.indexOf('day_subtitle') !== -1 ? headers.indexOf('day_subtitle') : -1
    const durationIdx = headers.indexOf('duration_min') !== -1 ? headers.indexOf('duration_min') : -1
    const exNameIdx = headers.indexOf('exercise_name')
    const muscleIdx = headers.indexOf('muscle')
    const setsIdx = headers.indexOf('sets')
    const repsIdx = headers.indexOf('reps')
    const restIdx = headers.indexOf('rest_sec')

    if (weekIdx === -1 || dayIdx === -1 || exNameIdx === -1) {
      throw new Error('CSV must have at least: week, day, exercise_name')
    }

    const weekMap = {}
    for (let i = 1; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i])
      const weekName = cols[weekIdx] || 'Week 1'
      const dayName = cols[dayIdx] || 'Day'
      const daySubtitle = daySubtitleIdx !== -1 ? (cols[daySubtitleIdx] || '') : ''
      const duration = durationIdx !== -1 ? parseInt(cols[durationIdx]) || 60 : 60
      const exName = cols[exNameIdx] || ''
      const muscle = muscleIdx !== -1 ? (cols[muscleIdx] || '') : ''
      const sets = setsIdx !== -1 ? parseInt(cols[setsIdx]) || 3 : 3
      const reps = repsIdx !== -1 ? (cols[repsIdx] || '10') : '10'
      const rest = restIdx !== -1 ? parseInt(cols[restIdx]) || 60 : 60
      if (!exName) continue

      const exercise = await Storage.findOrCreateExerciseByName(exName, muscle)

      if (!weekMap[weekName]) weekMap[weekName] = {}
      if (!weekMap[weekName][dayName]) {
        weekMap[weekName][dayName] = { subtitle: daySubtitle, duration, exercises: [] }
      }
      weekMap[weekName][dayName].exercises.push({ exerciseId: exercise.id, sets, reps: String(reps), rest })
    }

    const weeks = Object.entries(weekMap).map(([name, days]) => ({
      name,
      subtitle: '',
      tag: '',
      days: Object.entries(days).map(([dayName, data]) => ({
        name: dayName,
        subtitle: data.subtitle,
        duration: data.duration,
        exercises: data.exercises,
      })),
    }))

    const program = {
      id: await generateId(),
      name: 'Programa ' + new Date().toISOString().slice(0, 10),
      weeks,
    }
    await put('programs', program)
    return program
    } catch (err) {
      showToast('❌ ' + err.message, true)
      throw err
    }
  },

  // ── CSV Export (Program) ──
  async exportProgramToCSV(programId) {
    const program = await Storage.getProgram(programId)
    if (!program) throw new Error('Programa no encontrado')
    const exercises = await Storage.getExercises()
    const exMap = {}
    exercises.forEach(e => { exMap[e.id] = e })

    const esc = (v) => {
      const s = String(v == null ? '' : v)
      return s.includes(',') || s.includes('"') || s.includes('\n')
        ? '"' + s.replace(/"/g, '""') + '"'
        : s
    }

    const rows = ['week,day,day_subtitle,duration_min,exercise_name,muscle,sets,reps,rest_sec']

    program.weeks.forEach((week) => {
      week.days.forEach((day) => {
        day.exercises.forEach((ex) => {
          const exData = exMap[ex.exerciseId] || {}
          const name = exData.name || ex.exerciseId || 'Unknown'
          const muscle = exData.muscle || ''
          rows.push([week.name, day.name, day.subtitle || '', day.duration || '', name, muscle, ex.sets, ex.reps, ex.rest].map(esc).join(','))
        })
      })
    })

    return '\uFEFF' + rows.join('\n')
  },

  // ── CSV Import (Exercises) ──
  async importExercisesFromCSV(text) {
    try {
    const lines = text.trim().split('\n')
    if (lines.length < 2) throw new Error('CSV must have a header row and at least one data row')
    const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase())
    const nameIdx = headers.indexOf('name')
    const muscleIdx = headers.indexOf('muscle')
    const imageUrlIdx = headers.indexOf('image_url')
    const tipsIdx = headers.indexOf('tips')
    const alternativesIdx = headers.indexOf('alternatives')

    if (nameIdx === -1) throw new Error('CSV must have a "name" column')

    const existing = await getAll('exercises')
    let created = 0, updated = 0

    const dictReady = typeof findExerciseEntry === 'function'

    for (let i = 1; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i])
      const rawName = cols[nameIdx]
      if (!rawName) continue

      const csvMuscle = muscleIdx !== -1 ? (cols[muscleIdx] || '') : ''
      const csvImgUrl = imageUrlIdx !== -1 ? (cols[imageUrlIdx] || '') : ''

      let csvTips = []
      if (tipsIdx !== -1 && cols[tipsIdx]) {
        csvTips = cols[tipsIdx].split('|').map((t) => t.trim()).filter(Boolean)
      }

      let csvAlts = []
      if (alternativesIdx !== -1 && cols[alternativesIdx]) {
        csvAlts = cols[alternativesIdx].split('||').map((pair) => {
          const [altName = '', altReason = ''] = pair.split('::').map((s) => s.trim())
          return altName ? { name: altName, reason: altReason } : null
        }).filter(Boolean)
      }

      const dictEntry = dictReady ? (findExerciseEntry(rawName) || findExerciseEntryFuzzy(rawName)) : null
      const name = dictEntry ? dictEntry.es : rawName
      const imgUrl = dictEntry ? dictEntry.image : csvImgUrl
      const muscle = csvMuscle || (dictEntry?.muscle || '')
      const tips = csvTips.length > 0 ? csvTips : (dictEntry?.tips ? [...dictEntry.tips] : [])
      const alternatives = csvAlts.length > 0
        ? csvAlts
        : (dictEntry?.alternatives ? dictEntry.alternatives.map((a) => ({ ...a })) : [])

      const match = existing.find((e) => e.name.toLowerCase() === name.toLowerCase())
      if (match) {
        match.muscle = muscle
        match.imgUrl = imgUrl
        match.tips = tips
        match.alternatives = alternatives
        await put('exercises', match)
        updated++
      } else {
        const exercise = { id: await generateId(), name, muscle, imgUrl, tips, alternatives }
        await put('exercises', exercise)
        existing.push(exercise)
        created++
      }
    }

    return { created, updated }
    } catch (err) {
      showToast('❌ ' + err.message, true)
      throw err
    }
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
      exerciseLogs: await getAll('exerciseLogs'),
      settings: await get('settings', 'settings') || null,
      exportedAt: new Date().toISOString(),
    }
    return JSON.stringify(data, null, 2)
  },

  async importLogsAndSettings(jsonStr) {
    const data = JSON.parse(jsonStr)
    if (!data.exerciseLogs) {
      throw new Error('JSON inválido — faltan logs')
    }
    for (const item of data.exerciseLogs) await put('exerciseLogs', item)
    if (data.settings) await put('settings', data.settings)
    return { logs: data.exerciseLogs.length }
  },
}
