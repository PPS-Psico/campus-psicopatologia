const encoder = new TextEncoder();

export function shouldRequireSafeBrowser(origin, setting) {
  const isLocalOrigin = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);
  return !(isLocalOrigin && setting === "false");
}

function cleanHash(value) {
  return typeof value === "string" && /^[0-9a-f]{64}$/i.test(value)
    ? value.toLowerCase()
    : "";
}

function constantTimeEqual(left, right) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

export async function hashSafeBrowserKey(url, key) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(`${url}${key}`));
  return Array.from(
    new Uint8Array(digest),
    (byte) => byte.toString(16).padStart(2, "0"),
  ).join("");
}

// Safe Exam Browser agrega al final de la URL de inicio los parámetros que
// vengan en el enlace sebs://, y calcula sus hashes sobre esa URL ya completa.
// Por eso la comparación es por origen y ruta, y el hash se hace sobre la URL
// real: exigir igualdad exacta rechazaría a todo estudiante que llegue con su
// pase.
export function isSameDocument(candidate, expected) {
  try {
    const a = new URL(candidate);
    const b = new URL(expected);
    return a.origin === b.origin && a.pathname === b.pathname;
  } catch {
    return false;
  }
}

// La URL tal como llegó y la misma sin su consulta. El orden importa poco: se
// prueban ambas y sólo se acepta si la Config Key y la Browser Exam Key
// coinciden sobre la misma.
export function urlCandidates(pageUrl) {
  const candidates = [pageUrl];
  try {
    const parsed = new URL(pageUrl);
    if (parsed.search) {
      parsed.search = "";
      candidates.push(parsed.toString());
    }
  } catch {
    // Una URL que no parsea ya no va a coincidir con ningún hash.
  }
  return candidates;
}

async function matchesBrowserExamKey(url, receivedHash, browserExamKeys) {
  const expectedHashes = await Promise.all(
    browserExamKeys.map((key) => hashSafeBrowserKey(url, key)),
  );
  return expectedHashes.some((expected) => constantTimeEqual(receivedHash, expected));
}

export async function verifySafeBrowserRequest({
  required,
  requestUrl,
  examUrl,
  configKey,
  browserExamKeys,
  directConfigHash,
  directBrowserExamHash,
  javascriptProof,
}) {
  if (!required) return "valid";

  const normalizedConfigKey = cleanHash(configKey);
  const normalizedExamKeys = Array.isArray(browserExamKeys)
    ? browserExamKeys.map(cleanHash).filter(Boolean)
    : [];
  if (!normalizedConfigKey || normalizedExamKeys.length === 0) return "not_configured";

  const normalizedRequestUrl = typeof requestUrl === "string" ? requestUrl.split("#")[0] : "";
  const normalizedDirectConfigHash = cleanHash(directConfigHash);
  const normalizedDirectBrowserExamHash = cleanHash(directBrowserExamHash);
  if (normalizedRequestUrl && normalizedDirectConfigHash && normalizedDirectBrowserExamHash) {
    const expectedConfigHash = await hashSafeBrowserKey(normalizedRequestUrl, normalizedConfigKey);
    const browserExamMatches = await matchesBrowserExamKey(
      normalizedRequestUrl,
      normalizedDirectBrowserExamHash,
      normalizedExamKeys,
    );
    if (constantTimeEqual(normalizedDirectConfigHash, expectedConfigHash) && browserExamMatches) {
      return "valid";
    }
  }

  const proof = javascriptProof && typeof javascriptProof === "object"
    ? javascriptProof
    : {};
  const proofPageUrl = typeof proof.pageUrl === "string" ? proof.pageUrl.split("#")[0] : "";
  const javascriptConfigHash = cleanHash(proof.configKey);
  const javascriptBrowserExamHash = cleanHash(proof.browserExamKey);
  if (
    isSameDocument(proofPageUrl, examUrl)
    && javascriptConfigHash
    && javascriptBrowserExamHash
  ) {
    // Safe Exam Browser agrega el pase a la URL de inicio, pero no está definido
    // si calcula sus claves sobre la URL ya completa o sobre la configurada. Se
    // prueban las dos: la identidad no depende de este dato, y exigir sólo una
    // dejaría afuera a todo el curso si SEB elige la otra.
    for (const candidate of urlCandidates(proofPageUrl)) {
      const expectedConfigHash = await hashSafeBrowserKey(candidate, normalizedConfigKey);
      if (!constantTimeEqual(javascriptConfigHash, expectedConfigHash)) continue;
      const browserExamMatches = await matchesBrowserExamKey(
        candidate,
        javascriptBrowserExamHash,
        normalizedExamKeys,
      );
      if (browserExamMatches) return "valid";
    }
  }

  return "invalid";
}
