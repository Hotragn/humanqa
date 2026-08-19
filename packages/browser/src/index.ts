import { mkdir } from "node:fs/promises";
import { join, relative } from "node:path";

import { chromium, type Locator, type Page } from "playwright";

import { checkKeyboardReachability, runAxeScan } from "@humanqa/accessibility";
import {
  redactDomExcerpt,
  redactText,
  redactUrl,
  type ActionEvidence,
  type AuditRunInput,
  type BrowserRunResult,
  type ConsoleEvidence,
  type FindingDraft,
  type JourneyStep,
  type NetworkEvidence
} from "@humanqa/core";
import { runPageHeuristics } from "@humanqa/heuristics";

const riskyActionPattern =
  /\b(delete|remove|revoke|purchase|buy|pay|checkout|send|publish|terminate|close account|place order|upload)\b/iu;

function relativeArtifact(root: string, path: string): string {
  return relative(root, path).replaceAll("\\", "/");
}

function resolveUrl(baseUrl: string, path: string): string {
  return new URL(path, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`).toString();
}

function isLoopback(url: string): boolean {
  try {
    const hostname = new URL(url).hostname;
    return hostname === "127.0.0.1" || hostname === "localhost" || hostname === "::1";
  } catch {
    return false;
  }
}

function stepDescription(step: JourneyStep): string {
  if (step.description) return step.description;
  switch (step.action) {
    case "goto":
      return `Navigate to ${step.path}`;
    case "click":
      return `Activate ${step.name ?? step.test_id ?? step.selector ?? "declared control"}`;
    case "fill":
      return `Fill ${step.label ?? step.selector ?? "declared field"}`;
    case "assert-visible":
      return `Verify ${step.text ?? step.name ?? step.selector ?? "declared content"} is visible`;
    case "assert-url":
      return `Verify URL matches ${step.pattern}`;
    case "keyboard-reachable":
      return `Verify ${step.selector} is keyboard reachable`;
    case "wait":
      return `Wait ${String(step.milliseconds)}ms`;
    case "screenshot":
      return `Capture ${step.name}`;
  }
}

function locatorFor(page: Page, step: Extract<JourneyStep, { action: "click" }>): Locator;
function locatorFor(page: Page, step: Extract<JourneyStep, { action: "fill" }>): Locator;
function locatorFor(page: Page, step: Extract<JourneyStep, { action: "assert-visible" }>): Locator;
function locatorFor(
  page: Page,
  step:
    | Extract<JourneyStep, { action: "click" }>
    | Extract<JourneyStep, { action: "fill" }>
    | Extract<JourneyStep, { action: "assert-visible" }>
): Locator {
  if ("selector" in step && step.selector) return page.locator(step.selector).first();
  if ("test_id" in step && step.test_id) return page.getByTestId(step.test_id).first();
  if ("label" in step && step.label) return page.getByLabel(step.label, { exact: true }).first();
  if ("text" in step && step.text) return page.getByText(step.text, { exact: true }).first();
  if ("role" in step && step.role && "name" in step && step.name) {
    return page
      .getByRole(step.role as Parameters<Page["getByRole"]>[0], {
        name: step.name,
        exact: true
      })
      .first();
  }
  throw new Error(`No usable locator was declared for ${step.action}.`);
}

interface ActionMetadata {
  label: string;
  tag: string;
  type: string;
  href: string | null;
  formMethod: string | null;
  formAction: string | null;
  successTarget: string | null;
}

async function actionMetadata(locator: Locator): Promise<ActionMetadata> {
  return locator.evaluate((element) => {
    const control = element as HTMLButtonElement | HTMLInputElement | HTMLAnchorElement;
    const form = "form" in control ? control.form : null;
    return {
      label:
        element.getAttribute("aria-label") ??
        element.textContent?.trim() ??
        ("value" in control ? control.value : "") ??
        "",
      tag: element.tagName.toLowerCase(),
      type: "type" in control ? control.type : "",
      href: element instanceof HTMLAnchorElement ? element.href : null,
      formMethod: form?.method ?? null,
      formAction: form?.action ?? null,
      successTarget: element.getAttribute("data-humanqa-success-target")
    };
  });
}

function actionBlocked(
  metadata: ActionMetadata,
  input: AuditRunInput,
  step: Extract<JourneyStep, { action: "click" }>
): string | null {
  if (!input.settings.safeMode || input.settings.allowMutations) return null;
  if (riskyActionPattern.test(metadata.label)) {
    return `Safe mode blocked the high-impact action “${metadata.label}”.`;
  }
  if (metadata.type === "file") return "Safe mode blocks file uploads.";
  const isSubmit = metadata.type === "submit" || metadata.formMethod === "post";
  if (isSubmit && (!isLoopback(input.baseUrl) || step.safe !== true)) {
    return "Safe mode blocks form submission unless the target is loopback and the journey marks the fixture action safe.";
  }
  return null;
}

function findingEvidence(
  input: AuditRunInput,
  rule: string,
  screenshots: string[],
  trace: string,
  url: string,
  extra: Partial<FindingDraft["evidence"]> = {}
): FindingDraft["evidence"] {
  return {
    screenshots,
    trace,
    url: input.settings.redact ? redactUrl(url).value : url,
    rule,
    ...extra
  };
}

async function describeLocator(locator: Locator, redact: boolean): Promise<string | undefined> {
  try {
    const html = await locator.evaluate((element) => element.outerHTML.slice(0, 1000));
    return redact ? redactDomExcerpt(html) : html;
  } catch {
    return undefined;
  }
}

export async function runBrowserAudit(input: AuditRunInput): Promise<BrowserRunResult> {
  const artifactDirectory = join(input.outputDirectory, "artifacts");
  const screenshotDirectory = join(artifactDirectory, "screenshots");
  const videoDirectory = join(artifactDirectory, "video");
  await mkdir(screenshotDirectory, { recursive: true });
  if (input.settings.video) await mkdir(videoDirectory, { recursive: true });

  const traceAbsolute = join(artifactDirectory, "trace.zip");
  const trace = relativeArtifact(input.outputDirectory, traceAbsolute);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: input.settings.viewport,
    isMobile: input.settings.mobile,
    hasTouch: input.settings.mobile,
    deviceScaleFactor: input.settings.mobile ? 2 : 1,
    ...(input.settings.video
      ? { recordVideo: { dir: videoDirectory, size: input.settings.viewport } }
      : {})
  });
  await context.tracing.start({ screenshots: true, snapshots: true, sources: true });
  const page = await context.newPage();

  const startedAt = new Date();
  const visitedUrls: string[] = [];
  const actions: ActionEvidence[] = [];
  const consoleEvidence: ConsoleEvidence[] = [];
  const networkEvidence: NetworkEvidence[] = [];
  const findings: FindingDraft[] = [];
  const screenshots: string[] = [];
  const assertionResults: BrowserRunResult["assertionResults"] = [];
  const keyboardEvidence: BrowserRunResult["evidence"]["keyboard"] = [];

  page.on("framenavigated", (frame) => {
    if (frame === page.mainFrame()) {
      const url = input.settings.redact ? redactUrl(frame.url()).value : frame.url();
      if (url && visitedUrls.at(-1) !== url) visitedUrls.push(url);
    }
  });
  page.on("console", (message) => {
    if (message.type() !== "error" && message.type() !== "warning") return;
    const location = message.location();
    const text = input.settings.redact ? redactText(message.text()).value : message.text();
    consoleEvidence.push({
      type: message.type() === "error" ? "error" : "warning",
      text,
      url: input.settings.redact
        ? redactUrl(location.url || page.url()).value
        : location.url || page.url(),
      timestamp: new Date().toISOString()
    });
  });
  page.on("requestfailed", (request) => {
    networkEvidence.push({
      url: input.settings.redact ? redactUrl(request.url()).value : request.url(),
      method: request.method(),
      resourceType: request.resourceType(),
      error: request.failure()?.errorText ?? "Request failed",
      timestamp: new Date().toISOString()
    });
  });
  page.on("response", (response) => {
    if (response.status() < 400) return;
    const request = response.request();
    networkEvidence.push({
      url: input.settings.redact ? redactUrl(response.url()).value : response.url(),
      method: request.method(),
      resourceType: request.resourceType(),
      status: response.status(),
      timestamp: new Date().toISOString()
    });
  });

  if (input.settings.offline) {
    const baseOrigin = new URL(input.baseUrl).origin;
    if (!isLoopback(input.baseUrl)) {
      await browser.close();
      throw new Error("--offline only permits localhost or loopback audit targets.");
    }
    await context.route("**/*", async (route) => {
      const target = new URL(route.request().url());
      if (
        target.origin === baseOrigin ||
        target.protocol === "data:" ||
        target.protocol === "blob:"
      ) {
        await route.continue();
      } else {
        await route.abort("blockedbyclient");
      }
    });
  }

  const takeScreenshot = async (name: string): Promise<string | undefined> => {
    if (!input.settings.screenshots) return undefined;
    const safeName = name.replace(/[^a-z0-9-]/giu, "-").toLocaleLowerCase();
    const absolute = join(screenshotDirectory, `${safeName}.png`);
    await page.screenshot({ path: absolute, fullPage: true });
    const path = relativeArtifact(input.outputDirectory, absolute);
    screenshots.push(path);
    return path;
  };

  const journeyCriticality = input.journey?.definition.criticality ?? 3;
  const declaredSteps: JourneyStep[] = input.journey?.definition.steps ?? [
    {
      action: "goto",
      path: input.baseUrl,
      description: "Inspect the supplied page without interaction"
    }
  ];
  if (input.journey?.definition.start_path && declaredSteps[0]?.action !== "goto") {
    declaredSteps.unshift({ action: "goto", path: input.journey.definition.start_path });
  }

  try {
    for (const [index, step] of declaredSteps.entries()) {
      const actionStarted = new Date();
      const description = stepDescription(step);
      let actionStatus: ActionEvidence["status"] = "passed";
      let actionError: string | undefined;
      let selector: string | undefined;
      try {
        switch (step.action) {
          case "goto": {
            const targetUrl =
              step.path.startsWith("http://") || step.path.startsWith("https://")
                ? step.path
                : resolveUrl(input.baseUrl, step.path);
            await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 15_000 });
            await page.waitForTimeout(150);
            break;
          }
          case "click": {
            const locator = locatorFor(page, step);
            selector = step.selector ?? step.test_id ?? step.name;
            await locator.waitFor({ state: "visible", timeout: 5000 });
            const metadata = await actionMetadata(locator);
            const blocked = actionBlocked(metadata, input, step);
            if (blocked) {
              actionStatus = "blocked";
              actionError = blocked;
              findings.push({
                targetKey: `${metadata.label}:${page.url()}`,
                title: "Safe mode blocked a potentially high-impact browser action",
                category: "safety",
                severity: "high",
                confidence: 0.99,
                source: "deterministic",
                userImpact: blocked,
                reach: 1,
                impact: 5,
                effort: 1,
                journeyCriticality,
                reproductionSteps: [description, "Observe the HumanQA safe-mode decision."],
                evidence: findingEvidence(
                  input,
                  "safe-action-blocked",
                  screenshots,
                  trace,
                  page.url(),
                  {
                    ...(selector ? { selector } : {}),
                    metadata: { ...metadata }
                  }
                ),
                suggestedRemediation:
                  "Use a local disposable fixture or explicitly enable mutation-capable test mode after reviewing the journey.",
                regressionCandidate: false,
                limitations: [
                  "The action was not activated, so its post-action behavior was not observed."
                ]
              });
              break;
            }
            await locator.click();
            await page.waitForTimeout(200);
            if (metadata.successTarget) {
              const target = page.locator(metadata.successTarget).first();
              const successVisible = await target.isVisible().catch(() => false);
              if (!successVisible) {
                findings.push({
                  targetKey: metadata.successTarget,
                  title: "Observable successful action lacks the declared success feedback",
                  category: "usability",
                  severity: "high",
                  confidence: 0.96,
                  source: "deterministic",
                  userImpact:
                    "Users may repeat the action or assume it failed because the declared confirmation did not appear.",
                  reach: 1,
                  impact: 4,
                  effort: 2,
                  journeyCriticality,
                  reproductionSteps: [
                    `Open ${page.url()}.`,
                    description,
                    `Observe that ${metadata.successTarget} is not visible after the action.`
                  ],
                  evidence: findingEvidence(
                    input,
                    "success-state-missing",
                    screenshots,
                    trace,
                    page.url(),
                    { selector: metadata.successTarget }
                  ),
                  suggestedRemediation:
                    "Display a persistent success message that identifies the completed result and a safe next action.",
                  regressionCandidate: true,
                  limitations: [
                    "The expected success selector was explicitly declared by the fixture or application."
                  ]
                });
              }
            }
            break;
          }
          case "fill": {
            const locator = locatorFor(page, step);
            selector = step.selector ?? step.label;
            await locator.waitFor({ state: "visible", timeout: 5000 });
            if (step.sensitive && input.settings.redact) {
              await locator.fill(step.value);
            } else {
              await locator.fill(step.value);
            }
            break;
          }
          case "assert-visible": {
            const locator = locatorFor(page, step);
            selector = step.selector ?? step.text ?? step.name;
            const passed = await locator.isVisible().catch(() => false);
            assertionResults.push({
              ...(step.criterion ? { criterion: step.criterion } : {}),
              description,
              passed,
              ...(!passed ? { findingRule: step.rule ?? "expected-content-missing" } : {})
            });
            if (!passed) {
              const domExcerpt = await describeLocator(locator, input.settings.redact);
              const rule = step.rule ?? "expected-content-missing";
              findings.push({
                targetKey: selector ?? description,
                title:
                  rule === "success-state-missing"
                    ? "Expected success feedback is not visible"
                    : "Expected journey content is not visible",
                category: rule === "success-state-missing" ? "usability" : "functional",
                severity: "high",
                confidence: 0.98,
                source: "deterministic",
                userImpact:
                  rule === "success-state-missing"
                    ? "Users may not know whether the action completed and may repeat it."
                    : "The declared journey cannot confirm the expected state.",
                reach: 1,
                impact: 4,
                effort: 2,
                journeyCriticality,
                reproductionSteps: [
                  `Open ${page.url()}.`,
                  ...actions.slice(-3).map((action) => action.description),
                  description
                ],
                evidence: findingEvidence(input, rule, screenshots, trace, page.url(), {
                  ...(selector ? { selector } : {}),
                  ...(domExcerpt ? { domExcerpt } : {})
                }),
                suggestedRemediation:
                  rule === "success-state-missing"
                    ? "Add persistent, programmatically available feedback after the observable successful action."
                    : "Restore the expected state or update the journey contract if the intended behavior changed.",
                regressionCandidate: true,
                limitations: [
                  "The finding verifies the declared selector or accessible name, not broader user comprehension."
                ]
              });
              throw new Error(`Assertion failed: ${description}`);
            }
            break;
          }
          case "assert-url": {
            const expression = new RegExp(step.pattern, "u");
            const passed = expression.test(page.url());
            assertionResults.push({
              ...(step.criterion ? { criterion: step.criterion } : {}),
              description,
              passed,
              ...(!passed ? { findingRule: "failed-navigation" } : {})
            });
            if (!passed) throw new Error(`URL ${page.url()} does not match ${step.pattern}.`);
            break;
          }
          case "keyboard-reachable": {
            selector = step.selector;
            const result = await checkKeyboardReachability(page, step.selector, {
              screenshots,
              trace,
              journeyCriticality
            });
            keyboardEvidence.push(result.evidence);
            findings.push(...result.findings);
            const passed = result.evidence.targetReached === true;
            assertionResults.push({
              ...(step.criterion ? { criterion: step.criterion } : {}),
              description,
              passed,
              ...(!passed ? { findingRule: "keyboard-target-not-reached" } : {})
            });
            if (!passed) throw new Error(`Keyboard traversal did not reach ${step.selector}.`);
            break;
          }
          case "wait":
            await page.waitForTimeout(step.milliseconds);
            break;
          case "screenshot":
            await takeScreenshot(step.name);
            break;
        }
      } catch (error) {
        actionStatus = actionStatus === "blocked" ? "blocked" : "failed";
        actionError = error instanceof Error ? error.message : String(error);
        const alreadyCovered = findings.some(
          (finding) =>
            finding.evidence.rule === "expected-content-missing" ||
            finding.evidence.rule === "success-state-missing" ||
            finding.evidence.rule === "keyboard-target-not-reached"
        );
        if (!alreadyCovered && actionStatus !== "blocked") {
          const rule =
            step.action === "goto" || step.action === "assert-url"
              ? "failed-navigation"
              : "journey-step-failed";
          findings.push({
            targetKey: `${String(index)}:${description}`,
            title:
              rule === "failed-navigation"
                ? "Declared navigation failed"
                : "Declared journey step failed",
            category: "functional",
            severity: "high",
            confidence: 0.99,
            source: "deterministic",
            userImpact: "The declared user journey could not complete the required step.",
            reach: 1,
            impact: 5,
            effort: 2,
            journeyCriticality,
            reproductionSteps: [description],
            evidence: findingEvidence(input, rule, screenshots, trace, page.url(), {
              ...(selector ? { selector } : {}),
              metadata: { error: actionError }
            }),
            suggestedRemediation:
              "Reproduce the failed step, repair the target state, and keep the contract assertion.",
            regressionCandidate: true,
            limitations: [
              "Later steps may be affected by this failure and should be interpreted in sequence."
            ]
          });
        }
      }

      const screenshot = await takeScreenshot(
        `step-${String(index + 1).padStart(2, "0")}-${step.action}`
      ).catch(() => undefined);
      actions.push({
        index,
        action: step.action,
        description,
        startedAt: actionStarted.toISOString(),
        durationMs: Date.now() - actionStarted.getTime(),
        status: actionStatus,
        url: input.settings.redact ? redactUrl(page.url()).value : page.url(),
        ...(screenshot ? { screenshot } : {}),
        ...(selector ? { selector } : {}),
        ...(actionError
          ? { error: input.settings.redact ? redactText(actionError).value : actionError }
          : {})
      });
    }

    const axe = await runAxeScan(page, { screenshots, trace, journeyCriticality });
    findings.push(...axe.findings);
    const heuristicFindings = await runPageHeuristics(page, {
      screenshots,
      trace,
      journeyCriticality,
      console: consoleEvidence,
      network: networkEvidence
    });
    findings.push(...heuristicFindings);

    await context.tracing.stop({ path: traceAbsolute });
    const completedAt = new Date();
    const videoPath = await page
      .video()
      ?.path()
      .catch(() => undefined);
    const browserVersion = browser.version();
    const userAgent = await page.evaluate(() => navigator.userAgent);
    await context.close();
    await browser.close();

    return {
      evidence: {
        startedAt: startedAt.toISOString(),
        completedAt: completedAt.toISOString(),
        durationMs: completedAt.getTime() - startedAt.getTime(),
        visitedUrls,
        actions,
        console: consoleEvidence,
        network: networkEvidence,
        axeViolations: axe.violations,
        keyboard: keyboardEvidence,
        browserName: "chromium",
        browserVersion,
        viewport: input.settings.viewport,
        userAgent,
        trace,
        ...(videoPath ? { video: relativeArtifact(input.outputDirectory, videoPath) } : {})
      },
      findings,
      screenshotPaths: screenshots,
      assertionResults
    };
  } catch (error) {
    await context.tracing.stop({ path: traceAbsolute }).catch(() => undefined);
    await context.close().catch(() => undefined);
    await browser.close().catch(() => undefined);
    throw error;
  }
}
