# Weekly release and changelog plan

Use a weekly cadence only while changes justify it. Skip a release rather than manufacturing activity.

## Monday — evidence review

Review trials, issues, false positives, safety concerns, and dependency alerts. Complete the weekly review template and select one evidence-supported outcome plus no more than three changes.

## Tuesday to Wednesday — implementation

Keep fixes narrow. Add broken/fixed fixtures for deterministic behavior and update schemas, migration notes, and examples together.

## Thursday — release candidate

Run a fresh install, all six quality commands, broken and fixed demos, package build, CLI help, skill validation, and artifact privacy inspection. Freeze unrelated merges while a candidate is under review.

## Friday — publish or skip

Update `CHANGELOG.md` with Added, Changed, Fixed, Removed, Security, and Known limitations as applicable. Publish semantic version and checksums/provenance through the reviewed workflow when available. Announce user-visible evidence and limitations, not commit counts.

## Version rules

- Patch: compatible defect, documentation, fixture, or conservative rule correction.
- Minor during `0.x`: new capability or schema field with migration notes; compatibility can still change.
- Major: incompatible public CLI, report, config, pack, or adapter contract after stable release.

## Changelog quality

Every item says who is affected and what observable behavior changed. Credit contributors with consent. Never include secrets, private issue context, fabricated impact, or unsupported security language.
