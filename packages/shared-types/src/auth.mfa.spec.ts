import assert from 'node:assert/strict';
import test from 'node:test';

import { deriveMfaVerified } from './auth.js';

test('deriveMfaVerified returns true when mfa_verified claim is true', () => {
  assert.equal(deriveMfaVerified({ sub: 'u1', mfa_verified: true }), true);
});

test('deriveMfaVerified returns true when amr includes otp', () => {
  assert.equal(deriveMfaVerified({ sub: 'u1', amr: ['pwd', 'otp'] }), true);
});

test('deriveMfaVerified returns false for password-only token', () => {
  assert.equal(deriveMfaVerified({ sub: 'u1', amr: ['pwd'] }), false);
});

test('deriveMfaVerified returns false when amr and mfa_verified absent', () => {
  assert.equal(deriveMfaVerified({ sub: 'u1' }), false);
});
