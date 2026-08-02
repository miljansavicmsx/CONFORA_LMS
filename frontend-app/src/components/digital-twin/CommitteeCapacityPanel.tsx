import { type JSX, useMemo } from "react";

import type { CommitteeCapacityRow } from "@/lib/digital-twin";
import { cn } from "@/lib/utils";

export function CommitteeCapacityPanel({ rows }: { readonly rows: readonly CommitteeCapacityRow[] }): JSX.Element {
  const summary = useMemo(
    () =>
      rows.length
        ? rows
            .map((r) => `${r.name}: saturacija ${Math.round(r.saturation * 100)}%, širina revidiranja ${r.reviewerSpread}.`)
            .join(" ")
        : "Nema registriranih odbora za kapacitet.",
    [rows],
  );

  return (
    <section aria-label="Kapacitet odbora" className="rounded-2xl border border-border/45 bg-surface-secondary/40 p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">Committee capacity</p>
      <p className="sr-only">{summary}</p>
      <ul className="mt-3 space-y-3">
        {rows.length ? (
          rows.slice(0, 12).map((r) => (
            <li key={r.committeeId} className="rounded-xl border border-border/35 bg-surface-primary/50 px-3 py-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-text-primary">{r.name}</p>
                  <p className="text-[10px] text-text-muted">{r.committeeType}</p>
                </div>
                <span className="text-xs text-text-secondary">
                  sat {Math.round(r.saturation * 100)}% · članova {r.reviewerSpread > 0 ? "raspoređeno" : "—"}
                </span>
              </div>
              <p className="mt-1 text-xs text-text-secondary">
                Aktivno (proxy) {r.activeWorkloadProxy}, prekoračenja (proxy) {r.overdueLoadProxy}. {r.reviewVelocityHint}
              </p>
              <div
                className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-black/25"
                role="presentation"
                aria-hidden
              >
                <div
                  className={cn(
                    "h-full rounded-full bg-brand/60 motion-safe:transition-[width] motion-reduce:transition-none",
                    r.saturation > 0.78 && "bg-rose-500/80",
                    r.saturation > 0.55 && r.saturation <= 0.78 && "bg-amber-500/80",
                  )}
                  style={{ width: `${Math.round(Math.min(1, r.saturation) * 100)}%` }}
                />
              </div>
            </li>
          ))
        ) : (
          <li className="text-sm text-text-muted">Učitajte directory odbora da bismo modelirali kapacitet.</li>
        )}
      </ul>
    </section>
  );
}
