/**
 * Kurikulum, nova obuka, item bank, AI roleplay — usklađeno s backend `require_curriculum_item_bank`.
 * (Cognito grupe + DynamoDB uloge, uključujući sys_admin i tech_committee.)
 */

const DEFAULT_COGNITO_GROUPS = "admins,content-creators";
const DEFAULT_DDB_ROLES =
  "admin,instructor,author,content_admin,sys_admin,tech_committee,training_admin";

function parseCsvEnv(value: string | undefined, fallback: string): Set<string> {
  const raw = (value ?? fallback).trim() || fallback;
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

function allowedCognitoGroups(): Set<string> {
  return parseCsvEnv(import.meta.env.VITE_COGNITO_CONTENT_EDITOR_GROUPS, DEFAULT_COGNITO_GROUPS);
}

function allowedDdbRoles(): Set<string> {
  return parseCsvEnv(import.meta.env.VITE_ADMIN_ROLES, DEFAULT_DDB_ROLES);
}

export type ContentEditorAccessInput = {
  readonly cognitoGroups: readonly string[];
  readonly roleFromProfile: string | null | undefined;
};

/** Cognito „content editor” grupe = puni pristup editor dijelovima (kao na backendu). */
export function hasCognitoContentEditorGroup(cognitoGroups: readonly string[]): boolean {
  const groupAllow = allowedCognitoGroups();
  if (groupAllow.size === 0 || cognitoGroups.length === 0) {
    return false;
  }
  const set = new Set(cognitoGroups);
  for (const g of groupAllow) {
    if (set.has(g)) {
      return true;
    }
  }
  return false;
}

/**
 * `true` ako JWT sadrži dozvoljenu Cognito grupu ili profilna uloga u skupu za kurikulum/item bank.
 */
export function evaluateCurriculumItemBankAccess(input: ContentEditorAccessInput): boolean {
  if (hasCognitoContentEditorGroup(input.cognitoGroups)) {
    return true;
  }

  const roleAllow = allowedDdbRoles();
  const r = String(input.roleFromProfile ?? "")
    .trim()
    .toLowerCase();
  return r.length > 0 && roleAllow.has(r);
}

/** @deprecated koristi ``evaluateCurriculumItemBankAccess`` */
export function evaluateContentEditorAccess(input: ContentEditorAccessInput): boolean {
  return evaluateCurriculumItemBankAccess(input);
}
