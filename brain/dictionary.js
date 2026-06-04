function buildAIDictionary(exerciseNames = null) {
  if (!exerciseNames) return []
  const nameSet = new Set(exerciseNames)
  return EXERCISE_DICTIONARY
    .filter(e => nameSet.has(e.es) || nameSet.has(e.en))
    .map(e => ({ es: e.es }))
}
