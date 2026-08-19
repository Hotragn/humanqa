import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import { auditReportSchema } from "./schemas";
import type { AuditReport } from "./types";

export async function ensureDirectory(path: string): Promise<void> {
  await mkdir(path, { recursive: true });
}

export async function writeUtf8(path: string, content: string): Promise<void> {
  await ensureDirectory(dirname(path));
  await writeFile(path, content, "utf8");
}

export async function readAuditReport(path: string): Promise<AuditReport> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(await readFile(path, "utf8")) as unknown;
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`Could not read report ${path}: ${detail}`);
  }
  const result = auditReportSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(`Invalid HumanQA report ${path}: ${result.error.message}`);
  }
  return parsed as AuditReport;
}

export function timestampSlug(date = new Date()): string {
  return date.toISOString().replace(/[:.]/gu, "-");
}
