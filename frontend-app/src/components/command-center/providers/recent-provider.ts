import { Circle } from "lucide-react";

import type { RecentEntry } from "../command-center-store";
import type { CommandEntity, PersistedCommandEntity } from "../command-entity-types";
import { defaultIconForEntityType } from "../command-icon-map";
import { inferEntityTypeFromRoute } from "../command-navigation";

export function recentProvider(entries: readonly RecentEntry[]): CommandEntity[] {
  return entries.map((r, i) => enrichFromPersisted(r.entity, i));
}

function enrichFromPersisted(e: PersistedCommandEntity, ix: number): CommandEntity {
  const entityType = e.entityType ?? inferEntityTypeFromRoute(e.route);
  const Icon = defaultIconForEntityType(entityType);
  return {
    ...e,
    entityType,
    icon: Icon,
    source: "recent",
    resultBucket: "recent",
    subtitle: e.subtitle ?? `Nedavno posjećeno · #${ix + 1}`,
    tags: [...(e.tags ?? []), "recent"],
  };
}

export function placeholderRecentEntity(): CommandEntity {
  return {
    id: "recent:empty",
    entityType: "report",
    title: "Nema nedavnih stavki",
    workspace: "learning",
    route: "/dashboard",
    icon: Circle,
    source: "recent",
    resultBucket: "recent",
  };
}
