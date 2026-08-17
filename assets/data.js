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
               'de las Ratas y a Juanito, con las reformulaciones que Freud hace en los ' +
               'años veinte en el medio.',
      href: null,
      clases: ['c06', 'c07', 'c08'],
      estado: 'pendiente'
    },
    {
      numero: 4,
      titulo: 'Las psicosis y el cierre del recorrido',
      resumen: 'De la paranoia de la psiquiatría clásica al Schreber de Freud, y el intento ' +
               'final de formular juntas las dos series: neurosis y psicosis.',
      href: null,
      clases: ['c09', 'c10', 'c11'],
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
        { tier: 'F', cita: 'Freud, S. (1916-1917). 16.ª conferencia: Psicoanálisis y psiquiatría. <em>Obras completas</em>, tomo XVI. Amorrortu.' },
        { tier: 'F', cita: 'De Battista, J. (coord.) (2019). <em>Aportes interdisciplinarios en psicopatología</em>, tomo I. Capítulo 6, selección: Binomio metodológico y organización de la clínica, pp. 85-91. EDULP.' },
        { tier: 'A', cita: 'Freud, S. (1916-1917). 17.ª conferencia: El sentido de los síntomas. <em>Obras completas</em>, tomo XVI. Amorrortu.' }
      ]
    },
    {
      id: 'c04', tipo: 'clase', unidad: 2, numero: 4, estado: 'pendiente',
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
      id: 'c05', tipo: 'clase', unidad: 2, numero: 5, estado: 'pendiente',
      fecha: { año: 2026, mes: 9, dia: 14 },
      titulo: 'Histeria y Dora: síntoma, fantasía y transferencia',
      desc: 'El primer historial. Por qué el caso fracasa y qué inaugura ese fracaso.',
      href: 'units/clase-05.html',
      biblio: [
        { tier: 'C', cita: 'Freud, S. (1905 [1901]). Fragmento de análisis de un caso de histeria (Dora). Selección clínica y Epílogo. <em>Obras completas</em>, tomo VII. Amorrortu.' },
        { tier: 'F', cita: 'Charcot, J.-M. (1984). Acerca de la histeroepilepsia. En J. Saurí (comp.), <em>Las histerias</em>. Nueva Visión.' },
        { tier: 'F', cita: 'Lacan, J. (1951). Intervención sobre la transferencia. En <em>Escritos 1</em>, pp. 204-209. Siglo XXI.' }
      ]
    },
    {
      id: 'p01', tipo: 'parcial',
      fecha: { año: 2026, mes: 9, dia: 21 },
      titulo: 'Primer parcial',
      desc: 'Contenidos de las clases 1 a 5, es decir las unidades 1 y 2. En el horario ' +
            'de la cursada, de 8:30 a 10:30.',
      alcance: 'Unidades 1 y 2 · Clases 1 a 5'
    },
    {
      id: 'c06', tipo: 'clase', unidad: 3, numero: 6, estado: 'pendiente',
      fecha: { año: 2026, mes: 9, dia: 28 },
      titulo: 'Neurosis obsesiva y Hombre de las Ratas',
      desc: 'La duda, el aislamiento y el pensamiento como escenario del conflicto.',
      href: null,
      nota: 'Devolución general del primer parcial al comienzo del encuentro.',
      biblio: [
        { tier: 'C', cita: 'Freud, S. (1909). A propósito de un caso de neurosis obsesiva (Hombre de las Ratas). <em>Obras completas</em>, tomo X. Amorrortu.' },
        { tier: 'F', cita: 'Legrand du Saulle, J. (1875/1985). La locura de la duda con delirio del tacto. En J. Saurí (comp.), <em>Las obsesiones</em>. Nueva Visión.' },
        { tier: 'F', cita: 'Lacan, J. (1957-1958/1999). <em>El Seminario, libro 5</em>. Capítulo XXIII: El obsesivo y su deseo. Paidós.' }
      ]
    },
    {
      id: 'c07', tipo: 'clase', unidad: 3, numero: 7, estado: 'pendiente',
      fecha: { año: 2026, mes: 10, dia: 5 },
      titulo: 'Neurosis obsesiva: las reformulaciones de los años veinte',
      desc: 'Angustia señal, superyó y culpa. Freud reescribe lo que había dicho.',
      href: null,
      biblio: [
        { tier: 'C', cita: 'Freud, S. (1926). <em>Inhibición, síntoma y angustia</em>. Capítulos V y VI. <em>Obras completas</em>, tomo XX. Amorrortu.' },
        { tier: 'F', cita: 'Freud, S. (1923). El yo y el ello. Capítulo V: Los vasallajes del yo. <em>Obras completas</em>, tomo XIX. Amorrortu.' },
        { tier: 'F', cita: 'Freud, S. (1924). El problema económico del masoquismo. <em>Obras completas</em>, tomo XIX. Amorrortu.' }
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
      id: 'c08', tipo: 'clase', unidad: 3, numero: 8, estado: 'pendiente',
      fecha: { año: 2026, mes: 10, dia: 19 },
      titulo: 'Fobia, angustia y caso Juanito',
      desc: 'La fobia como intento de tratamiento de la angustia.',
      href: null,
      biblio: [
        { tier: 'C', cita: 'Freud, S. (1909). Análisis de la fobia de un niño de cinco años (Juanito). <em>Obras completas</em>, tomo X. Amorrortu.' },
        { tier: 'F', cita: 'Freud, S. (1926). <em>Inhibición, síntoma y angustia</em>. Capítulos IV, VII y VIII. <em>Obras completas</em>, tomo XX. Amorrortu.' },
        { tier: 'F', cita: 'Lacan, J. (1956-1957/1994). <em>El Seminario, libro 4</em>. Capítulo XIV: El significante en lo real. Paidós.' }
      ]
    },
    {
      id: 'c09', tipo: 'clase', unidad: 4, numero: 9, estado: 'pendiente',
      fecha: { año: 2026, mes: 10, dia: 26 },
      titulo: 'Construcción histórica y freudiana de la psicosis',
      desc: 'De la paranoia de Kraepelin a la defensa en las neuropsicosis.',
      href: null,
      biblio: [
        { tier: 'C', cita: 'Freud, S. (1896). Nuevas puntualizaciones sobre las neuropsicosis de defensa. Capítulo III. <em>Obras completas</em>, tomo III. Amorrortu.' },
        { tier: 'F', cita: 'Kraepelin, E. Lección XV: Paranoia. En <em>Introducción a la clínica psiquiátrica</em>.' },
        { tier: 'F', cita: 'Bercherie, P. (1987). La construcción del concepto freudiano de psicosis. Siglo XXI.' }
      ]
    },
    {
      id: 'c10', tipo: 'clase', unidad: 4, numero: 10, estado: 'pendiente',
      fecha: { año: 2026, mes: 11, dia: 2 },
      titulo: 'Schreber, narcisismo y reconstrucción delirante',
      desc: 'El delirio como intento de curación, no como el núcleo de la enfermedad.',
      href: null,
      biblio: [
        { tier: 'C', cita: 'Freud, S. (1911). Puntualizaciones psicoanalíticas sobre un caso de paranoia (Schreber). <em>Obras completas</em>, tomo XII. Amorrortu.' },
        { tier: 'F', cita: 'Freud, S. (1914). Introducción del narcisismo. <em>Obras completas</em>, tomo XIV. Amorrortu.' },
        { tier: 'F', cita: 'Schreber, D. P. (1903/1979). <em>Memorias de un enfermo nervioso</em>. Fragmentos. Lohlé.' },
        { tier: 'F', cita: 'Lacan, J. (1955-1956/1984). <em>El Seminario, libro 3</em>. Capítulo IV, apartado 3. Paidós.' }
      ]
    },
    {
      id: 'p02', tipo: 'parcial',
      fecha: { año: 2026, mes: 11, dia: 9 },
      titulo: 'Segundo parcial',
      desc: 'Contenidos de las clases 6 a 10, es decir la unidad 3 y la unidad 4 hasta ' +
            'Schreber. En el horario de la cursada. La Clase 11 queda fuera: es de integración.',
      alcance: 'Unidades 3 y 4 · Clases 6 a 10'
    },
    {
      id: 'c11', tipo: 'clase', unidad: 4, numero: 11, estado: 'pendiente',
      fecha: { año: 2026, mes: 11, dia: 16 },
      titulo: 'Neurosis, psicosis y formulación integradora',
      desc: 'Cierre integrador. Qué separa y qué reúne a las dos series.',
      href: null,
      nota: 'Clase de integración. Se dicta después del segundo parcial y no se evalúa.',
      biblio: [
        { tier: 'C', cita: 'Freud, S. (1924). Neurosis y psicosis. Texto completo. <em>Obras completas</em>, tomo XIX. Amorrortu.' },
        { tier: 'F', cita: 'Freud, S. (1924). La pérdida de realidad en la neurosis y la psicosis. <em>Obras completas</em>, tomo XIX. Amorrortu.' },
        { tier: 'F', cita: 'Freud, S. (1917 [1915]). Duelo y melancolía. <em>Obras completas</em>, tomo XIV. Amorrortu.' }
      ]
    },
    {
      id: 'h03', tipo: 'feriado',
      fecha: { año: 2026, mes: 11, dia: 23 },
      titulo: 'Feriado nacional · Sin clase',
      desc: 'Día de la Soberanía Nacional, trasladado del viernes 20 al lunes 23 según la ' +
            'Ley 27.399.'
    },
    {
      id: 'r01', tipo: 'recuperatorio',
      fecha: { año: 2026, mes: 11, dia: 30 },
      titulo: 'Recuperatorio único',
      desc: 'En el horario de la cursada. Permite recuperar cualquiera de los dos parciales ' +
            'mediante una versión equivalente. No incorpora bibliografía nueva.'
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
      nombre: 'Fragmento guiado',
      desc: 'Obligatorio, pero acotado: se lee sólo el rango indicado y con una consigna.'
    },
    A: {
      sigla: 'A',
      nombre: 'Apoyo',
      desc: 'Complementario. No se evalúa; sirve si querés ir más lejos.'
    }
  };

  return { CONFIG, UNIDADES, PROGRAMA, TIERS };
})();
