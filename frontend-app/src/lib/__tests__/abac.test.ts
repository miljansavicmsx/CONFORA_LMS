import { describe, expect, it } from "vitest";

import {
  AUDIT_ARTIFACT,
  CERTIFICATION_APPLICATION,
  CERTIFICATION_DECISION,
  IMPARTIALITY_THREAT,
  RISK_REGISTER_ENTRY,
  buildEvaluateResourceAccessPayload,
  canApproveResource,
  canEditResource,
  canViewResource,
  canonicalRoleSet,
  denialTooltipForReason,
  getResourceInteractionMode,
} from "@/lib/abac";
import type { MePermissionsPayload } from "@/lib/permissions";
import {
  PERM_AUDIT_READ,
  PERM_AUDIT_STRUCTURE_MANAGE,
  PERM_CERTIFICATION_APPLICATION_APPROVE,
  PERM_CERTIFICATION_APPLICATION_READ,
  PERM_GOVERNANCE_HUB_ACCESS,
  PERM_RISK_REGISTER_READ,
} from "@/lib/permissions";

function snap(partial: Partial<MePermissionsPayload> & Pick<MePermissionsPayload, "permissions" | "primaryRole">): MePermissionsPayload {
  return {
    isoRole: "",
    isoRoleLabel: "",
    tenantId: "t1",
    blockedPermissions: [],
    governanceCapabilities: [],
    ...partial,
  };
}

