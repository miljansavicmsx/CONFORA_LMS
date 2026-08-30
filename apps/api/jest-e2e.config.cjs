/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  testRegex: 'test/.*\\.e2e-spec\\.ts$',
  transform: { '^.+\\.ts$': 'ts-jest' },
  transformIgnorePatterns: ['/node_modules/(?!.pnpm/(jose@|jwks-rsa@)|jose/|jwks-rsa/)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@confora/shared-types$': '<rootDir>/../../packages/shared-types/src/index.ts',
    '^@confora/shared-kernel$': '<rootDir>/../../packages/shared-kernel/src/index.ts',
    '^@confora/ai-client$': '<rootDir>/../../packages/ai-client/src/index.ts',
    '^@confora/audit-client$': '<rootDir>/../../packages/audit-client/src/index.ts',
    '^@confora/ai-prompts$': '<rootDir>/../../packages/ai-prompts/src/index.ts',
    '^@confora/notification-templates$':
      '<rootDir>/../../packages/notification-templates/src/index.ts',
    '^@confora/database$': '<rootDir>/../../packages/database/src/index.ts',
    '^jose$': '<rootDir>/test/helpers/synthetic-jwks.fixture.ts',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testTimeout: 180_000,
};
