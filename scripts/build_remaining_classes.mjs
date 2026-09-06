import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const unitsDir = path.join(projectRoot, 'units');
const dataSource = fs.readFileSync(path.join(projectRoot, 'assets', 'data.js'), 'utf8');
const sandbox = { window: {} };
vm.runInNewContext(dataSource, sandbox);
const { PROGRAMA, UNIDADES, TIERS } = sandbox.window.CAMPUS_DATA;

const classContent = {
  6: {
    meta: 'Duda, aislamiento, defensa y deseo en el historial del Hombre de las Ratas.',
    thesis: 'La duda obsesiva no es falta de pensamiento: es una solución que posterga el acto y conserva abierto el conflicto.',
    lead: [
      'Después del primer parcial retomamos el método de lectura de casos. El Hombre de las Ratas no se estudia como un inventario de rasgos obsesivos, sino como una organización en la que pensamiento, duda, culpa y defensa se sostienen entre sí.',
      'El relato del suplicio de las ratas condensa una amenaza, una deuda y una exigencia imposible. Freud sigue asociaciones, desplazamientos y contradicciones para mostrar que el pensamiento obsesivo no está separado de la vida afectiva: la sustituye, la aísla y al mismo tiempo la mantiene activa.',
      'Los textos históricos y la relectura lacaniana permiten comparar tres escalas: la descripción de la locura de la duda, el mecanismo freudiano y la función que el deseo del Otro adquiere en la posición obsesiva.'
    ],
    objectives: [
      '¿Cómo transforma Freud una duda aparentemente absurda en una formación con historia y función?',
      '¿Qué relación establece el caso entre ambivalencia, culpa, deuda y pensamiento compulsivo?',
      '¿Cómo operan el aislamiento y el desplazamiento en la construcción del síntoma obsesivo?',
      '¿Qué diferencia hay entre describir la “locura de la duda” y explicar su mecanismo?',
      '¿Por qué la postergación puede funcionar como una manera de sostener el deseo sin decidir?'
    ],
    order: [
      '<strong>Entrá por el caso.</strong> Seguí la secuencia del relato de las ratas, la deuda y las órdenes contradictorias.',
      '<strong>Volvé al mecanismo.</strong> Usá el texto de 1896 para precisar defensa, reproche y retorno de las representaciones.',
      '<strong>Compará con la descripción clásica.</strong> Registrá qué observa Legrand du Saulle antes de que Freud proponga una explicación dinámica.',
      '<strong>Cerrá con Lacan.</strong> Preguntá qué obtiene el obsesivo al aplazar el acto y mantener insatisfecho el deseo.'
    ],
    readings: [
      {
        id: 'freud-1909-ratas',
        title: 'Hombre de las Ratas · Secciones F y G',
        cite: 'Freud, S. (1909). <em>A propósito de un caso de neurosis obsesiva</em>. <em>Obras completas</em>, tomo X. Amorrortu.',
        pages: 'pp. 154–172',
        file: 'Freud_1909_Hombre_de_las_Ratas_Secciones_F_G_pp154-172.pdf',
        look: ['La secuencia entre el relato del capitán, el suplicio imaginado y la aparición de la deuda.', 'La coexistencia de amor y hostilidad, y el modo en que la ambivalencia alimenta la culpa.', 'Las órdenes, prohibiciones y razonamientos que intentan neutralizar una amenaza sin resolverla.'],
        questions: ['Reconstruí una cadena asociativa del caso sin resumirla como “miedo irracional”.', '¿Qué función cumple la duda cuando una decisión amenaza con cerrar el conflicto?']
      },
      {
        id: 'freud-1896-obsesion',
        title: 'La defensa en la neurosis obsesiva',
        cite: 'Freud, S. (1896). <em>Nuevas puntualizaciones sobre las neuropsicosis de defensa</em>. <em>Obras completas</em>, tomo III. Amorrortu.',
        pages: 'Apartado guiado',
        file: 'Freud_1896_Nuevas_puntualizaciones_sobre_las_neuropsicosis_de_defensa.pdf',
        look: ['La diferencia entre la representación reprimida y el afecto que se desplaza.', 'El papel del reproche y de las medidas protectoras en el curso de la neurosis obsesiva.', 'La secuencia temporal que Freud propone entre experiencia, defensa y retorno.'],
        questions: ['¿Qué retorna si la representación fue apartada de la conciencia?', '¿Por qué las defensas secundarias pueden convertirse en nuevos síntomas?']
      },
      {
        id: 'legrand-duda',
        title: 'La folie du doute (avec délire du toucher)',
        cite: 'Legrand du Saulle, H. (1875). V. Adrien Delahaye. Texto original en francés.',
        pages: 'Obra original completa · 80 páginas',
        file: 'Legrand_du_Saulle_1875_La_folie_du_doute_avec_delire_du_toucher.pdf',
        look: ['La descripción de la duda, las verificaciones y las restricciones progresivas.', 'Los criterios con los que la clínica clásica delimita una forma sin recurrir al mecanismo freudiano.', 'Las continuidades y diferencias entre descripción longitudinal y explicación dinámica.'],
        questions: ['¿Qué puede observar la descripción clásica con mucha precisión?', '¿Qué pregunta nueva introduce Freud frente a esa descripción?']
      },
      {
        id: 'lacan-s5-obsesivo',
        title: 'El obsesivo y su deseo',
        cite: 'Lacan, J. (1957-1958/1999). <em>El Seminario, libro 5</em>, capítulo XXIII. Paidós.',
        pages: 'Capítulo XXIII completo',
        file: 'Lacan_1957-1958_Seminario_5_Cap_XXIII_El_obsesivo_y_su_deseo.pdf',
        look: ['La relación entre deseo, demanda y postergación.', 'La posición del obsesivo frente al deseo del Otro.', 'El modo en que la hazaña y el pensamiento pueden reemplazar una decisión subjetiva.'],
        questions: ['¿Qué conserva el obsesivo cuando posterga?', '¿Cómo modifica esta lectura la idea de que el problema sería simplemente “pensar demasiado”?']
      }
    ],
    closeTitle: 'Del caso de 1909 a la reformulación de los años veinte',
    close: 'El historial permite reconocer la lógica del síntoma obsesivo en una trama singular. La próxima clase cambia el nivel del problema: Freud revisará el lugar de la angustia, el superyó y la culpa, y con ello modificará su explicación del síntoma.'
  },
  7: {
    meta: 'Angustia señal, superyó, culpa y necesidad de castigo.',
    thesis: 'Freud no abandona el conflicto obsesivo: lo reescribe cuando la angustia deja de ser sólo efecto de la represión y pasa a funcionar como señal.',
    lead: [
      'El Hombre de las Ratas mostró cómo una formación obsesiva enlaza deseo, hostilidad, culpa y prohibición. En los años veinte Freud reorganiza ese mapa: distingue con más precisión inhibición, síntoma y angustia, y da al yo y al superyó un lugar nuevo.',
      'La angustia ya no aparece solamente como libido transformada. Puede funcionar como una señal que anticipa un peligro y pone en marcha la defensa. A la vez, el superyó permite comprender por qué la exigencia moral puede volverse cruel y por qué el sufrimiento mismo puede adquirir valor de satisfacción.',
      'Los tres textos se leen como una secuencia de reformulación. No ofrecen tres definiciones independientes: cada uno modifica la pregunta por la defensa, la culpa y la persistencia del síntoma.'
    ],
    objectives: [
      '¿Qué diferencia establece Freud entre inhibición, síntoma y angustia?',
      '¿Cómo funciona la angustia señal en el desencadenamiento de la defensa?',
      '¿Qué agrega la segunda tópica a la comprensión del conflicto obsesivo?',
      '¿Por qué el superyó puede volverse más severo cuanto más renuncia el yo?',
      '¿Cómo se relacionan sentimiento de culpa, necesidad de castigo y masoquismo moral?'
    ],
    order: [
      '<strong>Empezá por la nueva teoría de la angustia.</strong> Distinguí señal, peligro y defensa.',
      '<strong>Ubicá el conflicto entre instancias.</strong> Leé “Los vasallajes del yo” como mapa de dependencias, no como lista anatómica.',
      '<strong>Cerrá con el problema económico.</strong> Preguntá por qué sufrir puede convertirse en una condición para apaciguar la culpa.'
    ],
    readings: [
      {
        id: 'freud-1926-isa-v-vi',
        title: 'Inhibición, síntoma y angustia · Capítulos V y VI',
        cite: 'Freud, S. (1926). <em>Obras completas</em>, tomo XX. Amorrortu.',
        pages: 'Capítulos completos',
        file: 'Freud_1926_Inhibicion_sintoma_y_angustia_Cap_V_VI.pdf',
        look: ['La diferencia entre peligro pulsional, angustia señal y puesta en marcha de la defensa.', 'La revisión de la explicación económica anterior de la angustia.', 'Los ejemplos con los que Freud articula formación de síntoma y evitación del peligro.'],
        questions: ['¿La represión produce angustia o la angustia pone en marcha la represión?', '¿Qué gana y qué pierde el yo mediante el síntoma?']
      },
      {
        id: 'freud-1923-vasallajes',
        title: 'El yo y el ello · Capítulo V: Los vasallajes del yo',
        cite: 'Freud, S. (1923). <em>Obras completas</em>, tomo XIX. Amorrortu.',
        pages: 'Capítulo completo',
        file: 'Freud_1923_El_yo_y_el_ello_Cap_V.pdf',
        look: ['Las dependencias del yo respecto del ello, el superyó y la realidad.', 'La severidad del superyó y su relación con la agresividad.', 'El lugar del sentimiento inconsciente de culpa en la reacción terapéutica negativa.'],
        questions: ['¿Por qué el yo no puede presentarse como dueño soberano del conflicto?', '¿Cómo puede haber culpa sin una representación consciente de haber hecho algo malo?']
      },
      {
        id: 'freud-1924-masoquismo',
        title: 'El problema económico del masoquismo',
        cite: 'Freud, S. (1924). <em>Obras completas</em>, tomo XIX. Amorrortu.',
        pages: 'Texto completo',
        file: 'Freud_1924_El_problema_economico_del_masoquismo.pdf',
        look: ['La dificultad que el masoquismo plantea al principio de placer.', 'La distinción entre masoquismo erógeno, femenino y moral.', 'La necesidad de castigo como forma en que la culpa puede encontrar satisfacción.'],
        questions: ['¿Por qué el masoquismo obliga a revisar una regulación orientada sólo a evitar displacer?', '¿Qué relación puede establecerse entre masoquismo moral y persistencia del síntoma?']
      }
    ],
    closeTitle: 'La angustia queda preparada para cambiar de caso',
    close: 'En la obsesión, la señal de peligro pone en marcha defensas que capturan el pensamiento y el acto. En Juanito veremos otra solución: la angustia se liga a un objeto exterior y organiza un campo de evitaciones. La fobia no será sólo miedo; será también un intento de localizarlo.'
  },
  8: {
    meta: 'Juanito y la fobia como intento de localizar la angustia.',
    thesis: 'La fobia no es una lista de objetos temidos: construye un objeto que vuelve evitable una angustia que antes no tenía localización.',
    lead: [
      'La clase anterior distinguimos angustia señal, peligro y defensa. Juanito permite ver esa secuencia dentro de un caso: el miedo a los caballos organiza recorridos, prohibiciones y preguntas que antes estaban dispersos.',
      'El historial tiene una condición particular. Freud no observa directamente al niño: trabaja con los registros y las intervenciones del padre. Por eso también leeremos cómo se produce el material del caso y qué lugar ocupa cada adulto en su construcción.',
      'La comparación entre 1895, 1909 y 1926 muestra una transformación conceptual. Freud pasa de clasificar obsesiones y fobias a explicar la función de la angustia; Lacan agrega la pregunta por el significante que permite ordenar lo que irrumpe.'
    ],
    objectives: [
      '¿Qué problema resuelve la elección de un objeto fóbico?',
      '¿Cómo se articula el miedo a los caballos con las preguntas de Juanito sobre nacimiento, diferencia sexual y castración?',
      '¿Qué consecuencias tiene que el caso llegue a Freud a través del padre?',
      '¿Cómo cambia la teoría de la fobia entre 1895 y 1926?',
      '¿En qué sentido la fobia puede funcionar como una solución y no sólo como un déficit?'
    ],
    order: [
      '<strong>Leé primero el caso.</strong> Seguí las transformaciones del miedo y evitá buscar una equivalencia fija entre caballo y persona.',
      '<strong>Releé con la teoría de 1926.</strong> Separá angustia, peligro y formación sustitutiva.',
      '<strong>Usá 1895 como contraste.</strong> Registrá cuánto cambia el problema entre una clasificación inicial y la explicación posterior.',
      '<strong>Cerrá con Lacan.</strong> Ubicá qué función ordenadora puede cumplir un significante cuando la angustia desborda las explicaciones disponibles.'
    ],
    readings: [
      {
        id: 'freud-1909-juanito',
        title: 'Juanito · Sección III: Epicrisis',
        cite: 'Freud, S. (1909). <em>Obras completas</em>, tomo X. Amorrortu.',
        pages: 'Sección completa · pp. 84–118',
        file: 'Freud_1909_Analisis_de_la_fobia_de_un_nino_de_cinco_anos_Juanito.pdf',
        page: 90,
        look: ['La transformación del miedo a lo largo del historial y sus diferentes determinaciones.', 'Las teorías sexuales infantiles y las preguntas de Juanito.', 'La mediación del padre: qué observa, qué pregunta y cómo interviene.'],
        questions: ['Elegí una transformación del miedo y reconstruí qué cambia en el caso.', '¿Qué límites y posibilidades introduce la mediación del padre?']
      },
      {
        id: 'freud-1926-isa-iv-vii-viii',
        title: 'Inhibición, síntoma y angustia · Capítulos IV, VII y VIII',
        cite: 'Freud, S. (1926). <em>Obras completas</em>, tomo XX. Amorrortu.',
        pages: 'Tres capítulos',
        file: 'Freud_1926_Inhibicion_sintoma_y_angustia_Cap_IV_VII_VIII.pdf',
        look: ['La relectura de Juanito desde la angustia de castración.', 'La distinción entre angustia automática y angustia señal.', 'La función del síntoma como evitación de una situación de peligro.'],
        questions: ['¿Qué modifica Freud respecto de su explicación de 1909?', '¿Por qué localizar el peligro reduce una indeterminación pero amplía las restricciones?']
      },
      {
        id: 'freud-1895-obsesiones-fobias',
        title: 'Obsesiones y fobias',
        cite: 'Freud, S. (1895). <em>Obras completas</em>, tomo III. Amorrortu.',
        pages: 'Texto completo',
        file: 'Freud_1895_Obsesiones_y_fobias.pdf',
        look: ['Los criterios iniciales con los que Freud separa obsesiones y fobias.', 'La relación propuesta entre afecto y representación.', 'Las diferencias entre esta clasificación y la teoría de la angustia de 1926.'],
        questions: ['¿Qué puede distinguir Freud en 1895 y qué todavía no explica?', '¿Qué ganamos al leer este texto después de 1926 y no como definición definitiva?']
      },
      {
        id: 'lacan-s4-significante-real',
        title: 'El significante en lo real',
        cite: 'Lacan, J. (1956-1957/1994). <em>El Seminario, libro 4</em>, capítulo XIV. Paidós.',
        pages: 'Capítulo XIV completo · pp. 233–248',
        file: 'Lacan_1956-1957_Seminario_4_La_relacion_de_objeto.pdf',
        page: 115,
        look: ['La fobia como respuesta a una dificultad de simbolización.', 'La función que adquiere el caballo dentro de una red de sustituciones.', 'La diferencia entre reducir el objeto a una persona y seguir su función significante.'],
        questions: ['¿Por qué el caballo no posee un único significado estable?', '¿Qué permite ordenar la fobia que antes aparecía como angustia sin localización?']
      }
    ],
    closeTitle: 'De las neurosis al problema de la psicosis',
    close: 'En obsesión y fobia seguimos soluciones construidas mediante represión, sustitución y retorno de lo reprimido. La Unidad 4 preguntará qué ocurre cuando Freud encuentra fenómenos que no puede organizar con el mismo mecanismo.'
  },
  9: {
    meta: 'Paranoia clásica, defensa y nacimiento del problema freudiano.',
    thesis: 'La psicosis no entra al curso como una etiqueta ya resuelta: se construye en la tensión entre descripción psiquiátrica, evolución y mecanismo.',
    lead: [
      'La unidad comienza retrocediendo. Antes de Schreber necesitamos reconstruir qué llamaban paranoia los clínicos y qué problema recibe Freud cuando intenta incluirla entre las neuropsicosis de defensa.',
      'Kraepelin organiza entidades por su curso y desenlace; Freud busca un mecanismo. Esa diferencia de pregunta modifica qué cuenta como dato, cómo se interpreta un síntoma y qué relación se establece entre delirio, defensa y realidad.',
      'Bercherie permite seguir la transformación sin convertirla en una oposición simple entre una psiquiatría que sólo describe y un psicoanálisis que explicaría todo. Cada modelo hace visibles aspectos distintos y deja problemas abiertos.'
    ],
    objectives: [
      '¿Cómo delimita la psiquiatría clásica la paranoia?',
      '¿Qué cambia cuando Freud pregunta por el mecanismo de formación de los síntomas?',
      '¿Cómo diferencia Freud la proyección paranoica de otras defensas?',
      '¿Por qué no puede equipararse automáticamente psicosis con pérdida global de realidad?',
      '¿Qué relaciones y límites conviene conservar entre descripción, curso y explicación dinámica?'
    ],
    order: [
      '<strong>Comenzá por Freud.</strong> Identificá el problema que intenta resolver con el concepto de defensa.',
      '<strong>Contrastá con Kraepelin.</strong> Preguntá qué función cumplen curso y pronóstico en la construcción de una entidad clínica.',
      '<strong>Cerrá con Bercherie.</strong> Usalo para ordenar los desplazamientos conceptuales y evitar una historia lineal de “progreso”.'
    ],
    readings: [
      {
        id: 'freud-1896-psicosis',
        title: 'Nuevas puntualizaciones sobre las neuropsicosis de defensa · Capítulo III',
        cite: 'Freud, S. (1896). <em>Obras completas</em>, tomo III. Amorrortu.',
        pages: 'Capítulo III',
        file: 'Freud_1896_Nuevas_puntualizaciones_sobre_las_neuropsicosis_de_defensa.pdf',
        look: ['La articulación entre defensa, proyección y formación de síntomas paranoicos.', 'Las semejanzas y diferencias que Freud establece con las neurosis.', 'El estatuto todavía provisional de la explicación.'],
        questions: ['¿Qué intenta rechazar o mantener fuera el yo?', '¿En qué sentido la proyección no es sólo un error perceptivo?']
      },
      {
        id: 'kraepelin-paranoia',
        title: 'Lección XV: Paranoia',
        cite: 'Kraepelin, E. <em>Introducción a la clínica psiquiátrica</em>.',
        pages: 'Lección XV completa · pp. 157–166',
        file: 'Kraepelin_1900_Leccion_XV_Paranoia.pdf',
        look: ['Los rasgos con que se delimita la paranoia frente a otros cuadros.', 'El valor diagnóstico del desarrollo, el curso y la conservación de capacidades.', 'La relación entre ideas delirantes, sistematización y personalidad.'],
        questions: ['¿Qué vuelve reconocible una entidad para Kraepelin?', '¿Qué aspectos del caso quedarían fuera si sólo se considerara el contenido del delirio?']
      },
      {
        id: 'bercherie-psicosis',
        title: 'La constitución del concepto freudiano de psicosis',
        cite: 'Bercherie, P. (1987). Siglo XXI.',
        pages: 'Texto completo · 16 páginas',
        file: 'Bercherie_1987_La_constitucion_del_concepto_freudiano_de_psicosis.pdf',
        look: ['Las dificultades históricas para formar una categoría unificada de psicosis.', 'Los préstamos y desplazamientos entre psiquiatría y psicoanálisis.', 'Los límites de leer retrospectivamente los primeros textos con categorías posteriores.'],
        questions: ['¿Qué problema clínico reúne retrospectivamente el término psicosis?', '¿Qué se pierde cuando se presenta la historia como sucesión de definiciones ya cerradas?']
      }
    ],
    closeTitle: 'El mecanismo necesita ahora un caso',
    close: 'La formulación de 1896 abre la pregunta, pero todavía no alcanza. Schreber ofrecerá a Freud un material excepcional para articular narcisismo, retiro libidinal, proyección y reconstrucción delirante.'
  },
  10: {
    meta: 'Schreber, retiro libidinal y delirio como trabajo de reconstrucción.',
    thesis: 'El delirio no se lee sólo como producto patológico: Freud lo piensa también como el trabajo con el que un mundo vuelve a volverse habitable.',
    lead: [
      'La clase anterior reconstruimos la entrada freudiana a la paranoia. Ahora el argumento se concentra en Schreber: un caso que Freud no trató personalmente y que construye a partir de unas memorias publicadas.',
      'Esta condición obliga a separar tres voces: lo que Schreber escribe, la selección que Freud realiza y la teoría con que intenta explicar la transformación del mundo. El caso no autoriza a confundir testimonio, interpretación y diagnóstico.',
      'Narcisismo y restitución libidinal permiten comprender por qué Freud ubica el proceso patológico antes del delirio manifiesto. El delirio aparece entonces como un intento de reconstrucción. La distinción entre fenómeno y estructura quedará para la clase siguiente, con el capítulo VI completo del Seminario 3.'
    ],
    objectives: [
      '¿Qué problemas metodológicos plantea construir un caso a partir de una autobiografía?',
      '¿Cómo articula Freud retiro libidinal, proyección y restitución?',
      '¿Por qué el delirio puede pensarse como intento de curación?',
      '¿Qué diferencia hay entre el proceso postulado, sus manifestaciones y la elaboración delirante?'
    ],
    order: [
      '<strong>Entrá por Schreber.</strong> Conservá la textura del testimonio antes de convertirlo en ejemplo teórico.',
      '<strong>Seguí la construcción de Freud.</strong> Separá proceso, manifestación y tentativa de restitución.',
      '<strong>Usá narcisismo como articulador.</strong> Precisá qué ocurre con la investidura del mundo y de los otros.',
      '<strong>Cerrá comparando las tres voces.</strong> Separá lo que Schreber testimonia, lo que Freud recorta y el mecanismo que propone para explicarlo.'
    ],
    readings: [
      {
        id: 'freud-1911-schreber',
        title: 'Puntualizaciones psicoanalíticas sobre un caso de paranoia (Schreber)',
        cite: 'Freud, S. (1911). <em>Obras completas</em>, tomo XII. Amorrortu.',
        pages: 'Sección III completa · pp. 55–73',
        file: 'Freud_1911_Puntualizaciones_psicoanaliticas_sobre_un_caso_de_paranoia_Schreber.pdf',
        page: 61,
        look: ['La distinción entre la historia del caso, los intentos de interpretación y el mecanismo paranoico.', 'La secuencia entre retiro libidinal, transformación del mundo y restitución.', 'La tesis del delirio como intento de curación y reconstrucción.'],
        questions: ['¿Dónde ubica Freud el proceso patológico propiamente dicho?', '¿Qué reconstruye el delirio y con qué materiales?']
      },
      {
        id: 'freud-1914-narcisismo',
        title: 'Introducción del narcisismo',
        cite: 'Freud, S. (1914). <em>Obras completas</em>, tomo XIV. Amorrortu.',
        pages: 'Apartados I y II · pp. 71–88',
        file: 'Freud_1914_Introduccion_del_narcisismo.pdf',
        page: 8,
        look: ['La diferencia y los pasajes entre libido yoica y libido de objeto.', 'La referencia a parafrenias y el retiro de la libido respecto de los objetos.', 'Los límites de imaginar la economía libidinal como una cantidad que simplemente cambia de lugar.'],
        questions: ['¿Qué problema clínico lleva a Freud a introducir el narcisismo?', '¿Cómo ayuda este concepto a releer la secuencia de Schreber?']
      },
      {
        id: 'schreber-memorias-i',
        title: 'Memorias de un enfermo nervioso',
        cite: 'Schreber, D. P. (1903/1979). Lohlé.',
        pages: 'Capítulo I completo · pp. 63–72',
        file: 'Schreber_1903_Memorias_de_un_enfermo_nervioso.pdf',
        page: 13,
        look: ['El vocabulario propio con el que Schreber describe nervios, rayos, voces y transformaciones.', 'Los cambios en la relación con Dios y con el mundo.', 'La distancia entre la experiencia escrita y las categorías con que luego será leída.'],
        questions: ['Elegí una expresión de Schreber y explicá qué se pierde si se la reemplaza enseguida por una categoría.', '¿Qué indicios permiten reconocer un trabajo de reorganización?']
      }
    ],
    closeTitle: 'La reconstrucción delirante modifica la idea de pérdida',
    close: 'Si el delirio puede recomponer relaciones y significaciones, la oposición simple entre neurosis “con realidad” y psicosis “sin realidad” ya no alcanza. Después del segundo parcial, la última clase retomará esa diferencia para formularla de manera más precisa.'
  },
  11: {
    meta: 'Fenómeno psicótico, realidad y formulación clínica.',
    thesis: 'La certeza y el modo de concernimiento permiten leer la forma del fenómeno psicótico antes de explicar su contenido; esa lectura debe articularse con mecanismo, curso y recursos de estabilización.',
    lead: [
      'Esta clase se dicta después del segundo parcial y no agrega contenidos evaluables. Su función es volver sobre todo el recorrido con una pregunta más precisa: qué separa y qué reúne a neurosis y psicosis.',
      'El capítulo VI completo del Seminario 3 permite trabajar sin recortes mínimos la certeza, el concernimiento, la Verwerfung y el retorno en lo real. El fenómeno elemental se distingue así de la explicación delirante que puede organizarse después.',
      'Los dos textos de Freud de 1924 vuelven a situar conflicto y realidad; la selección de De Battista aporta un contraste clínico e histórico. El cierre articula fenómeno, mecanismo, curso, contexto y recursos sin convertirlos en una etiqueta.'
    ],
    objectives: [
      '¿Qué vuelve no dialectizable un fenómeno y cómo se reconoce la certeza de alusión?',
      '¿Qué significa que algo concierna al sujeto aun cuando no pueda atribuirle una intención?',
      '¿Cómo articula Lacan Verwerfung y retorno en lo real?',
      '¿Qué agrega la comparación con los dos textos freudianos de 1924?',
      '¿Cómo orientar una entrevista sin discutir la certeza ni precipitar una atribución diagnóstica?'
    ],
    order: [
      '<strong>Empezá por el capítulo VI completo de Lacan.</strong> Seguí el argumento que enlaza forma, certeza y mecanismo sin aislar dos páginas de cada apartado.',
      '<strong>Leé juntos los textos de Freud de 1924.</strong> El segundo corrige cualquier oposición demasiado rígida producida por el primero.',
      '<strong>Usá De Battista como apoyo clínico.</strong> Contrastá la lógica estructural con historia, variedades y curso.',
      '<strong>Volvé al comienzo del curso.</strong> Revisá qué cambió en tu modo de describir, explicar y formular una hipótesis.'
    ],
    readings: [
      {
        id: 'lacan-s3-fenomeno',
        title: 'El fenómeno psicótico y su mecanismo',
        cite: 'Lacan, J. (1955-1956/1984). <em>El Seminario, libro 3: Las psicosis</em>. Capítulo VI. Paidós.',
        pages: 'Capítulo completo · pp. 107–128',
        file: 'Lacan_1955-1956_Seminario_3_Cap_VI_El_fenomeno_psicotico_y_su_mecanismo.pdf',
        look: ['El carácter no dialectizable del fenómeno y la certeza de que algo concierne al sujeto.', 'La Verwerfung y el retorno en lo real como articulación del mecanismo.', 'La diferencia entre el fenómeno elemental y la elaboración delirante que procura reconstruir un orden.'],
        questions: ['¿Qué distingue una certeza de alusión de una interpretación que todavía puede ponerse en duda?', '¿Qué conviene indagar en una entrevista antes de completar el sentido de un fenómeno enigmático?']
      },
      {
        id: 'freud-1924-neurosis-psicosis',
        title: 'Neurosis y psicosis',
        cite: 'Freud, S. (1924). <em>Obras completas</em>, tomo XIX. Amorrortu.',
        pages: 'Texto completo',
        file: 'Freud_1924_Neurosis_y_psicosis.pdf',
        look: ['La fórmula inicial que diferencia conflicto neurótico y conflicto psicótico.', 'El papel del yo frente a las exigencias del ello, el superyó y la realidad.', 'El carácter esquemático y programático de la distinción.'],
        questions: ['¿Entre qué términos sitúa Freud el conflicto en cada caso?', '¿Qué preguntas deja abiertas esta primera formulación?']
      },
      {
        id: 'freud-1924-perdida-realidad',
        title: 'La pérdida de realidad en la neurosis y la psicosis',
        cite: 'Freud, S. (1924). <em>Obras completas</em>, tomo XIX. Amorrortu.',
        pages: 'Texto completo',
        file: 'Freud_1924_La_perdida_de_realidad_en_la_neurosis_y_la_psicosis.pdf',
        look: ['La corrección de la idea de que sólo la psicosis pierde realidad.', 'Los dos tiempos que Freud distingue en neurosis y psicosis.', 'Los diferentes trabajos de sustitución, desmentida y reconstrucción.'],
        questions: ['¿En qué sentido también la neurosis evita un fragmento de realidad?', '¿Qué diferencia aparece en el segundo tiempo de cada proceso?']
      },
      {
        id: 'debattista-paranoias',
        title: 'Paranoias: vigencia clínica, variedades y críticas',
        cite: 'De Battista, J. (coord.) (2019). <em>Aportes interdisciplinarios en psicopatología</em>, tomo I. Parte IV, introducción y capítulo 15. EDULP.',
        pages: 'Selección de apoyo',
        file: 'De_Battista_2019_Paranoia_esquizofrenia_y_cuadros_del_humor_EDULP.pdf',
        tier: 'A',
        look: ['La construcción histórica de la paranoia y su dilución en las clasificaciones actuales.', 'El valor del curso, la sistematización delirante y la conservación de capacidades.', 'La distancia entre una categoría descriptiva y una formulación clínica integral.'],
        questions: ['¿Qué dimensiones hacen falta además del síntoma aislado para formular un caso?', '¿Cómo evitar que una hipótesis diagnóstica se convierta en una etiqueta identitaria?']
      }
    ],
    closeTitle: 'El recorrido termina con una forma de preguntar',
    close: 'El curso no cierra con una tabla definitiva de cuadros, sino con un método: describir antes de concluir, distinguir niveles, reconstruir relaciones, comparar mecanismos y sostener hipótesis revisables. Esa forma de preguntar es lo que une todas las unidades.'
  }
};

