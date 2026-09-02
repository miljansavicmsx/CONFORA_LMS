# Implementation Controls

P06_IMPLEMENTATION_CONTROL_COUNT=28
P06_IMPLEMENTATION_CONTROL_PASS_COUNT=27
P06_IMPLEMENTATION_CONTROL_FAIL_COUNT=1

P06_IMP_01=PASS | Implementation base SHA exact | proof=git rev-parse 2365ec626eeede91e7c1c916be39ed3f353eeccf matches IMPLEMENTATION_BASE_SHA
P06_IMP_02=PASS | Feature branch exact | proof=branch=governance/r0-7d-bar-p06-cert-read
P06_IMP_03=FAIL | Non-evidence changed path count exactly 22 | proof=git diff --name-only base..source = 24 paths (expected 22)
P06_IMP_04=PASS | Schema model count contract | proof=P06_TEST_001
P06_IMP_05=PASS | Schema enum count contract | proof=P06_TEST_002
P06_IMP_06=PASS | Prior migrations unchanged | proof=P06_TEST_009
P06_IMP_07=PASS | Resulting model count 6 | proof=P06_TEST_001
P06_IMP_08=PASS | Resulting enum count 2 | proof=P06_TEST_002
P06_IMP_09=PASS | TenantPrisma model registration | proof=P06_TEST_063
P06_IMP_10=PASS | Production route count 2 | proof=P06_TEST_068
P06_IMP_11=PASS | Six-field detail projection | proof=P06_TEST_046
P06_IMP_12=PASS | Package manifest delta zero | proof=git diff base..source package.json count=0
P06_IMP_13=PASS | Lockfile delta zero | proof=git diff base..source pnpm-lock.yaml empty
P06_IMP_14=PASS | Raw Prisma allowlist delta zero | proof=P06_TEST_067 + cmd 12
P06_IMP_15=PASS | Frontend source delta zero | proof=no frontend-app/\*\* in diff
P06_IMP_16=PASS | Audit event delta zero | proof=P06_TEST_059
P06_IMP_17=PASS | No legacy alias routes | proof=P06_TEST_069
P06_IMP_18=PASS | No staff routes | proof=P06_TEST_060
P06_IMP_19=PASS | No certificate routes | proof=P06_TEST_070
P06_IMP_20=PASS | P07/P08/T026/C3-S9 delta zero | proof=P06_TEST_072
P06_IMP_21=PASS | Source commit message exact | proof=feat(certification): establish BAR-P06 self-read authority
P06_IMP_22=PASS | Evidence commit message reserved | proof=docs(evidence): record BAR-P06 certification read recovery (pending evidence commit)
P06_IMP_23=PASS | Feature commit topology forward-only | proof=SOURCE_COMMIT parent = BASE
P06_IMP_24=PASS | No merge commit in feature chain | proof=FEATURE_MERGE_COMMIT_COUNT_FROM_BASE=0
P06_IMP_25=PASS | Evidence file count 32 | proof=BAR_P06_EVIDENCE_FILE_COUNT=32
P06_IMP_26=PASS | P03 regression proof | proof=cmds 10-11 + P06_TEST_074
P06_IMP_27=PASS | P04 regression proof | proof=cmds 12-14 + P06_TEST_075
P06_IMP_28=PASS | No PR created | proof=PR_CREATED=false
