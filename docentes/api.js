export class GraderApi {
  constructor(config, authClient, fetchImpl = fetch) {
    this.url = config.apiUrl;
    this.key = config.publishableKey;
    this.timeoutMs = config.requestTimeoutMs ?? 15000;
    this.auth = authClient;
    this.fetch = fetchImpl;
  }

  async signIn(email, password) {
    const result = await this.auth.signInWithPassword({ email, password });
    if (result.error) throw new Error(result.error.message || "sign_in_failed");
    return result.data;
  }

  async signOut() {
    const result = await this.auth.signOut();
    if (result.error) throw new Error(result.error.message || "sign_out_failed");
  }

  async session() {
    const result = await this.auth.getSession();
    if (result.error) throw new Error(result.error.message || "session_failed");
    return result.data?.session ?? null;
  }

  async request(action, payload = {}) {
    if (!this.url || !this.key) throw new Error("missing_api_config");
    const session = await this.session();
    if (!session?.access_token) throw new Error("teacher_session_required");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await this.fetch(this.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: this.key,
          Authorization: `Bearer ${session.access_token}`,
        },
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

  bootstrap() { return this.request("bootstrap"); }
  queue(examId, status = null, limit = 100) {
    return this.request("queue", { examId, status, limit });
  }
  get(attemptId) { return this.request("get", { attemptId }); }
  claim(attemptId) { return this.request("claim", { attemptId }); }
  release(attemptId, reason) {
    return this.request("release", { attemptId, reason });
  }
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
