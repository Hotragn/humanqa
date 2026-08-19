---
name: release-readiness
description: Combine a reviewed release scope, HumanQA quality contract, and staging evidence into a transparent release-risk decision. Use for go/no-go preparation; do not replace accountable human release ownership.
---

# Release readiness

Explain a release decision from declared thresholds and linked evidence, keeping unknowns and human overrides visible.

## Inputs

Require the release scope, a version-controlled quality contract, an authorized staging or local URL, and ownership for unresolved risks. Prefer existing HumanQA reports when rerunning the target is unnecessary or unsafe.

## Workflow

1. Confirm scope, environment, safe-mode policy, artifact sensitivity, and the exact contracts that apply.
2. Run `humanqa verify --config humanqa.yml` or validate supplied reports.
3. Preserve deterministic risk, acceptance states, thresholds, advisory observations, and collection failures separately.
4. Apply the decision rules in [references/decision-policy.md](references/decision-policy.md). Do not count advisory or AI-assisted observations as automatic blockers.
5. Return [schemas/release-decision.schema.json](schemas/release-decision.schema.json) with evidence, limitations, owner actions, and any explicit human override.

## Evidence and confidence

Every blocking reason must link to a failed criterion, threshold, finding ID, or execution failure. State score formulas and assumptions. Confidence falls when scope is partial, artifacts are stale, or states are untested. A human override must name the accountable owner, rationale, expiry or review date, and monitoring action.

## Safety and privacy

Do not expand the audit into production mutations. Never post comments, create issues, or send artifacts externally unless the user separately authorizes that action. Use GitHub formatting only in dry-run for v0.1. Keep PRDs, reports, URLs, and evidence local by default.

## Failure modes

- Missing or invalid contract: decision `insufficient-evidence`.
- Browser collection failure on a critical contract: decision `hold-for-review`.
- Stale or mismatched environment evidence: decision `hold-for-review`.
- Conflicting scores and criteria: criteria and declared thresholds take precedence; explain the conflict.

## Human review is mandatory for

Final release ownership, risk acceptance, scope completeness, production rollout strategy, legal/compliance implications, security posture, accessibility manual testing, and any override.

## Example

See [examples/fixture-release.md](examples/fixture-release.md). HumanQA JSON is the normalized source; Markdown/HTML support review; SARIF/JUnit support CI; dry-run GitHub output supports pull-request discussion.
