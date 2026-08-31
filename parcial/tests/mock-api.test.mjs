import test from "node:test";
import assert from "node:assert/strict";
import { buildDemoReview } from "../mock-api.js";

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
