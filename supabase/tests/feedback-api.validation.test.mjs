import test from "node:test";
import assert from "node:assert/strict";
import {
  parseFeedbackAction,
  parseMoodleContext,
  publicFeedbackError,
} from "../functions/feedback-api/validation.js";

const context = {
  courseId: "12209",
  moodleUserId: "32734",
  moodleUsername: "35.154.584",
  firstname: " Blas ",
  lastname: " Rivera ",
};

test("normaliza la identidad que llega desde FilterCodes", () => {
  assert.deepEqual(parseMoodleContext(context), {
    courseId: "12209",
    moodleUserId: "32734",
    dni: "35154584",
    firstname: "Blas",
    lastname: "Rivera",
  });
});

test("rechaza placeholders que Moodle no reemplazo", () => {
  assert.throws(
    () => parseMoodleContext({ ...context, firstname: "{firstname}" }),
    /invalid_moodle_context/,
  );
});

test("rechaza un username que no representa un DNI", () => {
  assert.throws(
    () => parseMoodleContext({ ...context, moodleUsername: "blas.rivera" }),
    /invalid_moodle_context/,
  );
});

test("launch incorpora el contexto validado", () => {
  const operation = parseFeedbackAction({ action: "launch", context });
  assert.equal(operation.action, "launch");
  assert.equal(operation.context.dni, "35154584");
});

test("get y logout no aceptan parametros de identidad", () => {
  assert.deepEqual(parseFeedbackAction({ action: "get", dni: "otro" }), {
    action: "get",
  });
  assert.deepEqual(parseFeedbackAction({ action: "logout", dni: "otro" }), {
    action: "logout",
  });
});

test("rechaza acciones fuera del contrato", () => {
  assert.throws(() => parseFeedbackAction({ action: "listarTodos" }), /unknown_action/);
});

test("traduce errores de identidad y oculta fallas internas", () => {
  assert.deepEqual(publicFeedbackError(new Error("identity_mismatch")), {
    status: 403,
    code: "identity_mismatch",
  });
  assert.deepEqual(publicFeedbackError(new Error("invalid_feedback_session")), {
    status: 401,
    code: "invalid_feedback_session",
  });
  assert.deepEqual(publicFeedbackError(new Error("secret=oculto")), {
    status: 500,
    code: "internal_error",
  });
});
