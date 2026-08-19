# Title

Design read-only ingestion for existing Playwright results

## Problem

Teams with mature Playwright suites may not want to rewrite journeys in YAML, but HumanQA currently owns execution.

## Motivation

Validation may show that HumanQA is more valuable as an evidence and decision layer over existing tests.

## Scope

Design and prototype ingestion of a synthetic Playwright JSON report plus trace references into the HumanQA evidence schema without rerunning or mutating the target.

## Target files

- `packages/browser/` or a new narrowly approved adapter package
- `packages/core/src/types.ts`
- `docs/integrations/playwright-reporter.md`
- `tests/integration/playwright-report.test.ts`

## Acceptance criteria

- Input schema and unsupported fields are explicit.
- Existing evidence is not upgraded into UX claims.
- Missing axe, keyboard, acceptance, or safety evidence remains visible.
- No network service or token is required.

## Test requirements

Synthetic report fixtures, malformed input tests, stable finding identity, and report output tests.

## Labels

`integration`, `playwright`, `help wanted`

## Difficulty

Advanced; architecture and product-positioning impact.

## Mentoring notes

Begin with a design discussion tied to user interview evidence. Do not create a package before boundary approval.

## Non-goals

Importing every reporter format, autonomous criterion mapping, hosted storage, or rewriting existing tests.
