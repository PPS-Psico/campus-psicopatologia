const INTERNAL_DEMO_KEY = "psicopato-exam-demo-v2";

const ANSWER_KEY = Object.freeze({
  "a1111111-1111-4111-8111-111111111111": "b1111111-1111-4111-8111-111111111111",
  "a2222222-2222-4222-8222-222222222222": "c2222222-2222-4222-8222-222222222222",
  "a3333333-3333-4333-8333-333333333333": "d3333333-3333-4333-8333-333333333333",
  "a4444444-4444-4444-8444-444444444444": "e4444444-4444-4444-8444-444444444444",
  "a5555555-5555-4555-8555-555555555555": "f2222222-2222-4222-8222-222222222222",
  "a6666666-6666-4666-8666-666666666666": "63333333-3333-4333-8333-333333333333",
  "a7777777-7777-4777-8777-777777777777": "71111111-1111-4111-8111-111111111111",
  "a8888888-8888-4888-8888-888888888888": "84444444-4444-4444-8444-444444444444",
  "a9999999-9999-4999-8999-999999999999": "92222222-2222-4222-8222-222222222222",
  "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa": "a0333333-3333-4333-8333-333333333333",
  "b0000000-0000-4000-8000-000000000011": "c0000000-0000-4000-8000-000000000112",
  "b0000000-0000-4000-8000-000000000012": "c0000000-0000-4000-8000-000000000123",
  "b0000000-0000-4000-8000-000000000013": "c0000000-0000-4000-8000-000000000131",
  "b0000000-0000-4000-8000-000000000014": "c0000000-0000-4000-8000-000000000144",
  "b0000000-0000-4000-8000-000000000015": "c0000000-0000-4000-8000-000000000152",
  "b0000000-0000-4000-8000-000000000016": "c0000000-0000-4000-8000-000000000161",
  "b0000000-0000-4000-8000-000000000017": "c0000000-0000-4000-8000-000000000173",
  "b0000000-0000-4000-8000-000000000018": "c0000000-0000-4000-8000-000000000184",
  "b0000000-0000-4000-8000-000000000019": "c0000000-0000-4000-8000-000000000192",
  "b0000000-0000-4000-8000-000000000020": "c0000000-0000-4000-8000-000000000201",
});

