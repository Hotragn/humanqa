import type { AuditReport, Finding } from "@humanqa/core";

export function sampleFinding(overrides: Partial<Finding> = {}): Finding {
  return {
    id: "HQ-AX-ABC12345",
    title: "Form control has no detectable accessible label",
    category: "accessibility",
    severity: "high",
    confidence: 0.97,
    source: "deterministic",
    userImpact: "Screen-reader and voice-control users may not know the control’s purpose.",
    reach: 1,
    impact: 4,
    effort: 1,
    journeyCriticality: 5,
    priorityScore: 3.88,
    priorityLabel: "Fix before launch",
    releaseRisk: 19.4,
    reproductionSteps: [
      "Open the project creation page.",
      "Inspect #project-slug.",
      "Check the computed accessible name."
    ],
    evidence: {
      screenshots: ["artifacts/screenshots/step-01.png"],
      trace: "artifacts/trace.zip",
      url: "http://127.0.0.1:4173/projects/new",
      selector: "#project-slug",
      rule: "form-control-label-missing",
      domExcerpt: '<input id="project-slug">'
    },
    suggestedRemediation: "Associate a visible label with the control.",
    regressionCandidate: true,
    limitations: ["The check verifies label presence, not clarity."],
    ...overrides
  };
}

export function sampleReport(findings: Finding[] = [sampleFinding()]): AuditReport {
  return {
    schemaVersion: "0.1.0",
    runId: "hq-test-run",
    generatedAt: "2026-08-18T20:00:00.000Z",
    project: { name: "Northstar Fixture", baseUrl: "http://127.0.0.1:4173" },
    scope: {
      mode: "declared-journey",
      goal: "Create a disposable project",
      persona: "first-time-saas-user",
      journey: {
        id: "saas-project-creation",
        name: "SaaS project creation",
        author: "HumanQA maintainers",
        version: "0.1.0"
      }
    },
    environment: {
      nodeVersion: "v20.0.0",
      platform: "test",
      browser: "chromium",
      browserVersion: "test",
      viewport: { width: 1440, height: 900 },
      userAgent: "HumanQA test"
    },
    settings: {
      safeMode: true,
      redact: true,
      screenshots: true,
      offline: false,
      allowMutations: false,
      llmEnabled: false
    },
    summary: {
      verdict: findings.length > 0 ? "Block release" : "Informational",
      qualityScore: findings.length > 0 ? 40 : 100,
      releaseRisk: findings.reduce((sum, finding) => sum + finding.releaseRisk, 0),
      counts: {
        critical: 0,
        high: findings.filter((finding) => finding.severity === "high").length,
        medium: 0,
        low: 0,
        info: 0
      },
      blockingReasons: findings.length > 0 ? ["A mapped acceptance criterion failed."] : []
    },
    acceptanceCriteria: [
      {
        criterion: "All interactive controls are keyboard reachable",
        status: findings.length > 0 ? "review" : "pass",
        evidenceFindingIds: [],
        explanation: "Fixture criterion result."
      }
    ],
    findings,
    browserEvidence: {
      startedAt: "2026-08-18T20:00:00.000Z",
      completedAt: "2026-08-18T20:00:01.000Z",
      durationMs: 1000,
      visitedUrls: ["http://127.0.0.1:4173/projects/new"],
      actions: [],
      console: [],
      network: [],
      axeViolations: [],
      keyboard: [],
      browserName: "chromium",
      browserVersion: "test",
      viewport: { width: 1440, height: 900 },
      userAgent: "HumanQA test",
      trace: "artifacts/trace.zip"
    },
    artifacts: {
      outputDirectory: "humanqa-output/test",
      screenshots: ["artifacts/screenshots/step-01.png"],
      trace: "artifacts/trace.zip",
      reports: ["report.json", "report.md", "report.html", "report.sarif", "report.junit.xml"]
    },
    accessibility: {
      automatedScanCompleted: true,
      axeViolationCount: 0,
      wcagRuleIds: [],
      keyboardChecksCompleted: 0,
      manualReviewRequired: true,
      scopeNote:
        "Automated checks cover only the exercised state. Manual testing is required; this report does not prove accessibility compliance."
    },
    scoring: {
      priorityFormula: "priority = (reach * impact * confidence) / max(effort, 1)",
      releaseRiskFormula: "release_risk = sum(severity_weight * confidence * journey_criticality)",
      severityWeights: { critical: 5, high: 4, medium: 3, low: 1.5, info: 0.25 },
      assumptions: ["Scores are decision aids, not objective truth."]
    },
    limitations: ["Only the fixture state was exercised."],
    packAttribution: [
      {
        id: "saas-project-creation",
        name: "SaaS project creation",
        author: "HumanQA maintainers",
        version: "0.1.0"
      }
    ]
  };
}
