import { ExamApi, requestMoodleContext } from "./api.js?v=2";
import { MockExamApi } from "./mock-api.js?v=7";
import { assertSafeExamBrowser, getSafeExamBrowserProof } from "./seb-guard.js?v=3";
import {
  buildResponse,
  firstUnansweredIndex,
  formatRemaining,
  progressFor,
  remainingMilliseconds,
} from "./exam-core.js";

const config = window.EXAM_CONFIG;
const tokenStorageKey = `psicopato-exam-token:${config.examId}:${config.practiceClass || "internal"}`;
const elements = Object.fromEntries([
  "boot", "boot-copy", "fatal", "fatal-title", "fatal-copy", "retry-button",
  "exam", "exam-title", "student-name", "save-state", "save-copy", "timer",
  "timer-value", "connection", "progress-value", "progress-bar", "question-nav",
  "question-panel", "exam-instructions", "submit-button", "submit-dialog",
  "submit-dialog-copy", "confirm-submit", "completion", "completion-title",
  "completion-copy", "receipt-student", "receipt-status", "receipt-score-row", "receipt-score",
  "receipt-time", "receipt-id", "answer-review", "answer-review-summary", "answer-review-list",
  "demo-retry", "completion-exit", "completion-note",
].map((id) => [id, document.getElementById(id)]));

const api = config.demo ? new MockExamApi(config.practiceClass) : new ExamApi(config);

if (config.demo) elements["demo-retry"].href = api.retryUrl();
if (config.practiceClass) {
  const returnAnchor = config.practiceClass === "4" ? "mapa-visual" : "practica";
  elements["completion-exit"].href = `../units/clase-0${config.practiceClass}.html#${returnAnchor}`;
  elements["completion-exit"].target = "_self";
  elements["completion-exit"].textContent = `Volver a la Clase ${config.practiceClass}`;
  elements["completion-note"].textContent = "Podés rehacer la práctica o volver al material de la clase.";
  elements["demo-retry"].textContent = "Rehacer la práctica";
  elements["submit-button"].textContent = "Entregar práctica";
  elements["submit-dialog"].querySelector("h2").textContent = "¿Entregar la práctica ahora?";
}
const state = {
  data: null,
  token: sessionStorage.getItem(tokenStorageKey) || "",
  answers: new Map(),
  dirty: new Set(),
  currentIndex: 0,
  serverOffsetMs: 0,
  saveTimer: null,
  timerInterval: null,
  heartbeatInterval: null,
  saving: false,
  submitting: false,
  timeoutHandled: false,
};

const errorCopy = {
  missing_api_config: ["Falta conectar el servidor", "Configurá la URL y la clave publicable antes de usar esta pantalla fuera del modo de prueba."],
  not_embedded_in_moodle: ["Abrí el parcial desde el Campus", "Esta evaluación sólo puede iniciarse desde el enlace publicado en el aula virtual."],
  moodle_context_timeout: ["El Campus no respondió", "Comprobá la conexión y volvé a ingresar desde el enlace del parcial."],
  moodle_context_failed: ["El Campus no pudo identificarte", "Volvé al aula virtual y abrí nuevamente el parcial."],
  invalid_moodle_context: ["El Campus no envió datos válidos", "El equipo docente debe revisar la configuración del acceso al parcial."],
  identity_not_registered: ["No figurás en el padrón", "Tu DNI no está habilitado para esta materia. Avisá al equipo docente antes de comenzar."],
  identity_not_verified: ["Tu cuenta todavía no fue verificada", "Abrí primero el simulacro técnico desde tu cuenta del Campus o avisá al equipo docente antes de comenzar."],
  identity_mismatch: ["Tus datos no coinciden", "El nombre informado por el Campus no coincide con el padrón cargado. Avisá al equipo docente."],
  moodle_account_conflict: ["La cuenta del Campus no coincide", "Este DNI ya quedó asociado a otra cuenta del Campus. Avisá al equipo docente."],
  invalid_attempt_session: ["La sesión del parcial no es válida", "Volvé al Campus para recuperar tu intento de forma segura."],
  exam_not_open: ["El parcial todavía no está disponible", "Esperá la indicación del equipo docente y reintentá desde el Campus."],
  exam_closed: ["El horario del parcial finalizó", "Consultá al equipo docente si necesitás verificar el estado de tu entrega."],
  exam_not_available: ["El parcial no está publicado", "El equipo docente debe revisar la configuración de esta actividad."],
  exam_has_no_questions: ["El parcial todavía no tiene consignas", "El equipo docente debe revisar el banco de preguntas antes de habilitar esta actividad."],
  safe_exam_browser_required: ["Abrí esta actividad con Safe Exam Browser", "Cerrá esta pestaña, volvé a la sección Parcial del Campus y abrí el archivo de acceso .seb. Las preguntas no están disponibles en un navegador común."],
  safe_browser_invalid: ["La configuración del navegador no es válida", "Volvé al Campus y abrí nuevamente el archivo .seb publicado para este parcial."],
  safe_browser_not_configured: ["El acceso seguro todavía no está habilitado", "El equipo docente debe terminar la configuración técnica antes de publicar esta actividad."],
};

