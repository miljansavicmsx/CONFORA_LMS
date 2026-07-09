import { PrismaClient } from '@prisma/client';

import {
  TENANT_CREATE_OPERATIONS,
  TENANT_READ_OPERATIONS,
  TENANT_SCOPED_PRISMA_MODELS,
  TENANT_UNIQUE_READ_OPERATIONS,
  TENANT_UPSERT_OPERATIONS,
  TENANT_WRITE_WHERE_OPERATIONS,
  assertRecordTenantOwnership,
  extractTenantIdFromRecord,
  injectTenantIntoCreateData,
  injectTenantIntoCreateManyData,
  mergeTenantIntoWhere,
} from './tenant-prisma.util';
import { getActiveTenantIdForPrisma } from '../tenant/tenant-context.store';

type QueryArgs = Record<string, unknown>;

function asArgs(raw: unknown): QueryArgs {
  if (raw && typeof raw === 'object') return raw as QueryArgs;
  return {};
}

function applyTenantArgs(
  model: string,
  operation: string,
  args: unknown,
  tenantId: string,
): QueryArgs {
  const a = asArgs(args);

  if (TENANT_READ_OPERATIONS.has(operation)) {
    const where = a['where'] as Record<string, unknown> | undefined;
    return { ...a, where: mergeTenantIntoWhere(where, tenantId) };
  }

  if (TENANT_WRITE_WHERE_OPERATIONS.has(operation)) {
    const where = a['where'] as Record<string, unknown> | undefined;
    // Prisma update/delete require WhereUniqueInput — cannot merge tenantId via AND.
    if (operation === 'update' || operation === 'delete') {
      return a;
    }
    return { ...a, where: mergeTenantIntoWhere(where, tenantId) };
  }

  if (TENANT_CREATE_OPERATIONS.has(operation)) {
    if (operation === 'createMany') {
      const data = a['data'];
      if (Array.isArray(data) || (data && typeof data === 'object')) {
        return {
          ...a,
          data: injectTenantIntoCreateManyData(
            data as Record<string, unknown>[] | Record<string, unknown>,
            tenantId,
          ),
        };
      }
    }
    const data = a['data'] as Record<string, unknown> | undefined;
    if (data) {
      return { ...a, data: injectTenantIntoCreateData(data, tenantId) };
    }
  }

  if (TENANT_UPSERT_OPERATIONS.has(operation)) {
    const create = a['create'] as Record<string, unknown> | undefined;
    const update = a['update'] as Record<string, unknown> | undefined;
    const where = a['where'] as Record<string, unknown> | undefined;
    return {
      ...a,
      where: mergeTenantIntoWhere(where, tenantId),
      ...(create ? { create: injectTenantIntoCreateData(create, tenantId) } : {}),
      ...(update ? { update: injectTenantIntoCreateData(update, tenantId) } : {}),
    };
  }

  return a;
}

function shouldSkipTenantOwnershipValidation(model: string, operation: string): boolean {
  // Auth identity resolution must read the user's true tenant_id before application-level checks.
  return model === 'User' && TENANT_UNIQUE_READ_OPERATIONS.has(operation);
}

function validateTenantResult(
  model: string,
  operation: string,
  tenantId: string,
  result: unknown,
): unknown {
  if (!TENANT_SCOPED_PRISMA_MODELS.has(model)) return result;

  if (shouldSkipTenantOwnershipValidation(model, operation)) {
    return result;
  }

  if (TENANT_UNIQUE_READ_OPERATIONS.has(operation)) {
    assertRecordTenantOwnership(
      result as { tenantId?: string | null } | null,
      tenantId,
      operation,
    );
    return result;
  }

  if (operation === 'create' || operation === 'upsert' || operation === 'update') {
    assertRecordTenantOwnership(
      result as { tenantId?: string | null } | null,
      tenantId,
      operation,
    );
  }

  return result;
}

export function createTenantQueryExtension() {
  return {
    query: {
      $allModels: {
        async $allOperations({
          model,
          operation,
          args,
          query,
        }: {
          model: string;
          operation: string;
          args: unknown;
          query: (a: unknown) => Promise<unknown>;
        }) {
          const tenantId = getActiveTenantIdForPrisma();

          if (!tenantId || !TENANT_SCOPED_PRISMA_MODELS.has(model)) {
            return query(args);
          }

          const opsNeedingTenant =
            TENANT_READ_OPERATIONS.has(operation) ||
            TENANT_WRITE_WHERE_OPERATIONS.has(operation) ||
            TENANT_CREATE_OPERATIONS.has(operation) ||
            TENANT_UPSERT_OPERATIONS.has(operation) ||
            TENANT_UNIQUE_READ_OPERATIONS.has(operation);

          if (!opsNeedingTenant) {
            return query(args);
          }

          const patched =
            TENANT_UNIQUE_READ_OPERATIONS.has(operation)
              ? asArgs(args)
              : applyTenantArgs(model, operation, args, tenantId);

          const result = await query(patched);
          return validateTenantResult(model, operation, tenantId, result);
        },
      },
    },
  };
}

export function createExtendedPrismaClientWithTenant(base?: PrismaClient) {
  const client = base ?? new PrismaClient();
  return client.$extends(createTenantQueryExtension());
}
