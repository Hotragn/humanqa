import { describe, expect, it } from "vitest";

import { generateTestCode } from "@humanqa/test-generator";

import { sampleFinding, sampleReport } from "../fixtures/report";

describe("test generator", () => {
  it("emits a complete non-destructive accessible-name regression scaffold", () => {
    const generated = generateTestCode(sampleReport());
    expect(generated.code).toContain('import { expect, test } from "@playwright/test";');
    expect(generated.code).toContain("HQ-AX-ABC12345");
    expect(generated.code).toContain("http://127.0.0.1:4173/projects/new");
    expect(generated.code).toContain('page.locator("#project-slug")');
    expect(generated.code).toContain("toHaveAccessibleName(/\\S/u)");
    expect(generated.code).toContain("Human review required");
    expect(generated.code).not.toMatch(/delete|purchase|pay|upload/iu);
  });

  it("rejects safety findings", () => {
    const finding = sampleFinding({
      category: "safety",
      evidence: {
        screenshots: [],
        trace: "artifacts/trace.zip",
        url: "http://127.0.0.1:4173/settings",
        selector: "#delete",
        rule: "safe-action-blocked"
      }
    });
    expect(() => generateTestCode(sampleReport([finding]))).toThrow(/not safe/iu);
  });

  it("rejects findings that are not regression candidates", () => {
    const finding = sampleFinding({ regressionCandidate: false });
    expect(() => generateTestCode(sampleReport([finding]), finding.id)).toThrow(/not marked/iu);
  });
});
