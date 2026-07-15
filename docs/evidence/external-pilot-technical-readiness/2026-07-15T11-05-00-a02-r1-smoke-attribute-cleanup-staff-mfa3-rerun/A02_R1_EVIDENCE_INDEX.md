# A-02-R1 Evidence Index

**Task:** Smoke attribute cleanup and STAFF-MFA-3 rerun (technical security-condition cleanup only)

**Evidence folder:** `docs/evidence/external-pilot-technical-readiness/2026-07-15T11-05-00-a02-r1-smoke-attribute-cleanup-staff-mfa3-rerun/`

**Linked priors:**

| Package | Path | Status |
|---------|------|--------|
| A-01-R4 | `docs/evidence/external-pilot-technical-readiness/2026-07-15T10-30-00-a01-r4-manual-totp-enrollment-final-recheck/` | GO (pending security delegate) |
| A-02 | `docs/evidence/external-pilot-technical-readiness/2026-07-15T10-47-00-a02-security-delegate-signoff-review/` | Ready for review, **not signed** |
| STAFF-MFA-3 baseline | `docs/evidence/f5-pilot-readiness/2026-07-13T14-24-16-staff-mfa-3-enforcement-closure/` | Prior closure |
| STAFF-MFA-3 R1 | `docs/evidence/f5-pilot-readiness/2026-07-13T14-27-00-staff-mfa-3-r1-enforcement-remediation/` | Prior remediation |
| STAFF-MFA-3 A-02-R1 live rerun | `docs/evidence/f5-pilot-readiness/2026-07-15T11-02-47-staff-mfa-3-enforcement-closure/` | Rerun (PARTIAL / NO_GO from script) |
| TD-085 | `docs/evidence/td-085-sequential-regression/2026-07-13T14-26-35-td-085/` | Linked; not re-run |

## Artifacts in this folder

| File | Purpose |
|------|---------|
| `A02_R1_EVIDENCE_INDEX.md` | This index |
| `A02_R1_SMOKE_ATTRIBUTE_CLEANUP.md` | Smoke bypass attribute removal |
| `A02_R1_KEYCLOAK_OTP_REVERIFY.md` | OTP presence re-verify |
| `A02_R1_STAFF_MFA3_RERUN.md` | API health + STAFF-MFA-3 rerun |
| `A02_R1_RESIDUAL_RISKS.md` | Residual risks |
| `A02_R1_REPORT.md` | Rollup report and verdict |
| `keycloak-smoke-attribute-cleanup-r1.json` | Safe Keycloak metadata (before/after) |
| `summary.json` | Machine-readable summary |

## Hard constraints respected

- Security delegate **not** signed (no fabricated signature)
- External pilot **not** approved
- DPO/legal **not** signed
- Real personal data **not** approved
- Staging/production readiness **not** claimed
- No passwords, TOTP secrets, QR codes, tokens, or cookies captured or committed
