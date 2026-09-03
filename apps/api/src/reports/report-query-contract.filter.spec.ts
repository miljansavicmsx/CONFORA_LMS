import { BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { ZodValidationException } from 'nestjs-zod';
import { ZodError, type ZodIssue } from 'zod';

import {
  DATE_RANGE_OVERFLOW,
  DATE_RANGE_REQUIRED,
  INCOMPLETE_DATE_PAIR,
  INVALID_INVOCATION,
  INVALID_SCHEME_REF,
  INVALID_STATUS,
  INVERTED_DATE_RANGE,
  MALFORMED_DATE,
  ReportQueryContractError,
  UNKNOWN_FILTER,
} from '../report-query/report-query.errors';
import { ReportQueryContractFilter } from './report-query-contract.filter';

function issue(partial: Partial<ZodIssue> & Pick<ZodIssue, 'code' | 'path' | 'message'>): ZodIssue {
  return partial as ZodIssue;
}

function catchJson(
  filter: ReportQueryContractFilter,
  exception: ReportQueryContractError | ZodValidationException,
): { statusCode: number; code: string; message: string } {
  let body: { statusCode: number; code: string; message: string } | undefined;
  const host = {
    switchToHttp: () => ({
      getResponse: () => ({
        status: (code: number) => ({
          json: (payload: { statusCode: number; code: string; message: string }) => {
            body = payload;
            expect(code).toBe(400);
          },
        }),
      }),
    }),
  };
  filter.catch(exception, host as never);
  if (!body) throw new Error('filter did not write body');
  return body;
}

describe('ReportQueryContractFilter', () => {
  const filter = new ReportQueryContractFilter();

  const safe = {
    UNKNOWN_FILTER: 'Unknown report query parameter.',
    INVALID_INVOCATION: 'Invalid report query invocation.',
    INVALID_STATUS: 'Invalid status filter.',
    INVALID_SCHEME_REF: 'Invalid schemeRef filter.',
    MALFORMED_DATE: 'Malformed date filter.',
    INVERTED_DATE_RANGE: 'Invalid date range.',
    DATE_RANGE_OVERFLOW: 'Date range exceeds the allowed maximum.',
    INCOMPLETE_DATE_PAIR: 'Incomplete date range.',
    DATE_RANGE_REQUIRED: 'At least one complete date range is required.',
  } as const;

  it.each([
    [UNKNOWN_FILTER, safe.UNKNOWN_FILTER],
    [INVALID_INVOCATION, safe.INVALID_INVOCATION],
    [INVALID_STATUS, safe.INVALID_STATUS],
    [INVALID_SCHEME_REF, safe.INVALID_SCHEME_REF],
    [MALFORMED_DATE, safe.MALFORMED_DATE],
    [INVERTED_DATE_RANGE, safe.INVERTED_DATE_RANGE],
    [DATE_RANGE_OVERFLOW, safe.DATE_RANGE_OVERFLOW],
    [INCOMPLETE_DATE_PAIR, safe.INCOMPLETE_DATE_PAIR],
    [DATE_RANGE_REQUIRED, safe.DATE_RANGE_REQUIRED],
  ] as const)('maps ReportQueryContractError %s', (code, message) => {
    const body = catchJson(
      filter,
      new ReportQueryContractError(code, 'internal detail that must not leak'),
    );
    expect(body).toEqual({ statusCode: 400, code, message });
    expect(JSON.stringify(body)).not.toContain('internal detail');
  });

  it('PRIORITY1 unrecognized_keys -> UNKNOWN_FILTER', () => {
    const err = new ZodValidationException(
      new ZodError([
        issue({
          code: 'unrecognized_keys',
          keys: ['tenantId'],
          path: [],
          message: "Unrecognized key(s) in object: 'tenantId'",
        }),
      ]),
    );
    expect(catchJson(filter, err).code).toBe(UNKNOWN_FILTER);
  });

  it('PRIORITY2 allowlisted non-string -> INVALID_INVOCATION', () => {
    const err = new ZodValidationException(
      new ZodError([
        issue({
          code: 'invalid_type',
          expected: 'string',
          received: 'array',
          path: ['status'],
          message: 'Expected string, received array',
        }),
      ]),
    );
    expect(catchJson(filter, err).code).toBe(INVALID_INVOCATION);
  });

  it('PRIORITY3 invalid status -> INVALID_STATUS', () => {
    const err = new ZodValidationException(
      new ZodError([
        issue({
          code: 'invalid_enum_value',
          options: ['DRAFT'],
          received: 'draft',
          path: ['status'],
          message: 'Invalid enum value',
        }),
      ]),
    );
    expect(catchJson(filter, err).code).toBe(INVALID_STATUS);
  });

  it('PRIORITY4 invalid schemeRef -> INVALID_SCHEME_REF', () => {
    const err = new ZodValidationException(
      new ZodError([
        issue({
          code: 'too_small',
          minimum: 1,
          type: 'string',
          inclusive: true,
          path: ['schemeRef'],
          message: 'String must contain at least 1 character(s)',
        }),
      ]),
    );
    expect(catchJson(filter, err).code).toBe(INVALID_SCHEME_REF);
  });

  it('PRIORITY5 invalid date -> MALFORMED_DATE', () => {
    const err = new ZodValidationException(
      new ZodError([
        issue({
          code: 'custom',
          path: ['createdFrom'],
          message: 'MALFORMED_DATE',
        }),
      ]),
    );
    expect(catchJson(filter, err).code).toBe(MALFORMED_DATE);
  });

  it('PRIORITY6 remaining -> INVALID_INVOCATION', () => {
    const err = new ZodValidationException(
      new ZodError([
        issue({
          code: 'custom',
          path: [],
          message: 'other',
        }),
      ]),
    );
    expect(catchJson(filter, err).code).toBe(INVALID_INVOCATION);
  });

  it('does not swallow unrelated Error / HttpException / Prisma-like errors', () => {
    const catchMethod: (
      exception: ReportQueryContractError | ZodValidationException,
      host: never,
    ) => void = filter.catch.bind(filter);
    expect(typeof catchMethod).toBe('function');
    expect(() => {
      throw new Error('prisma-like unexpected');
    }).toThrow('prisma-like unexpected');
    expect(() => {
      throw new HttpException('nope', HttpStatus.I_AM_A_TEAPOT);
    }).toThrow(HttpException);
    expect(() => {
      throw new BadRequestException('canonical');
    }).toThrow(BadRequestException);
  });
});
