import { type JSX, useMemo } from "react";

import type { CoverageTier, FrameworkId, RequirementCoverageRow } from "@/lib/compliance";
import { cn } from "@/lib/utils";

const TIER: Record<CoverageTier, string> = {
  covered: "border-emerald-500/40 bg-emerald-500/10 text-emerald-50",
  partial: "border-sky-500/40 bg-sky-500/10 text-sky-50",
  missing: "border-rose-500/45 bg-rose-600/12 text-rose-50",
  needs_review: "border-amber-500/45 bg-amber-500/10 text-amber-50",
};

const HR: Record<CoverageTier, string> = {
  covered: "Pokriveno",
  partial: "Djelomično",
  missing: "Nedostaje",
  needs_review: "Trebaju reviziju",
};

export function RequirementCoverageMatrix({
  rows,
  frameworkId,
}: {
  readonly rows: readonly RequirementCoverageRow[];
  readonly frameworkId: FrameworkId;
}): JSX.Element {
  const filtered = useMemo(() => rows.filter((r) => r.frameworkId === frameworkId), [rows, frameworkId]);
  const summary = useMemo(
    () =>
      filtered.map((r) => `${r.title}: ${HR[r.tier]} (${r.score})`).join(". ") || "Nema redaka za ovaj okvir.",
    [filtered],
  );

  return (
    <section aria-label="Matrica pokrivenosti zahtjeva" className="rounded-2xl border border-border/45 bg-surface-secondary/40 p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">Coverage matrix</p>
      <p className="sr-only">{summary}</p>
      <p className="mt-2 text-xs text-text-secondary md:hidden" aria-hidden>
        {summary}
      </p>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-border/40 text-[10px] uppercase tracking-wide text-text-muted">
              <th scope="col" className="py-2 pr-2 font-semibold">
                Zahtjev
              </th>
              <th scope="col" className="py-2 pr-2 font-semibold">
                Članak
              </th>
              <th scope="col" className="py-2 pr-2 font-semibold">
                Pokrivenost
              </th>
              <th scope="col" className="py-2 font-semibold">
                Bod
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr
                key={r.requirementId}
                tabIndex={0}
                className="border-b border-border/25 outline-none focus-visible:bg-brand/5"
              >
                <th scope="row" className="max-w-[220px] py-2 pr-2 font-medium text-text-primary">
                  {r.title}
                </th>
                <td className="py-2 pr-2 font-mono text-[10px] text-text-muted">{r.clauseRef}</td>
                <td className="py-2 pr-2">
                  <span className={cn("inline-flex rounded-lg border px-2 py-0.5", TIER[r.tier])}>{HR[r.tier]}</span>
                </td>
                <td className="py-2 font-mono tabular-nums">{r.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="mt-3 space-y-1 text-[11px] text-text-secondary">
        {filtered.slice(0, 4).map((r) => (
          <li key={`txt-${r.requirementId}`}>
            <span className="font-medium text-text-primary">{r.title}</span> — {r.rationale}
          </li>
        ))}
      </ul>
    </section>
  );
}
