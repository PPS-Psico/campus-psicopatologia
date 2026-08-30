export function isSafeExamBrowser({
  safeExamBrowser = globalThis.SafeExamBrowser,
  userAgent = globalThis.navigator?.userAgent ?? "",
} = {}) {
  const hasJavascriptApi = Boolean(
    safeExamBrowser
      && typeof safeExamBrowser === "object"
      && (
        typeof safeExamBrowser.version === "string"
        || (safeExamBrowser.security && typeof safeExamBrowser.security === "object")
      ),
  );

  return hasJavascriptApi || /(?:^|\s)SEB(?:\/|\s|$)/i.test(userAgent);
}

export function assertSafeExamBrowser(config, environment) {
  if (!config.requireSafeExamBrowser || config.allowUnsafeBrowser) return;
  if (!isSafeExamBrowser(environment)) throw new Error("safe_exam_browser_required");
}

function cleanProofValue(value, maxLength) {
  return typeof value === "string" && value.length > 0 && value.length <= maxLength
    ? value
    : "";
}

export async function getSafeExamBrowserProof({
  safeExamBrowser = globalThis.SafeExamBrowser,
  pageUrl = globalThis.location?.href?.split("#")[0] ?? "",
  timeoutMs = 1500,
} = {}) {
  if (!isSafeExamBrowser({ safeExamBrowser, userAgent: "" })) return null;
  const security = safeExamBrowser?.security;

  if (security && typeof security.updateKeys === "function") {
    await new Promise((resolve) => {
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        resolve();
      };
      const timeout = setTimeout(finish, timeoutMs);
      try { security.updateKeys(finish); }
      catch { finish(); }
    });
  }

  const configKey = cleanProofValue(security?.configKey, 128);
  if (!configKey) return null;
  return Object.freeze({
    configKey,
    browserExamKey: cleanProofValue(security?.browserExamKey, 128),
    version: cleanProofValue(safeExamBrowser?.version, 200),
    pageUrl,
  });
}
