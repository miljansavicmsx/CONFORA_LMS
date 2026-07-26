import assert from 'node:assert/strict';
import test from 'node:test';

import { aiMetadataSchema } from './index.js';

test('aiMetadataSchema enforces ISO metadata flags', () => {
  const parsed = aiMetadataSchema.safeParse({
    isAiGenerated: true,
    aiModel: 'gpt-test',
    aiModelVersion: '2026-01-01',
    aiPromptHash: 'sha256:abcd',
  });
  assert.equal(parsed.success, true);
});
