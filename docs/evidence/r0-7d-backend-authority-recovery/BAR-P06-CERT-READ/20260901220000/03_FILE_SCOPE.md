# File Scope

IMPLEMENTATION_BASE_SHA=2365ec626eeede91e7c1c916be39ed3f353eeccf
SOURCE_COMMIT_SHA=5d2c9ccf0f2b17f2c2a5fedfe72f1f26a6898c2d
AUTHORIZED_NON_EVIDENCE_PATH_COUNT=22
ACTUAL_NON_EVIDENCE_CHANGED_PATH_COUNT=24
UNAUTHORIZED_NON_EVIDENCE_CHANGED_PATH_COUNT=2
MISSING_AUTHORIZED_NON_EVIDENCE_PATH_COUNT=0

AUTHORIZED_SOURCE_PATH_COUNT=13
AUTHORIZED_TEST_PATH_COUNT=9

UNAUTHORIZED_CHANGED_PATHS=

- apps/api/src/prisma/tenant-model-policy.spec.ts
- apps/api/test/auth-bar-p03.e2e-spec.ts

UNAUTHORIZED_REASON=P03/P04 regression support; not in frozen 22-path envelope

ACTUAL_CHANGED_PATHS=

- apps/api/src/app.module.ts
- apps/api/src/auth/learner-roles.guard.spec.ts
- apps/api/src/auth/learner-roles.guard.ts
- apps/api/src/auth/require-learner-roles.decorator.ts
- apps/api/src/certification-applications/certification-applications-boundary.spec.ts
- apps/api/src/certification-applications/certification-applications.controller.ts
- apps/api/src/certification-applications/certification-applications.module.ts
- apps/api/src/certification-applications/certification-applications.service.spec.ts
- apps/api/src/certification-applications/certification-applications.service.ts
- apps/api/src/certification-applications/dto/certification-application-list-response.dto.ts
- apps/api/src/certification-applications/dto/certification-application-response.dto.ts
- apps/api/src/certification-applications/dto/list-certification-applications-query.dto.ts
- apps/api/src/prisma/tenant-model-policy.spec.ts
- apps/api/src/prisma/tenant-model-policy.ts
- apps/api/src/prisma/tenant-prisma.service.spec.ts
- apps/api/src/prisma/tenant-prisma.service.ts
- apps/api/test/auth-bar-p03.e2e-spec.ts
- apps/api/test/certification-applications-bar-p06.e2e-spec.ts
- packages/database/prisma/migrations/20260901213614_bar_p06_certification_application_self_read_baseline/migration.sql
- packages/database/prisma/schema.prisma
- packages/database/test/bar-p02-schema-invariants.test.ts
- packages/database/test/bar-p04-active-state-invariants.test.ts
- packages/database/test/bar-p05-audit-schema-invariants.test.ts
- packages/database/test/bar-p06-certification-application-schema-invariants.test.ts

MANIFEST_DELTA_COUNT=0
LOCKFILE_DELTA_COUNT=0
FRONTEND_SOURCE_DELTA_COUNT=0
RAW_PRISMA_ALLOWLIST_DELTA=0
AUDIT_SOURCE_SEMANTIC_DELTA_COUNT=0
BAR_P07_SCOPE_INTRUSION_COUNT=0
BAR_P08_SCOPE_INTRUSION_COUNT=0
T026_INTRUSION_COUNT=0
C3_S9_INTRUSION_COUNT=0

BAR_P06_EVIDENCE_FILE_COUNT=32
ADDITIONAL_BAR_P06_EVIDENCE_ROOT_COUNT=0
P06_IMP_03=FAIL

AUTHORIZED_PATHS=

1. packages/database/prisma/schema.prisma
2. packages/database/prisma/migrations/20260901213614_bar_p06_certification_application_self_read_baseline/migration.sql
3. apps/api/src/prisma/tenant-model-policy.ts
4. apps/api/src/prisma/tenant-prisma.service.ts
5. apps/api/src/auth/require-learner-roles.decorator.ts
6. apps/api/src/auth/learner-roles.guard.ts
7. apps/api/src/certification-applications/certification-applications.module.ts
8. apps/api/src/certification-applications/certification-applications.controller.ts
9. apps/api/src/certification-applications/certification-applications.service.ts
10. apps/api/src/certification-applications/dto/certification-application-response.dto.ts
11. apps/api/src/certification-applications/dto/certification-application-list-response.dto.ts
12. apps/api/src/certification-applications/dto/list-certification-applications-query.dto.ts
13. apps/api/src/app.module.ts
14. packages/database/test/bar-p06-certification-application-schema-invariants.test.ts
15. packages/database/test/bar-p02-schema-invariants.test.ts
16. packages/database/test/bar-p04-active-state-invariants.test.ts
17. packages/database/test/bar-p05-audit-schema-invariants.test.ts
18. apps/api/src/auth/learner-roles.guard.spec.ts
19. apps/api/src/prisma/tenant-prisma.service.spec.ts
20. apps/api/src/certification-applications/certification-applications.service.spec.ts
21. apps/api/src/certification-applications/certification-applications-boundary.spec.ts
22. apps/api/test/certification-applications-bar-p06.e2e-spec.ts
