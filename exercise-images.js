function getExerciseGifUrl(exerciseName) {
  if (!exerciseName) return null
  const e = findExerciseEntry(exerciseName) || findExerciseEntryFuzzy(exerciseName)
  return e && e.gif ? e.gif : null
}

window.getExerciseGifUrl = getExerciseGifUrl
