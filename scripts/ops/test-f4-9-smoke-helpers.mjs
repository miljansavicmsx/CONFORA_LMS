import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  CONTACT_REQUEST_SUBMITTED_AUDIT_ACTION,
  F4_REPORTS_READONLY_PATHS,
  LEGACY_BLOCKED_PATHS,
  classifyLegacyBlockResponse,
  countAuditRows,
  evaluateAuditRowsRedaction,
  evaluateCsvFormulaInjectionProtection,
  evaluateF4SideEffectInvariants,
  evaluatePublicContactRedaction,
  evaluateReportRedaction,
  buildCleanupSyntheticF4SlaCheckpointsSql,
  buildRunScopedSlaCheckpointCountSql,
  maxAllowedSlaCheckpointDeltaForRun,
  F4_9_SMOKE_SUBJECT_MARKER,
  F4_9_MAX_SLA_CHECKPOINTS_PER_CONTACT,
  isBlockedStatus,
  isForbiddenF4FastApiProductionRoute,
  isSuccessStatus,
  parseContentDispositionFilename,
  publicContactRequestsPath,
  publicContactStatusPath,
  staffContactAcknowledgePath,
  staffReportsExportPath,
  summarizeSmokeResults,
} from './lib/f4-9-smoke-helpers.mjs';

