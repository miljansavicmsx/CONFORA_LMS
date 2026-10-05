import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { LOCAL_DATABASE_ROLE_AUTHORITY } from '@confora/shared-types';

import { AuditError, AUDIT_METADATA_INVALID } from './audit-errors';
import {
  FORBIDDEN_ROLE_AUDIT_METADATA_KEYS,
  ROLE_ADMINISTRATION_AUDIT_EVENT_DEFINITIONS,
  ROLE_ADMINISTRATION_AUDIT_EVENT_TYPES,
  ROLE_AUDIT_COMMON_METADATA_KEYS,
  AuditEventRegistry,
  validateRoleAdministrationAuditMetadata,
  type RoleAdministrationAuditEventType,
} from './audit-event.registry';
import { validateMetadataForEvent } from './audit-validators';

describe('MD05 PKG-00 role audit contract', () => {
  it('T19 all ten audit-event definitions exist', () => {
    const registry = AuditEventRegistry.production();
    expect(registry.size()).toBe(ROLE_ADMINISTRATION_AUDIT_EVENT_TYPES.length);
    expect(ROLE_ADMINISTRATION_AUDIT_EVENT_TYPES).toHaveLength(10);
    for (const eventType of ROLE_ADMINISTRATION_AUDIT_EVENT_TYPES) {
      expect(registry.has(eventType)).toBe(true);
      const definition = registry.get(eventType);
      expect(definition.metadataSchema).not.toBeNull();
      if (definition.metadataSchema === null) {
        throw new Error('Role audit metadata schema is missing.');
      }
      const schema = definition.metadataSchema;
      for (const key of ROLE_AUDIT_COMMON_METADATA_KEYS) {
        expect(schema.properties[key]).toEqual({ type: 'string' });
      }
    }
  });

  it('T20 audit metadata excludes forbidden sensitive keys', () => {
    const registry = AuditEventRegistry.production();
    for (const eventType of ROLE_ADMINISTRATION_AUDIT_EVENT_TYPES) {
      const definition = registry.get(eventType);
      if (definition.metadataSchema === null) {
        throw new Error('Role audit metadata schema is missing.');
      }
      const schema = definition.metadataSchema;
      for (const key of FORBIDDEN_ROLE_AUDIT_METADATA_KEYS) {
        expect(schema.properties[key]).toBeUndefined();
        expect(() => validateMetadataForEvent(definition, { [key]: 'secret-value' })).toThrow(
          AuditError,
        );
        try {
          validateMetadataForEvent(definition, { [key]: 'secret-value' });
        } catch (error) {
          expect((error as AuditError).code).toBe(AUDIT_METADATA_INVALID);
        }
      }
    }
  });

  it('T21 production audit registry has no duplicate event identifiers', () => {
    const registry = AuditEventRegistry.production();
    const types = ROLE_ADMINISTRATION_AUDIT_EVENT_DEFINITIONS.map(
      (definition) => definition.eventType,
    );
    expect(new Set(types).size).toBe(types.length);
    expect(registry.size()).toBe(new Set(types).size);
    expect(
      () =>
        new AuditEventRegistry([
          ...ROLE_ADMINISTRATION_AUDIT_EVENT_DEFINITIONS,
          ...ROLE_ADMINISTRATION_AUDIT_EVENT_DEFINITIONS,
        ]),
    ).toThrow(AuditError);
  });

  it('T23 no local database role authority is introduced', () => {
    expect(LOCAL_DATABASE_ROLE_AUTHORITY).toBe(false);
    const schemaPath = join(__dirname, '../../../../packages/database/prisma/schema.prisma');
    const schema = readFileSync(schemaPath, 'utf8');
    const userBlock = schema.slice(
      schema.indexOf('model User {'),
      schema.indexOf('model ExternalIdentityLink'),
    );
    expect(userBlock).not.toMatch(/\brole\b/i);
    expect(schema).not.toMatch(/model\s+\w*RoleAssignment\w*/);
  });
});

const TENANT = '11111111-1111-4111-8111-111111111111';
const REQUEST = '22222222-2222-4222-8222-222222222222';
const TARGET = '33333333-3333-4333-8333-333333333333';
const ACTOR = '44444444-4444-4444-8444-444444444444';
const APPROVER = '55555555-5555-4555-8555-555555555555';
const REVIEWER = '66666666-6666-4666-8666-666666666666';

