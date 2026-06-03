const IMG_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/'
const img = (p) => IMG_BASE + p

// Secondary image source: ExerciseGymGifsDB (jsDelivr CDN)
// 1323 exercises, bilingual (EN/ES), free, no API key
const EX_GIF_BASE = 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/'
const _GIF = (path) => EX_GIF_BASE + path + '.gif'

const WARMUP_DATA = {
  "chest": {
      "warmup": [
        {
          "name": "Flexiones Dinámicas Excéntricas contra Pared",
          "desc": "Posición inicial: Colócate frente a una pared lisa a una distancia aproximada de un paso largo. Apoya las palmas de las manos sobre la pared a la altura del pecho y ligeramente más abiertas que el ancho de tus hombros, con el cuerpo alineado desde los talones hasta la cabeza. Ejecución: Flexiona los codos lentamente tardando de 3 a 4 segundos en acercar tu pecho hacia la pared, manteniendo el abdomen firme. Una vez que estés muy cerca, empuja la pared de forma explosiva para regresar a la posición inicial. Respiración: Inhala durante la fase de descenso controlado hacia la pared y exhala con fuerza al realizar el empuje dinámico. Duración/Reps: Realiza de 12 a 15 repeticiones de manera continua y controlada."
        },
        {
          "name": "Dislocaciones de Pecho y Hombro con Banda",
          "desc": "Posición inicial: Ponte de pie sosteniendo una banda elástica de resistencia ligera frente a tus muslos con un agarre prono bastante amplio (el doble del ancho de tus hombros). Ejecución: Manteniendo los brazos completamente extendidos y una ligera tensión hacia los lados en la banda, eleva los brazos por encima de la cabeza y continúa el arco de movimiento de forma fluida hacia atrás hasta tocar tu espalda baja. Regresa por el mismo camino de forma controlada. Respiración: Inhala profundamente mientras elevas la banda hacia el techo y exhala mientras desciendes los brazos por detrás del torso. Duración/Reps: Realiza 10 a 12 pasadas completas de ida y vuelta de manera rítmica."
        }
      ],
      "stretch": [
        {
          "name": "Estiramiento de Pecho en Esquina de Pared",
          "desc": "Posición inicial: Colócate de pie frente a una esquina de la habitación o el marco de una puerta abierta. Coloca los antebrazos apoyados verticalmente a ambos lados de la estructura, con los codos flexionados exactamente a 90 grados y alineados con tus hombros. Ejecución: Da un paso corto hacia adelante con una pierna y desplaza el peso de tu cuerpo sutilmente hacia el frente, permitiendo que el pecho avance libremente hacia el espacio vacío hasta sentir un estiramiento profundo pero seguro en las fibras pectorales. Respiración: Mantén una respiración profunda, lenta y diafragmática; inhala expandiendo el abdomen y exhala relajando el pectoral para ceder más al estiramiento. Duración/Reps: Sostén la posición de forma totalmente estática durante 20 a 30 segundos."
        },
        {
          "name": "Estiramiento Un Brazo Contra Pared",
          "desc": "Posición inicial: Colócate de pie lateralmente a una pared regular, a la distancia de la longitud de tu brazo. Apoya la palma de la mano interna plana sobre la pared a la altura del hombro, con los dedos apuntando hacia atrás. Ejecución: Manteniendo el brazo estirado y la mano fija en la pared, rota lentamente todo tu torso y tus pies en dirección opuesta a la pared (hacia afuera) hasta percibir una tensión de estiramiento en la inserción del pecho y el hombro. Respiración: Respira de manera pausada e intermitente, exhalando profundamente cada vez que intentes rotar un milímetro más el torso. Duración/Reps: Sostén la posición fija durante 20 segundos firmes por cada lado del cuerpo."
        },
        {
          "name": "Apertura de Pecho Pasiva en Espaldera",
          "desc": "STALLBAR - Posición inicial: Colócate de espaldas a la espaldera. Eleva los brazos hacia atrás y sujeta firmemente una de las barras que se encuentre a la altura aproximada de tus hombros o ligeramente por encima, con las palmas mirando hacia el frente. Ejecución: Da un paso largo hacia adelante con una pierna para estabilizarte y proyecta el esternón y todo el torso hacia el frente de manera pasiva, permitiendo que tus brazos queden fijos atrás para elongar el pectoral mayor de forma simétrica. Respiración: Inhala llenando por completo el pecho de aire y exhala relajando los hombros y permitiendo que la gravedad desplace el cuerpo ligeramente más adelante. Duración/Reps: Mantén este estiramiento estático durante 25 a 30 segundos de manera controlada."
        }
      ]
    },
      "shoulders": {
        "warmup": [
          {
            "name": "Movilidad Escapular en Y-T-W",
            "desc": "Posición inicial: Ponte de pie con las rodillas ligeramente flexionadas e inclina el torso hacia adelante unos 45 grados manteniendo la espalda completamente recta y los brazos colgando de forma relajada hacia el suelo. Ejecución: Mueve los brazos de forma fluida para dibujar tres letras consecutivas en el aire: primero elévalos en diagonal formando una 'Y', luego ábrelos totalmente hacia los costados formando una 'T', y finalmente flexiona los codos a 90 grados tirando de ellos hacia atrás formando una 'W'. En cada letra debes retraer fuertemente las escápulas. Respiración: Exhala al elevar los brazos para formar cada letra y activar la musculatura dorsal; inhala al regresar al centro. Duración/Reps: Completa de 6 a 8 secuencias completas de las tres letras consecutivas."
          },
          {
            "name": "Giros Externos con Banda Dinámicos",
            "desc": "Posición inicial: Ponte de pie y sujeta una banda de resistencia ligera con ambas manos separadas al ancho de los hombros. Flexiona los codos a 90 grados y pégalos firmemente a los costados de tu torso, con las palmas mirando hacia arriba. Ejecución: Manteniendo los codos anclados a tus costados en todo momento, abre los antebrazos hacia afuera tensando la banda elástica mediante la rotación externa de tus hombros. Regresa controladamente a la posición inicial. Respiración: Exhala al abrir los antebrazos hacia los lados ejercerciendo fuerza y contrayendo los rotadores; inhala al regresar al centro. Duración/Reps: Realiza entre 12 y 15 repeticiones fluidas de forma controlada."
          }
        ],
        "stretch": [
          {
            "name": "Estiramiento del Deltoides Posterior Cruzado",
            "desc": "Posición inicial: Ponte de pie o sentado de forma erguida. Extiende tu brazo derecho completamente horizontal cruzando la línea media por delante de tu pecho. Ejecución: Coloca el antebrazo izquierdo por debajo del codo derecho y utilízalo como palanca para presionar firmemente el brazo derecho contra tu pecho. Mantén el hombro derecho deprimido (alejado de la oreja) para enfocar el estiramiento en la cara posterior del hombro. Respiración: Respira de forma pausada y profunda; exhala de manera prolongada permitiendo que el brazo se acerque un poco más al pecho en cada ciclo. Duración/Reps: Sostén de forma estática por 20 a 30 segundos y luego repite el proceso con el brazo opuesto."
          },
          {
            "name": "Estiramiento del Deltoides Anterior Sentado",
            "desc": "Posición inicial: Siéntate en el suelo con las rodillas flexionadas y los pies apoyados firmemente. Coloca las palmas de las manos apoyadas en el suelo detrás de ti, a una distancia cómoda, con los dedos apuntando en dirección opuesta a tu cuerpo. Ejecución: Desliza lentamente tus glúteos hacia adelante alejándolos de tus manos fijas, manteniendo los brazos completamente extendidos, hasta que sientas una tensión moderada y cómoda de estiramiento en la parte frontal de tus hombros. Respiración: Inhala inflando el abdomen y exhala de forma prolongada, relajando la musculatura de los hombros para permitir que el pecho se abra. Duración/Reps: Sostén la posición final estática por 20 a 25 segundos."
          },
          {
            "name": "Tracción Escapular Colgado",
            "desc": "STALLBAR - Posición inicial: Colócate de frente a la espaldera. Sujeta firmemente con ambas manos en agarre prono una de las barras superiores que te permita quedar suspendido o semi-suspendido con las puntas de los pies rozando el suelo. Ejecución: Relaja por completo el peso de tu cuerpo personalizando que la gravedad traccione tus hombros hacia arriba. Deja que tu cabeza quede libre entre tus brazos y empuja sutilmente tu pecho hacia el espacio entre las barras para estirar la cápsula articular del hombro. Respiración: Inhala profundo expandiendo la espalda y exhala soltando toda la musculatura escapular de forma pasiva. Duración/Reps: Sostén la suspensión estática de 25 a 30 segundos continuos."
          }
        ]
      },
      "triceps": {
        "warmup": [
          {
            "name": "Flexiones en Diamante sobre Pared",
            "desc": "Posición inicial: Colócate de pie frente a una pared a un paso de distancia. Apoya las manos en la pared formando un diamante con tus dedos índices y pulgares juntos, alineados directamente con el centro de tu pecho. Ejecución: Manteniendo el cuerpo rígido como una tabla, flexiona los codos hacia afuera y abajo para acercar tu esternón hacia las manos en un recorrido controlado de 2 segundos. Empuja dinámicamente la pared para regresar extendiendo los brazos por completo. Respiración: Inhala mientras desciendes controladamente hacia la pared y exhala al realizar el empuje dinámico final. Duración/Reps: Completa de 12 a 15 repeticiones enfocadas en la musculatura del tríceps."
          },
          {
            "name": "Extensiones de Codo al Aire Activas",
            "desc": "Posición inicial: Ponte de pie de manera erguida. Eleva ambos brazos verticalmente apuntando los codos directamente hacia el techo, posicionando tus manos abiertas justo detrás de tu nuca o espalda alta. Ejecución: Manteniendo los codos fijos y apuntando hacia arriba al lado de tus orejas, extiende ambos antebrazos de forma simultánea y explosiva hacia el techo contrayendo activamente los tríceps. Regresa de manera fluida a la posición inicial flexionando los codos al máximo. Respiración: Exhala con fuerza al extender los brazos hacia el cielo e inhala al regresar a la flexión de nuca. Duración/Reps: Completa de 15 a 20 repeticiones continuas para bombear sangre a la zona."
          }
        ],
        "stretch": [
          {
            "name": "Estiramiento de Tríceps por Detrás de la Cabeza",
            "desc": "Posición inicial: Ponte de pie o siéntate de forma erguida. Eleva tu brazo derecho verticalmente y luego flexiona el codo dejando caer la palma de la mano sobre la línea media de tu espalda alta. Ejecución: Lleva tu mano izquierda por encima de tu cabeza y sujeta firmemente el codo derecho. Jala el codo con suavidad hacia abajo y hacia el centro de la cabeza hasta sentir el estiramiento en la porción larga del tríceps, manteniendo la cabeza erguida. Respiración: Inhala profundo manteniendo el torso firme y exhala liberando la tensión a medida que traccionas suavemente el codo. Duración/Reps: Sostén la postura de forma estática por 20 a 30 segundos por cada brazo."
          },
          {
            "name": "Elongación de Tríceps contra Pared",
            "desc": "Posición inicial: Colócate de pie frente a una pared a un paso corto de distancia. Eleva los brazos Py apoya ambos codos sobre la pared a la altura de tu frente, manteniendo los antebrazos flexionados con las manos apuntando hacia tu espalda. Ejecución: Junta las palmas de tus manos por detrás de tu cabeza. Lentamente, da un pequeño paso hacia atrás con los pies y deja caer tu pecho y tu cabeza hacia el suelo entre tus brazos, permitiendo que la pared empuje tus codos hacia arriba estirando los tríceps. Respiración: Respira con calma; inhala profundo y exhala hundiendo el torso hacia el piso de manera pasiva y controlada. Duración/Reps: Mantén la posición de tracción pasiva durante 20 a 30 segundos continuos."
          },
          {
            "name": "Tríceps Apoyado en Barra Alta",
            "desc": "STALLBAR - Posición inicial: Colócate de frente a la espaldera a un paso de distancia. Flexiona los codos por completo colocando tus manos juntas detrás del cuello. Apoya firmemente la punta de ambos codos sobre una de las barras que se encuentre a la altura de tu pecho o mentón. Ejecución: Manteniendo los codos fijos sobre la barra, da un paso pequeño hacia atrás con tus pies e inclina el torso hacia adelante, permitiendo que tu cabeza pase por debajo del nivel de la barra. Presiona el pecho hacia el suelo para profundizar el estiramiento en los tríceps. Respiración: Inhala profundo de forma controlada y exhala de forma prolongada dejando caer el peso del torso de manera pasiva. Duración/Reps: Sostén la posición fija por 20 a 30 segundos antes de reincorporarte lentamente."
          }
        ]
      },
      "biceps": {
        "warmup": [
          {
            "name": "Flexiones de Bíceps Dinámicas con Rotación",
            "desc": "Posición inicial: Ponte de pie de manera erguida con los brazos extendidos a los lados de tu cuerpo, las palmas de las manos mirando hacia el frente (supinación) y los hombros relajados. Ejecución: Flexiona los codos de forma rápida y continua llevando las manos hacia los hombros. Al mismo tiempo, rota las muñecas de manera que los antebrazos pasen por un plano completo de supinación en el punto alto y regresen a una pronación ligera o posición neutra en la extensión baja del movimiento. Respiración: Exhala al flexionar los codos hacia arriba contrayendo el músculo e inhala al extender los brazos por completo. Duración/Reps: Realiza de 15 a 20 repeticiones con ritmo continuo."
          },
          {
            "name": "Rotaciones de Brazo Completo (Tornillo)",
            "desc": "Posición inicial: Ponte de pie de manera erguida y extiende tus brazos completamente hacia los costados de manera horizontal a la altura de tus hombros, con las palmas de las manos mirando inicialmente hacia el techo. Ejecución: Inicia una rotación interna y externa exagerada de todo el brazo desde la articulación del hombro. Gira las manos hacia adelante, abajo y atrás tanto como sea posible, y luego invierte el giro abriendo las palmas hacia arriba y atrás, involucrando dinámicamente los tendones del bíceps. Respiración: Mantén un ciclo respiratorio coordinado e ininterrumpido durante la rotación. Duración/Reps: Realiza el movimiento continuo durante 30 segundos sin detenerte."
          }
        ],
        "stretch": [
          {
            "name": "Estiramiento de Bíceps en Pared con Pulgar Abajo",
            "desc": "Posición inicial: Colócate de pie de lado a una pared lisa a una distancia aproximada de un brazo. Extiende el brazo interno lateralmente y apoya la palma de la mano sobre la pared a la altura del hombro, asegurándote de rotar la muñeca para que el dedo pulgar apunte directamente hacia el suelo. Ejecución: Manteniendo el codo completamente bloqueado y la palma firmemente apoyada, rota despacio tu torso y tus pies en dirección opuesta a la pared hasta sentir una intensa elongación a lo largo de todo el vientre del bíceps y la cara anterior del brazo. Respiración: Inhala de forma controlada y exhala extendiendo la rotación milimétricamente sin despegar la mano de la pared. Duración/Reps: Sostén el estiramiento estático durante 20 a 30 segundos por lado."
          },
          {
            "name": "Estiramiento de Bíceps Sentado con Manos Atrás",
            "desc": "Posición inicial: Siéntate en el suelo con las rodillas flexionadas y los pies apoyados al frente. Coloca las palmas de las manos sobre el piso detrás de tu torso con los dedos apuntando exactamente hacia la pared posterior. Ejecución: Manteniendo las palmas fijas en su lugar y los codos completamente rectos, camina o desplaza lentamente tus glúteos hacia adelante alejándote de tus manos. Elongarás de manera bilateral ambos bíceps aprovechando la extensión del hombro. Respiración: Inhala profundo expandiendo la caja torácica y exhala de manera controlada relajando los brazos para ceder al estiramiento. Duración/Reps: Mantén la posición fija y estática por 20 a 25 segundos continuos."
          },
          {
            "name": "Bícep Invertido en Barra Baja",
            "desc": "STALLBAR - Posición inicial: Colócate de espaldas a la espaldera. Lleva tus brazos hacia atrás hacia una de las barras inferiores (a nivel aproximado de tu cintura o caderas) y sujétala firmemente con un agarre supino (las palmas mirando hacia el frente). Ejecución: Manteniendo los codos bloqueados y el agarre firme, da uno o dos pasos cortos hacia adelante con tus pies. Flexiona levemente las rodillas y desciende el centro de gravedad de tu cuerpo de manera que tus brazos queden estirados detrás elongando los bíceps de forma pasiva y simétrica. Respiración: Inhala profundo manteniendo el core estable y exhala soltando la tensión acumulada en la cara anterior de los brazos. Duración/Reps: Sostén la posición de forma totalmente estática durante 20 a 25 segundos."
          }
        ]
      },
      "back": {
        "warmup": [
          {
            "name": "Gato-Camello Dinámico",
            "desc": "Posición inicial: Colócate sobre un tapete en posición de cuadrupedia, apoyando firmemente las manos debajo de los hombros y las rodillas directamente alineadas bajo las caderas, con la columna en una posición neutral. Ejecución: Inicia arqueando la columna hacia el suelo (posición del gato) elevando sutilmente la cabeza y los glúteos. De forma fluida, invierte el movimiento redondeando la espalda hacia el techo (posición del camello) hundiendo la cabeza entre los hombros y contrayendo el abdomen al máximo. Respiración: Inhala profundo al arquear la espalda hacia abajo y exhala completamente al encorvar e inflar la espalda hacia el techo. Duración/Reps: Realiza el movimiento continuo y controlado durante 30 a 45 segundos totales."
          },
          {
            "name": "Oruga Walkout Dinámica",
            "desc": "Posición inicial: Ponte de pie de manera totalmente erguida al final de un tapete, con los pies separados al ancho de las caderas y los brazos relajados a los lados del cuerpo. Ejecución: Flexiona el torso hacia adelante buscando tocar el suelo con las manos. Sin doblar significativamente las rodillas, camina con tus manos hacia el frente de manera fluida hasta quedar en una posición de plancha alta. Sostén un instante y regresa caminando con las manos hacia tus pies para reincorporarte. Respiración: Exhala al descender e iniciar la caminata, mantén el aire en la plancha e inhala profundamente al regresar a la posición vertical de pie. Duración/Reps: Completa entre 8 y 10 caminatas controladas de forma continua."
          }
        ],
        "stretch": [
          {
            "name": "Postura del Niño con Enfoque Lumbar",
            "desc": "Posición inicial: Arrodíllate sobre un tapete, separa las rodillas al ancho del tapete y junta los dedos gordos de tus pies detrás, sentando tus glúteos firmemente sobre los talones. Ejecución: Extiende los brazos hacia el frente y desliza tus manos sobre el suelo bajando el pecho y la frente hacia el tapete. Empuja activamente tus glúteos hacia atrás contra tus talones a la vez que estiras las manos adelante para descomprimir la zona lumbar de manera pasiva. Respiración: Realiza una respiración diafragmática profunda; inhala expandiendo la zona lumbar baja y exhala permitiendo que tu torso se hunda más en el mat. Duración/Reps: Mantén esta postura estática y relajada durante 30 a 40 segundos continuos."
          },
          {
            "name": "Torsión Espinal en el Suelo Estática",
            "desc": "Posición inicial: Acuéstate boca arriba sobre un tapete con las piernas completamente extendidas y los brazos abiertos hacia los lados en forma de cruz, con las palmas apoyadas. Ejecución: Flexiona la rodilla derecha a 90 grados y elévala. Con la ayuda de tu mano izquierda, guía suavemente la rodilla derecha cruzando la línea media de tu cuerpo hacia el suelo del lado izquierdo, manteniendo el hombro derecho firmemente pegado al piso. Respiración: Inhala en la posición inicial y exhala prolongadamente mientras dejas que el peso de la rodilla caiga hacia el lateral descontracturando la espalda baja. Duración/Reps: Sostén de forma totalmente estática por 25 segundos, luego cambia de lado."
          },
          {
            "name": "Colgado Asistido Descompresivo",
            "desc": "STALLBAR - Posición inicial: Colócate de frente a la espaldera. Sujeta firmemente una de las barras superiores con ambas manos utilizando un agarre prono al ancho de tus hombros, asegurándote de que tus brazos queden completamente extendidos por encima de tu cabeza. Ejecución: Deja caer el peso de tu cuerpo de manera vertical, pero manteniendo las puntas de tus pies apoyadas sutilmente en el suelo o en una barra inferior muy baja. Flexiona ligeramente las rodillas permitiendo que la columna se estire y se descomprima por gravedad de forma pasiva. Respiración: Mantén una respiración abdominal muy lenta; inhala expandiendo el abdomen y exhala soltando toda la musculatura lumbar. Duración/Reps: Quédate suspendido de forma estática durante 30 segundos completos."
          }
        ]
      },
      "midback": {
        "warmup": [
          {
            "name": "Deslizamientos en Pared (Wall Angels)",
            "desc": "Posición inicial: Apóyate de espaldas contra una pared lisa, asegurando que tus glúteos, espalda alta y la parte posterior de tu cabeza estén en contacto firme con la superficie. Eleva los brazos flexionando los codos a 90 grados para formar una posición de saludo militar, tocando la pared con los dorsos y codos. Ejecución: Manteniendo todos los puntos de contacto pegados a la pared, desliza los brazos hacia arriba de forma controlada hasta estirarlos por encima de la cabeza, buscando que las manos se junten. Desciende contrayendo activamente la musculatura interescapular de la espalda media. Respiración: Exhala al deslizar los brazos hacia arriba aplicando fuerza e inhala profundamente al regresar a los 90 grados. Duración/Reps: Realiza de 10 a 12 repeticiones lentas y deliberadas."
          },
          {
            "name": "Desplazamiento Escapular de Pie",
            "desc": "Posición inicial: Ponte de pie de manera erguida, extiende ambos brazos completamente hacia el frente a la altura de tus hombros con las palmas de las manos mirándose entre sí y los codos bloqueados por completo. Ejecución: Realiza un movimiento puramente escapular aislando la espalda media. Empuja tus brazos hacia adelante separando las escápulas al máximo (protracción). Inmediatamente después, jala los hombros hacia atrás apretando fuertemente los omóplatos entre sí (retracción) sin doblar los codos en ningún momento. Respiración: Inhala al empujar los brazos al frente separando escápulas y exhala al juntarlas atrás contrayendo la espalda media. Duración/Reps: Completa 15 repeticiones fluidas marcando ambos extremos."
          }
        ],
        "stretch": [
          {
            "name": "Estiramiento del Enhebrado de Aguja",
            "desc": "Posición inicial: Colócate en posición de cuadrupedia sobre un tapete con las rodillas alineadas bajo las caderas y las manos bajo los hombros. Ejecución: Eleva el brazo derecho hacia el techo abriendo el torso. De forma fluida, pasa o 'enhebra' el brazo derecho por debajo de tu pecho hacia el lado izquierdo, deslizando el dorso de la mano por el suelo hasta apoyar el hombro derecho y tu mejilla derecha sobre el mat, estirando los romboides de la espalda media. Respiración: Inhala profundo al abrir el brazo y exhala de forma prolongada al deslizarlo y rendir el peso de tu torso sobre el hombro apoyado. Duración/Reps: Mantén la posición estática durante 20 a 30 segundos por cada lado corporal."
          },
          {
            "name": "Estiramiento de Espalda Media con Brazos Cruzados al Frente",
            "desc": "Posición inicial: Ponte de pie con las piernas separadas al ancho de los hombros y las rodillas ligeramente flexionadas para dar estabilidad a la pelvis. Ejecución: Extiende los brazos al frente y cruza tus muñecas entrelazando fuertemente los dedos de tus manos. Desde esa posición, empuja tus manos hacia adelante con energía a la vez que metes la cabeza entre tus brazos y empujas voluntariamente tu espalda media hacia atrás, redondeando la zona dorsal para separar los omóplatos. Respiración: Inhala profundo dirigiendo el aire hacia la parte posterior de tus costillas y exhala incrementando la tracción opuesta. Duración/Reps: Sostén la tensión estática controlada durante 20 a 30 segundos continuos."
          },
          {
            "name": "Tracción Escapular con Pies Apoyados",
            "desc": "STALLBAR - Posición inicial: Colócate de frente a la espaldera a una distancia de un paso corto. Sujeta firmemente con ambas manos en agarre prono una de las barras que se encuentre a la altura de tu pecho o esternón. Ejecución: Manteniendo los pies fijos en el suelo, flexiona las rodillas y empuja tus caderas hacia atrás y hacia abajo, dejando caer todo el peso de tu torso hacia atrás. Extiende los brazos por completo de modo que la tracción de la barra separe activamente tus escápulas y estire profundamente la espalda media. Respiración: Inhala expandiendo la zona torácica posterior y exhala soltando la tensión muscular permitiendo que el cuerpo cuelgue atrás de forma pasiva. Duración/Reps: Sostén el estiramiento estático durante 25 a 30 segundos."
          }
        ]
      },
      "lats": {
        "warmup": [
          {
            "name": "Transición de Plancha Alta a Perro Boca Abajo",
            "desc": "Posición inicial: Colócate en posición de plancha alta sobre un tapete, con las manos apoyadas firmemente debajo de los hombros, el abdomen contraído y las piernas extendidas al ancho de las caderas. Ejecución: Empuja el suelo con las palmas de tus manos de forma dinámica elevando tus caderas hacia el techo y desplazando el peso de tu cuerpo hacia los talones, formando una 'V' invertida (Perro boca abajo). Hunde la cabeza entre tus brazos estirando activamente los dorsales y regresa controladamente a la plancha. Respiración: Inhala en la posición de plancha alta y exhala con fuerza al empujar las caderas hacia arriba y elongar la cadena lateral. Duración/Reps: Realiza la transición dinámica entre 10 y 12 repeticiones continuas."
          },
          {
            "name": "Inclinaciones Laterales en Flecha",
            "desc": "Posición inicial: Ponte de pie de manera completamente erguida, con los pies juntos y el core firme. Eleva ambos brazos de forma vertical por encima de tu cabeza y entrelaza las manos apuntando con los dedos índices hacia el techo (posición de flecha). Ejecución: Manteniendo los brazos perfectamente estirados al lado de tus orejas y la pelvis fija al centro, realiza una inclinación lateral dinámica de tu torso hacia el lado derecho estirando las fibras del dorsal izquierdo. Regresa al centro y cambia inmediatamente al lado opuesto de forma fluida. Respiración: Inhala profundamente al estar en el centro vertical y exhala al realizar la inclinación lateral dinámica hacia cada costado. Duración/Reps: Completa un total de 16 a 20 inclinaciones alternadas de forma rítmica."
          }
        ],
        "stretch": [
          {
            "name": "Estiramiento Lateral del Dorsal en Pared",
            "desc": "Posición inicial: Colócate de pie lateralmente a una pared regular a una distancia aproximada de un paso largo. Cruza la pierna interna por detrás de tu pierna externa de forma estable. Ejecución: Eleva el brazo interno y apoya la palma de la mano en una posición alta sobre la pared. Coloca la mano externa en tu cadera y empuja activamente tus caderas hacia el lado de la pared, permitiendo que tu torso se incline en sentido contrario, abriendo e instalando un estiramiento profundo a lo largo de toda la línea fascial del dorsal ancho. Respiración: Mantén una respiración profunda; exhala lentamente cada vez que empujes la cadera lateralmente incrementando la tensión. Duración/Reps: Sostén la postura de manera estática durante 20 a 30 segundos, luego gira y repite con el lado contrario."
          },
          {
            "name": "Postura de Cachorro con Codos Apoyados",
            "desc": "Posición inicial: Colócate de rodillas sobre un tapete con las caderas alineadas verticalmente sobre ellas. Extiende los brazos al frente y apoya únicamente los codos sobre el suelo separados al ancho de tus hombros, juntando las palmas de tus manos. Ejecución: Desplaza sutilmente tus glúteos hacia atrás manteniendo la cadera alta y hunde de manera pasiva tu pecho y tus axilas hacia el piso. Lleva tus manos juntas por detrás de tu cabeza apuntando al techo, logrando un aislamiento biomecánico profundo del dorsal ancho bajo flexión de hombro. Respiración: Inhala inflando el tórax de aire y exhala relajando la articulación del hombro, dejando que el pecho baje más por gravedad. Duración/Reps: Quédate en esta posición estática durante 25 a 35 segundos de forma relajada."
          },
          {
            "name": "Dorsales Inclinado en Barra Media",
            "desc": "STALLBAR - Posición inicial: Colócate de frente a la espaldera a una distancia aproximada de dos pasos largos. Separa los pies al ancho de tus hombros y sujeta firmemente con ambas manos en agarre prono una barra que esté a la altura de tu pecho. Ejecución: Manteniendo las piernas estiradas o semi-flexionadas según tu flexibilidad, empuja tus caderas hacia atrás con fuerza mientras dejas caer el torso hacia adelante, quedando paralelo al suelo entre tus brazos extendidos. Hunde activamente las axilas hacia el piso de forma que el soporte de la barra traccione longitudinalmente ambos dorsales de manera pasiva. Respiración: Inhala profundo y exhala prolongadamente permitiendo que la articulación del hombro y el dorsal se elonguen por la gravedad. Duración/Reps: Sostén la posición estática durante 25 a 30 segundos continuos."
          }
        ]
      },
      "traps": {
        "warmup": [
          {
            "name": "Encogimientos Escapulares Dinámicos",
            "desc": "Posición inicial: Ponte de pie de manera completamente erguida, con los pies separados al ancho de las caderas, la mirada fija al frente y los brazos colgando relajados a ambos lados de tus muslos con los puños ligeramente cerrados. Ejecución: Eleva tus hombros de manera estrictamente vertical hacia tus orejas lo más alto posible de forma controlada pero dinámica, buscando la contracción del trapecio superior. Sostén la contracción medio segundo en la cima y desciende los hombros por completo hasta el punto inicial. Respiración: Exhala al encoger los hombros aplicando la fuerza concéntrica e inhala al descenderlos de forma controlada. Duración/Reps: Completa entre 15 y 20 repeticiones rítmicas manteniendo los codos bloqueados."
          },
          {
            "name": "Depresiones Escapulares Activas de Pie",
            "desc": "Posición inicial: Ponte de pie de forma erguida, con las piernas estables y los brazos extendidos hacia el suelo a los lados del cuerpo, manteniendo una postura alineada. Ejecución: Realiza de manera voluntaria y controlada un movimiento de depresión escapular. Empuja tus hombros activamente hacia el suelo alejándolos lo más posible de tus orejas, sintiendo la activación de las fibras inferiores del trapecio. Sostén la tensión un segundo abajo y regresa a la posición neutral. Respiración: Exhala al deprimir y empujar los hombros hacia abajo maximizando la contracción muscular e inhala al relajar al centro. Duración/Reps: Realiza de 12 a 15 repeticiones de manera consciente."
          }
        ],
        "stretch": [
          {
            "name": "Estiramiento del Trapecio Superior Asistido",
            "desc": "Posición inicial: Ponte de pie o siéntate en una silla manteniendo la columna totalmente erguida. Lleva tu brazo derecho por detrás de tu espalda baja, flexionando el codo para fijar e inmovilizar el hombro derecho hacia abajo. Ejecución: Coloca tu mano izquierda sobre el costado derecho de tu cabeza. Aplica una tracción lateral suave y constante guiando tu oreja izquierda hacia tu hombro izquierdo, sintiendo la elongación lineal de las fibras superiores del trapecio derecho. Respiración: Inhala manteniendo la alineación espinal y exhala prolongadamente liberando la tensión del cuello durante la tracción manual. Duración/Reps: Sostén la postura de forma estática por 20 a 30 segundos por cada lado del cuello."
          },
          {
            "name": "Estiramiento de Trapecio Medio Cruzando Hombros",
            "desc": "Posición inicial: Ponte de pie de manera erguida con las piernas separadas al ancho de las caderas y el abdomen ligeramente activo. Ejecución: Eleva tus brazos al frente, cruza tus antebrazos y sujeta firmemente con tus manos tus hombros opuestos (brazo derecho sujeta hombro izquierdo y viceversa). Desde este agarre, jala tus hombros de manera cruzada hacia adelante a la vez que flexionas levemente tu cabeza y empujas tus codos hacia abajo, estirando las fibras medias del trapecio. Respiración: Realiza respiraciones profundas e intercostales, exhalando de manera lenta para disipar la rigidez acumulada entre los omóplatos. Duración/Reps: Mantén la posición fija durante 20 a 25 segundos continuos."
          },
          {
            "name": "Trapecio Superior por Inclinación Lateral",
            "desc": "STALLBAR - Posición inicial: Colócate de pie lateralmente a la espaldera a una distancia aproximada de un paso corto. Mantén una postura erguida y sujeta firmemente con la mano interna una de las barras situadas a la altura de tu cintura o cadera. Ejecución: Manteniendo el brazo de agarre completamente estirado, desplaza tus pies y tu peso corporal de forma lateral hacia el exterior (alejándote de las barras) de modo que tu brazo interno quede tenso deprimiendo el hombro de forma pasiva. Al mismo tiempo, inclina tu cabeza hacia el hombro externo para maximizar el estiramiento del trapecio superior. Respiración: Inhala profundo y exhala prolongadamente permitiendo que el peso de tu propio cuerpo traccione y elongue el trapecio de manera pasiva. Duración/Reps: Mantén la inclinación estática durante 20 a 30 segundos por lado."
          }
        ]
      },
      "quads": {
        "warmup": [
          {
            "name": "Sentadillas Libres a Ritmo Controlado",
            "desc": "Posición inicial: Ponte de pie de manera erguida, con los pies separados un poco más allá del ancho de los hombros y las puntas ligeramente rotadas hacia afuera, manteniendo los brazos al frente para balancearte. Ejecución: Inicia el descenso flexionando simultáneamente las caderas y las rodillas de forma controlada tardando 3 segundos en bajar, asegurando que las rodillas sigan la línea de los pies hasta romper el paralelo (sentadilla profunda). Sube de forma explosiva contrayendo los cuádriceps al máximo. Respiración: Inhala profundamente al iniciar el descenso llenando el abdomen y exhala con fuerza al completar la extensión de piernas de subida. Duración/Reps: Realiza de 12 a 15 repeticiones de manera continua."
          },
          {
            "name": "Desplantes Inversos Dinámicos",
            "desc": "Posición inicial: Ponte de pie con la espalda erguida, los pies juntos y las manos colocadas fijas sobre tus caderas para asegurar la estabilidad pélvica. Ejecución: Da un paso largo hacia atrás con tu pierna derecha de forma fluida. Flexiona ambas rodillas simultáneamente hasta que la rodilla trasera casi roce el suelo y la rodilla delantera quede flexionada exactamente a 90 grados. Empuja con fuerza el pie delantero para regresar dinámicamente al inicio y alterna de pierna. Respiración: Inhala al dar el paso atrás y descender el centro de gravedad, y exhala al regresar a la posición inicial de pie. Duración/Reps: Completa un total de 16 a 20 desplantes alternados (8-10 por pierna)."
          }
        ],
        "stretch": [
          {
            "name": "Estiramiento de Cuádriceps Acostado Boca Abajo",
            "desc": "Posición inicial: Acuéstate por completo boca abajo sobre un tapete, manteniendo las piernas extendidas y la frente apoyada cómodamente sobre tu mano izquierda. Ejecución: Flexiona la rodilla derecha hacia atrás llevando el talón en dirección al glúteo. Sujeta el empeine o el tobillo derecho con tu mano derecha y jálalo suavemente hacia abajo. Presiona activamente tu pelvis contra el suelo para bloquear la columna lumbar e aislar por completo el recto anterior del cuádriceps. Respiración: Respira de manera lenta y profunda; exhala de forma prolongada disipando la tensión del muslo para permitir una mayor aproximación del talón. Duración/Reps: Sostén la posición de estiramiento estático durante 25 a 30 segundos por pierna."
          },
          {
            "name": "Estiramiento de Cuádriceps Clásico de Pie",
            "desc": "Posición inicial: Ponte de pie de manera erguida cerca de una estructura o pared para apoyarte con una mano y mantener el equilibrio perfecto. Ejecución: Flexiona la rodilla externa hacia atrás elevando el pie. Sujeta el empeine con la mano libre y jala el talón firmemente hacia tu glúteo. Mantén ambas rodillas juntas y alineadas en paralelo, y empuja voluntariamente tu cadera hacia el frente para acentuar el estiramiento en la cara anterior del muslo. Respiración: Inhala hondo manteniendo el torso erguido y exhala relajando las fibras musculares del cuádriceps sometido a tensión. Duración/Reps: Mantén el estiramiento totalmente estático durante 20 a 30 segundos por cada pierna."
          },
          {
            "name": "Couch Stretch Asistido",
            "desc": "STALLBAR - Posición inicial: Colócate de espaldas a la espaldera y colócate en posición de rodillas sobre un tapete. Coloca la rodilla derecha directamente en el suelo junto a la base y apoya el empeine derecho de forma vertical contra la primera o segunda barra inferior. Ejecución: Da un paso largo hacia adelante con tu pierna izquierda apoyando el pie plano en un ángulo de 90 grados. Eleva lentamente tu torso hasta quedar completamente erguido, empujando tus caderas hacia adelante y tu espalda hacia la espaldera, sintiendo un estiramiento masivo en el cuádriceps y psoas derecho. Respiración: Realiza exhalaciones muy largas y pausadas para tolerar la intensidad del estiramiento pasivo profundo. Duración/Reps: Mantén la postura estática durante 25 a 30 segundos por pierna."
          }
        ]
      },
      "hamstrings": {
        "warmup": [
          {
            "name": "Buenos Días Dinámicos con Manos en Nuca",
            "desc": "Posición inicial: Ponte de pie de manera erguida con las piernas separadas al ancho de los hombros y las rodillas apenas flexionadas (desbloqueadas). Coloca las manos entrelazadas detrás de tu nuca abriendo los codos. Ejecución: Realiza una bisagra de cadera empujando tus glúteos de forma exagerada hacia atrás mientras flexionas el torso hacia adelante de manera fluida, manteniendo la espalda completamente plana y recta hasta quedar casi paralelo al suelo. Sentirás la activación excéntrica de los isquiotibiales. Regresa extendiendo la cadera con energía. Respiración: Inhala profundamente al flexionar el torso hacia adelante estirando los femorales y exhala al contraer glúteos para volver arriba. Duración/Reps: Completa de 12 a 15 repeticiones controladas sin prisa."
          },
          {
            "name": "Patadas Frankenstein Dinámicas",
            "desc": "Posición inicial: Ponte de pie de manera erguida al inicio de un pasillo corto, con los pies separados al ancho de las caderas y ambos brazos extendidos al frente horizontalmente a la altura de tus hombros de forma fija. Ejecución: Avanza dando un paso al frente y eleva la pierna contraria (completamente estirada con la rodilla bloqueada) de forma balística pero controlada hacia el frente y arriba, buscando tocar la palma de tu mano opuesta con la punta del pie. Baja la pierna y avanza alternando el movimiento. Respiración: Exhala con fuerza en el momento explosivo de elevar la pierna de forma dinámica e inhala al descender y dar el paso de apoyo. Duración/Reps: Realiza de 10 a 12 patadas por pierna en caminata continua."
          }
        ],
        "stretch": [
          {
            "name": "Estiramiento de Isquiotibiales con Banda en Suelo",
            "desc": "Posición inicial: Acuéstate boca arriba sobre un tapete con ambas piernas extendidas y la columna perfectamente apoyada. Flexiona la pierna derecha y coloca una banda o correa elástica resistente rodeando el metatarso de tu pie derecho. Ejecución: Sujeta los extremos de la banda con ambas manos y extiende la pierna derecha verticalmente hacia el techo con la rodilla bloqueada por completo. Jala de la banda de manera progresiva atrayendo la pierna estirada hacia tu torso hasta alcanzar un punto de tensión óptimo en la cadena posterior. Respiración: Inhala profundo reteniendo la base e exhala de forma prolongada jalando suavemente la banda para ganar rango pasivo. Duración/Reps: Sostén el estiramiento fijo y estático de 25 a 30 segundos antes de cambiar de pierna."
          },
          {
            "name": "Estiramiento Isquiotibial Unilateral en Banco",
            "desc": "Posición inicial: Ponte de pie frente a un banco estable, silla o plataforma baja que se encuentre a la altura aproximada de tu rodilla o muslo medio. Ejecución: Coloca el talón de tu pierna derecha sobre la plataforma manteniendo esa pierna completamente estirada y los dedos del pie apuntando al techo. Con las manos en las caderas, inclina tu torso hacia adelante desde la articulación de la cadera, proyectando tu pecho hacia tu rodilla derecha con la espalda recta. Respiración: Respira con calma; exhala profundamente en cada avance del torso permitiendo que las fibras femorales cedan a la tracción. Duración/Reps: Mantén la posición de inclinación estática durante 20 a 30 segundos continuos por lado."
          },
          {
            "name": "Femoral Elevado en Barra Media",
            "desc": "STALLBAR - Posición inicial: Colócate de frente a la espaldera a la distancia aproximada de una pierna. Eleva tu pierna derecha y apoya firmemente el talón sobre una de las barras que se encuentre a una altura cómoda (nivel medio de la cadera o muslo). Ejecución: Asegúrate de que la rodilla de la pierna elevada esté completamente bloqueada y recta. Manteniendo la espalda erguida, inclina lentamente tu torso hacia adelante desde la cadera, deslizando tus manos por la barra o por tu pierna buscando la punta del pie de manera pasiva. Respiración: Inhala profundo expandiendo el tórax y exhala de forma sostenida relajando los isquiotibiales de la pierna elevada. Duración/Reps: Sostén el estiramiento estático durante 20 a 30 segundos por cada pierna."
          }
        ]
      },
      "glutes": {
        "warmup": [
          {
            "name": "Puentes de Glúteo Dinámicos con Pausa",
            "desc": "Posición inicial: Acuéstate boca arriba sobre un tapete con las rodillas flexionadas, los pies apoyados planos en el suelo separados al ancho de las caderas y los brazos relajados a los lados de tu cuerpo. Ejecución: Empuja firmemente el suelo con tus talones para elevar tus caderas verticalmente hacia el techo hasta formar una línea recta desde tus rodillas hasta tus hombros. Contrae fuertemente los glúteos en la cima sosteniendo la posición durante un segundo completo, y desciende rozando el mat de forma dinámica. Respiración: Exhala con fuerza al elevar la cadera contrayendo los glúteos e inhala al descender de forma controlada al suelo. Duración/Reps: Realiza de 15 a 20 repeticiones continuas marcando la pausa superior."
          },
          {
            "name": "Patadas Hidrantes en Cuadrupedia",
            "desc": "Posición inicial: Colócate en posición de cuadrupedia sobre un tapete, con las manos apoyadas bajo los hombros y las rodillas alineadas directamente bajo las caderas con el abdomen firme. Ejecución: Manteniendo la rodilla derecha flexionada exactamente en un ángulo de 90 grados, eleva la pierna de forma lateral hacia el costado derecho abriendo la cadera tanto como sea posible sin rotar el torso ni doblar los brazos. Sostén un instante y regresa de forma dinámica. Respiración: Exhala al elevar la pierna de forma lateral activando el glúteo medio e inhala al descender controladamente a la posición inicial. Duración/Reps: Realiza de 12 a 15 repeticiones completas por cada lado corporal."
          }
        ],
        "stretch": [
          {
            "name": "Figura 4 Acostado Boca Arriba",
            "desc": "Posición inicial: Acuéstate boca arriba sobre un tapete con las rodillas flexionadas y los pies apoyados planos. Cruza tu tobillo derecho sobre la rodilla izquierda, formando una figura en forma de '4' con tus piernas. Ejecución: Eleva el pie izquierdo del suelo, pasa tu mano derecha por el espacio entre tus piernas y tu mano izquierda por fuera para abrazar firmemente la parte posterior de tu muslo izquierdo. Jala el muslo de forma progresiva hacia tu pecho, sintiendo un estiramiento profundo en el glúteo y piramidal derecho. Respiración: Inhala profundo en el mat y exhala de forma prolongada incrementando sutilmente la tracción manual hacia el pecho. Duración/Reps: Sostén de manera totalmente estática durante 25 a 30 segundos continuos por cada lado."
          },
          {
            "name": "Postura de la Paloma Pasiva en Suelo",
            "desc": "Posición inicial: Colócate en posición de cuadrupedia sobre un tapete. Desplaza tu rodilla derecha hacia adelante colocándola justo detrás de tu mano derecha, y rota tu espinilla hacia el centro cruzando el pie. Ejecución: Desliza tu pierna izquierda completamente estirada hacia atrás de forma que tus caderas desciendan hacia el suelo. Manteniendo la pelvis alineada al centro, baja lentamente tu torso apoyando los antebrazos o la frente sobre el tapete por encima de tu pierna flexionada, rindiendo el peso de forma pasiva sobre el glúteo. Respiración: Respira de forma pausada y diafragmática, exhalando profundamente para liberar la rigidez de la cadera. Duración/Reps: Quédate en esta postura estática durante 30 a 40 segundos, luego alterna de pierna."
          },
          {
            "name": "Figura 4 de Pie con Sentadilla Asistida",
            "desc": "STALLBAR - Posición inicial: Colócate de frente a la espaldera a una distancia de un paso corto. Separa los pies al ancho de las caderas y sujeta firmemente una de las barras a nivel del pecho con ambas manos para tener soporte. Ejecución: Eleva la pierna derecha y cruza el tobillo derecho sobre el muslo izquierdo justo por encima de la rodilla, formando un '4'. Manteniendo el agarre firme en la barra, empuja tus glúteos hacia atrás y flexiona la rodilla izquierda bajando el centro de gravedad en una sentadilla asistida pasiva, estirando intensamente el glúteo derecho. Respiración: Inhala estabilizando la postura vertical y exhala descendiendo la cadera de forma pasiva y estática hacia el suelo. Duración/Reps: Sostén la posición estática durante 20 a 30 segundos por cada pierna."
          }
        ]
      },
      "calves": {
        "warmup": [
          {
            "name": "Saltos Cortos sobre Metatarsos (Pogo Hops)",
            "desc": "Posición inicial: Ponte de pie con una postura totalmente erguida, los pies juntos, el core firme y las manos colocadas fijas sobre tus caderas. Ejecución: Inicia una serie de saltos cortos, rápidos y verticales de forma continua utilizando exclusivamente la articulación del tobillo. Mantén las rodillas rígidas (mínima flexión) para transferir toda la energía de forma elástica a través de los gemelos y el tendón de Aquiles, amortiguando y rebotando en metatarsos. Respiración: Mantén una respiración corta, rítmica y fluida de manera natural adaptada a los saltos. Duración/Reps: Realiza los saltos continuos durante 30 segundos manteniendo la cadencia."
          },
          {
            "name": "Elevaciones de Talón de Pie Continuas",
            "desc": "Posición inicial: Ponte de pie de manera erguida, con los pies paralelos separados al ancho de las caderas y las manos en la cintura o apoyadas ligeramente en una pared para estabilidad. Ejecución: Eleva tus talones con fuerza de forma dinámica quedando apoyado completamente sobre los metatarsos (en puntas de pie), contrayendo voluntariamente los gemelos al máximo en la cima. Sostén medio segundo y desciende los talones controladamente rozando el suelo antes de repetir de inmediato de forma rítmica. Respiración: Exhala al elevarte hacia las puntas de los pies contrayendo el músculo e inhala al descender de forma controlada. Duración/Reps: Realiza de 15 a 20 repeticiones continuas con ritmo constante."
          }
        ],
        "stretch": [
          {
            "name": "Estiramiento de Gemelo en Escalón Pasivo",
            "desc": "Posición inicial: Colócate de pie sobre el borde de un escalón estable o plataforma elevada, apoyando firmemente únicamente la mitad delantera de tus pies (metatarsos) y dejando los talones suspendidos al aire. Ejecución: Manteniendo la rodilla de la pierna derecha completamente estirada y bloqueada, deja caer de forma pasiva y lenta el talón derecho hacia abajo por debajo del nivel del escalón, permitiendo que la gravedad traccione el gastrocnemio de forma profunda. La otra pierna puede quedar semi-flexionada como apoyo. Respiración: Inhala profundo reteniendo la postura fija y exhala soltando el aire lentamente, cediendo más al peso del talón. Duración/Reps: Mantén la posición de dorsiflexión estática durante 25 a 30 segundos por cada pierna."
          },
          {
            "name": "Estiramiento de Gemelo contra Pared con Pierna Recta",
            "desc": "Posición inicial: Colócate de pie frente a una pared a la distancia de tus brazos extendidos. Apoya ambas palmas sobre la pared a la altura de tus hombros para soporte estructural. Ejecución: Da un paso largo hacia atrás con tu pierna derecha de forma estable. Manteniendo la rodilla derecha completamente recta y bloqueada y el talón derecho firmemente pegado al suelo, inclina tu torso y tu pelvis hacia adelante avanzando hacia la pared hasta sentir la elongación del gemelo derecho. Respiración: Respira de manera pausada; exhala profundamente en cada avance del torso buscando clavar más el talón contra el piso. Duración/Reps: Sostén el estiramiento estático durante 20 a 30 segundos por pierna."
          },
          {
            "name": "Gemelo en Barra Inferior con Descenso de Talón",
            "desc": "STALLBAR - Posición inicial: Colócate de frente a la espaldera a una distancia corta de medio paso. Sujeta una de las barras a nivel del pecho con ambas manos para asegurar el equilibrio. Ejecución: Eleva el pie derecho y apoya firmemente la mitad delantera (metataro) sobre la primera barra inferior, dejando el talón libre apuntando hacia atrás. Manteniendo la rodilla derecha completamente bloqueada y estirada, deja caer el talón derecho hacia el suelo de manera pasiva por acción de la gravedad, estirando el gastrocnemio. Respiración: Inhala profundo manteniendo el core estable y exhala prolongadamente relajando el tendón de Aquiles para ganar rango. Duración/Reps: Sostén el estiramiento estático durante 25 segundos por pierna."
          }
        ]
      },
      "soleus": {
        "warmup": [
          {
            "name": "Elevación de Talones Sentado al Aire",
            "desc": "Posición inicial: Siéntate en una silla, banco o sobre un mat manteniendo las rodillas flexionadas exactamente a 90 grados y los pies apoyados planos en el suelo con el torso erguido. Ejecución: Al flexionar las rodillas a 90 grados el gastrocnemio entra en insuficiencia activa, aislando el sóleo. Eleva tus talones al máximo de forma rítmica y continua quedando apoyado puramente sobre los metatarsos. Aprieta un instante arriba y desciende de forma controlada sin rebotar. Respiración: Mantén una respiración natural; exhala al subir los talones contrayendo el sóleo e inhala al descenderlos. Duración/Reps: Completa entre 20 y 25 repeticiones fluidas debido al alto porcentaje de fibras lentas de este músculo."
          },
          {
            "name": "Balanceo de Rodilla hacia Adelante en Cuclillas",
            "desc": "Posición inicial: Colócate en una posición de cuclillas profunda sobre un tapete, manteniendo los pies separados al ancho de los hombros y buscando apoyar los talones en el suelo o lo más cerca posible. Ejecución: Sin levantar los talones del piso, desplaza de forma dinámica todo el peso de tu torso hacia adelante y hacia tu rodilla derecha, forzando un avance frontal de esa rodilla sobre la punta del pie para movilizar el sóleo en cadena cerrada. Regresa al centro y balancéate hacia el lado izquierdo. Respiración: Exhala al balancearte hacia adelante presionando la articulación del tobillo e inhala al retornar al centro. Duración/Reps: Realiza el balanceo dinámico alternado durante 30 a 45 segundos."
          }
        ],
        "stretch": [
          {
            "name": "Estiramiento de Sóleo contra Pared con Rodilla Flexionada",
            "desc": "Posición inicial: Colócate de pie de frente a una pared a un paso corto de distancia, apoyando las manos en ella para soporte. Ejecución: Da un paso corto hacia atrás con tu pierna derecha. A diferencia del estiramiento de gemelo clásico, flexiona ligeramente la rodilla derecha (trasera) desplazando el peso hacia abajo, pero asegurándote de mantener el talón derecho firmemente clavado en el piso. Esta flexión elimina la tensión del gastrocnemio y aísla el sóleo bajo. Respiración: Inhala profundo en la postura y exhala liberando la rigidez del tendón bajo, incrementando sutilmente la flexión de la rodilla posterior. Duración/Reps: Sostén la posición estática durante 20 a 30 segundos por cada pierna."
          },
          {
            "name": "Estiramiento de Sóleo en Cuclillas con Apoyo",
            "desc": "Posición inicial: Colócate en una posición de arrodillado unilateral sobre un tapete (una rodilla apoyada atrás y el pie izquierdo al frente plano en el suelo en un ángulo cerrado). Ejecución: Apoya tu pecho y el peso de tu torso directamente sobre tu muslo izquierdo. Desplaza voluntariamente tu rodilla izquierda hacia adelante forzándola a pasar la línea de los dedos del pie, asegurándote de ejercer presión con tu torso hacia abajo para que el talón izquierdo jamás se despegue del suelo. Respiración: Realiza respiraciones lentas; exhala rindiendo el peso del cuerpo sobre el muslo frontal para profundizar la dorsiflexión. Duración/Reps: Sostén la postura estática por 25 segundos por pierna."
          },
          {
            "name": "Sóleo Profundo Asistido en Barra Inferior",
            "desc": "STALLBAR - Posición inicial: Colócate de frente a la espaldera a una distancia muy corta. Sujeta firmemente una de las barras a nivel del pecho con ambas manos para asegurar tu estabilidad. Ejecución: Coloca el metatarso del pie derecho apoyado sobre la primera barra inferior dejando el talón libre. A continuación, flexiona la rodilla derecha en un ángulo de aproximadamente 30 a 45 grados. Manteniendo fija esa flexión de rodilla, deja caer el talón derecho hacia el suelo de manera pasiva, logrando un estiramiento profundo y aislado del sóleo. Respiración: Inhala hondo manteniendo la flexión articular estable y exhala soltando la tensión del tendón de Aquiles y el sóleo bajo. Duración/Reps: Sostén el estiramiento estático durante 25 segundos por pierna."
          }
        ]
      },
      "abs": {
        "warmup": [
          {
            "name": "Escarabajo Muerto (Dead Bug) Básico",
            "desc": "Posición inicial: Acuéstate boca arriba sobre un tapete. Eleva las rodillas flexionadas a 90 grados sobre tus caderas y extiende ambos brazos verticalmente apuntando hacia el techo, pegando la espalda baja al suelo. Ejecución: Manteniendo la zona lumbar firmemente presionada contra el mat de forma isométrica, extiende el brazo derecho hacia atrás por encima de tu cabeza y simultáneamente estira la pierna izquierda hacia el frente rozando el suelo. Regresa al centro de forma controlada y alterna de lado. Respiración: Exhala profundamente al extender las extremidades activando el transverso del abdomen e inhala al regresar a los 90 grados al centro. Duración/Reps: Realiza de 12 a 16 repeticiones controladas alternadas."
          },
          {
            "name": "Plancha Alta con Toques de Hombro",
            "desc": "Posición inicial: Colócate en posición de plancha alta sobre un tapete con las manos apoyadas bajo los hombros, los pies separados al ancho del tapete para estabilidad y el core totalmente bloqueado en línea recta. Ejecución: Manteniendo la pelvis perfectamente fija y paralela al suelo sin balanceos, eleva la mano derecha de forma fluida y toca el hombro izquierdo. Regresa la mano al suelo y levanta inmediatamente la mano izquierda para tocar el hombro derecho de forma dinámica y anti-rotacional. Respiración: Mantén una respiración corta y constante, exhalando en cada toque de hombro donde se incrementa la inestabilidad. Duración/Reps: Realiza los toques de hombro continuos durante 30 a 45 segundos."
          }
        ],
        "stretch": [
          {
            "name": "Postura de la Cobra Estática en Suelo",
            "desc": "Posición inicial: Acuéstate por completo boca abajo sobre un tapete, manteniendo las piernas extendidas hacia atrás y apoyando las palmas de las manos en el piso justo a los lados de tu pecho. Ejecución: Empuja el suelo firmemente con las palmas extendiendo los codos de forma progresiva para elevar tu torso hacia arriba. Mantén la pelvis en contacto estrecho con el tapete y los hombros deprimidos (alejados de las orejas), permitiendo que toda la pared anterior del recto abdominal se estire de forma lineal. Respiración: Inhala profundamente expandiendo la cavidad abdominal para potenciar el estiramiento fascial anterior y exhala liberando la tensión lumbar. Duración/Reps: Sostén la posición estática durante 20 a 30 segundos continuos."
          },
          {
            "name": "Estiramiento Corporal Completo en Supino",
            "desc": "Posición inicial: Acuéstate boca arriba sobre un tapete con las piernas totalmente extendidas y juntas, y la columna relajada en su posición neutral. Ejecución: Eleva ambos brazos hacia atrás por encima de tu cabeza apoyando los dorsos en el suelo. Desde esta posición, estira activamente tus manos hacia la pared posterior y las puntas de tus pies hacia la pared frontal simultáneamente, creando una línea de tracción opuesta que estira pasivamente toda la musculatura del core y la fascia anterior. Respiración: Inhala hondo llenando al máximo tus pulmones y abdomen de aire y exhala relajando por completo todo el cuerpo en el mat. Duración/Reps: Mantén la tracción estática longitudinal por 30 segundos."
          },
          {
            "name": "Cobra Abdominal Asistida en Barra Baja",
            "desc": "STALLBAR - Posición inicial: Acuéstate boca abajo sobre un tapete colocado de frente a la espaldera, de modo que tu cabeza quede a una distancia muy corta de la base de la estructura. Ejecución: Extiende tus brazos al frente y sujeta firmemente con ambas manos la primera o segunda barra inferior. Utilizando ese punto fijo, empuja con fuerza extendiendo tus codos para elevar tu torso del suelo de manera vertical, manteniendo las caderas y piernas relajadas pegadas al tapete para lograr un estiramiento masivo y controlado del abdomen anterior. Respiración: Inhala profundo al elevar el torso forzando la apertura de la pared abdominal y exhala descendiendo la cadera de forma pasiva. Duración/Reps: Sostén la posición estática durante 20 a 30 segundos."
          }
        ]
      },
      "forearms": {
        "warmup": [
          {
            "name": "Pulsaciones Rápidas de Apertura de Manos (Air Flashes)",
            "desc": "Posición inicial: Ponte de pie de manera erguida y extiende ambos brazos completamente hacia el frente de forma horizontal a la altura de tus hombros, con las manos inicialmente cerradas en un puño. Ejecución: Abre y cierra las manos de forma explosiva y a la máxima velocidad posible, separando los dedos por completo en cada apertura y volviendo a cerrar el puño con firmeza. Este movimiento genera un bombeo de sangre inmediato en la musculatura flexora y extensora de los antebrazos. Respiración: Mantén una respiración constante y rítmica sin interrumpirla a pesar de la fatiga muscular acumulada. Duración/Reps: Ejecuta el movimiento continuo a máxima velocidad durante 30 a 45 segundos."
          },
          {
            "name": "Círculos de Muñecas con Puños Cerrados",
            "desc": "Posición inicial: De pie o sentado, extiende tus brazos hacia el frente paralelos al suelo a la altura del pecho. Cierra ambas manos formando un puño suave pero firme. Ejecución: Utilizando exclusivamente la articulación radiocarpiana (muñeca), comienza a dibujar círculos amplios, fluidos y continuos en el aire con tus puños. Realiza el movimiento hacia adentro durante la mitad del tiempo programado y luego invierte el sentido hacia afuera de forma fluida. Respiración: Respira de manera natural, profunda e ininterrumpida durante las rotaciones. Duración/Reps: Realiza el ejercicio continuo durante 30 segundos totales (15 segundos por dirección)."
          }
        ],
        "stretch": [
          {
            "name": "Estiramiento de Flexores de Muñeca de Rodillas",
            "desc": "Posición inicial: Colócate de rodillas sobre un tapete. Apoya las palmas de tus manos planas en el suelo frente a ti, pero rotándolas completamente para que los dedos apunten directamente hacia tus rodillas. Ejecución: Manteniendo los codos perfectamente bloqueados y rectos y las palmas totalmente pegadas al piso, inclina sutil y progresivamente tu torso y tus caderas hacia atrás. Esto creará una palanca anatómica que estirará de forma muy intensa la musculatura flexora interna del antebrazo. Respiración: Inhala hondo fijando la posición y exhala de forma prolongada liberando la tensión acumulada en las muñecas al desplazar la cadera atrás. Duración/Reps: Sostén el estiramiento de forma estática durante 25 a 30 segundos."
          },
          {
            "name": "Estiramiento de Extensores de Muñeca",
            "desc": "Posición inicial: Ponte de pie o sentado de manera erguida. Extiende tu brazo derecho completamente recto hacia el frente a la altura del hombro con la palma de la mano mirando hacia el suelo (pronación). Ejecución: Flexiona la muñeca derecha de modo que tus dedos apunten hacia el piso. Con la ayuda de tu mano izquierda, sujeta firmemente el dorso de la mano derecha y jálalo suavemente hacia tu cuerpo, manteniendo el codo derecho bloqueado para aislar la musculatura extensora epicondílea posterior. Respiración: Respira con calma; exhala de manera lenta durante la tracción manual estática disipando la rigidez del antebrazo. Duración/Reps: Sostén la posición fija por 20 a 30 segundos por cada brazo."
          },
          {
            "name": "Flexores de Antebrazo en Barra Media",
            "desc": "STALLBAR - Posición inicial: Colócate de frente a la espaldera a la distancia de un paso corto. Separa los pies de forma estable y mantén los codos completamente rectos y extendidos frente a ti. Ejecución: Apoya las palmas de tus manos planas contra una de las barras que se encuentre a nivel de tu cintura o abdomen, asegurándote de girar las muñecas por completo para que los dedos apunten hacia abajo. Empuja suavemente tu torso hacia el frente de manera que la barra estire los flexores del antebrazo. Respiración: Inhala profundo manteniendo el core estable y exhala soltando la tensión en las muñecas y antebrazos de forma estática. Duración/Reps: Sostén el estiramiento estático durante 20 a 30 segundos."
          }
        ]
      },
      "neck": {
        "warmup": [
          {
            "name": "Retracciones Cervicales Activas (Chin Tucks)",
            "desc": "Posición inicial: Siéntate o ponte de pie con una postura totalmente erguida, manteniendo los hombros relajados hacia abajo y la mirada fija de forma horizontal al frente. Ejecución: Realiza un movimiento puramente horizontal desplazando tu cabeza hacia atrás, como si intentaras alejar tu rostro de alguien, sacando una exagerada 'doble papada' sin inclinar la cabeza hacia arriba ni hacia abajo. Sostén la retracción un instante activando los flexores profundos y regresa dinámicamente al frente. Respiración: Exhala al realizar la retracción cervical posterior aplicando la fuerza y contracción muscular e inhala al relajar al frente. Duración/Reps: Completa entre 12 y 15 repeticiones controladas."
          },
          {
            "name": "Semicírculos Cervicales Inferiores",
            "desc": "Posición inicial: De pie o sentado manteniendo el torso perfectamente erguido y los hombros fijos. Deja caer de forma relajada la barbilla hacia adelante buscando el esternón. Ejecución: Inicia un balanceo lento y continuo de tu cabeza hacia el lado derecho, deslizando la barbilla cerca del pecho hasta que tu oreja se aproxime al hombro derecho. De forma fluida e invirtiendo el trayecto, regresa por abajo hacia el lado izquierdo pasando por el centro, evitando realizar círculos completos hacia atrás. Respiración: Mantén una respiración profunda y fluida, inhalando en un extremo del recorrido y exhalando al viajar hacia el opuesto. Duración/Reps: Realiza el movimiento pendular continuo durante 30 segundos totales."
          }
        ],
        "stretch": [
          {
            "name": "Estiramiento Lateral de Cuello Asistido",
            "desc": "Posición inicial: Siéntate o ponte de pie de manera completamente erguida. Lleva tu brazo izquierdo por detrás de tu espalda baja para deprimir y fijar mecánicamente el hombro izquierdo hacia abajo. Ejecución: Coloca tu mano derecha sobre el lado izquierdo de tu cabeza por encima de la oreja. Aplica una tracción lateral muy suave y controlada guiando tu oreja derecha hacia tu hombro derecho, sintiendo la elongación profunda de la musculatura cervical lateral izquierda (escalenos y trapecio). Respiración: Inhala profundo manteniendo el eje espinal recto y exhala prolongadamente relajando el cuello para permitir que ceda sutilmente a la tracción. Duración/Reps: Sostén de forma totalmente estática durante 20 a 25 segundos por cada lado."
          },
          {
            "name": "Estiramiento de la Musculatura Cervical Posterior",
            "desc": "Posición inicial: Siéntate en una silla con la espalda recta o ponte de pie de forma erguida, con los hombros relajados y caídos de forma natural a los lados del torso. Ejecución: Deja caer tu cabeza hacia adelante llevando la barbilla firmemente contra tu esternón. A continuación, entrelaza los dedos de ambas manos y colócalas apoyadas sobre tu nuca. Deja caer exclusivamente el peso pasivo de tus brazos y codos hacia abajo sin ejercer fuerza bruta, traccionando los extensores del cuello de forma segura. Respiración: Inhala profundo y exhala de forma prolongada permitiendo que la gravedad disipe la tensión fascial de la nuca. Duración/Reps: Mantén la flexión cervical fija durante 25 a 30 segundos continuos."
          },
          {
            "name": "Tracción Cervical Angular por Inclinación de Torso",
            "desc": "STALLBAR - Posición inicial: Colócate de lado junto a la espaldera a un paso corto de distancia. Sujeta con la mano interna una barra a nivel medio-alto manteniendo el brazo extendido de forma firme. Ejecución: Manteniendo el agarre firme que asegura y deprime de forma pasiva tu hombro interno, inclina tu torso sutilmente hacia el lado externo (alejándote de las barras). Al mismo tiempo, deja caer tu cabeza de forma lateral hacia el hombro externo, maximizando la tracción lineal de toda la cadena cervical lateral de forma estática. Respiración: Inhala profundo reteniendo la postura estable y exhala soltando el aire mientras dejas caer de forma pasiva el peso del cuello. Duración/Reps: Sostén el estiramiento estático por 20 a 30 segundos por lado."
          }
        ]
      }
  }

  const IMG_MAP = {
    'Abrazos del Oso Dinámicos': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hug_A_Ball/0.jpg',
    'Flexiones Dinámicas Excéntricas contra Pared': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pushups/0.jpg',
    'Dislocaciones de Pecho y Hombro con Banda': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Behind_Head_Chest_Stretch/0.jpg',
    'Aperturas de Pecho Dinámicas en T': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Iron_Crosses_stretch/0.jpg',
    'Estiramiento de Pecho en Esquina de Pared': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Behind_Head_Chest_Stretch/0.jpg',
    'Estiramiento Un Brazo Contra Pared': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One_Arm_Against_Wall/0.jpg',
    'Apertura Pectoral con Manos Entrelazadas Atrás': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Behind_Head_Chest_Stretch/0.jpg',
    'Movilidad Escapular en Y-T-W': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Shoulder_Circles/0.jpg',
    'Circunducción de Hombros Corta y Veloz': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Shoulder_Circles/0.jpg',
    'Giros Externos con Banda Dinámicos': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Shoulder_Stretch/0.jpg',
    'Elevaciones Frontales y Laterales al Aire': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Shoulder_Raise/0.jpg',
    'Estiramiento del Deltoides Posterior Cruzado': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Shoulder_Stretch/0.jpg',
    'Estiramiento del Deltoides Anterior Sentado': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Front_Deltoid/0.jpg',
    'Estiramiento del Águila Estático': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Round_The_World_Shoulder_Stretch/0.jpg',
    'Extensiones de Codo al Aire Activas': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Overhead_Triceps/0.jpg',
    'Patadas de Tríceps Dinámicas sin Carga': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Stretch/0.jpg',
    'Flexiones en Diamante sobre Pared': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pushups/0.jpg',
    'Círculos de Antebrazo en Cruz': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Elbow_Circles/0.jpg',
    'Estiramiento de Tríceps por Detrás de la Cabeza': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Overhead_Triceps/0.jpg',
    'Estiramiento Lateral de Tríceps Costal': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Tricep_Side_Stretch/0.jpg',
    'Elongación de Tríceps contra Pared': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Stretch/0.jpg',
    'Flexiones de Bíceps Dinámicas con Rotación': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Alternate_Bicep_Curl/0.jpg',
    'Rotaciones de Brazo Completo (Tornillo)': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Biceps_Stretch/0.jpg',
    'Apertura y Cierre de Brazos Supinados': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Biceps_Stretch/0.jpg',
    'Pulsaciones de Brazos hacia Atrás': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Biceps/0.jpg',
    'Estiramiento de Bíceps Sentado con Manos Atrás': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Biceps/0.jpg',
    'Estiramiento de Bíceps en Pared con Pulgar Abajo': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One_Arm_Against_Wall/0.jpg',
    'Estiramiento del Orador con Manos Entrelazadas Invertidas': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Behind_Head_Chest_Stretch/0.jpg',
    'Gato-Camello Dinámico': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cat_Stretch/0.jpg',
    'Oruga Walkout Dinámica': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Inchworm/0.jpg',
    'Rotación Lumbar en Cuadrupedia': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cat_Stretch/0.jpg',
    'Balanceo Lateral de Rodillas Acostado': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Spinal_Stretch/0.jpg',
    'Postura del Niño con Enfoque Lumbar': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Childs_Pose/0.jpg',
    'Torsión Espinal en el Suelo Estática': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Spinal_Stretch/0.jpg',
    'Flexión de Tronco hacia Adelante Sentado': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Toe_Touches/0.jpg',
    'Desplazamiento Escapular de Pie': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Upper_Back_Stretch/0.jpg',
    'Deslizamientos en Pared (Wall Angels)': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Upper_Back_Stretch/0.jpg',
    'Abrazo de Oso con Movilidad Dorsal': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hug_A_Ball/0.jpg',
    'Rotación Torácica con Mano en Nuca de Pie': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Torso_Rotation/0.jpg',
    'Estiramiento de Espalda Media con Brazos Cruzados al Frente': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Middle_Back_Stretch/0.jpg',
    'Estiramiento del Enhebrado de Aguja': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Upper_Back_Stretch/0.jpg',
    'Apertura Dorsal en Torsión Acostado': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Spinal_Stretch/0.jpg',
    'Jalón Dorsal al Aire Dinámico': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Overhead_Lat/0.jpg',
    'Inclinaciones Laterales en Flecha': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Overhead_Lat/0.jpg',
    'Transición de Plancha Alta a Perro Boca Abajo': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plank/0.jpg',
    'Circunducciones Laterales de Brazos Cruzados': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Round_The_World_Shoulder_Stretch/0.jpg',
    'Estiramiento Lateral del Dorsal en Pared': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Overhead_Lat/0.jpg',
    'Estiramiento de Dorsal en Cuadrupedia Cruzado': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Overhead_Lat/0.jpg',
    'Postura de Cachorro con Codos Apoyados': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Childs_Pose/0.jpg',
    'Encogimientos Escapulares Dinámicos': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Shoulder_Raise/0.jpg',
    'Tirones de Codos hacia Atrás con Retracción': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Elbows_Back/0.jpg',
    'Giros de Hombros Alternados en Círculo': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Shoulder_Circles/0.jpg',
    'Depresiones Escapulares Activas de Pie': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Shoulder_Raise/0.jpg',
    'Estiramiento del Trapecio Superior Asistido': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Neck_Stretch/0.jpg',
    'Estiramiento de Trapecio Medio Cruzando Hombros': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Upper_Back_Stretch/0.jpg',
    'Tracción de Trapecio Superior con Manos Detrás': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Neck_Stretch/0.jpg',
    'Sentadillas Libres a Ritmo Controlado': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bodyweight_Squat/0.jpg',
    'Desplantes Inversos Dinámicos': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Crossover_Reverse_Lunge/0.jpg',
    'Skiping con Talones al Glúteo Controlado': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Hamstring_and_Calf_Stretch/0.jpg',
    'Zancadas Laterales Alternas Activas': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Crossover_Reverse_Lunge/0.jpg',
    'Estiramiento de Cuádriceps Clásico de Pie': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Quad_Stretch/0.jpg',
    'Estiramiento de Cuádriceps Acostado Boca Abajo': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Prone_Quadriceps/0.jpg',
    'Estiramiento del Caballero Profundo': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Hip_Flexors/0.jpg',
    'Patadas Frankenstein Dinámicas': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Frankenstein_Squat/0.jpg',
    'Buenos Días Dinámicos con Manos en Nuca': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Good_Morning/0.jpg',
    'Extensiones de Rodilla 90/90 Acostado': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/90_90_Hamstring/0.jpg',
    'Bisagra de Cadera Unilateral Dinámica': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Good_Morning/0.jpg',
    'Estiramiento Isquiotibial Unilateral en Banco': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg-Up_Hamstring_Stretch/0.jpg',
    'Estiramiento de Isquiotibiales con Banda en Suelo': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Hamstring/0.jpg',
    'Flexión de Tronco con Piernas Separadas en V': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Toe_Touches/0.jpg',
    'Patadas Hidrantes en Cuadrupedia': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Glute_Kickback/0.jpg',
    'Círculos de Cadera Coxofemoral de Pie': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Hip_Circles/0.jpg',
    'Puentes de Glúteo Dinámicos con Pausa': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pelvic_Tilt_Into_Bridge/0.jpg',
    'Desplantes de Reverencia Cruzados': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Crossover_Reverse_Lunge/0.jpg',
    'Figura 4 Acostado Boca Arriba': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Glute/0.jpg',
    'Postura de la Paloma Pasiva en Suelo': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Piriformis-SMR/0.jpg',
    'Estiramiento del Piramidal Sentado con Torsión': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Glute/0.jpg',
    'Elevaciones de Talón de Pie Continuas': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Gastrocnemius_Calf_Stretch/0.jpg',
    'Saltos Cortos sobre Metatarsos (Pogo Hops)': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Gastrocnemius_Calf_Stretch/0.jpg',
    'Pedaleo de Pantorrilla en Carpa': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Gastrocnemius_Calf_Stretch/0.jpg',
    'Caminata Exagerada sobre Puntas': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Gastrocnemius_Calf_Stretch/0.jpg',
    'Estiramiento de Gemelo contra Pared con Pierna Recta': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Gastrocnemius_Calf_Stretch/0.jpg',
    'Estiramiento de Pantorrilla Sentado con Banda': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Calf_Stretch/0.jpg',
    'Estiramiento de Gemelo en Escalón Pasivo': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Gastrocnemius_Calf_Stretch/0.jpg',
    'Balanceo de Rodilla hacia Adelante en Cuclillas': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bodyweight_Squat/0.jpg',
    'Elevación de Talones Sentado al Aire': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Calf_Stretch/0.jpg',
    'Desplantes Cortos con Flexión Profunda de Tobillo': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Soleus_And_Achilles_Stretch/0.jpg',
    'Sentadilla Profunda Isométrica con Cambios de Peso': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bodyweight_Squat/0.jpg',
    'Estiramiento de Sóleo contra Pared con Rodilla Flexionada': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Soleus_And_Achilles_Stretch/0.jpg',
    'Estiramiento de Sóleo en Cuclillas con Apoyo': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Soleus_And_Achilles_Stretch/0.jpg',
    'Estiramiento de Tibial Posterior e Inversión de Tobillo': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Posterior_Tibialis_Stretch/0.jpg',
    'Plancha Alta con Toques de Hombro': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plank/0.jpg',
    'Giros Rusos Dinámicos al Aire': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Russian_Twist/0.jpg',
    'Escarabajo Muerto (Dead Bug) Básico': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dead_Bug/0.jpg',
    'Contracciones Pélvicas de Pie Activas': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Stomach_Vacuum/0.jpg',
    'Postura de la Cobra Estática en Suelo': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Superman/0.jpg',
    'Estiramiento Corporal Completo en Supino': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Overhead_Stretch/0.jpg',
    'Inclinación Posterior de Pie con Manos Extendidas': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Looking_At_Ceiling/0.jpg',
    'Círculos de Muñecas con Puños Cerrados': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wrist_Circles/0.jpg',
    'Pulsaciones Rápidas de Apertura de Manos (Air Flashes)': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Finger_Curls/0.jpg',
    'Flexo-Extensiones de Muñeca Activas': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wrist_Circles/0.jpg',
    'Giros Prono-Supinadores de Antebrazo': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wrist_Roller/0.jpg',
    'Estiramiento de Flexores de Muñeca de Rodillas': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kneeling_Forearm_Stretch/0.jpg',
    'Estiramiento de Extensores de Muñeca': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Wrist_Pull/0.jpg',
    'Estiramiento de Separación de Dedos e Interóseos': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Finger_Curls/0.jpg',
    'Semicírculos Cervicales Inferiores': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Neck-SMR/0.jpg',
    'Retracciones Cervicales Activas (Chin Tucks)': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chin_To_Chest_Stretch/0.jpg',
    'Giros Laterales del Cuello': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Neck-SMR/0.jpg',
    'Flexiones Laterales Cervicales Continuas': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Neck_Stretch/0.jpg',
    'Estiramiento Lateral de Cuello Asistido': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Neck_Stretch/0.jpg',
    'Estiramiento de la Musculatura Cervical Posterior': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chin_To_Chest_Stretch/0.jpg',
    'Estiramiento Angular Ojo-Axila Estático': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Neck_Stretch/0.jpg',
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
    'quads / glutes': 'quads',
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
    'glúteo': 'glutes',
    'glúteo medio': 'glutes',
    'gemelos': 'calves',
    'pantorrillas': 'calves',
    'abdominales': 'abs',
    'abdomen': 'abs',
    'oblicuos': 'abs',
    'core': 'abs',
    'antebrazos': 'forearms',
    'cuello': 'neck',
    'trapecios': 'traps',
    'dorsales': 'lats',
    'dorsal': 'lats',
    'lumbares': 'back',
    'piernas': 'quads',
    'isquiotibiales': 'hamstrings',
    'isquiosurales': 'hamstrings',
    'bíceps': 'biceps',
    'tríceps': 'triceps',
    'trapecio': 'traps',
    'soleo': 'soleus',
    'cadena posterior': 'back',
    'erectores espinales': 'back',
    'romboides': 'midback',
  }

  function resolveMuscles(muscleStr) {
    if (!muscleStr) return []
    const s = muscleStr.toLowerCase().trim()

    // Split by comma for compound muscles (e.g. "Pecho, Tríceps")
    // Only commas are compound separators; "/" appears inside parens (e.g. "Hombro (Anterior/Medio)")
    if (s.includes(',')) {
      const parts = s.split(',').map(p => p.trim()).filter(Boolean)
      const resolved = new Set()
      for (const p of parts) {
        const r = resolveOne(p)
        if (r) resolved.add(r)
      }
      if (resolved.size > 0) return [...resolved]
    }

    const r = resolveOne(s)
    return r ? [r] : []
  }

  function resolveOne(name) {
    const base = name.replace(/\s*\([^)]*\)/g, '').trim()

    if (MUSCLE_ALIASES[name]) return MUSCLE_ALIASES[name]
    if (base !== name && MUSCLE_ALIASES[base]) return MUSCLE_ALIASES[base]

    const direct = resolveSingle(name)
    if (direct) return direct
    if (base !== name) {
      const baseDirect = resolveSingle(base)
      if (baseDirect) return baseDirect
    }

    const sortedKeys = Object.keys(WARMUP_DATA).sort((a, b) => b.length - a.length)
    for (const key of sortedKeys) {
      if (name.includes(key) || base.includes(key)) return key
    }

    return null
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

  const MUSCLE_DISPLAY = {
    chest: 'Pecho',
    shoulders: 'Hombros',
    triceps: 'Tríceps',
    biceps: 'Bíceps',
    back: 'Espalda',
    midback: 'Espalda Media',
    lats: 'Dorsales',
    traps: 'Trapecios',
    quads: 'Cuádriceps',
    hamstrings: 'Femorales',
    glutes: 'Glúteos',
    calves: 'Gemelos',
    soleus: 'Sóleo',
    abs: 'Abdominales',
    forearms: 'Antebrazos',
    neck: 'Cuello',
  }

  window.WARMUP_DATA = WARMUP_DATA
  window.IMG_MAP = IMG_MAP
  window.MUSCLE_DISPLAY = MUSCLE_DISPLAY
  window.getUniqueWarmupMuscles = getUniqueWarmupMuscles
  window.resolveMuscles = resolveMuscles
  window.img = img
