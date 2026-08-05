# CI Lane Verification

Tracked file: `docs/governance/R0_7E_CI_LANE_POLICY.md`.

Exactly six governed lane headings and identifiers exist: canonical tracked
workspace, transitional frontend, tracked legacy, missing authority,
governance-policy validation, and implementation-compliance validation.

Each lane contains authority, inclusions, exclusions, permitted results,
blocked-state semantics, evidence expectations, prohibited claims, exit
conditions, and owner-decision dependency.

The exact specification additionally requires distinct `Purpose` and
`Consuming work package` fields in every lane. Both labels occur zero times,
leaving twelve required fields absent.

Cross-lane semantics correctly keep missing paths visible, prevent blocked from
becoming pass, require approved scope for N/A, reject local-only authority, keep
`frontend-app` transitional, prohibit local-only `backend/**` promotion, keep
absent `packages/database/**` blocked, and prohibit hidden filtering.

`ci_lane_count = 6`

`ci_lane_missing_required_field_count = 12`

`ci_lane_verification = FAIL_EXACT_NORMATIVE_MANIFEST`