const ITEMS = [
  {
    id: "a1111111-1111-4111-8111-111111111111",
    position: 1,
    section: "Clase 3",
    kind: "single_choice",
    prompt: "¿Cómo distingue Jaspers la psicopatología de la psiquiatría?",
    points: 1,
    options: [
      { id: "b1111111-1111-4111-8111-111111111111", label: "La psicopatología es una ciencia teórica; la psiquiatría, una profesión práctica orientada al individuo" },
      { id: "b2222222-2222-4222-8222-222222222222", label: "La psicopatología se ocupa sólo del cerebro; la psiquiatría, sólo de la conducta" },
      { id: "b3333333-3333-4333-8333-333333333333", label: "La psicopatología trata pacientes; la psiquiatría produce conceptos generales" },
      { id: "b4444444-4444-4444-8444-444444444444", label: "No establece ninguna diferencia entre ambas" },
    ],
    response: null,
  },
  {
    id: "a2222222-2222-4222-8222-222222222222",
    position: 2,
    section: "Clase 3",
    kind: "single_choice",
    prompt: "En el binomio metodológico de Jaspers, comprender significa:",
    points: 1,
    options: [
      { id: "c1111111-1111-4111-8111-111111111111", label: "Buscar exclusivamente la lesión cerebral que causa una conducta" },
      { id: "c2222222-2222-4222-8222-222222222222", label: "Captar desde dentro cómo una vivencia se enlaza con otra en una relación de sentido" },
      { id: "c3333333-3333-4333-8333-333333333333", label: "Clasificar síntomas sin atender a la experiencia del paciente" },
      { id: "c4444444-4444-4444-8444-444444444444", label: "Aplicar una regla estadística sin reconstruir conexiones" },
    ],
    response: null,
  },
  {
    id: "a3333333-3333-4333-8333-333333333333",
    position: 3,
    section: "Clase 3",
    kind: "single_choice",
    prompt: "¿Qué operación designa explicar para Jaspers?",
    points: 1,
    options: [
      { id: "d1111111-1111-4111-8111-111111111111", label: "Reproducir afectivamente la experiencia del paciente" },
      { id: "d2222222-2222-4222-8222-222222222222", label: "Encontrar un sentido consciente en toda vivencia sin excepción" },
      { id: "d3333333-3333-4333-8333-333333333333", label: "Suponer reglas causales, como en las ciencias naturales, para lo que resiste a la comprensión" },
      { id: "d4444444-4444-4444-8444-444444444444", label: "Suspender cualquier pregunta por la causalidad" },
    ],
    response: null,
  },
  {
    id: "a4444444-4444-4444-8444-444444444444",
    position: 4,
    section: "Clase 3",
    kind: "single_choice",
    prompt: "¿Cuál de estas descripciones corresponde a un desarrollo?",
    points: 1,
    options: [
      { id: "e1111111-1111-4111-8111-111111111111", label: "Una lista de síntomas sin continuidad biográfica" },
      { id: "e2222222-2222-4222-8222-222222222222", label: "Una irrupción acotada que transforma irreversiblemente la personalidad previa" },
      { id: "e3333333-3333-4333-8333-333333333333", label: "Una lesión anatómica demostrable que explica por sí sola el cuadro" },
      { id: "e4444444-4444-4444-8444-444444444444", label: "Una cadena de relaciones de sentido que, a lo largo de una biografía, constituye una personalidad" },
    ],
    response: null,
  },
  {
    id: "a5555555-5555-4555-8555-555555555555",
    position: 5,
    section: "Clase 3",
    kind: "single_choice",
    prompt: "¿Qué caracteriza a un proceso en la organización clínica jaspersiana?",
    points: 1,
    options: [
      { id: "f1111111-1111-4111-8111-111111111111", label: "Mantiene una continuidad completa de sentido durante toda la biografía" },
      { id: "f2222222-2222-4222-8222-222222222222", label: "Irrumpe en un tiempo acotado e introduce una transformación irreversible en la personalidad" },
      { id: "f3333333-3333-4333-8333-333333333333", label: "Sólo puede estudiarse mediante la comprensión y nunca mediante la explicación" },
      { id: "f4444444-4444-4444-8444-444444444444", label: "Es equivalente a cualquier cambio de opinión consciente" },
    ],
    response: null,
  },
  {
    id: "a6666666-6666-4666-8666-666666666666",
    position: 6,
    section: "Clase 3",
    kind: "single_choice",
    prompt: "¿Qué llama Jaspers un prejuicio?",
    points: 1,
    options: [
      { id: "61111111-1111-4111-8111-111111111111", label: "Una emoción intensa del observador" },
      { id: "62222222-2222-4222-8222-222222222222", label: "Cualquier afirmación que luego resulta falsa" },
      { id: "63333333-3333-4333-8333-333333333333", label: "Un procedimiento que dejó de ser consciente de sí mismo" },
      { id: "64444444-4444-4444-8444-444444444444", label: "Toda hipótesis formulada antes de una entrevista" },
    ],
    response: null,
  },
  {
    id: "a7777777-7777-4777-8777-777777777777",
    position: 7,
    section: "Clase 3",
    kind: "single_choice",
    prompt: "¿Cuál es el riesgo del prejuicio psicológico señalado por Jaspers?",
    points: 1,
    options: [
      { id: "71111111-1111-4111-8111-111111111111", label: "Querer comprender todo y perder el sentido crítico de los límites de lo comprensible" },
      { id: "72222222-2222-4222-8222-222222222222", label: "Explicar demasiado y abandonar por completo la empatía" },
      { id: "73333333-3333-4333-8333-333333333333", label: "Confundir una profesión práctica con una ciencia teórica" },
      { id: "74444444-4444-4444-8444-444444444444", label: "Negar que existan vivencias conscientes" },
    ],
    response: null,
  },
  {
    id: "a8888888-8888-4888-8888-888888888888",
    position: 8,
    section: "Clase 3",
    kind: "single_choice",
    prompt: "¿Qué exige el programa de imparcialidad fenomenológica de Jaspers?",
    points: 1,
    options: [
      { id: "81111111-1111-4111-8111-111111111111", label: "Aceptar como verdadera toda interpretación afectiva del clínico" },
      { id: "82222222-2222-4222-8222-222222222222", label: "Elegir de antemano una única teoría causal y aplicarla a todos los casos" },
      { id: "83333333-3333-4333-8333-333333333333", label: "Renunciar a describir la experiencia del paciente" },
      { id: "84444444-4444-4444-8444-444444444444", label: "Poner en suspenso hipótesis y construcciones para atender al hecho tal como aparece en la experiencia" },
    ],
    response: null,
  },
  {
    id: "a9999999-9999-4999-8999-999999999999",
    position: 9,
    section: "Clase 3",
    kind: "single_choice",
    prompt: "En la 16.ª conferencia, ¿dónde ubica Freud la diferencia principal entre psiquiatría y psicoanálisis?",
    points: 1,
    options: [
      { id: "91111111-1111-4111-8111-111111111111", label: "La psiquiatría atiende el malestar; el psicoanálisis no lo considera" },
      { id: "92222222-2222-4222-8222-222222222222", label: "La psiquiatría clasifica la forma del síntoma; el psicoanálisis interroga su contenido" },
      { id: "93333333-3333-4333-8333-333333333333", label: "El psicoanálisis reemplaza el diagnóstico por una explicación neurológica" },
      { id: "94444444-4444-4444-8444-444444444444", label: "La psiquiatría estudia casos; el psicoanálisis sólo formula argumentos abstractos" },
    ],
    response: null,
  },
  {
    id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    position: 10,
    section: "Clase 3",
    kind: "single_choice",
    prompt: "¿En qué punto se separan Jaspers y Freud respecto del campo psíquico?",
    points: 1,
    options: [
      { id: "a0111111-1111-4111-8111-111111111111", label: "Jaspers estudia sólo individuos; Freud estudia exclusivamente conceptos generales" },
      { id: "a0222222-2222-4222-8222-222222222222", label: "Jaspers reduce lo psíquico al cerebro; Freud rechaza toda causalidad" },
      { id: "a0333333-3333-4333-8333-333333333333", label: "Jaspers limita su objeto hasta las fronteras de la conciencia; Freud sostiene que lo consciente es una cualidad contingente de lo psíquico" },
      { id: "a0444444-4444-4444-8444-444444444444", label: "No existe una diferencia metodológica entre ambos" },
    ],
    response: null,
  },
  {
    id: "b0000000-0000-4000-8000-000000000011",
    position: 11,
    section: "Clase 4",
    kind: "single_choice",
    prompt: "Según la 23.ª conferencia, ¿por qué el síntoma neurótico puede resultar tan resistente?",
    points: 1,
    options: [
      { id: "c0000000-0000-4000-8000-000000000111", label: "Porque elimina por completo el conflicto que le dio origen" },
      { id: "c0000000-0000-4000-8000-000000000112", label: "Porque las dos fuerzas enfrentadas encuentran en él una formación de compromiso" },
      { id: "c0000000-0000-4000-8000-000000000113", label: "Porque conserva sin cambios la satisfacción que la realidad permitió" },
      { id: "c0000000-0000-4000-8000-000000000114", label: "Porque su forma visible permite reconocer inmediatamente su causa" },
    ],
    response: null,
  },
  {
    id: "b0000000-0000-4000-8000-000000000012",
    position: 12,
    section: "Clase 4",
    kind: "single_choice",
    prompt: "¿Qué recorrido sigue la libido cuando la satisfacción queda frustrada, según la 23.ª conferencia?",
    points: 1,
    options: [
      { id: "c0000000-0000-4000-8000-000000000121", label: "Abandona toda búsqueda de satisfacción y queda sin investidura" },
      { id: "c0000000-0000-4000-8000-000000000122", label: "Se dirige de manera inmediata desde la realidad hacia el síntoma" },
      { id: "c0000000-0000-4000-8000-000000000123", label: "Se introversa hacia las fantasías y desde allí regresa a puntos de fijación" },
      { id: "c0000000-0000-4000-8000-000000000124", label: "Se transforma primero en conciencia moral y después en recuerdo" },
    ],
    response: null,
  },
  {
    id: "b0000000-0000-4000-8000-000000000013",
    position: 13,
    section: "Clase 4",
    kind: "single_choice",
    prompt: "¿Cómo organiza Freud la causación en las series complementarias?",
    points: 1,
    options: [
      { id: "c0000000-0000-4000-8000-000000000131", label: "Articula predisposición por fijación, vivenciar accidental y magnitud cuantitativa" },
      { id: "c0000000-0000-4000-8000-000000000132", label: "Elige entre una causa hereditaria o una causa ambiental excluyente" },
      { id: "c0000000-0000-4000-8000-000000000133", label: "Reduce cada neurosis a un único acontecimiento sexual infantil" },
      { id: "c0000000-0000-4000-8000-000000000134", label: "Ordena los síntomas según su gravedad sin formular una etiología" },
    ],
    response: null,
  },
  {
    id: "b0000000-0000-4000-8000-000000000014",
    position: 14,
    section: "Clase 4",
    kind: "single_choice",
    prompt: "¿Qué debe agregarse a la frustración y a la regresión para que se forme una neurosis?",
    points: 1,
    options: [
      { id: "c0000000-0000-4000-8000-000000000141", label: "Una lesión orgánica que confirme la enfermedad" },
      { id: "c0000000-0000-4000-8000-000000000142", label: "Una explicación consciente aceptada por el paciente" },
      { id: "c0000000-0000-4000-8000-000000000143", label: "Una clasificación previa entre neurosis y psicosis" },
      { id: "c0000000-0000-4000-8000-000000000144", label: "Un conflicto entre la satisfacción buscada y las exigencias del yo" },
    ],
    response: null,
  },
  {
    id: "b0000000-0000-4000-8000-000000000015",
    position: 15,
    section: "Clase 4",
    kind: "single_choice",
    prompt: "En «La represión», ¿qué condición explica que una moción pulsional sea reprimida?",
    points: 1,
    options: [
      { id: "c0000000-0000-4000-8000-000000000151", label: "Que la satisfacción pulsional sea siempre displacentera por sí misma" },
      { id: "c0000000-0000-4000-8000-000000000152", label: "Que la satisfacción produzca más displacer por ser inconciliable con otras exigencias" },
      { id: "c0000000-0000-4000-8000-000000000153", label: "Que la representación haya perdido previamente todo monto de afecto" },
      { id: "c0000000-0000-4000-8000-000000000154", label: "Que el sujeto conozca la causa y decida mantenerla fuera de la conciencia" },
    ],
    response: null,
  },
  {
    id: "b0000000-0000-4000-8000-000000000016",
    position: 16,
    section: "Clase 4",
    kind: "single_choice",
    prompt: "¿Qué distingue a la represión primordial de la represión propiamente dicha?",
    points: 1,
    options: [
      { id: "c0000000-0000-4000-8000-000000000161", label: "La primordial funda un núcleo fijado; la segunda recae sobre sus retoños" },
      { id: "c0000000-0000-4000-8000-000000000162", label: "La primordial forma síntomas; la segunda los elimina de manera definitiva" },
      { id: "c0000000-0000-4000-8000-000000000163", label: "La primordial actúa sólo en adultos; la segunda pertenece a la infancia" },
      { id: "c0000000-0000-4000-8000-000000000164", label: "La primordial afecta el monto; la segunda afecta únicamente la conducta" },
    ],
    response: null,
  },
  {
    id: "b0000000-0000-4000-8000-000000000017",
    position: 17,
    section: "Clase 4",
    kind: "single_choice",
    prompt: "¿Qué obliga a estudiar por separado la representación y el monto de afecto?",
    points: 1,
    options: [
      { id: "c0000000-0000-4000-8000-000000000171", label: "Que ambos desaparecen siempre de manera simultánea después de la represión" },
      { id: "c0000000-0000-4000-8000-000000000172", label: "Que sólo el afecto puede permanecer activo dentro del inconsciente" },
      { id: "c0000000-0000-4000-8000-000000000173", label: "Que la representación es rechazada y el afecto puede seguir destinos diferentes" },
      { id: "c0000000-0000-4000-8000-000000000174", label: "Que la representación pertenece al cuerpo y el afecto a la conciencia" },
    ],
    response: null,
  },
  {
    id: "b0000000-0000-4000-8000-000000000018",
    position: 18,
    section: "Clase 4",
    kind: "single_choice",
    prompt: "¿Cómo se relacionan formación sustitutiva y formación de síntoma?",
    points: 1,
    options: [
      { id: "c0000000-0000-4000-8000-000000000181", label: "Son dos nombres equivalentes para cualquier resultado de la represión" },
      { id: "c0000000-0000-4000-8000-000000000182", label: "La formación de síntoma ocurre primero y la sustitución siempre después" },
      { id: "c0000000-0000-4000-8000-000000000183", label: "La formación sustitutiva sólo existe cuando no interviene la represión" },
      { id: "c0000000-0000-4000-8000-000000000184", label: "Todo síntoma es sustitutivo, pero no toda formación sustitutiva constituye un síntoma" },
    ],
    response: null,
  },
  {
    id: "b0000000-0000-4000-8000-000000000019",
    position: 19,
    section: "Clase 4",
    kind: "single_choice",
    prompt: "En «Mis tesis sobre el papel de la sexualidad…», ¿qué corrige Freud de su teoría anterior?",
    points: 1,
    options: [
      { id: "c0000000-0000-4000-8000-000000000191", label: "Abandona por completo la sexualidad infantil como problema etiológico" },
      { id: "c0000000-0000-4000-8000-000000000192", label: "Deja de considerar universal la seducción real y reconoce el papel de la fantasía" },
      { id: "c0000000-0000-4000-8000-000000000193", label: "Sustituye el mecanismo psíquico por una explicación exclusivamente hereditaria" },
      { id: "c0000000-0000-4000-8000-000000000194", label: "Rechaza que las vivencias accidentales participen en la serie causal" },
    ],
    response: null,
  },
  {
    id: "b0000000-0000-4000-8000-000000000020",
    position: 20,
    section: "Clase 4",
    kind: "single_choice",
    prompt: "Según Mazzuca, ¿cómo debe entenderse la tripartición neurosis, psicosis y perversión?",
    points: 1,
    options: [
      { id: "c0000000-0000-4000-8000-000000000201", label: "Como una sistematización lacaniana construida a partir de oposiciones presentes en Freud" },
      { id: "c0000000-0000-4000-8000-000000000202", label: "Como una clasificación explícita e invariable formulada por Freud desde sus primeros textos" },
      { id: "c0000000-0000-4000-8000-000000000203", label: "Como un conjunto de diagnósticos descriptivos aplicable por igual en cualquier orientación" },
      { id: "c0000000-0000-4000-8000-000000000204", label: "Como tres grados sucesivos de gravedad dentro de una única enfermedad" },
    ],
    response: null,
  },
];

