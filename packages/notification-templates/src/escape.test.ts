import assert from 'node:assert/strict';
import test from 'node:test';

import { escapeHtmlText, sanitizePlainTextSubject } from './escape.js';

test('escapeHtmlText escapes ampersand, angles, and quotes', () => {
  assert.equal(
    escapeHtmlText(`a & b <script> "x" 'y'`),
    'a &amp; b &lt;script&gt; &quot;x&quot; &#39;y&#39;',
  );
});

test('escapeHtmlText prevents raw script passthrough', () => {
  const escaped = escapeHtmlText('<script>alert(1)</script>');
  assert.equal(escaped.includes('<script>'), false);
  assert.equal(escaped.includes('&lt;script&gt;'), true);
});

test('sanitizePlainTextSubject strips CR/LF header injection', () => {
  assert.equal(sanitizePlainTextSubject('Hello\r\nBcc: evil@example.com'), 'Hello Bcc: evil@example.com');
});
