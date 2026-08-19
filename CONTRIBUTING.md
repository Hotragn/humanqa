# Contributing to HumanQA

HumanQA welcomes code, packs, fixtures, documentation, accessibility review, product research, and reproducible criticism. The project optimizes for trustworthy evidence and safe defaults, not feature count.

## Before starting

1. Read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md), [SECURITY.md](SECURITY.md), and [docs/safety-and-privacy.md](docs/safety-and-privacy.md).
2. Search issues and Discussions. For a substantial behavior or schema change, open a proposal before implementation.
3. Choose a bounded issue. Seed issues contain scope, files, tests, non-goals, and mentoring notes.
4. Never attach customer data, production traces, screenshots, tokens, private URLs, PRDs, or DOM to a public issue.

## Local setup

```bash
corepack enable
pnpm install
pnpm exec playwright install chromium
pnpm build
pnpm humanqa doctor
```

Run the broken fixture with `pnpm demo` and the fixed fixture with `pnpm --filter @humanqa/demo-dashboard dev:fixed`.

## Required checks

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm test:packs
pnpm test:e2e
```

A new deterministic check needs:

- a bounded rule name and evidence contract;
- a broken fixture that triggers it;
- a fixed fixture that clears it;
- a unit or E2E assertion for both states;
- scoped user-impact wording and limitations;
- confirmation that advisory logic cannot silently gate.

## Package boundaries

- `core`: schemas, types, config, stable IDs, redaction.
- `browser`: execution and artifact collection.
- `accessibility`: axe and keyboard evidence.
- `heuristics`: observable conservative rules.
- `scorer`: transparent formulas and thresholds.
- `reporters`: format-only projections of the report schema.
- `test-generator`: evidence sufficiency and safe code templates.
- `pack-sdk`: data-only validation and attribution.
- `github`: local formatting, no API mutation in v0.1.
- `llm-adapters`: explicit opt-in post-processing, never gate logic.

Avoid dependencies that duplicate platform capabilities or introduce install scripts, telemetry, or remote execution. Explain every new dependency in the pull request.

## Packs

Packs are the lowest-risk contribution path. Read [docs/pack-author-guide.md](docs/pack-author-guide.md), copy the closest starter, keep the definition data-only, and run:

```bash
pnpm humanqa validate-pack packs/<kind>/<file>.yaml
pnpm test:packs
```

Every pack must include honest author attribution, semantic version, v0.1 compatibility, a bounded purpose, fixture relevance, safety boundary, and manual-review caveat where needed.

## Documentation and research

Documentation claims need the same evidence discipline as findings. Do not invent users, stars, performance, security properties, compliance, testimonials, or benchmark results. Mark examples, targets, and hypotheses clearly. Anonymize research notes and record consent.

## Pull requests

Keep changes reviewable. The pull request template asks for the user pain, assumption, evidence, safety/privacy impact, tests, screenshots from the local fixture only, and explicit non-goals. Generated code must not contain unexplained selectors or unsafe actions.

Maintainers may request a smaller change when a pull request crosses package boundaries without evidence. Rejection of scope is not rejection of the underlying problem.

## Mentorship and recognition

Read [docs/mentorship.md](docs/mentorship.md). Issues labeled `mentor available` should name a contact path in the issue discussion, a first checkpoint, and an expected review window. Contributors are credited in pack metadata, release notes, [CONTRIBUTORS.md](CONTRIBUTORS.md), and the recognition plan in [docs/contributor-recognition.md](docs/contributor-recognition.md).

Contributions are accepted under Apache-2.0. By opening a pull request, you represent that you have the right to submit the work under that license.
