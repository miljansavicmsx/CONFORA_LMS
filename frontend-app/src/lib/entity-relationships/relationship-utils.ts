import type { EntityRelationship } from "./relationship-types";

export function edgeFingerprint(e: EntityRelationship): string {
  return `${e.sourceType}:${e.sourceId}|${e.relationshipType}|${e.targetType}:${e.targetId}`;
}

export function dedupeEdges(edges: readonly EntityRelationship[]): EntityRelationship[] {
  const seen = new Set<string>();
  const out: EntityRelationship[] = [];
  for (const e of edges) {
    const k = edgeFingerprint(e);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(e);
  }
  return out;
}

export function mergeEdges(...groups: readonly (readonly EntityRelationship[] | undefined)[]): EntityRelationship[] {
  const acc: EntityRelationship[] = [];
  for (const g of groups) {
    if (!g) continue;
    acc.push(...g);
  }
  return dedupeEdges(acc);
}

export function neighbors(
  entityId: string,
  entityType: string,
  edges: readonly EntityRelationship[],
): { incoming: EntityRelationship[]; outgoing: EntityRelationship[] } {
  const incoming: EntityRelationship[] = [];
  const outgoing: EntityRelationship[] = [];
  for (const e of edges) {
    if (e.targetId === entityId && e.targetType === entityType) incoming.push(e);
    if (e.sourceId === entityId && e.sourceType === entityType) outgoing.push(e);
  }
  return { incoming, outgoing };
}

export function truncateIds(ids: readonly string[], max: number): { items: string[]; omitted: number } {
  if (ids.length <= max) return { items: [...ids], omitted: 0 };
  return { items: [...ids].slice(0, max), omitted: ids.length - max };
}
