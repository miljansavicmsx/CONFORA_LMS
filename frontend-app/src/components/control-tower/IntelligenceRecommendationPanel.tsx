import { Sparkles } from "lucide-react";
import { Link } from "react-router";
import { type JSX } from "react";

import { cn } from "@/lib/utils";
import type { IntelligenceRecommendation } from "@/lib/operations-intelligence/intelligence-types";

export function IntelligenceRecommendationPanel({
  items,
}: {
  readonly items: readonly IntelligenceRecommendation[];
}): JSX.Element {
  return (
    <section aria-label="Predložene akcije" className="rounded-2xl border border-violet-500/30 bg-violet-500/5 p-4 ring-1 ring-violet-500/15">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-violet-200" aria-hidden />
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-100">Suggested actions</p>
      </div>
      <p className="mt-1 text-xs text-violet-200/80">
        Orkestracija na frontendu — svaka preporuka zahtijeva ljudski pregled. Confidence je heuristički 0–1.
      </p>
      <ul className="mt-3 space-y-2">
        {items.map((r) => (
          <li key={r.id} className="rounded-xl border border-white/10 bg-black/25 px-3 py-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium text-text-primary">{r.title}</p>
              <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold text-violet-100 ring-1 ring-violet-400/30")}>
                Confidence {Math.round(r.confidence * 100)}%
              </span>
            </div>
            <p className="mt-1 text-xs text-text-secondary">{r.rationale}</p>
            {r.actionRoute ? (
              <Link to={r.actionRoute} className="mt-1 inline-block text-xs font-medium text-brand hover:underline">
                Izvrši u modulu →
              </Link>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
