import type { LucideIcon } from "lucide-react";
import type { JSX, ReactNode } from "react";

import { cn } from "@/lib/utils";

import type { Severity } from "./SeverityBadge";

const styles: Record<Severity, string> = {
  info: "border-sky-500/30 bg-sky-500/10 text-sky-100",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-50",
  danger: "border-red-500/30 bg-red-500/10 text-red-50",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-50",
};

export function AlertBanner({
  severity,
  icon: Icon,
  title,
  children,
  className,
}: {
  readonly severity: Severity;
  readonly icon: LucideIcon;
  readonly title: string;
  readonly children?: ReactNode;
  readonly className?: string;
}): JSX.Element {
  return (
    <div
      role="status"
      className={cn(
        "flex gap-3 rounded-xl border px-4 py-3 text-sm",
        styles[severity],
        className,
      )}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0 opacity-90" aria-hidden />
      <div className="min-w-0">
        <p className="font-semibold leading-snug">{title}</p>
        {children ? <div className="mt-1 text-sm opacity-95">{children}</div> : null}
      </div>
    </div>
  );
}
