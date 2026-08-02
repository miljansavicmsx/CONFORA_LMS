import type { JSX, ReactNode } from "react";

import { cn } from "@/lib/utils";

import { ds } from "./tokens";

export function EnterpriseKpiCard({
  label,
  value,
  hint,
  footer,
  className,
  compact,
}: {
  readonly label: string;
  readonly value: string | number;
  readonly hint?: string;
  readonly footer?: ReactNode;
  readonly className?: string;
  /** Kompaktnija varijanta za mobitel */
  readonly compact?: boolean;
}): JSX.Element {
  return (
    <div
      className={cn(ds.kpiCard, compact && "min-w-[8.5rem] p-3", className)}
      role="group"
      aria-label={label}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">{label}</p>
      <p className="mt-1 text-lg font-bold tabular-nums text-text-primary sm:text-xl">{value}</p>
      {hint ? <p className="mt-0.5 text-[11px] leading-snug text-text-muted">{hint}</p> : null}
      {footer ? <div className="mt-2">{footer}</div> : null}
    </div>
  );
}
