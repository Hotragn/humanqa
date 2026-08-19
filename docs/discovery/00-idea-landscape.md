# HumanQA idea landscape

Date: 2026-08-18

This landscape treats HumanQA as a hypothesis, not a predetermined answer. The goal is a narrow open-source wedge that demonstrates trustworthy product-quality evidence in under one minute. Each concept is judged by the same standard: it must solve an urgent job, create an inspectable artifact, and remain useful without a paid model.

## 1. Proofrun — evidence-first journey CLI

- **Promise:** Turn one declared user journey into a local evidence bundle, deterministic findings, a release verdict, and a safe Playwright test scaffold.
- **Target user:** Full-stack and QA engineers preparing a web release.
- **Painful job:** Prove that a critical flow works without manually assembling screenshots, console logs, accessibility output, and a regression test.
- **60-second wow demo:** Run `humanqa audit http://localhost:4173 --journey packs/journeys/saas-project-creation.yaml`; open one HTML report showing the failed step, screenshot, axe rule, network error, risk score, and generated test command.
- **Core mechanism:** A versioned YAML journey drives Playwright; deterministic collectors normalize browser, DOM, network, keyboard, and axe evidence into one finding model.
- **Why it might earn stars:** The report is visual, credible, local, and immediately reusable in a pull request.
- **Why developers might use it:** It compresses several debugging and test-authoring tasks into one command while preserving raw evidence.
- **Why contributors might help:** New checks, reporters, fixtures, and YAML packs are bounded additions.
- **Existing alternatives:** Playwright, Lighthouse, axe DevTools, Checkly, QA Wolf, BrowserStack, and general browser agents.
- **Differentiation:** It connects declared product intent to browser evidence, transparent prioritization, and test scaffolds rather than offering only execution or scanning.
- **Technical complexity:** Medium-high; a narrow vertical slice is feasible if arbitrary autonomous exploration is postponed.
- **Privacy/safety concerns:** Pages can contain secrets and mutation-capable controls; local storage, redaction, and deny-by-default actions are mandatory.
- **Hosted-product potential:** Team history, baselines, review workflows, encrypted artifacts, and fleet execution.
- **Why it could fail:** Teams may prefer composing their own Playwright fixtures, or deterministic UX checks may create noisy findings.
- **Reject if:** First users cannot get a useful evidence-backed finding from a seeded journey in under five minutes.

## 2. MergeGate — GitHub Action release gate

- **Promise:** Fail a pull request only when a changed journey violates an explicit quality threshold.
- **Target user:** Maintainers with Playwright-enabled CI.
- **Painful job:** Decide whether browser-test failures, accessibility regressions, and console errors are release-blocking.
- **60-second wow demo:** Open a pull request and see one concise check summary with a verdict, acceptance-criteria matrix, artifact links, and SARIF annotations.
- **Core mechanism:** A GitHub Action runs quality contracts, compares deterministic thresholds, uploads artifacts, and formats a check result.
- **Why it might earn stars:** A copy-paste workflow provides obvious team value.
- **Why developers might use it:** It standardizes release decisions and reduces noisy review comments.
- **Why contributors might help:** CI adapters, annotation formatters, and starter contracts are discrete contributions.
- **Existing alternatives:** Playwright GitHub Actions, Lighthouse CI, accessibility Actions, and commercial synthetic-monitoring gates.
- **Differentiation:** The gate is journey- and product-intent-aware and explains risk rather than merely returning a test exit code.
- **Technical complexity:** Medium after a stable local engine exists; high if built first because artifact hosting and CI variance obscure product value.
- **Privacy/safety concerns:** CI secrets, uploaded traces, fork permissions, retention, and third-party artifact access.
- **Hosted-product potential:** Organization policies, trend dashboards, approval workflows, and managed runners.
- **Why it could fail:** CI-only onboarding is slow, permissions are intimidating, and false gates rapidly destroy trust.
- **Reject if:** The local engine cannot first demonstrate stable, low-noise findings.

