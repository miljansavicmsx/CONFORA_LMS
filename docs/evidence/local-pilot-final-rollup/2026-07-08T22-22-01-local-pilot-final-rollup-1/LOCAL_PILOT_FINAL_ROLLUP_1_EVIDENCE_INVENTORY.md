# LOCAL_PILOT_FINAL_ROLLUP_1 Evidence Inventory

Rollup timestamp: **2026-07-08T22-22-01** (local pilot final rollup session)

## Primary gates (canonical evidence)

| Gate | Evidence folder | Verdict | Checks | Mode |
|------|-----------------|---------|--------|------|
| F4-9 smoke | `docs/evidence/f4-9-faza4-smoke/2026-07-08T17-14-43/` | GO | 64/64 | LINKED |
| F5-3 data readiness | `docs/evidence/f5-pilot-readiness/2026-07-08T17-27-12/` | GO | 50/50 | LINKED |
| F5-3 rollup live recheck | `docs/evidence/f5-pilot-readiness/2026-07-08T22-19-50/` | GO | 50/50 | LIVE |
| F5-5 security/GDPR/audit | `docs/evidence/f5-pilot-readiness/2026-07-08T17-27-33-f5-5-security-gdpr-audit-hardening/` | PASS (residual gaps) | 18/18 | LINKED |
| F5-5 rollup live recheck | `docs/evidence/f5-pilot-readiness/2026-07-08T22-20-18-f5-5-security-gdpr-audit-hardening/` | PASS (residual gaps) | 18/18 | LIVE |
| S17 public verification | `docs/evidence/f5-pilot-readiness/2026-07-08T20-22-38-s17-public-verify-browser/` | GO | Browser confirmed | LINKED |
| Admin/Gov final acceptance | `docs/evidence/admin-governance-final-acceptance/2026-07-08T20-45-46-admin-gov-final-acceptance-1/` | GO | 15/15 screens | LINKED |
| Learner final acceptance 1R | `docs/evidence/learner-final-acceptance/2026-07-08T21-14-51-learner-final-acceptance-1r/` | GO | 11/11 screens | LINKED |

## Supporting evidence

| Topic | Evidence folder | Verdict |
|-------|-----------------|---------|
| Staff identity review mount | `docs/evidence/admin-governance-final-acceptance/2026-07-08T14-31-40-staff-identity-review-mount-1/` | STAFF_IDENTITY_REVIEW_MOUNT_1_GO |
| CA-H01 frontend F4 cutover | `docs/evidence/f5-pilot-readiness/2026-07-05T10-55-54-ca-h01-frontend-f4-cutover/` | CA_H01_GO_FRONTEND_F4_CUTOVER_CONFIRMED |
| F5-7 recheck after CA-H01 | `docs/evidence/f5-pilot-readiness/2026-07-05T10-55-34-f5-7-recheck-after-ca-h01/` | CA_H01_CLOSED; local GO / internal conditional / external NO-GO |
| F4 frontend API audit (rollup) | `docs/evidence/f4-8f-legacy-api-usage-audit/2026-07-08T20-19-29/` | GO |
| Staff MFA readiness | `docs/evidence/f5-pilot-readiness/2026-07-05T20-26-14-staff-mfa-2-pre-external-cutover/` | STAFF_MFA_2_PARTIAL_READY_PENDING_MANUAL_ENROLLMENT |
| DPO/Legal decision session | `docs/evidence/f5-pilot-readiness/2026-07-06T14-04-24-dpo-legal-2-decision-session/` | DPO_LEGAL_2_DECISIONS_PENDING_EXTERNAL_NO_GO |

## Key observations

- All **local functional acceptance gates** (F4-9, F5-3, learner, admin/gov, S17) are green on the same local stack (API `:4000`, frontend `:3001`, Keycloak `:18080`, PostgreSQL `:15432`).
- F5-5 passes all 18 automated checks but retains **documented residual privacy/security gaps** (retention documented-only, staff MFA not enforced, DPO review pending).
- External pilot blockers remain **legal/MFA/environment**, not local learner/admin/public workflow defects.
- Evidence uses **local/synthetic pilot tenant** (`00000000-0000-4000-8000-000000000001`) and test credentials only.
