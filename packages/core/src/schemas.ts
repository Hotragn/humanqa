import { z } from "zod";

import { findingCategories, priorityLabels, severities } from "./types";

const semverPattern = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;

export const packMetadataSchema = z
  .object({
    kind: z.enum(["persona", "journey", "heuristic", "product-framework", "industry"]),
    id: z
      .string()
      .min(3)
      .max(80)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase kebab-case."),
    name: z.string().min(3).max(100),
    description: z.string().min(10).max(500),
    author: z.string().min(2).max(120),
    version: z.string().regex(semverPattern, "Use semantic versioning such as 1.0.0."),
    compatibility: z.string().min(4).max(40),
    tags: z.array(z.string().min(1).max(40)).min(1).max(12)
  })
  .strict();

const gotoStepSchema = z
  .object({
    action: z.literal("goto"),
    path: z.string().min(1),
    description: z.string().min(3).optional()
  })
  .strict();

const clickStepSchema = z
  .object({
    action: z.literal("click"),
    role: z.string().min(1).optional(),
    name: z.string().min(1).optional(),
    selector: z.string().min(1).optional(),
    test_id: z.string().min(1).optional(),
    description: z.string().min(3).optional(),
    safe: z.boolean().optional()
  })
  .strict()
  .superRefine((step, context) => {
    if (!step.selector && !step.test_id && !(step.role && step.name)) {
      context.addIssue({
        code: "custom",
        message: "A click step requires selector, test_id, or role plus name."
      });
    }
  });

const fillStepSchema = z
  .object({
    action: z.literal("fill"),
    label: z.string().min(1).optional(),
    selector: z.string().min(1).optional(),
    value: z.string(),
    description: z.string().min(3).optional(),
    sensitive: z.boolean().optional()
  })
  .strict()
  .superRefine((step, context) => {
    if (!step.label && !step.selector) {
      context.addIssue({ code: "custom", message: "A fill step requires label or selector." });
    }
  });

const assertVisibleStepSchema = z
  .object({
    action: z.literal("assert-visible"),
    text: z.string().min(1).optional(),
    role: z.string().min(1).optional(),
    name: z.string().min(1).optional(),
    selector: z.string().min(1).optional(),
    description: z.string().min(3).optional(),
    criterion: z.string().min(3).optional(),
    rule: z.string().min(3).optional()
  })
  .strict()
  .superRefine((step, context) => {
    if (!step.text && !step.selector && !(step.role && step.name)) {
      context.addIssue({
        code: "custom",
        message: "An assert-visible step requires text, selector, or role plus name."
      });
    }
  });

const assertUrlStepSchema = z
  .object({
    action: z.literal("assert-url"),
    pattern: z.string().min(1),
    description: z.string().min(3).optional(),
    criterion: z.string().min(3).optional()
  })
  .strict();

const keyboardStepSchema = z
  .object({
    action: z.literal("keyboard-reachable"),
    selector: z.string().min(1),
    description: z.string().min(3).optional(),
    criterion: z.string().min(3).optional()
  })
  .strict();

const waitStepSchema = z
  .object({
    action: z.literal("wait"),
    milliseconds: z.number().int().min(0).max(10_000),
    description: z.string().min(3).optional()
  })
  .strict();

const screenshotStepSchema = z
  .object({
    action: z.literal("screenshot"),
    name: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    description: z.string().min(3).optional()
  })
  .strict();

export const journeyStepSchema = z.union([
  gotoStepSchema,
  clickStepSchema,
  fillStepSchema,
  assertVisibleStepSchema,
  assertUrlStepSchema,
  keyboardStepSchema,
  waitStepSchema,
  screenshotStepSchema
]);

export const journeyPackSchema = packMetadataSchema
  .extend({
    kind: z.literal("journey"),
    definition: z
      .object({
        start_path: z.string().min(1).optional(),
        criticality: z.number().int().min(1).max(5).default(3),
        steps: z.array(journeyStepSchema).min(1).max(100)
      })
      .strict()
  })
  .strict();

export const genericPackSchema = packMetadataSchema
  .extend({
    definition: z.record(z.string(), z.unknown())
  })
  .strict();

const thresholdsSchema = z
  .object({
    max_duration_seconds: z.number().positive().max(3600).default(120),
    max_critical_findings: z.number().int().min(0).max(100).default(0),
    min_quality_score: z.number().min(0).max(100).default(80)
  })
  .strict();

export const humanqaConfigSchema = z
  .object({
    project: z
      .object({
        name: z.string().min(1),
        baseUrl: z.string().url()
      })
      .strict(),
    defaults: z
      .object({
        safeMode: z.boolean().default(true),
        redact: z.boolean().default(true),
        screenshots: z.boolean().default(true),
        browser: z.literal("chromium").default("chromium"),
        offline: z.boolean().default(false),
        viewport: z
          .object({ width: z.number().int().min(320), height: z.number().int().min(480) })
          .strict()
          .default({ width: 1440, height: 900 }),
        mobile: z.boolean().default(false)
      })
      .strict()
      .default({
        safeMode: true,
        redact: true,
        screenshots: true,
        browser: "chromium",
        offline: false,
        viewport: { width: 1440, height: 900 },
        mobile: false
      }),
    quality_contracts: z
      .array(
        z
          .object({
            id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
            name: z.string().min(3),
            persona: z.string().min(1).optional(),
            journey: z.string().min(1),
            acceptance_criteria: z.array(z.string().min(3)).min(1),
            thresholds: thresholdsSchema
          })
          .strict()
      )
      .min(1)
  })
  .strict();

const axeReferenceSchema = z.object({
  ruleId: z.string(),
  impact: z.string().nullable(),
  helpUrl: z.string().url(),
  wcagTags: z.array(z.string()),
  target: z.array(z.string()),
  failureSummary: z.string()
});

export const findingSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.enum(findingCategories),
  severity: z.enum(severities),
  confidence: z.number().min(0).max(1),
  source: z.enum(["deterministic", "advisory", "ai-assisted"]),
  userImpact: z.string(),
  reach: z.number().min(0),
  impact: z.number().min(0),
  effort: z.number().positive(),
  journeyCriticality: z.number().min(1).max(5),
  priorityScore: z.number().min(0),
  priorityLabel: z.enum(priorityLabels),
  releaseRisk: z.number().min(0),
  reproductionSteps: z.array(z.string()).min(1),
  evidence: z.object({
    screenshots: z.array(z.string()),
    url: z.string(),
    rule: z.string(),
    trace: z.string().optional(),
    selector: z.string().optional(),
    domExcerpt: z.string().optional(),
    console: z.array(z.string()).optional(),
    network: z
      .array(
        z.object({
          url: z.string(),
          method: z.string(),
          status: z.number().optional(),
          error: z.string().optional()
        })
      )
      .optional(),
    axe: z.array(axeReferenceSchema).optional(),
    keyboard: z.unknown().optional(),
    metadata: z.record(z.string(), z.unknown()).optional()
  }),
  suggestedRemediation: z.string(),
  regressionCandidate: z.boolean(),
  limitations: z.array(z.string()),
  aiInsights: z
    .array(z.object({ adapter: z.string(), text: z.string(), rationale: z.string() }))
    .optional()
});

export const auditReportSchema = z
  .object({
    schemaVersion: z.literal("0.1.0"),
    runId: z.string(),
    generatedAt: z.string(),
    findings: z.array(findingSchema)
  })
  .passthrough();

export function formatZodError(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join(".") : "root";
      return `${path}: ${issue.message}`;
    })
    .join("\n");
}
