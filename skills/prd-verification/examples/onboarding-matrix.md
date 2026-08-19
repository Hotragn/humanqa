# Onboarding evidence-matrix example

## Prompt

> Verify these criteria against the `saas-project-creation` HumanQA report: “User can create a project,” “User sees persistent success confirmation,” and “The flow is intuitive.”

## Output

```json
{
  "contract": "project-creation-complete",
  "matrix": [
    {
      "criterion": "User can create a project",
      "status": "fail",
      "evidence": ["HQ-UX-EXAMPLE1", "artifacts/trace.zip"],
      "explanation": "The explicitly mapped success target was not visible after the local fixture action.",
      "confidence": 0.98
    },
    {
      "criterion": "User sees persistent success confirmation",
      "status": "fail",
      "evidence": ["HQ-UX-EXAMPLE1", "artifacts/screenshots/step-05-assert-visible.png"],
      "explanation": "The declared confirmation remained hidden in the exercised state.",
      "confidence": 0.98
    },
    {
      "criterion": "The flow is intuitive",
      "status": "review",
      "evidence": [],
      "explanation": "Intuitiveness requires human usability evaluation and has no deterministic assertion.",
      "confidence": 0.2
    }
  ],
  "release_effect": "block",
  "limitations": [
    "The matrix covers one local fixture journey.",
    "Subjective criteria remain human decisions."
  ]
}
```
