# HumanQA CLI

Evidence-first product quality checks for web applications.

HumanQA runs a declared, safe browser journey and turns the observed state into screenshots, a Playwright trace, deterministic findings, transparent release risk, portable reports, and a reviewed regression-test scaffold.

## Install

```bash
npm install --global humanqa
humanqa doctor
```

The same validated CLI is also available from the HumanQA npm organization:

```bash
npm install --global @humanqa/cli
humanqa doctor
```

Install the version-matched Chromium runtime once:

```bash
humanqa install-browser
```

## First audit

```bash
humanqa init --name "My web application" --url http://127.0.0.1:3000
humanqa verify --config humanqa.yml
```

`init` writes a safe Quality Contract and a validated local journey at `humanqa/journeys/smoke.yaml`. Review and adapt that data-only journey as the product flow evolves; no repository clone is required.

Every run writes JSON, Markdown, standalone HTML, SARIF, and JUnit XML under `humanqa-output/<timestamp>/`.

## Commands

```text
humanqa init
humanqa audit <url>
humanqa verify --config humanqa.yml
humanqa generate-test <report.json>
humanqa list-packs
humanqa validate-pack <path>
humanqa install-browser [--with-deps]
humanqa doctor [--json]
humanqa github comment --report <report.json> --dry-run
```

## Safety defaults

- Safe mode, redaction, and screenshots are enabled by default.
- `--offline` requires a loopback target and blocks cross-origin requests.
- High-impact and mutation-capable actions are blocked unless explicitly enabled.
- No hidden telemetry or automatic artifact upload is included.
- Optional LLM enrichment is disabled and cannot change deterministic gates.

Use `--no-screenshots` for sensitive targets. Text redaction cannot guarantee that domain-specific personal information is removed from visual artifacts or traces.

## Scope

HumanQA makes strong completion claims only for declared journeys. Automated accessibility checks do not establish WCAG conformance, legal compliance, screen-reader usability, or the absence of barriers in untested states.

Project documentation, examples, starter packs, and contribution guidance live at [github.com/Hotragn/humanqa](https://github.com/Hotragn/humanqa).

## License

Apache-2.0
