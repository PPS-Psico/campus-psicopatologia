window.EXAM_CONFIG = Object.freeze({
  examId: "11111111-1111-4111-8111-111111111111",
  apiUrl: "http://127.0.0.1:54321/functions/v1/exam-api",
  publishableKey: "",
  moodleOrigin: "https://campus.uflo.edu.ar",
  requestTimeoutMs: 15000,
  contextTimeoutMs: 12000,
  demo: new URLSearchParams(location.search).get("demo") === "1"
    || (location.hostname === "localhost" && !location.search.includes("production=1")),
});
