import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import {
  shouldRequireSafeBrowser,
  verifySafeBrowserRequest,
} from "./seb-verification.js";

type MoodleContext = {
  courseId: string;
  moodleUserId: string;
  moodleUsername: string;
  firstname: string;
  lastname: string;
};

type RpcAdmin = {
  rpc: (
    functionName: string,
    args?: Record<string, unknown>,
  ) => Promise<{ data: unknown; error: { message?: string } | null }>;
};

const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8", { fatal: true });
const maxRequestBytes = 128_000;
const allowedOrigin = Deno.env.get("EXAM_APP_ORIGIN") ?? "https://pps-psico.github.io";
const safeBrowserConfigKey = (Deno.env.get("SEB_CONFIG_KEY") ?? "").trim().toLowerCase();
const safeBrowserExamKeys = (Deno.env.get("SEB_BROWSER_EXAM_KEYS") ?? "")
  .split(",")
  .map((value) => value.trim().toLowerCase())
  .filter((value) => /^[0-9a-f]{64}$/.test(value));
const safeBrowserExamUrl = Deno.env.get("SEB_EXAM_URL")
  ?? "https://pps-psico.github.io/campus-psicopatologia/parcial/index.html";
const safeBrowserRequired = shouldRequireSafeBrowser(
  allowedOrigin,
  Deno.env.get("SEB_REQUIRED"),
);

const corsHeaders = {
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Headers": "apikey, content-type, x-exam-token, x-safeexambrowser-configkeyhash, x-safeexambrowser-requesthash",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "600",
  "Vary": "Origin",
};

