import {
  AuditError,
  AUDIT_INVALID_INPUT,
  AUDIT_METADATA_INVALID,
  AUDIT_METADATA_TOO_LARGE,
  AUDIT_SENSITIVE_DATA_FORBIDDEN,
  AUDIT_INVALID_OCCURRED_AT,
  AUDIT_INVALID_OUTCOME,
} from './audit-errors';
import {
  AUDIT_METADATA_MAX_UTF8_BYTES,
  FORBIDDEN_APPEND_OVERRIDE_KEYS,
  type AuditAppendInput,
  type AuditEventDefinition,
  type AuditOutcomeLiteral,
  type MetadataSchema,
  type MetadataValueSchema,
} from './audit-event.types';
import { canonicalizeMetadata } from './audit-canonicalizer';

const OUTCOMES = new Set<AuditOutcomeLiteral>(['SUCCESS', 'DENIED', 'FAILURE']);

const SENSITIVE_NORMALIZED_KEYS = new Set([
  'authorization',
  'token',
  'accesstoken',
  'refreshtoken',
  'idtoken',
  'jwt',
  'password',
  'passwd',
  'secret',
  'clientsecret',
  'privatekey',
  'credential',
]);

const BEARER_RE = /^\s*Bearer\s+\S+/i;
const JWT_RE = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
const PEM_PRIVATE_KEY_RE = /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function normalizeSensitiveKey(key: string): string {
  return key.toLowerCase().replace(/[_\-.\s]/g, '');
}

export function assertNoSensitiveMetadataKey(key: string): void {
  if (SENSITIVE_NORMALIZED_KEYS.has(normalizeSensitiveKey(key))) {
    throw new AuditError(AUDIT_SENSITIVE_DATA_FORBIDDEN, 'Sensitive metadata key is forbidden.');
  }
}

export function assertNoSensitiveStringValue(value: string): void {
  if (BEARER_RE.test(value) || JWT_RE.test(value) || PEM_PRIVATE_KEY_RE.test(value)) {
    throw new AuditError(AUDIT_SENSITIVE_DATA_FORBIDDEN, 'Sensitive metadata value is forbidden.');
  }
}

function scanSensitive(value: unknown, keyPath: string[]): void {
  if (typeof value === 'string') {
    assertNoSensitiveStringValue(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) scanSensitive(item, keyPath);
    return;
  }
  if (value !== null && typeof value === 'object') {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      assertNoSensitiveMetadataKey(k);
      scanSensitive(v, [...keyPath, k]);
    }
  }
}

function validateAgainstSchema(value: unknown, schema: MetadataValueSchema): void {
  switch (schema.type) {
    case 'string':
      if (typeof value !== 'string') {
        throw new AuditError(AUDIT_METADATA_INVALID, 'Metadata value type mismatch.');
      }
      return;
    case 'number':
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        throw new AuditError(AUDIT_METADATA_INVALID, 'Metadata value type mismatch.');
      }
      return;
    case 'boolean':
      if (typeof value !== 'boolean') {
        throw new AuditError(AUDIT_METADATA_INVALID, 'Metadata value type mismatch.');
      }
      return;
    case 'null':
      if (value !== null) {
        throw new AuditError(AUDIT_METADATA_INVALID, 'Metadata value type mismatch.');
      }
      return;
    case 'array':
      if (!Array.isArray(value)) {
        throw new AuditError(AUDIT_METADATA_INVALID, 'Metadata value type mismatch.');
      }
      for (const item of value) validateAgainstSchema(item, schema.items);
      return;
    case 'object': {
      if (value === null || typeof value !== 'object' || Array.isArray(value)) {
        throw new AuditError(AUDIT_METADATA_INVALID, 'Metadata value type mismatch.');
      }
      const obj = value as Record<string, unknown>;
      for (const key of Object.keys(obj)) {
        const child = schema.properties[key];
        if (!child) {
          throw new AuditError(AUDIT_METADATA_INVALID, 'Unknown metadata key.');
        }
        assertNoSensitiveMetadataKey(key);
        validateAgainstSchema(obj[key], child);
      }
      return;
    }
    default:
      throw new AuditError(AUDIT_METADATA_INVALID, 'Unsupported metadata schema.');
  }
}

