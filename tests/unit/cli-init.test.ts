import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { initializeHumanqaProject } from "../../apps/cli/src/init.js";
import { loadHumanqaConfig, loadJourneyPack } from "@humanqa/core";

const temporaryRoots: string[] = [];

async function temporaryRoot(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "humanqa-init-"));
  temporaryRoots.push(root);
  return root;
}

afterEach(async () => {
  await Promise.all(
    temporaryRoots.splice(0).map((path) => rm(path, { recursive: true, force: true }))
  );
});

describe("HumanQA project initialization", () => {
  it("creates a self-contained config and validated safe starter journey", async () => {
    const root = await temporaryRoot();
    const initialized = await initializeHumanqaProject({
      configPath: join(root, "humanqa.yml"),
      projectName: "Checkout QA",
      baseUrl: "http://127.0.0.1:3000",
      force: false
    });

    const config = await loadHumanqaConfig(initialized.configPath);
    expect(config.project).toEqual({
      name: "Checkout QA",
      baseUrl: "http://127.0.0.1:3000/"
    });
    expect(config.quality_contracts[0]?.journey).toBe("humanqa/journeys/smoke.yaml");
    const journey = await loadJourneyPack(initialized.journeyPath);
    expect(journey.id).toBe("application-smoke");
    expect(journey.definition.steps.map((step) => step.action)).toEqual([
      "goto",
      "assert-visible",
      "screenshot"
    ]);
  });

  it("preflights every generated file before refusing an overwrite", async () => {
    const root = await temporaryRoot();
    const configPath = join(root, "humanqa.yml");
    const initialized = await initializeHumanqaProject({
      configPath,
      projectName: "First",
      baseUrl: "https://example.test",
      force: false
    });
    await writeFile(initialized.configPath, "user-owned config\n", "utf8");

    await expect(
      initializeHumanqaProject({
        configPath,
        projectName: "Second",
        baseUrl: "https://example.test",
        force: false
      })
    ).rejects.toThrow("already exist");
    await expect(readFile(initialized.configPath, "utf8")).resolves.toBe("user-owned config\n");
  });

  it("rejects non-http targets before creating files", async () => {
    const root = await temporaryRoot();
    const configPath = join(root, "humanqa.yml");
    await expect(
      initializeHumanqaProject({
        configPath,
        projectName: "Unsafe target",
        baseUrl: "file:///etc/passwd",
        force: false
      })
    ).rejects.toThrow("absolute http(s) URL");
    await expect(readFile(configPath, "utf8")).rejects.toThrow();
    expect(dirname(configPath)).toBe(root);
  });
});
