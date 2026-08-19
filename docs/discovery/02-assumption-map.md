# HumanQA v0.1 assumption map

Date: 2026-08-18  
Selected concept: **HumanQA Proofrun**, a local declared-journey evidence CLI.

Risk describes the consequence and uncertainty of being wrong. “Current evidence” distinguishes repository reasoning from validated user evidence; no interviews, adoption, or benchmark results are claimed.

## Desirability

### D1 — Release owners have an evidence-assembly problem

- **Who has the pain:** Full-stack engineers, QA engineers, maintainers, and founders shipping critical web journeys.
- **What they do today:** Run Playwright, axe, DevTools, screenshots, manual QA, and ticket checklists separately; summarize results by hand.
- **Why current tools are insufficient:** The artifacts do not consistently map back to product intent or forward to a release decision and regression scaffold.
- **Risk:** High.
- **Current evidence:** Strong tool fragmentation is observable in existing workflows, but HumanQA has no direct interview evidence yet.
- **Cheapest validation experiment:** Give 10 target users the 60-second demo and ask them to compare it with their last release investigation.
- **Pass condition:** At least 7 identify a recent comparable task and 5 request to try HumanQA on their own staging journey.
- **Fail condition:** Fewer than 4 identify the problem or most consider existing Playwright output sufficient.
- **Next decision if it fails:** Narrow to Keypath or ReproForge, whichever job users describe as urgent.

### D2 — A declared journey is acceptable onboarding

- **Who has the pain:** Teams that need reproducibility more than autonomous coverage.
- **What they do today:** Write selectors and actions directly in Playwright specs, page objects, or manual scripts.
- **Why current tools are insufficient:** Test code can obscure the product goal and is harder for PM or accessibility collaborators to review.
- **Risk:** High.
- **Current evidence:** YAML is familiar in developer tools, but no evidence yet shows users prefer it for browser journeys.
- **Cheapest validation experiment:** Ask five engineers to adapt the starter project-creation journey to a small app while timing setup.
- **Pass condition:** Four complete it in under 10 minutes and describe the YAML as clearer than the equivalent test setup.
- **Fail condition:** Three or more abandon it or immediately rewrite it as TypeScript.
- **Next decision if it fails:** Support a typed journey API and generated YAML, while retaining YAML for community packs.

### D3 — The combined report is understandable within one minute

- **Who has the pain:** Engineers and PMs who must agree on whether a finding blocks release.
- **What they do today:** Translate raw test results into messages, tickets, or spreadsheets.
- **Why current tools are insufficient:** Evidence, severity, uncertainty, and next actions are separated or implicit.
- **Risk:** High.
- **Current evidence:** The proposed report hierarchy follows familiar test-report patterns; it has not been usability-tested.
- **Cheapest validation experiment:** Five-second and 60-second comprehension tests using a seeded report.
- **Pass condition:** At least 8 of 10 state the correct verdict at 10 seconds and correctly explain one evidence chain at 60 seconds.
- **Fail condition:** More than 3 misread the verdict or treat advisory observations as facts.
- **Next decision if it fails:** Reduce the top-level report to verdict, blocking evidence, limitations, and next safe action.

### D4 — Generated scaffolds create real time savings

- **Who has the pain:** Maintainers converting reproduced UI bugs into stable regression coverage.
- **What they do today:** Reconstruct steps and selectors from issue prose or traces.
- **Why current tools are insufficient:** Code generation captures interaction syntax but not finding identity, safety boundaries, or evidence sufficiency.
- **Risk:** Medium.
- **Current evidence:** Semantic selector templating is technically straightforward; maintainability and time savings are unvalidated.
- **Cheapest validation experiment:** Ask five engineers to produce the same regression test manually and from a HumanQA scaffold; compare time and requested edits.
- **Pass condition:** Median reviewed completion time improves by at least 25%, with no additional destructive actions.
- **Fail condition:** Scaffolds require substantial rewrites or encourage brittle selectors.
- **Next decision if it fails:** Keep reproduction snippets in reports and remove code generation from the main promise.

### D5 — Users will install, star, or share because the artifact is inspectable

- **Who has the pain:** Open-source-oriented developers skeptical of opaque AI quality claims.
- **What they do today:** Share traces, screenshots, CI logs, or commercial report links.
- **Why current tools are insufficient:** Evidence packages are either too technical for collaborators or hosted behind an account.
- **Risk:** Medium.
- **Current evidence:** Local static reports are portable and familiar, but no distribution behavior has been observed.
- **Cheapest validation experiment:** Publish the demo report and quick start to three relevant communities; measure README-to-install and report-link shares without silent analytics.
- **Pass condition:** At least 10 first successful audits and 3 unsolicited report shares from the first 100 qualified visitors.
- **Fail condition:** Visitors read the README but do not run the demo or share the artifact.
- **Next decision if it fails:** Interview non-converters and test a Keypath-focused demo before adding features.

