import type { AuditEventDefinition } from './audit-event.types';

const STRING_VALUE = { type: 'string' } as const;
const BOOLEAN_VALUE = { type: 'boolean' } as const;

const PERSONNEL_METADATA = {
  type: 'object',
  properties: {
    credentialId: STRING_VALUE,
    decisionId: STRING_VALUE,
    certificateNumber: STRING_VALUE,
    registryListed: BOOLEAN_VALUE,
    fromStatus: STRING_VALUE,
    toStatus: STRING_VALUE,
    reason: STRING_VALUE,
    proposalId: STRING_VALUE,
    suspended: BOOLEAN_VALUE,
  },
} as const;

/**
 * Withdrawal audit. Allowlisted fields only: no document image, document number, or secret.
 * AuditEventRegistry.production() stays the ten role-administration events.
 */
const DIRECTORY_CONSENT_WITHDRAWAL_METADATA = {
  type: 'object',
  properties: {
    credentialId: STRING_VALUE,
    holderUserId: STRING_VALUE,
    channel: STRING_VALUE,
    receivedAt: STRING_VALUE,
    verifierUserId: STRING_VALUE,
    verificationMethod: STRING_VALUE,
    executorUserId: STRING_VALUE,
    result: STRING_VALUE,
  },
} as const;

export const PERSONNEL_AUDIT_EVENT_DEFINITIONS: readonly AuditEventDefinition[] = [
  {
    eventType: 'PERSONNEL_CERTIFICATE_ISSUED',
    resourceTypePolicy: 'REQUIRED',
    metadataSchema: PERSONNEL_METADATA,
  },
  {
    eventType: 'DIRECTORY_CONSENT_WITHDRAWN',
    resourceTypePolicy: 'REQUIRED',
    metadataSchema: DIRECTORY_CONSENT_WITHDRAWAL_METADATA,
  },
  {
    eventType: 'PERSONNEL_CERTIFICATE_STATUS_CHANGED',
    resourceTypePolicy: 'REQUIRED',
    metadataSchema: PERSONNEL_METADATA,
  },
  {
    eventType: 'AMF_SUSPENSION_PROPOSED',
    resourceTypePolicy: 'REQUIRED',
    metadataSchema: PERSONNEL_METADATA,
  },
];
