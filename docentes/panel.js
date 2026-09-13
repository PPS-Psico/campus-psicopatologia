import { GraderApi } from "./api.js?v=3";
import { requestMoodleContext } from "../parcial/api.js?v=3";

const config = window.EXAM_CONFIG ?? {};
const api = new GraderApi(config);

const el = (id) => document.getElementById(id);

const ESTADOS = [
  { key: null, label: "Todas", count: null },
  { key: "unassigned", label: "Sin asignar", count: "unassigned" },
  { key: "in_review", label: "En corrección", count: "inReview" },
  { key: "reviewed", label: "Revisadas", count: "reviewed" },
  { key: "ready_to_publish", label: "Listas", count: "readyToPublish" },
  { key: "published", label: "Publicadas", count: "published" },
];

const ETIQUETA_ESTADO = {
  unassigned: "Sin asignar",
  in_review: "En corrección",
  reviewed: "Revisada",
  ready_to_publish: "Lista para publicar",
  published: "Publicada",
};

const ERRORES = {
  not_a_grader: "Este espacio es sólo para el equipo docente.",
  invalid_grader_session: "Tu sesión venció. Recargá la página del aula.",
  not_embedded_in_moodle: "Abrí la corrección desde el aula virtual.",
  moodle_context_timeout: "El Campus no respondió. Recargá la página.",
  moodle_context_failed: "El Campus no pudo identificarte. Volvé a entrar al aula.",
  grading_version_conflict: "Alguien más guardó esta corrección mientras la editabas. Se recargó con la versión vigente; revisá antes de volver a guardar.",
  attempt_already_claimed: "Esta entrega ya está tomada por la otra correctora.",
  attempt_not_owned: "Para editarla tenés que tomarla primero.",
  attempt_not_editable: "Esta entrega ya no admite cambios en este estado.",
  essay_grades_incomplete: "Faltan puntajes por completar antes de marcarla revisada.",
  manual_score_exceeds_maximum: "El puntaje supera el máximo de la consigna.",
  coordinator_required: "Publicar es una acción de coordinación.",
  attempt_not_reviewed: "Primero hay que marcarla como revisada.",
  attempt_not_ready_to_publish: "Antes de publicar hay que marcarla como lista.",
};

const estado = {
  perfil: null,
  examenes: [],
  examenId: null,
  filtro: null,
  cola: null,
  ficha: null,
  guardando: false,
};

function mensajeDe(error) {
  const code = error instanceof Error ? error.message : String(error);
  return ERRORES[code] ?? `No pudimos completar la acción (${code}).`;
}

function decir(texto, tono = "") {
  el("sheet-status").textContent = texto;
  el("sheet-status").dataset.tone = tono;
}

function fecha(valor) {
  if (!valor) return "—";
  try {
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
    }).format(new Date(valor));
  } catch { return "—"; }
}

function puntaje(valor, maximo) {
  if (valor === null || valor === undefined) return `— / ${Number(maximo ?? 0)}`;
  return `${Number(valor)} / ${Number(maximo ?? 0)}`;
}

// ---------------------------------------------------------------- ingreso

async function abrir() {
  try {
    const context = await requestMoodleContext(config);
    const sesion = await api.login(context);
    estado.perfil = sesion;
    const datos = await api.bootstrap();
    estado.examenes = Array.isArray(datos.exams) ? datos.exams : [];
    el("who").textContent = `${sesion.displayName} · ${sesion.role === "coordinator" ? "coordinación" : "corrección"}`;
    el("gate").hidden = true;
    el("body").hidden = false;
    pintarExamenes();
    if (estado.examenes.length) {
      estado.examenId = estado.examenes[0].examId;
      el("exam-select").value = estado.examenId;
      await cargarCola();
    }
  } catch (error) {
    const code = error instanceof Error ? error.message : String(error);
    el("gate-title").textContent = code === "not_a_grader"
      ? "Este espacio es del equipo docente"
      : "No pudimos abrir la corrección";
    el("gate-copy").textContent = mensajeDe(error);
    el("gate-code").textContent = ERRORES[code] ? "" : `Código: ${code}`;
  }
}

function pintarExamenes() {
  const select = el("exam-select");
  select.replaceChildren();
  for (const examen of estado.examenes) {
    const option = document.createElement("option");
    option.value = examen.examId;
    option.textContent = `${examen.title} · ${examen.pendingCount} sin publicar`;
    select.append(option);
  }
  select.addEventListener("change", async () => {
    estado.examenId = select.value;
    estado.ficha = null;
    pintarFicha();
    await cargarCola();
  });
}

// ------------------------------------------------------------------ cola

async function cargarCola() {
  if (!estado.examenId) return;
  try {
    estado.cola = await api.queue(estado.examenId, estado.filtro);
    pintarFiltros();
    pintarCola();
  } catch (error) {
    el("queue-empty").hidden = false;
    el("queue-empty").textContent = mensajeDe(error);
  }
}

