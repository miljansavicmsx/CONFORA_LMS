import type { CertificationApplicationStatus } from '@prisma/client';

export type ReportQueryAggregateInput = {
  status?: CertificationApplicationStatus;
  schemeRef?: string;
  createdFrom?: Date;
  createdTo?: Date;
  submittedFrom?: Date;
  submittedTo?: Date;
};

export const REPORT_QUERY_ALLOWED_INPUT_KEYS = [
  'status',
  'schemeRef',
  'createdFrom',
  'createdTo',
  'submittedFrom',
  'submittedTo',
] as const;

export const CERTIFICATION_APPLICATION_STATUSES: readonly CertificationApplicationStatus[] = [
  'DRAFT',
  'SUBMITTED',
  'UNDER_REVIEW',
  'APPROVED',
  'REJECTED',
] as const;

export const MS_PER_DAY = 86_400_000;
export const MAX_DATE_RANGE_MS = 365 * MS_PER_DAY;
export const SCHEME_REF_MAX_LENGTH = 128;
