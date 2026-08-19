# Acceptance-criterion mapping rules

## Pass

A criterion passes only when it has one or more explicitly reviewed deterministic assertions and every mapped assertion passed in the exercised state. The explanation must name the environment and journey.

## Fail

A criterion fails when a mapped deterministic assertion fails. Link the HumanQA finding ID or action evidence that demonstrates the mismatch.

## Review

Use review for subjective wording, incomplete mapping, unsafe actions, inaccessible environments, legal claims, cross-session behavior not exercised, or conflicting evidence. Review is a valid outcome and must not reduce the overall finding count.

## Wording guardrail

Report “passed in the exercised state” rather than “works.” Report “no critical automated violation was detected in the exercised state” rather than “is WCAG compliant.”
