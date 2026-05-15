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
    const exercise = { id: await generateId(), name, muscle: muscle || '', imgUrl: '', tips: [], alternatives: [] }
    await put('exercises', exercise)
    return exercise
  },

  // ── Exercise Logs ──
  async getLogsForExercise(exerciseId) {
    return getByIndex('exerciseLogs', 'exerciseId', exerciseId)
  },

  async logWeight(exerciseId, weight, units) {
    const dateStr = new Date().toISOString().slice(0, 10)
    const log = {
      id: await generateId(),
      exerciseId,
      date: dateStr,
      weight,
      units,
    }
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
    return put('programs', program)
  },

  async deleteProgram(id) {
    return del('programs', id)
  },

  // ── Settings ──
  async getSettings() {
    const s = await get('settings', 'settings')
    return s || { id: 'settings', activeProgramId: null, currentWeekIdx: 0, units: 'kg', accentColor: '#d4ff3a', userName: 'Pedro' }
  },

  async saveSettings(settings) {
    return put('settings', { ...settings, id: 'settings' })
  },

  // ── CSV Import ──
  async importProgramFromCSV(text) {
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
      name: 'Imported Program',
      weeks,
    }
    await put('programs', program)
    return program
  },

  // ── CSV Import (Exercises) ──
  async importExercisesFromCSV(text) {
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

    for (let i = 1; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i])
      const name = cols[nameIdx]
      if (!name) continue

      const muscle = muscleIdx !== -1 ? (cols[muscleIdx] || '') : ''
      const imgUrl = imageUrlIdx !== -1 ? (cols[imageUrlIdx] || '') : ''

      let tips = []
      if (tipsIdx !== -1 && cols[tipsIdx]) {
        tips = cols[tipsIdx].split('|').map((t) => t.trim()).filter(Boolean)
      }

      let alternatives = []
      if (alternativesIdx !== -1 && cols[alternativesIdx]) {
        alternatives = cols[alternativesIdx].split('||').map((pair) => {
          const [altName = '', altReason = ''] = pair.split('::').map((s) => s.trim())
          return altName ? { name: altName, reason: altReason } : null
        }).filter(Boolean)
      }

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
  },
}
