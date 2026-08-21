export const findingCategories = [
  "functional",
  "usability",
  "accessibility",
  "performance",
  "safety"
] as const;
export type FindingCategory = (typeof findingCategories)[number];

export const severities = ["critical", "high", "medium", "low", "info"] as const;
export type Severity = (typeof severities)[number];

export const priorityLabels = [
  "Block release",
  "Fix before launch",
  "Plan next sprint",
  "Monitor",
  "Informational"
] as const;
export type PriorityLabel = (typeof priorityLabels)[number];

export interface AxeEvidenceReference {
  ruleId: string;
  impact: string | null;
  helpUrl: string;
  wcagTags: string[];
  target: string[];
  failureSummary: string;
}

export interface KeyboardEvidence {
  sequence: Array<{
    index: number;
    tag: string;
    role: string | null;
    name: string;
    selector: string;
  }>;
  targetReached?: boolean;
  cycleDetected?: boolean;
  focusIndicator?: "visible" | "not-detected" | "unknown";
}

export interface FindingEvidence {
  screenshots: string[];
  url: string;
  rule: string;
  trace?: string;
  selector?: string;
  domExcerpt?: string;
  console?: string[];
  network?: Array<{ url: string; method: string; status?: number; error?: string }>;
  axe?: AxeEvidenceReference[];
  keyboard?: KeyboardEvidence;
  metadata?: Record<string, unknown>;
}

export interface Finding {
  id: string;
  title: string;
  category: FindingCategory;
  severity: Severity;
  confidence: number;
  source: "deterministic" | "advisory" | "ai-assisted";
  userImpact: string;
  reach: number;
  impact: number;
  effort: number;
  journeyCriticality: number;
  priorityScore: number;
  priorityLabel: PriorityLabel;
  releaseRisk: number;
  reproductionSteps: string[];
  evidence: FindingEvidence;
  suggestedRemediation: string;
  regressionCandidate: boolean;
  limitations: string[];
  aiInsights?: Array<{
    adapter: string;
    text: string;
    rationale: string;
  }>;
}

export interface FindingDraft extends Omit<
  Finding,
  "id" | "priorityScore" | "priorityLabel" | "releaseRisk" | "aiInsights"
> {
  targetKey: string;
}

export interface ConsoleEvidence {
  type: "error" | "warning";
  text: string;
  url: string;
  timestamp: string;
}

export interface NetworkEvidence {
  url: string;
  method: string;
  resourceType: string;
  timestamp: string;
  status?: number;
  error?: string;
}

export interface ActionEvidence {
  index: number;
  action: string;
  description: string;
  startedAt: string;
  durationMs: number;
  status: "passed" | "failed" | "blocked";
  url: string;
  screenshot?: string;
  selector?: string;
  error?: string;
}

export interface RawAxeNode {
  any: unknown[];
  all: unknown[];
  none: unknown[];
  impact: string | null;
  html: string;
  target: string[];
  failureSummary?: string;
}

export interface RawAxeViolation {
  id: string;
  impact: string | null;
  tags: string[];
  description: string;
  help: string;
  helpUrl: string;
  nodes: RawAxeNode[];
}

export interface BrowserEvidence {
  startedAt: string;
  completedAt: string;
  durationMs: number;
  visitedUrls: string[];
  actions: ActionEvidence[];
  console: ConsoleEvidence[];
  network: NetworkEvidence[];
  axeViolations: RawAxeViolation[];
  keyboard: KeyboardEvidence[];
  browserName: string;
  browserVersion: string;
  viewport: { width: number; height: number };
  userAgent: string;
  trace?: string;
  video?: string;
}

export interface AcceptanceCriterionResult {
  criterion: string;
  status: "pass" | "fail" | "review";
  evidenceFindingIds: string[];
  explanation: string;
}

export interface QualityThresholds {
  maxDurationSeconds: number;
  maxCriticalFindings: number;
  minQualityScore: number;
}

