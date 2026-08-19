# Fixture release example

## Prompt

> Assess release readiness for the local Northstar fixture using `humanqa.example.yml` and the current broken-mode report.

## Output

```json
{
  "decision": "block-release",
  "scope": [
    "Local Northstar project-creation journey",
    "Chromium at 1440x900",
    "Safe mode and redaction enabled"
  ],
  "blocking_evidence": [
    "Acceptance criterion 'User can create a project' failed.",
    "HQ-UX-EXAMPLE1 records missing declared success feedback.",
    "HQ-AX-EXAMPLE2 records an unlabeled project slug control."
  ],
  "owner_actions": [
    {
      "owner": "fixture maintainer",
      "action": "Run the fixed-mode fixture and repeat the same quality contract.",
      "review_date": "2026-08-25"
    }
  ],
  "limitations": [
    "Only the local fixture and declared project-creation journey were exercised.",
    "Manual accessibility and usability review remain required."
  ],
  "manual_review": [
    "Confirm corrected feedback wording and focus order.",
    "Review whether the release scope contains other critical journeys."
  ]
}
```
