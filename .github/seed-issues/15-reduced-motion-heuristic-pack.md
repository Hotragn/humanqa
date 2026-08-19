# Title

Add a reduced-motion review heuristic pack

## Problem

HumanQA has no starter guidance for motion states, while a naive automated rule could overclaim user harm or intent.

## Motivation

A carefully advisory pack can document observable checks and manual review without adding a weak CI gate.

## Scope

Group evidence for `prefers-reduced-motion`, long-running animation presence, and pause controls as advisory review inputs using existing or separately proposed rules.

## Target files

- `packs/heuristics/reduced-motion-review.yaml`
- `docs/pack-author-guide.md`
- `tests/packs/packs.test.ts`

## Acceptance criteria

- Pack source is advisory.
- It distinguishes preference emulation from human impact.
- Missing core rule IDs are declared as future dependencies rather than invented outputs.

## Test requirements

Pack schema validation and attribution test.

## Labels

`pack:heuristic`, `accessibility`

## Difficulty

Intermediate.

## Mentoring notes

Start with the evidence boundary; implementation of animation detection is not required in the pack pull request.

## Non-goals

Seizure-safety certification, animation quality judgment, or automatic blocking.
