// data.js — Pedro's training program
// 3 rotating weeks, Push/Pull/Legs split, Sunday rest

const TIPS_LIB = {
  bench: [
    "Drive your feet into the floor, retract your shoulder blades",
    "Bar path: from over the shoulders down to the lower chest",
    "Squeeze the bar to engage triceps and lats",
    "Keep wrists stacked over elbows",
  ],
  squat: [
    "Brace your core like you're about to be punched",
    "Knees track over toes — don't let them cave inward",
    "Break at hips and knees simultaneously",
    "Drive through midfoot, not heels alone",
  ],
  deadlift: [
    "Bar over midfoot, shoulders just in front of bar",
    "Take the slack out of the bar before you pull",
    "Push the floor away — don't yank the bar up",
    "Lats engaged: imagine squeezing oranges in your armpits",
  ],
  pullup: [
    "Initiate by depressing your shoulder blades down",
    "Drive elbows down and back, not just up",
    "Full hang at the bottom, chin clearly over the bar",
    "Don't kip — controlled negative on the way down",
  ],
  ohp: [
    "Glutes squeezed, ribs tucked — no excessive arching",
    "Bar starts on the front delts, finishes overhead",
    "Press up and slightly back as you clear the head",
    "Lock out with biceps near the ears",
  ],
  row: [
    "Hinge to ~45° — don't stand up with each rep",
    "Pull to the lower chest / upper abs",
    "Elbows track close to the torso",
    "Pause briefly at the top, control the negative",
  ],
  curl: [
    "Keep elbows pinned to your sides",
    "Don't swing — slow eccentric, 2-3 seconds down",
    "Supinate the wrist at the top for full contraction",
    "Stop just short of locking out at the bottom",
  ],
  pushdown: [
    "Elbows glued to your ribs — no flaring",
    "Squeeze the lockout for a 1-second hold",
    "Lean forward slightly, keep core engaged",
    "Control the eccentric — don't let the stack drop",
  ],
  lateral: [
    "Lead with the elbows, not the hands",
    "Slight forward lean engages side delts more",
    "Stop at shoulder height — going higher trains traps",
    "Use a light weight you can control for full ROM",
  ],
  rdl: [
    "Push your hips back, knees soft (not bent)",
    "Bar drags down the thighs — keep it close",
    "Stop where you feel your hamstrings, not the floor",
    "Drive hips forward to stand, not pull with the back",
  ],
  hipthrust: [
    "Shoulder blades on the bench, chin tucked",
    "Squeeze glutes hard at the top — don't overarch",
    "Drive through heels, feet flat",
    "Pause 1s at lockout each rep",
  ],
  default: [
    "Control the eccentric (lowering) — 2 seconds minimum",
    "Full range of motion beats heavy partials",
    "Breathe out on the exertion, in on the return",
    "Leave 1-2 reps in reserve unless going for a PR",
  ],
};

function ex(id, name, muscle, sets, reps, rest, tipsKey, alts, history) {
  return {
    id, name, muscle, sets, reps, rest,
    tips: TIPS_LIB[tipsKey] || TIPS_LIB.default,
    alternatives: alts,
    history: history || [],
  };
}

// Helper: build mock history (last 6 sessions)
function hist(top, step = 2.5) {
  const dates = ["02 abr", "09 abr", "16 abr", "23 abr", "30 abr", "07 may"];
  return dates.map((d, i) => ({
    date: d,
    top: +(top - (5 - i) * step).toFixed(1),
    sets: [
      { w: +(top - (5 - i) * step).toFixed(1), r: 8 },
      { w: +(top - (5 - i) * step).toFixed(1), r: 7 },
      { w: +(top - (5 - i) * step - 2.5).toFixed(1), r: 6 },
    ],
  }));
}

