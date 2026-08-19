import type { Page } from "playwright";

import type { ConsoleEvidence, FindingDraft, NetworkEvidence } from "@humanqa/core";

export interface HeuristicContext {
  screenshots: string[];
  trace?: string;
  journeyCriticality: number;
  console: ConsoleEvidence[];
  network: NetworkEvidence[];
  maxLinks?: number;
}

interface PageSignals {
  unlabeledControls: Array<{ selector: string; html: string; kind: string }>;
  unnamedActions: Array<{ selector: string; html: string; kind: string }>;
  headingSkips: Array<{ from: number; to: number; text: string; selector: string }>;
  overflow: Array<{ selector: string; left: number; right: number; width: number }>;
  ambiguousCtas: Array<{ label: string; selectors: string[] }>;
  inconsistentActions: Array<{ action: string; labels: string[]; selectors: string[] }>;
  unsafeActions: Array<{ selector: string; label: string }>;
  missingErrorSignals: Array<{ selector: string; html: string }>;
  missingEmptySignals: Array<{ selector: string; html: string }>;
  missingLoadingSignals: Array<{ selector: string; html: string }>;
}

function selectorFor(element: Element): string {
  if (element.id) return `#${CSS.escape(element.id)}`;
  const testId = element.getAttribute("data-testid");
  if (testId) return `[data-testid="${CSS.escape(testId)}"]`;
  const tag = element.tagName.toLowerCase();
  const siblings = [...(element.parentElement?.children ?? [])].filter(
    (candidate) => candidate.tagName === element.tagName
  );
  return `${tag}:nth-of-type(${String(siblings.indexOf(element) + 1)})`;
}

