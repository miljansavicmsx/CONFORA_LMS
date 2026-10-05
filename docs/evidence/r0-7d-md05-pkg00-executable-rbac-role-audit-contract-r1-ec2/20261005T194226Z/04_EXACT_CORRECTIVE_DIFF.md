# 04 — Exact corrective diff

Diff base: `939472decb2002045d5f20bc3c894e7f34919afe`.
This file records the implementation and test diff only.
The evidence files in this directory are additional commit paths and are not duplicated inside this diff.

`packages/shared-types` and `apps/api/src/audit/audit-validators.ts` are absent from the diff.
The service diff is `git diff` of `audit.service.ts`.
The spec diff is `git diff --no-index` of the new production-append spec against `/dev/null`.

Unified diffs represent an empty context line as a single space.
Those lines, and any other trailing whitespace, are written with the suffix `<BLANK_OR_TRAILING_WS>` so this evidence file passes `git diff --check`.
WHITESPACE_LINES_MARKED = 4
The source diff itself passed `git diff --check` before this transcription.

```diff
diff --git a/apps/api/src/audit/audit.service.ts b/apps/api/src/audit/audit.service.ts
index 78e95db..bf4e973 100644
--- a/apps/api/src/audit/audit.service.ts
+++ b/apps/api/src/audit/audit.service.ts
@@ -1,6 +1,7 @@
 import { randomUUID } from 'node:crypto';
 import { Inject, Injectable, Optional, Scope } from '@nestjs/common';
 import { Prisma } from '@confora/database';
+import { isRevokePostReviewDuePeriod } from '@confora/shared-types';
<BLANK_OR_TRAILING_WS>
 import type { AuthenticatedActor } from '../auth/request-principal';
 import { TenantContextStore } from '../tenant/tenant-context.store';
@@ -9,10 +10,16 @@ import {
   AUDIT_ACTOR_REQUIRED,
   AUDIT_APPEND_FAILED,
   AUDIT_IDEMPOTENCY_CONFLICT,
+  AUDIT_METADATA_INVALID,
   AUDIT_RETRY_EXHAUSTED,
   AUDIT_TENANT_CONTEXT_MISMATCH,
 } from './audit-errors';
-import { AuditEventRegistry } from './audit-event.registry';
+import {
+  AuditEventRegistry,
+  ROLE_ADMINISTRATION_AUDIT_EVENT_TYPES,
+  validateRoleAdministrationAuditMetadata,
+  type RoleAdministrationAuditEventType,
+} from './audit-event.registry';
 import {
   INITIAL_PREV_HASH,
   MAX_SERIALIZABLE_RETRIES,
@@ -33,6 +40,51 @@ import {
<BLANK_OR_TRAILING_WS>
 export const AUDIT_EVENT_REGISTRY = 'AUDIT_EVENT_REGISTRY' as const;
<BLANK_OR_TRAILING_WS>
+function isRoleAdministrationAuditEvent(
+  eventType: string,
+): eventType is RoleAdministrationAuditEventType {
+  return (ROLE_ADMINISTRATION_AUDIT_EVENT_TYPES as readonly string[]).includes(eventType);
+}
+
+/**
+ * PKG-00 events keep the generic allowlist and then the role-administration
+ * semantic validator. Other events return the allowlisted metadata unchanged.
+ * Actor-tenant agreement and the PT24H revoke deadline are enforced here,
+ * before any persistence call.
+ */
+function enforceRoleAdministrationAuditMetadata(
+  eventType: string,
+  rawMetadata: unknown,
+  allowlistedMetadata: unknown,
+  actorTenantId: string,
+): unknown {
+  if (!isRoleAdministrationAuditEvent(eventType)) {
+    return allowlistedMetadata;
+  }
+  const semantic = validateRoleAdministrationAuditMetadata(eventType, rawMetadata);
+  if (semantic['tenantId'] !== actorTenantId) {
+    throw new AuditError(
+      AUDIT_METADATA_INVALID,
+      'Role audit metadata tenant does not match the actor tenant.',
+    );
+  }
+  if (eventType === 'ROLE_REVOKE_APPLIED') {
+    const occurredAt = semantic['occurredAt'];
+    const reviewDueAt = semantic['reviewDueAt'];
+    if (
+      typeof occurredAt !== 'string' ||
+      typeof reviewDueAt !== 'string' ||
+      !isRevokePostReviewDuePeriod(occurredAt, reviewDueAt)
+    ) {
+      throw new AuditError(
+        AUDIT_METADATA_INVALID,
+        'Revoke review deadline must equal PT24H after occurredAt.',
+      );
+    }
+  }
+  return semantic;
+}
+
 function isPrismaKnownRequestError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
   return (
     typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string'
@@ -111,7 +163,13 @@ export class AuditService {
       input.correlationId === ''
         ? null
         : input.correlationId;
-    const metadata = validateMetadataForEvent(definition, input.metadata);
+    const allowlistedMetadata = validateMetadataForEvent(definition, input.metadata);
+    const metadata = enforceRoleAdministrationAuditMetadata(
+      input.eventType,
+      input.metadata,
+      allowlistedMetadata,
+      actor.tenantId,
+    );
<BLANK_OR_TRAILING_WS>
     const fingerprint = buildIdempotencyFingerprint({
       actorUserId: actor.userId,

diff --git a/apps/api/src/audit/md05-pkg00-production-append.spec.ts b/apps/api/src/audit/md05-pkg00-production-append.spec.ts
new file mode 100644
index 0000000..4aebab1
--- /dev/null
+++ b/apps/api/src/audit/md05-pkg00-production-append.spec.ts
@@ -0,0 +1,532 @@
+import { Prisma } from '@confora/database';
+
+import type { AuthenticatedActor } from '../auth/request-principal';
+import type { TenantContextStore } from '../tenant/tenant-context.store';
+import { AuditError, AUDIT_EVENT_NOT_REGISTERED, AUDIT_METADATA_INVALID } from './audit-errors';
+import {
+  AuditEventRegistry,
+  ROLE_ADMINISTRATION_AUDIT_EVENT_DEFINITIONS,
+  ROLE_ADMINISTRATION_AUDIT_EVENT_TYPES,
+  validateRoleAdministrationAuditMetadata,
+  type RoleAdministrationAuditEventType,
+} from './audit-event.registry';
+import { INITIAL_PREV_HASH, type AuditAppendInput } from './audit-event.types';
+import * as auditValidators from './audit-validators';
+import { AuditHashService } from './audit-hash.service';
+import type {
+  AuditEventCreateData,
+  AuditEventRow,
+  AuditPersistenceApi,
+  AuditRepository,
+} from './audit.repository';
+import { AuditService } from './audit.service';
+
+const TENANT = '22222222-2222-4222-8222-222222222222';
+const OTHER_TENANT = '99999999-9999-4999-8999-999999999999';
+const ACTOR_USER = '44444444-4444-4444-8444-444444444444';
+const TARGET = '33333333-3333-4333-8333-333333333333';
+const APPROVER = '55555555-5555-4555-8555-555555555555';
+const REVIEWER = '66666666-6666-4666-8666-666666666666';
+const REQUEST = '22222222-2222-4222-8222-222222222222';
+const OCCURRED_AT = '2026-10-05T10:00:00.000Z';
+const REVIEW_DUE_AT = '2026-10-06T10:00:00.000Z';
+const SECRET = 'raw-secret-ec2-do-not-leak';
+
+const ACTOR: AuthenticatedActor = {
+  userId: ACTOR_USER,
+  tenantId: TENANT,
+  issuer: 'http://issuer.test/realms/confora',
+  subject: 'actor-subject',
+  email: 'actor@example.test',
+  roles: ['STAFF_ROLEADM'],
+  mfaVerified: true,
+};
+
+const GRANT_APPROVAL_EVENTS = new Set<RoleAdministrationAuditEventType>([
+  'ROLE_GRANT_APPROVED',
+  'ROLE_GRANT_APPLIED',
+  'ROLE_GRANT_REJECTED',
+]);
+
+function toEventRow(data: AuditEventCreateData): AuditEventRow {
+  return {
+    id: data.id,
+    tenantId: data.tenantId,
+    sequence: data.sequence,
+    idempotencyKey: data.idempotencyKey,
+    actorUserId: data.actorUserId,
+    eventType: data.eventType,
+    outcome: data.outcome,
+    resourceType: data.resourceType,
+    resourceId: data.resourceId,
+    occurredAt: data.occurredAt,
+    recordedAt: data.recordedAt,
+    correlationId: data.correlationId,
+    metadata:
+      data.metadata === null || data.metadata === Prisma.JsonNull
+        ? null
+        : (data.metadata as Prisma.JsonValue),
+    prevHash: data.prevHash,
+    payloadHash: data.payloadHash,
+    chainHash: data.chainHash,
+  };
+}
+
+function roleMetadata(
+  eventType: RoleAdministrationAuditEventType,
+  overrides: Record<string, unknown> = {},
+): Record<string, unknown> {
+  const metadata: Record<string, unknown> = {
+    eventId: 'evt-pkg00-ec2',
+    occurredAt: OCCURRED_AT,
+    tenantId: TENANT,
+    actorUserId: ACTOR_USER,
+    actorExternalSubjectId: 'actor-subject',
+    actorRole: 'STAFF_ROLEADM',
+    targetUserId: TARGET,
+    targetExternalSubjectId: 'target-subject',
+    role: 'COMPLAINT_HANDLER',
+    requestId: REQUEST,
+    reasonCode: 'ASSIGNMENT_REQUIRED',
+    correlationId: 'corr-pkg00-ec2',
+    sourceSystem: 'EXTERNAL_OIDC_IDP_CANONICAL',
+    decision: 'REQUESTED',
+    previousState: 'ABSENT',
+    resultingState: 'PENDING',
+  };
+  if (GRANT_APPROVAL_EVENTS.has(eventType)) {
+    metadata['initiatorUserId'] = ACTOR_USER;
+    metadata['initiatorExternalSubjectId'] = 'actor-subject';
+    metadata['initiatorRole'] = 'STAFF_ROLEADM';
+    metadata['approverUserId'] = APPROVER;
+    metadata['approverExternalSubjectId'] = 'approver-subject';
+    metadata['approverRole'] = 'STAFF_ROLEADM';
+    metadata['decision'] = 'APPROVED';
+  }
+  if (eventType === 'ROLE_GRANT_FAILED' || eventType === 'ROLE_REVOKE_FAILED') {
+    metadata['errorCode'] = 'UPSTREAM_REJECTED';
+    metadata['decision'] = 'FAILED';
+  }
+  if (eventType === 'ROLE_REVOKE_APPLIED') {
+    metadata['reviewDueAt'] = REVIEW_DUE_AT;
+    metadata['decision'] = 'APPLIED';
+    metadata['previousState'] = 'ACTIVE';
+    metadata['resultingState'] = 'REVOKED';
+  }
+  if (eventType === 'ROLE_REVOKE_REVIEWED') {
+    metadata['reviewerUserId'] = REVIEWER;
+    metadata['reviewerExternalSubjectId'] = 'reviewer-subject';
+    metadata['reviewerRole'] = 'STAFF_ROLEADM';
+    metadata['reviewedAt'] = '2026-10-05T16:00:00.000Z';
+    metadata['decision'] = 'REVIEWED';
+  }
+  return { ...metadata, ...overrides };
+}
+
+describe('MD05 PKG-00 production audit append enforcement', () => {
+  let sequence = 0;
+  let mockApi: jest.Mocked<AuditPersistenceApi>;
+  let service: AuditService;
+
+  function nextKey(): string {
+    sequence += 1;
+    return `dddddddd-dddd-4ddd-8ddd-${sequence.toString(16).padStart(12, '0')}`;
+  }
+
+  function appendInput(
+    eventType: string,
+    metadata: unknown,
+    idempotencyKey = nextKey(),
+  ): AuditAppendInput {
+    return {
+      idempotencyKey,
+      eventType,
+      outcome: 'SUCCESS',
+      occurredAt: new Date(OCCURRED_AT),
+      correlationId: 'corr-pkg00-ec2',
+      metadata,
+    };
+  }
+
+  function persistenceCalls(): number {
+    return (
+      mockApi.findEventByIdempotency.mock.calls.length +
+      mockApi.findChainHead.mock.calls.length +
+      mockApi.createInitialChainHead.mock.calls.length +
+      mockApi.createEvent.mock.calls.length +
+      mockApi.advanceChainHeadCas.mock.calls.length
+    );
+  }
+
+  function clearPersistence(): void {
+    mockApi.findEventByIdempotency.mockClear();
+    mockApi.findChainHead.mockClear();
+    mockApi.createInitialChainHead.mockClear();
+    mockApi.createEvent.mockClear();
+    mockApi.advanceChainHeadCas.mockClear();
+  }
+
+  beforeEach(() => {
+    sequence = 0;
+    mockApi = {
+      findEventByIdempotency: jest.fn().mockResolvedValue(null),
+      findChainHead: jest.fn().mockResolvedValue(null),
+      createInitialChainHead: jest.fn().mockResolvedValue({
+        tenantId: TENANT,
+        lastSequence: 0n,
+        lastHash: INITIAL_PREV_HASH,
+      }),
+      createEvent: jest.fn((data: AuditEventCreateData) => Promise.resolve(toEventRow(data))),
+      advanceChainHeadCas: jest.fn().mockResolvedValue(true),
+    } as unknown as jest.Mocked<AuditPersistenceApi>;
+    const repository = {
+      runSerializableTransaction: jest.fn(
+        <T>(work: (api: AuditPersistenceApi) => Promise<T>): Promise<T> => work(mockApi),
+      ),
+    };
+    const tenantContext = { getRequiredTenantId: jest.fn(() => TENANT) };
+    service = new AuditService(
+      repository as unknown as AuditRepository,
+      new AuditHashService(),
+      tenantContext as unknown as TenantContextStore,
+      AuditEventRegistry.production(),
+    );
+  });
+
+  async function expectOneWrite(eventType: RoleAdministrationAuditEventType): Promise<void> {
+    await service.append(ACTOR, appendInput(eventType, roleMetadata(eventType)));
+    expect(mockApi.createEvent.mock.calls).toHaveLength(1);
+    expect(mockApi.createEvent.mock.calls[0]?.[0]?.eventType).toBe(eventType);
+  }
+
+  async function expectNoWrite(eventType: string, metadata: unknown): Promise<AuditError> {
+    clearPersistence();
+    let caught: unknown;
+    try {
+      await service.append(ACTOR, appendInput(eventType, metadata));
+    } catch (error) {
+      caught = error;
+    }
+    expect(caught).toBeInstanceOf(AuditError);
+    expect(mockApi.createEvent.mock.calls).toHaveLength(0);
+    expect(persistenceCalls()).toBe(0);
+    return caught as AuditError;
+  }
+
+  it('EC2-T01 valid ROLE_GRANT_REQUESTED reaches writer once', async () => {
+    await expectOneWrite('ROLE_GRANT_REQUESTED');
+  });
+
+  it('EC2-T02 valid ROLE_GRANT_APPROVED reaches writer once', async () => {
+    await expectOneWrite('ROLE_GRANT_APPROVED');
+  });
+
+  it('EC2-T03 valid ROLE_GRANT_APPLIED reaches writer once', async () => {
+    await expectOneWrite('ROLE_GRANT_APPLIED');
+  });
+
+  it('EC2-T04 valid ROLE_GRANT_REJECTED reaches writer once', async () => {
+    await expectOneWrite('ROLE_GRANT_REJECTED');
+  });
+
+  it('EC2-T05 valid ROLE_GRANT_FAILED reaches writer once', async () => {
+    await expectOneWrite('ROLE_GRANT_FAILED');
+  });
+
+  it('EC2-T06 valid ROLE_REVOKE_REQUESTED reaches writer once', async () => {
+    await expectOneWrite('ROLE_REVOKE_REQUESTED');
+  });
+
+  it('EC2-T07 valid ROLE_REVOKE_APPLIED reaches writer once', async () => {
+    await expectOneWrite('ROLE_REVOKE_APPLIED');
+  });
+
+  it('EC2-T08 valid ROLE_REVOKE_REVIEWED reaches writer once', async () => {
+    await expectOneWrite('ROLE_REVOKE_REVIEWED');
+  });
+
+  it('EC2-T09 valid ROLE_REVOKE_REJECTED reaches writer once', async () => {
+    await expectOneWrite('ROLE_REVOKE_REJECTED');
+  });
+
+  it('EC2-T10 valid ROLE_REVOKE_FAILED reaches writer once', async () => {
+    await expectOneWrite('ROLE_REVOKE_FAILED');
+  });
+
+  it('EC2-T11 null PKG-00 metadata rejected before write', async () => {
+    const error = await expectNoWrite('ROLE_GRANT_REQUESTED', null);
+    expect(error.code).toBe(AUDIT_METADATA_INVALID);
+  });
+
+  it('EC2-T12 missing tenantId rejected before write', async () => {
+    const metadata = roleMetadata('ROLE_GRANT_REQUESTED');
+    delete metadata['tenantId'];
+    const error = await expectNoWrite('ROLE_GRANT_REQUESTED', metadata);
+    expect(error.code).toBe(AUDIT_METADATA_INVALID);
+  });
+
+  it('EC2-T13 missing requestId rejected before write', async () => {
+    const metadata = roleMetadata('ROLE_GRANT_REQUESTED');
+    delete metadata['requestId'];
+    const error = await expectNoWrite('ROLE_GRANT_REQUESTED', metadata);
+    expect(error.code).toBe(AUDIT_METADATA_INVALID);
+  });
+
+  it('EC2-T14 missing correlationId rejected before write', async () => {
+    const metadata = roleMetadata('ROLE_REVOKE_REQUESTED');
+    delete metadata['correlationId'];
+    const error = await expectNoWrite('ROLE_REVOKE_REQUESTED', metadata);
+    expect(error.code).toBe(AUDIT_METADATA_INVALID);
+  });
+
+  it('EC2-T15 missing target identity rejected before write', async () => {
+    const metadata = roleMetadata('ROLE_GRANT_REQUESTED');
+    delete metadata['targetUserId'];
+    const error = await expectNoWrite('ROLE_GRANT_REQUESTED', metadata);
+    expect(error.code).toBe(AUDIT_METADATA_INVALID);
+  });
+
+  it('EC2-T16 missing actor identity rejected before write', async () => {
+    const metadata = roleMetadata('ROLE_REVOKE_REQUESTED');
+    delete metadata['actorUserId'];
+    const error = await expectNoWrite('ROLE_REVOKE_REQUESTED', metadata);
+    expect(error.code).toBe(AUDIT_METADATA_INVALID);
+  });
+
+  it('EC2-T17 wrong target role rejected before write', async () => {
+    const error = await expectNoWrite(
+      'ROLE_GRANT_REQUESTED',
+      roleMetadata('ROLE_GRANT_REQUESTED', { role: 'STAFF_DIR' }),
+    );
+    expect(error.code).toBe(AUDIT_METADATA_INVALID);
+  });
+
+  it('EC2-T18 wrong grant authority rejected before write', async () => {
+    const error = await expectNoWrite(
+      'ROLE_GRANT_APPROVED',
+      roleMetadata('ROLE_GRANT_APPROVED', { approverRole: 'STAFF_DIR' }),
+    );
+    expect(error.code).toBe(AUDIT_METADATA_INVALID);
+  });
+
+  it('EC2-T19 wrong revoke authority rejected before write', async () => {
+    const error = await expectNoWrite(
+      'ROLE_REVOKE_REVIEWED',
+      roleMetadata('ROLE_REVOKE_REVIEWED', { reviewerRole: 'COMPLAINT_HANDLER' }),
+    );
+    expect(error.code).toBe(AUDIT_METADATA_INVALID);
+  });
+
+  it('EC2-T20 identical grant initiator and approver rejected before write', async () => {
+    const error = await expectNoWrite(
+      'ROLE_GRANT_APPROVED',
+      roleMetadata('ROLE_GRANT_APPROVED', { approverUserId: ACTOR_USER }),
+    );
+    expect(error.code).toBe(AUDIT_METADATA_INVALID);
+  });
+
+  it('EC2-T21 identical revoke actor and reviewer rejected before write', async () => {
+    const error = await expectNoWrite(
+      'ROLE_REVOKE_REVIEWED',
+      roleMetadata('ROLE_REVOKE_REVIEWED', { reviewerUserId: ACTOR_USER }),
+    );
+    expect(error.code).toBe(AUDIT_METADATA_INVALID);
+  });
+
+  it('EC2-T22 self-assignment rejected before write', async () => {
+    const error = await expectNoWrite(
+      'ROLE_GRANT_REQUESTED',
+      roleMetadata('ROLE_GRANT_REQUESTED', { actorUserId: TARGET }),
+    );
+    expect(error.code).toBe(AUDIT_METADATA_INVALID);
+  });
+
+  it('EC2-T23 self-revocation rejected before write', async () => {
+    const error = await expectNoWrite(
+      'ROLE_REVOKE_REQUESTED',
+      roleMetadata('ROLE_REVOKE_REQUESTED', { actorUserId: TARGET }),
+    );
+    expect(error.code).toBe(AUDIT_METADATA_INVALID);
+  });
+
+  it('EC2-T24 cross-tenant grant rejected before write', async () => {
+    const error = await expectNoWrite(
+      'ROLE_GRANT_REQUESTED',
+      roleMetadata('ROLE_GRANT_REQUESTED', { tenantId: OTHER_TENANT }),
+    );
+    expect(error.code).toBe(AUDIT_METADATA_INVALID);
+    expect(error.message).not.toContain(OTHER_TENANT);
+  });
+
+  it('EC2-T25 cross-tenant revoke rejected before write', async () => {
+    const error = await expectNoWrite(
+      'ROLE_REVOKE_REQUESTED',
+      roleMetadata('ROLE_REVOKE_REQUESTED', { tenantId: OTHER_TENANT }),
+    );
+    expect(error.code).toBe(AUDIT_METADATA_INVALID);
+    expect(error.message).not.toContain(OTHER_TENANT);
+  });
+
+  it('EC2-T26 invalid PT24H deadline rejected before write', async () => {
+    const error = await expectNoWrite(
+      'ROLE_REVOKE_APPLIED',
+      roleMetadata('ROLE_REVOKE_APPLIED', { reviewDueAt: '2026-10-06T11:00:00.000Z' }),
+    );
+    expect(error.code).toBe(AUDIT_METADATA_INVALID);
+    expect(error.message).toContain('PT24H');
+  });
+
+  it('EC2-T27 forbidden metadata rejected before write', async () => {
+    const error = await expectNoWrite(
+      'ROLE_GRANT_REQUESTED',
+      roleMetadata('ROLE_GRANT_REQUESTED', { password: SECRET }),
+    );
+    expect(error.code).toBe(AUDIT_METADATA_INVALID);
+    expect(error.message).not.toContain(SECRET);
+  });
+
+  it('EC2-T28 validation failure does not expose raw metadata or secrets', async () => {
+    const log = jest.spyOn(console, 'log').mockImplementation(() => undefined);
+    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
+    const errorLog = jest.spyOn(console, 'error').mockImplementation(() => undefined);
+    const info = jest.spyOn(console, 'info').mockImplementation(() => undefined);
+    try {
+      const error = await expectNoWrite(
+        'ROLE_REVOKE_FAILED',
+        roleMetadata('ROLE_REVOKE_FAILED', { accessToken: SECRET }),
+      );
+      const rendered = `${error.name} ${error.code} ${error.message}`;
+      expect(rendered).not.toContain(SECRET);
+      expect(rendered).not.toContain('accessToken');
+      const logged = [log, warn, errorLog, info]
+        .flatMap((spy) => spy.mock.calls)
+        .flat()
+        .map((value) => String(value))
+        .join('\n');
+      expect(logged).not.toContain(SECRET);
+    } finally {
+      log.mockRestore();
+      warn.mockRestore();
+      errorLog.mockRestore();
+      info.mockRestore();
+    }
+  });
+
+  it('EC2-T29 non-PKG-00 event retains previous behavior', async () => {
+    const registry = new AuditEventRegistry([
+      {
+        eventType: 'TEST_EVENT',
+        resourceTypePolicy: 'OPTIONAL',
+        metadataSchema: { type: 'object', properties: { note: { type: 'string' } } },
+      },
+    ]);
+    const repository = {
+      runSerializableTransaction: jest.fn(
+        <T>(work: (api: AuditPersistenceApi) => Promise<T>): Promise<T> => work(mockApi),
+      ),
+    };
+    const tenantContext = { getRequiredTenantId: jest.fn(() => TENANT) };
+    const other = new AuditService(
+      repository as unknown as AuditRepository,
+      new AuditHashService(),
+      tenantContext as unknown as TenantContextStore,
+      registry,
+    );
+    clearPersistence();
+    await other.append(ACTOR, appendInput('TEST_EVENT', { note: 'ok' }));
+    expect(mockApi.createEvent.mock.calls).toHaveLength(1);
+    clearPersistence();
+    await other.append(ACTOR, appendInput('TEST_EVENT', null));
+    expect(mockApi.createEvent.mock.calls).toHaveLength(1);
+    expect(mockApi.createEvent.mock.calls[0]?.[0]?.metadata).toBeNull();
+  });
+
+  it('EC2-T30 unknown event retains previous rejection behavior', async () => {
+    const error = await expectNoWrite('NOT_A_ROLE_EVENT', { note: 'ok' });
+    expect(error.code).toBe(AUDIT_EVENT_NOT_REGISTERED);
+  });
+
+  it('EC2-T31 generic allowlist validation still executes', async () => {
+    const generic = jest.spyOn(auditValidators, 'validateMetadataForEvent');
+    try {
+      await service.append(
+        ACTOR,
+        appendInput('ROLE_GRANT_REQUESTED', roleMetadata('ROLE_GRANT_REQUESTED')),
+      );
+      expect(generic).toHaveBeenCalled();
+      clearPersistence();
+      generic.mockClear();
+      const error = await expectNoWrite(
+        'ROLE_GRANT_REQUESTED',
+        roleMetadata('ROLE_GRANT_REQUESTED', { notOnTheAllowlist: 'nope' }),
+      );
+      expect(error.code).toBe(AUDIT_METADATA_INVALID);
+      expect(generic).toHaveBeenCalled();
+    } finally {
+      generic.mockRestore();
+    }
+  });
+
+  it('EC2-T32 role-administration semantic validator executes for all ten events', async () => {
+    const semantic = jest.spyOn(
+      await import('./audit-event.registry'),
+      'validateRoleAdministrationAuditMetadata',
+    );
+    try {
+      for (const eventType of ROLE_ADMINISTRATION_AUDIT_EVENT_TYPES) {
+        const metadata = roleMetadata(eventType);
+        delete metadata['actorRole'];
+        const error = await expectNoWrite(eventType, metadata);
+        expect(error.code).toBe(AUDIT_METADATA_INVALID);
+      }
+      expect(semantic).toHaveBeenCalledTimes(ROLE_ADMINISTRATION_AUDIT_EVENT_TYPES.length);
+      expect(validateRoleAdministrationAuditMetadata).toBe(semantic);
+    } finally {
+      semantic.mockRestore();
+    }
+  });
+
+  it('EC2-T33 no duplicate audit event identifiers', () => {
+    const types = ROLE_ADMINISTRATION_AUDIT_EVENT_DEFINITIONS.map(
+      (definition) => definition.eventType,
+    );
+    expect(new Set(types).size).toBe(types.length);
+    expect(types).toHaveLength(10);
+    expect(
+      () =>
+        new AuditEventRegistry([
+          ...ROLE_ADMINISTRATION_AUDIT_EVENT_DEFINITIONS,
+          ...ROLE_ADMINISTRATION_AUDIT_EVENT_DEFINITIONS,
+        ]),
+    ).toThrow(AuditError);
+  });
+
+  it('EC2-T34 persistence mock remains untouched for every invalid case', async () => {
+    const cases: Array<[string, unknown]> = [
+      ['ROLE_GRANT_REQUESTED', null],
+      ['ROLE_GRANT_REQUESTED', { ...roleMetadata('ROLE_GRANT_REQUESTED'), tenantId: undefined }],
+      ['ROLE_GRANT_APPROVED', roleMetadata('ROLE_GRANT_APPROVED', { approverUserId: ACTOR_USER })],
+      [
+        'ROLE_REVOKE_REVIEWED',
+        roleMetadata('ROLE_REVOKE_REVIEWED', { reviewerUserId: ACTOR_USER }),
+      ],
+      ['ROLE_GRANT_REQUESTED', roleMetadata('ROLE_GRANT_REQUESTED', { actorUserId: TARGET })],
+      ['ROLE_REVOKE_REQUESTED', roleMetadata('ROLE_REVOKE_REQUESTED', { actorUserId: TARGET })],
+      ['ROLE_GRANT_REQUESTED', roleMetadata('ROLE_GRANT_REQUESTED', { tenantId: OTHER_TENANT })],
+      ['ROLE_REVOKE_REQUESTED', roleMetadata('ROLE_REVOKE_REQUESTED', { tenantId: OTHER_TENANT })],
+      [
+        'ROLE_REVOKE_APPLIED',
+        roleMetadata('ROLE_REVOKE_APPLIED', { reviewDueAt: '2026-10-05T12:00:00.000Z' }),
+      ],
+      ['ROLE_GRANT_FAILED', roleMetadata('ROLE_GRANT_FAILED', { privateKey: SECRET })],
+    ];
+    const missingTenant = roleMetadata('ROLE_GRANT_REQUESTED');
+    delete missingTenant['tenantId'];
+    cases[1] = ['ROLE_GRANT_REQUESTED', missingTenant];
+    for (const [eventType, metadata] of cases) {
+      const error = await expectNoWrite(eventType, metadata);
+      expect(error).toBeInstanceOf(AuditError);
+      expect(persistenceCalls()).toBe(0);
+    }
+  });
+});
```
