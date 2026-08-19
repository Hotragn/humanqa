# Title

Design useful SARIF locations for browser-only findings

## Problem

Browser findings point to URLs and selectors rather than repository source files, while code-scanning interfaces are optimized for file locations.

## Motivation

Invalid locations can be more confusing than a precise result without a source line.

## Scope

Research SARIF logical and web artifact locations, implement a standards-valid strategy, and document how GitHub renders it using synthetic output.

## Target files

- `packages/reporters/src/index.ts`
- `packages/github/src/index.ts`
- `tests/unit/reporters.test.ts`
- `docs/github-sarif.md`

## Acceptance criteria

- Output validates against SARIF 2.1.0.
- Browser URL and selector context remain available without pretending they are repository lines.
- The strategy degrades clearly in GitHub code scanning.

## Test requirements

Schema validation fixture and formatter unit tests; include one synthetic rendering note.

## Labels

`help wanted`, `integration`, `documentation`

## Difficulty

Advanced; standards research and CI UX.

## Mentoring notes

Share primary SARIF documentation in the issue before implementation and keep claims limited to observed rendering.

## Non-goals

Source-map inference, framework route-to-file mapping, or GitHub API calls.