async function collectPageSignals(page: Page): Promise<PageSignals> {
  return page.evaluate(() => {
    const getSelector = (element: Element): string => {
      if (element.id) return `#${CSS.escape(element.id)}`;
      const testId = element.getAttribute("data-testid");
      if (testId) return `[data-testid="${CSS.escape(testId)}"]`;
      const tag = element.tagName.toLowerCase();
      const siblings = [...(element.parentElement?.children ?? [])].filter(
        (candidate) => candidate.tagName === element.tagName
      );
      return `${tag}:nth-of-type(${String(siblings.indexOf(element) + 1)})`;
    };
    const isVisible = (element: Element): boolean => {
      const htmlElement = element as HTMLElement;
      const style = getComputedStyle(htmlElement);
      const rect = htmlElement.getBoundingClientRect();
      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        rect.width > 0 &&
        rect.height > 0
      );
    };
    const accessibleName = (element: Element): string => {
      const labelledBy = element.getAttribute("aria-labelledby");
      if (labelledBy) {
        return labelledBy
          .split(/\s+/u)
          .map((id) => document.getElementById(id)?.textContent?.trim() ?? "")
          .join(" ")
          .trim();
      }
      const aria = element.getAttribute("aria-label")?.trim();
      if (aria) return aria;
      if (element instanceof HTMLInputElement) {
        const explicit = element.id
          ? document.querySelector(`label[for="${CSS.escape(element.id)}"]`)
          : null;
        const wrapped = element.closest("label");
        return (
          explicit?.textContent?.trim() ??
          wrapped?.textContent?.trim() ??
          element.getAttribute("title")?.trim() ??
          ""
        );
      }
      return (
        element.textContent?.trim() ??
        element.getAttribute("title")?.trim() ??
        element.querySelector("img")?.getAttribute("alt")?.trim() ??
        ""
      );
    };

    const unlabeledControls = [
      ...document.querySelectorAll("input:not([type=hidden]), select, textarea")
    ]
      .filter(isVisible)
      .filter((element) => accessibleName(element).length === 0)
      .map((element) => ({
        selector: getSelector(element),
        html: element.outerHTML.slice(0, 500),
        kind: element.tagName.toLowerCase()
      }));

    const unnamedActions = [
      ...document.querySelectorAll("button, a[href], [role=button], [role=link]")
    ]
      .filter(isVisible)
      .filter((element) => accessibleName(element).length === 0)
      .map((element) => ({
        selector: getSelector(element),
        html: element.outerHTML.slice(0, 500),
        kind: element.getAttribute("role") ?? element.tagName.toLowerCase()
      }));

    const headings = [...document.querySelectorAll("h1, h2, h3, h4, h5, h6")].filter(isVisible);
    const headingSkips: PageSignals["headingSkips"] = [];
    for (let index = 1; index < headings.length; index += 1) {
      const previous = headings[index - 1];
      const current = headings[index];
      if (!previous || !current) continue;
      const from = Number(previous.tagName.slice(1));
      const to = Number(current.tagName.slice(1));
      if (to - from > 1) {
        headingSkips.push({
          from,
          to,
          text: current.textContent?.trim().slice(0, 120) ?? "",
          selector: getSelector(current)
        });
      }
    }

    const overflow = [...document.body.querySelectorAll("*")]
      .filter(isVisible)
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          selector: getSelector(element),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width)
        };
      })
      .filter((item) => item.right > window.innerWidth + 2 || item.left < -2)
      .slice(0, 10);

    const actions = [...document.querySelectorAll("button, a[href], [role=button], [role=link]")]
      .filter(isVisible)
      .map((element) => ({
        element,
        label: accessibleName(element).replace(/\s+/gu, " ").trim(),
        selector: getSelector(element)
      }));
    const genericLabels = new Set(["click here", "go", "submit", "continue", "more", "learn more"]);
    const ambiguousGroups = new Map<string, string[]>();
    for (const action of actions) {
      const normalized = action.label.toLocaleLowerCase();
      if (genericLabels.has(normalized)) {
        ambiguousGroups.set(normalized, [
          ...(ambiguousGroups.get(normalized) ?? []),
          action.selector
        ]);
      }
    }
    const ambiguousCtas = [...ambiguousGroups.entries()]
      .filter(([, selectors]) => selectors.length > 1)
      .map(([label, selectors]) => ({ label, selectors }));

    const actionGroups = new Map<string, Array<{ label: string; selector: string }>>();
    for (const action of actions) {
      const actionId = action.element.getAttribute("data-action");
      if (!actionId) continue;
      actionGroups.set(actionId, [
        ...(actionGroups.get(actionId) ?? []),
        { label: action.label, selector: action.selector }
      ]);
    }
    const inconsistentActions = [...actionGroups.entries()]
      .map(([action, items]) => ({
        action,
        labels: [...new Set(items.map((item) => item.label))],
        selectors: items.map((item) => item.selector)
      }))
      .filter((group) => group.labels.length > 1);

    const highImpactPattern =
      /\b(delete|remove|revoke|purchase|buy|pay|publish|send|terminate|close account)\b/iu;
    const unsafeActions = actions
      .filter(
        (action) =>
          (action.element.getAttribute("data-high-impact") === "true" ||
            highImpactPattern.test(action.label)) &&
          action.element.getAttribute("data-confirmation") !== "true" &&
          action.element.getAttribute("data-undo") !== "true" &&
          !action.element.getAttribute("aria-describedby")
      )
      .map((action) => ({ selector: action.selector, label: action.label }));

    const missingErrorSignals = [...document.querySelectorAll("[data-humanqa-error-expected=true]")]
      .filter(isVisible)
      .filter(
        (element) =>
          !element.querySelector("[role=alert], [aria-live], [data-error-message]") &&
          !element.getAttribute("aria-errormessage")
      )
      .map((element) => ({
        selector: getSelector(element),
        html: element.outerHTML.slice(0, 500)
      }));

    const missingEmptySignals = [...document.querySelectorAll("[data-humanqa-empty=true]")]
      .filter(isVisible)
      .filter(
        (element) =>
          !element.querySelector("[data-empty-state], [role=status]") &&
          (element.textContent?.trim().length ?? 0) === 0
      )
      .map((element) => ({
        selector: getSelector(element),
        html: element.outerHTML.slice(0, 500)
      }));

    const missingLoadingSignals = [...document.querySelectorAll("[data-humanqa-loading=true]")]
      .filter(isVisible)
      .filter(
        (element) =>
          element.getAttribute("aria-busy") !== "true" &&
          !element.querySelector("[role=status], [aria-live], [aria-label*=load i]")
      )
      .map((element) => ({
        selector: getSelector(element),
        html: element.outerHTML.slice(0, 500)
      }));

    return {
      unlabeledControls,
      unnamedActions,
      headingSkips,
      overflow,
      ambiguousCtas,
      inconsistentActions,
      unsafeActions,
      missingErrorSignals,
      missingEmptySignals,
      missingLoadingSignals
    };
  });
}

function baseEvidence(
  context: HeuristicContext,
  page: Page,
  rule: string,
  selector?: string,
  domExcerpt?: string
): FindingDraft["evidence"] {
  return {
    screenshots: context.screenshots,
    url: page.url(),
    rule,
    ...(context.trace ? { trace: context.trace } : {}),
    ...(selector ? { selector } : {}),
    ...(domExcerpt ? { domExcerpt } : {})
  };
}

