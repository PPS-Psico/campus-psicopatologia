# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

HTML/CSS/JS estático, sin framework ni build step. Se publica en GitHub Pages y se
consume dentro de Moodle mediante un `iframe` que se autoajusta en altura por
`postMessage`. Hereda el stack ya probado en el proyecto hermano Campus Psicoanálisis.

El repositorio pasará a ser privado más adelante, porque va a alojar los PDFs de la
bibliografía. Ninguna decisión de diseño puede depender de que el repo sea público.

## Users

Estudiantes de segundo año de la carrera de Psicología de UFLO que cursan
Psicopatología I, Comisión 3, turno mañana, en modalidad online. Cursan los lunes de
8:30 a 10:30 y llegan a la materia con formación previa en Psicoanálisis, pero sin
formación en psiquiatría ni en historia de la clínica.

Leen mayoritariamente en pantalla, y una parte relevante lo hace desde el teléfono.
Tienen dos horas semanales de clase sincrónica y el resto del trabajo es lectura
autónoma sin acompañamiento en vivo.

Usuario secundario: el equipo docente, que edita el campus entre clase y clase y
necesita que agregar una clase nueva sea barato.

## Product Purpose

El campus es el lugar donde la cursada existe entre una clase y la siguiente. No
reemplaza la clase sincrónica: sostiene la lectura que ocurre en el medio.

Su función central es que un estudiante que abre el aula sepa, en segundos, qué tiene
que leer para el próximo lunes, hasta dónde, y qué debe buscar dentro de ese texto.
El éxito se mide en que lleguen a clase habiendo leído lo que efectivamente había que
leer, no la bibliografía entera.

## Positioning

La mayoría de las aulas virtuales publican bibliografía como una lista de archivos y
delegan en el estudiante la decisión de qué leer y con qué profundidad. Este campus
hace lo contrario: cada lectura llega recortada, jerarquizada y anotada.

El mecanismo propio es el **recorte guiado**: para cada texto se declara el rango de
páginas exacto, se distingue si es lectura central u obligatoria acotada, se dice qué
buscar dentro de ese rango, y se muestra embebida la página decisiva con el pasaje
señalado. El estudiante ve de qué se está hablando antes de abrir el PDF.

El recorte responde a una restricción real y medida: la bibliografía originalmente
asignada para las clases 2 y 3 sumaba entre 51 y 74 páginas semanales, y buena parte
son escaneos sin capa de texto. Ese cálculo es trabajo interno de la cátedra y decide
la selección; **no se le muestra al estudiante**. Ver el principio 2.

## Operating Context

- Cursada sincrónica por Google Meet, siempre el mismo enlace, todos los lunes.
- El aula real es Moodle (campus.uflo.edu.ar). Estas páginas se insertan ahí dentro de
  un `iframe`; nunca son el sitio que el estudiante visita por su cuenta.
- Segundo cuatrimestre 2026: del lunes 10 de agosto al lunes 23 de noviembre.
- 12 clases de contenido, 3 feriados nacionales, 2 parciales online y 1 recuperatorio
  único.
- Los feriados y las semanas institucionales (Semana de la Investigación, IV Jornadas
  de Salud Mental) condicionan el calendario y ya están resueltos en el cronograma.
- La bibliografía existe como PDFs en el repositorio, organizados por clase. Varios son
  escaneos a doble página sin OCR.

## Capabilities and Constraints

- Una página de inicio de unidad más una página por clase. Estructura heredada,
  deliberadamente, del Campus Psicoanálisis.
- Todo el contenido del programa vive en un único `data.js`; las páginas se generan
  desde ahí. Agregar una clase no debe requerir tocar el diseño.
- Debe funcionar dentro del `iframe` de Moodle: sin dependencias de servidor, con
  autoajuste de altura y sin romperse si Moodle filtra scripts.
- Debe leerse bien en teléfono. Es la restricción más dura, porque los escaneos de
  Jaspers, Falret, Kraepelin y Bleuler están a doble página apaisada.
- Modo claro y oscuro.
- **Estado del programa a la fecha:** hay contenido definido para las clases 1, 2 y 3.
  La Clase 4 fue vaciada y su reemplazo está sin decidir. Las clases 5 a 12 tienen
  bibliografía asignada pero todavía no página propia.
- Los parciales cambian de corte respecto del borrador: el primero evalúa las clases 1
  a 5 y el segundo las clases 6 a 11, para que ninguna evaluación caiga al día
  siguiente de la clase que evalúa.

## Brand Commitments

- Cátedra: Psicopatología I, UFLO. Comisión 3, turno mañana. Segundo cuatrimestre 2026.
- Equipo docente: Blas Rivera; segundo docente a confirmar. No inventar el nombre.
- Sistema visual heredado del Campus Psicoanálisis: acento teal, Outfit para display,
  tokens semánticos, acento propio por unidad. La portada actual de Psicopatología ya
  usa ese mismo teal.
- Voz: se le habla al estudiante de vos, en segunda persona del plural rioplatense
  ("van a encontrar", "tienen que leer"). Directa, sin solemnidad y sin infantilizar.

## Evidence on Hand

- `Propuesta_clases_y_nota_bibliografica_VERSION_FINAL_Psicopatologia_I_UFLO_2026.docx`:
  programa completo, 12 clases con bibliografía jerarquizada en [C], [F] y [A], y la
  nota de ajustes bibliográficos frente al programa 2023.
- `Textos_Propuesta_Final_FINAL/Clase_01..12/`: los PDFs disponibles. Completos para
  las clases 2 y 3; parciales o ausentes para el resto.
- `campus-moodle/inicio.html`: portada ya publicada y funcionando dentro de Moodle.
- `Contenido minimos.txt`: contenidos mínimos oficiales de la materia.
- `C:\Users\Blas_\Documents\Campus Psicoanalisis`: proyecto hermano del que se hereda la
  arquitectura y el sistema de diseño.
- **Lo que no existe y no se inventa:** el nombre del segundo docente, las páginas de
  las clases 4 a 12, y los datos de validación institucional del programa.

## Product Principles

1. **El recorte es el producto.** Publicar un PDF entero es delegar la decisión que la
   cátedra debería tomar. Cada texto llega con su rango, su jerarquía y su consigna.
2. **No tratar al estudiante como tonto.** El recorte se hace en la selección, no en
   la comunicación: la página dice qué leer y hasta dónde, y ahí termina. No lleva
   contadores de páginas, estimaciones de cuánto va a tardar ni consejos sobre cuándo
   empezar a estudiar. Son adultos que cursan una carrera; administran su tiempo solos.
   *(Decisión del equipo docente, agosto 2026. Reemplaza un criterio anterior que sí
   exhibía la carga semanal en páginas.)*
3. **El estudiante nunca debe preguntarse qué sigue.** Cada página termina sabiendo
   cuál es el próximo paso y cuándo vence.
4. **Una sola fuente de verdad.** El cronograma, la bibliografía y las fechas viven en
   un solo archivo de datos. Nada se duplica entre páginas.
5. **Lo incompleto se muestra como incompleto.** Una clase sin contenido se anuncia
   como pendiente, no se disimula con relleno.

## Accessibility & Inclusion

Modalidad online con lectura mayoritaria en pantalla y una porción significativa en
teléfono. Requisitos que se derivan de ahí:

- Contraste AA en ambos temas.
- Los escaneos sin capa de texto son una barrera real: toda página que los muestre
  debe acompañarlos con texto legible por lector de pantalla y con `alt` descriptivo,
  y los PDFs deben pasar por OCR antes de publicarse.
- Respetar `prefers-reduced-motion`.
- Navegación por teclado con foco visible.
