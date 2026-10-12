// Inicio: un desplegable con las notas publicadas del parcial (estudiante y
// nota final). Lo ve quien figura en el padrón del parcial. El equipo docente,
// que no figura, ve la lista completa antes de publicar, para revisarla.
import { requestMoodleContext } from "../parcial/api.js?v=4";
import { GraderApi } from "../docentes/api.js?v=5";
import { devolucionPropia, pintarListaNotas } from "./devolucion-vista.js?v=1";

const config = window.EXAM_CONFIG ?? {};
const $ = (id) => document.getElementById(id);

async function listaDocente() {
  try {
    const context = await requestMoodleContext(config);
    const grader = new GraderApi(config);
    await grader.login(context);
    const datos = await grader.overview(config.examId);
    const filas = (datos.attempts ?? []).map((a) => ({ studentName: a.studentName, finalScore: a.finalScore, publicada: a.gradingStatus === "published" }));
    const todas = filas.length && filas.every((f) => f.publicada);
    return { filas, nota: todas ? "" : "Vista docente: el curso ve esta lista recién cuando se publique." };
  } catch {
    return null;
  }
}

async function mostrar() {
  const caja = $("notas-parcial");
  if (!caja) return;
  const propia = await devolucionPropia(config);
  let filas = propia?.notas ?? [];
  let nota = "";
  if (propia?.propia) $("notas-parcial-link").hidden = false;
  if (!propia) {
    const docente = await listaDocente();
    if (docente) ({ filas, nota } = docente);
  }
  if (!filas.length) return;
  pintarListaNotas($("notas-parcial-filas"), filas, propia?.studentName ?? "");
  $("notas-parcial-nota").textContent = nota;
  caja.hidden = false;
}

mostrar();
