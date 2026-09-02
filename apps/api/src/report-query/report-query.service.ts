import { Injectable, Scope } from '@nestjs/common';
import type { CertificationApplicationStatus } from '@prisma/client';

import type { AuthenticatedActor } from '../auth/request-principal';
import { TenantPrismaService } from '../prisma/tenant-prisma.service';
import type { CertificationApplicationTenantAggregateFilters } from '../prisma/tenant-prisma.service';
import { TenantContextStore } from '../tenant/tenant-context.store';
import { TenantAccessDeniedError } from '../tenant/tenant-errors';
import {
  DATE_RANGE_OVERFLOW,
  DATE_RANGE_REQUIRED,
  INCOMPLETE_DATE_PAIR,
  INVALID_SCHEME_REF,
  INVALID_STATUS,
  INVERTED_DATE_RANGE,
  MALFORMED_DATE,
  ReportQueryContractError,
  UNKNOWN_FILTER,
} from './report-query.errors';
import {
  CERTIFICATION_APPLICATION_STATUSES,
  MAX_DATE_RANGE_MS,
  REPORT_QUERY_ALLOWED_INPUT_KEYS,
  SCHEME_REF_MAX_LENGTH,
  type ReportQueryAggregateInput,
} from './report-query.input';
import { assertReportQueryAuthorized } from './report-query-role-authority';
import {
  SMALL_CELL_THRESHOLD,
  type ReportQuerySchemeRefAggregateResult,
  type ReportQueryStatusAggregateResult,
  type SchemeGroupCell,
  type StatusGroupCell,
} from './report-query.result';

const ALLOWED_INPUT_KEY_SET = new Set<string>(REPORT_QUERY_ALLOWED_INPUT_KEYS);
const STATUS_SET = new Set<string>(CERTIFICATION_APPLICATION_STATUSES);

function isValidDate(value: unknown): value is Date {
  return value instanceof Date && Number.isFinite(value.getTime());
}

function assertKnownKeys(input: ReportQueryAggregateInput): void {
  for (const key of Object.keys(input)) {
    if (!ALLOWED_INPUT_KEY_SET.has(key)) {
      throw new ReportQueryContractError(UNKNOWN_FILTER, 'Unknown filter.');
    }
  }
}

function assertStatus(
  status: unknown,
): asserts status is CertificationApplicationStatus | undefined {
  if (status === undefined) return;
  if (typeof status !== 'string' || !STATUS_SET.has(status)) {
    throw new ReportQueryContractError(INVALID_STATUS, 'Invalid status.');
  }
}

function assertSchemeRef(schemeRef: unknown): asserts schemeRef is string | undefined {
  if (schemeRef === undefined) return;
  if (
    typeof schemeRef !== 'string' ||
    schemeRef.length < 1 ||
    schemeRef.length > SCHEME_REF_MAX_LENGTH
  ) {
    throw new ReportQueryContractError(INVALID_SCHEME_REF, 'Invalid schemeRef.');
  }
}

function assertOptionalDate(value: unknown, present: boolean): void {
  if (!present) return;
  if (!isValidDate(value)) {
    throw new ReportQueryContractError(MALFORMED_DATE, 'Malformed date.');
  }
}

function assertCompleteRange(
  from: Date | undefined,
  to: Date | undefined,
  pairPresent: boolean,
): void {
  const hasFrom = from !== undefined;
  const hasTo = to !== undefined;
  if (hasFrom !== hasTo) {
    throw new ReportQueryContractError(INCOMPLETE_DATE_PAIR, 'Incomplete date pair.');
  }
  if (!pairPresent) return;
  if (!hasFrom || !hasTo) {
    throw new ReportQueryContractError(INCOMPLETE_DATE_PAIR, 'Incomplete date pair.');
  }
  const span = to.getTime() - from.getTime();
  if (span < 0) {
    throw new ReportQueryContractError(INVERTED_DATE_RANGE, 'Inverted date range.');
  }
  if (span > MAX_DATE_RANGE_MS) {
    throw new ReportQueryContractError(DATE_RANGE_OVERFLOW, 'Date range exceeds 365 days.');
  }
}

