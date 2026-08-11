import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type BadgeProps = {
  readonly children: ReactNode;
  readonly className?: string;
};

/** Presentational disclosure for client-side AI assistance. */
export function EnterpriseAiBadge({ children, className, humanApprovalRequired }: BadgeProps & { readonly humanApprovalRequired: boolean }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-semibold", humanApprovalRequired ? "border-amber-400/35 bg-amber-500/[0.12] text-amber-100" : "border-violet-400/35 bg-violet-500/[0.12] text-violet-100", className)}>
      {children}
    </span>
  );
}

/** Presentational status label; it does not evaluate or authorize status. */
export function EnterpriseStatusBadge({ children, className, severity }: BadgeProps & { readonly severity: "danger" | "info" | "success" | "warning" }) {
  const tone = severity === "danger" ? "border-red-400/35 bg-red-500/[0.12] text-red-100" : severity === "success" ? "border-emerald-400/35 bg-emerald-500/[0.12] text-emerald-100" : severity === "info" ? "border-sky-400/35 bg-sky-500/[0.12] text-sky-100" : "border-amber-400/35 bg-amber-500/[0.12] text-amber-100";
  return <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide", tone, className)}>{children}</span>;
}
