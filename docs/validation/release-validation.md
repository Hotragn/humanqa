# HumanQA v0.1.4 release validation

**Validated:** 2026-08-21

**Release commit:** `c82e961d04c6c3b8187289cbca26cb1e79c49267`

**Disposition:** Public GitHub release, public Vercel site, owner-only Sites deployment, provenance-attested npm packages, and provenance/SBOM-attested GHCR image are live.

## Executive result

HumanQA v0.1.4 passed the complete local and GitHub release gates. Both npm identities were rebuilt from the tagged source, published through npm trusted-publisher OIDC, and verified from the public registry. The release also produced a public self-hosted website image through GitHub's Buildx environment after the image workflow was exercised end to end.

The final source is at [Hotragn/humanqa](https://github.com/Hotragn/humanqa), the public website is [humanqa-oss.vercel.app](https://humanqa-oss.vercel.app/), and the release is [v0.1.4](https://github.com/Hotragn/humanqa/releases/tag/v0.1.4). The former `humanqa-nine.vercel.app` project domain was removed and returns 404.

## Gate results

| Gate                  | Observed result                                                                        |
| --------------------- | -------------------------------------------------------------------------------------- |
| Prettier              | Pass, all matched files formatted                                                      |
| ESLint                | Pass, zero errors                                                                      |
| TypeScript            | Pass, strict no-emit type check                                                        |
| Unit tests            | Pass, 39 of 39 across 9 files                                                          |
| Pack contracts        | Pass, 3 of 3                                                                           |
| Chromium E2E          | Pass, 6 of 6 across 2 files                                                            |
| Standalone contract   | Pass, `Informational`, score 100/100, 0 findings                                       |
| Builds                | Pass for 10 internal ESM packages, bundled CJS CLI, demo, and website                  |
| npm archive validator | Pass for both package identities, status `publish-ready`                               |
| Dependency audit      | Pass, zero known advisories at validation time                                         |
| Code scanning         | Pass, zero open CodeQL alerts                                                          |
| Dependency scanning   | Pass, zero open Dependabot alerts                                                      |
| Public website        | Pass for home, docs, conventional ICO, PNG icon, canonical URL, and current test proof |
| Container publication | Pass with Buildx provenance and SBOM attestations                                      |

GitHub evidence:

- [CI run 32530053386](https://github.com/Hotragn/humanqa/actions/runs/32530053386)
- [CodeQL run 32530053349](https://github.com/Hotragn/humanqa/actions/runs/32530053349)
- [standalone HumanQA run 32530053326](https://github.com/Hotragn/humanqa/actions/runs/32530053326)
- [npm publication run 32530328963](https://github.com/Hotragn/humanqa/actions/runs/32530328963)
- [GHCR image publication run 32530328971](https://github.com/Hotragn/humanqa/actions/runs/32530328971)

## Behavioral evidence

The suite exercised real browser and package boundaries rather than only mocks:

- the broken fixture produces `Block release`, score 0/100, and 8 deterministic findings;
- the fixed fixture produces `Informational`, score 100/100, and 0 findings;
- an evidence-derived Playwright regression runs against the fixed fixture;
- `humanqa init` creates both a self-contained Quality Contract and a validated local smoke journey, including when installed from the public `@humanqa/cli@0.1.4` package;
- `humanqa doctor --json` reports machine-readable diagnostics without treating repository-only starter packs as an npm installation failure;
- mixed-case and percent-encoded secret keys, encoded identity values, duplicate ordinary query parameters, and sensitive DOM input values have regression coverage;
- JUnit environment/safety properties, SARIF version/repository metadata, and HTML report skip-link behavior have reporter coverage;
- a public-registry `@humanqa/cli@0.1.4` audit of the live website returned `Informational`, score 100/100, 0 findings, 0 console errors, 0 network errors, and 0 automated Axe violations.

Automated Axe results are bounded evidence, not a claim of complete WCAG conformance. Manual assistive-technology and usability review remain appropriate before a broad public launch.

## npm package inspection

Archives: `release-artifacts/humanqa-0.1.4.tgz` and `release-artifacts/humanqa-cli-0.1.4.tgz`

| Property           | `humanqa@0.1.4`                            | `@humanqa/cli@0.1.4`                       |
| ------------------ | ------------------------------------------ | ------------------------------------------ |
| Compressed size    | 1,152,664 bytes                            | 1,152,669 bytes                            |
| Files              | 5                                          | 5                                          |
| Runtime dependency | `playwright@1.62.1`                        | `playwright@1.62.1`                        |
| Registry SHA-1     | `1ec3807aa6f31ed323a03af30e11631a86c4a12d` | `a3f411e0ccf6e2b58dcc0f5deb0fb725c384a331` |
| CLI version        | `0.1.4`                                    | `0.1.4`                                    |
| Access             | Public                                     | Public                                     |
| Provenance         | SLSA provenance v1                         | SLSA provenance v1                         |

Each archive contains only `dist/bin.cjs`, `dist/bin.cjs.map`, `LICENSE`, `package.json`, and `README.md`. The validator rejects source trees, `node_modules`, `.env` files, generated HumanQA output, missing license/readme/bin files, workspace references, unexpected runtime dependencies, archives above 3 MB, and a missing executable shebang.

Public-registry validation confirmed both package versions, exercised organization-package initialization and pack validation, and returned zero production vulnerabilities for a clean direct-package install.

## Website and self-hosting artifacts

The production website serves the home and documentation routes, original evidence-glyph family, generated Open Graph asset, SVG/ICO/Apple/192/512 browser identity assets, and web-app manifest. Direct public HTTP checks returned 200 for `/`, `/docs/`, `/favicon.ico`, and `/icon-192.png`; the home page contained the clean canonical URL and current 39-test proof.

Hosting targets:

- Public Vercel production: [humanqa-oss.vercel.app](https://humanqa-oss.vercel.app/)
- Owner-only Sites production: [humanqa-evidence.kumarishil2198.chatgpt.site](https://humanqa-evidence.kumarishil2198.chatgpt.site), saved version 6 from the exact release commit
- Public container: [ghcr.io/hotragn/humanqa-site](https://github.com/users/Hotragn/packages/container/package/humanqa-site)
- Container manifest digest: `sha256:b450355502be0dce0778f61da6128fd096aa3cd7d7d2638a1750f75794f4f0f7`
- Published image tags: `0.1.4`, `0.1`, `latest`, and `sha-c82e961`
- Kubernetes manifests: `deploy/kubernetes/humanqa-site.yaml` parses to one Deployment and one Service

The local Docker daemon was unavailable during this audit, so the successful GitHub Buildx publication is the authoritative image build. It executed the Dockerfile on Linux and produced public provenance and SBOM attestations.

## Release automation

- CI runs dependency audit, formatting, linting, type checking, unit tests, pack tests, and Chromium E2E tests.
- The standalone HumanQA workflow runs on pull requests and `main`, starts the deterministic fixture, executes the same bundled CLI entrypoint shipped to npm, and uploads the evidence bundle with `actions/upload-artifact@v7`.
- npm publication uses Node 24, trusted-publisher OIDC, the complete release gate, public access, and provenance. No long-lived npm token is stored in the workflow.
- The container workflow uses Buildx, GHCR, semantic and SHA tags, maximum provenance, and an SBOM.
- Dependabot groups compatible minor/patch changes while leaving major upgrades for deliberate compatibility work; security updates remain enabled.

## Scale and adoption boundary

The current product is intentionally local-first and stateless: the CLI and reports scale with CI runners, while the documentation website can be replicated behind Kubernetes without introducing an application database or control plane. Capacity triggers and a future hosted-service boundary are documented in `docs/architecture-and-scaling.md`.

Engineering readiness is not adoption evidence. At validation time the repository had zero stars and zero forks, and no independent user outcome had been verified. Clone events are not counted as users. The next product milestone is three observed audits from authorized external testers, followed by fixing repeated friction before expanding scope.

## Reproduction

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm security:audit
pnpm humanqa install-browser
pnpm release:validate
```

For a public-package smoke test:

```bash
npx @humanqa/cli@0.1.4 --version
npx @humanqa/cli@0.1.4 init --name "Registry Smoke" --url https://example.com
npx @humanqa/cli@0.1.4 validate-pack humanqa/journeys/smoke.yaml
```
