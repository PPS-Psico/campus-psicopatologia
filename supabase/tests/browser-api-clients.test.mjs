import test from "node:test";
import assert from "node:assert/strict";
import { GraderApi } from "../../docentes/api.js";
import { FeedbackApi } from "../../devolucion/api.js";

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function memoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
}

test("el cliente docente usa el JWT de la sesion verificada", async () => {
  let request;
  const auth = {
    getSession: async () => ({
      data: { session: { access_token: "jwt-docente" } },
      error: null,
    }),
  };
  const api = new GraderApi(
    { apiUrl: "https://example.test/grader", publishableKey: "publica" },
    auth,
    async (url, options) => {
      request = { url, options };
      return jsonResponse({ profile: { displayName: "Blas" }, exams: [] });
    },
  );

  const result = await api.bootstrap();
  assert.equal(request.options.headers.Authorization, "Bearer jwt-docente");
  assert.equal(request.options.headers.apikey, "publica");
  assert.deepEqual(JSON.parse(request.options.body), { action: "bootstrap" });
  assert.equal(result.profile.displayName, "Blas");
});

test("el cliente docente no consulta la API sin una sesion", async () => {
  let calls = 0;
  const api = new GraderApi(
    { apiUrl: "https://example.test/grader", publishableKey: "publica" },
    { getSession: async () => ({ data: { session: null }, error: null }) },
    async () => { calls += 1; },
  );
  await assert.rejects(() => api.bootstrap(), /teacher_session_required/);
  assert.equal(calls, 0);
});

test("guardar borrador transmite version y desarrollos sin identidad libre", async () => {
  let body;
  const api = new GraderApi(
    { apiUrl: "https://example.test/grader", publishableKey: "publica" },
    {
      getSession: async () => ({
        data: { session: { access_token: "jwt" } },
        error: null,
      }),
    },
    async (_url, options) => {
      body = JSON.parse(options.body);
      return jsonResponse({ gradingVersion: 5 });
    },
  );
  await api.saveDraft("attempt-1", 4, [{ itemId: "essay-1", score: 3 }]);
  assert.deepEqual(body, {
    action: "saveDraft",
    attemptId: "attempt-1",
    expectedVersion: 4,
    essays: [{ itemId: "essay-1", score: 3 }],
  });
  assert.equal("actorUserId" in body, false);
});

test("la sesion estudiantil se conserva solo en sessionStorage", async () => {
  const storage = memoryStorage();
  const calls = [];
  const api = new FeedbackApi(
    { apiUrl: "https://example.test/feedback", publishableKey: "publica" },
    storage,
    async (_url, options) => {
      calls.push(options);
      return jsonResponse({ studentName: "Estudiante Prueba", sessionToken: "token-seguro" });
    },
  );

  await api.launch({ courseId: "12209" });
  assert.equal(api.token(), "token-seguro");
  assert.equal(calls[0].headers["X-Feedback-Token"], undefined);
  assert.equal(JSON.parse(calls[0].body).action, "launch");
});

test("leer la devolucion usa el token y nunca envia el DNI", async () => {
  const storage = memoryStorage();
  const api = new FeedbackApi(
    { apiUrl: "https://example.test/feedback", publishableKey: "publica" },
    storage,
    async (_url, options) => {
      assert.equal(options.headers["X-Feedback-Token"], "sesion-estudiante");
      assert.deepEqual(JSON.parse(options.body), { action: "get" });
      return jsonResponse({ studentName: "Estudiante Prueba", releases: [] });
    },
  );
  api.setToken("sesion-estudiante");
  const result = await api.get();
  assert.deepEqual(result.releases, []);
});

test("cerrar sesion borra el token incluso si falla la red", async () => {
  const storage = memoryStorage();
  const api = new FeedbackApi(
    { apiUrl: "https://example.test/feedback", publishableKey: "publica" },
    storage,
    async () => { throw new Error("network_error"); },
  );
  api.setToken("sesion-estudiante");
  await assert.rejects(() => api.logout(), /network_error/);
  assert.equal(api.token(), "");
});
