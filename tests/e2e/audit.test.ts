import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

import { createServer, type ViteDevServer } from "vite";
import { afterAll, describe, expect, it } from "vitest";

import { runBrowserAudit } from "@humanqa/browser";
import { loadJourneyPack, type AuditReport, type BrowserRunResult } from "@humanqa/core";
import { writeReports } from "@humanqa/reporters";
import { scoreFindings, summarizeRisk } from "@humanqa/scorer";
import { writeGeneratedTest } from "@humanqa/test-generator";

import { sampleReport } from "../fixtures/report";

const execFileAsync = promisify(execFile);
const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL("../..", import.meta.url));
const demoRoot = join(root, "apps", "demo-dashboard");
const journeyPath = join(root, "packs", "journeys", "saas-project-creation.yaml");
const generatedRoots: string[] = [];

async function startFixture(mode: "broken" | "fixed"): Promise<ViteDevServer> {
  const server = await createServer({
    root: demoRoot,
    configFile: join(demoRoot, "vite.config.ts"),
    mode,
    logLevel: "silent",
    server: { host: "127.0.0.1", port: 4173, strictPort: true }
  });
  await server.listen();
  return server;
}

async function runFixtureAudit(mode: "broken" | "fixed"): Promise<{
  result: BrowserRunResult;
  outputDirectory: string;
}> {
  const server = await startFixture(mode);
  const outputDirectory = await mkdtemp(join(tmpdir(), `humanqa-${mode}-`));
  try {
    const journey = await loadJourneyPack(journeyPath);
    const result = await runBrowserAudit({
      baseUrl: "http://127.0.0.1:4173",
      outputDirectory,
      settings: {
        safeMode: true,
        redact: true,
        screenshots: true,
        offline: false,
        allowMutations: false,
        browser: "chromium",
        viewport: { width: 1440, height: 900 },
        mobile: false,
        video: false
      },
      journey,
      persona: "first-time-saas-user",
      goal: "Create a disposable project"
    });
    return { result, outputDirectory };
  } finally {
    await server.close();
  }
}

function reportFromRun(run: BrowserRunResult, outputDirectory: string): AuditReport {
  const findings = scoreFindings(run.findings);
  const summary = summarizeRisk(findings, {
    maxDurationSeconds: 120,
    maxCriticalFindings: 0,
    minQualityScore: 80
  });
  const report = sampleReport(findings);
  return {
    ...report,
    summary,
    browserEvidence: run.evidence,
    artifacts: {
      outputDirectory,
      screenshots: run.screenshotPaths,
      trace: run.evidence.trace ?? "artifacts/trace.zip",
      reports: ["report.json", "report.md", "report.html", "report.sarif", "report.junit.xml"]
    },
    accessibility: {
      ...report.accessibility,
      axeViolationCount: run.evidence.axeViolations.length,
      wcagRuleIds: run.evidence.axeViolations.map((violation) => violation.id),
      keyboardChecksCompleted: run.evidence.keyboard.length
    }
  };
}

describe.sequential("fixture audit vertical slice", () => {
  it("collects evidence and deterministic findings from the broken fixture", async () => {
    const { result, outputDirectory } = await runFixtureAudit("broken");
    const report = reportFromRun(result, outputDirectory);
    const rules = new Set(report.findings.map((finding) => finding.evidence.rule));
    expect(rules).toContain("success-state-missing");
    expect(rules).toContain("form-control-label-missing");
    expect(rules).toContain("keyboard-focus-cycle-before-target");
    expect(rules).toContain("responsive-horizontal-overflow");
    expect(rules).toContain("failed-network-request");
    expect(rules).toContain("broken-link");
    expect(result.evidence.trace).toBe("artifacts/trace.zip");
    expect(result.screenshotPaths.length).toBeGreaterThan(2);
    await writeReports(report, outputDirectory);
    await expect(readFile(join(outputDirectory, "report.json"), "utf8")).resolves.toContain(
      '"schemaVersion": "0.1.0"'
    );
    await expect(readFile(join(outputDirectory, "report.md"), "utf8")).resolves.toContain(
      "## Acceptance-criteria matrix"
    );
    await expect(readFile(join(outputDirectory, "report.html"), "utf8")).resolves.toContain(
      "Evidence-backed findings"
    );
  });

  it("clears every seeded definite rule in fixed fixture mode", async () => {
    const { result, outputDirectory } = await runFixtureAudit("fixed");
    const rules = new Set(scoreFindings(result.findings).map((finding) => finding.evidence.rule));
    for (const seededRule of [
      "success-state-missing",
      "form-control-label-missing",
      "keyboard-focus-cycle-before-target",
      "keyboard-target-not-reached",
      "responsive-horizontal-overflow",
      "failed-network-request",
      "broken-link",
      "ambiguous-cta-pattern"
    ]) {
      expect(rules, `${seededRule} should clear in fixed mode`).not.toContain(seededRule);
    }
    expect(result.evidence.axeViolations).toHaveLength(0);
    expect(result.findings.filter((finding) => finding.source === "deterministic")).toHaveLength(0);
    expect(reportFromRun(result, outputDirectory).summary.verdict).toBe("Informational");
  });

  it("runs an evidence-generated regression test against the fixed fixture", async () => {
    const broken = await runFixtureAudit("broken");
    const report = reportFromRun(broken.result, broken.outputDirectory);
    const labelFinding = report.findings.find(
      (finding) => finding.evidence.rule === "form-control-label-missing"
    );
    expect(labelFinding).toBeDefined();
    if (!labelFinding) throw new Error("Broken fixture did not produce the label finding.");

    const outputRoot = join(root, "humanqa-output", `e2e-generated-${Date.now().toString()}`);
    generatedRoots.push(outputRoot);
    const generated = await writeGeneratedTest(report, outputRoot, labelFinding.id);
    expect(generated.code).toContain("toHaveAccessibleName");

    const server = await startFixture("fixed");
    try {
      const playwrightCli = require.resolve("@playwright/test/cli");
      const config = join(root, "tests", "fixtures", "generated.playwright.config.mjs");
      const testPath = basename(generated.path);
      let execution: { stdout: string; stderr: string };
      try {
        execution = await execFileAsync(
          process.execPath,
          [playwrightCli, "test", testPath, "--config", config, "--workers", "1"],
          { cwd: root, timeout: 60_000, windowsHide: true }
        );
      } catch (error) {
        const failure = error as Error & { stdout?: string; stderr?: string };
        throw new Error(
          `Generated Playwright test failed.\nstdout:\n${failure.stdout ?? ""}\nstderr:\n${failure.stderr ?? ""}`,
          { cause: error }
        );
      }
      expect(`${execution.stdout}${execution.stderr}`).toContain("1 passed");
      expect(basename(generated.path)).toMatch(/^hq-ax-/u);
    } finally {
      await server.close();
    }
  });
});

afterAll(async () => {
  await Promise.all(generatedRoots.map((path) => rm(path, { recursive: true, force: true })));
});
