import { describe, expect, it } from "vitest";

import { isPersonnelCertificateNumber, personnelStatusLabel } from "@/lib/personnel-public";

describe("personnel public certificate numbers", () => {
  it("accepts CON-YYYY-NNNN and rejects hashes", () => {
    expect(isPersonnelCertificateNumber("CON-2026-0001")).toBe(true);
    expect(isPersonnelCertificateNumber(" con-2026-0001 ")).toBe(true);
    expect(isPersonnelCertificateNumber("a".repeat(64))).toBe(false);
  });

  it("labels public statuses in Bosnian", () => {
    expect(personnelStatusLabel("VALID")).toBe("Važeći");
    expect(personnelStatusLabel("WITHDRAWN")).toBe("Povučen");
  });
});