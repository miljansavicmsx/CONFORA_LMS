import type { EntityRelationship } from "./relationship-types";
import { dedupeEdges, mergeEdges, neighbors } from "./relationship-utils";

export function buildContextSubgraph(
  centerId: string,
  centerType: string,
  edges: readonly EntityRelationship[],
): EntityRelationship[] {
  const { incoming, outgoing } = neighbors(centerId, centerType, edges);
  return dedupeEdges([...incoming, ...outgoing]);
}

export function collapseParallelEdges(edges: readonly EntityRelationship[]): EntityRelationship[] {
  return dedupeEdges(edges);
}

export function attachWorkflowHints(
  edges: readonly EntityRelationship[],
  workflowStateByEntityKey: ReadonlyMap<string, string>,
): EntityRelationship[] {
  return edges.map((e) => {
    const k = `${e.sourceType}:${e.sourceId}`;
    const ws = workflowStateByEntityKey.get(k);
    if (!ws) return e;
    return { ...e, workflowState: ws };
  });
}

export function unionGraphs(...graphs: readonly EntityRelationship[][]): EntityRelationship[] {
  return mergeEdges(...graphs);
}
