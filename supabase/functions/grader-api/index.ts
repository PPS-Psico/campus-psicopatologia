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

// El reloj del servidor de funciones a veces va apenas adelantado respecto de
// la base, y la base rechaza la credencial por «emitida en el futuro»
// (PGRST303). La consulta no llega a ejecutarse, así que repetirla es seguro:
// se espera un instante y se reintenta. Sin esto, uno de cada doscientos
// pedidos fallaba con un error 500 sin motivo aparente.
function conReintento(admin: RpcAdmin): RpcAdmin {
  return {
    async rpc(functionName, args) {
      let result = await admin.rpc(functionName, args);
      for (const espera of [400, 900, 1600]) {
        const code = (result.error as { code?: string } | null)?.code;
        if (code !== "PGRST303") break;
        await new Promise((listo) => setTimeout(listo, espera));
        result = await admin.rpc(functionName, args);
      }
      return result;
    },
  };
}


const encoder = new TextEncoder();

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

function randomToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function cleanName(value: unknown): string {
  if (typeof value !== "string" || value.includes("{") || value.includes("}")) {
    throw new Error("invalid_moodle_context");
  }
  const cleaned = value.trim().replace(/\s+/g, " ");
  if (!cleaned || cleaned.length > 120) throw new Error("invalid_moodle_context");
  return cleaned;
}

// El panel se abre con la identidad que el Campus ya resolvió: no hay cuenta ni
// contraseña propias. Lo que habilita el espacio es figurar como correctora.
function parseGraderContext(value: unknown) {
  if (!value || typeof value !== "object") throw new Error("invalid_moodle_context");
  const c = value as Record<string, unknown>;
  const courseId = typeof c.courseId === "string" ? c.courseId.trim() : "";
  const moodleUserId = typeof c.moodleUserId === "string" ? c.moodleUserId.trim() : "";
  const username = typeof c.moodleUsername === "string" ? c.moodleUsername.trim() : "";
  const dni = username.replace(/\D/g, "");
  if (
    !/^\d{1,20}$/.test(courseId) || !/^\d{1,20}$/.test(moodleUserId)
    || !/^\d{6,9}$/.test(dni) || dni !== username.replace(/[.\s-]/g, "")
  ) throw new Error("invalid_moodle_context");
  return {
    courseId,
    moodleUserId,
    dni,
    firstname: cleanName(c.firstname),
    lastname: cleanName(c.lastname),
  };
}

const decoder = new TextDecoder("utf-8", { fatal: true });
const maxRequestBytes = 256_000;
const allowedOrigin = Deno.env.get("GRADER_APP_ORIGIN")
  ?? "https://pps-psico.github.io";

const corsHeaders = {
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Headers": "apikey, authorization, content-type, x-grader-token",
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
  { auth: ["publishable"], cors: false },
  async (req, ctx) => {
    try {
      if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
      const admin0 = conReintento(ctx.supabaseAdmin as unknown as RpcAdmin);
      const body = await readJsonObject(req);

      // Abrir sesión es lo único que no exige sesión: lo autoriza el contexto
      // de Moodle, y sólo si ese DNI figura como correctora.
      if (body.action === "login") {
        const context = parseGraderContext(body.context);
        const token = randomToken();
        const { data, error } = await admin0.rpc("grading_login_by_identity", {
          p_course_id: context.courseId,
          p_moodle_user_id: context.moodleUserId,
          p_dni: context.dni,
          p_first_name: context.firstname,
          p_last_name: context.lastname,
          p_token_hash: await sha256(token),
          p_ttl_seconds: 28800,
        });
        if (error) throw error;
        return json({ ...(data as Record<string, unknown>), graderToken: token });
      }

      const rawToken = req.headers.get("x-grader-token") ?? "";
      if (!rawToken || rawToken.length > 256) {
        return json({ error: "invalid_grader_session" }, 401);
      }
      const tokenHash = await sha256(rawToken);

      if (body.action === "logout") {
        const { error } = await admin0.rpc("grading_logout", { p_token_hash: tokenHash });
        if (error) throw error;
        return json({ ok: true });
      }

      const { data: actor, error: actorError } = await admin0.rpc("grading_session_actor", {
        p_token_hash: tokenHash,
      });
      if (actorError) throw actorError;
      const actorUserId = typeof actor === "string" ? actor : "";
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(actorUserId)) {
        return json({ error: "invalid_grader_session" }, 401);
      }

      const operation = buildGradingOperation(body);
      const admin = conReintento(ctx.supabaseAdmin as unknown as RpcAdmin);

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
