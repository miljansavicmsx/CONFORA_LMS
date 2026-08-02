import { describe, expect, it } from "vitest";

import { PERM_AUDIT_READ, PERM_CERTIFICATION_APPLICATION_APPROVE } from "@/lib/permissions";

describe("permissions", () => {
  it(" dotted ids match backend wording", () => {
    expect(PERM_CERTIFICATION_APPLICATION_APPROVE).toBe("certification.application.approve");
    expect(PERM_AUDIT_READ).toBe("audit.read");
    expect(PERM_AUDIT_READ.includes(".")).toBe(true);
  });
});
