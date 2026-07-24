import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import * as mod from './index.js';

test('index exports safe surface only (no loader / interpolate)', () => {
  assert.equal(typeof mod.isNotificationEventKey, 'function');
  assert.equal(typeof mod.escapeHtmlText, 'function');
  assert.equal(typeof mod.resolveNotificationSubject, 'function');
  assert.equal('loadBundledEmailTemplate' in mod, false);
  assert.equal('interpolateMjmlAllowlisted' in mod, false);
  assert.equal('interpolate' in mod, false);
});

test('index.ts source does not import events or templates', () => {
  const src = readFileSync(join(__dirname, 'index.ts'), 'utf8');
  assert.equal(/from\s+['"]\.\/events['"]/.test(src), false);
  assert.equal(/templates\//.test(src), false);
  assert.equal(/readFileSync|node:fs/.test(src), false);
});

test('index module does not expose provider/recipient/tenant routing APIs', () => {
  for (const banned of [
    'sendEmail',
    'resolveRecipients',
    'tenantId',
    'deliver',
    'provider',
    'decideCertification',
  ]) {
    assert.equal(banned in mod, false, `unexpected export: ${banned}`);
  }
});
