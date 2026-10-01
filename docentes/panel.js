import { GraderApi } from "./api.js?v=4";
import { requestMoodleContext } from "../parcial/api.js?v=4";
import { pintarTexto, posicionEnTexto, TIPOS } from "../assets/marcas-texto.js?v=1";

const el = (id) => document.getElementById(id);

// Adentro de un iframe de otro dominio no hay consola a la que asomarse. Cada
// paso del ingreso deja su huella en la pantalla: si algo se corta, se ve dónde.
function paso(texto) {
  const destino = el("gate-copy");
  if (destino) destino.textContent = texto;
}

function morir(detalle) {
  const codigo = el("gate-code");
  if (codigo) codigo.textContent = String(detalle).slice(0, 300);
}

globalThis.addEventListener("error", (e) => morir(`error: ${e.message}`));
globalThis.addEventListener("unhandledrejection", (e) => morir(`promesa: ${e.reason?.message ?? e.reason}`));

paso("Preparando el panel…");

const config = window.EXAM_CONFIG ?? {};
const api = new GraderApi(config);
paso("Pidiéndole tus datos al Campus…");

// Las entregas se reparten solas entre las correctoras apenas terminan: «Mías»
// es la lista de trabajo de cada una, y por eso es la que se abre primero.
const ESTADOS = [
  { key: "mias", label: "Mías", count: "mias" },
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
  annotation_text_mismatch: "Una marca no coincide con el texto del estudiante. Recargá la entrega y volvé a marcarla.",
  invalid_annotation_entry: "Hay una marca incompleta: a la de ortografía le falta la forma correcta, o al comentario el texto.",
  invalid_annotation_batch: "Hay demasiadas marcas en una sola consigna.",
};

const estado = {
  perfil: null,
  examenes: [],
  examenId: null,
  filtro: "mias",
  cola: null,
  ficha: null,
  guardando: false,
  // Las marcas sobre el texto se arman acá y viajan al servidor con «Guardar».
  anotaciones: {},
  anotacionesDe: null,
  sinGuardar: false,
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
    paso("Verificando que figures como correctora…");
    const sesion = await api.login(context);
    paso("Cargando las evaluaciones…");
    const datos = await api.bootstrap();
    // El ingreso devuelve el nombre y el rol, pero no el id del perfil: ese lo
    // trae bootstrap. Sin el id, «esta entrega es mía» siempre da que no, y los
    // campos quedan bloqueados aunque la hayas tomado.
    estado.perfil = { ...sesion, ...(datos.profile ?? {}) };
    estado.examenes = Array.isArray(datos.exams) ? datos.exams : [];
    el("who").textContent = `${estado.perfil.displayName} · ${estado.perfil.role === "coordinator" ? "coordinación" : "corrección"}`;
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
    // Se trae la lista completa y se filtra acá: «Mías» no es un estado del
    // servidor, y así los contadores de todos los filtros salen de una vez.
    estado.cola = await api.queue(estado.examenId, null);
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
    const total = filtro.key === "mias"
      ? entregasDe("mias").length
      : filtro.count ? counts[filtro.count] ?? 0 : Object.values(counts).reduce((a, b) => a + b, 0);
    boton.innerHTML = `<span>${filtro.label}</span><strong>${total}</strong>`;
    boton.addEventListener("click", async () => {
      estado.filtro = filtro.key;
      await cargarCola();
    });
    nav.append(boton);
  }
}

function entregasDe(filtro) {
  const todas = estado.cola?.attempts ?? [];
  if (filtro === "mias") {
    return todas.filter((e) => e.assignedTo?.userId === estado.perfil?.userId
      && e.gradingStatus !== "published");
  }
  if (!filtro) return todas;
  return todas.filter((e) => e.gradingStatus === filtro);
}