const PROGRAM = {
  units: "kg",
  weeks: [
    {
      id: "A",
      name: "Semana A",
      subtitle: "Volumen",
      tag: "VOLUMEN",
      accent: "#d4ff3a",
      days: [
        {
          name: "Empuje",
          subtitle: "Pecho · Hombros · Tríceps",
          duration: 65,
          exercises: [
            ex("a-push-1", "Press de banca con barra", "Pecho", 4, "6-8", 180, "bench",
              [
                { name: "Press de banca con mancuernas", reason: "Si te molesta el hombro — las mancuernas permiten rotación natural" },
                { name: "Press de pecho en máquina", reason: "Sin spotter / cansado — el patrón fijo es más seguro" },
                { name: "Push-up con peso", reason: "Sin barra disponible" },
              ], hist(82.5)),
            ex("a-push-2", "Press militar", "Hombros", 4, "6-8", 150, "ohp",
              [
                { name: "Press de hombros sentado con mancuernas", reason: "¿Molestias lumbares? Siéntate y apóyate" },
                { name: "Press de hombros en máquina", reason: "Plano estable si estás inestable de pie" },
                { name: "Arnold press", reason: "Más deltoides anterior + rango" },
              ], hist(50)),
            ex("a-push-3", "Press inclinado con mancuernas", "Pecho superior", 3, "8-10", 120, "bench",
              [
                { name: "Press inclinado con barra", reason: "Quieres ir más pesado con recorrido de barra" },
                { name: "Press inclinado en Smith", reason: "Sin spotter, quieres estabilidad" },
                { name: "Push-up declinado", reason: "Sin mancuernas / día de peso corporal" },
              ], hist(28)),
            ex("a-push-4", "Aperturas en polea (media)", "Pecho", 3, "12-15", 90, "default",
              [
                { name: "Pec deck", reason: "Estación de poleas ocupada" },
                { name: "Aperturas con mancuernas", reason: "Sin poleas — versión en banco plano" },
                { name: "Cruce con banda elástica", reason: "Viaje / entreno en casa" },
              ], hist(22)),
            ex("a-push-5", "Extensión de tríceps en polea", "Tríceps", 3, "10-12", 75, "pushdown",
              [
                { name: "Press francés con barra Z", reason: "Alternativa con peso libre" },
                { name: "Extensión overhead en polea", reason: "Apunta más al cabezal largo" },
                { name: "Press de banca agarre cerrado", reason: "Opción compuesta" },
              ], hist(35)),
          ],
        },
        {
          name: "Tirón",
          subtitle: "Espalda · Bíceps · Deltoides post.",
          duration: 70,
          exercises: [
            ex("a-pull-1", "Peso muerto convencional", "Espalda", 3, "5", 240, "deadlift",
              [
                { name: "Peso muerto con barra trap", reason: "Menos carga lumbar" },
                { name: "Peso muerto sumo", reason: "Mejor con fémur largo / brazos cortos" },
                { name: "Peso muerto rumano", reason: "Si la lumbar está fatigada" },
              ], hist(140, 5)),
            ex("a-pull-2", "Dominada", "Dorsales", 4, "AMRAP", 150, "pullup",
              [
                { name: "Dominada asistida", reason: "Aún no logras reps completas" },
                { name: "Jalón al pecho", reason: "Sin barra disponible" },
                { name: "Remo invertido", reason: "Construyendo hacia la primera dominada" },
              ], hist(8, 0.5)),
            ex("a-pull-3", "Remo con barra (Pendlay)", "Espalda media", 4, "6-8", 150, "row",
              [
                { name: "Remo con apoyo en pecho", reason: "Cuida la zona lumbar" },
                { name: "Remo en polea sentado", reason: "Quieres un patrón más estable" },
                { name: "Meadows row", reason: "Unilateral, enfocado a dorsales" },
              ], hist(75)),
            ex("a-pull-4", "Face pull", "Deltoides posterior", 3, "12-15", 75, "default",
              [
                { name: "Pec deck invertido", reason: "Cuerda de polea ocupada" },
                { name: "Aperturas inversas con mancuernas", reason: "Opción con peso libre" },
                { name: "Apertura con banda", reason: "Calentamiento o sin equipo" },
              ], hist(25)),
            ex("a-pull-5", "Curl martillo", "Bíceps / Braquial", 3, "10-12", 75, "curl",
              [
                { name: "Curl martillo cruzado", reason: "Más énfasis en braquial" },
                { name: "Curl martillo con cuerda", reason: "Tensión constante con polea" },
                { name: "Curl invertido", reason: "Enfoque antebrazo" },
              ], hist(16)),
          ],
        },
        {
          name: "Piernas",
          subtitle: "Cuádriceps · Femorales · Glúteos",
          duration: 75,
          exercises: [
            ex("a-legs-1", "Sentadilla trasera", "Cuádriceps", 4, "6-8", 210, "squat",
              [
                { name: "Sentadilla frontal", reason: "Más dominante en cuádriceps, menos carga en espalda" },
                { name: "Hack squat", reason: "Patrón fijo — menos demanda de estabilizadores" },
                { name: "Sentadilla goblet", reason: "Calentamiento o sin rack" },
              ], hist(120, 5)),
            ex("a-legs-2", "Peso muerto rumano", "Femorales", 3, "8-10", 150, "rdl",
              [
                { name: "Peso muerto piernas rígidas", reason: "Más estiramiento de femoral" },
                { name: "Buenos días", reason: "Quieres bajar carga en la espalda" },
                { name: "RDL a una pierna", reason: "Atender desequilibrios" },
              ], hist(95, 2.5)),
            ex("a-legs-3", "Prensa de piernas", "Cuádriceps", 3, "10-12", 120, "default",
              [
                { name: "Hack squat en máquina", reason: "Prensa ocupada" },
                { name: "Sentadilla búlgara", reason: "Enfoque unilateral" },
                { name: "Zancada caminando con mancuernas", reason: "Sin máquina disponible" },
              ], hist(180, 5)),
            ex("a-legs-4", "Curl femoral acostado", "Femorales", 3, "10-12", 90, "default",
              [
                { name: "Curl femoral sentado", reason: "Diferente ángulo de estiramiento" },
                { name: "Curl nórdico", reason: "Sin máquina — opción peso corporal" },
                { name: "Glute-ham raise", reason: "Compuesto cadena posterior" },
              ], hist(45)),
            ex("a-legs-5", "Elevación de pantorrilla de pie", "Pantorrillas", 4, "12-15", 60, "default",
              [
                { name: "Elevación de pantorrilla sentado", reason: "Apunta más al sóleo" },
                { name: "Elevación de pantorrilla burro", reason: "Estira más los gastrocnemios" },
                { name: "Elevación de pantorrilla a una pierna", reason: "Unilateral, sin máquina" },
              ], hist(60)),
          ],
        },
        {
          name: "Empuje",
          subtitle: "Pecho sup. · Deltoides · Brazos",
          duration: 65,
          exercises: [
            ex("a-push2-1", "Press inclinado con barra", "Pecho superior", 4, "6-8", 180, "bench",
              [
                { name: "Press inclinado con mancuernas", reason: "Variación amable con el hombro" },
                { name: "Press inclinado en Smith", reason: "No spotter" },
                { name: "Larsen press", reason: "Quieres eliminar el empuje de piernas" },
              ], hist(65)),
            ex("a-push2-2", "Press de hombros sentado con mancuernas", "Hombros", 4, "8-10", 120, "ohp",
              [
                { name: "Standing OHP", reason: "Más activación del core" },
                { name: "Arnold press", reason: "Mayor rango, los tres cabezales del deltoides" },
                { name: "Press de hombros en máquina", reason: "Drop sets / fatiga" },
              ], hist(26)),
            ex("a-push2-3", "Fondo con peso", "Pecho inferior", 3, "8-10", 120, "default",
              [
                { name: "Fondo en banco", reason: "Estación de fondos ocupada" },
                { name: "Press de banca declinado", reason: "Patrón similar" },
                { name: "Push-up agarre cerrado", reason: "Sin equipo" },
              ], hist(20)),
            ex("a-push2-4", "Elevación lateral", "Deltoides lateral", 4, "12-15", 75, "lateral",
              [
                { name: "Elevación lateral en polea", reason: "Tensión constante" },
                { name: "Elevación lateral en máquina", reason: "Mancuernas ocupadas" },
                { name: "Elevación lateral inclinado", reason: "Una mano, rango estirado" },
              ], hist(10)),
            ex("a-push2-5", "Extensión de tríceps overhead", "Tríceps", 3, "10-12", 75, "pushdown",
              [
                { name: "Press francés", reason: "Alternativa con peso libre" },
                { name: "Pushdown con cuerda", reason: "Cambio rápido" },
                { name: "Push-up diamante", reason: "Día sin equipo" },
              ], hist(30)),
          ],
        },
        {
          name: "Tirón",
          subtitle: "Anchura · Bíceps · Trapecios",
          duration: 70,
          exercises: [
            ex("a-pull2-1", "Jalón al pecho (agarre ancho)", "Dorsales", 4, "8-10", 120, "pullup",
              [
                { name: "Dominada", reason: "Equivalente con peso corporal" },
                { name: "Jalón agarre neutro", reason: "Agarre amable con el hombro" },
                { name: "Jalón con brazo recto", reason: "Aísla más los dorsales" },
              ], hist(70)),
            ex("a-pull2-2", "Remo en polea sentado", "Espalda media", 4, "8-10", 120, "row",
              [
                { name: "Remo T", reason: "Ángulo diferente" },
                { name: "Remo a una mano con mancuerna", reason: "Enfoque unilateral" },
                { name: "Remo con apoyo en pecho", reason: "Forma estricta" },
              ], hist(70)),
            ex("a-pull2-3", "Encogimiento de trapecios", "Trapecios", 3, "10-12", 90, "default",
              [
                { name: "Encogimiento en Smith", reason: "Más carga" },
                { name: "Encogimiento agarre arrancada", reason: "Rango diferente" },
                { name: "Paseo del granjero", reason: "Alternativa funcional" },
              ], hist(90)),
            ex("a-pull2-4", "Pec deck invertido", "Deltoides posterior", 3, "12-15", 75, "default",
              [
                { name: "Face pull", reason: "Variación con polea" },
                { name: "Aperturas inversas inclinado", reason: "Opción con peso libre" },
                { name: "Y-raise en polea", reason: "Enfoque trapecio inferior" },
              ], hist(45)),
            ex("a-pull2-5", "Curl predicador", "Bíceps", 3, "10-12", 75, "curl",
              [
                { name: "Curl araña", reason: "Posición más estricta" },
                { name: "Curl inclinado con mancuernas", reason: "Bíceps estirado" },
                { name: "Curl de concentración", reason: "Finalizador mente-músculo" },
              ], hist(20)),
          ],
        },
        {
          name: "Piernas",
          subtitle: "Glúteos · Femorales · Cuádriceps",
          duration: 70,
          exercises: [
            ex("a-legs2-1", "Hip thrust", "Glúteos", 4, "8-10", 150, "hipthrust",
              [
                { name: "Puente de glúteo", reason: "Sin banco disponible" },
                { name: "Hip thrust a una pierna", reason: "Enfoque unilateral" },
                { name: "Pull-through en polea", reason: "Variación de bisagra" },
              ], hist(110, 5)),
            ex("a-legs2-2", "Sentadilla frontal", "Cuádriceps", 3, "6-8", 180, "squat",
              [
                { name: "Sentadilla goblet", reason: "Más ligero / sin rack" },
                { name: "Hack squat", reason: "Patrón fijo dominante en cuádriceps" },
                { name: "Sentadilla Zercher", reason: "Quieres retar el core" },
              ], hist(85)),
            ex("a-legs2-3", "Sentadilla búlgara", "Cuádriceps / Glúteos", 3, "10/leg", 120, "default",
              [
                { name: "Zancada caminando", reason: "Más dinámico" },
                { name: "Subidas al cajón", reason: "Variación amable con la rodilla" },
                { name: "Zancada inversa", reason: "Menos carga en rodillas" },
              ], hist(20, 2.5)),
            ex("a-legs2-4", "Extensión de cuádriceps", "Cuádriceps", 3, "12-15", 75, "default",
              [
                { name: "Sentadilla sissy", reason: "Quemador de cuádriceps con peso corporal" },
                { name: "Sentadilla ciclista", reason: "Talones elevados, enfoque cuádriceps" },
                { name: "Nórdico invertido", reason: "Sin máquina" },
              ], hist(55)),
            ex("a-legs2-5", "Elevación de pantorrilla sentado", "Sóleo", 4, "15-20", 60, "default",
              [
                { name: "Elevación de pantorrilla de pie", reason: "Enfoque gastrocnemios" },
                { name: "Single-Leg Calf Raise", reason: "Atender desequilibrios" },
                { name: "Pantorrilla en prensa", reason: "Alternativa con máquina" },
              ], hist(45)),
          ],
        },
        { name: "Descanso", subtitle: "Recuperación", exercises: [] },
      ],
    },

    {
      id: "B",
      name: "Semana B",
      subtitle: "Fuerza",
      tag: "FUERZA",
      accent: "#ff5a36",
      days: [
        { name: "Empuje", subtitle: "Pecho pesado", duration: 60, exercises: [] }, // mirrors A with heavier loads
        { name: "Tirón", subtitle: "Espalda pesada", duration: 65, exercises: [] },
        { name: "Piernas", subtitle: "Sentadilla pesada", duration: 70, exercises: [] },
        { name: "Empuje", subtitle: "Accesorios superior", duration: 55, exercises: [] },
        { name: "Tirón", subtitle: "Anchura + brazos", duration: 60, exercises: [] },
        { name: "Piernas", subtitle: "Cadena posterior", duration: 65, exercises: [] },
        { name: "Descanso", subtitle: "Recuperación", exercises: [] },
      ],
    },

    {
      id: "C",
      name: "Semana C",
      subtitle: "Descarga",
      tag: "DESCARGA",
      accent: "#9bd1ff",
      days: [
        { name: "Empuje", subtitle: "Técnica ligera", duration: 45, exercises: [] },
        { name: "Tirón", subtitle: "Técnica ligera", duration: 45, exercises: [] },
        { name: "Piernas", subtitle: "Técnica ligera", duration: 50, exercises: [] },
        { name: "Empuje", subtitle: "Enfoque movilidad", duration: 45, exercises: [] },
        { name: "Tirón", subtitle: "Enfoque movilidad", duration: 45, exercises: [] },
        { name: "Piernas", subtitle: "Enfoque movilidad", duration: 50, exercises: [] },
        { name: "Descanso", subtitle: "Recuperación", exercises: [] },
      ],
    },
  ],
};