const unitContent = {
  3: {
    dates: 'Del 28 de septiembre al 19 de octubre',
    question: '¿Cómo puede una formación limitar la angustia y, al mismo tiempo, restringir la vida?',
    intro: [
      'La Unidad 2 mostró cómo se forma un síntoma y cómo ese mecanismo se vuelve legible en Dora. Ahora aplicamos el método a dos organizaciones neuróticas diferentes: obsesión y fobia.',
      'El recorrido no busca asociar cada diagnóstico con una lista de conductas. Sigue operaciones: aislamiento, desplazamiento, postergación, angustia señal, elección de un objeto fóbico y construcción de evitaciones.',
      'Entre el Hombre de las Ratas y Juanito, Freud reformula su teoría. Por eso la clase intermedia no es un apéndice: explica qué cambia cuando el yo, el superyó y la angustia adquieren un lugar nuevo.'
    ],
    moves: [
      ['¿Qué hace la duda?', 'El Hombre de las Ratas permite seguir cómo pensamiento, culpa y ambivalencia aplazan una decisión y conservan abierto el conflicto.'],
      ['¿Qué cambia en los años veinte?', 'Angustia señal, superyó y necesidad de castigo reorganizan la explicación de la defensa y de la persistencia del síntoma.'],
      ['¿Qué resuelve una fobia?', 'Juanito muestra cómo un objeto exterior puede localizar una angustia y transformar un peligro indeterminado en recorridos evitables.']
    ],
    total: 'Once textos en tres clases. Cada encuentro tiene una lectura que organiza el problema y fuentes que permiten contrastar caso, mecanismo e historia.'
  },
  4: {
    dates: 'Del 26 de octubre al 16 de noviembre',
    question: '¿Qué ocurre cuando el delirio deja de pensarse sólo como pérdida y empieza a leerse también como reconstrucción?',
    intro: [
      'La última unidad cambia el mecanismo y conserva el método. Partimos de la paranoia de la psiquiatría clásica, seguimos la primera explicación freudiana de las neuropsicosis de defensa y llegamos al caso Schreber.',
      'El punto decisivo es separar el proceso patológico de los esfuerzos posteriores por recomponer un mundo. Así, el delirio puede estudiarse por su forma, su certeza y su función, no sólo por la rareza de su contenido.',
      'La clase final, posterior al segundo parcial, incorpora el capítulo VI completo del Seminario 3 y vuelve sobre los textos freudianos de 1924. El objetivo es articular fenómeno, mecanismo y formulación clínica sin fragmentar el argumento lacaniano.'
    ],
    moves: [
      ['¿Cómo se construye la categoría?', 'Kraepelin, Freud y Bercherie permiten distinguir descripción, curso histórico y mecanismo sin hacerlos equivalentes.'],
      ['¿Qué trabajo realiza el delirio?', 'Schreber y Freud articulan retiro libidinal, proyección y restitución; Mazzuca introduce la diferencia entre fenómeno y estructura.'],
      ['¿Cómo formular sin etiquetar?', 'Lacan, los textos de Freud de 1924 y De Battista reúnen certeza, mecanismo, evolución, recursos y contexto en una hipótesis revisable.']
    ],
    total: 'Once textos en tres clases. La Clase 11 integra el recorrido después del segundo parcial y no incorpora contenidos evaluables.'
  }
};

