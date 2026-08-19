# Title

Test mixed-case and encoded secret query parameters

## Problem

`redactUrl` covers common query-secret names, but the fixture corpus does not prove mixed-case keys and percent-encoded values remain redacted through report serialization.

## Motivation

URL leakage is a high-trust failure. A small table-driven test improves confidence without broadening the redaction promise.

## Scope

Add mixed-case `Access_Token`, encoded email, signature, and ordinary non-secret parameter cases. Correct only demonstrated failures.

## Target files

- `packages/core/src/redaction.ts`
- `tests/unit/redaction.test.ts`

## Acceptance criteria

- Secret-like values are absent from output.
- Ordinary route and pagination parameters remain readable.
- Tests explain that pattern redaction is not de-identification.

## Test requirements

Run `pnpm test -- tests/unit/redaction.test.ts`, typecheck, and the full unit suite.

## Labels

`good first issue`, `mentor available`, `bug`

## Difficulty

Beginner; focused TypeScript and regular-expression tests.

## Mentoring notes

Start with a failing table row. A mentor can review pattern boundaries before implementation.

## Non-goals

Screenshot OCR, universal PII detection, international identity classification, or secret-manager integration.
