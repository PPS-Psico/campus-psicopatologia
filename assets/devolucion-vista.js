// Cómo se dibuja la devolución de un parcial: la nota, cada consigna con el
// texto del estudiante y las marcas encima, la opción múltiple pregunta por
// pregunta y la lista de notas. La usan la página de devoluciones, la pestaña
// Parcial (el parcial del estudiante que entra) e Inicio (la lista de notas).
import { requestMoodleContext } from "../parcial/api.js?v=4";
import { FeedbackApi } from "../devolucion/api.js?v=2";
import { pintarTexto } from "./marcas-texto.js?v=1";

export const crear = (tag, clase, texto) => {
  const nodo = document.createElement(tag);
  if (clase) nodo.className = clase;
  if (texto !== undefined && texto !== null) nodo.textContent = texto;
  return nodo;
};

export const numero = (valor) => {
  if (valor === null || valor === undefined || valor === "") return "—";
  return Number(valor).toLocaleString("es-AR", { maximumFractionDigits: 2 });
};

// ------------------------------------------------------------ devolución

export function etiquetaResultado(resultado) {
  const chip = crear("span", "dev-resultado", resultado === "desaprobado" ? "Desaprobado" : "Aprobado");
  chip.dataset.resultado = resultado === "desaprobado" ? "desaprobado" : "aprobado";
  return chip;
}

export function pintarResumen(snap) {
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

export function pintarConsigna(ensayo, indice) {
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

export function pintarOpcionMultiple(preguntas) {
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

export function pintarDevolucion(destino, snap) {
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

// La lista de notas que ve el curso: estudiante y nota final, nada más.
export function pintarListaNotas(cuerpo, filas, propio = "") {
  cuerpo.replaceChildren();
  filas.forEach((f) => {
    const tr = crear("tr");
    if (propio && f.studentName === propio) tr.dataset.propio = "true";
    tr.append(crear("td", null, f.studentName), crear("td", "num", numero(f.finalScore)));
    cuerpo.append(tr);
  });
}

// La devolución publicada de quien abre la página. Si no es estudiante del
// parcial (por ejemplo, alguien del equipo docente) o todavía no hay nada
// publicado, devuelve null sin mostrar errores: la página sigue igual.
export async function devolucionPropia(config) {
  try {
    const context = await requestMoodleContext(config);
    const feedback = new FeedbackApi({ ...config, apiUrl: config.feedbackApiUrl });
    await feedback.launch(context);
    const datos = await feedback.get();
    const releases = datos.releases ?? [];
    return {
      studentName: datos.studentName,
      propia: releases.find((r) => r.examId === config.examId) ?? releases[0] ?? null,
      notas: datos.courseGrades ?? [],
      context,
    };
  } catch {
    return null;
  }
}
