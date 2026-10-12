// Mi devolución. El Campus le pasa a la página la identidad de quien la abre.
// Si es del equipo docente, se ven todas las notas y la vista previa de cada
// devolución, publicada o no. Si no, el servidor entrega sólo la devolución
// publicada de ese estudiante y la lista general de notas del curso.
import { requestMoodleContext } from "../parcial/api.js?v=4";
import { GraderApi } from "../docentes/api.js?v=5";
import { FeedbackApi } from "../devolucion/api.js?v=2";
import { pintarTexto } from "./marcas-texto.js?v=1";

const config = window.EXAM_CONFIG ?? {};
const $ = (id) => document.getElementById(id);

const crear = (tag, clase, texto) => {
  const nodo = document.createElement(tag);
  if (clase) nodo.className = clase;
  if (texto !== undefined && texto !== null) nodo.textContent = texto;
  return nodo;
};

const numero = (valor) => {
  if (valor === null || valor === undefined || valor === "") return "—";
  return Number(valor).toLocaleString("es-AR", { maximumFractionDigits: 2 });
};

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

// ------------------------------------------------------------ devolución

function etiquetaResultado(resultado) {
  const chip = crear("span", "dev-resultado", resultado === "desaprobado" ? "Desaprobado" : "Aprobado");
  chip.dataset.resultado = resultado === "desaprobado" ? "desaprobado" : "aprobado";
  return chip;
}

function pintarResumen(snap) {
  const caja = crear("div", "dev-nota card");
  const final = snap.finalScore ?? snap.totalScore;
  const izquierda = crear("div", "dev-nota__final");
  izquierda.append(crear("span", "dev-nota__rotulo", "Nota final"));
  const valor = crear("strong", "dev-nota__valor", numero(final));
  izquierda.append(valor, etiquetaResultado(snap.result));

  const partes = crear("dl", "dev-nota__partes");
  const fila = (rotulo, puntos, maximo) => {
    const div = crear("div");
    div.append(crear("dt", null, rotulo), crear("dd", null, `${numero(puntos)} / ${numero(maximo)}`));
    partes.append(div);
  };
  fila("Opción múltiple", snap.objectiveScore, snap.objectiveMaxScore);
  (snap.essays ?? []).forEach((ensayo, i) => fila(`Consigna ${i + 1}`, ensayo.score, ensayo.maxPoints));
  fila("Suma de puntos", snap.totalScore, snap.maxScore);

  caja.append(izquierda, partes);
  if (snap.result === "desaprobado" && Number(final) !== Number(snap.totalScore)) {
    caja.append(crear("p", "dev-nota__aclaracion",
      `La suma de puntos da ${numero(snap.totalScore)}, pero el parcial está desaprobado: `
      + "la aprobación se decide por las consignas a desarrollar, y un parcial desaprobado lleva 2 como nota final."));
  }
  return caja;
}

function pintarConsigna(ensayo, indice) {
  const bloque = crear("article", "dev-consigna card");
  const cabeza = crear("header", "dev-consigna__cabeza");
  cabeza.append(crear("h3", null, `Consigna ${indice + 1}`),
    crear("span", "dev-puntos", `${numero(ensayo.score)} / ${numero(ensayo.maxPoints)}`));
  bloque.append(cabeza, crear("p", "dev-consigna__enunciado", ensayo.prompt));

  if ((ensayo.generalFeedback ?? "").trim()) {
    const devolucion = crear("div", "dev-devolucion");
    devolucion.append(crear("p", "dev-rotulo", "Devolución"), crear("p", null, ensayo.generalFeedback));
    bloque.append(devolucion);
  }

  bloque.append(crear("p", "dev-rotulo", "Lo que escribiste"));
  const texto = ensayo.response ?? "";
  if (!texto.trim()) {
    bloque.append(crear("p", "dev-respuesta dev-respuesta--vacia", "No respondiste esta consigna."));
    return bloque;
  }
  const marcas = ensayo.annotations ?? [];
  if (marcas.length) {
    const palabras = marcas.filter((m) => m.kind === "spelling").length;
    const tildes = marcas.filter((m) => m.kind === "accent").length;
    const leyenda = crear("p", "dev-leyenda");
    if (palabras) leyenda.append(crear("span", "dev-leyenda__palabra", `${palabras} ${palabras === 1 ? "palabra mal escrita" : "palabras mal escritas"}`));
    if (tildes) leyenda.append(crear("span", "dev-leyenda__tilde", `${tildes} ${tildes === 1 ? "tilde" : "tildes"}`));
    if (palabras || tildes) leyenda.append(crear("span", null, "La forma correcta va arriba de cada palabra marcada."));
    if (leyenda.childNodes.length) bloque.append(leyenda);
  }
  const respuesta = crear("div", "dev-respuesta");
  const comentarios = pintarTexto(respuesta, texto, marcas);
  bloque.append(respuesta);

  if (comentarios.length) {
    const lista = crear("ol", "comentarios dev-comentarios");
    comentarios.forEach((c, i) => {
      const item = crear("li");
      const cita = c.selectedText.replace(/\s+/g, " ").trim();
      item.append(
        crear("span", "comentarios__n", String(i + 1)),
        crear("span", "comentarios__cita", `«${cita.length > 80 ? `${cita.slice(0, 79)}…` : cita}»`),
        crear("span", "comentarios__texto", c.comment),
      );
      lista.append(item);
    });
    bloque.append(crear("p", "dev-rotulo", "Comentarios sobre tu texto"), lista);
  }
  return bloque;
}

