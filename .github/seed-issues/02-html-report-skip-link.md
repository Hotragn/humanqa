# Title

Add a visible-on-focus skip link to the HTML report

## Problem

The static report has landmarks and headings but no skip link for keyboard users moving past the header.

## Motivation

The report should model the interaction quality HumanQA asks applications to provide.

## Scope

Add a “Skip to findings” link, a stable findings target, visible focus styling, and reporter assertions.

## Target files

- `packages/reporters/src/index.ts`
- `tests/unit/reporters.test.ts`

## Acceptance criteria

- The first focusable report control is a skip link.
- It becomes visually apparent on focus and targets the findings section.
- Empty-finding reports still have a valid destination.

## Test requirements

Assert the link, target, and accessible label in reporter tests; run formatting and typecheck.

## Labels

`good first issue`, `mentor available`, `accessibility`

## Difficulty

Beginner; HTML, CSS, and one unit test.

## Mentoring notes

Use semantic HTML rather than JavaScript. A mentor will help inspect the generated fixture report with Tab.

## Non-goals

Report navigation redesign, a client-side framework, or broad visual restyling.
