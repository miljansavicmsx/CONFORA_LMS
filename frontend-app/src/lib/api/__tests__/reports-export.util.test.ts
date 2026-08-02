import { describe, expect, it } from "vitest";

import { buildSafeExportFilename, parseContentDispositionFilename } from "../reports-export.util";

describe("reports-export.util", () => {
  it("buildSafeExportFilename sanitizes report key", () => {
    const name = buildSafeExportFilename("certification-pipeline", "CSV");
    expect(name).toMatch(/^confora-certification-pipeline-\d{4}-\d{2}-\d{2}\.csv$/);
  });

  it("parseContentDispositionFilename extracts filename", () => {
    expect(parseContentDispositionFilename('attachment; filename="report.csv"')).toBe("report.csv");
    expect(parseContentDispositionFilename(undefined)).toBeNull();
  });
});
