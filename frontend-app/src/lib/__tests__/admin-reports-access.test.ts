import { describe, expect, it } from "vitest";

import { evaluateAdminReportsAccess } from "@/lib/admin-reports-access";

describe("admin-reports-access", () => {
  it("allows director and sysadmin", () => {
    expect(evaluateAdminReportsAccess({ jwtRoles: ["STAFF_DIR"] })).toBe(true);
    expect(evaluateAdminReportsAccess({ jwtRoles: ["STAFF_SYSADM"] })).toBe(true);
  });

  it("denies learner", () => {
    expect(evaluateAdminReportsAccess({ jwtRoles: ["LEARNER"] })).toBe(false);
    expect(evaluateAdminReportsAccess({ jwtRoles: [] })).toBe(false);
  });
});
