import { describe, expect, it } from "vitest";

import { redactText, redactUnknown, redactUrl } from "@humanqa/core";

describe("redaction", () => {
  it.each([
    ["email", "alice@example.com"],
    ["bearer", "Authorization: Bearer abcdefghijklmnop"],
    ["OpenAI-style key", "sk-abcdefghijklmnopqrst"],
    ["password", "password=correct-horse-battery"],
    ["US phone", "212-555-0199"],
    ["SSN", "123-45-6789"]
  ])("removes seeded %s values", (_name, secret) => {
    const result = redactText(`before ${secret} after`);
    expect(result.value).not.toContain(secret);
    expect(result.redactions.length).toBeGreaterThan(0);
  });

  it("redacts secret query parameters but keeps ordinary route context", () => {
    const result = redactUrl(
      "https://example.test/projects?page=2&access_token=super-secret-token&view=grid"
    );
    expect(result.value).toContain("page=2");
    expect(result.value).toContain("view=grid");
    expect(result.value).not.toContain("super-secret-token");
  });

  it("redacts sensitive object keys recursively", () => {
    const result = redactUnknown({
      authorization: "Bearer secret-token-value",
      nested: { password: "fixture-password", title: "Safe title" }
    });
    expect(result).toEqual({
      authorization: "[REDACTED:sensitive-field]",
      nested: { password: "[REDACTED:sensitive-field]", title: "Safe title" }
    });
  });
});
