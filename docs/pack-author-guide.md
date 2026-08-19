# Community pack author guide

Packs let contributors add quality context without changing TypeScript. They are YAML data validated against the v0.1 schema and credited in reports.

## Choose a pack kind

- `persona`: declared goals, constraints, evidence focus, and cautions without simulating a human.
- `journey`: safe browser actions and explicit assertions.
- `heuristic`: a bounded group of existing deterministic or advisory rule IDs.
- `product-framework`: a transparent interpretation lens such as RICE or acceptance matrices.
- `industry`: recommended packs plus high-impact boundaries for a domain.

## Required metadata

```yaml
kind: persona
id: example-persona
name: Example persona
description: A bounded declared context for one quality job.
author: Your preferred attribution
version: 0.1.0
compatibility: ">=0.1.0 <1.0.0"
tags: [example, context]
definition:
  goals: [Complete the declared fixture task]
```

IDs use lowercase kebab-case. Versions use semantic versioning. Compatibility accepts `0.1.0`, `^0.1.0`, or `>=0.1.0 <1.0.0` in v0.1.

## Journey actions

Supported actions are `goto`, `fill`, `click`, `assert-visible`, `assert-url`, `keyboard-reachable`, `wait`, and `screenshot`. A click uses selector, test ID, or role plus name. A fill uses label or selector. Assertions may map one reviewed acceptance criterion.

Prefer roles, labels, and test IDs. Keep waits bounded. Do not include payment, purchase, deletion, publishing, messaging, upload, permission changes, account mutation, or real-record mutation. Review-only packs should assert the pre-action state and stop.

## Evidence language

State observable goals. Do not encode stereotypes, conversion predictions, emotional claims, or assumed ability. A persona is configuration context, not simulated research. A heuristic mapping is advisory unless a core deterministic rule produces the evidence.

## Validation

```bash
pnpm humanqa validate-pack packs/<kind>/<file>.yaml
pnpm test:packs
```

Add a fixture expectation in `tests/packs/` when introducing a new schema shape or safety boundary. A pack-only pull request must not require a core TypeScript change.

## Review checklist

- Unique ID and useful, accurate description.
- Honest author attribution and license-compatible original text.
- Supported compatibility range.
- Safe, bounded actions using disposable data.
- Explicit assertions with scoped criteria.
- Manual-review boundary where automation is incomplete.
- Fixture or adopter instructions that make the pack testable.
- No secrets, private URLs, customer data, or promotional claims.

Use the appropriate GitHub issue form before a large pack family. Maintainers may decline broadly generic journeys that are harder to adapt than direct Playwright.
