const examParams = new URLSearchParams(location.search);
const isLocalExam = location.hostname === "localhost" || location.hostname === "127.0.0.1";
// Las prácticas por clase: la misma lista que PRACTICES en mock-api.js.
const practiceClass = ["3", "4", "6", "7", "8"].includes(examParams.get("clase"))
  ? examParams.get("clase")
  : null;

window.EXAM_CONFIG = Object.freeze({
  // El segundo parcial (02/11). El simulacro de la clase 5 ya cerró: antes de
  // las 8:35 el acceso sólo muestra cuándo se abre el parcial.
  examId: "d5a9106c-9a43-4f54-a662-211f2d2f07bd",
  // Las devoluciones y las notas siguen mostrando el primer parcial hasta que se
  // publique la corrección del segundo.
  feedbackExamId: "0b2f7900-acd5-4f9c-bb47-455127829e48",
  // Copia abierta del segundo parcial para que el equipo docente pruebe el
  // ingreso antes de la hora. Sólo la recibe una cuenta que el servidor
  // reconoce como correctora; los estudiantes siguen en examId.
  staffExamId: "827f57cd-4cfd-4067-a2c0-5d69ea5b3c13",
  rehearsalExamId: "22222222-2222-4222-8222-222222222222",
  apiUrl: "https://zprvefdhcxnivdgsbpkw.supabase.co/functions/v1/exam-api",
  graderApiUrl: "https://zprvefdhcxnivdgsbpkw.supabase.co/functions/v1/grader-api",
  feedbackApiUrl: "https://zprvefdhcxnivdgsbpkw.supabase.co/functions/v1/feedback-api",
  publishableKey: "sb_publishable_RH2Gj2j_K83BPWH_LX5I_w_9BsUT8ax",
  moodleOrigin: "https://campus.uflo.edu.ar",
  requestTimeoutMs: 15000,
  contextTimeoutMs: 12000,
  requireSafeExamBrowser: true,
  allowUnsafeBrowser: isLocalExam && examParams.get("dev") === "1",
  practiceClass,
  // Si la dirección pide una práctica que esta versión no conoce, la página no
  // tiene que caer en el examen real: muestra un aviso y nada más.
  practiceRequested: examParams.has("clase"),
  // Safe Exam Browser agrega este parámetro a la URL de inicio, tomándolo del
  // enlace sebs:// que arma el Campus con la identidad ya resuelta.
  launchPass: (examParams.get("pase") || "").slice(0, 256),
  demo: Boolean(practiceClass) || examParams.get("demo") === "1"
    || (isLocalExam && !location.search.includes("production=1")),
});
