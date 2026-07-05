# STAFF-MFA-2 Regression Results

| Command | Status | Exit | Duration |
|---------|--------|------|----------|
| ops:f5-3-data-readiness | PASS | 0 | 13s |
| ops:f5-5-security-gdpr-audit | PASS | 0 | 184s (re-run after orchestrator timeout in initial pass) |
| audit:f4-frontend-api | PASS | 0 | 4s |
| ops:f4-9-smoke-test | PASS | 0 | 3s |
| ops:s17-public-verify-browser | PASS | 0 | 501s |
| ops:f5-7-recheck-after-ca-h01 | SKIPPED | — | MFA cutover limited to dedicated test users; smoke users unchanged |

## Notes

- Initial orchestrator pass recorded F5-5 as FAIL at 360s (spawn timeout). Standalone re-run at `2026-07-05T20-41-34` completed with exit 0 in 184s.
- F5-5 re-run evidence: `docs/evidence/f5-pilot-readiness/2026-07-05T20-41-34-f5-5-security-gdpr-audit-hardening/`

Overall: **PASS**
