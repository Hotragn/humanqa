# Title

Test that generated scaffolds prefer test IDs over captured CSS

## Problem

The generator supports role, label, test ID, and CSS metadata, but its precedence needs explicit unit coverage.

## Motivation

Stable generated locators are central to whether scaffolds save time or create maintenance cost.

## Scope

Add report fixtures containing both test ID and CSS evidence, assert the emitted locator, and retain a review note only when CSS is necessary.

## Target files

- `packages/test-generator/src/index.ts`
- `tests/unit/test-generator.test.ts`

## Acceptance criteria

- Role/name wins first, followed by label, test ID, then CSS.
- CSS output contains a human-review note.
- High-impact findings remain rejected.

## Test requirements

Add complete code-structure tests and run typecheck.

## Labels

`good first issue`, `mentor available`, `playwright`

## Difficulty

Beginner.

## Mentoring notes

Work through one precedence case at a time. Avoid snapshots that hide the important locator assertion.

## Non-goals

Repository-aware page objects, model-generated selectors, or automatic test commits.
