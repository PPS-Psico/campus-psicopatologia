"""Arma cargar.sql con el segundo parcial a partir del banco revisado.

El examen se carga sin publicar: published queda en false hasta que la cátedra
revise las claves. Correr de nuevo regenera el archivo; el SQL falla si el slug
ya existe, así que no duplica el examen.
"""
from pathlib import Path

SLUG = "parcial-2-2026"
TITLE = "Segundo parcial · Unidades 3 y 4"
OPENS_AT = "2026-11-02 08:35:00-03"
CLOSES_AT = "2026-11-02 10:30:00-03"

INSTRUCTIONS = (
    "Segundo parcial de Psicopatología I: clases 6 a 8. Tenés un solo intento y "
    "tiempo hasta las 10:30, contado por el servidor: si entrás más tarde, tenés "
    "menos tiempo. Primero hay cinco preguntas de opción múltiple, con una sola "
    "respuesta correcta cada una (0,5 puntos cada una). Al final hay tres consignas "
    "para desarrollar: elegí dos y dejá la otra en blanco (3,75 puntos cada una). "
    "Para aprobar no alcanza con la opción múltiple: se aprueba con una consigna muy "
    "bien desarrollada o con las dos desarrolladas de manera aceptable. Todo se "
    "guarda solo mientras escribís: si se corta internet o recargás, volvés a "
    "encontrar tus respuestas. Cuando termines, presioná «Entregar» y confirmá."
)

# (consigna, opciones, índice de la correcta)
CHOICES = [
    (
        "¿Qué hace el desplazamiento en la formación del síntoma obsesivo?",
        [
            "Separa la representación de su afecto y la deja sin conexiones con el resto de los pensamientos",
            "Reemplaza la moción hostil por la actitud opuesta, como la escrupulosidad o la compasión",
            "Hace como si lo ocurrido no hubiera sucedido, mediante un segundo acto que cancela al primero",
            "Traslada la intensidad afectiva de la representación conflictiva a otra en apariencia insignificante",
        ],
        3,
    ),
    (
        "¿Cómo caracteriza Freud la ambivalencia en la neurosis obsesiva?",
        [
            "Como un amor y un odio dirigidos a dos personas distintas, el padre y la dama, que el yo no logra unificar",
            "Como un odio consciente hacia el padre que encubre un amor reprimido hacia él",
            "Como un amor intenso y un odio igual de intenso hacia la misma persona, en el que el amor mantiene reprimido al odio",
            "Como una oscilación entre el deseo y la prohibición que se resuelve en la duda, sin intervención del odio",
        ],
        2,
    ),
    (
        "En «Inhibición, síntoma y angustia», ¿cuál es el peligro frente al cual el yo de Juanito produce la angustia?",
        [
            "La pérdida del amor del objeto, la situación de peligro que Freud asocia con la histeria",
            "La castración, que en la fobia aparece desfigurada como ser mordido por el caballo",
            "La angustia frente al superyó, que en Juanito ya funciona como en el obsesivo",
            "Una acumulación de excitación libidinal insatisfecha que se descarga como angustia",
        ],
        1,
    ),
    (
        "En el análisis de Schreber, Freud deriva las formas de la paranoia de distintas maneras de "
        "contradecir la frase «yo (un hombre) lo amo (a un hombre)». ¿Cuál corresponde a la erotomanía?",
        [
            "«Yo no lo amo, lo odio», que por proyección se vuelve «él me odia»",
            "«No soy yo quien ama al hombre, es ella quien lo ama»",
            "«No lo amo a él, la amo a ella», que por proyección se vuelve «ella me ama»",
            "«No amo en absoluto, no amo a nadie», que desemboca en «sólo me amo a mí»",
        ],
        2,
    ),
    (
        "¿Quién ocupa en el delirio de Schreber el lugar de primer perseguidor?",
        [
            "Su padre, el médico y pedagogo Moritz Schreber",
            "Dios, que lo persigue desde el comienzo de la enfermedad",
            "Su hermano mayor, que había muerto antes de la primera enfermedad",
            "El profesor Flechsig, su médico, cuyo lugar ocupa después Dios",
        ],
        3,
    ),
]

