import type { AuditReport, Finding } from "@humanqa/core";

function escapeCell(value: string): string {
  return value.replaceAll("|", "\\|").replaceAll("\n", " ");
}

function annotationLevel(finding: Finding): "error" | "warning" | "notice" {
  if (finding.severity === "critical" || finding.severity === "high") return "error";
  if (finding.severity === "medium") return "warning";
  return "notice";
}

function escapeAnnotation(value: string): string {
  return value
    .replaceAll("%", "%25")
    .replaceAll("\r", "%0D")
    .replaceAll("\n", "%0A")
    .replaceAll(":", "%3A")
    .replaceAll(",", "%2C");
}

export function formatGithubComment(report: AuditReport): string {
  const rows = report.findings
    .filter((finding) => finding.source === "deterministic")
    .slice(0, 10)
    .map(
      (finding) =>
        `| ${finding.id} | ${escapeCell(finding.title)} | ${finding.severity} | ${finding.confidence.toFixed(2)} | ${finding.priorityLabel} |`
    )
    .join("\n");
  const criteria = report.acceptanceCriteria
    .map(
      (item) =>
        `- ${item.status === "pass" ? "✅" : item.status === "fail" ? "❌" : "⚠️"} ${item.criterion}`
    )
    .join("\n");
  const blockers = report.summary.blockingReasons.length
    ? report.summary.blockingReasons.map((reason) => `- ${reason}`).join("\n")
    : "- No declared threshold was exceeded.";
  const hiddenCount = Math.max(
    0,
    report.findings.filter((finding) => finding.source === "deterministic").length - 10
  );
  return `## HumanQA · ${report.summary.verdict}

Quality score **${String(report.summary.qualityScore)}/100** · deterministic release risk **${report.summary.releaseRisk.toFixed(2)}** · safe mode **${report.settings.safeMode ? "on" : "off"}**

### Release reasons

${blockers}

### Acceptance criteria

${criteria || "- No quality-contract criteria were declared."}

### Highest-risk deterministic findings

| ID | Finding | Severity | Confidence | Recommended action |
| --- | --- | --- | ---: | --- |
${rows || "| — | No deterministic findings | info | 1.00 | Informational |"}
${hiddenCount > 0 ? `\n${String(hiddenCount)} additional deterministic findings are available in the report artifacts.` : ""}

Artifacts: \`report.html\`, \`report.md\`, \`report.json\`, \`report.sarif\`, and \`report.junit.xml\` in the HumanQA output directory.

> HumanQA scores are transparent decision aids, not objective truth. Accessibility results cover only exercised states and require manual review. This comment was formatted locally; v0.1 does not post or create issues automatically.
`;
}

export function githubAnnotations(report: AuditReport): string[] {
  return report.findings.map((finding) => {
    const title = escapeAnnotation(`${finding.id} ${finding.title}`);
    const message = escapeAnnotation(
      `${finding.userImpact} Evidence rule: ${finding.evidence.rule}. Confidence: ${finding.confidence.toFixed(2)}.`
    );
    return `::${annotationLevel(finding)} title=${title}::${message}`;
  });
}
