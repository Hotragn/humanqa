import { join } from "node:path";

import { writeUtf8, type AuditReport, type Finding } from "@humanqa/core";

export interface GeneratedTest {
  findingId: string;
  path: string;
  code: string;
  reviewNotes: string[];
}

function testTitle(finding: Finding): string {
  return `[${finding.id}] ${finding.title}`.replaceAll("'", "’");
}

function safeString(value: string): string {
  return JSON.stringify(value);
}

function evidenceLocator(finding: Finding): { code: string; reviewNotes: string[] } {
  const metadata = finding.evidence.metadata ?? {};
  const role = typeof metadata["role"] === "string" ? metadata["role"] : undefined;
  const name = typeof metadata["name"] === "string" ? metadata["name"] : undefined;
  const label = typeof metadata["label"] === "string" ? metadata["label"] : undefined;
  const testId = typeof metadata["testId"] === "string" ? metadata["testId"] : undefined;
  if (role && name) {
    return {
      code: `page.getByRole(${safeString(role)} as Parameters<typeof page.getByRole>[0], { name: ${safeString(name)}, exact: true })`,
      reviewNotes: []
    };
  }
  if (label)
    return { code: `page.getByLabel(${safeString(label)}, { exact: true })`, reviewNotes: [] };
  if (testId) return { code: `page.getByTestId(${safeString(testId)})`, reviewNotes: [] };
  if (finding.evidence.selector) {
    return {
      code: `page.locator(${safeString(finding.evidence.selector)})`,
      reviewNotes: [
        `Selector ${finding.evidence.selector} came from captured DOM evidence; replace it with a stable role, label, or test ID if the application exposes one.`
      ]
    };
  }
  throw new Error(`Finding ${finding.id} has no locator evidence suitable for a test scaffold.`);
}

function renderReviewNotes(notes: string[]): string {
  if (notes.length === 0) return "";
  return `${notes.map((note) => `  // Human review required: ${note}`).join("\n")}\n`;
}

function renderFindingTest(
  report: AuditReport,
  finding: Finding
): { code: string; notes: string[] } {
  const baseUrl = safeString(finding.evidence.url || report.project.baseUrl);
  if (finding.category === "safety" || finding.evidence.rule === "safe-action-blocked") {
    throw new Error(
      `Finding ${finding.id} involves a blocked high-impact action and is not safe to generate.`
    );
  }

  if (finding.evidence.rule === "broken-link") {
    const request = finding.evidence.network?.[0];
    if (!request) throw new Error(`Finding ${finding.id} has no request evidence.`);
    const code = `import { expect, test } from "@playwright/test";

test(${safeString(testTitle(finding))}, async ({ request }) => {
  // Finding evidence: ${finding.id}. This performs a read-only HEAD request.
  const response = await request.head(${safeString(request.url)});
  expect(response.status(), "The declared link should resolve successfully").toBeLessThan(400);
});
`;
    return { code, notes: [] };
  }

  if (finding.evidence.rule === "failed-network-request") {
    const request = finding.evidence.network?.[0];
    if (!request) throw new Error(`Finding ${finding.id} has no failed-request evidence.`);
    const notes = [
      "Confirm that the captured request is required by this journey; optional third-party resources should not create a blocking regression test."
    ];
    const code = `import { expect, test } from "@playwright/test";

test(${safeString(testTitle(finding))}, async ({ page }) => {
${renderReviewNotes(notes)}  const matchingFailures: string[] = [];
  page.on("response", (response) => {
    if (response.url() === ${safeString(request.url)} && response.status() >= 400) {
      matchingFailures.push(\`${"${response.status()} ${response.url()}"}\`);
    }
  });
  await page.goto(${baseUrl});
  await page.waitForLoadState("networkidle").catch(() => undefined);
  expect(matchingFailures, "The journey should not receive the captured failed response").toEqual([]);
});
`;
    return { code, notes };
  }

  const locator = evidenceLocator(finding);
  const notes = [...locator.reviewNotes];
  const comments = renderReviewNotes(notes);
  let assertion: string;
  switch (finding.evidence.rule) {
    case "form-control-label-missing":
    case "interactive-name-missing":
      assertion = `await expect(${locator.code}).toHaveAccessibleName(/\\S/u);`;
      break;
    case "responsive-horizontal-overflow":
      assertion = `const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2);\n  expect(hasOverflow, "The page should not overflow the audited viewport").toBe(false);`;
      break;
    case "heading-order-skip":
      assertion = `const levels = await page.locator("h1, h2, h3, h4, h5, h6").evaluateAll((items) => items.map((item) => Number(item.tagName.slice(1))));\n  const hasSkip = levels.some((level, index) => index > 0 && level - (levels[index - 1] ?? level) > 1);\n  expect(hasSkip, "Heading levels should not skip structural levels").toBe(false);`;
      break;
    default:
      assertion = `await expect(${locator.code}).toBeVisible();`;
      notes.push(
        "Verify that visibility is the intended regression assertion; the evidence did not support a more specific non-destructive assertion."
      );
  }

  const code = `import { expect, test } from "@playwright/test";

test(${safeString(testTitle(finding))}, async ({ page }) => {
  // Finding evidence: ${finding.id}; rule: ${finding.evidence.rule}.
${comments}  await page.goto(${baseUrl});
  ${assertion}
});
`;
  return { code, notes };
}

export function generateTestCode(report: AuditReport, findingId?: string): GeneratedTest {
  const finding = findingId
    ? report.findings.find((candidate) => candidate.id === findingId)
    : report.findings.find(
        (candidate) => candidate.regressionCandidate && candidate.source === "deterministic"
      );
  if (!finding) {
    throw new Error(
      findingId
        ? `Finding ${findingId} does not exist in this report.`
        : "No deterministic finding meets the regression-test evidence threshold."
    );
  }
  if (!finding.regressionCandidate) {
    throw new Error(`Finding ${finding.id} is not marked as a regression-test candidate.`);
  }
  const rendered = renderFindingTest(report, finding);
  const fileName = `${finding.id.toLocaleLowerCase()}-${finding.evidence.rule.replace(/[^a-z0-9-]/giu, "-")}.spec.ts`;
  return {
    findingId: finding.id,
    path: join("generated-tests", fileName),
    code: rendered.code,
    reviewNotes: rendered.notes
  };
}

export async function writeGeneratedTest(
  report: AuditReport,
  outputDirectory: string,
  findingId?: string
): Promise<GeneratedTest> {
  const generated = generateTestCode(report, findingId);
  const outputPath = join(outputDirectory, generated.path);
  await writeUtf8(outputPath, generated.code);
  return { ...generated, path: outputPath };
}
