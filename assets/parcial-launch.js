import { ExamApi, requestMoodleContext } from "../parcial/api.js?v=4";
import { GraderApi } from "../docentes/api.js?v=4";

// El acceso al parcial vive acá, en la misma sección donde el estudiante ya lee
// las fechas y las condiciones. La identidad llega del Campus por postMessage:
// esta página corre dentro del iframe del aula, y la etiqueta de Moodle que lo
// embebe responde con los datos que FilterCodes resolvió.

const config = window.EXAM_CONFIG ?? {};
const api = new ExamApi(config);
const graderApi = new GraderApi(config);
// Los dos .seb son el mismo archivo con otro nombre: misma configuración, misma
// clave. El que abre el parcial se llama como el parcial para que nadie dude.
const MODOS = {
  parcial: {
    examId: config.examId,
    seb: "parcial/parcial-1.seb",
    notOpen: ["Se abre hoy a las 8:35", "El acceso se habilita a las 8:35. Recargá la página en ese momento."],
    closed: ["El parcial ya cerró", "El acceso terminó a las 10:30. Si tuviste un problema para entrar, avisale al equipo docente."],
    done: "Ya entregaste el parcial",
    badgeNotOpen: "Hoy · 8:35",
  },
  simulacro: {
    examId: config.rehearsalExamId,
    seb: "parcial/simulacro-parcial-clase-5.seb",
    notOpen: ["Todavía no está habilitado", "Volvé a entrar cuando se habilite."],
    closed: ["El simulacro terminó", "El parcial se abre hoy a las 8:35, desde esta misma sección."],
    done: "Ya rendiste el simulacro",
    badgeNotOpen: "Todavía no",
  },
};

// Cada bloque de texto marcado con data-modo se muestra sólo en su modo.
function mostrarModo(modo) {
  for (const bloque of document.querySelectorAll("[data-modo]")) {
    bloque.hidden = bloque.dataset.modo !== modo;
  }
}

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

// El acceso a la corrección no figura en la página: aparece sólo si el servidor
// confirma que esta identidad del Campus está cargada como correctora. Para el
// resto del curso el bloque no existe, y nadie tiene que escribir un DNI.
async function revelarCorreccion(context) {
  const panel = document.getElementById("docencia");
  if (!panel) return;
  let sesion;
  try {
    sesion = await graderApi.login(context);
  } catch {
    return; // no es correctora, o el servidor no respondió: el bloque no aparece
  }

  document.getElementById("staff-copy").textContent =
    `Entraste como ${sesion.displayName}. El Campus te reconoce como parte del equipo docente, `
    + "así que la corrección se abre sin usuario ni contraseña.";

  try {
    const datos = await graderApi.bootstrap();
    const pendientes = (datos.exams ?? []).reduce((total, examen) => total + (examen.pendingCount ?? 0), 0);
    document.getElementById("staff-pending").textContent = pendientes
      ? `Hay ${pendientes} ${pendientes === 1 ? "entrega" : "entregas"} sin publicar.`
      : "No hay entregas esperando corrección.";
  } catch { /* el panel las va a contar igual al abrirse */ }

  panel.hidden = false;
}

// El servidor es quien sabe qué examen está abierto: el reloj de la computadora
// del estudiante puede estar mal. Se pide el pase del parcial; si todavía no
// está habilitado, se intenta con el simulacro. Si el simulacro ya cerró, se
// vuelve al parcial para mostrar cuándo se abre.
async function pedirPase(context) {
  try {
    return { modo: "parcial", data: await api.issuePass(MODOS.parcial.examId, context) };
  } catch (error) {
    const code = error instanceof Error ? error.message : String(error);
    const todaviaNo = code === "exam_not_open" || code === "exam_not_available";
    if (!todaviaNo || !MODOS.simulacro.examId) throw Object.assign(error, { modo: "parcial" });
    try {
      return { modo: "simulacro", data: await api.issuePass(MODOS.simulacro.examId, context) };
    } catch (segundo) {
      const code2 = segundo instanceof Error ? segundo.message : String(segundo);
      // Simulacro cerrado (o inexistente): lo que importa es cuándo abre el parcial.
      if (code2 === "exam_closed" || code2 === "exam_not_available") {
        throw Object.assign(new Error("exam_not_open"), { modo: "parcial" });
      }
      throw Object.assign(segundo, { modo: "simulacro" });
    }
  }
}

async function prepare() {
  if (!el["launch-panel"]) return;
  mostrarModo("parcial");
  try {
    const context = await requestMoodleContext(config);
    revelarCorreccion(context);
    const { modo, data } = await pedirPase(context);
    const m = MODOS[modo];
    mostrarModo(modo);

    const status = data.attempt?.status;
    if (status === "submitted" || status === "timed_out") {
      paint({
        badge: "Entregado", badgeKind: "accent",
        title: m.done,
        copy: status === "timed_out"
          ? "Tu intento se cerró al terminar el tiempo y quedó registrado. La devolución llega más adelante."
          : "Tu entrega quedó registrada. La devolución llega más adelante.",
        note: "",
      });
      return;
    }

    // Safe Exam Browser exige DOS signos de pregunta para trasladar la consulta
    // a la URL de inicio. Con uno solo la ignora y el estudiante llega sin pase.
    const seb = new URL(m.seb, location.href).href.replace(/^https?:\/\//, "");
    el["launch-button"].href = `sebs://${seb}??pase=${encodeURIComponent(data.pass)}`;

    const vence = formatTime(data.expiresAt);
    paint({
      badge: "Listo para entrar", badgeKind: "accent",
      title: `Hola, ${data.studentName || "estudiante"}`,
      copy: status === "in_progress"
        ? "Tenés un intento empezado. Al abrir el navegador seguro vas a encontrarlo donde lo dejaste."
        : "Ya te reconocimos. Al abrir el navegador seguro entrás directo, sin iniciar sesión otra vez.",
      button: true,
      note: vence
        ? `Este acceso vence a las ${vence}; si se vence, recargá la página. Necesitás Safe Exam Browser instalado.`
        : "Necesitás Safe Exam Browser instalado.",
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : String(error);
    const m = MODOS[error?.modo] ?? MODOS.parcial;
    mostrarModo(error?.modo ?? "parcial");
    const porModo = { exam_not_open: m.notOpen, exam_closed: m.closed };
    const known = porModo[code] ?? errorCopy[code];
    const [title, copy] = known ?? ["No pudimos preparar tu acceso", "Recargá la página del aula. Si sigue igual, avisale al equipo docente."];
    paint({
      badge: code === "exam_not_open" ? m.badgeNotOpen : "No disponible",
      badgeKind: code === "exam_not_open" ? "accent" : "warn",
      title, copy,
      note: known ? "" : `Código: ${code}`,
    });
  }
}

prepare();
