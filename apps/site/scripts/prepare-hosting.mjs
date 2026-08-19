import { copyFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const siteRoot = resolve(import.meta.dirname, "..");
const serverDirectory = resolve(siteRoot, "dist", "server");

await mkdir(serverDirectory, { recursive: true });
await copyFile(resolve(siteRoot, "server", "index.js"), resolve(serverDirectory, "index.js"));
