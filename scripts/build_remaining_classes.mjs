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
    meta: 'Duda, aislamiento y culpa en el Hombre de las Ratas, con la reescritura de los años veinte.',
    thesis: 'La duda obsesiva no es falta de pensamiento: es una solución que posterga el acto y conserva abierto el conflicto, y los años veinte explican por qué esa solución se vuelve tan cara.',
    lead: [
      'Después del primer parcial retomamos el método de lectura de casos. El Hombre de las Ratas no se estudia como un inventario de rasgos obsesivos, sino como una organización en la que pensamiento, duda, culpa y defensa se sostienen entre sí.',
      'El relato del suplicio de las ratas condensa una amenaza, una deuda y una exigencia imposible. Freud sigue asociaciones, desplazamientos y contradicciones para mostrar que el pensamiento obsesivo no está separado de la vida afectiva: la sustituye, la aísla y al mismo tiempo la mantiene activa.',
      'La segunda mitad del encuentro cambia el nivel del problema. En 1926 Freud reorganiza su mapa: la angustia puede funcionar como señal que anticipa un peligro, y el aislamiento y la anulación aparecen como técnicas defensivas propias de la neurosis obsesiva. El superyó y la culpa los trabajamos en clase sobre el propio historial, donde la necesidad de castigo está a la vista.'
    ],
    objectives: [
      '¿Cómo transforma Freud una duda aparentemente absurda en una formación con historia y función?',
      '¿Qué relación establece el caso entre ambivalencia, culpa, deuda y pensamiento compulsivo?',
      '¿Cómo operan el aislamiento y el desplazamiento en la construcción del síntoma obsesivo?',
      '¿Qué diferencia establece Freud entre inhibición, síntoma y angustia, y cómo funciona la angustia señal?',
      '¿Qué agrega la reformulación de 1926 a la explicación del síntoma obsesivo de 1909?'
    ],
    order: [
      '<strong>Entrá por el caso.</strong> Seguí la secuencia del relato de las ratas, la deuda y las órdenes contradictorias.',
      '<strong>Volvé al mecanismo de 1896.</strong> Precisá defensa, reproche y retorno de las representaciones.',
      '<strong>Cambiá de nivel con 1926.</strong> Distinguí señal, peligro y defensa en los capítulos sobre la neurosis obsesiva.',
      '<strong>Cerrá con Lacan, si llegás.</strong> Preguntá qué obtiene el obsesivo al aplazar el acto y mantener insatisfecho el deseo.'
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
        id: 'freud-1926-isa-v-vi',
        title: 'Inhibición, síntoma y angustia · Capítulos V y VI',
        cite: 'Freud, S. (1926). <em>Obras completas</em>, tomo XX. Amorrortu.',
        pages: 'Capítulos completos',
        file: 'Freud_1926_Inhibicion_sintoma_y_angustia_Cap_V_VI.pdf',
        look: ['La diferencia entre peligro pulsional, angustia señal y puesta en marcha de la defensa.', 'La revisión de la explicación económica anterior de la angustia.', 'Los ejemplos con los que Freud articula formación de síntoma y evitación del peligro en la neurosis obsesiva.'],
        questions: ['¿La represión produce angustia o la angustia pone en marcha la represión?', '¿Qué gana y qué pierde el yo mediante el síntoma?']
      },
      {
        id: 'lacan-s5-obsesivo',
        title: 'El obsesivo y su deseo',
        cite: 'Lacan, J. (1957-1958/1999). <em>El Seminario, libro 5</em>, capítulo XXIII. Paidós.',
        pages: 'Capítulo XXIII completo · apoyo',
        file: 'Lacan_1957-1958_Seminario_5_Cap_XXIII_El_obsesivo_y_su_deseo.pdf',
        look: ['La relación entre deseo, demanda y postergación.', 'La posición del obsesivo frente al deseo del Otro.', 'El modo en que la hazaña y el pensamiento pueden reemplazar una decisión subjetiva.'],
        questions: ['¿Qué conserva el obsesivo cuando posterga?', '¿Cómo modifica esta lectura la idea de que el problema sería simplemente “pensar demasiado”?']
      }
    ],
    closeTitle: 'La angustia queda preparada para cambiar de caso',
    close: 'En la obsesión, la señal de peligro pone en marcha defensas que capturan el pensamiento y el acto. En Juanito veremos otra solución: la angustia se liga a un objeto exterior y organiza un campo de evitaciones. La fobia no será sólo miedo; será también un intento de localizarlo.'
  },
  7: {
    meta: 'Juanito y la fobia como intento de localizar la angustia.',
    thesis: 'La fobia no es una lista de objetos temidos: construye un objeto que vuelve evitable una angustia que antes no tenía localización.',
    lead: [
      'La clase anterior distinguimos angustia señal, peligro y defensa dentro de la neurosis obsesiva. Juanito permite ver esa misma secuencia resuelta de otro modo: el miedo a los caballos organiza recorridos, prohibiciones y preguntas que antes estaban dispersos.',
      'El historial tiene una condición particular. Freud no observa directamente al niño: trabaja con los registros y las intervenciones del padre. Por eso también leeremos cómo se produce el material del caso y qué lugar ocupa cada adulto en su construcción.',
      'La comparación entre 1895, 1909 y 1926 muestra una transformación conceptual. Freud pasa de clasificar obsesiones y fobias a explicar la función de la angustia; Lacan agrega la pregunta por el significante que permite ordenar lo que irrumpe.'
    ],
    objectives: [
      '¿Qué problema resuelve la elección de un objeto fóbico?',
      '¿Cómo se articula el miedo a los caballos con las preguntas de Juanito sobre nacimiento, diferencia sexual y castración?',
      '¿Qué consecuencias tiene que el caso llegue a Freud a través del padre?',
      '¿Cómo cambia la teoría de la fobia entre 1895 y 1926?',
      '¿Qué separa la solución fóbica de la solución obsesiva frente a un mismo peligro?'
    ],
    order: [
      '<strong>Leé primero el caso.</strong> Seguí las transformaciones del miedo y evitá buscar una equivalencia fija entre caballo y persona.',
      '<strong>Releé con la teoría de 1926.</strong> Separá angustia, peligro y formación sustitutiva, y comparala con lo leído la clase anterior.',
      '<strong>Cerrá con Lacan.</strong> Ubicá qué función ordenadora puede cumplir un significante cuando la angustia desborda las explicaciones disponibles.',
      '<strong>Usá 1895 como contraste.</strong> Registrá cuánto cambia el problema entre una clasificación inicial y la explicación posterior.'
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
        id: 'lacan-s4-significante-real',
        title: 'El significante en lo real',
        cite: 'Lacan, J. (1956-1957/1994). <em>El Seminario, libro 4</em>, capítulo XIV. Paidós.',
        pages: 'Capítulo XIV completo · pp. 233–248',
        file: 'Lacan_1956-1957_Seminario_4_La_relacion_de_objeto.pdf',
        page: 115,
        look: ['La fobia como respuesta a una dificultad de simbolización.', 'La función que adquiere el caballo dentro de una red de sustituciones.', 'La diferencia entre reducir el objeto a una persona y seguir su función significante.'],
        questions: ['¿Por qué el caballo no posee un único significado estable?', '¿Qué permite ordenar la fobia que antes aparecía como angustia sin localización?']
      },
      {
        id: 'freud-1895-obsesiones-fobias',
        title: 'Obsesiones y fobias',
        cite: 'Freud, S. (1895). <em>Obras completas</em>, tomo III. Amorrortu.',
        pages: 'Texto completo · apoyo',
        file: 'Freud_1895_Obsesiones_y_fobias.pdf',
        look: ['Los criterios iniciales con los que Freud separa obsesiones y fobias.', 'La relación propuesta entre afecto y representación.', 'Las diferencias entre esta clasificación y la teoría de la angustia de 1926.'],
        questions: ['¿Qué puede distinguir Freud en 1895 y qué todavía no explica?', '¿Qué ganamos al leer este texto después de 1926 y no como definición definitiva?']
      }
    ],
    closeTitle: 'De las neurosis al problema de la psicosis',
    close: 'En obsesión y fobia seguimos soluciones construidas mediante represión, sustitución y retorno de lo reprimido. La Unidad 4 preguntará qué ocurre cuando Freud encuentra fenómenos que no puede organizar con el mismo mecanismo.'
  },
  8: {
    meta: 'Paranoia, caso Schreber y pérdida de realidad: la clase que reúne las dos de la Unidad 4.',
    thesis: 'Lo específico de la paranoia no es la proyección sino el modo de la represión, y el delirio que parece la enfermedad es el intento de volver a habitar el mundo.',
    lead: [
      'Esta es la última clase de la cursada y reúne las dos que tenía la unidad: el 9 de noviembre pasó a ser feriado. Por eso el plan de lectura es más corto que la suma de los dos anteriores. El caso Schreber organiza el encuentro, y los demás textos entran para leerlo.',
      'El hilo es una pregunta por el mecanismo. En 1896 Freud ubicó la paranoia entre las neuropsicosis de defensa y le asignó un mecanismo propio, la proyección. En Schreber se corrige: lo específico de la paranoia no es la proyección sino la represión en tres tiempos, y la proyección queda redefinida como el camino del retorno, porque lo cancelado adentro retorna desde afuera. El narcisismo, que Freud introduce en ese mismo texto, explica los dos primeros tiempos.',
      'El cierre vuelve sobre todo el recorrido. En 1924 Freud compara cómo se pierde y cómo se repara la realidad en la neurosis y en la psicosis. Dora y el Hombre de las Ratas reaparecen acá, del otro lado de la comparación.'
    ],
    objectives: [
      '¿Qué mecanismo le asigna Freud a la paranoia en 1896, y en qué se diferencia su trayectoria de la de la neurosis obsesiva?',
      '¿Cuál es el delirio primario de Schreber y qué transformaciones sufre a lo largo del cuadro?',
      '¿Por qué Freud deja de considerar la proyección como lo específico de la paranoia, y qué ocurre en cada uno de los tres tiempos de la represión?',
      '¿Por qué el delirio puede pensarse como un intento de restablecimiento?',
      '¿Cómo se pierde y cómo se repara la realidad en la neurosis y en la psicosis?'
    ],
    order: [
      '<strong>Empezá por las dos páginas de 1896.</strong> Ya leíste este texto en la Clase 6; ahora la comparación es entre la paranoia y la neurosis obsesiva. Anotá qué mecanismo le atribuye Freud a la paranoia.',
      '<strong>Leé la Sección III de Schreber.</strong> Seguí por qué Freud abandona la proyección y cómo describe los tres tiempos de la represión. El historial del caso lo reconstruimos en clase.',
      '<strong>Sumá las páginas del narcisismo.</strong> Precisá qué pasa con la libido que se retira del mundo y qué es el delirio de grandeza.',
      '<strong>Cerrá con 1924.</strong> Compará los dos pasos de la neurosis con los dos pasos de la psicosis.'
    ],
    readings: [
      {
        id: 'freud-1911-schreber',
        title: 'Puntualizaciones psicoanalíticas sobre un caso de paranoia (Schreber) · Sección III',
        cite: 'Freud, S. (1911). <em>Obras completas</em>, tomo XII. Amorrortu.',
        pages: 'Sección III completa · pp. 55–73',
        file: 'Freud_1911_Puntualizaciones_psicoanaliticas_sobre_un_caso_de_paranoia_Schreber.pdf',
        page: 61,
        look: ['Por qué Freud afirma que nada de lo dicho sobre el complejo paterno da lo específico de la paranoia.', 'Los tres tiempos de la represión —fijación, desasimiento de la libido y retorno— y qué tiene cada uno de propio en la paranoia.', 'La frase con que redefine la proyección: «lo cancelado adentro retorna desde afuera».', 'El delirio como intento de restablecimiento, y la diferencia entre paranoia y parafrenia al final de la sección.'],
        questions: ['¿Por qué la proyección no alcanza para definir la paranoia?', '¿Dónde ubica Freud el proceso patológico propiamente dicho, y por qué dice que transcurre en silencio?']
      },
      {
        id: 'freud-1896-psicosis',
        title: 'Nuevas puntualizaciones sobre las neuropsicosis de defensa · Capítulo III',
        cite: 'Freud, S. (1896). <em>Obras completas</em>, tomo III. Amorrortu.',
        pages: 'Comparación con la neurosis obsesiva · pp. 183–184',
        file: 'Freud_1896_Nuevas_puntualizaciones_sobre_las_neuropsicosis_de_defensa.pdf',
        page: 26,
        look: ['Qué pasa en la paranoia con el síntoma primario de defensa: se le quita reconocimiento al reproche y aparece la desconfianza hacia los otros.', 'Cómo retornan los reproches: como voces, con una doble desfiguración.', 'Qué ocupa en la paranoia el lugar de la defensa secundaria: el delirio de interpretación, que desemboca en la alteración del yo.'],
        questions: ['Compará la trayectoria de la paranoia con la de la neurosis obsesiva en sus tres grupos de síntomas.', '¿Qué mecanismo le atribuye Freud a la paranoia en 1896?']
      },
      {
        id: 'freud-1914-narcisismo',
        title: 'Introducción del narcisismo',
        cite: 'Freud, S. (1914). <em>Obras completas</em>, tomo XIV. Amorrortu.',
        pages: 'Comienzo del apartado I · pp. 71–74',
        file: 'Freud_1914_Introduccion_del_narcisismo.pdf',
        page: 8,
        look: ['El «motivo acuciante»: la parafrenia y sus dos rasgos, el delirio de grandeza y el extrañamiento respecto del mundo exterior.', 'La diferencia con la neurosis: allí la libido retirada queda en la fantasía; en la parafrenia vuelve al yo.', 'El narcisismo secundario, que se edifica sobre uno primario.'],
        questions: ['¿Qué destino tiene la libido sustraída de los objetos en la parafrenia?', '¿A qué tiempo de la represión de Schreber corresponde el delirio de grandeza?']
      },
      {
        id: 'freud-1924-perdida',
        title: 'La pérdida de realidad en la neurosis y la psicosis',
        cite: 'Freud, S. (1924). <em>Obras completas</em>, tomo XIX. Amorrortu.',
        pages: 'Texto completo · pp. 193–197',
        file: 'Freud_1924_La_perdida_de_realidad_en_la_neurosis_y_la_psicosis.pdf',
        page: 4,
        look: ['Los dos pasos de la neurosis y los dos pasos de la psicosis, y en cuál de ellos se pierde la realidad en cada caso.', 'A quién obedece el yo en el primer paso: a la realidad en la neurosis, al ello en la psicosis.', 'Qué ocupa el lugar de la realidad perdida: la fantasía en la neurosis, una realidad nueva en la psicosis.'],
        questions: ['¿Qué corrige este texto de lo que Freud había escrito meses antes en «Neurosis y psicosis»?', 'Elegí un síntoma de Dora o del Hombre de las Ratas y explicá qué fragmento de realidad evita.']
      },
      {
        id: 'kraepelin-paranoia',
        title: 'Lección XV: Paranoia',
        cite: 'Kraepelin, E. <em>Introducción a la clínica psiquiátrica</em>.',
        pages: 'Lección XV completa · pp. 157–166 · apoyo',
        file: 'Kraepelin_1900_Leccion_XV_Paranoia.pdf',
        look: ['Los criterios con que Kraepelin delimita la paranoia: delirio sistematizado, conservación de la claridad, curso crónico.', 'Por qué un caso como el de Schreber, con alucinaciones y trastornos del cuerpo, quedaría fuera de esa paranoia.'],
        questions: ['¿Por qué Freud subtitula el caso «demencia paranoide»?']
      },
      {
        id: 'freud-1924-neurosis-psicosis',
        title: 'Neurosis y psicosis',
        cite: 'Freud, S. (1924). <em>Obras completas</em>, tomo XIX. Amorrortu.',
        pages: 'Texto completo · apoyo',
        file: 'Freud_1924_Neurosis_y_psicosis.pdf',
        page: 6,
        look: ['La fórmula inicial: la neurosis como conflicto entre el yo y el ello, la psicosis como conflicto entre el yo y el mundo exterior.', 'Por qué esa fórmula es la que «La pérdida de realidad» corrige.'],
        questions: ['¿Qué se pierde si uno se queda con esta fórmula sin leer el texto siguiente?']
      },
      {
        id: 'lacan-s3-fenomeno',
        title: 'El fenómeno psicótico y su mecanismo',
        cite: 'Lacan, J. (1955-1956/1984). <em>El Seminario, libro 3: Las psicosis</em>. Capítulo VI. Paidós.',
        pages: 'Capítulo completo · pp. 107–128 · apoyo',
        file: 'Lacan_1955-1956_Seminario_3_Cap_VI_El_fenomeno_psicotico_y_su_mecanismo.pdf',
        look: ['El carácter no dialectizable del fenómeno y la certeza de que algo concierne al sujeto.', 'La Verwerfung y el retorno en lo real, leídos desde la frase de Freud sobre lo cancelado adentro.'],
        questions: ['¿Qué distingue una certeza de alusión de una interpretación que todavía puede ponerse en duda?']
      }
    ],
    closeTitle: 'El recorrido termina con una forma de preguntar',
    close: 'Esta clase entra en el segundo parcial, el lunes 2 de noviembre. Pero el curso no cierra con una tabla de cuadros, sino con un método: describir antes de concluir, distinguir el fenómeno del mecanismo, comparar soluciones y sostener hipótesis revisables. Es lo que hicimos con Dora, con el Hombre de las Ratas, con Juanito y ahora con Schreber.'
  }
};