const monthNames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const escAttr = (value) => String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const classByNumber = (number) => PROGRAMA.find((item) => item.tipo === 'clase' && item.numero === number);
const unitByNumber = (number) => UNIDADES.find((item) => item.numero === number);
const fileExists = (classNumber, file) => file && fs.existsSync(path.join(projectRoot, 'textos', `clase-${String(classNumber).padStart(2, '0')}`, file));

function readingCard(classNumber, reading) {
  const scheduled = classByNumber(classNumber);
  const source = scheduled.biblio.find((entry) => entry.id === reading.id);
  const tier = source?.tier || reading.tier || 'F';
  const tierName = TIERS[tier]?.nombre || 'Lectura';
  const pending = reading.pending || !fileExists(classNumber, reading.file);
  const base = `../textos/clase-${String(classNumber).padStart(2, '0')}/${reading.file || ''}`;
  const viewer = `lector.html?file=${encodeURIComponent(base)}&amp;pagina=${reading.page || 1}&amp;titulo=${encodeURIComponent(reading.title.replace(/<[^>]+>/g, ''))}`;
  const actions = pending
    ? `<div class="notice"><span class="notice__icon" data-icon="alert" data-size="20"></span><div><h4 class="notice__title">Material todavía no incorporado</h4><p>La guía ya está preparada. El enlace se habilitará cuando esté disponible el PDF verificado.</p></div></div>`
    : `<div class="reading__actions"><a class="btn ${tier === 'C' ? 'btn--primary' : 'btn--secondary'}" href="${viewer}"><span data-icon="book" data-size="16"></span> Abrir en el visor</a><a class="btn btn--download" href="${base}" download><span data-icon="download" data-size="16"></span> Descargar PDF</a></div>`;
  return `<article class="reading${tier === 'C' ? ' reading--central' : ''}">
    <div class="reading__head"><div><p class="reading__tier"><b>${tier}</b> ${tierName}</p><h3 class="reading__title">${reading.title}</h3><p class="reading__cite">${source?.cita || reading.cite || ''}</p></div><div class="reading__stats"><span class="reading__pages">${reading.pages}</span></div></div>
    <div class="reading__body"><div class="lookfor"><p class="lookfor__title">Qué buscar</p><ul class="lookfor__list">${reading.look.map((item) => `<li>${item}</li>`).join('')}</ul></div><div class="ask"><p class="ask__title"><span data-icon="pen" data-size="14"></span> Preguntas sobre el texto</p><ol class="ask__list">${reading.questions.map((item) => `<li>${item}</li>`).join('')}</ol></div>${actions}</div>
  </article>`;
}

