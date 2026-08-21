# Changelog

All notable changes to HumanQA are documented here. The format follows Keep a Changelog and the project intends to use semantic versioning.

## [Unreleased]

## [0.1.4] - 2026-08-21

### Added

- Self-contained `humanqa init` onboarding that creates a Quality Contract and validated local smoke journey, with project name and authorized URL options.
- Machine-readable `humanqa doctor --json` output and warning-level diagnostics for optional repository packs.
- Legacy ICO, Apple touch, and 192/512 PNG browser identity assets alongside the SVG favicon.
- Container and Kubernetes website deployment, release-built GHCR image workflow, architecture capacity triggers, and an evidence-based traction operating plan.
- Weekly Dependabot maintenance for npm and GitHub Actions dependencies.

### Changed

- CLI version metadata is read from the published package manifest and carried into reports, SARIF, and JUnit instead of being duplicated in source.
- JUnit now records non-secret runtime, browser, viewport, redaction, screenshot, offline, and safety settings for CI consumers.
- Public quick starts no longer reference packs that are absent from npm archives.

### Fixed

- Mixed-case and percent-encoded query secrets and personal identifiers are redacted without collapsing duplicate ordinary parameters.
- Standalone HTML reports now provide a visible-on-focus skip link with a valid findings destination, including empty reports.
- SARIF links now point to the canonical public repository.
- The conventional `/favicon.ico` path is served instead of returning 404.
- Repository CLI runs now execute the same bundled entrypoint shipped to npm, avoiding build-tool helper leakage inside Playwright's browser context.
- The GHCR release workflow now uses the Buildx container driver required for provenance and SBOM attestations.

### Security

- Upgraded Playwright, axe-core, Vite, Vitest, esbuild, Zod, YAML, and the TypeScript toolchain to patched releases.
- CI and npm publication now fail on high or critical dependency advisories.

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

[Unreleased]: https://github.com/Hotragn/humanqa/compare/v0.1.4...HEAD
[0.1.4]: https://github.com/Hotragn/humanqa/compare/v0.1.3...v0.1.4
[0.1.3]: https://github.com/Hotragn/humanqa/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/Hotragn/humanqa/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/Hotragn/humanqa/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/Hotragn/humanqa/releases/tag/v0.1.0
