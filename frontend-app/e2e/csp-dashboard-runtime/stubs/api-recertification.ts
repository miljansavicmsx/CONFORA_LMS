/**
 * Playwright F4-smoke / Vitest stub for missing `@/lib/api-recertification`.
 * Production must not ship a shim at `src/lib/api-recertification.ts`.
 */

export type RecertificationCase = Record<string, unknown>;

export async function fetchMyRecertificationCase(): Promise<RecertificationCase | null> {
  return null;
}

export async function listMyRecertifications(): Promise<RecertificationCase[]> {
  return [];
}

export async function patchRecertificationInputs(): Promise<RecertificationCase | null> {
  return null;
}

export async function submitRecertification(): Promise<RecertificationCase | null> {
  return null;
}

export async function submitRecertificationForCertificate(): Promise<RecertificationCase | null> {
  return null;
}
