import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ExecutionContext } from '@nestjs/common';

import { AccessDeniedError } from '../tenant/tenant-errors';
import { ReportsRolesGuard } from './reports-roles.guard';

function contextFor(request: Record<string, unknown>): ExecutionContext {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe('ReportsRolesGuard', () => {
  const guard = new ReportsRolesGuard();

  it.each([
    ['STAFF_DIR', 'P08_TEST_010'],
    ['STAFF_SYSADM', 'P08_TEST_011'],
    ['STAFF_AUD', 'P08_TEST_012'],
    ['QUALITY_MANAGER', 'P08_TEST_013'],
  ] as const)('%s allowed (%s)', (role) => {
    expect(guard.canActivate(contextFor({ user: { roles: [role] } }))).toBe(true);
  });

  it.each([
    ['USR_CAND', 'P08_TEST_014'],
    ['USR_CERT', 'P08_TEST_015'],
    ['COM_CERT', 'P08_TEST_016'],
    ['ISSUANCE_OFFICER', 'P08_TEST_017'],
    ['LIFECYCLE_OFFICER', 'P08_TEST_018'],
  ] as const)('%s denied (%s)', (role) => {
    expect(() => guard.canActivate(contextFor({ user: { roles: [role] } }))).toThrow(
      AccessDeniedError,
    );
  });

  it('P08_TEST_019 missing actor denied without service call surface', () => {
    expect(() => guard.canActivate(contextFor({}))).toThrow(AccessDeniedError);
  });

  it('exact allowlist size is 4', () => {
    const text = readFileSync(join(__dirname, 'reports-roles.guard.ts'), 'utf8');
    expect(text).toMatch(/REPORT_QUERY_ALLOWED_ROLES/);
    expect(text).not.toMatch(/TenantPrisma|PrismaService|AuditService|ReportQueryService/);
  });
});
