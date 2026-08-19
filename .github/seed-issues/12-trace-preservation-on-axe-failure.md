# Title

Preserve a valid trace and execution report when axe collection fails

## Problem

An unexpected axe injection or page-context failure can currently abort the run, reducing the evidence available to diagnose the collector failure.

## Motivation

Collection failures should be honest and inspectable rather than erasing already captured browser evidence.

## Scope

Represent accessibility collection failure explicitly, stop short of an automated accessibility pass, and still close trace/browser resources safely.

## Target files

- `packages/accessibility/src/index.ts`
- `packages/browser/src/index.ts`
- `packages/core/src/types.ts`
- `packages/reporters/src/index.ts`
- `tests/e2e/accessibility.test.ts`

## Acceptance criteria

- Trace is readable after a seeded axe failure.
- Report says accessibility scan incomplete and requires review.
- No criterion implying accessibility passes.
- Browser and server processes close.

## Test requirements

Seeded failure E2E, resource-cleanup assertion, and reporter test.

## Labels

`help wanted`, `accessibility`, `playwright`, `bug`

## Difficulty

Advanced; error boundaries across packages.

## Mentoring notes

Design the report state before changing catch blocks. A maintainer should review exit semantics.

## Non-goals

Retry loops, remote axe services, or suppressing real violations.
