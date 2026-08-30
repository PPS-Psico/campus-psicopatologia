export class ExamApi {
  constructor(config) {
    this.url = config.apiUrl;
    this.key = config.publishableKey;
    this.timeoutMs = config.requestTimeoutMs ?? 15000;
    this.safeExamBrowserProof = null;
  }

  setSafeExamBrowserProof(proof) { this.safeExamBrowserProof = proof; }

  async request(action, payload = {}, attemptToken = "") {
    if (!this.url || !this.key) throw new Error("missing_api_config");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const headers = { "Content-Type": "application/json", apikey: this.key };
      if (attemptToken) headers["X-Exam-Token"] = attemptToken;
      const response = await fetch(this.url, {
        method: "POST",
        headers,
        body: JSON.stringify({ action, ...payload, seb: this.safeExamBrowserProof }),
        cache: "no-store",
        signal: controller.signal,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || `http_${response.status}`);
      return data;
    } finally {
      clearTimeout(timeout);
    }
  }

  launch(examId, context) { return this.request("launch", { examId, context }); }
  state(token) { return this.request("state", {}, token); }
  save(token, responses) { return this.request("save", { responses }, token); }
  submit(token) { return this.request("submit", {}, token); }
  event(token, eventType, details = {}) {
    return this.request("event", { eventType, details }, token);
  }
}

export function requestMoodleContext(config) {
  if (window.parent === window) return Promise.reject(new Error("not_embedded_in_moodle"));
  const requestId = crypto.randomUUID();
  const request = {
    type: "PSICOPARCIAL_CONTEXT_REQUEST",
    version: 1,
    requestId,
    examId: config.examId,
  };

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      window.removeEventListener("message", onMessage);
      reject(new Error("moodle_context_timeout"));
    }, config.contextTimeoutMs ?? 12000);

    function finish(callback, value) {
      clearTimeout(timeout);
      window.removeEventListener("message", onMessage);
      callback(value);
    }

    function onMessage(event) {
      if (event.origin !== config.moodleOrigin || event.source !== window.parent) return;
      const data = event.data;
      if (!data || data.type !== "PSICOPARCIAL_CONTEXT_RESULT" || data.version !== 1) return;
      if (data.requestId !== requestId) return;
      if (data.ok === true && data.context && typeof data.context === "object") finish(resolve, data.context);
      else finish(reject, new Error(typeof data.error === "string" ? data.error : "moodle_context_failed"));
    }

    window.addEventListener("message", onMessage);
    window.parent.postMessage(request, config.moodleOrigin);
  });
}
