#!/usr/bin/env node
/**
 * Compare axe JSON reports with the tracked baseline.
 * A missing report or a new/increased violation fails the gate.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const repoRoot = join(import.meta.dirname, '..', '..');
const reportsDir = join(repoRoot, 'tests', 'e2e', 'reports');
const baselinePath = join(repoRoot, 'tests', 'e2e', 'a11y-baseline.json');

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function violationCount(report) {
  const violations = Array.isArray(report.violations) ? report.violations : [];
  /** @type {Record<string, number>} */
  const counts = {};
  for (const violation of violations) {
    const id = typeof violation.id === 'string' ? violation.id : 'unknown';
    const nodes = Array.isArray(violation.nodes) ? violation.nodes.length : 1;
    counts[id] = (counts[id] ?? 0) + nodes;
  }
  return counts;
}

function listAxeReports() {
  let names = [];
  try {
    names = readdirSync(reportsDir);
  } catch {
    return [];
  }
  return names.filter((name) => name.startsWith('axe-') && name.endsWith('.json')).sort();
}

const reports = listAxeReports();
if (reports.length === 0) {
  console.error('Axe baseline comparison failed: no tests/e2e/reports/axe-*.json results.');
  process.exit(1);
}

let baseline;
try {
  baseline = readJson(baselinePath);
} catch {
  console.error(`Axe baseline comparison failed: missing ${baselinePath}`);
  process.exit(1);
}

const allowed =
  baseline.violations && typeof baseline.violations === 'object' ? baseline.violations : {};
let failed = false;
for (const name of reports) {
  const counts = violationCount(readJson(join(reportsDir, name)));
  for (const [id, count] of Object.entries(counts)) {
    const limit = typeof allowed[id] === 'number' ? allowed[id] : 0;
    if (count > limit) {
      failed = true;
      console.error(`FAIL ${name} ${id}: ${count} nodes, baseline allows ${limit}`);
    }
  }
  console.log(`Checked ${name}`);
}

if (failed) {
  process.exit(1);
}
console.log('Axe results are within the tracked baseline.');
