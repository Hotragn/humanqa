import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@humanqa/core": `${root}packages/core/src/index.ts`,
      "@humanqa/browser": `${root}packages/browser/src/index.ts`,
      "@humanqa/accessibility": `${root}packages/accessibility/src/index.ts`,
      "@humanqa/heuristics": `${root}packages/heuristics/src/index.ts`,
      "@humanqa/scorer": `${root}packages/scorer/src/index.ts`,
      "@humanqa/reporters": `${root}packages/reporters/src/index.ts`,
      "@humanqa/test-generator": `${root}packages/test-generator/src/index.ts`,
      "@humanqa/pack-sdk": `${root}packages/pack-sdk/src/index.ts`,
      "@humanqa/github": `${root}packages/github/src/index.ts`,
      "@humanqa/llm-adapters": `${root}packages/llm-adapters/src/index.ts`
    }
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    reporters: ["default"],
    coverage: {
      provider: "v8"
    }
  }
});