function pintarFiltros() {
  const nav = el("filters");
  nav.replaceChildren();
  const counts = estado.cola?.counts ?? {};
  for (const filtro of ESTADOS) {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "filter";
    boton.dataset.active = String(estado.filtro === filtro.key);
    const total = filtro.count ? counts[filtro.count] ?? 0 : Object.values(counts).reduce((a, b) => a + b, 0);
    boton.innerHTML = `<span>${filtro.label}</span><strong>${total}</strong>`;
    boton.addEventListener("click", async () => {
      estado.filtro = filtro.key;
      await cargarCola();
    });
    nav.append(boton);
  }
}

function pintarCola() {
  const lista = el("queue-list");
  lista.replaceChildren();
  const entregas = estado.cola?.attempts ?? [];
  el("queue-empty").hidden = entregas.length > 0;
  el("queue-empty").textContent = "No hay entregas en este estado.";

  for (const entrega of entregas) {
    const fila = document.createElement("button");
    fila.type = "button";
    fila.className = "queue__item";
    fila.dataset.active = String(estado.ficha?.attemptId === entrega.attemptId);
    fila.dataset.status = entrega.gradingStatus;
    const tomada = entrega.assignedTo
      ? `<span class="queue__by">${entrega.assignedTo.displayName}</span>`
      : "";
    fila.innerHTML = `
      <span class="queue__name">${entrega.studentName}</span>
      <span class="queue__state">${ETIQUETA_ESTADO[entrega.gradingStatus] ?? entrega.gradingStatus}${tomada}</span>
      <span class="queue__score">${puntaje(entrega.objectiveScore, entrega.objectiveMaxScore)}</span>
      <span class="queue__time">${fecha(entrega.submittedAt)}</span>`;
    fila.addEventListener("click", () => abrirFicha(entrega.attemptId));
    lista.append(fila);
  }
}

// ----------------------------------------------------------------- ficha

async function abrirFicha(attemptId) {
  decir("");
  try {
    estado.ficha = await api.get(attemptId);
    pintarFicha();
    pintarCola();
  } catch (error) {
    decir(mensajeDe(error), "error");
  }
}

function pintarFicha() {
  const contenido = el("sheet-content");
  el("sheet-idle").hidden = Boolean(estado.ficha);
  contenido.hidden = !estado.ficha;
  if (!estado.ficha) return;

  const f = estado.ficha;
  el("sheet-title").textContent = f.studentName;
  el("sheet-meta").textContent = [
    ETIQUETA_ESTADO[f.gradingStatus] ?? f.gradingStatus,
    `entregado ${fecha(f.submittedAt)}`,
    f.assignedTo ? `tomada por ${f.assignedTo.displayName}` : "sin tomar",
  ].join(" · ");

  el("sheet-scores").innerHTML = `
    <div><dt>Opción múltiple</dt><dd>${puntaje(f.objectiveScore, f.objectiveMaxScore)}</dd></div>
    <div><dt>Escrita</dt><dd>${puntaje(f.manualScore, f.manualMaxScore)}</dd></div>
    <div><dt>Total</dt><dd>${f.totalScore === null || f.totalScore === undefined ? "pendiente" : Number(f.totalScore)}</dd></div>`;

  pintarConsignas();
  pintarAcciones();
}

function pintarConsignas() {
  const zona = el("essays");
  zona.replaceChildren();
  const propia = esPropia();

  for (const ensayo of estado.ficha.essays ?? []) {
    const bloque = document.createElement("article");
    bloque.className = "essay";

    const consigna = document.createElement("p");
    consigna.className = "essay__prompt";
    consigna.textContent = ensayo.prompt;

    const respuesta = document.createElement("blockquote");
    respuesta.className = "essay__response";
    respuesta.textContent = ensayo.response || "(sin respuesta)";

    const grilla = document.createElement("div");
    grilla.className = "essay__grade";

    const puntajeCampo = document.createElement("label");
    puntajeCampo.className = "field field--score";
    puntajeCampo.innerHTML = `<span>Puntaje (máx. ${Number(ensayo.maxPoints)})</span>`;
    const inputPuntaje = document.createElement("input");
    inputPuntaje.type = "number";
    inputPuntaje.min = "0";
    inputPuntaje.max = String(ensayo.maxPoints);
    inputPuntaje.step = "0.25";
    inputPuntaje.value = ensayo.grade?.score ?? "";
    inputPuntaje.disabled = !propia;
    inputPuntaje.dataset.item = ensayo.itemId;
    inputPuntaje.dataset.rol = "score";
    puntajeCampo.append(inputPuntaje);

    const devolucion = document.createElement("label");
    devolucion.className = "field";
    devolucion.innerHTML = "<span>Devolución para el estudiante</span>";
    const areaDevolucion = document.createElement("textarea");
    areaDevolucion.rows = 5;
    areaDevolucion.value = ensayo.grade?.generalFeedback ?? "";
    areaDevolucion.disabled = !propia;
    areaDevolucion.dataset.item = ensayo.itemId;
    areaDevolucion.dataset.rol = "feedback";
    devolucion.append(areaDevolucion);

    const nota = document.createElement("label");
    nota.className = "field";
    nota.innerHTML = "<span>Nota interna · no la ve el estudiante</span>";
    const areaNota = document.createElement("textarea");
    areaNota.rows = 3;
    areaNota.value = ensayo.grade?.internalNote ?? "";
    areaNota.disabled = !propia;
    areaNota.dataset.item = ensayo.itemId;
    areaNota.dataset.rol = "note";
    nota.append(areaNota);

    grilla.append(puntajeCampo, devolucion, nota);
    bloque.append(consigna, respuesta, grilla);
    zona.append(bloque);
  }

  if (!(estado.ficha.essays ?? []).length) {
    const vacio = document.createElement("p");
    vacio.className = "essay__empty";
    vacio.textContent = "Esta evaluación no tiene consignas escritas: la corrección es automática.";
    zona.append(vacio);
  }
}

