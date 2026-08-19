import { randomUUID } from "node:crypto";
import { access, appendFile } from "node:fs/promises";
import { dirname, isAbsolute, join, resolve } from "node:path";

import { Command, Option } from "commander";
import { chromium } from "playwright";

import { runBrowserAudit } from "@humanqa/browser";
import {
  ensureDirectory,
  loadHumanqaConfig,
  loadJourneyPack,
  readAuditReport,
  redactText,
  redactUrl,
  timestampSlug,
  writeUtf8,
  type AuditReport,
  type AuditSettings,
  type HumanqaConfig,
  type JourneyPack,
  type PriorityLabel,
  type QualityThresholds
} from "@humanqa/core";
import { formatGithubComment, githubAnnotations } from "@humanqa/github";
import { listPacks, validatePackPath } from "@humanqa/pack-sdk";
import { writeReports } from "@humanqa/reporters";
import {
  mapAcceptanceCriteria,
  priorityFormula,
  releaseRiskFormula,
  scoreFindings,
  severityWeights,
  summarizeRisk
} from "@humanqa/scorer";
import { writeGeneratedTest } from "@humanqa/test-generator";

import { formatCliError, installChromiumBrowser } from "./runtime.js";

const cliVersion = "0.1.3";
const repositoryRoot = process.cwd();

interface AuditOptions {
  persona?: string;
  goal?: string;
  journey?: string;
  offline: boolean;
  screenshots: boolean;
  redact: boolean;
  safeMode: boolean;
  viewport?: string;
  mobile: boolean;
  video: boolean;
  allowMutations: boolean;
  output?: string;
  eventExport?: string;
}

interface AuditExecutionOptions {
  url: string;
  projectName: string;
  journey?: JourneyPack;
  persona?: string;
  goal?: string;
  settings: AuditSettings;
  outputDirectory: string;
  thresholds: QualityThresholds;
  criteria: string[];
  eventExport?: string;
}

function viewportFrom(
  value: string | undefined,
  mobile: boolean
): { width: number; height: number } {
  if (!value) return mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 };
  const match = /^(\d{3,4})x(\d{3,4})$/u.exec(value);
  if (!match?.[1] || !match[2]) {
    throw new Error(`Invalid viewport “${value}”. Use WIDTHxHEIGHT, for example 1440x900.`);
  }
  const width = Number(match[1]);
  const height = Number(match[2]);
  if (width < 320 || height < 480) {
    throw new Error("Viewport must be at least 320x480.");
  }
  return { width, height };
}

function pathFrom(base: string, candidate: string): string {
  return isAbsolute(candidate) ? candidate : resolve(base, candidate);
}

function priorityRank(label: PriorityLabel): number {
  return [
    "Informational",
    "Monitor",
    "Plan next sprint",
    "Fix before launch",
    "Block release"
  ].indexOf(label);
}

function raiseVerdict(current: PriorityLabel, requested: PriorityLabel): PriorityLabel {
  return priorityRank(requested) > priorityRank(current) ? requested : current;
}

async function exportLocalEvent(
  path: string | undefined,
  event: {
    name: string;
    durationMs: number;
    success: boolean;
    reportFormats: string[];
    packIds: string[];
  }
): Promise<void> {
  if (!path) return;
  const durationBucket =
    event.durationMs < 10_000 ? "under-10s" : event.durationMs < 60_000 ? "10s-60s" : "over-60s";
  const output = {
    event: event.name,
    cliVersion,
    timestamp: new Date().toISOString(),
    durationBucket,
    outcome: event.success ? "success" : "failure",
    reportFormats: event.reportFormats,
    packIds: event.packIds
  };
  await ensureDirectory(dirname(resolve(path)));
  await appendFile(resolve(path), `${JSON.stringify(output)}\n`, "utf8");
}

