import assert from 'node:assert/strict';
import test from 'node:test';

import { interpolate, interpolateMjmlAllowlisted } from './events.js';

const baseVars = {
  heading: 'Hello',
  bodyText: 'Body',
  footer: 'Footer',
};

test('interpolateMjmlAllowlisted HTML-escapes script and quotes in body vars', () => {
  const template = '<mj-text>{{heading}}</mj-text><mj-text>{{bodyText}}</mj-text><mj-text>{{footer}}</mj-text>';
  const out = interpolateMjmlAllowlisted(template, {
    heading: '<script>x</script>',
    bodyText: `a & b "c" 'd'`,
    footer: '</mj-text>',
  });
  assert.equal(out.includes('<script>'), false);
  assert.equal(out.includes('&lt;script&gt;'), true);
  assert.equal(out.includes('&amp;'), true);
  assert.equal(out.includes('&quot;'), true);
  assert.equal(out.includes('&#39;'), true);
  assert.equal(out.includes('&lt;/mj-text&gt;'), true);
});

test('interpolateMjmlAllowlisted rejects unknown variables', () => {
  assert.throws(
    () =>
      interpolateMjmlAllowlisted('{{heading}}{{bodyText}}{{footer}}', {
        ...baseVars,
        evil: '<b>x</b>',
      }),
    /Unknown template variable/,
  );
});

test('interpolateMjmlAllowlisted rejects missing required variables', () => {
  assert.throws(
    () => interpolateMjmlAllowlisted('{{heading}}{{bodyText}}{{footer}}', { heading: 'h' }),
    /Missing required template variable/,
  );
});

test('interpolateMjmlAllowlisted does not allow raw HTML passthrough', () => {
  const out = interpolateMjmlAllowlisted('{{heading}}{{bodyText}}{{footer}}', {
    heading: '<b>bold</b>',
    bodyText: '<img src=x onerror=alert(1)>',
    footer: 'ok',
  });
  assert.equal(out.includes('<b>'), false);
  assert.equal(out.includes('<img'), false);
  assert.equal(out.includes('&lt;b&gt;'), true);
});

test('legacy interpolate() fails closed', () => {
  assert.throws(() => interpolate('{{heading}}', baseVars), /removed as unsafe/);
});
