import { type JSX, useId, useMemo, useState } from "react";

import type { OrganizationalTopologyNode, TopologyEdge, TwinFunctionalRoleId } from "@/lib/digital-twin";
import { cn } from "@/lib/utils";

const ROLE_STROKE: Record<TwinFunctionalRoleId, string> = {
  certification_committee: "stroke-violet-400/70",
  appeals_committee: "stroke-amber-400/70",
  impartiality_committee: "stroke-cyan-400/70",
  quality_management: "stroke-emerald-400/70",
  auditors: "stroke-orange-400/70",
  training_administration: "stroke-sky-400/70",
  system_administration: "stroke-slate-400/70",
};

export function CommitteeDependencyGraph({
  nodes,
  edges,
  className,
}: {
  readonly nodes: readonly OrganizationalTopologyNode[];
  readonly edges: readonly TopologyEdge[];
  readonly className?: string;
}): JSX.Element {
  const svgId = useId();
  const backbone = useMemo(() => nodes.filter((n) => n.role !== "committee_instance"), [nodes]);
  const [focusId, setFocusId] = useState<string | null>(null);
  const pos = useMemo(() => new Map(backbone.map((n) => [n.id, n.position])), [backbone]);

  const summary = useMemo(() => {
    const ec = edges.length;
    const nc = backbone.length;
    return `Graf ovisnosti: ${nc} institucionalna čvorišta, ${ec} usmjerene veze. Tab / Enter za fokus čvora.`;
  }, [backbone.length, edges.length]);

  return (
    <figure className={cn("space-y-2", className)} aria-label="Topologija ovisnosti odbora">
      <figcaption className="sr-only">{summary}</figcaption>
      <p className="text-xs text-text-secondary md:hidden" aria-hidden>
        {summary}
      </p>
      <svg
        viewBox="0 0 100 100"
        className="h-[min(420px,55vh)] w-full overflow-visible rounded-2xl border border-border/40 bg-surface-secondary/30"
        role="img"
        aria-hidden
      >
        <defs>
          <marker id={`${svgId}-arrow`} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" className="fill-text-muted/50" />
          </marker>
        </defs>
        {edges.map((e) => {
          const a = pos.get(e.from);
          const b = pos.get(e.to);
          if (!a || !b) return null;
          const highlighted = focusId && (focusId === e.from || focusId === e.to);
          return (
            <line
              key={`${e.from}-${e.to}-${e.kind}`}
              x1={a.xPct}
              y1={a.yPct}
              x2={b.xPct}
              y2={b.yPct}
              strokeWidth={highlighted ? 0.55 : 0.35}
              stroke="currentColor"
              className={cn("text-text-muted/45 motion-safe:transition-[stroke-width] motion-reduce:transition-none", highlighted && "text-brand/70")}
              markerEnd={`url(#${svgId}-arrow)`}
            />
          );
        })}
        {backbone.map((n) => {
          const focused = focusId === n.id;
          return (
            <g key={n.id}>
              <circle
                role="presentation"
                cx={n.position.xPct}
                cy={n.position.yPct}
                r={focused ? 4.2 : 3.4}
                className={cn(
                  "cursor-pointer fill-surface-primary stroke-white/40 motion-safe:transition-[r] motion-reduce:transition-none",
                  focused && "fill-brand/25 stroke-brand/60",
                  ROLE_STROKE[n.role as TwinFunctionalRoleId] ?? "stroke-white/40",
                )}
                strokeWidth={0.45}
              />
            </g>
          );
        })}
      </svg>
      <ul className="grid gap-1 sm:grid-cols-2">
        {backbone.map((n) => {
          return (
            <li key={`kb-${n.id}`}>
              <button
                type="button"
                tabIndex={0}
                onClick={() => setFocusId((c) => (c === n.id ? null : n.id))}
                onKeyDown={(ev) => {
                  if (ev.key === "Enter" || ev.key === " ") {
                    ev.preventDefault();
                    setFocusId((c) => (c === n.id ? null : n.id));
                  }
                }}
                className={cn(
                  "flex w-full flex-col rounded-xl border border-border/50 bg-surface-primary/80 px-3 py-2 text-left text-xs outline-none transition-colors motion-reduce:transition-none",
                  "hover:border-brand/40 focus-visible:ring-2 focus-visible:ring-brand/35",
                  focusId === n.id && "border-brand/50 bg-brand/5",
                )}
              >
                <span className="font-semibold text-text-primary">{n.label}</span>
                <span className="mt-0.5 text-[10px] text-text-muted">{n.ownershipHint}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </figure>
  );
}