## Feasibility

### F1 — A useful deterministic core can be implemented with Playwright and axe

- **Deterministic scope:** Journey execution, response and console capture, screenshots, traces, URLs, timing, accessible names, labels, heading order, overflow, keyboard traversal, axe rules, and explicit assertions.
- **Optional LLM scope:** Summarizing already-supported evidence, mapping nuanced criteria, and drafting advisory remediation language after consent.
- **Not promised in v0.1:** Human-level usability judgment, arbitrary app understanding, full WCAG compliance, screen-reader equivalence, or safe autonomous account mutation.
- **Risk:** Medium.
- **Current evidence:** Playwright and axe expose the required raw signals; cross-site behavior remains to be tested.
- **Cheapest validation experiment:** Run the vertical slice against broken and fixed fixture modes and assert the expected finding delta.
- **Pass condition:** Seeded defects are detected, fixed variants clear, and reports preserve raw references.
- **Fail condition:** Core signals cannot be reproduced reliably across repeated local runs.
- **Next decision if it fails:** Reduce the first release to explicit assertions plus axe and network/console evidence.

### F2 — Conservative keyboard heuristics can avoid strong false claims

- **Deterministic scope:** Record focused elements, detect repeated cycles within a bounded traversal, verify expected reachable selectors, and inspect basic focus indicators.
- **Optional LLM scope:** None is required; qualitative interpretation should be human review.
- **Not promised in v0.1:** Complete focus-order correctness, assistive-technology behavior, or legal compliance.
- **Risk:** High.
- **Current evidence:** Focus state is observable, but custom widgets and intentional focus containment complicate interpretation.
- **Cheapest validation experiment:** Test five known-good and five deliberately broken keyboard fixtures.
- **Pass condition:** All broken fixtures are detected and no good fixture is labeled a definite trap; ambiguous cases are advisory.
- **Fail condition:** Good dialogs are reported as traps or unreachable controls are missed repeatedly.
- **Next decision if it fails:** Require explicit `keyboardReachable` assertions and report traversal data without automatic trap findings.

### F3 — Evidence and reports can remain stable enough for CI

- **Deterministic scope:** Stable finding IDs derived from rule and target, schema-versioned reports, fixed scoring, and normalized timestamps/paths in tests.
- **Optional LLM scope:** AI text must be separated and excluded from gates.
- **Not promised in v0.1:** Pixel-stable screenshots or cross-machine performance benchmarks.
- **Risk:** Medium.
- **Current evidence:** Stable serialization is controllable; browser and timing variance require normalization.
- **Cheapest validation experiment:** Run the same fixture audit five times in CI and compare rule IDs, verdicts, and acceptance states.
- **Pass condition:** All five runs produce the same deterministic finding set and verdict.
- **Fail condition:** Finding identity or gate results vary without fixture changes.
- **Next decision if it fails:** Remove unstable checks from gating and retain them only as observations.

### F4 — Redaction can materially reduce accidental exposure

- **Deterministic scope:** Redact email addresses, bearer tokens, common key formats, passwords, authorization headers, and secret-like query parameters before report persistence.
- **Optional LLM scope:** No artifact leaves the machine unless an adapter and explicit consent are configured.
- **Not promised in v0.1:** Perfect de-identification of screenshots or arbitrary domain-specific personal data.
- **Risk:** High.
- **Current evidence:** Text patterns are tractable; screenshot and DOM context can defeat generic redaction.
- **Cheapest validation experiment:** Run a seeded secret corpus through every serialization path and inspect a no-screenshot mode.
- **Pass condition:** All seeded secrets are absent from text reports, and limitations are visible before execution.
- **Fail condition:** Any seeded authorization value or password survives in a persisted report.
- **Next decision if it fails:** Disable affected artifact types by default until redaction is corrected.

## Viability

### V1 — The execution engine, schemas, packs, reporters, and skills should remain open source

- **Open-source scope:** CLI, browser collector, schemas, checks, scoring, reporters, pack SDK, starter packs, skills, fixture apps, and CI examples.
- **Potential hosted scope:** Encrypted artifact retention, team history, policy administration, managed runners, authentication, cross-repository analytics, and review workflows.
- **Risk:** Low.
- **Current evidence:** Open local infrastructure supports trust and adoption; hosted collaboration has plausible value but no demand evidence.
- **Cheapest validation experiment:** Ask early users which artifacts they would need shared, retained, or governed by a team service.
- **Pass condition:** At least 4 of 10 identify a recurring collaboration need while still valuing local execution.
- **Fail condition:** Users either reject any hosted component or need capabilities incompatible with the open engine.
- **Next decision if it fails:** Keep the project community-funded or integration-led; do not force a hosted roadmap.

