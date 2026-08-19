import { mkdir, readFile, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(import.meta.dirname, "..");
const outputDirectory = resolve(root, "release-artifacts");
const packageDirectory = resolve(root, "apps", "cli");
const manifest = JSON.parse(await readFile(resolve(packageDirectory, "package.json"), "utf8"));
const archive = resolve(outputDirectory, `${manifest.name}-${manifest.version}.tgz`);

await mkdir(outputDirectory, { recursive: true });
await rm(archive, { force: true });

const command = `pnpm --dir "${packageDirectory}" pack --pack-destination "${outputDirectory}"`;
const result = spawnSync(command, { cwd: root, encoding: "utf8", shell: true, stdio: "pipe" });

if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);

console.log(`Package archive: ${archive}`);
