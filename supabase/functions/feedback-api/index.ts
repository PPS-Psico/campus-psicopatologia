import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import {
  parseFeedbackAction,
  publicFeedbackError,
} from "./validation.js";

type RpcAdmin = {
  rpc: (
    functionName: string,
    args?: Record<string, unknown>,
  ) => Promise<{ data: unknown; error: { message?: string } | null }>;
};

const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8", { fatal: true });
const maxRequestBytes = 64_000;
const allowedOrigin = Deno.env.get("FEEDBACK_APP_ORIGIN")
  ?? "https://pps-psico.github.io";

const corsHeaders = {
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Headers": "apikey, content-type, x-feedback-token",
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

function randomToken(): string {
  return encodeBase64Url(crypto.getRandomValues(new Uint8Array(32)));
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0"))
    .join("");
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

async function invoke(
  admin: RpcAdmin,
  name: string,
  args: Record<string, unknown>,
): Promise<unknown> {
  const result = await admin.rpc(name, args);
  if (result.error) throw result.error;
  return result.data;
}

const securedHandler = withSupabase(
  { auth: "publishable" },
  async (req, ctx) => {
    try {
      if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
      const body = await readJsonObject(req);
      const operation = parseFeedbackAction(body);
      const admin = ctx.supabaseAdmin as unknown as RpcAdmin;

      if (operation.action === "launch") {
        const sessionToken = randomToken();
        const context = operation.context;
        const data = await invoke(admin, "feedback_launch_by_identity", {
          p_course_id: context.courseId,
          p_moodle_user_id: context.moodleUserId,
          p_dni: context.dni,
          p_first_name: context.firstname,
          p_last_name: context.lastname,
          p_session_token_hash: await sha256(sessionToken),
        });
        return json({ ...(data as Record<string, unknown>), sessionToken });
      }

      const token = req.headers.get("x-feedback-token") ?? "";
      if (token.length < 32 || token.length > 256) {
        return json({ error: "invalid_feedback_session" }, 401);
      }
      const tokenHash = await sha256(token);
      if (operation.action === "get") {
        return json(await invoke(admin, "feedback_get", {
          p_session_token_hash: tokenHash,
        }));
      }
      return json(await invoke(admin, "feedback_logout", {
        p_session_token_hash: tokenHash,
      }));
    } catch (error) {
      const safe = publicFeedbackError(error);
      if (safe.status >= 500) console.error("feedback-api failure", error);
      return json({ error: safe.code }, safe.status);
    }
  },
);

export default {
  async fetch(req: Request): Promise<Response> {
    const origin = req.headers.get("origin");
    if (origin !== allowedOrigin) return json({ error: "origin_not_allowed" }, 403);
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }
    return securedHandler(req);
  },
};