describe("abac", () => {
  it("buildEvaluateResourceAccessPayload sends only coarse keys by default", () => {
    const b = buildEvaluateResourceAccessPayload({
      resourceType: "RISK_REGISTER_ENTRY",
      resourceId: "r1",
      action: "read",
    });
    expect(b.resourceType).toBe("RISK_REGISTER_ENTRY");
    expect(b.resourceId).toBe("r1");
    expect(b.action).toBe("read");
    expect(b.tenantId).toBeUndefined();
    expect((b as Record<string, unknown>).ownerUserId).toBeUndefined();
  });

  it("canonicalRoleSet merges iso roles", () => {
    const s = snap({ primaryRole: "cert_committee", permissions: [] });
    const roles = canonicalRoleSet(s, ["appeals_committee"]);
    expect(roles.has("cert_committee")).toBe(true);
    expect(roles.has("appeals_committee")).toBe(true);
  });

  it("owner bypass allows view without staff read permission", () => {
    const s = snap({ primaryRole: "learner", permissions: [], tenantId: "t1" });
    const h = canViewResource(
      s,
      {
        viewerUserId: "u1",
        resourceTenantId: "t1",
        ownerUserId: "u1",
      },
      CERTIFICATION_APPLICATION,
      false,
    );
    expect(h.allowed).toBe(true);
    expect(h.reasonCode).toBe("OWN_RESOURCE_ACCESS");
  });

  it("tenant isolation denies cross-tenant read", () => {
    const s = snap({
      primaryRole: "cert_committee",
      permissions: [PERM_CERTIFICATION_APPLICATION_READ],
      tenantId: "t1",
    });
    const h = canViewResource(
      s,
      { viewerUserId: "u1", resourceTenantId: "t2", actorCommitteeIds: ["c1"] },
      CERTIFICATION_APPLICATION,
      false,
    );
    expect(h.allowed).toBe(false);
    expect(h.reasonCode).toBe("TENANT_ISOLATION");
  });

  it("strict committee profile requires overlap on committee ids", () => {
    const s = snap({
      primaryRole: "cert_committee",
      permissions: [PERM_CERTIFICATION_APPLICATION_READ],
      tenantId: "t1",
    });
    const h = canViewResource(
      s,
      {
        viewerUserId: "u1",
        resourceTenantId: "t1",
        committeeIds: ["c99"],
        actorCommitteeIds: ["c1"],
      },
      CERTIFICATION_APPLICATION,
      false,
    );
    expect(h.allowed).toBe(false);
    expect(h.reasonCode).toBe("COMMITTEE_SCOPE_REQUIRED");
  });

  it("risk read requires governance persona or hub permission", () => {
    const s = snap({
      primaryRole: "billing_admin",
      permissions: [PERM_RISK_REGISTER_READ],
      tenantId: "t1",
    });
    const h = canViewResource(s, { viewerUserId: "u9", resourceTenantId: "t1" }, RISK_REGISTER_ENTRY, false);
    expect(h.allowed).toBe(false);
    expect(h.reasonCode).toBe("GOVERNANCE_SCOPE_REQUIRED");

    const s2 = snap({
      primaryRole: "billing_admin",
      permissions: [PERM_RISK_REGISTER_READ, PERM_GOVERNANCE_HUB_ACCESS],
      tenantId: "t1",
    });
    expect(canViewResource(s2, { viewerUserId: "u9", resourceTenantId: "t1" }, RISK_REGISTER_ENTRY, false).allowed).toBe(true);
  });

  it("sys_admin needs governance hub to read CERTIFICATION_DECISION", () => {
    const noHub = snap({
      primaryRole: "sys_admin",
      permissions: [PERM_AUDIT_READ, PERM_CERTIFICATION_APPLICATION_READ],
      tenantId: "t1",
    });
    expect(
      canViewResource(noHub, { viewerUserId: "s1", resourceTenantId: "t1" }, CERTIFICATION_DECISION, false).allowed,
    ).toBe(false);

    const withHub = snap({
      primaryRole: "sys_admin",
      permissions: [PERM_AUDIT_READ, PERM_GOVERNANCE_HUB_ACCESS, PERM_CERTIFICATION_APPLICATION_READ],
      tenantId: "t1",
    });
    expect(canViewResource(withHub, { viewerUserId: "s1", resourceTenantId: "t1" }, CERTIFICATION_DECISION, false).allowed).toBe(
      true,
    );
  });

  it("blockedPermissions strips approve capability", () => {
    const s = snap({
      primaryRole: "admin",
      permissions: [PERM_CERTIFICATION_APPLICATION_APPROVE],
      blockedPermissions: [PERM_CERTIFICATION_APPLICATION_APPROVE],
      tenantId: "t1",
    });
    const h = canApproveResource(s, { viewerUserId: "a1", resourceTenantId: "t1" }, CERTIFICATION_APPLICATION, false);
    expect(h.allowed).toBe(false);
  });

  it("denial tooltip returns Croatian UX strings", () => {
    expect(denialTooltipForReason("COMPETENCE_REQUIRED")).toMatch(/kompetencij/i);
    expect(denialTooltipForReason("TENANT_ISOLATION")).toMatch(/tenant/);
  });

  it("getResourceInteractionMode is readonly when only view succeeds", () => {
    const s = snap({
      primaryRole: "quality_manager",
      permissions: [PERM_CERTIFICATION_APPLICATION_READ, PERM_RISK_REGISTER_READ],
      tenantId: "t1",
    });
    const mode = getResourceInteractionMode(
      s,
      { viewerUserId: "q1", resourceTenantId: "t1" },
      RISK_REGISTER_ENTRY,
      false,
    );
    expect(mode).toBe("readonly");
  });

  it("audit artifact edit requires structure manage permission", () => {
    const s = snap({
      primaryRole: "auditor",
      permissions: [PERM_AUDIT_READ],
      tenantId: "t1",
    });
    expect(canEditResource(s, { viewerUserId: "x", resourceTenantId: "t1" }, AUDIT_ARTIFACT, false).allowed).toBe(false);

    const s2 = snap({
      primaryRole: "auditor",
      permissions: [PERM_AUDIT_READ, PERM_AUDIT_STRUCTURE_MANAGE],
      tenantId: "t1",
    });
    expect(canEditResource(s2, { viewerUserId: "x", resourceTenantId: "t1" }, AUDIT_ARTIFACT, false).allowed).toBe(true);
  });

  it("impartiality read requires governance + read perm", () => {
    const s = snap({
      primaryRole: "learner",
      permissions: [],
      tenantId: "t1",
    });
    expect(canViewResource(s, { viewerUserId: "l", resourceTenantId: "t1" }, IMPARTIALITY_THREAT, false).allowed).toBe(false);
  });
});