### V2 — Community packs create a healthy contribution loop

- **Distribution loop:** Reports link to pack attribution; starter issues invite adaptations; validated packs improve discoverability and generate new demos.
- **Risk:** Medium.
- **Current evidence:** YAML lowers code barriers, but app-specific selectors limit reuse.
- **Cheapest validation experiment:** Mentor three contributors through one persona, journey, or heuristic pack each.
- **Pass condition:** Two contributions merge without core TypeScript changes and remain useful in fixture validation.
- **Fail condition:** Every pack requires application-specific code or intensive maintainer repair.
- **Next decision if it fails:** Focus contributions on rule fixtures, reporters, and skills rather than generic journeys.

### V3 — GitHub and coding-agent workflows can distribute the project

- **Distribution loop:** Generated tests enter repositories, report summaries appear in pull requests, skills reference the CLI, and pack attribution rewards authors.
- **Risk:** Medium.
- **Current evidence:** These surfaces align with developer workflow, but no conversion data exists.
- **Cheapest validation experiment:** Ship dry-run comment output and five portable skills; track explicit local event exports and discussion requests.
- **Pass condition:** At least 3 of the first 10 users adopt either a generated test, a workflow, or a skill beyond the demo.
- **Fail condition:** Users run the demo once but do not integrate any artifact.
- **Next decision if it fails:** Optimize one recurring workflow before expanding integrations.

## Trust and safety

### T1 — Safe mode can prevent common irreversible actions

- **What could go wrong:** An audit could purchase, delete, publish, send, upload, alter an account, or expose production records.
- **Control:** Journey schemas classify mutation-capable steps; safe mode blocks risky labels and submission methods unless a step is explicitly marked safe and an override is provided.
- **Risk:** Critical.
- **Current evidence:** Deny lists and explicit manifests reduce common risk but cannot infer every domain action.
- **Cheapest validation experiment:** Create fixtures for purchase, delete, send, upload, and settings mutation; attempt each in default mode.
- **Pass condition:** Every high-impact fixture is blocked before activation and produces a clear warning.
- **Fail condition:** Any default journey completes a high-impact action.
- **Next decision if it fails:** Remove generic click/exploration behavior and allow only explicitly safe fixture steps.

### T2 — Findings can avoid unsupported AI claims

- **What could go wrong:** Subjective advice could be presented as observed fact, or model text could alter severity and gate results.
- **Control:** Every finding requires a deterministic rule or evidence reference; advisory observations carry limitations; AI enrichment is separately labeled and cannot mutate raw evidence.
- **Risk:** High.
- **Current evidence:** Schema and adapter boundaries can enforce provenance; wording still requires review.
- **Cheapest validation experiment:** Run the mock adapter with contradictory text and assert that deterministic severity, confidence, and evidence remain unchanged.
- **Pass condition:** Reports clearly distinguish raw, deterministic, and AI-authored content; gates use deterministic fields only.
- **Fail condition:** Reviewers cannot identify which claim came from which source.
- **Next decision if it fails:** Remove LLM enrichment from v0.1 and retain only the interface contract.

### T3 — Local-first and consent controls match user expectations

- **What could go wrong:** Screenshots, DOM, traces, secrets, or user data could be sent externally or silently measured.
- **Control:** No telemetry, no networked model adapter by default, offline mode, screenshot opt-out, redaction on, and explicit adapter consent.
- **Risk:** High.
- **Current evidence:** The architecture can enforce defaults; user comprehension is not validated.
- **Cheapest validation experiment:** Ask 10 users to predict what leaves their machine from the CLI help and report metadata.
- **Pass condition:** All correctly state that no audit artifact is uploaded by default and can locate the opt-in warning.
- **Fail condition:** Any user believes data is silently uploaded or misunderstands consent.
- **Next decision if it fails:** Add an execution-time privacy summary and require confirmation before every external adapter invocation.

### T4 — Transparent scores can aid rather than replace judgment

- **What could go wrong:** Priority and release-risk numbers may appear scientifically objective or override context.
- **Control:** Show formulas, inputs, confidence, thresholds, limitations, and human-review states in every report.
- **Risk:** Medium.
- **Current evidence:** Transparent formulas improve auditability, but labels can still anchor decisions.
- **Cheapest validation experiment:** Ask PM-engineer pairs to reconstruct a verdict and identify when they would override it.
- **Pass condition:** Four of five pairs correctly reconstruct the verdict and describe at least one legitimate override.
- **Fail condition:** Users treat the score as a compliance grade or cannot explain its inputs.
- **Next decision if it fails:** Replace the aggregate score at the top level with threshold reasons and show numbers only in details.
