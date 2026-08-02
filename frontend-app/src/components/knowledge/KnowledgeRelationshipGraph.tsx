import { useReducedMotion } from "framer-motion";
import { memo, useCallback, useMemo, useState, type JSX, type KeyboardEvent } from "react";

import { EnterpriseSectionHeader } from "@/design-system";
import { cn } from "@/lib/utils";
import type { KnowledgeGraph, KnowledgeGraphEdge, KnowledgeGraphNode } from "@/lib/knowledge-graph/knowledge-graph-types";

const MAX_TOTAL_NODES = 28;
const PER_CLUSTER_CAP = 8;

function kindHr(kind: KnowledgeGraphNode["kind"]): string {
  switch (kind) {
    case "clause":
      return "klauzula";
    case "evidence":
      return "dokaz";
    case "workflow":
      return "workflow";
    case "governance":
      return "upravljanje";
    case "cert_chain":
      return "certifikacijski lanac";
    default:
      return String(kind);
  }
}

function nodeAria(n: KnowledgeGraphNode): string {
  return `${n.label}, ${kindHr(n.kind)}. Povezani standard ili klaster: ${n.clusterId}. Heuristička ozbiljnost ${n.severity}, povjerenje ${n.trust}.`;
}

function edgeAria(e: KnowledgeGraphEdge, nodesById: ReadonlyMap<string, KnowledgeGraphNode>): string {
  const a = nodesById.get(e.from)?.label ?? e.from;
  const b = nodesById.get(e.to)?.label ?? e.to;
  return `Veza od ${a} do ${b}. Tip: ${e.label}.`;
}

