import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist') continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      walk(full, out);
    } else if (name.endsWith('.ts') && !name.endsWith('.spec.ts')) {
      out.push(full);
    }
  }
  return out;
}

describe('provider boundary', () => {
  const src = join(__dirname, '..');

  it('keeps provider URLs inside the gateway and the mail adapter', () => {
    const hits: string[] = [];
    for (const file of walk(src)) {
      const text = readFileSync(file, 'utf8');
      if (text.includes('api.openai.com') && !file.endsWith('ai-provider.ts')) {
        hits.push(file);
      }
      if (text.includes('CERTIFICATION_AI_BASE_URL') || text.includes('CERTIFICATION_AI_API_KEY')) {
        hits.push(file);
      }
    }
    expect(hits).toEqual([]);
  });
});
