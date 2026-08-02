import { type JSX } from "react";

import { cn } from "@/lib/utils";
import type { GovernanceTimelineEvent } from "@/lib/operations-intelligence/intelligence-types";

export function GovernanceTimelinePanel({
  events,
}: {
  readonly events: readonly GovernanceTimelineEvent[];
}): JSX.Element {
  return (
    <section aria-label="Governance vremenska os" className="space-y-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">Governance timeline</p>
      <ol className="relative border-l border-brand/35 pl-4">
        {events.map((e, idx) => (
          <li key={e.id} className={cn("mb-4 last:mb-0")}>
            <span className="sr-only">
              Događaj {idx + 1} od {events.length}.
            </span>
            <div className="text-[10px] font-mono text-text-muted">{e.at}</div>
            <div className="text-sm font-semibold text-text-primary">
              <span className="rounded bg-brand/15 px-1.5 py-0.5 text-[10px] uppercase text-brand">{e.kind}</span>{" "}
              {e.title}
            </div>
            {e.detail ? <p className="mt-1 text-xs text-text-secondary">{e.detail}</p> : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
