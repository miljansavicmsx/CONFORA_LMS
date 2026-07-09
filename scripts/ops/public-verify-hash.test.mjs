import assert from 'node:assert/strict';
import test from 'node:test';

import {
  PRECONDITION_FAILED_FIXTURE_MISSING,
  isPublicVerifyHash,
  listDbVerificationHashes,
  resolvePublicVerifyHash,
} from './public-verify-hash.mjs';

test('isPublicVerifyHash accepts 64-char hex', () => {
  assert.equal(
    isPublicVerifyHash('cedf36de04cb8d9866451349199e9861a4641c31bb48ea78c65cdf1eae6a7945'),
    true,
  );
  assert.equal(isPublicVerifyHash('not-a-hash'), false);
});

test('listDbVerificationHashes uses ACTIVE and ISSUED only', () => {
  const sqlCalls = [];
  const hashes = listDbVerificationHashes((sql) => {
    sqlCalls.push(sql);
    return 'cedf36de04cb8d9866451349199e9861a4641c31bb48ea78c65cdf1eae6a7945';
  });
  assert.ok(sqlCalls[0].includes("'ACTIVE', 'ISSUED'"));
  assert.ok(!sqlCalls[0].includes("'VALID'"));
  assert.equal(hashes.length, 1);
});

test('resolvePublicVerifyHash uses env hash when API probe passes', async () => {
  const envHash = 'cedf36de04cb8d9866451349199e9861a4641c31bb48ea78c65cdf1eae6a7945';
  const resolved = await resolvePublicVerifyHash({
    envHash,
    probeFn: async () => ({ ok: true, status: 200, valid: true }),
  });
  assert.deepEqual(resolved, { hash: envHash, source: 'env' });
});

test('resolvePublicVerifyHash returns precondition error when fixture missing', async () => {
  const resolved = await resolvePublicVerifyHash({
    envHash: undefined,
    runPsql: () => '',
    probeFn: async () => ({ ok: false, status: 404, valid: false }),
  });
  assert.equal(resolved.error, PRECONDITION_FAILED_FIXTURE_MISSING);
});
