import { readFile } from "node:fs/promises";

import { parse } from "yaml";

import { formatZodError, humanqaConfigSchema, journeyPackSchema } from "./schemas";
import type { HumanqaConfig, JourneyPack } from "./types";

export class HumanqaValidationError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "HumanqaValidationError";
  }
}

async function readYaml(path: string): Promise<unknown> {
  let content: string;
  try {
    content = await readFile(path, "utf8");
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new HumanqaValidationError(`Could not read YAML file ${path}: ${detail}`);
  }
  try {
    return parse(content) as unknown;
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new HumanqaValidationError(`Invalid YAML in ${path}: ${detail}`);
  }
}

export async function loadHumanqaConfig(path: string): Promise<HumanqaConfig> {
  const result = humanqaConfigSchema.safeParse(await readYaml(path));
  if (!result.success) {
    throw new HumanqaValidationError(
      `Invalid HumanQA config ${path}:\n${formatZodError(result.error)}`
    );
  }
  return result.data;
}

export async function loadJourneyPack(path: string): Promise<JourneyPack> {
  const result = journeyPackSchema.safeParse(await readYaml(path));
  if (!result.success) {
    throw new HumanqaValidationError(
      `Invalid journey pack ${path}:\n${formatZodError(result.error)}`
    );
  }
  return result.data;
}
