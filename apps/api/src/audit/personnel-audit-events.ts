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
 * Directory-consent audit. Identifiers, role codes, and RB-02 references only.
 * No document image, document number, name, or secret.
 * AuditEventRegistry.production() stays the ten role-administration events.
 */
const DIRECTORY_CONSENT_WITHDRAWAL_METADATA = {
  type: 'object',
  properties: {
    credentialId: STRING_VALUE,
    holderUserId: STRING_VALUE,
    channel: STRING_VALUE,
    receivedAt: STRING_VALUE,
    requesterUserId: STRING_VALUE,
    verifierUserId: STRING_VALUE,
    verifierRole: STRING_VALUE,
    verificationMethod: STRING_VALUE,
    evidenceRef: STRING_VALUE,
    verifiedAt: STRING_VALUE,
    executorUserId: STRING_VALUE,
    result: STRING_VALUE,
    procedure: STRING_VALUE,
    procedureRef: STRING_VALUE,
    procedureSection: STRING_VALUE,
  },
} as const;

export const PERSONNEL_AUDIT_EVENT_DEFINITIONS: readonly AuditEventDefinition[] = [
  {
    eventType: 'PERSONNEL_CERTIFICATE_ISSUED',
    resourceTypePolicy: 'REQUIRED',
    metadataSchema: PERSONNEL_METADATA,
  },
  {
    eventType: 'DIRECTORY_CONSENT_WITHDRAWAL_REQUESTED',
    resourceTypePolicy: 'REQUIRED',
    metadataSchema: DIRECTORY_CONSENT_WITHDRAWAL_METADATA,
  },
  {
    eventType: 'DIRECTORY_CONSENT_VERIFIED',
    resourceTypePolicy: 'REQUIRED',
    metadataSchema: DIRECTORY_CONSENT_WITHDRAWAL_METADATA,
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
