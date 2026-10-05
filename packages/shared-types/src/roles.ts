import { z } from 'zod';

/**
 * Canonical RBAC role identifiers.
 * Order is deterministic: the historical 17 identifiers stay in their
 * existing order. PKG-00 appends COMPLAINT_HANDLER and STAFF_ROLEADM.
 * Identifiers are exact and case-sensitive. No aliases are accepted.
 */
export const rbacRoleSchema = z.enum([
  'USR_CAND',
  'USR_CERT',
  'STAFF_DIR',
  'STAFF_SYSADM',
  'STAFF_TRAINADM',
  'ISSUANCE_OFFICER',
  'LIFECYCLE_OFFICER',
  'COM_TECH',
  'COM_CERT',
  'COM_IMP',
  'COM_APP',
  'STAFF_AUD',
  'SME',
  'EXAMINER',
  'INVIGILATOR',
  'QUALITY_MANAGER',
  'AI_SECURITY_MANAGER',
  'COMPLAINT_HANDLER',
  'STAFF_ROLEADM',
]);

/** Canonical role count after PKG-00. Historical count was 17. */
export const RBAC_ROLE_COUNT = 19;

export type RbacRole = z.infer<typeof rbacRoleSchema>;
