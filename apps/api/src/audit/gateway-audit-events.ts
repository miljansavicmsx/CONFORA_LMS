import type { AuditEventDefinition } from './audit-event.types';

const STRING_VALUE = { type: 'string' } as const;
const NUMBER_VALUE = { type: 'number' } as const;
const BOOLEAN_VALUE = { type: 'boolean' } as const;

const AI_USE_METADATA = {
  type: 'object',
  properties: {
    purpose: STRING_VALUE,
    model: STRING_VALUE,
    dataCategory: STRING_VALUE,
    promptUnits: NUMBER_VALUE,
    completionUnits: NUMBER_VALUE,
    costMinor: NUMBER_VALUE,
    humanValidationRequired: BOOLEAN_VALUE,
    decides: BOOLEAN_VALUE,
    requestedBy: STRING_VALUE,
  },
} as const;

export const GATEWAY_AUDIT_EVENT_DEFINITIONS: readonly AuditEventDefinition[] = [
  {
    eventType: 'AI_USE_RECORDED',
    resourceTypePolicy: 'REQUIRED',
    metadataSchema: AI_USE_METADATA,
  },
];
