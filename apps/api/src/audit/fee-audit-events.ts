import type { AuditEventDefinition } from './audit-event.types';

const STRING_VALUE = { type: 'string' } as const;
const NUMBER_VALUE = { type: 'number' } as const;
const BOOLEAN_VALUE = { type: 'boolean' } as const;

const FEE_METADATA = {
  type: 'object',
  properties: {
    kind: STRING_VALUE,
    status: STRING_VALUE,
    currency: STRING_VALUE,
    amountMinor: NUMBER_VALUE,
    year: NUMBER_VALUE,
    lifecycle: STRING_VALUE,
    lifecycleUnchanged: BOOLEAN_VALUE,
  },
} as const;

export const FEE_AUDIT_EVENT_DEFINITIONS: readonly AuditEventDefinition[] = [
  { eventType: 'FEE_PRICE_SET', resourceTypePolicy: 'REQUIRED', metadataSchema: FEE_METADATA },
  {
    eventType: 'FEE_OBLIGATION_OPENED',
    resourceTypePolicy: 'REQUIRED',
    metadataSchema: FEE_METADATA,
  },
];
