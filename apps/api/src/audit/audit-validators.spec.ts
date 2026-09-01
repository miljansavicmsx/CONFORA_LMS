import {
  AuditError,
  AUDIT_METADATA_INVALID,
  AUDIT_METADATA_TOO_LARGE,
  AUDIT_SENSITIVE_DATA_FORBIDDEN,
} from './audit-errors';
import type { AuditEventDefinition } from './audit-event.types';
import { AUDIT_METADATA_MAX_UTF8_BYTES } from './audit-event.types';
import { normalizeSensitiveKey, validateMetadataForEvent } from './audit-validators';

const NOTE_ONLY: AuditEventDefinition = {
  eventType: 'TEST_EVENT',
  resourceTypePolicy: 'OPTIONAL',
  metadataSchema: {
    type: 'object',
    properties: {
      note: { type: 'string' },
    },
  },
};

const NESTED_SCHEMA: AuditEventDefinition = {
  eventType: 'TEST_NESTED',
  resourceTypePolicy: 'OPTIONAL',
  metadataSchema: {
    type: 'object',
    properties: {
      nested: {
        type: 'object',
        properties: {
          allowed: { type: 'string' },
        },
      },
    },
  },
};

/** Schema intentionally lists sensitive-shaped keys so the scanner (not allowlist miss) is exercised. */
const SENSITIVE_KEY_SCHEMA: AuditEventDefinition = {
  eventType: 'TEST_SENSITIVE_KEYS',
  resourceTypePolicy: 'OPTIONAL',
  metadataSchema: {
    type: 'object',
    properties: {
      password: { type: 'string' },
      access_token: { type: 'string' },
      'Access-Token': { type: 'string' },
      note: { type: 'string' },
    },
  },
};

const TOKEN_COUNT_SCHEMA: AuditEventDefinition = {
  eventType: 'TEST_TOKEN_COUNT',
  resourceTypePolicy: 'OPTIONAL',
  metadataSchema: {
    type: 'object',
    properties: {
      tokenCount: { type: 'number' },
      note: { type: 'string' },
    },
  },
};

describe('audit-validators', () => {
  it('P05_TEST_020 Unknown metadata key rejected', () => {
    expect(() => validateMetadataForEvent(NOTE_ONLY, { note: 'ok', extra: 'nope' })).toThrow(
      AuditError,
    );
    try {
      validateMetadataForEvent(NOTE_ONLY, { note: 'ok', extra: 'nope' });
    } catch (error) {
      expect(error).toBeInstanceOf(AuditError);
      expect((error as AuditError).code).toBe(AUDIT_METADATA_INVALID);
    }
  });

  it('P05_TEST_021 Nested unknown metadata key rejected', () => {
    expect(() =>
      validateMetadataForEvent(NESTED_SCHEMA, {
        nested: { allowed: 'a', evil: 'b' },
      }),
    ).toThrow(AuditError);
    try {
      validateMetadataForEvent(NESTED_SCHEMA, {
        nested: { allowed: 'a', evil: 'b' },
      });
    } catch (error) {
      expect((error as AuditError).code).toBe(AUDIT_METADATA_INVALID);
    }
  });

  it('P05_TEST_022 Metadata 4096/4097 byte boundary', () => {
    const overhead = Buffer.byteLength(JSON.stringify({ note: '' }), 'utf8');
    const atLimit = 'x'.repeat(AUDIT_METADATA_MAX_UTF8_BYTES - overhead);
    const overLimit = 'x'.repeat(AUDIT_METADATA_MAX_UTF8_BYTES - overhead + 1);

    const ok = validateMetadataForEvent(NOTE_ONLY, { note: atLimit });
    expect(Buffer.byteLength(JSON.stringify(ok), 'utf8')).toBe(AUDIT_METADATA_MAX_UTF8_BYTES);

    expect(() => validateMetadataForEvent(NOTE_ONLY, { note: overLimit })).toThrow(AuditError);
    try {
      validateMetadataForEvent(NOTE_ONLY, { note: overLimit });
    } catch (error) {
      expect(error).toBeInstanceOf(AuditError);
      expect((error as AuditError).code).toBe(AUDIT_METADATA_TOO_LARGE);
    }
  });

  it('P05_TEST_023 Sensitive metadata key rejected', () => {
    expect(normalizeSensitiveKey('access_token')).toBe('accesstoken');
    expect(normalizeSensitiveKey('Access-Token')).toBe('accesstoken');
    expect(normalizeSensitiveKey('access.token')).toBe('accesstoken');

    for (const metadata of [{ password: 'x' }, { access_token: 'x' }, { 'Access-Token': 'x' }]) {
      expect(() => validateMetadataForEvent(SENSITIVE_KEY_SCHEMA, metadata)).toThrow(AuditError);
      try {
        validateMetadataForEvent(SENSITIVE_KEY_SCHEMA, metadata);
      } catch (error) {
        expect(error).toBeInstanceOf(AuditError);
        expect((error as AuditError).code).toBe(AUDIT_SENSITIVE_DATA_FORBIDDEN);
      }
    }
  });

  it('P05_TEST_024 Bearer/JWT/PEM sensitive value rejected', () => {
    const samples = [
      'Bearer abc.def.ghi-secret',
      'aaa.bbb.ccc',
      '-----BEGIN PRIVATE KEY-----\nMIIE\n-----END PRIVATE KEY-----',
    ];
    for (const note of samples) {
      expect(() => validateMetadataForEvent(NOTE_ONLY, { note })).toThrow(AuditError);
      try {
        validateMetadataForEvent(NOTE_ONLY, { note });
      } catch (error) {
        expect(error).toBeInstanceOf(AuditError);
        expect((error as AuditError).code).toBe(AUDIT_SENSITIVE_DATA_FORBIDDEN);
      }
    }
  });

  it('P05_TEST_025 Error/logger does not expose secret', () => {
    const secret = 'Bearer SUPER_SECRET_TOKEN_VALUE_9f3a';
    expect(() => validateMetadataForEvent(NOTE_ONLY, { note: secret })).toThrow(AuditError);
    try {
      validateMetadataForEvent(NOTE_ONLY, { note: secret });
    } catch (error) {
      expect(error).toBeInstanceOf(AuditError);
      const err = error as AuditError;
      expect(err.code).toBe(AUDIT_SENSITIVE_DATA_FORBIDDEN);
      expect(err.message).not.toContain('SUPER_SECRET_TOKEN_VALUE_9f3a');
      expect(err.message).not.toContain(secret);
    }
  });

  it('P05_TEST_062 Sensitive-data scanner false-positive resistance', () => {
    // tokenCount must NOT match token after normalize (lowercase + strip _-.whitespace).
    expect(normalizeSensitiveKey('tokenCount')).toBe('tokencount');
    expect(normalizeSensitiveKey('token')).toBe('token');
    expect(normalizeSensitiveKey('tokenCount')).not.toBe(normalizeSensitiveKey('token'));

    const canonical = validateMetadataForEvent(TOKEN_COUNT_SCHEMA, {
      tokenCount: 3,
      note: 'not-a-secret',
    });
    expect(canonical).toEqual({ note: 'not-a-secret', tokenCount: 3 });
  });
});
