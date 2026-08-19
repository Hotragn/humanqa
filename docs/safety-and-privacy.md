# Safety and privacy model

HumanQA operates browsers against systems the user identifies. That power creates product, security, privacy, and organizational risk even when the software is used for testing.

## Default execution boundary

Safe mode is enabled. HumanQA blocks controls whose observable labels indicate purchase, payment, deletion, removal, revocation, publishing, sending, termination, account closure, or upload. Non-loopback form submissions are blocked unless mutation capability is explicitly enabled. Pack validation rejects journeys that directly click known risky controls.

This policy is defense in depth, not a complete semantic authorization system. Domain-specific actions can be harmful without a recognizable label. Review every journey, use a disposable account and seeded data, constrain permissions, and prefer local fixtures.

## Prohibited by default

- purchases, orders, payments, and financial submissions;
- deleting data or closing accounts;
- publishing content or sending messages;
- changing permissions, roles, billing, or account settings;
- modifying real user or customer records;
- uploading private files;
- entering real credentials, secrets, personal identifiers, or payment data.

`--allow-mutations` is an explicit expert override for authorized disposable test systems. It is not proof that an action is safe.

## Local-first artifact handling

Artifacts remain under `humanqa-output/` unless the user separately uploads or copies them. HumanQA has no hidden telemetry. The optional `--event-export` appends a local JSONL record containing only CLI version, coarse duration bucket, outcome category, formats, and pack IDs. It excludes URLs, selectors, DOM, screenshots, goals, criteria, tokens, and machine identifiers and is never transmitted automatically.

## Redaction

Text redaction is enabled by default for common emails, bearer tokens, provider-style keys, passwords, authorization headers, secret assignments, secret-like query parameters, US phone patterns, and Social Security number patterns. Sensitive object keys are replaced during recursive redaction.

Limitations:

- screenshots can contain text or images that pattern matching cannot remove;
- domain-specific customer identifiers may not match a generic pattern;
- DOM context can identify a person even after obvious values are removed;
- traces can preserve request bodies, cookies, application state, and code;
- names and international identifier formats are not reliably distinguishable from ordinary content.

Use `--no-screenshots` for sensitive applications. Use synthetic data. Inspect artifacts before sharing. Delete local output according to the target system's data-handling policy.

## Offline mode

`--offline` accepts only localhost or loopback targets and aborts cross-origin browser requests. It is intended for fixtures and local builds. It does not make a remote URL available without a network, and a page may behave differently when third-party resources are blocked.

## External models

The adapter interface is disabled by default. External enrichment requires configured provider code, explicit consent, and an allowed-field decision. Model output cannot change raw evidence, deterministic severity, confidence, scores, or gates. Adapter failure cannot remove deterministic findings.

Before enabling a provider, document its retention, training, geographic processing, subprocessor, authentication, incident-response, and deletion terms. Do not send screenshots, traces, DOM, URLs, credentials, PRDs, or personal data merely because text redaction is enabled.

## Responsible targeting

Audit only systems you own or have permission to test. Respect rate limits, terms, robots and organizational policies where applicable, staging isolation, and user consent. HumanQA is not a penetration-testing tool and does not authorize access.
