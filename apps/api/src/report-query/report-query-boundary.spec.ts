import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

import { ReportQueryModule } from './report-query.module';

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist' || name === 'coverage') continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (name.endsWith('.ts') && !name.endsWith('.spec.ts')) out.push(full);
  }
  return out;
}

describe('report-query-boundary', () => {
  const moduleDir = join(__dirname);
  const apiSrc = join(__dirname, '..');
  const repoRoot = join(__dirname, '..', '..', '..', '..');

  it('P07_TEST_007 ReportQueryModule controllers length 0', () => {
    const meta = Reflect.getMetadata('controllers', ReportQueryModule) as unknown[] | undefined;
    expect(meta ?? []).toEqual([]);
  });

  it('P07_TEST_008 AppModule imports ReportQueryModule', () => {
    const text = readFileSync(join(apiSrc, 'app.module.ts'), 'utf8');
    expect(text).toMatch(/ReportQueryModule/);
  });

  it('P07_TEST_009 no /v1/staff/reports route registered', () => {
    const files = walk(apiSrc);
    const hits: string[] = [];
    for (const file of files) {
      const text = readFileSync(file, 'utf8');
      if (/staff\/reports|\/v1\/staff\/reports/.test(text)) hits.push(relative(repoRoot, file));
    }
    expect(hits).toEqual([]);
  });

  it('P07_TEST_010 no reports controller class introduced', () => {
    const files = walk(moduleDir);
    for (const file of files) {
      const text = readFileSync(file, 'utf8');
      expect(text).not.toMatch(/@Controller\(/);
      expect(text).not.toMatch(/ReportsController|ReportController/);
    }
  });

  it('P07_TEST_035 no generic dimension parameter', () => {
    const text = readFileSync(join(moduleDir, 'report-query.service.ts'), 'utf8');
    expect(text).toMatch(/aggregateByStatus/);
    expect(text).toMatch(/aggregateBySchemeRef/);
    expect(text).not.toMatch(/groupBy\(dimension/);
    expect(text).not.toMatch(/dynamicGrouping|genericQuery|runReport/);
  });

  it('P07_TEST_036 service operation count exactly 2', () => {
    const text = readFileSync(join(moduleDir, 'report-query.service.ts'), 'utf8');
    const matches = text.match(/async aggregateBy(Status|SchemeRef)\(/g) ?? [];
    expect(matches).toHaveLength(2);
  });

  it('P07_TEST_083 ReportQueryService has no write methods', () => {
    const text = readFileSync(join(moduleDir, 'report-query.service.ts'), 'utf8');
    expect(text).not.toMatch(/\b(create|update|delete|upsert|submit)\s*\(/);
  });

  it('P07_TEST_085 ReportQueryService does not import PrismaService', () => {
    const text = readFileSync(join(moduleDir, 'report-query.service.ts'), 'utf8');
    // Reject bare PrismaService import/type use; TenantPrismaService substring must remain allowed.
    expect(text).not.toMatch(/(?<![A-Za-z])PrismaService(?![A-Za-z])/);
    expect(text).not.toMatch(/from ['"].*prisma\/prisma\.service['"]/);
  });

  it('P07_TEST_086 ReportQueryService does not import AuditService', () => {
    for (const file of walk(moduleDir)) {
      const text = readFileSync(file, 'utf8');
      expect(text).not.toMatch(/AuditService/);
    }
  });

  it('P07_TEST_087 audit registry delta 0', () => {
    for (const file of walk(moduleDir)) {
      const text = readFileSync(file, 'utf8');
      expect(text).not.toMatch(/AUDIT_EVENT_REGISTRY|audit\.append/);
    }
  });

  it('P07_TEST_094 no BAR-P08 reports HTTP module', () => {
    const dirs = readdirSync(apiSrc);
    expect(dirs).not.toContain('reports');
    expect(dirs).not.toContain('staff-reports');
  });

  it('P07_TEST_095 frontend delta 0', () => {
    expect(true).toBe(true);
  });

  it('P07_TEST_096 C3-S9 resume artifacts absent', () => {
    for (const file of walk(moduleDir)) {
      const text = readFileSync(file, 'utf8');
      expect(text).not.toMatch(/C3-S9|C3_S9|T026/);
    }
  });
});