export interface AuditReport {
  schemaVersion: "0.1.0";
  toolVersion: string;
  runId: string;
  generatedAt: string;
  project: { name: string; baseUrl: string };
  scope: {
    mode: "declared-journey" | "conservative-page-inspection";
    goal?: string;
    persona?: string;
    journey?: { id: string; name: string; author: string; version: string };
  };
  environment: {
    nodeVersion: string;
    platform: string;
    browser: string;
    browserVersion: string;
    viewport: { width: number; height: number };
    userAgent: string;
  };
  settings: {
    safeMode: boolean;
    redact: boolean;
    screenshots: boolean;
    offline: boolean;
    allowMutations: boolean;
    llmEnabled: boolean;
  };
  summary: {
    verdict: PriorityLabel;
    qualityScore: number;
    releaseRisk: number;
    counts: Record<Severity, number>;
    blockingReasons: string[];
  };
  acceptanceCriteria: AcceptanceCriterionResult[];
  findings: Finding[];
  browserEvidence: BrowserEvidence;
  artifacts: {
    outputDirectory: string;
    screenshots: string[];
    trace?: string;
    reports: string[];
  };
  accessibility: {
    automatedScanCompleted: boolean;
    axeViolationCount: number;
    wcagRuleIds: string[];
    keyboardChecksCompleted: number;
    manualReviewRequired: true;
    scopeNote: string;
  };
  scoring: {
    priorityFormula: string;
    releaseRiskFormula: string;
    severityWeights: Record<Severity, number>;
    assumptions: string[];
  };
  limitations: string[];
  packAttribution: Array<{ id: string; name: string; author: string; version: string }>;
}

export interface AuditSettings {
  safeMode: boolean;
  redact: boolean;
  screenshots: boolean;
  offline: boolean;
  allowMutations: boolean;
  browser: "chromium";
  viewport: { width: number; height: number };
  mobile: boolean;
  video: boolean;
}

export interface AuditRunInput {
  baseUrl: string;
  outputDirectory: string;
  settings: AuditSettings;
  journey?: JourneyPack;
  goal?: string;
  persona?: string;
}

export interface BrowserRunResult {
  evidence: BrowserEvidence;
  findings: FindingDraft[];
  screenshotPaths: string[];
  assertionResults: Array<{
    criterion?: string;
    description: string;
    passed: boolean;
    findingRule?: string;
  }>;
}

export interface PackMetadata {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  compatibility: string;
  tags: string[];
}

export type JourneyStep =
  | { action: "goto"; path: string; description?: string | undefined }
  | {
      action: "click";
      role?: string | undefined;
      name?: string | undefined;
      selector?: string | undefined;
      test_id?: string | undefined;
      description?: string | undefined;
      safe?: boolean | undefined;
    }
  | {
      action: "fill";
      label?: string | undefined;
      selector?: string | undefined;
      value: string;
      description?: string | undefined;
      sensitive?: boolean | undefined;
    }
  | {
      action: "assert-visible";
      text?: string | undefined;
      role?: string | undefined;
      name?: string | undefined;
      selector?: string | undefined;
      description?: string | undefined;
      criterion?: string | undefined;
      rule?: string | undefined;
    }
  | {
      action: "assert-url";
      pattern: string;
      description?: string | undefined;
      criterion?: string | undefined;
    }
  | {
      action: "keyboard-reachable";
      selector: string;
      description?: string | undefined;
      criterion?: string | undefined;
    }
  | { action: "wait"; milliseconds: number; description?: string | undefined }
  | { action: "screenshot"; name: string; description?: string | undefined };

export interface JourneyPack extends PackMetadata {
  kind: "journey";
  definition: {
    start_path?: string | undefined;
    criticality: number;
    steps: JourneyStep[];
  };
}

export interface QualityContractConfig {
  id: string;
  name: string;
  persona?: string | undefined;
  journey: string;
  acceptance_criteria: string[];
  thresholds: {
    max_duration_seconds: number;
    max_critical_findings: number;
    min_quality_score: number;
  };
}

export interface HumanqaConfig {
  project: { name: string; baseUrl: string };
  defaults: {
    safeMode: boolean;
    redact: boolean;
    screenshots: boolean;
    browser: "chromium";
    offline: boolean;
    viewport: { width: number; height: number };
    mobile: boolean;
  };
  quality_contracts: QualityContractConfig[];
}
