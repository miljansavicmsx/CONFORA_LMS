/**
 * Playwright F4-smoke / Vitest stub for the missing identity-review page.
 * Production must not ship a shim at `src/pages/admin/IdentityReviewPage.tsx`.
 */
import type { JSX } from "react";

export default function IdentityReviewPage(): JSX.Element {
  return <h1>Identity review</h1>;
}
