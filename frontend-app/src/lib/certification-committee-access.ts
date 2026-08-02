/**
 * Odluke certifikacije — backend `require_certification_dashboard`
 * (cert_committee, sys_admin, uobičajeni editori; NE tech_committee).
 */

import { hasCognitoContentEditorGroup } from "@/lib/content-editor-access";
import { normalizePrimaryRoleForRbac } from "@/lib/roles";

/** Usklađeno s backend `_CERTIFICATION_DASHBOARD_ROLES` + opcijski dopuniti envom (`VITE_CERTIFICATION_ROLES`). */
const DEFAULT_CERT_ROLES =
  "admin,instructor,author,content_admin,cert_committee,sys_admin";

function parseCsvEnv(value: string | undefined, fallback: string): Set<string> {
  const raw = (value ?? fallback).trim() || fallback;
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

function allowedCertRoles(): Set<string> {
  return parseCsvEnv(import.meta.env.VITE_CERTIFICATION_ROLES, DEFAULT_CERT_ROLES);
}

export type CertificationDashboardAccessInput = {
  readonly cognitoGroups: readonly string[];
  readonly roleFromProfile: string | null | undefined;
};

export function evaluateCertificationDashboardAccess(input: CertificationDashboardAccessInput): boolean {
  if (hasCognitoContentEditorGroup(input.cognitoGroups)) {
    return true;
  }
  const roleAllow = allowedCertRoles();
  const r = normalizePrimaryRoleForRbac(String(input.roleFromProfile ?? ""));
  return r.length > 0 && roleAllow.has(r);
}
