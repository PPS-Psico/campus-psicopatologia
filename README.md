# Campus Moodle de Psicopatología I

Primera versión de la portada del aula. Por ahora comunica sólo lo necesario para el inicio de la cursada:

- bienvenida institucional;
- identificación de la Comisión 3, turno mañana;
- equipo docente: Blas Rivera y segundo docente a confirmar;
- primer encuentro: lunes 10 de agosto de 2026, de 8:30 a 10:30, hora de Buenos Aires;
- acceso a Google Meet;
- aviso de que el resto del aula se habilitará próximamente;
- esquema de las cuatro áreas que ordenarán el campus.

## Archivos

- `index.html`: el campus completo (portada, cronograma, unidades y clases). Es lo que se muestra dentro del iframe.
- `inicio.html`: redirección a `index.html`; se conserva sólo porque el iframe publicado en Moodle apunta a esta URL.
- `vista-previa-moodle.html`: simulación local del ancho y el marco habitual de Moodle.
- `snippet-iframe-moodle.html`: bloque para pegar en el editor HTML de Moodle una vez que `inicio.html` tenga una URL pública.

## Estructura prevista

1. Inicio y acceso a clase.
2. Clases y materiales.
3. Actividades y evaluaciones.
4. Consultas y avisos.

La estructura queda deliberadamente liviana para una materia cuatrimestral de dos horas semanales. No se publican todavía programa, bibliografía ni criterios de evaluación.

## Inserción en Moodle

1. Abrir `snippet-iframe-moodle.html`.
2. Pegar el bloque completo desde la vista de código HTML de una etiqueta o página de Moodle.
3. Si Moodle elimina el bloque `script`, dejar el iframe y conservar la altura fija de `820px`. La portada seguirá funcionando, aunque no ajustará su altura automáticamente.

URL pública del aula: <https://pps-psico.github.io/campus-psicopatologia/inicio.html>

## Datos del encuentro

- Materia: Psicopatología I.
- Comisión: 3, turno mañana.
- Equipo docente: Blas Rivera; segundo docente a confirmar.
- Día: lunes.
- Horario: 8:30 a 10:30.
- Zona horaria: America/Argentina/Buenos_Aires.
- Meet: <https://meet.google.com/ppm-khgg-ohk>

Horario confirmado: de 8:30 a 10:30 de la mañana.