function json(payload: unknown, status = 200): Response {
  return Response.json(payload, {
    status,
    headers: {
      ...corsHeaders,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function encodeBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function verifySafeExamBrowser(req: Request, body: Record<string, unknown>): Promise<void> {
  const proof = body.seb && typeof body.seb === "object"
    ? body.seb as Record<string, unknown>
    : {};
  const result = await verifySafeBrowserRequest({
    required: safeBrowserRequired,
    requestUrl: req.url,
    examUrl: safeBrowserExamUrl,
    configKey: safeBrowserConfigKey,
    browserExamKeys: safeBrowserExamKeys,
    directConfigHash: req.headers.get("x-safeexambrowser-configkeyhash"),
    directBrowserExamHash: req.headers.get("x-safeexambrowser-requesthash"),
    javascriptProof: proof,
  });
  if (result === "not_configured") throw new Error("safe_browser_not_configured");
  if (result !== "valid") throw new Error("safe_browser_invalid");
}

async function readJsonObject(req: Request): Promise<Record<string, unknown>> {
  const declaredLength = Number(req.headers.get("content-length") ?? "0");
  if (Number.isFinite(declaredLength) && declaredLength > maxRequestBytes) {
    throw new Error("payload_too_large");
  }
  if (!req.body) throw new Error("invalid_request");

  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > maxRequestBytes) {
      await reader.cancel();
      throw new Error("payload_too_large");
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(decoder.decode(bytes));
  } catch {
    throw new Error("invalid_request");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("invalid_request");
  }
  return parsed as Record<string, unknown>;
}

function randomToken(): string {
  return encodeBase64Url(crypto.getRandomValues(new Uint8Array(32)));
}

function isUuid(value: unknown): value is string {
  return typeof value === "string"
    && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function cleanName(value: unknown): string {
  if (typeof value !== "string" || value.includes("{") || value.includes("}")) {
    throw new Error("invalid_moodle_context");
  }
  const cleaned = value.trim().replace(/\s+/g, " ");
  if (cleaned.length < 1 || cleaned.length > 120) throw new Error("invalid_moodle_context");
  return cleaned;
}

function parseMoodleContext(value: unknown): MoodleContext & { dni: string } {
  if (!value || typeof value !== "object") throw new Error("invalid_moodle_context");
  const context = value as Record<string, unknown>;
  const courseId = typeof context.courseId === "string" ? context.courseId.trim() : "";
  const moodleUserId = typeof context.moodleUserId === "string" ? context.moodleUserId.trim() : "";
  const username = typeof context.moodleUsername === "string" ? context.moodleUsername.trim() : "";
  const dni = username.replace(/\D/g, "");

  if (
    !/^\d{1,20}$/.test(courseId)
    || !/^\d{1,20}$/.test(moodleUserId)
    || !/^\d{6,9}$/.test(dni)
    || dni !== username.replace(/[.\s-]/g, "")
  ) throw new Error("invalid_moodle_context");

  return {
    courseId,
    moodleUserId,
    moodleUsername: username,
    dni,
    firstname: cleanName(context.firstname),
    lastname: cleanName(context.lastname),
  };
}

function publicError(error: unknown): { status: number; code: string } {
  const message = error instanceof Error
    ? error.message
    : error && typeof error === "object" && "message" in error
    ? String(error.message)
    : String(error);
  const known: Record<string, { status: number; code: string }> = {
    invalid_request: { status: 400, code: "invalid_request" },
    payload_too_large: { status: 413, code: "payload_too_large" },
    invalid_moodle_context: { status: 400, code: "invalid_moodle_context" },
    identity_not_registered: { status: 403, code: "identity_not_registered" },
    identity_not_verified: { status: 403, code: "identity_not_verified" },
    identity_mismatch: { status: 403, code: "identity_mismatch" },
    moodle_account_conflict: { status: 409, code: "moodle_account_conflict" },
    invalid_attempt_session: { status: 401, code: "invalid_attempt_session" },
    exam_not_available: { status: 404, code: "exam_not_available" },
    exam_not_open: { status: 403, code: "exam_not_open" },
    exam_closed: { status: 403, code: "exam_closed" },
    exam_has_no_questions: { status: 409, code: "exam_has_no_questions" },
    invalid_response_batch: { status: 400, code: "invalid_response_batch" },
    responses_essay_length_valid: { status: 400, code: "invalid_response_batch" },
    invalid_attempt_item: { status: 400, code: "invalid_attempt_item" },
    invalid_question_option: { status: 400, code: "invalid_question_option" },
    invalid_event_type: { status: 400, code: "invalid_event_type" },
    invalid_event_details: { status: 400, code: "invalid_event_details" },
    safe_browser_invalid: { status: 403, code: "safe_browser_invalid" },
    safe_browser_not_configured: { status: 503, code: "safe_browser_not_configured" },
  };
  const match = Object.keys(known).find((code) => message.includes(code));
  return match ? known[match] : { status: 500, code: "internal_error" };
}

const securedHandler = withSupabase(
  { auth: ["publishable"] },
  async (req, ctx) => {
    try {
      const admin = ctx.supabaseAdmin as unknown as RpcAdmin;
      if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
      const body = await readJsonObject(req);
      await verifySafeExamBrowser(req, body);
      const action = typeof body.action === "string" ? body.action : "";
      const rawAttemptToken = req.headers.get("x-exam-token") ?? "";

      if (action === "launch") {
        if (!isUuid(body.examId)) throw new Error("exam_not_available");
        const context = parseMoodleContext(body.context);
        const attemptToken = randomToken();
        const { data, error } = await admin.rpc("exam_launch_by_identity", {
          p_exam_public_id: body.examId,
          p_course_id: context.courseId,
          p_moodle_user_id: context.moodleUserId,
          p_dni: context.dni,
          p_first_name: context.firstname,
          p_last_name: context.lastname,
          p_attempt_token_hash: await sha256(attemptToken),
        });
        if (error) throw error;
        return json({ ...(data as Record<string, unknown>), attemptToken });
      }

      if (!rawAttemptToken || rawAttemptToken.length > 256) {
        return json({ error: "invalid_attempt_session" }, 401);
      }
      const tokenHash = await sha256(rawAttemptToken);

      if (action === "state") {
        const { data, error } = await admin.rpc("exam_get_state", {
          p_attempt_token_hash: tokenHash,
        });
        if (error) throw error;
        return json(data);
      }

      if (action === "save") {
        const responses = Array.isArray(body.responses) ? body.responses : [];
        if (responses.some((entry) => {
          if (!entry || typeof entry !== "object") return false;
          const essayText = (entry as Record<string, unknown>).essayText;
          return typeof essayText === "string" && essayText.length > 8000;
        })) throw new Error("invalid_response_batch");
        const { data, error } = await admin.rpc("exam_save", {
          p_attempt_token_hash: tokenHash,
          p_responses: responses,
        });
        if (error) throw error;
        return json(data);
      }

      if (action === "submit") {
        const { data, error } = await admin.rpc("exam_submit", {
          p_attempt_token_hash: tokenHash,
        });
        if (error) throw error;
        return json(data);
      }

      if (action === "event") {
        const eventType = typeof body.eventType === "string" ? body.eventType : "";
        const details = body.details && typeof body.details === "object" ? body.details : {};
        const { error } = await admin.rpc("exam_record_event", {
          p_attempt_token_hash: tokenHash,
          p_event_type: eventType,
          p_details: details,
        });
        if (error) throw error;
        return json({ ok: true });
      }

      return json({ error: "unknown_action" }, 400);
    } catch (error) {
      const safe = publicError(error);
      if (safe.status >= 500) console.error("exam-api failure", error);
      return json({ error: safe.code }, safe.status);
    }
  },
);

export default {
  async fetch(req: Request): Promise<Response> {
    const origin = req.headers.get("origin");
    if (origin !== allowedOrigin) return json({ error: "origin_not_allowed" }, 403);
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
    return securedHandler(req);
  },
};
