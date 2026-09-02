const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const gradingStatuses = new Set([
  "unassigned",
  "in_review",
  "reviewed",
  "ready_to_publish",
  "published",
]);

/** @returns {never} */
function invalid(code = "invalid_request") {
  throw new Error(code);
}

function requireObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) invalid();
  return value;
}

function requireUuid(value, code) {
  if (typeof value !== "string" || !uuidPattern.test(value)) invalid(code);
  return value;
}

function requireVersion(value) {
  if (!Number.isSafeInteger(value) || value < 0) invalid("invalid_grading_version");
  return value;
}

function optionalText(value, maximum, code) {
  if (value === undefined || value === null) return "";
  if (typeof value !== "string" || value.length > maximum) invalid(code);
  return value;
}

function validateCriteria(value) {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > 50) invalid("invalid_criteria_batch");
  return value.map((raw) => {
    const criterion = requireObject(raw);
    const score = criterion.score;
    if (typeof score !== "number" || !Number.isFinite(score) || score < 0) {
      invalid("invalid_criterion_entry");
    }
    return {
      criterionId: requireUuid(criterion.criterionId, "invalid_criterion_entry"),
      score,
      comment: optionalText(criterion.comment, 4000, "grading_text_too_long"),
    };
  });
}

function validateAnnotations(value) {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > 100) invalid("invalid_annotation_batch");
  return value.map((raw) => {
    const annotation = requireObject(raw);
    if (
      !Number.isSafeInteger(annotation.startOffset)
      || !Number.isSafeInteger(annotation.endOffset)
      || annotation.startOffset < 0
      || annotation.endOffset <= annotation.startOffset
      || typeof annotation.selectedText !== "string"
      || annotation.selectedText.length < 1
      || annotation.selectedText.length > 8000
      || typeof annotation.comment !== "string"
      || annotation.comment.trim().length < 1
      || annotation.comment.length > 4000
      || (
        annotation.visibleToStudent !== undefined
        && typeof annotation.visibleToStudent !== "boolean"
      )
    ) invalid("invalid_annotation_entry");

    return {
      startOffset: annotation.startOffset,
      endOffset: annotation.endOffset,
      selectedText: annotation.selectedText,
      comment: annotation.comment,
      visibleToStudent: annotation.visibleToStudent ?? true,
    };
  });
}

function validateEssays(value) {
  if (!Array.isArray(value) || value.length < 1 || value.length > 10) {
    invalid("invalid_essay_batch");
  }
  const seen = new Set();
  return value.map((raw) => {
    const essay = requireObject(raw);
    const itemId = requireUuid(essay.itemId, "invalid_essay_entry");
    if (seen.has(itemId)) invalid("duplicate_essay_item");
    seen.add(itemId);
    const score = essay.score ?? null;
    if (
      score !== null
      && (typeof score !== "number" || !Number.isFinite(score) || score < 0)
    ) invalid("invalid_essay_score");

    return {
      itemId,
      score,
      generalFeedback: optionalText(
        essay.generalFeedback,
        8000,
        "grading_text_too_long",
      ),
      internalNote: optionalText(essay.internalNote, 8000, "grading_text_too_long"),
      criteria: validateCriteria(essay.criteria),
      annotations: validateAnnotations(essay.annotations),
    };
  });
}

/**
 * @param {unknown} rawBody
 * @returns {{kind: "bootstrap"} | {kind: "rpc", name: string, args: Record<string, unknown>}}
 */
export function buildGradingOperation(rawBody) {
  const body = requireObject(rawBody);
  const action = typeof body.action === "string" ? body.action : "";

  if (action === "bootstrap") return { kind: "bootstrap" };

  if (action === "queue") {
    const status = body.status === undefined || body.status === null || body.status === ""
      ? null
      : body.status;
    if (status !== null && (typeof status !== "string" || !gradingStatuses.has(status))) {
      invalid("invalid_grading_status");
    }
    const limit = body.limit ?? 100;
    if (!Number.isSafeInteger(limit) || limit < 1 || limit > 200) {
      invalid("invalid_page_limit");
    }
    return {
      kind: "rpc",
      name: "grading_queue",
      args: {
        p_exam_public_id: requireUuid(body.examId, "exam_not_available"),
        p_status: status,
        p_limit: limit,
      },
    };
  }

  if (!new Set([
    "get", "claim", "release", "saveDraft",
    "markReviewed", "markReady", "publish",
  ]).has(action)) invalid("unknown_action");

  const attemptId = requireUuid(body.attemptId, "attempt_not_available");
  const attemptArgs = { p_attempt_public_id: attemptId };

  if (action === "get") {
    return { kind: "rpc", name: "grading_get_attempt", args: attemptArgs };
  }
  if (action === "claim") {
    return { kind: "rpc", name: "grading_claim_attempt", args: attemptArgs };
  }
  if (action === "release") {
    const reason = typeof body.reason === "string" ? body.reason.trim() : "";
    if (reason.length < 3 || reason.length > 500) invalid("invalid_release_reason");
    return {
      kind: "rpc",
      name: "grading_release_attempt",
      args: { ...attemptArgs, p_reason: reason },
    };
  }
  if (action === "saveDraft") {
    return {
      kind: "rpc",
      name: "grading_save_draft",
      args: {
        ...attemptArgs,
        p_expected_version: requireVersion(body.expectedVersion),
        p_essays: validateEssays(body.essays),
      },
    };
  }

  const versionedActions = {
    markReviewed: "grading_mark_reviewed",
    markReady: "grading_mark_ready",
    publish: "grading_publish",
  };
  const functionName = versionedActions[action];
  if (functionName) {
    return {
      kind: "rpc",
      name: functionName,
      args: {
        ...attemptArgs,
        p_expected_version: requireVersion(body.expectedVersion),
      },
    };
  }

  invalid("unknown_action");
}

/**
 * @param {unknown} error
 * @returns {{status: number, code: string}}
 */
export function publicGradingError(error) {
  const message = error instanceof Error
    ? error.message
    : error && typeof error === "object" && "message" in error
    ? String(error.message)
    : String(error);

  /** @type {Array<[number, string[]]>} */
  const groups = [
    [400, [
      "invalid_request", "payload_too_large", "unknown_action",
      "invalid_grading_status", "invalid_page_limit", "invalid_grading_version",
      "invalid_release_reason", "invalid_essay_batch", "invalid_essay_entry",
      "duplicate_essay_item", "invalid_essay_score", "invalid_criteria_batch",
      "invalid_criterion_entry", "invalid_annotation_batch", "invalid_annotation_entry",
      "invalid_essay_item", "invalid_rubric_criterion", "grading_text_too_long",
      "annotation_text_mismatch",
    ]],
    [403, ["grader_not_authorized", "grader_inactive", "coordinator_required"]],
    [404, ["exam_not_available", "attempt_not_available"]],
    [409, [
      "attempt_not_claimable", "attempt_already_claimed", "attempt_not_owned",
      "attempt_not_editable", "grading_version_conflict", "essay_grades_incomplete",
      "rubric_grades_incomplete", "manual_score_exceeds_maximum",
      "attempt_not_reviewed", "attempt_not_ready_to_publish", "feedback_snapshot_failed",
    ]],
  ];

  for (const [status, codes] of groups) {
    const code = codes.find((candidate) => message.includes(candidate));
    if (code) return { status, code };
  }
  return { status: 500, code: "internal_error" };
}
