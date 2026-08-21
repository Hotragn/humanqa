import { join } from "node:path";

import { writeUtf8, type AuditReport, type Finding, type Severity } from "@humanqa/core";

function markdownEscape(value: string): string {
  return value.replaceAll("|", "\\|").replaceAll("\n", " ");
}

function htmlEscape(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function xmlEscape(value: string): string {
  return htmlEscape(value);
}

function severityBadge(severity: Severity): string {
  return `<span class="badge severity-${severity}">${htmlEscape(severity)}</span>`;
}

function evidenceSummary(finding: Finding): string {
  const references = [
    ...finding.evidence.screenshots.map((path) => `[screenshot](${path})`),
    ...(finding.evidence.trace ? [`[trace](${finding.evidence.trace})`] : []),
    ...(finding.evidence.axe?.map((item) => `[${item.ruleId}](${item.helpUrl})`) ?? [])
  ];
  return references.length > 0 ? references.join(" · ") : `Rule: \`${finding.evidence.rule}\``;
}

export function renderMarkdown(report: AuditReport): string {
  const findings = report.findings
    .map(
      (finding) =>
        `| ${finding.id} | ${markdownEscape(finding.title)} | ${finding.category} | ${finding.severity} | ${finding.confidence.toFixed(2)} | ${finding.priorityScore.toFixed(2)} | ${finding.releaseRisk.toFixed(2)} | ${finding.priorityLabel} |`
    )
    .join("\n");
  const criteria = report.acceptanceCriteria
    .map(
      (criterion) =>
        `| ${markdownEscape(criterion.criterion)} | ${criterion.status} | ${criterion.evidenceFindingIds.join(", ") || "Human review"} | ${markdownEscape(criterion.explanation)} |`
    )
    .join("\n");
  const details = report.findings
    .map(
      (finding) => `### ${finding.id} — ${finding.title}

- **Category / severity:** ${finding.category} / ${finding.severity}
- **Source / confidence:** ${finding.source} / ${finding.confidence.toFixed(2)}
- **User impact:** ${finding.userImpact}
- **Priority / release risk:** ${finding.priorityScore.toFixed(2)} / ${finding.releaseRisk.toFixed(2)}
- **Evidence rule:** \`${finding.evidence.rule}\`
- **Evidence:** ${evidenceSummary(finding)}
- **Suggested remediation:** ${finding.suggestedRemediation}
- **Regression candidate:** ${finding.regressionCandidate ? "yes" : "no"}

Reproduction:

${finding.reproductionSteps.map((step, index) => `${String(index + 1)}. ${step}`).join("\n")}

Limitations:

${finding.limitations.map((limitation) => `- ${limitation}`).join("\n")}`
    )
    .join("\n\n");
  const blocking = report.summary.blockingReasons.length
    ? report.summary.blockingReasons.map((reason) => `- ${reason}`).join("\n")
    : "- No declared blocking threshold was exceeded.";
  const reports = report.artifacts.reports.map((path) => `- [${path}](${path})`).join("\n");
  const nextActions =
    report.summary.verdict === "Block release"
      ? [
          "Review the highest-risk deterministic finding and its raw evidence.",
          "Fix or explicitly waive the contract failure with a documented owner and rationale.",
          "Rerun the same declared journey before release."
        ]
      : [
          "Review advisory observations with a human specialist.",
          "Keep regression candidates that match the intended product behavior.",
          "Rerun the declared journey when the affected UI changes."
        ];

  return `# HumanQA report

> **${report.summary.verdict}** — quality score ${String(report.summary.qualityScore)}/100; deterministic release risk ${report.summary.releaseRisk.toFixed(2)}.

## Executive summary

- Project: **${report.project.name}**
- Run: \`${report.runId}\`
- Scope: ${report.scope.mode}
- Journey: ${report.scope.journey ? `${report.scope.journey.name} by ${report.scope.journey.author}` : "No declared journey; conservative page inspection only"}
- Persona: ${report.scope.persona ?? "not declared"}
- Browser: ${report.environment.browser} ${report.environment.browserVersion}
- Viewport: ${String(report.environment.viewport.width)}×${String(report.environment.viewport.height)}
- Safe mode: ${report.settings.safeMode ? "enabled" : "disabled"}
- Redaction: ${report.settings.redact ? "enabled" : "disabled"}
- LLM enrichment: ${report.settings.llmEnabled ? "enabled with explicit configuration" : "disabled"}

HumanQA scores are transparent prioritization aids, not objective truth or compliance grades.

## Release decision

${blocking}

## Acceptance-criteria matrix

| Criterion | Status | Evidence | Explanation |
| --- | --- | --- | --- |
${criteria || "| No criteria declared | review | Human review | Goal-only audits cannot prove acceptance. |"}

## Findings

| ID | Finding | Category | Severity | Confidence | Priority | Risk | Action |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
${findings || "| — | No deterministic findings in the exercised state | — | info | 1.00 | 0 | 0 | Informational |"}

## Accessibility

- Automated axe scan completed: ${report.accessibility.automatedScanCompleted ? "yes" : "no"}
- Raw axe violations: ${String(report.accessibility.axeViolationCount)}
- WCAG-related rule IDs: ${report.accessibility.wcagRuleIds.join(", ") || "none in the exercised state"}
- Keyboard checks completed: ${String(report.accessibility.keyboardChecksCompleted)}
- Manual review required: yes

${report.accessibility.scopeNote}

## Finding details and recommended fixes

${details || "No evidence-backed deterministic finding was produced for the exercised state."}

## Regression-test candidates

${
  report.findings
    .filter((finding) => finding.regressionCandidate)
    .map((finding) => `- ${finding.id}: ${finding.title}`)
    .join("\n") || "- None met the evidence threshold."
}

## Confidence and scoring

- \`${report.scoring.priorityFormula}\`
- \`${report.scoring.releaseRiskFormula}\`
- Severity weights: ${Object.entries(report.scoring.severityWeights)
    .map(([severity, weight]) => `${severity}=${String(weight)}`)
    .join(", ")}

${report.scoring.assumptions.map((assumption) => `- ${assumption}`).join("\n")}

## Artifacts

${reports}

## Next safe actions

${nextActions.map((action) => `- ${action}`).join("\n")}

## Limitations

${report.limitations.map((limitation) => `- ${limitation}`).join("\n")}
`;
}

export function renderHtml(report: AuditReport): string {
  const findingCards = report.findings
    .map(
      (finding) => `<article class="finding" id="${htmlEscape(finding.id)}">
  <div class="finding-heading">
    <div><span class="mono">${htmlEscape(finding.id)}</span>${severityBadge(finding.severity)}</div>
    <span class="source">${htmlEscape(finding.source)}</span>
  </div>
  <h3>${htmlEscape(finding.title)}</h3>
  <p>${htmlEscape(finding.userImpact)}</p>
  <dl class="metrics">
    <div><dt>Confidence</dt><dd>${finding.confidence.toFixed(2)}</dd></div>
    <div><dt>Priority</dt><dd>${finding.priorityScore.toFixed(2)}</dd></div>
    <div><dt>Risk</dt><dd>${finding.releaseRisk.toFixed(2)}</dd></div>
    <div><dt>Action</dt><dd>${htmlEscape(finding.priorityLabel)}</dd></div>
  </dl>
  <details><summary>Reproduction and evidence</summary>
    <ol>${finding.reproductionSteps.map((step) => `<li>${htmlEscape(step)}</li>`).join("")}</ol>
    <p><strong>Rule:</strong> <code>${htmlEscape(finding.evidence.rule)}</code></p>
    ${finding.evidence.selector ? `<p><strong>Selector:</strong> <code>${htmlEscape(finding.evidence.selector)}</code></p>` : ""}
    <div class="evidence-links">
      ${finding.evidence.screenshots.map((path) => `<a href="${htmlEscape(path)}">Screenshot</a>`).join("")}
      ${finding.evidence.trace ? `<a href="${htmlEscape(finding.evidence.trace)}">Trace</a>` : ""}
      ${(finding.evidence.axe ?? []).map((item) => `<a href="${htmlEscape(item.helpUrl)}">${htmlEscape(item.ruleId)}</a>`).join("")}
    </div>
  </details>
  <div class="remediation"><strong>Recommended fix</strong><p>${htmlEscape(finding.suggestedRemediation)}</p></div>
  <ul class="limitations">${finding.limitations.map((item) => `<li>${htmlEscape(item)}</li>`).join("")}</ul>
</article>`
    )
    .join("");
  const criteria = report.acceptanceCriteria
    .map(
      (criterion) =>
        `<tr><td>${htmlEscape(criterion.criterion)}</td><td><span class="status status-${criterion.status}">${criterion.status}</span></td><td>${htmlEscape(criterion.evidenceFindingIds.join(", ") || "Human review")}</td><td>${htmlEscape(criterion.explanation)}</td></tr>`
    )
    .join("");
  const blocking = report.summary.blockingReasons.length
    ? `<ul>${report.summary.blockingReasons.map((reason) => `<li>${htmlEscape(reason)}</li>`).join("")}</ul>`
    : "<p>No declared blocking threshold was exceeded.</p>";
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>HumanQA · ${htmlEscape(report.project.name)} · ${htmlEscape(report.summary.verdict)}</title>
  <style>
    :root { color-scheme: light; --ink:#152019; --muted:#657067; --paper:#f4f1e8; --panel:#fffef9; --line:#d8d8ce; --accent:#16643b; --danger:#b42f28; --warn:#a65b00; }
    * { box-sizing: border-box; }
    body { margin:0; background:var(--paper); color:var(--ink); font:16px/1.55 ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }
    a { color:var(--accent); text-underline-offset:3px; }
    .skip-link { position:fixed; z-index:10; top:12px; left:12px; padding:10px 14px; color:#fff; background:var(--ink); transform:translateY(-180%); }
    .skip-link:focus { transform:translateY(0); outline:3px solid var(--warn); outline-offset:3px; }
    .shell { width:min(1120px,calc(100% - 32px)); margin:0 auto; }
    header { padding:48px 0 28px; border-bottom:1px solid var(--line); }
    .eyebrow,.mono { font:700 12px/1.3 ui-monospace,SFMono-Regular,Consolas,monospace; letter-spacing:.08em; text-transform:uppercase; }
    h1 { max-width:900px; margin:12px 0 16px; font-size:clamp(38px,7vw,76px); line-height:.98; letter-spacing:-.055em; }
    h2 { margin:0 0 20px; font-size:30px; letter-spacing:-.025em; }
    h3 { font-size:22px; line-height:1.2; }
    .lede { max-width:760px; color:var(--muted); font-size:19px; }
    .verdict { display:inline-flex; margin-top:22px; padding:10px 14px; border:1px solid currentColor; color:var(--danger); font-weight:800; text-transform:uppercase; letter-spacing:.04em; }
    main { padding:32px 0 80px; }
    section { margin:0 0 48px; }
    .summary-grid,.metrics { display:grid; grid-template-columns:repeat(4,1fr); gap:1px; padding:1px; background:var(--line); }
    .summary-grid > div,.metrics > div { background:var(--panel); padding:18px; }
    dt { color:var(--muted); font-size:13px; text-transform:uppercase; letter-spacing:.04em; }
    dd { margin:4px 0 0; font-weight:750; }
    .notice { background:#fff6dc; border-left:4px solid var(--warn); padding:18px 20px; }
    .table-wrap { overflow-x:auto; border:1px solid var(--line); background:var(--panel); }
    table { width:100%; border-collapse:collapse; min-width:760px; }
    th,td { padding:14px; text-align:left; vertical-align:top; border-bottom:1px solid var(--line); }
    th { color:var(--muted); font-size:12px; text-transform:uppercase; letter-spacing:.05em; }
    .finding { background:var(--panel); border:1px solid var(--line); padding:24px; margin:0 0 16px; }
    .finding-heading { display:flex; justify-content:space-between; align-items:center; gap:16px; }
    .badge,.source,.status { display:inline-flex; padding:4px 8px; border-radius:999px; font-size:12px; font-weight:750; margin-left:8px; }
    .severity-critical,.severity-high,.status-fail { color:#fff; background:var(--danger); }
    .severity-medium { background:#ffe1a8; color:#6a3700; }
    .severity-low,.severity-info,.source,.status-review { background:#e6e8e2; color:#3d4740; }
    .status-pass { background:#d7f3df; color:#15522f; }
    .metrics { grid-template-columns:repeat(4,1fr); margin:20px 0; }
    .metrics > div { padding:12px; }
    details { border-top:1px solid var(--line); padding-top:14px; }
    summary { cursor:pointer; font-weight:750; }
    .evidence-links { display:flex; flex-wrap:wrap; gap:10px; }
    .evidence-links a { border:1px solid var(--line); padding:6px 10px; background:#fff; }
    .remediation { margin-top:18px; padding:16px; background:#edf5ed; }
    .limitations { color:var(--muted); font-size:14px; }
    footer { padding:24px 0 48px; border-top:1px solid var(--line); color:var(--muted); }
    @media (max-width:760px) { .summary-grid,.metrics { grid-template-columns:1fr 1fr; } header { padding-top:32px; } .finding { padding:18px; } }
  </style>
</head>
<body>
  <a class="skip-link" href="#findings">Skip to findings</a>
  <header><div class="shell">
    <div class="eyebrow">HumanQA · evidence-first product quality</div>
    <h1>${htmlEscape(report.project.name)}</h1>
    <p class="lede">${htmlEscape(report.scope.journey?.name ?? "Conservative page inspection")} · ${htmlEscape(report.generatedAt)}</p>
    <div class="verdict">${htmlEscape(report.summary.verdict)}</div>
  </div></header>
  <main class="shell">
    <section aria-labelledby="summary-title"><h2 id="summary-title">Executive summary</h2>
      <dl class="summary-grid">
        <div><dt>Quality score</dt><dd>${String(report.summary.qualityScore)}/100</dd></div>
        <div><dt>Release risk</dt><dd>${report.summary.releaseRisk.toFixed(2)}</dd></div>
        <div><dt>Findings</dt><dd>${String(report.findings.length)}</dd></div>
        <div><dt>Safe mode</dt><dd>${report.settings.safeMode ? "Enabled" : "Disabled"}</dd></div>
      </dl>
      <div class="notice"><strong>Scores are decision aids, not objective truth.</strong>${blocking}</div>
    </section>
    <section aria-labelledby="scope-title"><h2 id="scope-title">Scope and environment</h2>
      <p>${htmlEscape(report.scope.mode)} · ${htmlEscape(report.environment.browser)} ${htmlEscape(report.environment.browserVersion)} · ${String(report.environment.viewport.width)}×${String(report.environment.viewport.height)} · persona ${htmlEscape(report.scope.persona ?? "not declared")}</p>
      <p>Redaction ${report.settings.redact ? "enabled" : "disabled"}; screenshots ${report.settings.screenshots ? "enabled" : "disabled"}; offline ${report.settings.offline ? "enabled" : "disabled"}; LLM ${report.settings.llmEnabled ? "enabled" : "disabled"}.</p>
    </section>
    <section aria-labelledby="criteria-title"><h2 id="criteria-title">Acceptance criteria</h2><div class="table-wrap"><table><thead><tr><th>Criterion</th><th>Status</th><th>Evidence</th><th>Explanation</th></tr></thead><tbody>${criteria || '<tr><td>No criteria declared</td><td><span class="status status-review">review</span></td><td>Human review</td><td>Goal-only audits cannot prove acceptance.</td></tr>'}</tbody></table></div></section>
    <section id="findings" tabindex="-1" aria-labelledby="findings-title"><h2 id="findings-title">Evidence-backed findings</h2>${findingCards || "<p>No deterministic findings were produced in the exercised state.</p>"}</section>
    <section aria-labelledby="accessibility-title"><h2 id="accessibility-title">Accessibility scope</h2><p>${htmlEscape(report.accessibility.scopeNote)}</p><p>axe violations: ${String(report.accessibility.axeViolationCount)} · keyboard checks: ${String(report.accessibility.keyboardChecksCompleted)} · manual review: required.</p></section>
    <section aria-labelledby="limitations-title"><h2 id="limitations-title">Limitations</h2><ul>${report.limitations.map((item) => `<li>${htmlEscape(item)}</li>`).join("")}</ul></section>
  </main>
  <footer><div class="shell">Run ${htmlEscape(report.runId)} · schema ${htmlEscape(report.schemaVersion)} · generated locally by HumanQA</div></footer>
</body>
</html>`;
}

export function renderSarif(report: AuditReport): string {
  const uniqueRules = new Map(
    report.findings.map((finding) => [
      finding.evidence.rule,
      {
        id: finding.evidence.rule,
        name: finding.title,
        shortDescription: { text: finding.title },
        helpUri: finding.evidence.axe?.[0]?.helpUrl,
        properties: {
          category: finding.category,
          source: finding.source,
          tags: ["humanqa", finding.category]
        }
      }
    ])
  );
  const sarif = {
    version: "2.1.0",
    $schema: "https://json.schemastore.org/sarif-2.1.0.json",
    runs: [
      {
        tool: {
          driver: {
            name: "HumanQA",
            informationUri: "https://github.com/Hotragn/humanqa",
            version: report.toolVersion,
            rules: [...uniqueRules.values()].map((rule) => ({
              ...rule,
              ...(rule.helpUri ? {} : { helpUri: "https://github.com/Hotragn/humanqa" })
            }))
          }
        },
        results: report.findings.map((finding) => ({
          ruleId: finding.evidence.rule,
          level:
            finding.severity === "critical" || finding.severity === "high"
              ? "error"
              : finding.severity === "medium"
                ? "warning"
                : "note",
          message: {
            text: `${finding.id}: ${finding.title}. ${finding.userImpact}`
          },
          locations: [
            {
              physicalLocation: {
                artifactLocation: { uri: finding.evidence.url }
              },
              logicalLocations: finding.evidence.selector
                ? [{ name: finding.evidence.selector, kind: "element" }]
                : []
            }
          ],
          properties: {
            findingId: finding.id,
            confidence: finding.confidence,
            priorityScore: finding.priorityScore,
            releaseRisk: finding.releaseRisk,
            source: finding.source,
            regressionCandidate: finding.regressionCandidate
          }
        }))
      }
    ]
  };
  return `${JSON.stringify(sarif, null, 2)}\n`;
}

export function renderJunit(report: AuditReport): string {
  const failures = report.findings.filter(
    (finding) =>
      finding.source === "deterministic" &&
      (finding.severity === "critical" ||
        finding.severity === "high" ||
        finding.severity === "medium")
  );
  const cases = report.findings
    .map((finding) => {
      const failure = failures.includes(finding)
        ? `<failure type="${xmlEscape(finding.category)}" message="${xmlEscape(finding.title)}">${xmlEscape(
            `${finding.userImpact}\nEvidence rule: ${finding.evidence.rule}\n${finding.reproductionSteps.join("\n")}`
          )}</failure>`
        : "";
      return `<testcase classname="humanqa.${xmlEscape(finding.category)}" name="${xmlEscape(`${finding.id} ${finding.title}`)}" time="0">${failure}</testcase>`;
    })
    .join("");
  const testCount = Math.max(report.findings.length, 1);
  return `<?xml version="1.0" encoding="UTF-8"?>
<testsuite name="HumanQA" tests="${String(testCount)}" failures="${String(failures.length)}" time="${(report.browserEvidence.durationMs / 1000).toFixed(3)}">
  <properties>
    <property name="verdict" value="${xmlEscape(report.summary.verdict)}"/>
    <property name="qualityScore" value="${String(report.summary.qualityScore)}"/>
    <property name="releaseRisk" value="${report.summary.releaseRisk.toFixed(2)}"/>
    <property name="toolVersion" value="${xmlEscape(report.toolVersion)}"/>
    <property name="nodeVersion" value="${xmlEscape(report.environment.nodeVersion)}"/>
    <property name="platform" value="${xmlEscape(report.environment.platform)}"/>
    <property name="browser" value="${xmlEscape(report.environment.browser)}"/>
    <property name="browserVersion" value="${xmlEscape(report.environment.browserVersion)}"/>
    <property name="viewportWidth" value="${String(report.environment.viewport.width)}"/>
    <property name="viewportHeight" value="${String(report.environment.viewport.height)}"/>
    <property name="safeMode" value="${String(report.settings.safeMode)}"/>
    <property name="redact" value="${String(report.settings.redact)}"/>
    <property name="screenshots" value="${String(report.settings.screenshots)}"/>
    <property name="offline" value="${String(report.settings.offline)}"/>
    <property name="allowMutations" value="${String(report.settings.allowMutations)}"/>
  </properties>
  ${cases || '<testcase classname="humanqa.audit" name="No evidence-backed findings" time="0"/>'}
</testsuite>
`;
}

export async function writeReports(
  report: AuditReport,
  outputDirectory: string
): Promise<string[]> {
  const paths = {
    json: join(outputDirectory, "report.json"),
    markdown: join(outputDirectory, "report.md"),
    html: join(outputDirectory, "report.html"),
    sarif: join(outputDirectory, "report.sarif"),
    junit: join(outputDirectory, "report.junit.xml")
  };
  await Promise.all([
    writeUtf8(paths.json, `${JSON.stringify(report, null, 2)}\n`),
    writeUtf8(paths.markdown, renderMarkdown(report)),
    writeUtf8(paths.html, renderHtml(report)),
    writeUtf8(paths.sarif, renderSarif(report)),
    writeUtf8(paths.junit, renderJunit(report))
  ]);
  return Object.values(paths);
}
