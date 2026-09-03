import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

import { MALFORMED_DATE, ReportQueryContractError } from '../../report-query/report-query.errors';
import {
  CERTIFICATION_APPLICATION_STATUSES,
  SCHEME_REF_MAX_LENGTH,
  type ReportQueryAggregateInput,
} from '../../report-query/report-query.input';

/** Exact BAR-P08 RFC3339 lexical pattern (OD2-01). */
export const P08_RFC3339_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(\.\d{1,3})?(Z|[+-]\d{2}:\d{2})$/;

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function daysInMonth(year: number, month: number): number {
  switch (month) {
    case 1:
    case 3:
    case 5:
    case 7:
    case 8:
    case 10:
    case 12:
      return 31;
    case 4:
    case 6:
    case 9:
    case 11:
      return 30;
    case 2:
      return isLeapYear(year) ? 29 : 28;
    default:
      return 0;
  }
}

/**
 * Lexical + Gregorian/time/offset validation. Date construction is representation only.
 * No truncation / rounding / coercive Date authority.
 */
export function parseRfc3339ExactInstant(input: string): Date | null {
  const match = P08_RFC3339_PATTERN.exec(input);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6]);

  if (month < 1 || month > 12) return null;
  if (day < 1 || day > daysInMonth(year, month)) return null;
  if (hour < 0 || hour > 23) return null;
  if (minute < 0 || minute > 59) return null;
  if (second < 0 || second > 59) return null;

  const offset = match[8] ?? '';
  if (offset !== 'Z') {
    const oh = Number(offset.slice(1, 3));
    const om = Number(offset.slice(4, 6));
    if (oh < 0 || oh > 23) return null;
    if (om < 0 || om > 59) return null;
  }

  const date = new Date(input);
  if (!Number.isFinite(date.getTime())) return null;
  return date;
}

const statusSchema = z.enum(CERTIFICATION_APPLICATION_STATUSES as unknown as [string, ...string[]]);

const schemeRefSchema = z.string().min(1).max(SCHEME_REF_MAX_LENGTH);

const rfc3339DateSchema = z.string().superRefine((value, ctx) => {
  if (parseRfc3339ExactInstant(value) === null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'MALFORMED_DATE',
    });
  }
});

export const reportAggregateQuerySchema = z
  .object({
    status: statusSchema.optional(),
    schemeRef: schemeRefSchema.optional(),
    createdFrom: rfc3339DateSchema.optional(),
    createdTo: rfc3339DateSchema.optional(),
    submittedFrom: rfc3339DateSchema.optional(),
    submittedTo: rfc3339DateSchema.optional(),
  })
  .strict();

export class ReportAggregateQueryDto extends createZodDto(reportAggregateQuerySchema) {}

function requireExactInstant(value: string): Date {
  const parsed = parseRfc3339ExactInstant(value);
  if (parsed === null) {
    throw new ReportQueryContractError(MALFORMED_DATE, 'Malformed date filter.');
  }
  return parsed;
}

export function toReportQueryAggregateInput(
  dto: z.infer<typeof reportAggregateQuerySchema>,
): ReportQueryAggregateInput {
  const input: ReportQueryAggregateInput = {};
  if (dto.status !== undefined) {
    input.status = dto.status as NonNullable<ReportQueryAggregateInput['status']>;
  }
  if (dto.schemeRef !== undefined) {
    input.schemeRef = dto.schemeRef;
  }
  if (dto.createdFrom !== undefined) {
    input.createdFrom = requireExactInstant(dto.createdFrom);
  }
  if (dto.createdTo !== undefined) {
    input.createdTo = requireExactInstant(dto.createdTo);
  }
  if (dto.submittedFrom !== undefined) {
    input.submittedFrom = requireExactInstant(dto.submittedFrom);
  }
  if (dto.submittedTo !== undefined) {
    input.submittedTo = requireExactInstant(dto.submittedTo);
  }
  return input;
}