export const DEMO_ITEMS = ITEMS;
export const DEMO_ANSWER_KEY = ANSWER_KEY;

function delay(ms = 180) { return new Promise((resolve) => setTimeout(resolve, ms)); }

export function buildDemoDefinition(practiceClass = null) {
  const normalizedClass = ["3", "4"].includes(String(practiceClass))
    ? String(practiceClass)
    : null;
  if (normalizedClass === "3") {
    return {
      storageKey: "psicopato-practice-clase-3-v1",
      title: "Práctica para el parcial · Clase 3",
      instructions: "Respondé diez preguntas sobre Jaspers, el método psicopatológico y la discusión con Freud. Podés repetir esta práctica y revisar las respuestas al finalizar.",
      durationMinutes: 20,
      items: ITEMS.filter((item) => item.section === "Clase 3"),
    };
  }
  if (normalizedClass === "4") {
    return {
      storageKey: "psicopato-practice-clase-4-v1",
      title: "Práctica para el parcial · Clase 4",
      instructions: "Respondé diez preguntas sobre formación de síntoma, represión y etiología. Podés repetir esta práctica y revisar las respuestas al finalizar.",
      durationMinutes: 20,
      items: ITEMS.filter((item) => item.section === "Clase 4"),
    };
  }
  return {
    storageKey: INTERNAL_DEMO_KEY,
    title: "Simulacro seguro de prueba · Clases 3 y 4",
    instructions: "Respondé las veinte preguntas para probar el recorrido completo, el guardado y la entrega dentro de Safe Exam Browser. Esta actividad técnica no registra una nota ni anticipa el formato definitivo.",
    durationMinutes: 30,
    items: ITEMS,
  };
}

