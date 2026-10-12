// La pestaña Parcial arranca con el parcial corregido de quien entra, si ya se
// publicó. Si no hay nada publicado, o quien entra no rindió (el equipo
// docente, por ejemplo), la sección no aparece y la página sigue como siempre.
import { devolucionPropia, pintarDevolucion, crear } from "./devolucion-vista.js?v=1";

const config = window.EXAM_CONFIG ?? {};
const destino = document.getElementById("mi-devolucion");

async function mostrar() {
  if (!destino) return;
  const datos = await devolucionPropia(config);
  if (!datos?.propia) return;
  pintarDevolucion(destino, datos.propia);
  const cabeza = destino.querySelector(".section-head");
  if (cabeza) {
    cabeza.prepend(crear("p", "dev-eyebrow", "Tu parcial corregido"));
  }
  destino.hidden = false;
}

mostrar();
