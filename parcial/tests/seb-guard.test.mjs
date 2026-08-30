import test from "node:test";
import assert from "node:assert/strict";
import {
  assertSafeExamBrowser,
  getSafeExamBrowserProof,
  isSafeExamBrowser,
} from "../seb-guard.js";

test("reconoce la API JavaScript de Safe Exam Browser", () => {
  assert.equal(isSafeExamBrowser({
    safeExamBrowser: { version: "SEB_Windows_3.10.2" },
    userAgent: "Mozilla/5.0",
  }), true);
});

test("reconoce el identificador SEB del user agent", () => {
  assert.equal(isSafeExamBrowser({
    safeExamBrowser: undefined,
    userAgent: "Mozilla/5.0 SEB/3.10.2",
  }), true);
});

test("rechaza un navegador común cuando el control está activo", () => {
  assert.throws(
    () => assertSafeExamBrowser(
      { requireSafeExamBrowser: true, allowUnsafeBrowser: false },
      { safeExamBrowser: undefined, userAgent: "Mozilla/5.0 Chrome/140" },
    ),
    /safe_exam_browser_required/,
  );
});

test("permite la excepción sólo cuando la configuración de desarrollo la habilita", () => {
  assert.doesNotThrow(() => assertSafeExamBrowser(
    { requireSafeExamBrowser: true, allowUnsafeBrowser: true },
    { safeExamBrowser: undefined, userAgent: "Mozilla/5.0 Chrome/140" },
  ));
});

test("recupera la Config Key vinculada a la URL mediante la API de SEB", async () => {
  const proof = await getSafeExamBrowserProof({
    safeExamBrowser: {
      version: "SEB_Windows_3.10.2",
      security: {
        configKey: "a".repeat(64),
        browserExamKey: "b".repeat(64),
      },
    },
    pageUrl: "https://example.edu/parcial/index.html",
  });
  assert.deepEqual(proof, {
    configKey: "a".repeat(64),
    browserExamKey: "b".repeat(64),
    version: "SEB_Windows_3.10.2",
    pageUrl: "https://example.edu/parcial/index.html",
  });
});

test("espera updateKeys en versiones que cargan las claves de forma asíncrona", async () => {
  const security = {
    updateKeys(callback) {
      security.configKey = "c".repeat(64);
      callback();
    },
  };
  const proof = await getSafeExamBrowserProof({
    safeExamBrowser: { version: "SEB_iOS_3.0", security },
    pageUrl: "https://example.edu/parcial/index.html",
  });
  assert.equal(proof.configKey, "c".repeat(64));
});

test("actualiza las claves aunque el frame haya heredado valores previos", async () => {
  let calls = 0;
  const security = {
    configKey: "a".repeat(64),
    browserExamKey: "b".repeat(64),
    updateKeys(callback) {
      calls += 1;
      security.configKey = "c".repeat(64);
      security.browserExamKey = "d".repeat(64);
      callback();
    },
  };
  const proof = await getSafeExamBrowserProof({
    safeExamBrowser: { version: "SEB_macOS_3.7", security },
    pageUrl: "https://example.edu/parcial/index.html",
  });
  assert.equal(calls, 1);
  assert.equal(proof.configKey, "c".repeat(64));
  assert.equal(proof.browserExamKey, "d".repeat(64));
});
