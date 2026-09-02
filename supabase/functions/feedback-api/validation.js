/** @returns {never} */
function invalid(code = "invalid_request") {
  throw new Error(code);
}

function cleanName(value) {
  if (typeof value !== "string" || value.includes("{") || value.includes("}")) {
    invalid("invalid_moodle_context");
  }
  const cleaned = value.trim().replace(/\s+/g, " ");
  if (cleaned.length < 1 || cleaned.length > 120) invalid("invalid_moodle_context");
  return cleaned;
}

export function parseMoodleContext(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    invalid("invalid_moodle_context");
  }
  const courseId = typeof value.courseId === "string" ? value.courseId.trim() : "";
  const moodleUserId = typeof value.moodleUserId === "string"
    ? value.moodleUserId.trim()
    : "";
  const username = typeof value.moodleUsername === "string"
    ? value.moodleUsername.trim()
    : "";
  const dni = username.replace(/\D/g, "");

  if (
    !/^\d{1,20}$/.test(courseId)
    || !/^\d{1,20}$/.test(moodleUserId)
    || !/^\d{6,9}$/.test(dni)
    || dni !== username.replace(/[.\s-]/g, "")
  ) invalid("invalid_moodle_context");

  return {
    courseId,
    moodleUserId,
    dni,
    firstname: cleanName(value.firstname),
    lastname: cleanName(value.lastname),
  };
}

/**
 * @param {unknown} body
 * @returns {{action: "launch", context: ReturnType<typeof parseMoodleContext>} | {action: "get" | "logout"}}
 */
export function parseFeedbackAction(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) invalid();
  const action = typeof body.action === "string" ? body.action : "";
  if (action === "launch") {
    return { action, context: parseMoodleContext(body.context) };
  }
  if (action === "get" || action === "logout") return { action };
  invalid("unknown_action");
}

/** @returns {{status: number, code: string}} */
export function publicFeedbackError(error) {
  const message = error instanceof Error
    ? error.message
    : error && typeof error === "object" && "message" in error
    ? String(error.message)
    : String(error);
  /** @type {Array<[number, string[]]>} */
  const groups = [
    [400, ["invalid_request", "payload_too_large", "unknown_action", "invalid_moodle_context"]],
    [401, ["invalid_feedback_session"]],
    [403, [
      "identity_not_registered", "identity_not_verified", "identity_mismatch",
      "moodle_account_conflict",
    ]],
  ];
  for (const [status, codes] of groups) {
    const code = codes.find((candidate) => message.includes(candidate));
    if (code) return { status, code };
  }
  return { status: 500, code: "internal_error" };
}
