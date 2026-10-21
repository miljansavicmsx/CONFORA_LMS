import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const FINGERPRINT = 'd2670e69c07fdf187aed6ebefc513bb4ca582cd1a5d2fcc50ff1f441c50b3b76';
const PUBLIC_SPKI = 'MCowBQYDK2VwAyEA2LHAnDEy09zHGh3/YmfgWgJK7BqPM3tzz29XPFuGOfQ=';

const ALLOW = new Set([
  'apps/api/src/personnel/personnel-vc.ts',
  'apps/api/src/personnel/personnel-vc.spec.ts',
  'docs/security/INCIDENT-2026-10-21-VC-KEY.md',
  'scripts/ci/scan-burned-vc-key.mjs',
]);

const denylist = readFileSync('apps/api/src/personnel/personnel-vc.ts', 'utf8');
if (!denylist.includes(FINGERPRINT) || !denylist.includes(PUBLIC_SPKI)) {
  console.error('Denylist is missing the burned VC key fingerprint.');
  process.exit(1);
}

const listed = execFileSync('git', ['ls-files', '-z']);
const files = listed
  .toString('utf8')
  .split('\0')
  .filter((file) => file.length > 0);
const hits = [];
for (const file of files) {
  if (ALLOW.has(file)) {
    continue;
  }
  const bytes = readFileSync(file);
  if (bytes.includes(0)) {
    continue;
  }
  const text = bytes.toString('utf8');
  if (text.includes(FINGERPRINT) || text.includes(PUBLIC_SPKI)) {
    hits.push(file);
  }
}

if (hits.length > 0) {
  console.error('Burned VC key fingerprint found outside the denylist allowlist:');
  for (const file of hits) {
    console.error(file);
  }
  process.exit(1);
}
