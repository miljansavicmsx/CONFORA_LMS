import type { DataDensityMode } from "@/lib/data-density";

/**
 * Panel cap hints — fewer items in executive view to reduce noise.
 */
export function panelItemCapForPriority(mode: DataDensityMode, baseCap: number): number {
  switch (mode) {
    case "compact":
      return Math.max(2, Math.round(baseCap * 0.45));
    case "comfortable":
      return Math.max(3, Math.round(baseCap * 0.72));
    default:
      return baseCap;
  }
}
