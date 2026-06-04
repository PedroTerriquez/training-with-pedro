const FORMAT_IMPORT = `Convierte la rutina del usuario a este JSON exacto. SOLO JSON, sin markdown, sin explicaciones.

{
  "program_name": string,
  "weeks": [{
    "name": string,
    "tag": "VOLUMEN" | "FUERZA" | "RESISTENCIA" | "",
    "days": [{
      "name": string,
      "subtitle": string (músculos del día),
      "duration_min": number,
      "exercises": [{
        "exercise_name": string (español estándar),
        "muscle": string (grupo muscular principal),
        "sets": number (default 3),
        "reps": string (rango "8-12" o número "10"),
        "rest_sec": number (default 90),
        "load_weight": number (solo si el usuario menciona peso, si no OMITIR),
        "units": "kg" | "lb" (solo si load_weight presente)
      }]
    }]
  }]
}`

const FORMAT_COACH = `Analiza la sesión de entrenamiento del usuario (DATOS DE LA SESIÓN) y genera:

{
  "analysis": "tu análisis",
  "verdict": "positive" | "neutral" | "warning"
}

Reglas para "analysis":
- Menciona EXACTAMENTE los valores reales de la sesión (pesos, repeticiones, PRs, estancamientos)
- NO inventes datos — usa solo lo que ves en DATOS DE LA SESIÓN
- Sé específico: si levanta poco para su perfil o demasiado, dímelo directamente
- Personaliza según el perfil del usuario (nombre, edad, sexo, objetivo, experiencia)
- 2 a 5 líneas máximo

Reglas para "verdict":
- "positive": PR, mejora o buen rendimiento
- "neutral": sesión normal sin cambios significativos
- "warning": estancamiento, esfuerzo excesivo o señales de fatiga`

const FORMAT_PROGRAM_COACH = `Recibes: PROGRAMA ACTUAL (JSON) + PERFIL DEL USUARIO + PREGUNTA DEL USUARIO + DICCIONARIO DE EJERCICIOS

Si el usuario PIDE UNA MODIFICACIÓN (cambiar/agregar/quitar ejercicios, ajustar series/reps, reestructurar):
  Devuelve el programa COMPLETO modificado:
  {
    "program_name": string,
    "weeks": [{
      "name": string, "tag": "VOLUMEN" | "FUERZA" | "RESISTENCIA" | "",
      "days": [{
        "name": string,
        "subtitle": string,
        "duration_min": number,
        "exercises": [{
          "exercise_name": string,
          "muscle": string,
          "sets": number,
          "reps": string,
          "rest_sec": number
        }]
      }]
    }]
  }
  - Incluye TODOS los días y ejercicios, no solo los modificados
  - Usa nombres del DICCIONARIO cuando sea posible

Si el usuario HACE UNA PREGUNTA o PIDE REVISIÓN:
  Responde SOLO texto plano:
  - Si encuentras errores (desequilibrio muscular, volumen excesivo, frecuencia incorrecta), menciónalos
  - Si NO hay errores y la rutina está bien estructurada, DILO. No inventes problemas solo para justificar la revisión.
  - Da recomendaciones específicas basadas en evidencia científica
  - Si todo está bien, puedes sugerir progresiones o variaciones menores pero sin forzar cambios innecesarios
  - Hasta ~10 líneas si es necesario para ser claro`

let _importPrompt, _coachPrompt, _programCoachPrompt

function buildImportPrompt() {
  if (!_importPrompt) _importPrompt = `${AI_ROLE}\n\n${AI_SECURITY}\n\n${FORMAT_IMPORT}`
  return _importPrompt
}

function buildCoachPrompt() {
  if (!_coachPrompt) _coachPrompt = `${AI_ROLE}\n\n${FORMAT_COACH}`
  return _coachPrompt
}

function buildProgramCoachPrompt() {
  if (!_programCoachPrompt) _programCoachPrompt = `${AI_ROLE}\n\n${FORMAT_PROGRAM_COACH}`
  return _programCoachPrompt
}
