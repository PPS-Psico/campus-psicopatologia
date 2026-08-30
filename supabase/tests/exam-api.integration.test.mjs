import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";

const apiUrl = process.env.PSICOPATO_API_URL;
const apiKey = process.env.PSICOPATO_API_KEY;
const dbContainer = process.env.PSICOPATO_DB_CONTAINER;
const enabled = Boolean(apiUrl && apiKey && dbContainer);
const examId = "11111111-1111-4111-8111-111111111111";
let identitySequence = 0;

function sql(statement) {
  execFileSync("docker", [
    "exec", dbContainer, "psql", "-U", "postgres", "-d", "postgres",
    "-v", "ON_ERROR_STOP=1", "-c", statement,
  ]);
}

function createIdentity(overrides = {}) {
  identitySequence += 1;
  const suffix = (Date.now() + identitySequence) % 10_000_000;
  const dni = String(70_000_000 + suffix);
  const context = {
    courseId: "12209",
    moodleUserId: String(8_000_000_000 + suffix),
    moodleUsername: dni,
    firstname: "Ángela",
    lastname: "De Prueba",
    ...overrides,
  };
  sql(`insert into exam_private.course_roster (course_id, dni, first_name, last_name)
    values ('12209', ${dni}, 'Angela', 'De Prueba');`);
  return context;
}

async function call(action, body = {}, token = "") {
  const headers = {
    "content-type": "application/json",
    apikey: apiKey,
    origin: "http://127.0.0.1:5500",
  };
  if (token) headers["x-exam-token"] = token;
  const response = await fetch(apiUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({ action, ...body }),
  });
  return { status: response.status, data: await response.json() };
}

test("rechaza un DNI que no está en el padrón", { skip: !enabled }, async () => {
  const context = {
    courseId: "12209",
    moodleUserId: "99112233",
    moodleUsername: "69999999",
    firstname: "Persona",
    lastname: "Inexistente",
  };
  const result = await call("launch", { examId, context });
  assert.equal(result.status, 403);
  assert.equal(result.data.error, "identity_not_registered");
});

test("padrón, guardado, recuperación y entrega", { skip: !enabled }, async () => {
  const context = createIdentity();
  const launch = await call("launch", { examId, context });
  assert.equal(launch.status, 200);
  assert.equal(launch.data.items.length, 3);
  assert.equal(launch.data.attempt.studentName, "Angela De Prueba");

  const choice = launch.data.items.find((item) => item.kind === "single_choice");
  const essay = launch.data.items.find((item) => item.kind === "essay");
  const save = await call("save", {
    responses: [
      {
        itemId: choice.id,
        selectedOptionId: choice.options[0].id,
        essayText: null,
        clientRevision: 1,
      },
      {
        itemId: essay.id,
        selectedOptionId: null,
        essayText: "Respuesta de integración",
        clientRevision: 1,
      },
    ],
  }, launch.data.attemptToken);
  assert.equal(save.status, 200);
  assert.equal(save.data.accepted, 2);

  const recovered = await call("state", {}, launch.data.attemptToken);
  assert.equal(recovered.status, 200);
  assert.equal(recovered.data.items.filter((item) => item.response).length, 2);

  const submitted = await call("submit", {}, launch.data.attemptToken);
  assert.equal(submitted.status, 200);
  assert.equal(submitted.data.attempt.status, "submitted");
});

test("el servidor cierra el intento al vencer", { skip: !enabled }, async () => {
  const context = createIdentity();
  const launch = await call("launch", { examId, context });
  assert.equal(launch.status, 200);

  sql(`update exam_private.attempts
    set deadline_at = clock_timestamp() + interval '250 milliseconds'
    where moodle_user_id = '${context.moodleUserId}';`);

  await new Promise((resolve) => setTimeout(resolve, 400));

  const expired = await call("state", {}, launch.data.attemptToken);
  assert.equal(expired.status, 200);
  assert.equal(expired.data.attempt.status, "timed_out");
  assert.equal(expired.data.attempt.submittedAt, expired.data.attempt.deadlineAt);
});

test("reingreso recupera el intento, rota el token y exige la misma cuenta Moodle", { skip: !enabled }, async () => {
  const context = createIdentity();
  const first = await call("launch", { examId, context });
  assert.equal(first.status, 200);

  const resumed = await call("launch", { examId, context });
  assert.equal(resumed.status, 200);
  assert.equal(resumed.data.attempt.id, first.data.attempt.id);
  assert.notEqual(resumed.data.attemptToken, first.data.attemptToken);

  const oldSession = await call("state", {}, first.data.attemptToken);
  assert.equal(oldSession.status, 401);
  assert.equal(oldSession.data.error, "invalid_attempt_session");

  const conflict = await call("launch", {
    examId,
    context: { ...context, moodleUserId: String(Number(context.moodleUserId) + 1) },
  });
  assert.equal(conflict.status, 409);
  assert.equal(conflict.data.error, "moodle_account_conflict");
});

test("rechaza nombre distinto aunque el DNI exista", { skip: !enabled }, async () => {
  const context = createIdentity({ firstname: "Nombre falso" });
  const result = await call("launch", { examId, context });
  assert.equal(result.status, 403);
  assert.equal(result.data.error, "identity_mismatch");
});
