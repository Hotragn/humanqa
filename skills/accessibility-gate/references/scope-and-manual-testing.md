# Accessibility scope statement

Use this statement in every gate:

> Automated axe and bounded keyboard checks cover only the rendered states, routes, browser, and viewport exercised by this run. They do not prove WCAG conformance, legal compliance, screen-reader usability, cognitive accessibility, or the absence of barriers in untested states. Manual testing is required.

## Gate rules

- `block`: a declared critical threshold is exceeded or a required keyboard target is not reached with deterministic evidence.
- `fix-before-launch`: high-impact automated violations exist but the configured contract does not block.
- `pass-automated-scope`: all configured automated thresholds pass; manual review remains required.
- `review`: collection failed, required states were not exercised, or evidence is contradictory.
