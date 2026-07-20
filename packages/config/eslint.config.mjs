import js from '@eslint/js';
import tseslint from 'typescript-eslint';

import { conforaSecurityPlugin } from './eslint-rules/index.mjs';

/**
 * @param {string} rootDir - Repository root (absolute), for TypeScript project service.
 */
export default function createConforaEslintConfig(rootDir) {
  return tseslint.config(
    {
      ignores: [
        '**/node_modules/**',
        '**/dist/**',
        '**/.next/**',
        '**/coverage/**',
        'backend/**',
        'frontend-app/**',
        'frontend-public/**',
        'tests/e2e/**',
        '**/*.config.js',
        '**/*.config.cjs',
        '**/eslint.config.mjs',
        '**/next.config.mjs',
        'apps/examiner/main.cjs',
      ],
    },
    js.configs.recommended,
    ...tseslint.configs.strictTypeChecked,
    {
      languageOptions: {
        parserOptions: {
          projectService: true,
          tsconfigRootDir: rootDir,
        },
      },
    },
    {
      plugins: {
        'confora-security': conforaSecurityPlugin,
      },
      rules: {
        'confora-security/no-inline-script-without-nonce': 'error',
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/no-unused-vars': [
          'error',
          { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
        ],
        '@typescript-eslint/no-floating-promises': 'error',
        '@typescript-eslint/no-misused-promises': [
          'error',
          { checksVoidReturn: { attributes: false } },
        ],
        '@typescript-eslint/no-extraneous-class': 'off',
      },
    },
    {
      files: ['**/*.test.ts', '**/*.spec.ts'],
      rules: {
        '@typescript-eslint/no-floating-promises': 'off',
      },
    },
    {
      files: ['**/*.{ts,tsx}'],
      ignores: [
        '**/node_modules/**',
        '**/dist/**',
        '**/.next/**',
        '**/coverage/**',
        'backend/**',
        'frontend-app/**',
        'frontend-public/**',
        '**/tests/e2e/**',
        /** Centralized AI Gateway (only place vendor SDKs may be imported, if ever). */
        '**/apps/api/src/ai/**',
        '**/*.spec.ts',
        '**/*.e2e-spec.ts',
      ],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: [
              {
                name: 'openai',
                message:
                  'AI must go through the centralized gateway under apps/api/src/ai — no direct OpenAI SDK imports.',
              },
              {
                name: '@anthropic-ai/sdk',
                message:
                  'AI must go through the centralized gateway under apps/api/src/ai — no direct Anthropic SDK imports.',
              },
              {
                name: 'ollama',
                message:
                  'AI must go through the centralized gateway under apps/api/src/ai — no direct Ollama client imports.',
              },
            ],
            patterns: [
              {
                group: ['@ai-sdk/*'],
                message:
                  'AI must go through the centralized gateway under apps/api/src/ai — no Vercel AI SDK imports.',
              },
              {
                group: ['@google/generative-ai'],
                message:
                  'AI must go through the centralized gateway under apps/api/src/ai — no direct Google AI SDK imports.',
              },
            ],
          },
        ],
      },
    },
  );
}
