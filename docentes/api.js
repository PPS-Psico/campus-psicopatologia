const sessionKey = "psicopato.grader.session.v1";

// El panel no tiene cuenta propia: la sesión la abre el Campus. Esta clase sólo
// guarda el token que devuelve ese ingreso y lo manda en cada pedido.
export class GraderApi {
  constructor(config, storage = sessionStorage, fetchImpl = fetch) {
    this.url = config.graderApiUrl;
    this.key = config.publishableKey;
    this.timeoutMs = config.requestTimeoutMs ?? 20000;
    this.storage = storage;
    this.fetch = fetchImpl;
  }

  token() {
    try { return this.storage.getItem(sessionKey) ?? ""; }
    catch { return ""; }
  }

  setToken(token) {
    try {
      if (token) this.storage.setItem(sessionKey, token);
      else this.storage.removeItem(sessionKey);
    } catch { /* sin almacenamiento, la sesión dura lo que la pestaña */ }
  }

  async request(action, payload = {}, { withToken = true } = {}) {
    if (!this.url || !this.key) throw new Error("missing_api_config");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const headers = { "Content-Type": "application/json", apikey: this.key };
      const token = withToken ? this.token() : "";
      if (token) headers["X-Grader-Token"] = token;
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

  async login(context) {
    const data = await this.request("login", { context }, { withToken: false });
    if (!data.graderToken) throw new Error("invalid_grader_session");
    this.setToken(data.graderToken);
    return data;
  }

  async logout() {
    try { if (this.token()) await this.request("logout"); }
    finally { this.setToken(""); }
  }

  bootstrap() { return this.request("bootstrap"); }
  queue(examId, status = null, limit = 200) {
    return this.request("queue", { examId, status, limit });
  }
  get(attemptId) { return this.request("get", { attemptId }); }
  claim(attemptId) { return this.request("claim", { attemptId }); }
  release(attemptId, reason) { return this.request("release", { attemptId, reason }); }
  saveDraft(attemptId, expectedVersion, essays) {
    return this.request("saveDraft", { attemptId, expectedVersion, essays });
  }
  markReviewed(attemptId, expectedVersion) {
    return this.request("markReviewed", { attemptId, expectedVersion });
  }
  markReady(attemptId, expectedVersion) {
    return this.request("markReady", { attemptId, expectedVersion });
  }
  publish(attemptId, expectedVersion) {
    return this.request("publish", { attemptId, expectedVersion });
  }
}
