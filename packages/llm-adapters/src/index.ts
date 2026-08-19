import type { Finding } from "@humanqa/core";

export type EvidenceBackedFinding = Readonly<Finding>;
export type EnrichedFinding = Finding;

export interface LlmAdapter {
  name: string;
  isConfigured(): boolean;
  enrichFinding(input: EvidenceBackedFinding): Promise<EnrichedFinding>;
}

export interface LlmConsent {
  enabled: boolean;
  acknowledgedArtifactDisclosure: boolean;
  allowedFields: Array<"title" | "userImpact" | "remediation" | "limitations">;
}

export const llmPrivacyWarning =
  "LLM enrichment can disclose finding content to an external provider. It is disabled by default. Never send screenshots, DOM excerpts, traces, URLs, credentials, or personal data without explicit provider configuration, field-level consent, and a reviewed data-processing policy.";

export class MockLlmAdapter implements LlmAdapter {
  public readonly name = "mock-local";

  public constructor(private readonly configured = true) {}

  public isConfigured(): boolean {
    return this.configured;
  }

  public enrichFinding(input: EvidenceBackedFinding): Promise<EnrichedFinding> {
    if (!this.isConfigured()) throw new Error("Mock LLM adapter is not configured.");
    return Promise.resolve({
      ...input,
      evidence: { ...input.evidence },
      reproductionSteps: [...input.reproductionSteps],
      limitations: [...input.limitations],
      aiInsights: [
        ...(input.aiInsights ?? []),
        {
          adapter: this.name,
          text: `Local mock enrichment for ${input.id}; no external request was made.`,
          rationale:
            "Development-only adapter output demonstrates provenance without changing severity, confidence, evidence, priority, or release risk."
        }
      ]
    });
  }
}

export async function enrichWithConsent(
  adapter: LlmAdapter,
  finding: EvidenceBackedFinding,
  consent: LlmConsent
): Promise<EnrichedFinding> {
  if (!consent.enabled || !consent.acknowledgedArtifactDisclosure) {
    throw new Error(`Explicit LLM consent is required. ${llmPrivacyWarning}`);
  }
  if (!adapter.isConfigured()) throw new Error(`LLM adapter ${adapter.name} is not configured.`);
  const enriched = await adapter.enrichFinding(finding);
  return {
    ...finding,
    aiInsights: enriched.aiInsights?.map((insight) => ({ ...insight })) ?? []
  };
}