function pintarOpcionMultiple(preguntas) {
  const bloque = crear("article", "dev-om card");
  const bien = preguntas.filter((p) => p.correct).length;
  const cabeza = crear("header", "dev-consigna__cabeza");
  cabeza.append(crear("h3", null, "Opción múltiple"),
    crear("span", "dev-puntos", `${bien} de ${preguntas.length} correctas`));
  bloque.append(cabeza);
  const lista = crear("ol", "dev-om__lista");
  preguntas.forEach((p) => {
    const item = crear("li", "dev-om__pregunta");
    item.dataset.correcta = String(Boolean(p.correct));
    const enunciado = crear("p", "dev-om__enunciado");
    enunciado.append(crear("span", "dev-om__marca", p.correct ? "Bien" : p.answered ? "Mal" : "Sin responder"),
      document.createTextNode(` ${p.prompt}`));
    item.append(enunciado);
    const opciones = crear("ul", "dev-om__opciones");
    (p.options ?? []).forEach((o, k) => {
      const opcion = crear("li", "dev-om__opcion");
      if (o.correct) opcion.dataset.correcta = "true";
      if (o.chosen) opcion.dataset.elegida = "true";
      opcion.append(crear("span", "dev-om__letra", String.fromCharCode(97 + k)), crear("span", null, o.label));
      const notas = [];
      if (o.chosen) notas.push("tu respuesta");
      if (o.correct) notas.push("correcta");
      if (notas.length) opcion.append(crear("span", "dev-om__nota", notas.join(" · ")));
      opciones.append(opcion);
    });
    item.append(opciones);
    lista.append(item);
  });
  bloque.append(lista);
  return bloque;
}

function pintarDevolucion(destino, snap) {
  destino.replaceChildren();
  const cabeza = crear("div", "section-head");
  cabeza.append(crear("h2", "section-head__title", snap.examTitle ?? "Parcial"));
  if (snap.publishedAt) {
    cabeza.append(crear("p", "section-head__subtitle",
      `Publicado el ${new Date(snap.publishedAt).toLocaleDateString("es-AR", { day: "numeric", month: "long" })}.`));
  }
  destino.append(cabeza, pintarResumen(snap));
  (snap.essays ?? []).forEach((ensayo, i) => destino.append(pintarConsigna(ensayo, i)));
  if ((snap.multipleChoice ?? []).length) destino.append(pintarOpcionMultiple(snap.multipleChoice));
}

function pintarNotas(filas, propio) {
  const cuerpo = $("notas-filas");
  cuerpo.replaceChildren();
  filas.forEach((f) => {
    const tr = crear("tr");
    if (propio && f.studentName === propio) tr.dataset.propio = "true";
    const resultado = crear("td");
    resultado.append(etiquetaResultado(f.result));
    tr.append(crear("td", null, f.studentName), crear("td", "num", numero(f.finalScore)), resultado);
    cuerpo.append(tr);
  });
  const aprobados = filas.filter((f) => f.result !== "desaprobado").length;
  $("notas-copy").textContent = filas.length
    ? `${aprobados} de ${filas.length} aprobaron. Tu fila está resaltada.`
    : "Todavía no hay notas publicadas.";
  $("notas").hidden = !filas.length;
}

// ---------------------------------------------------------- vista docente

const ESTADOS = {
  unassigned: "Sin asignar",
  in_review: "En corrección",
  reviewed: "Revisada",
  ready_to_publish: "Lista para publicar",
  published: "Publicada",
};

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
    + "Los estudiantes ven su devolución y la lista de notas sólo cuando se publica.";
  const resumen = $("docencia-resumen");
  resumen.replaceChildren();
  [[filas.length - desaprobados - sinResultado, "aprobados"], [desaprobados, "desaprobados"],
    [publicadas, "publicadas"], [sinResultado, "sin resultado"]].forEach(([n, t]) => {
    if (t === "sin resultado" && !n) return;
    const div = crear("div");
    div.append(crear("strong", null, String(n)), crear("span", null, t));
    resumen.append(div);
  });

  const cuerpo = $("docencia-filas");
  cuerpo.replaceChildren();
  filas.forEach((f) => {
    const tr = crear("tr");
    const resultado = crear("td");
    if (f.result) resultado.append(etiquetaResultado(f.result));
    else resultado.textContent = "—";
    const accion = crear("td");
    const ver = crear("button", "btn btn--ghost dev-ver", "Ver devolución");
    ver.type = "button";
    ver.addEventListener("click", () => abrirPrevia(grader, f));
    accion.append(ver);
    tr.append(
      crear("td", null, f.studentName),
      crear("td", "dev-muted", f.grader ?? "—"),
      crear("td", "num", numero(f.objectiveScore)),
      crear("td", "num", numero(f.manualScore)),
      crear("td", "num dev-fuerte", numero(f.finalScore)),
      resultado,
      crear("td", "dev-muted", ESTADOS[f.gradingStatus] ?? f.gradingStatus),
      accion,
    );
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
