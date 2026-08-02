import { type JSX, useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { cn } from "@/lib/utils";
import { textualTrendSummary } from "@/lib/operations-intelligence/intelligence-trends";
import type { TrendSeries } from "@/lib/operations-intelligence/intelligence-types";

export function CertificationThroughputPanel({
  trends,
}: {
  readonly trends: readonly TrendSeries[];
}): JSX.Element {
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const fn = (): void => setReduceMotion(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  const subset = useMemo(() => trends.filter((t) => ["cert_pressure", "capa_backlog", "complaints"].includes(t.id)), [trends]);

  const merged = useMemo(() => {
    const rows: Record<string, string | number>[] = [];
    const len = subset[0]?.points.length ?? 0;
    for (let i = 0; i < len; i += 1) {
      const row: Record<string, string | number> = { t: subset[0]?.points[i]?.t ?? "" };
      for (const s of subset) {
        row[s.id] = s.points[i]?.v ?? 0;
      }
      rows.push(row);
    }
    return rows;
  }, [subset]);

  const summary = useMemo(() => textualTrendSummary(subset), [subset]);

  return (
    <section aria-label="Trendovi certifikacije i pritiska" className="rounded-2xl border border-border/45 bg-surface-secondary/30 p-4 ring-1 ring-white/[0.03]">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">Trendovi (inferencijski)</p>
      <p className="text-xs text-text-secondary">
        Serije su derivirane iz trenutnog snimka — prikazuju smjer opterećenja, ne historijske zapise.
      </p>
      <p className="sr-only">{summary}</p>
      <div className={cn("mt-3 h-64 w-full motion-reduce:transition-none")}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={merged} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
            <XAxis dataKey="t" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} width={32} />
            <Tooltip
              contentStyle={{ background: "#0c0e12", border: "1px solid rgba(255,255,255,0.12)" }}
              wrapperStyle={{ outline: "none" }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {subset.map((s, idx) => {
              const colors = ["#38bdf8", "#a78bfa", "#fbbf24"];
              return (
                <Line
                  key={s.id}
                  type="monotone"
                  dataKey={s.id}
                  name={s.label}
                  stroke={colors[idx % colors.length]}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={!reduceMotion}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-[11px] text-text-muted" aria-hidden>
        {summary}
      </p>
    </section>
  );
}
