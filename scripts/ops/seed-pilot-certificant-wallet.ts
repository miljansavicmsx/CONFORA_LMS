/**
 * TD-082 — Seed pilot certificant wallet fixture.
 *
 * Run sequence (from repo root):
 *   cd packages/database && pnpm exec prisma db seed
 *   pnpm exec tsx ../../scripts/ops/seed-pilot-auth-users.ts
 *   pnpm exec tsx ../../scripts/ops/seed-pilot-certificant-wallet.ts
 *
 * Revert: pnpm exec tsx ../../scripts/ops/seed-pilot-certificant-wallet.ts --reset
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { PrismaClient } from '@prisma/client';

import {
  resetPilotCertificantWallet,
  seedPilotCertificantWallet,
} from '../../packages/database/prisma/seeds/td-082-pilot-certificant-wallet.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');

async function main() {
  const prisma = new PrismaClient();
  const reset = process.argv.includes('--reset');

  try {
    if (reset) {
      await resetPilotCertificantWallet(prisma);
      console.log('TD-082 pilot certificant wallet fixture removed');
      return;
    }

    const result = await seedPilotCertificantWallet(prisma);
    const evidenceDir = join(
      REPO_ROOT,
      'docs',
      'evidence',
      'td-082-certificant-seed',
      'latest-seed-run',
    );
    mkdirSync(evidenceDir, { recursive: true });
    writeFileSync(
      join(evidenceDir, 'pilot-certificant-wallet-seed.json'),
      JSON.stringify({ seededAt: new Date().toISOString(), ...result }, null, 2),
    );
    console.log('TD-082 pilot certificant wallet seeded:', result.certificateUid);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
