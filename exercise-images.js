const EXERCISE_DB_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json'

let _dbCache = null

async function loadExerciseDB() {
  if (_dbCache) return _dbCache
  const res = await fetch(EXERCISE_DB_URL)
  if (!res.ok) throw new Error('Failed to load exercise DB')
  _dbCache = await res.json()
  return _dbCache
}

function normalizeName(str) {
  return str.toLowerCase().replace(/[-_/]/g, ' ').replace(/\s+/g, ' ').trim()
}

function tokenizeName(str) {
  return normalizeName(str).split(' ').filter(Boolean)
}

function matchScore(queryTokens, dbName) {
  const dbTokens = tokenizeName(dbName)
  if (dbTokens.length === 0) return 0

  const normQuery = normalizeName(queryTokens.join(' '))
  const normDb = normalizeName(dbName)

  if (normQuery === normDb) return 1

  if (normDb.includes(normQuery)) {
    return 0.8 + (normQuery.length / normDb.length) * 0.19
  }

  let matches = 0
  for (const qt of queryTokens) {
    if (qt.length < 2) continue
    for (const dt of dbTokens) {
      if (dt.includes(qt) || qt.includes(dt)) {
        matches++
        break
      }
    }
  }

  if (queryTokens.length === 0) return 0
  return (matches / queryTokens.length) * 0.8
}

async function findExerciseImageUrl(exerciseName) {
  if (!exerciseName) return null
  try {
    const db = await loadExerciseDB()
    const lookup = normalizeName(exerciseName)
    const translated = EXERCISE_TRANSLATIONS[lookup]
    const searchName = translated || exerciseName

    const queryTokens = tokenizeName(searchName)
    if (queryTokens.length === 0) return null

    let bestScore = 0
    let bestMatch = null

    for (const ex of db) {
      const score = matchScore(queryTokens, ex.name)
      if (score > bestScore) {
        bestScore = score
        bestMatch = ex
      }
    }

    if (bestMatch && bestScore >= 0.3 && bestMatch.images && bestMatch.images.length > 0) {
      return IMG_BASE + bestMatch.images[0]
    }
    return null
  } catch (e) {
    console.warn('findExerciseImageUrl error:', e)
    return null
  }
}
