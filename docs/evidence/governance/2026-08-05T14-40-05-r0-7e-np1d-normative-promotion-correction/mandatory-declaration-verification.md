# Mandatory Declaration Verification

Present exact declarations and controls:

- `R0_7D = OPEN_BLOCKING_R0_7E_IMPLEMENTATION` at
  `docs/governance/R0_7E_SCOPE_AND_AUTHORITY.md:34`;
- `WORKFLOW_MODIFICATION_AUTHORIZATION = false` at
  `docs/governance/R0_7E_ACTION_AND_ARTIFACT_PINNING_POLICY.md:42`;
- `FRONTEND_CLEAN_CLONE_BUILD = NOT_VERIFIED` and
  `BACKEND_JWT_AUTHORITY = CONTRACT_ONLY` in the non-claims policy;
- all six new governance documents retain proposed normative status;
- the compliance policy prohibits `ISO compliant`, `ISO certified`, and
  `compliance passed` and limits implementation-compliance results to `PASS`,
  `FAIL`, `BLOCKED_MISSING_TRACKED_AUTHORITY`, and
  `NOT_APPLICABLE_WITH_APPROVED_SCOPE`;
- protected standards text is controlled and unauthorized reproduction is
  prohibited.

Absent exact declarations:

1. `FRONTEND_AUTHORITY = BASELINE_TRACKED_GAP`;
2. `LOCAL_ONLY_CONTENT_CANNOT_CLOSE_TRACKED_GAPS = true`;
3. `PACKAGES_DATABASE_AUTHORITY = ABSENT`;
4. `DATABASE_IMPLEMENTATION_COMPLIANCE = BLOCKED_MISSING_TRACKED_AUTHORITY`;
5. `F4_VALIDATOR = SEPARATE_FOCUSED_PREREQUISITE`;
6. `TECH_DEBT_REGISTER = BASELINE_GOVERNANCE_GAP`;
7. `NO_IMPLEMENTATION_PACKAGE_IS_AUTHORIZED_BY_THIS_POLICY_ALONE`.

`proposed_normative_status_count = 6`

`required_exact_declaration_missing_count = 7`

`mandatory_declaration_verification = FAIL_EXACT_MANIFEST`
