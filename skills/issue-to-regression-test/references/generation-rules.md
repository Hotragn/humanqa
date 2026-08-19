# Regression scaffold sufficiency

A finding qualifies when all are true:

1. It is deterministic and marked as a regression candidate.
2. It contains a named rule and a stable target or request URL.
3. The expected behavior is explicit.
4. Reproduction requires no prohibited high-impact action.
5. Required data is disposable or absent.

Prefer locators in this order: role with accessible name, label, test ID, then captured CSS with a review comment. Prefer direct observable assertions over timeouts. Preserve the finding ID in a comment. Omit unsafe steps rather than commenting them into executable code.

Return `needs-evidence` if the setup, target, or expected behavior is missing. Return `blocked-unsafe` if the defect can only be reproduced through a high-impact action.