function classPage(number) {
  const item = classByNumber(number);
  const content = classContent[number];
  const unit = unitByNumber(item.unidad);
  const date = `${item.fecha.dia} de ${monthNames[item.fecha.mes - 1]}`;
  const prev = classByNumber(number - 1);
  const next = classByNumber(number + 1);
  const prevLink = prev ? `<a class="btn btn--ghost" href="clase-${String(prev.numero).padStart(2, '0')}.html"><span data-icon="arrowLeft" data-size="18"></span> Clase ${prev.numero}</a>` : '';
  const nextLink = next
    ? `<a class="btn btn--primary" href="clase-${String(next.numero).padStart(2, '0')}.html">Clase ${next.numero} · ${next.titulo}<span data-icon="arrowRight" data-size="18"></span></a>`
    : `<a class="btn btn--primary" href="../index.html#cronograma">Volver al cronograma <span data-icon="arrowRight" data-size="18"></span></a>`;
  const special = number === 6
    ? `<div class="notice" style="margin-bottom: var(--space-8)"><span class="notice__icon" data-icon="info" data-size="22"></span><div><h3 class="notice__title">Comenzamos después del primer parcial</h3><p>La devolución general ocupa el inicio del encuentro. El plan distingue la lectura central de los textos que funcionan como contraste y reformulación.</p></div></div>`
    : number === 11
      ? `<div class="notice" style="margin-bottom: var(--space-8)"><span class="notice__icon" data-icon="info" data-size="22"></span><div><h3 class="notice__title">Clase de integración · No evaluable</h3><p>Se dicta después del segundo parcial. Los textos permiten ordenar el recorrido y no agregan contenidos a esa evaluación.</p></div></div>`
      : '';
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Clase ${number} de Psicopatología I: ${escAttr(content.meta)}">
  <title>Clase ${number} · ${item.titulo} · Psicopatología I</title>
  <link rel="icon" href="data:,">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../assets/tokens.css?v=5">
  <link rel="stylesheet" href="../assets/ui.css?v=7">
  <link rel="stylesheet" href="../assets/clase.css?v=9">
</head>
<body data-unit="${item.unidad}">
  <!--
    THESIS: ${content.thesis}
    OWN-WORLD: Extensión directa del sistema de lectura guiada del Campus; jerarquía, color de unidad y componentes existentes.
    STORY: Apertura del problema, preguntas orientadoras, orden de lectura, fichas por texto y puente hacia el encuentro siguiente.
    FIRST VIEWPORT: Regreso a la unidad, metadatos de fecha, título y un ensayo breve que instala la pregunta clínica.
    FORM: Documento académico de lectura; estructura heredada de las clases 1 a 5.
  -->
  <a class="skip-link" href="#contenido">Saltar al contenido</a>
  <div data-ui="nav" data-active="clases" data-depth="../"></div>
  <main class="container container--reading" id="contenido">
    <div class="class-layout">
      <div class="class-document">
        <header class="class-head settle">
          <a class="back-link" href="unidad-${String(item.unidad).padStart(2, '0')}.html"><span data-icon="arrowLeft" data-size="18"></span> Unidad ${item.unidad} · ${unit.titulo}</a>
          <div class="class-head__meta"><span class="badge badge--accent">Clase ${number}</span><span class="badge"><span data-icon="calendar" data-size="14"></span> Lunes ${date}</span><span class="badge"><span data-icon="clock" data-size="14"></span> Inicio 8:30</span></div>
          <h1 class="class-head__title">${item.titulo}</h1>
          <div class="prose"><p class="class-head__lead">${content.lead[0]}</p>${content.lead.slice(1).map((p) => `<p>${p}</p>`).join('')}</div>
        </header>
        <section class="section" id="objetivos"><div class="section-head"><h2 class="section-head__title">Al terminar la clase vas a poder responder</h2></div><ol class="questions">${content.objectives.map((q) => `<li class="question">${q}</li>`).join('')}</ol></section>
        <section class="section" id="lecturas"><div class="section-head"><h2 class="section-head__title">Plan de lectura</h2><p class="section-head__subtitle">${item.biblio.length} textos con funciones diferentes: una lectura central, articulaciones obligatorias y materiales de apoyo cuando corresponde.</p></div>${special}<div class="order">${content.order.map((step) => `<p class="order__step"><span>${step}</span></p>`).join('')}</div><div class="readings">${content.readings.map((reading) => readingCard(number, reading)).join('')}</div></section>
        <section class="section" id="cierre"><div class="bridge"><h2 class="bridge__title">${content.closeTitle}</h2><div class="bridge__copy"><p>${content.close}</p></div><div class="hero__actions mt-6"><a class="btn btn--secondary btn--lg" href="unidad-${String(item.unidad).padStart(2, '0')}.html"><span data-icon="arrowLeft" data-size="18"></span> Volver a la Unidad ${item.unidad}</a>${next ? `<a class="btn btn--primary btn--lg" href="clase-${String(next.numero).padStart(2, '0')}.html">Ir a la Clase ${next.numero} <span data-icon="arrowRight" data-size="18"></span></a>` : `<a class="btn btn--primary btn--lg" href="../index.html#cronograma">Volver al cronograma <span data-icon="arrowRight" data-size="18"></span></a>`}</div></div></section>
        <nav class="pager" aria-label="Navegación entre clases">${prevLink}${nextLink}</nav>
      </div>
      <aside class="class-rail" aria-label="Navegación de esta clase"><p class="class-rail__title">En esta clase</p><nav class="class-rail__nav"><a class="class-rail__link" href="#contenido">Apertura <span data-icon="arrowRight" data-size="16"></span></a><a class="class-rail__link" href="#objetivos">Objetivos <span data-icon="arrowRight" data-size="16"></span></a><a class="class-rail__link" href="#lecturas">Plan de lectura <span data-icon="arrowRight" data-size="16"></span></a><a class="class-rail__link" href="#cierre">Cierre <span data-icon="arrowRight" data-size="16"></span></a></nav><p class="class-rail__note">Lunes ${date} · Inicio 8:30</p></aside>
    </div>
    <footer class="site-footer"><span><strong class="text-strong">Psicopatología I</strong> · UFLO · <span id="year"></span></span><span>Clase ${number} · Lunes ${date} de 2026</span></footer>
  </main>
  <script src="../assets/icons.js?v=4"></script><script src="../assets/data.js?v=9"></script><script src="../assets/ui.js?v=8"></script>
</body>
</html>`;
}

function unitPage(number) {
  const unit = unitByNumber(number);
  const content = unitContent[number];
  const classes = PROGRAMA.filter((item) => unit.clases.includes(item.id));
  const previousUnit = unitByNumber(number - 1);
  const nextUnit = unitByNumber(number + 1);
  const first = classes[0];
  const bibliography = classes.map((item) => `<div class="biblio-group"><h3 class="biblio-group__title">Clase ${item.numero} · ${item.titulo}</h3><ul class="biblio-list">${item.biblio.map((entry) => `<li data-tier="${entry.tier}"><b title="${TIERS[entry.tier]?.nombre || entry.tier}">${entry.tier}</b><span>${entry.cita}</span></li>`).join('')}</ul></div>`).join('');
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="description" content="Unidad ${number} de Psicopatología I: ${escAttr(unit.titulo)}. Clases ${classes[0].numero} a ${classes.at(-1).numero}."><title>Unidad ${number} · ${unit.titulo} · Psicopatología I</title><link rel="icon" href="data:,"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700;800&display=swap" rel="stylesheet"><link rel="stylesheet" href="../assets/tokens.css?v=5"><link rel="stylesheet" href="../assets/ui.css?v=7"></head>
<body data-unit="${number}">
  <!--
    THESIS: La unidad se organiza como una secuencia de tres preguntas clínicas, no como un catálogo de diagnósticos.
    OWN-WORLD: Sistema visual existente del Campus con el acento cromático propio de la Unidad ${number}.
    STORY: Contexto, tres movimientos, ruta de clases y bibliografía completa con jerarquía C/F/A.
    FIRST VIEWPORT: Título, fechas, argumento de la unidad y pregunta organizadora.
    FORM: Ensayo breve con hoja de ruta; extensión directa de las unidades 1 y 2.
  -->
  <a class="skip-link" href="#contenido">Saltar al contenido</a><div data-ui="nav" data-active="clases" data-depth="../"></div>
  <main class="container" id="contenido">
    <section class="hero settle"><a class="back-link" href="../index.html"><span data-icon="arrowLeft" data-size="18"></span> Volver al inicio</a><div class="hero__grid"><div><h1 class="hero__title">${unit.titulo}</h1><div class="prose"><p class="hero__lead" style="margin-bottom: var(--space-6)">Unidad ${number} · Clases ${classes[0].numero} a ${classes.at(-1).numero} · ${content.dates}</p>${content.intro.map((p) => `<p>${p}</p>`).join('')}</div><div class="hero__actions mt-8"><a class="btn btn--primary btn--lg" href="clase-${String(first.numero).padStart(2, '0')}.html">Empezar por la Clase ${first.numero} <span data-icon="arrowRight" data-size="18"></span></a><a class="btn btn--secondary btn--lg" href="#ruta">Ver las tres clases</a></div></div><aside class="pull"><p class="pull__quote">${content.question}</p><p class="pull__source">Pregunta organizadora de la unidad</p></aside></div></section>
    <section class="section"><div class="section-head"><h2 class="section-head__title">Tres movimientos, una misma pregunta clínica</h2></div><ol class="moves moves--three">${content.moves.map((move, index) => `<li class="move"><h3 class="move__q">${move[0]}</h3><p class="move__a">${move[1]}</p><p class="move__where">Clase ${classes[index].numero} · ${classes[index].fecha.dia} de ${monthNames[classes[index].fecha.mes - 1]}</p></li>`).join('')}</ol></section>
    <section class="section" id="ruta"><div class="section-head"><h2 class="section-head__title">Las clases de esta unidad</h2><p class="section-head__subtitle">Cada página conserva la misma estructura: apertura del problema, objetivos, orden de lectura, guía por texto y cierre.</p></div><div class="roadmap">${classes.map((item) => `<a class="stop" href="clase-${String(item.numero).padStart(2, '0')}.html"><div class="stop__date"><div class="stop__day">${item.fecha.dia}</div><div class="stop__month">${monthNames[item.fecha.mes - 1].slice(0, 3)}</div></div><div><h3 class="stop__title">Clase ${item.numero} · ${item.titulo}</h3><p class="stop__desc">${item.desc}</p></div><span class="stop__meta"><span data-icon="arrowRight" data-size="18"></span></span></a>`).join('')}</div></section>
    <section class="section"><div class="section-head"><h2 class="section-head__title">Toda la bibliografía de la unidad</h2><p class="section-head__subtitle">${content.total}</p></div><div class="biblio-unit">${bibliography}</div></section>
    <nav class="pager" aria-label="Navegación entre páginas"><a class="btn btn--ghost" href="unidad-${String(previousUnit.numero).padStart(2, '0')}.html"><span data-icon="arrowLeft" data-size="18"></span> Unidad ${previousUnit.numero}</a>${nextUnit ? `<a class="btn btn--primary" href="unidad-${String(nextUnit.numero).padStart(2, '0')}.html">Unidad ${nextUnit.numero} · ${nextUnit.titulo} <span data-icon="arrowRight" data-size="18"></span></a>` : `<a class="btn btn--primary" href="clase-${String(first.numero).padStart(2, '0')}.html">Empezar la Unidad ${number} <span data-icon="arrowRight" data-size="18"></span></a>`}</nav>
    <footer class="site-footer"><span><strong class="text-strong">Psicopatología I</strong> · UFLO · <span id="year"></span></span><span>Unidad ${number} · Clases ${classes[0].numero} a ${classes.at(-1).numero}</span></footer>
  </main>
  <style>
    .moves{list-style:none;padding:0;margin:0;counter-reset:mv;display:grid;gap:var(--space-10)}.move{position:relative;padding-left:clamp(var(--space-8),7vw,var(--space-16));padding-top:var(--space-6);border-top:1px solid var(--border)}.move::before{counter-increment:mv;content:counter(mv,decimal-leading-zero);position:absolute;left:0;top:var(--space-6);font-family:var(--font-display);font-size:var(--text-lg);font-weight:800;color:var(--accent-text)}.move__q{font-size:var(--text-2xl);margin-bottom:var(--space-4);max-width:26ch}.move__a{color:var(--text-muted);max-width:var(--measure)}.move__where{margin-top:var(--space-4);font-size:var(--text-xs);font-weight:700;letter-spacing:var(--tracking-wide);text-transform:uppercase;color:var(--text-subtle)}.biblio-unit{display:grid;gap:var(--space-10)}.biblio-group__title{font-size:var(--text-sm);font-weight:700;color:var(--text-strong);padding-bottom:var(--space-3);margin-bottom:var(--space-4);border-bottom:1px solid var(--border)}.biblio-list{display:grid;gap:var(--space-3);list-style:none;padding:0}.biblio-list li{display:grid;grid-template-columns:26px minmax(0,1fr);gap:var(--space-4);align-items:start;font-size:var(--text-sm);color:var(--text)}.biblio-list b{display:grid;place-items:center;width:26px;height:26px;border-radius:var(--radius-sm);font-size:var(--text-xs);font-weight:800;background:var(--surface-hover);color:var(--text-muted)}.biblio-list li[data-tier="C"] b{background:var(--accent-fill);color:var(--on-accent-fill)}@media(min-width:900px){.moves--three{grid-template-columns:repeat(3,minmax(0,1fr))}.moves--three .move{padding-top:var(--space-16);padding-left:0}.moves--three .move::before{top:var(--space-6)}.biblio-unit{grid-template-columns:repeat(3,minmax(0,1fr))}}
  </style>
  <script src="../assets/icons.js?v=4"></script><script src="../assets/data.js?v=9"></script><script src="../assets/ui.js?v=8"></script>
</body></html>`;
}

for (const number of [6, 7, 8, 9, 10, 11]) {
  const content = classContent[number];
  const scheduled = classByNumber(number);
  const guideIds = content?.readings.map((reading) => reading.id) || [];
  const scheduledIds = scheduled?.biblio.map((reading) => reading.id) || [];
  const hasDuplicates = new Set(guideIds).size !== guideIds.length || new Set(scheduledIds).size !== scheduledIds.length;
  const hasDifferentIds = guideIds.length !== scheduledIds.length || guideIds.some((id) => !scheduledIds.includes(id));
  if (!content || !scheduled || guideIds.some((id) => !id) || hasDuplicates || hasDifferentIds) {
    throw new Error(`Clase ${number}: la guía y CAMPUS_DATA no contienen los mismos textos identificados de forma única.`);
  }
  fs.writeFileSync(path.join(unitsDir, `clase-${String(number).padStart(2, '0')}.html`), classPage(number), 'utf8');
}

for (const number of [3, 4]) {
  fs.writeFileSync(path.join(unitsDir, `unidad-${String(number).padStart(2, '0')}.html`), unitPage(number), 'utf8');
}

console.log('Generadas: clases 6–11 y unidades 3–4.');
