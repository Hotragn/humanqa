import { describe, expect, it } from "vitest";

import { humanqaConfigSchema, journeyPackSchema } from "@humanqa/core";

describe("schemas", () => {
  it("applies safe defaults to a minimal valid config", () => {
    const result = humanqaConfigSchema.parse({
      project: { name: "Fixture", baseUrl: "http://127.0.0.1:4173" },
      quality_contracts: [
        {
          id: "fixture-contract",
          name: "Fixture contract",
          journey: "packs/journeys/saas-project-creation.yaml",
          acceptance_criteria: ["Declared state is visible"],
          thresholds: {
            max_duration_seconds: 120,
            max_critical_findings: 0,
            min_quality_score: 80
          }
        }
      ]
    });
    expect(result.defaults.safeMode).toBe(true);
    expect(result.defaults.redact).toBe(true);
    expect(result.defaults.browser).toBe("chromium");
  });

  it("requires an unambiguous click locator", () => {
    const result = journeyPackSchema.safeParse({
      kind: "journey",
      id: "invalid-click",
      name: "Invalid click",
      description: "A fixture journey with an invalid click declaration.",
      author: "Test",
      version: "0.1.0",
      compatibility: "^0.1.0",
      tags: ["fixture"],
      definition: { criticality: 3, steps: [{ action: "click", role: "button" }] }
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]?.message).toContain("requires");
  });

  it("rejects unknown safety-relevant journey keys", () => {
    const result = journeyPackSchema.safeParse({
      kind: "journey",
      id: "unknown-action-field",
      name: "Unknown action field",
      description: "A fixture journey containing an unsupported action field.",
      author: "Test",
      version: "0.1.0",
      compatibility: "^0.1.0",
      tags: ["fixture"],
      definition: {
        criticality: 3,
        steps: [{ action: "goto", path: "/", executeScript: "unsafe" }]
      }
    });
    expect(result.success).toBe(false);
  });
});
