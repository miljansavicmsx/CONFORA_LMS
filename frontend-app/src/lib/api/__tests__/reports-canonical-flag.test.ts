import { afterEach, describe, expect, it, vi } from "vitest";

import {
  isLegacyReportBuilderBlocked,
  isReportExportEnabled,
  isReportsCanonicalEnabled,
  parseBlockLegacyReportBuilder,
  parseReportExportEnabled,
  parseReportsCanonicalEnabled,
} from "../reports-canonical-flag";

describe("reports-canonical-flag", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("defaults canonical and export to true when unset", () => {
    expect(parseReportsCanonicalEnabled(undefined)).toBe(true);
    expect(parseReportExportEnabled(undefined)).toBe(true);
    expect(parseBlockLegacyReportBuilder(undefined)).toBe(true);
    expect(isReportsCanonicalEnabled()).toBe(true);
    expect(isReportExportEnabled()).toBe(true);
    expect(isLegacyReportBuilderBlocked()).toBe(true);
  });

  it("parses false variants", () => {
    expect(parseReportsCanonicalEnabled("false")).toBe(false);
    expect(parseReportExportEnabled("0")).toBe(false);
    expect(parseBlockLegacyReportBuilder("no")).toBe(false);
  });
});
