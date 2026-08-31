import { Injectable, Scope } from '@nestjs/common';

import { TenantContextStore } from '../tenant/tenant-context.store';
import { TenantAccessDeniedError } from '../tenant/tenant-errors';
import { PrismaService } from './prisma.service';
import { isTenantRegisteredModel } from './tenant-model-policy';

type AggregateArgs = {
  where?: Record<string, unknown>;
  [key: string]: unknown;
};

function forceTenantWhere(
  where: Record<string, unknown> | undefined,
  tenantId: string,
): Record<string, unknown> {
  const base = where ? { ...where } : {};
  // Caller cannot override request tenant: always AND with exact tenantId.
  delete base['tenantId'];
  if (base['AND']) {
    delete base['AND'];
  }
  return { AND: [{ tenantId }, base] };
}

/**
 * Request-scoped read-only tenant Prisma facade (OD-P04-04..09).
 * Never exposes PrismaService / raw client / writes / transactions / raw SQL.
 */
@Injectable({ scope: Scope.REQUEST })
export class TenantPrismaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextStore,
  ) {}

  forModel(modelName: string): never {
    if (!isTenantRegisteredModel(modelName)) {
      throw new TenantAccessDeniedError();
    }
    throw new TenantAccessDeniedError();
  }

  readonly tenant = {
    findUnique: async (args?: { where?: { id?: string } }) => {
      const tenantId = this.tenantContext.getRequiredTenantId();
      const requestedId = args?.where?.id;
      if (requestedId !== undefined && requestedId !== tenantId) {
        return null;
      }
      return this.prisma.tenant.findUnique({ where: { id: tenantId } });
    },
    findUniqueOrThrow: async (args?: { where?: { id?: string } }) => {
      const row = await this.tenant.findUnique(args);
      if (!row) {
        throw new TenantAccessDeniedError();
      }
      return row;
    },
  };

  readonly user = {
    findUnique: async (args: {
      where: { id?: string; email?: string; tenantId_id?: unknown; tenantId_email?: unknown };
    }) => {
      const tenantId = this.tenantContext.getRequiredTenantId();
      if (args.where.tenantId_id || args.where.tenantId_email) {
        throw new TenantAccessDeniedError();
      }
      if (args.where.id && args.where.email) {
        throw new TenantAccessDeniedError();
      }
      if (args.where.id) {
        return this.prisma.user.findUnique({
          where: { tenantId_id: { tenantId, id: args.where.id } },
        });
      }
      if (args.where.email) {
        return this.prisma.user.findUnique({
          where: { tenantId_email: { tenantId, email: args.where.email } },
        });
      }
      throw new TenantAccessDeniedError();
    },
    findUniqueOrThrow: async (args: { where: { id?: string; email?: string } }) => {
      const row = await this.user.findUnique(args);
      if (!row) {
        throw new TenantAccessDeniedError();
      }
      return row;
    },
    findMany: async (args: AggregateArgs = {}) => {
      const tenantId = this.tenantContext.getRequiredTenantId();
      return this.prisma.user.findMany({
        ...args,
        where: forceTenantWhere(args.where, tenantId),
      });
    },
    findFirst: async (args: AggregateArgs = {}) => {
      const tenantId = this.tenantContext.getRequiredTenantId();
      return this.prisma.user.findFirst({
        ...args,
        where: forceTenantWhere(args.where, tenantId),
      });
    },
    findFirstOrThrow: async (args: AggregateArgs = {}) => {
      const tenantId = this.tenantContext.getRequiredTenantId();
      return this.prisma.user.findFirstOrThrow({
        ...args,
        where: forceTenantWhere(args.where, tenantId),
      });
    },
    count: async (args: AggregateArgs = {}) => {
      const tenantId = this.tenantContext.getRequiredTenantId();
      return this.prisma.user.count({
        ...args,
        where: forceTenantWhere(args.where, tenantId),
      });
    },
    aggregate: async (args: AggregateArgs = {}) => {
      const tenantId = this.tenantContext.getRequiredTenantId();
      return this.prisma.user.aggregate({
        ...args,
        where: forceTenantWhere(args.where, tenantId),
      });
    },
    groupBy: async (args: AggregateArgs & { by: string[] | string }) => {
      const tenantId = this.tenantContext.getRequiredTenantId();
      return this.prisma.user.groupBy({
        ...args,
        where: forceTenantWhere(args.where, tenantId),
      } as never);
    },
  };

  readonly externalIdentityLink = {
    findUnique: async (args: { where: { issuer: string; subject: string } }) => {
      const tenantId = this.tenantContext.getRequiredTenantId();
      return this.prisma.externalIdentityLink.findUnique({
        where: {
          tenantId_issuer_subject: {
            tenantId,
            issuer: args.where.issuer,
            subject: args.where.subject,
          },
        },
      });
    },
    findUniqueOrThrow: async (args: { where: { issuer: string; subject: string } }) => {
      const row = await this.externalIdentityLink.findUnique(args);
      if (!row) {
        throw new TenantAccessDeniedError();
      }
      return row;
    },
    findMany: async (args: AggregateArgs = {}) => {
      const tenantId = this.tenantContext.getRequiredTenantId();
      return this.prisma.externalIdentityLink.findMany({
        ...args,
        where: forceTenantWhere(args.where, tenantId),
      });
    },
    findFirst: async (args: AggregateArgs = {}) => {
      const tenantId = this.tenantContext.getRequiredTenantId();
      return this.prisma.externalIdentityLink.findFirst({
        ...args,
        where: forceTenantWhere(args.where, tenantId),
      });
    },
    findFirstOrThrow: async (args: AggregateArgs = {}) => {
      const tenantId = this.tenantContext.getRequiredTenantId();
      return this.prisma.externalIdentityLink.findFirstOrThrow({
        ...args,
        where: forceTenantWhere(args.where, tenantId),
      });
    },
    count: async (args: AggregateArgs = {}) => {
      const tenantId = this.tenantContext.getRequiredTenantId();
      return this.prisma.externalIdentityLink.count({
        ...args,
        where: forceTenantWhere(args.where, tenantId),
      });
    },
    aggregate: async (args: AggregateArgs = {}) => {
      const tenantId = this.tenantContext.getRequiredTenantId();
      return this.prisma.externalIdentityLink.aggregate({
        ...args,
        where: forceTenantWhere(args.where, tenantId),
      });
    },
    groupBy: async (args: AggregateArgs & { by: string[] | string }) => {
      const tenantId = this.tenantContext.getRequiredTenantId();
      return this.prisma.externalIdentityLink.groupBy({
        ...args,
        where: forceTenantWhere(args.where, tenantId),
      } as never);
    },
  };

  // Explicit denial surface for contract tests — methods must not exist as writable API.
  create = undefined;
  createMany = undefined;
  update = undefined;
  updateMany = undefined;
  upsert = undefined;
  delete = undefined;
  deleteMany = undefined;
  $transaction = undefined;
  $queryRaw = undefined;
  $queryRawUnsafe = undefined;
  $executeRaw = undefined;
  $executeRawUnsafe = undefined;
}
