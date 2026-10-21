/**
 * Playwright F4-smoke / Vitest stub for missing education charts.
 * Production must not ship a shim at `src/components/education/EducationCharts.tsx`.
 */
import type { JSX } from "react";

export function EducationCharts(): JSX.Element {
  return <div data-testid="education-charts-stub" />;
}
