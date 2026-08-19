# HumanQA decision log

Decisions use evidence available at the time. New entries append; old entries are not rewritten to make the path appear inevitable.

## 2026-08-18 — Select Proofrun as the v0.1 wedge

**Decision:** Keep the HumanQA name and build Proofrun: a local, safe CLI for one declared journey that produces deterministic evidence, a release verdict, and a Playwright scaffold.  
**Date:** 2026-08-18  
**Signal:** The concept scorecard ranks the complete evidence loop first, with the accessibility-first Keypath close behind.  
**Evidence:** Proofrun scores 46.75 and connects the most user jobs without requiring hosting or a model. Playwright and axe expose the raw signals needed for a working fixture-backed slice. These are planning assumptions, not user validation.  
**Interpretation:** The broad HumanQA mission is credible only if the repository first proves a narrow, reproducible spine.  
**Chosen action:** Require declared journeys for strong claims; implement local collection, conservative checks, reports, scoring, one generated regression scaffold, and fixed/broken fixture modes.  
**Rejected alternatives:** Autonomous arbitrary-app exploration; GitHub Action-first onboarding; a static report dashboard; automated user-research claims.  
**Metric to watch next:** First-audit success, deterministic finding stability across repeated runs, reviewer actionability, and generated-test adoption.  
**Review date:** After the vertical-slice E2E test passes.

### Milestone review

- **New evidence:** Discovery exposed that reliable product-intent verification requires explicit journey assertions; a goal alone cannot support strong acceptance claims.
- **Direction:** Continue, narrowed to declared journeys.
- **Changes, maximum three:** Use “Proofrun” in the demo; keep autonomous exploration conservative; label unmapped criteria `review`.
- **Smallest adjustment made:** Product positioning now says “declared journey” wherever the strongest promise appears.

## 2026-08-18 — Complete the vertical slice and move to user validation

**Decision:** Treat Proofrun as technically validation-ready, stop expanding v0.1, and test the existing wedge with 10 authorized users before adding product surface area.  
**Date:** 2026-08-18  
**Signal:** The full local quality gate passes, and the packaged CLI produces a reproducible before/after result against the paired fixture.  
**Evidence:** Formatting, linting, strict type checking, 26 unit tests, 3 pack-contract tests, 6 browser E2E tests, the production build, CLI doctor, 27 starter-pack validations, and all 5 bundled skill validations pass. The packaged broken run exits 1 with `Block release`, score 0/100, and 8 named deterministic findings. The packaged fixed run exits 0 with `Informational`, score 100/100, and 0 findings while retaining screenshots, trace, and all five report formats. These are implementation results, not external-user validation.  
**Interpretation:** The evidence pipeline, safety boundary, deterministic gate, reporting fan-out, and regression scaffold are feasible as one coherent local workflow. Desirability, setup friction on real repositories, report comprehension, and sustained adoption remain unproven.  
**Chosen action:** Freeze the v0.1 wedge, recruit 10 target users for concierge “bring one journey” sessions, and use the recorded thresholds in the validation plan to decide whether to continue, narrow to Keypath, or stop.  
**Rejected alternatives:** Adding autonomous crawling, hosted storage, non-dry-run GitHub writes, mandatory AI analysis, more frameworks, or launch claims before external evidence.  
**Metric to watch next:** First-audit success, median setup time, correct verdict comprehension, disputed definite-finding rate, evidence opened, and report or scaffold adoption.  
**Review date:** Immediately after the tenth observed user session or after the two-week validation window, whichever occurs first.

### Milestone review

- **New evidence:** A real packaged smoke run found two contrast defects and an invalid landmark in the “fixed” fixture that the earlier clearing assertion did not cover. HumanQA blocked that state; the fixture and E2E contract were corrected, and the rerun cleared all findings.
- **Direction:** Continue to user validation; do not broaden implementation.
- **Changes, maximum three:** Ship a Windows-safe bundled CommonJS CLI while keeping the Playwright runtime external; exclude advisory observations from automatic gates; make fixed-mode E2E require zero axe violations, zero deterministic findings, and an informational verdict.
- **Smallest adjustment made:** Generated regression tests navigate to the captured finding URL, not an assumed project base, so the scaffold reproduces the observed page.

## Entry template

**Decision:**  
**Date:**  
**Signal:**  
**Evidence:**  
**Interpretation:**  
**Chosen action:**  
**Rejected alternatives:**  
**Metric to watch next:**  
**Review date:**