function showOnly(name) {
  elements.boot.hidden = name !== "boot";
  elements.fatal.hidden = name !== "fatal";
  elements.exam.hidden = name !== "exam";
  elements.completion.hidden = name !== "completion";
}

function setBoot(copy) {
  elements["boot-copy"].textContent = copy;
  showOnly("boot");
}

function showFatal(error) {
  const code = error instanceof Error ? error.message : String(error);
  const [title, copy] = errorCopy[code] || [
    "No pudimos conectar con el parcial",
    "Revisá tu conexión y reintentá. Si el problema continúa, avisá al equipo docente sin cerrar el Campus.",
  ];
  elements["fatal-title"].textContent = title;
  elements["fatal-copy"].textContent = copy;
  showOnly("fatal");
}

function syncServerClock(serverNow) {
  if (!serverNow) return;
  const parsed = Date.parse(serverNow);
  if (Number.isFinite(parsed)) state.serverOffsetMs = parsed - Date.now();
}

function hydrateAnswers(items) {
  state.answers.clear();
  for (const item of items) {
    state.answers.set(item.id, {
      selectedOptionId: item.response?.selectedOptionId || null,
      essayText: item.response?.essayText || "",
      clientRevision: Number(item.response?.clientRevision || 0),
    });
  }
}

function setSaveState(kind, copy) {
  elements["save-state"].dataset.state = kind;
  elements["save-copy"].textContent = copy;
}

function updateProgress() {
  const progress = progressFor(state.data.items, state.answers);
  elements["progress-value"].textContent = `${progress.answered} de ${progress.total}`;
  elements["progress-bar"].style.width = `${progress.percent}%`;
  renderNavigator();
}

function renderNavigator() {
  const nav = elements["question-nav"];
  nav.replaceChildren();
  state.data.items.forEach((item, index) => {
    const answer = state.answers.get(item.id);
    const answered = item.kind === "single_choice"
      ? Boolean(answer?.selectedOptionId)
      : Boolean(answer?.essayText?.trim());
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = String(index + 1);
    button.dataset.answered = String(answered);
    const sectionCopy = item.section ? `${item.section}, ` : "";
    button.setAttribute("aria-label", `${sectionCopy}pregunta ${index + 1}${answered ? ", respondida" : ", sin responder"}`);
    if (index === state.currentIndex) button.setAttribute("aria-current", "step");
    button.addEventListener("click", () => showQuestion(index));
    nav.append(button);
  });
}

