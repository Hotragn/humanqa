import { expect, test } from "@playwright/test";

test("[HQ-AX-EXAMPLE] Project slug has an accessible name", async ({ page }) => {
  // Finding evidence: example of form-control-label-missing.
  // Human review required: confirm the label text matches the product vocabulary.
  await page.goto("http://127.0.0.1:3000/projects/new");
  await expect(page.locator("#project-slug")).toHaveAccessibleName(/\S/u);
});
