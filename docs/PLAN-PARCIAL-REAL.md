# Plan de implementación · Primer parcial real

**Fecha del parcial: lunes 28 de septiembre de 2026, 8:30 a 10:30.**
Hoy es sábado 12 de septiembre: quedan **16 días**, con una sola clase en el medio
(14/09) y el feriado del 21/09.

Alcance de este plan: que el estudiante entre desde el Campus, el sistema lo
reconozca sin que él declare nada, rinda dentro de Safe Exam Browser, y que su
parcial quede guardado en la base en condiciones de ser corregido por Blas y
Guadalupe. La devolución publicada queda fuera del camino crítico del 28/09
—la primera devolución se da en clase el 05/10— y se trata en la Fase F.

---

## 0. Simulacro de la clase 5 · estado al 12/09

El ensayo general se adelantó y se montó como el multiple choice de la clase 5:
mismo circuito que el parcial real, con detección del estudiante, guardado en el
servidor y una consigna escrita para probar la corrección manual.

**Probado de punta a punta contra producción**, con la identidad real de Blas:
FilterCodes entregó `courseid` 12209 y `userid` 32734 → el cruce contra el padrón
lo reconoció → la verificación de Safe Exam Browser aceptó la prueba del `.seb`
nuevo y rechazó su ausencia → se guardaron las once respuestas → la entrega
calculó 4,00/10,00 sin exponer las claves → el intento quedó en la cola docente
con la escrita pendiente. El intento de prueba se dejó reseteado en blanco.

| Pieza | Estado |
|---|---|
| Padrón, 61 filas vinculadas | ✅ |
| Examen `simulacro-clase-5`: 10 MC + 1 escrita de 4 puntos | ✅ en la base |
| Pestaña «Parcial» en Moodle (sección 28), **oculta** | ✅ creada |
| Etiqueta con el puente de FilterCodes | ✅ los cinco campos resuelven |
| `SEB_CONFIG_KEY`, `SEB_BROWSER_EXAM_KEYS`, `SEB_EXAM_URL` | ✅ cargados |
| `simulacro-parcial-clase-5.seb` | ✅ generado y publicado |
| `config.js` apuntando al examen nuevo | ✅ publicado en Pages |

**Lo que falta para abrirlo a los estudiantes:**

1. **Abrir el `.seb` en Safe Exam Browser y recorrer el circuito completo.** Es lo
   único que no se puede verificar sin ejecutar SEB. Hay que comprobar dos cosas:
   que el filtro de URLs deje entrar a la pestaña Parcial y al login del Campus, y
   que las pestañas de las otras unidades queden efectivamente bloqueadas.
2. **Revisar las diez preguntas y la consigna escrita**, que son un borrador
   redactado desde la guía de lectura de la clase 5.
3. **Sumar el botón del simulacro a `parcial.html`**, junto a los de las prácticas.
4. **Mostrar la pestaña «Parcial»** en Moodle.

**Decisión pendiente:** el sorteo de preguntas mezcla todo, así que la consigna
escrita cae en cualquier posición —en la prueba salió novena de once—. Si se
quiere al final, hay que tocar `exam_launch_by_identity`.

---

## 1. Estado real verificado el 12/09

La documentación anterior (`PLAN-SISTEMA-PARCIAL.md`) dice "desarrollo
exclusivamente local, no desplegar". **Eso quedó desactualizado.** Lo que hay
efectivamente en el proyecto `zprvefdhcxnivdgsbpkw` (Psicopatología I · Parciales,
región sa-east-1):

### Ya funciona

- **Las 10 migraciones están aplicadas en producción.** Padrón, intentos,
  respuestas, eventos, rúbricas, correcciones, anotaciones, auditoría inmutable,
  publicaciones y sesiones de devolución.
- **Las tres Edge Functions están desplegadas y activas:** `exam-api` (v2),
  `grader-api` (v1, con `verify_jwt`), `feedback-api` (v1).
