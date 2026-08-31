import assert from 'node:assert/strict';
import test from 'node:test';

import { deriveMfaVerified, LEARNER_ROLES, MFA_MANDATORY_ROLES, PRIVILEGED_ROLES } from './auth.js';

test('P04_TEST_021 mfa_verified=true -> evidence true', () => {
  assert.equal(deriveMfaVerified({ sub: 'u1', mfa_verified: true }), true);
});

test('P04_TEST_022 amr otp -> true', () => {
  assert.equal(deriveMfaVerified({ sub: 'u1', amr: ['pwd', 'otp'] }), true);
});

test('P04_TEST_023 amr totp -> true', () => {
  assert.equal(deriveMfaVerified({ sub: 'u1', amr: ['totp'] }), true);
});

test('P04_TEST_024 amr mfa -> true', () => {
  assert.equal(deriveMfaVerified({ sub: 'u1', amr: ['mfa'] }), true);
});

test('P04_TEST_025 pwd-only -> false', () => {
  assert.equal(deriveMfaVerified({ sub: 'u1', amr: ['pwd'] }), false);
});

test('P04_TEST_026 missing MFA evidence -> false', () => {
  assert.equal(deriveMfaVerified({ sub: 'u1' }), false);
});

test('keeps MFA_MANDATORY_ROLES aligned with PRIVILEGED_ROLES', () => {
  assert.equal(PRIVILEGED_ROLES.length, 15);
  assert.equal(MFA_MANDATORY_ROLES, PRIVILEGED_ROLES);
  assert.deepEqual([...MFA_MANDATORY_ROLES], [...PRIVILEGED_ROLES]);
  assert.ok(PRIVILEGED_ROLES.includes('ISSUANCE_OFFICER'));
  assert.ok(PRIVILEGED_ROLES.includes('LIFECYCLE_OFFICER'));
});

test('learner roles are exactly USR_CAND and USR_CERT', () => {
  assert.deepEqual([...LEARNER_ROLES], ['USR_CAND', 'USR_CERT']);
});
