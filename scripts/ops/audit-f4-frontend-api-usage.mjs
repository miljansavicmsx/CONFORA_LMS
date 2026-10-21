#!/usr/bin/env node
/**
 * F4-8f legacy API usage audit.
 *
 * Fails closed when production frontend source calls blocked admin report
 * routes, legacy admin mutations, or report export GET bypasses.
 * `legacyPath` registry metadata and comments are not calls.
 *
 * Usage: node scripts/ops/audit-f4-frontend-api-usage.mjs
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

const SCAN_ROOTS = [
  { id: 'frontend-app', path: 'frontend-app' },
  { id: 'apps-web', path: 'apps/web' },
  { id: 'apps-admin', path: 'apps/admin' },
  { id: 'packages', path: 'packages' },
];

const SOURCE_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);
const SKIP_DIRS = new Set([
  'node_modules',
  'dist',
  'coverage',
  'e2e',
  '.vite',
  '.next',
  '.csp-dashboard-runtime-dist',
]);

const EXPORT_BYPASS_RE = /\/v1\/admin\/reports\/export|\/api\/reports\/export/;
const BLOCKED_REPORTS_RE = /\/v1\/admin\/reports\//;
const MUTATION_RE = /\.(?:patch|put|delete|post)\(\s*[`'"]([^`'"]*)/;
const LEGACY_MUTATION_TARGET_RE = /\/v1\/admin\/(?:complaints|appeals|reports)/;

/**
 * @param {string} relativePath
 */
export function isProductionSource(relativePath) {
  const normalized = relativePath.replaceAll('\\', '/');
  if (!SOURCE_EXT.has(extensionOf(normalized))) {
    return false;
  }
  const parts = normalized.split('/');
  if (parts.some((part) => SKIP_DIRS.has(part) || part === '__tests__')) {
    return false;
  }
  const base = parts.at(-1) ?? '';
  return !/\.(test|spec)\.[cm]?[jt]sx?$/.test(base);
}

/**
 * @param {string} source
 */
export function stripComments(source) {
  let out = '';
  let index = 0;
  while (index < source.length) {
    const next = source[index];
    const ahead = source[index + 1];
    if (next === '/' && ahead === '/') {
      index += 2;
      while (index < source.length && source[index] !== '\n') {
        index += 1;
      }
      continue;
    }
    if (next === '/' && ahead === '*') {
      index += 2;
      while (index < source.length && !(source[index] === '*' && source[index + 1] === '/')) {
        if (source[index] === '\n') {
          out += '\n';
        }
        index += 1;
      }
      index += 2;
      continue;
    }
    if (next === '"' || next === "'" || next === '`') {
      const quote = next;
      out += next;
      index += 1;
      while (index < source.length && source[index] !== quote) {
        if (source[index] === '\\') {
          out += source[index] + (source[index + 1] ?? '');
          index += 2;
          continue;
        }
        out += source[index];
        index += 1;
      }
      out += source[index] ?? '';
      index += 1;
      continue;
    }
    out += next;
    index += 1;
  }
  return out;
}

/**
 * @param {string} relativePath
 * @param {string} source
 */
export function findingsForSource(relativePath, source) {
  if (!isProductionSource(relativePath)) {
    return [];
  }
  /** @type {Array<{ rule: string, line: number, text: string, path: string }>} */
  const findings = [];
  const lines = stripComments(source).split('\n');
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? '';
    if (/legacyPath\s*:/.test(line) || /^\s*todo\s*:/.test(line)) {
      continue;
    }
    const lineNo = index + 1;
    if (EXPORT_BYPASS_RE.test(line)) {
      findings.push({
        rule: 'EXPORT_BYPASS',
        line: lineNo,
        text: line.trim(),
        path: relativePath,
      });
    } else if (BLOCKED_REPORTS_RE.test(line)) {
      findings.push({
        rule: 'BLOCKED_ROUTE_PRODUCTION',
        line: lineNo,
        text: line.trim(),
        path: relativePath,
      });
    }
    const mutation = MUTATION_RE.exec(line);
    if (mutation?.[1] && LEGACY_MUTATION_TARGET_RE.test(mutation[1])) {
      findings.push({
        rule: 'LEGACY_MUTATION_PRODUCTION',
        line: lineNo,
        text: line.trim(),
        path: relativePath,
      });
    }
  }
  return findings;
}

/**
 * @param {string} repoRoot
 */
export function auditRepository(repoRoot = REPO_ROOT) {
  /** @type {string[]} */
  const scanned = [];
  /** @type {string[]} */
  const skipped = [];
  /** @type {ReturnType<typeof findingsForSource>} */
  const findings = [];
  for (const root of SCAN_ROOTS) {
    const absolute = join(repoRoot, root.path);
    let info;
    try {
      info = statSync(absolute);
    } catch {
      skipped.push(root.id);
      continue;
    }
    if (!info.isDirectory()) {
      skipped.push(root.id);
      continue;
    }
    scanned.push(root.id);
    for (const file of walk(absolute)) {
      const rel = relative(repoRoot, file);
      if (!isProductionSource(rel)) {
        continue;
      }
      const source = readFileSync(file, 'utf8');
      findings.push(...findingsForSource(rel, source));
    }
  }
  return {
    scanned,
    skipped,
    findings,
    gateFailures: findings.length,
  };
}

function extensionOf(filePath) {
  const base = filePath.split('/').at(-1) ?? '';
  const dot = base.lastIndexOf('.');
  return dot === -1 ? '' : base.slice(dot);
}

/**
 * @param {string} directory
 * @returns {string[]}
 */
function walk(directory) {
  /** @type {string[]} */
  const files = [];
  for (const entry of readdirSync(directory)) {
    if (SKIP_DIRS.has(entry)) {
      continue;
    }
    const absolute = join(directory, entry);
    const info = statSync(absolute);
    if (info.isDirectory()) {
      files.push(...walk(absolute));
    } else {
      files.push(absolute);
    }
  }
  return files;
}

function printReport(result) {
  const byRule = (rule) => result.findings.filter((finding) => finding.rule === rule).length;
  console.log('F4-8f Legacy API Usage Audit Gate');
  console.log(`Roots scanned: ${result.scanned.join(', ') || '(none)'}`);
  console.log(`Skipped roots: ${result.skipped.join(', ') || '(none)'}`);
  console.log(`Blocked production hits: ${byRule('BLOCKED_ROUTE_PRODUCTION')}`);
  console.log(`Legacy mutation production hits: ${byRule('LEGACY_MUTATION_PRODUCTION')}`);
  console.log(`Export bypass violations: ${byRule('EXPORT_BYPASS')}`);
  console.log(`Gate failures: ${result.gateFailures}`);
  for (const finding of result.findings) {
    console.log(`FAIL [${finding.rule}] ${finding.path}:${finding.line} ${finding.text}`);
  }
  if (result.gateFailures === 0) {
    console.log('PASS: all F4-8f gate checks satisfied.');
    console.log('GO: F4-8f Legacy API Usage Audit Gate passed.');
    return;
  }
  console.log('NO-GO: F4-8f Legacy API Usage Audit Gate failed.');
}

const isDirectRun =
  Boolean(process.argv[1]) && fileURLToPath(import.meta.url) === resolve(process.argv[1]);
if (isDirectRun) {
  const result = auditRepository();
  printReport(result);
  if (result.gateFailures > 0) {
    process.exitCode = 1;
  }
}
