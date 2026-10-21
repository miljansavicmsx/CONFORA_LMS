#!/usr/bin/env node
/**
 * Aggregate axe JSON into an HTML report and fail on serious or critical violations.
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const repoRoot = join(import.meta.dirname, '..', '..');
const reportsDir = join(repoRoot, 'tests', 'e2e', 'reports');

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
  console.error('Accessibility aggregate failed: no axe JSON reports to gate.');
  process.exit(1);
}

/** @type {Array<{ file: string, id: string, impact: string, nodes: number }>} */
const blocking = [];
/** @type {string[]} */
const rows = [];
for (const name of reports) {
  const report = JSON.parse(readFileSync(join(reportsDir, name), 'utf8'));
  const violations = Array.isArray(report.violations) ? report.violations : [];
  for (const violation of violations) {
    const impact = typeof violation.impact === 'string' ? violation.impact : 'unknown';
    const id = typeof violation.id === 'string' ? violation.id : 'unknown';
    const nodes = Array.isArray(violation.nodes) ? violation.nodes.length : 0;
    rows.push(`<tr><td>${name}</td><td>${id}</td><td>${impact}</td><td>${nodes}</td></tr>`);
    if (impact === 'serious' || impact === 'critical') {
      blocking.push({ file: name, id, impact, nodes });
    }
  }
}

mkdirSync(reportsDir, { recursive: true });
const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>CONFORA accessibility aggregate</title></head>
<body>
<main>
<h1>Accessibility aggregate</h1>
<p>Serious and critical axe violations: ${blocking.length}</p>
<table>
<thead><tr><th>Report</th><th>Rule</th><th>Impact</th><th>Nodes</th></tr></thead>
<tbody>
${rows.join('\n') || '<tr><td colspan="4">No violations</td></tr>'}
</tbody>
</table>
</main>
</body>
</html>
`;
writeFileSync(join(reportsDir, 'index.html'), html);

if (blocking.length > 0) {
  for (const item of blocking) {
    console.error(`FAIL ${item.file} ${item.id} impact=${item.impact} nodes=${item.nodes}`);
  }
  process.exit(1);
}
console.log(`Accessibility aggregate passed. Report: tests/e2e/reports/index.html`);
