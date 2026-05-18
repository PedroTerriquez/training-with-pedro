const FREE_DB = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/'
const WGER = 'https://wger.de/media/exercise-images/'
const img = (name) => FREE_DB + name + '/0.jpg'
const wger = (path) => WGER + path

const EXERCISE_IMAGE_URLS = {
  'Press Inclinado con Barra': {
    primary: img('Barbell_Incline_Bench_Press_-_Medium_Grip'),
    fallback: wger('41/Incline-bench-press-1.png'),
  },
  'Cruces de Polea Media/Alta': {
    primary: img('Cable_Crossover'),
    fallback: wger('71/Cable-crossover-2.png'),
  },
  'Elevaciones Laterales con Polea Baja': {
    primary: img('Bent_Over_Low-Pulley_Side_Lateral'),
    fallback: wger('148/lateral-dumbbell-raises-large-2.png'),
  },
  'Extensión de Tríceps (Barra EZ)': {
    primary: img('EZ-Bar_Skullcrusher'),
    fallback: wger('84/Lying-close-grip-triceps-press-to-chin-1.png'),
  },
  'Jalón de Tríceps en Polea Alta (Barra Recta)': {
    primary: img('Cable_Rope_Overhead_Triceps_Extension'),
    fallback: wger('912/e10a034f-6370-4dd6-b1c2-416b27844529.png'),
  },
  'Jalón al Pecho en Polea Alta (Agarre Neutro)': {
    primary: img('Close-Grip_Front_Lat_Pulldown'),
    fallback: wger('158/02e8a7c3-dc67-434e-a4bc-77fdecf84b49.webp'),
  },
  'Remo con Apoyo en el Pecho con Mancuernas': {
    primary: img('Dumbbell_Incline_Row'),
    fallback: wger('81/a751a438-ae2d-4751-8d61-cef0e9292174.png'),
  },
  'Curl Bayesiano en Polea Baja': {
    primary: img('Standing_Biceps_Cable_Curl'),
    fallback: wger('95/Standing-biceps-curl-1.png'),
  },
  'Curl Predicador con Mancuerna (en Banco Inclinado)': {
    primary: img('Cable_Preacher_Curl'),
    fallback: wger('193/Preacher-curl-3-1.png'),
  },
  'Pájaros con Mancuerna en Banco Inclinado': {
    primary: img('Bent_Over_Dumbbell_Rear_Delt_Raise_With_Head_On_Bench'),
    fallback: wger('109/Barbell-rear-delt-row-1.png'),
  },
  'Sentadilla Libre Trasera con Barra': {
    primary: img('Barbell_Full_Squat'),
    fallback: wger('31/92f6451b-f89d-49d6-9531-8970ea420d97.png'),
  },
  'Curl de Piernas Acostado con Mancuerna': {
    primary: img('Lying_Leg_Curls'),
    fallback: wger('154/lying-leg-curl-machine-large-1.png'),
  },
  'Sentadilla Búlgara con Mancuernas (Enfoque Cuádriceps)': {
    primary: img('Split_Squat_with_Dumbbells'),
    fallback: wger('988/6283b258-a4d7-4833-84f7-a38987022d3d.png'),
  },
  'Elevación de Pantorrillas de Pie con Barra': {
    primary: img('Standing_Barbell_Calf_Raise'),
    fallback: wger('12/4a42cc6f-648d-40cc-a72a-c49dd47e1667.webp'),
  },
  'Press Plano con Mancuernas': {
    primary: img('Dumbbell_Bench_Press'),
    fallback: wger('97/Dumbbell-bench-press-1.png'),
  },
  'Remo con Barra Libre': {
    primary: img('Bent_Over_Barbell_Row'),
    fallback: wger('110/Reverse-grip-bent-over-rows-1.png'),
  },
  'Elevaciones Laterales con Mancuernas': {
    primary: img('Side_Lateral_Raise'),
    fallback: wger('148/lateral-dumbbell-raises-large-2.png'),
  },
  'Rompecráneos Inclinado con Mancuernas': {
    primary: img('Decline_EZ_Bar_Triceps_Extension'),
    fallback: wger('84/Lying-close-grip-triceps-press-to-chin-1.png'),
  },
  'Curl Martillo con Mancuernas': {
    primary: img('Alternate_Hammer_Curl'),
    fallback: wger('86/Bicep-hammer-curl-1.png'),
  },
  'Peso Muerto Rumano con Barra (RDL)': {
    primary: img('Stiff-Legged_Barbell_Deadlift'),
    fallback: wger('161/Dead-lifts-2.png'),
  },
  'Sentadilla Búlgara con Mancuernas (Enfoque Glúteo)': {
    primary: img('Split_Squat_with_Dumbbells'),
    fallback: wger('988/6283b258-a4d7-4833-84f7-a38987022d3d.png'),
  },
  'Extensiones de Cuádriceps en Polea Baja': {
    primary: img('Leg_Extensions'),
    fallback: wger('128/Hyperextensions-1.png'),
  },
  'Elevación de Pantorrillas de Pie con Mancuerna': {
    primary: img('Dumbbell_Seated_One-Leg_Calf_Raise'),
    fallback: wger('12/4a42cc6f-648d-40cc-a72a-c49dd47e1667.webp'),
  },
  'Press de Banca Plano con Mancuernas': {
    primary: img('Dumbbell_Bench_Press'),
    fallback: wger('97/Dumbbell-bench-press-1.png'),
  },
  'Press Arnold Sentado con Mancuernas': {
    primary: img('Arnold_Dumbbell_Press'),
    fallback: wger('53/Shoulder-press-machine-2.png'),
  },
  'Extensión de Tríceps Acostado con Mancuernas': {
    primary: img('Cable_Lying_Triceps_Extension'),
    fallback: wger('84/Lying-close-grip-triceps-press-to-chin-1.png'),
  },
  'Patada de Tríceps en Polea Baja': {
    primary: img('Tricep_Dumbbell_Kickback'),
    fallback: wger('1185/c5ca283d-8958-4fd8-9d59-a3f52a3ac66b.jpg'),
  },
  'Jalón al Pecho en Polea Alta (Agarre Supino)': {
    primary: img('Close-Grip_Front_Lat_Pulldown'),
    fallback: wger('181/Chin-ups-2.png'),
  },
  'Remo con Barra T en Esquina': {
    primary: img('T-Bar_Row_with_Handle'),
    fallback: wger('106/T-bar-row-1.png'),
  },
  'Face Pulls en Polea Alta': {
    primary: img('Face_Pull'),
    fallback: wger('1732/d13b9adb-968e-4f73-95e6-b16690bcf616.jpg'),
  },
  'Curl de Bíceps en Banco Inclinado con Mancuernas': {
    primary: img('Alternate_Incline_Dumbbell_Curl'),
    fallback: wger('138/Hammer-curls-with-rope-1.png'),
  },
  'Curl Alterno con Mancuernas (Parado)': {
    primary: img('Dumbbell_Bicep_Curl'),
    fallback: wger('129/Standing-biceps-curl-1.png'),
  },
  'Sentadilla Frontal con Barra': {
    primary: img('Front_Barbell_Squat'),
    fallback: wger('191/Front-squat-1-857x1024.png'),
  },
  'Zancadas Caminando o Estáticas con Mancuernas': {
    primary: img('Dumbbell_Lunges'),
    fallback: wger('113/Walking-lunges-1.png'),
  },
  'Curl Nórdico': {
    primary: img('Glute_Ham_Raise'),
    fallback: wger('909/159222d9-c1e4-46ae-89ee-6a2dfaab978d.png'),
  },
  'Elevación de Pantorrillas Sentado': {
    primary: img('Barbell_Seated_Calf_Raise'),
    fallback: wger('117/seated-leg-curl-large-1.png'),
  },
  'Fondos Lastrados': {
    primary: img('Dips_-_Chest_Version'),
    fallback: wger('83/Bench-dips-1.png'),
  },
  'Dominadas Lastradas o Libres': {
    primary: img('Band_Assisted_Pull-Up'),
    fallback: wger('181/Chin-ups-2.png'),
  },
  'Elevaciones Laterales en Polea por Detrás de la Espalda': {
    primary: img('Side_Lateral_Raise'),
    fallback: wger('148/lateral-dumbbell-raises-large-2.png'),
  },
  'Extensión de Tríceps sobre la Cabeza en Polea Alta': {
    primary: img('Cable_Rope_Overhead_Triceps_Extension'),
    fallback: wger('1185/c5ca283d-8958-4fd8-9d59-a3f52a3ac66b.jpg'),
  },
  'Curl Martillo Cruzado con Mancuernas': {
    primary: img('Cross_Body_Hammer_Curl'),
    fallback: wger('86/Bicep-hammer-curl-1.png'),
  },
  'Peso Muerto Convencional con Barra': {
    primary: img('Barbell_Deadlift'),
    fallback: wger('184/1709c405-620a-4d07-9658-fade2b66a2df.jpeg'),
  },
  'Sentadilla Ciclista con Barra (Cyclist Squat)': {
    primary: img('Barbell_Hack_Squat'),
    fallback: wger('130/Narrow-stance-hack-squats-1-1024x721.png'),
  },
  'Elevación de Talones de Pie (Enfoque Sóleo/Gemelos)': {
    primary: img('Standing_Barbell_Calf_Raise'),
    fallback: wger('12/4a42cc6f-648d-40cc-a72a-c49dd47e1667.webp'),
  },
}

window.EXERCISE_IMAGE_URLS = EXERCISE_IMAGE_URLS
