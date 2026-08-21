const redactionRules: Array<{ name: string; pattern: RegExp }> = [
  {
    name: "email",
    pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/giu
  },
  {
    name: "bearer-token",
    pattern: /\bBearer\s+[A-Za-z0-9._~+/=-]{8,}\b/giu
  },
  {
    name: "openai-style-key",
    pattern: /\bsk-[A-Za-z0-9_-]{12,}\b/gu
  },
  {
    name: "github-style-token",
    pattern: /\b(?:ghp|github_pat)_[A-Za-z0-9_]{12,}\b/gu
  },
  {
    name: "authorization-header",
    pattern: /(authorization\s*:\s*)[^\s,;]+/giu
  },
  {
    name: "secret-assignment",
    pattern: /((?:api[_-]?key|access[_-]?token|password|passwd|secret)\s*[=:]\s*)[^\s,;&]+/giu
  },
  {
    name: "ssn",
    pattern: /\b\d{3}-\d{2}-\d{4}\b/gu
  },
  {
    name: "phone",
    pattern: /(?<!\d)(?:\+?1[ .-]?)?\(?\d{3}\)?[ .-]\d{3}[ .-]\d{4}(?!\d)/gu
  }
];

const sensitiveKeys =
  /^(?:authorization|cookie|set-cookie|password|passwd|secret|token|api[-_]?key)$/iu;
const sensitiveQueryKeys = /(?:token|secret|password|passwd|key|authorization|auth|signature)/iu;

export interface RedactionResult {
  value: string;
  redactions: string[];
}

export function redactText(input: string): RedactionResult {
  let value = input;
  const redactions = new Set<string>();
  for (const rule of redactionRules) {
    value = value.replace(rule.pattern, (match, prefix: unknown) => {
      redactions.add(rule.name);
      if (typeof prefix === "string" && match.startsWith(prefix)) {
        return `${prefix}[REDACTED:${rule.name}]`;
      }
      return `[REDACTED:${rule.name}]`;
    });
  }
  return { value, redactions: [...redactions] };
}

export function redactUrl(input: string): RedactionResult {
  const found = new Set<string>();
  try {
    const url = new URL(input);
    const sanitized = new URLSearchParams();
    for (const [key, value] of url.searchParams) {
      if (sensitiveQueryKeys.test(key)) {
        sanitized.append(key, "[REDACTED:query-secret]");
        found.add("query-secret");
        continue;
      }
      const valueResult = redactText(value);
      sanitized.append(key, valueResult.value);
      for (const item of valueResult.redactions) found.add(item);
    }
    url.search = sanitized.toString();
    const textResult = redactText(url.toString());
    for (const item of textResult.redactions) found.add(item);
    return { value: textResult.value, redactions: [...found] };
  } catch {
    return redactText(input);
  }
}

export function redactUnknown(value: unknown): unknown {
  if (typeof value === "string") return redactText(value).value;
  if (Array.isArray(value)) return value.map((item) => redactUnknown(item));
  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value)) {
      result[key] = sensitiveKeys.test(key) ? "[REDACTED:sensitive-field]" : redactUnknown(child);
    }
    return result;
  }
  return value;
}

export function redactDomExcerpt(html: string): string {
  const redactedInputs = html.replace(/<input\b[^>]*>/giu, (tag) => {
    const sensitiveType =
      /\btype\s*=\s*(?:"(?:password|email)"|'(?:password|email)'|(?:password|email))(?=\s|\/?>)/iu.test(
        tag
      );
    if (!sensitiveType) return tag;
    return tag
      .replace(/(\bvalue\s*=\s*")[^"]*"/giu, '$1[REDACTED:input-value]"')
      .replace(/(\bvalue\s*=\s*')[^']*'/giu, "$1[REDACTED:input-value]'");
  });
  return redactText(redactedInputs).value;
}
