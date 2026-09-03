import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

import { ReportsModule } from './reports.module';
import { ReportQueryModule } from '../report-query/report-query.module';

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

describe('reports-boundary', () => {
  const reportsDir = join(__dirname);
  const apiSrc = join(__dirname, '..');
  const repoRoot = join(__dirname, '..', '..', '..', '..');

  it('P08_TEST_001 ReportsModule imports ReportQueryModule', () => {
    const imports = Reflect.getMetadata('imports', ReportsModule) as unknown[] | undefined;
    expect(imports).toEqual(expect.arrayContaining([ReportQueryModule]));
  });

  it('P08_TEST_002 ReportsModule registers exactly one controller', () => {
    const controllers = Reflect.getMetadata('controllers', ReportsModule) as unknown[] | undefined;
    expect(controllers).toHaveLength(1);
  });

  it('P08_TEST_003 AppModule imports ReportsModule', () => {
    const text = readFileSync(join(apiSrc, 'app.module.ts'), 'utf8');
    expect(text).toMatch(/ReportsModule/);
  });

  it('P08_TEST_004 ReportQueryModule remains controller-free', () => {
    const meta = Reflect.getMetadata('controllers', ReportQueryModule) as unknown[] | undefined;
    expect(meta ?? []).toEqual([]);
  });

  it('P08_TEST_053/054 controller has no TenantPrisma/PrismaService', () => {
    const text = readFileSync(join(reportsDir, 'reports.controller.ts'), 'utf8');
    expect(text).not.toMatch(/TenantPrismaService/);
    expect(text).not.toMatch(/(?<![A-Za-z])PrismaService(?![A-Za-z])/);
  });

  it('P08_TEST_055 no raw SQL/queryRaw/executeRaw in reports production', () => {
    for (const file of walk(reportsDir)) {
      const text = readFileSync(file, 'utf8');
      expect(text).not.toMatch(/\$queryRaw|\$executeRaw|queryRaw|executeRaw/);
      expect(text).not.toMatch(/\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b/);
    }
  });

  it('P08_TEST_056 no write methods; Cache-Control private,no-store; no app cache', () => {
    const controller = readFileSync(join(reportsDir, 'reports.controller.ts'), 'utf8');
    expect(controller).not.toMatch(/@(Post|Put|Patch|Delete)\(/);
    expect(controller.match(/Cache-Control',\s*'private, no-store'/g)?.length).toBe(2);
    for (const file of walk(reportsDir)) {
      const text = readFileSync(file, 'utf8');
      expect(text).not.toMatch(/CacheModule|cache-manager|REPORT_RESULT_CACHE/);
    }
  });

  it('P08_TEST_057/058/059 no export/audit-query/dimension DSL', () => {
    for (const file of walk(reportsDir)) {
      const text = readFileSync(file, 'utf8');
      expect(text).not.toMatch(/@Get\(['"]export|audit-event|groupBy|dimension/);
    }
  });

  it('P08_IMP_06 guard order and throttle declarations', () => {
    const text = readFileSync(join(reportsDir, 'reports.controller.ts'), 'utf8');
    expect(text).toMatch(/@UseGuards\(\s*ReportsRolesGuard\s*,\s*ThrottlerGuard\s*\)/);
    expect(
      text.match(/@Throttle\(\{\s*default:\s*\{\s*limit:\s*20,\s*ttl:\s*60_000\s*\}\s*\}\)/g)
        ?.length,
    ).toBe(2);
  });

  it('P08 production path envelope is exactly the reports package + app import', () => {
    const files = walk(reportsDir).map((f) => relative(repoRoot, f).replace(/\\/g, '/'));
    expect(files.sort()).toEqual(
      [
        'apps/api/src/reports/dto/report-aggregate-query.dto.ts',
        'apps/api/src/reports/report-query-contract.filter.ts',
        'apps/api/src/reports/reports-roles.guard.ts',
        'apps/api/src/reports/reports.controller.ts',
        'apps/api/src/reports/reports.module.ts',
      ].sort(),
    );
  });

  it('P08 audit/logging expansion absent', () => {
    for (const file of walk(reportsDir)) {
      const text = readFileSync(file, 'utf8');
      expect(text).not.toMatch(/AuditService|AUDIT_EVENT_REGISTRY|console\.log|Logger/);
    }
  });
});
