import {
  assertEvidenceBacked,
  materializeFinding,
  type AcceptanceCriterionResult,
  type BrowserRunResult,
  type Finding,
  type FindingDraft,
  type PriorityLabel,
  type QualityThresholds,
  type Severity
} from "@humanqa/core";

export const severityWeights: Record<Severity, number> = {
  critical: 5,
  high: 4,
  medium: 3,
  low: 1.5,
  info: 0.25
};

export const priorityFormula = "priority = (reach * impact * confidence) / max(effort, 1)";
export const releaseRiskFormula =
  "release_risk = sum(severity_weight * confidence * journey_criticality)";

export function calculatePriority(input: {
  reach: number;
  impact: number;
  confidence: number;
  effort: number;
}): number {
  return Number(
    ((input.reach * input.impact * input.confidence) / Math.max(input.effort, 1)).toFixed(2)
  );
}

export function calculateReleaseRisk(input: {
  severity: Severity;
  confidence: number;
  journeyCriticality: number;
}): number {
  return Number(
    (severityWeights[input.severity] * input.confidence * input.journeyCriticality).toFixed(2)
  );
}

function labelFinding(finding: Finding): PriorityLabel {
  if (finding.source === "advisory" || finding.source === "ai-assisted") {
    return finding.severity === "high" || finding.severity === "critical"
      ? "Monitor"
      : "Informational";
  }
  if (finding.severity === "critical") return "Block release";
  if (finding.severity === "high") return "Fix before launch";
  if (finding.severity === "medium") return "Plan next sprint";
  if (finding.severity === "low") return "Monitor";
  return "Informational";
}

export function scoreFindings(drafts: FindingDraft[]): Finding[] {
  const byId = new Map<string, Finding>();
  for (const draft of drafts) {
    assertEvidenceBacked(draft);
    const finding = materializeFinding(draft);
    finding.priorityScore = calculatePriority(finding);
    finding.releaseRisk = calculateReleaseRisk(finding);
    finding.priorityLabel = labelFinding(finding);
    if (!byId.has(finding.id)) byId.set(finding.id, finding);
  }
  return [...byId.values()].sort((left, right) => {
    const sourceRank = (source: Finding["source"]): number => (source === "deterministic" ? 0 : 1);
    return (
      sourceRank(left.source) - sourceRank(right.source) ||
      right.releaseRisk - left.releaseRisk ||
      left.id.localeCompare(right.id)
    );
  });
}

export interface ScoreSummary {
  verdict: PriorityLabel;
  qualityScore: number;
  releaseRisk: number;
  counts: Record<Severity, number>;
  blockingReasons: string[];
}

export function summarizeRisk(findings: Finding[], thresholds: QualityThresholds): ScoreSummary {
  const deterministic = findings.filter((finding) => finding.source === "deterministic");
  const counts: Record<Severity, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0
  };
  for (const finding of findings) counts[finding.severity] += 1;
  const deterministicCriticalCount = deterministic.filter(
    (finding) => finding.severity === "critical"
  ).length;
  const releaseRisk = Number(
    deterministic.reduce((sum, finding) => sum + finding.releaseRisk, 0).toFixed(2)
  );
  const qualityScore = Math.max(0, Math.round(100 - releaseRisk * 1.5));
  const blockingReasons: string[] = [];
  if (deterministicCriticalCount > thresholds.maxCriticalFindings) {
    blockingReasons.push(
      `${String(deterministicCriticalCount)} deterministic critical findings exceed the threshold of ${String(thresholds.maxCriticalFindings)}.`
    );
  }
  if (qualityScore < thresholds.minQualityScore) {
    blockingReasons.push(
      `Quality score ${String(qualityScore)} is below the declared minimum ${String(thresholds.minQualityScore)}.`
    );
  }

  let verdict: PriorityLabel;
  if (
    deterministicCriticalCount > thresholds.maxCriticalFindings ||
    qualityScore < Math.max(0, thresholds.minQualityScore - 20)
  ) {
    verdict = "Block release";
  } else if (
    deterministic.some((finding) => finding.severity === "high") ||
    qualityScore < thresholds.minQualityScore
  ) {
    verdict = "Fix before launch";
  } else if (deterministic.some((finding) => finding.severity === "medium")) {
    verdict = "Plan next sprint";
  } else if (deterministic.some((finding) => finding.severity === "low")) {
    verdict = "Monitor";
  } else {
    verdict = "Informational";
  }
  return { verdict, qualityScore, releaseRisk, counts, blockingReasons };
}

export function mapAcceptanceCriteria(
  criteria: string[],
  assertions: BrowserRunResult["assertionResults"],
  findings: Finding[]
): AcceptanceCriterionResult[] {
  return criteria.map((criterion) => {
    const matches = assertions.filter(
      (assertion) => assertion.criterion?.toLocaleLowerCase() === criterion.toLocaleLowerCase()
    );
    if (matches.length === 0) {
      return {
        criterion,
        status: "review" as const,
        evidenceFindingIds: [],
        explanation:
          "No explicit journey assertion maps to this criterion. Human review is required; HumanQA does not infer a pass from unrelated evidence."
      };
    }
    const passed = matches.every((assertion) => assertion.passed);
    const findingRules = new Set(
      matches
        .map((assertion) => assertion.findingRule)
        .filter((rule): rule is string => Boolean(rule))
    );
    const evidenceFindingIds = findings
      .filter((finding) => findingRules.has(finding.evidence.rule))
      .map((finding) => finding.id);
    return {
      criterion,
      status: passed ? ("pass" as const) : ("fail" as const),
      evidenceFindingIds,
      explanation: passed
        ? "All explicitly mapped deterministic assertions passed in the exercised state."
        : "At least one explicitly mapped assertion failed; inspect the linked finding evidence."
    };
  });
}
