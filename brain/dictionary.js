function buildAIDictionary(exerciseNames = null) {
  if (!exerciseNames) return []
  const nameSet = new Set(exerciseNames)
  return EXERCISE_DICTIONARY
    .filter(e => nameSet.has(e.es) || nameSet.has(e.en))
    .map(e => ({ es: e.es }))
}

// Full catalog for the import flow so the AI maps each exercise to an EXACT
// dictionary name (respecting modifiers like "inclinado", "sentado", etc.)
// instead of relying on fuzzy matching client-side. Includes the canonical
// Spanish name (es) the AI must emit, plus en + aliases to help it match.
function buildImportDictionary() {
  return EXERCISE_DICTIONARY.map(e => ({
    es: e.es,
    en: e.en,
    aliases: e.aliases || [],
  }))
}
