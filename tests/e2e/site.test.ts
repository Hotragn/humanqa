import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "@playwright/test";
import { createServer, type ViteDevServer } from "vite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { runAxeScan } from "@humanqa/accessibility";

const root = fileURLToPath(new URL("../..", import.meta.url));
const siteRoot = join(root, "apps", "site");
const baseUrl = "http://127.0.0.1:4175";
let server: ViteDevServer;

beforeAll(async () => {
  server = await createServer({
    root: siteRoot,
    configFile: join(siteRoot, "vite.config.ts"),
    logLevel: "silent",
    server: { host: "127.0.0.1", port: 4175, strictPort: true }
  });
  await server.listen();
});

afterAll(async () => {
  await server.close();
});

describe.sequential("HumanQA marketing and documentation site", () => {
  it("renders real product evidence and the original glyph family", async () => {
    const browser = await chromium.launch({ headless: true });
    try {
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page = await context.newPage();
      await page.goto(baseUrl, { waitUntil: "networkidle" });

      await expect(page.title()).resolves.toContain("HumanQA");
      await expect(page.getByRole("heading", { level: 1 }).textContent()).resolves.toContain(
        "Know what broke"
      );
      await expect(
        page
          .locator(".hero-proof img")
          .evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth >= 1200)
      ).resolves.toBe(true);

      const glyphs = await page.locator("svg.evidence-icon").evaluateAll((icons) => ({
        count: icons.length,
        unique: new Set(icons.map((icon) => icon.innerHTML)).size
      }));
      expect(glyphs.count).toBeGreaterThanOrEqual(18);
      expect(glyphs.unique).toBeGreaterThanOrEqual(10);

      const text = await page.locator("body").innerText();
      expect(text).not.toMatch(/[—–]/u);
      expect(
        await page.locator("body").evaluate((body) => body.scrollWidth <= window.innerWidth)
      ).toBe(true);

      const axe = await runAxeScan(page, { screenshots: [], journeyCriticality: 5 });
      expect(axe.violations).toHaveLength(0);
    } finally {
      await browser.close();
    }
  });

  it("keeps docs searchable, keyboard reachable, and accessible in both color schemes", async () => {
    const browser = await chromium.launch({ headless: true });
    try {
      const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
      const page = await context.newPage();
      await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
      await page.goto(`${baseUrl}/docs/`, { waitUntil: "networkidle" });

      await page.keyboard.press("Tab");
      expect(await page.locator(":focus").textContent()).toContain("Skip to documentation");

      await page.getByLabel("Search documentation").fill("Redacted");
      await expect(page.locator("[data-search-result]").textContent()).resolves.toContain(
        "1 documentation section found"
      );
      expect(await page.locator("[data-doc-section]:visible").count()).toBe(1);
      await page.getByLabel("Search documentation").fill("");

      const lightAxe = await runAxeScan(page, { screenshots: [], journeyCriticality: 5 });
      expect(lightAxe.violations, JSON.stringify(lightAxe.violations, null, 2)).toHaveLength(0);

      await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
      await page.reload({ waitUntil: "networkidle" });
      const darkAxe = await runAxeScan(page, { screenshots: [], journeyCriticality: 5 });
      expect(darkAxe.violations, JSON.stringify(darkAxe.violations, null, 2)).toHaveLength(0);
    } finally {
      await browser.close();
    }
  });

  it("collapses cleanly for mobile navigation and documentation", async () => {
    const browser = await chromium.launch({ headless: true });
    try {
      const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true
      });
      const page = await context.newPage();
      await page.goto(baseUrl, { waitUntil: "networkidle" });
      const toggle = page.getByRole("button", { name: "Open navigation" });
      await toggle.click();
      expect(await toggle.getAttribute("aria-expanded")).toBe("true");
      await expect(
        page
          .getByRole("navigation", { name: "Primary navigation" })
          .getByRole("link", { name: "Documentation" })
          .isVisible()
      ).resolves.toBe(true);
      expect(
        await page.locator("body").evaluate((body) => body.scrollWidth <= window.innerWidth)
      ).toBe(true);

      await page.goto(`${baseUrl}/docs/`, { waitUntil: "networkidle" });
      expect(
        await page.locator("body").evaluate((body) => body.scrollWidth <= window.innerWidth)
      ).toBe(true);
      await expect(page.getByLabel("Search documentation").isVisible()).resolves.toBe(true);
    } finally {
      await browser.close();
    }
  });
});