function renderQuestion() {
  const item = state.data.items[state.currentIndex];
  const answer = state.answers.get(item.id);
  const panel = elements["question-panel"];
  panel.replaceChildren();

  const meta = document.createElement("div");
  meta.className = "question-meta";
  const number = document.createElement("strong");
  number.textContent = item.section
    ? `${item.section} · Pregunta ${state.currentIndex + 1} de ${state.data.items.length}`
    : `Pregunta ${state.currentIndex + 1} de ${state.data.items.length}`;
  const points = document.createElement("span");
  points.textContent = `${Number(item.points)} ${Number(item.points) === 1 ? "punto" : "puntos"}`;
  meta.append(number, points);

  const title = document.createElement("h1");
  title.className = "question-title";
  title.id = `question-${item.id}`;
  title.textContent = item.prompt;
  panel.append(meta, title);

  if (item.kind === "single_choice") {
    const fieldset = document.createElement("fieldset");
    fieldset.className = "answer-options";
    fieldset.setAttribute("aria-labelledby", title.id);
    item.options.forEach((option) => {
      const label = document.createElement("label");
      label.className = "answer-option";
      const input = document.createElement("input");
      input.type = "radio";
      input.name = `answer-${item.id}`;
      input.value = option.id;
      input.checked = answer.selectedOptionId === option.id;
      input.addEventListener("change", () => changeAnswer(item, { selectedOptionId: option.id }));
      const copy = document.createElement("span");
      copy.textContent = option.label;
      label.append(input, copy);
      fieldset.append(label);
    });
    panel.append(fieldset);
  } else {
    const label = document.createElement("label");
    label.className = "essay-label";
    label.htmlFor = `essay-${item.id}`;
    label.textContent = "Tu respuesta";
    const textarea = document.createElement("textarea");
    textarea.className = "essay-answer";
    textarea.id = `essay-${item.id}`;
    textarea.maxLength = 8000;
    textarea.value = answer.essayText;
    textarea.setAttribute("aria-describedby", `essay-count-${item.id}`);
    const count = document.createElement("p");
    count.className = "essay-count";
    count.id = `essay-count-${item.id}`;
    count.textContent = `${textarea.value.length} caracteres`;
    textarea.addEventListener("input", () => {
      count.textContent = `${textarea.value.length} caracteres`;
      changeAnswer(item, { essayText: textarea.value });
    });
    panel.append(label, textarea, count);
  }

  const actions = document.createElement("div");
  actions.className = "question-actions";
  const right = document.createElement("div");
  right.className = "question-actions__right";
  const previous = makeButton("Anterior", "button button--secondary", () => showQuestion(state.currentIndex - 1));
  previous.disabled = state.currentIndex === 0;
  const next = makeButton("Siguiente", "button button--primary", () => {
    const isLast = state.currentIndex === state.data.items.length - 1;
    if (!isLast) {
      showQuestion(state.currentIndex + 1);
      return;
    }

    const progress = progressFor(state.data.items, state.answers);
    if (progress.answered === progress.total) {
      openSubmitDialog();
      return;
    }
    showQuestion(firstUnansweredIndex(state.data.items, state.answers));
  });
  next.id = "question-next-action";
  right.append(previous, next);
  actions.append(right);
  panel.append(actions);
  updateNextAction();
}

function updateNextAction() {
  const action = document.getElementById("question-next-action");
  if (!action) return;
  const isLast = state.currentIndex === state.data.items.length - 1;
  if (!isLast) {
    action.textContent = "Siguiente";
    return;
  }
  const progress = progressFor(state.data.items, state.answers);
  action.textContent = progress.answered === progress.total
    ? config.practiceClass ? "Entregar práctica" : "Entregar parcial"
    : "Revisar pendientes";
}

function makeButton(copy, className, handler) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = copy;
  button.addEventListener("click", handler);
  return button;
}

