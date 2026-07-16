#!/usr/bin/env node
/**
 * Ensure frontend-app/.env.local exists for Nest auth pilot (local dev only).
 * Vite must be restarted after first write.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');
const ENV_PATH = join(REPO_ROOT, 'frontend-app', '.env.local');
const TEMPLATE_PATH = join(REPO_ROOT, 'scripts', 'ops', 'staging-pilot-frontend.env.example');

const REQUIRED_LINES = [
  'VITE_API_PROVIDER=hybrid',
  'VITE_AUTH_PROVIDER=nest',
  'VITE_NEST_AUTH_PILOT_ENABLED=true',
  'VITE_CONFORA_API_URL=http://localhost:4000',
];

export function ensurePilotFrontendEnv({ force = false } = {}) {
  if (existsSync(ENV_PATH) && !force) {
    const raw = readFileSync(ENV_PATH, 'utf8');
    const ok = REQUIRED_LINES.every((line) => raw.includes(line.split('=')[0]));
    return { created: false, path: ENV_PATH, configured: ok, needsViteRestart: !ok };
  }

  const template = existsSync(TEMPLATE_PATH)
    ? readFileSync(TEMPLATE_PATH, 'utf8')
    : `${REQUIRED_LINES.join('\n')}\nVITE_LEGACY_API_URL=http://localhost:8000\nVITE_API_URL=http://localhost:8000\n`;

  writeFileSync(ENV_PATH, template, 'utf8');
  return { created: true, path: ENV_PATH, configured: true, needsViteRestart: true };
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, '/')}`) {
  const result = ensurePilotFrontendEnv();
  console.log(JSON.stringify(result, null, 2));
}
