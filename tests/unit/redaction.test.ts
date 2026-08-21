import { describe, expect, it } from "vitest";

import { redactDomExcerpt, redactText, redactUnknown, redactUrl } from "@humanqa/core";

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

  it.each([
    [
      "mixed-case key",
      "https://example.test/projects?Access_Token=visible-secret&page=2",
      "visible-secret"
    ],
    [
      "percent-encoded email value",
      "https://example.test/projects?contact=alice%40example.com&view=grid",
      "alice"
    ],
    [
      "percent-encoded signature key",
      "https://example.test/projects?Sign%61ture=signed-value&tab=activity",
      "signed-value"
    ]
  ])("redacts %s without removing ordinary route context", (_name, input, secretFragment) => {
    const result = redactUrl(input);
    expect(result.value).not.toContain(secretFragment);
    expect(result.value).toMatch(/projects\?/u);
    expect(result.value).toMatch(/(?:page=2|view=grid|tab=activity)/u);
  });

  it("preserves duplicate ordinary parameters while redacting each decoded value", () => {
    const result = redactUrl(
      "https://example.test/search?tag=quality&tag=alice%40example.com&sort=newest"
    );
    const sanitized = new URL(result.value);
    expect(sanitized.searchParams.getAll("tag")).toEqual(["quality", "[REDACTED:email]"]);
    expect(sanitized.searchParams.get("sort")).toBe("newest");
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

  it("redacts sensitive input values in either attribute order without changing ordinary inputs", () => {
    const excerpt = [
      '<input value="fixture-password" data-note="safe" type="password">',
      "<input type=email value='alice@example.test'>",
      '<input type="text" value="public fixture value">'
    ].join("");
    const result = redactDomExcerpt(excerpt);
    expect(result).not.toContain("fixture-password");
    expect(result).not.toContain("alice@example.test");
    expect(result).toContain('type="text" value="public fixture value"');
  });
});
