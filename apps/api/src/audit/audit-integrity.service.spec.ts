import { AuditError, AUDIT_CHAIN_INTEGRITY_FAILED } from './audit-errors';
import { INITIAL_PREV_HASH } from './audit-event.types';
import { AuditHashService } from './audit-hash.service';
import { AuditIntegrityService } from './audit-integrity.service';
import type { AuditChainHeadRow, AuditEventRow, AuditRepository } from './audit.repository';

const TENANT = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

function buildValidEvent(
  hashService: AuditHashService,
  overrides: Partial<AuditEventRow> & { sequence: bigint; prevHash: string },
): AuditEventRow {
  const base = {
    id: overrides.id ?? 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    tenantId: overrides.tenantId ?? TENANT,
    sequence: overrides.sequence,
    idempotencyKey: overrides.idempotencyKey ?? 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    actorUserId: overrides.actorUserId ?? 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
    eventType: overrides.eventType ?? 'TEST_EVENT',
    outcome: overrides.outcome ?? ('SUCCESS' as const),
    resourceType: overrides.resourceType ?? null,
    resourceId: overrides.resourceId ?? null,
    occurredAt: overrides.occurredAt ?? new Date('2026-01-02T03:04:05.000Z'),
    recordedAt: overrides.recordedAt ?? new Date('2026-01-02T03:04:06.000Z'),
    correlationId: overrides.correlationId ?? null,
    metadata: overrides.metadata ?? null,
    prevHash: overrides.prevHash,
  };
  const { payloadHash } = hashService.buildAndHashPayload(base);
  const chainHash = hashService.hashChain(base.prevHash, payloadHash);
  return {
    ...base,
    payloadHash: overrides.payloadHash ?? payloadHash,
    chainHash: overrides.chainHash ?? chainHash,
  };
}

describe('AuditIntegrityService', () => {
  const hashService = new AuditHashService();

  function makeService(
    events: AuditEventRow[],
    head: AuditChainHeadRow | null,
  ): AuditIntegrityService {
    const repository = {
      findEventsForTenantOrdered: jest.fn().mockResolvedValue(events),
      findChainHead: jest.fn().mockResolvedValue(head),
    } as unknown as AuditRepository;
    return new AuditIntegrityService(repository, hashService);
  }

  it('P05_TEST_051 Empty chain -> PASS_EMPTY_CHAIN', async () => {
    const service = makeService([], null);
    await expect(service.verifyTenantChain(TENANT)).resolves.toEqual({
      status: 'PASS_EMPTY_CHAIN',
    });
  });

  it('P05_TEST_052 Tampered chain/event detected', async () => {
    const event = buildValidEvent(hashService, { sequence: 1n, prevHash: INITIAL_PREV_HASH });
    const head: AuditChainHeadRow = {
      tenantId: TENANT,
      lastSequence: 1n,
      lastHash: event.chainHash,
    };

    const tampered: AuditEventRow = {
      ...event,
      payloadHash: 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
    };
    const service = makeService([tampered], head);
    await expect(service.verifyTenantChain(TENANT)).rejects.toMatchObject({
      code: AUDIT_CHAIN_INTEGRITY_FAILED,
    });
    await expect(service.verifyTenantChain(TENANT)).rejects.toBeInstanceOf(AuditError);
  });

  it('P05_TEST_053 Chain-head mismatch detected', async () => {
    const event = buildValidEvent(hashService, { sequence: 1n, prevHash: INITIAL_PREV_HASH });
    const badHead: AuditChainHeadRow = {
      tenantId: TENANT,
      lastSequence: 99n,
      lastHash: event.chainHash,
    };
    const service = makeService([event], badHead);
    await expect(service.verifyTenantChain(TENANT)).rejects.toMatchObject({
      code: AUDIT_CHAIN_INTEGRITY_FAILED,
    });

    const pass = makeService([event], {
      tenantId: TENANT,
      lastSequence: 1n,
      lastHash: event.chainHash,
    });
    await expect(pass.verifyTenantChain(TENANT)).resolves.toEqual({
      status: 'PASS',
      chainLength: 1,
    });
  });
});
