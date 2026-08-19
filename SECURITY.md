# Security policy

## Supported versions

Before the first stable release, only the latest commit on `main` and the most recent `0.1.x` release receive security fixes. This policy will be revised when multiple supported release lines exist.

## Report a vulnerability privately

Use GitHub's **Report a vulnerability** private security-advisory form for this repository. Include:

- affected version or commit;
- threat model and realistic impact;
- minimal reproduction using synthetic data;
- whether the problem could expose artifacts, secrets, browser state, or enable unsafe actions;
- suggested mitigation if known.

Do not open a public issue for a vulnerability and do not attach real credentials, customer artifacts, private URLs, screenshots, traces, DOM, or personal data. Maintainers will acknowledge a report when it is reviewed, coordinate scope and remediation, and credit the reporter if requested. No fixed response-time promise is made before a funded security program exists.

## Security boundaries

HumanQA is a local developer tool, not a security scanner, sandbox, authorization system, compliance product, or guarantee that a target is safe for autonomous interaction. Safe mode reduces common browser-action risk but cannot understand every domain action. Packs are data-only and validated, but users must still review third-party journeys before execution.

Redaction uses common patterns and does not guarantee removal of domain-specific identifiers or text rendered in screenshots. Prefer disposable fixture data, no-screenshot mode, and isolated test accounts. External adapters are disabled by default and require explicit consent.

## Dependency and release hygiene

CI runs type, unit, pack, and browser checks. Releases should use lockfile-pinned dependencies, provenance where the registry supports it, reviewed package contents, and a changelog. These practices reduce risk but are not a security certification.
