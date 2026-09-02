# Build / Unit Validation CMD01..CMD10

CMD01=PASS corepack pnpm@9.14.2 install --frozen-lockfile
CMD02=PASS prisma generate
CMD03=PASS prisma validate (DATABASE_URL disposable env for validate only)
CMD04=PASS @confora/database build
CMD05=PASS @confora/database typecheck
CMD06=PASS @confora/database test (42 tests incl P07_TEST_001-004,089)
CMD07=PASS @confora/shared-types build
CMD08=PASS @confora/shared-kernel build
CMD09=PASS @confora/api build
CMD10=PASS jest report-query + tenant-prisma-p07 unit suites (72 tests)
