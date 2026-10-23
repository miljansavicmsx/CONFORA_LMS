import { type CanActivate, type ExecutionContext, Injectable } from '@nestjs/common';

import { getRequestPrincipal, type RequestWithPrincipal } from '../auth/request-principal';
import { AccessDeniedError } from '../tenant/tenant-errors';
import { DIRECTORY_CONSENT_EXECUTOR_ROLE } from './personnel-rules';

/**
 * Existing STAFF_SYSADM role only. An empty organization is denied here,
 * before the withdrawal reads or writes a certificate.
 */
@Injectable()
export class DirectoryConsentAdministratorGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithPrincipal>();
    const actor = getRequestPrincipal(request);
    const tenantId = typeof actor?.tenantId === 'string' ? actor.tenantId.trim() : '';
    const roles = Array.isArray(actor?.roles) ? actor.roles : [];
    if (!actor || tenantId.length === 0 || !roles.includes(DIRECTORY_CONSENT_EXECUTOR_ROLE)) {
      throw new AccessDeniedError();
    }
    return true;
  }
}

/**
 * Any authenticated member of an organization may reach the verifier step.
 * The handler rejects a non-staff role from the session before it reads a
 * certificate. The verifier id is the session user, never a typed field.
 */
@Injectable()
export class DirectoryConsentVerifierGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithPrincipal>();
    const actor = getRequestPrincipal(request);
    const tenantId = typeof actor?.tenantId === 'string' ? actor.tenantId.trim() : '';
    if (!actor || tenantId.length === 0) {
      throw new AccessDeniedError();
    }
    return true;
  }
}
