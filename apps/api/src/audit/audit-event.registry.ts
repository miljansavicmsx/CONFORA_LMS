import { AuditError, AUDIT_EVENT_NOT_REGISTERED, AUDIT_INVALID_INPUT } from './audit-errors';
import {
  AUDIT_EVENT_TYPE_PATTERN,
  type AuditEventDefinition,
  type MetadataSchema,
  type MetadataValueSchema,
} from './audit-event.types';

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
  'targetUserId',
  'targetExternalSubjectId',
  'role',
  'requestId',
  'reasonCode',
  'correlationId',
  'sourceSystem',
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

export const ROLE_ADMINISTRATION_AUDIT_EVENT_DEFINITIONS: readonly AuditEventDefinition[] = [
  roleAuditDefinition('ROLE_GRANT_REQUESTED', STATE_PROPERTIES),
  roleAuditDefinition('ROLE_GRANT_APPROVED', { ...APPROVER_PROPERTIES, ...STATE_PROPERTIES }),
  roleAuditDefinition('ROLE_GRANT_APPLIED', { ...APPROVER_PROPERTIES, ...STATE_PROPERTIES }),
  roleAuditDefinition('ROLE_GRANT_REJECTED', { ...APPROVER_PROPERTIES, ...STATE_PROPERTIES }),
  roleAuditDefinition('ROLE_GRANT_FAILED', { ...STATE_PROPERTIES, errorCode: STRING_VALUE }),
  roleAuditDefinition('ROLE_REVOKE_REQUESTED', STATE_PROPERTIES),
  roleAuditDefinition('ROLE_REVOKE_APPLIED', { ...STATE_PROPERTIES, reviewDueAt: STRING_VALUE }),
  roleAuditDefinition('ROLE_REVOKE_REVIEWED', { ...STATE_PROPERTIES, reviewedAt: STRING_VALUE }),
  roleAuditDefinition('ROLE_REVOKE_REJECTED', STATE_PROPERTIES),
  roleAuditDefinition('ROLE_REVOKE_FAILED', { ...STATE_PROPERTIES, errorCode: STRING_VALUE }),
];

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
