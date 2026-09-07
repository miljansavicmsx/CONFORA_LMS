'use strict';

const fs = require('node:fs');
const path = require('node:path');

const stylesPath = path.join(__dirname, 'dist', 'styles.css');

if (!fs.existsSync(stylesPath)) {
  console.error(
    'C3-S11 MD17 contract failed: packages/ui/dist/styles.css is missing. Run npm run build in packages/ui first.',
  );
  process.exit(1);
}

const stat = fs.statSync(stylesPath);
if (!stat.isFile() || stat.size < 1) {
  console.error('C3-S11 MD17 contract failed: packages/ui/dist/styles.css is empty.');
  process.exit(1);
}

console.log('C3-S11 MD17 contract passed: packages/ui/dist/styles.css present.');
