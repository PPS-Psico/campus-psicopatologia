import test from "node:test";
import assert from "node:assert/strict";
import {
  hashSafeBrowserKey,
  shouldRequireSafeBrowser,
  verifySafeBrowserRequest,
} from "../functions/exam-api/seb-verification.js";

const requestUrl = "https://project.supabase.co/functions/v1/exam-api";
const examUrl = "https://example.edu/parcial/index.html";
const configKey = "a".repeat(64);
const browserExamKey = "b".repeat(64);

function base(overrides = {}) {
  return {
    required: true,
    requestUrl,
    examUrl,
    configKey,
    browserExamKeys: [browserExamKey],
    directConfigHash: "",
    directBrowserExamHash: "",
    javascriptProof: null,
    ...overrides,
  };
}

test("falla cerrado si faltan las claves del servidor", async () => {
  assert.equal(await verifySafeBrowserRequest(base({ configKey: "" })), "not_configured");
  assert.equal(await verifySafeBrowserRequest(base({ browserExamKeys: [] })), "not_configured");
});

test("acepta los dos encabezados generados por una configuración autorizada", async () => {
  const result = await verifySafeBrowserRequest(base({
    directConfigHash: await hashSafeBrowserKey(requestUrl, configKey),
    directBrowserExamHash: await hashSafeBrowserKey(requestUrl, browserExamKey),
  }));
  assert.equal(result, "valid");
});

test("no acepta sólo la Config Key ni una Browser Exam Key incorrecta", async () => {
  const directConfigHash = await hashSafeBrowserKey(requestUrl, configKey);
  assert.equal(await verifySafeBrowserRequest(base({ directConfigHash })), "invalid");
  assert.equal(await verifySafeBrowserRequest(base({
    directConfigHash,
    directBrowserExamHash: await hashSafeBrowserKey(requestUrl, "c".repeat(64)),
  })), "invalid");
});

test("acepta la prueba de la API JavaScript vinculada a la URL exacta", async () => {
  const javascriptProof = {
    pageUrl: examUrl,
    configKey: await hashSafeBrowserKey(examUrl, configKey),
    browserExamKey: await hashSafeBrowserKey(examUrl, browserExamKey),
  };
  assert.equal(await verifySafeBrowserRequest(base({ javascriptProof })), "valid");
  assert.equal(await verifySafeBrowserRequest(base({
    javascriptProof: { ...javascriptProof, pageUrl: `${examUrl}?copiada=1` },
  })), "invalid");
});

test("permite desactivar el requisito únicamente en el entorno local", async () => {
  assert.equal(shouldRequireSafeBrowser("http://127.0.0.1:5500", "false"), false);
  assert.equal(shouldRequireSafeBrowser("http://localhost:5500", "false"), false);
  assert.equal(shouldRequireSafeBrowser("https://pps-psico.github.io", "false"), true);
  assert.equal(shouldRequireSafeBrowser("http://127.0.0.1:5500", undefined), true);
  assert.equal(await verifySafeBrowserRequest(base({
    required: false,
    configKey: "",
    browserExamKeys: [],
  })), "valid");
});