// Mirror week A exercises into B & C with load adjustments
function adjustHist(history, multiplier) {
  return history.map(s => ({
    date: s.date,
    top: +(s.top * multiplier).toFixed(1),
    sets: s.sets.map(set => ({ w: +(set.w * multiplier).toFixed(1), r: set.r })),
  }));
}
PROGRAM.weeks[1].days.forEach((d, i) => {
  const src = PROGRAM.weeks[0].days[i];
  if (d.name === "Descanso") return;
  d.exercises = src.exercises.map(e => ({
    ...e,
    id: e.id.replace("a-", "b-"),
    sets: 5, reps: "3-5",
    history: adjustHist(e.history, 1.08),
  }));
});
PROGRAM.weeks[2].days.forEach((d, i) => {
  const src = PROGRAM.weeks[0].days[i];
  if (d.name === "Descanso") return;
  d.exercises = src.exercises.map(e => ({
    ...e,
    id: e.id.replace("a-", "c-"),
    sets: 2, reps: "10-12",
    history: adjustHist(e.history, 0.6),
  }));
});

const RECOVERY_TIPS = [
  { icon: "💧", title: "Hidrátate", body: "3-4 L de agua. Bonus: una pizca de sal con el desayuno." },
  { icon: "😴", title: "Duerme 7-9 horas", body: "El crecimiento pasa aquí, no en el gimnasio." },
  { icon: "🚶", title: "Caminata suave", body: "30-45 min a ritmo conversacional. Mejora la circulación." },
  { icon: "🧘", title: "Movilidad", body: "10 minutos — caderas, columna torácica, hombros. No te la saltes." },
  { icon: "🍳", title: "Come suficiente", body: "Alcanza tu meta de proteína. La recuperación necesita combustible." },
];

