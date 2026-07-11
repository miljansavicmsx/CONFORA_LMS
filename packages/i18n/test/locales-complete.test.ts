import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { A11Y_KEYS, SUPPORTED_LOCALES } from '../src/keys';

const localesDir = join(__dirname, '..', 'locales');
const NAMESPACES = ['a11y', 'auth', 'shell', 'candidatePortal', 'certificationStaff', 'navigation', 'dashboard', 'common'] as const;

function flattenKeys(value: unknown, prefix = ''): string[] {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return prefix ? [prefix] : [];
  }
  const record = value as Record<string, unknown>;
  const keys: string[] = [];
  for (const [key, nested] of Object.entries(record)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (nested !== null && typeof nested === 'object' && !Array.isArray(nested)) {
      keys.push(...flattenKeys(nested, path));
    } else {
      keys.push(path);
    }
  }
  return keys;
}

describe('a11y locale files', () => {
  for (const locale of SUPPORTED_LOCALES) {
    describe(locale, () => {
      const filePath = join(localesDir, locale, 'a11y.json');
      const messages = JSON.parse(readFileSync(filePath, 'utf8')) as Record<string, string>;

      for (const key of A11Y_KEYS) {
        it(`defines "${key}"`, () => {
          expect(messages[key]).toBeDefined();
          expect(String(messages[key]).trim().length).toBeGreaterThan(0);
        });
      }

      it('has no extra keys beyond the canonical set', () => {
        const extras = Object.keys(messages).filter((k) => !(A11Y_KEYS as readonly string[]).includes(k));
        expect(extras).toEqual([]);
      });
    });
  }
});

describe('namespace locale parity (en canonical)', () => {
  for (const ns of NAMESPACES) {
    if (ns === 'a11y') continue;
    const enKeys = flattenKeys(JSON.parse(readFileSync(join(localesDir, 'en', `${ns}.json`), 'utf8')));
    for (const locale of SUPPORTED_LOCALES) {
      if (locale === 'en') continue;
      it(`${ns}.${locale} matches en key set`, () => {
        const localeKeys = flattenKeys(
          JSON.parse(readFileSync(join(localesDir, locale, `${ns}.json`), 'utf8')),
        );
        expect(localeKeys.sort()).toEqual(enKeys.sort());
      });
    }
  }
});
