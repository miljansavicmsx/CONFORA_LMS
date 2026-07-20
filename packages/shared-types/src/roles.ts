import { z } from 'zod';

/** ISO 17024-aligned role keys used across Keycloak, JWT claims, and RBAC. */
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
]);

export type RbacRole = z.infer<typeof rbacRoleSchema>;