- **Identidad por Moodle, cerrada.** `exam_launch_by_identity` cruza
  `courseid` + `username` (DNI) + nombre + apellido contra el padrón, normalizando
  tildes y mayúsculas, y fija el `moodle_user_id` de por vida. Con
  `identity_linking_enabled = false` un DNI sin cuenta asociada no puede entrar.
- **Corrección automática de la opción múltiple.** El trigger
  `attempts_grade_objective` calcula `objective_score` al entregar o al vencer el
  tiempo, y deja el intento en `unassigned` cuando hay consignas escritas. Las
  claves nunca salen al navegador.
- **La aplicación del estudiante está completa:** multiple choice y consignas
  escritas, autoguardado con revisión, reloj de servidor, recuperación del
  intento tras recarga o corte, confirmación de entrega y comprobante.
- **El puente de Moodle está escrito** (`parcial/snippet-moodle.html`): valida que
  FilterCodes haya resuelto los cinco campos y sólo habla con el origen exacto
  de la aplicación.

### Lo que hay cargado hoy en producción

| | |
|---|---|
| Exámenes | 1 — `simulacro-clase-3`, 10 preguntas MC, 20 minutos |
| Preguntas | 10, todas `single_choice`. **Ninguna consigna escrita.** |
| Padrón | **1 fila** (la cuenta de prueba), ya vinculada |
| Intentos | 0 |
| Cuentas docentes | **0** en `auth.users` y 0 en `grader_profiles` |
| Rúbricas | **0** |

### Lo que no existe todavía

- **El padrón real de los ~60 estudiantes.**
- **El contenido del parcial real** (examen, preguntas, consignas, rúbrica).
- **El panel docente**: existe `docentes/api.js` con todas las operaciones, pero
  no hay una sola página HTML. Hoy no hay forma de corregir.
- **"Mi devolución"**: igual, sólo `devolucion/api.js` y el snippet.
- **Un `.seb` que sirva para el parcial real.** Los tres archivos actuales abren
  directo `pps-psico.github.io/.../parcial/index.html`. Eso alcanza para las
  prácticas, que corren con banco local, pero **el parcial real no puede
  funcionar así**: necesita estar embebido en Moodle para recibir el contexto por
  `postMessage`. Si el 28/09 se reparte un `.seb` como los actuales, la
  aplicación falla con `not_embedded_in_moodle` para todo el curso.

---

## 2. Camino crítico

Cinco cosas, en este orden. Todo lo demás es opcional o posterior.

```
A. Padrón real desde Moodle, con moodle_user_id precargado
B. Contenido del parcial (examen + preguntas + consignas + rúbrica)
C. Acceso: página de Moodle + snippet + .seb apuntando ahí + claves SEB
D. Panel docente mínimo para corregir
E. Ensayo general con cuentas reales
```

A, B y C son imprescindibles para el 28/09. D puede terminarse durante la semana
posterior, porque las entregas quedan guardadas igual, pero conviene tenerlo
antes para no descubrir un problema de datos con 60 parciales ya rendidos.

---

## Fase A · Padrón real desde Moodle · ✅ COMPLETA (12/09)

