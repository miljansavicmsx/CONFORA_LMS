# P06 Behavior Matrix

P06_TEST_ID_COUNT=76
P06_TEST_ID_UNIQUE_VALUE_COUNT=76
P06_TEST_ID_DUPLICATE_COUNT=0
P06_TEST_ID_MISSING_COUNT=0
P06_EVIDENCE_BEHAVIOR_MATRIX_ROW_COUNT=76
P06_EVIDENCE_BEHAVIOR_PASS_COUNT=76
P06_EVIDENCE_BEHAVIOR_FAIL_COUNT=0
P06_EVIDENCE_BEHAVIOR_SKIPPED_COUNT=0

P06_TEST_001=PASS | behavior=Resulting Prisma model count exactly 6 | proof=packages/database/test/bar-p06-certification-application-schema-invariants.test.ts | command=cmd 06 database test
P06_TEST_002=PASS | behavior=Resulting Prisma enum count exactly 2 | proof=packages/database/test/bar-p06-certification-application-schema-invariants.test.ts | command=cmd 06 database test
P06_TEST_003=PASS | behavior=CertificationApplicationStatus values exactly DRAFT,SUBMITTED,UNDER_REVIEW,APPROVED,REJECTED in order | proof=packages/database/test/bar-p06-certification-application-schema-invariants.test.ts | command=cmd 06 database test
P06_TEST_004=PASS | behavior=CertificationApplication has exactly 8 semantic fields | proof=packages/database/test/bar-p06-certification-application-schema-invariants.test.ts | command=cmd 06 database test
P06_TEST_005=PASS | behavior=Tenant FK onDelete Restrict | proof=packages/database/test/bar-p06-certification-application-schema-invariants.test.ts | command=cmd 06 database test
P06_TEST_006=PASS | behavior=Composite User FK onDelete Restrict | proof=packages/database/test/bar-p06-certification-application-schema-invariants.test.ts | command=cmd 06 database test
P06_TEST_007=PASS | behavior=Required list sort index exact | proof=packages/database/test/bar-p06-certification-application-schema-invariants.test.ts | command=cmd 06 database test
P06_TEST_008=PASS | behavior=Required status filter index exact | proof=packages/database/test/bar-p06-certification-application-schema-invariants.test.ts | command=cmd 06 database test
P06_TEST_009=PASS | behavior=Prior migration directories unchanged | proof=packages/database/test/bar-p06-certification-application-schema-invariants.test.ts | command=cmd 06 database test
P06_TEST_010=PASS | behavior=Migration contains no application INSERT/backfill | proof=packages/database/test/bar-p06-certification-application-schema-invariants.test.ts | command=cmd 19 direct tsx Phase A
P06_TEST_011=PASS | behavior=Pre-existing Tenant/User/EIL IDs preserved after P06 migration | proof=packages/database/test/bar-p06-certification-application-schema-invariants.test.ts | command=cmd 19 direct tsx Phase A
P06_TEST_012=PASS | behavior=Tenant/User isActive preserved after P06 migration | proof=packages/database/test/bar-p06-certification-application-schema-invariants.test.ts | command=cmd 19 direct tsx Phase A
P06_TEST_013=PASS | behavior=Unauthenticated request denied | proof=apps/api/test/certification-applications-bar-p06.e2e-spec.ts | command=cmd 18 P06 e2e
P06_TEST_014=PASS | behavior=Invalid bearer token denied | proof=apps/api/test/certification-applications-bar-p06.e2e-spec.ts | command=cmd 18 P06 e2e
P06_TEST_015=PASS | behavior=USR_CAND allowed | proof=apps/api/test/certification-applications-bar-p06.e2e-spec.ts | command=cmd 18 P06 e2e
P06_TEST_016=PASS | behavior=USR_CERT allowed | proof=apps/api/test/certification-applications-bar-p06.e2e-spec.ts | command=cmd 18 P06 e2e
P06_TEST_017=PASS | behavior=Staff-only actor denied | proof=apps/api/test/certification-applications-bar-p06.e2e-spec.ts | command=cmd 18 P06 e2e
P06_TEST_018=PASS | behavior=Inactive tenant denied | proof=apps/api/test/certification-applications-bar-p06.e2e-spec.ts | command=cmd 18 P06 e2e
P06_TEST_019=PASS | behavior=Inactive user denied | proof=apps/api/test/certification-applications-bar-p06.e2e-spec.ts | command=cmd 18 P06 e2e
P06_TEST_020=PASS | behavior=Client tenant selector denied | proof=apps/api/test/certification-applications-bar-p06.e2e-spec.ts | command=cmd 18 P06 e2e
P06_TEST_021=PASS | behavior=Client applicant selector denied | proof=apps/api/test/certification-applications-bar-p06.e2e-spec.ts | command=cmd 18 P06 e2e
P06_TEST_022=PASS | behavior=Empty owned list returns 200 with items:[] | proof=apps/api/test/certification-applications-bar-p06.e2e-spec.ts | command=cmd 20 Phase B
P06_TEST_023=PASS | behavior=Default limit 50 | proof=apps/api/test/certification-applications-bar-p06.e2e-spec.ts | command=cmd 20 Phase B
P06_TEST_024=PASS | behavior=Explicit valid limit accepted | proof=apps/api/src/certification-applications/certification-applications.service.spec.ts | command=cmd 17 P06 unit
P06_TEST_025=PASS | behavior=Limit minimum 1 accepted | proof=apps/api/src/certification-applications/certification-applications.service.spec.ts | command=cmd 17 P06 unit
P06_TEST_026=PASS | behavior=Limit maximum 100 accepted | proof=apps/api/src/certification-applications/certification-applications.service.spec.ts | command=cmd 17 P06 unit
P06_TEST_027=PASS | behavior=Limit 0 rejected | proof=apps/api/src/certification-applications/certification-applications.service.spec.ts | command=cmd 17 P06 unit
P06_TEST_028=PASS | behavior=Limit 101 rejected | proof=apps/api/src/certification-applications/certification-applications.service.spec.ts | command=cmd 17 P06 unit
P06_TEST_029=PASS | behavior=Noninteger limit rejected | proof=apps/api/src/certification-applications/certification-applications.service.spec.ts | command=cmd 17 P06 unit
P06_TEST_030=PASS | behavior=Default offset 0 | proof=apps/api/test/certification-applications-bar-p06.e2e-spec.ts | command=cmd 20 Phase B
P06_TEST_031=PASS | behavior=Valid positive offset accepted | proof=apps/api/test/certification-applications-bar-p06.e2e-spec.ts | command=cmd 20 Phase B
P06_TEST_032=PASS | behavior=Negative offset rejected | proof=apps/api/src/certification-applications/certification-applications.service.spec.ts | command=cmd 17 P06 unit
P06_TEST_033=PASS | behavior=Noninteger offset rejected | proof=apps/api/src/certification-applications/certification-applications.service.spec.ts | command=cmd 17 P06 unit
P06_TEST_034=PASS | behavior=All five canonical status filters accepted | proof=apps/api/src/certification-applications/certification-applications.service.spec.ts | command=cmd 17 P06 unit
P06_TEST_035=PASS | behavior=Invalid status rejected | proof=apps/api/src/certification-applications/certification-applications.service.spec.ts | command=cmd 17 P06 unit
P06_TEST_036=PASS | behavior=Unknown query key rejected | proof=apps/api/src/certification-applications/certification-applications.service.spec.ts | command=cmd 17 P06 unit
P06_TEST_037=PASS | behavior=Client sort selector rejected | proof=apps/api/src/certification-applications/certification-applications.service.spec.ts | command=cmd 17 P06 unit
P06_TEST_038=PASS | behavior=createdAt DESC ordering | proof=apps/api/test/certification-applications-bar-p06.e2e-spec.ts | command=cmd 20 Phase B
P06_TEST_039=PASS | behavior=id DESC tie-break when createdAt equal | proof=apps/api/test/certification-applications-bar-p06.e2e-spec.ts | command=cmd 20 Phase B
P06_TEST_040=PASS | behavior=No totalCount in response | proof=apps/api/test/certification-applications-bar-p06.e2e-spec.ts | command=cmd 20 Phase B
P06_TEST_041=PASS | behavior=hasMore false when rows <= limit | proof=apps/api/src/certification-applications/certification-applications.service.spec.ts | command=cmd 17 P06 unit
P06_TEST_042=PASS | behavior=hasMore true when rows > limit | proof=apps/api/src/certification-applications/certification-applications.service.spec.ts | command=cmd 17 P06 unit
P06_TEST_043=PASS | behavior=Only actor-owned records in list | proof=apps/api/test/certification-applications-bar-p06.e2e-spec.ts | command=cmd 20 Phase B
P06_TEST_044=PASS | behavior=Only actor-tenant records in list | proof=apps/api/test/certification-applications-bar-p06.e2e-spec.ts | command=cmd 20 Phase B
P06_TEST_045=PASS | behavior=Own detail returns 200 | proof=apps/api/test/certification-applications-bar-p06.e2e-spec.ts | command=cmd 20 Phase B
P06_TEST_046=PASS | behavior=Exact six-field projection | proof=apps/api/test/certification-applications-bar-p06.e2e-spec.ts | command=cmd 20 Phase B
P06_TEST_047=PASS | behavior=Invalid UUID returns 400 | proof=apps/api/test/certification-applications-bar-p06.e2e-spec.ts | command=cmd 20 Phase B
P06_TEST_048=PASS | behavior=Absent UUID returns 404 | proof=apps/api/test/certification-applications-bar-p06.e2e-spec.ts | command=cmd 20 Phase B
P06_TEST_049=PASS | behavior=Same-tenant other user returns 404 | proof=apps/api/test/certification-applications-bar-p06.e2e-spec.ts | command=cmd 20 Phase B
P06_TEST_050=PASS | behavior=Other-tenant returns 404 | proof=apps/api/test/certification-applications-bar-p06.e2e-spec.ts | command=cmd 20 Phase B
P06_TEST_051=PASS | behavior=Foreign 404 bodies materially indistinguishable | proof=apps/api/test/certification-applications-bar-p06.e2e-spec.ts | command=cmd 20 Phase B
P06_TEST_052=PASS | behavior=No tenantId in response | proof=apps/api/test/certification-applications-bar-p06.e2e-spec.ts | command=cmd 20 Phase B
P06_TEST_053=PASS | behavior=No applicantUserId in response | proof=apps/api/test/certification-applications-bar-p06.e2e-spec.ts | command=cmd 20 Phase B
P06_TEST_054=PASS | behavior=No auth identity fields in response | proof=apps/api/test/certification-applications-bar-p06.e2e-spec.ts | command=cmd 20 Phase B
P06_TEST_055=PASS | behavior=No workflow reviewer internals in response | proof=apps/api/test/certification-applications-bar-p06.e2e-spec.ts | command=cmd 20 Phase B
P06_TEST_056=PASS | behavior=No audit metadata in response | proof=apps/api/test/certification-applications-bar-p06.e2e-spec.ts | command=cmd 20 Phase B
P06_TEST_057=PASS | behavior=Service exposes no certification write API | proof=apps/api/src/certification-applications/certification-applications-boundary.spec.ts | command=cmd 17 P06 unit
P06_TEST_058=PASS | behavior=No lazy creation or read repair | proof=apps/api/src/certification-applications/certification-applications-boundary.spec.ts | command=cmd 17 P06 unit
P06_TEST_059=PASS | behavior=Zero audit append or registration in P06 module | proof=apps/api/src/certification-applications/certification-applications-boundary.spec.ts | command=cmd 17 P06 unit
P06_TEST_060=PASS | behavior=Zero staff reviewer queue routes | proof=apps/api/src/certification-applications/certification-applications-boundary.spec.ts | command=cmd 17 P06 unit
P06_TEST_061=PASS | behavior=Zero certificate or public verification routes | proof=apps/api/src/certification-applications/certification-applications-boundary.spec.ts | command=cmd 17 P06 unit
P06_TEST_062=PASS | behavior=CertificationApplication registered in tenant model policy | proof=apps/api/src/prisma/tenant-prisma.service.spec.ts | command=cmd 17 P06 unit
P06_TEST_063=PASS | behavior=TenantPrisma certificationApplication exposes only findFirst/findMany | proof=apps/api/src/prisma/tenant-prisma.service.spec.ts | command=cmd 17 P06 unit
P06_TEST_064=PASS | behavior=certificationApplication list forces request tenant | proof=apps/api/src/prisma/tenant-prisma.service.spec.ts | command=cmd 12 P04 unit
P06_TEST_065=PASS | behavior=applicantUserId predicate applied in list and detail query | proof=apps/api/src/certification-applications/certification-applications.service.spec.ts | command=cmd 17 P06 unit
P06_TEST_066=PASS | behavior=TenantPrisma global write/raw/transaction remains denied | proof=apps/api/src/prisma/tenant-prisma.service.spec.ts | command=cmd 12 P04 unit
P06_TEST_067=PASS | behavior=No raw Prisma imports in P06 module | proof=apps/api/src/certification-applications/certification-applications-boundary.spec.ts | command=cmd 17 P06 unit
P06_TEST_068=PASS | behavior=Production route count exactly 2 | proof=apps/api/src/certification-applications/certification-applications-boundary.spec.ts | command=cmd 17 P06 unit
P06_TEST_069=PASS | behavior=Zero legacy alias routes | proof=apps/api/src/certification-applications/certification-applications-boundary.spec.ts | command=cmd 17 P06 unit
P06_TEST_070=PASS | behavior=Zero certificate routes | proof=apps/api/src/certification-applications/certification-applications-boundary.spec.ts | command=cmd 17 P06 unit
P06_TEST_071=PASS | behavior=Zero public verification routes | proof=apps/api/src/certification-applications/certification-applications-boundary.spec.ts | command=cmd 17 P06 unit
P06_TEST_072=PASS | behavior=Zero P07/P08/T026/C3-S9 intrusion | proof=apps/api/src/certification-applications/certification-applications-boundary.spec.ts | command=cmd 17 P06 unit
P06_TEST_073=PASS | behavior=P02 invariant adaptation marker | proof=packages/database/test/bar-p02-schema-invariants.test.ts | command=cmd 06 database test
P06_TEST_074=PASS | behavior=P03 regression external proof marker | proof=apps/api/src/certification-applications/certification-applications-boundary.spec.ts | command=cmds 10-11 P03 regression
P06_TEST_075=PASS | behavior=P04 regression external proof marker | proof=apps/api/src/certification-applications/certification-applications-boundary.spec.ts | command=cmds 12-14 P04 regression
P06_TEST_076=PASS | behavior=P05 regression external proof marker | proof=apps/api/src/certification-applications/certification-applications-boundary.spec.ts | command=cmd 15 P05 unit; cmd 16 jest-e2e P05 integration
