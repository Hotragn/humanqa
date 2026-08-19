# Title

Add an editor-validating persona pack example

## Problem

The JSON schema exists, but the author guide does not show how an editor can associate a YAML pack with it.

## Motivation

Immediate schema feedback reduces contribution friction and invalid pull requests.

## Scope

Add one complete persona example with a YAML language-server schema comment and document portable editor behavior.

## Target files

- `docs/pack-author-guide.md`
- `packs/personas/first-time-saas-user.yaml`
- `tests/packs/packs.test.ts`

## Acceptance criteria

- The schema association points to a repository-relative or published-safe location.
- CLI pack validation still passes.
- Documentation does not require one editor vendor.

## Test requirements

Run pack validation and the pack test suite.

## Labels

`good first issue`, `mentor available`, `pack:persona`, `documentation`

## Difficulty

Beginner.

## Mentoring notes

Discuss whether the schema URI should remain relative before changing all starter files.

## Non-goals

Publishing a schema website, editor extensions, or changing pack semantics.
