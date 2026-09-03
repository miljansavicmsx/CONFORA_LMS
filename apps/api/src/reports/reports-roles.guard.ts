import { type CanActivate, type ExecutionContext, Injectable } from '@nestjs/common';

import { getRequestPrincipal, type RequestWithPrincipal } from '../auth/request-principal';
import { REPORT_QUERY_ALLOWED_ROLES } from '../report-query/report-query-role-authority';
import { AccessDeniedError } from '../tenant/tenant-errors';

const ALLOWED = new Set<string>(REPORT_QUERY_ALLOWED_ROLES);

/**
 * BAR-P08 route-scoped role guard.
 * Exactly four report-query roles. No DB / tenant / audit / service I/O.
 */
@Injectable()
export class ReportsRolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithPrincipal>();
    const actor = getRequestPrincipal(request);
    if (!actor) {
      throw new AccessDeniedError();
    }
    const roles = Array.isArray(actor.roles) ? actor.roles : [];
    if (!roles.some((role) => ALLOWED.has(role))) {
      throw new AccessDeniedError();
    }
    return true;
  }
}
