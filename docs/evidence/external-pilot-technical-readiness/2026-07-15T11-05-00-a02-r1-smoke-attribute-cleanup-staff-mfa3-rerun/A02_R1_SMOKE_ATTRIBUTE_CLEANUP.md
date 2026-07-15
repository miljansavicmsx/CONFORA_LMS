# A-02-R1 Smoke Attribute Cleanup

**Status:** `DONE`

**Keycloak:** `http://localhost:18080` / realm `confora`

## Scope

Removed local smoke MFA bypass attributes from enrolled external-facing staff accounts where real OTP credentials were already present.

**Users cleaned:**

- `pilot.manager@confora.test`
- `pilot.staff@confora.test`
- `pilot.director@confora.test`

**Attribute keys inspected / removed if present:**

- `pilot_smoke_mfa_verified`
- `smoke_mfa_verified`
- `mfa_smoke_bypass`

**Not removed:** OTP credentials, roles, groups, tenant attributes, or identity attributes.

## Before / after

| User | Smoke before | Keys before | Smoke after | OTP preserved |
|------|--------------|-------------|-------------|----------------|
| `pilot.manager@confora.test` | yes | `pilot_smoke_mfa_verified` | no | yes |
| `pilot.staff@confora.test` | yes | `pilot_smoke_mfa_verified` | no | yes |
| `pilot.director@confora.test` | yes | `pilot_smoke_mfa_verified` | no | yes |
| `pilot.mfa.staff@confora.test` | no | — | no | yes |
| `pilot.staff.mfa.external@confora.test` | no | — | no | yes (at cleanup; see STAFF-MFA-3 note) |

**Cleanup actions:** REMOVED for all three target users (Admin API PUT without smoke keys; credentials not rewritten).

## Governance note

`pilot_smoke_mfa_verified` is **not** treated as valid external-pilot MFA. Removing it from enrolled staff strengthens hygiene for security-delegate review. It also breaks the STAFF-MFA-3 script’s expectation that `pilot.staff@confora.test` still carries a LOCAL_ONLY smoke bypass — documented in the STAFF-MFA-3 rerun evidence.

Raw metadata: `keycloak-smoke-attribute-cleanup-r1.json`
