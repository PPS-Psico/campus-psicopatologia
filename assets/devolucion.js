// Mi devolución. El Campus le pasa a la página la identidad de quien la abre.
// Si es del equipo docente, se ven todas las notas y la vista previa de cada
// devolución, publicada o no. Si no, el servidor entrega sólo la devolución
// publicada de ese estudiante y la lista general de notas del curso.
import { requestMoodleContext } from "../parcial/api.js?v=4";
import { GraderApi } from "../docentes/api.js?v=5";
import { FeedbackApi } from "../devolucion/api.js?v=2";
import { crear, numero, etiquetaResultado, pintarDevolucion, pintarListaNotas } from "./devolucion-vista.js?v=1";

const config = window.EXAM_CONFIG ?? {};
const $ = (id) => document.getElementById(id);

const ERRORES = {
  not_embedded_in_moodle: "Abrí esta página desde el aula virtual de Psicopatología I.",
  moodle_context_timeout: "El Campus no respondió. Recargá la página del aula.",
  moodle_context_failed: "El Campus no pudo identificarte. Volvé a entrar al aula.",
  identity_not_registered: "No figurás en la lista del parcial. Si rendiste, escribinos por el aula.",
  identity_mismatch: "Tu nombre en el Campus no coincide con el de la lista del parcial. Escribinos por el aula.",
  identity_not_verified: "Todavía no hay una devolución asociada a tu cuenta.",
  moodle_account_conflict: "Tu cuenta del Campus no coincide con la que rindió el parcial. Escribinos por el aula.",
  invalid_feedback_session: "La sesión venció. Recargá la página.",
};

function decir(texto, tono = "") {
  $("dev-estado").textContent = texto;
  $("dev-estado").dataset.tono = tono;
}

function mensaje(error) {
  const code = error instanceof Error ? error.message : String(error);
  return ERRORES[code] ?? `No pudimos abrir tu devolución (${code}). Probá recargar la página.`;
}

function pintarNotas(filas, propio) {
  pintarListaNotas($("notas-filas"), filas, propio);
  $("notas-copy").textContent = filas.length ? "Tu fila está resaltada." : "Todavía no hay notas publicadas.";
  $("notas").hidden = !filas.length;
}

// ---------------------------------------------------------- vista docente

async function vistaDocente(grader, sesion) {
  $("page-title").textContent = "Devoluciones del parcial";
  $("dev-lead").textContent = `Entraste como ${sesion.displayName}, del equipo docente. `
    + "Acá ves todas las notas y, tocando cada estudiante, su devolución tal como la va a leer.";
  const datos = await grader.overview(config.examId);
  const filas = datos.attempts ?? [];
  const publicadas = filas.filter((f) => f.gradingStatus === "published").length;
  const desaprobados = filas.filter((f) => f.result === "desaprobado").length;
  const sinResultado = filas.filter((f) => !f.result).length;
  $("docencia-copy").textContent = `${datos.examTitle}. ${filas.length} entregas, ${publicadas} publicadas. `
    + "Tocá un nombre para ver su devolución tal como la va a leer. Los estudiantes la ven sólo cuando se publica.";
  const resumen = $("docencia-resumen");
  resumen.replaceChildren();
  [[filas.length - desaprobados - sinResultado, "aprobados"], [desaprobados, "desaprobados"],
    [publicadas, "publicadas"], [sinResultado, "sin resultado"]].forEach(([n, t]) => {
    if (t === "sin resultado" && !n) return;
    const div = crear("div");
    div.append(crear("strong", null, String(n)), crear("span", null, t));
    resumen.append(div);
  });

  // Cada nombre abre, abajo, la devolución de ese estudiante tal como la va a leer.
  const cuerpo = $("docencia-filas");
  cuerpo.replaceChildren();
  filas.forEach((f) => {
    const tr = crear("tr");
    const nombre = crear("td");
    const abrir = crear("button", "dev-nombre", f.studentName);
    abrir.type = "button";
    abrir.addEventListener("click", () => {
      cuerpo.querySelectorAll("tr[data-abierta]").forEach((x) => delete x.dataset.abierta);
      tr.dataset.abierta = "true";
      abrirPrevia(grader, f);
    });
    nombre.append(abrir);
    const resultado = crear("td");
    if (f.result) resultado.append(etiquetaResultado(f.result));
    else resultado.textContent = "—";
    tr.append(nombre, crear("td", "num dev-fuerte", numero(f.finalScore)), resultado);
    cuerpo.append(tr);
  });
  $("docencia").hidden = false;
}

async function abrirPrevia(grader, fila) {
  decir("Cargando la devolución…");
  try {
    const snap = await grader.preview(fila.attemptId);
    $("previa-copy").textContent = fila.gradingStatus === "published"
      ? `Ya publicada: es lo que ve ${fila.studentName}.`
      : `Así la va a ver ${fila.studentName} cuando se publique. Todavía no la ve.`;
    pintarDevolucion($("previa"), snap);
    $("vista-previa").hidden = false;
    decir("");
    $("vista-previa").scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    decir(mensaje(error), "error");
  }
}

// ----------------------------------------------------------------- inicio

async function iniciar() {
  let context;
  try {
    context = await requestMoodleContext(config);
  } catch (error) {
    $("dev-lead").textContent = "";
    decir(mensaje(error), "error");
    return;
  }

  // Primero se pregunta si es del equipo docente: para el resto, el intento
  // falla en silencio y se sigue con la devolución del estudiante.
  // Un error del lado docente tampoco impide ver la devolución propia.
  const grader = new GraderApi(config);
  let sesion = null;
  try { sesion = await grader.login(context); } catch { sesion = null; }
  if (sesion) {
    try {
      await vistaDocente(grader, sesion);
    } catch (error) {
      decir(mensaje(error), "error");
    }
    return;
  }

  const feedback = new FeedbackApi({ ...config, apiUrl: config.feedbackApiUrl });
  try {
    await feedback.launch(context);
    const datos = await feedback.get();
    const propia = (datos.releases ?? []).find((r) => r.examId === config.examId) ?? (datos.releases ?? [])[0];
    if (!propia) {
      $("dev-lead").textContent = `${datos.studentName ?? ""}, tu devolución todavía no se publicó. Cuando esté lista, aparece acá.`;
      return;
    }
    $("dev-lead").textContent = `${datos.studentName}, esta es la corrección de tu parcial: la nota, `
      + "lo que escribiste con las marcas de la correctora y las respuestas de la opción múltiple.";
    pintarDevolucion($("mi-devolucion"), propia);
    $("mi-devolucion").hidden = false;
    pintarNotas(datos.courseGrades ?? [], datos.studentName);
  } catch (error) {
    $("dev-lead").textContent = "";
    decir(mensaje(error), "error");
  }
}

iniciar();
