import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import {
  buildGradingOperation,
  publicGradingError,
} from "./validation.js";

type RpcAdmin = {
  rpc: (
    functionName: string,
    args?: Record<string, unknown>,
  ) => Promise<{ data: unknown; error: { message?: string } | null }>;
};

const decoder = new TextDecoder("utf-8", { fatal: true });
const maxRequestBytes = 256_000;
const allowedOrigin = Deno.env.get("GRADER_APP_ORIGIN")
  ?? "https://pps-psico.github.io";

const corsHeaders = {
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Headers": "apikey, authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "600",
  "Vary": "Origin",
};

function responseHeaders(source?: HeadersInit): Headers {
  const headers = new Headers(source);
  for (const [name, value] of Object.entries(corsHeaders)) headers.set(name, value);
  headers.set("Cache-Control", "no-store");
  headers.set("X-Content-Type-Options", "nosniff");
  return headers;
}

function json(payload: unknown, status = 200): Response {
  return Response.json(payload, { status, headers: responseHeaders() });
}

function withResponseHeaders(response: Response): Response {
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders(response.headers),
  });
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
  functionName: string,
  actorUserId: string,
  args: Record<string, unknown> = {},
): Promise<unknown> {
  const result = await admin.rpc(functionName, {
    p_actor_user_id: actorUserId,
    ...args,
  });
  if (result.error) throw result.error;
  return result.data;
}

const securedHandler = withSupabase(
  { auth: "user", cors: false },
  async (req, ctx) => {
    try {
      if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
      const actorUserId = ctx.userClaims?.id;
      if (
        typeof actorUserId !== "string"
        || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(actorUserId)
      ) return json({ error: "invalid_session" }, 401);

      const body = await readJsonObject(req);
      const operation = buildGradingOperation(body);
      const admin = ctx.supabaseAdmin as unknown as RpcAdmin;

      if (operation.kind === "bootstrap") {
        const [profile, exams] = await Promise.all([
          invoke(admin, "grading_me", actorUserId),
          invoke(admin, "grading_exams", actorUserId),
        ]);
        return json({ profile, exams });
      }

      const data = await invoke(admin, operation.name, actorUserId, operation.args);
      return json(data);
    } catch (error) {
      const safe = publicGradingError(error);
      if (safe.status >= 500) console.error("grader-api failure", error);
      return json({ error: safe.code }, safe.status);
    }
  },
);

export default {
  async fetch(req: Request): Promise<Response> {
    const origin = req.headers.get("origin");
    if (origin !== allowedOrigin) return json({ error: "origin_not_allowed" }, 403);
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: responseHeaders() });
    }
    return withResponseHeaders(await securedHandler(req));
  },
};
