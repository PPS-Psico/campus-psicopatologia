const examParams = new URLSearchParams(location.search);
const isLocalExam = location.hostname === "localhost" || location.hostname === "127.0.0.1";
const practiceClass = ["3", "4"].includes(examParams.get("clase"))
  ? examParams.get("clase")
  : null;

window.EXAM_CONFIG = Object.freeze({
  examId: "22222222-2222-4222-8222-222222222222",
  apiUrl: "https://zprvefdhcxnivdgsbpkw.supabase.co/functions/v1/exam-api",
  graderApiUrl: "https://zprvefdhcxnivdgsbpkw.supabase.co/functions/v1/grader-api",
  publishableKey: "sb_publishable_RH2Gj2j_K83BPWH_LX5I_w_9BsUT8ax",
  moodleOrigin: "https://campus.uflo.edu.ar",
  requestTimeoutMs: 15000,
  contextTimeoutMs: 12000,
  requireSafeExamBrowser: true,
  allowUnsafeBrowser: isLocalExam && examParams.get("dev") === "1",
  practiceClass,
  // Safe Exam Browser agrega este parámetro a la URL de inicio, tomándolo del
  // enlace sebs:// que arma el Campus con la identidad ya resuelta.
  launchPass: (examParams.get("pase") || "").slice(0, 256),
  demo: Boolean(practiceClass) || examParams.get("demo") === "1"
    || (isLocalExam && !location.search.includes("production=1")),
});