export function buildDemoReview(items, answerKey = ANSWER_KEY) {
  const reviewedItems = items.map((item) => {
    const correctOptionId = answerKey[item.id];
    const selectedOptionId = item.response?.selectedOptionId || null;
    return {
      itemId: item.id,
      selectedOptionId,
      correctOptionId,
      isCorrect: Boolean(correctOptionId && selectedOptionId === correctOptionId),
      points: Number(item.points || 0),
    };
  });
  return {
    score: reviewedItems.reduce((total, item) => total + (item.isCorrect ? item.points : 0), 0),
    maxScore: reviewedItems.reduce((total, item) => total + item.points, 0),
    correctCount: reviewedItems.filter((item) => item.isCorrect).length,
    total: reviewedItems.length,
    items: reviewedItems,
  };
}

function attachReview(value) {
  value.review = buildDemoReview(value.items);
  return value;
}

function applyServerDeadline(value, store) {
  if (value?.attempt?.status === "in_progress" && Date.now() >= Date.parse(value.attempt.deadlineAt)) {
    value.attempt.status = "timed_out";
    value.attempt.submittedAt = value.attempt.deadlineAt;
    attachReview(value);
    store(value);
  }
  return value;
}

export class MockExamApi {
  constructor(practiceClass = null) {
    this.practiceClass = ["3", "4"].includes(String(practiceClass))
      ? String(practiceClass)
      : null;
    this.definition = buildDemoDefinition(this.practiceClass);
  }

