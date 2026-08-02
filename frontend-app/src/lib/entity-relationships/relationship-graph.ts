import type { EntityRelationship } from "./relationship-types";

export type LaidOutNode = {
  readonly id: string;
  readonly type: string;
  readonly label: string;
  /** 0 = upstream, 1 = focal, 2 = downstream */
  readonly column: number;
  readonly row: number;
  readonly keyRole: "center" | "source" | "target";
};

export type GraphLayoutResult = {
  readonly center: LaidOutNode;
  readonly nodes: LaidOutNode[];
  readonly edges: EntityRelationship[];
  readonly truncated: boolean;
  readonly omittedCount: number;
};

function shortLabel(type: string, id: string): string {
  const t = type.replaceAll("_", " ");
  if (id.length <= 14) return `${t}: ${id}`;
  return `${t}: ${id.slice(0, 6)}…${id.slice(-4)}`;
}

/**
 * Lightweight horizontal lineage: sources ← center → targets.
 * Not a general graph solver — optimised for clarity & responsiveness.
 */
export function buildHorizontalLineageLayout(
  center: { id: string; type: string; label?: string },
  edges: readonly EntityRelationship[],
  options?: { maxNodes?: number },
): GraphLayoutResult {
  const maxNodes = options?.maxNodes ?? 11;
  const centerNode: LaidOutNode = {
    id: center.id,
    type: center.type,
    label: center.label ?? shortLabel(center.type, center.id),
    column: 1,
    row: 0,
    keyRole: "center",
  };

  const sources = new Map<string, LaidOutNode>();
  const targets = new Map<string, LaidOutNode>();

  for (const e of edges) {
    if (e.targetId === center.id && e.targetType === center.type) {
      const k = `${e.sourceType}:${e.sourceId}`;
      if (!sources.has(k)) {
        sources.set(k, {
          id: e.sourceId,
          type: e.sourceType,
          label: e.label?.length ? e.label : shortLabel(e.sourceType, e.sourceId),
          column: 0,
          row: sources.size,
          keyRole: "source",
        });
      }
    }
    if (e.sourceId === center.id && e.sourceType === center.type) {
      const k = `${e.targetType}:${e.targetId}`;
      if (!targets.has(k)) {
        targets.set(k, {
          id: e.targetId,
          type: e.targetType,
          label: e.label?.length ? e.label : shortLabel(e.targetType, e.targetId),
          column: 2,
          row: targets.size,
          keyRole: "target",
        });
      }
    }
  }

  const maxSide = Math.max(1, Math.floor((maxNodes - 1) / 2));
  const srcArr = [...sources.values()].slice(0, maxSide);
  const tgtArr = [...targets.values()].slice(0, maxSide);
  const omitted =
    Math.max(0, sources.size - srcArr.length) + Math.max(0, targets.size - tgtArr.length);

  const laidSources = srcArr.map((n, i) => ({ ...n, row: i }));
  const laidTargets = tgtArr.map((n, i) => ({ ...n, row: i }));

  const allowed = new Set<string>([
    `${center.type}:${center.id}`,
    ...laidSources.map((n) => `${n.type}:${n.id}`),
    ...laidTargets.map((n) => `${n.type}:${n.id}`),
  ]);

  const filteredEdges = edges.filter((e) => {
    const s = `${e.sourceType}:${e.sourceId}`;
    const t = `${e.targetType}:${e.targetId}`;
    return allowed.has(s) && allowed.has(t);
  });

  const rowCount = Math.max(laidSources.length, laidTargets.length, 1);
  const midRow = Math.floor(rowCount / 2);
  const centerAdjusted = { ...centerNode, row: midRow };

  return {
    center: centerAdjusted,
    nodes: [...laidSources, centerAdjusted, ...laidTargets].sort((a, b) => {
      if (a.column !== b.column) return a.column - b.column;
      return a.row - b.row;
    }),
    edges: filteredEdges,
    truncated: omitted > 0,
    omittedCount: omitted,
  };
}

/** Textual summary for screen readers (WCAG). */
export function describeGraphLayout(layout: GraphLayoutResult): string {
  const { nodes, edges, truncated, omittedCount } = layout;
  const parts = [
    `Relationship graph with ${nodes.length} nodes and ${edges.length} edges.`,
    truncated ? `${omittedCount} related nodes omitted for clarity.` : "",
  ];
  return parts.filter(Boolean).join(" ");
}
