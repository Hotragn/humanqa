import AxeBuilder from "@axe-core/playwright";
import type { Page } from "playwright";

import type { FindingDraft, KeyboardEvidence, RawAxeViolation, Severity } from "@humanqa/core";

export const accessibilityScopeNote =
  "Automated axe and keyboard checks cover only the rendered states exercised by this journey. They do not prove WCAG conformance, legal compliance, screen-reader usability, cognitive accessibility, or the absence of barriers in untested states. Manual review is required.";

function axeSeverity(impact: string | null): Severity {
  switch (impact) {
    case "critical":
      return "critical";
    case "serious":
      return "high";
    case "moderate":
      return "medium";
    case "minor":
      return "low";
    default:
      return "info";
  }
}

export async function runAxeScan(
  page: Page,
  context: {
    screenshots: string[];
    trace?: string;
    journeyCriticality: number;
  }
): Promise<{ violations: RawAxeViolation[]; findings: FindingDraft[] }> {
  const result = await new AxeBuilder({ page }).analyze();
  const violations: RawAxeViolation[] = result.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact ?? null,
    tags: [...violation.tags],
    description: violation.description,
    help: violation.help,
    helpUrl: violation.helpUrl,
    nodes: violation.nodes.map((node) => ({
      any: node.any,
      all: node.all,
      none: node.none,
      impact: node.impact ?? null,
      html: node.html,
      target: node.target.map(String),
      ...(node.failureSummary ? { failureSummary: node.failureSummary } : {})
    }))
  }));

  const findings: FindingDraft[] = [];
  for (const violation of violations) {
    for (const [nodeIndex, node] of violation.nodes.entries()) {
      const selector = node.target.join(" ");
      findings.push({
        targetKey: `${violation.id}:${selector}:${nodeIndex}`,
        title: `${violation.help} (${violation.id})`,
        category: "accessibility",
        severity: axeSeverity(violation.impact),
        confidence: 0.99,
        source: "deterministic",
        userImpact: violation.description,
        reach: 1,
        impact: violation.impact === "critical" ? 5 : violation.impact === "serious" ? 4 : 2,
        effort: 2,
        journeyCriticality: context.journeyCriticality,
        reproductionSteps: [
          `Open ${page.url()}.`,
          `Inspect the element matching ${selector}.`,
          `Run axe rule ${violation.id} in the exercised state.`
        ],
        evidence: {
          screenshots: context.screenshots,
          url: page.url(),
          rule: `axe:${violation.id}`,
          selector,
          domExcerpt: node.html,
          axe: [
            {
              ruleId: violation.id,
              impact: violation.impact,
              helpUrl: violation.helpUrl,
              wcagTags: violation.tags.filter((tag) => tag.startsWith("wcag")),
              target: node.target,
              failureSummary: node.failureSummary ?? violation.help
            }
          ],
          ...(context.trace ? { trace: context.trace } : {})
        },
        suggestedRemediation: `${violation.help}. Review the axe guidance at ${violation.helpUrl}, then manually verify the corrected interaction.`,
        regressionCandidate: true,
        limitations: [accessibilityScopeNote]
      });
    }
  }
  return { violations, findings };
}

interface FocusSnapshot {
  tag: string;
  role: string | null;
  name: string;
  selector: string;
  focusIndicator: "visible" | "not-detected" | "unknown";
  targetReached: boolean;
}

async function snapshotFocus(page: Page, targetSelector: string): Promise<FocusSnapshot> {
  return page.evaluate((target) => {
    const element = document.activeElement as HTMLElement | null;
    if (!element || element === document.body) {
      return {
        tag: "body",
        role: null,
        name: "",
        selector: "body",
        focusIndicator: "unknown" as const,
        targetReached: false
      };
    }
    const escapePart = (value: string): string => CSS.escape(value);
    const uniquePath = (): string => {
      const parts: string[] = [];
      let current: Element | null = element;
      while (current && current !== document.documentElement) {
        if (current.id) {
          parts.unshift(`#${escapePart(current.id)}`);
          break;
        }
        const parent: Element | null = current.parentElement;
        const index = parent ? [...parent.children].indexOf(current) + 1 : 1;
        parts.unshift(`${current.tagName.toLowerCase()}:nth-child(${String(index)})`);
        current = parent;
      }
      return parts.join(" > ");
    };
    const selector = element.id
      ? `#${escapePart(element.id)}`
      : element.getAttribute("data-testid")
        ? `[data-testid="${escapePart(element.getAttribute("data-testid") ?? "")}"]`
        : uniquePath();
    const style = getComputedStyle(element);
    const indicatorVisible =
      (style.outlineStyle !== "none" && Number.parseFloat(style.outlineWidth) > 0) ||
      style.boxShadow !== "none";
    const targetElement = document.querySelector(target);
    return {
      tag: element.tagName.toLowerCase(),
      role: element.getAttribute("role"),
      name:
        element.getAttribute("aria-label") ??
        element.textContent?.trim().slice(0, 120) ??
        element.getAttribute("name") ??
        "",
      selector,
      focusIndicator: indicatorVisible ? ("visible" as const) : ("not-detected" as const),
      targetReached: Boolean(
        targetElement && (element === targetElement || targetElement.contains(element))
      )
    };
  }, targetSelector);
}

