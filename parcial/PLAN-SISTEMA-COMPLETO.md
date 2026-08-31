# Plan del sistema completo de parciales y devoluciones

## Resultado buscado

El estudiante entra desde el Campus con su sesión habitual, confirma su nombre y rinde en Safe Exam Browser sin crear otra cuenta. El sistema corrige automáticamente la opción múltiple. Las dos respuestas escritas quedan en una bandeja privada para Blas y Guadalupe, con rúbrica, puntaje, comentarios sobre fragmentos y una devolución general. Cuando la corrección está lista, se publica en el mismo Campus y cada estudiante sólo puede ver la propia.

El simulacro puede mostrar las respuestas correctas inmediatamente. El parcial real debe calcular la parte objetiva en el servidor, pero conservar las claves y el resultado ocultos hasta que el equipo docente publique la devolución.

## Arquitectura acordada

- **Campus/Moodle:** punto de entrada e identidad del estudiante. FilterCodes entrega `courseId`, `moodleUserId`, `moodleUsername` (DNI), nombre y apellido al iframe mediante `postMessage` y sólo se acepta el origen `https://campus.uflo.edu.ar`.
- **Safe Exam Browser:** abre el recurso exacto del Campus y aplica las restricciones. El estudiante instala SEB una sola vez y luego usa el botón de acceso; no configura nada manualmente.
- **Aplicación web:** muestra el examen, guarda automáticamente, recupera el intento y muestra la devolución.
- **Supabase:** base privada y funciones de servidor. Las claves correctas, tokens y permisos docentes nunca quedan en el JavaScript público.
- **Acceso docente:** Supabase Auth sólo para Blas y Guadalupe. Es independiente de la identificación estudiantil de Moodle.

No hace falta ser administrador de Moodle ni instalar un plugin. Esta integración aprovecha la sesión y los datos que FilterCodes ya inserta. Es apropiada para este contexto junto con padrón, control de origen y SEB, aunque no equivale a una integración institucional firmada como LTI.

## Paso 1 — fijar el acceso exacto en el Campus

1. Crear una Página o recurso HTML exclusivo para el parcial usando el mismo mecanismo que funciona en Consultas PPS.
2. Insertar allí el iframe y el puente de `snippet-iframe-moodle.html`.
3. Hacer que el archivo `.seb` abra esa URL exacta del Campus, no la URL pública directa de GitHub Pages.
4. Verificar con una cuenta estudiantil que FilterCodes reemplaza todos los campos y que el iframe recibe el contexto.
5. Guardar el `courseId` esperado (`12209`) en la configuración del examen y rechazar cualquier otro curso.

Como SEB usa su propio navegador, puede pedir iniciar sesión en el Campus una vez dentro de SEB. Después no hay un segundo ingreso ni una clave adicional de nuestra aplicación.

## Paso 2 — cargar y vincular el padrón

1. Preparar un CSV con nombre, apellido y DNI de los más de 60 estudiantes.
2. Importarlo a `student_roster` con el curso correspondiente.
3. En el primer simulacro autenticado, comparar el DNI recibido desde Moodle con el padrón.
4. Vincular ese registro con `moodle_user_id` y conservarlo para los siguientes ingresos.
5. Si el mismo Moodle ID aparece con otro DNI, o el mismo DNI con otro Moodle ID, bloquear el acceso y mostrar un caso para revisión docente.
6. Antes del parcial real, revisar los casos no vinculados y congelar el padrón.

La identidad permanente será la fila interna del padrón. El nombre se mostrará desde esa fila, y los datos de Moodle servirán para reconocer y validar el ingreso.

## Paso 3 — modelar el parcial real

1. Crear una versión inmutable del examen con fecha, apertura, cierre, duración, curso y estado.
2. Cargar un banco de preguntas objetivas y exactamente dos consignas escritas.
3. Definir puntajes y ponderación de cada parte.
4. Mantener las claves de opción múltiple únicamente en la base privada.
5. Sortear el orden de preguntas y opciones por intento si se decide usar variantes.
6. Crear un solo intento por estudiante y recuperar siempre ese mismo intento si se recarga la pantalla.
7. Usar tiempo y cierre del servidor, no el reloj del dispositivo.
8. Al entregar, calcular y guardar `objective_score`, pero no devolver las claves al navegador del estudiante.

## Paso 4 — flujo del estudiante durante el examen

