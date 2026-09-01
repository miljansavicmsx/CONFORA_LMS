import { Prisma } from '@confora/database';

import type { AuthenticatedActor } from '../auth/request-principal';
import type { TenantContextStore } from '../tenant/tenant-context.store';
import {
  AuditError,
  AUDIT_ACTOR_REQUIRED,
  AUDIT_INVALID_INPUT,
  AUDIT_INVALID_OUTCOME,
  AUDIT_RETRY_EXHAUSTED,
  AUDIT_TENANT_CONTEXT_MISMATCH,
} from './audit-errors';
import { AuditEventRegistry } from './audit-event.registry';
import { INITIAL_PREV_HASH, MAX_SERIALIZABLE_RETRIES } from './audit-event.types';
import { AuditHashService } from './audit-hash.service';
import type {
  AuditEventCreateData,
  AuditEventRow,
  AuditPersistenceApi,
  AuditRepository,
} from './audit.repository';
import { AuditService } from './audit.service';

const ACTOR: AuthenticatedActor = {
  userId: '11111111-1111-4111-8111-111111111111',
  tenantId: '22222222-2222-4222-8222-222222222222',
  issuer: 'http://issuer.test/realms/confora',
  subject: 'sub-1',
  email: 'actor@example.test',
  roles: ['USR_CAND'],
  mfaVerified: true,
};

const IDEMPOTENCY_KEY = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

function testRegistry(): AuditEventRegistry {
  return new AuditEventRegistry([
    {
      eventType: 'TEST_EVENT',
      resourceTypePolicy: 'OPTIONAL',
      metadataSchema: {
        type: 'object',
        properties: {
          note: { type: 'string' },
        },
      },
    },
  ]);
}

function baseAppendInput() {
  return {
    idempotencyKey: IDEMPOTENCY_KEY,
    eventType: 'TEST_EVENT',
    outcome: 'SUCCESS' as const,
    occurredAt: new Date('2026-01-02T03:04:05.000Z'),
    metadata: { note: 'ok' },
  };
}

function toEventRow(data: AuditEventCreateData): AuditEventRow {
  return {
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
    metadata:
      data.metadata === null || data.metadata === Prisma.JsonNull
        ? null
        : (data.metadata as Prisma.JsonValue),
    prevHash: data.prevHash,
    payloadHash: data.payloadHash,
    chainHash: data.chainHash,
  };
}

function p2034Error(): Prisma.PrismaClientKnownRequestError {
  return new Prisma.PrismaClientKnownRequestError('write conflict', {
    code: 'P2034',
    clientVersion: '6.19.0',
  });
}

