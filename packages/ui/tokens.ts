/**
 * CONFORA design-system color tokens (canonical hex values).
 * WCAG contrast checks: tools/a11y/contrast-check.ts
 * @see docs/design-system/CONTRAST.md
 */

export type ColorTokenRole = 'foreground' | 'background' | 'accent';

export type ColorTokenDef = {
  readonly id: string;
  readonly hex: string;
  readonly role: ColorTokenRole;
  readonly label: string;
};

/** All palette entries used in Tailwind classes (`text-*`, `bg-*`, borders as UI). */
export const colorTokens = {
  'text.primary': { id: 'text.primary', hex: '#F8FAFC', role: 'foreground', label: 'Primary text' },
  'text.secondary': { id: 'text.secondary', hex: '#94A3B8', role: 'foreground', label: 'Secondary text' },
  /** ≥4.5:1 on surface.primary / surface.secondary (WCAG 1.4.3). */
  'text.muted': { id: 'text.muted', hex: '#8A9BB2', role: 'foreground', label: 'Muted text' },
  'surface.primary': { id: 'surface.primary', hex: '#0F172A', role: 'background', label: 'App shell' },
  'surface.secondary': { id: 'surface.secondary', hex: '#1E293B', role: 'background', label: 'Panel' },
  'surface.tertiary': { id: 'surface.tertiary', hex: '#334155', role: 'background', label: 'Elevated panel' },
  'brand': { id: 'brand', hex: '#0EA5E9', role: 'accent', label: 'Brand cerulean' },
  /** Filled buttons / badges with white label (≥4.5:1). */
  'brand.solid': { id: 'brand.solid', hex: '#0369A1', role: 'accent', label: 'Brand solid (on-brand text)' },
  'brand.hover': { id: 'brand.hover', hex: '#0284C7', role: 'accent', label: 'Brand hover' },
  'white': { id: 'white', hex: '#FFFFFF', role: 'foreground', label: 'White' },
  'confora.ink': { id: 'confora.ink', hex: '#0F172A', role: 'foreground', label: 'Marketing ink' },
  'confora.surface': { id: 'confora.surface', hex: '#F8FAFC', role: 'background', label: 'Marketing surface' },
  'success': { id: 'success', hex: '#10B981', role: 'accent', label: 'Success' },
  'warning': { id: 'warning', hex: '#F59E0B', role: 'accent', label: 'Warning' },
  'error': { id: 'error', hex: '#EF4444', role: 'accent', label: 'Error' },
  'ai': { id: 'ai', hex: '#8B5CF6', role: 'accent', label: 'AI violet' },
  'sky.300': { id: 'sky.300', hex: '#7DD3FC', role: 'foreground', label: 'Learning eyebrow' },
  'sky.400': { id: 'sky.400', hex: '#38BDF8', role: 'foreground', label: 'Learning accent' },
  'orange.200': { id: 'orange.200', hex: '#FED7AA', role: 'foreground', label: 'System eyebrow' },
  'orange.400': { id: 'orange.400', hex: '#FB923C', role: 'foreground', label: 'System accent' },
  'violet.200': { id: 'violet.200', hex: '#DDD6FE', role: 'foreground', label: 'AI eyebrow' },
  'violet.300': { id: 'violet.300', hex: '#C4B5FD', role: 'foreground', label: 'AI accent text' },
  'violet.400': { id: 'violet.400', hex: '#A78BFA', role: 'foreground', label: 'AI accent' },
  'violet.800': { id: 'violet.800', hex: '#5B21B6', role: 'foreground', label: 'AI disclosure emphasis' },
  'violet.900': { id: 'violet.900', hex: '#4C1D95', role: 'foreground', label: 'AI badge text' },
  'emerald.200': { id: 'emerald.200', hex: '#A7F3D0', role: 'foreground', label: 'Trust eyebrow' },
  'emerald.400': { id: 'emerald.400', hex: '#34D399', role: 'foreground', label: 'Trust accent' },
  'rose.100': { id: 'rose.100', hex: '#FFE4E6', role: 'foreground', label: 'Risk eyebrow' },
  'rose.400': { id: 'rose.400', hex: '#FB7185', role: 'foreground', label: 'Risk accent' },
  'amber.100': { id: 'amber.100', hex: '#FEF3C7', role: 'foreground', label: 'Warning eyebrow' },
  'amber.400': { id: 'amber.400', hex: '#FBBF24', role: 'foreground', label: 'Warning accent' },
  'red.100': { id: 'red.100', hex: '#FEE2E2', role: 'foreground', label: 'Danger eyebrow' },
  'red.400': { id: 'red.400', hex: '#F87171', role: 'foreground', label: 'Danger accent' },
  'slate.800': { id: 'slate.800', hex: '#1E293B', role: 'background', label: 'Slate 800' },
  'slate.900': { id: 'slate.900', hex: '#0F172A', role: 'background', label: 'Slate 900' },
  'slate.950': { id: 'slate.950', hex: '#020617', role: 'background', label: 'Slate 950' },
  'indigo.600': { id: 'indigo.600', hex: '#4F46E5', role: 'background', label: 'Legacy UI button' },
  'indigo.700': { id: 'indigo.700', hex: '#4338CA', role: 'background', label: 'Legacy UI button hover' },
  'violet.50': { id: 'violet.50', hex: '#F5F3FF', role: 'background', label: 'AI disclosure bg' },
  'slate.800.text': { id: 'slate.800.text', hex: '#1E293B', role: 'foreground', label: 'AI disclosure body' },
} as const satisfies Record<string, ColorTokenDef>;

export type ColorTokenId = keyof typeof colorTokens;

export const foregroundTokenIds = Object.values(colorTokens)
  .filter((t) => t.role === 'foreground' || t.role === 'accent')
  .map((t) => t.id as ColorTokenId);

export const backgroundTokenIds = Object.values(colorTokens)
  .filter((t) => t.role === 'background' || t.role === 'accent')
  .map((t) => t.id as ColorTokenId);

export type TextCategory = 'normal' | 'large' | 'ui';

/** Documented semantic pairs (design intent). */
export const documentedPairs = [
  { foreground: 'text.primary', background: 'surface.primary', textCategory: 'normal', usage: 'Body on app shell' },
  { foreground: 'text.secondary', background: 'surface.primary', textCategory: 'normal', usage: 'Supporting copy' },
  { foreground: 'text.muted', background: 'surface.primary', textCategory: 'normal', usage: 'Captions / meta' },
  { foreground: 'text.primary', background: 'surface.secondary', textCategory: 'normal', usage: 'Body on panels' },
  { foreground: 'text.secondary', background: 'surface.secondary', textCategory: 'normal', usage: 'Panel secondary' },
  { foreground: 'white', background: 'brand.solid', textCategory: 'normal', usage: 'Primary CTA' },
  { foreground: 'brand', background: 'surface.primary', textCategory: 'large', usage: 'Brand links / eyebrows' },
] as const satisfies ReadonlyArray<{
  foreground: ColorTokenId;
  background: ColorTokenId;
  textCategory: TextCategory;
  usage: string;
}>;