function pintarCola() {
  const lista = el("queue-list");
  lista.replaceChildren();
  const entregas = entregasDe(estado.filtro);
  el("queue-empty").hidden = entregas.length > 0;
  el("queue-empty").textContent = estado.filtro === "mias"
    ? "No tenés entregas asignadas en esta evaluación."
    : "No hay entregas en este estado.";

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
  cargarAnotaciones();
  el("sheet-title").textContent = f.studentName;
  el("sheet-meta").textContent = [
    ETIQUETA_ESTADO[f.gradingStatus] ?? f.gradingStatus,
    `entregado ${fecha(f.submittedAt)}`,
    f.assignedTo ? `tomada por ${f.assignedTo.displayName}` : "sin tomar",
  ].join(" · ");

  // El puntaje de la escrita recién queda firme al marcarla revisada. Hasta
  // entonces el servidor lo devuelve vacío, y quien corrige no ve lo que acaba
  // de guardar: el borrador se suma acá para que el número no desaparezca.
  const borrador = (f.essays ?? []).reduce(
    (suma, e) => (e.grade?.score === null || e.grade?.score === undefined
      ? suma
      : (suma ?? 0) + Number(e.grade.score)),
    null,
  );
  const escrita = f.manualScore === null || f.manualScore === undefined
    ? (borrador === null ? puntaje(null, f.manualMaxScore) : `${borrador} / ${Number(f.manualMaxScore ?? 0)}`)
    : puntaje(f.manualScore, f.manualMaxScore);
  const escritaNota = f.manualScore === null || f.manualScore === undefined
    ? (borrador === null ? "" : '<small class="sheet__draft">borrador, sin confirmar</small>')
    : "";

  el("sheet-scores").innerHTML = `
    <div><dt>Opción múltiple</dt><dd>${puntaje(f.objectiveScore, f.objectiveMaxScore)}</dd></div>
    <div><dt>Escrita</dt><dd>${escrita}</dd>${escritaNota}</div>
    <div><dt>Total</dt><dd>${f.totalScore === null || f.totalScore === undefined ? "pendiente" : Number(f.totalScore)}</dd></div>`;

  pintarConsignas();
  pintarAcciones();
}

// Cada vez que llega una versión nueva de la entrega desde el servidor, las
// marcas se toman de ahí: lo que no se guardó antes de un conflicto se pierde,
// igual que el puntaje y la devolución.
function cargarAnotaciones() {
  const f = estado.ficha;
  const clave = `${f.attemptId}:${f.gradingVersion}`;
  if (estado.anotacionesDe === clave) return;
  estado.anotacionesDe = clave;
  estado.sinGuardar = false;
  estado.anotaciones = {};
  for (const ensayo of f.essays ?? []) {
    estado.anotaciones[ensayo.itemId] = (ensayo.annotations ?? []).map((a) => ({
      kind: a.kind ?? "comment",
      startOffset: a.startOffset,
      endOffset: a.endOffset,
      selectedText: a.selectedText,
      suggestion: a.suggestion ?? null,
      comment: a.comment ?? "",
      visibleToStudent: a.visibleToStudent !== false,
    }));
  }
}

const nuevo = (tag, clase, texto) => {
  const nodo = document.createElement(tag);
  if (clase) nodo.className = clase;
  if (texto !== undefined) nodo.textContent = texto;
  return nodo;
};

const resumir = (texto, largo = 90) => {
  const plano = texto.replace(/\s+/g, " ").trim();
  return plano.length > largo ? `${plano.slice(0, largo - 1)}…` : plano;
};

