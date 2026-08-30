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
  if (proofPageUrl === examUrl && javascriptConfigHash && javascriptBrowserExamHash) {
    const expectedConfigHash = await hashSafeBrowserKey(examUrl, normalizedConfigKey);
    const browserExamMatches = await matchesBrowserExamKey(
      examUrl,
      javascriptBrowserExamHash,
      normalizedExamKeys,
    );
    if (constantTimeEqual(javascriptConfigHash, expectedConfigHash) && browserExamMatches) {
      return "valid";
    }
  }

  return "invalid";
}
