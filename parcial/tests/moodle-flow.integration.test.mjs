import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const apiUrl = process.env.PSICOPATO_API_URL;
const apiKey = process.env.PSICOPATO_API_KEY;
const dbContainer = process.env.PSICOPATO_DB_CONTAINER;
const enabled = Boolean(apiUrl && apiKey && dbContainer);

test("Moodle → padrón → UI → autoguardado → recarga → entrega", { skip: !enabled }, async () => {
  const suffix = Date.now() % 10_000_000;
  const dni = String(60_000_000 + suffix);
  const context = {
    courseId: "12209",
    moodleUserId: String(7_000_000_000 + suffix),
    moodleUsername: dni,
    firstname: "Estudiante",
    lastname: "Navegador Real",
  };
  execFileSync("docker", [
    "exec", dbContainer, "psql", "-U", "postgres", "-d", "postgres",
    "-v", "ON_ERROR_STOP=1", "-c",
    `insert into exam_private.course_roster (course_id, dni, first_name, last_name)
      values ('12209', ${dni}, 'Estudiante', 'Navegador Real');`,
  ]);

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));

    await page.route("**/parcial/config.js", (route) => route.fulfill({
    contentType: "application/javascript",
    body: `window.EXAM_CONFIG=Object.freeze({
      examId:"11111111-1111-4111-8111-111111111111",
      apiUrl:${JSON.stringify(apiUrl)},
      publishableKey:${JSON.stringify(apiKey)},
      moodleOrigin:"http://127.0.0.1:5500",
      requestTimeoutMs:15000,
      contextTimeoutMs:5000,
      demo:false
    });`,
    }));

    await page.goto("http://127.0.0.1:5500/vista-previa-moodle.html");
    await page.evaluate(({ moodleContext }) => {
    document.body.replaceChildren();
    const frame = document.createElement("iframe");
    frame.id = "exam-frame";
    frame.src = "/parcial/index.html?production=1";
    frame.style.cssText = "width:100%;height:900px;border:0";
    document.body.append(frame);
    window.addEventListener("message", (event) => {
      if (event.origin !== location.origin || event.source !== frame.contentWindow) return;
      const request = event.data;
      if (!request || request.type !== "PSICOPARCIAL_CONTEXT_REQUEST") return;
      frame.contentWindow.postMessage({
        type: "PSICOPARCIAL_CONTEXT_RESULT",
        version: 1,
        requestId: request.requestId,
        ok: true,
        context: moodleContext,
      }, location.origin);
    });
    }, { moodleContext: context });

    const frameElement = page.locator("#exam-frame");
    const frame = frameElement.contentFrame();
    await frame.locator("#exam:not([hidden])").waitFor({ timeout: 10000 });

    for (let index = 0; index < 2; index += 1) {
      const radio = frame.locator("input[type=radio]").first();
      if (await radio.count()) await radio.check();
      else await frame.locator("textarea").fill(`Respuesta persistida ${index + 1}.`);
      if (index === 0) await frame.getByRole("button", { name: "Siguiente" }).click();
    }
    await frame.locator("#save-copy").filter({ hasText: "Guardado" }).waitFor({ timeout: 5000 });

    await frameElement.evaluate((element) => element.contentWindow.location.reload());
    await frame.locator("#exam:not([hidden])").waitFor({ timeout: 10000 });
    assert.equal(await frame.locator("#progress-value").textContent(), "2 de 3");

    await frame.getByRole("button", { name: "Entregar parcial" }).click();
    await frame.getByRole("button", { name: "Confirmar entrega" }).click();
    await frame.locator("#completion:not([hidden])").waitFor({ timeout: 10000 });
    assert.equal(await frame.locator("#receipt-status").textContent(), "Entregado");
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
  }
});
