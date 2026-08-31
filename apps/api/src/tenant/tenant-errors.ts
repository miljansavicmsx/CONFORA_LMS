import { ForbiddenException, HttpException, HttpStatus } from '@nestjs/common';

/**
 * BAR-P04 typed assurance errors.
 * Client payloads must never include tenantId, userId, email, issuer, subject,
 * roles, amr, JWT claims, token, Prisma args, query, or stack.
 */

export const CLIENT_TENANT_CONTEXT_FORBIDDEN = 'CLIENT_TENANT_CONTEXT_FORBIDDEN' as const;
export const TENANT_ACCESS_DENIED = 'TENANT_ACCESS_DENIED' as const;
export const ACCESS_DENIED = 'ACCESS_DENIED' as const;
export const MFA_REQUIRED = 'MFA_REQUIRED' as const;

export type BarP04ErrorCode =
  | typeof CLIENT_TENANT_CONTEXT_FORBIDDEN
  | typeof TENANT_ACCESS_DENIED
  | typeof ACCESS_DENIED
  | typeof MFA_REQUIRED;

export abstract class BarP04HttpError extends HttpException {
  readonly code: BarP04ErrorCode;

  protected constructor(status: HttpStatus, code: BarP04ErrorCode, message: string) {
    super({ statusCode: status, code, message }, status);
    this.code = code;
  }
}

export class ClientTenantContextForbiddenError extends BarP04HttpError {
  constructor(message = 'Client tenant context is forbidden.') {
    super(HttpStatus.BAD_REQUEST, CLIENT_TENANT_CONTEXT_FORBIDDEN, message);
  }
}

export class TenantAccessDeniedError extends BarP04HttpError {
  constructor() {
    super(HttpStatus.FORBIDDEN, TENANT_ACCESS_DENIED, 'Access denied.');
  }
}

export class AccessDeniedError extends BarP04HttpError {
  constructor() {
    super(HttpStatus.FORBIDDEN, ACCESS_DENIED, 'Access denied.');
  }
}

export class MfaRequiredError extends BarP04HttpError {
  constructor() {
    super(HttpStatus.FORBIDDEN, MFA_REQUIRED, 'Additional authentication assurance required.');
  }
}

/** Narrow helper: Nest ForbiddenException must not be used for P04 typed codes. */
export function isBarP04HttpError(error: unknown): error is BarP04HttpError {
  return error instanceof BarP04HttpError;
}

export function assertNeverLeaksForbiddenException(error: ForbiddenException): never {
  throw error;
}
