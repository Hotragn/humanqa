# Title

Distinguish valid modal focus containment from a blocking focus trap

## Problem

Bounded cycle detection can mistake an intentionally contained accessible dialog for a trap when the declared target is outside the modal.

## Motivation

False high-severity keyboard findings would rapidly erode trust among accessibility practitioners.

## Scope

Add good and broken dialog fixtures, declare target context, and downgrade or suppress unsupported trap claims while preserving raw focus evidence.

## Target files

- `packages/accessibility/src/index.ts`
- `apps/demo-dashboard/src/main.ts`
- `tests/e2e/accessibility.test.ts`

## Acceptance criteria

- A correctly labeled modal with focus contained inside it is not called a definite trap.
- An unreachable target required inside the active modal is detected.
- Raw sequence and manual-review scope remain present.

## Test requirements

Add broken/fixed browser coverage and focused unit tests for any extracted classifier.

## Labels

`help wanted`, `accessibility`, `playwright`

## Difficulty

Advanced; requires accessibility semantics and browser-event reasoning.

## Mentoring notes

An accessibility reviewer should approve the fixture and wording before merge.

## Non-goals

Full focus-order correctness, screen-reader automation, or a legal compliance claim.
