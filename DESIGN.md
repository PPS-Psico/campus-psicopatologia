# Design

Sistema visual del campus de Psicopatología I. Registrado desde el build, no antes.

Hereda deliberadamente el sistema del **Campus Psicoanálisis** (mismo equipo docente,
mismos estudiantes, otra materia). Un estudiante que cursa las dos tiene que reconocer
que son la misma cátedra. Lo que se agrega acá y no existe allá son las superficies de
papel y el aparato de recortes.

## Superficies

Dos mundos materiales conviven y no se mezclan:

- **Interfaz.** Blanco o azul noche según el tema, tarjetas de 1px y radios de la
  familia 8/12/16/22/28. Es lo que el estudiante opera.
- **Papel.** `--paper` y sus derivados: el blanco de fotocopia sobre el que se apoyan
  los escaneos de libros. **No cambia con el tema.** Invertir un escaneo lo vuelve
  ilegible, así que la página de un libro se ve igual de día que de noche, y el borde
  entre los dos mundos es lo que dice "esto es una reproducción, no interfaz".

## Color

Estrategia: **contenida**. Neutros más un acento; el color no cubre superficies
grandes. El acento cambia por unidad vía `body[data-unit="N"]`:

| Unidad | Acento | Razón |
|---|---|---|
| 1 · El campo y sus paradigmas | teal `#0d9488` | Es el color de marca y el de la portada ya publicada |
| 2 · Síntoma, defensa y etiología | ámbar `#d97706` | |
| 3 · Las neurosis | violeta `#7c3aed` | |
| 4 · Las psicosis | azul `#2563eb` | |

`--accent` es el color de relleno; **`--accent-text` es el que se usa para texto**, y
es más oscuro en claro y más claro en oscuro. Nunca poner texto chico en `--accent`
directamente: no llega a AA sobre blanco.

`--warn` está reservado para lo que vence o lo que falta. No se usa como decoración.

## Tipografía

- **Outfit** 600-800 para display, títulos y cifras.
- **Inter** 400-700 para texto.

Inter aparece en la lista de fuentes sobreexpuestas del detector de impeccable y el
hallazgo queda abierto a propósito: la cara está fijada por el campus hermano, es un
compromiso de marca de la cátedra, y estas son superficies de lectura, donde una cara
de trabajo rinde más que una con carácter. Cambiarla acá rompería el parentesco entre
las dos materias.

Escala fluida con `clamp()`. Medida de lectura fijada en `--measure: 68ch`; todo
párrafo largo la respeta.

## Movimiento

Una sola curva: `--ease-out: cubic-bezier(0.16, 1, 0.3, 1)`. No hay curva elástica.

**Un solo momento con intención en todo el campus:** el resaltado del recorte barre el
pasaje de izquierda a derecha cuando la figura entra en pantalla. Lo dispara un
`IntersectionObserver` al 35% y se ejecuta una sola vez. Es la única animación que
significa algo: dice "leé esta línea". El resto es `.settle`, una entrada discreta al
cargar, y transiciones de estado.

Con `prefers-reduced-motion` el resaltado aparece ya dibujado, no desaparece.

## Componentes propios

- **`.order`** — el orden sugerido de lectura, numerado. Es lo único que se dice
  sobre *cómo* leer: en qué secuencia, y por qué esa y no otra. No hay contador de
  páginas, ni estimación de tiempo, ni consejo sobre cuándo empezar. (Existió un
  componente `.load` que mostraba la carga semanal; se retiró en agosto de 2026 por
  decisión del equipo docente. Ver el principio 2 de PRODUCT.md.)
- **`.reading`** — una lectura. **No es una tarjeta**: es una sección separada por una
  regla superior, que se vuelve del color del acento cuando es la lectura central.
  Se llegó ahí porque encerrarla en un recuadro obligaba a anidar el recorte y el
  bloque de atención dentro de otro recuadro.
- **`.excerpt`** — la página del libro embebida, con el resaltado posicionado en
  porcentajes sobre la imagen. Siempre lleva tres cosas: la imagen, el pie con la
  fuente, y la **transcripción del pasaje en texto real**, porque los escaneos no
  tienen capa de texto y sin transcripción no hay lector de pantalla que los lea.
  En pantallas menores a 720px la imagen no se encoge: se panea horizontalmente con
  un mínimo de 640px, porque encogida no se lee.
- **`.spotlight`** — por qué esa página y no otra. Sin borde: el acento vive en la
  etiqueta. Se pega al recorte que introduce.
- **`.filenote`** — el estado real del archivo: escaneo sin OCR, doble página, empieza
  por la tapa, tiene una mancha. El estudiante se entera antes de abrirlo.
- **`.lookfor`** — la consigna de lectura. Es lo que convierte un PDF en una tarea.

## Reglas que este sistema no rompe

- Sin kickers ni eyebrows sobre los títulos. Las etiquetas que sí quedan
  (`.reading__tier`, los badges de fecha) clasifican, no repiten el título.
- Sin tarjetas anidadas.
- Sin emoji haciendo de iconos: todos los iconos son SVG de `icons.js`, un solo
  grosor de trazo (1.75).
- Sin texto en degradé, sin bordes laterales de color de más de 1px, sin sombras duras.
- Contraste AA verificado en claro y oscuro sobre los pares de texto reales.

## Integración con Moodle

Las páginas viven dentro de un `iframe`. `CampusUI.Embed` publica la altura por
`postMessage` con `source: 'campus-psicopatologia-i'`, el mismo contrato que ya usa la
portada publicada, y además emite el `{height}` pelado por compatibilidad. Cualquier
página nueva hereda esto sin escribir una línea.

## Dónde se edita qué

- `assets/data.js` — cronograma, unidades, bibliografía. **Fuente única de verdad.**
  Agregar una clase se hace acá y el índice, la portada y las hojas de ruta se
  actualizan solas.
- `assets/tokens.css` — color, tipografía, espacio, forma.
- `assets/ui.css` — componentes compartidos.
- `assets/clase.css` — sólo lo que existe dentro de una página de clase.
- `units/clase-NN.html` — la prosa y las consignas de cada clase, que se escriben a
  mano porque son el trabajo docente y no se generan.
