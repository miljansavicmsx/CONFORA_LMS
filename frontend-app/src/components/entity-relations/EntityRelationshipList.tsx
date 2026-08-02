import { type JSX, useMemo } from "react";

import type { EntityRelationship } from "@/lib/entity-relationships/relationship-types";
import { dedupeEdges, neighbors } from "@/lib/entity-relationships/relationship-utils";

import { RelatedEntityCard } from "./RelatedEntityCard";

export function EntityRelationshipList({
  centerId,
  centerType,
  edges,
}: {
  readonly centerId: string;
  readonly centerType: string;
  readonly edges: readonly EntityRelationship[];
}): JSX.Element {
  const { incoming, outgoing } = useMemo(
    () => neighbors(centerId, centerType, dedupeEdges(edges)),
    [centerId, centerType, edges],
  );

  if (!incoming.length && !outgoing.length) {
    return (
      <p className="text-sm text-text-muted">
        Nema eksplicitnih veza u trenutnom API uzorku. Kada backend vrati reference ID-eve, ovdje se pojavljuju
        uzročno-posljedični linkovi.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {incoming.length ? (
        <section aria-labelledby="rel-in-label">
          <h3 id="rel-in-label" className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            Ulazni linkovi
          </h3>
          <ul className="mt-2 space-y-2">
            {incoming.map((e) => (
              <li key={e.sourceType + e.sourceId + e.relationshipType + e.targetId}>
                <RelatedEntityCard edge={e} direction="incoming" />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {outgoing.length ? (
        <section aria-labelledby="rel-out-label">
          <h3 id="rel-out-label" className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            Izlazni linkovi
          </h3>
          <ul className="mt-2 space-y-2">
            {outgoing.map((e) => (
              <li key={e.sourceType + e.sourceId + e.relationshipType + e.targetId}>
                <RelatedEntityCard edge={e} direction="outgoing" />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
