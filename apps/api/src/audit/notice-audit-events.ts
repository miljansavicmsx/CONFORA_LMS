import type { AuditEventDefinition } from './audit-event.types';

const STRING_VALUE = { type: 'string' } as const;
const NUMBER_VALUE = { type: 'number' } as const;

const NOTICE_METADATA = {
  type: 'object',
  properties: {
    kind: STRING_VALUE,
    channel: STRING_VALUE,
    status: STRING_VALUE,
    attempts: NUMBER_VALUE,
  },
} as const;

export const NOTICE_AUDIT_EVENT_DEFINITIONS: readonly AuditEventDefinition[] = [
  { eventType: 'NOTICE_QUEUED', resourceTypePolicy: 'REQUIRED', metadataSchema: NOTICE_METADATA },
  { eventType: 'NOTICE_RESULT', resourceTypePolicy: 'REQUIRED', metadataSchema: NOTICE_METADATA },
  { eventType: 'NOTICE_BOUNCED', resourceTypePolicy: 'REQUIRED', metadataSchema: NOTICE_METADATA },
  {
    eventType: 'NOTICE_COMPLAINT',
    resourceTypePolicy: 'REQUIRED',
    metadataSchema: NOTICE_METADATA,
  },
];
