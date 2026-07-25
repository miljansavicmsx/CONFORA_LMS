import assert from 'node:assert/strict';
import test from 'node:test';

import {
  AI_PROMPT_IDS_V1,
  fillPromptUserTemplateV1,
  fillTemplate,
  getPromptBundleV1,
} from './index';

test('getPromptBundleV1 loads known prompt lazily and returns bundle fields', () => {
  const bundle = getPromptBundleV1('chat.support');
  assert.equal(bundle.purpose, 'chat.support');
  assert.ok(bundle.system.includes('certification decisions'));
  assert.ok(bundle.user_template.includes('{{user_message}}'));
});

test('getPromptBundleV1 rejects unknown prompt ID (fail closed)', () => {
  assert.throws(() => getPromptBundleV1('question.explain'), /Unknown prompt ID/);
});

test('closed prompt ID list is complete', () => {
  assert.deepEqual([...AI_PROMPT_IDS_V1].sort(), [
    'chat.educational',
    'chat.support',
    'default',
    'question.generate',
    'risk.suggest',
  ]);
});

test('fillTemplate replaces allowlisted placeholders', () => {
  const out = fillTemplate('Hi {{user_message}}', { user_message: 'hello' });
  assert.equal(out, 'Hi hello');
});

test('fillTemplate rejects missing required variables', () => {
  assert.throws(() => fillTemplate('{{user_message}}', {}), /Missing required template variable/);
});

test('fillTemplate rejects triple braces', () => {
  assert.throws(() => fillTemplate('{{{user_message}}}', { user_message: 'x' }), /Triple-brace/);
});

test('fillTemplate rejects unknown placeholder vs explicit allowlist', () => {
  assert.throws(
    () =>
      fillTemplate('{{user_message}} {{evil}}', { user_message: 'a', evil: 'b' }, {
        allowedPlaceholders: ['user_message'],
      }),
    /Unknown template placeholder/,
  );
});

test('fillTemplate ignores extra vars not used by template', () => {
  const out = fillTemplate('{{user_message}}', {
    user_message: 'ok',
    course_id: 'extra-ok',
  });
  assert.equal(out, 'ok');
});

test('fillPromptUserTemplateV1 uses purpose allowlist', () => {
  const out = fillPromptUserTemplateV1('chat.support', { user_message: 'How do I enroll?' });
  assert.ok(out.includes('How do I enroll?'));
});

test('fillPromptUserTemplateV1 fails when required placeholder missing', () => {
  assert.throws(
    () => fillPromptUserTemplateV1('chat.educational', { user_message: 'hi' }),
    /Missing required template variable "context"/,
  );
});
