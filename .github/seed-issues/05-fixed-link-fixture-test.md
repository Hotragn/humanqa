# Title

Assert the broken-link rule clears in fixed fixture mode

## Problem

The fixture serves a paired `/broken-link` response, but the E2E expectations should explicitly prove the finding exists in broken mode and clears in fixed mode.

## Motivation

Every definite rule needs a broken/fixed twin to prevent fixture-only one-sided confidence.

## Scope

Add focused E2E assertions for the `broken-link` rule and preserve existing journey behavior.

## Target files

- `apps/demo-dashboard/vite.config.ts`
- `tests/e2e/audit.test.ts`

## Acceptance criteria

- Broken mode produces one stable `broken-link` finding for the local destination.
- Fixed mode produces none.
- No external request is made.

## Test requirements

Run the E2E test twice or use its existing server-mode helper; verify process cleanup.

## Labels

`good first issue`, `mentor available`, `playwright`

## Difficulty

Beginner with Playwright familiarity.

## Mentoring notes

Use rule IDs rather than snapshotting full report prose. A mentor can help with fixture process lifecycle.

## Non-goals

External link crawling, redirect-chain policy, or authenticated link checking.
