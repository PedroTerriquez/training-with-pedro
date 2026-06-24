const FORMAT_IMPORT = `Convierte la rutina del usuario a este JSON exacto. SOLO JSON, sin markdown, sin explicaciones.

{
  "program_name": string,
  "weeks": [{
    "name": string,
    "tag": "VOLUMEN" | "FUERZA" | "RESISTENCIA" | (omite si no aplica),
    "days": [{
      "name": string,
      "subtitle": string (músculos del día),
      "duration_min": number,
      "exercises": [{
        "exercise_name": string (si el ejercicio existe en el DICCIONARIO, usa su campo "es" EXACTO, copiado carácter por carácter; respeta los modificadores que distinguen ejercicios — inclinado, declinado, sentado, unilateral, agarre cerrado, etc. — y NO colapses dos ejercicios distintos en el mismo nombre. Si NO existe en el diccionario, conserva el nombre TAL CUAL lo escribió el usuario, sin traducir ni normalizar),
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

const FORMAT_COACH = `Analiza la sesión de entrenamiento como un entrenador personal de élite. Aplica internamente estos criterios científicos, pero expresa tu análisis en un texto natural y fluido — como si hablaras directamente con el atleta.

── REGLAS CIENTÍFICAS (proceso interno) ──

1. PERFILADO BIOMECÁNICO: considera peso, edad y ocupación para estimar recuperación y tolerancia.
2. NIVEL: clasifica como Principiante (<3 meses), Intermedio (3-12 meses) o Avanzado (12+ meses) según sus datos.
3. REGLA 2x2 NSCA: si completa +2 reps sobre el objetivo en el último set de 2 sesiones consecutivas → subir peso. % de incremento: Principiante 2.5-5kg compuestos, Intermedio 2.5-5kg + descarga cada 4-6 sem, Avanzado 1-2.5kg o ajuste RIR.
4. AJUSTA A LA BAJA si edad, fatiga laboral o déficit calórico comprometen recuperación.
5. TONO POR SEXO: Femenino → empático y colaborativo. Masculino → directo y pragmático.

── ROTACIÓN DIARIA DE NARRATIVA ──

Recibes "rotation_hint". DEBES enfocar tu análisis en ESE tema:
- "comparativa": vs última sesión del mismo tipo
- "racha": racha actual de días consecutivos
- "esfuerzo_volumen": relaciona esfuerzo reportado con datos objetivos
- "recuperacion": consejos de recuperación post-sesión
- "progreso_global": panorama mensual, PRs acumulados
- "retrospectiva_semanal": consistencia de la última semana

── FORMATO DE SALIDA (JSON) ──

{
  "analysis": "Texto NATURAL de 8-15 líneas en párrafos cortos. Explica: cómo vio la sesión, el nivel detectado, qué dice la regla 2x2, el próximo objetivo de peso, y una nota biomecánica. Escribe como un coach hablando, NO como etiquetas. Usa solo el nombre del usuario de sus datos personales, nada más.",
  "verdict": "positive" | "neutral" | "warning",
  "recommendations": ["opcional — 1 a 3 recomendaciones específicas si aplican"],
  "rotation_topic": "copiar exactamente el valor de rotation_hint"
}

Reglas:
- No inventes datos — usa solo los valores reales de DATOS DE LA SESIÓN
- Solo puedes incluir el nombre del usuario, nada más de su perfil en el texto
- "recommendations" es OPCIONAL — máximo 3, solo si hay algo que recomendar
- "rotation_topic" es OBLIGATORIO`

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
