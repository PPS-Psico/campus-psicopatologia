import { ExamApi, requestMoodleContext } from "./api.js?v=3";

const config = window.EXAM_CONFIG ?? {};
const api = new ExamApi(config);

const SEB_FILE = "simulacro-parcial-clase-5.seb";
const sebPath = new URL(SEB_FILE, location.href);

const el = Object.fromEntries([
  "loading", "loading-copy", "ready", "ready-name", "ready-exam", "launch",
  "download", "expiry", "done", "done-copy", "failure", "failure-title",
  "failure-copy", "failure-code", "retry",
].map((id) => [id, document.getElementById(id)]));

const errorCopy = {
  not_embedded_in_moodle: ["Abrí el parcial desde el Campus", "Esta página sólo funciona dentro del aula virtual."],
  moodle_context_timeout: ["El Campus no respondió", "Comprobá la conexión y volvé a cargar la página."],
  moodle_context_failed: ["El Campus no pudo identificarte", "Cerrá sesión, volvé a entrar al aula virtual y reintentá."],
  invalid_moodle_context: ["El Campus no envió datos válidos", "El equipo docente tiene que revisar la configuración de esta actividad."],
  identity_not_registered: ["No figurás en el padrón", "Tu DNI no está habilitado para esta materia. Avisale al equipo docente antes del parcial."],
  identity_not_verified: ["Tu cuenta todavía no fue verificada", "Avisale al equipo docente antes de la fecha del parcial."],
  identity_mismatch: ["Tus datos no coinciden", "El nombre que informa el Campus no coincide con el padrón. Avisale al equipo docente."],
  moodle_account_conflict: ["La cuenta del Campus no coincide", "Este DNI ya quedó asociado a otra cuenta. Avisale al equipo docente."],
  exam_not_open: ["El parcial todavía no está disponible", "Volvé a entrar cuando se habilite."],
  exam_closed: ["El horario del parcial finalizó", "Consultale al equipo docente si necesitás verificar tu entrega."],
  exam_not_available: ["El parcial no está publicado", "El equipo docente tiene que revisar la configuración de esta actividad."],
  missing_api_config: ["Falta conectar el servidor", "El equipo docente tiene que terminar la configuración."],
};

function show(name) {
  for (const key of ["loading", "ready", "done", "failure"]) {
    el[key].hidden = key !== name;
  }
}

function formatTime(value) {
  try {
    return new Intl.DateTimeFormat("es-AR", {
      hour: "2-digit", minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "";
  }
}

function fail(error) {
  const code = error instanceof Error ? error.message : String(error);
  const known = errorCopy[code];
  const [title, copy] = known
    ?? ["No pudimos abrir tu acceso", "Volvé a cargar la página del Campus. Si sigue igual, avisale al equipo docente."];
  el["failure-title"].textContent = title;
  el["failure-copy"].textContent = copy;
  // Un fallo que no sabemos nombrar deja su código a la vista: es lo único que
  // permite diagnosticarlo sin estar sentado al lado del estudiante.
  el["failure-code"].textContent = known ? "" : `Código: ${code}`;
  show("failure");
}

async function start() {
  show("loading");
  try {
    el["loading-copy"].textContent = "Estamos leyendo tus datos del Campus.";
    const context = await requestMoodleContext(config);

    el["loading-copy"].textContent = "Verificando tus datos en el padrón.";
    const data = await api.issuePass(config.examId, context);

    // Un intento ya entregado no se vuelve a abrir: mostrarle el botón sería
    // ofrecerle algo que el servidor va a rechazar.
    const status = data.attempt?.status;
    if (status === "submitted" || status === "timed_out") {
      el["done-copy"].textContent = status === "timed_out"
        ? "Tu intento se cerró al terminar el tiempo y quedó registrado. La devolución se publica más adelante."
        : "Tu entrega quedó registrada. La devolución se publica más adelante.";
      show("done");
      return;
    }

    el["ready-name"].textContent = data.studentName || "";
    el["ready-exam"].textContent = data.exam?.title
      ? `${data.exam.title} · ${data.exam.durationMinutes} minutos`
      : "";

    const launchUrl = `${sebPath.href}?pase=${encodeURIComponent(data.pass)}`;
    el.launch.href = `sebs://${launchUrl.replace(/^https?:\/\//, "")}`;
    el.download.href = launchUrl;
    el.download.setAttribute("download", SEB_FILE);

    const expires = formatTime(data.expiresAt);
    el.expiry.textContent = expires
      ? `Este acceso vence a las ${expires}. Si se vence, recargá esta página y te damos uno nuevo.`
      : "";

    if (status === "in_progress") {
      el["ready-copy"].textContent = "Tenés un intento empezado. Al abrir el navegador seguro vas a encontrarlo donde lo dejaste.";
    }

    show("ready");
  } catch (error) {
    fail(error);
  }
}

el.retry.addEventListener("click", start);
start();
