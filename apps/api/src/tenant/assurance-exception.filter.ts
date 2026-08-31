import { type ArgumentsHost, Catch, type ExceptionFilter } from '@nestjs/common';
import type { Response } from 'express';

import {
  AccessDeniedError,
  BarP04HttpError,
  ClientTenantContextForbiddenError,
  MfaRequiredError,
  TenantAccessDeniedError,
} from './tenant-errors';

/**
 * Maps BAR-P04 typed errors to exact OD1 status/code/message payloads.
 * Never echoes tenant identifiers, tokens, claims, or stacks.
 */
@Catch(
  ClientTenantContextForbiddenError,
  TenantAccessDeniedError,
  AccessDeniedError,
  MfaRequiredError,
  BarP04HttpError,
)
export class AssuranceExceptionFilter implements ExceptionFilter {
  catch(exception: BarP04HttpError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const status = exception.getStatus();
    // BarP04HttpError always constructs an object body via HttpException.
    response.status(status).json(exception.getResponse());
  }
}
