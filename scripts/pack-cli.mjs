import { mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(import.meta.dirname, "..");
const outputDirectory = resolve(root, "release-artifacts");
const archive = resolve(outputDirectory, "humanqa-0.1.0.tgz");

await mkdir(outputDirectory, { recursive: true });
await rm(archive, { force: true });

const packageDirectory = resolve(root, "apps", "cli");
const command = `pnpm --dir "${packageDirectory}" pack --pack-destination "${outputDirectory}"`;
const result = spawnSync(command, { cwd: root, encoding: "utf8", shell: true, stdio: "pipe" });

if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);

console.log(`Package archive: ${archive}`);
