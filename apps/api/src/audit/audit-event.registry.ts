import {
  ROLE_AUTHORITY_SOURCE,
  ROLE_GRANT_AUTHORITY,
  ROLE_REVOKE_AUTHORITY,
  TARGET_ROLE,
} from '@confora/shared-types';

import {
  AuditError,
  AUDIT_EVENT_NOT_REGISTERED,
  AUDIT_INVALID_INPUT,
  AUDIT_METADATA_INVALID,
} from './audit-errors';
import {
  AUDIT_EVENT_TYPE_PATTERN,
  type AuditEventDefinition,
  type MetadataSchema,
  type MetadataValueSchema,
} from './audit-event.types';
import { validateMetadataForEvent } from './audit-validators';

/**
 * Production registry.
 * BAR-P05 started at zero definitions.
 * PKG-00 registers the ten role grant/revoke contract events.
 * Runtime dynamic registration remains forbidden. Tests may construct a
 * registry with additional static definitions via the constructor.
 * Registration does not emit audit rows.
 */
const STRING_VALUE: MetadataValueSchema = { type: 'string' };

export const ROLE_AUDIT_COMMON_METADATA_KEYS = [
  'eventId',
  'occurredAt',
  'tenantId',
  'actorUserId',
  'actorExternalSubjectId',
  'actorRole',
  'targetUserId',
  'targetExternalSubjectId',
  'role',
  'requestId',
  'reasonCode',
  'correlationId',
  'sourceSystem',
] as const;

export const ROLE_AUDIT_REQUIRED_STATE_KEYS = [
  'decision',
  'previousState',
  'resultingState',
] as const;

export const FORBIDDEN_ROLE_AUDIT_METADATA_KEYS = [
  'accessToken',
  'refreshToken',
  'authorizationHeader',
  'password',
  'mfaSecret',
  'privateKey',
  'rawJwt',
  'fullRequestBody',
  'unrestrictedSensitiveNarrative',
] as const;

export const ROLE_ADMINISTRATION_AUDIT_EVENT_TYPES = [
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
] as const;

export type RoleAdministrationAuditEventType =
  (typeof ROLE_ADMINISTRATION_AUDIT_EVENT_TYPES)[number];

const COMMON_ROLE_AUDIT_PROPERTIES: Readonly<Record<string, MetadataValueSchema>> =
  Object.fromEntries(ROLE_AUDIT_COMMON_METADATA_KEYS.map((key) => [key, STRING_VALUE]));

const APPROVER_PROPERTIES: Readonly<Record<string, MetadataValueSchema>> = {
  approverUserId: STRING_VALUE,
  approverExternalSubjectId: STRING_VALUE,
  approverRole: STRING_VALUE,
};

const INITIATOR_PROPERTIES: Readonly<Record<string, MetadataValueSchema>> = {
  initiatorUserId: STRING_VALUE,
  initiatorExternalSubjectId: STRING_VALUE,
  initiatorRole: STRING_VALUE,
};

const REVIEWER_PROPERTIES: Readonly<Record<string, MetadataValueSchema>> = {
  reviewerUserId: STRING_VALUE,
  reviewerExternalSubjectId: STRING_VALUE,
  reviewerRole: STRING_VALUE,
};

const STATE_PROPERTIES: Readonly<Record<string, MetadataValueSchema>> = {
  decision: STRING_VALUE,
  previousState: STRING_VALUE,
  resultingState: STRING_VALUE,
};

function roleAuditSchema(
  extra: Readonly<Record<string, MetadataValueSchema>> = {},
): MetadataSchema {
  const properties: Record<string, MetadataValueSchema> = {
    ...COMMON_ROLE_AUDIT_PROPERTIES,
    ...extra,
  };
  for (const key of Object.keys(properties)) {
    if ((FORBIDDEN_ROLE_AUDIT_METADATA_KEYS as readonly string[]).includes(key)) {
      throw new AuditError(AUDIT_INVALID_INPUT, `Forbidden audit metadata key: ${key}`);
    }
  }
  return { type: 'object', properties };
}

function roleAuditDefinition(
  eventType: RoleAdministrationAuditEventType,
  extra: Readonly<Record<string, MetadataValueSchema>> = {},
): AuditEventDefinition {
  return {
    eventType,
    resourceTypePolicy: 'OPTIONAL',
    metadataSchema: roleAuditSchema(extra),
  };
}

const GRANT_APPROVAL_EVENTS = new Set<RoleAdministrationAuditEventType>([
  'ROLE_GRANT_APPROVED',
  'ROLE_GRANT_APPLIED',
  'ROLE_GRANT_REJECTED',
]);

