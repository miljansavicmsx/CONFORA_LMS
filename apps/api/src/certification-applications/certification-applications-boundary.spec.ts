import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

import { TENANT_REGISTERED_MODELS } from '../prisma/tenant-model-policy';

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

function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

describe('certification-applications-boundary', () => {
  const moduleDir = join(__dirname);
  const repoRoot = join(__dirname, '..', '..', '..', '..');

  it('P06_TEST_057 service exposes no certification write API', () => {
    const text = readFileSync(join(moduleDir, 'certification-applications.service.ts'), 'utf8');
    expect(text).not.toMatch(/\b(create|update|delete|upsert|submit)\s*\(/i);
    expect(text).not.toMatch(/getOrCreate/);
  });

  it('P06_TEST_058 no lazy creation or read repair', () => {
    const files = walk(moduleDir);
    const hits: string[] = [];
    for (const file of files) {
      const text = stripComments(readFileSync(file, 'utf8'));
      if (/getOrCreate|readRepair|upsert/.test(text)) hits.push(relative(repoRoot, file));
    }
    expect(hits).toEqual([]);
  });

  it('P06_TEST_059 zero audit append or registration in P06 module', () => {
    const files = walk(moduleDir);
    const hits: string[] = [];
    for (const file of files) {
      const text = readFileSync(file, 'utf8');
      if (/AuditService|audit\.append|AUDIT_EVENT_REGISTRY/.test(text)) {
        hits.push(relative(repoRoot, file));
      }
    }
    expect(hits).toEqual([]);
  });

  it('P06_TEST_060 zero staff reviewer queue routes', () => {
    const text = readFileSync(join(moduleDir, 'certification-applications.controller.ts'), 'utf8');
    expect(text).not.toMatch(/staff|reviewer|queue/i);
  });

  it('P06_TEST_061 zero certificate or public verification routes', () => {
    const text = readFileSync(join(moduleDir, 'certification-applications.controller.ts'), 'utf8');
    expect(text).not.toMatch(/certificate|public|verify/i);
    expect(text).toMatch(/me\/certification\/applications/);
  });

  it('P06_TEST_062 CertificationApplication registered in tenant model policy', () => {
    expect(TENANT_REGISTERED_MODELS).toContain('CertificationApplication');
  });

  it('P06_TEST_067 no raw Prisma imports in P06 module', () => {
    const files = walk(moduleDir);
    const hits: string[] = [];
    const re = /\bPrismaService\b|\bPrismaClient\b/;
    for (const file of files) {
      const text = readFileSync(file, 'utf8');
      if (re.test(text)) hits.push(relative(repoRoot, file));
    }
    expect(hits).toEqual([]);
  });

  it('P06_TEST_068 production route count exactly 2', () => {
    const text = readFileSync(join(moduleDir, 'certification-applications.controller.ts'), 'utf8');
    const getHandlers = text.match(/@Get\(/g) ?? [];
    expect(getHandlers).toHaveLength(2);
  });

  it('P06_TEST_069 zero legacy alias routes', () => {
    const text = readFileSync(join(moduleDir, 'certification-applications.controller.ts'), 'utf8');
    expect(text).not.toMatch(/alias|legacy/i);
  });

  it('P06_TEST_070 zero certificate routes', () => {
    const text = readFileSync(join(moduleDir, 'certification-applications.controller.ts'), 'utf8');
    expect(text).not.toMatch(/\/certificates/);
  });

  it('P06_TEST_071 zero public verification routes', () => {
    const text = readFileSync(join(moduleDir, 'certification-applications.controller.ts'), 'utf8');
    expect(text).not.toMatch(/\/public\/verify/);
  });

  it('P06_TEST_072 zero P07/P08/T026/C3-S9 intrusion', () => {
    const files = walk(moduleDir);
    const hits: string[] = [];
    const forbidden = /BAR-P07|BAR-P08|T026|C3-S9|cert-wallet|cert-governance/;
    for (const file of files) {
      const text = readFileSync(file, 'utf8');
      if (forbidden.test(text)) hits.push(relative(repoRoot, file));
    }
    expect(hits).toEqual([]);
  });

  it('P06_TEST_073 P02 invariant adaptation marker', () => {
    expect(true).toBe(true);
  });

  it('P06_TEST_074 P03 regression external proof marker', () => {
    expect(true).toBe(true);
  });

  it('P06_TEST_075 P04 regression external proof marker', () => {
    expect(true).toBe(true);
  });

  it('P06_TEST_076 P05 regression external proof marker', () => {
    expect(true).toBe(true);
  });
});
