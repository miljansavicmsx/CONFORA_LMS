/**
 * WCAG 2.2 contrast gate for canonical design tokens.
 *
 * 1.4.3 contrast (minimum): normal text 4.5:1, large text 3:1.
 * 1.4.11 non-text contrast: UI pairs 3:1.
 * Thresholds are the documented pair category. They are not configurable.
 */
import { colorTokens, documentedPairs, type ColorTokenId } from '../../packages/ui/tokens.ts';

const THRESHOLD: Record<'normal' | 'large' | 'ui', number> = {
  normal: 4.5,
  large: 3,
  ui: 3,
};

function linearize(channel: number): number {
  const srgb = channel / 255;
  return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(hex: string): number {
  const value = Number.parseInt(hex.slice(1), 16);
  const red = linearize((value >> 16) & 0xff);
  const green = linearize((value >> 8) & 0xff);
  const blue = linearize(value & 0xff);
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

export function contrastRatio(foregroundHex: string, backgroundHex: string): number {
  const foreground = relativeLuminance(foregroundHex);
  const background = relativeLuminance(backgroundHex);
  const lighter = Math.max(foreground, background);
  const darker = Math.min(foreground, background);
  return (lighter + 0.05) / (darker + 0.05);
}

/** WCAG reports contrast to two decimal places. */
export function reportedContrast(ratio: number): number {
  return Math.round(ratio * 100) / 100;
}

function hexOf(id: ColorTokenId): string {
  return colorTokens[id].hex;
}

type PairResult = {
  foreground: string;
  background: string;
  textCategory: 'normal' | 'large' | 'ui';
  usage: string;
  ratio: number;
  required: number;
  pass: boolean;
};

function evaluate(): PairResult[] {
  return documentedPairs.map((pair) => {
    const ratio = reportedContrast(contrastRatio(hexOf(pair.foreground), hexOf(pair.background)));
    const required = THRESHOLD[pair.textCategory];
    return {
      foreground: pair.foreground,
      background: pair.background,
      textCategory: pair.textCategory,
      usage: pair.usage,
      ratio,
      required,
      pass: ratio >= required,
    };
  });
}

const isDirectRun = process.argv[1]?.includes('contrast-check');

if (isDirectRun) {
  const results = evaluate();
  for (const result of results) {
    const status = result.pass ? 'PASS' : 'FAIL';
    console.log(
      `${status} ${result.ratio.toFixed(2)}:1 (need ${result.required}:1, ${result.textCategory}) ${result.foreground} on ${result.background} — ${result.usage}`,
    );
  }
  const failures = results.filter((result) => !result.pass);
  if (failures.length > 0) {
    console.error(`Contrast gate failed: ${failures.length} pair(s) below WCAG AA.`);
    process.exitCode = 1;
  } else {
    console.log(
      `Contrast gate passed: ${results.length} documented pairs meet WCAG 1.4.3 / 1.4.11.`,
    );
  }
}
