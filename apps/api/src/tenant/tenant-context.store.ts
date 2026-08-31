import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

import { getRequestPrincipal, type RequestWithPrincipal } from '../auth/request-principal';
import { TenantAccessDeniedError } from './tenant-errors';

/**
 * BAR-P04 request-scoped tenant context (OD-P04-01).
 * Trusted source: AuthenticatedActor.tenantId only.
 * No mutable override API. No ALS. No platform/system scope.
 */
@Injectable({ scope: Scope.REQUEST })
export class TenantContextStore {
  constructor(@Inject(REQUEST) private readonly request: RequestWithPrincipal) {}

  getRequiredTenantId(): string {
    const principal = getRequestPrincipal(this.request);
    if (!principal) {
      throw new TenantAccessDeniedError();
    }
    const tenantId = typeof principal.tenantId === 'string' ? principal.tenantId.trim() : '';
    if (!tenantId) {
      throw new TenantAccessDeniedError();
    }
    return tenantId;
  }
}
