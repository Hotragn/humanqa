import { access } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

import { writeUtf8 } from "@humanqa/core";

const starterJourneyRelativePath = "humanqa/journeys/smoke.yaml";

function yamlString(value: string): string {
  return JSON.stringify(value);
}

function starterConfig(projectName: string, baseUrl: string): string {
  return `project:
  name: ${yamlString(projectName)}
  baseUrl: ${yamlString(baseUrl)}

defaults:
  safeMode: true
  redact: true
  screenshots: true
  browser: chromium
  offline: false
  viewport:
    width: 1440
    height: 900
  mobile: false

quality_contracts:
  - id: application-smoke
    name: Primary application surface loads safely
    journey: ${starterJourneyRelativePath}
    acceptance_criteria:
      - Application document is visible
    thresholds:
      max_duration_seconds: 120
      max_critical_findings: 0
      min_quality_score: 80
`;
}

const starterJourney = `kind: journey
id: application-smoke
name: Application smoke journey
description: Open the primary application surface and collect a safe baseline evidence bundle.
author: HumanQA init
version: 0.1.0
compatibility: ">=0.1.0 <1.0.0"
tags: [smoke, starter, safe]
definition:
  criticality: 4
  steps:
    - action: goto
      path: /
      description: Open the primary application route
    - action: assert-visible
      selector: body
      criterion: Application document is visible
      rule: application-document-missing
      description: Verify the application rendered a visible document
    - action: screenshot
      name: application-overview
      description: Capture the initial application state for local review
`;

async function exists(path: string): Promise<boolean> {
  return access(path).then(
    () => true,
    () => false
  );
}

export async function initializeHumanqaProject(options: {
  configPath: string;
  projectName: string;
  baseUrl: string;
  force: boolean;
}): Promise<{ configPath: string; journeyPath: string }> {
  const configPath = resolve(options.configPath);
  const journeyPath = join(dirname(configPath), ...starterJourneyRelativePath.split("/"));

  let normalizedUrl: string;
  try {
    normalizedUrl = new URL(options.baseUrl).toString();
  } catch {
    throw new Error(`Invalid project URL “${options.baseUrl}”. Use an absolute http(s) URL.`);
  }
  if (!normalizedUrl.startsWith("http://") && !normalizedUrl.startsWith("https://")) {
    throw new Error(`Invalid project URL “${options.baseUrl}”. Use an absolute http(s) URL.`);
  }

  const occupied = (await Promise.all([configPath, journeyPath].map(exists))).flatMap(
    (present, index) => (present ? [[configPath, journeyPath][index] as string] : [])
  );
  if (occupied.length > 0 && !options.force) {
    throw new Error(
      `${occupied.join(", ")} already ${occupied.length === 1 ? "exists" : "exist"}. Use --force only after reviewing the current files.`
    );
  }

  await writeUtf8(journeyPath, starterJourney);
  await writeUtf8(configPath, starterConfig(options.projectName, normalizedUrl));
  return { configPath, journeyPath };
}
