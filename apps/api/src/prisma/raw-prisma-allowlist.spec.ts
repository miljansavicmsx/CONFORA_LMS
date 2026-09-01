import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

/** Historical BAR-P04 raw Prisma production allowlist (exact size 6). */
const HISTORICAL_P04_ALLOWED = new Set([
  'apps/api/src/prisma/prisma.service.ts',
  'apps/api/src/prisma/prisma.module.ts',
  'apps/api/src/prisma/tenant-prisma.service.ts',
  'apps/api/src/auth/jwt.strategy.ts',
  'apps/api/src/auth/resolve-db-user.ts',
  'apps/api/src/tenant/active-assurance.service.ts',
]);

/** BAR-P05 additive allowlist: historical 6 + audit.repository only. */
const ALLOWED = new Set([...HISTORICAL_P04_ALLOWED, 'apps/api/src/audit/audit.repository.ts']);

const IMPORT_RE =
  /from\s+['"][^'"]*prisma\.service['"]|from\s+['"]@prisma\/client['"]|from\s+['"]@confora\/database['"]|new\s+PrismaClient\b/;

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist') continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (name.endsWith('.ts') && !name.endsWith('.spec.ts')) out.push(full);
  }
  return out;
}

function collectViolations(): string[] {
  const apiSrc = join(__dirname, '..');
  const root = join(apiSrc, '..', '..', '..');
  const files = walk(apiSrc);
  const violations: string[] = [];

  for (const file of files) {
    const rel = relative(root, file).replace(/\\/g, '/');
    if (ALLOWED.has(rel)) continue;
    // Excluded fragments may still contain historical imports; they must stay build-excluded.
    if (
      rel.endsWith('actor-db-access.ts') ||
      rel.endsWith('prisma-tenant-extension.ts') ||
      rel.endsWith('tenant-access-violation.filter.ts') ||
      rel.includes('/cert-governance/') ||
      rel.includes('/cert-wallet/')
    ) {
      continue;
    }
    const text = readFileSync(file, 'utf8');
    // Require whole-symbol PrismaService/PrismaClient (not TenantPrismaService substring).
    if (IMPORT_RE.test(text) && /\bPrismaService\b|\bPrismaClient\b/.test(text)) {
      if (!ALLOWED.has(rel)) {
        violations.push(rel);
      }
    }
  }
  return violations;
}

describe('raw Prisma allowlist', () => {
  it('P04_TEST_048 raw Prisma source allowlist enforcement passes', () => {
    const violations = collectViolations();
    expect(HISTORICAL_P04_ALLOWED.size).toBe(6);
    expect(ALLOWED.size).toBe(7);
    expect(violations).toEqual([]);
  });

  it('P05_TEST_054 Raw Prisma production allowlist exactly 7', () => {
    const violations = collectViolations();
    expect(ALLOWED.size).toBe(7);
    expect(ALLOWED.has('apps/api/src/audit/audit.repository.ts')).toBe(true);
    expect(violations).toEqual([]);
  });
});
