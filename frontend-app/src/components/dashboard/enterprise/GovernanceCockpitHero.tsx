import type { JSX } from "react";
import { Link } from "react-router";

import type { Severity } from "@/design-system/SeverityBadge";
import { ds } from "@/design-system/tokens";
import { cn } from "@/lib/utils";

export type CockpitMetric = {
  readonly label: string;
  readonly value: string | number;
  readonly severity?: Severity;
  readonly href?: string;
  readonly hint?: string;
};

const sevRing: Record<Severity, string> = {
  danger: "border-red-500/40 bg-red-500/10",
  warning: "border-amber-500/35 bg-amber-500/10",
  info: "border-sky-500/30 bg-sky-500/10",
  success: "border-emerald-500/35 bg-emerald-500/10",
};

export type CockpitSurface = "governance" | "technical";

const surfaces: Record<
  CockpitSurface,
  {
    shell: string;
    eyebrow: string;
    eyebrowCls: string;
  }
> = {
  governance: {
    shell: cn(ds.cockpitGovernanceShell),
    eyebrow: "Command center",
    eyebrowCls: "text-[11px] font-semibold uppercase tracking-[0.22em] text-brand",
  },
  technical: {
    shell: cn(ds.cockpitTechnicalShell),
    eyebrow: "Operations observability",
    eyebrowCls: "text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-300",
  },
};

export function GovernanceCockpitHero({
  title,
  subtitle,
  metrics,
  surface = "governance",
}: {
  readonly title: string;
  readonly subtitle: string;
  readonly metrics: readonly CockpitMetric[];
  /** `technical`: sys admin / platform signal (bez certifikacijskih CTA jezika). */
  readonly surface?: CockpitSurface;
}): JSX.Element | null {
  if (metrics.length === 0) {
    return null;
  }
  const palette = surfaces[surface];

  return (
    <div className={palette.shell}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className={palette.eyebrowCls}>{palette.eyebrow}</p>
          <h2 className="mt-2 text-xl font-bold tracking-tight text-text-primary">{title}</h2>
          <p className="mt-1 max-w-4xl text-sm leading-relaxed text-text-secondary">{subtitle}</p>
        </div>
      </div>
      <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => {
          const ring = m.severity ? sevRing[m.severity] : "border-border/55 bg-surface-primary/30";
          const inner = (
            <div className={cn("rounded-xl border px-4 py-3 transition-colors", ring)}>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">{m.label}</p>
              <p className="mt-1 text-xl font-bold tabular-nums text-text-primary">{m.value}</p>
              {m.hint ? <p className="mt-1 text-xs text-text-muted">{m.hint}</p> : null}
            </div>
          );
          return (
            <li key={m.label}>
              {m.href ? (
                <Link
                  to={m.href}
                  className={cn(
                    "block rounded-xl outline-none transition hover:opacity-95",
                    ds.focusRing,
                  )}
                >
                  {inner}
                </Link>
              ) : (
                inner
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
