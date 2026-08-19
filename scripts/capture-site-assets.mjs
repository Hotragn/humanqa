import { access, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { chromium } from "@playwright/test";

const root = resolve(import.meta.dirname, "..");
const reportPath = resolve(
  root,
  process.argv[2] ?? "humanqa-output/broken-cli-smoke-20260818-205117/report.html"
);
const outputDirectory = resolve(root, "apps/site/public/media");

await access(reportPath);
await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 960 },
    deviceScaleFactor: 1
  });
  await page.goto(pathToFileURL(reportPath).href, { waitUntil: "load" });
  await page.screenshot({ path: resolve(outputDirectory, "report-evidence.png") });

  const details = page.locator("#findings-title");
  await details.scrollIntoViewIfNeeded();
  await page.screenshot({ path: resolve(outputDirectory, "finding-evidence.png") });
} finally {
  await browser.close();
}

console.log(`Captured real report assets from ${reportPath}`);
