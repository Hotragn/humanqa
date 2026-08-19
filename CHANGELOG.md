# Changelog

All notable changes to HumanQA are documented here. The format follows Keep a Changelog and the project intends to use semantic versioning.

## [Unreleased]

## [0.1.3] - 2026-08-19

### Security

- Updated Playwright from 1.55.0 to 1.55.1 to address GHSA-7mvr-c777-76hp in the browser-download certificate verification path.
- Added a clean public-registry production audit to the release validation evidence for both published package names.

## [0.1.2] - 2026-08-19

### Added

- Official `@humanqa/cli` organization package built from the same validated CLI bundle as the short `humanqa` package.
- Browser favicon, pinned-tab identity, theme-aware browser chrome colors, and a web-app manifest for the product and documentation routes.

### Changed

- Release validation and trusted publishing now inspect and publish both npm package names without duplicating an existing version.
- The website's test-count proof point now reflects the complete 29-test unit suite.

## [0.1.1] - 2026-08-19

### Added

- `humanqa install-browser`, with optional `--with-deps` support for Linux CI, installs the version-matched Playwright Chromium runtime.
- Focused tests for browser-install arguments, package-local Playwright resolution, and missing-browser recovery guidance.

### Fixed

- Fresh installations now receive a HumanQA-specific recovery command instead of Playwright's generic missing-executable error.
- Release packaging derives the archive name and expected CLI version from `apps/cli/package.json` instead of hard-coded version strings.
- Website, package, repository, and CI documentation now include the required first-use browser setup.

## [0.1.0] - 2026-08-19

### Added

- Discovery evidence, assumption map, validation plan, and decision system.
- v0.1 Proofrun monorepo vertical slice.
- Safe Playwright journey execution, axe and keyboard evidence, deterministic checks, scoring, report formats, and regression scaffolds.
- Broken/fixed fixture, community packs, portable skills, GitHub dry-run formatting, examples, tests, governance, and launch plans.
- Dedicated marketing and documentation website with a bespoke evidence-glyph icon family, responsive light and dark themes, searchable docs, and real fixture report imagery.
- npm publication metadata, isolated public-package contents, provenance-aware trusted-publishing workflow, tarball validator, and Vercel production deployment.
- Website accessibility, keyboard, responsive overflow, icon uniqueness, release metadata, and package-boundary tests.

### Security

- Local-first defaults, common text redaction, screenshot opt-out, offline loopback mode, high-impact action blocking, and explicit external-adapter consent boundary.

[Unreleased]: https://github.com/Hotragn/humanqa/compare/v0.1.3...HEAD
[0.1.3]: https://github.com/Hotragn/humanqa/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/Hotragn/humanqa/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/Hotragn/humanqa/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/Hotragn/humanqa/releases/tag/v0.1.0
