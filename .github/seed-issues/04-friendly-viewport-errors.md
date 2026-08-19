# Title

Improve viewport validation examples in CLI errors

## Problem

Invalid viewport errors explain `WIDTHxHEIGHT` but do not distinguish malformed, too-small, and non-integer values in unit coverage.

## Motivation

CLI setup errors are a first-run conversion risk and an accessible contribution surface.

## Scope

Extract viewport parsing into a testable function, preserve the minimum size policy, and add actionable messages.

## Target files

- `apps/cli/src/bin.ts`
- `tests/unit/cli-options.test.ts`

## Acceptance criteria

- `1440x900` and `390x844` pass.
- malformed, decimal, negative, and too-small values have distinct actionable errors.
- Mobile defaults remain unchanged.

## Test requirements

Add table-driven unit tests and run CLI help smoke tests.

## Labels

`good first issue`, `mentor available`, `documentation`

## Difficulty

Beginner to intermediate because a small export or module extraction is needed.

## Mentoring notes

A mentor can suggest a module boundary that does not execute Commander during import.

## Non-goals

Arbitrary device catalogs, orientation switching, or multi-viewport audit orchestration.
