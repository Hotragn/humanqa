# Title

Prove local event export excludes sensitive audit fields

## Problem

The CLI's optional JSONL export is intentionally narrow, but no regression test proves URLs, goals, criteria, selectors, and machine identifiers remain absent.

## Motivation

No-silent-analytics and privacy-safe measurement are product promises that need executable coverage.

## Scope

Extract or expose the event serializer, test the allowed key set, and preserve opt-in file behavior.

## Target files

- `apps/cli/src/bin.ts`
- `tests/unit/local-event-export.test.ts`

## Acceptance criteria

- The exact allowed fields are tested.
- Sensitive seeded strings do not appear in JSONL.
- No file is written when the option is absent.

## Test requirements

Use a temporary directory and clean it through the test framework; run typecheck and unit tests.

## Labels

`good first issue`, `mentor available`, `feature`

## Difficulty

Beginner to intermediate.

## Mentoring notes

Keep measurement local and avoid introducing analytics dependencies.

## Non-goals

Network transmission, user tracking, device identifiers, dashboards, or event-schema expansion.
