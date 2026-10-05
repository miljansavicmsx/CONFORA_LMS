/**
 * Legacy grievance and role strings that are not canonical RBAC identifiers.
 * PKG-01 rejects them before they can be treated as COMPLAINT_HANDLER
 * or STAFF_ROLEADM.
 */
export const ROLE_ADMINISTRATION_LEGACY_ROLE_ALIASES = [
  'admin',
  'appeals_committee',
  'auditor',
  'candidate',
  'certified',
  'com_app',
  'com_cert',
  'com_imp',
  'complaint_handler',
  'director',
  'learner',
  'quality_manager',
  'staff_dir',
  'staff_roleadm',
  'staff_sysadm',
  'sys_admin',
  'training_admin',
  'usr_cand',
  'usr_cert',
] as const;

export type RoleAdministrationLegacyRoleAlias =
  (typeof ROLE_ADMINISTRATION_LEGACY_ROLE_ALIASES)[number];

const LEGACY_ROLE_ALIAS_SET: ReadonlySet<string> = new Set(ROLE_ADMINISTRATION_LEGACY_ROLE_ALIASES);

export function isRoleAdministrationLegacyRoleAlias(role: string): boolean {
  return LEGACY_ROLE_ALIAS_SET.has(role);
}
