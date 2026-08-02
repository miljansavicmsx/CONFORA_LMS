import type { InformationSignalPriority } from "./information-priority";
import { compareInformationPriority } from "./information-priority";

export interface PrioritizedPanelMeta {
  readonly id: string;
  readonly priority: InformationSignalPriority;
  readonly groupId?: string;
}

export function sortPanelsByPriority<T extends PrioritizedPanelMeta>(panels: readonly T[]): T[] {
  return [...panels].sort((a, b) => compareInformationPriority(a.priority, b.priority));
}

export function groupPanelsByGroupId<T extends PrioritizedPanelMeta>(panels: readonly T[]): Map<string, T[]> {
  const m = new Map<string, T[]>();
  for (const p of panels) {
    const g = p.groupId ?? "default";
    const arr = m.get(g) ?? [];
    arr.push(p);
    m.set(g, arr);
  }
  return m;
}

/**
 * Noise suppression for calm cockpit: drop BACKGROUND when mode is executive-style compact caps.
 */
export function filterNoise<T extends PrioritizedPanelMeta>(panels: readonly T[], suppressBackground: boolean): T[] {
  if (!suppressBackground) return [...panels];
  return panels.filter((p) => p.priority !== "BACKGROUND");
}
