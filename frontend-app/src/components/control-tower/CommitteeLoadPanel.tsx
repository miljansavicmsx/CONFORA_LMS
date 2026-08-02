import { type JSX, useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { cn } from "@/lib/utils";
import type { WorkloadRoleSlice } from "@/lib/operations-intelligence/intelligence-types";

export function CommitteeLoadPanel({
  workload,
}: {
  readonly workload: readonly WorkloadRoleSlice[];
}): JSX.Element {
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const fn = (): void => setReduceMotion(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  const committee = useMemo(() => workload.find((w) => w.roleId === "cert_committee"), [workload]);

  const data = useMemo(
    () => [
      { k: "Red", v: committee?.queueSize ?? 0 },
      { k: "Čekanja (kvorum)", v: committee?.overdue ?? 0 },
      { k: "Sat.", v: Math.round((committee?.saturation ?? 0) * 100) },
    ],
    [committee],
  );

  if (!committee) {
    return (
      <section className="rounded-2xl border border-border/40 bg-surface-secondary/25 p-4 text-sm text-text-muted">
        Nema podataka o opterećenju odbora u kontekstu ove uloge.
      </section>
    );
  }

  return (
    <section aria-label="Opterećenje odbora" className="rounded-2xl border border-border/45 bg-surface-secondary/30 p-4 ring-1 ring-white/[0.03]">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">Odbor — opterećenje</p>
      <p className="mt-1 text-xs text-text-secondary">{committee.avgCompletionHint}</p>
      <p className="sr-only">
        Red {committee.queueSize}, prekoračenja ili kvorum čekanja {committee.overdue}, saturacija{" "}
        {Math.round(committee.saturation * 100)} posto.
      </p>
      <div className={cn("mt-3 h-48 w-full")}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
            <XAxis dataKey="k" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} width={28} />
            <Tooltip
              contentStyle={{ background: "#0c0e12", border: "1px solid rgba(255,255,255,0.12)" }}
              wrapperStyle={{ outline: "none" }}
            />
            <Bar
              dataKey="v"
              fill="var(--color-brand, #6366f1)"
              radius={[6, 6, 0, 0]}
              isAnimationActive={!reduceMotion}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
