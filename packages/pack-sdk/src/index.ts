import { readdir, readFile, stat } from "node:fs/promises";
import { extname, join, relative } from "node:path";

import { parse } from "yaml";

import {
  formatZodError,
  genericPackSchema,
  journeyPackSchema,
  type JourneyPack,
  type PackMetadata
} from "@humanqa/core";

const humanqaVersion = "0.1.0";
const riskyActionPattern =
  /\b(delete|remove|revoke|purchase|buy now|pay|place order|send|publish|terminate|close account|upload)\b/iu;

export interface ValidatedPack {
  path: string;
  metadata: PackMetadata & { kind: string };
  pack: Record<string, unknown> | JourneyPack;
  warnings: string[];
}

export interface PackValidationFailure {
  path: string;
  errors: string[];
}

export type PackValidationResult =
  { success: true; value: ValidatedPack } | { success: false; failure: PackValidationFailure };

function compatibilityWarning(range: string): string | undefined {
  if (range === ">=0.1.0 <1.0.0" || range === "^0.1.0" || range === humanqaVersion)
    return undefined;
  return `Compatibility “${range}” is not one of the v0.1 supported ranges: ${humanqaVersion}, ^0.1.0, or >=0.1.0 <1.0.0.`;
}

function safetyErrors(journey: JourneyPack): string[] {
  const errors: string[] = [];
  for (const [index, step] of journey.definition.steps.entries()) {
    if (step.action === "click" && step.name && riskyActionPattern.test(step.name)) {
      errors.push(
        `definition.steps.${String(index)}: journey packs may identify a risky control but must not click “${step.name}” in v0.1.`
      );
    }
    if (step.action === "fill" && step.selector?.includes('type="file"')) {
      errors.push(
        `definition.steps.${String(index)}: journey packs may not upload files in the v0.1 data-only action schema.`
      );
    }
  }
  return errors;
}

export async function validatePackFile(path: string): Promise<PackValidationResult> {
  let parsed: unknown;
  try {
    parsed = parse(await readFile(path, "utf8")) as unknown;
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    return { success: false, failure: { path, errors: [`Could not parse YAML: ${detail}`] } };
  }
  if (!parsed || typeof parsed !== "object") {
    return { success: false, failure: { path, errors: ["Pack root must be a YAML object."] } };
  }
  const kind = (parsed as Record<string, unknown>)["kind"];
  const result =
    kind === "journey" ? journeyPackSchema.safeParse(parsed) : genericPackSchema.safeParse(parsed);
  if (!result.success) {
    return {
      success: false,
      failure: { path, errors: formatZodError(result.error).split("\n") }
    };
  }
  const safety = kind === "journey" ? safetyErrors(result.data as JourneyPack) : [];
  if (safety.length > 0) return { success: false, failure: { path, errors: safety } };
  const warning = compatibilityWarning(result.data.compatibility);
  return {
    success: true,
    value: {
      path,
      metadata: {
        kind: result.data.kind,
        id: result.data.id,
        name: result.data.name,
        description: result.data.description,
        author: result.data.author,
        version: result.data.version,
        compatibility: result.data.compatibility,
        tags: result.data.tags
      },
      pack: result.data,
      warnings: warning ? [warning] : []
    }
  };
}

async function yamlFiles(root: string): Promise<string[]> {
  const entries = await readdir(root, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) files.push(...(await yamlFiles(path)));
    if (entry.isFile() && [".yaml", ".yml"].includes(extname(entry.name))) files.push(path);
  }
  return files.sort();
}

export async function validatePackPath(path: string): Promise<{
  valid: ValidatedPack[];
  invalid: PackValidationFailure[];
}> {
  const details = await stat(path).catch(() => undefined);
  if (!details) return { valid: [], invalid: [{ path, errors: ["Path does not exist."] }] };
  const paths = details.isDirectory() ? await yamlFiles(path) : [path];
  const results = await Promise.all(paths.map((file) => validatePackFile(file)));
  return {
    valid: results.filter((result) => result.success).map((result) => result.value),
    invalid: results.filter((result) => !result.success).map((result) => result.failure)
  };
}

export async function listPacks(root: string): Promise<ValidatedPack[]> {
  const result = await validatePackPath(root);
  if (result.invalid.length > 0) {
    const details = result.invalid
      .map((failure) => `${relative(root, failure.path)}: ${failure.errors.join("; ")}`)
      .join("\n");
    throw new Error(`Pack discovery found invalid files:\n${details}`);
  }
  return result.valid;
}
