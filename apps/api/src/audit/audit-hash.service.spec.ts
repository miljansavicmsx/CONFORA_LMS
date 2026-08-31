import { createHash } from 'node:crypto';

import { buildCanonicalAuditPayloadV1, serializeCanonicalPayloadV1 } from './audit-canonicalizer';
import { INITIAL_PREV_HASH } from './audit-event.types';
import { AuditHashService } from './audit-hash.service';

describe('AuditHashService', () => {
  const hashService = new AuditHashService();

  it('P05_TEST_031 payloadHash deterministic and exact SHA-256', () => {
    const parts = {
      id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      tenantId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      sequence: 1n,
      idempotencyKey: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      actorUserId: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
      eventType: 'TEST_EVENT',
      outcome: 'SUCCESS' as const,
      resourceType: null,
      resourceId: null,
      occurredAt: new Date('2026-01-02T03:04:05.006Z'),
      recordedAt: new Date('2026-01-02T03:04:06.007Z'),
      correlationId: null,
      metadata: null,
    };
    const payload = buildCanonicalAuditPayloadV1(parts);
    const utf8 = serializeCanonicalPayloadV1(payload);
    const expected = createHash('sha256').update(utf8, 'utf8').digest('hex');

    const first = hashService.hashPayload(payload);
    const second = hashService.hashPayload(payload);
    expect(first).toBe(expected);
    expect(second).toBe(expected);
    expect(first).toMatch(/^[0-9a-f]{64}$/);

    const built = hashService.buildAndHashPayload(parts);
    expect(built.payloadHash).toBe(expected);
  });

  it('P05_TEST_032 chainHash exact V1 formula', () => {
    const prevHash = INITIAL_PREV_HASH;
    const payloadHash = createHash('sha256').update('fixture', 'utf8').digest('hex');
    const input = `CONFORA_AUDIT_CHAIN_V1|${prevHash}|${payloadHash}`;
    const expected = createHash('sha256').update(input, 'utf8').digest('hex');
    expect(hashService.hashChain(prevHash, payloadHash)).toBe(expected);
    expect(hashService.hashChain(prevHash, payloadHash)).toMatch(/^[0-9a-f]{64}$/);
  });
});
