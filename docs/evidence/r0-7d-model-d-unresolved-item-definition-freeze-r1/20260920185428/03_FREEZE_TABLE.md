# Freeze table

DEFINITION_STATUS = FROZEN_PROSPECTIVE for every row.
SOURCE_AUTHORITY =
OWNER_APPROVE_R0_7D_MODEL_D_PROSPECTIVE_DEFINITION_MAP_R1 +
OWNER_AUTHORIZE_R0_7D_MODEL_D_UNRESOLVED_ITEM_DEFINITION_FREEZE_R1
SOURCE_HASH_OR_COMMIT = recovery ZIP
0c0d7a129fe87c0c5e41e29f6e66c433ace9ad33412c315e627a579079e47b69
plus this freeze record (commit SHA not claimed inside this commit).

| MD_ID | TITLE | RESIDUAL_REQUIREMENT | PRIMARY_PATH | ADDITIONAL_PATHS | ORIGINATING_BLOCKER | PREREQUISITES | DEFINITION_STATUS |
|-------|-------|----------------------|--------------|------------------|---------------------|---------------|-------------------|
| MD02 | EducationCharts residual | Restore missing `EducationCharts.tsx` so `AdminEducationPage.tsx` named import resolves; charts-only UI; no new certification decision logic | frontend-app/src/components/education/EducationCharts.tsx | none | C3-S2 MISSING_MB_E; still missing on tree 4cc8c700 | EDUCATION_CLUSTER deferred pending AD1C and verifiable identity authority; implementation not authorized by this freeze | FROZEN_PROSPECTIVE |
| MD03 | admin-education-api residual | Restore missing `admin-education-api.ts` so `AdminEducationPage.tsx` named imports resolve; network-bearing staff education client | frontend-app/src/lib/admin-education-api.ts | none | C3-S2 MISSING_MB_E; still missing on tree 4cc8c700 | EDUCATION_CLUSTER deferred pending AD1C and verifiable identity authority; tenant isolation; implementation not authorized by this freeze | FROZEN_PROSPECTIVE |
| MD05 | api-grievances residual | Restore missing `api-grievances.ts` so appeals/complaints consumers resolve; preserve ISO/IEC 17024 SoD | frontend-app/src/lib/api-grievances.ts | none | C3-S2 MISSING_MB_E; still missing on tree 4cc8c700 | Separate implementation authorization; SoD review; not a general C3-S9 resume | FROZEN_PROSPECTIVE |
| MD06 | IdentityReviewPage residual | Restore missing `IdentityReviewPage.tsx` so `App.tsx` lazy route resolves | frontend-app/src/pages/admin/IdentityReviewPage.tsx | none | C3-S2 MISSING_MB_E; still missing on tree 4cc8c700 | MD06_IS_NOT_HD06; HD06 remains KEEP_DEFERRED; GDPR/RBAC review on later implementation | FROZEN_PROSPECTIVE |
| MD07 | IdentityReviewGuard residual | Restore missing `IdentityReviewGuard.tsx` so `App.tsx` identity-review route guard resolves | frontend-app/src/pages/dashboard/IdentityReviewGuard.tsx | none | C3-S2 MISSING_MB_E; still missing on tree 4cc8c700 | MD07_IS_NOT_HD07; HD07_READY remains false; RBAC review on later implementation | FROZEN_PROSPECTIVE |
| MD09 | api-recertification residual | Restore missing `api-recertification.ts` so `MyRecertificationsPage.tsx` named imports resolve | frontend-app/src/lib/api-recertification.ts | none | C3-S2 MISSING_MB_E; still missing on tree 4cc8c700 | Separate implementation authorization; learner PII / recertification lifecycle | FROZEN_PROSPECTIVE |
| MD10 | AdminEducationGuard residual | Restore missing `AdminEducationGuard.tsx` so `App.tsx` admin/education route guard resolves | frontend-app/src/pages/dashboard/AdminEducationGuard.tsx | none | C3-S2 MISSING_MB_E; still missing on tree 4cc8c700 | EDUCATION_CLUSTER deferred pending AD1C and verifiable identity authority; RBAC; implementation not authorized by this freeze | FROZEN_PROSPECTIVE |
| MD12 | api-staff-cert-registry residual | Restore missing `api-staff-cert-registry.ts` so `api-certificates.ts` named imports resolve | frontend-app/src/lib/api-staff-cert-registry.ts | none | C3-S2 MISSING_MB_E; still missing on tree 4cc8c700 | Separate implementation authorization; registry-mode / credential-wallet coupling | FROZEN_PROSPECTIVE |

UNRESOLVED_ITEM_SET remains MD02, MD03, MD05, MD06, MD07, MD09, MD10, MD12.
No item in this table is formally resolved by this freeze.
