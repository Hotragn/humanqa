import { execFileSync } from "node:child_process";
import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const manifest = JSON.parse(await readFile(resolve(root, "apps/cli/package.json"), "utf8"));
const archive = resolve(root, `release-artifacts/${manifest.name}-${manifest.version}.tgz`);

await stat(archive);

const npm = process.platform === "win32" ? "npm.cmd" : "npm";
execFileSync(npm, ["publish", archive, "--access", "public", "--provenance"], {
  cwd: root,
  stdio: "inherit"
});
