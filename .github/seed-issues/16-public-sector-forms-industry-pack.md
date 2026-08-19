# Title

Add a public-sector forms industry context

## Problem

Long, high-stakes forms have recovery, accessibility, privacy, and submission risks not represented by the current industry contexts.

## Motivation

An industry pack can make safe boundaries and manual review explicit without claiming regulatory compliance.

## Scope

Add recommended personas, review-only journeys, evidence focus, sensitive-data policy, and high-impact submission boundaries.

## Target files

- `packs/industry/public-sector-forms.yaml`
- `docs/pack-author-guide.md`
- `tests/packs/packs.test.ts`

## Acceptance criteria

- No compliance, legal, eligibility, or service-access claim.
- Pack recommends synthetic data and stops before submission.
- Accessibility and plain-language review remain manual responsibilities.

## Test requirements

Pack validation, compatibility, and author-attribution tests.

## Labels

`pack:heuristic`, `documentation`

## Difficulty

Intermediate; product and safety judgment.

## Mentoring notes

The final label should be changed to a future `pack:industry` label when maintainers add it; use the available pack label meanwhile.

## Non-goals

Government endorsement, legal advice, form submission, identity verification, or jurisdiction-specific certification.
