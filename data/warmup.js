const IMG_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/'
const img = (p) => IMG_BASE + p

const WARMUP_DATA = {
  chest: {
    warmup: [
      { name: 'Círculos de Brazos', imgUrl: img('Arm_Circles/0.jpg'), desc: 'De pie con brazos extendidos a los lados. Haz círculos pequeños hacia adelante durante 15 s, luego invierte el sentido.' },
      { name: 'Estiramiento Dinámico de Pecho', imgUrl: img('Dynamic_Chest_Stretch/0.jpg'), desc: 'De pie, lleva los brazos extendidos hacia atrás abriendo el pecho y luego cruza al frente. Realiza 10 reps fluidas.' },
      { name: 'Abrazos del Oso Dinámicos', imgUrl: img('Hug_A_Ball/0.jpg'), desc: 'Abre los brazos lateralmente al máximo expandiendo el torso y luego cruza los brazos al frente como si te abrazaras a ti mismo de forma rítmica. 12 reps.' },
    ],
    stretch: [
      { name: 'Estiramiento de Pecho', imgUrl: img('Behind_Head_Chest_Stretch/0.jpg'), desc: 'Junta las manos detrás de la cabeza, lleva los codos activamente hacia atrás y expande el pecho. Sostén de 20 a 30 s.' },
      { name: 'Estiramiento de Pecho y Hombro', imgUrl: img('Chest_And_Front_Of_Shoulder_Stretch/0.jpg'), desc: 'De pie, apoya la palma de la mano en una pared con el brazo extendido y gira el torso hacia el lado opuesto. Sostén 20 s por lado.' },
      { name: 'Un Brazo Contra Pared', imgUrl: img('One_Arm_Against_Wall/0.jpg'), desc: 'Apoya el antebrazo flexionado a 90° en una pared o marco de puerta, da un paso al frente y rota el torso para liberar fibras profundas. Sostén 20 s por lado.' },
      { name: 'Apertura de Pecho en Espaldera', desc: 'STALLBAR: De espaldas a la espaldera, sujeta una barra trasera a la altura de tus hombros. Da un paso al frente con una pierna y empuja el torso hacia adelante de manera pasiva. Sostén 25 s.' },
    ]
  },
  shoulders: {
    warmup: [
      { name: 'Círculos de Brazos', imgUrl: img('Arm_Circles/0.jpg'), desc: 'Brazos extendidos a los lados. Realiza círculos amplios hacia adelante durante 15 s, luego hacia atrás.' },
      { name: 'Círculos de Hombros', imgUrl: img('Shoulder_Circles/0.jpg'), desc: 'Lleva los hombros hacia arriba, atrás, abajo y adelante forming círculos continuos. 15 s por dirección.' },
      { name: 'Elevación de Hombros', imgUrl: img('Shoulder_Raise/0.jpg'), desc: 'Eleva los hombros hacia las orejas de forma controlada y bájalos por completo simulando un encogimiento. Realiza 10 reps.' },
      { name: 'Movilidad Escapular en Y-T-W', desc: 'De pie, inclina levemente el torso y dibuja en el aire las letras Y, T y W con tus brazos extendidos, retrayendo las escápulas fuertemente en cada posición. 5 series de la secuencia.' },
    ],
    stretch: [
      { name: 'Estiramiento de Hombro Sentado', imgUrl: img('Seated_Front_Deltoid/0.jpg'), desc: 'Sentado con las manos apoyadas en el suelo detrás de ti y los dedos apuntando hacia atrás, desliza la cadera hacia adelante para estirar el deltoides anterior. Sostén 20 s.' },
      { name: 'Estiramiento de Hombro', imgUrl: img('Shoulder_Stretch/0.jpg'), desc: 'Lleva un brazo extendido cruzando el pecho y usa el brazo opuesto como palanca para presionarlo hacia ti. Sostén 20 s cada lado.' },
      { name: 'Círculo Alrededor del Mundo', imgUrl: img('Round_The_World_Shoulder_Stretch/0.jpg'), desc: 'De pie, dibuja círculos gigantescos con ambos brazos extendidos, pasando completamente por arriba y hacia atrás para mejorar la movilidad. 10 reps.' },
      { name: 'Colgado Pasivo de Hombros', desc: 'STALLBAR: Sujeta una de las barras superiores de la espaldera con agarre prono y relaja los hombros por completo, permitiendo que el peso corporal estire la cápsula articular. Sostén 25 s.' },
    ]
  },
  triceps: {
    warmup: [
      { name: 'Círculos de Codos', imgUrl: img('Elbow_Circles/0.jpg'), desc: 'Coloca las yemas de los dedos sobre tus hombros y rota los codos dibujando círculos amplios en el aire. 15 s por dirección.' },
      { name: 'Círculos de Brazos', imgUrl: img('Arm_Circles/0.jpg'), desc: 'Brazos estirados a los costados. Haz giros cortos y rápidos en el eje de los hombros. 15 s adelante, 15 s atrás.' },
      { name: 'Extensiones de Tríceps al Aire', desc: 'Eleva los codos al lado de tus orejas y realiza flexiones y extensiones explosivas de antebrazo simulando una patada de tríceps sin carga. 20 reps.' },
    ],
    stretch: [
      { name: 'Estiramiento de Tríceps', imgUrl: img('Triceps_Stretch/0.jpg'), desc: 'Eleva un brazo, dobla el codo para tocar tu espalda alta y empuja el codo suavemente hacia abajo con la otra mano. Sostén 20 s por lado.' },
      { name: 'Tríceps por Arriba', imgUrl: img('Overhead_Triceps/0.jpg'), desc: 'Eleva el brazo flexionado por detrás de la cabeza y jala el codo de forma oblicua hacia la línea media para estirar la porción larga del tríceps. Sostén 20 s por lado.' },
      { name: 'Estiramiento Lateral de Tríceps', imgUrl: img('Tricep_Side_Stretch/0.jpg'), desc: 'Sujeta tu codo por encima de la cabeza e inclina el torso lateralmente para estirar simultáneamente el tríceps y la zona costal. Sostén 20 s por lado.' },
      { name: 'Tríceps Apoyado en Espaldera', desc: 'STALLBAR: Frente a la espaldera, apoya los codos sobre una barra a la altura del pecho, junta las manos detrás de tu cuello y desciende el pecho arqueando la espalda alta. Sostén 20 s.' },
    ]
  },
  biceps: {
    warmup: [
      { name: 'Círculos de Brazos', imgUrl: img('Arm_Circles/0.jpg'), desc: 'Brazos extendidos a 90° con las palmas mirando hacia el techo, realiza círculos pequeños para activar bíceps y hombros. 15 s por dirección.' },
      { name: 'Flexión de Codo Dinámica', imgUrl: img('Dumbbell_Alternate_Bicep_Curl/0.jpg'), desc: 'Abre los brazos lateralmente con las palmas hacia arriba, flexiona los codos de forma rápida llevando las manos a los hombros y extiende al máximo. 20 reps.' },
    ],
    stretch: [
      { name: 'Estiramiento de Bíceps', imgUrl: img('Standing_Biceps_Stretch/0.jpg'), desc: 'Entrelaza los dedos detrás de la espalda baja con las palmas hacia abajo, extiende los brazos por completo y elévalos ligeramente. Sostén 20-30 s.' },
      { name: 'Estiramiento de Bíceps Sentado', imgUrl: img('Seated_Biceps/0.jpg'), desc: 'Sentado con rodillas flexionadas, apoya las palmas atrás en el suelo y aleja el torso de tus manos manteniendo los brazos extendidos. Sostén 20 s.' },
      { name: 'Bícep Invertido en Espaldera', desc: 'STALLBAR: De espaldas a la espaldera, sujeta una barra a la altura de la cintura con agarre supino (palmas hacia adelante). Camina un paso al frente estirando los brazos por completo detrás de ti. Sostén 20 s.' },
    ]
  },
  back: {
    warmup: [
      { name: 'Estiramiento de Gato', imgUrl: img('Cat_Stretch/0.jpg'), desc: 'En posición de cuadrupedia, alterna de forma fluida entre arquear la espalda hacia abajo (mirando al frente) y redondearla hacia arriba. 10 reps dinámicas.' },
      { name: 'Estiramiento Dinámico de Espalda', imgUrl: img('Dynamic_Back_Stretch/0.jpg'), desc: 'De pie con las piernas cruzadas o separadas, realiza rotaciones de torso de lado a lado dejando los brazos sueltos y relajados. 15 reps totales.' },
      { name: 'Oruga', imgUrl: img('Inchworm/0.jpg'), desc: 'Flexiona el torso hasta tocar el suelo, camina con las manos hacia una posición de plancha alta, y regresa caminando con los pies hacia las manos. Realiza 8 reps.' },
      { name: 'Rotación Espinal de Cuadrupedia', desc: 'En posición de cuatro puntos, coloca una mano detrás de la cabeza, lleva el codo hacia la mano contraria y luego ábrelo apuntando hacia el cielo. 8 reps por lado.' },
    ],
    stretch: [
      { name: 'Estiramiento de Gato', imgUrl: img('Cat_Stretch/0.jpg'), desc: 'En cuadrupedia, empuja activamente el suelo con las palmas y redondea la espalda hacia el techo simulando un gato erizado. Sostén la posición estática 20 s.' },
      { name: 'Estiramiento de Espalda Alta', imgUrl: img('Upper_Back_Stretch/0.jpg'), desc: 'Extiende los brazos al frente entrelazando las manos, empuja hacia adelante mientras encorvas la espalda alta y llevas la barbilla al pecho. Sostén 20 s.' },
      { name: 'Colgado Asistido en Espaldera', desc: 'STALLBAR: Sujeta una barra alta, suspende el peso del cuerpo manteniendo las puntas de los pies apoyadas en el suelo o en una barra baja para descomprimir la columna de forma segura. Sostén 25 s.' },
      { name: 'Niño Extendido en Espaldera', desc: 'STALLBAR: Arrodillado frente a la espaldera, apoya las manos en una barra baja, empuja los glúteos hacia los talones y hunde el pecho relajando toda la cadena espinal. Sostén 30 s.' },
    ]
  },
  midback: {
    warmup: [
      { name: 'Estiramiento de Gato', imgUrl: img('Cat_Stretch/0.jpg'), desc: 'En posición de cuatro puntos, moviliza la columna alternando flexión y extensión de manera rítmica y controlada. Realiza 10 reps.' },
      { name: 'Estiramiento Dinámico de Espalda', imgUrl: img('Dynamic_Back_Stretch/0.jpg'), desc: 'De pie, rota el torso de izquierda a derecha pivotando el pie trasero para activar los erectores espinales y la zona media. 15 reps.' },
      { name: 'Desplazamiento Escapular Cruzado', desc: 'De pie, estira los brazos al frente cruzando las muñecas, empuja los hombros hacia adelante y sepáralos repetidamente de forma controlada. 12 reps.' },
    ],
    stretch: [
      { name: 'Estiramiento de Espalda Media', imgUrl: img('Middle_Back_Stretch/0.jpg'), desc: 'Abraza una rodilla hacia el pecho estando sentado o de pie, encorvando ligeramente la sección dorsal para elongar los músculos interescapulares. Sostén 20 s.' },
      { name: 'Apertura de Brazos Acostado', imgUrl: img('Iron_Crosses_stretch/0.jpg'), desc: 'Acostado boca arriba con los brazos abiertos en cruz, flexiona una rodilla y cruza la pierna sobre el cuerpo buscando tocar el suelo sin despegar los hombros. Sostén 20 s por lado.' },
      { name: 'Tracción de Espalda Media', desc: 'STALLBAR: Frente a la espaldera, sujeta una barra a nivel del ombligo. Coloca los pies cerca de la base, dobla las rodillas y déjate caer hacia atrás colgando de tus brazos extendidos para abrir las escápulas. Sostén 25 s.' },
    ]
  },
  lats: {
    warmup: [
      { name: 'Estiramiento por Arriba', imgUrl: img('Overhead_Stretch/0.jpg'), desc: 'Entrelaza los dedos por encima de la cabeza, estira los brazos al máximo hacia el techo e inclínate sutilmente hacia cada lado de forma fluida. 15 s.' },
      { name: 'Estiramiento de Gato', imgUrl: img('Cat_Stretch/0.jpg'), desc: 'En posición de cuadrupedia, realiza una transición suave entre flexión dorsal y extensión lumbar para lubricar la columna. 10 reps.' },
      { name: 'Tracciones Dorsales Sin Peso', imgUrl: img('Full_Range-Of-Motion_Lat_Pulldown/0.jpg'), desc: 'Eleva los brazos completamente al cielo y jálalos con fuerza hacia abajo doblando los codos e imaginando que vences una gran resistencia para activar los dorsales. 15 reps.' },
    ],
    stretch: [
      { name: 'Estiramiento de Dorsales', imgUrl: img('Overhead_Lat/0.jpg'), desc: 'Eleva un brazo y realiza una inclinación lateral pronunciada del torso, empujando la cadera hacia el lado opuesto para elongar el dorsal ancho. Sostén 20 s por lado.' },
      { name: 'Colgado de Una Mano', imgUrl: img('One_Handed_Hang/0.jpg'), desc: 'Cuelga firmemente de una barra de dominadas usando un solo brazo, relajando el hombro y permitiendo que la gravedad traccione el dorsal. Sostén 15 s por lado.' },
      { name: 'Dorsales con Rodillo', imgUrl: img('Latissimus_Dorsi-SMR/0.jpg'), desc: 'Acostado de lado sobre un rodillo de espuma (Foam Roller) ubicado debajo de la axila, rueda suavemente hacia adelante y atrás para liberación miofascial. 30 s por lado.' },
      { name: 'Dorsales Inclinado en Espaldera', desc: 'STALLBAR: Sujeta una barra a la altura del pecho con ambas manos, da dos pasos hacia atrás y empuja la cadera hacia atrás, dejando caer el torso entre los brazos. Sostén 20 s.' },
      { name: 'Estiramiento Lateral Costal', desc: 'STALLBAR: Ponte de lado junto a la espaldera, sujeta una barra superior con el brazo externo formando un arco sobre tu cabeza e inclina la cadera lateralmente hacia afuera. Sostén 20 s por lado.' },
    ]
  },
  traps: {
    warmup: [
      { name: 'Círculos de Hombros', imgUrl: img('Shoulder_Circles/0.jpg'), desc: 'Realiza rotaciones exageradas de hombros hacia atrás y hacia adelante para liberar la tensión acumulada en el trapecio superior. 15 s por dirección.' },
      { name: 'Elevación de Hombros', imgUrl: img('Shoulder_Raise/0.jpg'), desc: 'Eleva los hombros al máximo, mantén la contracción un segundo en la cima y déjalos caer lentamente de forma controlada. Realiza 10 reps.' },
      { name: 'Codos Atrás', imgUrl: img('Elbows_Back/0.jpg'), desc: 'Lleva las manos a la cintura y empuja los codos firmemente hacia atrás intentando que se toquen, retrayendo las escápulas. Realiza 10 reps.' },
      { name: 'Depresiones Escapulares', desc: 'De pie y erguido, empuja tus hombros de manera forzada hacia el suelo alejándolos de tus orejas, mantén la tensión baja por 2 s y relaja. 12 reps.' },
    ],
    stretch: [
      { name: 'Estiramiento de Espalda Alta', imgUrl: img('Upper_Back_Stretch/0.jpg'), desc: 'Cruza los brazos al frente sujetando tus hombros opuestos y empuja las escápulas hacia afuera encorvando la zona superior. Sostén 20 s.' },
      { name: 'Trapecio Superior Asistido', desc: 'STALLBAR: De lado a la espaldera, sujeta una barra a nivel medio con el brazo más cercano manteniéndolo estirado. Deja caer el peso del cuerpo hacia el lado opuesto e inclina tu cabeza en esa dirección. Sostén 20 s.' },
    ]
  },
  quads: {
    warmup: [
      { name: 'Círculos de Rodillas', imgUrl: img('Knee_Circles/0.jpg'), desc: 'Pies juntos, manos apoyadas sobre las rodillas. Realiza giros circulares suaves y controlados para acondicionar los tendones. 15 s por dirección.' },
      { name: 'Flexores de Cadera de Pie', imgUrl: img('Standing_Hip_Flexors/0.jpg'), desc: 'Da un paso largo al frente en posición de desplante, empuja la cadera hacia adelante y abajo para activar el psoas e ilíaco. 10 reps dinámicas por lado.' },
      { name: 'Zancadas Cruzadas', imgUrl: img('Crossover_Reverse_Lunge/0.jpg'), desc: 'Realiza un desplante hacia atrás cruzando la pierna activa por detrás de la línea media del cuerpo para activar cuádriceps y glúteo medio. 8 reps por lado.' },
      { name: 'Sentadillas de Aire Lentas', imgUrl: img('Bodyweight_Squat/0.jpg'), desc: 'Desciende en una sentadilla regular rompiendo el paralelo en 3 segundos, mantén 1 segundo abajo y sube de forma explosiva para bombear los cuádriceps. 10 reps.' },
    ],
    stretch: [
      { name: 'Estiramiento de Cuádriceps', imgUrl: img('Quad_Stretch/0.jpg'), desc: 'De pie, flexiona una rodilla y jala el talón hacia el glúteo con la mano del mismo lado, manteniendo las rodillas alineadas y el torso erguido. Sostén 20 s por lado.' },
      { name: 'Cuádriceps Acostado', imgUrl: img('Lying_Prone_Quadriceps/0.jpg'), desc: 'Acostado boca abajo en el suelo, sujeta el empeine y jala el talón firmemente hacia el glúteo manteniendo la pelvis pegada al piso. Sostén 20 s por lado.' },
      { name: 'Cuádriceps de Pie Elevado', imgUrl: img('Standing_Elevated_Quad_Stretch/0.jpg'), desc: 'Apoya el empeine hacia atrás sobre un banco o superficie elevada, desciende la cadera ligeramente y contrae el glúteo para profundizar el estiramiento. Sostén 20 s por lado.' },
      { name: 'Couch Stretch en Espaldera', desc: 'STALLBAR: Colócate de rodillas frente a la pared o espaldera de espaldas. Apoya la rodilla en el suelo sobre un mat y el empeine verticalmente contra la barra inferior. Da un paso al frente con el otro pie y yergue el torso. Sostén 25 s por lado.' },
    ]
  },
  hamstrings: {
    warmup: [
      { name: 'Toques de Puntas', imgUrl: img('Standing_Toe_Touches/0.jpg'), desc: 'Inclinación de torso hacia adelante desde la articulación de la cadera intentando tocar las puntas de los pies de forma fluida y controlada, sin rebotar. 15 reps.' },
      { name: 'Isquiotibial 90/90', imgUrl: img('90_90_Hamstring/0.jpg'), desc: 'Acostado boca arriba, sujeta el muslo a 90° con las manos y extiende la rodilla por completo apuntando el talón al techo antes de regresar. Realiza 10 reps por pierna.' },
      { name: 'Buenos Días Dinámicos', imgUrl: img('Good_Morning/0.jpg'), desc: 'Manos detrás de la nuca, realiza una flexión de cadera empujando los glúteos hacia atrás con las rodillas semi-flexionadas hasta sentir tensión en el femoral, luego recupera. 12 reps.' },
      { name: 'Patadas Frankenstein', imgUrl: img('Frankenstein_Squat/0.jpg'), desc: 'Camina dando zancadas al frente elevando una pierna completamente recta para buscar tocar la mano del lado opuesto que está estirada horizontalmente. 10 reps por pierna.' },
    ],
    stretch: [
      { name: 'Estiramiento de Femoral', imgUrl: img('Standing_Hamstring_and_Calf_Stretch/0.jpg'), desc: 'Coloca un talón al frente sobre una superficie ligeramente elevada, mantén la pierna recta e inclina el torso hacia adelante desde la cadera. Sostén 20 s por lado.' },
      { name: 'Femoral Acostado', imgUrl: img('Lying_Hamstring/0.jpg'), desc: 'Acostado boca arriba, eleva una pierna completamente recta y jálala suavemente hacia tu torso usando una banda o tus manos detrás de la pantorrilla. Sostén 20 s por lado.' },
      { name: 'Femoral con Pierna Elevada', imgUrl: img('Leg-Up_Hamstring_Stretch/0.jpg'), desc: 'Acostado en el suelo, apoya una pierna la cual está extendida verticalmente contra el marco de una puerta o pared mientras la otra descansa plana. Sostén 20 s por lado.' },
      { name: 'Femoral Elevado en Espaldera', desc: 'STALLBAR: Coloca un talón sobre una de las barras a una altura que te exija pero no curve tu espalda baja. Mantén la pierna recta e inclina el torso hacia la punta del pie. Sostén 20 s por lado.' },
    ]
  },
  glutes: {
    warmup: [
      { name: 'Círculos de Cadera', imgUrl: img('Standing_Hip_Circles/0.jpg'), desc: 'Sosteniéndote en un pie, eleva la otra rodilla a 90° y realiza rotaciones externas e internas completas de la articulación coxofemoral. 15 s por lado.' },
      { name: 'Círculos de Cadera Acostado', imgUrl: img('Hip_Circles_prone/0.jpg'), desc: 'Acostado boca abajo o en cuatro puntos, eleva la pierna flexionada y dibuja círculos amplios en el aire controlando el movimiento desde el glúteo. 15 s por lado.' },
      { name: 'Puente con Inclinación Pélvica', imgUrl: img('Pelvic_Tilt_Into_Bridge/0.jpg'), desc: 'Acostado boca arriba con rodillas apoyadas, realiza una retroversión pélvica aplanando la espalda lumbar contra el suelo y eleva la cadera contrayendo glúteos. 10 reps.' },
      { name: 'Patadas Hidrantes Dinámicas', imgUrl: img('Glute_Kickback/0.jpg'), desc: 'En cuadrupedia, eleva de manera lateral una rodilla manteniéndola flexionada a 90°, simulando la apertura de un hidrante de agua. Activa el glúteo medio. 12 reps por lado.' },
    ],
    stretch: [
      { name: 'Estiramiento de Glúteo Acostado', imgUrl: img('Lying_Glute/0.jpg'), desc: 'Acostado boca arriba, cruza un tobillo sobre la rodilla opuesta formando un "4" y jala el muslo libre con ambas manos hacia el pecho. Sostén 20 s por lado.' },
      { name: 'Estiramiento de Glúteo Sentado', imgUrl: img('Seated_Glute/0.jpg'), desc: 'Sentado en una silla o banco, cruza un tobillo sobre la rodilla contraria e inclina el torso recto hacia adelante manteniendo la columna neutra. Sostén 20 s por lado.' },
      { name: 'Estiramiento de Piriformis', imgUrl: img('Piriformis-SMR/0.jpg'), desc: 'Sentado en el suelo con una pierna cruzada sobre la otra extendida, abraza la rodilla flexionada con el brazo opuesto y rota el torso buscando el estiramiento profundo del piramidal. Sostén 20 s.' },
      { name: 'Figura 4 en Espaldera', desc: 'STALLBAR: Sujétate de una barra de la espaldera a la altura del pecho, cruza el tobillo izquierdo sobre la rodilla derecha y haz un gesto de sentadilla profunda con una sola pierna para estirar el glúteo. Sostén 20 s por lado.' },
    ]
  },
  calves: {
    warmup: [
      { name: 'Círculos de Tobillos', imgUrl: img('Ankle_Circles/0.jpg'), desc: 'Eleva ligeramente un pie en el aire and realiza rotaciones circulares completas de la articulación del tobillo hacia ambos lados. 15 s por pie.' },
      { name: 'Tobillo Sobre Rodilla', imgUrl: img('Ankle_On_The_Knee/0.jpg'), desc: 'Sentado, cruza un tobillo sobre la rodilla opuesta y usa tu mano para guiar giros manuales amplios, estirando los tendones del empeine. 15 s por lado.' },
      { name: 'Pulsaciones en Escalón o Espaldera', desc: 'STALLBAR: Apoya el metatarso en el borde de un escalón o barra inferior de la espaldera, realiza elevaciones y descensos de talones continuos sin pausas. 20 reps.' },
    ],
    stretch: [
      { name: 'Estiramiento de Gemelo', imgUrl: img('Standing_Gastrocnemius_Calf_Stretch/0.jpg'), desc: 'Colócate frente a una pared, da un paso largo hacia atrás manteniendo la pierna posterior completamente estirada y presiona firmemente el talón contra el suelo. Sostén 20 s por lado.' },
      { name: 'Estiramiento de Gemelo Sentado', imgUrl: img('Seated_Calf_Stretch/0.jpg'), desc: 'Sentado en el suelo con la pierna extendida al frente, sujeta la punta del pie con una banda o con la mano y jálala hacia ti para estirar la pantorrilla. Sostén 20 s por lado.' },
      { name: 'Gemelo en Barra Inferior', desc: 'STALLBAR: Frente a la espaldera, apoya los metatarsos del pie delantero en la barra inferior dejando el talón en el suelo. Da un paso al frente con la otra pierna para forzar la dorsiflexión. Sostén 20 s por lado.' },
    ]
  },
  soleus: {
    warmup: [
      { name: 'Círculos de Tobillos', imgUrl: img('Ankle_Circles/0.jpg'), desc: 'Realiza movimientos circulares lentos con la punta del pie suspendida en el aire para liberar la articulación del tobillo. 15 s por lado.' },
      { name: 'Flexión de Tobillo en Cuclillas', desc: 'En posición de cuclillas profundas, balancea el peso corporal hacia una rodilla forzando que avance por delante de la punta del pie sin levantar el talón. Alterna lados. 10 por lado.' },
    ],
    stretch: [
      { name: 'Estiramiento de Sóleo', imgUrl: img('Standing_Soleus_And_Achilles_Stretch/0.jpg'), desc: 'En posición de estiramiento de pantorrilla contra la pared, flexiona ligeramente ambas rodillas cargando el peso atrás sin despegar el talón posterior. Sostén 20 s por lado.' },
      { name: 'Estiramiento de Tibial Posterior', imgUrl: img('Posterior_Tibialis_Stretch/0.jpg'), desc: 'Sentado en el suelo, toma la punta interna del pie y jálala sutilmente hacia el centro del cuerpo (inversión) para estirar los tendones profundos de la pantorrilla. Sostén 20 s.' },
      { name: 'Estiramiento de Peroneos', imgUrl: img('Peroneals_Stretch/0.jpg'), desc: 'Sentado en el suelo, toma el borde externo del pie y jálalo hacia afuera (eversión) para estirar la musculatura lateral externa de la pierna baja. Sostén 20 s.' },
      { name: 'Sóleo Profundo Asistido', desc: 'STALLBAR: Con la bola del pie en la barra inferior de la espaldera, dobla la rodilla de esa pierna a unos 30° y desplaza todo el peso corporal hacia adelante manteniendo el talón firme. Sostén 20 s por pierna.' },
    ]
  },
  abs: {
    warmup: [
      { name: 'Estiramiento de Gato', imgUrl: img('Cat_Stretch/0.jpg'), desc: 'En cuadrupedia, arquea y flexiona la columna rítmicamente para relajar el recto abdominal y los lumbares antes de entrenar core. 10 reps.' },
      { name: 'Puente con Inclinación Pélvica', imgUrl: img('Pelvic_Tilt_Into_Bridge/0.jpg'), desc: 'Acostado boca arriba, contrae el abdomen bajo eliminando el arco de la espalda lumbar antes de elevar de forma controlada la pelvis. 10 reps.' },
      { name: 'Perro de Caza (Bird-Dog)', desc: 'En posición de cuatro puntos, extiende de forma simultánea el brazo derecho al frente y la pierna izquierda hacia atrás manteniendo el core totalmente bloqueado. 8 reps por lado.' },
    ],
    stretch: [
      { name: 'Vacío de Estómago', imgUrl: img('Stomach_Vacuum/0.jpg'), desc: 'Exhala todo el aire residual de los pulmones, succiona el ombligo hacia adentro intentando pegarlo a la columna y mantén la apnea. Sostén 10 s de forma estática por 5 reps.' },
      { name: 'Postura de Niño', imgUrl: img('Childs_Pose/0.jpg'), desc: 'Arrodillado en el suelo, siéntate sobre los talones, extiende los brazos totalmente al frente relajando los hombros y el abdomen bajo contra los muslos. Sostén 20-30 s.' },
      { name: 'Cobra Abdominal Asistida', desc: 'STALLBAR: Boca abajo frente a la espaldera, sujeta una barra baja con tus manos y empuja estirando los brazos para elevar el torso, manteniendo la pelvis en el piso para estirar el recto abdominal. Sostén 20 s.' },
    ]
  },
  forearms: {
    warmup: [
      { name: 'Círculos de Muñecas', imgUrl: img('Wrist_Circles/0.jpg'), desc: 'Extiende los brazos al frente, cierra los puños suavemente y realiza giros continuos con las muñecas para activar la articulación. 15 s por dirección.' },
      { name: 'Pulsaciones de Dedos Rápidas', imgUrl: img('Finger_Curls/0.jpg'), desc: 'Brazos extendidos al frente, abre y cierra los puños con la máxima velocidad posible estirando los dedos por completo. Realiza el bombeo por 20 s.' },
    ],
    stretch: [
      { name: 'Estiramiento de Antebrazo', imgUrl: img('Kneeling_Forearm_Stretch/0.jpg'), desc: 'Colócate de rodillas, apoya las palmas en el suelo con los dedos apuntando hacia ti y lleva el peso de tu cadera sutilmente hacia atrás. Sostén 20 s.' },
      { name: 'Jalón Lateral de Muñeca', imgUrl: img('Side_Wrist_Pull/0.jpg'), desc: 'Brazo al frente con el codo extendido y la palma mirando hacia abajo; usa la mano contraria para jalar los dedos hacia el suelo y hacia adentro. Sostén 15 s por lado.' },
      { name: 'Flexores en Barra de Espaldera', desc: 'STALLBAR: Apoya el reverso o la palma de tus manos directamente contra una barra a nivel de la cintura con los dedos apuntando hacia abajo y ejerce una ligera tracción hacia atrás. Sostén 20 s.' },
    ]
  },
  neck: {
    warmup: [
      { name: 'Estiramiento Lateral de Cuello', imgUrl: img('Side_Neck_Stretch/0.jpg'), desc: 'De forma suave y dinámica, inclina la cabeza lateralmente de hombro a hombro sin forzar el rango de movimiento. 15 s por lado.' },
      { name: 'Mentón al Pecho', imgUrl: img('Chin_To_Chest_Stretch/0.jpg'), desc: 'Realiza flexiones cervicales lentas bajando la barbilla hacia el esternón y regresando a la posición neutra. 10 reps dinámicas.' },
      { name: 'Mirando al Techo', imgUrl: img('Looking_At_Ceiling/0.jpg'), desc: 'Eleva la mirada hacia el techo extendiendo suavemente el cuello para activar la musculatura anterior. 10 reps.' },
      { name: 'Semicírculos Cervicales', imgUrl: img('Neck-SMR/0.jpg'), desc: 'Lleva la barbilla hacia un hombro y dibuja un medio círculo lento recorriendo el pecho hasta llegar al hombro opuesto. Solo por abajo. 8 reps.' },
    ],
    stretch: [
      { name: 'Estiramiento Lateral de Cuello', imgUrl: img('Side_Neck_Stretch/0.jpg'), desc: 'Inclina la cabeza hacia un hombro y asiste el estiramiento aplicando una presión estática muy leve con la mano del mismo lado. Sostén 20 s por lado.' },
      { name: 'Mentón al Pecho', imgUrl: img('Chin_To_Chest_Stretch/0.jpg'), desc: 'Baja la barbilla al pecho, entrelaza las manos detrás de la cabeza y deja caer únicamente el peso de tus brazos para estirar la musculatura cervical posterior. Sostén 20 s.' },
      { name: 'Estiramiento Angular Ojo-Axila', desc: 'Gira la cabeza 45 grados hacia un lado y desciende la mirada fijándola en tu axila; asiste suavemente presionando la nuca hacia abajo con la mano libre. Sostén 20 s.' },
    ]
  }
}