export async function checkBrokenLinks(
  page: Page,
  context: HeuristicContext
): Promise<FindingDraft[]> {
  const links = await page.locator("a[href]").evaluateAll((elements) =>
    elements
      .map((element) => ({
        href: (element as HTMLAnchorElement).href,
        text: element.textContent?.trim().slice(0, 120) ?? ""
      }))
      .filter((link) => link.href.startsWith(location.origin))
  );
  const findings: FindingDraft[] = [];
  for (const link of links.slice(0, context.maxLinks ?? 20)) {
    let status: number;
    try {
      const response = await page.request.fetch(link.href, { method: "HEAD", timeout: 5000 });
      status = response.status();
    } catch {
      status = 0;
    }
    if (status === 0 || status >= 400) {
      findings.push({
        targetKey: link.href,
        title: "Same-origin link did not return a successful response",
        category: "functional",
        severity: status === 0 || status >= 500 ? "high" : "medium",
        confidence: 0.98,
        source: "deterministic",
        userImpact: `Users following “${link.text || "unnamed link"}” may reach an unavailable destination.`,
        reach: 1,
        impact: 4,
        effort: 1,
        journeyCriticality: context.journeyCriticality,
        reproductionSteps: [
          `Open ${page.url()}.`,
          `Follow the link labeled “${link.text || "unnamed link"}”.`,
          `Observe the HTTP result ${status === 0 ? "request failure" : String(status)}.`
        ],
        evidence: {
          ...baseEvidence(context, page, "broken-link"),
          network: [
            {
              url: link.href,
              method: "HEAD",
              ...(status ? { status } : { error: "Request failed" })
            }
          ]
        },
        suggestedRemediation:
          "Update or remove the destination and add a route-level regression assertion.",
        regressionCandidate: true,
        limitations: ["Only same-origin links visible in the exercised page state were checked."]
      });
    }
  }
  return findings;
}

