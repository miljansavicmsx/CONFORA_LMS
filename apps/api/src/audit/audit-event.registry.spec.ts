import { AuditError, AUDIT_EVENT_NOT_REGISTERED, AUDIT_INVALID_INPUT } from './audit-errors';
import { AuditEventRegistry } from './audit-event.registry';

describe('AuditEventRegistry', () => {
  it('P05_TEST_017 Unknown event -> AUDIT_EVENT_NOT_REGISTERED', () => {
    const registry = AuditEventRegistry.production();
    expect(registry.size()).toBe(0);
    expect(registry.has('TEST_EVENT')).toBe(false);
    expect(() => registry.get('TEST_EVENT')).toThrow(AuditError);
    try {
      registry.get('TEST_EVENT');
    } catch (error) {
      expect(error).toBeInstanceOf(AuditError);
      expect((error as AuditError).code).toBe(AUDIT_EVENT_NOT_REGISTERED);
    }
  });

  it('P05_TEST_018 Registry rejects invalid event identifier', () => {
    expect(
      () =>
        new AuditEventRegistry([
          {
            eventType: 'not-valid',
            resourceTypePolicy: 'OPTIONAL',
            metadataSchema: null,
          },
        ]),
    ).toThrow(AuditError);

    expect(
      () =>
        new AuditEventRegistry([
          {
            eventType: 'lowercase',
            resourceTypePolicy: 'OPTIONAL',
            metadataSchema: null,
          },
        ]),
    ).toThrow(AuditError);
    try {
      new AuditEventRegistry([
        {
          eventType: 'lowercase',
          resourceTypePolicy: 'OPTIONAL',
          metadataSchema: null,
        },
      ]);
    } catch (error) {
      expect(error).toBeInstanceOf(AuditError);
      expect((error as AuditError).code).toBe(AUDIT_INVALID_INPUT);
    }

    expect(
      () =>
        new AuditEventRegistry([
          {
            eventType: 'VALID_EVENT',
            resourceTypePolicy: 'OPTIONAL',
            metadataSchema: null,
          },
          {
            eventType: 'VALID_EVENT',
            resourceTypePolicy: 'OPTIONAL',
            metadataSchema: null,
          },
        ]),
    ).toThrow(AuditError);
  });
});