export const KnowledgeGraphTextualList = memo(function KnowledgeGraphTextualList({
  graph,
  visibleNodeIds,
  edgeLimit = 40,
}: {
  readonly graph: KnowledgeGraph;
  readonly visibleNodeIds: ReadonlySet<string>;
  readonly edgeLimit?: number;
}): JSX.Element {
  const nodesById = useMemo(() => new Map(graph.nodes.map((n) => [n.id, n] as const)), [graph.nodes]);
  const nodes = useMemo(
    () => graph.nodes.filter((n) => visibleNodeIds.has(n.id)),
    [graph.nodes, visibleNodeIds],
  );
  const edges = useMemo(() => {
    return graph.edges.filter((e) => visibleNodeIds.has(e.from) && visibleNodeIds.has(e.to)).slice(0, edgeLimit);
  }, [graph.edges, visibleNodeIds, edgeLimit]);

  return (
    <div className="mt-4 rounded-xl border border-border/40 bg-surface-secondary/20 p-3 text-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Tekstualni prikaz grafa</p>
      <ul className="mt-2 max-h-[min(40vh,260px)] list-none space-y-2 overflow-y-auto pr-1" aria-label="Lista čvorova knowledge grafa">
        {nodes.map((n) => (
          <li key={n.id} className="rounded-lg border border-border/30 bg-surface-primary/15 px-2 py-1.5 text-text-secondary">
            <span className="font-medium text-text-primary">{n.label}</span>
            {n.sublabel ? <span className="block text-xs text-text-muted">{n.sublabel}</span> : null}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs font-semibold uppercase text-text-muted">Veze (ograničeno)</p>
      <ul className="mt-1 max-h-40 list-none space-y-1 overflow-y-auto text-xs text-text-muted" aria-label="Lista veza knowledge grafa">
        {edges.map((e) => (
          <li key={e.id}>{edgeAria(e, nodesById)}</li>
        ))}
      </ul>
    </div>
  );
});

function KnowledgeRelationshipGraphInner({ graph }: { readonly graph: KnowledgeGraph }): JSX.Element {
  const reduceMotion = useReducedMotion();
  const nodesById = useMemo(() => new Map(graph.nodes.map((n) => [n.id, n] as const)), [graph.nodes]);

  const clusterKeys = useMemo(() => [...graph.clusters.keys()].sort(), [graph.clusters]);

  const [openClusters, setOpenClusters] = useState<ReadonlySet<string>>(() => {
    const init = new Set(clusterKeys.slice(0, 2));
    return init;
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { visibleNodes, visibleIds } = useMemo(() => {
    const picked: KnowledgeGraphNode[] = [];
    const ids = new Set<string>();
    for (const ck of clusterKeys) {
      const members = graph.clusters.get(ck) ?? [];
      const open = openClusters.has(ck);
      const cap = open ? PER_CLUSTER_CAP : Math.min(2, PER_CLUSTER_CAP);
      let added = 0;
      for (const mid of members) {
        if (added >= cap || picked.length >= MAX_TOTAL_NODES) break;
        const n = nodesById.get(mid);
        if (!n) continue;
        picked.push(n);
        ids.add(n.id);
        added += 1;
      }
    }
    return { visibleNodes: picked, visibleIds: ids };
  }, [clusterKeys, graph.clusters, nodesById, openClusters]);

  const summarySr = useMemo(() => {
    return `Knowledge graf: ukupno ${graph.nodes.length} čvorova i ${graph.edges.length} veza. Prikazano ${visibleNodes.length} čvorova u ograničenom prikazu. Telemetrija: sirovi dokazi ${graph.telemetry.orphanEvidence}, nerazriješene veze ${graph.telemetry.unresolvedRelationships}.`;
  }, [graph.nodes.length, graph.edges.length, graph.telemetry, visibleNodes.length]);

  const toggleCluster = useCallback((key: string) => {
    setOpenClusters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const onNodeKey = useCallback(
    (e: KeyboardEvent, id: string) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setSelectedId(id);
      }
    },
    [],
  );

  return (
    <div
      className="rounded-2xl border border-border/50 bg-surface-primary/25 p-4"
      role="region"
      aria-label="Knowledge graph — ograničeni vizualni i tekstualni prikaz"
    >
      <p className="sr-only" id="knowledge-graph-sr-summary">
        {summarySr}
      </p>
      <EnterpriseSectionHeader
        title="Knowledge graph (lagani prikaz)"
        description={`Čvorovi u prikazu: ${visibleNodes.length} od ${graph.nodes.length}. Bridovi ukupno: ${graph.edges.length}. Klasteri se mogu proširiti tipkovnicom.`}
        titleLevel="h3"
      />
      <p className="mt-2 text-sm text-text-secondary" aria-hidden>
        Vizualni prikaz koristi samo boju ruba za heurističku ozbiljnost; puni opis čvora čitač zaslona dobiva u tekstualnom popisu ispod.
      </p>

      <div className="mt-3 space-y-2" role="group" aria-label="Klasteri standarda i modula">
        {clusterKeys.map((ck) => {
          const open = openClusters.has(ck);
          const count = (graph.clusters.get(ck) ?? []).length;
          return (
            <div key={ck} className="rounded-lg border border-border/35 bg-surface-secondary/20 px-2 py-1">
              <button
                type="button"
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-xs font-semibold outline-none focus-visible:ring-2 focus-visible:ring-brand",
                  reduceMotion ? "" : "motion-safe:transition-colors",
                )}
                aria-expanded={open}
                onClick={() => toggleCluster(ck)}
                aria-label={`Klaster ${ck}, ${count} čvorova. ${open ? "Smanjen prikaz" : "Proširi prikaz"}.`}
              >
                <span>Klaster {ck}</span>
                <span className="text-[10px] font-normal text-text-muted">{count} čvorova</span>
              </button>
            </div>
          );
        })}
      </div>

      <ul
        className="mt-4 grid max-h-[320px] list-none grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3 md:grid-cols-4"
        aria-label="Vizualni čvorovi grafa"
      >
        {visibleNodes.map((n) => {
          const selected = selectedId === n.id;
          return (
            <li key={n.id}>
              <button
                type="button"
                aria-label={nodeAria(n)}
                aria-pressed={selected}
                onClick={() => setSelectedId(n.id)}
                onKeyDown={(e) => onNodeKey(e, n.id)}
                className={cn(
                  "h-full w-full rounded-lg border bg-surface-secondary/35 px-2 py-2 text-left text-[11px] leading-snug outline-none focus-visible:ring-2 focus-visible:ring-brand",
                  selected && "ring-2 ring-brand/50",
                )}
                style={
                  reduceMotion
                    ? undefined
                    : {
                        borderColor: `rgba(59,130,246,${0.22 + n.severity / 280})`,
                      }
                }
              >
                <span className="block font-semibold text-text-primary">{n.label}</span>
                <span className="block text-text-muted">{n.sublabel?.slice(0, 42)}</span>
                <span className="mt-1 block text-[10px] uppercase text-text-muted">trust {n.trust}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div aria-live="polite" className="sr-only">
        {selectedId ? `Odabran čvor: ${nodesById.get(selectedId)?.label ?? selectedId}` : ""}
      </div>

      <KnowledgeGraphTextualList graph={graph} visibleNodeIds={visibleIds} />
    </div>
  );
}

export const KnowledgeRelationshipGraph = memo(KnowledgeRelationshipGraphInner);
