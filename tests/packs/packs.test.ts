import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { listPacks, validatePackFile, validatePackPath } from "@humanqa/pack-sdk";

const root = fileURLToPath(new URL("../..", import.meta.url));
const packRoot = join(root, "packs");

describe("community packs", () => {
  it("validates every starter pack and preserves author attribution", async () => {
    const result = await validatePackPath(packRoot);
    expect(result.invalid).toEqual([]);
    expect(result.valid).toHaveLength(27);
    expect(result.valid.every((pack) => pack.metadata.author.length > 1)).toBe(true);
    expect(result.valid.every((pack) => pack.metadata.version === "0.1.0")).toBe(true);
  });

  it("ships the required starter pack families", async () => {
    const packs = await listPacks(packRoot);
    const count = (kind: string): number =>
      packs.filter((pack) => pack.metadata.kind === kind).length;
    expect(count("persona")).toBe(7);
    expect(count("journey")).toBe(8);
    expect(count("heuristic")).toBe(4);
    expect(count("product-framework")).toBe(4);
    expect(count("industry")).toBe(4);
  });

  it("rejects a journey pack that clicks a known risky control", async () => {
    const directory = await mkdtemp(join(tmpdir(), "humanqa-pack-test-"));
    const path = join(directory, "unsafe.yaml");
    await writeFile(
      path,
      `kind: journey
id: unsafe-purchase
name: Unsafe purchase
description: A deliberately invalid pack used to test the safety validator.
author: HumanQA tests
version: 0.1.0
compatibility: ^0.1.0
tags: [fixture]
definition:
  criticality: 5
  steps:
    - action: click
      role: button
      name: Purchase now
      safe: true
`,
      "utf8"
    );
    const result = await validatePackFile(path);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.failure.errors.join(" ")).toMatch(/must not click/iu);
  });
});