const GRANT_APPROVAL_EVENTS = new Set<RoleAdministrationAuditEventType>([
  'ROLE_GRANT_APPROVED',
  'ROLE_GRANT_APPLIED',
  'ROLE_GRANT_REJECTED',
]);

function roleAuditMetadata(
  eventType: RoleAdministrationAuditEventType,
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  const metadata: Record<string, unknown> = {
    eventId: 'evt-pkg00',
    occurredAt: '2026-10-05T10:00:00.000Z',
    tenantId: TENANT,
    actorUserId: ACTOR,
    actorExternalSubjectId: 'actor-subject',
    actorRole: 'STAFF_ROLEADM',
    targetUserId: TARGET,
    targetExternalSubjectId: 'target-subject',
    role: 'COMPLAINT_HANDLER',
    requestId: REQUEST,
    reasonCode: 'ASSIGNMENT_REQUIRED',
    correlationId: 'corr-pkg00',
    sourceSystem: 'EXTERNAL_OIDC_IDP_CANONICAL',
    decision: 'REQUESTED',
    previousState: 'ABSENT',
    resultingState: 'PENDING',
  };
  if (GRANT_APPROVAL_EVENTS.has(eventType)) {
    metadata['initiatorUserId'] = ACTOR;
    metadata['initiatorExternalSubjectId'] = 'actor-subject';
    metadata['initiatorRole'] = 'STAFF_ROLEADM';
    metadata['approverUserId'] = APPROVER;
    metadata['approverExternalSubjectId'] = 'approver-subject';
    metadata['approverRole'] = 'STAFF_ROLEADM';
    metadata['decision'] = 'APPROVED';
  }
  if (eventType === 'ROLE_GRANT_FAILED' || eventType === 'ROLE_REVOKE_FAILED') {
    metadata['errorCode'] = 'UPSTREAM_REJECTED';
    metadata['decision'] = 'FAILED';
  }
  if (eventType === 'ROLE_REVOKE_APPLIED') {
    metadata['reviewDueAt'] = '2026-10-06T10:00:00.000Z';
    metadata['decision'] = 'APPLIED';
    metadata['previousState'] = 'ACTIVE';
    metadata['resultingState'] = 'REVOKED';
  }
  if (eventType === 'ROLE_REVOKE_REVIEWED') {
    metadata['reviewerUserId'] = REVIEWER;
    metadata['reviewerExternalSubjectId'] = 'reviewer-subject';
    metadata['reviewerRole'] = 'STAFF_ROLEADM';
    metadata['reviewedAt'] = '2026-10-05T16:00:00.000Z';
    metadata['decision'] = 'REVIEWED';
  }
  return { ...metadata, ...overrides };
}

