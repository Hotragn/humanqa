# HumanQA v0.1 release validation

**Validated:** 2026-08-19

**Disposition:** Public repository, Vercel production site, and `humanqa@0.1.0` npm package live

**Scope:** CLI package, deterministic audit vertical slice, starter packs, marketing site, documentation site, release automation, and hosting artifact

## Executive result

The local source and generated artifacts passed the complete `pnpm release:validate` gate. The npm archive contains only the five intended files and reports a working `humanqa 0.1.0` executable. The exact validated archive was published to npm, its registry checksum matches the local artifact, and a clean public-registry install passed version and help-command smoke tests. The website passed desktop, mobile, keyboard, search, responsive-overflow, original-icon-family, and automated accessibility checks in light and dark color schemes.

The validated source is public at `Hotragn/humanqa`, the production website is live at `https://humanqa-nine.vercel.app`, and the package is public at `https://www.npmjs.com/package/humanqa`.

## Gate results

| Gate                  | Observed result                                                         |
| --------------------- | ----------------------------------------------------------------------- |
| Prettier              | Pass, all matched files formatted                                       |
| ESLint                | Pass, zero errors                                                       |
| TypeScript            | Pass, strict no-emit type check                                         |
| Unit tests            | Pass, 26 of 26 across 7 files                                           |
| Pack contracts        | Pass, 3 of 3                                                            |
| Browser E2E           | Pass, 6 of 6 across 2 files                                             |
| Library and CLI build | Pass, 10 internal ESM packages plus bundled CJS CLI                     |
| Demo fixture build    | Pass, Vite 7 production build                                           |
| Website build         | Pass, Vite 8 production build with Sites metadata and worker entrypoint |
| npm archive validator | Pass, status `publish-ready`                                            |
| Public npm smoke test | Pass, clean install plus `--version` and `--help` execution             |

## Behavioral evidence

The end-to-end suite exercised rather than mocked the following paths:

- broken fixture audit: produces `Block release`, score 0/100, and 8 deterministic findings;
- fixed fixture audit: produces `Informational`, score 100/100, and 0 findings;
- generated regression: runs the evidence-derived Playwright test against the fixed fixture;
- public-package self-audit: a clean registry install audited `https://humanqa-nine.vercel.app` in safe, redacted, conservative-inspection mode and produced `Informational`, score 100/100, 0 findings, 0 console errors, and 0 automated Axe violations;
- marketing site: loads real fixture-report imagery, renders at least 18 glyph instances with at least 10 distinct glyph geometries, has no desktop horizontal overflow, and returns zero automated Axe violations;
- documentation site: keyboard focus reaches the skip link first, documentation search filters to the matching section, and light and dark modes return zero automated Axe violations;
- mobile site: navigation expands with correct ARIA state and both main and docs routes remain within a 390 px viewport.

Automated Axe results are bounded evidence, not a claim of complete WCAG conformance. Manual assistive-technology and usability review remain appropriate before a broad public launch.

## npm package inspection

Archive: `release-artifacts/humanqa-0.1.0.tgz`

| Property                                   | Observed value                                                             |
| ------------------------------------------ | -------------------------------------------------------------------------- |
| Package                                    | `humanqa@0.1.0`                                                            |
| Compressed size                            | 1,069,827 bytes                                                            |
| Files                                      | 5                                                                          |
| Contents                                   | `dist/bin.cjs`, `dist/bin.cjs.map`, `LICENSE`, `package.json`, `README.md` |
| Runtime dependencies                       | `playwright@1.55.0` only                                                   |
| Workspace references in published manifest | None                                                                       |
| CLI version check                          | `0.1.0`                                                                    |
| Access                                     | Public                                                                     |
| Registry checksum                          | `ef45c025ebaaa6c6d540782021aa149ba926c8a0`                                 |
| Registry install                           | Pass from a clean scratch directory                                        |
| Provenance                                 | Bootstrap publish local; trusted publisher configured for future releases  |

The archive validator also rejects source trees, `node_modules`, `.env` files, HumanQA output, missing license/readme/bin files, workspace references, unexpected runtime dependencies, archives above 3 MB, and a missing executable shebang.

## Website artifact

The production build contains both routes, hashed assets, the generated Open Graph card, original evidence-glyph icons, actual fixture-report captures, `.openai/hosting.json`, and `dist/server/index.js`. The hosting archive is created from this `dist` tree and checked for both required Sites entries.

Visual evidence:

- [desktop marketing page](assets/site-desktop.png)
- [desktop documentation page](assets/docs-desktop.png)
- [390 px mobile marketing page](assets/site-mobile.png)

## Release automation

- GitHub CI runs formatting, linting, type checking, unit tests, pack tests, and Chromium E2E tests.
- Vercel builds `apps/site` from `main`, with the monorepo root, Vite framework, Node 24 runtime, and `dist` output configured explicitly.
- npm publishing uses Node 24, npm trusted-publisher OIDC permissions, the complete release gate, public access, and provenance. No long-lived npm token is stored in the workflow.
- All internal workspace packages are marked private. Only `apps/cli` is publishable.

## Release handoff

The npm trusted publisher is configured for repository `Hotragn/humanqa`, workflow `publish-npm.yml`, GitHub environment `npm`, and publish-only permission. Future versions should be published through GitHub so npm can attach OIDC provenance; the workflow is idempotent and safely skips a version that is already present.

## Reproduction

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm release:validate
pnpm site:validation-shots
```

The live Vercel deployment and GitHub README were also checked in a signed-in isolated Chromium session: both routes loaded, documentation search and navigation worked, the report image rendered, the original logo and icon rendered in the README, and the page had no horizontal overflow.