> **Hecho.** El padrón está cargado y vinculado en producción: 61 filas activas
> —60 estudiantes más la cuenta docente de Blas—, **cero sin vincular**, 61 DNI
> distintos, 61 `moodle_user_id` distintos, todos los DNI de 8 dígitos.
> El parcial real puede quedar con `identity_linking_enabled = false` sin
> necesidad de ningún simulacro de vinculación previo.
>
> Cómo se hizo: exportación de participantes del curso 12209 desde el Campus
> (*Participantes → Descargar → Excel*, con la columna **Nombre de usuario**),
> cruzada contra los `userid` de la lista de participantes por nombre completo
> normalizado. Los 60 nombres completos son únicos —de hecho ni siquiera se
> repite un apellido—, así que el cruce fue inequívoco: 60 de 60, sin
> ambigüedades. La validación cruzada salió sola: Blas ya estaba vinculado al
> `moodle_user_id` 32734 desde la prueba del 30/08, y el cruce por nombre le
> asignó exactamente ese número.
>
> Se excluyeron tres filas que no son estudiantes: `direccion.psicologia`,
> Guadalupe Guzmán y el propio Blas (que ya tenía su fila de prueba, conservada
> a propósito para poder rendir el ensayo desde una cuenta real).
>
> **Pendientes chicos de esta fase:**
> - Agregar a Guadalupe al padrón si se quiere que pruebe el circuito como
>   estudiante en el ensayo general (`userid` 3882).
> - Decidir antes del congelamiento si la fila de Blas queda activa. Si queda,
>   su intento va a aparecer en la cola de corrección el 28/09.
> - **Volver a correr este cruce el 26/09**, con la inscripción ya cerrada: si
>   entre hoy y el parcial se inscribe alguien nuevo, no está en el padrón y no
>   puede rendir.

Lo que sigue queda como registro del criterio, porque el cruce hay que repetirlo
antes del congelamiento.

Este es el corazón de "detectar al alumno" y la fase más riesgosa, porque un
error acá se manifiesta recién a las 8:30 del 28/09, con el estudiante afuera.

### El problema a evitar

Con `identity_linking_enabled = false`, el ingreso exige que **las tres cosas
coincidan**: el DNI tiene que estar en el padrón, el nombre y apellido tienen que
coincidir con lo que manda FilterCodes, y el `moodle_user_id` tiene que ser el
que ya está vinculado. Si el padrón se carga desde una planilla de Secretaría y
el nombre en Moodle está escrito distinto —un segundo nombre de más, un apellido
compuesto, "Ma." en lugar de "María"— el estudiante recibe `identity_mismatch` y
no puede rendir.

### La solución: que el padrón salga de la misma fuente que FilterCodes

FilterCodes lee el perfil de Moodle. Si el padrón se construye **exportando ese
mismo perfil**, la coincidencia está garantizada por construcción y no hace falta
ningún simulacro de vinculación previa.

1. **Extraer del curso 12209** los cuatro campos por estudiante:
   `id` de usuario, `username` (DNI), `firstname`, `lastname`.
   - Vía principal: *Calificaciones → Exportar → Hoja de cálculo*, que permite
     incluir el campo **Nombre de usuario** entre los datos de identidad.
   - Vía alternativa: la lista de participantes (`/user/index.php?id=12209`),
     de donde el `userid` sale del enlace de cada perfil (`/user/view.php?id=NNN`).
   - Se puede hacer con el navegador asistido, igual que la carga de asistencia.
2. **Auditar el archivo antes de cargarlo.** Tres controles que hay que correr sí
   o sí, porque cada uno es un estudiante que se queda afuera:
   - `username` que no sea de 6 a 9 dígitos → la función lo rechaza con
     `invalid_moodle_context`. Hay que resolverlo caso por caso con el estudiante
     o con Secretaría.
   - `username` duplicado, o `userid` repetido.
   - Nombres vacíos o con caracteres inesperados.
3. **Cargar el padrón con `moodle_user_id` y `linked_at` ya completos**, no en
   blanco. Se hace por SQL fuera del repositorio: el padrón real con DNI y
   nombres **no se commitea**.
4. **Verificar la carga**: cantidad de filas contra la lista de participantes,
   cero `moodle_user_id` nulos, cero duplicados.
5. **Dejar `identity_linking_enabled = false`** en el parcial real. Con el padrón
   pre-vinculado no hace falta abrirlo nunca.

### Salida de la fase

Esta consulta debe dar sesenta y pico y cero nulos:

```sql
select count(*) filter (where active) as activos,
       count(*) filter (where moodle_user_id is null) as sin_vincular
from exam_private.course_roster
where course_id = '12209';
```

---

