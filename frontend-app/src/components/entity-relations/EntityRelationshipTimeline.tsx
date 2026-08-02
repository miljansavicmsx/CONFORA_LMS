import { type JSX } from "react";

import { cn } from "@/lib/utils";
import type { RelationshipTimelineItem } from "@/lib/entity-relationships/relationship-timeline";

export function EntityRelationshipTimeline({
  items,
  title = "Vremenska os (governance)",
}: {
  readonly items: readonly RelationshipTimelineItem[];
  readonly title?: string;
}): JSX.Element {
  if (!items.length) {
    return <p className="text-sm text-text-muted">Nema vremenskih stavki za prikaz.</p>;
  }

  return (
    <section aria-label={title} className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">{title}</h3>
      <ul className="space-y-2">
        {items.map((it) => (
          <li
            key={it.id}
            className="rounded-xl border border-border/40 bg-surface-secondary/30 px-3 py-2 ring-1 ring-white/[0.03]"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-text-muted">
              <time dateTime={it.at}>{it.at}</time>
              {it.severity ? (
                <span className={cn("rounded px-1.5 py-0.5 font-semibold uppercase", "bg-slate-500/15 text-slate-100")}>
                  {it.severity}
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-sm font-medium text-text-primary">{it.title}</p>
            {it.subtitle ? <p className="text-xs text-text-secondary">{it.subtitle}</p> : null}
            {it.outcome ? (
              <p className="mt-1 text-[11px] font-semibold uppercase text-amber-100">{it.outcome}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
