import { execFileSync } from "node:child_process";
import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const expectedManifest = JSON.parse(await readFile(resolve(root, "apps/cli/package.json"), "utf8"));
const binary = resolve(root, "apps/cli/dist/bin.cjs");
const packages = [
  {
    name: expectedManifest.name,
    archive: resolve(
      root,
      `release-artifacts/${expectedManifest.name}-${expectedManifest.version}.tgz`
    )
  },
  {
    name: "@humanqa/cli",
    archive: resolve(root, `release-artifacts/humanqa-cli-${expectedManifest.version}.tgz`)
  }
];
const validation = [];

for (const releasePackage of packages) {
  const archiveStat = await stat(releasePackage.archive);
  if (archiveStat.size > 3_000_000) {
    throw new Error(`Package archive is unexpectedly large: ${String(archiveStat.size)} bytes.`);
  }

  const listing = execFileSync("tar", ["-tf", releasePackage.archive], { encoding: "utf8" })
    .split(/\r?\n/u)
    .filter(Boolean);

  for (const required of [
    "package/package.json",
    "package/dist/bin.cjs",
    "package/README.md",
    "package/LICENSE"
  ]) {
    if (!listing.includes(required)) throw new Error(`Package is missing ${required}.`);
  }

  for (const forbidden of [".env", "humanqa-output", "node_modules", "src/"]) {
    if (listing.some((entry) => entry.includes(forbidden))) {
      throw new Error(`Package contains forbidden entry matching ${forbidden}.`);
    }
  }

  const packedManifest = JSON.parse(
    execFileSync("tar", ["-xOf", releasePackage.archive, "package/package.json"], {
      encoding: "utf8"
    })
  );
  if (
    packedManifest.name !== releasePackage.name ||
    packedManifest.version !== expectedManifest.version
  ) {
    throw new Error(
      `Packed package identity does not match ${releasePackage.name}@${expectedManifest.version}.`
    );
  }
  if (JSON.stringify(packedManifest).includes("workspace:")) {
    throw new Error("Packed package contains an unresolved workspace dependency.");
  }
  if (Object.keys(packedManifest.dependencies ?? {}).join(",") !== "playwright") {
    throw new Error("Published runtime dependencies must contain only Playwright.");
  }

  validation.push({
    package: `${releasePackage.name}@${expectedManifest.version}`,
    archiveBytes: archiveStat.size,
    files: listing.length,
    runtimeDependencies: Object.keys(packedManifest.dependencies ?? {})
  });
}

const version = execFileSync(process.execPath, [binary, "--version"], {
  cwd: root,
  encoding: "utf8"
}).trim();
if (version !== expectedManifest.version) {
  throw new Error(`Built CLI returned unexpected version ${version}.`);
}

const help = execFileSync(process.execPath, [binary, "--help"], {
  cwd: root,
  encoding: "utf8"
});
if (!help.includes("install-browser")) {
  throw new Error("Built CLI is missing its first-use browser installer command.");
}

const source = await readFile(binary, "utf8");
if (!source.startsWith("#!/usr/bin/env node")) {
  throw new Error("Built CLI is missing its executable shebang.");
}

console.log(
  JSON.stringify(
    {
      packages: validation,
      cliVersion: version,
      status: "publish-ready"
    },
    null,
    2
  )
);
