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

test("saveDraft acepta marcas de ortografia con la forma correcta", () => {
  const operation = buildGradingOperation({
    action: "saveDraft",
    attemptId,
    expectedVersion: 2,
    essays: [{
      itemId,
      annotations: [
        { kind: "spelling", startOffset: 0, endOffset: 7, selectedText: "enfermdad", suggestion: " enfermedad " },
        { kind: "accent", startOffset: 10, endOffset: 17, selectedText: "sintoma", suggestion: "síntoma" },
        { startOffset: 20, endOffset: 25, selectedText: "causa", comment: "Falta desarrollar" },
      ],
    }],
  });
  const [ortografia, tilde, comentario] = operation.args.p_essays[0].annotations;
  assert.equal(ortografia.kind, "spelling");
  assert.equal(ortografia.suggestion, "enfermedad");
  assert.equal(ortografia.comment, "");
  assert.equal(tilde.kind, "accent");
  assert.equal(comentario.kind, "comment");
  assert.equal(comentario.suggestion, null);
});

test("saveDraft rechaza una marca de ortografia sin forma correcta o de tipo desconocido", () => {
  for (const annotation of [
    { kind: "spelling", startOffset: 0, endOffset: 3, selectedText: "ese", suggestion: "  " },
    { kind: "subrayado", startOffset: 0, endOffset: 3, selectedText: "ese", comment: "x" },
    { kind: "comment", startOffset: 0, endOffset: 3, selectedText: "ese", comment: "  " },
  ]) {
    assert.throws(
      () => buildGradingOperation({
        action: "saveDraft", attemptId, expectedVersion: 0, essays: [{ itemId, annotations: [annotation] }],
      }),
      /invalid_annotation_entry/,
    );
  }
});

test("overview y preview piden sólo el identificador que corresponde", () => {
  assert.deepEqual(buildGradingOperation({ action: "overview", examId, sobra: 1 }), {
    kind: "rpc", name: "grading_overview", args: { p_exam_public_id: examId },
  });
  assert.deepEqual(buildGradingOperation({ action: "preview", attemptId }), {
    kind: "rpc", name: "grading_feedback_preview", args: { p_attempt_public_id: attemptId },
  });
  assert.throws(() => buildGradingOperation({ action: "preview", attemptId: "x" }), /attempt_not_available/);
  assert.throws(() => buildGradingOperation({ action: "overview" }), /exam_not_available/);
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

test("saveDraft lleva el resultado y la nota final que decide quien corrige", () => {
  const operation = buildGradingOperation({
    action: "saveDraft",
    attemptId,
    expectedVersion: 2,
    essays: [{ itemId, score: 1 }],
    outcome: { result: "desaprobado", finalScore: 2 },
  });
  assert.deepEqual(operation.args.p_outcome, { result: "desaprobado", finalScore: 2 });

  // Sin outcome, un cliente viejo no toca el resultado guardado.
  const vieja = buildGradingOperation({
    action: "saveDraft", attemptId, expectedVersion: 2, essays: [{ itemId }],
  });
  assert.equal("p_outcome" in vieja.args, false);

  // En el borrador todavía se puede no haber decidido.
  const pendiente = buildGradingOperation({
    action: "saveDraft", attemptId, expectedVersion: 2, essays: [{ itemId }],
    outcome: { result: null, finalScore: null },
  });
  assert.deepEqual(pendiente.args.p_outcome, { result: null, finalScore: null });
});

test("el resultado tiene que ser coherente con la nota", () => {
  const con = (outcome) => () => buildGradingOperation({
    action: "saveDraft", attemptId, expectedVersion: 2, essays: [{ itemId }], outcome,
  });
  assert.throws(con({ result: "aprobado", finalScore: 3.5 }), /outcome_inconsistent/);
  assert.throws(con({ result: "desaprobado", finalScore: 6 }), /outcome_inconsistent/);
  assert.throws(con({ result: "regular", finalScore: 6 }), /invalid_outcome/);
  assert.throws(con({ result: "aprobado", finalScore: 11 }), /invalid_outcome/);
  assert.throws(con({ result: "aprobado", finalScore: "7" }), /invalid_outcome/);
});

test("setOutcome exige resultado y nota completos", () => {
  assert.deepEqual(
    buildGradingOperation({
      action: "setOutcome",
      attemptId,
      expectedVersion: 9,
      outcome: { result: "aprobado", finalScore: 6.5 },
    }),
    {
      kind: "rpc",
      name: "grading_set_outcome",
      args: {
        p_attempt_public_id: attemptId,
        p_expected_version: 9,
        p_result: "aprobado",
        p_final_score: 6.5,
      },
    },
  );
  assert.throws(
    () => buildGradingOperation({
      action: "setOutcome", attemptId, expectedVersion: 9, outcome: { result: "aprobado" },
    }),
    /outcome_required/,
  );
  assert.deepEqual(publicGradingError(new Error("outcome_required")), {
    status: 409,
    code: "outcome_required",
  });
});
