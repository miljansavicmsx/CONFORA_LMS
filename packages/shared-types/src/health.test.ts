import assert from 'node:assert/strict';
import test from 'node:test';

import { buildHealthResponse, healthResponseSchema } from './index.js';

test('healthResponseSchema accepts buildHealthResponse', () => {
  const value = buildHealthResponse('test');
  const parsed = healthResponseSchema.safeParse(value);
  assert.equal(parsed.success, true);
});
