# DPO-LEGAL-1 Data Flow Map

## Components

| Component | Role | Personal data handled |
|-----------|------|---------------------|
| Browser / frontend-app | UI, public verify, learner dashboard, staff admin | Display only; no authoritative store |
| Nest API (apps/api) | Business logic, RBAC, tenant scope, export governance | All domains |
| PostgreSQL | Primary datastore (auth, cert, exam, audit, contact, appeal) | Structured PII |
| Keycloak | Authentication, MFA, JWT claims | Credentials, email, roles |
| Audit ledger | Append-only audit events | Redacted actor/target refs |
| MinIO / S3 (PdfS3StorageService) | Certificate PDFs, contact attachments, report PDFs, identity doc blobs | Files |
| Public verify routes | `GET/POST /api/public/verify*`, `/api/public/certificates/verify*` | Read-only certificate metadata |
| Mailhog (local) | SMTP capture — infra only | Email content if wired |
| Notification service | Email channel (log-only in pilot code path) | Recipient email |
| Evidence folders | `docs/evidence/` pilot artifacts | Redacted operational metadata |

## Flow categories

### Authenticated learner flows
```
Browser → Keycloak (login) → Nest API → PostgreSQL
         → learner routes (/v1/learner/*, applications, exams, wallet)
         → tenant_id from JWT enforced
```

### Staff privileged flows
```
Browser → Keycloak (+ MFA MfaGuard for privileged roles) → Nest API
         → /v1/staff/* (reports, identity-review, certification)
         → POST /v1/staff/reports/export (governed export)
         → presigned URLs for document preview (audited)
```

### Public / no-auth flows
```
Browser → Nest API public verify (rate-limited, read-only)
         → PostgreSQL certificate lookup by verification hash
         → No JWT; no learner dashboard; no audit payload in response
```

### Internal audit flows
```
Nest services → audit ledger (PostgreSQL)
Staff export → POST audit/governance reports (90d cap, reason required)
Public verify → salted/redacted verify audit (VERIFY_AUDIT_IP_SALT)
```

### Export flows
```
Staff UI (AdminReportsPage) → POST /v1/staff/reports/export
         → column allowlist + forbidden column blocklist
         → ephemeral JSON/CSV download (not committed to git)
```

### Evidence / smoke artifact flows
```
Ops scripts → docs/evidence/f5-pilot-readiness/*
         → no JWT/passwords/OTP seeds; redacted probes only
         → git-tracked for pilot readiness (DPO must approve retention)
```

## Prior evidence references

- F5-5 data boundaries: `docs/evidence/f5-pilot-readiness/2026-07-05T20-41-34-f5-5-security-gdpr-audit-hardening/nested-f5-3-rerun/data-boundaries.json`
- S17 public route: `docs/evidence/f5-pilot-readiness/2026-07-05T11-27-45-s17-public-verify-browser/`
- CA-H01 export cutover: `docs/evidence/f5-pilot-readiness/2026-07-05T09-55-58-ca-h01-frontend-f4-cutover/`
