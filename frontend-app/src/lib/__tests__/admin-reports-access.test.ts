import { describe, expect, it } from "vitest";

import { evaluateAdminReportsAccess, T026_ALLOWED_ROLES } from "@/lib/admin-reports-access";

describe("admin-reports-access (T026 P08 roles)", () => {
  it("allows exactly the four P08 roles and canonical aliases", () => {
    expect(T026_ALLOWED_ROLES).toEqual([
      "STAFF_DIR",
      "STAFF_SYSADM",
      "STAFF_AUD",
      "QUALITY_MANAGER",
    ]);
    expect(evaluateAdminReportsAccess({ roleFromProfile: "STAFF_DIR" })).toBe(true);
    expect(evaluateAdminReportsAccess({ roleFromProfile: "STAFF_SYSADM" })).toBe(true);
    expect(evaluateAdminReportsAccess({ roleFromProfile: "STAFF_AUD" })).toBe(true);
    expect(evaluateAdminReportsAccess({ roleFromProfile: "QUALITY_MANAGER" })).toBe(true);
    expect(evaluateAdminReportsAccess({ roleFromProfile: "staff_dir" })).toBe(true);
    expect(evaluateAdminReportsAccess({ roleFromProfile: "director" })).toBe(true);
    expect(evaluateAdminReportsAccess({ roleFromProfile: "sys_admin" })).toBe(true);
    expect(evaluateAdminReportsAccess({ roleFromProfile: "auditor" })).toBe(true);
    expect(evaluateAdminReportsAccess({ roleFromProfile: "quality_manager" })).toBe(true);
    expect(
      evaluateAdminReportsAccess({ roleFromProfile: "learner", jwtRoles: ["STAFF_DIR"] }),
    ).toBe(true);
  });

  it("denies learner and unauthorized certification roles", () => {
    for (const role of [
      "USR_CAND",
      "USR_CERT",
      "COM_CERT",
      "ISSUANCE_OFFICER",
      "LIFECYCLE_OFFICER",
      "TRAINADM",
      "staff_trainadm",
      "training_admin",
      "admin",
      "candidate",
      "learner",
    ]) {
      expect(evaluateAdminReportsAccess({ roleFromProfile: role }), role).toBe(false);
    }
  });
});
