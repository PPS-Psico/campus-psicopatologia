const sessionKey = "psicopato.feedback.session.v1";

export class FeedbackApi {
  constructor(config, storage = sessionStorage, fetchImpl = fetch) {
    this.url = config.apiUrl;
    this.key = config.publishableKey;
    this.timeoutMs = config.requestTimeoutMs ?? 15000;
    this.storage = storage;
    this.fetch = fetchImpl;
  }

  token() { return this.storage.getItem(sessionKey) ?? ""; }

  setToken(token) {
    if (token) this.storage.setItem(sessionKey, token);
    else this.storage.removeItem(sessionKey);
  }

  async request(action, payload = {}, token = this.token()) {
    if (!this.url || !this.key) throw new Error("missing_api_config");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const headers = { "Content-Type": "application/json", apikey: this.key };
      if (token) headers["X-Feedback-Token"] = token;
      const response = await this.fetch(this.url, {
        method: "POST",
        headers,
        body: JSON.stringify({ action, ...payload }),
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

  async launch(context) {
    const data = await this.request("launch", { context }, "");
    if (!data.sessionToken) throw new Error("invalid_feedback_session");
    this.setToken(data.sessionToken);
    return data;
  }

  get() { return this.request("get"); }

  async logout() {
    try {
      if (this.token()) await this.request("logout");
    } finally {
      this.setToken("");
    }
  }
}

export function requestMoodleFeedbackContext(config, windowObject = window) {
  if (windowObject.parent === windowObject) {
    return Promise.reject(new Error("not_embedded_in_moodle"));
  }
  const requestId = crypto.randomUUID();
  const request = {
    type: "PSICOFEEDBACK_CONTEXT_REQUEST",
    version: 1,
    requestId,
  };

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      windowObject.removeEventListener("message", onMessage);
      reject(new Error("moodle_context_timeout"));
    }, config.contextTimeoutMs ?? 12000);

    function finish(callback, value) {
      clearTimeout(timeout);
      windowObject.removeEventListener("message", onMessage);
      callback(value);
    }

    function onMessage(event) {
      if (event.origin !== config.moodleOrigin || event.source !== windowObject.parent) return;
      const data = event.data;
      if (
        !data
        || data.type !== "PSICOFEEDBACK_CONTEXT_RESULT"
        || data.version !== 1
        || data.requestId !== requestId
      ) return;
      if (data.ok === true && data.context && typeof data.context === "object") {
        finish(resolve, data.context);
      } else {
        finish(reject, new Error(
          typeof data.error === "string" ? data.error : "moodle_context_failed",
        ));
      }
    }

    windowObject.addEventListener("message", onMessage);
    windowObject.parent.postMessage(request, config.moodleOrigin);
  });
}
