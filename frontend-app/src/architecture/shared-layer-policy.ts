/**
 * Shared layer policy — what belongs in lib/ vs feature folders.
 */

export const SHARED_LAYER_MUST_BE = [
  "Pure functions or hooks with stable interfaces",
  "API client wrappers and DTO types aligned with backend contracts",
  "Reusable formatting, guards, ABAC helpers (read-only semantics)",
] as const;

export const SHARED_LAYER_MUST_NOT_BE = [
  "Feature-specific JSX (belongs in components/ or pages/)",
  "One-off route strings only used by a single page (colocate or constants module per domain)",
  "Mutable cross-feature singletons (prefer React Query cache / context)",
] as const;

/** Lib subfolders treated as domain modules (prefer imports from their public index if present). */
export const SHARED_LAYER_DOMAIN_MODULES: readonly string[] = [
  "lib/knowledge",
  "lib/digital-twin",
  "lib/operations-intelligence",
  "lib/entity-relationships",
  "lib/audit-readiness",
  "lib/workspace-continuity",
  "lib/information-architecture",
  "lib/observability-model",
];
