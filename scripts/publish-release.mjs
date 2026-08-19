import { spawnSync } from "node:child_process";
import { readFile, stat } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const manifest = JSON.parse(await readFile(resolve(root, "apps/cli/package.json"), "utf8"));
const releasePackages = [
  {
    name: manifest.name,
    archive: resolve(root, `release-artifacts/${manifest.name}-${manifest.version}.tgz`)
  },
  {
    name: "@humanqa/cli",
    archive: resolve(root, `release-artifacts/humanqa-cli-${manifest.version}.tgz`)
  }
];

const npmCli = resolve(dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js");

function npmRun(args, stdio = "inherit") {
  const command = process.platform === "win32" ? process.execPath : "npm";
  const commandArgs = process.platform === "win32" ? [npmCli, ...args] : args;
  return spawnSync(command, commandArgs, {
    cwd: root,
    encoding: "utf8",
    stdio
  });
}

for (const releasePackage of releasePackages) {
  await stat(releasePackage.archive);
  const identity = `${releasePackage.name}@${manifest.version}`;
  const existing = npmRun(["view", identity, "version"], "pipe");
  if (existing.status === 0) {
    console.log(`${identity} is already on npm; skipping duplicate publish.`);
    continue;
  }

  const publish = npmRun(["publish", releasePackage.archive, "--access", "public", "--provenance"]);
  if (publish.error) throw publish.error;
  if (publish.status !== 0) process.exit(publish.status ?? 1);
}