  load() {
    try { return JSON.parse(localStorage.getItem(this.definition.storageKey) || "null"); }
    catch { return null; }
  }

  store(value) {
    localStorage.setItem(this.definition.storageKey, JSON.stringify(value));
  }

  reset() {
    localStorage.removeItem(this.definition.storageKey);
  }

  cleanUrl() {
    return this.practiceClass
      ? `${location.pathname}?clase=${this.practiceClass}`
      : `${location.pathname}?demo=1`;
  }

  retryUrl() {
    return this.practiceClass
      ? `index.html?clase=${this.practiceClass}&reset=1`
      : "index.html?demo=1&reset=1";
  }

  applyServerDeadline(value) {
    return applyServerDeadline(value, (nextValue) => this.store(nextValue));
  }

  async launch() {
    await delay(350);
    let state = this.load();
    if (!state) {
      const now = new Date();
      state = {
        serverNow: now.toISOString(),
        exam: {
          id: "11111111-1111-4111-8111-111111111111",
          title: this.definition.title,
          instructions: this.definition.instructions,
          durationMinutes: this.definition.durationMinutes,
        },
        attempt: {
          id: "d1111111-1111-4111-8111-111111111111",
          studentName: this.practiceClass ? "Estudiante de práctica" : "Estudiante de prueba",
          status: "in_progress",
          startedAt: now.toISOString(),
          deadlineAt: new Date(now.getTime() + this.definition.durationMinutes * 60 * 1000).toISOString(),
          submittedAt: null,
          lastSavedAt: null,
          serverVersion: 0,
        },
        items: structuredClone(this.definition.items),
      };
      this.store(state);
    }
    state = this.applyServerDeadline(state);
    return { ...structuredClone(state), serverNow: new Date().toISOString(), attemptToken: "demo-attempt-token" };
  }

