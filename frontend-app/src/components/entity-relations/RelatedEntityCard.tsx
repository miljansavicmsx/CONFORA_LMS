import { ChevronRight } from "lucide-react";
import { type JSX } from "react";
import { Link } from "react-router";

import { cn } from "@/lib/utils";
import type { EntityRelationship } from "@/lib/entity-relationships/relationship-types";
import { presetForRelationship } from "@/lib/entity-relationships/relationship-badges";
import { resolveEntityNavigation } from "@/lib/entity-relationships/relationship-navigation";

import { RelationshipBadge } from "./RelationshipBadge";

export function RelatedEntityCard({
  edge,
  direction,
}: {
  readonly edge: EntityRelationship;
  readonly direction: "incoming" | "outgoing";
}): JSX.Element {
  const isOut = direction === "outgoing";
  const entityType = isOut ? edge.targetType : edge.sourceType;
  const entityId = isOut ? edge.targetId : edge.sourceId;
  const preset = presetForRelationship(edge);
  const nav = resolveEntityNavigation(entityType, entityId);

  const body = (
    <div className="flex flex-1 flex-col gap-1">
      <div className="flex flex-wrap items-center gap-2">
        <RelationshipBadge label={preset.label} tone={preset.tone} />
        <span className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">{entityType}</span>
      </div>
      <p className="font-mono text-xs text-text-primary">{entityId}</p>
      {edge.label ? <p className="text-xs text-text-secondary">{edge.label}</p> : null}
    </div>
  );

  const framed = (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border border-border/45 bg-surface-secondary/35 px-3 py-2 ring-1 ring-white/[0.03] transition-colors",
        nav.kind !== "none" && "hover:border-brand/35 hover:bg-surface-secondary/55",
      )}
    >
      {direction === "incoming" ? (
        <ChevronRight className="h-4 w-4 shrink-0 rotate-180 text-text-muted" aria-hidden />
      ) : (
        <ChevronRight className="h-4 w-4 shrink-0 text-text-muted" aria-hidden />
      )}
      {body}
    </div>
  );

  if (nav.kind === "internal") {
    return (
      <Link to={nav.to} className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50">
        {framed}
      </Link>
    );
  }
  if (nav.kind === "external") {
    return (
      <a
        href={nav.href}
        className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
        rel="noopener noreferrer"
      >
        {framed}
      </a>
    );
  }

  return (
    <div
      className="block rounded-xl"
      title={nav.kind === "search" ? `Pretraži: ${nav.query}` : undefined}
    >
      {framed}
    </div>
  );
}
