# Title

Design a deterministic desktop-and-mobile contract run

## Problem

HumanQA can configure desktop or mobile per run, but a single quality contract cannot yet declare a reviewed viewport matrix.

## Motivation

Responsive clipping should be reproducible across two explicit states without implying an exhaustive device lab.

## Scope

Propose and implement the smallest backward-compatible viewport list, run each state independently, and identify findings by rule plus viewport metadata.

## Target files

- `packages/core/src/schemas.ts`
- `packages/core/src/types.ts`
- `apps/cli/src/bin.ts`
- `packages/reporters/src/index.ts`
- `tests/e2e/audit.test.ts`

## Acceptance criteria

- Existing single-viewport configs remain valid.
- Desktop and mobile evidence are distinguishable without duplicate ambiguity.
- A failure in one configured viewport affects the contract verdict transparently.

## Test requirements

Schema migration tests, scorer/report tests, and broken/fixed E2E coverage.

## Labels

`help wanted`, `playwright`, `feature`

## Difficulty

Advanced; public schema and orchestration change.

## Mentoring notes

Open a short design comment before code. Keep device catalogs and cloud browsers out of scope.

## Non-goals

Pixel diffs, every device size, orientation sweeps, or hosted browser grids.
