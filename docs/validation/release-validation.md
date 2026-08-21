# HumanQA v0.1.3 release validation

**Validated:** 2026-08-19

**Disposition:** Public repository, Vercel production site, GitHub `v0.1.3` release, and provenance-attested `humanqa@0.1.3` plus `@humanqa/cli@0.1.3` npm packages live

**Scope:** CLI package, deterministic audit vertical slice, starter packs, marketing site, documentation site, release automation, and hosting artifact

## Executive result

The local source and generated artifacts passed the complete `pnpm release:validate` gate. Both npm archives contain only the five intended files and report a working `humanqa 0.1.3` executable. GitHub Actions rebuilt and revalidated the packages, then published both CI archives through npm trusted-publisher OIDC. Independent clean public-registry installs of both package names passed version and zero-vulnerability production-audit checks; the organization package also passed browser installation and a production-site self-audit. The website passed desktop, mobile, keyboard, search, responsive-overflow, browser-identity, original-icon-family, and automated accessibility checks in light and dark color schemes.

The validated source is public at `Hotragn/humanqa`, the production website is live at `https://humanqa-oss.vercel.app`, and the packages are public at `https://www.npmjs.com/package/humanqa` and `https://www.npmjs.com/package/@humanqa/cli`.

## Gate results

| Gate                  | Observed result                                                         |
| --------------------- | ----------------------------------------------------------------------- |
| Prettier              | Pass, all matched files formatted                                       |
| ESLint                | Pass, zero errors                                                       |
| TypeScript            | Pass, strict no-emit type check                                         |
| Unit tests            | Pass, 29 of 29 across 8 files                                           |
| Pack contracts        | Pass, 3 of 3                                                            |
| Browser E2E           | Pass, 6 of 6 across 2 files                                             |
| Library and CLI build | Pass, 10 internal ESM packages plus bundled CJS CLI                     |
| Demo fixture build    | Pass, Vite 7 production build                                           |
| Website build         | Pass, Vite 8 production build with Sites metadata and worker entrypoint |
| npm archive validator | Pass for both package names, status `publish-ready`                     |
| Public npm smoke test | Pass for both names: install, version, zero-vulnerability audit         |

## Behavioral evidence

The end-to-end suite exercised rather than mocked the following paths:

- broken fixture audit: produces `Block release`, score 0/100, and 8 deterministic findings;
- fixed fixture audit: produces `Informational`, score 100/100, and 0 findings;
- generated regression: runs the evidence-derived Playwright test against the fixed fixture;
- first-use browser setup: with an intentionally empty Playwright cache, the CLI emits the exact recovery command, `humanqa install-browser` installs the version-matched Chromium runtime, and the next audit succeeds;
- public-package self-audit: a clean `@humanqa/cli@0.1.3` registry install audited `https://humanqa-oss.vercel.app` in safe, redacted, conservative-inspection mode and produced `Informational`, score 100/100, 0 findings, 0 console errors, and 0 automated Axe violations;
- marketing site: loads real fixture-report imagery, renders at least 18 glyph instances with at least 10 distinct glyph geometries, serves the HumanQA SVG favicon and web-app manifest, has no desktop horizontal overflow, and returns zero automated Axe violations;
- documentation site: keyboard focus reaches the skip link first, documentation search filters to the matching section, and light and dark modes return zero automated Axe violations;
- mobile site: navigation expands with correct ARIA state and both main and docs routes remain within a 390 px viewport.

Automated Axe results are bounded evidence, not a claim of complete WCAG conformance. Manual assistive-technology and usability review remain appropriate before a broad public launch.

## npm package inspection

Archives: `release-artifacts/humanqa-0.1.3.tgz` and `release-artifacts/humanqa-cli-0.1.3.tgz`

| Property                                   | Observed value                                                                         |
| ------------------------------------------ | -------------------------------------------------------------------------------------- |
| Packages                                   | `humanqa@0.1.3`, `@humanqa/cli@0.1.3`                                                  |
| Compressed sizes                           | 1,071,684 bytes; 1,071,683 bytes                                                       |
| Files                                      | 5 in each archive                                                                      |
| Contents                                   | `dist/bin.cjs`, `dist/bin.cjs.map`, `LICENSE`, `package.json`, `README.md`             |
| Runtime dependencies                       | `playwright@1.55.1` only                                                               |
| Workspace references in published manifest | None                                                                                   |
| CLI version check                          | `0.1.3` for both names                                                                 |
| Access                                     | Public                                                                                 |
| Registry checksums                         | `42b1170922723f8a38052da24d5163985f3b1f8c`; `fb1d12c717ffa6fddbb569b60727bdd3fcafa95e` |
| Registry installs                          | Pass from independent clean scratch directories                                        |
| Production dependency audits               | 0 vulnerabilities for both names                                                       |
| Browser bootstrap                          | Pass with package-local Playwright CLI and version-matched Chromium                    |
| Production self-audit                      | `Informational`, score 100/100, 0 findings                                             |
| Provenance                                 | SLSA provenance v1 attestations for both packages from GitHub Actions OIDC             |

The archive validator also rejects source trees, `node_modules`, `.env` files, HumanQA output, missing license/readme/bin files, workspace references, unexpected runtime dependencies, archives above 3 MB, and a missing executable shebang.

## Website artifact

The production build contains both routes, hashed assets, the generated Open Graph card, original evidence-glyph icons, browser favicon, pinned-tab metadata, web-app manifest, actual fixture-report captures, `.openai/hosting.json`, and `dist/server/index.js`. The hosting archive is created from this `dist` tree and checked for both required Sites entries. Public HTTP checks returned 200 for the home page, `/icon.svg`, and `/site.webmanifest`; the manifest identifies `HumanQA` and its maskable SVG icon.

Visual evidence:

- [desktop marketing page](assets/site-desktop.png)
- [desktop documentation page](assets/docs-desktop.png)
- [390 px mobile marketing page](assets/site-mobile.png)

## Release automation

- GitHub CI runs formatting, linting, type checking, unit tests, pack tests, and Chromium E2E tests.
- Vercel builds `apps/site` from `main`, with the monorepo root, Vite framework, Node 24 runtime, and `dist` output configured explicitly.
- npm publishing uses Node 24, npm trusted-publisher OIDC permissions, the complete release gate, public access, and provenance. No long-lived npm token is stored in the workflow.
- All internal workspace packages are marked private. Only the validated `apps/cli` bundle is publishable; release automation gives that same bundle the direct `humanqa` and organization-owned `@humanqa/cli` identities.

## Release handoff

The npm trusted publisher is configured for both package names with repository `Hotragn/humanqa`, workflow `publish-npm.yml`, GitHub environment `npm`, and publish-only permission. Future versions should be published through GitHub so npm can attach OIDC provenance; the workflow is idempotent and safely skips any package version that is already present.

## Registry security audit

The first 0.1.2 public install check surfaced GHSA-7mvr-c777-76hp in `playwright@1.55.0`. Outreach was paused, Playwright and its test package were updated to 1.55.1, the complete gate was rerun, and 0.1.3 was published. Independent `npm audit --omit=dev` runs against clean installs of `humanqa@0.1.3` and `@humanqa/cli@0.1.3` each returned zero vulnerabilities. This is a time-bounded registry result, not a guarantee against future advisories.

## Reproduction

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm humanqa install-browser
pnpm release:validate
pnpm site:validation-shots
```

The live Vercel deployment was checked from the public `@humanqa/cli@0.1.3` package and over direct HTTP: the audit returned score 100/100 with zero findings, both routes and browser-identity assets responded, the organization package link and current test count were present, and the web manifest decoded to the expected HumanQA identity.
