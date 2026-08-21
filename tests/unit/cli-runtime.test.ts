import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  browserInstallArguments,
  formatCliError,
  humanqaPackageVersion,
  playwrightCliPath
} from "../../apps/cli/src/runtime.js";

const root = fileURLToPath(new URL("../..", import.meta.url));

describe("CLI browser runtime", () => {
  it("uses the package-local Playwright CLI and installs only Chromium", () => {
    expect(playwrightCliPath(join(root, "apps/cli/src/bin.ts"))).toMatch(
      /playwright[\\/]cli\.js$/u
    );
    expect(browserInstallArguments(false)).toEqual(["install", "chromium"]);
    expect(browserInstallArguments(true)).toEqual(["install", "--with-deps", "chromium"]);
  });

  it("reads the CLI version from package metadata instead of a source constant", () => {
    expect(humanqaPackageVersion(join(root, "apps/cli/src/bin.ts"))).toBe("0.1.4");
  });

  it("turns Playwright's missing executable error into a HumanQA recovery command", () => {
    const error = new Error(
      "browserType.launch: Executable doesn't exist at /tmp/chromium\\nPlease run npx playwright install"
    );
    expect(formatCliError(error)).toBe(
      'Chromium is not installed. Run "npx humanqa install-browser" and retry.'
    );
  });

  it("preserves unrelated errors", () => {
    expect(formatCliError(new Error("Target refused the connection"))).toBe(
      "Target refused the connection"
    );
  });
});
