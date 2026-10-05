import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { LOCAL_DATABASE_ROLE_AUTHORITY } from '@confora/shared-types';

import { AuditError, AUDIT_METADATA_INVALID } from './audit-errors';
import {
  FORBIDDEN_ROLE_AUDIT_METADATA_KEYS,
  ROLE_ADMINISTRATION_AUDIT_EVENT_DEFINITIONS,
  ROLE_ADMINISTRATION_AUDIT_EVENT_TYPES,
  ROLE_AUDIT_COMMON_METADATA_KEYS,
  AuditEventRegistry,
} from './audit-event.registry';
import { validateMetadataForEvent } from './audit-validators';

describe('MD05 PKG-00 role audit contract', () => {
  it('T19 all ten audit-event definitions exist', () => {
    const registry = AuditEventRegistry.production();
    expect(registry.size()).toBe(ROLE_ADMINISTRATION_AUDIT_EVENT_TYPES.length);
    expect(ROLE_ADMINISTRATION_AUDIT_EVENT_TYPES).toHaveLength(10);
    for (const eventType of ROLE_ADMINISTRATION_AUDIT_EVENT_TYPES) {
      expect(registry.has(eventType)).toBe(true);
      const definition = registry.get(eventType);
      expect(definition.metadataSchema).not.toBeNull();
      if (definition.metadataSchema === null) {
        throw new Error('Role audit metadata schema is missing.');
      }
      const schema = definition.metadataSchema;
      for (const key of ROLE_AUDIT_COMMON_METADATA_KEYS) {
        expect(schema.properties[key]).toEqual({ type: 'string' });
      }
    }
  });

  it('T20 audit metadata excludes forbidden sensitive keys', () => {
    const registry = AuditEventRegistry.production();
    for (const eventType of ROLE_ADMINISTRATION_AUDIT_EVENT_TYPES) {
      const definition = registry.get(eventType);
      if (definition.metadataSchema === null) {
        throw new Error('Role audit metadata schema is missing.');
      }
      const schema = definition.metadataSchema;
      for (const key of FORBIDDEN_ROLE_AUDIT_METADATA_KEYS) {
        expect(schema.properties[key]).toBeUndefined();
        expect(() => validateMetadataForEvent(definition, { [key]: 'secret-value' })).toThrow(
          AuditError,
        );
        try {
          validateMetadataForEvent(definition, { [key]: 'secret-value' });
        } catch (error) {
          expect((error as AuditError).code).toBe(AUDIT_METADATA_INVALID);
        }
      }
    }
  });

  it('T21 production audit registry has no duplicate event identifiers', () => {
    const registry = AuditEventRegistry.production();
    const types = ROLE_ADMINISTRATION_AUDIT_EVENT_DEFINITIONS.map(
      (definition) => definition.eventType,
    );
    expect(new Set(types).size).toBe(types.length);
    expect(registry.size()).toBe(new Set(types).size);
    expect(
      () =>
        new AuditEventRegistry([
          ...ROLE_ADMINISTRATION_AUDIT_EVENT_DEFINITIONS,
          ...ROLE_ADMINISTRATION_AUDIT_EVENT_DEFINITIONS,
        ]),
    ).toThrow(AuditError);
  });

  it('T23 no local database role authority is introduced', () => {
    expect(LOCAL_DATABASE_ROLE_AUTHORITY).toBe(false);
    const schemaPath = join(__dirname, '../../../../packages/database/prisma/schema.prisma');
    const schema = readFileSync(schemaPath, 'utf8');
    const userBlock = schema.slice(
      schema.indexOf('model User {'),
      schema.indexOf('model ExternalIdentityLink'),
    );
    expect(userBlock).not.toMatch(/\brole\b/i);
    expect(schema).not.toMatch(/model\s+\w*RoleAssignment\w*/);
  });
});
