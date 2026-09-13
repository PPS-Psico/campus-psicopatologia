import { ExamApi, requestMoodleContext } from "../parcial/api.js?v=3";

// El acceso al parcial vive acá, en la misma sección donde el estudiante ya lee
// las fechas y las condiciones. La identidad llega del Campus por postMessage:
// esta página corre dentro del iframe del aula, y la etiqueta de Moodle que lo
// embebe responde con los datos que FilterCodes resolvió.

const config = window.EXAM_CONFIG ?? {};
const api = new ExamApi(config);
const SEB_FILE = "parcial/simulacro-parcial-clase-5.seb";

const el = Object.fromEntries(
  ["launch-panel", "launch-badge", "launch-title", "launch-copy", "launch-button", "launch-note"]
    .map((id) => [id, document.getElementById(id)]),
);

const errorCopy = {
  not_embedded_in_moodle: ["Abrí el aula desde el Campus", "Esta página prepara tu acceso sólo cuando la abrís desde el aula virtual."],
  moodle_context_timeout: ["El Campus no respondió", "Recargá la página del aula y volvé a intentar."],
  moodle_context_failed: ["El Campus no pudo identificarte", "Cerrá sesión, volvé a entrar al aula virtual y recargá esta página."],
  invalid_moodle_context: ["Datos del Campus incompletos", "Avisale al equipo docente: hay que revisar la configuración del aula."],
  identity_not_registered: ["No figurás en el padrón", "Tu DNI no está habilitado para esta materia. Avisale al equipo docente antes del parcial."],
  identity_not_verified: ["Tu cuenta todavía no fue verificada", "Avisale al equipo docente antes de la fecha del parcial."],
  identity_mismatch: ["Tus datos no coinciden", "El nombre que informa el Campus no coincide con el padrón. Avisale al equipo docente."],
  moodle_account_conflict: ["La cuenta del Campus no coincide", "Este DNI ya quedó asociado a otra cuenta. Avisale al equipo docente."],
  exam_not_open: ["Todavía no está habilitado", "El acceso se abre el lunes 14 de septiembre, después de la clase."],
  exam_closed: ["El plazo terminó", "Consultale al equipo docente si necesitás verificar tu entrega."],
  exam_not_available: ["El simulacro no está publicado", "Avisale al equipo docente: hay que revisar la configuración de esta actividad."],
  missing_api_config: ["Falta terminar la configuración", "Avisale al equipo docente."],
};

function paint({ badge, badgeKind = "quiet", title, copy, button = false, note }) {
  el["launch-badge"].textContent = badge;
  el["launch-badge"].className = `badge badge--${badgeKind}`;
  el["launch-title"].textContent = title;
  el["launch-copy"].textContent = copy;
  el["launch-button"].hidden = !button;
  if (note !== undefined) el["launch-note"].textContent = note;
}

function formatTime(value) {
  try {
    return new Intl.DateTimeFormat("es-AR", { hour: "2-digit", minute: "2-digit" })
      .format(new Date(value));
  } catch {
    return "";
  }
}

async function prepare() {
  if (!el["launch-panel"]) return;
  try {
    const context = await requestMoodleContext(config);
    const data = await api.issuePass(config.examId, context);

    const status = data.attempt?.status;
    if (status === "submitted" || status === "timed_out") {
      paint({
        badge: "Entregado", badgeKind: "accent",
        title: "Ya rendiste el simulacro",
        copy: status === "timed_out"
          ? "Tu intento se cerró al terminar el tiempo y quedó registrado. La devolución llega más adelante."
          : "Tu entrega quedó registrada. La devolución llega más adelante.",
        note: "",
      });
      return;
    }

    // Safe Exam Browser exige DOS signos de pregunta para trasladar la consulta
    // a la URL de inicio. Con uno solo la ignora y el estudiante llega sin pase.
    const seb = new URL(SEB_FILE, location.href).href.replace(/^https?:\/\//, "");
    el["launch-button"].href = `sebs://${seb}??pase=${encodeURIComponent(data.pass)}`;

    const vence = formatTime(data.expiresAt);
    paint({
      badge: "Listo para entrar", badgeKind: "accent",
      title: `Hola, ${data.studentName || "estudiante"}`,
      copy: status === "in_progress"
        ? "Tenés un intento empezado. Al abrir el navegador seguro vas a encontrarlo donde lo dejaste."
        : "Ya te reconocimos. Al abrir el navegador seguro entrás directo a tu parcial, sin iniciar sesión otra vez.",
      button: true,
      note: vence
        ? `Este acceso vence a las ${vence}; si se vence, recargá la página. Necesitás Safe Exam Browser instalado.`
        : "Necesitás Safe Exam Browser instalado.",
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : String(error);
    const known = errorCopy[code];
    const [title, copy] = known ?? ["No pudimos preparar tu acceso", "Recargá la página del aula. Si sigue igual, avisale al equipo docente."];
    paint({
      badge: code === "exam_not_open" ? "Se habilita el lunes 14" : "No disponible",
      badgeKind: code === "exam_not_open" ? "accent" : "warn",
      title, copy,
      note: known ? "" : `Código: ${code}`,
    });
  }
}

prepare();
