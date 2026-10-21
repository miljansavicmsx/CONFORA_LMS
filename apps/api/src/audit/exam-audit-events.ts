import type { AuditEventDefinition } from './audit-event.types';

const STRING_VALUE = { type: 'string' } as const;
const NUMBER_VALUE = { type: 'number' } as const;
const BOOLEAN_VALUE = { type: 'boolean' } as const;

const EXAM_METADATA = {
  type: 'object',
  properties: {
    itemId: STRING_VALUE,
    blueprintId: STRING_VALUE,
    recordId: STRING_VALUE,
    sessionId: STRING_VALUE,
    resultId: STRING_VALUE,
    decisionId: STRING_VALUE,
    formId: STRING_VALUE,
    fromStatus: STRING_VALUE,
    toStatus: STRING_VALUE,
    cutScoreBasisPoints: NUMBER_VALUE,
    scoreBasisPoints: NUMBER_VALUE,
    passed: BOOLEAN_VALUE,
    provisional: BOOLEAN_VALUE,
    outcome: STRING_VALUE,
    independentOfTraining: BOOLEAN_VALUE,
    identityCheckId: STRING_VALUE,
    documentType: STRING_VALUE,
    method: STRING_VALUE,
  },
} as const;

export const EXAM_AUDIT_EVENT_DEFINITIONS: readonly AuditEventDefinition[] = [
  {
    eventType: 'EXAM_ITEM_APPROVED',
    resourceTypePolicy: 'REQUIRED',
    metadataSchema: EXAM_METADATA,
  },
  {
    eventType: 'EXAM_BLUEPRINT_APPROVED',
    resourceTypePolicy: 'REQUIRED',
    metadataSchema: EXAM_METADATA,
  },
  {
    eventType: 'EXAM_CUT_SCORE_APPROVED',
    resourceTypePolicy: 'REQUIRED',
    metadataSchema: EXAM_METADATA,
  },
  {
    eventType: 'EXAM_SUBMITTED',
    resourceTypePolicy: 'REQUIRED',
    metadataSchema: EXAM_METADATA,
  },
  {
    eventType: 'EXAM_SCORED',
    resourceTypePolicy: 'REQUIRED',
    metadataSchema: EXAM_METADATA,
  },
  {
    eventType: 'EXAM_DECISION_RECORDED',
    resourceTypePolicy: 'REQUIRED',
    metadataSchema: EXAM_METADATA,
  },
  {
    eventType: 'EXAM_IDENTITY_CONFIRMED',
    resourceTypePolicy: 'REQUIRED',
    metadataSchema: EXAM_METADATA,
  },
];
