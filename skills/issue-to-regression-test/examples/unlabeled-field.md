# Unlabeled-field scaffold example

## Prompt

> Generate a regression scaffold from the HumanQA finding for the unlabeled `#project-slug` control.

## Output

```json
{
  "status": "generated",
  "finding_id": "HQ-AX-EXAMPLE2",
  "output_path": "generated-tests/hq-ax-example2-form-control-label-missing.spec.ts",
  "review_notes": [
    "Replace #project-slug with a label locator after the product exposes the intended accessible label."
  ],
  "omitted_unsafe_steps": []
}
```

```ts
import { expect, test } from "@playwright/test";

test("[HQ-AX-EXAMPLE2] Project slug has an accessible name", async ({ page }) => {
  // Finding evidence: HQ-AX-EXAMPLE2; rule: form-control-label-missing.
  // Human review required: replace captured CSS with the intended label locator after the fix.
  await page.goto("http://127.0.0.1:4173/projects/new");
  await expect(page.locator("#project-slug")).toHaveAccessibleName(/\S/u);
});
```
