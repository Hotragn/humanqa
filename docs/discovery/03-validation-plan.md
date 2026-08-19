# HumanQA validation-first MVP

Date: 2026-08-18

## Smallest credible v0.1

The MVP is one complete, local Proofrun:

1. Start the included SaaS fixture in either broken or fixed mode.
2. Run a declared YAML journey through a safe, headless Chromium session.
3. Capture a trace, screenshots, route history, console errors, failed requests, timing, DOM/element evidence, keyboard traversal, and raw axe results.
4. Produce deterministic findings, an acceptance-criteria matrix, transparent scores, and a release verdict in JSON, Markdown, HTML, SARIF, and JUnit.
5. Generate one non-destructive Playwright regression scaffold from a reproducible finding.
6. Validate one community pack without changing TypeScript.

Conservative single-page exploration may support `audit <url> --goal`, but only declared journeys can make strong acceptance claims.

## Single most important promise

> Run one declared user journey and receive a reproducible evidence bundle that explains whether the release is safe and gives you a reviewed starting point for preventing the failure.

## 60-second demo script

| Time   | Action                                                                                              | Visible proof                                                                                              |
| ------ | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 0–10s  | Run the intentionally broken fixture.                                                               | Terminal prints the local URL and broken mode.                                                             |
| 10–20s | Run `pnpm humanqa audit http://127.0.0.1:4173 --journey packs/journeys/saas-project-creation.yaml`. | Safe mode, redaction, and local output directory are stated.                                               |
| 20–40s | Open `report.html`.                                                                                 | “Block release” appears beside failed-request, accessible-label, overflow, and broken-navigation evidence. |
| 40–50s | Run `pnpm humanqa generate-test <report.json>`.                                                     | A semantic Playwright scaffold is written with the finding ID and review notes.                            |
| 50–60s | Restart the fixture in fixed mode and rerun.                                                        | The seeded findings clear and the quality-contract verdict improves.                                       |

The demo must use honest local timings. Documentation must not promise that every machine completes the run in 60 seconds; the narrative itself is designed to be understandable in that time.

## README and landing validation

### Ten-second comprehension target

A visitor must understand:

- HumanQA audits declared web journeys, not arbitrary human behavior.
- Every strong finding links to browser or rule evidence.
- It works locally without an API key.
- It produces a report, release gate, and safe test scaffold.

### Variants to test

1. **Outcome-led:** “From ‘we think it works’ to the trace, evidence, and regression test.”
2. **Workflow-led:** “One YAML journey in; a release verdict and Playwright scaffold out.”
3. **Accessibility-led backup:** “Reproduce the keyboard path and accessibility evidence that blocks a critical journey.”

Use tagged documentation links and an optional local event export. Do not add silent page or CLI analytics.

### Comprehension test

Show only the README hero and first terminal block for 10 seconds. Ask participants what the tool takes as input, what it produces, whether it needs AI, and whether it changes the target app. A pass requires 8 of 10 participants to answer all four accurately.

## User interview plan

Ask about the participant’s most recent real release before showing HumanQA. Keep questions neutral and request examples rather than opinions about the concept.

1. Walk me through the last web journey you needed to verify before a release.
2. What information did you use to decide whether it was ready?
3. Where did that information come from, and who assembled it?
4. What part of the process took the most time or created the most uncertainty?
5. Tell me about the last browser-test failure that was difficult to reproduce or explain.
6. How do accessibility results enter your current release process?
7. When do findings become regression tests, and what prevents that from happening?
8. What kinds of browser artifacts are safe or unsafe for your team to retain or share?
9. Which release decisions must remain human decisions even when checks are automated?
10. What, if anything, have you tried to improve this process, and why did it persist or get abandoned?

After these questions, show the demo and observe a task-based trial. Do not ask whether the participant “likes” the idea; ask what they would do next and which evidence they distrust.

## Early-user target list

Recruit 12–18 candidates to secure 10 completed trials:

- **2 startup engineers:** Own both implementation and release quality; likely to value setup speed.
- **2 QA engineers:** Can judge reproducibility, noise, and integration depth.
- **2 developer-tool builders:** Can assess CLI ergonomics, schemas, and open-source differentiation.
- **2 product managers:** Can test acceptance-matrix and verdict comprehension.
- **2 accessibility practitioners:** Can challenge keyboard and axe scope claims.
- **2 open-source maintainers:** Can test fixture onboarding, contribution surfaces, and privacy expectations.

Prefer participants with a real staging or local application and one non-destructive journey they are permitted to test. Do not request production credentials or personal data.

## Feedback system

### GitHub Discussions

Recommend these categories:

- Show and tell: sanitized reports, packs, and integrations.
- Q&A: setup and interpretation.
- Product feedback: workflow and trust concerns.
- Pack ideas: persona, journey, heuristic, and industry requests.
- Research: validation results and benchmark design.

Pin a “What did you try?” template asking for context, command, expected outcome, observed outcome, trusted evidence, distrusted evidence, and safe-to-share artifacts.