export const ROLE_ADMINISTRATION_AUDIT_EVENT_DEFINITIONS: readonly AuditEventDefinition[] = [
  roleAuditDefinition('ROLE_GRANT_REQUESTED', STATE_PROPERTIES),
  roleAuditDefinition('ROLE_GRANT_APPROVED', {
    ...INITIATOR_PROPERTIES,
    ...APPROVER_PROPERTIES,
    ...STATE_PROPERTIES,
  }),
  roleAuditDefinition('ROLE_GRANT_APPLIED', {
    ...INITIATOR_PROPERTIES,
    ...APPROVER_PROPERTIES,
    ...STATE_PROPERTIES,
  }),
  roleAuditDefinition('ROLE_GRANT_REJECTED', {
    ...INITIATOR_PROPERTIES,
    ...APPROVER_PROPERTIES,
    ...STATE_PROPERTIES,
  }),
  roleAuditDefinition('ROLE_GRANT_FAILED', { ...STATE_PROPERTIES, errorCode: STRING_VALUE }),
  roleAuditDefinition('ROLE_REVOKE_REQUESTED', STATE_PROPERTIES),
  roleAuditDefinition('ROLE_REVOKE_APPLIED', { ...STATE_PROPERTIES, reviewDueAt: STRING_VALUE }),
  roleAuditDefinition('ROLE_REVOKE_REVIEWED', {
    ...STATE_PROPERTIES,
    ...REVIEWER_PROPERTIES,
    reviewedAt: STRING_VALUE,
  }),
  roleAuditDefinition('ROLE_REVOKE_REJECTED', STATE_PROPERTIES),
  roleAuditDefinition('ROLE_REVOKE_FAILED', { ...STATE_PROPERTIES, errorCode: STRING_VALUE }),
];

const ROLE_AUDIT_EVENT_REQUIRED_EXTRA_KEYS: Readonly<
  Record<RoleAdministrationAuditEventType, readonly string[]>
> = {
  ROLE_GRANT_REQUESTED: [],
  ROLE_GRANT_APPROVED: [
    'initiatorUserId',
    'initiatorExternalSubjectId',
    'initiatorRole',
    'approverUserId',
    'approverExternalSubjectId',
    'approverRole',
  ],
  ROLE_GRANT_APPLIED: [
    'initiatorUserId',
    'initiatorExternalSubjectId',
    'initiatorRole',
    'approverUserId',
    'approverExternalSubjectId',
    'approverRole',
  ],
  ROLE_GRANT_REJECTED: [
    'initiatorUserId',
    'initiatorExternalSubjectId',
    'initiatorRole',
    'approverUserId',
    'approverExternalSubjectId',
    'approverRole',
  ],
  ROLE_GRANT_FAILED: ['errorCode'],
  ROLE_REVOKE_REQUESTED: [],
  ROLE_REVOKE_APPLIED: ['reviewDueAt'],
  ROLE_REVOKE_REVIEWED: [
    'reviewerUserId',
    'reviewerExternalSubjectId',
    'reviewerRole',
    'reviewedAt',
  ],
  ROLE_REVOKE_REJECTED: [],
  ROLE_REVOKE_FAILED: ['errorCode'],
};

function requiredRoleAuditMetadataKeys(
  eventType: RoleAdministrationAuditEventType,
): readonly string[] {
  return [
    ...ROLE_AUDIT_COMMON_METADATA_KEYS,
    ...ROLE_AUDIT_REQUIRED_STATE_KEYS,
    ...ROLE_AUDIT_EVENT_REQUIRED_EXTRA_KEYS[eventType],
  ];
}

function metadataRecord(metadata: unknown): Record<string, unknown> {
  if (metadata === undefined || metadata === null) {
    throw new AuditError(AUDIT_METADATA_INVALID, 'Role audit metadata is required.');
  }
  if (typeof metadata !== 'object' || Array.isArray(metadata)) {
    throw new AuditError(AUDIT_METADATA_INVALID, 'Metadata must be an object.');
  }
  return metadata as Record<string, unknown>;
}

function requiredString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (typeof value !== 'string' || value.length === 0) {
    throw new AuditError(AUDIT_METADATA_INVALID, `Missing required role audit metadata: ${key}`);
  }
  return value;
}

/**
 * Executable PKG-00 audit metadata contract.
 * Required keys are validated. The generic allowlist is not sufficient.
 * The authenticated audit envelope tenant is not a substitute for metadata.tenantId.
 */
