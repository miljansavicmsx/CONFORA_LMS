import { RuleTester } from 'eslint';
import tseslint from 'typescript-eslint';
import { noInlineScriptWithoutNonce } from './no-inline-script-without-nonce.mjs';

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

ruleTester.run('no-inline-script-without-nonce', noInlineScriptWithoutNonce, {
  valid: [
    { code: '<script nonce={n} src="/app.js" />' },
    { code: '<div />' },
  ],
  invalid: [
    {
      code: '<script src="/evil.js" />',
      errors: [{ messageId: 'missingNonce' }],
    },
    {
      code: '<script>alert(1)</script>',
      errors: [{ messageId: 'missingNonce' }, { messageId: 'forbiddenInline' }],
    },
  ],
});

console.log('no-inline-script-without-nonce: ok');
