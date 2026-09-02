import test from "node:test";
import assert from "node:assert/strict";
import {
  buildGradingOperation,
  publicGradingError,
} from "../functions/grader-api/validation.js";

const attemptId = "50000000-0000-4000-8000-000000000001";
const examId = "20000000-0000-4000-8000-000000000001";
const itemId = "60000000-0000-4000-8000-000000000003";
const criterionId = "70000000-0000-4000-8000-000000000001";

test("bootstrap no acepta identidad elegida por el navegador", () => {
  assert.deepEqual(
    buildGradingOperation({ action: "bootstrap", actorUserId: "falso" }),
    { kind: "bootstrap" },
  );
});

test("queue conserva solo los argumentos esperados", () => {
  assert.deepEqual(
    buildGradingOperation({
      action: "queue",
      examId,
      status: "in_review",
      limit: 40,
      p_actor_user_id: "suplantado",
    }),
    {
      kind: "rpc",
      name: "grading_queue",
      args: {
        p_exam_public_id: examId,
        p_status: "in_review",
        p_limit: 40,
      },
    },
  );
});

test("queue rechaza estados y limites fuera de contrato", () => {
  assert.throws(
    () => buildGradingOperation({ action: "queue", examId, status: "all" }),
    /invalid_grading_status/,
  );
  assert.throws(
    () => buildGradingOperation({ action: "queue", examId, limit: 201 }),
    /invalid_page_limit/,
  );
});

test("saveDraft normaliza una correccion completa", () => {
  const operation = buildGradingOperation({
    action: "saveDraft",
    attemptId,
    expectedVersion: 4,
    essays: [{
      itemId,
      score: 3.5,
      generalFeedback: "Buen desarrollo.",
      internalNote: "Revisar con Guadalupe.",
      criteria: [{ criterionId, score: 3.5, comment: "Integra conceptos." }],
      annotations: [{
        startOffset: 0,
        endOffset: 3,
        selectedText: "Una",
        comment: "Buen comienzo.",
        visibleToStudent: true,
      }],
    }],
  });

  assert.equal(operation.name, "grading_save_draft");
  assert.equal(operation.args.p_expected_version, 4);
  assert.equal(operation.args.p_essays[0].criteria[0].criterionId, criterionId);
  assert.equal(operation.args.p_essays[0].annotations[0].visibleToStudent, true);
});

test("saveDraft permite guardar un puntaje aun pendiente", () => {
  const operation = buildGradingOperation({
    action: "saveDraft",
    attemptId,
    expectedVersion: 0,
    essays: [{ itemId }],
  });
  assert.equal(operation.args.p_essays[0].score, null);
  assert.deepEqual(operation.args.p_essays[0].criteria, []);
});

test("saveDraft rechaza desarrollos repetidos", () => {
  assert.throws(
    () => buildGradingOperation({
      action: "saveDraft",
      attemptId,
      expectedVersion: 0,
      essays: [{ itemId }, { itemId }],
    }),
    /duplicate_essay_item/,
  );
});

test("saveDraft rechaza anotaciones sin un rango valido", () => {
  assert.throws(
    () => buildGradingOperation({
      action: "saveDraft",
      attemptId,
      expectedVersion: 0,
      essays: [{
        itemId,
        annotations: [{
          startOffset: 5,
          endOffset: 2,
          selectedText: "texto",
          comment: "Comentario",
        }],
      }],
    }),
    /invalid_annotation_entry/,
  );
});

test("las acciones finales exigen una version segura", () => {
  assert.deepEqual(
    buildGradingOperation({ action: "publish", attemptId, expectedVersion: 9 }),
    {
      kind: "rpc",
      name: "grading_publish",
      args: { p_attempt_public_id: attemptId, p_expected_version: 9 },
    },
  );
  assert.throws(
    () => buildGradingOperation({ action: "publish", attemptId, expectedVersion: -1 }),
    /invalid_grading_version/,
  );
});

test("release limpia y valida el motivo", () => {
  assert.equal(
    buildGradingOperation({ action: "release", attemptId, reason: "  Cambio de correctora  " })
      .args.p_reason,
    "Cambio de correctora",
  );
  assert.throws(
    () => buildGradingOperation({ action: "release", attemptId, reason: "no" }),
    /invalid_release_reason/,
  );
});

test("una accion desconocida no llega a la base", () => {
  assert.throws(
    () => buildGradingOperation({ action: "borrarTodo" }),
    /unknown_action/,
  );
});

test("los errores internos se traducen sin filtrar detalles", () => {
  assert.deepEqual(publicGradingError(new Error("grader_not_authorized")), {
    status: 403,
    code: "grader_not_authorized",
  });
  assert.deepEqual(publicGradingError(new Error("grading_version_conflict")), {
    status: 409,
    code: "grading_version_conflict",
  });
  assert.deepEqual(publicGradingError(new Error("password=secreto")), {
    status: 500,
    code: "internal_error",
  });
});
