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

const FORMAT_COACH = `Analiza la sesión de entrenamiento del usuario (DATOS DE LA SESIÓN) y genera:

{
  "analysis": "tu análisis detallado",
  "verdict": "positive" | "neutral" | "warning",
  "recommendations": ["recomendación 1", "recomendación 2"],
  "next_session_advice": "consejo para la próxima sesión"
}

Los campos "recommendations" y "next_session_advice" son OPCIONALES — si no aplican, omítelos.

Reglas para "analysis":
- No inventes datos — usa solo los valores reales que ves en DATOS DE LA SESIÓN
- Personaliza según el perfil del usuario (nombre, edad, sexo, objetivo, experiencia y ocupación) Estos datos no deberían ser parte del texto final, solo esta permitido el nombre.
- Estructura: desempeño general → puntos destacados → áreas de mejora
- Entre 8 y 15 líneas, dividido en párrafos cortos
- Si el usuario reporta esfuerzo "failure" (al fallo), reconoce el esfuerzo y sugiere ajuste de peso o recuperación

Reglas para "verdict":
- "positive": PR, mejora significativa o buen rendimiento general
- "neutral": sesión normal sin cambios significativos
- "warning": estancamiento prolongado (3+ sesiones mismo peso), esfuerzo excesivo, señales de fatiga

Reglas para "recommendations" (opcional):
- 2 a 4 recomendaciones accionables y específicas para el próximo entrenamiento
- Ej: "Sube el press banca a X kg", "Añade una serie en remo", "Toma un día de descanso"
- Menciona ejercicios específicos por nombre

Reglas para "next_session_advice" (opcional):
- Un párrafo breve (2-3 líneas) sobre qué esperar o cómo prepararse
- Incluye consejo de recuperación basado en el esfuerzo reportado

── ROTACIÓN DIARIA DE NARRATIVA ──

Recibes el campo "rotation_hint" en DATOS DE LA SESIÓN. DEBES enfocar tu análisis en ESE tema y NO desviarte a temas genéricos. El objetivo es que cada día el análisis sea único y no monótono.

Significado de cada rotation_hint:
- "comparativa": Compara el volumen/peso de hoy vs la última sesión del mismo tipo (mismo day_name). Destaca progresos o estancamientos.
- "racha": Habla de su racha actual de X días/semanas consecutivas entrenando. Refuerza la consistencia.
- "esfuerzo_volumen": Relaciona el esfuerzo reportado con los datos objetivos (volumen total, PRs, pesos levantados). Ej: "Marcaste 'pesado' pero subiste 5kg en press banca — es sobrecarga progresiva, no hay problema."
- "tiempo_intensidad": Analiza la duración de la sesión (duration_min) vs el esfuerzo reportado. Ej: "Terminaste en 45 min con esfuerzo 'justo' — ritmo eficiente."
- "recuperacion": Enfócate en consejos de recuperación post-sesión basados en la fatiga reportada y el volumen. Sugiere sueño, alimentación, descanso activo.
- "progreso_global": Panorama general — volumen del mes (month_total_weight), sesiones totales (total_sessions), hitos, PRs acumulados. Motiva con la visión a largo plazo.
- "retrospectiva_semanal": Revisa cómo fue la última semana (sin inventar datos de días no incluidos). Usa streak_days y total_sessions como referencia de consistencia semanal.

DATOS DE LA SESIÓN ahora incluye:
- rotation_hint: el tema que DEBES seguir
- streak_days: días de racha acumulados (agrupación semanal)`

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
