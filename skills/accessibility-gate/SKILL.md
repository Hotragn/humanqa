---
name: accessibility-gate
description: Run or interpret HumanQA axe and keyboard evidence for authorized routes and return a CI-ready accessibility gate. Use for automated release checks with explicit scope; never claim full WCAG or legal compliance.
---

# Accessibility gate

Produce a scoped automated gate from raw axe rule references, declared keyboard checks, and quality-contract thresholds.

## Inputs

Require an authorized URL or route list, viewport configuration, and a threshold policy. Prefer a declared journey for interactive states. Record whether authentication, dialogs, errors, mobile layouts, and dynamic states were exercised.

## Workflow

1. Keep safe mode and redaction enabled. Run a HumanQA journey with `keyboard-only-user` when the route contains critical interaction.
2. Preserve raw axe rule IDs, help URLs, impact, targets, and failure summaries.
3. Preserve the bounded keyboard sequence, target-reached result, cycle evidence, and focus-indicator limitation.
4. Apply only declared deterministic thresholds. Advisory focus-visibility observations cannot block by themselves.
5. Return [schemas/gate.schema.json](schemas/gate.schema.json) and include the scope statement in [references/scope-and-manual-testing.md](references/scope-and-manual-testing.md).

## Safety, privacy, and confidence

Do not activate high-impact controls to reach an accessibility state. Do not upload screenshots, DOM, or traces without explicit consent. Confidence is high for the recorded axe result and target reachability in the exercised state; it is not confidence in overall conformance.

## Failure modes

- axe injection or page execution failure: gate `review`, not pass.
- No keyboard target declared for an interactive journey: gate `review` and request a contract update.
- Cross-origin frames not scanned: list them as untested.
- Flaky focus sequence: preserve the raw sequence and remove the automatic trap claim.

## Human review is mandatory for

Screen-reader behavior, logical focus order, content alternatives, zoom/reflow beyond audited viewports, contrast in all states, cognitive accessibility, touch/gesture alternatives, error recovery, and legal interpretation.

## Examples and artifacts

See [examples/keyboard-gate.md](examples/keyboard-gate.md). `report.json` contains normalized findings and raw axe references; trace and screenshots support reproduction; SARIF and JUnit support CI display.
