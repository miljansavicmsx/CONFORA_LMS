/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  testRegex: 'test/.*\\.e2e-spec\\.ts$',
  transform: { '^.+\\.ts$': 'ts-jest' },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@confora/shared-types$': '<rootDir>/../../packages/shared-types/src/index.ts',
    '^@confora/shared-kernel$': '<rootDir>/../../packages/shared-kernel/src/index.ts',
    '^@confora/ai-client$': '<rootDir>/../../packages/ai-client/src/index.ts',
    '^@confora/audit-client$': '<rootDir>/../../packages/audit-client/src/index.ts',
    '^@confora/ai-prompts$': '<rootDir>/../../packages/ai-prompts/src/index.ts',
    '^@confora/notification-templates$': '<rootDir>/../../packages/notification-templates/src/index.ts',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};
