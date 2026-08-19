import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";

export function browserInstallArguments(withDependencies: boolean): string[] {
  return ["install", ...(withDependencies ? ["--with-deps"] : []), "chromium"];
}

function runtimeModulePath(): string {
  return typeof __filename === "string"
    ? __filename
    : resolve(process.argv[1] ?? join(process.cwd(), "humanqa-runtime.mjs"));
}

export function playwrightCliPath(fromFile: string = runtimeModulePath()): string {
  const runtimeRequire = createRequire(fromFile);
  return join(dirname(runtimeRequire.resolve("playwright/package.json")), "cli.js");
}

export async function installChromiumBrowser(options: {
  withDependencies: boolean;
}): Promise<void> {
  const args = [playwrightCliPath(), ...browserInstallArguments(options.withDependencies)];
  await new Promise<void>((resolve, reject) => {
    const child = spawn(process.execPath, args, {
      env: process.env,
      stdio: "inherit",
      windowsHide: true
    });
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(
        new Error(
          signal
            ? `Chromium installation stopped after signal ${signal}.`
            : `Chromium installation failed with exit code ${String(code)}.`
        )
      );
    });
  });
}

export function formatCliError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("Executable doesn't exist") && message.includes("playwright install")) {
    return 'Chromium is not installed. Run "npx humanqa install-browser" and retry.';
  }
  return message;
}
