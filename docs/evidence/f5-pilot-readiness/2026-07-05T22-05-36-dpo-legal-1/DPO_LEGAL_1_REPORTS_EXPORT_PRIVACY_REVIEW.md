# DPO-LEGAL-1 Reports / Export Privacy Review

**CA-H01 status:** CLOSED (`docs/evidence/f5-pilot-readiness/2026-07-05T09-55-58-ca-h01-frontend-f4-cutover/`, F5-7 recheck confirms migrated canonical paths)

## Controls confirmed

| Control | Status | Evidence |
|---------|--------|----------|
| Canonical F4 staff paths | PASS | `docs/evidence/f5-pilot-readiness/2026-07-05T09-55-58-ca-h01-frontend-f4-cutover/`, `docs/evidence/f5-pilot-readiness/2026-07-05T10-55-34-f5-7-recheck-after-ca-h01/` |
| Export via POST `/v1/staff/reports/export` | PASS | CA-H01 export_post_flow_status |
| Reports read-only | PASS | reports_export_read_only_status |
| Learner denied export | PASS | learner_reports_denial_status |
| Wrong-tenant no default leak | PASS | wrong_tenant_export_denial_status |
| Audit redaction active | PASS | F5-5 audit export allowlist |
| Legacy GET export blocked (410) | PASS | F5-5 backend |

## Export fields by report key

Forbidden globally: `tenantId`, `userId`, `email`, `notes`, `appealReason`, `messageSummary`, `evidenceRefs`, `verificationHash`, contact hashes, `ip`, `userAgent`, etc. (`reports-export.rules.ts`).

| Report key | Allowed columns (summary) | Classification |
|------------|---------------------------|----------------|
| overview | category, metric, count | OPERATIONAL_NECESSARY |
| certification-pipeline | status, count, stage | OPERATIONAL_NECESSARY |
| certificates | certificateNumber, status, dates, schemeLabel | OPERATIONAL_NECESSARY — **DPO approve schemeLabel** |
| lifecycle | eventType, count | OPERATIONAL_NECESSARY |
| recertification | status, count, outcome | OPERATIONAL_NECESSARY |
| appeals | status, count, outcome, metric | OPERATIONAL_NECESSARY — no free-text reasons |
| complaints | status, count, outcome, metric | OPERATIONAL_NECESSARY |
| contact-requests | status, count, requestType, channel, priority | OPERATIONAL_NECESSARY — details require reason |
| audit | eventType, domain, actorReference, occurredAt, targetType, targetReference, outcome | **DPO_APPROVAL_REQUIRED** — 90d cap |
| governance, controls, workload, sla, tenant-health, domain-health | Aggregated metrics / refs | **DPO_APPROVAL_REQUIRED** for external |

## Residual gaps (DPO awareness)

- F5-5 noted legacy admin GET paths in frontend inventory pre-CA-H01; **CA-H01 closed** for AdminReportsPage canonical export.
- Sensitive exports require `reason`; DPO should confirm reason logging retention.

**No legal approval claimed.**
