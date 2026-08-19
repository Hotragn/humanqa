# HumanQA v0.1 release validation

**Validated:** 2026-08-18  
**Disposition:** Public repository and Vercel production site live; npm artifact publish-ready and awaiting npm authentication  
**Scope:** CLI package, deterministic audit vertical slice, starter packs, marketing site, documentation site, release automation, and hosting artifact

## Executive result

The local source and generated artifacts passed the complete `pnpm release:validate` gate. The npm archive contains only the five intended files and reports a working `humanqa 0.1.0` executable. The website passed desktop, mobile, keyboard, search, responsive-overflow, original-icon-family, and automated accessibility checks in light and dark color schemes.

The validated source is public at `Hotragn/humanqa`, and the production website is live at `https://humanqa-nine.vercel.app`. The npm package has not been published because the local npm client is not authenticated. npm publication remains an explicit maintainer step.

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

## Behavioral evidence

The end-to-end suite exercised rather than mocked the following paths:

- broken fixture audit: produces `Block release`, score 0/100, and 8 deterministic findings;
- fixed fixture audit: produces `Informational`, score 100/100, and 0 findings;
- generated regression: runs the evidence-derived Playwright test against the fixed fixture;
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
| Provenance                                 | Enabled in manifest and trusted-publishing workflow                        |

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

## External handoff

1. Sign in with `npm login`, reserve `humanqa` with the first release if it is still available, then configure the GitHub Actions trusted publisher for repository `Hotragn/humanqa` and workflow `publish-npm.yml`.
2. Publish through a GitHub release or the manual workflow. Do not bypass `pnpm release:validate`.

Package availability was checked on 2026-08-18 and returned npm `E404`; that is evidence that no package was visible at that moment, not a permanent reservation.

## Reproduction

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm release:validate
pnpm site:validation-shots
```

The local browser-plugin preview path was unavailable because its trusted RPC dependency was outside the configured trusted code path. Visual and interaction validation therefore used the repository's standalone Playwright/Chromium harness. No browser assertion was skipped or weakened because of that integration failure.
