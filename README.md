# Campus Moodle de Psicopatología I

Primera versión de la portada del aula. Por ahora comunica sólo lo necesario para el inicio de la cursada:

- bienvenida institucional;
- identificación de la Comisión 3, turno mañana;
- equipo docente: Blas Rivera y Guadalupe Guzmán;
- primer encuentro: lunes 10 de agosto de 2026, desde las 8:30, hora de Buenos Aires;
- acceso a Google Meet;
- aviso de que el resto del aula se habilitará próximamente;
- esquema de las cuatro áreas que ordenarán el campus.

## Archivos

- `index.html`: el campus completo (portada, cronograma, unidades y clases). Es lo que se muestra dentro del iframe.
- `inicio.html`: redirección a `index.html`; se conserva sólo porque el iframe publicado en Moodle apunta a esta URL.
- `vista-previa-moodle.html`: simulación local del ancho y el marco habitual de Moodle.
- `snippet-iframe-moodle.html`: bloque para pegar en el editor HTML de Moodle una vez que `inicio.html` tenga una URL pública.
- `parcial/`: aplicación de evaluación, simulacro y verificación automática de Safe Exam Browser.
- `supabase/`: migraciones, función `exam-api` y pruebas del backend del parcial. Los archivos `.env` locales quedan excluidos de Git.
- El acceso “Consultas” abre directamente el foro de Moodle; las pautas completas viven dentro de ese recurso.

La puesta en marcha del navegador seguro está documentada en [`parcial/SEGURIDAD-SEB.md`](parcial/SEGURIDAD-SEB.md). Para el estudiante el flujo consiste únicamente en abrir desde el Campus el archivo `.seb`; las claves y verificaciones se administran en el servidor.

La construcción del reconocimiento estudiantil, el panel compartido de corrección y la devolución individual está ordenada por fases en [`parcial/PLAN-SISTEMA-COMPLETO.md`](parcial/PLAN-SISTEMA-COMPLETO.md).

El backend está desplegado en el proyecto gratuito y separado `Psicopatología I - Parciales` de Supabase, región São Paulo (`zprvefdhcxnivdgsbpkw`). Permanece cerrado hasta cargar las claves del archivo `.seb` definitivo.

## Estructura prevista

1. Inicio y acceso a clase.
2. Clases y materiales.
3. Actividades; las fechas y la preparación de evaluaciones se concentran en `parcial.html`.
4. Consultas y avisos.

El foro invita a identificar el texto y, cuando sea posible, la página o el fragmento del que surge cada pregunta. La portada y la navegación enlazan directamente al recurso.

La estructura queda deliberadamente liviana para una materia cuatrimestral con un encuentro semanal. No se publican todavía programa, bibliografía ni criterios de evaluación.

## Inserción en Moodle

1. Abrir `snippet-iframe-moodle.html`.
2. Pegar el bloque completo desde la vista de código HTML de una etiqueta o página de Moodle. El mismo bloque reenvía al parcial el nombre, DNI, ID de usuario y curso que completa FilterCodes; no requiere plugin.
3. Comprobar con una cuenta de prueba que FilterCodes reemplazó los datos. Si Moodle elimina el bloque `script`, la portada seguirá visible, pero el parcial no podrá identificar automáticamente al estudiante; en ese caso hay que pegarlo en el mismo tipo de recurso HTML que ya usa Consultas PPS.

URL pública del aula: <https://pps-psico.github.io/campus-psicopatologia/inicio.html>

## Datos del encuentro

- Materia: Psicopatología I.
- Comisión: 3, turno mañana.
- Equipo docente: Blas Rivera y Guadalupe Guzmán.
- Día: lunes.
- Inicio: 8:30.
- Zona horaria: America/Argentina/Buenos_Aires.
- Meet: <https://meet.google.com/ppm-khgg-ohk>

Hora de inicio confirmada: 8:30 de la mañana. La finalización puede variar según la extensión del encuentro.
