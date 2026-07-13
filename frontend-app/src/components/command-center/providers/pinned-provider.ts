import { Circle } from "lucide-react";

import type { PinnedEntry } from "../command-center-store";
import type { CommandEntity, PersistedCommandEntity } from "../command-entity-types";
import { defaultIconForEntityType } from "../command-icon-map";
import { inferEntityTypeFromRoute } from "../command-navigation";

export function pinnedProvider(entries: readonly PinnedEntry[]): CommandEntity[] {
  return entries.map((p, i) => enrichFromPersisted(p.entity, i));
}

function enrichFromPersisted(e: PersistedCommandEntity, ix: number): CommandEntity {
  const entityType = e.entityType ?? inferEntityTypeFromRoute(e.route);
  const Icon = defaultIconForEntityType(entityType);
  return {
    ...e,
    entityType,
    icon: Icon,
    source: "pinned",
    resultBucket: "pinned",
    subtitle: e.subtitle ?? `Prikvačeno · #${ix + 1}`,
    tags: [...(e.tags ?? []), "pinned"],
  };
}

export function placeholderPinnedEntity(): CommandEntity {
  return {
    id: "pinned:empty",
    entityType: "report",
    title: "Nema prikvačenih stavki",
    subtitle: "Koristi pin na rezultatu za brzi pristup",
    workspace: "learning",
    route: "/dashboard",
    icon: Circle,
    source: "pinned",
    resultBucket: "pinned",
  };
}
