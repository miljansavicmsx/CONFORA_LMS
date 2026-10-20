import { type CanActivate, type ExecutionContext, Injectable } from '@nestjs/common';

import { getRequestPrincipal, type RequestWithPrincipal } from '../auth/request-principal';
import { AccessDeniedError } from '../tenant/tenant-errors';

function roleGuard(allowed: readonly string[]) {
  @Injectable()
  class RoleGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
      const request = context.switchToHttp().getRequest<RequestWithPrincipal>();
      const actor = getRequestPrincipal(request);
      if (!actor) {
        throw new AccessDeniedError();
      }
      const roles = Array.isArray(actor.roles) ? actor.roles : [];
      if (!roles.some((role) => allowed.includes(role))) {
        throw new AccessDeniedError();
      }
      return true;
    }
  }
  return RoleGuard;
}

export const ExamStaffRolesGuard = roleGuard(['COM_TECH', 'SME', 'EXAMINER', 'INVIGILATOR']);
export const ExamCommitteeRolesGuard = roleGuard(['COM_CERT']);
