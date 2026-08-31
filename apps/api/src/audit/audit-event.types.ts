export type AuditOutcomeLiteral = 'SUCCESS' | 'DENIED' | 'FAILURE';

export type ResourceTypePolicy = 'FORBIDDEN' | 'REQUIRED' | 'OPTIONAL';

/**
 * Event-specific metadata schema: allowlisted object keys only.
 * Nested objects declare their own property allowlists.
 * null schema => metadata must be absent and is persisted as null.
 */
export type MetadataSchema = null | {
  type: 'object';
  properties: Readonly<Record<string, MetadataValueSchema>>;
};

export type MetadataValueSchema =
  | { type: 'string' }
  | { type: 'number' }
  | { type: 'boolean' }
  | { type: 'null' }
  | { type: 'array'; items: MetadataValueSchema }
  | { type: 'object'; properties: Readonly<Record<string, MetadataValueSchema>> };

export type AuditEventDefinition = {
  eventType: string;
  resourceTypePolicy: ResourceTypePolicy;
  metadataSchema: MetadataSchema;
};

export type AuditAppendInput = {
  idempotencyKey: string;
  eventType: string;
  outcome: AuditOutcomeLiteral;
  occurredAt: Date;
  resourceType?: string | null;
  resourceId?: string | null;
  correlationId?: string | null;
  metadata?: unknown;
};

export type AuditEventView = Readonly<{
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
  prevHash: string;
  payloadHash: string;
  chainHash: string;
}>;

export type AuditTransactionOps = {
  append(input: AuditAppendInput): Promise<AuditEventView>;
};

export const AUDIT_EVENT_TYPE_PATTERN = /^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*$/;

export const INITIAL_PREV_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

export const CANONICAL_PAYLOAD_VERSION = 'CONFORA_AUDIT_PAYLOAD_V1';

export const AUDIT_METADATA_MAX_UTF8_BYTES = 4096;

export const MAX_SERIALIZABLE_RETRIES = 3;

export const RETRYABLE_PRISMA_ERROR_CODE = 'P2034';

export const FORBIDDEN_APPEND_OVERRIDE_KEYS = [
  'tenantId',
  'actorUserId',
  'email',
  'issuer',
  'subject',
  'roles',
  'mfaVerified',
  'platformScope',
  'id',
  'sequence',
  'recordedAt',
  'prevHash',
  'payloadHash',
  'chainHash',
  'oldValue',
  'newValue',
] as const;
