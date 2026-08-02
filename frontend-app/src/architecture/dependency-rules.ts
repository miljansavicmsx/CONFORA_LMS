/**
 * Phase J — allowed dependency directions (documentation + future lint seeds).
 * “from → to” means code in `from` may import from `to`.
 */

export const ARCHITECTURE_ALLOWED_DEPENDENCY_EDGES: readonly {
  readonly from: string;
  readonly to: string;
  readonly rationale: string;
}[] = [
  { from: "pages/", to: "components/", rationale: "Pages compose feature and shell components." },
  { from: "pages/", to: "lib/", rationale: "Pages use domain helpers and API clients." },
  { from: "pages/", to: "design-system/", rationale: "Pages use approved primitives." },
  { from: "components/", to: "lib/", rationale: "UI may call pure logic and hooks backed by lib." },
  { from: "components/", to: "design-system/", rationale: "UI uses design system first." },
  { from: "lib/", to: "lib/", rationale: "Internal lib cohesion; avoid pages→pages." },
  { from: "design-system/", to: "lib/utils", rationale: "Primitives may use cn + tokens only." },
];

/** Patterns that should fail review / future ESLint. */
export const ARCHITECTURE_FORBIDDEN_IMPORT_PATTERNS: readonly string[] = [
  "lib/** → pages/**",
  "design-system/** → components/** (feature)",
  "components/command-center/** → pages/**",
  "knowledge/** → certification/** (feature folder coupling — use lib/knowledge contracts)",
];
