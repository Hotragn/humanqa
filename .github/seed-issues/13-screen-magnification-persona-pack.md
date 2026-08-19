# Title

Add a screen-magnification context pack

## Problem

The starter personas cover keyboard and mobile contexts but not a carefully bounded zoom, reflow, and viewport context.

## Motivation

Contributors need a model for accessibility persona packs that avoids stereotypes and false simulation claims.

## Scope

Add one persona pack focused on declared magnification constraints, observable evidence, and manual-review boundaries; connect it to responsive integrity guidance.

## Target files

- `packs/personas/screen-magnification-user.yaml`
- `docs/pack-author-guide.md`
- `tests/packs/packs.test.ts`

## Acceptance criteria

- Pack validates without TypeScript changes.
- Goals and constraints are observable and do not claim to simulate vision.
- Manual testing at browser zoom and assistive magnifier scope is explicit.

## Test requirements

Run pack validation and pack fixture tests.

## Labels

`pack:persona`, `accessibility`, `mentor available`

## Difficulty

Intermediate; domain review matters more than code.

## Mentoring notes

Seek review from a practitioner or lived-experience contributor and credit the review with consent.

## Non-goals

Medical classification, simulated disability, automatic conformance, or changes to the browser engine.