1. Abre el botón del Campus y SEB carga la configuración automáticamente.
2. El sistema recibe el contexto Moodle, encuentra el padrón y muestra: nombre, apellido y DNI enmascarado.
3. El estudiante confirma que la identidad es correcta antes de iniciar.
4. Cada cambio se guarda automáticamente; la pantalla distingue `Guardando`, `Guardado` y `Sin conexión`.
5. Si se corta internet o se recarga, el mismo token recupera el intento y sus respuestas.
6. Antes de entregar, se muestran pendientes y una confirmación final.
7. La entrega produce un comprobante con hora de servidor e ID de intento.

## Paso 5 — acceso privado del equipo docente

1. Crear `/docentes/` fuera de la interfaz estudiantil.
2. Habilitar acceso con enlace mágico al correo o proveedor institucional mediante Supabase Auth.
3. Autorizar sólo las dos direcciones docentes aprobadas.
4. Guardar el rol `grader` o `coordinator` en `app_metadata`, nunca en metadatos modificables por el usuario.
5. Exigir el JWT docente en cada operación de la API de corrección y volver a comprobar el rol en el servidor.
6. Registrar inicio de sesión, cambios de puntaje, comentarios, publicación y reapertura.

## Paso 6 — bandeja compartida de corrección

La pantalla inicial debe mostrar contadores y filtros:

- Entregados y sin asignar.
- En corrección por Blas.
- En corrección por Guadalupe.
- Revisados.
- Listos para publicar.
- Publicados.

Cada intento tendrá una acción **Tomar para corregir**. La asignación guarda quién lo tomó y la hora. Si la otra docente abre el mismo intento, verá que está en corrección y podrá leerlo, pero no sobrescribirlo accidentalmente. Una columna `review_version` impedirá guardar sobre una versión que cambió; en ese caso se recarga y se avisa el conflicto.

## Paso 7 — editor de las dos respuestas escritas

La ficha de corrección mostrará:

- Nombre del estudiante y comprobante.
- Puntaje objetivo, calculado y de sólo lectura.
- Consigna 1 y respuesta original.
- Consigna 2 y respuesta original.
- Rúbrica al costado de cada respuesta.
- Puntaje por criterio y subtotal automático.
- Selección de un fragmento para agregar una anotación visible al estudiante.
- Comentario general visible para cada consigna.
- Nota interna privada para coordinación docente.
- Guardado automático de borradores y hora del último guardado.
- Historial de quién cambió qué y cuándo.

Las anotaciones se guardarán con `start_offset`, `end_offset`, texto seleccionado y comentario. Como la respuesta queda congelada al entregar, esos rangos permanecerán estables. Si se modifica una anotación, se conserva el cambio en la auditoría.

## Paso 8 — estados y publicación

Flujo recomendado:

`submitted` → `in_review` → `reviewed` → `ready_to_publish` → `published`

1. La docente corrige las dos respuestas y completa la rúbrica.
2. El sistema valida que no falten criterios ni puntajes.
3. Calcula `total_score = objective_score + manual_score`.
4. La docente marca **Lista para publicar**.
5. Blas puede revisar el conjunto y publicar individualmente o por lote.
6. Al publicar, se genera una copia inmutable de la devolución. Cambiarla después requiere **Reabrir devolución**, motivo obligatorio y un nuevo evento de auditoría.

La revisión por una segunda docente puede quedar opcional. Si la cátedra la necesita, se agrega un estado `second_review` antes de la publicación.

## Paso 9 — “Mi devolución” en el Campus

1. Agregar una pantalla `devolucion.html` dentro de la sección Parcial.
2. Recibir otra vez el contexto de Moodle y canjearlo por un token corto emitido por el servidor.
3. Buscar siempre por la identidad interna vinculada, nunca por un DNI recibido libremente desde una URL.
4. Antes de publicar, mostrar `Tu parcial está en corrección`.
5. Después de publicar, mostrar:
   - puntaje de opción múltiple;
   - detalle de aciertos sólo si la política de la materia lo permite;
   - las dos respuestas originales;
   - rúbrica y puntaje de cada criterio;
   - fragmentos resaltados y anotaciones;
   - devolución general y nota final.
6. No exponer devoluciones de otros estudiantes ni permitir enumerar intentos.

## Paso 10 — base de datos propuesta

Mantener las tablas de examen en un esquema privado, sin acceso directo desde el navegador, y agregar:

- `attempts`: `objective_score`, `manual_score`, `total_score`, `grading_status`, `feedback_published_at`, `review_version`.
- `rubrics`: definición y versión de la rúbrica asociada al examen.
- `rubric_criteria`: criterios, descripción, puntaje máximo y orden.
- `grading_assignments`: intento, docente asignada, estado y marcas de tiempo.
- `essay_grades`: intento, pregunta escrita, puntaje, devolución general y nota privada.
- `essay_grade_criteria`: puntaje otorgado por cada criterio.
- `essay_annotations`: rango de texto, fragmento, comentario y autora.
- `grading_audit`: eventos de asignación, guardado, cambio de nota, publicación y reapertura.
- `feedback_releases`: copia publicada e inmutable de la devolución completa.