function esPropia() {
  const f = estado.ficha;
  return Boolean(f?.assignedTo && f.assignedTo.userId === estado.perfil?.userId
    && f.gradingStatus === "in_review");
}

function pintarAcciones() {
  const zona = el("actions");
  zona.replaceChildren();
  const f = estado.ficha;
  const coordina = estado.perfil?.role === "coordinator";

  const boton = (texto, variante, accion, habilitado = true) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = `btn btn--${variante}`;
    b.textContent = texto;
    b.disabled = !habilitado || estado.guardando;
    b.addEventListener("click", accion);
    zona.append(b);
    return b;
  };

  if (f.gradingStatus === "unassigned") {
    boton("Tomar para corregir", "primary", () => ejecutar(() => api.claim(f.attemptId)));
  }
  if (esPropia()) {
    boton("Guardar", "primary", guardar);
    boton("Marcar revisada", "secondary", () => ejecutar(
      () => api.markReviewed(f.attemptId, f.gradingVersion),
    ));
    boton("Soltar", "ghost", async () => {
      const motivo = prompt("¿Por qué la soltás? (queda en la auditoría)");
      if (!motivo || motivo.trim().length < 3) return;
      await ejecutar(() => api.release(f.attemptId, motivo.trim()));
    });
  }
  if (f.gradingStatus === "reviewed" && coordina) {
    boton("Marcar lista para publicar", "primary", () => ejecutar(
      () => api.markReady(f.attemptId, f.gradingVersion),
    ));
  }
  if (f.gradingStatus === "ready_to_publish" && coordina) {
    boton("Publicar devolución", "primary", () => ejecutar(
      () => api.publish(f.attemptId, f.gradingVersion),
    ));
  }
  if (f.gradingStatus === "published") {
    const nota = document.createElement("p");
    nota.className = "sheet__published";
    nota.textContent = "Publicada. Para cambiarla hay que reabrirla, y eso queda registrado.";
    zona.append(nota);
  }
}

function recolectarEnsayos() {
  const porItem = new Map();
  for (const campo of el("essays").querySelectorAll("[data-item]")) {
    const item = campo.dataset.item;
    if (!porItem.has(item)) {
      porItem.set(item, { itemId: item, score: null, generalFeedback: "", internalNote: "" });
    }
    const entrada = porItem.get(item);
    if (campo.dataset.rol === "score") {
      entrada.score = campo.value === "" ? null : Number(campo.value);
    }
    if (campo.dataset.rol === "feedback") entrada.generalFeedback = campo.value;
    if (campo.dataset.rol === "note") entrada.internalNote = campo.value;
  }
  return [...porItem.values()];
}

async function guardar() {
  const ensayos = recolectarEnsayos();
  if (!ensayos.length) return;
  await ejecutar(() => api.saveDraft(
    estado.ficha.attemptId, estado.ficha.gradingVersion, ensayos,
  ), "Guardado.");
}

// Toda acción vuelve a traer la ficha y la cola: el servidor es la única fuente
// de verdad sobre la versión, y trabajar sobre una versión vieja es justamente
// lo que el control de concurrencia impide.
async function ejecutar(accion, exito = "Listo.") {
  if (estado.guardando) return;
  estado.guardando = true;
  decir("Guardando…");
  try {
    await accion();
    estado.ficha = await api.get(estado.ficha.attemptId);
    await cargarCola();
    pintarFicha();
    decir(exito, "ok");
  } catch (error) {
    const code = error instanceof Error ? error.message : String(error);
    if (code === "grading_version_conflict") {
      estado.ficha = await api.get(estado.ficha.attemptId);
      await cargarCola();
      pintarFicha();
    }
    decir(mensajeDe(error), "error");
  } finally {
    estado.guardando = false;
    if (estado.ficha) pintarAcciones();
  }
}

abrir();
