# Title

Add a token-free GitLab CI artifact example

## Problem

The repository documents GitHub Actions, but local report formats should work in GitLab CI without an API integration.

## Motivation

A token-free example tests portability while keeping v0.1 integration scope narrow.

## Scope

Add an example `.gitlab-ci.yml` that installs Chromium, starts the fixed fixture, runs a quality contract, retains local artifacts briefly, and consumes JUnit where supported.

## Target files

- `docs/integrations/gitlab-ci.yml`
- `docs/integrations/gitlab.md`
- `README.md`

## Acceptance criteria

- No token, issue, comment, or remote mutation is required.
- Artifact retention and privacy warnings are explicit.
- The example uses fixed fixture mode and a bounded timeout.
- JUnit and HTML paths match actual output.

## Test requirements

Validate YAML syntax and run the commands locally in an equivalent container or document the exact unverified boundary.

## Labels

`integration`, `documentation`

## Difficulty

Intermediate.

## Mentoring notes

Keep this an example, not an official maintained GitLab component, until real users validate demand.

## Non-goals

GitLab API calls, merge-request comments, hosted runners, secrets management, or issue creation.