## Fase B · Contenido del parcial · bloqueante, cerrar antes del 21/09

El parcial cubre **unidades 1 y 2, clases 1 a 5**. La clase 5 se dicta el 14/09,
así que el contenido definitivo no puede cerrarse antes de esa fecha.

1. **Decidir la estructura y el peso.** Todavía no está decidido:
   - cuántas preguntas de opción múltiple y cuántas se sortean por intento
     (`selection_count` permite tomar N de un banco mayor; el orden de las
     opciones ya se baraja por intento);
   - si van las dos consignas escritas previstas o el parcial es sólo objetivo;
   - el peso relativo de cada parte.

   > Si el parcial fuera sólo de opción múltiple, el sistema lo califica entero
   > solo y el panel docente deja de ser bloqueante. Es la salida más segura
   > frente al calendario, pero cambia qué evalúa el parcial. **Es una decisión
   > de cátedra, no técnica.**

2. **Escribir el banco.** El punto de partida son las prácticas de clase 3 y 4 ya
   escritas en `parcial/mock-api.js`, pero las preguntas del parcial real tienen
   que ser nuevas: ese banco ya está en manos de los estudiantes.
3. **Cargar en la base como un examen nuevo**, con su propio `public_id`, no
   sobre `simulacro-clase-3`:
   - `slug: 'parcial-1-2026'`, `course_id: '12209'`;
   - `opens_at` 28/09 08:25 y `closes_at` 28/09 10:35 en hora argentina, con un
     margen chico a cada lado;
   - `duration_minutes: 120`; el vencimiento de cada intento es el menor entre su
     propia duración y el cierre del examen;
   - `published: true` recién cuando esté revisado.
4. **Revisar las claves.** Cada pregunta de opción múltiple admite exactamente
   una opción correcta (hay un índice único que lo fuerza). Conviene una lectura
   completa a dos personas antes de publicar: después del 28/09, corregir una
   clave implica recalcular a mano.
5. **Cargar la rúbrica** si hay consignas escritas: criterios, máximos y orden,
   asociados a cada pregunta `essay`.
6. **Actualizar el `examId`** en `parcial/config.js` y el `data-exam-id` del
   snippet de Moodle.

---

## Fase C · Acceso desde Moodle y Safe Exam Browser · bloqueante, cerrar antes del 24/09

Esta fase tiene el riesgo técnico más alto del proyecto y **hay que probarla en
el Campus real, no en local**.

1. **Crear el recurso en Moodle.** Una Etiqueta o Página en el curso 12209, con
   el contenido de `parcial/snippet-moodle.html` ya ajustado. Anotar la **URL
   exacta** del recurso: es la que va a abrir el `.seb`.
2. **Verificar FilterCodes con una cuenta de estudiante**, no sólo con la cuenta
   docente: que los cinco campos se resuelvan y que el iframe reciba el contexto.
   El snippet ya rechaza los valores sin resolver.
3. **Generar el `.seb` del parcial** con `.codex/generate-seb-config.ps1`, esta
   vez con `-StartUrl` apuntando a la **URL de Moodle**, no a GitHub Pages.
   Requiere Windows PowerShell 5.1 de 64 bits y el SEB Config Tool 3.10.2.920 x64
   —el script lo verifica y falla si no coincide, porque la Browser Exam Key
   depende del build.
   - Dominios permitidos: `campus.uflo.edu.ar`, `pps-psico.github.io` y
     `zprvefdhcxnivdgsbpkw.supabase.co`.
   - Contraseñas de administración y salida **fuera del repositorio**.
4. **Cargar las claves en los secretos de `exam-api`:** `SEB_CONFIG_KEY`,
   `SEB_BROWSER_EXAM_KEYS`, `SEB_EXAM_URL` y `EXAM_APP_ORIGIN`.
