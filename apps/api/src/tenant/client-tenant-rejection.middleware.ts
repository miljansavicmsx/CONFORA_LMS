import { Injectable, type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

import { ClientTenantContextForbiddenError } from './tenant-errors';

const FORBIDDEN_HEADERS = ['x-tenant-id', 'tenant-id'] as const;
const FORBIDDEN_KEYS = ['tenant_id', 'tenantId', 'org_id'] as const;

function hasOwnKey(obj: unknown, key: string): boolean {
  return (
    !!obj &&
    typeof obj === 'object' &&
    !Array.isArray(obj) &&
    Object.prototype.hasOwnProperty.call(obj, key)
  );
}

/**
 * Reject prohibited client tenant selectors at the transport boundary (OD-P04-02).
 * Applies to all routes including @Public. Never uses selector values as authority.
 */
@Injectable()
export class ClientTenantRejectionMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    for (const header of FORBIDDEN_HEADERS) {
      if (Object.prototype.hasOwnProperty.call(req.headers, header)) {
        throw new ClientTenantContextForbiddenError();
      }
    }

    const query = req.query as Record<string, unknown>;
    for (const key of FORBIDDEN_KEYS) {
      if (hasOwnKey(query, key)) {
        throw new ClientTenantContextForbiddenError();
      }
    }

    const body = req.body as unknown;
    for (const key of FORBIDDEN_KEYS) {
      if (hasOwnKey(body, key)) {
        throw new ClientTenantContextForbiddenError();
      }
    }

    next();
  }
}
