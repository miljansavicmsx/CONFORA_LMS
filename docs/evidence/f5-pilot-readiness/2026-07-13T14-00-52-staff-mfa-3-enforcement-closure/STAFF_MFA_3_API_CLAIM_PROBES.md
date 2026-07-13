# STAFF-MFA-3 API Claim Probes

Safe summaries only — no raw tokens.

## External user without MFA (`pilot.staff.mfa.external@confora.test`)

| Field | Value |
|-------|-------|
| Login OK | true |
| mfa_verified | false |
| amr includes otp | false |
| Staff overview status | 403 |

## With MFA (`N/A`)

| Field | Value |
|-------|-------|
| Nest /auth/mfa/verify OK | false |
| mfa_verified | N/A |
| amr includes otp | N/A |
| Staff overview allowed | false |

## Smoke staff (`pilot.staff@confora.test`) — LOCAL_ONLY

| Field | Value |
|-------|-------|
| mfa_verified (bypass) | true |
| Staff overview | 200 |

See `mfa-proof/route-probes.json` for full route matrix.