async function performAudit(options: AuditExecutionOptions): Promise<AuditReport> {
  await ensureDirectory(options.outputDirectory);
  const browserResult = await runBrowserAudit({
    baseUrl: options.url,
    outputDirectory: options.outputDirectory,
    settings: options.settings,
    ...(options.journey ? { journey: options.journey } : {}),
    ...(options.goal ? { goal: options.goal } : {}),
    ...(options.persona ? { persona: options.persona } : {})
  });
  const findings = scoreFindings(browserResult.findings);
  const summary = summarizeRisk(findings, options.thresholds);
  const acceptanceCriteria = mapAcceptanceCriteria(
    options.criteria,
    browserResult.assertionResults,
    findings
  );
  if (browserResult.evidence.durationMs > options.thresholds.maxDurationSeconds * 1000) {
    summary.blockingReasons.push(
      `Journey duration ${(browserResult.evidence.durationMs / 1000).toFixed(2)}s exceeds the declared maximum ${String(options.thresholds.maxDurationSeconds)}s.`
    );
    summary.verdict = raiseVerdict(summary.verdict, "Fix before launch");
  }
  const failedCriteria = acceptanceCriteria.filter((criterion) => criterion.status === "fail");
  if (failedCriteria.length > 0) {
    summary.blockingReasons.push(
      `${String(failedCriteria.length)} explicitly mapped acceptance criteria failed.`
    );
    summary.verdict = "Block release";
  }
  const reportNames = [
    "report.json",
    "report.md",
    "report.html",
    "report.sarif",
    "report.junit.xml"
  ];
  const report: AuditReport = {
    schemaVersion: "0.1.0",
    runId: `hq-${randomUUID()}`,
    generatedAt: new Date().toISOString(),
    project: {
      name: options.projectName,
      baseUrl: options.settings.redact ? redactUrl(options.url).value : options.url
    },
    scope: {
      mode: options.journey ? "declared-journey" : "conservative-page-inspection",
      ...(options.goal
        ? { goal: options.settings.redact ? redactText(options.goal).value : options.goal }
        : {}),
      ...(options.persona ? { persona: options.persona } : {}),
      ...(options.journey
        ? {
            journey: {
              id: options.journey.id,
              name: options.journey.name,
              author: options.journey.author,
              version: options.journey.version
            }
          }
        : {})
    },
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      browser: browserResult.evidence.browserName,
      browserVersion: browserResult.evidence.browserVersion,
      viewport: browserResult.evidence.viewport,
      userAgent: browserResult.evidence.userAgent
    },
    settings: {
      safeMode: options.settings.safeMode,
      redact: options.settings.redact,
      screenshots: options.settings.screenshots,
      offline: options.settings.offline,
      allowMutations: options.settings.allowMutations,
      llmEnabled: false
    },
    summary,
    acceptanceCriteria,
    findings,
    browserEvidence: browserResult.evidence,
    artifacts: {
      outputDirectory: resolve(options.outputDirectory),
      screenshots: browserResult.screenshotPaths,
      trace: browserResult.evidence.trace ?? "artifacts/trace.zip",
      reports: reportNames
    },
    accessibility: {
      automatedScanCompleted: true,
      axeViolationCount: browserResult.evidence.axeViolations.length,
      wcagRuleIds: [
        ...new Set(
          browserResult.evidence.axeViolations
            .filter((violation) => violation.tags.some((tag) => tag.startsWith("wcag")))
            .map((violation) => violation.id)
        )
      ],
      keyboardChecksCompleted: browserResult.evidence.keyboard.length,
      manualReviewRequired: true,
      scopeNote:
        "Automated axe and keyboard checks cover only rendered states exercised by this run. They do not prove WCAG conformance, legal compliance, screen-reader usability, cognitive accessibility, or the absence of barriers in untested states. Manual testing is required."
    },
    scoring: {
      priorityFormula,
      releaseRiskFormula,
      severityWeights,
      assumptions: [
        "Reach is scoped to the declared journey, not measured production traffic.",
        "Impact and effort use small relative scales and should be reviewed in product context.",
        "Advisory and AI-assisted observations do not contribute to the release verdict.",
        "Quality score is a transparent transformation of deterministic risk, not an objective quality grade."
      ]
    },
    limitations: [
      options.journey
        ? "Only the states and controls exercised by the declared journey were audited."
        : "No declared journey was supplied; this run cannot claim that a user goal completed.",
      "Automated checks cannot establish overall usability, accessibility compliance, security, or product-market fit.",
      options.settings.screenshots
        ? "Text redaction does not guarantee removal of domain-specific personal data rendered inside screenshots. Use --no-screenshots for sensitive targets."
        : "Screenshots were disabled; some visual findings have reduced evidence.",
      "Network and console failures from optional third-party resources require human triage.",
      "No artifact was uploaded and no hidden telemetry was collected."
    ],
    packAttribution: options.journey
      ? [
          {
            id: options.journey.id,
            name: options.journey.name,
            author: options.journey.author,
            version: options.journey.version
          }
        ]
      : []
  };
  await writeReports(report, options.outputDirectory);
  await exportLocalEvent(options.eventExport, {
    name: "audit-completed",
    durationMs: browserResult.evidence.durationMs,
    success: report.summary.verdict !== "Block release",
    reportFormats: ["json", "markdown", "html", "sarif", "junit"],
    packIds: report.packAttribution.map((pack) => pack.id)
  });
  return report;
}