### Issue forms

Provide bug, feature, persona pack, journey pack, heuristic pack, integration, and documentation forms. Every bug form asks for redacted reproduction, environment, safe-mode state, report schema version, and whether artifacts may be shared.

### Public roadmap

Maintain `ROADMAP.md` with Now, Validate next, Later, and Explicit non-goals. Link roadmap entries to an assumption or repeated signal, not to raw vote count alone.

### Optional local event export

HumanQA may append privacy-safe events to a local JSONL file only when `localEventExport` is configured. Allowed fields are event name, CLI version, coarse duration bucket, success/failure category, report formats created, and pack IDs. Never include URLs, selectors, DOM, screenshots, tokens, file contents, goals, criteria, or machine identifiers. Nothing is transmitted automatically.

## Quantitative signals

| Signal                          | Definition                                             |                 Early target | Caveat                                                   |
| ------------------------------- | ------------------------------------------------------ | ---------------------------: | -------------------------------------------------------- |
| README-to-install conversion    | Qualified README visitors who start installation       |                          15% | Requires an explicit, privacy-safe measurement channel.  |
| GitHub clones                   | Unique clone events visible to maintainers             | 50 in the first launch cycle | Clones do not prove use.                                 |
| First successful audit          | Users who produce a valid JSON report                  |                           10 | Count only explicit local exports or participant trials. |
| First successful generated test | Users who generate and review a scaffold               |         5 of first 10 audits | Generation alone is not adoption.                        |
| Issues opened                   | Actionable issues with reproduction or scoped proposal |                            5 | High volume can indicate confusion.                      |
| Discussions started             | User-authored workflow or trust discussions            |                            3 | Exclude maintainer-seeded threads.                       |
| Pack contributions              | Valid external pack pull requests                      |               2 in six weeks | Quality matters more than count.                         |
| Returning users                 | A second audit on a different day or revision          |                4 of first 10 | Measured only through explicit reporting.                |
| Stars after launch distribution | Stars following posts, demos, or directory submissions |       100 directional target | Never present this as adoption or quality proof.         |
| Report/demo shares              | Sanitized report links or demo reposts                 |                            5 | Confirm sharing permission.                              |

## Qualitative signals

Capture verbatim user wording with consent, but publish only anonymized notes:

- The exact words users use for release uncertainty, evidence assembly, and regression gaps.
- Repeated requests for CI, authentication, framework adapters, or ticket integration.
- False-positive complaints, including the rule, page state, and user interpretation.
- Trust concerns about screenshots, DOM, traces, models, scoring, and mutation.
- Whether users understand acceptance states, risk labels, and confidence.
- Whether reports are shared with engineers, PMs, designers, or accessibility reviewers.
- Whether contributors choose packs and skills or request core-code changes.

## Decision thresholds after 10 completed trials

### CONTINUE

Continue to v0.2 when all are true:

- At least 7 participants complete a first audit with no maintainer code changes.
- At least 6 say the evidence bundle improves a real release or debugging task.
- At least 5 keep or adapt a generated test, contract, workflow, or pack.
- Definite deterministic findings have at least 80% reviewer-rated actionability.
- No default run performs a prohibited high-impact action or leaks a seeded secret.

### NARROW

Narrow when the evidence pipeline is valued but the combined promise is confusing:

- At least 6 value one module, but fewer than 5 understand or use the full report.
- Keyboard/accessibility evidence or test generation produces at least twice the repeat use of other features.
- More than 20% of general heuristic findings are disputed while network, console, explicit assertion, and axe findings remain trusted.

The default narrowing path is Keypath plus evidence-backed generated tests.

### PIVOT

Pivot when a postponed concept clearly wins:

- Fewer than 4 users value the report, but at least 6 urgently request issue-to-test generation or acceptance-criteria traceability.
- Declared journey authoring repeatedly takes longer than direct Playwright while report ingestion from existing tests is strongly requested.
- Users consistently want HumanQA as a reporter or skill layer over existing tests rather than a runner.

### STOP

Stop active product expansion when any condition persists after one focused correction:

- Fewer than 3 of 10 identify a painful recurring job.
- Definite findings remain below 60% actionability.
- Generated artifacts do not enter any real workflow.
- Safe defaults cannot reliably block seeded high-impact actions.
- The repository duplicates existing tools without a demonstrated evidence-to-decision advantage.

Stopping means publishing the research and maintaining critical fixes; it does not require deleting the open-source work.

## First experiment

Run a concierge “bring one journey” session with the first 10 users. Each participant supplies a local or staging URL they are authorized to test and describes one non-destructive release goal. Observe journey setup, run HumanQA, ask them to explain the verdict, and let them choose whether to keep the report or scaffold. Record setup time, first-audit success, disputed findings, evidence opened, artifact adopted, and the participant’s next action. This single experiment tests the highest-risk desirability, usability, reliability, and trust assumptions together.
