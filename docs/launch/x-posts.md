# X / Twitter drafts

Each draft uses fixture evidence and makes no adoption or benchmark claim.

## 1 — Evidence gap

Playwright tells you what ran. axe tells you which automated rules failed. A PM still asks: “Does the journey meet what we meant to ship?”

HumanQA connects a declared journey to trace, screenshots, browser evidence, a release verdict, and a safe regression scaffold. Local-first, no model required.

## 2 — Show, do not tell

One command. One intentionally broken local journey. The output: failed request, unlabeled field, keyboard blockage, overflow, missing success state, trace, report, and Playwright scaffold.

HumanQA v0.1 is an evidence pipeline—not an AI opinion about screenshots.

## 3 — From uncertainty to artifact

“We think project creation works” is not a release artifact.

“Here is the failed criterion, exact selector, browser trace, axe rule, keyboard path, risk contribution, and regression scaffold” is.

That is the HumanQA wedge.

## 4 — No AI key

HumanQA is useful with zero model keys.

Deterministic browser and accessibility evidence comes first. Optional enrichment is off by default, consent-gated, separately labeled, and excluded from release gates.

Trust should be an architecture decision.

## 5 — Accessibility boundary

Automated accessibility scanners do not prove accessibility. HumanQA preserves raw axe rules and adds bounded keyboard-path evidence—then says exactly what remains manual.

No “WCAG compliant” badge. No legal claim. Just reproducible scope and an honest gate.

## 6 — PM and engineering

A quality contract can say:

- user sees persistent success confirmation
- critical controls are keyboard reachable
- no critical automated accessibility violations

HumanQA maps each to pass, fail, or review. Unmapped prose never turns green by implication.

## 7 — Safe browser automation

Browser automation should have a stop condition.

HumanQA safe mode blocks purchase, payment, deletion, publishing, messaging, uploads, and account mutation by default. The demo uses disposable browser state only.

Evidence without unnecessary side effects.

## 8 — Report demo

The most important HumanQA screen is not a chat.

It is a local HTML report where every definite finding links back to a rule, route, selector, screenshot, trace, request, axe result, or keyboard record—and every limitation stays visible.

## 9 — Generated tests

Test generation is easy when you invent the missing steps.

HumanQA only generates when evidence is sufficient. It prefers roles, labels, and test IDs; marks captured CSS and fixture data for review; and rejects high-impact actions.

Scaffolds, not auto-merge theater.

## 10 — Open contribution path

Not every quality contribution should require TypeScript.

HumanQA packs are validated YAML with compatibility, safety boundaries, fixtures, and author attribution. Add a persona, journey, heuristic mapping, product framework, or industry context without changing the engine.

## 11 — Founder honesty

HumanQA does not yet know whether teams want a broad quality report, a keyboard-first gate, or issue-to-test generation most.

The repo includes the scorecard, risky assumptions, continue/narrow/pivot/stop thresholds, and first-10-user experiment. Product discovery belongs in the repository too.

## 12 — Local-first

Screenshots and traces can hold credentials, customer data, request bodies, and internal URLs.

HumanQA keeps artifacts local, redacts common text secrets, supports no-screenshot and offline loopback modes, and has no hidden telemetry.

Redaction reduces risk; it is not magic de-identification.

## 13 — CI decision

A red test is not always a release blocker. A green test is not always product readiness.

HumanQA shows explicit threshold reasons, failed acceptance criteria, confidence, formulas, and advisory findings that do not gate.

The decision is reconstructable—and still accountable to humans.

## 14 — Strange but useful

The browser action HumanQA is proudest of is sometimes the one it refuses to perform.

Safe mode can identify a high-impact control, record its missing safeguard, and stop before activation. Non-action can be valid evidence.

## 15 — Invitation

What is the last web journey you had to prove before release?

If you own or are authorized to test a local/staging app, bring one non-destructive journey. I’m looking for 10 honest trials of HumanQA—not testimonials. The most valuable output is a disputed finding with good context.