  async state() {
    await delay();
    const state = this.applyServerDeadline(this.load());
    if (!state) throw new Error("invalid_attempt_session");
    return { ...structuredClone(state), serverNow: new Date().toISOString() };
  }

  async save(_token, responses) {
    await delay(260);
    const state = this.applyServerDeadline(this.load());
    if (!state || state.attempt.status !== "in_progress") throw new Error("invalid_attempt_session");
    for (const response of responses) {
      const item = state.items.find((candidate) => candidate.id === response.itemId);
      if (item) item.response = { ...response, savedAt: new Date().toISOString() };
    }
    state.attempt.lastSavedAt = new Date().toISOString();
    state.attempt.serverVersion += 1;
    this.store(state);
    return {
      serverNow: new Date().toISOString(),
      status: state.attempt.status,
      deadlineAt: state.attempt.deadlineAt,
      lastSavedAt: state.attempt.lastSavedAt,
      accepted: responses.length,
      serverVersion: state.attempt.serverVersion,
    };
  }

  async submit() {
    await delay(300);
    const state = this.applyServerDeadline(this.load());
    if (!state) throw new Error("invalid_attempt_session");
    state.attempt.status = "submitted";
    state.attempt.submittedAt = new Date().toISOString();
    state.serverNow = new Date().toISOString();
    attachReview(state);
    this.store(state);
    return structuredClone(state);
  }

  async event() { return { ok: true }; }
}
