const examParams = new URLSearchParams(location.search);
const isLocalExam = location.hostname === "localhost" || location.hostname === "127.0.0.1";
const practiceClass = ["3", "4"].includes(examParams.get("clase"))
  ? examParams.get("clase")
  : null;

window.EXAM_CONFIG = Object.freeze({
  examId: "11111111-1111-4111-8111-111111111111",
  apiUrl: "https://zprvefdhcxnivdgsbpkw.supabase.co/functions/v1/exam-api",
  publishableKey: "sb_publishable_RH2Gj2j_K83BPWH_LX5I_w_9BsUT8ax",
  moodleOrigin: "https://campus.uflo.edu.ar",
  requestTimeoutMs: 15000,
  contextTimeoutMs: 12000,
  requireSafeExamBrowser: true,
  allowUnsafeBrowser: Boolean(practiceClass) || (isLocalExam && examParams.get("dev") === "1"),
  practiceClass,
  demo: Boolean(practiceClass) || examParams.get("demo") === "1"
    || (isLocalExam && !location.search.includes("production=1")),
});
