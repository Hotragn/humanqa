---
name: prd-verification
description: Map acceptance criteria or a PRD excerpt to explicit HumanQA journey evidence and return pass, fail, or review states. Use for release verification when product intent and an authorized URL or report are available; do not infer that unmapped prose passed.
---

# PRD verification

Build an evidence matrix between reviewed product intent and observed browser states.

## Inputs

Require acceptance criteria or a bounded PRD excerpt, an authorized URL or existing HumanQA report, and a declared journey when execution is needed. Ask for criterion identifiers when available. Treat confidential product text as local data.

## Workflow

1. Normalize each criterion without changing its meaning.
2. Map only explicit journey assertions or deterministic finding rules. Never treat a general screenshot, absence of a failure, or model interpretation as a pass.
3. Run `humanqa verify --config humanqa.yml` when a reviewed quality contract exists.
4. Classify each criterion: `pass` when every explicit deterministic assertion passed, `fail` when one mapped assertion failed, or `review` when evidence is absent, partial, subjective, or unsafe to collect.
5. Return [schemas/evidence-matrix.schema.json](schemas/evidence-matrix.schema.json) after applying [references/mapping-rules.md](references/mapping-rules.md).

## Evidence, confidence, and output

Preserve finding IDs, rule IDs, report paths, and limitations. A pass is scoped to the exercised environment and state. Confidence describes evidence quality, not certainty about all product behavior. Optional AI may suggest candidate mappings only; a human must approve them before they affect status.

## Safety and privacy

Keep execution local, redacted, and safe by default. Do not verify payment, deletion, publishing, messaging, uploads, account changes, or real-record mutations through activation. Mark such criteria `review` with the safe boundary. Do not send PRD text or artifacts externally without explicit consent.

## Failure modes

- Invalid or ambiguous criteria: mark `review` and state the ambiguity.
- Missing journey mapping: mark `review`; never infer `pass`.
- Execution failure: preserve the failure evidence and mark affected criteria `review` or `fail` only when the declared assertion itself failed.
- Changed intended behavior: request contract review rather than weakening the assertion automatically.

## Human review

Human approval is required for semantic mapping, subjective quality, legal/compliance criteria, unsafe states, production data, and any criterion whose pass depends on unexercised paths.

## Examples and artifacts

See [examples/onboarding-matrix.md](examples/onboarding-matrix.md). Use `report.json` for states and finding IDs, trace/screenshots for review, and `humanqa.yml` as the version-controlled intent source.