async function auditCommand(url: string, options: AuditOptions): Promise<void> {
  const journey = options.journey ? await loadJourneyPack(resolve(options.journey)) : undefined;
  const outputDirectory = resolve(options.output ?? join("humanqa-output", timestampSlug()));
  const report = await performAudit({
    url,
    projectName: new URL(url).hostname || "HumanQA audit",
    ...(journey ? { journey } : {}),
    ...(options.persona ? { persona: options.persona } : {}),
    ...(options.goal ? { goal: options.goal } : {}),
    settings: {
      safeMode: options.safeMode,
      redact: options.redact,
      screenshots: options.screenshots,
      offline: options.offline,
      allowMutations: options.allowMutations,
      browser: "chromium",
      viewport: viewportFrom(options.viewport, options.mobile),
      mobile: options.mobile,
      video: options.video
    },
    outputDirectory,
    thresholds: { maxDurationSeconds: 120, maxCriticalFindings: 0, minQualityScore: 80 },
    criteria: [
      ...new Set(
        journey?.definition.steps
          .map((step) => ("criterion" in step ? step.criterion : undefined))
          .filter((criterion): criterion is string => Boolean(criterion)) ?? []
      )
    ],
    ...(options.eventExport ? { eventExport: options.eventExport } : {})
  });
  process.stdout.write(
    [
      `HumanQA ${report.summary.verdict}`,
      `Quality score: ${String(report.summary.qualityScore)}/100`,
      `Findings: ${String(report.findings.length)}`,
      `Report: ${join(outputDirectory, "report.html")}`
    ].join("\n") + "\n"
  );
  if (report.summary.verdict === "Block release") process.exitCode = 1;
}

const starterConfig = `project:
  name: Example SaaS
  baseUrl: http://127.0.0.1:4173

defaults:
  safeMode: true
  redact: true
  screenshots: true
  browser: chromium
  offline: false
  viewport:
    width: 1440
    height: 900
  mobile: false

quality_contracts:
  - id: project-creation-complete
    name: SaaS project creation works
    persona: first-time-saas-user
    journey: packs/journeys/saas-project-creation.yaml
    acceptance_criteria:
      - User can create a project
      - User sees a persistent success confirmation
      - All interactive controls are keyboard reachable
      - No critical accessibility violations are present
    thresholds:
      max_duration_seconds: 120
      max_critical_findings: 0
      min_quality_score: 80
`;

async function initCommand(options: { config: string; force: boolean }): Promise<void> {
  const target = resolve(options.config);
  const exists = await access(target).then(
    () => true,
    () => false
  );
  if (exists && !options.force) {
    throw new Error(`${target} already exists. Use --force only after reviewing the current file.`);
  }
  await writeUtf8(target, starterConfig);
  process.stdout.write(
    `Created ${target}\nNext: review the safe defaults, then run pnpm humanqa verify --config ${options.config}\n`
  );
}

