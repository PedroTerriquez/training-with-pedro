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
        "name": "Abrazos del Oso Dinámicos",
        "desc": "Posición inicial: Ponte de pie de manera erguida, con los pies separados al ancho de los hombros y los brazos completamente extendidos a los lados a la altura del pecho.\nEjecución: Inicia un balanceo fluido cruzando los brazos por delante de tu cuerpo de manera rítmica, simulando darte un fuerte abrazo, alternando qué brazo queda por encima en cada repetición. Abre los brazos al máximo en la fase de regreso para expandir el pectoral de forma activa.\nRespiración: Inhala profundamente al abrir los brazos expandiendo el pecho, y exhala completamente al cruzarlos al frente.\nDuración/Reps: Realiza el movimiento continuo durante 30 segundos o completa 15 repeticiones fluidas.\nErrores comunes: Mantener los brazos rígidos, encorvar excesivamente la columna dorsal o realizar rebotes violentos sin control muscular."
      },
      {
        "name": "Flexiones Dinámicas Excéntricas contra Pared",
        "desc": "Posición inicial: Colócate frente a una pared lisa a una distancia aproximada de un paso largo. Apoya las palmas de las manos sobre la pared a la altura del pecho y ligeramente más abiertas que el ancho de tus hombros, con el cuerpo alineado desde los talones hasta la cabeza.\nEjecución: Flexiona los codos lentamente tardando de 3 a 4 segundos en acercar tu pecho hacia la pared, manteniendo el abdomen firme. Una vez que estés muy cerca, empuja la pared de forma explosiva para regresar a la posición inicial.\nRespiración: Inhala durante la fase de descenso controlado hacia la pared y exhala con fuerza al realizar el empuje dinámico.\nDuración/Reps: Realiza de 12 a 15 repeticiones de manera continua y controlada.\nErrores comunes: Dejar caer la cadera hacia adelante perdiendo la alineación espinal, o separar los codos excesivamente hacia arriba poniendo en riesgo la articulación del hombro."
      },
      {
        "name": "Dislocaciones de Pecho y Hombro con Banda",
        "desc": "Posición inicial: Ponte de pie sosteniendo una banda elástica de resistencia ligera frente a tus muslos con un agarre prono bastante amplio (el doble del ancho de tus hombros).\nEjecución: Manteniendo los brazos completamente extendidos y una ligera tensión hacia los lados en la banda, eleva los brazos por encima de la cabeza y continúa el arco de movimiento de forma fluida hacia atrás hasta tocar tu espalda baja. Regresa por el mismo camino de forma controlada.\nRespiración: Inhala profundamente mientras elevas la banda hacia el techo y exhala mientras desciendes los brazos por detrás del torso.\nDuración/Reps: Realiza 10 a 12 pasadas completas de ida y vuelta de manera rítmica.\nErrores comunes: Doblar los codos durante el trayecto para compensar la falta de movilidad o arquear excesivamente la zona lumbar forzando la columna."
      },
      {
        "name": "Aperturas de Pecho Dinámicas en T",
        "desc": "Posición inicial: Acuéstate boca arriba sobre un tapete con las rodillas flexionadas y los pies apoyados en el suelo. Extiende ambos brazos verticalmente hacia el techo con las palmas de las manos mirándose entre sí.\nEjecución: Abre los brazos hacia los costados de manera controlada manteniendo una mínima flexión en los codos hasta que los dorsos de las manos rocen el suelo, sintiendo la apertura activa del pectoral. Regresa contrayendo el pecho al punto de inicio de forma dinámica.\nRespiración: Inhala al abrir los brazos expandiendo la caja torácica y exhala al juntarlos en la vertical.\nDuración/Reps: Ejecuta 15 repeticiones fluidas sin realizar pausas prolongadas en el suelo.\nErrores comunes: Despegar la espalda lumbar del suelo al abrir los brazos o golpear bruscamente las manos contra el piso."
      }
    ],
    "stretch": [
      {
        "name": "Estiramiento de Pecho en Esquina de Pared",
        "desc": "Posición inicial: Colócate de pie frente a una esquina de la habitación o el marco de una puerta abierta. Coloca los antebrazos apoyados verticalmente a ambos lados de la estructura, con los codos flexionados exactamente a 90 grados y alineados con tus hombros.\nEjecución: Da un paso corto hacia adelante con una pierna y desplaza el peso de tu cuerpo sutilmente hacia el frente, permitiendo que el pecho avance libremente hacia el espacio vacío hasta sentir un estiramiento profundo pero seguro en las fibras pectorales.\nRespiración: Mantén una respiración profunda, lenta y diafragmática; inhala expandiendo el abdomen y exhala relajando el pectoral para ceder más al estiramiento.\nDuración/Reps: Sostén la posición de forma totalmente estática durante 20 a 30 segundos, luego cambia la pierna de apoyo si lo deseas.\nErrores comunes: Elevar los hombros hacia las orejas por tensión acumulada o inclinar la cabeza hacia adelante perdiendo la postura neutral."
      },
      {
        "name": "Estiramiento Un Brazo Contra Pared",
        "desc": "Posición inicial: Colócate de pie lateralmente a una pared regular, a la distancia de la longitud de tu brazo. Apoya la palma de la mano interna plana sobre la pared a la altura del hombro, con los dedos apuntando hacia atrás.\nEjecución: Manteniendo el brazo estirado y la mano fija en la pared, rota lentamente todo tu torso y tus pies en dirección opuesta a la pared (hacia afuera) hasta percibir una tensión de estiramiento en la inserción del pecho y el hombro.\nRespiración: Respira de manera pausada e intermitente, exhalando profundamente cada vez que intentes rotar un milímetro más el torso.\nDuración/Reps: Sostén la posición fija durante 20 segundos firmes por cada lado del cuerpo.\nErrores comunes: Despegar el hombro de la línea media elevándolo, o doblar el codo del brazo que está realizando el soporte en la pared."
      },
      {
        "name": "Apertura Pectoral con Manos Entrelazadas Atrás",
        "desc": "Posición inicial: Ponte de pie de manera erguida con las piernas separadas al ancho de las caderas. Lleva ambos brazos hacia atrás de la espalda baja y entrelaza firmemente los dedos de tus manos.\nEjecución: Estira los codos por completo y rota los hombros hacia atrás y hacia abajo. Desde esa posición, eleva sutilmente las manos entrelazadas alejándolas de tus glúteos a la vez que proyectas el pecho hacia arriba y mantienes la mirada fija al frente.\nRespiración: Realiza inhalaciones profundas que empujen tu esternón hacia afuera y exhalaciones lentas que estabilicen la contracción de la espalda.\nDuración/Reps: Mantén la tracción estática durante 20 a 30 segundos sin realizar balanceos.\nErrores comunes: Flexionar el torso hacia adelante para compensar la falta de rango o flexionar las rodillas durante la tracción."
      },
      {
        "name": "Apertura de Pecho Pasiva en Espaldera",
        "desc": "STALLBAR: Posición inicial: Colócate de espaldas a la espaldera. Eleva los brazos hacia atrás y sujeta firmemente una de las barras que se encuentre a la altura aproximada de tus hombros o ligeramente por encima, con las palmas mirando hacia el frente.\nEjecución: Da un paso largo hacia adelante con una pierna para estabilizarte y proyecta el esternón y todo el torso hacia el frente de manera pasiva, permitiendo que tus brazos queden fijos atrás para elongar el pectoral mayor de forma simétrica.\nRespiración: Inhala llenando por completo el pecho de aire y exhala relajando los hombros y permitiendo que la gravedad desplace el cuerpo ligeramente más adelante.\nDuración/Reps: Mantén este estiramiento estático durante 25 a 30 segundos de manera controlada.\nErrores comunes: Arquear la zona lumbar para simular mayor rango de movimiento o soltar bruscamente el agarre al terminar el ejercicio."
      }
    ]
  },
  "shoulders": {
    "warmup": [
      {
        "name": "Movilidad Escapular en Y-T-W",
        "desc": "Posición inicial: Ponte de pie con las rodillas ligeramente flexionadas e inclina el torso hacia adelante unos 45 grados manteniendo la espalda completamente recta y los brazos colgando de forma relajada hacia el suelo.\nEjecución: Mueve los brazos de forma fluida para dibujar tres letras consecutivas en el aire: primero elévalos en diagonal formando una 'Y', luego ábrelos totalmente hacia los costados formando una 'T', y finalmente flexiona los codos a 90 grados tirando de ellos hacia atrás formando una 'W'. En cada letra debes retraer fuertemente las escápulas.\nRespiración: Exhala al elevar los brazos para formar cada letra y activar la musculatura dorsal; inhala al regresar al centro.\nDuración/Reps: Completa de 6 a 8 secuencias completas de las tres letras consecutivas.\nErrores comunes: Utilizar el impulso balanceando todo el torso o encorvar la espalda baja durante la inclinación."
      },
      {
        "name": "Circunducción de Hombros Corta y Veloz",
        "desc": "Posición inicial: De pie, mantén la espalda erguida y los brazos completamente extendidos hacia los costados de manera horizontal, alineados a la altura exacta de tus hombros, cerrando las manos en un puño suave.\nEjecución: Comienza a dibujar círculos concéntricos muy pequeños y rápidos en el aire con tus brazos. Realiza el movimiento hacia adelante durante la mitad del tiempo, e inmediatamente invierte el sentido hacia atrás sin bajar los brazos.\nRespiración: Mantén una respiración fluida y constante, inhalando y exhalando de manera natural sin aguantar el aire.\nDuración/Reps: Ejecuta 15 segundos hacia adelante y 15 segundos hacia atrás de forma ininterrumpida.\nErrores comunes: Permitir que los brazos desciendan por debajo de la línea de los hombros o realizar círculos demasiado grandes perdiendo la velocidad."
      },
      {
        "name": "Giros Externos con Banda Dinámicos",
        "desc": "Posición inicial: Ponte de pie y sujeta una banda de resistencia ligera con ambas manos separadas al ancho de los hombros. Flexiona los codos a 90 grados y pégalos firmemente a los costados de tu torso, con las palmas mirando hacia arriba.\nEjecución: Manteniendo los codos anclados a tus costados en todo momento, abre los antebrazos hacia afuera tensando la banda elástica mediante la rotación externa de tus hombros. Regresa controladamente a la posición inicial.\nRespiración: Exhala al abrir los antebrazos hacia los lados ejerciendo fuerza y contrayendo los rotadores; inhala al regresar al centro.\nDuración/Reps: Realiza entre 12 y 15 repeticiones fluidas de forma controlada.\nErrores comunes: Separar los codos de las costillas durante el movimiento o compensar la tensión inclinando la espalda hacia atrás."
      },
      {
        "name": "Elevaciones Frontales y Laterales al Aire",
        "desc": "Posición inicial: De pie de manera erguida, con las caderas estables y los brazos relajados a los lados de los muslos, manteniendo los puños cerrados para generar una ligera tensión isométrica.\nEjecución: Eleva los brazos extendidos hacia el frente hasta la altura de tus ojos de forma dinámica, bájalos al punto de inicio, y acto seguido elévalos lateralmente hacia los costados hasta la altura de tus orejas. Alterna ambas elevaciones de forma continua.\nRespiración: Exhala en cada elevación (ya sea frontal o lateral) e inhala al descender los brazos al centro.\nDuración/Reps: Completa 10 repeticiones combinadas por plano (20 elevaciones en total).\nErrores comunes: Impulsar los brazos balanceando el torso hacia adelante y atrás, o flexionar excesivamente los codos."
      }
    ],
    "stretch": [
      {
        "name": "Estiramiento del Deltoides Posterior Cruzado",
        "desc": "Posición inicial: Ponte de pie o sentado de forma erguida. Extiende tu brazo derecho completamente horizontal cruzando la línea media por delante de tu pecho.\nEjecución: Coloca el antebrazo izquierdo por debajo del codo derecho y utilízalo como palanca para presionar firmemente el brazo derecho contra tu pecho. Mantén el hombro derecho deprimido (alejado de la oreja) para enfocar el estiramiento en la cara posterior del hombro.\nRespiración: Respira de forma pausada y profunda; exhala de manera prolongada permitiendo que el brazo se acerque un poco más al pecho en cada ciclo.\nDuración/Reps: Sostén de forma estática por 20 a 30 segundos y luego repite el proceso con el brazo opuesto.\nErrores comunes: Elevar el hombro que se está estirando tapando el cuello o rotar todo el torso siguiendo la dirección del brazo."
      },
      {
        "name": "Estiramiento del Deltoides Anterior Sentado",
        "desc": "Posición inicial: Siéntate en el suelo con las rodillas flexionadas y los pies apoyados firmemente. Coloca las palmas de las manos apoyadas en el suelo detrás de ti, a una distancia cómoda, con los dedos apuntando en dirección opuesta a tu cuerpo.\nEjecución: Desliza lentamente tus glúteos hacia adelante alejándolos de tus manos fijas, manteniendo los brazos completamente extendidos, hasta que sientas una tensión moderada y cómoda de estiramiento en la parte frontal de tus hombros.\nRespiración: Inhala inflando el abdomen y exhala de forma prolongada, relajando la musculatura de los hombros para permitir que el pecho se abra.\nDuración/Reps: Sostén la posición final estática por 20 a 25 segundos.\nErrores comunes: Permitir que los codos se flexionen o encorvar excesivamente la espalda colapsando el pecho hacia adentro."
      },
      {
        "name": "Estiramiento del Águila Estático",
        "desc": "Posición inicial: Siéntate de rodillas o de pie de manera erguida. Extiende ambos brazos al frente tuyo paralelos al suelo.\nEjecución: Cruza el brazo derecho sobre el izquierdo a la altura de los codos. Flexiona ambos codos verticalmente e intenta entrelazar tus antebrazos hasta que las palmas de tus manos se toquen (o el dorso si no alcanzas). Eleva activamente los codos a la altura de tus hombros y empuja las manos lejos de tu rostro.\nRespiración: Dirige el aire de la inhalación hacia el espacio entre tus escápulas y exhala eliminando la tensión acumulada.\nDuración/Reps: Mantén la posición cruzada fija durante 20 segundos y repite invirtiendo el cruce de los brazos.\nErrores comunes: Bajar los codos hacia el pecho perdiendo la tensión en los deltoides o forzar la articulación si hay dolor limitante."
      },
      {
        "name": "Tracción Escapular Colgado",
        "desc": "STALLBAR: Posición inicial: Colócate de frente a la espaldera. Sujeta firmemente con ambas manos en agarre prono una de las barras superiores que te permita quedar suspendido o semi-suspendido con las puntas de los pies rozando el suelo.\nEjecución: Relaja por completo el peso de tu cuerpo permitiendo que la gravedad traccione tus hombros hacia arriba. Deja que tu cabeza quede libre entre tus brazos y empuja sutilmente tu pecho hacia el espacio entre las barras para estirar la cápsula articular del hombro.\nRespiración: Inhala profundo expandiendo la espalda y exhala soltando toda la musculatura escapular de forma pasiva.\nDuración/Reps: Sostén la suspensión estática de 25 a 30 segundos continuos.\nErrores comunes: Activar los bíceps flexionando los brazos o balancear las piernas desestabilizando la posición."
      }
    ]
  },
  "triceps": {
    "warmup": [
      {
        "name": "Extensiones de Codo al Aire Activas",
        "desc": "Posición inicial: Ponte de pie de manera erguida. Eleva ambos brazos verticalmente apuntando los codos directamente hacia el techo, posicionando tus manos abiertas justo detrás de tu nuca o espalda alta.\nEjecución: Manteniendo los codos fijos y apuntando hacia arriba al lado de tus orejas, extiende ambos antebrazos de forma simultánea y explosiva hacia el techo contrayendo activamente los tríceps. Regresa de manera fluida a la posición inicial flexionando los codos al máximo.\nRespiración: Exhala con fuerza al extender los brazos hacia el cielo e inhala al regresar a la flexión de nuca.\nDuración/Reps: Completa de 15 a 20 repeticiones continuas para bombear sangre a la zona.\nErrores comunes: Permitir que los codos se abran hacia los lados perdiendo la verticalidad o mover los hombros durante la extensión."
      },
      {
        "name": "Patadas de Tríceps Dinámicas sin Carga",
        "desc": "Posición inicial: Inclina tu torso hacia adelante unos 45 grados con la espalda recta. Eleva tus codos hacia el techo pegándolos a los costados de tu cuerpo de modo que tus antebrazos cuelguen a 90 grados respecto a tus brazos.\nEjecución: Manteniendo los codos perfectamente inmóviles contra tus costados, extiende los brazos hacia atrás de forma rápida hasta que queden completamente paralelos a tu torso, apretando el tríceps un instante en la cima. Regresa controladamente a los 90 grados.\nRespiración: Exhala al extender los brazos hacia atrás e inhala al flexionar de regreso al ángulo inicial.\nDuración/Reps: Realiza 15 repeticiones consecutivas manteniendo un ritmo constante.\nErrores comunes: Balancear los codos hacia adelante y hacia atrás asemejando un péndulo en lugar de mantenerlos fijos."
      },
      {
        "name": "Flexiones en Diamante sobre Pared",
        "desc": "Posición inicial: Colócate de pie frente a una pared a un paso de distancia. Apoya las manos en la pared formando un diamante con tus dedos índices y pulgares juntos, alineados directamente con el centro de tu pecho.\nEjecución: Manteniendo el cuerpo rígido como una tabla, flexiona los codos hacia afuera y abajo para acercar tu esternón hacia las manos en un recorrido controlado de 2 segundos. Empuja dinámicamente la pared para regresar extendiendo los brazos por completo.\nRespiración: Inhala mientras desciendes controladamente hacia la pared y exhala al realizar el empuje dinámico final.\nDuración/Reps: Completa de 12 a 15 repeticiones enfocadas en la musculatura del tríceps.\nErrores comunes: Separar excesivamente los pies perdiendo estabilidad o despegar los talones del suelo de forma descontrolada."
      },
      {
        "name": "Círculos de Antebrazo en Cruz",
        "desc": "Posición inicial: Ponte de pie de manera erguida y extiende tus brazos hacia los costados de manera horizontal a la altura de tus hombros, manteniendo los brazos fijos y las palmas mirando hacia adelante.\nEjecución: Manteniendo la sección del brazo (hombro a codo) perfectamente estática en el aire, rota y dibuja círculos amplios únicamente con tus antebrazos, flexionando y extendiendo el codo de forma rítmica. Realiza la mitad del tiempo hacia adentro y luego cambia hacia afuera.\nRespiración: Respira de manera fluida, inhalando en un semicírculo y exhalando en el siguiente.\nDuración/Reps: Ejecuta el movimiento continuo durante 30 segundos totales (15 segundos por dirección).\nErrores comunes: Mover los hombros o descender los codos perdiendo la línea horizontal de trabajo."
      }
    ],
    "stretch": [
      {
        "name": "Estiramiento de Tríceps por Detrás de la Cabeza",
        "desc": "Posición inicial: Ponte de pie o siéntate de forma erguida. Eleva tu brazo derecho verticalmente y luego flexiona el codo dejando caer la palma de la mano sobre la línea media de tu espalda alta.\nEjecución: Lleva tu mano izquierda por encima de tu cabeza y sujeta firmemente el codo derecho. Jala el codo con suavidad hacia abajo y hacia el centro de la cabeza hasta sentir el estiramiento en la porción larga del tríceps, manteniendo la cabeza erguida.\nRespiración: Inhala profundo manteniendo el torso firme y exhala liberando la tensión a medida que traccionas suavemente el codo.\nDuración/Reps: Sostén la postura de forma estática por 20 a 30 segundos por cada brazo.\nErrores comunes: Empujar la cabeza hacia adelante con el propio brazo arqueando el cuello o encorvar la zona lumbar."
      },
      {
        "name": "Estiramiento Lateral de Tríceps Costal",
        "desc": "Posición inicial: De pie, con las piernas ligeramente separadas al ancho de las caderas. Eleva el brazo derecho doblado por detrás de la cabeza como en el estiramiento clásico, sujetando el codo con la mano izquierda.\nEjecución: Una vez que tienes el codo derecho sujeto, realiza una inclinación lateral controlada de todo tu torso hacia el lado izquierdo, empujando la cadera sutilmente hacia el lado derecho para elongar tanto el tríceps como la zona intercostal lateral.\nRespiración: Inhala en el centro expandiendo las costillas y exhala prolongadamente mientras mantienes la inclinación estática lateral.\nDuración/Reps: Sostén la inclinación estática durante 20 segundos y luego repite exactamente igual hacia el lado contrario.\nErrores comunes: Rotar el torso hacia el suelo durante la inclinación en lugar de mantener el plano estrictamente lateral."
      },
      {
        "name": "Elongación de Tríceps contra Pared",
        "desc": "Posición inicial: Colócate de pie frente a una pared a un paso corto de distancia. Eleva los brazos y apoya ambos codos sobre la pared a la altura de tu frente, manteniendo los antebrazos flexionados con las manos apuntando hacia tu espalda.\nEjecución: Junta las palmas de tus manos por detrás de tu cabeza. Lentamente, da un pequeño paso hacia atrás con los pies y deja caer tu pecho y tu cabeza hacia el suelo entre tus brazos, permitiendo que la pared empuje tus codos hacia arriba estirando los tríceps.\nRespiración: Respira con calma; inhala profundo y exhala hundiendo el torso hacia el piso de manera pasiva y controlada.\nDuración/Reps: Mantén la posición de tracción pasiva durante 20 a 30 segundos continuos.\nErrores comunes: Despegar los codos de la pared o realizar rebotes repetitivos en lugar de sostener la posición estática."
      },
      {
        "name": "Tríceps Apoyado en Barra Alta",
        "desc": "STALLBAR: Posición inicial: Colócate de frente a la espaldera a un paso de distancia. Flexiona los codos por completo colocando tus manos juntas detrás del cuello. Apoya firmemente la punta de ambos codos sobre una de las barras que se encuentre a la altura de tu pecho o mentón.\nEjecución: Manteniendo los codos fijos sobre la barra, da un paso pequeño hacia atrás con tus pies e inclina el torso hacia adelante, permitiendo que tu cabeza pase por debajo del nivel de la barra. Presiona el pecho hacia el suelo para profundizar el estiramiento en los tríceps.\nRespiración: Inhala profundo estabilizando el core y exhala de forma prolongada dejando caer el peso del torso de manera pasiva.\nDuración/Reps: Sostén la posición fija por 20 a 30 segundos antes de reincorporarte lentamente.\nErrores comunes: Apoyar los antebrazos en lugar de concentrar la presión únicamente en los codos, o forzar excesivamente la espalda baja."
      }
    ]
  },
  "biceps": {
    "warmup": [
      {
        "name": "Flexiones de Bíceps Dinámicas con Rotación",
        "desc": "Posición inicial: Ponte de pie de manera erguida con los brazos extendidos a los lados de tu cuerpo, las palmas de las manos mirando hacia el frente (supinación) y los hombros relajados.\nEjecución: Flexiona los codos de forma rápida y continua llevando las manos hacia los hombros sin mover la parte superior del brazo. Al llegar a los hombros, gira las palmas hacia abajo (pronación) y extiende los brazos por completo. Vuelve a girar al inicio y repite.\nRespiración: Exhala al flexionar los brazos contrayendo el bíceps e inhala al extender los brazos hacia el suelo.\nDuración/Reps: Realiza el ejercicio de forma rítmica durante 30 segundos o completa 20 repeticiones.\nErrores comunes: Desplazar los codos hacia adelante despegándolos de los costados o recortar el rango de movimiento sin llegar a estirar al final."
      },
      {
        "name": "Rotaciones de Brazo Completo (Tornillo)",
        "desc": "Posición inicial: Ponte de pie con los brazos completamente extendidos hacia los costados de manera horizontal a la altura de tus hombros, con las palmas de las manos mirando hacia el techo.\nEjecución: Rota de forma enérgica toda la articulación del brazo desde el hombro hasta la muñeca, de manera que las palmas miren hacia atrás y hacia arriba completando un giro exagerado, sintiendo la torsión activa en el bíceps. Regresa al punto inicial.\nRespiración: Mantén un ciclo respiratorio constante: inhala al abrir las palmas al techo y exhala al realizar la rotación interna extrema.\nDuración/Reps: Ejecuta el movimiento de rotación continua durante 30 segundos seguidos.\nErrores comunes: Doblar los codos eliminando la tensión del bíceps o permitir que los brazos caigan perdiendo la línea del hombro."
      },
      {
        "name": "Apertura y Cierre de Brazos Supinados",
        "desc": "Posición inicial: De pie, mantén el torso erguido. Extiende los brazos totalmente hacia el frente paralelos al suelo, con las palmas orientadas hacia arriba de forma exagerada para reclutar el tendón del bíceps.\nEjecución: Abre ambos brazos lateralmente manteniendo la horizontalidad hasta donde la flexibilidad te lo permita sin arquear la espalda, y regresa al centro cruzando ligeramente una mano sobre la otra de forma rítmica y dinámica.\nRespiración: Inhala al abrir los brazos ensanchando el pecho y exhala al cerrarlos al frente con velocidad controlada.\nDuración/Reps: Realiza de 12 a 15 repeticiones fluidas alternando el cruce superior de las manos.\nErrores comunes: Dejar caer las palmas hacia adentro perdiendo la supinación estricta o encorvar los hombros hacia adelante."
      },
      {
        "name": "Pulsaciones de Brazos hacia Atrás",
        "desc": "Posición inicial: Ponte de pie con los pies separados al ancho de las caderas. Extiende tus brazos hacia atrás y hacia abajo de tu cuerpo, manteniendo las palmas de las manos mirando hacia el suelo y los codos completamente bloqueados.\nEjecución: Realiza pequeños movimientos pulsantes, cortos y rápidos de tus brazos hacia atrás y hacia arriba, buscando activar de forma dinámica la porción larga del bíceps y la cara anterior del brazo mediante impulsos controlados.\nRespiración: Respira de manera corta y rítmica, adaptando la exhalación a los pequeños impulsos de los brazos.\nDuración/Reps: Mantén el bombeo pulsante continuo durante 25 a 30 segundos sin descansar.\nErrores comunes: Flexionar el torso hacia adelante durante las pulsaciones o doblar los codos convirtiéndolo en un ejercicio de tríceps."
      }
    ],
    "stretch": [
      {
        "name": "Estiramiento de Bíceps Sentado con Manos Atrás",
        "desc": "Posición inicial: Siéntate en el suelo con las rodillas flexionadas y las plantas de los pies apoyadas. Coloca tus manos apoyadas detrás de tu espalda con las palmas planas en el piso y los dedos apuntando exactamente hacia atrás.\nEjecución: Con los brazos perfectamente estirados, camina sutilmente con los glúteos hacia adelante mientras mantienes las manos fijas atrás. Abre el pecho con firmeza hacia el frente hasta percibir el estiramiento longitudinal en ambos bíceps.\nRespiración: Inhala expandiendo la caja torácica y exhala relajando los brazos para disipar la sensación de quemazón del estiramiento.\nDuración/Reps: Sostén la posición fija y estática por 20 a 30 segundos continuos.\nErrores comunes: Permitir que los hombros colapsen hacia adelante tapando el cuello o rotar las manos hacia adentro de forma lesiva."
      },
      {
        "name": "Estiramiento de Bíceps en Pared con Pulgar Abajo",
        "desc": "Posición inicial: Colócate de pie de lado a una pared. Extiende el brazo interno hacia atrás y apoya la palma de la mano plana en la pared a la altura del hombro, pero rotando la muñeca de modo que el dedo pulgar apunte directamente hacia el suelo.\nEjecución: Manteniendo el codo completamente bloqueado y la mano fija, rota lentamente tu torso hacia afuera (alejándote de la pared) hasta que sientas el estiramiento cruzar desde el bíceps hasta el antebrazo anterior.\nRespiración: Exhala lentamente durante la rotación inicial del torso y mantén una respiración pausada durante la permanencia.\nDuración/Reps: Sostén la posición estática durante 20 segundos firmes en cada lado del cuerpo.\nErrores comunes: Flexionar ligeramente el codo anulando el estiramiento o despegar la palma de la mano de la superficie de la pared."
      },
      {
        "name": "Estiramiento del Orador con Manos Entrelazadas Invertidas",
        "desc": "Posición inicial: Ponte de pie de manera erguida con las piernas separadas. Entrelaza los dedos de tus manos por detrás de tu espalda baja.\nEjecución: Rota tus muñecas hacia adentro de manera que las palmas de las manos apunten hacia el suelo y luego hacia atrás. Extiende los codos por completo y eleva los brazos hacia arriba de forma isométrica sin inclinar el torso hacia adelante.\nRespiración: Realiza respiraciones diafragmáticas lentas, exhalando profundamente para relajar la musculatura flexora del brazo.\nDuración/Reps: Mantén la tracción estática durante 20 segundos completos.\nErrores comunes: Flexionar el cuello hacia el pecho o doblar los codos debido a la falta de movilidad en la articulación de la muñeca."
      },
      {
        "name": "Bícep Invertido en Barra Baja",
        "desc": "STALLBAR: Posición inicial: Colócate de espaldas a la espaldera. Lleva tus brazos hacia atrás y sujeta una barra situada a la altura de tu cintura o glúteos utilizando un agarre supino estricto (las palmas de las manos deben mirar hacia adelante).\nEjecución: Manteniendo un agarre firme y los codos completamente bloqueados en extensión, da uno o dos pasos cortos hacia adelante con tus pies. Flexiona levemente las rodillas y desciende el centro de gravedad de tu cuerpo de manera que tus brazos queden estirados detrás elongando los bíceps.\nRespiración: Inhala profundo manteniendo el core estable y exhala soltando la tensión acumulada en la cara anterior de los brazos.\nDuración/Reps: Sostén la posición de forma totalmente estática durante 20 a 25 segundos.\nErrores comunes: Arquear exageradamente la columna lumbar o permitir que las muñecas se flexionen perdiendo el agarre plano."
      }
    ]
  },
  "back": {
    "warmup": [
      {
        "name": "Gato-Camello Dinámico",
        "desc": "Posición inicial: Colócate en el suelo en posición de cuadrupedia (cuatro puntos de apoyo), con las rodillas alineadas debajo de tus caderas y las palmas de las manos directamente debajo de tus hombros, con la columna neutral.\nEjecución: Alterna de forma fluida entre dos posiciones: primero, arquea la espalda hacia abajo (posición de gato) elevando la mirada y el coxis; segundo, redondea la espalda hacia el techo (posición de camello) empujando el suelo con las manos y llevando la barbilla al pecho.\nRespiración: Inhala profundamente al arquear la espalda hacia abajo y exhala vaciando el abdomen al encorvar la espalda hacia arriba.\nDuración/Reps: Realiza la transición rítmica y controlada durante 45 segundos o completa 12 a 15 repeticiones totales.\nErrores comunes: Mover los brazos o flexionar los codos durante las transiciones, o realizar movimientos bruscos en la zona cervical."
      },
      {
        "name": "Oruga Walkout Dinámica",
        "desc": "Posición inicial: Ponte de pie de manera erguida al extremo posterior de un tapete, con los pies separados al ancho de las caderas y la mirada al frente.\nEjecución: Flexiona el torso hacia adelante desde la cadera hasta tocar el suelo con las manos (flexiona un poco las rodillas si es necesario). Camina con tus manos hacia adelante de forma controlada hasta quedar en una posición de plancha alta. Sostén un segundo y regresa caminando con las manos hacia tus pies.\nRespiración: Exhala al inclinarte y caminar hacia adelante; inhala al estabilizar la plancha y vuelve a exhalar en el regreso.\nDuración/Reps: Realiza entre 8 y 10 repeticiones completas de manera fluida pero controlada.\nErrores comunes: Dejar caer la cadera por debajo de la línea del cuerpo al llegar a la plancha alta o realizar pasos muy bruscos."
      },
      {
        "name": "Rotación Lumbar en Cuadrupedia",
        "desc": "Posición inicial: Colócate en posición de cuatro puntos en el suelo. Coloca la palma de tu mano derecha justo detrás de tu nuca, manteniendo el codo derecho abierto de forma lateral.\nEjecución: Rota tu torso llevando el codo derecho hacia abajo e introduce el brazo de forma diagonal buscando tocar el codo izquierdo. Inmediatamente después, invierte el giro abriendo el torso y apuntando el codo derecho hacia el techo de forma dinámica.\nRespiración: Inhala al rotar el torso hacia arriba abriendo el cuerpo y exhala al descender cruzando el codo por debajo.\nDuración/Reps: Completa 10 repeticiones fluidas por el lado derecho, e inmediatamente cambia para realizar 10 por el izquierdo.\nErrores comunes: Mover las caderas de lado a lado desalineando los cuatro puntos en lugar de aislar el movimiento en la columna."
      },
      {
        "name": "Balanceo Lateral de Rodillas Acostado",
        "desc": "Posición inicial: Acuéstate boca arriba en el suelo con la espalda plana, las rodillas flexionadas a 90 grados y los pies apoyados. Abre los brazos en cruz a los lados para estabilizar la parte superior del cuerpo.\nEjecución: Manteniendo los hombros firmemente pegados al suelo, deja caer ambas rodillas juntas de forma fluida hacia el lado derecho hasta que toquen o queden cerca del piso. Regresa al centro usando el core y déjalas caer de inmediato hacia el lado izquierdo.\nRespiración: Exhala al dejar caer las rodillas hacia los lados liberando la tensión lumbar e inhala al regresar las piernas al centro.\nDuración/Reps: Realiza el balanceo alterno continuo durante 40 segundos manteniendo un ritmo suave.\nErrores comunes: Despegar los hombros o los brazos del suelo al mover las rodillas, perdiendo el punto de torsión de la columna."
      }
    ],
    "stretch": [
      {
        "name": "Postura del Niño con Enfoque Lumbar",
        "desc": "Posición inicial: Colócate de rodillas en el suelo. Separa las rodillas al ancho del tapete y junta los dedos gordos de tus pies detrás de ti. Siéntate firmemente sobre tus talones.\nEjecución: Inclina tu torso hacia adelante extendiendo los brazos por completo al frente sobre el suelo. Camina con las yemas de tus dedos lo más lejos posible y empuja activamente tus glúteos hacia atrás para elongar toda la columna lumbar de forma pasiva.\nRespiración: Realiza respiraciones profundas dirigiendo el aire hacia la espalda baja; exhala relajando el vientre contra el suelo.\nDuración/Reps: Sostén la postura de forma totalmente estática durante 30 segundos continuos.\nErrores comunes: Despegar de forma exagerada los glúteos de los talones perdiendo el vector de estiramiento inferior."
      },
      {
        "name": "Torsión Espinal en el Suelo Estática",
        "desc": "Posición inicial: Acuéstate boca arriba sobre el tapete con las piernas completamente estiradas. Eleva tu rodilla derecha flexionándola a 90 grados verticalmente.\nEjecución: Utiliza tu mano izquierda para guiar la rodilla derecha cruzando por encima de tu cuerpo hacia el suelo del lado izquierdo. Mantén tu brazo derecho extendido en cruz hacia la derecha y gira la mirada hacia esa mano, manteniendo el hombro derecho pegado al piso.\nRespiración: Inhala profundo manteniendo la postura y exhala permitiendo que el peso de la mano izquierda hunda la rodilla de forma pasiva.\nDuración/Reps: Mantén la torsión estática durante 20 a 30 segundos, regresa al centro con cuidado y repite por el lado contrario.\nErrores comunes: Forzar la rodilla hacia el piso despegando por completo el hombro opuesto del suelo, anulando el estiramiento espinal."
      },
      {
        "name": "Flexión de Tronco hacia Adelante Sentado",
        "desc": "Posición inicial: Siéntate en el suelo con ambas piernas completamente extendidas hacia el frente y juntas. Coloca la espalda erguida y saca los talones apuntando los dedos de los pies hacia el techo.\nEjecución: Inclina el torso hacia adelante desde la articulación de la cadera, deslizando tus manos por tus piernas buscando sujetar tus tobillos, espinillas o las puntas de tus pies. Encorva ligeramente la espalda al final para estirar los erectores espinales inferiores.\nRespiración: Inhala profundo elevando la columna y exhala vaciando el aire mientras avanzas con las manos hacia adelante de forma estática.\nDuración/Reps: Sostén el estiramiento estático durante 25 segundos sin realizar rebotes musculares.\nErrores comunes: Flexionar las rodillas para alcanzar los pies o realizar tirones bruscos con los brazos causando espasmos de defensa."
      },
      {
        "name": "Colgado Asistido Descompresivo",
        "desc": "STALLBAR: Posición inicial: Colócate de frente a la espaldera. Sujeta firmemente con ambas manos en agarre prono una de las barras superiores de manera que tus brazos queden completamente extendidos por encima de tu cabeza.\nEjecución: Deja caer el peso de tu cuerpo de manera vertical, pero manteniendo las puntas de tus pies apoyadas sutilmente en el suelo o en una barra inferior muy baja. Flexiona ligeramente las rodillas permitiendo que la columna se estire y se descomprima por gravedad.\nRespiración: Mantén una respiración abdominal muy lenta; inhala expandiendo el abdomen y exhala soltando toda la musculatura lumbar.\nDuración/Reps: Quédate suspendido de forma estática durante 30 segundos completos.\nErrores comunes: Activar los músculos de la espalda simulando una dominada o despegar por completo los pies si no tienes fuerza de agarre."
      }
    ]
  },
  "midback": {
    "warmup": [
      {
        "name": "Desplazamiento Escapular de Pie",
        "desc": "Posición inicial: Ponte de pie de manera erguida con los pies separados al ancho de los hombros. Extiende ambos brazos completamente hacia el frente a la altura del pecho, manteniendo las palmas mirándose entre sí.\nEjecución: Sin doblar los codos en ningún momento, empuja tus manos hacia adelante separando las escápulas al máximo (protracción). Inmediatamente después, jala los hombros hacia atrás apretando fuertemente las escápulas entre sí (retracción). Repite de forma fluida.\nRespiración: Inhala al retraer y juntar las escápulas atrás; exhala al empujar hacia adelante estirando la espalda media.\nDuración/Reps: Realiza de 12 a 15 repeticiones completas de ida y vuelta a ritmo moderado.\nErrores comunes: Flexionar los codos durante el movimiento simulando un remo o elevar los hombros hacia las orejas."
      },
      {
        "name": "Deslizamientos en Pared (Wall Angels)",
        "desc": "Posición inicial: Apóyate de espaldas contra una pared lisa, asegurando que tus talones, glúteos, espalda alta y la parte posterior de tu cabeza estén en contacto con la superficie. Coloca los brazos contra la pared en posición de 'saludo militar' (codos y dorsos a 90°).\nEjecución: Desliza lentamente tus brazos hacia arriba por la pared manteniendo el contacto de las manos y codos con la superficie hasta extenderlos por completo formando una 'V'. Desciende controladamente hasta que los codos toquen tus costados de manera dinámica.\nRespiración: Exhala al deslizar los brazos hacia arriba manteniendo el abdomen firme e inhala al descender los codos.\nDuración/Reps: Realiza 10 repeticiones lentas enfocándote en la movilidad torácica de la espalda media.\nErrores comunes: Arquear la espalda baja despegándola de la pared o separar las manos de la pared durante el ascenso."
      },
      {
        "name": "Abrazo de Oso con Movilidad Dorsal",
        "desc": "Posición inicial: Ponte de pie con la espalda recta. Cruza tus brazos por delante de tu pecho buscando sujetar firmemente tus escápulas u hombros opuestos con tus manos (abrazo de oso apretado).\nEjecución: Manteniendo el agarre en tus hombros, encorva de forma dinámica tu espalda alta hacia adelante empujando los codos hacia abajo y separando las escápulas. Regresa a la vertical abriendo sutilmente el pecho sin soltar los hombros.\nRespiración: Exhala al encorvar la espalda alta comprimiendo el torso e inhala al regresar a la postura erguida.\nDuración/Reps: Realiza de 12 a 15 repeticiones de balanceo controlado y continuo.\nErrores comunes: Doblar la cintura involucrando la zona lumbar en lugar de aislar el movimiento en la sección dorsal media."
      },
      {
        "name": "Rotación Torácica con Mano en Nuca de Pie",
        "desc": "Posición inicial: Ponte de pie con las piernas separadas más allá del ancho de tus hombros. Flexiona ligeramente las caderas hacia adelante manteniendo la espalda plana y coloca tu mano izquierda detrás de tu nuca con el codo abierto.\nEjecución: Lleva el codo izquierdo de forma diagonal hacia abajo buscando tocar tu rodilla derecha. Inmediatamente rota el torso hacia el lado izquierdo apuntando el codo hacia el techo y abriendo la espalda media. Realiza las repeticiones y cambia de lado.\nRespiración: Inhala al abrir el codo hacia el techo expandiendo la espalda y exhala al descender hacia la rodilla opuesta.\nDuración/Reps: Completa 10 repeticiones por cada lado de forma continua.\nErrores comunes: Mover de forma excesiva las rodillas o permitir que la espalda baja se encorve durante la rotación."
      }
    ],
    "stretch": [
      {
        "name": "Estiramiento de Espalda Media con Brazos Cruzados al Frente",
        "desc": "Posición inicial: Ponte de pie de manera erguida. Extiende tus brazos hacia el frente a la altura de tus hombros, cruza tu muñeca derecha sobre la izquierda y entrelaza firmemente las palmas de tus manos.\nEjecución: Empuja tus manos entrelazadas fuertemente hacia adelante mientras de forma simultánea metes la cabeza entre tus brazos y encorvas la espalda media hacia atrás, creando una tracción opuesta que estira romboides y trapecio medio.\nRespiración: Inhala profundo expandiendo la zona interescapular y exhala manteniendo la presión de empuje de tus manos al frente.\nDuración/Reps: Sostén la posición estática durante 20 a 25 segundos completos, luego invierte el cruce de las manos y repite.\nErrores comunes: Flexionar las rodillas perdiendo el anclaje de la cadera o realizar movimientos oscilatorios en lugar de fijos."
      },
      {
        "name": "Estiramiento del Enhebrado de Aguja",
        "desc": "Posición inicial: Colócate en posición de cuadrupedia sobre un tapete, con las manos debajo de los hombros y rodillas debajo de las caderas.\nEjecución: Eleva ligeramente tu mano derecha y deslízala por el suelo por debajo de tu pecho hacia el lado izquierdo, permitiendo que tu hombro derecho y tu mejilla derecha se apoyen suavemente en el tapete. Mantén la cadera elevada y fija sobre las rodillas.\nRespiración: Inhala profundamente llenando la espalda media y exhala relajando el peso del hombro contra el suelo para acentuar el estiramiento.\nDuración/Reps: Sostén de forma pasiva durante 25 segundos y luego realiza el mismo procedimiento para el lado izquierdo.\nErrores comunes: Desplazar los glúteos hacia atrás sentándose en los talones o aplicar un peso excesivo y doloroso sobre el cuello."
      },
      {
        "name": "Apertura Dorsal en Torsión Acostado",
        "desc": "Posición inicial: Acuéstate sobre tu costado izquierdo en el suelo. Flexiona ambas rodillas a 90 grados hacia el frente para bloquear la zona lumbar. Extiende ambos brazos hacia el frente en el suelo, con las palmas juntas.\nEjecución: Eleva el brazo derecho y dibuja un arco amplio por encima de tu cuerpo hacia el lado derecho, rotando únicamente la espalda media e intentando apoyar el dorso de la mano y el hombro derecho en el suelo opuesto. Mantén las rodillas juntas en el piso.\nRespiración: Inhala al iniciar la apertura del brazo y exhala de forma prolongada al relajar el hombro derecho contra el suelo.\nDuración/Reps: Sostén el estiramiento de forma fija por 20 a 30 segundos y luego cambia de costado.\nErrores comunes: Permitir que las rodillas se separen del suelo perdiendo el bloqueo lumbar y disipando el estiramiento torácico."
      },
      {
        "name": "Tracción Escapular con Pies Apoyados",
        "desc": "STALLBAR: Posición inicial: Colócate de frente a la espaldera a una distancia de medio paso. Sujeta firmemente con ambas manos en agarre prono una barra que se ubique a la altura de tu ombligo o pecho.\nEjecución: Coloca los pies firmes cerca de la base de la espaldera. Flexiona tus rodillas y déjate caer hacia atrás estirando los brazos por completo, permitiendo que tu espalda se curve de forma controlada y tus escápulas se separen al máximo por el peso de tus caderas.\nRespiración: Inhala profundamente forzando la expansión de la zona dorsal media y exhala soltando el aire mientras dejas caer más peso atrás.\nDuración/Reps: Sostén la tracción estática durante 25 a 30 segundos continuos.\nErrores comunes: Hacer fuerza con los brazos intentando jalar la barra en lugar de colgar de forma pasiva y relajada."
      }
    ]
  },
  "lats": {
    "warmup": [
      {
        "name": "Jalón Dorsal al Aire Dinámico",
        "desc": "Posición inicial: Ponte de pie de manera erguida, separa los pies al ancho de tus hombros y eleva completamente ambos brazos de forma vertical hacia el techo con las manos abiertas.\nEjecución: Imagina que sostienes una barra pesada y jálala con fuerza hacia abajo llevando los codos de forma diagonal hacia tus costados traseros, apretando los dorsales fuertemente al final del recorrido. Extiende de nuevo los brazos al cielo rápidamente.\nRespiración: Exhala de manera enérgica al jalar los codos hacia abajo e inhala al extender los brazos de regreso al techo.\nDuración/Reps: Realiza 15 repeticiones dinámicas manteniendo una alta tensión imaginaria en el dorsal.\nErrores comunes: Mover el torso hacia adelante y atrás o no completar la extensión vertical completa de los brazos."
      },
      {
        "name": "Inclinaciones Laterales en Flecha",
        "desc": "Posición inicial: De pie, junta tus pies y estira ambos brazos verticalmente por encima de tu cabeza, entrelazando las manos formando una línea recta y compacta (posición de flecha).\nEjecución: Manteniendo el core firme y las piernas bloqueadas, realiza una inclinación lateral dinámica de tu torso hacia el lado derecho, estirando de forma activa todo el dorsal izquierdo. Regresa al centro y realiza la inclinación de inmediato hacia el lado izquierdo.\nRespiración: Inhala al estar en la posición vertical del centro y exhala al realizar la inclinación lateral dinámica hacia cada lado.\nDuración/Reps: Realiza el movimiento alterno durante 30 segundos de forma constante.\nErrores comunes: Flexionar los codos durante la inclinación o empujar la cadera excesivamente hacia adelante perdiendo el plano lateral."
      },
      {
        "name": "Transición de Plancha Alta a Perro Boca Abajo",
        "desc": "Posición inicial: Colócate en posición de plancha alta en el suelo, con las manos separadas al ancho de los hombros, el abdomen contraído y los pies apoyados en las puntas.\nEjecución: Empuja el suelo fuertemente con las palmas de tus manos y eleva tus caderas hacia el techo y hacia atrás de forma fluida, transitando a la postura de perro boca abajo. Hunde la cabeza y los hombros buscando una línea recta con tus dorsales y regresa a plancha.\nRespiración: Exhala al empujar las caderas hacia atrás estirando los dorsales e inhala al regresar a la plancha alta.\nDuración/Reps: Ejecuta de 10 a 12 transiciones dinámicas y controladas sin acelerar el ritmo.\nErrores comunes: Doblar excesivamente las rodillas si no es necesario o no realizar el empuje activo con los hombros en la fase alta."
      },
      {
        "name": "Circunducciones Laterales de Brazos Cruzados",
        "desc": "Posición inicial: Ponte de pie de manera erguida con las piernas separadas. Extiende tus brazos a los lados de manera horizontal a la altura de tus hombros con las palmas hacia abajo.\nEjecución: Cruza los brazos por delante del pecho de forma dinámica y balancéalos hacia arriba y hacia atrás dibujando un círculo completo gigante alrededor de tus hombros de forma coordinada, abriendo y estirando las fibras del dorsal ancho en el trayecto superior.\nRespiración: Inhala cuando los brazos viajen por encima de la cabeza y exhala cuando desciendan y se crucen al frente.\nDuración/Reps: Realiza el movimiento circular continuo durante 30 segundos totales.\nErrores comunes: Realizar los círculos de manera asimétrica o flexionar el torso hacia adelante deshaciendo la postura erguida."
      }
    ],
    "stretch": [
      {
        "name": "Estiramiento Lateral del Dorsal en Pared",
        "desc": "Posición inicial: Colócate de pie lateralmente a una pared a la distancia de un paso largo. Cruza la pierna interna por detrás de la pierna externa de forma exagerada.\nEjecución: Eleva el brazo interno y apoya la palma de la mano alta en la pared por encima de ti. Deja caer tu cadera hacia el lado de la pared mientras utilizas el brazo fijo para sostenerte, traccionando todo el costado lateral del dorsal ancho de forma estática.\nRespiración: Inhala profundo expandiendo la zona costal del dorsal estirado y exhala dejando caer más la cadera hacia el suelo.\nDuración/Reps: Sostén de forma totalmente estática por 20 a 30 segundos y luego repite para el lado contrario.\nErrores comunes: Girar el pecho hacia la pared perdiendo el estiramiento estrictamente lateral del músculo dorsal."
      },
      {
        "name": "Estiramiento de Dorsal en Cuadrupedia Cruzado",
        "desc": "Posición inicial: Colócate en el suelo en posición de cuadrupedia (cuatro puntos de apoyo) sobre un tapete o superficie cómoda.\nEjecución: Extiende tu mano derecha completamente hacia el frente y luego llévala de forma diagonal hacia el lado izquierdo, cruzando por delante de tu mano izquierda. Empuja tus glúteos de forma activa hacia atrás y hacia la derecha, sintiendo la tensión en el dorsal derecho.\nRespiración: Inhala profundamente llenando el pulmón del costado derecho y exhala hundiendo la axila derecha hacia el suelo.\nDuración/Reps: Mantén la posición fija por 20 a 25 segundos y cambia la posición de las manos para realizar el lado opuesto.\nErrores comunes: Doblar el brazo estirado perdiendo la tracción de la inserción o despegar las rodillas de su posición de anclaje."
      },
      {
        "name": "Postura de Cachorro con Codos Apoyados",
        "desc": "Posición inicial: Colócate de rodillas sobre un tapete con las caderas alineadas sobre las rodillas. Coloca ambos codos apoyados al frente en el suelo separados al ancho de tus hombros.\nEjecución: Junta las palmas de tus manos apuntando al techo. Camina con tus codos ligeramente hacia adelante y hunde de manera pasiva el pecho y las axilas hacia el suelo, permitiendo que tus manos se flexionen hacia tu espalda alta, elongando profundamente el dorsal largo.\nRespiración: Inhala manteniendo la estabilidad dorsal y exhala cediendo el pecho hacia el piso de forma totalmente pasiva.\nDuración/Reps: Mantén la posición estática durante 25 a 30 segundos firmes.\nErrores comunes: Desplazar las caderas hacia atrás sentándose sobre los talones convirtiéndolo en un estiramiento lumbar clásico."
      },
      {
        "name": "Dorsales Inclinado en Barra Media",
        "desc": "STALLBAR: Posición inicial: Colócate de frente a la espaldera a una distancia de dos pasos largos. Separa tus pies al ancho de las caderas y sujeta firmemente con ambas manos en agarre prono una barra que esté a la altura de tu pecho.\nEjecución: Manteniendo las piernas estiradas o semi-flexionadas según tu flexibilidad, empuja tus caderas hacia atrás con fuerza mientras dejas caer el torso hacia adelante, quedando paralelo al suelo entre tus brazos extendidos. Hunde activamente las axilas hacia el piso.\nRespiración: Inhala profundo y exhala prolongadamente permitiendo que la articulación del hombro y el dorsal se elonguen por la gravedad.\nDuración/Reps: Sostén la posición estática durante 25 a 30 segundos continuos.\nErrores comunes: Encorvar excesivamente la espalda alta en lugar de mantener la línea recta de tracción o soltar la tensión de las caderas."
      }
    ]
  },
  "traps": {
    "warmup": [
      {
        "name": "Encogimientos Escapulares Dinámicos",
        "desc": "Posición inicial: Ponte de pie de manera erguida, con los pies separados al ancho de las caderas y los brazos colgando completamente relajados a ambos lados de tus muslos.\nEjecución: Eleva ambos hombros de manera simultánea hacia tus orejas lo más alto posible de forma enérgica. Mantén la contracción en la cima durante un segundo completo y luego bájalos lentamente controlando el descenso por completo. Repite de inmediato.\nRespiración: Inhala al elevar los hombros con fuerza hacia las orejas y exhala durante el descenso controlado de los mismos.\nDuración/Reps: Completa de 12 a 15 repeticiones de manera rítmica y controlada.\nErrores comunes: Realizar círculos con los hombros en lugar de una elevación estrictamente vertical o utilizar el impulso de las piernas."
      },
      {
        "name": "Tirones de Codos hacia Atrás con Retracción",
        "desc": "Posición inicial: Ponte de pie con la espalda recta. Eleva tus brazos flexionando los codos a 90 grados a la altura de tus hombros, posicionando tus manos abiertas frente a tu pecho con los dedos mirándose entre sí.\nEjecución: Jala los codos de forma enérgica e intensa hacia atrás y hacia abajo, buscando que tus escápulas se junten fuertemente en la espalda media y activando las fibras medias y superiores del trapecio. Regresa a la posición inicial de forma fluida.\nRespiración: Exhala al jalar los codos hacia atrás realizando la contracción escapular e inhala al regresar las manos al frente.\nDuración/Reps: Realiza 15 repeticiones dinámicas y consecutivas.\nErrores comunes: Bajar los codos por debajo de la línea de los hombros perdiendo la activación o empujar el cuello hacia adelante."
      },
      {
        "name": "Giros de Hombros Alternados en Círculo",
        "desc": "Posición inicial: Ponte de pie de manera erguida con los brazos relajados a los lados de los muslos y la mirada fija en un punto al frente.\nEjecución: Inicia una rotación circular exagerada de tus hombros hacia atrás de forma alternada: primero rota el hombro derecho hacia arriba, atrás y abajo; y mientras el derecho desciende, inicia el mismo recorrido con el hombro izquierdo de forma fluida y continua.\nRespiración: Mantén una respiración calmada y constante, inhalando en una rotación y exhalando en la rotación del lado opuesto.\nDuración/Reps: Ejecuta el movimiento circular continuo durante 30 segundos en total.\nErrores comunes: Mover todo el torso de lado a lado de forma exagerada en lugar de aislar el movimiento en la cintura escapular."
      },
      {
        "name": "Depresiones Escapulares Activas de Pie",
        "desc": "Posición inicial: Ponte de pie de manera erguida. Extiende tus brazos hacia abajo pegados al cuerpo con las manos abiertas y los dedos apuntando con firmeza hacia el suelo.\nEjecución: Empuja tus hombros de manera forzada y voluntaria hacia el suelo, alejándolos lo más posible de tus orejas para activar las fibras inferiores del trapecio. Sostén la tensión muscular abajo durante 2 segundos y luego relaja volviendo al centro.\nRespiración: Exhala profundamente al empujar los hombros hacia abajo manteniendo la contracción e inhala al relajar al centro.\nDuración/Reps: Completa de 12 a 15 repeticiones controladas de forma secuencial.\nErrores comunes: Flexionar el torso lateralmente o doblar los codos perdiendo el vector de empuje vertical hacia abajo."
      }
    ],
    "stretch": [
      {
        "name": "Estiramiento del Trapecio Superior Asistido",
        "desc": "Posición inicial: Ponte de pie o siéntate de forma erguida con la espalda recta. Lleva tu brazo derecho detrás de tu espalda baja para fijar y deprimir el hombro derecho de manera pasiva.\nEjecución: Coloca tu mano izquierda sobre el lado derecho de tu cabeza por encima de la oreja. Inclina suavemente tu cabeza hacia el hombro izquierdo aplicando una presión estática muy leve con la mano, sintiendo la elongación en el trapecio superior derecho.\nRespiración: Respira de manera profunda y lenta; exhala prolongadamente disipando la tensión acumulada en el costado del cuello.\nDuración/Reps: Sostén el estiramiento estático durante 20 a 30 segundos por lado.\nErrores comunes: Jalar la cabeza con demasiada fuerza provocando dolor o permitir que el hombro que se estira se eleve siguiendo el movimiento."
      },
      {
        "name": "Estiramiento de Trapecio Medio Cruzando Hombros",
        "desc": "Posición inicial: Siéntate en una silla o mantente de pie de manera erguida. Extiende ambos brazos al frente cruzando los antebrazos por completo de forma que los codos queden superpuestos.\nEjecución: Flexiona los brazos hacia arriba e intenta sujetar los hombros opuestos con tus manos. Camina con tus dedos hacia atrás buscando el borde interno de tus escápulas y empuja activamente tus codos hacia abajo y al frente, separando las escápulas de forma pasiva.\nRespiración: Inhala profundo separando las fibras de la espalda alta y exhala relajando la musculatura interescapular.\nDuración/Reps: Mantén la posición de forma estática por 20 a 25 segundos, cambia el cruce de brazos y repite.\nErrores comunes: Elevar los hombros tensionando el cuello o realizar tirones bruscos con los brazos."
      },
      {
        "name": "Tracción de Trapecio Superior con Manos Detrás",
        "desc": "Posición inicial: Ponte de pie con las piernas separadas al ancho de las caderas. Lleva ambos brazos detrás de tu cuerpo a la altura de tus glúteos.\nEjecución: Sujeta tu muñeca derecha con tu mano izquierda detrás de tu espalda baja. Jala el brazo derecho suavemente hacia el lado izquierdo mientras inclinas simultáneamente tu cabeza hacia el hombro izquierdo, estirando las fibras superiores del trapecio derecho.\nRespiración: Inhala de forma diafragmática y exhala manteniendo la tracción manual suave y la inclinación cervical fija.\nDuración/Reps: Sostén la posición estática durante 20 segundos por cada lado corporal.\nErrores comunes: Girar el rostro hacia el suelo perdiendo la alineación lateral estricta o arquear la columna hacia adelante."
      },
      {
        "name": "Trapecio Superior por Inclinación Lateral",
        "desc": "STALLBAR: Posición inicial: Colócate de lado junto a la espaldera, a la distancia de la longitud de tu brazo. Sujeta firmemente con la mano interna una de las barras situadas a nivel de tu cintura o cadera, manteniendo el brazo totalmente estirado.\nEjecución: Manteniendo los pies fijos cerca de la base, deja caer el peso de todo tu cuerpo de forma lateral hacia el lado opuesto de la espaldera, de modo que tu brazo interno quede tenso deprimiendo el hombro. Inclina tu cabeza hacia el hombro externo para maximizar el estiramiento.\nRespiración: Inhala profundo y exhala prolongadamente permitiendo que el peso de tu propio cuerpo traccione y elongue el trapecio.\nDuración/Reps: Mantén la inclinación estática durante 20 a 30 segundos por lado.\nErrores comunes: Flexionar el brazo de agarre perdiendo la tensión corporal o soltar el agarre de forma brusca."
      }
    ]
  },
  "quads": {
    "warmup": [
      {
        "name": "Sentadillas Libres a Ritmo Controlado",
        "desc": "Posición inicial: Ponte de pie de manera erguida, con los pies separados al ancho de los hombros y las puntas ligeramente rotadas hacia afuera (unos 15 grados), manteniendo la mirada fija al frente.\nEjecución: Desciende la cadera como si fueras a sentarte en una silla, flexionando rodillas y caderas simultáneamente durante 3 segundos hasta romper el paralelo. Mantén un segundo abajo para activar los cuádriceps y sube de forma explosiva al inicio.\nRespiración: Inhala profundamente al iniciar el descenso llenando el abdomen, y exhala con fuerza al subir y completar la extensión.\nDuración/Reps: Realiza de 10 a 12 repeticiones completas manteniendo un control técnico impecable.\nErrores comunes: Permitir que las rodillas colapsen hacia adentro (valgo) o levantar los talones del suelo durante el descenso."
      },
      {
        "name": "Desplantes Inversos Dinámicos",
        "desc": "Posición inicial: Ponte de pie de manera erguida, con los pies juntos y las manos colocadas firmemente sobre tus caderas para asegurar el equilibrio corporal.\nEjecución: Da un paso largo hacia atrás con la pierna derecha. Flexiona ambas rodillas simultáneamente hasta que la rodilla trasera quede a un centímetro del suelo y la rodilla delantera forme un ángulo de 90 grados. Empuja con la pierna trasera para regresar al frente de forma dinámica y alterna.\nRespiración: Inhala al dar el paso hacia atrás y descender, y exhala al empujar el suelo para regresar a la posición inicial erguida.\nDuración/Reps: Realiza 12 a 14 repeticiones totales alternando las piernas de forma fluida.\nErrores comunes: Golpear la rodilla trasera contra el suelo de forma brusca o inclinar excesivamente el torso hacia adelante."
      },
      {
        "name": "Skiping con Talones al Glúteo Controlado",
        "desc": "Posición inicial: Ponte de pie con el torso erguido, los pies separados al ancho de las caderas y los brazos flexionados a 90 grados a los lados listos para bracear.\nEjecución: Realiza un trote estático dinámico flexionando las rodillas de forma exagerada hacia atrás, buscando de manera consecutiva que tus talones golpeen suavemente tus glúteos en cada zancada. Mantén una cadencia fluida y un braceo coordinado.\nRespiración: Mantén una respiración rítmica y constante adaptada a la velocidad del trote estático.\nDuración/Reps: Ejecuta el movimiento continuo durante 30 a 45 segundos sin detenerte.\nErrores comunes: Inclinar el torso demasiado hacia adelante perdiendo la postura recta o realizar el movimiento sin activar los cuádriceps."
      },
      {
        "name": "Zancadas Laterales Alternas Activas",
        "desc": "Posición inicial: Ponte de pie con las piernas juntas, la espalda completamente recta y las manos entrelazadas frente a tu pecho para estabilizar el peso.\nEjecución: Da un paso amplio de forma lateral hacia el lado derecho. Flexiona profundamente la rodilla derecha desplazando la cadera hacia atrás mientras mantienes la pierna izquierda totalmente estirada. Empuja con fuerza el pie derecho para regresar al centro y repite hacia el lado izquierdo.\nRespiración: Inhala al abrir la pierna lateralmente y descender la cadera, y exhala al empujar el suelo para regresar al punto de inicio.\nDuración/Reps: Completa de 10 a 12 repeticiones totales de manera alterna.\nErrores comunes: Permitir que la rodilla flexionada sobrepase excesivamente la punta del pie lateral o despegar el talón del suelo."
      }
    ],
    "stretch": [
      {
        "name": "Estiramiento de Cuádriceps Clásico de Pie",
        "desc": "Posición inicial: Ponte de pie de manera erguida. Si lo necesitas, apoya tu mano izquierda sobre una pared o estructura estable para mantener el equilibrio de forma segura.\nEjecución: Flexiona tu rodilla derecha hacia atrás elevando el pie. Sujeta el empeine derecho con tu mano derecha y jala el talón con firmeza hacia tu glúteo. Mantén ambas rodillas juntas y alineadas, y empuja tu cadera ligeramente hacia adelante para estirar el recto femoral.\nRespiración: Respira de manera pausada; exhala profundamente relajando el cuádriceps para permitir que el talón se acerque más al glúteo.\nDuración/Reps: Sostén la posición estática durante 20 a 30 segundos por cada pierna.\nErrores comunes: Separar la rodilla que estira de forma lateral o arquear la espalda lumbar exageradamente para compensar el rango."
      },
      {
        "name": "Estiramiento de Cuádriceps Acostado Boca Abajo",
        "desc": "Posición inicial: Acuéstate boca abajo sobre un tapete o colchoneta, con las piernas completamente estiradas y la frente apoyada sobre tu antebrazo izquierdo colocado horizontalmente.\nEjecución: Flexiona la rodilla derecha hacia atrás buscando el glúteo. Lleva tu mano derecha hacia atrás, sujeta el empeine o el tobillo derecho y jálalo con firmeza hacia abajo. Asegúrate de mantener la pelvis presionada firmemente contra el suelo en todo momento.\nRespiración: Inhala profundo y exhala liberando la tensión del muslo, presionando el pubis contra el mat en cada exhalación.\nDuración/Reps: Mantén la posición fija por 20 a 25 segundos antes de cambiar de pierna.\nErrores comunes: Despegar la cadera o el muslo del suelo al jalar el pie, lo cual disminuye drásticamente la efectividad del estiramiento."
      },
      {
        "name": "Estiramiento del Caballero Profundo",
        "desc": "Posición inicial: Colócate en posición de zancada en el suelo, apoyando la rodilla trasera (derecha) sobre un tapete acolchado y adelantando el pie izquierdo a 90 grados.\nEjecución: Coloca las manos sobre tu rodilla delantera. Contrae firmemente el glúteo derecho y desplaza todo el peso de tu cadera hacia adelante y hacia abajo de forma controlada, sintiendo el estiramiento profundo en el flexor de cadera y la parte alta del cuádriceps derecho.\nRespiración: Inhala elevando el torso y exhala profundizando el descenso pasivo de la cadera hacia el suelo.\nDuración/Reps: Sostén la posición estática durante 25 segundos por cada lado corporal.\nErrores comunes: Arquear la espalda baja perdiendo la retroversión pélvica indispensable para elongar el recto anterior."
      },
      {
        "name": "Couch Stretch Asistido",
        "desc": "STALLBAR: Posición inicial: Colócate de rodillas frente a la espaldera, pero de espaldas a ella. Apoya la rodilla derecha sobre una almohadilla o tapete pegado a la base y eleva el pie derecho verticalmente apoyando el empeine directamente contra la primera o segunda barra inferior.\nEjecución: Da un paso al frente con el pie izquierdo apoyando la planta a 90 grados. Con cuidado, eleva tu torso hasta quedar completamente erguido, buscando apoyar tu espalda alta contra la espaldera para maximizar la tensión lineal en el cuádriceps derecho.\nRespiración: Realiza respiraciones profundas e intermitentes; exhala de forma prolongada tolerando la alta intensidad del estiramiento.\nDuración/Reps: Mantén la postura estática durante 25 a 30 segundos por pierna.\nErrores comunes: Dejar caer el torso hacia adelante por falta de movilidad o permitir que la rodilla trasera sufra dolor por falta de colchón."
      }
    ]
  },
  "hamstrings": {
    "warmup": [
      {
        "name": "Patadas Frankenstein Dinámicas",
        "desc": "Posición inicial: Ponte de pie de manera erguida al inicio de un pasillo corto, con los pies separados al ancho de las caderas y ambos brazos extendidos al frente horizontalmente a la altura de los hombros.\nEjecución: Camina dando pasos hacia adelante elevando la pierna derecha completamente estirada hacia arriba, buscando tocar de forma dinámica la palma de la mano izquierda. Baja la pierna con control y da el siguiente paso elevando la pierna izquierda hacia la mano derecha.\nRespiración: Exhala de forma enérgica en el momento de la elevación de la pierna e inhala al descenderla para dar el paso continuo.\nDuración/Reps: Completa 10 pasos dinámicos por cada pierna de forma alterna.\nErrores comunes: Flexionar la rodilla de la pierna que se eleva anulando el estímulo dinámico o doblar el torso al frente para alcanzar el pie."
      },
      {
        "name": "Buenos Días Dinámicos con Manos en Nuca",
        "desc": "Posición inicial: Ponte de pie con las piernas separadas al ancho de los hombros. Coloca las yemas de tus dedos detrás de tu nuca con los codos completamente abiertos y la espalda recta.\nEjecución: Realiza una bisagra de cadera empujando activamente tus glúteos hacia atrás mientras flexionas el torso hacia adelante. Mantén las rodillas semi-flexionadas (solo unos 5 grados) y desciende hasta que el torso quede casi paralelo al suelo sintiendo la tensión excéntrica en los femorales. Regresa contrayendo el glúteo.\nRespiración: Inhala profundamente durante el descenso controlado del torso y exhala con fuerza al regresar a la vertical.\nDuración/Reps: Realiza de 12 a 15 repeticiones fluidas con ritmo constante.\nErrores comunes: Encorvar la columna lumbar durante el descenso convirtiendo el ejercicio en una flexión de espalda."
      },
      {
        "name": "Extensiones de Rodilla 90/90 Acostado",
        "desc": "Posición inicial: Acuéstate boca arriba sobre un tapete con la espalda plana. Eleva tu pierna derecha flexionando tanto la cadera como la rodilla a 90 grados, sujetando fuertemente el muslo por detrás con ambas manos.\nEjecución: Manteniendo el muslo perfectamente vertical e inmóvil en el aire, extiende la rodilla por completo apuntando el talón hacia el techo hasta sentir la activación activa del femoral. Sostén un segundo en la extensión y regresa de forma dinámica.\nRespiración: Exhala al extender la rodilla apuntando al techo e inhala al regresar a la flexión de 90 grados.\nDuración/Reps: Realiza 12 repeticiones dinámicas con la pierna derecha, e inmediatamente cambia para hacer 12 con la izquierda.\nErrores comunes: Separar el muslo de las manos perdiendo los 90 grados de flexión de cadera original."
      },
      {
        "name": "Bisagra de Cadera Unilateral Dinámica",
        "desc": "Posición inicial: Ponte de pie de manera erguida. Desplaza ligeramente el pie izquierdo hacia atrás apoyando únicamente la punta del pie, dejando todo el peso de tu cuerpo cargado sobre la pierna derecha de soporte.\nEjecución: Con las manos en las caderas y manteniendo la espalda completamente recta, empuja los glúteos hacia atrás flexionando el torso hacia adelante sobre la pierna derecha rígida (rodilla apenas flexionada). Siente el estiramiento activo y regresa contrayendo el femoral de forma dinámica.\nRespiración: Inhala al descender controladamente manteniendo la espalda neutra y exhala al empujar el suelo para reincorporarte.\nDuración/Reps: Completa 10 repeticiones continuas en la pierna derecha y luego cambia el apoyo para realizar 10 en la izquierda.\nErrores comunes: Rotar la pelvis hacia los lados durante la bajada perdiendo la simetría o flexionar de más la rodilla activa."
      }
    ],
    "stretch": [
      {
        "name": "Estiramiento Isquiotibial Unilateral en Banco",
        "desc": "Posición inicial: Colócate de pie frente a un banco, escalón o superficie estable que se encuentre a la altura aproximada de tu rodilla o espinilla.\nEjecución: Coloca el talón de tu pierna derecha sobre el banco manteniendo la pierna completamente estirada y los dedos del pie apuntando al cielo. Coloca las manos en la cintura e inclina tu torso hacia adelante desde la cadera con la espalda recta, buscando proyectar el pecho hacia la rodilla.\nRespiración: Inhala profundo para alargar la columna y exhala de forma prolongada descendiendo el torso milimétricamente sin encorvarse.\nDuración/Reps: Mantén la postura estática durante 20 a 30 segundos por cada pierna.\nErrores comunes: Encorvar la espalda alta arqueando los hombros para intentar tocar el pie a la fuerza desalineando el estiramiento."
      },
      {
        "name": "Estiramiento de Isquiotibiales con Banda en Suelo",
        "desc": "Posición inicial: Acuéstate boca arriba en el suelo con las piernas estiradas. Pasa una banda de resistencia o cuerda alrededor del metatarso de tu pie derecho, sujetando los extremos con ambas manos.\nEjecución: Eleva la pierna derecha verticalmente manteniendo la rodilla completamente bloqueada en extensión. Jala la banda de forma progresiva hacia tu torso manteniendo la otra pierna plana en el suelo, hasta alcanzar un punto de estiramiento óptimo en la parte posterior del muslo.\nRespiración: Exhala lentamente a medida que incrementas la tensión de la banda hacia ti; inhala manteniendo la posición fija.\nDuración/Reps: Sostén de forma totalmente estática durante 25 a 30 segundos por lado.\nErrores comunes: Permitir que la rodilla se flexione de forma inconsciente para aliviar la tensión o despegar la pelvis del mat."
      },
      {
        "name": "Flexión de Tronco con Piernas Separadas en V",
        "desc": "Posición inicial: Siéntate en el suelo y abre ambas piernas horizontalmente hacia los lados formando una 'V' lo más amplia posible, manteniendo las rodillas estiradas.\nEjecución: Rota sutilmente tu torso hacia la pierna derecha. Inclina el torso hacia adelante sobre esa pierna deslizando tus manos por la espinilla hasta alcanzar el tobillo o el pie, buscando estirar el femoral de forma concentrada. Sostén y luego cambia al centro y al lado opuesto.\nRespiración: Inhala profundo abriendo el espacio intervertebral y exhala cediendo el torso de forma pasiva sobre el muslo.\nDuración/Reps: Sostén de forma estática por 20 segundos en el lado derecho, 20 en el centro y 20 en el izquierdo.\nErrores comunes: Levantar la rodilla opuesta del suelo o realizar movimientos de rebote balístico."
      },
      {
        "name": "Femoral Elevado en Barra Media",
        "desc": "STALLBAR: Posición inicial: Colócate de frente a la espaldera a una distancia de un paso. Eleva tu pierna derecha y apoya el talón sobre una de las barras que se encuentre a una altura que te exija pero te permita mantener la espalda recta.\nEjecución: Manteniendo la rodilla derecha completamente bloqueada en extensión y el pie izquierdo de apoyo firme en el suelo apuntando al frente, inclina tu torso hacia adelante desde la articulación de la cadera. Desliza tus manos por la barra o por tu pierna buscando la punta del pie.\nRespiración: Inhala profundo expandiendo el tórax y exhala de forma sostenida relajando los isquiotibiales de la pierna elevada.\nDuración/Reps: Sostén el estiramiento estático durante 20 a 30 segundos por cada pierna.\nErrores comunes: Doblar la rodilla de soporte del suelo o curvar excesivamente la columna lumbar perdiendo la tensión."
      }
    ]
  },
  "glutes": {
    "warmup": [
      {
        "name": "Patadas Hidrantes en Cuadrupedia",
        "desc": "Posición inicial: Colócate en el suelo en posición de cuatro puntos de apoyo (cuadrupedia), con las manos alineadas debajo de tus hombros y las rodillas debajo de tus caderas, manteniendo el core activo.\nEjecución: Manteniendo la rodilla derecha flexionada exactamente a 90 grados, elévela de forma lateral hacia el costado exterior de tu cuerpo, buscando alinear el muslo paralelo al suelo de forma dinámica sin rotar la pelvis. Regresa controladamente al inicio.\nRespiración: Exhala de manera enérgica al elevar la rodilla lateralmente contrayendo el glúteo medio e inhala al regresar al centro.\nDuración/Reps: Realiza 12 repeticiones dinámicas por el lado derecho e inmediatamente ejecuta 12 por el lado izquierdo.\nErrores comunes: Inclinar o rotar todo el torso hacia el lado opuesto para elevar más la pierna en lugar de aislar el movimiento en la cadera."
      },
      {
        "name": "Círculos de Cadera Coxofemoral de Pie",
        "desc": "Posición inicial: Ponte de pie de manera erguida. Si lo requieres, apoya una mano en la pared para tener estabilidad. Eleva la rodilla derecha al frente flexionada a 90 grados hasta la altura de tu cadera.\nEjecución: Dibuja un círculo gigante en el aire con tu rodilla de forma fluida: llévala hacia afuera abriendo la cadera al máximo, luego rótala hacia atrás y desciéndela rozando el suelo para volver al frente de forma continua. Realiza la mitad de repeticiones y cambia de sentido.\nRespiración: Mantén una respiración constante, inhalando en la fase de apertura frontal y exhalando al cerrar el círculo atrás.\nDuración/Reps: Completa 10 círculos hacia afuera y 10 hacia adentro por cada pierna.\nErrores comunes: Mover los hombros o el torso desestabilizando la postura erguida de la columna."
      },
      {
        "name": "Puentes de Glúteo Dinámicos con Pausa",
        "desc": "Posición inicial: Acuéstate boca arriba sobre un tapete con las rodillas flexionadas y los pies apoyados en el suelo al ancho de las caderas, situando los talones cerca de tus glúteos y los brazos relajados a los lados.\nEjecución: Empuja el suelo firmemente con tus talones y eleva tus caderas verticalmente hacia el techo hasta formar una línea recta desde las rodillas hasta los hombros. Sostén la contracción arriba un segundo apretando los glúteos y desciende rozando el mat de forma dinámica.\nRespiración: Exhala con fuerza al empujar con los talones y elevar la cadera e inhala durante el descenso controlado.\nDuración/Reps: Realiza de 12 a 15 repeticiones fluidas manteniendo la tensión muscular.\nErrores comunes: Arquear excesivamente la espalda baja en la parte alta en lugar de realizar una extensión de cadera con retroversión pélvica."
      },
      {
        "name": "Desplantes de Reverencia Cruzados",
        "desc": "Posición inicial: Ponte de pie de manera erguida con los pies separados al ancho de los hombros y las manos entrelazadas frente a tu pecho.\nEjecución: Da un paso largo hacia atrás con la pierna derecha, pero cruzándola de forma diagonal por detrás de la línea media de tu pierna izquierda (como haciendo una reverencia). Flexiona ambas rodillas bajando la cadera de forma controlada y regresa al centro empujando dinámicamente.\nRespiración: Inhala al dar el paso cruzado hacia atrás y descender la cadera, y exhala al regresar con fuerza a la postura inicial.\nDuración/Reps: Realiza 12 repeticiones alternas o de forma consecutiva por pierna.\nErrores comunes: Girar el torso por completo perdiendo la orientación frontal de los hombros o realizar un paso muy corto."
      }
    ],
    "stretch": [
      {
        "name": "Figura 4 Acostado Boca Arriba",
        "desc": "Posición inicial: Acuéstate boca arriba sobre un tapete con las rodillas flexionadas y las plantas de los pies apoyadas en el suelo de forma inicial.\nEjecución: Cruza tu tobillo derecho sobre la rodilla izquierda formando el número '4' con tus piernas. Eleva el pie izquierdo del suelo, pasa tus manos por debajo de tu muslo izquierdo y jálalo con suavidad hacia tu pecho, sintiendo el estiramiento en el glúteo derecho.\nRespiración: Inhala profundo manteniendo la cabeza apoyada y exhala de forma prolongada acercando el muslo izquierdo un centímetro más al pecho.\nDuración/Reps: Sostén la posición de forma totalmente estática por 25 a 30 segundos por lado.\nErrores comunes: Levantar la cabeza o los hombros del suelo tensionando el cuello en lugar de mantener la espalda relajada."
      },
      {
        "name": "Postura de la Paloma Pasiva en Suelo",
        "desc": "Posición inicial: Colócate en posición de cuadrupedia o plancha alta sobre un tapete cómodo.\nEjecución: Desplaza tu rodilla derecha hacia adelante colocándola justo detrás de tu muñeca derecha, flexionando la pierna de modo que el tobillo derecho quede cerca de tu cadera izquierda. Desliza la pierna izquierda completamente estirada hacia atrás y baja tu torso sobre la rodilla delantera.\nRespiración: Respira de manera profunda; inhala sintiendo la tensión y exhala rindiendo por completo el peso del torso sobre la pierna flexionada.\nDuración/Reps: Sostén la postura pasiva durante 30 segundos firmes por cada pierna.\nErrores comunes: Rotar la cadera hacia los lados en lugar de mantener la pelvis perfectamente paralela y alineada con el suelo."
      },
      {
        "name": "Estiramiento del Piramidal Sentado con Torsión",
        "desc": "Posición inicial: Siéntate en el suelo con ambas piernas extendidas al frente de forma erguida.\nEjecución: Flexiona la rodilla derecha y cruza el pie derecho por encima de la pierna izquierda, apoyando la planta plana al lado exterior de la rodilla izquierda. Abraza la rodilla derecha fuertemente con tu brazo izquierdo jalándola hacia tu pecho y rota tu torso hacia la derecha.\nRespiración: Inhala alargando la columna hacia el techo y exhala acentuando la torsión del torso y el tirón de la rodilla contra el pecho.\nDuración/Reps: Sostén el estiramiento estático durante 20 a 25 segundos por lado.\nErrores comunes: Encorvar la espalda baja perdiendo la postura vertical, lo cual disminuye significativamente el estiramiento del glúteo profundo."
      },
      {
        "name": "Figura 4 de Pie con Sentadilla Asistida",
        "desc": "STALLBAR: Posición inicial: Colócate de frente a la espaldera a una distancia de un paso corto. Sujeta firmemente con ambas manos una de las barras situadas a la altura de tu pecho.\nEjecución: Cruza tu tobillo derecho justo por encima de la rodilla izquierda formando un '4'. Manteniendo un agarre seguro en la barra, empuja tus glúteos hacia atrás y flexiona la rodilla izquierda realizando un gesto de sentadilla profunda sobre una pierna, elongando el glúteo derecho.\nRespiración: Inhala profundo manteniendo los brazos extendidos y exhala descendiendo la cadera de forma pasiva y estática hacia el suelo.\nDuración/Reps: Sostén la posición estática durante 20 a 30 segundos por cada pierna.\nErrores comunes: Soltar el peso de golpe sin control o arquear la columna lumbar perdiendo la estabilidad de la cadera."
      }
    ]
  },
  "calves": {
    "warmup": [
      {
        "name": "Elevaciones de Talón de Pie Continuas",
        "desc": "Posición inicial: Ponte de pie de manera erguida, con los pies paralelos separados al ancho de las caderas y las manos en la cintura o apoyadas sutilmente en una pared para estabilidad.\nEjecución: Eleva tus talones de forma enérgica despegándolos del suelo hasta quedar apoyado firmemente sobre los metatarsos de tus pies, contrayendo al máximo los gemelos. Sostén medio segundo arriba y desciende rozando el suelo para repetir inmediatamente.\nRespiración: Exhala al elevarte sobre las puntas de los pies e inhala al descender de forma controlada hacia el suelo.\nDuración/Reps: Completa de 15 a 20 repeticiones continuas manteniendo un ritmo fluido.\nErrores comunes: Realizar flexiones de rodilla para impulsarse o permitir que los tobillos se tuerzan hacia afuera en la fase alta."
      },
      {
        "name": "Saltos Cortos sobre Metatarsos (Pogo Hops)",
        "desc": "Posición inicial: Ponte de pie con el cuerpo erguido, los pies juntos y los brazos relajados a los lados de tu torso.\nEjecución: Realiza saltos verticales muy cortos, rápidos y repetitivos despegando apenas unos centímetros del suelo. La clave es mantener las rodillas casi bloqueadas (rígidas) y amortiguar e impulsarse utilizando exclusivamente la articulación del tobillo de forma reactiva.\nRespiración: Mantén una respiración corta, rítmica y continua que acompañe la frecuencia de los saltos rápidos.\nDuración/Reps: Ejecuta el movimiento continuo e ininterrumpido durante 30 segundos.\nErrores comunes: Flexionar excesivamente las rodillas convirtiéndolo en un salto de potencia en lugar de un trabajo reactivo de pantorrilla."
      },
      {
        "name": "Pedaleo de Pantorrilla en Carpa",
        "desc": "Posición inicial: Colócate en el suelo en posición de V invertida (postura de perro boca abajo o carpa), empujando el suelo con las manos y manteniendo las caderas elevadas hacia el techo.\nEjecución: Flexiona la rodilla derecha de forma que despegues el talón derecho del suelo, mientras que de forma simultánea empujas el talón izquierdo firmemente hacia el piso buscando estirar e inundar de sangre el gemelo izquierdo. Alterna el pedaleo de forma fluida.\nRespiración: Exhala en cada cambio de talón presionando el suelo de forma rítmica e inhala en la transición intermedia.\nDuración/Reps: Realiza el pedaleo continuo durante 40 segundos totales.\nErrores comunes: Mover los hombros o perder la estructura rígida de los brazos desalineando la postura de carpa."
      },
      {
        "name": "Caminata Exagerada sobre Puntas",
        "desc": "Posición inicial: Ponte de pie de manera erguida al inicio de un espacio plano despejado. Eleva tus talones al máximo quedando sostenido solo sobre las puntas de tus pies.\nEjecución: Camina hacia adelante dando pasos cortos y lentos, manteniendo los talones lo más altos posible de forma isométrica en cada paso. Exagera la contracción de los gemelos en cada avance, manteniendo las piernas completamente rectas.\nRespiración: Mantén una respiración calmada, diafragmática y constante durante el trayecto de la caminata.\nDuración/Reps: Camina de forma continua durante 30 a 45 segundos manteniendo la máxima altura.\nErrores comunes: Permitir que los talones desciendan gradualmente debido a la fatiga sin mantener la contracción isométrica alta."
      }
    ],
    "stretch": [
      {
        "name": "Estiramiento de Gemelo contra Pared con Pierna Recta",
        "desc": "Posición inicial: Colócate de pie frente a una pared a la distancia de un paso largo. Apoya ambas palmas de tus manos planas sobre la pared a la altura de tus ojos.\nEjecución: Da un paso largo hacia atrás con tu pierna derecha. Mantén la pierna derecha completamente estirada (rodilla bloqueada) y presiona el talón derecho con firmeza contra el suelo, mientras flexionas la rodilla delantera inclinándote hacia la pared.\nRespiración: Inhala profundo manteniendo la postura y exhala presionando con más fuerza el talón posterior contra el piso.\nDuración/Reps: Sostén el estiramiento estático durante 20 a 30 segundos por cada pierna.\nErrores comunes: Despegar el talón trasero del suelo o flexionar la rodilla posterior disipando la tensión sobre el músculo gastrocnemio."
      },
      {
        "name": "Estiramiento de Pantorrilla Sentado con Banda",
        "desc": "Posición inicial: Siéntate en el suelo de forma erguida con las piernas completamente extendidas y juntas hacia el frente.\nEjecución: Pasa una banda elástica o toalla alrededor de los metatarsos de tus pies (o de uno solo para aislar). Sujeta los extremos con tus manos y jala con firmeza hacia tu torso, forzando una dorsiflexión profunda en los tobillos con las rodillas bloqueadas.\nRespiración: Exhala de manera prolongada a medida que aumentas la tracción de la banda hacia ti, manteniendo los hombros relajados.\nDuración/Reps: Sostén la posición de forma totalmente estática por 25 segundos continuos.\nErrores comunes: Flexionar las rodillas para aliviar la tensión o encorvar la espalda alta perdiendo la tensión lineal."
      },
      {
        "name": "Estiramiento de Gemelo en Escalón Pasivo",
        "desc": "Posición inicial: Colócate de pie sobre el borde de un escalón o superficie elevada estable. Apoya únicamente la mitad delantera (metatarsos) de tus pies, dejando los talones suspendidos en el aire.\nEjecución: Manteniendo las rodillas completamente rectas, deja caer lentamente tus talones por debajo del nivel del escalón utilizando el peso de tu propio cuerpo de forma pasiva, sintiendo la elongación profunda en los gemelos. Apóyate en un barandal para seguridad.\nRespiración: Realiza respiraciones profundas e inhala y exhala soltando el peso corporal hacia abajo en cada ciclo.\nDuración/Reps: Mantén la posición estática colgada durante 25 a 30 segundos firmes.\nErrores comunes: Realizar rebotes balísticos en el escalón (lo cual puede dañar el tendón de Aquiles) o flexionar las rodillas."
      },
      {
        "name": "Gemelo en Barra Inferior con Descenso de Talón",
        "desc": "STALLBAR: Posición inicial: Colócate de frente a la espaldera. Sujeta una barra a la altura de tu pecho con ambas manos para dar estabilidad. Apoya el metatarso del pie derecho directamente sobre la primera barra inferior, dejando el talón en el aire.\nEjecución: Manteniendo la pierna derecha completamente estirada, deja caer el talón derecho de forma pasiva hacia el suelo por debajo del nivel de la barra. Da un paso corto al frente con la pierna izquierda cruzando las barras para aumentar la fuerza de la dorsiflexión.\nRespiración: Inhala profundo estabilizando el cuerpo y exhala de forma prolongada cediendo el talón hacia el piso.\nDuración/Reps: Sostén el estiramiento estático durante 20 a 30 segundos por pierna.\nErrores comunes: Doblar la rodilla de la pierna que estira o no realizar suficiente presión hacia abajo con el talón."
      }
    ]
  },
  "soleus": {
    "warmup": [
      {
        "name": "Balanceo de Rodilla hacia Adelante en Cuclillas",
        "desc": "Posición inicial: Colócate en posición de cuclillas profundas (squat completo abajo) con los pies apoyados planos en el suelo separados al ancho de los hombros.\nEjecución: Sin despegar los talones del suelo en ningún momento, desplaza de forma dinámica el peso de tu cuerpo hacia adelante y hacia la rodilla derecha, buscando que esa rodilla avance lo máximo posible por delante de la punta del pie. Regresa y alterna hacia la rodilla izquierda.\nRespiración: Exhala al balancear el peso hacia adelante forzando la movilidad del tobillo e inhala al regresar a la posición neutra.\nDuración/Reps: Realiza el balanceo alterno continuo durante 40 segundos totales.\nErrores comunes: Despegar el talón del suelo al avanzar la rodilla, lo cual elimina por completo el trabajo dinámico sobre el sóleo."
      },
      {
        "name": "Elevación de Talones Sentado al Aire",
        "desc": "Posición inicial: Siéntate en un banco o silla de manera erguida, asegurando que tus rodillas y caderas formen un ángulo exacto de 90 grados y los pies estén planos en el suelo.\nEjecución: Eleva los talones de forma simultánea lo más alto posible despegándolos del suelo, quedando apoyado en las puntas de los pies para contraer el sóleo (que se activa de forma aislada con rodilla flexionada). Sostén un instante arriba y desciende dinámicamente.\nRespiración: Exhala al elevar los talones contrayendo las pantorrillas inferiores e inhala al apoyar los talones de regreso.\nDuración/Reps: Completa de 15 a 20 repeticiones de manera rítmica y fluida.\nErrores comunes: Realizar el movimiento con timidez sin buscar el rango completo de elevación de la articulación del tobillo."
      },
      {
        "name": "Desplantes Cortos con Flexión Profunda de Tobillo",
        "desc": "Posición inicial: Ponte de pie de manera erguida. Da un paso corto hacia adelante con la pierna derecha (una distancia menor a la de un desplante regular de fuerza).\nEjecución: Flexiona ambas rodillas bajando el cuerpo verticalmente, pero concentrándote en empujar la rodilla delantera activamente hacia el frente manteniendo el talón derecho firmemente pegado al suelo. Regresa dinámicamente extendiendo las piernas y repite.\nRespiración: Inhala al descender y empujar la rodilla al frente, y exhala al regresar a la postura inicial erguida.\nDuración/Reps: Realiza 12 repeticiones en la pierna derecha y luego cambia para hacer 12 en la izquierda.\nErrores comunes: Levantar el talón delantero o dar un paso demasiado largo convirtiéndolo en un estiramiento de flexor de cadera."
      },
      {
        "name": "Sentadilla Profunda Isométrica con Cambios de Peso",
        "desc": "Posición inicial: Desciende a una sentadilla profunda completa manteniendo los pies planos en el suelo y el torso lo más vertical posible, entrelazando las manos al frente.\nEjecución: Sostén la posición de sentadilla profunda e inicia pequeños cambios de peso laterales de forma dinámica, empujando de forma alterna el peso hacia el metatarso derecho e izquierdo de manera sutil pero continua para flexionar los tobillos bajo carga.\nRespiración: Mantén una respiración profunda, pausada y diafragmática durante toda la permanencia isométrica.\nDuración/Reps: Mantén las transiciones dinámicas abajo durante 30 segundos continuos.\nErrores comunes: Perder la postura de la espalda encorvándose por completo o permitir que los talones se levanten del suelo."
      }
    ],
    "stretch": [
      {
        "name": "Estiramiento de Sóleo contra Pared con Rodilla Flexionada",
        "desc": "Posición inicial: Colócate de pie frente a una pared a un paso de distancia, apoyando las palmas de tus manos en ella a la altura del pecho.\nEjecución: Da un paso corto hacia atrás con la pierna derecha. A diferencia del estiramiento de gemelo, flexiona ligeramente la rodilla derecha (posterior) manteniendo el talón firmemente pegado al suelo. Desplaza tu peso hacia abajo y atrás para enfocar la tensión en el sóleo bajo.\nRespiración: Respira de manera pausada; exhala profundamente enviando el peso del cuerpo hacia el talón trasero de forma estática.\nDuración/Reps: Sostén la posición de forma totalmente estática por 20 a 30 segundos por pierna.\nErrores comunes: Estirar la rodilla posterior (lo cual transfiere el estiramiento al gemelo) o levantar el talón del suelo."
      },
      {
        "name": "Estiramiento de Sóleo en Cuclillas con Apoyo",
        "desc": "Posición inicial: Colócate en posición de cuclillas de forma unilateral, arrodillando la pierna izquierda en el suelo y manteniendo el pie derecho apoyado plano al frente con la rodilla flexionada.\nEjecución: Inclina todo tu torso hacia adelante y apoya tus brazos o pecho directamente sobre tu muslo derecho. Utiliza el peso de tu propio torso para presionar la rodilla derecha hacia adelante sin levantar el talón del piso, elongando el sóleo de forma profunda.\nRespiración: Inhala profundo y exhala volcando de manera pasiva el peso del torso sobre el muslo para acentuar el rango del tobillo.\nDuración/Reps: Mantén la postura estática durante 25 segundos por pierna.\nErrores comunes: Permitir que el talón se levante o que la rodilla colapse hacia el interior desalineando la articulación del tobillo."
      },
      {
        "name": "Estiramiento de Tibial Posterior e Inversión de Tobillo",
        "desc": "Posición inicial: Siéntate en el suelo o en una silla. Cruza tu tobillo derecho sobre la rodilla izquierda de forma cómoda formando una base estable.\nEjecución: Sujeta el talón derecho con tu mano izquierda para estabilizarlo, y con la mano derecha toma el borde interno de tu pie derecho. Jala el pie suavemente hacia adentro y hacia arriba (inversión con dorsiflexión), estirando los tendones profundos del sóleo y el tibial posterior.\nRespiración: Exhala lentamente al jalar el pie hacia la inversión estática; inhala manteniendo el control manual.\nDuración/Reps: Sostén el estiramiento durante 20 segundos por cada pie de forma individual.\nErrores comunes: Realizar tirones bruscos de los dedos del pie en lugar de guiar toda la estructura del metatarso de forma uniforme."
      },
      {
        "name": "Sóleo Profundo Asistido en Barra Inferior",
        "desc": "STALLBAR: Posición inicial: Colócate de frente a la espaldera. Sujeta una barra a nivel del pecho con ambas manos para asegurar el equilibrio. Coloca la bola (metatarso) del pie derecho sobre la primera barra inferior dejando el talón suspendido en el aire.\nEjecución: Flexiona la rodilla derecha a un ángulo aproximado de 30 a 45 grados. Manteniendo esa flexión fija de la rodilla, deja caer el talón derecho hacia el suelo por debajo de la barra e inclina la cadera hacia adelante, estirando el sóleo profundamente de forma estática.\nRespiración: Inhala profundo manteniendo la rodilla doblada y exhala prolongadamente cediendo el peso del talón hacia abajo.\nDuración/Reps: Sostén la posición de forma totalmente estática por 20 a 30 segundos por pierna.\nErrores comunes: Extender la rodilla durante el estiramiento o soltar la flexión del tobillo debido al cansancio."
      }
    ]
  },
  "abs": {
    "warmup": [
      {
        "name": "Plancha Alta con Toques de Hombro",
        "desc": "Posición inicial: Colócate en posición de plancha alta en el suelo, con las manos apoyadas directamente debajo de tus hombros, las piernas estiradas y los pies separados al ancho de los hombros para estabilidad.\nEjecución: Contrayendo firmemente el abdomen y los glúteos, eleva la mano derecha y toca el hombro izquierdo de forma fluida. Regresa la mano al suelo y repite de inmediato elevando la mano izquierda para tocar el hombro derecho de forma dinámica sin tambalear la cadera.\nRespiración: Mantén una respiración corta y constante, exhalando en cada toque de hombro para aumentar la estabilidad del core.\nDuración/Reps: Realiza el movimiento dinámico y alterno durante 30 a 45 segundos continuos.\nErrores comunes: Rotar excesivamente las caderas de lado a lado en lugar de mantener la pelvis perfectamente paralela al suelo."
      },
      {
        "name": "Giros Rusos Dinámicos al Aire",
        "desc": "Posición inicial: Siéntate en el suelo con las rodillas flexionadas y los pies apoyados. Inclina tu torso hacia atrás unos 45 grados manteniendo la espalda completamente recta y junta tus manos frente a tu pecho.\nEjecución: Rota de forma dinámica tu torso de lado a lado, buscando que tus manos toquen el suelo a cada costado de tus caderas de forma alterna. Mantén el abdomen bajo contraído de forma activa durante todo el ejercicio.\nRespiración: Exhala en cada rotación lateral al tocar el suelo e inhala en el punto de cambio intermedio del centro.\nDuración/Reps: Realiza el ejercicio de forma rítmica durante 30 segundos seguidos.\nErrores comunes: Encorvar la espalda alta en forma de C o mover únicamente los brazos en lugar de rotar verdaderamente el torso."
      },
      {
        "name": "Escarabajo Muerto (Dead Bug) Básico",
        "desc": "Posición inicial: Acuéstate boca arriba sobre un tapete. Eleva las piernas flexionando rodillas y caderas a 90 grados (posición de mesa) y extiende ambos brazos verticalmente hacia el techo.\nEjecución: Manteniendo la espalda lumbar presionada firmemente contra el suelo, extiende de forma simultánea el brazo derecho hacia atrás por encima de tu cabeza y la pierna izquierda hacia el frente rozando el suelo de forma dinámica. Regresa al centro y alterna de lado.\nRespiración: Exhala al extender el brazo y la pierna opuesta contrayendo el core e inhala al regresar a la posición inicial de mesa.\nDuración/Reps: Completa de 12 a 14 repeticiones totales de manera controlada.\nErrores comunes: Arquear la espalda baja despegándola del suelo durante la extensión de las extremidades perdiendo el control abdominal."
      },
      {
        "name": "Contracciones Pélvicas de Pie Activas",
        "desc": "Posición inicial: Ponte de pie de manera erguida, con las rodillas mínimamente flexionadas y las manos apoyadas sobre tus caderas, manteniendo una postura neutral.\nEjecución: Realiza una retroversión pélvica de forma voluntaria y dinámica, metiendo la cadera hacia adelante y apretando fuertemente el recto abdominal y los glúteos como si quisieras pegar el ombligo a la columna. Sostén un segundo la contracción y regresa a la postura neutral.\nRespiración: Exhala profundamente al realizar la contracción abdominal metiendo la cadera e inhala al relajar al inicio.\nDuración/Reps: Completa de 12 a 15 repeticiones controladas de forma consecutiva.\nErrores comunes: Arquear excesivamente la zona lumbar de forma lesiva en la fase de relajación o flexionar el torso al frente."
      }
    ],
    "stretch": [
      {
        "name": "Postura de la Cobra Estática en Suelo",
        "desc": "Posición inicial: Acuéstate boca abajo sobre un tapete con las piernas completamente extendidas detrás de ti y los empeines apoyados. Coloca las palmas de tus manos en el suelo justo al lado de tu pecho.\nEjecución: Empuja el suelo con tus manos y extiende los brazos lentamente para elevar el torso del piso. Mantén la pelvis firmemente pegada al suelo y relaja los hombros hacia abajo y atrás, estirando toda la pared del recto abdominal.\nRespiración: Realiza inhalaciones profundas para inflar el abdomen estirando las fibras musculares y exhala manteniendo la extensión del torso.\nDuración/Reps: Sostén la posición estática durante 20 a 30 segundos continuos.\nErrores comunes: Despegar las caderas del suelo por completo (lo cual transfiere la tensión) o encoger los hombros tapando el cuello."
      },
      {
        "name": "Estiramiento Corporal Completo en Supino",
        "desc": "Posición inicial: Acuéstate boca arriba sobre un tapete con las piernas completamente estiradas y los brazos relajados inicialmente.\nEjecución: Extiende tus brazos hacia atrás por encima de tu cabeza apoyándolos en el suelo. Apunta los dedos de tus pies hacia el frente y estira tus manos lo más lejos posible en dirección opuesta, simulando que te jalan de ambos extremos para elongar el abdomen de forma pasiva.\nRespiración: Inhala profundamente expandiendo al máximo el abdomen de aire y exhala relajando toda la sección media de forma estática.\nDuración/Reps: Mantén el estiramiento longitudinal durante 30 segundos completos.\nErrores comunes: Flexionar las rodillas o los codos interrumpiendo la línea de tracción opuesta del cuerpo."
      },
      {
        "name": "Inclinación Posterior de Pie con Manos Extendidas",
        "desc": "Posición inicial: Ponte de pie de manera erguida con las piernas separadas al ancho de las caderas. Coloca las palmas de tus manos apoyadas firmemente sobre tu zona lumbar (espalda baja) para dar soporte estructural.\nEjecución: Con las piernas bloqueadas y empujando sutilmente la cadera hacia adelante, extiende tu columna hacia atrás arqueando el torso de forma controlada y elevando la mirada hacia el techo, estirando de forma activa el recto abdominal anterior.\nRespiración: Inhala profundo antes de iniciar el arco y exhala manteniendo la posición arqueada fija sin aguantar la respiración.\nDuración/Reps: Sostén la postura estática durante 20 segundos de forma controlada.\nErrores comunes: Dejar caer la cabeza bruscamente hacia atrás provocando mareos o realizar el arco sin dar soporte manual a la espalda baja."
      },
      {
        "name": "Cobra Abdominal Asistida en Barra Baja",
        "desc": "STALLBAR: Posición inicial: Acuéstate boca abajo sobre un tapete frente a la espaldera, de modo que tus manos queden muy cerca de la estructura basal.\nEjecución: Sujeta firmemente con ambas manos la primera o segunda barra inferior de la espaldera. Empuja la barra con tus manos extendiendo los brazos por completo para elevar el torso del suelo de manera vertical, manteniendo los muslos y la pelvis planos contra el piso para estirar el abdomen de forma intensa.\nRespiración: Inhala profundamente forzando la expansión abdominal contra el tapete y exhala manteniendo la extensión fija de los brazos.\nDuración/Reps: Sostén la posición estática durante 20 a 25 segundos antes de descender con control.\nErrores comunes: Despegar la pelvis del suelo anulando la elongación del recto abdominal o flexionar los codos por fatiga."
      }
    ]
  },
  "forearms": {
    "warmup": [
      {
        "name": "Círculos de Muñecas con Puños Cerrados",
        "desc": "Posición inicial: Ponte de pie o siéntate de forma erguida. Extiende ambos brazos completamente hacia el frente a la altura de tus hombros y cierra tus manos formando un puño suave.\nEjecución: Realiza rotaciones circulares continuas con tus muñecas de forma fluida. Dibuja círculos lo más amplios posibles en el aire hacia el sentido de las agujas del reloj durante la mitad del tiempo, e inmediatamente invierte el sentido hacia adentro.\nRespiración: Mantén una respiración libre, constante y relajada a lo largo de todas las rotaciones de muñeca.\nDuración/Reps: Ejecuta el movimiento continuo durante 30 segundos totales (15 segundos por dirección).\nErrores comunes: Mover los antebrazos o los codos de forma exagerada en lugar de aislar el movimiento puramente en las muñecas."
      },
      {
        "name": "Pulsaciones Rápidas de Apertura de Manos (Air Flashes)",
        "desc": "Posición inicial: Ponte de pie y extiende ambos brazos totalmente hacia el frente de manera horizontal, manteniendo las manos abiertas con los dedos juntos inicialmente.\nEjecución: Cierra las manos formando un puño apretado e inmediatamente abre las manos extendiendo y separando los dedos al máximo de forma explosiva. Repite esta secuencia de abrir y cerrar a la máxima velocidad posible de forma continua generando un bombeo rápido.\nRespiración: Respira de manera natural y rítmica sin contener el aire a pesar de la velocidad del ejercicio.\nDuración/Reps: Mantén las pulsaciones rápidas e ininterrumpidas durante 25 a 30 segundos continuos.\nErrores comunes: Disminuir la velocidad antes de tiempo debido al agotamiento o no extender por completo los dedos al abrir."
      },
      {
        "name": "Flexo-Extensiones de Muñeca Activas",
        "desc": "Posición inicial: De pie, estira los brazos al frente paralelos al suelo con las manos abiertas y las palmas orientadas inicialmente hacia el suelo.\nEjecución: Apunta los dedos de tus manos de forma enérgica hacia el techo flexionando la muñeca hacia arriba al máximo; acto seguido, apunta los dedos de forma forzada hacia el suelo flexionando la muñeca hacia abajo. Alterna ambos movimientos de forma rítmica.\nRespiración: Exhala al flexionar las muñecas hacia los extremos máximos e inhala en la transición intermedia.\nDuración/Reps: Completa de 15 a 20 repeticiones completas de flexión y extensión consecutivas.\nErrores comunes: Doblar los codos o bajar los brazos perdiendo la línea recta de los hombros."
      },
      {
        "name": "Giros Prono-Supinadores de Antebrazo",
        "desc": "Posición inicial: Ponte de pie de manera erguida. Flexiona tus codos a 90 grados pegándolos a tus costados, manteniendo los puños cerrados apuntando hacia el frente con los pulgares hacia arriba.\nEjecución: Rota de forma rápida tus antebrazos hacia adentro de modo que las palmas miren al suelo (pronación) e inmediatamente rota los antebrazos hacia afuera de modo que las palmas miren al techo (supinación). Repite de forma consecutiva e intensa.\nRespiración: Mantén un ciclo respiratorio relajado e intermitente que acompañe el ritmo de los giros dinámicos.\nDuración/Reps: Realiza el movimiento continuo durante 30 segundos sin detenerte.\nErrores comunes: Separar los codos de las costillas involucrando la rotación del hombro en lugar de aislar el antebrazo."
      }
    ],
    "stretch": [
      {
        "name": "Estiramiento de Flexores de Muñeca de Rodillas",
        "desc": "Posición inicial: Colócate de rodillas sobre un tapete en el suelo. Apoya las palmas de tus manos planas en el piso frente a ti, pero rotando las muñecas de modo que tus dedos apunten directamente hacia tus rodillas.\nEjecución: Manteniendo los codos completamente bloqueados en extensión y las palmas totalmente pegadas al suelo, desplaza sutil e isoméricamente el peso de tu cadera hacia atrás hasta sentir el estiramiento profundo en la cara anterior del antebrazo.\nRespiración: Inhala profundo estabilizando la postura y exhala liberando la tensión mientras mantienes el peso atrás de forma fija.\nDuración/Reps: Sostén la posición de forma totalmente estática por 20 a 30 segundos continuos.\nErrores comunes: Despegar los talones de las manos (palmas bajas) del suelo o flexionar los codos al sentir la tensión."
      },
      {
        "name": "Estiramiento de Extensores de Muñeca",
        "desc": "Posición inicial: Ponte de pie de manera erguida. Extiende tu brazo derecho hacia el frente de forma horizontal a la altura de tu hombro, con la palma de la mano mirando hacia el suelo.\nEjecución: Flexiona la muñeca derecha hacia abajo de modo que tus dedos apunten al suelo. Utiliza tu mano izquierda para sujetar el dorso de la mano derecha y jálala suavemente hacia tu cuerpo, manteniendo el codo derecho completamente estirado.\nRespiración: Exhala lentamente durante la tracción inicial y mantén una respiración pausada durante la permanencia estática.\nDuración/Reps: Sostén el estiramiento durante 20 segundos por cada antebrazo de forma individual.\nErrores comunes: Permitir que el hombro se eleve hacia la oreja o rotar el brazo lateralmente perdiendo la línea del extensor."
      },
      {
        "name": "Estiramiento de Separación de Dedos e Interóseos",
        "desc": "Posición inicial: Siéntate o ponte de pie. Extiende la mano derecha al frente con los dedos completamente abiertos y separados en forma de abanico.\nEjecución: Utiliza la mano izquierda para tomar de forma individual cada dedo de la mano derecha (empezando por el pulgar) y jálalo suavemente hacia atrás y hacia afuera, estirando la musculatura flexora de la mano y los músculos interóseos del antebrazo.\nRespiración: Respira de forma natural y lenta, exhalando en cada tracción individual de los dedos.\nDuración/Reps: Dedica de 3 a 5 segundos de estiramiento estático a cada dedo por mano.\nErrores comunes: Aplicar una fuerza excesiva o brusca que pueda comprometer las articulaciones interfalángicas."
      },
      {
        "name": "Flexores de Antebrazo en Barra Media",
        "desc": "STALLBAR: Posición inicial: Colócate de frente a la espaldera a una distancia de medio paso. Extiende ambos brazos al frente de manera horizontal.\nEjecución: Apoya completamente las palmas de tus manos planas contra una de las barras situadas a la altura de tu cintura o pecho, pero girando las muñecas de forma que tus dedos apunten verticalmente hacia el suelo. Empuja sutilmente tu torso hacia adelante manteniendo los codos bloqueados.\nRespiración: Inhala profundo alargando la postura y exhala descargando el peso hacia adelante de forma controlada y estática.\nDuración/Reps: Sostén la posición estática durante 20 a 25 segundos completos.\nErrores comunes: Apoyar solo los dedos despegando la palma de la barra o flexionar los brazos perdiendo efectividad."
      }
    ]
  },
  "neck": {
    "warmup": [
      {
        "name": "Semicírculos Cervicales Inferiores",
        "desc": "Posición inicial: Ponte de pie con la espalda erguida, los hombros relajados hacia abajo y las manos apoyadas de forma libre en tus muslos.\nEjecución: Baja la barbilla suavemente hacia tu esternón. Desde allí, inicia un movimiento pendular lento dibujando un semicírculo con la barbilla hacia el hombro derecho, regresa por abajo recorriendo el pecho y llévala hacia el hombro izquierdo. Realiza el trayecto solo por abajo.\nRespiración: Inhala al llevar la barbilla hacia cada hombro lateral y exhala al transitar por la zona central del pecho.\nDuración/Reps: Ejecuta el movimiento oscilatorio continuo durante 30 segundos a un ritmo muy pausado.\nErrores comunes: Llevar la cabeza hacia atrás completando un círculo completo de 360 grados, lo cual puede comprimir las vértebras cervicales."
      },
      {
        "name": "Retracciones Cervicales Activas (Chin Tucks)",
        "desc": "Posición inicial: Ponte de pie o siéntate con una postura totalmente erguida, manteniendo la mirada al frente y los hombros fijos e inmóviles.\nEjecución: Desplaza tu cabeza horizontalmente hacia atrás de forma enérgica, metiendo la barbilla de manera exagerada como queriendo sacar 'doble papada', alineando las orejas con tus hombros de forma activa. Sostén un segundo la contracción posterior y regresa al frente de forma dinámica.\nRespiración: Exhala al realizar la retracción de la cabeza hacia atrás e inhala al regresar a la posición neutral frontal.\nDuración/Reps: Realiza entre 12 y 15 repeticiones de forma controlada.\nErrores comunes: Inclinar la cabeza hacia abajo o hacia arriba durante el trayecto en lugar de mantener un plano estrictamente horizontal."
      },
      {
        "name": "Giros Laterales del Cuello",
        "desc": "Posición inicial: De pie con el torso recto y los hombros deprimidos, manteniendo los brazos colgando relajados a los lados del cuerpo.\nEjecución: Rota la cabeza de forma dinámica y suave hacia el lado derecho buscando alinear la barbilla paralela con tu hombro derecho. Regresa al centro e inmediatamente gira la cabeza hacia el lado izquierdo de forma continua sin realizar pausas bruscas.\nRespiración: Exhala en cada giro máximo lateral llegando al límite del rango de movimiento dinámico e inhala al transitar por el centro.\nDuración/Reps: Completa de 10 a 12 giros por cada lado del cuerpo de manera rítmica.\nErrores comunes: Mover o rotar los hombros siguiendo la dirección de la cabeza en lugar de aislar únicamente las vértebras cervicales."
      },
      {
        "name": "Flexiones Laterales Cervicales Continuas",
        "desc": "Posición inicial: Ponte de pie de manera erguida con los pies separados al ancho de las caderas y la mirada fija al frente en un punto neutro.\nEjecución: Inclina la cabeza lateralmente hacia el hombro derecho de forma fluida, buscando acercar la oreja al hombro sin elevar este último. Regresa al centro y realiza la inclinación de inmediato hacia el hombro izquierdo de manera controlada.\nRespiración: Exhala al inclinar la cabeza hacia el costado elongando el lado opuesto e inhala al regresar a la vertical central.\nDuración/Reps: Realiza el movimiento alterno durante 30 segundos continuos manteniendo un ritmo suave.\nErrores comunes: Elevar los hombros hacia las orejas de forma inconsciente por tensión muscular latente."
      }
    ],
    "stretch": [
      {
        "name": "Estiramiento Lateral de Cuello Asistido",
        "desc": "Posición inicial: Siéntate o ponte de pie de manera erguida. Lleva tu brazo derecho por detrás de tu espalda baja para anclar el hombro derecho hacia abajo de forma pasiva.\nEjecución: Coloca tu mano izquierda sobre la parte superior de tu cabeza cruzando por encima. Inclina suavemente tu cabeza hacia el lado izquierdo, aplicando una presión estática muy sutil con la mano hasta sentir la elongación en los escalenos y trapecio del lado derecho.\nRespiración: Respira de manera abdominal lenta; exhala de forma prolongada disipando la tensión en el lateral del cuello.\nDuración/Reps: Sostén la posición de forma totalmente estática por 20 segundos por lado.\nErrores comunes: Jalar la cabeza con fuerza excesiva provocando un reflejo de contracción o despegar el hombro anclado de su posición baja."
      },
      {
        "name": "Estiramiento de la Musculatura Cervical Posterior",
        "desc": "Posición inicial: Ponte de pie o siéntate de forma erguida con la espalda recta y los hombros relajados hacia atrás.\nEjecución: Desciende la cabeza llevando la barbilla firmemente hacia tu esternón. Entrelaza los dedos de ambas manos y colócalas en la parte posterior de tu cabeza (nuca). Deja caer únicamente el peso pasivo de tus brazos hacia abajo, sin empujar, para estirar los extensores del cuello.\nRespiración: Inhala profundo inflando el pecho y exhala liberando el peso de los codos hacia el suelo de forma estática.\nDuración/Reps: Mantén el estiramiento estático durante 20 a 25 segundos completos.\nErrores comunes: Encorvar la espalda alta o la columna dorsal doblando el torso en lugar de aislar únicamente la flexión cervical."
      },
      {
        "name": "Estiramiento Angular Ojo-Axila Estático",
        "desc": "Posición inicial: Siéntate con la espalda recta. Gira tu cabeza exactamente 45 grados hacia el lado derecho, alineando la mirada en dirección diagonal.\nEjecución: Desciende la mirada fijándola de forma estática en tu axila derecha. Coloca tu mano derecha sobre la nuca y aplica una tracción suave y diagonal hacia abajo, elongando de manera profunda el músculo angular del omóplato (elevador de la escápula) izquierdo.\nRespiración: Exhala lentamente durante la tracción diagonal progresiva; inhala manteniendo la fijación muscular sin rebotar.\nDuración/Reps: Sostén la postura estática durante 20 segundos por cada lado corporal.\nErrores comunes: Realizar una tracción vertical en lugar de diagonal o rotar el torso desalineando la postura erguida."
      },
      {
        "name": "Tracción Cervical Angular por Inclinación de Torso",
        "desc": "STALLBAR: Posición inicial: Colócate de lado junto a la espaldera a un paso corto de distancia. Sujeta con la mano interna una barra a nivel medio-alto manteniendo el brazo extendido.\nEjecución: Manteniendo el agarre firme que asegura y deprime de forma pasiva tu hombro interno, inclina tu torso sutilmente hacia el lado externo (alejándote de las barras). Al mismo tiempo, deja caer tu cabeza de forma lateral hacia el hombro externo, maximizando la tracción lineal de toda la cadena cervical lateral.\nRespiración: Inhala profundo reteniendo la postura estable y exhala soltando el aire mientras dejas caer de forma pasiva el peso del cuello.\nDuración/Reps: Sostén el estiramiento estático por 20 a 30 segundos por lado.\nErrores comunes: Flexionar el brazo de soporte anulando la depresión escapular o realizar movimientos bruscos al soltar la barra."
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

window.WARMUP_DATA = WARMUP_DATA
window.IMG_MAP = IMG_MAP
window.getUniqueWarmupMuscles = getUniqueWarmupMuscles
window.resolveMuscles = resolveMuscles
window.img = img
