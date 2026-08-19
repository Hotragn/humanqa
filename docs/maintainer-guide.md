# Maintainer guide

## Review priorities

Review safety, evidence validity, privacy, and regression risk before API style. Every definite finding needs a named rule and evidence. Every browser action needs an authorization and reversibility story. Every new public claim needs repository or user evidence.

## Triage

1. Remove or privatize accidental sensitive artifacts immediately; follow the security policy.
2. Reproduce bugs against synthetic fixtures.
3. Label the underlying job, not only the suggested solution.
4. Connect roadmap work to an assumption, repeated request, defect frequency, or safety issue.
5. Close unsupported feature requests with a clear evidence threshold for reconsideration.

## Pull-request review

- Confirm package boundary and public-schema impact.
- Require broken/fixed fixture twins for deterministic rules.
- Verify advisory logic cannot change CI verdicts.
- Inspect generated report wording for unsupported claims.
- Review dependency source, license, install behavior, and maintenance burden.
- Run the complete quality suite.
- Record product-direction changes in the decision log.

At least one maintainer reviews core, browser, accessibility, scoring, redaction, workflow, schema, and external-adapter changes. A second review is preferred when the maintainer pool permits it; this is not presented as a guaranteed security control.

## Releases

1. Confirm the lockfile and clean quality suite.
2. Inspect package contents and CLI help.
3. Run broken and fixed fixture demos from a fresh directory.
4. Update changelog, schema compatibility, and migration notes.
5. Tag a semantic version and publish only from a reviewed CI workflow.
6. Announce limitations and known defects with the release.

Do not publish benchmarks, adoption figures, security claims, testimonials, or accessibility compliance claims without source evidence and review.

## Governance

Maintainer status follows sustained, high-quality stewardship across review, community care, safety, and technical work. It is not awarded solely by commit count. Decisions should be reversible where possible and documented when they change product scope or contributor contracts.

## Weekly evidence review

Use `docs/discovery/weekly-review-template.md`. Make no more than three changes per milestone and apply only the smallest evidence-supported adjustment. Compare results with continue, narrow, pivot, and stop thresholds.
