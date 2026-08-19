# Release decision policy

- **block-release:** A mapped acceptance criterion fails, critical threshold is exceeded, safe execution is impossible for a required contract, or the quality score is materially below the configured threshold.
- **fix-before-launch:** High-confidence high-severity deterministic evidence exists or a declared threshold is narrowly missed without a critical contract failure.
- **conditional-go:** No automatic block remains, but named owner actions or monitoring conditions are required.
- **go-automated-scope:** All configured automated contracts pass in the exercised environment; manual and untested scope remain explicit.
- **insufficient-evidence:** Required contract, environment, or evidence is missing.
- **hold-for-review:** Collection failed or evidence conflicts in a way that an accountable reviewer must resolve.

Scores support these decisions but do not override explicit criterion failures. Human overrides append to the evidence record; they do not delete findings.
