#!/usr/bin/env node
/**
 * F4-8g frontend cutover validation: audit + unit + e2e smoke.
 *
 * Usage: node scripts/ops/run-f4-8g-frontend-validation.mjs
 * Evidence: docs/evidence/f4-8g-frontend-build-e2e-validation/<timestamp>/
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const FRONTEND = join(REPO_ROOT, 'frontend-app');

function timestampFolder() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  return (
    [now.getUTCFullYear(), pad(now.getUTCMonth() + 1), pad(now.getUTCDate())].join('-') +
    `T${pad(now.getUTCHours())}-${pad(now.getUTCMinutes())}-${pad(now.getUTCSeconds())}Z-f4-8g`
  );
}

/**
 * @param {string} label
 * @param {string} command
 * @param {string[]} args
 * @param {string} cwd
 */
function runStep(label, command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    env: process.env,
    encoding: 'utf8',
  });
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;
  return {
    label,
    command: [command, ...args].join(' '),
    cwd,
    pass: result.status === 0,
    exitCode: result.status ?? 1,
    output,
  };
}

function main() {
  const folder = timestampFolder();
  const evidenceDir = join(
    REPO_ROOT,
    'docs',
    'evidence',
    'f4-8g-frontend-build-e2e-validation',
    folder,
  );
  mkdirSync(evidenceDir, { recursive: true });

  const steps = [
    runStep(
      'audit-unit',
      process.execPath,
      ['--test', join(REPO_ROOT, 'scripts', 'ops', 'audit-f4-frontend-api-usage.test.mjs')],
      REPO_ROOT,
    ),
    runStep(
      'audit',
      process.execPath,
      [join(REPO_ROOT, 'scripts', 'ops', 'audit-f4-frontend-api-usage.mjs')],
      REPO_ROOT,
    ),
    runStep('build-ui', 'pnpm', ['--filter', '@confora/ui', 'build'], REPO_ROOT),
    runStep('build-i18n', 'pnpm', ['--filter', '@confora/i18n', 'build'], REPO_ROOT),
    runStep('unit', 'npm', ['run', 'test:f4-cutover'], FRONTEND),
    runStep('e2e-smoke', 'npm', ['run', 'test:e2e:f4-smoke'], FRONTEND),
  ];

  for (const step of steps) {
    writeFileSync(join(evidenceDir, `${step.label}.log`), step.output);
    console.log(`\n== ${step.label} exit=${step.exitCode} ${step.pass ? 'PASS' : 'FAIL'} ==`);
    console.log(step.output.slice(-4000));
  }

  const summary = {
    evidence: `docs/evidence/f4-8g-frontend-build-e2e-validation/${folder}/`,
    pass: steps.every((step) => step.pass),
    steps: steps.map((step) => ({
      label: step.label,
      command: step.command,
      pass: step.pass,
      exitCode: step.exitCode,
    })),
  };
  writeFileSync(join(evidenceDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
  if (!summary.pass) {
    console.error('F4-8g frontend validation failed.');
    process.exitCode = 1;
    return;
  }
  console.log(`F4-8g frontend validation passed. Evidence: ${summary.evidence}`);
}

main();
