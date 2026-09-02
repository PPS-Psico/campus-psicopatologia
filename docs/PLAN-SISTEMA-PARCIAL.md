# Plan del sistema de parcial y devoluciones

Estado: desarrollo exclusivamente local. No desplegar migraciones, funciones ni páginas hasta completar la revisión docente.

## Experiencia del estudiante

1. Entra al aula virtual con su cuenta habitual.
2. La etiqueta de FilterCodes inserta `courseid`, `userid`, `username`, nombre y apellido dentro del bloque de acceso.
3. La aplicación cruza esos datos con el padrón del curso `12209` y conserva la asociación con `moodle_user_id`.
4. Abre el parcial mediante el archivo `.seb`; no crea una cuenta nueva ni configura seguridad adicional.
5. Responde las preguntas objetivas y dos consignas escritas. Todo se guarda en el servidor.
6. Al entregar, la parte objetiva se puntúa automáticamente y el intento ingresa a la cola docente.
7. Cuando la devolución se publica, entra a “Mi devolución” desde el aula virtual. El mismo contexto abre una sesión breve y muestra sólo sus resultados.

## Experiencia del equipo docente

1. Blas y Guadalupe ingresan al panel privado con cuentas docentes independientes.
2. El panel muestra los parciales, cantidades por estado y más de 60 entregas sin exponer la clave administrativa.
3. Una docente toma una entrega. Mientras esté asignada, la otra puede verla pero no sobrescribirla.
4. Para cada una de las dos respuestas escritas puede:
   - puntuar criterios de rúbrica;
   - seleccionar fragmentos y agregar anotaciones;
   - escribir una devolución visible al estudiante;
   - guardar una nota interna para el equipo.
5. Cada guardado exige la última versión. Si otra sesión cambió la entrega, el panel obliga a actualizar antes de continuar.
6. La correctora marca la revisión como terminada. Coordinación la deja lista y luego publica.
7. La publicación crea una copia inmutable sin notas internas. El estudiante sólo recibe esa copia.

## Componentes locales

- `exam-api`: reconocimiento para rendir, autoguardado, entrega y control de Safe Exam Browser.
- `grader-api`: autenticación docente, cola, asignación, corrección, control de versiones y publicación.
- `feedback-api`: reconocimiento desde el aula virtual y lectura privada de devoluciones.
- Base privada: padrón, intentos, respuestas, rúbricas, anotaciones, auditoría y publicaciones.
- Panel docente: interfaz todavía no construida; su estructura visual está en revisión.
- Mi devolución: cliente y bloque de FilterCodes listos; interfaz todavía no construida.

## Orden de construcción y prueba

- [x] Modelar estados, puntajes automáticos y manuales.
- [x] Modelar dos consignas escritas, rúbricas, anotaciones y notas internas.
- [x] Evitar sobrescrituras mediante asignación y versión esperada.
- [x] Crear publicación inmutable y excluir datos internos.
- [x] Crear sesión estudiantil sin contraseña adicional.
- [x] Crear las APIs docente y estudiantil con privilegios mínimos.
- [x] Ejecutar migraciones y pruebas reales en PostgreSQL local en memoria.
- [ ] Elegir la estructura del panel docente.
- [ ] Construir y probar el panel docente con datos demostrativos.
- [ ] Construir y probar “Mi devolución” con estados vacío, publicado y sesión vencida.
- [ ] Crear las dos cuentas docentes y registrar sus perfiles en un entorno de prueba.
- [ ] Importar un padrón ficticio de al menos 60 estudiantes para pruebas de carga y búsqueda.
- [ ] Probar corrección simultánea en dos navegadores.
- [ ] Probar el recorrido estudiante → entrega → corrección → publicación → devolución.
- [ ] Revisar ponderaciones, rúbrica definitiva y contenido visible de las respuestas objetivas.
- [ ] Obtener aprobación docente antes de commit, push o despliegue.

## Decisiones que todavía requieren contenido docente

- Puntaje o porcentaje de opción múltiple frente a las dos consignas escritas.
- Criterios y máximos de la rúbrica para cada consigna.
- Si cada corrección necesita una segunda lectura obligatoria.
- Si la devolución final muestra el detalle de cada opción múltiple o sólo el puntaje total.
- Fecha y horario definitivos del parcial real.

## Condiciones mínimas antes de publicar

- El padrón real se importa fuera del repositorio y no se expone en archivos públicos.
- Safe Exam Browser usa la configuración definitiva y el servidor exige sus encabezados.
- El parcial real tiene `identity_linking_enabled = false`; la asociación inicial se hace antes mediante simulacro o carga verificada.
- La base, las funciones y la interfaz apuntan al mismo entorno.
- Blas y Guadalupe prueban sus cuentas, roles y recuperación de acceso.
- Se conserva una exportación de respaldo y un procedimiento de contingencia para extender horario o recuperar intentos.
