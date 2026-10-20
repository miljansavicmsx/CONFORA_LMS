#!/usr/bin/env node
/**
 * Lighthouse accessibility gate. Scores below .lighthouserc.json minAccessibilityScore fail.
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

const configPath = join(import.meta.dirname, '..', '..', '.lighthouserc.json');
const config = JSON.parse(readFileSync(configPath, 'utf8'));
const minimum = Number(config.minAccessibilityScore);
if (!Number.isFinite(minimum) || minimum < 95 || minimum > 100) {
  console.error('Lighthouse config minAccessibilityScore must stay between 95 and 100.');
  process.exit(1);
}
const urls = Array.isArray(config.urls) ? config.urls : [];
if (urls.length === 0) {
  console.error('Lighthouse config has no URLs.');
  process.exit(1);
}

let failed = false;
for (const entry of urls) {
  const url = typeof entry.url === 'string' ? entry.url : '';
  const label = typeof entry.label === 'string' ? entry.label : url;
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless', '--no-sandbox'] });
  try {
    const result = await lighthouse(url, {
      port: chrome.port,
      onlyCategories: ['accessibility'],
      output: 'json',
      logLevel: 'error',
    });
    const score = Math.round((result?.lhr?.categories?.accessibility?.score ?? 0) * 100);
    const pass = score >= minimum;
    console.log(`${pass ? 'PASS' : 'FAIL'} ${score} (need ${minimum}) ${label} ${url}`);
    if (!pass) {
      failed = true;
    }
  } catch (error) {
    failed = true;
    console.error(
      `FAIL ${label} ${url}: ${error instanceof Error ? error.message : String(error)}`,
    );
  } finally {
    await chrome.kill();
  }
}

if (failed) {
  process.exit(1);
}
console.log('Lighthouse accessibility gate passed.');
