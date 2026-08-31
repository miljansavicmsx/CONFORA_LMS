import { type CanActivate, type ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PRIVILEGED_ROLES, type RbacRole } from '@confora/shared-types';

import { IS_PUBLIC_KEY } from './public.decorator';
import { REQUIRE_MFA_KEY } from './require-mfa.decorator';
import { getRequestPrincipal, type RequestWithPrincipal } from './request-principal';
import { AccessDeniedError } from '../tenant/tenant-errors';
import { MfaRequiredError } from '../tenant/tenant-errors';

function hasPrivilegedRole(roles: readonly RbacRole[]): boolean {
  const privileged = new Set<string>(PRIVILEGED_ROLES);
  return roles.some((role) => privileged.has(role));
}

/**
 * Global MFA assurance (OD-P04-16/17/19).
 * Requires MFA when actor has any privileged role OR @RequireMfa is set.
 */
@Injectable()
export class MfaAssuranceGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const requireMfa = this.reflector.getAllAndOverride<boolean>(REQUIRE_MFA_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest<RequestWithPrincipal>();
    const actor = getRequestPrincipal(request);
    if (!actor) {
      throw new AccessDeniedError();
    }

    const privileged = hasPrivilegedRole(actor.roles);
    if (!privileged && !requireMfa) {
      return true;
    }

    if (!actor.mfaVerified) {
      throw new MfaRequiredError();
    }

    return true;
  }
}
