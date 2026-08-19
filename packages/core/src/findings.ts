import { createHash } from "node:crypto";

import type { Finding, FindingCategory, FindingDraft } from "./types";

const categoryCodes: Record<FindingCategory, string> = {
  functional: "FN",
  usability: "UX",
  accessibility: "AX",
  performance: "PF",
  safety: "SF"
};

export function stableFindingId(category: FindingCategory, rule: string, target: string): string {
  const digest = createHash("sha256")
    .update(`${category}\u0000${rule}\u0000${target}`)
    .digest("hex")
    .slice(0, 8)
    .toUpperCase();
  return `HQ-${categoryCodes[category]}-${digest}`;
}

export function materializeFinding(draft: FindingDraft): Finding {
  const { targetKey, ...finding } = draft;
  return {
    ...finding,
    id: stableFindingId(draft.category, draft.evidence.rule, targetKey),
    priorityScore: 0,
    priorityLabel: "Informational",
    releaseRisk: 0
  };
}

export function assertEvidenceBacked(finding: FindingDraft | Finding): void {
  const hasArtifact =
    finding.evidence.screenshots.length > 0 ||
    Boolean(finding.evidence.trace) ||
    Boolean(finding.evidence.selector) ||
    Boolean(finding.evidence.domExcerpt) ||
    Boolean(finding.evidence.console?.length) ||
    Boolean(finding.evidence.network?.length) ||
    Boolean(finding.evidence.axe?.length) ||
    Boolean(finding.evidence.keyboard);
  if (!finding.evidence.rule || !hasArtifact) {
    throw new Error(`Finding ${finding.title} has no deterministic rule or evidence reference.`);
  }
}
