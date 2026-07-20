/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@confora/ai-client$': '<rootDir>/../../../packages/ai-client/src/index.ts',
    '^@confora/ai-prompts$': '<rootDir>/../../../packages/ai-prompts/src/index.ts',
    '^@confora/notification-templates$': '<rootDir>/../../../packages/notification-templates/src/index.ts',
    '^@confora/shared-types$': '<rootDir>/../../../packages/shared-types/src/index.ts',
    '^@confora/shared-kernel$': '<rootDir>/../../../packages/shared-kernel/src/index.ts',
    '^@confora/audit-client$': '<rootDir>/../../../packages/audit-client/src/index.ts',
    '^@/(.*)$': '<rootDir>/$1',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  collectCoverageFrom: [
    '**/*.ts',
    '!**/*.spec.ts',
    '!**/main.ts',
    '!**/*.module.ts',
    '!**/schema.gql.ts',
    '!graphql/**',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};

if (process.env['COVERAGE_ENFORCE'] === '1') {
  module.exports.coverageThreshold = {
    global: {
      lines: 80,
      statements: 80,
      functions: 75,
      branches: 65,
    },
  };
}
