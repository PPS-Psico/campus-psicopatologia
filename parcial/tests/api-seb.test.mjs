import test from "node:test";
import assert from "node:assert/strict";
import { ExamApi } from "../api.js";

test("envía la prueba de SEB en cada llamada al servidor", async (context) => {
  const originalFetch = globalThis.fetch;
  context.after(() => { globalThis.fetch = originalFetch; });

  const requests = [];
  globalThis.fetch = async (_url, init) => {
    requests.push(JSON.parse(init.body));
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };

  const proof = {
    configKey: "a".repeat(64),
    browserExamKey: "b".repeat(64),
    version: "SEB_Windows_3.10.2",
    pageUrl: "https://example.edu/parcial/index.html",
  };
  const api = new ExamApi({
    apiUrl: "https://project.supabase.co/functions/v1/exam-api",
    publishableKey: "publishable-test-key",
    requestTimeoutMs: 1000,
  });
  api.setSafeExamBrowserProof(proof);

  await api.launch("11111111-1111-4111-8111-111111111111", { courseId: "12209" });
  await api.state("attempt-token");
  await api.save("attempt-token", []);
  await api.submit("attempt-token");

  assert.equal(requests.length, 4);
  for (const request of requests) assert.deepEqual(request.seb, proof);
});