## 3. QualitySkill — agent-skill quality operator

- **Promise:** Give coding agents a portable, evidence-constrained workflow for auditing a URL and returning structured product-quality results.
- **Target user:** Developers using Codex, Claude Code, Cursor, or compatible skill systems.
- **Painful job:** Browser agents often make unsupported UX claims or produce prose that cannot become a repeatable test.
- **60-second wow demo:** Invoke `$ux-audit` with a URL and goal; receive a HumanQA report whose every assertion links to local evidence.
- **Core mechanism:** Small `SKILL.md` packages route agents through HumanQA schemas, safety rules, confidence rules, and artifact requirements.
- **Why it might earn stars:** Agent skills are easy to inspect, fork, and share across tools.
- **Why developers might use it:** It makes agent output more disciplined without locking users to one model vendor.
- **Why contributors might help:** Domain specialists can improve one skill or reference without changing the engine.
- **Existing alternatives:** Prompt libraries, browser-use agent prompts, MCP workflows, and coding-agent rules files.
- **Differentiation:** Skills depend on a deterministic evidence engine and reject unsupported conclusions.
- **Technical complexity:** Low for packaging, but credibility depends on the execution engine.
- **Privacy/safety concerns:** Agents may exfiltrate artifacts or overstep mutation boundaries unless consent and local-first constraints are explicit.
- **Hosted-product potential:** Managed skill distribution, policy enforcement, evaluations, and team skill registries.
- **Why it could fail:** It can look like another prompt collection if shipped without working artifacts.
- **Reject if:** Skills are the primary product before the CLI can produce reliable reports.

## 4. Pack Commons — community journey and persona registry

- **Promise:** Install versioned quality packs for common journeys without writing test code.
- **Target user:** QA teams, maintainers, and domain experts who share repeatable interaction patterns.
- **Painful job:** Every team rewrites onboarding, checkout-review, keyboard-only, and empty-state coverage.
- **60-second wow demo:** Add a community SaaS onboarding pack, validate it, and run it against a fixture without modifying TypeScript.
- **Core mechanism:** Zod-validated YAML schemas, compatibility rules, fixtures, attribution, and a curated registry.
- **Why it might earn stars:** It creates a contributor flywheel and makes the repository grow through data rather than core changes.
- **Why developers might use it:** Packs provide inspectable starting points and reduce setup time.
- **Why contributors might help:** A useful pack can be authored and reviewed without learning the engine internals.
- **Existing alternatives:** Playwright examples, test fixture repositories, Lighthouse configs, and prompt marketplaces.
- **Differentiation:** Packs combine personas, safe journey steps, heuristics, expected evidence, compatibility, and attribution.
- **Technical complexity:** Medium; schema design and long-term compatibility are harder than file loading.
- **Privacy/safety concerns:** Malicious selectors or actions, hidden external calls, unsafe submission steps, and untrusted author metadata.
- **Hosted-product potential:** Signed registry, trust scores, private packs, compatibility testing, and usage insights.
- **Why it could fail:** Generic packs may not map well to unique applications, causing brittle or superficial audits.
- **Reject if:** Three independent users cannot adapt a starter pack faster than writing a Playwright test.

## 5. ContractBridge — PM-to-engineering acceptance verifier