async function verifyCommand(options: { config: string; output?: string }): Promise<void> {
  const configPath = resolve(options.config);
  const config: HumanqaConfig = await loadHumanqaConfig(configPath);
  const baseDirectory = dirname(configPath);
  const rootOutput = resolve(options.output ?? join("humanqa-output", timestampSlug()));
  const reports: AuditReport[] = [];
  for (const contract of config.quality_contracts) {
    const journey = await loadJourneyPack(pathFrom(baseDirectory, contract.journey));
    const report = await performAudit({
      url: config.project.baseUrl,
      projectName: config.project.name,
      journey,
      ...(contract.persona ? { persona: contract.persona } : {}),
      settings: {
        safeMode: config.defaults.safeMode,
        redact: config.defaults.redact,
        screenshots: config.defaults.screenshots,
        offline: config.defaults.offline,
        allowMutations: false,
        browser: config.defaults.browser,
        viewport: config.defaults.viewport,
        mobile: config.defaults.mobile,
        video: false
      },
      outputDirectory: join(rootOutput, contract.id),
      thresholds: {
        maxDurationSeconds: contract.thresholds.max_duration_seconds,
        maxCriticalFindings: contract.thresholds.max_critical_findings,
        minQualityScore: contract.thresholds.min_quality_score
      },
      criteria: contract.acceptance_criteria
    });
    reports.push(report);
    process.stdout.write(
      `${contract.id}: ${report.summary.verdict} (${String(report.summary.qualityScore)}/100)\n`
    );
  }
  const blocked = reports.filter((report) => report.summary.verdict === "Block release");
  process.stdout.write(
    `Verified ${String(reports.length)} quality contract(s). Output: ${rootOutput}\n`
  );
  if (blocked.length > 0) process.exitCode = 1;
}

async function doctorCommand(): Promise<void> {
  const checks: Array<{ name: string; ok: boolean; detail: string }> = [];
  const nodeMajor = Number(process.versions.node.split(".")[0]);
  checks.push({
    name: "Node.js",
    ok: nodeMajor >= 20,
    detail: `${process.version}; HumanQA requires Node.js 20 or newer`
  });
  const browserPath = chromium.executablePath();
  const browserPresent = await access(browserPath).then(
    () => true,
    () => false
  );
  checks.push({
    name: "Playwright Chromium",
    ok: browserPresent,
    detail: browserPresent ? browserPath : "Not installed; run npx humanqa install-browser"
  });
  const packsPresent = await access(join(repositoryRoot, "packs")).then(
    () => true,
    () => false
  );
  checks.push({
    name: "Starter packs",
    ok: packsPresent,
    detail: packsPresent ? join(repositoryRoot, "packs") : "Pack directory not found"
  });
  for (const check of checks) {
    process.stdout.write(`${check.ok ? "PASS" : "FAIL"} ${check.name}: ${check.detail}\n`);
  }
  process.stdout.write(
    "Privacy: no telemetry or external LLM adapter is enabled by this command.\n"
  );
  if (checks.some((check) => !check.ok)) process.exitCode = 1;
}

const program = new Command();
program
  .name("humanqa")
  .description("Evidence-first product quality checks for web apps")
  .version(cliVersion)
  .showSuggestionAfterError()
  .showHelpAfterError();

program
  .command("init")
  .description("Create a reviewed, safe-by-default HumanQA quality contract")
  .option("-c, --config <path>", "configuration path", "humanqa.yml")
  .option("--force", "overwrite an existing configuration after review", false)
  .action(initCommand);

program
  .command("audit")
  .description("Audit a URL with a declared journey or conservative page inspection")
  .argument("<url>", "authorized local, staging, or production-like URL")
  .option("--persona <id>", "persona pack identifier")
  .option("--goal <goal>", "user goal; strong completion claims still require a journey")
  .option("--journey <path>", "validated journey pack YAML")
  .option("--offline", "allow only a loopback target and block cross-origin requests", false)
  .option("--no-screenshots", "do not persist screenshots")
  .option("--redact", "redact common secrets and personal identifiers", true)
  .option("--no-redact", "disable text redaction after an explicit privacy review")
  .option("--safe-mode", "block high-impact and unsafe browser actions", true)
  .option("--no-safe-mode", "disable safe mode after an explicit target review")
  .option("--viewport <widthxheight>", "viewport, for example 1440x900")
  .option("--mobile", "enable touch and mobile emulation; defaults to 390x844", false)
  .option("--video", "capture local browser video", false)
  .option(
    "--allow-mutations",
    "explicitly permit mutation-capable steps; never use with real records or payments",
    false
  )
  .option("--output <path>", "output directory; defaults to humanqa-output/<timestamp>")
  .option(
    "--event-export <path>",
    "append privacy-safe local usage events; never transmitted automatically"
  )
  .action(auditCommand);

