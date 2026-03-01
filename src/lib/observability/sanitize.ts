const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const BSN_PATTERN = /\b\d{8,9}\b/g;

export function hashIdentifier(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `h${(hash >>> 0).toString(16)}`;
}

export function sanitizeText(input: string) {
  return input.replace(EMAIL_PATTERN, "[redacted-email]").replace(BSN_PATTERN, "[redacted-bsn]");
}

export function sanitizeUnknown(input: unknown): unknown {
  if (typeof input === "string") {
    return sanitizeText(input);
  }
  if (Array.isArray(input)) {
    return input.map((item) => sanitizeUnknown(item));
  }
  if (input && typeof input === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      result[key] = sanitizeUnknown(value);
    }
    return result;
  }
  return input;
}