export function validateRoleAdministrationAuditMetadata(
  eventType: RoleAdministrationAuditEventType,
  metadata: unknown,
): Record<string, unknown> {
  const record = metadataRecord(metadata);
  for (const key of FORBIDDEN_ROLE_AUDIT_METADATA_KEYS) {
    if (Object.prototype.hasOwnProperty.call(record, key)) {
      throw new AuditError(AUDIT_METADATA_INVALID, 'Forbidden audit metadata key.');
    }
  }

  for (const key of requiredRoleAuditMetadataKeys(eventType)) {
    requiredString(record, key);
  }

  if (record['role'] !== TARGET_ROLE) {
    throw new AuditError(
      AUDIT_METADATA_INVALID,
      'Role audit target role must be COMPLAINT_HANDLER.',
    );
  }
  if (
    record['actorRole'] !== ROLE_GRANT_AUTHORITY &&
    record['actorRole'] !== ROLE_REVOKE_AUTHORITY
  ) {
    throw new AuditError(AUDIT_METADATA_INVALID, 'Role audit actor role must be STAFF_ROLEADM.');
  }
  if (record['sourceSystem'] !== ROLE_AUTHORITY_SOURCE) {
    throw new AuditError(AUDIT_METADATA_INVALID, 'Role audit source system is not canonical.');
  }
  if (record['actorUserId'] === record['targetUserId']) {
    throw new AuditError(AUDIT_METADATA_INVALID, 'Role audit actor and target must differ.');
  }
  if (record['actorExternalSubjectId'] === record['targetExternalSubjectId']) {
    throw new AuditError(
      AUDIT_METADATA_INVALID,
      'Role audit actor and target subjects must differ.',
    );
  }

  if (GRANT_APPROVAL_EVENTS.has(eventType)) {
    if (record['initiatorRole'] !== ROLE_GRANT_AUTHORITY) {
      throw new AuditError(AUDIT_METADATA_INVALID, 'Grant initiator role must be STAFF_ROLEADM.');
    }
    if (record['approverRole'] !== ROLE_GRANT_AUTHORITY) {
      throw new AuditError(AUDIT_METADATA_INVALID, 'Grant approver role must be STAFF_ROLEADM.');
    }
    if (record['approverUserId'] === record['initiatorUserId']) {
      throw new AuditError(
        AUDIT_METADATA_INVALID,
        'Grant approver must differ from the initiator.',
      );
    }
    if (record['approverExternalSubjectId'] === record['initiatorExternalSubjectId']) {
      throw new AuditError(
        AUDIT_METADATA_INVALID,
        'Grant approver subject must differ from the initiator subject.',
      );
    }
    if (
      record['approverUserId'] === record['targetUserId'] ||
      record['initiatorUserId'] === record['targetUserId']
    ) {
      throw new AuditError(AUDIT_METADATA_INVALID, 'Grant actor must differ from the target.');
    }
  }

  if (eventType === 'ROLE_REVOKE_REVIEWED') {
    if (record['reviewerRole'] !== ROLE_REVOKE_AUTHORITY) {
      throw new AuditError(AUDIT_METADATA_INVALID, 'Revoke reviewer role must be STAFF_ROLEADM.');
    }
    if (record['decision'] !== 'REVIEWED') {
      throw new AuditError(AUDIT_METADATA_INVALID, 'Revoke review decision must be REVIEWED.');
    }
    if (record['reviewerUserId'] === record['actorUserId']) {
      throw new AuditError(
        AUDIT_METADATA_INVALID,
        'Revoke reviewer must differ from the revoke actor.',
      );
    }
    if (record['reviewerExternalSubjectId'] === record['actorExternalSubjectId']) {
      throw new AuditError(
        AUDIT_METADATA_INVALID,
        'Revoke reviewer subject must differ from the revoke actor subject.',
      );
    }
    if (record['reviewerUserId'] === record['targetUserId']) {
      throw new AuditError(AUDIT_METADATA_INVALID, 'Revoke reviewer must differ from the target.');
    }
  }

  const definition = new AuditEventRegistry(ROLE_ADMINISTRATION_AUDIT_EVENT_DEFINITIONS).get(
    eventType,
  );
  const canonical = validateMetadataForEvent(definition, record);
  if (canonical === null || typeof canonical !== 'object' || Array.isArray(canonical)) {
    throw new AuditError(AUDIT_METADATA_INVALID, 'Role audit metadata is required.');
  }
  return canonical as Record<string, unknown>;
}

export class AuditEventRegistry {
  private readonly byType: ReadonlyMap<string, AuditEventDefinition>;

  constructor(definitions: readonly AuditEventDefinition[] = []) {
    const map = new Map<string, AuditEventDefinition>();
    for (const def of definitions) {
      if (!AUDIT_EVENT_TYPE_PATTERN.test(def.eventType)) {
        throw new AuditError(
          AUDIT_INVALID_INPUT,
          'Audit event identifier must match UPPER_SNAKE pattern.',
        );
      }
      if (map.has(def.eventType)) {
        throw new AuditError(AUDIT_INVALID_INPUT, 'Duplicate audit event definition.');
      }
      map.set(def.eventType, Object.freeze({ ...def }));
    }
    this.byType = map;
  }

  /** Production registry: ten PKG-00 role-administration contract events. */
  static production(): AuditEventRegistry {
    return new AuditEventRegistry(ROLE_ADMINISTRATION_AUDIT_EVENT_DEFINITIONS);
  }

  size(): number {
    return this.byType.size;
  }

  get(eventType: string): AuditEventDefinition {
    const def = this.byType.get(eventType);
    if (!def) {
      throw new AuditError(AUDIT_EVENT_NOT_REGISTERED, 'Audit event is not registered.');
    }
    return def;
  }

  has(eventType: string): boolean {
    return this.byType.has(eventType);
  }
}
