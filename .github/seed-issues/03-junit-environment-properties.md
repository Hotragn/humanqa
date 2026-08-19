# Title

Cover JUnit environment and safety properties

## Problem

The JUnit formatter emits core properties, but tests do not lock the browser, viewport, redaction, and offline metadata contract.

## Motivation

CI consumers need stable, inspectable metadata without parsing Markdown.

## Scope

Add the missing non-secret properties and a focused XML test. Do not include URLs, goals, selectors, or artifact contents.

## Target files

- `packages/reporters/src/index.ts`
- `tests/unit/reporters.test.ts`

## Acceptance criteria

- JUnit exposes browser name/version, viewport, safe mode, redaction, screenshots, and offline state.
- XML escaping remains valid.
- Sensitive target data is excluded.

## Test requirements

Parse or inspect the generated XML in a unit test and run reporter coverage.

## Labels

`good first issue`, `mentor available`, `feature`

## Difficulty

Beginner.

## Mentoring notes

Begin from the sample report factory in tests. Keep the change formatter-only.

## Non-goals

JUnit attachments, CI vendor APIs, report uploading, or schema version changes.
