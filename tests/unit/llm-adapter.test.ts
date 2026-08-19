import { describe, expect, it } from "vitest";

import { MockLlmAdapter, enrichWithConsent } from "@humanqa/llm-adapters";

import { sampleFinding } from "../fixtures/report";

describe("optional LLM boundary", () => {
  it("preserves deterministic evidence, severity, confidence, and score", async () => {
    const finding = sampleFinding();
    const enriched = await enrichWithConsent(new MockLlmAdapter(), finding, {
      enabled: true,
      acknowledgedArtifactDisclosure: true,
      allowedFields: ["title", "remediation", "limitations"]
    });
    expect(enriched.evidence).toEqual(finding.evidence);
    expect(enriched.severity).toBe(finding.severity);
    expect(enriched.confidence).toBe(finding.confidence);
    expect(enriched.releaseRisk).toBe(finding.releaseRisk);
    expect(enriched.aiInsights?.[0]?.adapter).toBe("mock-local");
  });

  it("requires explicit consent", async () => {
    await expect(
      enrichWithConsent(new MockLlmAdapter(), sampleFinding(), {
        enabled: false,
        acknowledgedArtifactDisclosure: false,
        allowedFields: []
      })
    ).rejects.toThrow(/consent/iu);
  });
});