function showQuestion(index) {
  if (index < 0 || index >= state.data.items.length) return;
  state.currentIndex = index;
  renderQuestion();
  renderNavigator();
  elements["question-panel"].focus({ preventScroll: true });
  if (matchMedia("(max-width: 760px)").matches) {
    elements["question-panel"].scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function changeAnswer(item, patch) {
  const current = state.answers.get(item.id);
  state.answers.set(item.id, { ...current, ...patch, clientRevision: current.clientRevision + 1 });
  state.dirty.add(item.id);
  setSaveState("pending", "Cambios pendientes");
  updateProgress();
  updateNextAction();
  clearTimeout(state.saveTimer);
  state.saveTimer = setTimeout(() => flushSave(), 900);
}

async function flushSave() {
  clearTimeout(state.saveTimer);
  if (state.saving) {
    await new Promise((resolve) => {
      const poll = setInterval(() => {
        if (!state.saving) {
          clearInterval(poll);
          resolve();
        }
      }, 40);
    });
  }
  if (!state.dirty.size || state.data.attempt.status !== "in_progress") return;
  state.saving = true;
  const snapshots = [...state.dirty].map((itemId) => {
    const item = state.data.items.find((candidate) => candidate.id === itemId);
    return { itemId, revision: state.answers.get(itemId).clientRevision, payload: buildResponse(item, state.answers.get(itemId)) };
  });
  setSaveState("saving", "Guardando…");
  try {
    const result = await api.save(state.token, snapshots.map((entry) => entry.payload));
    syncServerClock(result.serverNow);
    snapshots.forEach(({ itemId, revision }) => {
      if (state.answers.get(itemId)?.clientRevision === revision) state.dirty.delete(itemId);
    });
    state.data.attempt.lastSavedAt = result.lastSavedAt;
    state.data.attempt.serverVersion = result.serverVersion;
    state.data.attempt.status = result.status;
    setSaveState(state.dirty.size ? "pending" : "saved", state.dirty.size ? "Cambios pendientes" : "Guardado");
    if (state.dirty.size) state.saveTimer = setTimeout(() => flushSave(), 300);
    if (result.status !== "in_progress") await refreshState();
  } catch (error) {
    setSaveState("error", "Sin guardar · reintentando");
    elements.connection.hidden = false;
    state.saveTimer = setTimeout(() => flushSave(), 4000);
  } finally {
    state.saving = false;
  }
}

function updateTimer() {
  const remaining = remainingMilliseconds(state.data.attempt.deadlineAt, state.serverOffsetMs);
  elements["timer-value"].textContent = formatRemaining(remaining);
  elements.timer.dataset.warning = String(remaining <= 10 * 60 * 1000 && remaining > 2 * 60 * 1000);
  elements.timer.dataset.critical = String(remaining <= 2 * 60 * 1000);
  if (remaining <= 5000 && state.dirty.size) flushSave();
  if (remaining <= 0 && !state.timeoutHandled) {
    state.timeoutHandled = true;
    refreshState().catch(showFatal);
  }
}

async function refreshState() {
  const data = await api.state(state.token);
  syncServerClock(data.serverNow);
  state.data = data;
  if (data.attempt.status !== "in_progress") {
    renderCompletion(data);
    return;
  }
  updateTimer();
}

function renderExam() {
  elements["exam-title"].textContent = state.data.exam.title;
  document.title = `${state.data.exam.title} · Psicopatología I`;
  elements["student-name"].textContent = state.data.attempt.studentName;
  elements["exam-instructions"].textContent = state.data.exam.instructions;
  hydrateAnswers(state.data.items);
  state.currentIndex = firstUnansweredIndex(state.data.items, state.answers);
  updateProgress();
  renderQuestion();
  setSaveState("saved", state.data.attempt.lastSavedAt ? "Guardado" : "Listo para responder");
  showOnly("exam");
  clearInterval(state.timerInterval);
  clearInterval(state.heartbeatInterval);
  state.timerInterval = setInterval(updateTimer, 1000);
  state.heartbeatInterval = setInterval(() => {
    if (state.dirty.size) flushSave();
    else refreshState().catch(() => { elements.connection.hidden = false; });
  }, 20000);
  updateTimer();
}

function renderCompletion(data) {
  clearInterval(state.timerInterval);
  clearInterval(state.heartbeatInterval);
  const timedOut = data.attempt.status === "timed_out";
  const hasDemoReview = config.demo && data.review;
  elements["completion-title"].textContent = hasDemoReview
    ? config.practiceClass ? "Práctica corregida" : "Simulacro corregido"
    : timedOut ? "El tiempo finalizó" : "Parcial entregado";
  elements["completion-copy"].textContent = hasDemoReview
    ? `Obtuviste ${data.review.score} de ${data.review.maxScore} puntos. Abajo podés comparar cada respuesta con la opción correcta.`
    : timedOut
      ? "El servidor cerró el intento al cumplirse el horario. Las respuestas guardadas hasta ese momento quedaron registradas."
      : "La entrega quedó registrada correctamente y ya no admite modificaciones.";
  elements["receipt-student"].textContent = data.attempt.studentName;
  elements["receipt-status"].textContent = hasDemoReview ? "Finalizado" : timedOut ? "Cerrado por tiempo" : "Entregado";
  elements["receipt-score-row"].hidden = !hasDemoReview;
  elements["receipt-score"].textContent = hasDemoReview
    ? `${data.review.correctCount} correctas de ${data.review.total}`
    : "—";
  elements["receipt-time"].textContent = new Intl.DateTimeFormat("es-AR", { dateStyle: "long", timeStyle: "medium" })
    .format(new Date(data.attempt.submittedAt || data.serverNow));
  elements["receipt-id"].textContent = data.attempt.id;
  renderAnswerReview(data);
  showOnly("completion");
}

function renderAnswerReview(data) {
  const review = config.demo ? data.review : null;
  elements["answer-review"].hidden = !review;
  elements["demo-retry"].hidden = !review;
  elements["answer-review-list"].replaceChildren();
  if (!review) return;

  elements["answer-review-summary"].textContent =
    `${review.correctCount} de ${review.total} respuestas correctas.`;
  review.items.forEach((result, index) => {
    const item = data.items.find((candidate) => candidate.id === result.itemId);
    if (!item) return;
    const selected = item.options.find((option) => option.id === result.selectedOptionId);
    const correct = item.options.find((option) => option.id === result.correctOptionId);

    const row = document.createElement("li");
    row.className = "answer-review__item";
    row.dataset.correct = String(result.isCorrect);

    const heading = document.createElement("div");
    heading.className = "answer-review__item-head";
    const number = document.createElement("span");
    number.textContent = `Pregunta ${index + 1}`;
    const status = document.createElement("strong");
    status.textContent = result.isCorrect ? "Correcta" : "Incorrecta";
    heading.append(number, status);

    const prompt = document.createElement("h3");
    prompt.textContent = item.prompt;
    const chosen = document.createElement("p");
    const chosenLabel = document.createElement("span");
    chosenLabel.textContent = "Tu respuesta: ";
    const chosenValue = document.createElement("strong");
    chosenValue.textContent = selected?.label || "Sin responder";
    chosen.append(chosenLabel, chosenValue);
    const expected = document.createElement("p");
    const expectedLabel = document.createElement("span");
    expectedLabel.textContent = "Respuesta correcta: ";
    const expectedValue = document.createElement("strong");
    expectedValue.textContent = correct?.label || "No disponible";
    expected.append(expectedLabel, expectedValue);
    row.append(heading, prompt, chosen, expected);
    elements["answer-review-list"].append(row);
  });
}

async function submitExam() {
  if (state.submitting) return;
  state.submitting = true;
  elements["confirm-submit"].disabled = true;
  elements["confirm-submit"].textContent = "Entregando…";
  try {
    await flushSave();
    if (state.dirty.size) throw new Error("unsaved_changes");
    const data = await api.submit(state.token);
    syncServerClock(data.serverNow);
    state.data = data;
    elements["submit-dialog"].close();
    renderCompletion(data);
  } catch {
    elements["submit-dialog-copy"].textContent = "No pudimos completar la entrega. Tus respuestas siguen en pantalla; revisá la conexión y reintentá.";
    elements["confirm-submit"].disabled = false;
    elements["confirm-submit"].textContent = "Reintentar entrega";
  } finally {
    state.submitting = false;
  }
}

function openSubmitDialog() {
  const progress = progressFor(state.data.items, state.answers);
  const pending = progress.total - progress.answered;
  elements["submit-dialog-copy"].textContent = pending
    ? `Quedan ${pending} ${pending === 1 ? "consigna sin responder" : "consignas sin responder"}. Después de confirmar ya no podrás modificar las respuestas.`
    : "Todas las consignas tienen respuesta. Después de confirmar ya no podrás modificarlas.";
  elements["confirm-submit"].disabled = false;
  elements["confirm-submit"].textContent = "Confirmar entrega";
  elements["submit-dialog"].showModal();
}

async function bootstrap() {
  try {
    setBoot(config.practiceClass ? "Preparando la práctica…" : "Verificando el navegador seguro…");
    assertSafeExamBrowser(config);
    if (!config.demo) api.setSafeExamBrowserProof(await getSafeExamBrowserProof());
    setBoot(config.practiceClass ? "Cargando las preguntas…" : "Verificando tu ingreso desde el Campus…");
    if (config.demo && new URLSearchParams(location.search).get("reset") === "1") {
      api.reset();
      sessionStorage.removeItem(tokenStorageKey);
      state.token = "";
      history.replaceState(null, "", api.cleanUrl());
    }

    let data;
    if (config.demo && state.token) {
      setBoot("Recuperando tus respuestas guardadas…");
      try { data = await api.state(state.token); }
      catch {
        sessionStorage.removeItem(tokenStorageKey);
        state.token = "";
      }
    }

    if (!data) {
      const context = config.demo ? null : await requestMoodleContext(config);
      setBoot(config.practiceClass ? "Preparando tu intento…" : "Verificando tus datos en el padrón…");
      data = await api.launch(config.examId, context);
      state.token = data.attemptToken;
      sessionStorage.setItem(tokenStorageKey, state.token);
    }

    syncServerClock(data.serverNow);
    state.data = data;
    if (data.attempt.status === "in_progress") renderExam();
    else renderCompletion(data);
  } catch (error) {
    showFatal(error);
  }
}

elements["retry-button"].addEventListener("click", bootstrap);
elements["submit-button"].addEventListener("click", openSubmitDialog);
elements["confirm-submit"].addEventListener("click", (event) => {
  event.preventDefault();
  submitExam();
});

window.addEventListener("online", () => {
  elements.connection.hidden = true;
  if (state.dirty.size) flushSave();
});
window.addEventListener("offline", () => { elements.connection.hidden = false; });
window.addEventListener("beforeunload", (event) => {
  if (state.data?.attempt?.status === "in_progress" && state.dirty.size) {
    event.preventDefault();
    event.returnValue = "";
  }
});
document.addEventListener("visibilitychange", () => {
  if (!state.token || state.data?.attempt?.status !== "in_progress") return;
  const eventType = document.hidden ? "window_hidden" : "window_visible";
  api.event(state.token, eventType, { clientTime: new Date().toISOString() }).catch(() => {});
  if (!document.hidden) refreshState().catch(() => { elements.connection.hidden = false; });
});

bootstrap();
