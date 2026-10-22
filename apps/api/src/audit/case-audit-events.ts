import type { AuditEventDefinition } from './audit-event.types';

const STRING_VALUE = { type: 'string' } as const;

const CASE_METADATA = {
  type: 'object',
  properties: {
    caseId: STRING_VALUE,
    documentNumber: STRING_VALUE,
    purpose: STRING_VALUE,
    phase: STRING_VALUE,
    reason: STRING_VALUE,
  },
} as const;

export const CASE_AUDIT_EVENT_DEFINITIONS: readonly AuditEventDefinition[] = [
  { eventType: 'CASE_OPENED', resourceTypePolicy: 'REQUIRED', metadataSchema: CASE_METADATA },
  {
    eventType: 'EDUCATION_DOCUMENT_ISSUED',
    resourceTypePolicy: 'REQUIRED',
    metadataSchema: CASE_METADATA,
  },
  {
    eventType: 'EXAM_PASS_PREPARED',
    resourceTypePolicy: 'REQUIRED',
    metadataSchema: CASE_METADATA,
  },
  { eventType: 'REFEREE_LINK_SENT', resourceTypePolicy: 'REQUIRED', metadataSchema: CASE_METADATA },
  { eventType: 'REFEREE_RESPONDED', resourceTypePolicy: 'REQUIRED', metadataSchema: CASE_METADATA },
  {
    eventType: 'COMMITTEE_PROPOSED',
    resourceTypePolicy: 'REQUIRED',
    metadataSchema: CASE_METADATA,
  },
  {
    eventType: 'COMMITTEE_SEAT_CONFIRMED',
    resourceTypePolicy: 'REQUIRED',
    metadataSchema: CASE_METADATA,
  },
  {
    eventType: 'COMMITTEE_COMPOSITION_CHANGED',
    resourceTypePolicy: 'REQUIRED',
    metadataSchema: CASE_METADATA,
  },
  {
    eventType: 'COMMITTEE_COMPOSITION_PROPOSED',
    resourceTypePolicy: 'REQUIRED',
    metadataSchema: CASE_METADATA,
  },
  {
    eventType: 'COMMITTEE_COMPOSITION_REVIEW_OPENED',
    resourceTypePolicy: 'REQUIRED',
    metadataSchema: CASE_METADATA,
  },
  {
    eventType: 'COMMITTEE_COMPOSITION_REVIEW_DECIDED',
    resourceTypePolicy: 'REQUIRED',
    metadataSchema: CASE_METADATA,
  },
  {
    eventType: 'SCHEME_COMMITTEE_AUTHORITY_GRANTED',
    resourceTypePolicy: 'REQUIRED',
    metadataSchema: CASE_METADATA,
  },
  {
    eventType: 'COMMITTEE_VOTE_RECORDED',
    resourceTypePolicy: 'REQUIRED',
    metadataSchema: CASE_METADATA,
  },
  {
    eventType: 'ISSUANCE_AUTHORISED',
    resourceTypePolicy: 'REQUIRED',
    metadataSchema: CASE_METADATA,
  },
  {
    eventType: 'AI_SUGGESTION_STORED',
    resourceTypePolicy: 'REQUIRED',
    metadataSchema: CASE_METADATA,
  },
  {
    eventType: 'CONFLICT_SIGNED',
    resourceTypePolicy: 'REQUIRED',
    metadataSchema: CASE_METADATA,
  },
  {
    eventType: 'DOCUMENT_NAME_CONSENT',
    resourceTypePolicy: 'REQUIRED',
    metadataSchema: CASE_METADATA,
  },
];