// El texto del estudiante con las marcas encima. Quien tiene tomada la entrega
// selecciona un fragmento y elige: comentarlo, o marcar una palabra mal escrita
// o una tilde con la forma correcta. Nada de esto cambia lo que escribió.
function zonaTexto(ensayo, propia) {
  const caja = nuevo("div", "essay__text");
  const texto = ensayo.response ?? "";
  const respuesta = nuevo("div", "essay__response");
  const barra = nuevo("div", "marcar");
  barra.hidden = true;
  barra.setAttribute("role", "group");
  barra.setAttribute("aria-label", "Marcar el fragmento seleccionado");
  const lista = nuevo("ol", "comentarios");
  const resumen = nuevo("p", "marcar__resumen");
  caja.append(respuesta, barra, lista, resumen);

  if (!texto.trim()) {
    respuesta.textContent = "(sin respuesta)";
    lista.hidden = true;
    resumen.hidden = true;
    return caja;
  }

  const marcas = () => estado.anotaciones[ensayo.itemId] ?? [];
  let seleccion = null;

  const cerrar = () => {
    barra.hidden = true;
    barra.replaceChildren();
    seleccion = null;
    respuesta.querySelectorAll(".marca[data-activa]").forEach((m) => delete m.dataset.activa);
  };

  const cambiar = (transformar) => {
    estado.anotaciones[ensayo.itemId] = transformar(marcas().slice());
    estado.sinGuardar = true;
    decir("Hay marcas sin guardar: tocá «Guardar».");
    cerrar();
    pintar();
  };

  function pintar() {
    const comentarios = pintarTexto(respuesta, texto, marcas());
    lista.replaceChildren();
    lista.hidden = comentarios.length === 0;
    comentarios.forEach((comentario, i) => {
      const item = nuevo("li");
      item.append(
        nuevo("span", "comentarios__n", String(i + 1)),
        nuevo("span", "comentarios__cita", `«${resumir(comentario.selectedText, 70)}»`),
        nuevo("span", "comentarios__texto", comentario.comment),
      );
      if (propia) {
        const acciones = nuevo("span", "comentarios__acciones");
        const editar = nuevo("button", "enlace", "Editar");
        editar.type = "button";
        editar.addEventListener("click", () => {
          seleccion = { desde: comentario.startOffset, hasta: comentario.endOffset, cita: comentario.selectedText };
          formulario("comment", comentario);
        });
        const quitar = nuevo("button", "enlace", "Quitar");
        quitar.type = "button";
        quitar.addEventListener("click", () => cambiar((todas) => todas.filter((m) => m !== comentario)));
        acciones.append(editar, quitar);
        item.append(acciones);
      }
      lista.append(item);
    });
    const ortografia = marcas().filter((m) => m.kind !== "comment");
    const palabras = ortografia.filter((m) => m.kind === "spelling").length;
    const tildes = ortografia.length - palabras;
    const partes = [];
    if (palabras) partes.push(`${palabras} ${palabras === 1 ? "palabra mal escrita" : "palabras mal escritas"}`);
    if (tildes) partes.push(`${tildes} ${tildes === 1 ? "tilde" : "tildes"}`);
    resumen.textContent = partes.length
      ? `Ortografía marcada: ${partes.join(" y ")}.`
      : propia ? "Seleccioná un fragmento del texto para comentarlo o marcar una falta de ortografía." : "";
    resumen.hidden = !resumen.textContent;
  }

  function opciones() {
    barra.replaceChildren();
    barra.hidden = false;
    const fila = nuevo("div", "marcar__fila");
    fila.append(nuevo("q", "marcar__cita", resumir(seleccion.cita)));
    const corta = seleccion.hasta - seleccion.desde <= 60 && !seleccion.cita.includes("\n");
    const accion = (texto, alHacer, habilitado = true) => {
      const boton = nuevo("button", "btn btn--secondary btn--sm", texto);
      boton.type = "button";
      boton.disabled = !habilitado;
      boton.addEventListener("click", alHacer);
      fila.append(boton);
    };
    accion("Comentar", () => formulario("comment"));
    accion("Mal escrita", () => formulario("spelling"), corta);
    accion("Tilde", () => formulario("accent"), corta);
    accion("Cancelar", cerrar);
    barra.append(fila);
  }

  function formulario(kind, existente = null) {
    barra.replaceChildren();
    barra.hidden = false;
    const titulo = nuevo("p", "marcar__titulo");
    titulo.append(
      document.createTextNode(kind === "comment" ? "Comentario sobre " : `${TIPOS[kind]} en `),
      nuevo("q", "marcar__cita", resumir(seleccion.cita)),
    );
    const etiqueta = nuevo("label", "field");
    etiqueta.append(nuevo("span", null, kind === "comment" ? "Lo que va a leer el estudiante" : "Se escribe"));
    const campo = kind === "comment" ? nuevo("textarea") : nuevo("input");
    if (kind === "comment") {
      campo.rows = 3;
      campo.value = existente?.comment ?? "";
    } else {
      campo.type = "text";
      campo.maxLength = 200;
      campo.value = existente?.suggestion ?? seleccion.cita;
    }
    etiqueta.append(campo);
    const aviso = nuevo("p", "marcar__aviso");
    const fila = nuevo("div", "marcar__fila");
    const listo = nuevo("button", "btn btn--primary btn--sm", existente ? "Cambiar" : "Agregar marca");
    listo.type = "button";
    const no = nuevo("button", "btn btn--ghost btn--sm", "Cancelar");
    no.type = "button";
    no.addEventListener("click", cerrar);
    fila.append(listo, no);
    barra.append(titulo, etiqueta, aviso, fila);
    campo.focus();
    if (kind !== "comment") campo.select();

    listo.addEventListener("click", () => {
      const valor = campo.value.trim();
      if (!valor) { aviso.textContent = kind === "comment" ? "Escribí el comentario." : "Escribí la forma correcta."; return; }
      if (kind !== "comment" && valor === seleccion.cita) { aviso.textContent = "La forma correcta es igual a lo que escribió."; return; }
      const choca = kind !== "comment" && marcas().some((m) => m !== existente && m.kind !== "comment"
        && m.startOffset < seleccion.hasta && seleccion.desde < m.endOffset);
      if (choca) { aviso.textContent = "Ese fragmento ya tiene una marca de ortografía. Quitala primero."; return; }
      const marca = {
        kind,
        startOffset: seleccion.desde,
        endOffset: seleccion.hasta,
        selectedText: texto.slice(seleccion.desde, seleccion.hasta),
        suggestion: kind === "comment" ? null : valor,
        comment: kind === "comment" ? valor : "",
        visibleToStudent: true,
      };
      cambiar((todas) => (existente ? todas.map((m) => (m === existente ? marca : m)) : [...todas, marca]));
    });
  }

  if (propia) {
    const alSeleccionar = () => {
      const sel = globalThis.getSelection();
      if (!sel || sel.isCollapsed || !sel.rangeCount) return;
      const rango = sel.getRangeAt(0);
      if (!respuesta.contains(rango.startContainer) || !respuesta.contains(rango.endContainer)) return;
      let desde = posicionEnTexto(respuesta, rango.startContainer, rango.startOffset);
      let hasta = posicionEnTexto(respuesta, rango.endContainer, rango.endOffset);
      while (desde < hasta && /\s/.test(texto[desde])) desde++;
      while (hasta > desde && /\s/.test(texto[hasta - 1])) hasta--;
      if (hasta <= desde) return;
      seleccion = { desde, hasta, cita: texto.slice(desde, hasta) };
      opciones();
    };
    respuesta.addEventListener("mouseup", () => setTimeout(alSeleccionar, 0));
    respuesta.addEventListener("keyup", (evento) => { if (evento.shiftKey) alSeleccionar(); });
    respuesta.addEventListener("click", (evento) => {
      const nodo = evento.target.closest(".marca");
      if (!nodo || !globalThis.getSelection().isCollapsed) return;
      const marca = marcas().find((m) => m.kind !== "comment" && String(m.startOffset) === nodo.dataset.desde);
      if (!marca) return;
      cerrar();
      nodo.dataset.activa = "true";
      seleccion = { desde: marca.startOffset, hasta: marca.endOffset, cita: marca.selectedText };
      barra.hidden = false;
      const fila = nuevo("div", "marcar__fila");
      fila.append(
        nuevo("span", null, `${TIPOS[marca.kind]}:`),
        nuevo("q", "marcar__cita", marca.selectedText),
        document.createTextNode("→"),
        nuevo("q", "marcar__cita", marca.suggestion),
      );
      const editar = nuevo("button", "btn btn--secondary btn--sm", "Cambiar");
      editar.type = "button";
      editar.addEventListener("click", () => formulario(marca.kind, marca));
      const quitar = nuevo("button", "btn btn--secondary btn--sm", "Quitar la marca");
      quitar.type = "button";
      quitar.addEventListener("click", () => cambiar((todas) => todas.filter((m) => m !== marca)));
      const cerrarBoton = nuevo("button", "btn btn--ghost btn--sm", "Cerrar");
      cerrarBoton.type = "button";
      cerrarBoton.addEventListener("click", cerrar);
      fila.append(editar, quitar, cerrarBoton);
      barra.append(fila);
    });
  }

  pintar();
  return caja;
}

