import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const root = fileURLToPath(new URL("../..", import.meta.url));

async function json(path: string): Promise<Record<string, unknown>> {
  return JSON.parse(await readFile(join(root, path), "utf8")) as Record<string, unknown>;
}

describe("release metadata", () => {
  it("publishes one standalone CLI under its direct and organization names", async () => {
    const manifest = await json("apps/cli/package.json");
    expect(manifest["name"]).toBe("humanqa");
    expect(manifest["private"]).not.toBe(true);
    expect(manifest["bin"]).toEqual({ humanqa: "./dist/bin.cjs" });
    expect(manifest["files"]).toEqual(["dist", "README.md", "LICENSE"]);
    expect(manifest["dependencies"]).toEqual({ playwright: "1.62.1" });
    expect(JSON.stringify(manifest["devDependencies"])).toContain("workspace:*");
    expect(manifest["publishConfig"]).toEqual({ access: "public", provenance: true });

    const packer = await readFile(join(root, "scripts/pack-cli.mjs"), "utf8");
    expect(packer).toContain('const scopedName = "@humanqa/cli"');
  });

  it("protects every bundled internal package from accidental publication", async () => {
    for (const name of [
      "accessibility",
      "browser",
      "core",
      "github",
      "heuristics",
      "llm-adapters",
      "pack-sdk",
      "reporters",
      "scorer",
      "test-generator"
    ]) {
      const manifest = await json(`packages/${name}/package.json`);
      expect(manifest["private"], `${name} must remain internal`).toBe(true);
    }
  });

  it("keeps website and npm deployments explicit and provenance-aware", async () => {
    const vercel = await json("apps/site/vercel.json");
    const npm = await readFile(join(root, ".github/workflows/publish-npm.yml"), "utf8");
    const publisher = await readFile(join(root, "scripts/publish-release.mjs"), "utf8");
    const rootManifest = await json("package.json");
    const scripts = rootManifest["scripts"] as Record<string, string>;
    expect(vercel["framework"]).toBe("vite");
    expect(vercel["buildCommand"]).toBe("pnpm build");
    expect(vercel["outputDirectory"]).toBe("dist");
    expect(npm).toContain("id-token: write");
    expect(npm).toContain("pnpm release:validate");
    expect(npm).toContain("pnpm release:publish");
    expect(scripts["release:publish"]).toBe("node scripts/publish-release.mjs");
    expect(publisher).toContain('name: "@humanqa/cli"');
    expect(publisher).toContain('"--provenance"');
  });
});
