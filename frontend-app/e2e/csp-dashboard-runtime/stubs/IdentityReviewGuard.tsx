/**
 * Playwright F4-smoke / Vitest stub. The tracked base does not contain this guard.
 * Production builds do not apply this alias.
 */
import type { JSX, ReactNode } from "react";

export function IdentityReviewGuard({ children }: { readonly children: ReactNode }): JSX.Element {
  return <>{children}</>;
}