# (consigna, [(criterio, descripción, puntos)])
ESSAYS = [
    (
        "Consigna 1 · De 1909 a 1926: el síntoma obsesivo. En el historial del Hombre de las Ratas (1909) "
        "y en «Inhibición, síntoma y angustia» (1926) Freud explica el síntoma obsesivo de dos maneras "
        "distintas. Explicá qué cambia en 1926: qué papel tienen la regresión, el superyó y la angustia en "
        "la formación del síntoma. Ilustrá con un episodio del Hombre de las Ratas.",
        [
            ("La explicación de 1909", "Ambivalencia amor-odio, represión del odio, desplazamiento a lo nimio, duda y compulsión.", 0.75),
            ("La regresión", "La regresión a la fase anal-sádica como primer paso de la defensa en 1926.", 0.75),
            ("Superyó y angustia", "El superyó especialmente severo y la angustia del yo ante el superyó (culpa) como motor de la defensa.", 1),
            ("Síntoma y técnicas", "El síntoma como formación de compromiso que satisface lo mismo que prohíbe; nombra al menos una técnica (aislamiento o anulación).", 0.75),
            ("El caso", "Ilustra con un episodio del caso correctamente articulado.", 0.5),
        ],
    ),
    (
        "Consigna 2 · Angustia y represión, de 1895 a 1926. En 1926 Freud invierte su tesis anterior sobre "
        "la relación entre angustia y represión. Explicá en qué consistía la primera teoría de la angustia, "
        "qué afirma la nueva y qué es la angustia señal. Aplicalo a la fobia de Juanito: ¿qué produce la "
        "angustia y qué produce la represión?",
        [
            ("La primera teoría", "La angustia como libido reprimida que se transforma.", 0.75),
            ("La inversión", "La angustia no surge de la represión sino que la produce.", 0.75),
            ("La angustia señal", "El yo anticipa una situación de peligro y pone en marcha la defensa.", 0.75),
            ("Juanito", "La angustia de castración frente al padre, la represión de la moción hostil y el desplazamiento al caballo.", 1),
            ("Angustia, síntoma, inhibición", "Distingue en el caso la angustia del síntoma (miedo al caballo) o de la inhibición (no salir a la calle).", 0.5),
        ],
    ),
    (
        "Consigna 3 · Dos salidas frente a un mismo peligro. Juanito y el Hombre de las Ratas responden de "
        "maneras distintas a un mismo peligro. Según «Inhibición, síntoma y angustia», ¿cuál es ese peligro "
        "y qué hace con él cada neurosis? Compará la solución fóbica con la obsesiva: dónde se ubica el "
        "peligro, qué mecanismos intervienen y qué lugar tiene la angustia en cada una.",
        [
            ("El peligro común", "La castración, y la angustia señal como punto de partida de la defensa en las dos.", 0.75),
            ("La salida fóbica", "Desplazamiento a un objeto externo (el caballo) y evitación; la angustia queda ligada a una zona que se puede esquivar.", 1),
            ("La salida obsesiva", "Regresión anal-sádica, superyó severo y angustia transformada en culpa; el conflicto se libra en el pensamiento.", 1),
            ("Mecanismos", "Al menos un mecanismo obsesivo (aislamiento, anulación o formación reactiva) en contraste con el desplazamiento fóbico.", 0.5),
            ("Comparación", "La respuesta compara, no sólo describe cada caso por separado.", 0.5),
        ],
    ),
]


def q(text: str) -> str:
    return "'" + text.replace("'", "''") + "'"


def build() -> str:
    for _, criteria in ESSAYS:
        assert abs(sum(points for *_, points in criteria) - 3.75) < 1e-9
    for _, options, correct in CHOICES:
        assert len(options) == 4 and 0 <= correct < 4

    exam = f"(select id from exam_private.exams where slug = {q(SLUG)})"
    lines = [
        "-- Generado por scripts/parcial-2/generar_sql.py. No editar a mano.",
        "begin;",
        "",
        "insert into exam_private.exams (",
        "  slug, course_id, title, instructions, opens_at, closes_at,",
        "  duration_minutes, max_attempts, published, grading_enabled, essays_to_answer",
        ") values (",
        f"  {q(SLUG)}, '12209', {q(TITLE)}, {q(INSTRUCTIONS)},",
        f"  {q(OPENS_AT)}, {q(CLOSES_AT)}, 120, 1, false, true, 2",
        ");",
        "",
    ]
    position = 0
    for prompt, options, correct in CHOICES:
        position += 1
        lines += [
            "insert into exam_private.questions (exam_id, kind, prompt, points, position)",
            f"values ({exam}, 'single_choice', {q(prompt)}, 0.5, {position});",
            "insert into exam_private.question_options (question_id, label, is_correct, position)",
            "select currval(pg_get_serial_sequence('exam_private.questions', 'id')), label, is_correct, pos",
            "from (values",
            ",\n".join(
                f"  ({q(label)}, {'true' if i == correct else 'false'}, {i + 1})"
                for i, label in enumerate(options)
            ),
            ") as o(label, is_correct, pos);",
            "",
        ]
    lines += [
        "insert into exam_private.rubrics (exam_id, title, version, is_active)",
        f"values ({exam}, 'Rúbrica del segundo parcial', 1, true);",
        "",
    ]
    rubric = f"(select id from exam_private.rubrics where exam_id = {exam} and is_active)"
    for prompt, criteria in ESSAYS:
        position += 1
        lines += [
            "insert into exam_private.questions (exam_id, kind, prompt, points, position)",
            f"values ({exam}, 'essay', {q(prompt)}, 3.75, {position});",
            "insert into exam_private.rubric_criteria (rubric_id, question_id, title, description, max_points, position)",
            f"select {rubric}, currval(pg_get_serial_sequence('exam_private.questions', 'id')), title, description, pts, pos",
            "from (values",
            ",\n".join(
                f"  ({q(title)}, {q(desc)}, {pts}, {i + 1})"
                for i, (title, desc, pts) in enumerate(criteria)
            ),
            ") as c(title, description, pts, pos);",
            "",
        ]
    lines += [
        f"select public_id from exam_private.exams where slug = {q(SLUG)};",
        "",
        "commit;",
        "",
    ]
    return "\n".join(lines)


if __name__ == "__main__":
    out = Path(__file__).with_name("cargar.sql")
    out.write_text(build(), encoding="utf-8")
    print(out)
