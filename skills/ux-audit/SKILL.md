---
name: ux-audit
description: Audit a declared web journey for evidence-backed usability friction using HumanQA artifacts. Use when a user supplies an authorized URL, persona, and goal and needs reproducible UX findings; do not use as a substitute for human user research.
---

# UX audit

Run or inspect a HumanQA journey and report only usability claims supported by captured evidence or a named deterministic rule.

## Inputs

Require an authorized URL, a declared user goal, and either a persona ID or a plain-language context. Prefer a journey pack. If no journey is available, use conservative page inspection and state that goal completion is unknown.

## Workflow

1. Confirm the target and intended actions are non-destructive. Keep HumanQA safe mode, redaction, and local output enabled.
2. Run `humanqa audit <url> --persona <id> --goal <goal> --journey <path>` when a journey exists.
3. Inspect `report.json` and raw evidence references. Do not infer attitudes, comprehension, trust, or preference from automation.
4. Separate deterministic findings from advisory observations. Preserve the HumanQA severity, confidence, evidence, and limitations.
5. Return the schema in [schemas/output.schema.json](schemas/output.schema.json). Read [references/evidence-and-review.md](references/evidence-and-review.md) before interpreting heuristic evidence.

## Evidence and confidence

Every definite finding must include a HumanQA finding ID, rule, reproduction steps, and at least one screenshot, trace, selector, DOM excerpt, network/console record, axe reference, or keyboard record. Never raise severity or confidence without new observable evidence and an explicit rationale. Uncertain language must use `advisory` and request human review.

## Safety and privacy

Do not purchase, pay, delete, publish, message, upload, alter accounts, or modify real records. Never send screenshots, DOM, traces, URLs, secrets, or user data to a model or external service without explicit consent and configuration. Recommend `--no-screenshots --offline` for sensitive local targets. HumanQA redaction is risk reduction, not a guarantee of de-identification.

## Failure modes

- If the page cannot load, report an execution failure with browser evidence; do not write a usability critique.
- If no journey exists, report page-level observations and mark goal completion `review`.
- If evidence is missing or contradictory, omit the definite claim and describe the manual review needed.
- If a requested action is high-impact, stop before activation and report the safety boundary.

## Human review is mandatory for

Comprehension, visual hierarchy quality, emotional response, domain terminology, logical focus order, screen-reader behavior, intentional horizontal regions, and whether a detected pattern materially harms real users.

## Example prompts and outputs

Use the complete fixture example in [examples/project-creation.md](examples/project-creation.md).

## HumanQA artifact contract

Treat `report.json` as the normalized source, `report.html` as a review aid, trace and screenshots as raw evidence, and generated tests as scaffolds requiring review. Do not recalculate the release verdict in this skill.