export async function runPageHeuristics(
  page: Page,
  context: HeuristicContext
): Promise<FindingDraft[]> {
  const signals = await collectPageSignals(page);
  const findings: FindingDraft[] = [];

  for (const item of signals.unlabeledControls) {
    findings.push({
      targetKey: item.selector,
      title: "Form control has no detectable accessible label",
      category: "accessibility",
      severity: "high",
      confidence: 0.97,
      source: "deterministic",
      userImpact: "Screen-reader and voice-control users may not know the control’s purpose.",
      reach: 1,
      impact: 4,
      effort: 1,
      journeyCriticality: context.journeyCriticality,
      reproductionSteps: [
        `Open ${page.url()}.`,
        `Inspect ${item.selector}.`,
        "Check for an associated label, aria-label, or aria-labelledby value."
      ],
      evidence: baseEvidence(context, page, "form-control-label-missing", item.selector, item.html),
      suggestedRemediation:
        "Associate a visible `<label>` with the control or provide an accurate accessible name.",
      regressionCandidate: true,
      limitations: [
        "Programmatic labeling was checked in the rendered DOM; label quality needs human review."
      ]
    });
  }

  for (const item of signals.unnamedActions) {
    findings.push({
      targetKey: item.selector,
      title: `${item.kind} has no detectable accessible name`,
      category: "accessibility",
      severity: "high",
      confidence: 0.97,
      source: "deterministic",
      userImpact:
        "Assistive-technology users may encounter an unnamed action and be unable to predict its effect.",
      reach: 1,
      impact: 4,
      effort: 1,
      journeyCriticality: context.journeyCriticality,
      reproductionSteps: [
        `Open ${page.url()}.`,
        `Inspect ${item.selector}.`,
        "Check its computed accessible name."
      ],
      evidence: baseEvidence(context, page, "interactive-name-missing", item.selector, item.html),
      suggestedRemediation:
        "Give the action concise visible text or an equivalent programmatic accessible name.",
      regressionCandidate: true,
      limitations: ["The check verifies name presence, not clarity or translation quality."]
    });
  }

  for (const item of signals.headingSkips) {
    findings.push({
      targetKey: item.selector,
      title: `Heading order skips from h${String(item.from)} to h${String(item.to)}`,
      category: "accessibility",
      severity: "low",
      confidence: 0.95,
      source: "deterministic",
      userImpact:
        "A discontinuous heading outline can make page structure harder to navigate and understand.",
      reach: 1,
      impact: 2,
      effort: 1,
      journeyCriticality: context.journeyCriticality,
      reproductionSteps: [
        `Open ${page.url()}.`,
        "List rendered headings in DOM order.",
        `Observe the h${String(item.to)} heading “${item.text}” after h${String(item.from)}.`
      ],
      evidence: baseEvidence(context, page, "heading-order-skip", item.selector),
      suggestedRemediation:
        "Use heading levels to represent document hierarchy without skipping structural levels.",
      regressionCandidate: true,
      limitations: [
        "Some embedded document contexts can justify an apparent level change and need human review."
      ]
    });
  }

  if (signals.overflow.length > 0) {
    findings.push({
      targetKey: `${page.url()}:viewport-overflow`,
      title: "Visible content extends beyond the viewport",
      category: "usability",
      severity: "medium",
      confidence: 0.94,
      source: "deterministic",
      userImpact:
        "Users may need unintended horizontal scrolling or may be unable to reach clipped controls.",
      reach: 1,
      impact: 3,
      effort: 2,
      journeyCriticality: context.journeyCriticality,
      reproductionSteps: [
        `Open ${page.url()} at the audited viewport.`,
        "Compare visible element bounds with the viewport width.",
        `Inspect ${signals.overflow.map((item) => item.selector).join(", ")}.`
      ],
      evidence: {
        ...baseEvidence(context, page, "responsive-horizontal-overflow"),
        metadata: { elements: signals.overflow }
      },
      suggestedRemediation:
        "Constrain fixed-width content, allow safe wrapping, and verify the route at desktop and mobile widths.",
      regressionCandidate: true,
      limitations: ["Intentional horizontally scrollable regions require human review."]
    });
  }

  for (const group of signals.ambiguousCtas) {
    findings.push({
      targetKey: `${group.label}:${group.selectors.join("|")}`,
      title: `Repeated generic call to action: “${group.label}”`,
      category: "usability",
      severity: "low",
      confidence: 0.78,
      source: "advisory",
      userImpact:
        "Repeated generic labels can make destinations difficult to distinguish out of context.",
      reach: 1,
      impact: 2,
      effort: 1,
      journeyCriticality: context.journeyCriticality,
      reproductionSteps: [
        `Open ${page.url()}.`,
        `Locate the ${String(group.selectors.length)} actions named “${group.label}”.`,
        "Review whether each name communicates a distinct outcome."
      ],
      evidence: {
        ...baseEvidence(context, page, "ambiguous-cta-pattern"),
        metadata: { label: group.label, selectors: group.selectors }
      },
      suggestedRemediation:
        "Use outcome-specific action text that remains clear when read without surrounding copy.",
      regressionCandidate: false,
      limitations: ["Clarity is context-dependent; this pattern requires human usability review."]
    });
  }

  for (const group of signals.inconsistentActions) {
    findings.push({
      targetKey: group.action,
      title: `The same declared action uses inconsistent labels: ${group.labels.join(", ")}`,
      category: "usability",
      severity: "low",
      confidence: 0.92,
      source: "deterministic",
      userImpact:
        "Inconsistent terms for the same action can increase learning and recognition effort.",
      reach: 1,
      impact: 2,
      effort: 1,
      journeyCriticality: context.journeyCriticality,
      reproductionSteps: [
        `Open ${page.url()}.`,
        `Find controls with data-action="${group.action}".`,
        `Compare the labels ${group.labels.join(", ")}.`
      ],
      evidence: {
        ...baseEvidence(context, page, "inconsistent-action-labels"),
        metadata: group
      },
      suggestedRemediation:
        "Choose one user-facing term for the declared action and apply it consistently.",
      regressionCandidate: true,
      limitations: ["The finding relies on explicit matching `data-action` metadata."]
    });
  }

  for (const action of signals.unsafeActions) {
    findings.push({
      targetKey: action.selector,
      title: `High-impact action lacks a detectable confirmation or undo affordance`,
      category: "safety",
      severity: "high",
      confidence: 0.8,
      source: "advisory",
      userImpact: `A user may activate “${action.label}” accidentally without a clear recovery path.`,
      reach: 1,
      impact: 5,
      effort: 3,
      journeyCriticality: context.journeyCriticality,
      reproductionSteps: [
        `Open ${page.url()}.`,
        `Inspect the action “${action.label}” without activating it.`,
        "Look for a confirmation description or a declared undo affordance."
      ],
      evidence: baseEvidence(context, page, "high-impact-confirmation-missing", action.selector),
      suggestedRemediation:
        "Add an appropriately timed confirmation, undo, or reversible staging step.",
      regressionCandidate: false,
      limitations: [
        "HumanQA did not activate the control in safe mode.",
        "A confirmation may exist only after activation and therefore requires authorized manual review."
      ]
    });
  }

  const stateChecks: Array<{
    items: Array<{ selector: string; html: string }>;
    rule: string;
    title: string;
    impact: string;
    remediation: string;
  }> = [
    {
      items: signals.missingErrorSignals,
      rule: "form-error-feedback-missing",
      title: "Declared error state has no detectable feedback",
      impact: "Users may not know why the form cannot proceed or how to recover.",
      remediation:
        "Associate a visible error message with the invalid field and announce it when appropriate."
    },
    {
      items: signals.missingEmptySignals,
      rule: "empty-state-signal-missing",
      title: "Declared empty state has no detectable explanation",
      impact: "Users may mistake an empty result for a loading or application failure.",
      remediation: "Provide a clear empty-state message and a relevant next action."
    },
    {
      items: signals.missingLoadingSignals,
      rule: "loading-state-signal-missing",
      title: "Declared loading state has no detectable status signal",
      impact: "Users may repeat an action or assume the interface has stopped responding.",
      remediation: "Expose a visible loading state and programmatic busy or status semantics."
    }
  ];
  for (const check of stateChecks) {
    for (const item of check.items) {
      findings.push({
        targetKey: item.selector,
        title: check.title,
        category: "usability",
        severity: "medium",
        confidence: 0.93,
        source: "deterministic",
        userImpact: check.impact,
        reach: 1,
        impact: 3,
        effort: 2,
        journeyCriticality: context.journeyCriticality,
        reproductionSteps: [
          `Open ${page.url()}.`,
          `Inspect the declared state at ${item.selector}.`,
          "Check for visible and programmatic state feedback."
        ],
        evidence: baseEvidence(context, page, check.rule, item.selector, item.html),
        suggestedRemediation: check.remediation,
        regressionCandidate: true,
        limitations: [
          "This rule requires explicit `data-humanqa-*` state metadata to avoid inferring hidden application state."
        ]
      });
    }
  }

  const consoleErrors = context.console.filter((item) => item.type === "error");
  if (consoleErrors.length > 0) {
    findings.push({
      targetKey: consoleErrors.map((item) => item.text).join("|"),
      title: "Browser console errors occurred during the journey",
      category: "functional",
      severity: "medium",
      confidence: 0.99,
      source: "deterministic",
      userImpact:
        "Runtime errors can indicate broken behavior or hidden failure states in the exercised journey.",
      reach: 1,
      impact: 3,
      effort: 2,
      journeyCriticality: context.journeyCriticality,
      reproductionSteps: [
        `Open ${page.url()}.`,
        "Repeat the declared journey with the browser console open.",
        "Observe the captured error messages."
      ],
      evidence: {
        ...baseEvidence(context, page, "console-error"),
        console: consoleErrors.map((item) => item.text)
      },
      suggestedRemediation:
        "Resolve the underlying runtime errors and add a journey assertion for the affected state.",
      regressionCandidate: true,
      limitations: [
        "Third-party scripts can emit errors unrelated to the declared goal and require triage."
      ]
    });
  }

  const failedNetwork = context.network.filter(
    (item) => item.error || (item.status !== undefined && item.status >= 400)
  );
  if (failedNetwork.length > 0) {
    findings.push({
      targetKey: failedNetwork
        .map((item) => `${item.method}:${item.url}:${String(item.status)}`)
        .join("|"),
      title: "Network requests failed during the journey",
      category: "functional",
      severity: failedNetwork.some((item) => (item.status ?? 0) >= 500) ? "high" : "medium",
      confidence: 0.99,
      source: "deterministic",
      userImpact: "Required content or actions may not complete when exercised resources fail.",
      reach: 1,
      impact: 4,
      effort: 2,
      journeyCriticality: context.journeyCriticality,
      reproductionSteps: [
        `Open ${page.url()}.`,
        "Repeat the declared journey while recording network activity.",
        "Observe the failed requests listed in the evidence."
      ],
      evidence: {
        ...baseEvidence(context, page, "failed-network-request"),
        network: failedNetwork.map((item) => ({
          url: item.url,
          method: item.method,
          ...(item.status !== undefined ? { status: item.status } : {}),
          ...(item.error ? { error: item.error } : {})
        }))
      },
      suggestedRemediation:
        "Restore the failed resource or handle the failure with a visible, recoverable application state.",
      regressionCandidate: true,
      limitations: [
        "Failures from optional third-party resources may not block the declared goal and need triage."
      ]
    });
  }

  return [...findings, ...(await checkBrokenLinks(page, context))];
}

export function describeElementForEvidence(element: Element): string {
  return selectorFor(element);
}
