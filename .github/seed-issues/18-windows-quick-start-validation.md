# Title

Validate and document the Windows PowerShell quick start

## Problem

PowerShell execution policy can block `pnpm.ps1`, and process-backgrounding behavior differs from Unix examples.

## Motivation

A cross-platform local-first CLI should have an evidence-backed Windows path rather than a speculative note.

## Scope

Run the full fixture and audit flow on a clean Windows environment, document `pnpm.cmd` and two-terminal usage, and record only reproducible issues.

## Target files

- `README.md`
- `docs/windows.md`
- `docs/discovery/feedback-log-template.md`

## Acceptance criteria

- Commands work without weakening machine-wide execution policy.
- Browser installation and paths are clear.
- The guide distinguishes PowerShell, Command Prompt, and WSL only where tested.

## Test requirements

Record Node, pnpm, Windows, and browser versions; run all six quality commands and sanitize paths in shared notes.

## Labels

`documentation`, `help wanted`

## Difficulty

Intermediate because it requires a Windows environment and full validation.

## Mentoring notes

Do not publish usernames or home-directory paths from terminal output.

## Non-goals

Changing system execution policy, supporting end-of-life Windows releases, or creating an installer.
