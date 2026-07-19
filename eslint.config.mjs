import path from 'node:path';
import { fileURLToPath } from 'node:url';

import createConforaEslintConfig from '@confora/config/eslint';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default createConforaEslintConfig(rootDir);
