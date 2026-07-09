import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  ForbiddenException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';

import { TenantAccessViolationError } from './tenant-prisma.util';

/** Map expected tenant isolation guard failures to safe 403 responses (no stack traces). */
@Catch(TenantAccessViolationError)
export class TenantAccessViolationFilter implements ExceptionFilter {
  catch(_exception: TenantAccessViolationError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const body = new ForbiddenException('Access denied.').getResponse();
    response.status(HttpStatus.FORBIDDEN).json(body);
  }
}
