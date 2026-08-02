import { useId, useMemo, useState, type JSX } from "react";

import type { EntityRelationship } from "@/lib/entity-relationships/relationship-types";
import {
  buildHorizontalLineageLayout,
  describeGraphLayout,
} from "@/lib/entity-relationships/relationship-graph";
import { resolveEntityNavigation } from "@/lib/entity-relationships/relationship-navigation";
import { cn } from "@/lib/utils";

export function EntityRelationshipGraph({
  centerId,
  centerType,
  centerLabel,
  edges,
  maxNodes,
}: {
  readonly centerId: string;
  readonly centerType: string;
  readonly centerLabel?: string;
  readonly edges: readonly EntityRelationship[];
  readonly maxNodes?: number;
}): JSX.Element {
  const uid = useId();
  const [focusIdx, setFocusIdx] = useState(0);
  const layout = useMemo(() => {
    const center = { id: centerId, type: centerType, ...(centerLabel ? { label: centerLabel } : {}) };
    if (maxNodes !== undefined) {
      return buildHorizontalLineageLayout(center, edges, { maxNodes });
    }
    return buildHorizontalLineageLayout(center, edges);
  }, [centerId, centerType, centerLabel, edges, maxNodes]);

  const summary = describeGraphLayout(layout);
  const nodeW = 168;
  const nodeH = 56;
  const colGap = 72;
  const rowGap = 16;
  const pad = 24;
  const maxRows = Math.max(...layout.nodes.map((n) => n.row), 0) + 1;
  const width = pad * 2 + nodeW * 3 + colGap * 2;
  const height = pad * 2 + maxRows * (nodeH + rowGap);

  const xy = (col: number, row: number): { x: number; y: number } => ({
    x: pad + col * (nodeW + colGap),
    y: pad + row * (nodeH + rowGap),
  });

  return (
    <figure className="space-y-2" aria-label="Pregled veza između entiteta">
      <figcaption className="sr-only">{summary}</figcaption>
      <div aria-hidden className="rounded-xl border border-border/45 bg-surface-secondary/25 p-2 ring-1 ring-white/[0.04]">
        <svg
          role="img"
          width={width}
          height={height}
          className="mx-auto max-w-full text-text-primary motion-reduce:transition-none"
        >
          <defs>
            <marker id={`${uid}-arrow`} markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" className="fill-brand/70" />
            </marker>
          </defs>
          {layout.edges.map((e) => {
            const from = layout.nodes.find((n) => n.id === e.sourceId && n.type === e.sourceType);
            const to = layout.nodes.find((n) => n.id === e.targetId && n.type === e.targetType);
            if (!from || !to) return null;
            const a = xy(from.column, from.row);
            const b = xy(to.column, to.row);
            const x1 = a.x + nodeW;
            const y1 = a.y + nodeH / 2;
            const x2 = b.x;
            const y2 = b.y + nodeH / 2;
            return (
              <line
                key={`${e.sourceType}:${e.sourceId}-${e.relationshipType}-${e.targetType}:${e.targetId}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="currentColor"
                strokeOpacity={0.2}
                strokeWidth={1.5}
                markerEnd={`url(#${uid}-arrow)`}
              />
            );
          })}

          {layout.nodes.map((n, idx) => {
            const { x, y } = xy(n.column, n.row);
            const focused = focusIdx === idx;
            return (
              <g key={`${n.type}:${n.id}`} transform={`translate(${x},${y})`}>
                <rect
                  role="button"
                  tabIndex={0}
                  aria-label={`${n.type} ${n.id}`}
                  width={nodeW}
                  height={nodeH}
                  rx={12}
                  className={cn(
                    "cursor-pointer stroke-[1.5] transition-colors motion-reduce:transition-none",
                    n.keyRole === "center"
                      ? "fill-brand/20 stroke-brand/50"
                      : "fill-surface-secondary/80 stroke-border/50",
                    focused && "stroke-brand",
                  )}
                  onFocus={() => setFocusIdx(idx)}
                  onMouseEnter={() => setFocusIdx(idx)}
                  onKeyDown={(ke) => {
                    if (ke.key === "ArrowRight" || ke.key === "ArrowDown") {
                      ke.preventDefault();
                      setFocusIdx((i) => Math.min(layout.nodes.length - 1, i + 1));
                    }
                    if (ke.key === "ArrowLeft" || ke.key === "ArrowUp") {
                      ke.preventDefault();
                      setFocusIdx((i) => Math.max(0, i - 1));
                    }
                  }}
                />
                <text x={12} y={24} className="fill-current text-[10px] font-semibold uppercase text-text-muted">
                  {n.type.length > 20 ? `${n.type.slice(0, 18)}…` : n.type}
                </text>
                <text x={12} y={42} className="fill-current text-xs font-medium text-text-primary">
                  {n.label.length > 28 ? `${n.label.slice(0, 26)}…` : n.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <p className="text-xs text-text-secondary">{summary}</p>
      <ol className="text-xs text-text-secondary">
        {layout.nodes.map((n) => {
          const nav = resolveEntityNavigation(n.type, n.id);
          const dest =
            nav.kind === "internal"
              ? `Ruta: ${nav.to}`
              : nav.kind === "external"
                ? `URL: ${nav.href}`
                : nav.kind === "search"
                  ? `Pretraga: ${nav.query}`
                  : "Nema direktne navigacije";
          return (
            <li key={`${n.type}-${n.id}-list`}>
              <span className="font-medium text-text-primary">{n.label}</span> — {dest}
            </li>
          );
        })}
      </ol>
    </figure>
  );
}
