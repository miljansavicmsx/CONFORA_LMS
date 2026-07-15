# STAFF-MFA-3 API Claim Probes

Safe summaries only — no raw tokens.

## No-MFA denial fixture (`pilot.staff.no-mfa@confora.test`)

| Field | Value |
|-------|-------|
| Login OK | true |
| mfa_verified | false |
| amr includes otp | false |
| Staff overview status | 403 |

## With MFA local route-proof (`pilot.staff.mfa.route-proof@confora.test`)

| Field | Value |
|-------|-------|
| Nest /auth/mfa/verify OK | false |
| mfa_verified | N/A |
| amr includes otp | N/A |
| Staff overview allowed | false |
| Direct-grant limitation | yes (PARTIAL route proof) |

## Enrolled staff without smoke (`pilot.staff@confora.test`)

| Field | Value |
|-------|-------|
| Login OK | false |
| mfa_verified | N/A |
| Smoke bypass absent | true |

See `mfa-proof/route-probes.json` for full route matrix.