describe('AuditService', () => {
  let mockApi: jest.Mocked<AuditPersistenceApi>;
  let repository: { runSerializableTransaction: jest.Mock };
  let tenantContext: { getRequiredTenantId: jest.Mock };
  let service: AuditService;

  beforeEach(() => {
    mockApi = {
      findEventByIdempotency: jest.fn().mockResolvedValue(null),
      findChainHead: jest.fn().mockResolvedValue(null),
      createInitialChainHead: jest.fn().mockResolvedValue({
        tenantId: ACTOR.tenantId,
        lastSequence: 0n,
        lastHash: INITIAL_PREV_HASH,
      }),
      createEvent: jest.fn((data: AuditEventCreateData) => Promise.resolve(toEventRow(data))),
      advanceChainHeadCas: jest.fn().mockResolvedValue(true),
    } as unknown as jest.Mocked<AuditPersistenceApi>;

    repository = {
      runSerializableTransaction: jest.fn(
        <T>(work: (api: AuditPersistenceApi) => Promise<T>): Promise<T> => work(mockApi),
      ),
    };

    tenantContext = {
      getRequiredTenantId: jest.fn(() => ACTOR.tenantId),
    };

    service = new AuditService(
      repository as unknown as AuditRepository,
      new AuditHashService(),
      tenantContext as unknown as TenantContextStore,
      testRegistry(),
    );
  });

  it('P05_TEST_011 tenantId derives from actor.tenantId', async () => {
    await service.append(ACTOR, baseAppendInput());
    expect(mockApi.createEvent.mock.calls.length).toBeGreaterThan(0);
    expect(mockApi.createEvent.mock.calls[0]?.[0]?.tenantId).toBe(ACTOR.tenantId);
  });

  it('P05_TEST_012 actorUserId derives from actor.userId', async () => {
    await service.append(ACTOR, baseAppendInput());
    expect(mockApi.createEvent.mock.calls[0]?.[0]?.actorUserId).toBe(ACTOR.userId);
  });

  it('P05_TEST_013 Missing actor -> AUDIT_ACTOR_REQUIRED', async () => {
    await expect(
      service.append(null as unknown as AuthenticatedActor, baseAppendInput()),
    ).rejects.toMatchObject({
      code: AUDIT_ACTOR_REQUIRED,
    });
    await expect(
      service.append({ ...ACTOR, userId: '' }, baseAppendInput()),
    ).rejects.toBeInstanceOf(AuditError);
  });

  it('P05_TEST_014 TenantContext mismatch -> AUDIT_TENANT_CONTEXT_MISMATCH', async () => {
    tenantContext.getRequiredTenantId.mockReturnValue('99999999-9999-4999-8999-999999999999');
    await expect(service.append(ACTOR, baseAppendInput())).rejects.toMatchObject({
      code: AUDIT_TENANT_CONTEXT_MISMATCH,
    });
  });

  it('P05_TEST_015 tenantId override rejected', async () => {
    await expect(
      service.append(ACTOR, {
        ...baseAppendInput(),
        tenantId: '99999999-9999-4999-8999-999999999999',
      } as never),
    ).rejects.toMatchObject({ code: AUDIT_INVALID_INPUT });
    expect(mockApi.createEvent.mock.calls).toHaveLength(0);
  });

  it('P05_TEST_016 actorUserId override rejected', async () => {
    await expect(
      service.append(ACTOR, {
        ...baseAppendInput(),
        actorUserId: '99999999-9999-4999-8999-999999999999',
      } as never),
    ).rejects.toMatchObject({ code: AUDIT_INVALID_INPUT });
    expect(mockApi.createEvent.mock.calls).toHaveLength(0);
  });

  it('P05_TEST_019 Outcome is closed set', async () => {
    await expect(
      service.append(ACTOR, {
        ...baseAppendInput(),
        outcome: 'OK' as never,
      }),
    ).rejects.toMatchObject({ code: AUDIT_INVALID_OUTCOME });

    const outcomes = ['SUCCESS', 'DENIED', 'FAILURE'] as const;
    const outcomeKeys: Record<(typeof outcomes)[number], string> = {
      SUCCESS: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
      DENIED: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2',
      FAILURE: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb3',
    };
    for (const outcome of outcomes) {
      mockApi.createEvent.mockClear();
      mockApi.findEventByIdempotency.mockResolvedValue(null);
      mockApi.findChainHead.mockResolvedValue(null);
      await service.append(ACTOR, {
        ...baseAppendInput(),
        idempotencyKey: outcomeKeys[outcome],
        outcome,
      });
      expect(mockApi.createEvent.mock.calls[0]?.[0]?.outcome).toBe(outcome);
    }
  });

  it('P05_TEST_048 P2034 retry succeeds', async () => {
    let attempts = 0;
    repository.runSerializableTransaction.mockImplementation(
      <T>(work: (api: AuditPersistenceApi) => Promise<T>): Promise<T> => {
        attempts += 1;
        if (attempts === 1) {
          return Promise.reject(p2034Error());
        }
        return work(mockApi);
      },
    );

    const view = await service.append(ACTOR, baseAppendInput());
    expect(attempts).toBe(2);
    expect(view.tenantId).toBe(ACTOR.tenantId);
    expect(view.eventType).toBe('TEST_EVENT');
  });

  it('P05_TEST_049 Retry exhaustion fails closed', async () => {
    let attempts = 0;
    repository.runSerializableTransaction.mockImplementation((): Promise<never> => {
      attempts += 1;
      return Promise.reject(p2034Error());
    });

    await expect(service.append(ACTOR, baseAppendInput())).rejects.toMatchObject({
      code: AUDIT_RETRY_EXHAUSTED,
    });
    expect(attempts).toBe(1 + MAX_SERIALIZABLE_RETRIES);
  });
});
