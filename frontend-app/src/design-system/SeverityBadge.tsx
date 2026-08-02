import type { JSX, ReactNode } from "react";

import { cn } from "@/lib/utils";

export type Severity = "info" | "warning" | "danger" | "success";

const map: Record<Severity, string> = {
  info: "border-sky-500/35 bg-sky-500/10 text-sky-200",
  warning: "border-amber-500/35 bg-amber-500/10 text-amber-100",
  danger: "border-red-500/35 bg-red-500/10 text-red-200",
  success: "border-emerald-500/35 bg-emerald-500/10 text-emerald-100",
};

export function SeverityBadge({
  severity,
  children,
  className,
}: {
  readonly severity: Severity;
  readonly children: ReactNode;
  readonly className?: string;
}): JSX.Element {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        map[severity],
        className,
      )}
    >
      {children}
    </span>
  );
}
