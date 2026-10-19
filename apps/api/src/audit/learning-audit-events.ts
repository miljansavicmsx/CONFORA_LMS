import type { AuditEventDefinition } from './audit-event.types';

const STRING_VALUE = { type: 'string' } as const;
const NUMBER_VALUE = { type: 'number' } as const;
const BOOLEAN_VALUE = { type: 'boolean' } as const;

/**
 * Learning events are registered beside the PKG-00 production registry.
 * AuditEventRegistry.production() stays the ten role-administration events.
 */
const LEARNING_METADATA = {
  type: 'object',
  properties: {
    courseId: STRING_VALUE,
    enrolmentId: STRING_VALUE,
    lessonId: STRING_VALUE,
    quizId: STRING_VALUE,
    statementId: STRING_VALUE,
    paymentState: STRING_VALUE,
    scorePercent: NUMBER_VALUE,
    passed: BOOLEAN_VALUE,
    analyticsConsent: BOOLEAN_VALUE,
  },
} as const;

export const LEARNING_AUDIT_EVENT_DEFINITIONS: readonly AuditEventDefinition[] = [
  {
    eventType: 'LEARNING_COURSE_ENROLLED',
    resourceTypePolicy: 'REQUIRED',
    metadataSchema: LEARNING_METADATA,
  },
  {
    eventType: 'LEARNING_LESSON_PROGRESS_RECORDED',
    resourceTypePolicy: 'REQUIRED',
    metadataSchema: LEARNING_METADATA,
  },
  {
    eventType: 'LEARNING_QUIZ_ATTEMPTED',
    resourceTypePolicy: 'REQUIRED',
    metadataSchema: LEARNING_METADATA,
  },
];