describe('MD05 PKG-00 EC1 role audit metadata contract', () => {
  it('EC1-T23 ROLE_REVOKE_REVIEWED requires reviewer identity', () => {
    const metadata = roleAuditMetadata('ROLE_REVOKE_REVIEWED');
    delete metadata['reviewerUserId'];
    expect(() => validateRoleAdministrationAuditMetadata('ROLE_REVOKE_REVIEWED', metadata)).toThrow(
      AuditError,
    );
    const withoutSubject = roleAuditMetadata('ROLE_REVOKE_REVIEWED');
    delete withoutSubject['reviewerExternalSubjectId'];
    expect(() =>
      validateRoleAdministrationAuditMetadata('ROLE_REVOKE_REVIEWED', withoutSubject),
    ).toThrow(AuditError);
    const withoutRole = roleAuditMetadata('ROLE_REVOKE_REVIEWED');
    delete withoutRole['reviewerRole'];
    expect(() =>
      validateRoleAdministrationAuditMetadata('ROLE_REVOKE_REVIEWED', withoutRole),
    ).toThrow(AuditError);
  });

  it('EC1-T24 ROLE_REVOKE_REVIEWED reviewer differs from actor', () => {
    expect(() =>
      validateRoleAdministrationAuditMetadata(
        'ROLE_REVOKE_REVIEWED',
        roleAuditMetadata('ROLE_REVOKE_REVIEWED', { reviewerUserId: ACTOR }),
      ),
    ).toThrow(AuditError);
    expect(() =>
      validateRoleAdministrationAuditMetadata(
        'ROLE_REVOKE_REVIEWED',
        roleAuditMetadata('ROLE_REVOKE_REVIEWED', {
          reviewerExternalSubjectId: 'actor-subject',
        }),
      ),
    ).toThrow(AuditError);
    const accepted = validateRoleAdministrationAuditMetadata(
      'ROLE_REVOKE_REVIEWED',
      roleAuditMetadata('ROLE_REVOKE_REVIEWED'),
    );
    expect(accepted['reviewerUserId']).toBe(REVIEWER);
    expect(accepted['reviewerUserId']).not.toBe(accepted['actorUserId']);
    expect(accepted['reviewerRole']).toBe('STAFF_ROLEADM');
    expect(accepted['decision']).toBe('REVIEWED');
    expect(accepted['reviewedAt']).toBe('2026-10-05T16:00:00.000Z');
    expect(accepted['requestId']).toBe(REQUEST);
    expect(accepted['correlationId']).toBe('corr-pkg00');
  });

  it('EC1-T25 null metadata rejected for every PKG-00 event', () => {
    for (const eventType of ROLE_ADMINISTRATION_AUDIT_EVENT_TYPES) {
      expect(() => validateRoleAdministrationAuditMetadata(eventType, null)).toThrow(AuditError);
      expect(() => validateRoleAdministrationAuditMetadata(eventType, undefined)).toThrow(
        AuditError,
      );
      const accepted = validateRoleAdministrationAuditMetadata(
        eventType,
        roleAuditMetadata(eventType),
      );
      expect(accepted['tenantId']).toBe(TENANT);
      expect(accepted).not.toBeNull();
    }
  });

  it('EC1-T26 missing tenantId rejected', () => {
    for (const eventType of ROLE_ADMINISTRATION_AUDIT_EVENT_TYPES) {
      const metadata = roleAuditMetadata(eventType);
      delete metadata['tenantId'];
      expect(() => validateRoleAdministrationAuditMetadata(eventType, metadata)).toThrow(
        AuditError,
      );
    }
  });

  it('EC1-T27 missing requestId rejected', () => {
    for (const eventType of ROLE_ADMINISTRATION_AUDIT_EVENT_TYPES) {
      const metadata = roleAuditMetadata(eventType);
      delete metadata['requestId'];
      expect(() => validateRoleAdministrationAuditMetadata(eventType, metadata)).toThrow(
        AuditError,
      );
    }
  });

  it('EC1-T28 missing correlationId rejected', () => {
    for (const eventType of ROLE_ADMINISTRATION_AUDIT_EVENT_TYPES) {
      const metadata = roleAuditMetadata(eventType);
      delete metadata['correlationId'];
      expect(() => validateRoleAdministrationAuditMetadata(eventType, metadata)).toThrow(
        AuditError,
      );
    }
  });

  it('EC1-T29 missing target identity rejected', () => {
    for (const eventType of ROLE_ADMINISTRATION_AUDIT_EVENT_TYPES) {
      const missingUser = roleAuditMetadata(eventType);
      delete missingUser['targetUserId'];
      expect(() => validateRoleAdministrationAuditMetadata(eventType, missingUser)).toThrow(
        AuditError,
      );
      const missingSubject = roleAuditMetadata(eventType);
      delete missingSubject['targetExternalSubjectId'];
      expect(() => validateRoleAdministrationAuditMetadata(eventType, missingSubject)).toThrow(
        AuditError,
      );
    }
  });

  it('EC1-T30 missing actor identity rejected', () => {
    for (const eventType of ROLE_ADMINISTRATION_AUDIT_EVENT_TYPES) {
      const missingUser = roleAuditMetadata(eventType);
      delete missingUser['actorUserId'];
      expect(() => validateRoleAdministrationAuditMetadata(eventType, missingUser)).toThrow(
        AuditError,
      );
      const missingSubject = roleAuditMetadata(eventType);
      delete missingSubject['actorExternalSubjectId'];
      expect(() => validateRoleAdministrationAuditMetadata(eventType, missingSubject)).toThrow(
        AuditError,
      );
      const missingRole = roleAuditMetadata(eventType);
      delete missingRole['actorRole'];
      expect(() => validateRoleAdministrationAuditMetadata(eventType, missingRole)).toThrow(
        AuditError,
      );
    }
  });

  it('EC1-T31 wrong target role metadata rejected', () => {
    for (const eventType of ROLE_ADMINISTRATION_AUDIT_EVENT_TYPES) {
      expect(() =>
        validateRoleAdministrationAuditMetadata(
          eventType,
          roleAuditMetadata(eventType, { role: 'STAFF_DIR' }),
        ),
      ).toThrow(AuditError);
      const missingRole = roleAuditMetadata(eventType);
      delete missingRole['role'];
      expect(() => validateRoleAdministrationAuditMetadata(eventType, missingRole)).toThrow(
        AuditError,
      );
    }
    expect(() =>
      validateRoleAdministrationAuditMetadata(
        'ROLE_GRANT_REQUESTED',
        roleAuditMetadata('ROLE_GRANT_REQUESTED', { actorRole: 'STAFF_DIR' }),
      ),
    ).toThrow(AuditError);
    expect(() =>
      validateRoleAdministrationAuditMetadata(
        'ROLE_REVOKE_REVIEWED',
        roleAuditMetadata('ROLE_REVOKE_REVIEWED', { reviewerRole: 'STAFF_AUD' }),
      ),
    ).toThrow(AuditError);
  });

  it('EC1-T32 forbidden sensitive metadata remains rejected', () => {
    for (const eventType of ROLE_ADMINISTRATION_AUDIT_EVENT_TYPES) {
      const definition = AuditEventRegistry.production().get(eventType);
      if (definition.metadataSchema === null) {
        throw new Error('Role audit metadata schema is missing.');
      }
      for (const key of FORBIDDEN_ROLE_AUDIT_METADATA_KEYS) {
        expect(definition.metadataSchema.properties[key]).toBeUndefined();
        expect(() =>
          validateRoleAdministrationAuditMetadata(
            eventType,
            roleAuditMetadata(eventType, { [key]: 'secret-value' }),
          ),
        ).toThrow(AuditError);
        try {
          validateRoleAdministrationAuditMetadata(
            eventType,
            roleAuditMetadata(eventType, { [key]: 'secret-value' }),
          );
        } catch (error) {
          expect((error as AuditError).code).toBe(AUDIT_METADATA_INVALID);
        }
      }
    }
  });

  it('EC1-T33 exact ten audit events remain registered', () => {
    expect([...ROLE_ADMINISTRATION_AUDIT_EVENT_TYPES]).toEqual([
      'ROLE_GRANT_REQUESTED',
      'ROLE_GRANT_APPROVED',
      'ROLE_GRANT_APPLIED',
      'ROLE_GRANT_REJECTED',
      'ROLE_GRANT_FAILED',
      'ROLE_REVOKE_REQUESTED',
      'ROLE_REVOKE_APPLIED',
      'ROLE_REVOKE_REVIEWED',
      'ROLE_REVOKE_REJECTED',
      'ROLE_REVOKE_FAILED',
    ]);
    const registry = AuditEventRegistry.production();
    expect(registry.size()).toBe(10);
    for (const eventType of ROLE_ADMINISTRATION_AUDIT_EVENT_TYPES) {
      expect(registry.has(eventType)).toBe(true);
      const definition = registry.get(eventType);
      expect(definition.metadataSchema).not.toBeNull();
    }
    for (const key of ROLE_AUDIT_COMMON_METADATA_KEYS) {
      expect(typeof key).toBe('string');
    }
  });

  it('EC1-T34 duplicate audit events remain zero', () => {
    const types = ROLE_ADMINISTRATION_AUDIT_EVENT_DEFINITIONS.map(
      (definition) => definition.eventType,
    );
    expect(new Set(types).size).toBe(types.length);
    expect(types.length).toBe(10);
    expect(AuditEventRegistry.production().size()).toBe(10);
    expect(
      () =>
        new AuditEventRegistry([
          ...ROLE_ADMINISTRATION_AUDIT_EVENT_DEFINITIONS,
          ...ROLE_ADMINISTRATION_AUDIT_EVENT_DEFINITIONS,
        ]),
    ).toThrow(AuditError);
  });

  it('EC1-T36 grant approval metadata requires a distinct approver', () => {
    for (const eventType of GRANT_APPROVAL_EVENTS) {
      const accepted = validateRoleAdministrationAuditMetadata(
        eventType,
        roleAuditMetadata(eventType),
      );
      expect(accepted['approverUserId']).toBe(APPROVER);
      expect(accepted['approverUserId']).not.toBe(accepted['initiatorUserId']);
      expect(accepted['approverRole']).toBe('STAFF_ROLEADM');
      const sameApprover = roleAuditMetadata(eventType, { approverUserId: ACTOR });
      expect(() => validateRoleAdministrationAuditMetadata(eventType, sameApprover)).toThrow(
        AuditError,
      );
      const missingApprover = roleAuditMetadata(eventType);
      delete missingApprover['approverUserId'];
      expect(() => validateRoleAdministrationAuditMetadata(eventType, missingApprover)).toThrow(
        AuditError,
      );
    }
  });
});
