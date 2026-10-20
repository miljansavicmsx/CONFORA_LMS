/**
 * Playwright F4-smoke / Vitest stub for missing `@/lib/api-staff-cert-registry`.
 * Production must not ship a shim at `src/lib/api-staff-cert-registry.ts`.
 */

export async function fetchNestRegistryConfig(): Promise<{ mode: "dual" }> {
  return { mode: "dual" };
}

export function resolveNestEffectiveRegistryMode(_config: unknown): "dual" | "nest" {
  return "dual";
}