function motivoBloqueo() {
  const f = estado.ficha;
  if (f.gradingStatus === "unassigned") {
    return "Para escribir el puntaje y la devolución tenés que tomar la entrega primero, con el botón de arriba.";
  }
  if (f.gradingStatus === "in_review") {
    return `Esta entrega la está corrigiendo ${f.assignedTo?.displayName ?? "la otra correctora"}. Podés leerla, pero no editarla.`;
  }
  return "Esta entrega ya salió de corrección: quedó como "
    + `${(ETIQUETA_ESTADO[f.gradingStatus] ?? f.gradingStatus).toLowerCase()}.`;
}

function pintarConsignas() {
  const zona = el("essays");
  zona.replaceChildren();
  const propia = esPropia();

  if (!propia) {
    const aviso = document.createElement("p");
    aviso.className = "essay__locked";
    aviso.textContent = motivoBloqueo();
    zona.append(aviso);
  }

  for (const ensayo of estado.ficha.essays ?? []) {
    const bloque = document.createElement("article");
    bloque.className = "essay";

    const consigna = document.createElement("p");
    consigna.className = "essay__prompt";
    consigna.textContent = ensayo.prompt;

    const respuesta = zonaTexto(ensayo, propia);

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
    // Marcarla revisada guarda antes lo que esté en pantalla: así no se pierde
    // una marca o una devolución que quedó sin guardar.
    boton("Marcar revisada", "secondary", () => ejecutar(async () => {
      const guardada = await api.saveDraft(f.attemptId, f.gradingVersion, recolectarEnsayos());
      await api.markReviewed(f.attemptId, guardada.gradingVersion);
    }));
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
      porItem.set(item, {
        itemId: item,
        score: null,
        generalFeedback: "",
        internalNote: "",
        annotations: (estado.anotaciones[item] ?? []).map((m) => ({
          kind: m.kind,
          startOffset: m.startOffset,
          endOffset: m.endOffset,
          selectedText: m.selectedText,
          suggestion: m.kind === "comment" ? null : m.suggestion,
          comment: m.comment ?? "",
          visibleToStudent: m.visibleToStudent !== false,
        })),
      });
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
