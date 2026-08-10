# CI Lane Verification

Tracked file: `docs/governance/R0_7E_CI_LANE_POLICY.md`.

Exactly six lane headings and six identifiers exist:

1. canonical tracked workspace;
2. transitional frontend;
3. tracked legacy;
4. missing authority;
5. governance-policy validation;
6. implementation-compliance validation.

For each of the six lanes, authority, inclusions, exclusions, permitted results,
blocked-state semantics, evidence expectations, prohibited claims, exit
conditions, and owner-decision dependency are present.

The subsequently approved exact manifest also requires a distinct `Purpose`
and `Consuming work package` field for every lane. Both field labels occur zero
times, producing twelve missing required lane fields.

The mandatory cross-lane semantics preserve visible missing paths, blocked is
not pass, N/A requires approved scope, local-only files cannot satisfy a lane,
`frontend-app` remains transitional, local-only `backend/**` is not promoted,
absent `packages/database/**` remains blocked, and hidden filtering is
prohibited.

`ci_lane_count = 6`

`ci_lane_missing_required_field_count = 12`

`ci_lane_verification = FAIL_EXACT_MANIFEST`
