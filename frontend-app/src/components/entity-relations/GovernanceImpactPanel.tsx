import { type JSX, useMemo } from "react";

import type { EntityRelationship, RelationshipType } from "@/lib/entity-relationships/relationship-types";
import { presetForRelationship } from "@/lib/entity-relationships/relationship-badges";

import { RelationshipBadge } from "./RelationshipBadge";

export function GovernanceImpactPanel({
  edges,
}: {
  readonly edges: readonly EntityRelationship[];
}): JSX.Element {
  const stats = useMemo(() => {
    const m = new Map<RelationshipType, number>();
    for (const e of edges) {
      m.set(e.relationshipType, (m.get(e.relationshipType) ?? 0) + 1);
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [edges]);

  const hot = useMemo(
    () =>
      edges.filter(
        (e) =>
          e.relationshipType === "BLOCKED_BY" ||
          e.relationshipType === "ESCALATED_TO" ||
          (e.severity !== undefined && ["HIGH", "CRITICAL"].includes(String(e.severity).toUpperCase())),
      ),
    [edges],
  );

  return (
    <section
      aria-label="Governance presjek"
      className="space-y-3 rounded-xl border border-border/45 bg-black/20 p-4 ring-1 ring-white/[0.04]"
    >
      <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">Utjecaj i pokrivenost</h3>
      <div className="flex flex-wrap gap-2">
        {stats.slice(0, 8).map(([k, c]) => {
          const p = presetForRelationship({ relationshipType: k });
          return <RelationshipBadge key={k} label={`${p.label} · ${c}`} tone={p.tone} />;
        })}
      </div>
      {hot.length ? (
        <div>
          <p className="text-[11px] font-semibold uppercase text-rose-200">Prioritet</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-text-secondary">
            {hot.slice(0, 6).map((e) => (
              <li key={e.sourceId + e.targetId + e.relationshipType}>
                <span className="font-medium text-text-primary">{e.relationshipType}</span>{" "}
                <span className="font-mono text-xs">{e.sourceId}</span> →{" "}
                <span className="font-mono text-xs">{e.targetId}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-text-muted">Nema eksplicitnih blokada ili kritičnih oznaka u ovom uzorku.</p>
      )}
    </section>
  );
}
