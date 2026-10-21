#!/usr/bin/env node
/**
 * Post the accessibility aggregate summary on the pull request.
 * Local runs without a token print the summary and exit 0.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const token = process.env.GITHUB_TOKEN ?? '';
const repository = process.env.GITHUB_REPOSITORY ?? '';
const pr = process.env.PR_NUMBER ?? '';
const reportPath = join(import.meta.dirname, '..', '..', 'tests', 'e2e', 'reports', 'index.html');

let summary = 'Accessibility aggregate report was not produced.';
try {
  const html = readFileSync(reportPath, 'utf8');
  const match = html.match(/Serious and critical axe violations: (\d+)/);
  summary = match
    ? `Accessibility aggregate: ${match[1]} serious or critical axe violation(s).`
    : 'Accessibility aggregate report is present.';
} catch {
  summary = 'Accessibility aggregate report is missing.';
}

console.log(summary);
if (!token || !repository || !pr) {
  console.log('PR comment skipped: GITHUB_TOKEN, GITHUB_REPOSITORY, or PR_NUMBER is unset.');
  process.exit(0);
}

const response = await fetch(`https://api.github.com/repos/${repository}/issues/${pr}/comments`, {
  method: 'POST',
  headers: {
    authorization: `Bearer ${token}`,
    accept: 'application/vnd.github+json',
    'content-type': 'application/json',
  },
  body: JSON.stringify({ body: summary }),
});
if (!response.ok) {
  console.error(`Pull request comment failed: HTTP ${response.status}`);
  process.exit(1);
}
console.log(`Commented on pull request #${pr}.`);
