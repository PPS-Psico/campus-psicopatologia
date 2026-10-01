// Marcas sobre el texto de un estudiante: lo que escribió queda tal cual y la
// corrección va encima. Una palabra mal escrita o una tilde lleva la forma
// correcta arriba; un comentario resalta el fragmento y le pone un número.
// Lo usan la estación de corrección y la devolución que lee el estudiante.

export const TIPOS = {
  spelling: "Palabra mal escrita",
  accent: "Tilde",
  comment: "Comentario",
};

const crear = (tag, clase, texto) => {
  const nodo = document.createElement(tag);
  if (clase) nodo.className = clase;
  if (texto !== undefined) nodo.textContent = texto;
  return nodo;
};

// Los comentarios se numeran en el orden en que aparecen en el texto.
export function numerarComentarios(marcas) {
  return marcas
    .filter((m) => m.kind === "comment")
    .sort((a, b) => a.startOffset - b.startOffset || a.endOffset - b.endOffset);
}

/**
 * Dibuja `texto` dentro de `contenedor` con las marcas encima.
 * Cada marca: {kind, startOffset, endOffset, suggestion?, comment?}.
 * Devuelve los comentarios numerados, para listarlos debajo.
 */
export function pintarTexto(contenedor, texto, marcas) {
  contenedor.replaceChildren();
  const ortografia = marcas
    .filter((m) => m.kind !== "comment")
    .sort((a, b) => a.startOffset - b.startOffset);
  const comentarios = numerarComentarios(marcas);

  // Una marca de ortografía no se parte: si un comentario empieza o termina en
  // medio de una palabra marcada, el resaltado se estira hasta abarcarla entera.
  const dentro = (k) => ortografia.find((m) => k > m.startOffset && k < m.endOffset);
  const rangos = comentarios.map((c) => {
    let desde = c.startOffset;
    let hasta = c.endOffset;
    const a = dentro(desde); if (a) desde = a.startOffset;
    const b = dentro(hasta); if (b) hasta = b.endOffset;
    return { desde: Math.max(0, desde), hasta: Math.min(texto.length, hasta) };
  });

  const cortes = new Set([0, texto.length]);
  for (const m of ortografia) { cortes.add(m.startOffset); cortes.add(m.endOffset); }
  for (const r of rangos) { cortes.add(r.desde); cortes.add(r.hasta); }
  const puntos = [...cortes].filter((k) => k >= 0 && k <= texto.length).sort((a, b) => a - b);

  const numerosAl = new Map();
  rangos.forEach((r, i) => {
    if (!numerosAl.has(r.hasta)) numerosAl.set(r.hasta, []);
    numerosAl.get(r.hasta).push(i + 1);
  });

  for (let i = 0; i < puntos.length - 1; i++) {
    const desde = puntos[i];
    const hasta = puntos[i + 1];
    if (desde === hasta) continue;
    const marca = ortografia.find((m) => m.startOffset === desde);
    let nodo;
    if (marca) {
      nodo = crear("ruby", "marca");
      nodo.dataset.kind = marca.kind;
      nodo.dataset.desde = String(marca.startOffset);
      nodo.title = `${TIPOS[marca.kind]}: ${marca.suggestion}`;
      nodo.append(crear("span", null, texto.slice(desde, hasta)), crear("rt", null, marca.suggestion));
    } else {
      nodo = crear("span", null, texto.slice(desde, hasta));
    }
    const cubren = rangos
      .map((r, k) => (r.desde <= desde && r.hasta >= hasta ? k + 1 : 0))
      .filter(Boolean);
    if (cubren.length) {
      nodo.classList.add("marca-comentario");
      nodo.dataset.comentario = String(cubren[cubren.length - 1]);
    }
    contenedor.append(nodo);
    for (const n of numerosAl.get(hasta) ?? []) {
      const numero = crear("sup", "marca-numero", String(n));
      numero.dataset.comentario = String(n);
      contenedor.append(numero);
    }
  }
  return comentarios;
}

// Posición en el texto original de un punto de la selección: se cuenta lo que
// hay antes, sin la forma correcta de arriba ni los números de comentario.
export function posicionEnTexto(contenedor, nodo, desplazamiento) {
  const rango = document.createRange();
  rango.setStart(contenedor, 0);
  rango.setEnd(nodo, desplazamiento);
  const copia = rango.cloneContents();
  copia.querySelectorAll("rt, .marca-numero").forEach((x) => x.remove());
  return copia.textContent.length;
}
