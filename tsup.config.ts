import { defineConfig, type Options } from "tsup";

const packages = [
  "core",
  "accessibility",
  "heuristics",
  "scorer",
  "reporters",
  "test-generator",
  "pack-sdk",
  "github",
  "llm-adapters",
  "browser"
];

const libraryConfigs: Options[] = packages.map((name) => ({
  entry: [`packages/${name}/src/index.ts`],
  outDir: `packages/${name}/dist`,
  format: ["esm"],
  platform: "node",
  target: "node20",
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  outExtension: () => ({ js: ".js" }),
  external: ["playwright", "@axe-core/playwright", "zod", "yaml", "commander", /^@humanqa\//]
}));

export default defineConfig([
  ...libraryConfigs,
  {
    entry: ["apps/cli/src/bin.ts"],
    outDir: "apps/cli/dist",
    format: ["cjs"],
    platform: "node",
    target: "node20",
    sourcemap: true,
    clean: true,
    splitting: false,
    noExternal: [/^@humanqa\//],
    external: [
      "playwright",
      "playwright-core",
      /^playwright(?:-core)?\//,
      /^chromium-bidi(?:\/|$)/
    ],
    outExtension: () => ({ js: ".cjs" }),
    banner: { js: "#!/usr/bin/env node" }
  }
]);
