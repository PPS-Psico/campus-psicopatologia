import test from "node:test";
import assert from "node:assert/strict";
import { buildDemoDefinition, buildDemoReview, DEMO_ANSWER_KEY, DEMO_ITEMS } from "../mock-api.js";

test("el banco reúne las preguntas de cada clase con práctica", () => {
  // Clase 8: ocho, porque «La pérdida de realidad» (1924) no se llegó a dar.
  const porClase = { "3": 10, "4": 10, "6": 10, "7": 10, "8": 8 };
  assert.equal(DEMO_ITEMS.length, 48);
  for (const [clase, cantidad] of Object.entries(porClase)) {
    assert.equal(DEMO_ITEMS.filter((item) => item.section === `Clase ${clase}`).length, cantidad);
  }
  assert.equal(new Set(DEMO_ITEMS.map((item) => item.id)).size, DEMO_ITEMS.length);

  for (const item of DEMO_ITEMS) {
    assert.equal(item.kind, "single_choice");
    assert.equal(item.options.length, 4);
    assert.ok(item.options.some((option) => option.id === DEMO_ANSWER_KEY[item.id]));
  }
});

test("las prácticas de Clase 3 y Clase 4 son recorridos separados", () => {
  const class3 = buildDemoDefinition("3");
  const class4 = buildDemoDefinition("4");
  const internal = buildDemoDefinition();

  assert.equal(class3.items.length, 10);
  assert.ok(class3.items.every((item) => item.section === "Clase 3"));
  assert.equal(class3.durationMinutes, 20);
  assert.equal(class4.items.length, 10);
  assert.ok(class4.items.every((item) => item.section === "Clase 4"));
  assert.equal(class4.durationMinutes, 20);
  assert.equal(internal.items.length, 20);
  assert.equal(internal.durationMinutes, 30);
  assert.ok(internal.items.every((item) => item.section === "Clase 3" || item.section === "Clase 4"));
  assert.notEqual(class3.storageKey, class4.storageKey);
});

test("las prácticas de las Clases 6, 7 y 8 son recorridos propios", () => {
  for (const [clase, cantidad] of [["6", 10], ["7", 10], ["8", 8]]) {
    const practica = buildDemoDefinition(clase);
    assert.equal(practica.items.length, cantidad);
    assert.ok(practica.items.every((item) => item.section === `Clase ${clase}`));
    assert.equal(practica.durationMinutes, 20);
    assert.equal(practica.storageKey, `psicopato-practice-clase-${clase}-v${clase === "8" ? 2 : 1}`);
    assert.equal(practica.title, `Práctica para el parcial · Clase ${clase}`);
  }
});

test("la Clase 8 no pregunta por 1924 ni por Lacan", () => {
  const textos = buildDemoDefinition("8").items
    .flatMap((item) => [item.prompt, ...item.options.map((option) => option.label)])
    .join(" ");
  assert.doesNotMatch(textos, /1924|pérdida de realidad|desmient|Lacan|forclusión|significante/i);
});

test("la respuesta correcta no cae siempre en la misma opción", () => {
  for (const clase of ["7", "8"]) {
    const lugares = buildDemoDefinition(clase).items
      .map((item) => item.options.findIndex((option) => option.id === DEMO_ANSWER_KEY[item.id]));
    assert.ok(new Set(lugares).size >= 3, `Clase ${clase}: ${lugares}`);
  }
});

test("corrige automáticamente opciones múltiples y conserva el detalle", () => {
  const items = [
    {
      id: "question-1",
      points: 2,
      response: { selectedOptionId: "correct-1" },
    },
    {
      id: "question-2",
      points: 3,
      response: { selectedOptionId: "wrong-2" },
    },
    {
      id: "question-3",
      points: 1,
      response: null,
    },
  ];
  const review = buildDemoReview(items, {
    "question-1": "correct-1",
    "question-2": "correct-2",
    "question-3": "correct-3",
  });

  assert.equal(review.score, 2);
  assert.equal(review.maxScore, 6);
  assert.equal(review.correctCount, 1);
  assert.equal(review.total, 3);
  assert.deepEqual(review.items.map(({ selectedOptionId, correctOptionId, isCorrect }) => ({
    selectedOptionId,
    correctOptionId,
    isCorrect,
  })), [
    { selectedOptionId: "correct-1", correctOptionId: "correct-1", isCorrect: true },
    { selectedOptionId: "wrong-2", correctOptionId: "correct-2", isCorrect: false },
    { selectedOptionId: null, correctOptionId: "correct-3", isCorrect: false },
  ]);
});
