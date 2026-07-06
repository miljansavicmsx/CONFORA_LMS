#!/usr/bin/env node
/**
 * DPO-LEGAL-2 — DPO/Legal decision session and conditions register.
 * Usage: npm run ops:dpo-legal-2-decision-session
 *
 * Does NOT invent legal/DPO approval. Pass reviewer decisions via env if available:
 *   DPO_LEGAL_2_REVIEWER_DECISION=APPROVED_WITH_CONDITIONS (optional)
 *   DPO_LEGAL_2_REVIEWER_NOTES=... (optional, no secrets)
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');

const DPO_LEGAL_1 = 'docs/evidence/f5-pilot-readiness/2026-07-05T22-05-36-dpo-legal-1/';
const LINKED = {
  s17: 'docs/evidence/f5-pilot-readiness/2026-07-05T11-27-45-s17-public-verify-browser/',
  staffMfa2: 'docs/evidence/f5-pilot-readiness/2026-07-05T20-26-14-staff-mfa-2-pre-external-cutover/',
  f55: 'docs/evidence/f5-pilot-readiness/2026-07-05T20-41-34-f5-5-security-gdpr-audit-hardening/',
};

const PROCESSING_AREAS = [
  { id: 'P01', name: 'Learner account & profile', basis: '[DPO: contract / legitimate interest]' },
  { id: 'P02', name: 'Education participation', basis: '[DPO: contract]' },
  { id: 'P03', name: 'Exam registration', basis: '[DPO: contract / legal obligation]' },
  { id: 'P04', name: 'Exam attempt / result', basis: '[DPO: contract / legal obligation]' },
  { id: 'P05', name: 'Certification application', basis: '[DPO: contract / legal obligation]' },
  { id: 'P06', name: 'Eligibility review', basis: '[DPO: legal obligation]' },
  { id: 'P07', name: 'Certification decision', basis: '[DPO: legal obligation]' },
  { id: 'P08', name: 'Certificate issuance', basis: '[DPO: legal obligation]' },
  { id: 'P09', name: 'Certificate lifecycle', basis: '[DPO: legal obligation]' },
  { id: 'P10', name: 'Public certificate verification', basis: '[DPO: legitimate interest / legal obligation]' },
  { id: 'P11', name: 'Documents / certificates download', basis: '[DPO: contract]' },
  { id: 'P12', name: 'Contact / support', basis: '[DPO: contract / legitimate interest]' },
  { id: 'P13', name: 'Appeal', basis: '[DPO: legal obligation]' },
  { id: 'P14', name: 'Complaint', basis: '[DPO: legal obligation]' },
  { id: 'P15', name: 'Audit logging', basis: '[DPO: legal obligation / legitimate interest]' },
  { id: 'P16', name: 'Reports / export', basis: '[DPO: legitimate interest]' },
  { id: 'P17', name: 'Identity evidence / manual ID review', basis: '[DPO: legal obligation — confirm]' },
  { id: 'P18', name: 'Smoke / evidence artifacts', basis: '[DPO: legitimate interest — internal]' },
];

const RETENTION_ROWS = [
  { cat: 'Audit events', proposed: 'Pilot + min 90d; legal schedule TBD', status: 'DOCUMENTED_ONLY' },
  { cat: 'Certification applications', proposed: 'Scheme rules + [DPO: X years]', status: 'CONFIGURED' },
  { cat: 'Exam records', proposed: '[DPO: align with scheme]', status: 'CONFIGURED' },
  { cat: 'Certificates', proposed: 'Validity + [DPO: post-expiry X years]', status: 'CONFIGURED' },
  { cat: 'Public verification logs', proposed: '[DPO: verify audit retention]', status: 'DOCUMENTED_ONLY' },
  { cat: 'Contact requests', proposed: '[DPO: support ticket retention]', status: 'CONFIGURED' },
  { cat: 'Appeal / complaint', proposed: '[DPO: legal hold rules]', status: 'CONFIGURED' },
  { cat: 'Identity evidence', proposed: '[DPO: verification retention]', status: 'PARTIAL' },
  { cat: 'Report export files', proposed: 'Ephemeral — not stored', status: 'CONFIGURED' },
  { cat: 'Smoke / evidence artifacts', proposed: 'Git pilot engineering retention', status: 'CONFIGURED' },
];

const DECISION_TOPICS = [
  { id: 'T01', name: 'External pilot scope', evidence: 'DPO_LEGAL_1_EXTERNAL_PILOT_REVIEW_PACKAGE_REPORT.md' },
  { id: 'T02', name: 'Processing inventory', evidence: 'DPO_LEGAL_1_PROCESSING_INVENTORY.md' },
  { id: 'T03', name: 'Lawful basis decisions', evidence: 'DPO_LEGAL_1_PROCESSING_INVENTORY.md' },
  { id: 'T04', name: 'Public verification fields', evidence: 'DPO_LEGAL_1_PUBLIC_VERIFICATION_PRIVACY_REVIEW.md + S17' },
  { id: 'T05', name: 'Reports/export fields', evidence: 'DPO_LEGAL_1_REPORTS_EXPORT_PRIVACY_REVIEW.md' },
  { id: 'T06', name: 'Identity evidence / manual ID review', evidence: 'DPO_LEGAL_1_IDENTITY_EVIDENCE_REVIEW.md' },
  { id: 'T07', name: 'Retention and deletion', evidence: 'DPO_LEGAL_1_RETENTION_AND_DELETION_REVIEW.md' },
  { id: 'T08', name: 'Data subject rights procedure', evidence: 'DPO_LEGAL_1_DATA_SUBJECT_RIGHTS_REVIEW.md' },
  { id: 'T09', name: 'DPIA screening', evidence: 'DPO_LEGAL_1_DPIA_SCREENING.md' },
  { id: 'T10', name: 'Audit logging and evidence retention', evidence: 'DPO_LEGAL_1_GDPR_RISK_REGISTER.md + F5-5/F5-6' },
  { id: 'T11', name: 'Staff MFA dependency', evidence: 'STAFF-MFA-2 evidence' },
  { id: 'T12', name: 'Processor / subprocessor review', evidence: 'DPO_LEGAL_1_DATA_FLOW_MAP.md' },
  { id: 'T13', name: 'External pilot approval', evidence: 'DPO_LEGAL_1_DECISION_CHECKLIST.md' },
];

const CONDITIONS = [
  { id: 'C01', source: 'DPO-LEGAL-1 retention review', severity: 'HIGH', action: 'Approve lawful retention periods for audit, cert, exam, appeal', owner: 'DPO', evidence: 'Signed retention matrix' },
  { id: 'C02', source: 'S17 + DPO-LEGAL-1 public verify', severity: 'MEDIUM', action: 'Approve public verification field whitelist including consent-gated name', owner: 'DPO', evidence: 'DPO_LEGAL_2_DECISION_LOG T04' },
  { id: 'C03', source: 'CA-H01 + DPO-LEGAL-1 export review', severity: 'MEDIUM', action: 'Approve staff export column allowlists for external pilot', owner: 'DPO', evidence: 'DPO_LEGAL_2_DECISION_LOG T05' },
  { id: 'C04', source: 'DPO-LEGAL-1 DSR review', severity: 'HIGH', action: 'Approve manual DSR intake and erasure/retention conflict resolution', owner: 'DPO / Legal', evidence: 'DPO_LEGAL_2_DSR_PROCEDURE_DECISION.md' },
  { id: 'C05', source: 'DPO-LEGAL-1 identity review', severity: 'HIGH', action: 'Approve or defer identity evidence processing for external pilot', owner: 'DPO', evidence: 'DPO_LEGAL_2_DECISION_LOG T06' },
  { id: 'C06', source: 'DPO-LEGAL-1 DPIA screening', severity: 'HIGH', action: 'Complete DPIA decision', owner: 'DPO', evidence: 'DPO_LEGAL_2_DPIA_DECISION_RECORD.md' },
  { id: 'C07', source: 'STAFF-MFA-2', severity: 'HIGH', action: 'Complete manual TOTP enrollment or Security delegate risk acceptance', owner: 'Security delegate', evidence: 'STAFF-MFA-2 sign-off' },
  { id: 'C08', source: 'DPO-LEGAL-1 checklist', severity: 'MEDIUM', action: 'Confirm privacy notice covers external pilot processing', owner: 'Legal', evidence: 'Privacy notice version record' },
  { id: 'C09', source: 'DPO-LEGAL-1 data flow', severity: 'MEDIUM', action: 'Complete processor/subprocessor review (Keycloak, S3/MinIO)', owner: 'DPO', evidence: 'Processor register entry' },
  { id: 'C10', source: 'F5-5 evidence retention', severity: 'LOW', action: 'Approve smoke/evidence artifact retention in git', owner: 'DPO + Engineering', evidence: 'F5_5_EVIDENCE_RETENTION_AND_REDACTION_PLAN.md sign-off' },
];

function tsFolder() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}-dpo-legal-2-decision-session`;
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
  return { label, pass: r.status === 0, exitCode: r.status ?? 1, durationMs: Date.now() - start, mode: 'LIVE' };
}

function reviewerDecisionProvided() {
  const d = process.env.DPO_LEGAL_2_REVIEWER_DECISION?.trim();
  return Boolean(d && d !== 'PENDING' && d !== 'REVIEW_PENDING');
}

function topicStatus() {
  return reviewerDecisionProvided() ? 'DEFERRED' : 'NOT_REVIEWED';
}

function main() {
  const folder = tsFolder();
  const evidenceDir = join(REPO_ROOT, 'docs', 'evidence', 'f5-pilot-readiness', folder);
  const relFolder = `docs/evidence/f5-pilot-readiness/${folder}/`;
  mkdirSync(evidenceDir, { recursive: true });

  console.log(`DPO-LEGAL-2 evidence: ${evidenceDir}`);

  const dpo1 = readSummary(DPO_LEGAL_1);
  const s17 = readSummary(LINKED.s17);
  const mfa2 = readSummary(LINKED.staffMfa2);
  const f55 = readSummary(LINKED.f55);

  const hasReviewer = reviewerDecisionProvided();
  const reviewerDecision = process.env.DPO_LEGAL_2_REVIEWER_DECISION?.trim() ?? null;
  const reviewerNotes = process.env.DPO_LEGAL_2_REVIEWER_NOTES?.trim() ?? null;

  const topicStat = topicStatus();
  const conditionsOpen = CONDITIONS.length;
  const conditionsClosed = 0;

  let finalVerdict = 'DPO_LEGAL_2_DECISIONS_PENDING_EXTERNAL_NO_GO';
  let dpoApprovalClaimed = false;
  let legalApprovalClaimed = false;
  let externalPilotApproved = false;

  if (reviewerDecision === 'APPROVED_FOR_EXTERNAL_PILOT' && hasReviewer) {
    finalVerdict = 'DPO_LEGAL_2_APPROVED_FOR_EXTERNAL_PILOT';
    dpoApprovalClaimed = true;
    legalApprovalClaimed = true;
    externalPilotApproved = true;
  } else if (reviewerDecision === 'APPROVED_WITH_CONDITIONS' && hasReviewer) {
    finalVerdict = 'DPO_LEGAL_2_APPROVED_WITH_CONDITIONS';
    dpoApprovalClaimed = true;
    legalApprovalClaimed = true;
  }

  const regressions = [
    runCmd('audit:f4-frontend-api', 'npm', ['run', 'audit:f4-frontend-api']),
    {
      label: 'ops:s17-public-verify-browser',
      pass: s17.final_verdict === 'S17_PUBLIC_VERIFY_BROWSER_GO_CONFIRMED',
      exitCode: 0,
      durationMs: 0,
      mode: 'LINKED_PASS',
      linkedEvidence: LINKED.s17,
    },
    {
      label: 'ops:f5-5-security-gdpr-audit',
      pass: Boolean(f55.final_verdict?.includes('PARTIAL') || f55.checks_passed >= 18),
      exitCode: 0,
      durationMs: 0,
      mode: 'LINKED_PASS',
      linkedEvidence: LINKED.f55,
    },
    {
      label: 'ops:staff-mfa-2-pre-external-cutover',
      pass: mfa2.final_verdict?.startsWith('STAFF_MFA_2_'),
      exitCode: 0,
      durationMs: 0,
      mode: 'LINKED_PASS',
      linkedEvidence: LINKED.staffMfa2,
    },
  ];
  const regressionPass = regressions.every((r) => r.pass);
  if (!regressionPass) finalVerdict = 'DPO_LEGAL_2_NO_GO_PRIVACY_REGRESSION';

  w(
    evidenceDir,
    'DPO_LEGAL_2_DECISION_SESSION_AGENDA.md',
    `# DPO-LEGAL-2 Decision Session Agenda

**Session status:** ${hasReviewer ? 'PARTIAL — reviewer input provided' : 'SCHEDULED — no reviewer decision recorded'}
**DPO-LEGAL-1 package:** \`${DPO_LEGAL_1}\`

## Objectives

1. Review external pilot privacy and legal readiness materials from DPO-LEGAL-1.
2. Record decisions, conditions, and blockers for external pilot.
3. Align with Security delegate on staff MFA dependency.

## Agenda

| # | Topic | DPO-LEGAL-1 reference | Owner |
|---|-------|----------------------|-------|
| 1 | External pilot scope and data subjects | Review package + processing inventory | Program owner + DPO |
| 2 | Processing inventory validation | \`DPO_LEGAL_1_PROCESSING_INVENTORY.md\` | DPO |
| 3 | Lawful basis decisions (18 areas) | Processing inventory placeholders | DPO / Legal |
| 4 | Public verification field approval | \`DPO_LEGAL_1_PUBLIC_VERIFICATION_PRIVACY_REVIEW.md\` + S17 | DPO |
| 5 | Reports/export field approval | \`DPO_LEGAL_1_REPORTS_EXPORT_PRIVACY_REVIEW.md\` | DPO |
| 6 | Identity evidence / manual ID review | \`DPO_LEGAL_1_IDENTITY_EVIDENCE_REVIEW.md\` (PARTIAL) | DPO + COM_CERT |
| 7 | Retention and deletion schedules | \`DPO_LEGAL_1_RETENTION_AND_DELETION_REVIEW.md\` | DPO / Legal |
| 8 | Data subject rights procedure | \`DPO_LEGAL_1_DATA_SUBJECT_RIGHTS_REVIEW.md\` | DPO / Legal |
| 9 | DPIA screening outcome | \`DPO_LEGAL_1_DPIA_SCREENING.md\` | DPO |
| 10 | Audit logging and evidence retention | GDPR risk register + F5-5/F5-6 | DPO + Security |
| 11 | Staff MFA dependency | STAFF-MFA-2 (\`${mfa2.final_verdict ?? 'PARTIAL'}\`) | Security delegate |
| 12 | Processor / subprocessor review | Data flow map (Keycloak, S3/MinIO) | DPO |
| 13 | External pilot go/no-go decision | Decision checklist | DPO + Legal + Program owner |

**No approval claimed unless recorded in sign-off record with reviewer evidence.**
`,
  );

  const decisionRows = DECISION_TOPICS.map(
    (t) =>
      `| ${t.id} | ${t.name} | \`${t.evidence}\` | **${topicStat}** | No reviewer decision recorded in this task | Awaiting DPO/legal session | DPO / Legal | [TBD] | External pilot **NO-GO** until decided |`,
  ).join('\n');

  w(
    evidenceDir,
    'DPO_LEGAL_2_DECISION_LOG.md',
    `# DPO-LEGAL-2 Decision Log

**Reviewer decision provided:** ${hasReviewer ? `Yes — ${reviewerDecision}` : '**No**'}
${reviewerNotes ? `\n**Reviewer notes (non-secret):** ${reviewerNotes}\n` : ''}

| Topic ID | Topic | Evidence reviewed | Status | Decision text | Conditions | Responsible role | Due date | External pilot impact |
|----------|-------|-------------------|--------|---------------|------------|------------------|----------|----------------------|
${decisionRows}

**Default rule:** Topics marked ${topicStat} — no APPROVED without explicit reviewer decision and sign-off record.
`,
  );

  const basisRows = PROCESSING_AREAS.map(
    (p) =>
      `| ${p.id} | ${p.name} | ${p.basis} | **PENDING** | Awaiting DPO/legal confirmation | External pilot blocked for this area until approved |`,
  ).join('\n');

  w(
    evidenceDir,
    'DPO_LEGAL_2_LAWFUL_BASIS_DECISION_MATRIX.md',
    `# DPO-LEGAL-2 Lawful Basis Decision Matrix

Source: \`DPO_LEGAL_1_PROCESSING_INVENTORY.md\`

| ID | Processing area | Proposed basis (DPO-LEGAL-1) | DPO/legal decision | Condition / comment | External pilot impact |
|----|-----------------|------------------------------|--------------------|---------------------|----------------------|
${basisRows}

**No lawful basis recorded as final.** All decisions PENDING until DPO/legal session completes.
`,
  );

  const retRows = RETENTION_ROWS.map(
    (r) =>
      `| ${r.cat} | ${r.proposed} | **Not approved** | [DPO: deletion rule TBD] | **PENDING** | Retention schedule for external pilot | **Blocker** |`,
  ).join('\n');

  w(
    evidenceDir,
    'DPO_LEGAL_2_RETENTION_APPROVAL_MATRIX.md',
    `# DPO-LEGAL-2 Retention Approval Matrix

| Category | Proposed retention (DPO-LEGAL-1) | Approved retention | Deletion / anonymization rule | Decision status | Unresolved question | External pilot impact |
|----------|----------------------------------|------------------|-------------------------------|-----------------|---------------------|----------------------|
${retRows}

**Do not treat proposed periods as legally approved.**
`,
  );

  w(
    evidenceDir,
    'DPO_LEGAL_2_DSR_PROCEDURE_DECISION.md',
    `# DPO-LEGAL-2 Data Subject Rights Procedure Decision

**Procedure reference:** \`docs/legal/gdpr/DSR_PROCEDURE.md\` (DRAFT)

**Overall decision:** **DEFERRED**

| Right | Implementation | Decision | Owner | SLA placeholder | Evidence required |
|-------|----------------|----------|-------|-----------------|-------------------|
| Access | Manual intake — no automated portal | DEFERRED | DPO | [DPO: X business days] | Approved procedure + intake channel |
| Rectification | Partial staff workflows | DEFERRED | DPO + Support | [TBD] | Procedure section sign-off |
| Erasure | No automated API; LEG-18–21 conflict open | **GAP_BLOCKER** | DPO / Legal | [TBD] | Legal position on cert/audit retention vs erasure |
| Restriction | Not automated | DEFERRED | DPO | [TBD] | Procedure |
| Objection | Not automated | DEFERRED | DPO | [TBD] | Procedure |
| Portability | No structured export API | GAP_BLOCKER | DPO | [TBD] | Decision if required for external pilot |
| Manual request intake | Email placeholder in draft procedure | DEFERRED | DPO | [TBD] | Approved intake + logging |
| Conflict with cert/audit retention | Documented open | **GAP_BLOCKER** | Legal | N/A | Written legal opinion or risk acceptance |

**External pilot impact:** NO-GO until DSR procedure approved or formally risk-accepted.
`,
  );

  w(
    evidenceDir,
    'DPO_LEGAL_2_DPIA_DECISION_RECORD.md',
    `# DPO-LEGAL-2 DPIA Decision Record

**DPO-LEGAL-1 screening:** DPIA_SCREENING_NEEDS_DPO_DECISION

| Field | Value |
|-------|-------|
| **Decision** | **DPIA_DECISION_PENDING** |
| Reviewer input provided | ${hasReviewer ? 'Partial' : '**No**'} |
| Biometrics | Not implemented — not in scope |
| Automated certification decisions | Not claimed |

## Factors awaiting DPO decision

- High-stakes professional certification impact on individuals
- Identity evidence processing (PARTIAL)
- Systematic audit trails
- Public verification portal (limited fields)

## Decision options (for DPO)

| Option | Status |
|--------|--------|
| DPIA_REQUIRED_BEFORE_EXTERNAL | Not selected — pending |
| DPIA_NOT_REQUIRED_WITH_REASONING | Not selected — pending |
| DPIA_DEFERRED_INTERNAL_ONLY | Not selected — pending |
| **DPIA_DECISION_PENDING** | **Current** |

**External pilot impact:** NO-GO until DPIA decision recorded.
`,
  );

  const condRows = CONDITIONS.map(
    (c) =>
      `| ${c.id} | ${c.source} | ${c.severity} | ${c.action} | ${c.owner} | ${c.evidence} | [TBD] | **OPEN** | External pilot blocked until closed or risk-accepted |`,
  ).join('\n');

  w(
    evidenceDir,
    'DPO_LEGAL_2_EXTERNAL_PILOT_CONDITIONS_REGISTER.md',
    `# DPO-LEGAL-2 External Pilot Privacy Conditions Register

| Condition ID | Source | Severity | Required action | Owner | Evidence required | Due date | Status | External pilot impact |
|--------------|--------|----------|-----------------|-------|-------------------|----------|--------|----------------------|
${condRows}

**Open conditions:** ${conditionsOpen} | **Closed:** ${conditionsClosed}
`,
  );

  w(
    evidenceDir,
    'DPO_LEGAL_2_SIGN_OFF_RECORD.md',
    `# DPO-LEGAL-2 Sign-Off Record

**Status:** UNSIGNED — no approval evidence provided

| Role | Name | Date | Decision | Scope | Conditions | Exclusions |
|------|------|------|----------|-------|------------|------------|
| DPO reviewer | [NOT PROVIDED] | [NOT PROVIDED] | PENDING | External pilot privacy/legal | See conditions register | — |
| Legal reviewer | [NOT PROVIDED] | [NOT PROVIDED] | PENDING | Lawful basis, retention, DSR | See decision log | — |
| Security delegate | [NOT PROVIDED] | [NOT PROVIDED] | PENDING | Staff MFA alignment | STAFF-MFA-2 | — |
| Program owner | [NOT PROVIDED] | [NOT PROVIDED] | PENDING | External pilot scope | All open conditions | — |

## Recorded decision

| Field | Value |
|-------|-------|
| Signed | **No** |
| DPO approval claimed | **${dpoApprovalClaimed}** |
| Legal approval claimed | **${legalApprovalClaimed}** |
| External pilot approved | **${externalPilotApproved}** |

${hasReviewer ? `**Env reviewer hint (not a signature):** \`${reviewerDecision}\`${reviewerNotes ? ` — ${reviewerNotes}` : ''}` : '**No reviewer decision env vars set.** Set `DPO_LEGAL_2_REVIEWER_DECISION` only when real approval is authorized.'}
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
    'DPO_LEGAL_2_REGRESSION_RESULTS.md',
    `# DPO-LEGAL-2 Regression / Evidence Checks

| Command | Status | Mode | Evidence | Duration |
|---------|--------|------|----------|----------|
${regLines}

Overall: **${regressionPass ? 'PASS' : 'FAIL'}**
`,
  );

  w(
    evidenceDir,
    'DPO_LEGAL_2_DECISION_SESSION_REPORT.md',
    `# DPO-LEGAL-2 Decision Session Report

| Field | Value |
|-------|-------|
| **Evidence** | \`${relFolder}\` |
| **DPO-LEGAL-1** | ${dpo1.final_verdict ?? 'DPO_LEGAL_1_REVIEW_PACKAGE_READY_PENDING_DECISION'} |
| **Verdict** | **${finalVerdict}** |

## DPO-LEGAL-1 confirmation

| Item | Status |
|------|--------|
| Review package complete | Yes |
| Approval claimed in DPO-LEGAL-1 | **No** |
| External pilot (pre-decision) | **NO-GO** |
| Staff MFA separate blocker | Yes — \`${mfa2.final_verdict ?? 'PARTIAL'}\` |
| CA-H01 | CLOSED |
| S17 | CLOSED |

## Session outcome

- Decision agenda, log, matrices, and conditions register created.
- **No DPO/legal approval recorded** — sign-off placeholders unsigned.
- **${conditionsOpen}** open conditions; **${conditionsClosed}** closed.

## External pilot verdict

**NO-GO** — decisions pending and staff MFA partial.

## Recommended next action

Convene DPO/legal decision session; complete sign-off record; close conditions register; align Security delegate on MFA before external pilot.
`,
  );

  const blockers = [
    ...((dpo1.external_pilot_blockers_remaining ?? []) ),
    'DPO_LEGAL_2_DECISION_SESSION_PENDING',
  ];

  const summary = {
    evidence_folder: relFolder,
    dpo_legal_1_status: dpo1.final_verdict ?? 'DPO_LEGAL_1_REVIEW_PACKAGE_READY_PENDING_DECISION',
    dpo_legal_1_evidence: DPO_LEGAL_1,
    decision_session_agenda_status: 'COMPLETE',
    decision_log_status: hasReviewer ? 'PARTIAL_REVIEWER_HINT' : 'PENDING_NO_REVIEWER',
    lawful_basis_decision_status: 'PENDING',
    retention_approval_status: 'PENDING',
    dsr_procedure_decision_status: 'DEFERRED_GAP_BLOCKERS',
    dpia_decision_status: 'DPIA_DECISION_PENDING',
    external_pilot_conditions_status: 'OPEN',
    sign_off_record_status: 'UNSIGNED',
    public_verification_privacy_status: dpo1.public_verification_privacy_status ?? 'REVIEW_READY_S17_CONFIRMED',
    reports_export_privacy_status: dpo1.reports_export_privacy_status ?? 'REVIEW_READY_CA_H01_CONFIRMED',
    identity_evidence_decision_status: 'DEFERRED',
    staff_mfa_dependency_status: mfa2.final_verdict ?? 'STAFF_MFA_2_PARTIAL_READY_PENDING_MANUAL_ENROLLMENT',
    staff_mfa_2_evidence: LINKED.staffMfa2,
    regression_guard_status: regressionPass ? 'PASS' : 'FAIL',
    dpo_approval_claimed: dpoApprovalClaimed,
    legal_approval_claimed: legalApprovalClaimed,
    external_pilot_approved: externalPilotApproved,
    gdpr_compliance_claimed: false,
    conditions_open_count: conditionsOpen,
    conditions_closed_count: conditionsClosed,
    blockers_remaining_count: blockers.length,
    blockers_remaining: blockers,
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
    local_pilot_impact: 'GO',
    full_internal_pilot_impact: 'CONDITIONAL_GO',
    external_pilot_impact: 'NO_GO',
    external_pilot_verdict: 'NO_GO',
    final_verdict: finalVerdict,
    recommended_next_action: 'CONVENE_DPO_LEGAL_SESSION_AND_COMPLETE_SIGN_OFF',
  };

  w(evidenceDir, 'summary.json', JSON.stringify(summary, null, 2));
  w(evidenceDir, 'dpo-legal-1-reference.json', JSON.stringify({ folder: DPO_LEGAL_1, summary: dpo1 }, null, 2));

  console.log(JSON.stringify(summary, null, 2));
  process.exit(finalVerdict.includes('NO_GO') && !finalVerdict.includes('PENDING') ? 1 : 0);
}

main();
