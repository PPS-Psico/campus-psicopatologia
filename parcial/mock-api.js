const DEMO_KEY = "psicopato-exam-demo-v1";

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
});

const ITEMS = [
  {
    id: "a1111111-1111-4111-8111-111111111111",
    position: 1,
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
];

function load() {
  try { return JSON.parse(localStorage.getItem(DEMO_KEY) || "null"); }
  catch { return null; }
}

function store(value) { localStorage.setItem(DEMO_KEY, JSON.stringify(value)); }
function delay(ms = 180) { return new Promise((resolve) => setTimeout(resolve, ms)); }

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

function applyServerDeadline(value) {
  if (value?.attempt?.status === "in_progress" && Date.now() >= Date.parse(value.attempt.deadlineAt)) {
    value.attempt.status = "timed_out";
    value.attempt.submittedAt = value.attempt.deadlineAt;
    attachReview(value);
    store(value);
  }
  return value;
}

export class MockExamApi {
  async launch() {
    await delay(350);
    let state = load();
    if (!state) {
      const now = new Date();
      state = {
        serverNow: now.toISOString(),
        exam: {
          id: "11111111-1111-4111-8111-111111111111",
          title: "Multiple choice de prueba · Clase 3",
          instructions: "Respondé las diez preguntas sobre Jaspers, el método psicopatológico y la discusión con Freud. Probá el recorrido completo hasta la entrega: esta actividad no registra una nota ni anticipa el formato definitivo.",
          durationMinutes: 20,
        },
        attempt: {
          id: "d1111111-1111-4111-8111-111111111111",
          studentName: "Estudiante de prueba",
          status: "in_progress",
          startedAt: now.toISOString(),
          deadlineAt: new Date(now.getTime() + 20 * 60 * 1000).toISOString(),
          submittedAt: null,
          lastSavedAt: null,
          serverVersion: 0,
        },
        items: structuredClone(ITEMS),
      };
      store(state);
    }
    state = applyServerDeadline(state);
    return { ...structuredClone(state), serverNow: new Date().toISOString(), attemptToken: "demo-attempt-token" };
  }

  async state() {
    await delay();
    const state = applyServerDeadline(load());
    if (!state) throw new Error("invalid_attempt_session");
    return { ...structuredClone(state), serverNow: new Date().toISOString() };
  }

  async save(_token, responses) {
    await delay(260);
    const state = applyServerDeadline(load());
    if (!state || state.attempt.status !== "in_progress") throw new Error("invalid_attempt_session");
    for (const response of responses) {
      const item = state.items.find((candidate) => candidate.id === response.itemId);
      if (item) item.response = { ...response, savedAt: new Date().toISOString() };
    }
    state.attempt.lastSavedAt = new Date().toISOString();
    state.attempt.serverVersion += 1;
    store(state);
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
    const state = applyServerDeadline(load());
    if (!state) throw new Error("invalid_attempt_session");
    state.attempt.status = "submitted";
    state.attempt.submittedAt = new Date().toISOString();
    state.serverNow = new Date().toISOString();
    attachReview(state);
    store(state);
    return structuredClone(state);
  }

  async event() { return { ok: true }; }
}
