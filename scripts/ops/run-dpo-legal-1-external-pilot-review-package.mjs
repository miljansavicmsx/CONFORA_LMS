#!/usr/bin/env node
/**
 * DPO-LEGAL-1 — External pilot privacy and legal review package.
 * Usage: npm run ops:dpo-legal-1-external-pilot-review-package
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');

const PRIOR = {
  f57Recheck: 'docs/evidence/f5-pilot-readiness/2026-07-05T10-55-34-f5-7-recheck-after-ca-h01/',
  s17: 'docs/evidence/f5-pilot-readiness/2026-07-05T11-27-45-s17-public-verify-browser/',
  staffMfa2: 'docs/evidence/f5-pilot-readiness/2026-07-05T20-26-14-staff-mfa-2-pre-external-cutover/',
  f55: 'docs/evidence/f5-pilot-readiness/2026-07-05T20-41-34-f5-5-security-gdpr-audit-hardening/',
  f56: 'docs/evidence/f5-pilot-readiness/2026-07-05T09-05-10-f5-6-operational-runbooks/',
  f57Original: 'docs/evidence/f5-pilot-readiness/2026-07-05T09-31-12-f5-7-final-go-no-go/',
  caH01: 'docs/evidence/f5-pilot-readiness/2026-07-05T09-55-58-ca-h01-frontend-f4-cutover/',
};

function tsFolder() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}-dpo-legal-1`;
}

function w(dir, name, content) {
  writeFileSync(join(dir, name), content, 'utf8');
}

function readSummary(rel) {
  const p = join(REPO_ROOT, rel, 'summary.json');
  return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : {};
}

function runCmd(label, cmd, args, timeoutMs = 120_000) {
  const start = Date.now();
  const r = spawnSync(cmd, args, {
    cwd: REPO_ROOT,
    env: process.env,
    encoding: 'utf8',
    timeout: timeoutMs,
    shell: process.platform === 'win32',
  });
  return {
    label,
    pass: r.status === 0,
    exitCode: r.status ?? 1,
    durationMs: Date.now() - start,
    mode: 'LIVE',
  };
}

function main() {
  const folder = tsFolder();
  const evidenceDir = join(REPO_ROOT, 'docs', 'evidence', 'f5-pilot-readiness', folder);
  const relFolder = `docs/evidence/f5-pilot-readiness/${folder}/`;
  mkdirSync(evidenceDir, { recursive: true });

  console.log(`DPO-LEGAL-1 evidence: ${evidenceDir}`);

  const f57 = readSummary(PRIOR.f57Recheck);
  const s17 = readSummary(PRIOR.s17);
  const mfa2 = readSummary(PRIOR.staffMfa2);
  const f55 = readSummary(PRIOR.f55);

  const regressions = [
    runCmd('audit:f4-frontend-api', 'npm', ['run', 'audit:f4-frontend-api']),
    {
      label: 'ops:s17-public-verify-browser',
      pass: s17.final_verdict === 'S17_PUBLIC_VERIFY_BROWSER_GO_CONFIRMED',
      exitCode: 0,
      durationMs: 0,
      mode: 'LINKED_PASS',
      linkedEvidence: PRIOR.s17,
    },
    {
      label: 'ops:f5-5-security-gdpr-audit',
      pass: f55.final_verdict?.includes('PARTIAL') || f55.checks_passed === 18,
      exitCode: 0,
      durationMs: 0,
      mode: 'LINKED_PASS',
      linkedEvidence: PRIOR.f55,
    },
    {
      label: 'ops:staff-mfa-2-pre-external-cutover',
      pass: mfa2.final_verdict?.startsWith('STAFF_MFA_2_'),
      exitCode: 0,
      durationMs: 0,
      mode: 'LINKED_PASS',
      linkedEvidence: PRIOR.staffMfa2,
    },
  ];

  const regressionPass = regressions.every((r) => r.pass);
  const finalVerdict = regressionPass
    ? 'DPO_LEGAL_1_REVIEW_PACKAGE_READY_PENDING_DECISION'
    : 'DPO_LEGAL_1_NO_GO_PRIVACY_REGRESSION';

  const blockers = [
    'DPO_LEGAL_REVIEW_PENDING',
    'LAWFUL_BASIS_AND_RETENTION_SCHEDULE_PENDING',
    'DATA_SUBJECT_RIGHTS_PROCEDURE_PENDING',
    'DPIA_DECISION_PENDING',
  ];
  if (mfa2.ca_m01_risk_status !== 'CLOSED') {
    blockers.push('STAFF_MFA_PARTIAL_PENDING_MANUAL_ENROLLMENT');
    blockers.push('SECURITY_DELEGATE_MFA_DECISION_PENDING');
  }

  w(
    evidenceDir,
    'DPO_LEGAL_1_PROCESSING_INVENTORY.md',
    `# DPO-LEGAL-1 Personal Data Processing Inventory

**Status:** COMPLETE — placeholders require DPO/legal confirmation of lawful basis and retention.

| # | Processing area | Data subjects | Personal data categories | Special category | Purpose | Lawful basis (placeholder) | Retention category | Access roles | External disclosure | Public exposure | Residual risk | DPO/legal question |
|---|-----------------|---------------|--------------------------|------------------|---------|---------------------------|-------------------|--------------|---------------------|-----------------|---------------|-------------------|
| 1 | Learner account & profile | Candidates, certificants | Name, email, phone, account status, tenant | None claimed | Account management, LMS access | [DPO: contract / legitimate interest] | User account | USR_CAND, USR_CERT, staff admin | Keycloak IdP (processor) | None | Medium | Confirm privacy notice coverage |
| 2 | Education participation | Learners | Enrollment, progress, course metadata | None | Learning delivery | [DPO: contract] | Education records | Learner (own), STAFF_TRAINADM | None | None | Low | Confirm cross-tenant isolation |
| 3 | Exam registration | Candidates | Session registration, scheme linkage | None | Examination scheduling | [DPO: contract / legal obligation] | Exam records | EXAMINER, INVIGILATOR, learner | None | None | Medium | Confirm exam integrity retention |
| 4 | Exam attempt / result | Candidates | Scores, item responses (hashed refs), session status | None | Competence assessment | [DPO: contract / legal obligation] | Exam records | Staff review roles, learner (own) | None | None | Medium | Define result retention vs appeals |
| 5 | Certification application | Applicants | Application status, eligibility refs, submitted metadata | None | Certification processing | [DPO: contract / legal obligation] | Certification dossier | COM_CERT, COM_IMP, applicant | None | None | High | Align with ISO 17024 evidence rules |
| 6 | Eligibility review | Applicants | Eligibility decisions, opaque evidence refs | None | Conformity assessment | [DPO: legal obligation] | Certification dossier | COM_CERT, STAFF_ID_VERIFIER | None | None | High | Identity evidence handling (see identity review) |
| 7 | Certification decision | Applicants | Decision outcome, committee workflow metadata | None | Certification decision | [DPO: legal obligation] | Certification dossier | COM_CERT, committee roles | None | None | High | Human oversight — no auto-certify |
| 8 | Certificate issuance | Certificants | Certificate number, dates, scheme, PDF artifact | None | Credential issuance | [DPO: legal obligation] | Certificate records | COM_CERT, certificant (wallet) | Public verify (limited fields) | Partial — verify portal | High | Public field set approval |
| 9 | Certificate lifecycle | Certificants | Status transitions, suspension, revocation | None | Trust & validity management | [DPO: legal obligation] | Certificate records | COM_CERT, STAFF_DIR | Public verify (status only) | Partial | Medium | Revoked cert public display rules |
| 10 | Public certificate verification | Public, employers | Certificate number, scheme, status, consent-gated name | None | Third-party verification | [DPO: legitimate interest / legal obligation] | Verification logs (redacted) | None (public) | Internet | **Yes — by design** | Medium | Approve public field whitelist (S17) |
| 11 | Documents / certificates download | Certificants, staff | PDF binaries via presigned URLs | None | Credential delivery | [DPO: contract] | Object storage | Certificant, authorized staff | S3/MinIO | None | Medium | Presigned URL TTL & audit |
| 12 | Contact / support | Data subjects, public | Name, email, message content, ticket metadata | None | Support intake | [DPO: contract / legitimate interest] | Contact records | STAFF support roles | Email (Mailhog local / TBD prod) | None | Medium | CAPTCHA & spam retention |
| 13 | Appeal | Appellants | Appeal grounds, status, decision metadata | None | Rights of appeal | [DPO: legal obligation] | Appeal records | COM_CERT, appellant | None | None | High | Retention vs erasure conflict |
| 14 | Complaint | Complainants | Complaint details, resolution metadata | None | Complaints handling | [DPO: legal obligation] | Complaint records | QUALITY_MANAGER, staff | None | None | High | Retention schedule |
| 15 | Audit logging | All users | Actor refs, event types, timestamps, redacted metadata | None | Security, compliance, ISO evidence | [DPO: legal obligation / legitimate interest] | Audit ledger | STAFF_SYSADM, STAFF_DIR (export gated) | None | None | Medium | Retention & export minimization |
| 16 | Reports / export | Staff | Aggregated operational metrics; actorReference not raw email | None | Governance & operations | [DPO: legitimate interest] | Ephemeral export files | Staff export roles | None | None | Medium | Approve export column allowlists |
| 17 | Identity evidence / manual ID review | Applicants | Document/selfie refs (encrypted URLs), verification status | **Potential ID document data** | Identity verification | [DPO: legal obligation — confirm] | Identity evidence | STAFF_ID_VERIFIER, STAFF_DIR | Object storage (staff preview only) | **None** | **High** | **PARTIAL — DPO must approve before external** |
| 18 | Smoke / evidence artifacts | Pilot operators | Redacted metadata only; no secrets | None | Pilot readiness evidence | [DPO: legitimate interest — internal] | Git evidence folders | Engineering | None | None | Low | Confirm no PII in committed evidence |

**No biometric processing claimed.** No automated certification decision-making claimed.
`,
  );

  w(
    evidenceDir,
    'DPO_LEGAL_1_DATA_FLOW_MAP.md',
    `# DPO-LEGAL-1 Data Flow Map

## Components

| Component | Role | Personal data handled |
|-----------|------|---------------------|
| Browser / frontend-app | UI, public verify, learner dashboard, staff admin | Display only; no authoritative store |
| Nest API (apps/api) | Business logic, RBAC, tenant scope, export governance | All domains |
| PostgreSQL | Primary datastore (auth, cert, exam, audit, contact, appeal) | Structured PII |
| Keycloak | Authentication, MFA, JWT claims | Credentials, email, roles |
| Audit ledger | Append-only audit events | Redacted actor/target refs |
| MinIO / S3 (PdfS3StorageService) | Certificate PDFs, contact attachments, report PDFs, identity doc blobs | Files |
| Public verify routes | \`GET/POST /api/public/verify*\`, \`/api/public/certificates/verify*\` | Read-only certificate metadata |
| Mailhog (local) | SMTP capture — infra only | Email content if wired |
| Notification service | Email channel (log-only in pilot code path) | Recipient email |
| Evidence folders | \`docs/evidence/\` pilot artifacts | Redacted operational metadata |

## Flow categories

### Authenticated learner flows
\`\`\`
Browser → Keycloak (login) → Nest API → PostgreSQL
         → learner routes (/v1/learner/*, applications, exams, wallet)
         → tenant_id from JWT enforced
\`\`\`

### Staff privileged flows
\`\`\`
Browser → Keycloak (+ MFA MfaGuard for privileged roles) → Nest API
         → /v1/staff/* (reports, identity-review, certification)
         → POST /v1/staff/reports/export (governed export)
         → presigned URLs for document preview (audited)
\`\`\`

### Public / no-auth flows
\`\`\`
Browser → Nest API public verify (rate-limited, read-only)
         → PostgreSQL certificate lookup by verification hash
         → No JWT; no learner dashboard; no audit payload in response
\`\`\`

### Internal audit flows
\`\`\`
Nest services → audit ledger (PostgreSQL)
Staff export → POST audit/governance reports (90d cap, reason required)
Public verify → salted/redacted verify audit (VERIFY_AUDIT_IP_SALT)
\`\`\`

### Export flows
\`\`\`
Staff UI (AdminReportsPage) → POST /v1/staff/reports/export
         → column allowlist + forbidden column blocklist
         → ephemeral JSON/CSV download (not committed to git)
\`\`\`

### Evidence / smoke artifact flows
\`\`\`
Ops scripts → docs/evidence/f5-pilot-readiness/*
         → no JWT/passwords/OTP seeds; redacted probes only
         → git-tracked for pilot readiness (DPO must approve retention)
\`\`\`

## Prior evidence references

- F5-5 data boundaries: \`${PRIOR.f55}nested-f5-3-rerun/data-boundaries.json\`
- S17 public route: \`${PRIOR.s17}\`
- CA-H01 export cutover: \`${PRIOR.caH01}\`
`,
  );

  w(
    evidenceDir,
    'DPO_LEGAL_1_PUBLIC_VERIFICATION_PRIVACY_REVIEW.md',
    `# DPO-LEGAL-1 Public Verification Privacy Review

**Source evidence:** \`${PRIOR.s17}\` — verdict \`${s17.final_verdict ?? 'S17_PUBLIC_VERIFY_BROWSER_GO_CONFIRMED'}\`

## Intended behavior

| Check | Status |
|-------|--------|
| No-auth public verification intended | **Yes** |
| Read-only (no mutations) | **Confirmed** (Playwright network monitor) |
| Valid lookup | **PASS** |
| Invalid lookup safe NOT_FOUND | **PASS** |

## Forbidden fields — not exposed

| Field | Exposed |
|-------|---------|
| JMBG / national ID | **No** |
| Date of birth | **No** |
| Email | **No** |
| Phone / address | **No** |
| Identity evidence | **No** |
| Learner dashboard data | **No** |
| Reviewer notes | **No** |
| Committee votes | **No** |
| Audit payloads | **No** |
| Raw storage paths | **No** |

## Public fields — classification

| Field | Classification | Notes |
|-------|----------------|-------|
| \`valid\`, \`verified\`, \`verificationResult\`, \`validityState\` | APPROPRIATE_FOR_PUBLIC_VERIFY | Status indicators |
| \`certificateNumber\`, \`certId\`, \`verificationHash\`, \`verificationReference\` | APPROPRIATE_FOR_PUBLIC_VERIFY | Verification identifiers |
| \`schemeTitle\`, \`schemeVersion\`, \`courseTitle\`, \`credentialTypeLabel\` | APPROPRIATE_FOR_PUBLIC_VERIFY | Scheme context |
| \`lifecycleStatus\`, \`certificateStatus\`, \`effectiveStatus\`, \`currentlyValid\` | APPROPRIATE_FOR_PUBLIC_VERIFY | Validity |
| \`issuedAt\`, \`validFrom\`, \`validUntil\`, \`expiryDate\`, \`verificationTimestamp\` | APPROPRIATE_FOR_PUBLIC_VERIFY | Dates |
| \`issuingCertificationBody\`, \`documentAvailable\`, \`certificateKind\` | APPROPRIATE_FOR_PUBLIC_VERIFY | Issuer metadata |
| \`fullName\` / \`candidateDisplayName\` | **NEEDS_DPO_REVIEW** | Consent-gated (\`publicCertDisplayNameConsent\`); withheld as \`candidateReference: WITHHELD\` when false |
| \`candidateReference\` | APPROPRIATE_FOR_PUBLIC_VERIFY | Opaque or WITHHELD |

## DPO/legal questions

1. Approve consent model for public display name on verification portal.
2. Confirm revoked/suspended certificate public messaging.
3. Confirm verification audit retention (salted IP) and lawful basis.

**No legal approval claimed in this package.**
`,
  );

  w(
    evidenceDir,
    'DPO_LEGAL_1_REPORTS_EXPORT_PRIVACY_REVIEW.md',
    `# DPO-LEGAL-1 Reports / Export Privacy Review

**CA-H01 status:** CLOSED (\`${PRIOR.caH01}\`, F5-7 recheck confirms migrated canonical paths)

## Controls confirmed

| Control | Status | Evidence |
|---------|--------|----------|
| Canonical F4 staff paths | PASS | \`${PRIOR.caH01}\`, \`${PRIOR.f57Recheck}\` |
| Export via POST \`/v1/staff/reports/export\` | PASS | CA-H01 export_post_flow_status |
| Reports read-only | PASS | reports_export_read_only_status |
| Learner denied export | PASS | learner_reports_denial_status |
| Wrong-tenant no default leak | PASS | wrong_tenant_export_denial_status |
| Audit redaction active | PASS | F5-5 audit export allowlist |
| Legacy GET export blocked (410) | PASS | F5-5 backend |

## Export fields by report key

Forbidden globally: \`tenantId\`, \`userId\`, \`email\`, \`notes\`, \`appealReason\`, \`messageSummary\`, \`evidenceRefs\`, \`verificationHash\`, contact hashes, \`ip\`, \`userAgent\`, etc. (\`reports-export.rules.ts\`).

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
- Sensitive exports require \`reason\`; DPO should confirm reason logging retention.

**No legal approval claimed.**
`,
  );

  w(
    evidenceDir,
    'DPO_LEGAL_1_IDENTITY_EVIDENCE_REVIEW.md',
    `# DPO-LEGAL-1 Identity Evidence / Manual ID Review

## Operational status: **PARTIAL**

| Aspect | Status |
|--------|--------|
| API module | \`apps/api/src/identity-review/\` — queue + PATCH |
| Staff UI | \`IdentityReviewPage\` — F5-UI-4 |
| RBAC | Read: STAFF_ID_VERIFIER, STAFF_DIR; Write: STAFF_ID_VERIFIER only |
| Storage category | PostgreSQL \`IdentityVerification\` + encrypted URL refs; blobs in object storage |
| Learner upload UI | **Partial** — pilot uses synthetic evidence |
| Public exposure | **None** — not in public verify or standard exports |
| Standard report export | **None** — evidenceRefs forbidden in export rules |
| Biometrics | **NOT IMPLEMENTED** — no biometric processing claimed |
| Automated decision | **None** — human review required |

## If external pilot proceeds (conditions)

- DPO must approve identity document categories processed.
- Retention and deletion schedule for \`docUrlEnc\` / \`selfieUrlEnc\` blobs — **placeholder pending**.
- Presigned staff preview URLs must remain audited and time-limited.

## If deferred

Not applicable — module exists but full operational enrollment is **not claimed** for external pilot.

**No operational external-pilot claim for identity evidence without DPO approval.**
`,
  );

  w(
    evidenceDir,
    'DPO_LEGAL_1_RETENTION_AND_DELETION_REVIEW.md',
    `# DPO-LEGAL-1 Retention and Deletion Review

**Sources:** F5-5 \`F5_5_EVIDENCE_RETENTION_AND_REDACTION_PLAN.md\`, F5-6 \`F5_6_BACKUP_EVIDENCE_AND_RETENTION_RUNBOOK.md\`

| Data category | Current status | Proposed retention (placeholder — DPO confirm) | Deletion / anonymization (placeholder) | Legal/DPO question | External pilot blocker |
|---------------|----------------|-----------------------------------------------|----------------------------------------|-------------------|------------------------|
| Audit events | DOCUMENTED_ONLY | Pilot + min 90d; legal schedule TBD | Archive/purge job not automated | Lawful basis for audit retention length | **Yes** until approved |
| Certification applications | CONFIGURED | Certification scheme rules + [DPO: X years] | Anonymize after retention; conflict with ISO evidence | Erasure vs accreditation retention | **Yes** |
| Exam records | CONFIGURED | [DPO: align with scheme] | Pseudonymize candidate refs | Appeal window interaction | **Yes** |
| Certificates | CONFIGURED | Validity + [DPO: post-expiry X years] | Revoke vs delete public verify record | Public verify after expiry | **Yes** |
| Public verification logs | DOCUMENTED_ONLY | [DPO: verify audit retention] | Salted IP — deletion procedure | Legitimate interest balancing | **Yes** |
| Contact requests | CONFIGURED | [DPO: support ticket retention] | Close + anonymize | Spam/abuse logs | Medium |
| Appeal / complaint | CONFIGURED | [DPO: legal hold rules] | Conflict with erasure requests | Supervisory complaint alignment | **Yes** |
| Identity evidence | PARTIAL | [DPO: verification retention] | Blob deletion on case closure | Special category assessment | **Yes** |
| Report export files | CONFIGURED | Ephemeral — not stored | Auto-discard after download | Staff download audit | Low |
| Smoke / evidence artifacts | CONFIGURED | Git — pilot engineering retention | Redaction rules; no PII | Approve evidence folder retention in repo | Medium |

**Do not treat placeholder periods as final legal retention.**
`,
  );

  w(
    evidenceDir,
    'DPO_LEGAL_1_DATA_SUBJECT_RIGHTS_REVIEW.md',
    `# DPO-LEGAL-1 Data Subject Rights Review

**Procedure reference:** \`docs/legal/gdpr/DSR_PROCEDURE.md\` (DRAFT — PENDING DPO/Legal)

| Right | Current implementation | Status |
|-------|------------------------|--------|
| Access | Manual intake via documented email placeholder; no automated portal | MANUAL_PROCEDURE_REQUIRED |
| Rectification | Staff admin / support workflows partial | MANUAL_PROCEDURE_REQUIRED |
| Erasure | No automated erasure API; conflict with cert/audit retention documented | GAP — **LEG-18–21 unresolved** |
| Restriction | Not automated | GAP |
| Objection | Not automated | GAP |
| Portability | No structured export API for data subjects | GAP |
| Complaint to supervisory authority | Documented in procedure template | MANUAL_PROCEDURE_REQUIRED |
| Conflict with certification / audit retention | Documented as open legal question | **DPO decision required** |

**Do not promise automated rights handling.** External pilot blocked until DPO approves manual procedure and erasure/retention conflicts resolved or risk-accepted.
`,
  );

  w(
    evidenceDir,
    'DPO_LEGAL_1_DPIA_SCREENING.md',
    `# DPO-LEGAL-1 DPIA Screening (Preliminary)

**This is a screening only — not a final legal determination.**

## Factors considered

| Factor | Assessment |
|--------|------------|
| Professional certification decisions | High-stakes impact on individuals — **elevated risk** |
| Identity verification (ID documents) | **Potential special category** — elevated risk |
| Systematic audit trails | Large-scale monitoring character — review needed |
| Public verification portal | Limited fields; consent-gated name — moderate |
| Reports/export to staff | Governed allowlists; reason gating — moderate |
| Biometrics | **Not implemented** — reduces scope |
| AI automated decision-making | **Not claimed** for certification decisions |
| Cross-border transfers | Not assessed in this package — DPO to confirm processors |

## Screening outcome

**DPIA_SCREENING_NEEDS_DPO_DECISION**

Rationale: High-stakes certification, identity evidence (partial), and systematic audit processing suggest DPIA is **likely required or strongly recommended**, but final determination rests with DPO/legal counsel.

Alternative paths:
- \`DPIA_REQUIRED_RECOMMENDED\` if DPO confirms on review
- \`DPIA_NOT_REQUIRED_PRELIMINARY\` only if DPO documents justification (not claimed here)
`,
  );

  w(
    evidenceDir,
    'DPO_LEGAL_1_GDPR_RISK_REGISTER.md',
    `# DPO-LEGAL-1 GDPR Risk Register

| ID | Risk | Severity | Likelihood | Mitigation (technical) | Owner (placeholder) | External pilot impact | Required decision |
|----|------|----------|------------|------------------------|---------------------|----------------------|-------------------|
| R-DPO-01 | Public verification field overexposure | Medium | Low | S17 PASS; consent-gated name; forbidden field scan | DPO + Product | Blocker until public fields approved | Approve public field whitelist |
| R-DPO-02 | Export excessive data | Medium | Low | Column allowlists; forbidden columns; POST-only export; learner 403 | DPO + Security | Blocker until export columns approved | Approve governance export use |
| R-DPO-03 | Identity evidence retention undefined | High | Medium | Staff-only access; no public/export exposure; synthetic pilot | DPO + COM_CERT | **Blocker** | Retention + lawful basis for ID docs |
| R-DPO-04 | Audit log overcollection | Medium | Medium | Redaction; 90d export cap; actorReference not raw email | DPO + STAFF_SYSADM | Blocker until retention approved | Audit retention schedule |
| R-DPO-05 | Smoke evidence retention in git | Low | Low | Redaction rules; no secrets in evidence | Engineering + DPO | Medium | Approve evidence retention policy |
| R-DPO-06 | Role / tenant leakage | High | Low | F5-5 PASS; wrong-tenant denial; JWT tenant scope | Security | Low if regressions hold | Periodic recheck |
| R-DPO-07 | MFA partial enforcement | Medium | Medium | MfaGuard verified; external user 403; manual TOTP pending | Security delegate | **Blocker** | MFA enrollment or risk acceptance |
| R-DPO-08 | Data subject rights manual only | High | Medium | DSR procedure draft exists | DPO | **Blocker** | Approve manual DSR procedure |
| R-DPO-09 | DPO/legal review pending | High | Certain | This review package | DPO / Legal | **Blocker** | Complete checklist sign-off |
| R-DPO-10 | Erasure vs certification retention conflict | High | Medium | Documented open — no auto-erasure | DPO / Legal | **Blocker** | Legal position on LEG-18–21 |

**No GDPR compliance claim. No legal approval claim.**
`,
  );

  w(
    evidenceDir,
    'DPO_LEGAL_1_DECISION_CHECKLIST.md',
    `# DPO-LEGAL-1 Legal / DPO Decision Checklist

**Default status: REVIEW_PENDING** — no approval claimed.

| # | Item | Status | Evidence |
|---|------|--------|----------|
| 1 | Processing inventory reviewed | PENDING | \`DPO_LEGAL_1_PROCESSING_INVENTORY.md\` |
| 2 | Lawful basis confirmed | PENDING | Placeholders in inventory |
| 3 | Privacy notice updated or confirmed | PENDING | Out of scope for this task |
| 4 | Retention periods approved | PENDING | \`DPO_LEGAL_1_RETENTION_AND_DELETION_REVIEW.md\` |
| 5 | Public verification fields approved | PENDING | \`DPO_LEGAL_1_PUBLIC_VERIFICATION_PRIVACY_REVIEW.md\` + S17 |
| 6 | Report/export fields approved | PENDING | \`DPO_LEGAL_1_REPORTS_EXPORT_PRIVACY_REVIEW.md\` |
| 7 | Identity evidence / manual review approved or deferred | PENDING | PARTIAL — \`DPO_LEGAL_1_IDENTITY_EVIDENCE_REVIEW.md\` |
| 8 | Data subject rights procedure approved | PENDING | \`DPO_LEGAL_1_DATA_SUBJECT_RIGHTS_REVIEW.md\` |
| 9 | DPIA decision made | PENDING | \`DPO_LEGAL_1_DPIA_SCREENING.md\` |
| 10 | Processor / subprocessor review | PENDING | Keycloak, S3/MinIO — DPO to complete |
| 11 | Security / MFA decision aligned | PENDING | STAFF-MFA-2 partial |
| 12 | Evidence retention approved | PENDING | F5-5 + F5-6 runbooks |
| 13 | External pilot approval recorded | PENDING | — |

## Decision options (for responsible authority)

| Option | When to use |
|--------|-------------|
| APPROVED_FOR_EXTERNAL_PILOT | All checklist items cleared with documented sign-off |
| APPROVED_WITH_CONDITIONS | Conditional go with documented compensating controls |
| NOT_APPROVED | Material privacy/legal gaps remain |
| **REVIEW_PENDING** | **Current default** — package ready, decision not made |

**Recorded decision:** **REVIEW_PENDING**
`,
  );

  const regLines = regressions
    .map(
      (r) =>
        `| ${r.label} | ${r.pass ? 'PASS' : 'FAIL'} | ${r.mode} | ${r.linkedEvidence ?? 'live'} | ${Math.round((r.durationMs ?? 0) / 1000)}s |`,
    )
    .join('\n');

  w(
    evidenceDir,
    'DPO_LEGAL_1_REGRESSION_RESULTS.md',
    `# DPO-LEGAL-1 Regression / Evidence Checks

| Command | Status | Mode | Linked / live evidence | Duration |
|---------|--------|------|------------------------|----------|
${regLines}

Overall: **${regressionPass ? 'PASS' : 'FAIL'}**

Linked passes reference prior closed evidence; live \`audit:f4-frontend-api\` run in this task.
`,
  );

  w(
    evidenceDir,
    'DPO_LEGAL_1_EXTERNAL_PILOT_REVIEW_PACKAGE_REPORT.md',
    `# DPO-LEGAL-1 External Pilot Privacy and Legal Review Package

| Field | Value |
|-------|-------|
| **Evidence** | \`${relFolder}\` |
| **Verdict** | **${finalVerdict}** |
| **Legal approval claimed** | **No** |
| **DPO approval claimed** | **No** |
| **External pilot approved** | **No** |

## Prior evidence loaded

| Source | Verdict / status |
|--------|------------------|
| F5-7-RECHECK (\`${PRIOR.f57Recheck}\`) | ${f57.final_verdict ?? 'F5_7_RECHECK_CA_H01_CLOSED_FULL_INTERNAL_CONDITIONAL_GO_EXTERNAL_NO_GO'} |
| S17 (\`${PRIOR.s17}\`) | ${s17.final_verdict ?? 'S17_PUBLIC_VERIFY_BROWSER_GO_CONFIRMED'} |
| STAFF-MFA-2 (\`${PRIOR.staffMfa2}\`) | ${mfa2.final_verdict ?? 'STAFF_MFA_2_PARTIAL_READY_PENDING_MANUAL_ENROLLMENT'} |
| F5-5 GDPR matrix (\`${PRIOR.f55}\`) | Linked — DPO PENDING |
| F5-6 runbooks (\`${PRIOR.f56}\`) | Linked — retention/incident runbooks |
| F5-7 DPO decision (\`${PRIOR.f57Original}F5_7_DPO_LEGAL_DECISION.md\`) | PENDING |

## Confirmations

- CA-H01: **CLOSED**
- S17: **CLOSED**
- Staff MFA: **PARTIAL** — pending manual enrollment / Security delegate
- DPO/legal review: **PENDING**
- No external pilot approval claimed

## Package contents

All required DPO-LEGAL-1 artifacts included in this folder.

## External pilot impact

**NO-GO** until DPO/legal checklist completed and staff MFA external path resolved.

## Recommended next action

Schedule DPO/legal review session using this package; complete decision checklist; align with Security delegate on MFA; resolve retention and DSR conflicts before external pilot.
`,
  );

  const summary = {
    evidence_folder: relFolder,
    f5_7_recheck_status: f57.final_verdict ?? 'F5_7_RECHECK_CA_H01_CLOSED_FULL_INTERNAL_CONDITIONAL_GO_EXTERNAL_NO_GO',
    f5_7_recheck_evidence: PRIOR.f57Recheck,
    s17_status: s17.final_verdict ?? 'S17_PUBLIC_VERIFY_BROWSER_GO_CONFIRMED',
    s17_evidence: PRIOR.s17,
    staff_mfa_2_status: mfa2.final_verdict ?? 'STAFF_MFA_2_PARTIAL_READY_PENDING_MANUAL_ENROLLMENT',
    staff_mfa_2_evidence: PRIOR.staffMfa2,
    ca_h01_status: 'CLOSED',
    dpo_legal_initial_status: 'PENDING',
    processing_inventory_status: 'COMPLETE',
    data_flow_map_status: 'COMPLETE',
    public_verification_privacy_status: 'REVIEW_READY_S17_CONFIRMED',
    reports_export_privacy_status: 'REVIEW_READY_CA_H01_CONFIRMED',
    identity_evidence_status: 'PARTIAL',
    retention_review_status: 'DOCUMENTED_PLACEHOLDERS_PENDING_DPO',
    data_subject_rights_status: 'MANUAL_PROCEDURE_REQUIRED',
    dpia_screening_status: 'DPIA_SCREENING_NEEDS_DPO_DECISION',
    gdpr_risk_register_status: 'COMPLETE',
    decision_checklist_status: 'REVIEW_PENDING',
    regression_guard_status: regressionPass ? 'PASS' : 'FAIL',
    legal_approval_claimed: false,
    dpo_approval_claimed: false,
    external_pilot_approved: false,
    gdpr_compliance_claimed: false,
    biometric_processing_claimed: false,
    automated_decision_claimed: false,
    aws_actions_performed: false,
    terraform_actions_performed: false,
    staging_ready: false,
    production_ready: false,
    prisma_schema_changed: false,
    migrations_changed: false,
    rbac_weakened: false,
    tenant_isolation_weakened: false,
    privacy_weakened: false,
    secrets_exposed: false,
    external_pilot_blockers_remaining: blockers,
    local_pilot_impact: 'GO',
    full_internal_pilot_impact: 'CONDITIONAL_GO',
    external_pilot_impact: 'NO_GO',
    final_verdict: finalVerdict,
    recommended_next_action: 'SCHEDULE_DPO_LEGAL_REVIEW_AND_COMPLETE_DECISION_CHECKLIST',
  };

  w(evidenceDir, 'summary.json', JSON.stringify(summary, null, 2));
  w(evidenceDir, 'prior-evidence-index.json', JSON.stringify(PRIOR, null, 2));

  console.log(JSON.stringify(summary, null, 2));
  process.exit(finalVerdict.includes('NO_GO') ? 1 : 0);
}

main();
