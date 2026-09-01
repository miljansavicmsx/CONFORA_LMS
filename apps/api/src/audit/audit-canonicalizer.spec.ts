import {
  buildCanonicalAuditPayloadV1,
  canonicalizeMetadata,
  serializeCanonicalPayloadV1,
} from './audit-canonicalizer';
import { CANONICAL_PAYLOAD_VERSION } from './audit-event.types';

describe('audit-canonicalizer', () => {
  it('P05_TEST_026 Canonical top-level field order stable', () => {
    const occurredAt = new Date('2026-01-02T03:04:05.006Z');
    const recordedAt = new Date('2026-01-02T03:04:06.007Z');
    const payload = buildCanonicalAuditPayloadV1({
      id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      tenantId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      sequence: 1n,
      idempotencyKey: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      actorUserId: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
      eventType: 'TEST_EVENT',
      outcome: 'SUCCESS',
      resourceType: null,
      resourceId: null,
      occurredAt,
      recordedAt,
      correlationId: null,
      metadata: null,
    });

    expect(Object.keys(payload)).toEqual([
      'version',
      'id',
      'tenantId',
      'sequence',
      'idempotencyKey',
      'actorUserId',
      'eventType',
      'outcome',
      'resourceType',
      'resourceId',
      'occurredAt',
      'recordedAt',
      'correlationId',
      'metadata',
    ]);
    expect(payload.version).toBe(CANONICAL_PAYLOAD_VERSION);
    expect(payload.version).toBe('CONFORA_AUDIT_PAYLOAD_V1');

    const json = serializeCanonicalPayloadV1(payload);
    for (const key of Object.keys(payload)) {
      expect(json.indexOf(`"${key}"`)).toBeGreaterThanOrEqual(0);
    }
    const positions = Object.keys(payload).map((key) => json.indexOf(`"${key}"`));
    const sorted = [...positions].sort((a, b) => a - b);
    expect(positions).toEqual(sorted);
  });

  it('P05_TEST_027 Metadata insertion order does not change canonical result', () => {
    const a = canonicalizeMetadata({ b: 1, a: 2, c: { z: true, y: false } });
    const b = canonicalizeMetadata({ c: { y: false, z: true }, a: 2, b: 1 });
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    expect(Object.keys(a as object)).toEqual(['a', 'b', 'c']);
  });

  it('P05_TEST_028 Optional fields canonicalize as explicit null', () => {
    const payload = buildCanonicalAuditPayloadV1({
      id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      tenantId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      sequence: 1n,
      idempotencyKey: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      actorUserId: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
      eventType: 'TEST_EVENT',
      outcome: 'DENIED',
      resourceType: null,
      resourceId: null,
      occurredAt: new Date('2026-01-02T03:04:05.000Z'),
      recordedAt: new Date('2026-01-02T03:04:06.000Z'),
      correlationId: null,
      metadata: undefined,
    });
    expect(payload.resourceType).toBeNull();
    expect(payload.resourceId).toBeNull();
    expect(payload.correlationId).toBeNull();
    expect(payload.metadata).toBeNull();
    expect(serializeCanonicalPayloadV1(payload)).toContain('"resourceType":null');
    expect(serializeCanonicalPayloadV1(payload)).toContain('"metadata":null');
  });

  it('P05_TEST_029 BigInt sequence canonicalizes as decimal string', () => {
    const payload = buildCanonicalAuditPayloadV1({
      id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      tenantId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      sequence: 42n,
      idempotencyKey: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      actorUserId: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
      eventType: 'TEST_EVENT',
      outcome: 'SUCCESS',
      resourceType: 'Course',
      resourceId: 'r1',
      occurredAt: new Date('2026-01-02T03:04:05.000Z'),
      recordedAt: new Date('2026-01-02T03:04:06.000Z'),
      correlationId: 'corr',
      metadata: null,
    });
    expect(payload.sequence).toBe('42');
    expect(typeof payload.sequence).toBe('string');
  });

  it('P05_TEST_030 Timestamps canonicalize ISO UTC milliseconds', () => {
    const occurredAt = new Date('2026-08-31T12:34:56.789Z');
    const recordedAt = new Date('2026-08-31T12:34:57.001Z');
    const payload = buildCanonicalAuditPayloadV1({
      id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      tenantId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      sequence: 1n,
      idempotencyKey: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      actorUserId: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
      eventType: 'TEST_EVENT',
      outcome: 'FAILURE',
      resourceType: null,
      resourceId: null,
      occurredAt,
      recordedAt,
      correlationId: null,
      metadata: null,
    });
    expect(payload.occurredAt).toBe('2026-08-31T12:34:56.789Z');
    expect(payload.recordedAt).toBe('2026-08-31T12:34:57.001Z');
  });
});
