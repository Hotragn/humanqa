---
name: issue-to-regression-test
description: Convert a UI issue with sufficient HumanQA evidence into a safe Playwright regression-test scaffold. Use when issue text, reproduction evidence, or a HumanQA report is available; do not generate destructive or unsupported test steps.
---

# Issue to regression test

Generate the smallest maintainable test that proves an evidence-backed defect without reproducing high-impact real-world effects.

## Inputs

Require issue text and, for automatic generation, a HumanQA finding marked `regressionCandidate: true`. Accept screenshots or traces as review aids, not as sufficient execution steps by themselves. Identify the authorized base URL, disposable test data policy, and intended expected behavior.

## Workflow

1. Validate the report and finding ID. Reject advisory-only, AI-only, or evidence-free findings.
2. Apply the sufficiency rubric in [references/generation-rules.md](references/generation-rules.md).
3. Run `humanqa generate-test <report.json> --finding <id>` when the finding qualifies.
4. Prefer role plus accessible name, label, or test ID. If only captured CSS exists, mark it for human review in code.
5. Keep the finding ID and rule in the test. Use non-destructive assertions and disposable fixture values.
6. Return [schemas/scaffold-result.schema.json](schemas/scaffold-result.schema.json) with review notes and omitted unsafe steps.

## Evidence and confidence

Generation confidence reflects whether the finding identifies a stable target, starting state, safe reproduction, and expected result. Never invent selectors, data, credentials, or intermediate actions. Do not raise confidence based on fluent issue prose.

## Safety and privacy

Never generate payment, purchase, deletion, publishing, messaging, upload, account mutation, or real-record modification steps by default. Stop at a review boundary and list the omitted action. Redact secrets and personal data from issue text and code. Keep traces and screenshots local unless explicit sharing consent exists.

## Failure modes

- Insufficient target or expected state: return `needs-evidence` with the missing fields.
- High-impact reproduction: return `blocked-unsafe` and a safe precondition or inspection alternative.
- Brittle selector only: generate only if the user accepts a marked review note.
- Ambiguous issue intent: request a reviewed expected behavior before code generation.

## Human review is mandatory for

Selector stability, fixture data, authentication, environment cleanup, expected behavior, network stubbing, and every marked review note. Generated code is a starting point, not an automatically mergeable change.

## Example

See [examples/unlabeled-field.md](examples/unlabeled-field.md).
