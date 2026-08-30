export function formatRemaining(milliseconds) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function remainingMilliseconds(deadlineAt, serverOffsetMs = 0, nowMs = Date.now()) {
  return Date.parse(deadlineAt) - (nowMs + serverOffsetMs);
}

export function isAnswered(item, answer) {
  if (!answer) return false;
  if (item.kind === "single_choice") return Boolean(answer.selectedOptionId);
  return Boolean(answer.essayText && answer.essayText.trim().length > 0);
}

export function progressFor(items, answers) {
  const answered = items.filter((item) => isAnswered(item, answers.get(item.id))).length;
  return { answered, total: items.length, percent: items.length ? (answered / items.length) * 100 : 0 };
}

export function firstUnansweredIndex(items, answers) {
  const index = items.findIndex((item) => !isAnswered(item, answers.get(item.id)));
  return index === -1 ? Math.max(0, items.length - 1) : index;
}

export function buildResponse(item, answer) {
  return {
    itemId: item.id,
    selectedOptionId: item.kind === "single_choice" ? answer.selectedOptionId : null,
    essayText: item.kind === "essay" ? answer.essayText : null,
    clientRevision: answer.clientRevision,
  };
}
