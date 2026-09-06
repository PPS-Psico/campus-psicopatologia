# Campus de Psicopatología I

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- Estudiantes de Psicopatología I, Comisión 3, que cursan y rinden en línea desde el Campus de UFLO.
- Blas Rivera y Guadalupe Guzmán, que administran el parcial, corrigen dos respuestas escritas por estudiante y publican devoluciones.

## Product Purpose

El Campus reúne cursada, preparación técnica, evaluación y devolución. Para los parciales debe reconocer al estudiante desde su sesión de Moodle, guardar un único intento, corregir automáticamente la opción múltiple y ofrecer al equipo docente un espacio privado para corregir dos desarrollos sin sobrescribirse. El resultado final debe volver al mismo Campus y ser visible sólo para el estudiante correspondiente.

## Positioning

La evaluación aprovecha la identidad que Moodle ya inserta mediante FilterCodes, la cruza con un padrón propio y combina ese reconocimiento con Safe Exam Browser. No requiere una cuenta estudiantil adicional ni permisos administrativos o plugins de Moodle.

## Operating Context

- Materia con más de 60 estudiantes en línea.
- Curso Moodle identificado como `12209`.
- Los estudiantes conocen Moodle como Campus o aula virtual.
- El acceso al parcial se inicia desde el Campus y abre una configuración `.seb` preparada por el equipo docente.
- Las respuestas se autoguardan y el servidor controla horario, vencimiento y entrega.
- Blas y Guadalupe pueden corregir en momentos distintos o simultáneamente.
- El simulacro puede mostrar las respuestas correctas al finalizar; el parcial real no debe revelarlas antes de que se publique la devolución.

## Capabilities and Constraints

- Sitio estático en GitHub Pages para la interfaz pública.
- Supabase separado para base privada, autenticación docente y Edge Functions.
- El navegador público nunca recibe la clave de servicio ni las respuestas correctas del parcial real.
- El padrón contiene nombre, apellido y DNI; el primer vínculo confirmado conserva también `moodle_user_id`.
- La parte objetiva se corrige automáticamente.
- Cada parcial real tendrá dos consignas escritas con puntaje manual, rúbrica, anotaciones sobre fragmentos, devolución general y nota interna.
- El panel docente necesita asignación, estados de corrección, control de versiones y auditoría.
- La devolución publicada debe ser inmutable y cualquier reapertura debe dejar registro.
- Todo el desarrollo nuevo permanece local, sin commit, push ni despliegue, hasta completar las pruebas y obtener aprobación explícita.
- Decisiones abiertas: ponderación final, criterios de rúbrica, necesidad de segunda lectura y nivel de detalle de los aciertos objetivos en la devolución real.

## Brand Commitments

- Nombre de la materia: Psicopatología I.
- Voz directa, clara y rioplatense; se usa “Campus” o “aula virtual”, no “Moodle”, en las instrucciones estudiantiles cuando no hace falta el término técnico.
- La nueva interfaz debe continuar el sistema visual existente del Campus y priorizar claridad operativa.

## Evidence on Hand

- Interfaz del Campus y sistema de tokens en `assets/`.
- Aplicación de examen en `parcial/`.
- Diagnóstico confirmado de FilterCodes con nombre, apellido, DNI, Moodle user ID y Course ID.
- Migraciones y pruebas existentes en `supabase/`.
- Dos prácticas por clase de diez preguntas —una de Clase 3 y otra de Clase 4—, más un simulacro técnico interno combinado de veinte preguntas. Las tres se abren con Safe Exam Browser y cada una tiene su propio archivo `.seb`.
- No hay todavía una rúbrica definitiva ni datos reales de estudiantes dentro del repositorio.

## Product Principles

1. El estudiante no crea ni configura una cuenta extra.
2. La identidad se valida contra padrón y queda vinculada de forma estable.
3. Guardar y recuperar nunca depende del reloj ni del almacenamiento local del dispositivo.
4. Dos correctores pueden trabajar sin sobrescribirse y cada cambio importante queda auditado.
5. Nada se publica al estudiante hasta una acción explícita del equipo docente.

## Accessibility & Inclusion

La interfaz debe funcionar con teclado, foco visible, contraste AA, movimiento reducido y composición responsive. Las instrucciones estudiantiles deben evitar pasos técnicos innecesarios y ofrecer mensajes de recuperación concretos.