5. **Probar el circuito completo dentro de SEB** con una cuenta de estudiante real.

   > **Riesgo abierto.** `exam-api` acepta dos pruebas de SEB: los encabezados que
   > el navegador agrega a cada pedido, o la prueba por JavaScript, que exige que
   > `location.href` del iframe coincida **exactamente** con `SEB_EXAM_URL`. Ahora
   > la aplicación corre dentro de un iframe de Moodle, y no está verificado que
   > SEB inyecte su API de JavaScript en los iframes ni con qué URL calcula las
   > claves ahí. **Esto se prueba antes del 24/09**; si la prueba por JavaScript
   > no funciona embebida, la vía buena es la de los encabezados y hay que
   > confirmar que SEB los envía en el `fetch` a Supabase.

6. **Publicar el `.seb` y la guía** (`parcial.html`) en el Campus con tiempo, con
   instrucciones de instalación para Windows, macOS e iPad.

---

## Fase D · Panel docente mínimo · no bloquea el 28/09, conviene antes

Todas las operaciones ya existen en el servidor y en `docentes/api.js`:
`bootstrap`, `queue`, `get`, `claim`, `release`, `saveDraft`, `markReviewed`,
`markReady`, `publish`. Falta la interfaz.

1. **Crear las dos cuentas docentes** en Supabase Auth e insertarlas en
   `grader_profiles` con su rol: `coordinator` para Blas, `grader` para Guadalupe.
   Hoy hay cero cuentas; sin esto el panel no arranca.
2. **Configurar `GRADER_APP_ORIGIN`** en los secretos de `grader-api`.
3. **Construir `docentes/index.html`** con lo mínimo:
   - ingreso con correo y contraseña;
   - bandeja con contadores por estado y filtro por parcial;
   - ficha de corrección: puntaje objetivo de sólo lectura, las dos respuestas,
     rúbrica al costado, devolución visible y nota interna;
   - **control de versión**: cada guardado manda `expectedVersion`; si otra sesión
     cambió el intento, el panel obliga a recargar. Es lo que impide que Blas y
     Guadalupe se pisen.
4. **Probar la corrección simultánea** en dos navegadores con datos ficticios.
5. **Exportación a CSV** de padrón, entregas y puntajes, aunque sea un botón
   suelto: es la red de seguridad si algo falla en la publicación.

---

## Fase E · Ensayo general · 21/09 al 26/09

No con datos ficticios: **con el padrón real, el examen real y el `.seb` real**.

1. Un examen espejo, misma estructura pero preguntas descartables, con ventana
   abierta sólo durante el ensayo.
2. Tres a cinco estudiantes voluntarios, en Windows, macOS e iPad si se consigue.
3. Qué se comprueba:
   - el estudiante entra sin declarar nada y ve su nombre correcto;
   - un DNI fuera del padrón queda afuera con un mensaje claro;
   - se corta internet a mitad del intento y las respuestas no se pierden;
   - se recarga y el intento vuelve con todo;
   - la entrega genera comprobante y el intento aparece en la cola docente;
   - Chrome común no obtiene las preguntas;
   - el estudiante A no puede ver nada de B.
4. **Prueba de carga**: 60 aperturas casi simultáneas a las 8:30. El proyecto está
   en sa-east-1 y hay un keep-alive para que Supabase no lo pause, pero el
   arranque en frío de una Edge Function con 60 pedidos a la vez no está medido.
5. Congelar después del ensayo: examen, padrón, `.seb` y configuración. Todo
   cambio posterior vuelve a abrir la prueba.

---

## Fase F · El día del parcial y lo que sigue

### 28/09, antes de las 8:30

- Confirmar `published = true`, la ventana horaria y
  `identity_linking_enabled = false`.
- Confirmar que el `.seb` publicado es el definitivo.
- Meet abierto para supervisión y para resolver problemas de acceso.
- Canal alternativo acordado —el foro de consultas o el correo de cátedra— y
  alguien mirándolo.

### Durante

