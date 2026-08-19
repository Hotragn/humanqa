import { describe, expect, it } from "vitest";

import type { FindingDraft } from "@humanqa/core";
import {
  calculatePriority,
  calculateReleaseRisk,
  scoreFindings,
  summarizeRisk
} from "@humanqa/scorer";

function draft(overrides: Partial<FindingDraft> = {}): FindingDraft {
  return {
    targetKey: "#target",
    title: "Expected state is absent",
    category: "functional",
    severity: "high",
    confidence: 0.9,
    source: "deterministic",
    userImpact: "The declared journey cannot complete.",
    reach: 2,
    impact: 4,
    effort: 2,
    journeyCriticality: 5,
    reproductionSteps: ["Open the fixture.", "Inspect the target."],
    evidence: {
      screenshots: [],
      trace: "artifacts/trace.zip",
      url: "http://127.0.0.1:4173",
      selector: "#target",
      rule: "expected-state-missing"
    },
    suggestedRemediation: "Restore the declared state.",
    regressionCandidate: true,
    limitations: ["Fixture scope only."],
    ...overrides
  };
}

describe("transparent scoring", () => {
  it("implements the documented formulas", () => {
    expect(calculatePriority({ reach: 2, impact: 4, confidence: 0.9, effort: 2 })).toBe(3.6);
    expect(calculateReleaseRisk({ severity: "high", confidence: 0.9, journeyCriticality: 5 })).toBe(
      18
    );
  });

  it("deduplicates stable findings and escalates high deterministic risk", () => {
    const findings = scoreFindings([draft(), draft()]);
    expect(findings).toHaveLength(1);
    expect(findings[0]?.id).toMatch(/^HQ-FN-/u);
    const summary = summarizeRisk(findings, {
      maxDurationSeconds: 120,
      maxCriticalFindings: 0,
      minQualityScore: 80
    });
    expect(summary.verdict).toBe("Fix before launch");
    expect(summary.releaseRisk).toBe(18);
  });

  it("does not let advisory findings create an automatic block", () => {
    const findings = scoreFindings([draft({ source: "advisory", severity: "critical" })]);
    const summary = summarizeRisk(findings, {
      maxDurationSeconds: 120,
      maxCriticalFindings: 0,
      minQualityScore: 80
    });
    expect(summary.releaseRisk).toBe(0);
    expect(summary.verdict).toBe("Informational");
  });
});