// ─────────────────────────────────────────────────────────────
// Calentamientos por día (Empuje / Tirón / Piernas)
// ─────────────────────────────────────────────────────────────
const WARMUPS = {
  Empuje: {
    duration: 7,
    movements: [
      { name: "Cinta o bici",               detail: "5 min · ritmo suave, inclinación ligera" },
      { name: "Círculos de brazos",         detail: "30s adelante · 30s atrás" },
      { name: "Band pull-aparts",           detail: "2 × 15 reps · banda ligera" },
      { name: "Dislocaciones de hombro",    detail: "2 × 10 reps · banda o palo de escoba" },
      { name: "Barra vacía en banca",       detail: "1 × 10 reps · siente el patrón" },
    ],
  },
  Tirón: {
    duration: 7,
    movements: [
      { name: "Cinta o remo",               detail: "5 min · ritmo suave" },
      { name: "Gato-vaca",                  detail: "10 reps · lento" },
      { name: "Pull escapular",             detail: "2 × 10 reps · suspensión muerta" },
      { name: "Remo con banda",             detail: "2 × 15 reps · jala al pecho" },
      { name: "Negativas de dominada",      detail: "1 × 5 reps · bajada de 3s" },
    ],
  },
  Piernas: {
    duration: 8,
    movements: [
      { name: "Bici o escalera",            detail: "5 min · ritmo moderado" },
      { name: "Sentadillas con peso corporal", detail: "2 × 15 reps · lento" },
      { name: "Patadas de pierna",          detail: "10 en cada dirección · por pierna" },
      { name: "Puentes de glúteo",          detail: "2 × 15 reps · aprieta arriba" },
      { name: "Zancadas caminando",         detail: "10 pasos · controlado" },
      { name: "Barra vacía en sentadilla",  detail: "1 × 10 reps · encuentra profundidad" },
    ],
  },
};