- Monitoreo por consulta directa: intentos abiertos, entregados y con problemas.
- **Procedimiento de contingencia escrito de antemano:** cómo se extiende el
  horario de un estudiante (correr `closes_at` o su `deadline_at`), cómo se
  reabre un intento cerrado por error, y quién decide. Improvisar eso a las 9:15,
  con un estudiante desesperado por chat, es la peor forma de tomar esa decisión.

### Después

- Respaldo de la base antes de tocar nada.
- Corrección de las consignas escritas, si las hubo.
- **Devolución**: "Mi devolución" (`devolucion/index.html`) todavía no existe.
  Para el 05/10 alcanza con la devolución general en clase; la pantalla individual
  puede construirse durante esa semana, con el cliente y el snippet ya escritos.

---

## Decisiones que hacen falta y no son técnicas

Estas cinco frenan la Fase B y hay que cerrarlas con Guadalupe:

1. ¿El parcial lleva las dos consignas escritas o es sólo opción múltiple?
2. ¿Cuántas preguntas y cuántas se sortean por intento?
3. ¿Qué peso tiene cada parte?
4. Si hay consignas escritas: criterios y máximos de la rúbrica.
5. ¿La devolución muestra el detalle de cada opción o sólo el puntaje?

---

## Riesgos, ordenados por lo que cuesta cada uno

| Riesgo | Qué pasa si ocurre | Cómo se cubre |
|---|---|---|
| El `.seb` no abre la página de Moodle | El curso entero queda afuera el 28/09 | Fase C, probado en el Campus real |
| SEB embebido no valida sus claves | `safe_browser_invalid` para todos | Probar las dos vías antes del 24/09; si fallan, bajar `SEB_REQUIRED` a `false` como salida de emergencia documentada |
| Un nombre del padrón no coincide con Moodle | Ese estudiante no puede rendir | Construir el padrón desde la exportación de Moodle |
| Un `username` que no es DNI de 6 a 9 dígitos | Ese estudiante no puede rendir | Auditoría del archivo en la Fase A |
| 60 aperturas simultáneas en frío | Demoras o errores a las 8:30 | Prueba de carga en la Fase E |
| Una clave mal cargada | Puntajes mal calculados para todos | Doble lectura antes de publicar; el recálculo es posible, pero a mano |
| El panel docente no llega | Los parciales quedan guardados sin poder corregirse | Las entregas están seguras igual; el panel puede terminarse después del 28/09 |

---

## Cronograma

| Fecha | Qué |
|---|---|
| ~~12/09~~ | ~~Extracción, auditoría, carga y vinculación del padrón.~~ ✅ **hecho** |
| 12-14/09 | Decisiones de cátedra (ver arriba). |
| 15-21/09 | Escritura y carga del banco de preguntas y la rúbrica. |
| 18-21/09 | Recurso en Moodle, snippet, FilterCodes verificado con cuenta de estudiante. |
| 21-24/09 | `.seb` del parcial, claves en los secretos, prueba de SEB embebido. |
| 21-26/09 | Panel docente y cuentas de Blas y Guadalupe. |
| 24-26/09 | Ensayo general con estudiantes y prueba de carga. |
| 26/09 | Congelamiento. Publicación del `.seb` y la guía en el Campus. |
| 28/09 | Parcial, 8:30 a 10:30. |
| 29/09-04/10 | Corrección. |
| 05/10 | Devolución general en la clase 6. |

---

## Nota sobre la documentación existente

`PLAN-SISTEMA-PARCIAL.md` y `PARCIAL_SEGURO.md` —este último en la raíz del
proyecto padre— describen un estado que ya no es el real: dicen que nada está
desplegado y listan como pendientes cosas que están hechas. Además, la carpeta
`supabase/` de la raíz del proyecto padre es una copia vieja, con dos migraciones
de diez y una sola función. **La fuente de verdad es `campus-moodle/supabase/`.**
Conviene borrar la copia vieja o marcarla, para que nadie corra `db reset` contra
ella.
