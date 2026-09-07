'use strict';

const fs = require('node:fs');
const path = require('node:path');

const packageRoot = __dirname;
const required = [
  path.join(packageRoot, 'dist', 'index.js'),
  path.join(packageRoot, 'dist', 'react.js'),
];

for (const target of required) {
  if (!fs.existsSync(target)) {
    console.error(
      `C3-S11 i18n dist contract failed: missing ${path.relative(packageRoot, target)}. Run npm run build in packages/i18n first.`,
    );
    process.exit(1);
  }
  if (fs.statSync(target).size < 1) {
    console.error(`C3-S11 i18n dist contract failed: empty ${path.relative(packageRoot, target)}.`);
    process.exit(1);
  }
}

console.log('C3-S11 MD15/MD16 contract passed: packages/i18n/dist/index.js and react.js present.');