- **Promise:** Convert acceptance criteria into version-controlled quality contracts with evidence-backed pass, fail, or review outcomes.
- **Target user:** Product managers and engineering leads shipping a defined feature.
- **Painful job:** Acceptance criteria disappear between tickets, manual QA, automated tests, and release decisions.
- **60-second wow demo:** Run one contract and view a matrix mapping each criterion to a browser step, observed evidence, confidence, and owner action.
- **Core mechanism:** A declarative contract connects natural-language criteria to deterministic journey assertions; unmapped criteria remain explicit human-review items.
- **Why it might earn stars:** It creates a concrete bridge between product intent and engineering evidence.
- **Why developers might use it:** It exposes ambiguous criteria before release and produces reusable test scaffolds.
- **Why contributors might help:** PM frameworks, criterion patterns, and report views are accessible contribution surfaces.
- **Existing alternatives:** Cucumber, Gherkin, test-management suites, Linear/Jira templates, and specification-by-example tools.
- **Differentiation:** It does not pretend all prose is executable; it visibly separates verified, failed, and human-review claims.
- **Technical complexity:** Medium-high because reliable criterion-to-evidence mapping is partly semantic.
- **Privacy/safety concerns:** PRDs can contain confidential product data; local inputs and opt-in LLM enrichment are required.
- **Hosted-product potential:** Ticket integrations, contract review, traceability, ownership, and release sign-off.
- **Why it could fail:** PMs may not adopt YAML and engineers may see it as duplicated test specification.
- **Reject if:** The matrix does not improve a real release conversation compared with an ordinary checklist.

## 6. Keypath — accessibility-first keyboard gate

- **Promise:** Reproduce the keyboard path where a critical journey becomes blocked and attach WCAG-linked evidence.
- **Target user:** Accessibility practitioners and frontend engineers.
- **Painful job:** Automated scanners miss keyboard-order, focus visibility, and focus-trap failures, while manual findings are hard to regress.
- **60-second wow demo:** Run a keyboard-only onboarding journey and watch the report identify an inaccessible control plus the exact tab sequence and screenshot.
- **Core mechanism:** Playwright keyboard traversal, focus metadata, screenshots, bounded trap detection, and axe integration.
- **Why it might earn stars:** It tackles a well-known scanner gap with reproducible evidence.
- **Why developers might use it:** The output is actionable and closer to a regression test than a compliance checklist.
- **Why contributors might help:** Accessibility experts can add paths, rules, fixtures, and manual-review guidance.
- **Existing alternatives:** axe-core, Accessibility Insights, Pa11y, Lighthouse, and manual screen-reader audits.
- **Differentiation:** Journey-level keyboard evidence is combined with scanner output and CI gating without claiming full compliance.
- **Technical complexity:** Medium; keyboard heuristics must be conservative across widgets and browsers.
- **Privacy/safety concerns:** Low external-data risk, but screenshots and DOM still require redaction.
- **Hosted-product potential:** Accessibility baselines, expert review marketplace, remediation tracking, and policy gates.
- **Why it could fail:** False trap detection and incomplete screen-reader coverage could create misplaced confidence.
- **Reject if:** The tool cannot clearly communicate that automated evidence is partial and requires manual review.

## 7. FrameLedger — visual evidence timeline

- **Promise:** Turn a browser journey into a shareable frame-by-frame quality narrative instead of a folder of artifacts.
- **Target user:** Designers, PMs, and engineers reviewing a release together.
- **Painful job:** Traces are powerful but hard for non-engineers to interpret, while screenshots lack chronology and context.
- **60-second wow demo:** Open a local timeline that aligns screenshots, actions, route changes, console events, and findings.
- **Core mechanism:** Deterministic event synchronization and a static HTML timeline generated from local artifacts.
- **Why it might earn stars:** The artifact is visually compelling and easy to share in a review.
- **Why developers might use it:** It reduces time spent explaining how a failure occurred.
- **Why contributors might help:** Report themes, event renderers, and artifact adapters are modular.
- **Existing alternatives:** Playwright Trace Viewer, session replay products, Percy, Chromatic, and visual regression dashboards.
- **Differentiation:** It emphasizes product intent, accessibility, and release relevance rather than pixel diffs or raw debugging.
- **Technical complexity:** Medium-high due to artifact size, rendering, and cross-format synchronization.
- **Privacy/safety concerns:** A polished replay can expose more user data than raw files; redaction and local hosting are essential.
- **Hosted-product potential:** Secure report sharing, comments, comparisons, and team history.
- **Why it could fail:** It may be a beautiful viewer without solving the underlying reliability problem.
- **Reject if:** Users admire the report but do not change or accelerate a release decision.

