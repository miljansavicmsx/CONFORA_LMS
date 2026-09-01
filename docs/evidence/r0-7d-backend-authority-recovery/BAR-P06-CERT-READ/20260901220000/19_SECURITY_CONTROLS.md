# Security Controls

P06_SECURITY_CONTROL_COUNT=32
P06_SECURITY_CONTROL_PASS_COUNT=32
P06_SECURITY_CONTROL_FAIL_COUNT=0

SECRET_FINDINGS=0
CREDENTIAL_FINDINGS=0
RAW_TOKEN_FINDINGS=0
PRIVATE_KEY_FINDINGS=0
REAL_USER_PII_FINDINGS=0
AUTH_BYPASS_FINDINGS=0
TENANT_BYPASS_FINDINGS=0
USER_OWNERSHIP_BYPASS_FINDINGS=0
MFA_POLICY_REGRESSION_FINDINGS=0
RAW_PRISMA_BYPASS_FINDINGS=0
RAW_SQL_FINDINGS=0
HIDDEN_WRITE_FINDINGS=0
FOREIGN_OBJECT_DISCLOSURE_FINDINGS=0

P06_SEC_01=PASS | Authentication required | proof=P06_TEST_013,P06_TEST_014
P06_SEC_02=PASS | Learner role gate USR_CAND/USR_CERT only | proof=P06_TEST_015,P06_TEST_016,P06_TEST_017
P06_SEC_03=PASS | Active tenant assurance | proof=P06_TEST_018
P06_SEC_04=PASS | Active user assurance | proof=P06_TEST_019
P06_SEC_05=PASS | Client tenant selector rejection | proof=P06_TEST_020
P06_SEC_06=PASS | Client applicant selector rejection | proof=P06_TEST_021
P06_SEC_07=PASS | Tenant isolation on list and detail | proof=P06_TEST_044,P06_TEST_050
P06_SEC_08=PASS | User ownership predicate enforced | proof=P06_TEST_043,P06_TEST_049,P06_TEST_065
P06_SEC_09=PASS | Uniform foreign-object 404 semantics | proof=P06_TEST_051
P06_SEC_10=PASS | Invalid UUID rejected before DB | proof=P06_TEST_047
P06_SEC_11=PASS | Limit bounds enforced | proof=P06_TEST_027,P06_TEST_028
P06_SEC_12=PASS | Status filter allowlist | proof=P06_TEST_034,P06_TEST_035
P06_SEC_13=PASS | Strict query key policy | proof=P06_TEST_036
P06_SEC_14=PASS | Server-controlled sort only | proof=P06_TEST_037,P06_TEST_038,P06_TEST_039
P06_SEC_15=PASS | No totalCount disclosure | proof=P06_TEST_040
P06_SEC_16=PASS | Six-field response minimization | proof=P06_TEST_046
P06_SEC_17=PASS | tenantId not exposed | proof=P06_TEST_052
P06_SEC_18=PASS | applicantUserId not exposed | proof=P06_TEST_053
P06_SEC_19=PASS | No raw Prisma expansion in P06 | proof=P06_TEST_067
P06_SEC_20=PASS | TenantPrisma read-only facade | proof=P06_TEST_063,P06_TEST_066
P06_SEC_21=PASS | No audit append in P06 | proof=P06_TEST_059
P06_SEC_22=PASS | No audit registration in P06 | proof=P06_TEST_059
P06_SEC_23=PASS | No legacy alias routes | proof=P06_TEST_069
P06_SEC_24=PASS | No public verification routes | proof=P06_TEST_071
P06_SEC_25=PASS | No certificate routes | proof=P06_TEST_070
P06_SEC_26=PASS | No staff reviewer routes | proof=P06_TEST_060
P06_SEC_27=PASS | No write or read-repair paths | proof=P06_TEST_057,P06_TEST_058
P06_SEC_28=PASS | No auth identity leakage | proof=P06_TEST_054
P06_SEC_29=PASS | TenantPrisma write denial preserved | proof=P06_TEST_066
P06_SEC_30=PASS | Foreign-object privacy on detail | proof=P06_TEST_065,P06_TEST_048,P06_TEST_049,P06_TEST_050
P06_SEC_31=PASS | P04 regression preserved | proof=P06_TEST_075
P06_SEC_32=PASS | Downstream scope boundary | proof=P06_TEST_072
