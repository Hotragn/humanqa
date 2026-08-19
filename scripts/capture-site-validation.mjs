import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

import { chromium } from "@playwright/test";
import { createServer } from "vite";

const root = resolve(import.meta.dirname, "..");
const siteRoot = resolve(root, "apps", "site");
const outputDirectory = resolve(root, "docs", "validation", "assets");
const baseUrl = "http://127.0.0.1:4176";

await mkdir(outputDirectory, { recursive: true });
const server = await createServer({
  root: siteRoot,
  configFile: resolve(siteRoot, "vite.config.ts"),
  logLevel: "silent",
  server: { host: "127.0.0.1", port: 4176, strictPort: true }
});
await server.listen();

const browser = await chromium.launch({ headless: true });
try {
  const desktop = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce"
  });
  const desktopPage = await desktop.newPage();
  await desktopPage.goto(baseUrl, { waitUntil: "networkidle" });
  await desktopPage.screenshot({
    path: resolve(outputDirectory, "site-desktop.png"),
    fullPage: true
  });
  await desktopPage.goto(`${baseUrl}/docs/`, { waitUntil: "networkidle" });
  await desktopPage.screenshot({
    path: resolve(outputDirectory, "docs-desktop.png"),
    fullPage: true
  });
  await desktop.close();

  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
    reducedMotion: "reduce"
  });
  const mobilePage = await mobile.newPage();
  await mobilePage.goto(baseUrl, { waitUntil: "networkidle" });
  await mobilePage.screenshot({
    path: resolve(outputDirectory, "site-mobile.png"),
    fullPage: true
  });
  await mobile.close();
} finally {
  await browser.close();
  await server.close();
}

console.log(`Validation screenshots: ${outputDirectory}`);