## 8. ReviewTrail — PR-review quality companion

- **Promise:** Add only change-relevant browser evidence to a pull request, with no automated issue spam.
- **Target user:** Frontend reviewers and maintainers.
- **Painful job:** Reviewers infer user impact from code diffs without seeing the affected journey.
- **60-second wow demo:** A PR comment shows changed routes, the journey exercised, two evidence thumbnails, and one regression candidate.
- **Core mechanism:** Git diff route mapping, targeted contracts, local/CI audit execution, and concise Markdown formatting.
- **Why it might earn stars:** It fits an existing developer habit and produces a highly visible result.
- **Why developers might use it:** It grounds code review in observed behavior.
- **Why contributors might help:** Framework route adapters and comment renderers are contained projects.
- **Existing alternatives:** Preview deployments, Chromatic, Percy, Danger, and generic test reporters.
- **Differentiation:** It connects diffs to journey evidence and product acceptance criteria, not just screenshots.
- **Technical complexity:** High because change impact mapping differs by framework and repository shape.
- **Privacy/safety concerns:** Pull-request comments and public artifacts may leak routes, content, and test accounts.
- **Hosted-product potential:** Change intelligence, reviewer assignment, encrypted previews, and organization policies.
- **Why it could fail:** Mapping code changes to journeys may be inaccurate enough to erode trust.
- **Reject if:** Route mapping becomes the core engineering burden before local audits prove useful.

## 9. FrictionProbe — evidence-backed product discovery

- **Promise:** Compare how defined personas complete a prototype journey and surface measurable friction hypotheses for interviews.
- **Target user:** Product designers and early-stage founders.
- **Painful job:** Teams over-index on subjective critique before observing real users.
- **60-second wow demo:** Run three persona configurations and receive a local hypothesis board that distinguishes measured friction from questions for research.
- **Core mechanism:** Journey timing, interaction counts, responsive states, accessibility signals, and clearly labeled advisory heuristics.
- **Why it might earn stars:** It offers a novel bridge from prototypes to research planning.
- **Why developers might use it:** It catches mechanical problems before recruiting participants.
- **Why contributors might help:** Research templates, persona cautions, and domain fixtures invite multidisciplinary input.
- **Existing alternatives:** Maze, UserTesting, heuristic checklists, analytics, and AI design critics.
- **Differentiation:** It explicitly refuses to simulate human attitudes and uses automation only to generate research hypotheses.
- **Technical complexity:** Medium, but disciplined language and validation are harder than collection.
- **Privacy/safety concerns:** Persona stereotypes and false claims about human behavior are material risks.
- **Hosted-product potential:** Research repositories, participant-study handoff, and team synthesis.
- **Why it could fail:** Users may expect simulated user research, which the product should not claim to provide.
- **Reject if:** Automated output is repeatedly mistaken for evidence about actual user preferences.

## 10. Deadman Switch — strange but useful risky-action detector

- **Promise:** Crawl a declared journey and identify high-impact controls that lack confirmation, undo, or safe test affordances without activating them.
- **Target user:** SaaS platform teams and security-conscious QA engineers.
- **Painful job:** Destructive actions are discovered late, and automated agents are unsafe around production-like data.
- **60-second wow demo:** Audit a settings page; see all delete, revoke, publish, send, and purchase controls mapped to their safeguards, with zero clicks on risky targets.
- **Core mechanism:** Semantic control classification, text/action deny lists, DOM form inspection, route patterns, and optional explicit test-mode manifests.
- **Why it might earn stars:** The safety-first inversion is memorable and solves a growing agent-automation problem.
- **Why developers might use it:** It audits both product affordances and automation boundaries.
- **Why contributors might help:** Domain-specific risky-action vocabularies and safe fixtures are simple to extend.
- **Existing alternatives:** Manual UX review, policy engines, and browser-agent guardrails.
- **Differentiation:** It treats non-action as evidence and generates a machine-readable safety manifest.
- **Technical complexity:** Medium; semantics vary by language and application.
- **Privacy/safety concerns:** A false negative could permit harm if reused as an authorization system; it must remain advisory and deny by default.
- **Hosted-product potential:** Organization action policies, approval workflows, audit logs, and agent guardrail services.
- **Why it could fail:** The detector can be too conservative or language-dependent to stand alone.
- **Reject if:** Users treat the output as proof that a site is safe for autonomous mutation.