Aplicar RLS donde haya tablas expuestas por API y, preferentemente, conservar estas tablas en un esquema privado al que sólo acceden las funciones de servidor.

## Paso 11 — APIs necesarias

- `exam-api` (existente): `launch`, `state`, `save`, `submit`, eventos y verificación SEB.
- `feedback-api`: valida contexto Moodle, emite sesión corta y entrega únicamente la devolución propia cuando está publicada.
- `grader-api`: autentica a la docente y ofrece `list`, `claim`, `get`, `saveDraft`, `markReviewed`, `publish`, `reopen` y `export`.
- `roster-api`: importación y resolución de conflictos, accesible sólo por coordinación.

La clave de servicio de Supabase queda exclusivamente en las Edge Functions. El cliente público sólo usa la clave publicable y tokens de alcance corto.

## Paso 12 — trabajo simultáneo

La primera versión no necesita tiempo real: asignación y control de versión alcanzan para dos correctoras. Más adelante se puede agregar presencia para mostrar `Guadalupe está viendo este parcial`, pero nunca debe reemplazar el bloqueo optimista del guardado.

## Paso 13 — control y exportación

- Exportar CSV de padrón, entregas, puntajes objetivos, puntajes escritos, total y estado.
- Permitir descargar una copia de la devolución publicada por estudiante.
- Conservar auditoría sin datos sensibles innecesarios.
- Hacer respaldo antes de publicar calificaciones por lote.
- No registrar respuestas completas ni tokens en logs técnicos.

## Paso 14 — pruebas obligatorias

1. Una cuenta del Campus recibe su nombre correcto y no puede declarar otro DNI.
2. Un estudiante fuera del padrón queda bloqueado.
3. El estudiante A nunca puede leer el intento o devolución de B.
4. Chrome, Safari u otro navegador común no obtienen las preguntas del parcial protegido.
5. Windows, macOS e iPad abren el `.seb` y recuperan el intento.
6. La pérdida de conexión no borra respuestas.
7. Dos docentes no pueden sobrescribirse una corrección.
8. El puntaje no supera el máximo y las dos consignas quedan completas.
9. Una devolución no aparece antes de ser publicada.
10. Publicar y reabrir genera eventos de auditoría.
11. La exportación coincide con una muestra calculada manualmente.
12. Un simulacro con cinco estudiantes reales se completa antes de habilitar a todo el curso.

## Orden de construcción

### Fase 1 — identidad real

- Obtener la URL exacta del recurso Moodle.
- Cambiar el `.seb` para abrirla.
- Importar el padrón.
- Mostrar y persistir identidad vinculada.
- Probar con una cuenta docente y dos cuentas estudiantiles.

### Fase 2 — examen real en servidor

- Cargar preguntas, dos consignas y puntajes.
- Activar horario, guardado, reanudación y entrega.
- Corregir automáticamente la parte objetiva sin revelar claves.
- Generar comprobante.

### Fase 3 — panel de corrección

- Crear acceso docente.
- Construir bandeja, asignación y control de versión.
- Construir rúbrica, anotaciones, notas y auditoría.
- Probar la corrección simultánea de Blas y Guadalupe.

### Fase 4 — devolución

- Crear `Mi devolución`.
- Implementar estados, publicación individual y por lote.
- Verificar aislamiento entre estudiantes.

### Fase 5 — piloto y parcial

- Simulacro autenticado con cinco estudiantes.
- Corregir problemas y hacer la prueba con todo el curso.
- Congelar examen, configuración SEB y padrón.
- Publicar el parcial real y habilitar el monitoreo docente.

## Decisiones necesarias antes de la Fase 2

1. URL exacta de la Página de Moodle donde se alojará el parcial.
2. Correos de Blas y Guadalupe para el panel docente.
3. Peso de opción múltiple y peso conjunto de las dos respuestas escritas.
4. Criterios y escala de la rúbrica.
5. Si en el parcial real se muestran los aciertos al publicar la devolución o sólo los puntajes.
6. Si toda devolución debe ser revisada por ambas docentes o alcanza con una correctora.

## Referencias técnicas

- [Autorización de Edge Functions](https://supabase.com/docs/guides/functions/auth)
- [Encabezados y sesión de Auth en Edge Functions](https://supabase.com/docs/guides/functions/auth-headers)
- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Cambios de base en Realtime](https://supabase.com/docs/guides/realtime/subscribing-to-database-changes)
