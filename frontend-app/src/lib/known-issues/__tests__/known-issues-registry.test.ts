import { describe, expect, it } from "vitest";

import { knownIssuesAffecting, knownIssuesBySeverity, KNOWN_ISSUES_REGISTRY } from "@/lib/known-issues";

describe("known issues registry", () => {
  it("has stable ids", () => {
    const ids = KNOWN_ISSUES_REGISTRY.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("filters by severity", () => {
    const low = knownIssuesBySeverity("low");
    expect(low.every((i) => i.severity === "low")).toBe(true);
  });

  it("filters by module substring", () => {
    const k = knownIssuesAffecting("knowledge");
    expect(k.length).toBeGreaterThan(0);
  });
});