const MUSCLE_ALIASES = {
  'upper chest': 'chest',
  'lower chest': 'chest',
  'mid-back': 'midback',
  'mid back': 'midback',
  'side delts': 'shoulders',
  'side delt': 'shoulders',
  'rear delts': 'shoulders',
  'rear delt': 'shoulders',
  'front delts': 'shoulders',
  'front delt': 'shoulders',
  'delts': 'shoulders',
  'delt': 'shoulders',
  'quads / glutes': null,
  'biceps / brachialis': 'biceps',
  'lower back': 'back',
  'pecho': 'chest',
  'espalda': 'back',
  'hombros': 'shoulders',
  'hombro': 'shoulders',
  'triceps': 'triceps',
  'biceps': 'biceps',
  'cuadriceps': 'quads',
  'cuádriceps': 'quads',
  'femoral': 'hamstrings',
  'gluteos': 'glutes',
  'glúteos': 'glutes',
  'gemelos': 'calves',
  'abdominales': 'abs',
  'antebrazos': 'forearms',
  'cuello': 'neck',
  'trapecios': 'traps',
  'dorsales': 'lats',
  'lumbares': 'back',
  'piernas': 'quads',
}

function resolveMuscles(muscleStr) {
  if (!muscleStr) return []
  const s = muscleStr.toLowerCase().trim()

  if (MUSCLE_ALIASES[s] === null) {
    const parts = muscleStr.split('/').map(p => p.trim().toLowerCase())
    const resolved = []
    for (const p of parts) {
      const r = resolveSingle(p)
      if (r) resolved.push(r)
    }
    return [...new Set(resolved)]
  }

  if (MUSCLE_ALIASES[s]) return [MUSCLE_ALIASES[s]]

  const direct = resolveSingle(s)
  if (direct) return [direct]

  const sortedKeys = Object.keys(WARMUP_DATA).sort((a, b) => b.length - a.length)
  for (const key of sortedKeys) {
    if (s.includes(key)) return [key]
  }

  return []
}

function resolveSingle(s) {
  const clean = s.replace(/[-\s]+/g, '').toLowerCase()
  if (WARMUP_DATA[clean]) return clean
  if (WARMUP_DATA[s]) return s
  return null
}

function getUniqueWarmupMuscles(muscleNames) {
  const set = new Set()
  for (const name of muscleNames) {
    const resolved = resolveMuscles(name)
    resolved.forEach(r => set.add(r))
  }
  return [...set]
}

window.WARMUP_DATA = WARMUP_DATA
window.getUniqueWarmupMuscles = getUniqueWarmupMuscles
window.resolveMuscles = resolveMuscles
window.img = img
