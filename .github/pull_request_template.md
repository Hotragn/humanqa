## User pain and intended outcome

Describe the concrete job this change improves and the smallest observable outcome.

## Assumption and evidence

Name the assumption, issue, fixture failure, user signal, or safety concern that justifies the change.

## Changes

List the affected packages, packs, skills, fixtures, schemas, or docs.

## Safety and privacy

- [ ] No real payments, deletion, publishing, messages, uploads, account changes, or real-record mutations were added.
- [ ] Fixtures and artifacts contain only synthetic data.
- [ ] Redaction, offline, screenshot, and external-adapter behavior was reviewed where relevant.
- [ ] New definite findings include a rule, evidence, scoped impact, confidence, and limitations.

## Verification

- [ ] `pnpm format:check`
- [ ] `pnpm lint`
- [ ] `pnpm typecheck`
- [ ] `pnpm test`
- [ ] `pnpm test:packs`
- [ ] `pnpm test:e2e`

Include exact commands and results. Attach only sanitized local-fixture images.

## Non-goals

State what this pull request deliberately does not solve.

## Compatibility and documentation

Describe schema, CLI, pack, report, or generated-code compatibility and link updated documentation.
