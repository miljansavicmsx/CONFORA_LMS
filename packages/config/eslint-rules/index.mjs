import { noInlineScriptWithoutNonce } from './no-inline-script-without-nonce.mjs';

/** @type {import('eslint').ESLint.Plugin} */
export const conforaSecurityPlugin = {
  meta: { name: 'confora-security', version: '1.0.0' },
  rules: {
    'no-inline-script-without-nonce': noInlineScriptWithoutNonce,
  },
};
