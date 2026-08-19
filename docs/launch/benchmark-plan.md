# Honest benchmark plan

## Questions

1. Does HumanQA detect seeded deterministic defects and clear their fixed twins?
2. Are finding IDs and verdicts stable across repeated identical runs?
3. How long does setup and the first audit take on specified hardware?
4. Does a generated scaffold reduce reviewed test-authoring time?
5. What fraction of definite findings do practitioners rate actionable?

## Fixture corpus

Use versioned local fixtures for missing labels, accessible names, success/error/empty/loading feedback, failed requests, console errors, navigation, keyboard cycles, headings, overflow, inconsistent labels, ambiguous CTAs, and high-impact safeguards. Every defect has a fixed twin.

## Measures

- Detection: expected definite rule found in broken mode.
- Clearance: rule absent in fixed mode.
- Stability: identical rule IDs and verdict over five runs.
- Runtime: median and range, with warm/cold state, OS, CPU, memory, Node, Playwright, and browser versions.
- Artifact size: trace, screenshots, JSON, and total output by fixture.
- Actionability: blinded practitioner rating with rationale.
- Generation utility: time from finding to reviewed passing test compared with manual authoring.

## Comparison boundaries

Compare only equivalent tasks. Plain Playwright does not promise HumanQA reporting; axe does not promise journey execution; manual review covers qualities automation cannot. Do not create a single winner score. Report setup, coverage, output, and limitations separately.

## Reproducibility

Publish fixture commit, command, machine profile, raw local results, analysis script, exclusions, and failed runs. Run benchmarks offline where possible. Do not remove outliers without a stated rule. Do not use customer applications.

## Publication threshold

Do not publish performance or accuracy claims until the corpus and method receive external review and runs are independently reproducible. Seeded-fixture detection is not real-world bug recall, and the report must say so prominently.
