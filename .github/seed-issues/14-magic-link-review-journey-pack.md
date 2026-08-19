# Title

Add a safe magic-link request review journey

## Problem

Passwordless authentication teams need to inspect request-form labels, feedback, and error states without sending real email.

## Motivation

A review-only starter can demonstrate how packs stop before an external side effect.

## Scope

Create a journey that loads a fixture route, fills a reserved `.test` address only in a local fixture, inspects declared pre-submit state, and uses an explicit local simulated action if needed.

## Target files

- `packs/journeys/magic-link-review.yaml`
- `apps/demo-dashboard/src/main.ts`
- `tests/packs/packs.test.ts`

## Acceptance criteria

- No real message is sent.
- The pack validates and states the local fixture requirement.
- Broken/fixed feedback evidence is reproducible.

## Test requirements

Pack validation plus fixture E2E in both modes.

## Labels

`pack:journey`, `playwright`, `mentor available`

## Difficulty

Intermediate.

## Mentoring notes

Review safe-mode classification before adding any click. Use only reserved `.test` addresses.

## Non-goals

Email-provider integration, inbox access, authentication tokens, or production delivery testing.
