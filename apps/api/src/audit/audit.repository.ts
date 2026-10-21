import { Injectable } from '@nestjs/common';
import { Prisma } from '@confora/database';

import { PrismaService } from '../prisma/prisma.service';
import { INITIAL_PREV_HASH, type AuditOutcomeLiteral } from './audit-event.types';

export type AuditEventRow = {
  id: string;
  tenantId: string;
  sequence: bigint;
  idempotencyKey: string;
  actorUserId: string;
  eventType: string;
  outcome: AuditOutcomeLiteral;
  resourceType: string | null;
  resourceId: string | null;
  occurredAt: Date;
  recordedAt: Date;
  correlationId: string | null;
  metadata: Prisma.JsonValue | null;
  prevHash: string;
  payloadHash: string;
  chainHash: string;
};

export type AuditChainHeadRow = {
  tenantId: string;
  lastSequence: bigint;
  lastHash: string;
};

export type AuditEventCreateData = {
  id: string;
  tenantId: string;
  sequence: bigint;
  idempotencyKey: string;
  actorUserId: string;
  eventType: string;
  outcome: AuditOutcomeLiteral;
  resourceType: string | null;
  resourceId: string | null;
  occurredAt: Date;
  recordedAt: Date;
  correlationId: string | null;
  metadata: Prisma.InputJsonValue | typeof Prisma.JsonNull | null;
  prevHash: string;
  payloadHash: string;
  chainHash: string;
};

/**
 * Bounded persistence API for one SERIALIZABLE transaction.
 * Does not expose PrismaClient / TransactionClient to AuditModule callers.
 */
export type AuditWriteClient = ConstructorParameters<typeof AuditPersistenceApi>[0];

export class AuditPersistenceApi {
  constructor(private readonly tx: Prisma.TransactionClient) {}

  async findEventByIdempotency(
    tenantId: string,
    idempotencyKey: string,
  ): Promise<AuditEventRow | null> {
    const row = await this.tx.auditEvent.findUnique({
      where: { tenantId_idempotencyKey: { tenantId, idempotencyKey } },
    });
    return row;
  }

  /**
   * Queue writers of one tenant chain. The lock ends when the transaction
   * commits or rolls back, so a failed append leaves no sequence hole.
   * Other tenants use a different key and stay concurrent.
   */
  async lockTenantChain(tenantId: string): Promise<void> {
    await this.tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${tenantId}, ${0n}))`;
  }

  async findChainHead(tenantId: string): Promise<AuditChainHeadRow | null> {
    const row = await this.tx.auditChainHead.findUnique({ where: { tenantId } });
    return row;
  }

  async createInitialChainHead(tenantId: string): Promise<AuditChainHeadRow> {
    const row = await this.tx.auditChainHead.create({
      data: {
        tenantId,
        lastSequence: 0n,
        lastHash: INITIAL_PREV_HASH,
      },
    });
    return row;
  }

  async createEvent(data: AuditEventCreateData): Promise<AuditEventRow> {
    const metadata = data.metadata === null ? Prisma.JsonNull : data.metadata;
    const row = await this.tx.auditEvent.create({
      data: {
        id: data.id,
        tenantId: data.tenantId,
        sequence: data.sequence,
        idempotencyKey: data.idempotencyKey,
        actorUserId: data.actorUserId,
        eventType: data.eventType,
        outcome: data.outcome,
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        occurredAt: data.occurredAt,
        recordedAt: data.recordedAt,
        correlationId: data.correlationId,
        metadata,
        prevHash: data.prevHash,
        payloadHash: data.payloadHash,
        chainHash: data.chainHash,
      },
    });
    return row;
  }

  /**
   * Compare-and-swap chain head advance. Returns false when concurrent writers raced.
   */
  async advanceChainHeadCas(
    tenantId: string,
    expectedLastSequence: bigint,
    lastSequence: bigint,
    lastHash: string,
  ): Promise<boolean> {
    const result = await this.tx.auditChainHead.updateMany({
      where: { tenantId, lastSequence: expectedLastSequence },
      data: { lastSequence, lastHash },
    });
    return result.count === 1;
  }
}

@Injectable()
export class AuditRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Direct Prisma transaction executor (BAR-P05 allowlist path #7).
   * Each tenant chain is serialized by pg_advisory_xact_lock. Read Committed
   * is required so a writer that waited for that lock reads the head committed
   * by the previous holder. A serializable snapshot is taken before the lock
   * is granted, and those waiters then exhaust the retry budget.
   */
  async runSerializableTransaction<T>(work: (api: AuditPersistenceApi) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(async (tx) => work(new AuditPersistenceApi(tx)), {
      isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
    });
  }

  async findEventsForTenantOrdered(tenantId: string): Promise<AuditEventRow[]> {
    const rows = await this.prisma.auditEvent.findMany({
      where: { tenantId },
      orderBy: { sequence: 'asc' },
    });
    return rows;
  }

  async findChainHead(tenantId: string): Promise<AuditChainHeadRow | null> {
    const row = await this.prisma.auditChainHead.findUnique({ where: { tenantId } });
    return row;
  }
}