program
  .command("verify")
  .description("Run all quality contracts in a HumanQA configuration")
  .requiredOption("--config <path>", "HumanQA configuration path")
  .option("--output <path>", "root output directory")
  .action(verifyCommand);

program
  .command("generate-test")
  .description("Generate a safe Playwright regression-test scaffold from report evidence")
  .argument("<report.json>", "HumanQA JSON report")
  .option("--finding <id>", "specific regression-candidate finding")
  .option("--output <path>", "output directory; defaults beside the report")
  .action(async (reportPath: string, options: { finding?: string; output?: string }) => {
    const absoluteReport = resolve(reportPath);
    const report = await readAuditReport(absoluteReport);
    const generated = await writeGeneratedTest(
      report,
      resolve(options.output ?? dirname(absoluteReport)),
      options.finding
    );
    process.stdout.write(`Generated ${generated.path}\nFinding: ${generated.findingId}\n`);
    for (const note of generated.reviewNotes) process.stdout.write(`Review: ${note}\n`);
  });

program
  .command("list-packs")
  .description("List validated local community packs and attribution")
  .option("--root <path>", "pack root", join(repositoryRoot, "packs"))
  .action(async (options: { root: string }) => {
    const packs = await listPacks(resolve(options.root));
    for (const pack of packs) {
      process.stdout.write(
        `${pack.metadata.kind.padEnd(18)} ${pack.metadata.id.padEnd(30)} ${pack.metadata.version.padEnd(8)} ${pack.metadata.author}\n`
      );
    }
    process.stdout.write(`${String(packs.length)} valid pack(s).\n`);
  });

program
  .command("validate-pack")
  .description("Validate a pack file or directory, compatibility, and safe action policy")
  .argument("<path>", "pack YAML file or directory")
  .action(async (path: string) => {
    const result = await validatePackPath(resolve(path));
    for (const pack of result.valid) {
      process.stdout.write(`VALID ${pack.path} (${pack.metadata.id}@${pack.metadata.version})\n`);
      for (const warning of pack.warnings) process.stdout.write(`WARN ${warning}\n`);
    }
    for (const failure of result.invalid) {
      process.stderr.write(
        `INVALID ${failure.path}\n${failure.errors.map((error) => `  ${error}`).join("\n")}\n`
      );
    }
    if (result.invalid.length > 0) process.exitCode = 1;
  });

program
  .command("install-browser")
  .description("Install the Playwright Chromium runtime required for audits")
  .option("--with-deps", "also install Linux system dependencies for Chromium", false)
  .action(async (options: { withDeps: boolean }) => {
    await installChromiumBrowser({ withDependencies: options.withDeps });
    process.stdout.write("Playwright Chromium is installed and ready for HumanQA.\n");
  });

program
  .command("doctor")
  .description("Check the local HumanQA runtime without sending data")
  .action(doctorCommand);

const github = program.command("github").description("Format future-ready GitHub outputs locally");
github
  .command("comment")
  .description("Render a concise pull-request comment; v0.1 is always dry-run")
  .requiredOption("--report <path>", "HumanQA JSON report")
  .addOption(new Option("--dry-run", "print without calling GitHub").default(true))
  .option("--annotations", "also print GitHub Actions workflow annotations", false)
  .action(async (options: { report: string; dryRun: boolean; annotations: boolean }) => {
    if (!options.dryRun)
      throw new Error("HumanQA v0.1 supports GitHub comment formatting only in dry-run mode.");
    const report = await readAuditReport(resolve(options.report));
    process.stdout.write(`${formatGithubComment(report)}\n`);
    if (options.annotations) process.stdout.write(`${githubAnnotations(report).join("\n")}\n`);
  });

program.parseAsync(process.argv).catch((error: unknown) => {
  const message = formatCliError(error);
  process.stderr.write(`HumanQA error: ${message}\n`);
  process.exitCode = 2;
});