// ─────────────────────────────────────────────────────────────
// Estiramientos por día
// ─────────────────────────────────────────────────────────────
const STRETCHES = {
  Empuje: {
    duration: 6,
    movements: [
      { name: "Pecho en marco de puerta",   detail: "30s cada lado · brazo a 90°" },
      { name: "Hombro cruzado",             detail: "30s cada lado · jala el brazo a través" },
      { name: "Tríceps overhead",           detail: "30s cada lado · codo detrás de la cabeza" },
      { name: "Postura del niño",           detail: "1 min · respira profundo" },
      { name: "Gato-vaca",                  detail: "10 reps lentas · movilidad de columna" },
    ],
  },
  Tirón: {
    duration: 6,
    movements: [
      { name: "Estiramiento de dorsales en barra", detail: "30s cada lado · cuelga e inclínate" },
      { name: "Bíceps en marco de puerta",  detail: "30s cada lado · brazo extendido atrás" },
      { name: "Flexores de antebrazo",      detail: "30s cada · palma arriba, jala dedos" },
      { name: "Apertura torácica",          detail: "30s cada lado · en foam roller" },
      { name: "Niño con extensión",         detail: "1 min · brazos largos, estira costados" },
    ],
  },
  Piernas: {
    duration: 7,
    movements: [
      { name: "Cuádriceps de pie",          detail: "45s cada lado · sujeta tobillo, rodilla atrás" },
      { name: "Femoral sentado",            detail: "45s cada lado · alcanza el pie" },
      { name: "Zancada con flexor de cadera", detail: "45s cada lado · rodilla trasera abajo" },
      { name: "Postura de la paloma",       detail: "1 min cada lado · respira hacia el glúteo" },
      { name: "Pantorrilla en pared",       detail: "30s cada lado · empuja contra pared" },
      { name: "Twist espinal supino",       detail: "30s cada lado · rodillas caen al lado" },
    ],
  },
};

window.WARMUPS = WARMUPS;
window.STRETCHES = STRETCHES;
window.PROGRAM = PROGRAM;
window.RECOVERY_TIPS = RECOVERY_TIPS;
