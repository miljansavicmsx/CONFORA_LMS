/**
 * Registar žalbi / support (ISO §11) — backend `require_appeals_committee`
 * (appeals_committee | sys_admin | admin; bez Cognito prečice u backendu).
 */

export type AppealsCommitteeAccessInput = {
  readonly roleFromProfile: string | null | undefined;
};

export function evaluateAppealsCommitteeAccess(input: AppealsCommitteeAccessInput): boolean {
  const r = String(input.roleFromProfile ?? "")
    .trim()
    .toLowerCase();
  return (
    r === "appeals_committee" ||
    r === "sys_admin" ||
    r === "admin" ||
    r === "director"
  );
}
