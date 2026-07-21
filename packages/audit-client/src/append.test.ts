import assert from 'node:assert/strict';
import test from 'node:test';

import { auditLedgerAppendSchema } from './index.js';

test('auditLedgerAppendSchema validates minimal payload', () => {
  const parsed = auditLedgerAppendSchema.safeParse({ action: 'system.health_check' });
  assert.equal(parsed.success, true);
});

test('tenantScoped event without tenantId is rejected', () => {
  const parsed = auditLedgerAppendSchema.safeParse({
    action: 'certification.application_submitted',
    tenantScoped: true,
  });
  assert.equal(parsed.success, false);
});

test('platformScope event accepts without tenantId', () => {
  const parsed = auditLedgerAppendSchema.safeParse({
    action: 'reports.platform_aggregate_accessed',
    platformScope: true,
    resourceType: 'ReportingStarSchema',
  });
  assert.equal(parsed.success, true);
});

test('platformScope and tenantScoped are mutually exclusive', () => {
  const parsed = auditLedgerAppendSchema.safeParse({
    action: 'reports.platform_aggregate_accessed',
    platformScope: true,
    tenantScoped: true,
    tenantId: '00000000-0000-4000-8000-000000000001',
  });
  assert.equal(parsed.success, false);
});

test('tenantId implies tenant-scoped validation when platformScope is false', () => {
  const parsed = auditLedgerAppendSchema.safeParse({
    action: 'certification.decision_recorded',
    tenantId: '00000000-0000-4000-8000-000000000001',
    resourceType: 'CertificationApplication',
  });
  assert.equal(parsed.success, true);
});