## 11. ReproForge — issue-to-test evidence compiler

- **Promise:** Turn a bug report plus optional browser artifacts into a safe Playwright regression-test scaffold with explicit review points.
- **Target user:** Maintainers triaging UI issues.
- **Painful job:** Reproductions decay in prose and writing the first regression test is repetitive.
- **60-second wow demo:** Feed a HumanQA report into `generate-test`; receive a runnable spec using roles and labels, with unsafe or uncertain steps omitted and marked for review.
- **Core mechanism:** Finding-schema validation, evidence sufficiency gates, selector prioritization, and deterministic code templates.
- **Why it might earn stars:** It creates an immediately useful code artifact from a common maintainer workflow.
- **Why developers might use it:** It shortens the distance from bug evidence to a reviewed test.
- **Why contributors might help:** Language/framework generators and selector-quality rules are well-bounded.
- **Existing alternatives:** Playwright codegen, test-generation LLMs, and issue-to-code agents.
- **Differentiation:** Generation is evidence-gated, safe by default, and preserves finding IDs and uncertainties.
- **Technical complexity:** Low-medium for HumanQA findings; much higher for arbitrary issue prose.
- **Privacy/safety concerns:** Issue text and traces can contain secrets; local parsing and redaction are required.
- **Hosted-product potential:** Triage integrations, repository-aware generation, and pull-request suggestions.
- **Why it could fail:** Scaffolds may save little time if they need substantial rewriting.
- **Reject if:** Generated tests are less maintainable than a developer-authored five-minute test.

## 12. RiskCanvas — release-readiness portfolio

- **Promise:** Summarize multiple quality contracts into a transparent, product-manager-ready release decision.
- **Target user:** PMs and release owners coordinating several journeys.
- **Painful job:** Release meetings combine disconnected test results, accessibility reports, incidents, and subjective confidence.
- **60-second wow demo:** Open one static dashboard showing which contracts block release, why, confidence, limitations, and the next safe action.
- **Core mechanism:** Normalized report ingestion, deterministic scoring, threshold policies, and a static dashboard.
- **Why it might earn stars:** It makes technical evidence legible to decision-makers without requiring a SaaS account.
- **Why developers might use it:** It replaces manual status synthesis with traceable calculations.
- **Why contributors might help:** Score policies, report adapters, and product-framework mappings are modular.
- **Existing alternatives:** Test-management dashboards, Allure, ReportPortal, quality analytics platforms, and spreadsheets.
- **Differentiation:** Every decision contribution links back to journey evidence and states uncertainty.
- **Technical complexity:** Medium after report schemas stabilize; premature before enough reports exist.
- **Privacy/safety concerns:** Aggregated dashboards can expose sensitive project state and URLs.
- **Hosted-product potential:** Release history, approvals, policy management, cross-repository analytics, and executive reporting.
- **Why it could fail:** Scoring can imply false objectivity or add a dashboard before users trust the underlying data.
- **Reject if:** Users cannot independently reconstruct the verdict from the raw findings and declared thresholds.

## Landscape conclusion

The strongest common thread is not autonomous auditing. It is an evidence pipeline that starts with a declared, safe journey and ends with artifacts usable by engineers, accessibility reviewers, PMs, CI, and coding agents. The first product should therefore prove that thin spine before investing in hosting, autonomous exploration, diff intelligence, or a broad pack marketplace.