function validateInput(
  input: ReportQueryAggregateInput,
): CertificationApplicationTenantAggregateFilters {
  assertKnownKeys(input);
  assertStatus(input.status);
  assertSchemeRef(input.schemeRef);

  const hasCreatedFrom = Object.prototype.hasOwnProperty.call(input, 'createdFrom');
  const hasCreatedTo = Object.prototype.hasOwnProperty.call(input, 'createdTo');
  const hasSubmittedFrom = Object.prototype.hasOwnProperty.call(input, 'submittedFrom');
  const hasSubmittedTo = Object.prototype.hasOwnProperty.call(input, 'submittedTo');

  assertOptionalDate(input.createdFrom, hasCreatedFrom);
  assertOptionalDate(input.createdTo, hasCreatedTo);
  assertOptionalDate(input.submittedFrom, hasSubmittedFrom);
  assertOptionalDate(input.submittedTo, hasSubmittedTo);

  const createdPair = hasCreatedFrom || hasCreatedTo;
  const submittedPair = hasSubmittedFrom || hasSubmittedTo;
  if (!createdPair && !submittedPair) {
    throw new ReportQueryContractError(
      DATE_RANGE_REQUIRED,
      'At least one complete date range is required.',
    );
  }

  assertCompleteRange(input.createdFrom, input.createdTo, createdPair);
  assertCompleteRange(input.submittedFrom, input.submittedTo, submittedPair);

  const filters: CertificationApplicationTenantAggregateFilters = {};
  if (input.status !== undefined) filters.status = input.status;
  if (input.schemeRef !== undefined) filters.schemeRef = input.schemeRef;
  if (createdPair) {
    // Bounds validated as complete Date pair above.
    filters.createdAt = { gte: input.createdFrom as Date, lte: input.createdTo as Date };
  }
  if (submittedPair) {
    filters.submittedAt = {
      gte: input.submittedFrom as Date,
      lte: input.submittedTo as Date,
    };
  }
  return filters;
}

function applyStatusSuppression(
  status: CertificationApplicationStatus,
  count: number,
): StatusGroupCell {
  if (count === 0) {
    return { status, suppressed: false, count: 0 };
  }
  if (count < SMALL_CELL_THRESHOLD) {
    return { status, suppressed: true };
  }
  return { status, suppressed: false, count };
}

function applySchemeSuppression(schemeRef: string, count: number): SchemeGroupCell {
  if (count < SMALL_CELL_THRESHOLD) {
    return { schemeRef, suppressed: true };
  }
  return { schemeRef, suppressed: false, count };
}

function withTotalPolicy<T extends { suppressed: boolean }>(
  groups: T[],
  exactSum: number,
): { groups: T[]; total?: number } {
  if (groups.some((g) => g.suppressed)) {
    return { groups };
  }
  return { groups, total: exactSum };
}

@Injectable({ scope: Scope.REQUEST })
export class ReportQueryService {
  constructor(
    private readonly tenantPrisma: TenantPrismaService,
    private readonly tenantContext: TenantContextStore,
  ) {}

  async aggregateByStatus(
    actor: AuthenticatedActor,
    input: ReportQueryAggregateInput,
  ): Promise<ReportQueryStatusAggregateResult> {
    assertReportQueryAuthorized(actor);
    this.assertActorTenantMatchesRequest(actor);
    const filters = validateInput(input);

    const rows = await this.tenantPrisma.certificationApplication.groupByStatus(filters);
    const counts = new Map<CertificationApplicationStatus, number>();
    for (const status of CERTIFICATION_APPLICATION_STATUSES) {
      counts.set(status, 0);
    }
    for (const row of rows) {
      counts.set(row.status, row.count);
    }

    const groups = CERTIFICATION_APPLICATION_STATUSES.map((status) =>
      applyStatusSuppression(status, counts.get(status) ?? 0),
    );
    const exactSum = CERTIFICATION_APPLICATION_STATUSES.reduce(
      (acc, status) => acc + (counts.get(status) ?? 0),
      0,
    );
    return withTotalPolicy(groups, exactSum);
  }

  async aggregateBySchemeRef(
    actor: AuthenticatedActor,
    input: ReportQueryAggregateInput,
  ): Promise<ReportQuerySchemeRefAggregateResult> {
    assertReportQueryAuthorized(actor);
    this.assertActorTenantMatchesRequest(actor);
    const filters = validateInput(input);

    const rows = await this.tenantPrisma.certificationApplication.groupBySchemeRef(filters);
    const sorted = [...rows].sort((a, b) =>
      a.schemeRef < b.schemeRef ? -1 : a.schemeRef > b.schemeRef ? 1 : 0,
    );
    const groups = sorted.map((row) => applySchemeSuppression(row.schemeRef, row.count));
    const exactSum = rows.reduce((acc, row) => acc + row.count, 0);
    return withTotalPolicy(groups, exactSum);
  }

  private assertActorTenantMatchesRequest(actor: AuthenticatedActor): void {
    const requestTenantId = this.tenantContext.getRequiredTenantId();
    if (actor.tenantId !== requestTenantId) {
      throw new TenantAccessDeniedError();
    }
  }
}