describe('f4-9-smoke-helpers', () => {
  it('builds contact and report paths', () => {
    assert.equal(publicContactRequestsPath(), '/v1/public/contact-requests');
    assert.equal(publicContactStatusPath('CNT-2026-abc'), '/v1/public/contact-requests/CNT-2026-abc');
    assert.equal(
      staffContactAcknowledgePath('d4300000-0000-4000-8000-000000000001'),
      '/v1/staff/contact-requests/d4300000-0000-4000-8000-000000000001/acknowledge',
    );
    assert.equal(staffReportsExportPath(), '/v1/staff/reports/export');
    assert.ok(F4_REPORTS_READONLY_PATHS.includes('/v1/staff/reports/overview'));
  });

  it('classifies HTTP status helpers', () => {
    assert.equal(isSuccessStatus(200), true);
    assert.equal(isSuccessStatus(201), true);
    assert.equal(isSuccessStatus(404), false);
    assert.equal(isBlockedStatus(410), true);
    assert.equal(classifyLegacyBlockResponse(410), true);
    assert.equal(classifyLegacyBlockResponse(200), false);
  });

  it('detects forbidden F4 FastAPI production routes', () => {
    assert.equal(isForbiddenF4FastApiProductionRoute('/api/complaints'), true);
    assert.equal(isForbiddenF4FastApiProductionRoute('/api/reports/export', 'GET'), true);
    assert.equal(isForbiddenF4FastApiProductionRoute('/v1/staff/reports/export/policy', 'GET'), false);
    assert.equal(isForbiddenF4FastApiProductionRoute('/v1/staff/reports/export', 'POST'), false);
  });

  it('evaluates public contact redaction', () => {
    const ok = evaluatePublicContactRedaction({
      publicReference: 'CNT-2026-001',
      status: 'SUBMITTED',
      nextStep: 'We will respond.',
    });
    assert.equal(ok.pass, true);

    const bad = evaluatePublicContactRedaction({
      publicReference: 'CNT-2026-001',
      tenantId: '00000000-0000-4000-8000-000000000001',
    });
    assert.equal(bad.pass, false);
  });

  it('evaluates report and audit redaction', () => {
    assert.equal(evaluateReportRedaction({ contractVersion: '1.2.0', counts: {} }).pass, true);
    assert.equal(
      evaluateReportRedaction({ email: 'secret@example.com' }).pass,
      false,
    );
    assert.equal(
      evaluateAuditRowsRedaction([
        { action: 'CONTACT_REQUEST_SUBMITTED', new_value: '{"action":"CONTACT_REQUEST_SUBMITTED"}' },
      ]).pass,
      true,
    );
    assert.equal(
      evaluateAuditRowsRedaction([
        { action: 'REPORT_EXPORTED', new_value: '{"reportKey":"overview","format":"CSV","rowCount":0}' },
      ]).pass,
      true,
    );
    assert.equal(
      evaluateAuditRowsRedaction([
        { action: 'REPORT_EXPORTED', new_value: '{"rows":[{"email":"x@y.z"}]}' },
      ]).pass,
      false,
    );
  });

  it('evaluates CSV formula injection protection', () => {
    assert.equal(evaluateCsvFormulaInjectionProtection('status,count\nopen,1\n').pass, true);
    assert.equal(evaluateCsvFormulaInjectionProtection('=cmd|"/c calc"!A0,count\n').pass, false);
  });

  it('counts audit rows and summarizes smoke results', () => {
    const rows = [
      { action: CONTACT_REQUEST_SUBMITTED_AUDIT_ACTION },
      { action: 'REPORT_VIEWED' },
    ];
    assert.equal(countAuditRows(rows, CONTACT_REQUEST_SUBMITTED_AUDIT_ACTION), 1);
    const summary = summarizeSmokeResults([
      { id: 'A', pass: true, detail: 'ok' },
      { id: 'B', pass: false, detail: 'fail' },
    ]);
    assert.equal(summary.checksTotal, 2);
    assert.equal(summary.checksPassed, 1);
    assert.equal(summary.overallPass, false);
  });

  it('evaluates F4 side-effect invariants with allowed contact delta', () => {
    const before = {
      certificateCount: 1,
      complaintCaseCount: 0,
      appealCaseCount: 0,
      contactRequestCount: 10,
      contactSlaCheckpointCount: 0,
      contactNotificationLogCount: 0,
    };
    const after = {
      ...before,
      contactRequestCount: 12,
      contactSlaCheckpointCount: 1,
      contactNotificationLogCount: 1,
    };
    const evalResult = evaluateF4SideEffectInvariants(before, after, {
      allowContactRequestDelta: 2,
      allowContactSlaCheckpointDelta: 1,
      allowContactNotificationDelta: 1,
    });
    assert.equal(evalResult.pass, true);

    const bad = evaluateF4SideEffectInvariants(before, { ...after, complaintCaseCount: 1 });
    assert.equal(bad.pass, false);
  });

  it('evaluates run-scoped SLA checkpoint delta for F4-9 smoke contacts', () => {
    const runIds = ['a', 'b', 'c'];
    const before = {
      certificateCount: 1,
      complaintCaseCount: 0,
      appealCaseCount: 0,
      contactRequestCount: 10,
      runScopedContactSlaCheckpointCount: 0,
      contactNotificationLogCount: 0,
    };
    const after = {
      ...before,
      contactRequestCount: 13,
      runScopedContactSlaCheckpointCount: 9,
      contactNotificationLogCount: 1,
      contactSlaCheckpointCount: 99,
    };
    const ok = evaluateF4SideEffectInvariants(before, after, {
      allowContactRequestDelta: 5,
      allowContactNotificationDelta: 2,
      runContactRequestIds: runIds,
    });
    assert.equal(ok.pass, true);
    assert.equal(ok.slaDelta, 9);

    const drift = evaluateF4SideEffectInvariants(before, {
      ...after,
      runScopedContactSlaCheckpointCount: 25,
    }, {
      allowContactRequestDelta: 5,
      runContactRequestIds: runIds,
    });
    assert.equal(drift.pass, false);
    assert.match(drift.issues.join('; '), /runScopedContactSlaCheckpointCount/);
  });

  it('builds synthetic F4-9 SLA cleanup and scoped count SQL', () => {
    assert.match(buildCleanupSyntheticF4SlaCheckpointsSql('tenant-1'), /F4-9%/);
    assert.match(
      buildRunScopedSlaCheckpointCountSql('tenant-1', ['id-a', 'id-b']),
      /contact_request_id IN/,
    );
    assert.equal(maxAllowedSlaCheckpointDeltaForRun(3), 3 * F4_9_MAX_SLA_CHECKPOINTS_PER_CONTACT);
  });

  it('parses Content-Disposition filename', () => {
    assert.equal(
      parseContentDispositionFilename('attachment; filename="confora-overview.csv"'),
      'confora-overview.csv',
    );
    assert.equal(parseContentDispositionFilename(''), null);
  });

  it('defines legacy blocked paths', () => {
    assert.ok(LEGACY_BLOCKED_PATHS.some((p) => p.path.includes('/v1/admin/reports/export')));
  });
});
