/** Adaptive enterprise density (UI hints only). */

export type DataDensityMode = "compact" | "comfortable" | "analytical";

export function dataDensityFromUserPreference(pref?: string | null): DataDensityMode {
  const p = (pref ?? "").toLowerCase();
  if (p === "executive" || p === "compact") return "compact";
  if (p === "analyst" || p === "analytical") return "analytical";
  return "comfortable";
}

export function densityProseClass(mode: DataDensityMode): string {
  switch (mode) {
    case "compact":
      return "text-xs leading-snug";
    case "analytical":
      return "text-sm leading-relaxed tabular-nums";
    default:
      return "text-sm leading-normal";
  }
}

export function densityPaddingClass(mode: DataDensityMode): string {
  switch (mode) {
    case "compact":
      return "p-3";
    case "analytical":
      return "p-5";
    default:
      return "p-4";
  }
}