const unitContent = {
  3: {
    dates: 'Del 5 al 19 de octubre',
    question: '¿Cómo puede una formación limitar la angustia y, al mismo tiempo, restringir la vida?',
    intro: [
      'La Unidad 2 mostró cómo se forma un síntoma y cómo ese mecanismo se vuelve legible en Dora. Ahora aplicamos el método a dos organizaciones neuróticas diferentes: obsesión y fobia.',
      'El recorrido no busca asociar cada diagnóstico con una lista de conductas. Sigue operaciones: aislamiento, desplazamiento, postergación, angustia señal, elección de un objeto fóbico y construcción de evitaciones.',
      'Las reformulaciones que Freud hace en los años veinte ya no ocupan una clase propia. Se leen dentro de cada caso: los capítulos de <em>Inhibición, síntoma y angustia</em> sobre la obsesión acompañan al Hombre de las Ratas, y los que tratan la fobia acompañan a Juanito.'
    ],
    moves: [
      ['¿Qué hace la duda?', 'El Hombre de las Ratas permite seguir cómo pensamiento, culpa y ambivalencia aplazan una decisión y conservan abierto el conflicto. Los capítulos de 1926 explican por qué esa solución se vuelve tan cara.'],
      ['¿Qué resuelve una fobia?', 'Juanito muestra cómo un objeto exterior puede localizar una angustia y transformar un peligro indeterminado en recorridos evitables.']
    ],
    total: 'Ocho textos en dos clases. Cada encuentro tiene una lectura que organiza el problema, articulaciones obligatorias y materiales de apoyo para ir más lejos.'
  },
  4: {
    dates: 'Lunes 26 de octubre',
    question: '¿Qué ocurre cuando el delirio deja de pensarse sólo como pérdida y empieza a leerse también como reconstrucción?',
    intro: [
      'La última unidad cambia el mecanismo y conserva el método. Partimos de la paranoia de la psiquiatría clásica y de la primera explicación freudiana, y llegamos al caso Schreber.',
      'El punto decisivo es separar el proceso patológico de los esfuerzos posteriores por recomponer un mundo. Así, el delirio puede estudiarse por su forma, su certeza y su función, no sólo por la rareza de su contenido.',
      'La unidad tenía dos clases y quedó en una: el 9 de noviembre pasó a ser feriado. El encuentro del 26 de octubre lee Schreber con los textos que lo preparan y cierra con los de 1924, que formulan juntas neurosis y psicosis. Entra en el segundo parcial.'
    ],
    moves: [
      ['¿Qué mecanismo tiene la paranoia?', 'En 1896 Freud responde: la proyección. Schreber lo corrige: la represión en tres tiempos, y la proyección como el camino por el que lo cancelado adentro retorna desde afuera.'],
      ['¿Qué trabajo realiza el delirio?', 'El narcisismo explica el retiro de la libido sobre el yo; el delirio es el intento de devolverla al mundo y volver a habitarlo.'],
      ['¿Cómo se pierde la realidad?', 'Los textos de 1924 comparan los dos pasos de la neurosis con los de la psicosis y cierran el recorrido de la materia.']
    ],
    total: 'Siete textos en una clase: una lectura central, tres obligatorias breves y tres de apoyo.'
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
    : number === 8
      ? `<div class="notice" style="margin-bottom: var(--space-8)"><span class="notice__icon" data-icon="info" data-size="22"></span><div><h3 class="notice__title">Una clase en lugar de dos</h3><p>El 9 de noviembre pasó a ser feriado, así que esta clase reúne las dos que tenía la unidad. La bibliografía obligatoria es más corta que la suma de las dos: cuatro lecturas, unas treinta páginas. El resto queda como apoyo.</p></div></div>`
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
  <script src="../assets/icons.js?v=4"></script><script src="../assets/data.js?v=18"></script><script src="../assets/ui.js?v=9"></script>
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
  const range = classes.length === 1 ? `Clase ${first.numero}` : `Clases ${first.numero} a ${classes.at(-1).numero}`;
  const seeAll = classes.length === 1 ? 'Ver la clase' : `Ver las ${classes.length === 3 ? 'tres' : 'dos'} clases`;
  const bibliography = classes.map((item) => `<div class="biblio-group"><h3 class="biblio-group__title">Clase ${item.numero} · ${item.titulo}</h3><ul class="biblio-list">${item.biblio.map((entry) => `<li data-tier="${entry.tier}"><b title="${TIERS[entry.tier]?.nombre || entry.tier}">${entry.tier}</b><span>${entry.cita}</span></li>`).join('')}</ul></div>`).join('');
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="description" content="Unidad ${number} de Psicopatología I: ${escAttr(unit.titulo)}. ${range}."><title>Unidad ${number} · ${unit.titulo} · Psicopatología I</title><link rel="icon" href="data:,"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700;800&display=swap" rel="stylesheet"><link rel="stylesheet" href="../assets/tokens.css?v=5"><link rel="stylesheet" href="../assets/ui.css?v=7"></head>
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
    <section class="hero settle"><a class="back-link" href="../index.html"><span data-icon="arrowLeft" data-size="18"></span> Volver al inicio</a><div class="hero__grid"><div><h1 class="hero__title">${unit.titulo}</h1><div class="prose"><p class="hero__lead" style="margin-bottom: var(--space-6)">Unidad ${number} · ${range} · ${content.dates}</p>${content.intro.map((p) => `<p>${p}</p>`).join('')}</div><div class="hero__actions mt-8"><a class="btn btn--primary btn--lg" href="clase-${String(first.numero).padStart(2, '0')}.html">Empezar por la Clase ${first.numero} <span data-icon="arrowRight" data-size="18"></span></a><a class="btn btn--secondary btn--lg" href="#ruta">${seeAll}</a></div></div><aside class="pull"><p class="pull__quote">${content.question}</p><p class="pull__source">Pregunta organizadora de la unidad</p></aside></div></section>
    <section class="section"><div class="section-head"><h2 class="section-head__title">${content.moves.length === 3 ? 'Tres' : 'Dos'} movimientos, una misma pregunta clínica</h2></div><ol class="moves moves--${content.moves.length === 3 ? 'three' : 'two'}">${content.moves.map((move, index) => `<li class="move"><h3 class="move__q">${move[0]}</h3><p class="move__a">${move[1]}</p><p class="move__where">Clase ${classes[Math.min(index, classes.length - 1)].numero} · ${classes[Math.min(index, classes.length - 1)].fecha.dia} de ${monthNames[classes[Math.min(index, classes.length - 1)].fecha.mes - 1]}</p></li>`).join('')}</ol></section>
    <section class="section" id="ruta"><div class="section-head"><h2 class="section-head__title">Las clases de esta unidad</h2><p class="section-head__subtitle">Cada página conserva la misma estructura: apertura del problema, objetivos, orden de lectura, guía por texto y cierre.</p></div><div class="roadmap">${classes.map((item) => `<a class="stop" href="clase-${String(item.numero).padStart(2, '0')}.html"><div class="stop__date"><div class="stop__day">${item.fecha.dia}</div><div class="stop__month">${monthNames[item.fecha.mes - 1].slice(0, 3)}</div></div><div><h3 class="stop__title">Clase ${item.numero} · ${item.titulo}</h3><p class="stop__desc">${item.desc}</p></div><span class="stop__meta"><span data-icon="arrowRight" data-size="18"></span></span></a>`).join('')}</div></section>
    <section class="section"><div class="section-head"><h2 class="section-head__title">Toda la bibliografía de la unidad</h2><p class="section-head__subtitle">${content.total}</p></div><div class="biblio-unit">${bibliography}</div></section>
    <nav class="pager" aria-label="Navegación entre páginas"><a class="btn btn--ghost" href="unidad-${String(previousUnit.numero).padStart(2, '0')}.html"><span data-icon="arrowLeft" data-size="18"></span> Unidad ${previousUnit.numero}</a>${nextUnit ? `<a class="btn btn--primary" href="unidad-${String(nextUnit.numero).padStart(2, '0')}.html">Unidad ${nextUnit.numero} · ${nextUnit.titulo} <span data-icon="arrowRight" data-size="18"></span></a>` : `<a class="btn btn--primary" href="clase-${String(first.numero).padStart(2, '0')}.html">Empezar la Unidad ${number} <span data-icon="arrowRight" data-size="18"></span></a>`}</nav>
    <footer class="site-footer"><span><strong class="text-strong">Psicopatología I</strong> · UFLO · <span id="year"></span></span><span>Unidad ${number} · ${range}</span></footer>
  </main>
  <style>
    .moves{list-style:none;padding:0;margin:0;counter-reset:mv;display:grid;gap:var(--space-10)}.move{position:relative;padding-left:clamp(var(--space-8),7vw,var(--space-16));padding-top:var(--space-6);border-top:1px solid var(--border)}.move::before{counter-increment:mv;content:counter(mv,decimal-leading-zero);position:absolute;left:0;top:var(--space-6);font-family:var(--font-display);font-size:var(--text-lg);font-weight:800;color:var(--accent-text)}.move__q{font-size:var(--text-2xl);margin-bottom:var(--space-4);max-width:26ch}.move__a{color:var(--text-muted);max-width:var(--measure)}.move__where{margin-top:var(--space-4);font-size:var(--text-xs);font-weight:700;letter-spacing:var(--tracking-wide);text-transform:uppercase;color:var(--text-subtle)}.biblio-unit{display:grid;gap:var(--space-10)}.biblio-group__title{font-size:var(--text-sm);font-weight:700;color:var(--text-strong);padding-bottom:var(--space-3);margin-bottom:var(--space-4);border-bottom:1px solid var(--border)}.biblio-list{display:grid;gap:var(--space-3);list-style:none;padding:0}.biblio-list li{display:grid;grid-template-columns:26px minmax(0,1fr);gap:var(--space-4);align-items:start;font-size:var(--text-sm);color:var(--text)}.biblio-list b{display:grid;place-items:center;width:26px;height:26px;border-radius:var(--radius-sm);font-size:var(--text-xs);font-weight:800;background:var(--surface-hover);color:var(--text-muted)}.biblio-list li[data-tier="C"] b{background:var(--accent-fill);color:var(--on-accent-fill)}@media(min-width:900px){.moves--three,.moves--two{grid-template-columns:repeat(auto-fit,minmax(0,1fr))}.moves--three .move,.moves--two .move{padding-top:var(--space-16);padding-left:0}.moves--three .move::before,.moves--two .move::before{top:var(--space-6)}.biblio-unit{grid-template-columns:repeat(3,minmax(0,1fr))}}
  </style>
  <script src="../assets/icons.js?v=4"></script><script src="../assets/data.js?v=18"></script><script src="../assets/ui.js?v=9"></script>
</body></html>`;
}

for (const number of [6, 7, 8]) {
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

console.log('Generadas: clases 6–8 y unidades 3–4.');
