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

test("falla cerrado si falta la Config Key del servidor", async () => {
  assert.equal(await verifySafeBrowserRequest(base({ configKey: "" })), "not_configured");
});

test("sin Browser Exam Key configurada sigue valiendo la Config Key", async () => {
  // La Config Key acredita la configuración cargada, que es lo que importa.
  // La Browser Exam Key identifica además el binario y quedó como refuerzo.
  const javascriptProof = {
    pageUrl: examUrl,
    configKey: await hashSafeBrowserKey(examUrl, configKey),
    browserExamKey: await hashSafeBrowserKey(examUrl, "f".repeat(64)),
  };
  assert.equal(await verifySafeBrowserRequest(base({
    browserExamKeys: [], javascriptProof,
  })), "valid");
});

test("acepta los dos encabezados generados por una configuración autorizada", async () => {
  const result = await verifySafeBrowserRequest(base({
    directConfigHash: await hashSafeBrowserKey(requestUrl, configKey),
    directBrowserExamHash: await hashSafeBrowserKey(requestUrl, browserExamKey),
  }));
  assert.equal(result, "valid");
});

test("por encabezados siguen haciendo falta las dos claves", async () => {
  const directConfigHash = await hashSafeBrowserKey(requestUrl, configKey);
  assert.equal(await verifySafeBrowserRequest(base({ directConfigHash })), "invalid");
  assert.equal(await verifySafeBrowserRequest(base({
    directConfigHash,
    directBrowserExamHash: await hashSafeBrowserKey(requestUrl, "c".repeat(64)),
  })), "invalid");
});

test("rechaza una Config Key que no corresponde a esta configuración", async () => {
  const ajena = "d".repeat(64);
  assert.equal(await verifySafeBrowserRequest(base({
    javascriptProof: {
      pageUrl: examUrl,
      configKey: await hashSafeBrowserKey(examUrl, ajena),
      browserExamKey: await hashSafeBrowserKey(examUrl, browserExamKey),
    },
  })), "invalid");
});

test("acepta la prueba de la API JavaScript vinculada al documento del examen", async () => {
  const javascriptProof = {
    pageUrl: examUrl,
    configKey: await hashSafeBrowserKey(examUrl, configKey),
    browserExamKey: await hashSafeBrowserKey(examUrl, browserExamKey),
  };
  assert.equal(await verifySafeBrowserRequest(base({ javascriptProof })), "valid");

  // Safe Exam Browser puede calcular sus claves sobre la URL configurada aunque
  // la página corra con el pase agregado. Esa prueba sigue valiendo: lo que
  // acredita es el navegador, no qué parámetros trae la dirección.
  assert.equal(await verifySafeBrowserRequest(base({
    javascriptProof: { ...javascriptProof, pageUrl: `${examUrl}?pase=abc` },
  })), "valid");

  // Lo que no vale es una prueba de otro documento.
  assert.equal(await verifySafeBrowserRequest(base({
    javascriptProof: { ...javascriptProof, pageUrl: "https://example.edu/otra.html" },
  })), "invalid");
});

test("permite desactivar el requisito únicamente en el entorno local", async () => {
  assert.equal(shouldRequireSafeBrowser("http://127.0.0.1:5500", "false"), false);
  assert.equal(shouldRequireSafeBrowser("http://localhost:5500", "false"), false);
  assert.equal(shouldRequireSafeBrowser("https://pps-psico.github.io", "false"), true);
  // Apagarlo en un servidor público exige el valor explícito, no un "false" suelto.
  assert.equal(shouldRequireSafeBrowser("https://pps-psico.github.io", "disabled-on-purpose"), false);
  assert.equal(shouldRequireSafeBrowser("http://127.0.0.1:5500", undefined), true);
  assert.equal(await verifySafeBrowserRequest(base({
    required: false,
    configKey: "",
    browserExamKeys: [],
  })), "valid");
});

test("acepta el pase que Safe Exam Browser agrega a la URL de inicio", async () => {
  // SEB agrega a la URL de inicio los parámetros del enlace sebs:// y calcula
  // sus claves sobre esa URL ya completa. El servidor tiene que aceptarla
  // aunque no sea idéntica a la configurada, o ningún estudiante entraría.
  const pageUrl = `${examUrl}?pase=Xf3-token`;
  assert.equal(await verifySafeBrowserRequest(base({
    javascriptProof: {
      pageUrl,
      configKey: await hashSafeBrowserKey(pageUrl, configKey),
      browserExamKey: await hashSafeBrowserKey(pageUrl, browserExamKey),
    },
  })), "valid");
});

test("rechaza un pase presentado desde otra página del mismo sitio", async () => {
  const otherUrl = "https://example.edu/parcial/otra.html?pase=Xf3-token";
  assert.equal(await verifySafeBrowserRequest(base({
    javascriptProof: {
      pageUrl: otherUrl,
      configKey: await hashSafeBrowserKey(otherUrl, configKey),
      browserExamKey: await hashSafeBrowserKey(otherUrl, browserExamKey),
    },
  })), "invalid");
});
