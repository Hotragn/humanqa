# UX evidence and review boundary

## Definite observations

These can be stated when the named evidence exists: an expected element is absent, a same-origin link returns an error, a request fails, the page overflows the audited viewport, two controls with the same declared `data-action` have different labels, or a declared success target remains hidden after an observable fixture action.

## Advisory observations

Generic CTA patterns, high-impact controls without a pre-activation safeguard, and missing computed focus indicators are advisory. Context may make the pattern appropriate or reveal a safeguard only after an authorized action.

## Unsupported claims

Do not claim that users are confused, delighted, likely to convert, or unable to understand the product. Translate mechanical evidence into a bounded risk: “Users may not know whether the action completed because the declared confirmation did not appear.”

## Review sequence

For each finding, open the linked rule evidence, reproduce the state, verify the target is part of the declared goal, inspect limitations, then decide whether the remediation fits the product context.