export async function checkKeyboardReachability(
  page: Page,
  targetSelector: string,
  context: {
    screenshots: string[];
    trace?: string;
    journeyCriticality: number;
    maxTabs?: number;
  }
): Promise<{ evidence: KeyboardEvidence; findings: FindingDraft[] }> {
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  const sequence: KeyboardEvidence["sequence"] = [];
  const seen = new Map<string, number>();
  let targetReached = false;
  let cycleDetected = false;
  let missingIndicators = 0;

  for (let index = 0; index < (context.maxTabs ?? 30); index += 1) {
    await page.keyboard.press("Tab");
    const snapshot = await snapshotFocus(page, targetSelector);
    sequence.push({
      index,
      tag: snapshot.tag,
      role: snapshot.role,
      name: snapshot.name,
      selector: snapshot.selector
    });
    if (snapshot.focusIndicator === "not-detected") missingIndicators += 1;
    if (snapshot.targetReached) {
      targetReached = true;
      break;
    }
    const previous = seen.get(snapshot.selector);
    if (previous !== undefined) {
      cycleDetected = true;
      break;
    }
    seen.set(snapshot.selector, index);
  }

  const evidence: KeyboardEvidence = {
    sequence,
    targetReached,
    cycleDetected,
    focusIndicator:
      sequence.length === 0
        ? "unknown"
        : missingIndicators === sequence.length
          ? "not-detected"
          : "visible"
  };
  const findings: FindingDraft[] = [];
  if (!targetReached) {
    findings.push({
      targetKey: targetSelector,
      title: "Declared control was not reached by keyboard navigation",
      category: "accessibility",
      severity: "high",
      confidence: cycleDetected ? 0.96 : 0.88,
      source: "deterministic",
      userImpact:
        "Keyboard-only users may be unable to reach a control required by the declared journey.",
      reach: 1,
      impact: 4,
      effort: 2,
      journeyCriticality: context.journeyCriticality,
      reproductionSteps: [
        `Open ${page.url()}.`,
        "Move focus with the Tab key without using a pointer.",
        `Attempt to reach ${targetSelector} within ${String(context.maxTabs ?? 30)} focus moves.`
      ],
      evidence: {
        screenshots: context.screenshots,
        url: page.url(),
        rule: cycleDetected ? "keyboard-focus-cycle-before-target" : "keyboard-target-not-reached",
        selector: targetSelector,
        keyboard: evidence,
        ...(context.trace ? { trace: context.trace } : {})
      },
      suggestedRemediation:
        "Use a native interactive element or a correct tabindex and verify the complete keyboard order manually.",
      regressionCandidate: true,
      limitations: [
        accessibilityScopeNote,
        "The bounded traversal does not determine whether every focus order is logical."
      ]
    });
  }
  if (sequence.length >= 2 && missingIndicators === sequence.length) {
    findings.push({
      targetKey: `focus-indicator:${page.url()}`,
      title: "No focus indicator was detected during the keyboard path",
      category: "accessibility",
      severity: "medium",
      confidence: 0.75,
      source: "advisory",
      userImpact: "Keyboard users may lose track of their current position in the interface.",
      reach: 1,
      impact: 3,
      effort: 2,
      journeyCriticality: context.journeyCriticality,
      reproductionSteps: [
        `Open ${page.url()}.`,
        "Press Tab through the declared path.",
        "Inspect whether the focused controls have a visible outline or equivalent indicator."
      ],
      evidence: {
        screenshots: context.screenshots,
        url: page.url(),
        rule: "focus-indicator-not-detected",
        keyboard: evidence,
        ...(context.trace ? { trace: context.trace } : {})
      },
      suggestedRemediation:
        "Provide a high-contrast `:focus-visible` style and manually verify it across themes and control states.",
      regressionCandidate: false,
      limitations: [
        "Computed outline and box-shadow checks can miss indicators rendered by ancestors or custom graphics.",
        accessibilityScopeNote
      ]
    });
  }
  return { evidence, findings };
}
