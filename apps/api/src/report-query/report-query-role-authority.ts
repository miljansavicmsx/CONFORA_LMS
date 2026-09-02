import type { RbacRole } from '@confora/shared-types';

import type { AuthenticatedActor } from '../auth/request-principal';
import { AccessDeniedError } from '../tenant/tenant-errors';

export const REPORT_QUERY_ALLOWED_ROLES: readonly RbacRole[] = [
  'STAFF_DIR',
  'STAFF_SYSADM',
  'STAFF_AUD',
  'QUALITY_MANAGER',
] as const;

const ALLOWED = new Set<string>(REPORT_QUERY_ALLOWED_ROLES);

/**
 * BAR-P07 service-level role authority.
 * Must run before any database access. Performs no DB I/O.
 */
export function assertReportQueryAuthorized(actor: AuthenticatedActor | null | undefined): void {
  if (!actor) {
    throw new AccessDeniedError();
  }
  const tenantId = typeof actor.tenantId === 'string' ? actor.tenantId.trim() : '';
  if (!tenantId) {
    throw new AccessDeniedError();
  }
  const roles = Array.isArray(actor.roles) ? actor.roles : [];
  if (!roles.some((role) => ALLOWED.has(role))) {
    throw new AccessDeniedError();
  }
}
