import test from "node:test";
import assert from "node:assert/strict";
import {
  buildResponse,
  firstUnansweredIndex,
  formatRemaining,
  progressFor,
  remainingMilliseconds,
} from "../exam-core.js";

test("formatea el tiempo sin producir valores negativos", () => {
  assert.equal(formatRemaining(65_000), "01:05");
  assert.equal(formatRemaining(3_661_000), "01:01:01");
  assert.equal(formatRemaining(-500), "00:00");
});

test("calcula el vencimiento con el desfase horario del servidor", () => {
  const deadline = "2026-08-24T13:00:00.000Z";
  const clientNow = Date.parse("2026-08-24T12:58:00.000Z");
  assert.equal(remainingMilliseconds(deadline, 30_000, clientNow), 90_000);
});

test("considera respondida una opción y un desarrollo no vacío", () => {
  const items = [
    { id: "choice", kind: "single_choice" },
    { id: "essay", kind: "essay" },
    { id: "empty", kind: "essay" },
  ];
  const answers = new Map([
    ["choice", { selectedOptionId: "option" }],
    ["essay", { essayText: "Una respuesta" }],
    ["empty", { essayText: "   " }],
  ]);
  const progress = progressFor(items, answers);
  assert.equal(progress.answered, 2);
  assert.equal(progress.total, 3);
  assert.ok(Math.abs(progress.percent - (200 / 3)) < 1e-12);
  assert.equal(firstUnansweredIndex(items, answers), 2);
});

test("construye el lote sin mezclar tipos de respuesta", () => {
  assert.deepEqual(
    buildResponse(
      { id: "item-1", kind: "single_choice" },
      { selectedOptionId: "option-1", essayText: "ignorar", clientRevision: 4 },
    ),
    { itemId: "item-1", selectedOptionId: "option-1", essayText: null, clientRevision: 4 },
  );
  assert.deepEqual(
    buildResponse(
      { id: "item-2", kind: "essay" },
      { selectedOptionId: "ignorar", essayText: "Desarrollo", clientRevision: 2 },
    ),
    { itemId: "item-2", selectedOptionId: null, essayText: "Desarrollo", clientRevision: 2 },
  );
});
