import { describe, expect, it } from "vitest";

import { parseAppealsCanonicalEnabled } from "../appeals-canonical-flag";
import { parseComplaintsCanonicalEnabled } from "../complaints-canonical-flag";
import { parseContactCanonicalEnabled } from "../contact-canonical-flag";
import {
  parseBlockLegacyReportBuilder,
  parseReportExportEnabled,
  parseReportsCanonicalEnabled,
} from "../reports-canonical-flag";

describe("F4 cutover feature flags (production defaults)", () => {
  it("canonical flags default to true when unset", () => {
    expect(parseContactCanonicalEnabled(undefined)).toBe(true);
    expect(parseComplaintsCanonicalEnabled(undefined)).toBe(true);
    expect(parseAppealsCanonicalEnabled(undefined)).toBe(true);
    expect(parseReportsCanonicalEnabled(undefined)).toBe(true);
    expect(parseReportExportEnabled(undefined)).toBe(true);
    expect(parseBlockLegacyReportBuilder(undefined)).toBe(true);
  });

  it("false variants are explicit opt-out only", () => {
    expect(parseContactCanonicalEnabled("false")).toBe(false);
    expect(parseComplaintsCanonicalEnabled("0")).toBe(false);
    expect(parseAppealsCanonicalEnabled("no")).toBe(false);
    expect(parseReportsCanonicalEnabled("false")).toBe(false);
    expect(parseReportExportEnabled("false")).toBe(false);
    expect(parseBlockLegacyReportBuilder("false")).toBe(false);
  });
});
