import type { DataDensityMode } from "@/lib/data-density";

import { panelItemCapForPriority } from "./information-density";

export function sectionSpacingClass(mode: DataDensityMode): string {
  switch (mode) {
    case "compact":
      return "space-y-3";
    case "comfortable":
      return "space-y-6";
    default:
      return "space-y-8";
  }
}

export function gridColumnsForMode(mode: DataDensityMode): string {
  switch (mode) {
    case "compact":
      return "grid gap-3 sm:grid-cols-2";
    case "comfortable":
      return "grid gap-4 md:grid-cols-2";
    default:
      return "grid gap-6 lg:grid-cols-2";
  }
}

export { panelItemCapForPriority };
