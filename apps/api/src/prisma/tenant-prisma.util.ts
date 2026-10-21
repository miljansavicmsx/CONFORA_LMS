/**
 * Tenant predicate helpers for the Prisma query extension.
 * Scoped models match the registered tenant policy. Certificate and other
 * unregistered models stay outside this helper.
 */

import { TENANT_REGISTERED_MODELS } from './tenant-model-policy';

export class TenantAccessViolationError extends Error {
  constructor(message = 'Tenant access violation') {
    super(message);
    this.name = 'TenantAccessViolationError';
  }
}

export const TENANT_SCOPED_PRISMA_MODELS: ReadonlySet<string> = new Set(TENANT_REGISTERED_MODELS);

export const TENANT_READ_OPERATIONS: ReadonlySet<string> = new Set([
  'findMany',
  'findFirst',
  'findFirstOrThrow',
  'count',
  'aggregate',
  'groupBy',
]);

export const TENANT_UNIQUE_READ_OPERATIONS: ReadonlySet<string> = new Set([
  'findUnique',
  'findUniqueOrThrow',
]);

export const TENANT_WRITE_WHERE_OPERATIONS: ReadonlySet<string> = new Set([
  'update',
  'updateMany',
  'delete',
  'deleteMany',
]);

export const TENANT_CREATE_OPERATIONS: ReadonlySet<string> = new Set(['create', 'createMany']);

export const TENANT_UPSERT_OPERATIONS: ReadonlySet<string> = new Set(['upsert']);

export function mergeTenantIntoWhere(
  where: Record<string, unknown> | undefined,
  tenantId: string,
): Record<string, unknown> {
  if (!where) {
    return { tenantId };
  }
  // Caller tenantId is replaced. AND, OR, and NOT are kept and combined with
  // the active tenant so updateMany/deleteMany cannot drop the caller's filter.
  const { tenantId: _callerTenantId, AND, OR, NOT, ...rest } = where;
  const and: Record<string, unknown>[] = [{ tenantId }];
  if (Object.keys(rest).length > 0) {
    and.push(rest);
  }
  if (AND !== undefined) {
    and.push({ AND });
  }
  if (OR !== undefined) {
    and.push({ OR });
  }
  if (NOT !== undefined) {
    and.push({ NOT });
  }
  return { AND: and };
}

export function injectTenantIntoCreateData(
  data: Record<string, unknown>,
  tenantId: string,
): Record<string, unknown> {
  return { ...data, tenantId };
}

export function injectTenantIntoCreateManyData(
  data: Record<string, unknown>[] | Record<string, unknown>,
  tenantId: string,
): Record<string, unknown>[] | Record<string, unknown> {
  if (Array.isArray(data)) {
    return data.map((row) => injectTenantIntoCreateData(row, tenantId));
  }
  return injectTenantIntoCreateData(data, tenantId);
}

export function assertRecordTenantOwnership(
  record: { tenantId?: string | null } | null,
  tenantId: string,
  operation: string,
): void {
  if (record == null) {
    return;
  }
  if (record.tenantId !== tenantId) {
    throw new TenantAccessViolationError(
      `Tenant mismatch on ${operation}: record is outside the active tenant.`,
    );
  }
}
