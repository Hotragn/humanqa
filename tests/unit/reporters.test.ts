import { describe, expect, it } from "vitest";

import { renderHtml, renderJunit, renderMarkdown, renderSarif } from "@humanqa/reporters";

import { sampleReport } from "../fixtures/report";

describe("reporters", () => {
  const report = sampleReport();

  it("renders the required Markdown sections and limitations", () => {
    const markdown = renderMarkdown(report);
    expect(markdown).toContain("## Executive summary");
    expect(markdown).toContain("## Acceptance-criteria matrix");
    expect(markdown).toContain("## Accessibility");
    expect(markdown).toContain("Manual review required: yes");
    expect(markdown).toContain("not objective truth");
  });

  it("renders a standalone accessible HTML document", () => {
    const html = renderHtml(report);
    expect(html).toContain("<!doctype html>");
    expect(html).toContain('aria-labelledby="findings-title"');
    expect(html).toContain("Manual testing is required");
    expect(html).not.toContain("undefined");
  });

  it("renders SARIF 2.1.0 with HumanQA finding properties", () => {
    const sarif = JSON.parse(renderSarif(report)) as {
      version: string;
      runs: Array<{ results: Array<{ properties: { findingId: string } }> }>;
    };
    expect(sarif.version).toBe("2.1.0");
    expect(sarif.runs[0]?.results[0]?.properties.findingId).toBe("HQ-AX-ABC12345");
  });

  it("renders JUnit failures for actionable deterministic findings", () => {
    const junit = renderJunit(report);
    expect(junit).toContain('failures="1"');
    expect(junit).toContain("HQ-AX-ABC12345");
    expect(junit).toContain("safeMode");
  });
});
