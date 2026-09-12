/* ==========================================================================
   CAMPUS PSICOPATOLOGÍA I · Fuente única de verdad
   data.js — Cronograma, unidades y bibliografía de la cursada.
   Editar acá cambia el índice, la portada y las hojas de ruta.
   ==========================================================================
   Fechas: { año, mes (1-12), dia }.
   tipo: 'clase' | 'feriado' | 'parcial' | 'recuperatorio'
   estado (solo clases): 'listo' | 'pendiente'
   ========================================================================== */

window.CAMPUS_DATA = (function () {
  'use strict';

  /* ========================================================================
     CÁTEDRA
     ======================================================================== */
  const CONFIG = {
    materia: 'Psicopatología I',
    universidad: 'UFLO',
    comision: 'Comisión 3 · Turno mañana',
    cuatrimestre: 'Segundo cuatrimestre 2026',
    docentes: ['Blas Rivera', 'Guadalupe Guzmán'],
    diaClase: 'Lunes',
    horario: 'Inicio 8:30',
    zona: 'America/Argentina/Buenos_Aires',
    meetUrl: 'https://meet.google.com/ppm-khgg-ohk',
    moodleCourseId: '12209',
    forumUrl: 'https://campus.uflo.edu.ar/mod/forum/view.php?id=1225954',
  };

  /* ========================================================================
     UNIDADES
     ======================================================================== */
  const UNIDADES = [
    {
      numero: 1,
      titulo: 'El campo de la psicopatología y sus paradigmas',
      resumen: 'Qué es la psicopatología, de dónde viene y con qué método trabaja. ' +
               'Antes de estudiar un solo cuadro clínico, hay que entender contra qué ' +
               'discute el psicoanálisis cuando discute con la psiquiatría.',
      cita: 'Para observar a los alienados de una manera completa no basta con hacer la ' +
            'historia de las ideas delirantes; es necesario hacer la historia de los ' +
            'alienados delirantes.',
      citaAutor: 'Jean-Pierre Falret, Las enfermedades mentales y los asilos de alienados (1854)',
      href: 'units/unidad-01.html',
      clases: ['c01', 'c02', 'c03'],
      estado: 'listo'
    },
    {
      numero: 2,
      titulo: 'El síntoma y la histeria',
      resumen: 'El mecanismo y el primer caso. Cómo se forma un síntoma, y cómo se lee un ' +
               'historial clínico cuando el síntoma deja de ser un signo de enfermedad para ' +
               'volverse una formación con sentido.',
      href: 'units/unidad-02.html',
      clases: ['c04', 'c05'],
      estado: 'pendiente'
    },
    {
      numero: 3,
      titulo: 'Obsesión y fobia',
      resumen: 'El método de lectura aprendido con Dora, aplicado dos veces más: al Hombre ' +
               'de las Ratas y a Juanito. Las reformulaciones de los años veinte ya no ' +
               'ocupan una clase propia: se leen dentro de cada caso.',
      href: 'units/unidad-03.html',
      clases: ['c06', 'c07'],
      estado: 'pendiente'
    },
    {
      numero: 4,
      titulo: 'Las psicosis y el cierre del recorrido',
      resumen: 'De la paranoia de la psiquiatría clásica al Schreber de Freud. La clase final ' +
               'formula juntas las dos series, neurosis y psicosis, y entra en el parcial.',
      href: 'units/unidad-04.html',
      clases: ['c08', 'c09'],
      estado: 'pendiente'
    }
  ];

  /* ========================================================================
     CRONOGRAMA
     ======================================================================== */
  const PROGRAMA = [
    {
      id: 'c01', tipo: 'clase', unidad: 1, numero: 1, estado: 'listo',
      fecha: { año: 2026, mes: 8, dia: 10 },
      titulo: 'El campo de la psicopatología, normalidad y salud mental',
      desc: 'De qué habla la psicopatología, en qué se diferencia de la clínica y qué ' +
            'hace la Ley de Salud Mental con la idea de normalidad.',
      href: 'units/clase-01.html',
      biblio: [
        { tier: 'C', cita: 'De Battista, J. (coord.) (2019). <em>Aportes interdisciplinarios en psicopatología</em>, tomo I. Presentación, pp. 13-17. EDULP.' },
        { tier: 'F', cita: 'Argentina (2010). Ley Nacional de Salud Mental N.º 26.657, artículo 3.' }
      ]
    },
    {
      id: 'h01', tipo: 'feriado',
      fecha: { año: 2026, mes: 8, dia: 17 },
      titulo: 'Feriado nacional · Sin clase',
      desc: 'Paso a la Inmortalidad del General José de San Martín.'
    },
    {
      id: 'c02', tipo: 'clase', unidad: 1, numero: 2, estado: 'listo',
      fecha: { año: 2026, mes: 8, dia: 24 },
      titulo: 'Historia y paradigmas de la psiquiatría',
      desc: 'Falret, Kraepelin y Bleuler: los tres movimientos que construyen el problema ' +
            'clínico que Freud va a recibir.',
      href: 'units/clase-02.html',
      nota: 'Semana de la Investigación: se dicta clase, pero no se programa evaluación.',
      biblio: [
        { tier: 'C', cita: 'De Battista, J. (coord.) (2019). <em>Aportes interdisciplinarios en psicopatología</em>, tomo I. Capítulo 3: Una periodización posible, pp. 39-56. EDULP.' },
        { tier: 'F', cita: 'Falret, J.-P. (1854/2002). <em>Las enfermedades mentales y los asilos de alienados</em>. Introducción, selección pp. 15-18. De la Campana.' },
        // Corrección bibliográfica: el prólogo de la edición argentina no es de
        // Kraepelin, sino de sus traductores y editores.
        { tier: 'F', cita: 'Carbone, N. y Piazze, G. (2005). Prólogo. En E. Kraepelin, <em>Dementia praecox y paranoia</em> (pp. 3-8). La Plata: De la Campana.' },
        { tier: 'F', cita: 'Bleuler, E. (1911/1993). <em>Demencia precoz: el grupo de las esquizofrenias</em>. Prefacio del autor e Introducción general, pp. 7-13. Hormé.' },
        { tier: 'A', cita: 'Godoy, C. (2013). La psicopatología: de la psiquiatría al psicoanálisis. En F. Schejtman (comp.), <em>Psicopatología: clínica y ética</em>. Grama.' }
      ]
    },
    {
      id: 'c03', tipo: 'clase', unidad: 1, numero: 3, estado: 'listo',
      fecha: { año: 2026, mes: 8, dia: 31 },
      titulo: 'Jaspers y el método psicopatológico',
      desc: 'Comprender y explicar. El binomio metodológico que organiza la clínica, y la ' +
            'respuesta de Freud desde el otro lado.',
      href: 'units/clase-03.html',
      biblio: [
        { tier: 'C', cita: 'Jaspers, K. (1913/1966). <em>Psicopatología general</em>. Introducción, § 3: Prejuicios y presuposiciones, pp. 31-35. Beta.' },
        { tier: 'F', cita: 'Freud, S. (1916-1917). 16.ª conferencia: Psicoanálisis y psiquiatría. Texto completo. <em>Obras completas</em>, tomo XVI. Amorrortu.' },
        { tier: 'F', cita: 'De Battista, J. (coord.) (2019). <em>Aportes interdisciplinarios en psicopatología</em>, tomo I. Capítulo 6, selección: Binomio metodológico y organización de la clínica, pp. 85-91. EDULP.' },
        { tier: 'F', cita: 'Freud, S. (1916-1917). 17.ª conferencia: El sentido de los síntomas. Texto completo. <em>Obras completas</em>, tomo XVI. Amorrortu.' }
      ]
    },
    {
      id: 'c04', tipo: 'clase', unidad: 2, numero: 4, estado: 'listo',
      fecha: { año: 2026, mes: 9, dia: 7 },
      titulo: 'Síntoma, defensa y etiología',
      desc: 'Los caminos de la formación de síntoma. Represión y etiología sexual.',
      href: 'units/clase-04.html',
      biblio: [
        { tier: 'C', cita: 'Freud, S. (1916-1917). 23.ª conferencia: Los caminos de la formación de síntoma. Texto completo. <em>Obras completas</em>, tomo XVI. Amorrortu.' },
        { tier: 'F', cita: 'Freud, S. (1915). La represión. Texto completo. <em>Obras completas</em>, tomo XIV. Amorrortu.' },
        { tier: 'F', cita: 'Freud, S. (1906). Mis tesis sobre el papel de la sexualidad en la etiología de las neurosis. Texto completo. <em>Obras completas</em>, tomo VII. Amorrortu.' },
        // Sostiene solo el concepto de estructura, que antes se introducia en la clase de
        // personalidad y diagnostico. Su guia de lectura tiene que cargar esa funcion.
        { tier: 'F', cita: 'Mazzuca, R. (2013). Los conceptos lacanianos en la enseñanza de la Psicopatología. Selección: pp. 301-304 y 310-312. En <em>Psicopatología: clínica y ética</em>. Grama.' }
      ]
    },
    {
      id: 'c05', tipo: 'clase', unidad: 2, numero: 5, estado: 'publicada',
      fecha: { año: 2026, mes: 9, dia: 14 },
      titulo: 'Histeria y Dora: síntoma, fantasía y transferencia',
      desc: 'El primer historial. Por qué el caso fracasa y qué inaugura ese fracaso.',
      href: 'units/clase-05.html',
      nota: 'Última clase antes del primer parcial. Cierra las unidades 1 y 2.',
      biblio: [
        { tier: 'C', cita: 'Freud, S. (1905 [1901]). Fragmento de análisis de un caso de histeria (Dora). Selección clínica y Epílogo. <em>Obras completas</em>, tomo VII. Amorrortu.' },
        { tier: 'F', cita: 'Charcot, J.-M. (1872-73). De la hístero-epilepsia. Lección XIII de <em>Leçons sur les maladies du système nerveux faites à la Salpêtrière</em>, tomo I. París: A. Delahaye. (Traducción de cátedra desde el original francés; es el texto que J. Saurí recoge en <em>Las histerias</em>, Nueva Visión, 1984).' },
        { tier: 'F', cita: 'Lacan, J. (1951). Intervención sobre la transferencia. En <em>Escritos 1</em>, pp. 204-209. Siglo XXI.' }
      ]
    },
    {
      id: 'h04', tipo: 'feriado',
      fecha: { año: 2026, mes: 9, dia: 21 },
      titulo: 'Día del Estudiante · Sin clase',
      desc: 'Sin actividad académica. La semana queda como repaso autónomo para el ' +
            'primer parcial, que se toma el lunes siguiente.'
    },
    {
      id: 'p01', tipo: 'parcial',
      fecha: { año: 2026, mes: 9, dia: 28 },
      titulo: 'Primer parcial',
      desc: 'Contenidos de las clases 1 a 5, es decir las unidades 1 y 2. En el horario ' +
            'de la cursada, de 8:30 a 10:30.',
      alcance: 'Unidades 1 y 2 · Clases 1 a 5'
    },
    {
      id: 'c06', tipo: 'clase', unidad: 3, numero: 6, estado: 'pendiente',
      fecha: { año: 2026, mes: 10, dia: 5 },
      titulo: 'Neurosis obsesiva: Hombre de las Ratas y los años veinte',
      desc: 'La duda, el aislamiento y el pensamiento como escenario del conflicto, y la ' +
            'reescritura freudiana del superyó y la culpa.',
      href: 'units/clase-06.html',
      nota: 'Devolución general del primer parcial al comienzo del encuentro.',
      biblio: [
        { id: 'freud-1909-ratas', tier: 'C', cita: 'Freud, S. (1909). A propósito de un caso de neurosis obsesiva (Hombre de las Ratas). Secciones F y G, pp. 154-172. <em>Obras completas</em>, tomo X. Amorrortu.' },
        { id: 'freud-1896-obsesion', tier: 'F', cita: 'Freud, S. (1896). Nuevas puntualizaciones sobre las neuropsicosis de defensa. Apartado sobre la neurosis obsesiva. <em>Obras completas</em>, tomo III. Amorrortu.' },
        { id: 'freud-1926-isa-v-vi', tier: 'F', cita: 'Freud, S. (1926). <em>Inhibición, síntoma y angustia</em>. Capítulos V y VI. <em>Obras completas</em>, tomo XX. Amorrortu.' },
        { id: 'lacan-s5-obsesivo', tier: 'A', cita: 'Lacan, J. (1957-1958/1999). <em>El Seminario, libro 5</em>. Capítulo XXIII: El obsesivo y su deseo. Paidós.' }
      ]
    },
    {
      id: 'h02', tipo: 'feriado',
      fecha: { año: 2026, mes: 10, dia: 12 },
      titulo: 'Feriado nacional · Sin clase',
      desc: 'Día del Respeto a la Diversidad Cultural. Coincide con la semana de las ' +
            'IV Jornadas de Salud Mental; no se programa evaluación.'
    },
    {
      id: 'c07', tipo: 'clase', unidad: 3, numero: 7, estado: 'pendiente',
      fecha: { año: 2026, mes: 10, dia: 19 },
      titulo: 'Fobia, angustia y caso Juanito',
      desc: 'La fobia como intento de tratamiento de la angustia, y la angustia señal ' +
            'leída en contrapunto con la obsesión.',
      href: 'units/clase-07.html',
      biblio: [
        { id: 'freud-1909-juanito', tier: 'C', cita: 'Freud, S. (1909). Análisis de la fobia de un niño de cinco años (Juanito). Sección III: Epicrisis, pp. 84-118. <em>Obras completas</em>, tomo X. Amorrortu.' },
        { id: 'freud-1926-isa-iv-vii-viii', tier: 'F', cita: 'Freud, S. (1926). <em>Inhibición, síntoma y angustia</em>. Capítulos IV, VII y VIII. <em>Obras completas</em>, tomo XX. Amorrortu.' },
        { id: 'lacan-s4-significante-real', tier: 'F', cita: 'Lacan, J. (1956-1957/1994). <em>El Seminario, libro 4</em>. Capítulo XIV: El significante en lo real. Paidós.' },
        { id: 'freud-1895-obsesiones-fobias', tier: 'A', cita: 'Freud, S. (1895). Obsesiones y fobias. Texto completo. <em>Obras completas</em>, tomo III. Amorrortu.' }
      ]
    },
    {
      id: 'c08', tipo: 'clase', unidad: 4, numero: 8, estado: 'pendiente',
      fecha: { año: 2026, mes: 10, dia: 26 },
      titulo: 'Construcción histórica y freudiana de la psicosis',
      desc: 'De la paranoia de Kraepelin a la defensa en las neuropsicosis, con el ' +
            'narcisismo como bisagra hacia Schreber.',
      href: 'units/clase-08.html',
      biblio: [
        { id: 'freud-1896-psicosis', tier: 'C', cita: 'Freud, S. (1896). Nuevas puntualizaciones sobre las neuropsicosis de defensa. Capítulo III. <em>Obras completas</em>, tomo III. Amorrortu.' },
        { id: 'kraepelin-paranoia', tier: 'F', cita: 'Kraepelin, E. Lección XV: Paranoia. En <em>Introducción a la clínica psiquiátrica</em>.' },
        { id: 'freud-1914-narcisismo', tier: 'F', cita: 'Freud, S. (1914). Introducción del narcisismo. Apartados I y II, pp. 71-88. <em>Obras completas</em>, tomo XIV. Amorrortu.' },
        { id: 'bercherie-psicosis', tier: 'A', cita: 'Bercherie, P. (1987). La constitución del concepto freudiano de psicosis. Siglo XXI.' }
      ]
    },
    {
      id: 'p02', tipo: 'parcial',
      fecha: { año: 2026, mes: 11, dia: 2 },
      titulo: 'Segundo parcial',
      desc: 'Contenidos de las clases 6 a 8: la unidad 3 completa y la construcción ' +
            'histórica y freudiana de la psicosis. En el horario de la cursada.',
      alcance: 'Unidades 3 y 4 · Clases 6 a 8'
    },
    {
      id: 'c09', tipo: 'clase', unidad: 4, numero: 9, estado: 'pendiente',
      fecha: { año: 2026, mes: 11, dia: 9 },
      titulo: 'Schreber, delirio y formulación integradora',
      desc: 'El delirio como intento de curación, y el cierre que formula juntas las dos ' +
            'series: neurosis y psicosis.',
      href: 'units/clase-09.html',
      nota: 'Clase de cierre. Se dicta después del segundo parcial y no se evalúa.',
      biblio: [
        { id: 'freud-1911-schreber', tier: 'C', cita: 'Freud, S. (1911). Puntualizaciones psicoanalíticas sobre un caso de paranoia (Schreber). Sección III: Acerca del mecanismo paranoico, pp. 55-73. <em>Obras completas</em>, tomo XII. Amorrortu.' },
        { id: 'schreber-memorias-i', tier: 'F', cita: 'Schreber, D. P. (1903/1979). <em>Memorias de un enfermo nervioso</em>. Capítulo I, pp. 63-72. Lohlé.' },
        // Textos gemelos de 1924: se publican consecutivos en el tomo XIX, se reparten
        // en un solo PDF y cuentan como una sola lectura.
        { id: 'freud-1924-realidad', tier: 'F', cita: 'Freud, S. (1924). Neurosis y psicosis <em>y</em> La pérdida de realidad en la neurosis y la psicosis. Textos completos. <em>Obras completas</em>, tomo XIX. Amorrortu.' },
        { id: 'lacan-s3-fenomeno', tier: 'A', cita: 'Lacan, J. (1955-1956/1984). <em>El Seminario, libro 3: Las psicosis</em>. Capítulo VI: El fenómeno psicótico y su mecanismo, pp. 107-128. Paidós.' }
      ]
    },
    {
      id: 'r01', tipo: 'recuperatorio',
      fecha: { año: 2026, mes: 11, dia: 16 },
      titulo: 'Recuperatorio único',
      desc: 'En el horario de la cursada. Permite recuperar cualquiera de los dos parciales ' +
            'mediante una versión equivalente. No incorpora bibliografía nueva. Es el ' +
            'último encuentro de la cursada.'
    },
    {
      id: 'h03', tipo: 'feriado',
      fecha: { año: 2026, mes: 11, dia: 23 },
      titulo: 'Feriado nacional · Cierre de la cursada',
      desc: 'Día de la Soberanía Nacional, trasladado del viernes 20 al lunes 23 según la ' +
            'Ley 27.399. Cae en la última semana del calendario lectivo, del 23 al 27 de ' +
            'noviembre.'
    },
  ];

  /* ========================================================================
     JERARQUÍA BIBLIOGRÁFICA
     ======================================================================== */
  const TIERS = {
    C: {
      sigla: 'C',
      nombre: 'Lectura central',
      desc: 'El texto que organiza la clase. Si sólo podés leer uno, es este.'
    },
    F: {
      sigla: 'F',
      nombre: 'Lectura obligatoria',
      desc: 'Acompaña al texto central. Se lee completa o en el rango indicado.'
    },
    A: {
      sigla: 'A',
      nombre: 'Apoyo',
      desc: 'Complementario. No se evalúa; sirve si querés ir más lejos.'
    }
  };

  return { CONFIG, UNIDADES, PROGRAMA, TIERS };
})();
