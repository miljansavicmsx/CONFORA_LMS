import { Catch, type ArgumentsHost, type ExceptionFilter, Injectable } from '@nestjs/common';
import { ZodValidationException } from 'nestjs-zod';
import type { ZodIssue } from 'zod';

import {
  INVALID_INVOCATION,
  INVALID_SCHEME_REF,
  INVALID_STATUS,
  MALFORMED_DATE,
  ReportQueryContractError,
  UNKNOWN_FILTER,
  type ReportQueryErrorCode,
} from '../report-query/report-query.errors';

const SAFE_MESSAGES: Record<ReportQueryErrorCode, string> = {
  UNKNOWN_FILTER: 'Unknown report query parameter.',
  INVALID_INVOCATION: 'Invalid report query invocation.',
  INVALID_STATUS: 'Invalid status filter.',
  INVALID_SCHEME_REF: 'Invalid schemeRef filter.',
  MALFORMED_DATE: 'Malformed date filter.',
  INVERTED_DATE_RANGE: 'Invalid date range.',
  DATE_RANGE_OVERFLOW: 'Date range exceeds the allowed maximum.',
  INCOMPLETE_DATE_PAIR: 'Incomplete date range.',
  DATE_RANGE_REQUIRED: 'At least one complete date range is required.',
};

const DATE_KEYS = new Set(['createdFrom', 'createdTo', 'submittedFrom', 'submittedTo']);
const ALLOWLISTED_KEYS = new Set([
  'status',
  'schemeRef',
  'createdFrom',
  'createdTo',
  'submittedFrom',
  'submittedTo',
]);

const NON_STRING_RECEIVED = new Set([
  'array',
  'object',
  'number',
  'boolean',
  'null',
  'bigint',
  'map',
  'set',
]);

function pathKey(issue: ZodIssue): string | undefined {
  const key = issue.path[0];
  return typeof key === 'string' ? key : undefined;
}

function mapZodIssues(issues: ZodIssue[]): ReportQueryErrorCode {
  if (issues.some((i) => i.code === 'unrecognized_keys')) {
    return UNKNOWN_FILTER;
  }

  for (const issue of issues) {
    const key = pathKey(issue);
    if (key !== undefined && ALLOWLISTED_KEYS.has(key)) {
      const received =
        'received' in issue && typeof (issue as { received?: unknown }).received === 'string'
          ? (issue as { received: string }).received
          : undefined;
      if (received !== undefined && NON_STRING_RECEIVED.has(received)) {
        return INVALID_INVOCATION;
      }
      if (issue.code === 'invalid_type' && received !== undefined && received !== 'string') {
        return INVALID_INVOCATION;
      }
    }
  }

  for (const issue of issues) {
    if (pathKey(issue) === 'status') return INVALID_STATUS;
  }
  for (const issue of issues) {
    if (pathKey(issue) === 'schemeRef') return INVALID_SCHEME_REF;
  }
  for (const issue of issues) {
    const key = pathKey(issue);
    if (key !== undefined && DATE_KEYS.has(key)) return MALFORMED_DATE;
  }
  return INVALID_INVOCATION;
}

@Injectable()
@Catch(ReportQueryContractError, ZodValidationException)
export class ReportQueryContractFilter implements ExceptionFilter {
  catch(exception: ReportQueryContractError | ZodValidationException, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<{
      status: (code: number) => { json: (body: unknown) => void };
    }>();

    let code: ReportQueryErrorCode;
    if (exception instanceof ReportQueryContractError) {
      code = exception.code;
    } else {
      const zodError = exception.getZodError();
      code = mapZodIssues(zodError.issues);
    }

    response.status(400).json({
      statusCode: 400,
      code,
      message: SAFE_MESSAGES[code],
    });
  }
}
