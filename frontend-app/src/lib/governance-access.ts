/**
 * Governance hub — koji uloge smiju UI rutu (fine-grained pravila za API su na backendu po endpointu).
 * Primjer: `tech_committee` vidi org/odbroe, ali ne smije `/api/governance/logs` ili upis rizika.
 */

import { hasCognitoContentEditorGroup } from "@/lib/content-editor-access";

/** Za ulaz na hub — mora pokrivati uloge s `require_governance_org_directory_read`. */
const DEFAULT_GOV_ROLES =
  "admin,instructor,author,content_admin,sys_admin,director,impartiality_committee,auditor,training_admin,tech_committee,cert_committee,appeals_committee,quality_manager";

function parseCsvEnv(value: string | undefined, fallback: string): Set<string> {
  const raw = (value ?? fallback).trim() || fallback;
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

function allowedGovernanceRoles(): Set<string> {
  return parseCsvEnv(import.meta.env.VITE_GOVERNANCE_ROLES, DEFAULT_GOV_ROLES);
}

export type GovernanceAccessInput = {
  readonly cognitoGroups: readonly string[];
  readonly roleFromProfile: string | null | undefined;
};

export function evaluateGovernanceAccess(input: GovernanceAccessInput): boolean {
  if (hasCognitoContentEditorGroup(input.cognitoGroups)) {
    return true;
  }
  const roleAllow = allowedGovernanceRoles();
  const r = String(input.roleFromProfile ?? "")
    .trim()
    .toLowerCase();
  return r.length > 0 && roleAllow.has(r);
}