export function validateMetadataForEvent(
  definition: AuditEventDefinition,
  metadata: unknown,
): unknown {
  if (definition.metadataSchema === null) {
    if (metadata === undefined || metadata === null) {
      return null;
    }
    throw new AuditError(AUDIT_METADATA_INVALID, 'Metadata not allowed for event.');
  }

  if (metadata === undefined || metadata === null) {
    return null;
  }

  if (typeof metadata !== 'object' || Array.isArray(metadata)) {
    throw new AuditError(AUDIT_METADATA_INVALID, 'Metadata must be an object.');
  }

  const schema: MetadataSchema = definition.metadataSchema;
  validateAgainstSchema(metadata, schema);
  scanSensitive(metadata, []);

  const canonical = canonicalizeMetadata(metadata);
  const json = JSON.stringify(canonical);
  const bytes = Buffer.byteLength(json, 'utf8');
  if (bytes > AUDIT_METADATA_MAX_UTF8_BYTES) {
    throw new AuditError(AUDIT_METADATA_TOO_LARGE, 'Metadata exceeds maximum size.');
  }
  return canonical;
}

export function validateOccurredAt(value: Date): Date {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new AuditError(AUDIT_INVALID_OCCURRED_AT, 'occurredAt must be a valid Date.');
  }
  return value;
}

export function validateOutcome(outcome: unknown): AuditOutcomeLiteral {
  if (typeof outcome !== 'string' || !OUTCOMES.has(outcome as AuditOutcomeLiteral)) {
    throw new AuditError(AUDIT_INVALID_OUTCOME, 'outcome must be SUCCESS, DENIED, or FAILURE.');
  }
  return outcome as AuditOutcomeLiteral;
}

export function validateIdempotencyKey(key: unknown): string {
  if (typeof key !== 'string' || !UUID_RE.test(key)) {
    throw new AuditError(AUDIT_INVALID_INPUT, 'idempotencyKey must be a UUID.');
  }
  return key;
}

export function parseAuditAppendInput(raw: unknown): AuditAppendInput {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new AuditError(AUDIT_INVALID_INPUT, 'Audit append input must be an object.');
  }
  const input = raw as Record<string, unknown>;
  for (const key of FORBIDDEN_APPEND_OVERRIDE_KEYS) {
    if (Object.prototype.hasOwnProperty.call(input, key)) {
      throw new AuditError(AUDIT_INVALID_INPUT, `Forbidden audit field: ${key}`);
    }
  }

  const allowed = new Set([
    'idempotencyKey',
    'eventType',
    'outcome',
    'occurredAt',
    'resourceType',
    'resourceId',
    'correlationId',
    'metadata',
  ]);
  for (const key of Object.keys(input)) {
    if (!allowed.has(key)) {
      throw new AuditError(AUDIT_INVALID_INPUT, `Unknown audit field: ${key}`);
    }
  }

  const eventType = input['eventType'];
  if (typeof eventType !== 'string' || eventType.length === 0) {
    throw new AuditError(AUDIT_INVALID_INPUT, 'eventType is required.');
  }

  const result: AuditAppendInput = {
    idempotencyKey: validateIdempotencyKey(input['idempotencyKey']),
    eventType,
    outcome: validateOutcome(input['outcome']),
    occurredAt: validateOccurredAt(input['occurredAt'] as Date),
  };

  if (Object.prototype.hasOwnProperty.call(input, 'resourceType')) {
    result.resourceType = input['resourceType'] as string | null;
  }
  if (Object.prototype.hasOwnProperty.call(input, 'resourceId')) {
    result.resourceId = input['resourceId'] as string | null;
  }
  if (Object.prototype.hasOwnProperty.call(input, 'correlationId')) {
    result.correlationId = input['correlationId'] as string | null;
  }
  if (Object.prototype.hasOwnProperty.call(input, 'metadata')) {
    result.metadata = input['metadata'];
  }

  return result;
}

export function enforceResourceTypePolicy(
  definition: AuditEventDefinition,
  resourceType: string | null | undefined,
): string | null {
  const value =
    resourceType === undefined || resourceType === null || resourceType === ''
      ? null
      : resourceType;

  switch (definition.resourceTypePolicy) {
    case 'FORBIDDEN':
      if (value !== null) {
        throw new AuditError(AUDIT_INVALID_INPUT, 'resourceType is forbidden for event.');
      }
      return null;
    case 'REQUIRED':
      if (value === null) {
        throw new AuditError(AUDIT_INVALID_INPUT, 'resourceType is required for event.');
      }
      return value;
    case 'OPTIONAL':
      return value;
    default:
      throw new AuditError(AUDIT_INVALID_INPUT, 'Invalid resourceTypePolicy.');
  }
}
