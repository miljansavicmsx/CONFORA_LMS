import { type CanActivate, type ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { IS_PUBLIC_KEY } from '../auth/public.decorator';
import { getRequestPrincipal, type RequestWithPrincipal } from '../auth/request-principal';
import { ActiveAssuranceService } from './active-assurance.service';
import { AccessDeniedError } from './tenant-errors';

/**
 * Global active Tenant/User assurance. Skips @Public. Runs after JwtAuthGuard.
 */
@Injectable()
export class ActiveAssuranceGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly activeAssurance: ActiveAssuranceService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithPrincipal>();
    const actor = getRequestPrincipal(request);
    if (!actor) {
      throw new AccessDeniedError();
    }

    await this.activeAssurance.assertActiveTenantAndUser(actor);
    return true;
  }
}
