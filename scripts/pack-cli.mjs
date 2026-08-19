import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(import.meta.dirname, "..");
const outputDirectory = resolve(root, "release-artifacts");
const packageDirectory = resolve(root, "apps", "cli");
const manifest = JSON.parse(await readFile(resolve(packageDirectory, "package.json"), "utf8"));
const archive = resolve(outputDirectory, `${manifest.name}-${manifest.version}.tgz`);
const scopedName = "@humanqa/cli";
const scopedArchive = resolve(outputDirectory, `humanqa-cli-${manifest.version}.tgz`);
const stagingDirectory = resolve(outputDirectory, ".scoped-cli-stage");

await mkdir(outputDirectory, { recursive: true });
await rm(archive, { force: true });
await rm(scopedArchive, { force: true });
await rm(stagingDirectory, { force: true, recursive: true });

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    stdio: "pipe"
  });

  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const pnpmCli = process.env["npm_execpath"];
if (!pnpmCli) {
  throw new Error("Run package creation through `pnpm pack:cli` so the pinned pnpm CLI is used.");
}

run(process.execPath, [
  pnpmCli,
  "--dir",
  packageDirectory,
  "pack",
  "--pack-destination",
  outputDirectory
]);

await mkdir(stagingDirectory, { recursive: true });
run("tar", ["-xf", archive, "-C", stagingDirectory]);

const scopedPackageDirectory = resolve(stagingDirectory, "package");
const scopedManifestPath = resolve(scopedPackageDirectory, "package.json");
const scopedManifest = JSON.parse(await readFile(scopedManifestPath, "utf8"));
scopedManifest.name = scopedName;
await writeFile(scopedManifestPath, `${JSON.stringify(scopedManifest, null, 2)}\n`, "utf8");

run(process.execPath, [
  pnpmCli,
  "--dir",
  scopedPackageDirectory,
  "pack",
  "--pack-destination",
  outputDirectory
]);
await rm(stagingDirectory, { force: true, recursive: true });

console.log(`Package archives:\n- ${archive}\n- ${scopedArchive}`);
