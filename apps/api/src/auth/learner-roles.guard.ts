import { type CanActivate, type ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { LEARNER_ROLES } from '@confora/shared-types';

import { IS_PUBLIC_KEY } from './public.decorator';
import { REQUIRE_LEARNER_ROLES_KEY } from './require-learner-roles.decorator';
import { getRequestPrincipal, type RequestWithPrincipal } from './request-principal';
import { AccessDeniedError } from '../tenant/tenant-errors';

function hasLearnerRole(roles: readonly string[]): boolean {
  const allowed = new Set<string>(LEARNER_ROLES);
  return roles.some((role) => allowed.has(role));
}

/**
 * Route-scoped learner role guard (BAR-P06).
 * Requires actor.roles intersects LEARNER_ROLES when @RequireLearnerRoles is set.
 */
@Injectable()
export class LearnerRolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const requireLearner = this.reflector.getAllAndOverride<boolean>(REQUIRE_LEARNER_ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requireLearner) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithPrincipal>();
    const actor = getRequestPrincipal(request);
    if (!actor) {
      throw new AccessDeniedError();
    }

    if (!hasLearnerRole(actor.roles)) {
      throw new AccessDeniedError();
    }

    return true;
  }
}
