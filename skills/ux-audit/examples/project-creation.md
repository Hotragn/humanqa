# Project-creation example

## Prompt

> Audit `http://127.0.0.1:4173` as `first-time-saas-user`. The goal is to create a disposable project. Use `packs/journeys/saas-project-creation.yaml` and keep safe mode enabled.

## Output

```json
{
  "verdict": "Block release",
  "scope": {
    "goal": "Create a disposable project",
    "persona": "first-time-saas-user",
    "journey": "saas-project-creation",
    "mode": "declared-journey"
  },
  "findings": [
    {
      "finding_id": "HQ-UX-EXAMPLE1",
      "title": "Expected success feedback is not visible",
      "source": "deterministic",
      "severity": "high",
      "confidence": 0.98,
      "evidence_rule": "success-state-missing",
      "evidence_references": [
        "artifacts/screenshots/step-05-assert-visible.png",
        "artifacts/trace.zip"
      ],
      "reproduction": [
        "Open the project creation route.",
        "Enter the disposable project name and slug.",
        "Activate Create project.",
        "Observe that #project-success is not visible."
      ],
      "limitation": "The finding verifies the declared success target and does not measure user comprehension."
    }
  ],
  "limitations": [
    "Only the declared fixture journey was exercised.",
    "Automated evidence does not replace usability research."
  ],
  "human_review": [
    "Confirm that the declared success target matches intended product behavior.",
    "Review the clarity and persistence of the corrected message."
  ]
}
```
