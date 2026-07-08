#!/usr/bin/env node
/**
 * Start Nest API with staging-pilot env vars loaded (local pilot stack).
 * Usage: npm run dev:api:pilot
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');
const API_ENV_FILE = join(REPO_ROOT, 'scripts', 'ops', 'staging-pilot-api.env.example');

function loadEnvFile(path) {
  const out = {};
  if (!existsSync(path)) {
    console.error(`Missing env file: ${path}`);
    process.exit(1);
  }
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i > 0) out[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return out;
}

const pilotEnv = loadEnvFile(API_ENV_FILE);
const env = { ...process.env, ...pilotEnv };

console.log('Starting Nest API with staging-pilot env…');
console.log(`  AUTH_JWT_MODE=${env.AUTH_JWT_MODE ?? '(unset)'}`);
console.log(`  KEYCLOAK_JWKS_URI=${env.KEYCLOAK_JWKS_URI ?? '(unset)'}`);
console.log(`  DATABASE_URL=${env.DATABASE_URL ? '[set]' : '(unset)'}`);
console.log('  cwd: apps/api');
console.log('  Press Ctrl+C to stop.\n');

const child = spawn('pnpm', ['run', 'dev'], {
  cwd: join(REPO_ROOT, 'apps', 'api'),
  env,
  stdio: 'inherit',
  shell: true,
});

child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});

process.on('SIGINT', () => child.kill('SIGINT'));
process.on('SIGTERM', () => child.kill('SIGTERM'));
