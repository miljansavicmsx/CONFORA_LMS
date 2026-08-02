import { CheckCircle2, CircleDot, Circle } from "lucide-react";
import type { JSX } from "react";

import { cn } from "@/lib/utils";

import { WorkflowBadge } from "./WorkflowBadge";
import { ds } from "./tokens";

export type WorkflowRibbonStageState = "done" | "active" | "pending";

export function EnterpriseWorkflowRibbon({
  ariaLabel,
  stages,
}: {
  readonly ariaLabel: string;
  readonly stages: readonly { readonly label: string; readonly state: WorkflowRibbonStageState }[];
}): JSX.Element {
  return (
    <nav className={ds.ribbon} aria-label={ariaLabel}>
      <ol className="flex flex-wrap items-center gap-2 sm:gap-3">
        {stages.map((s, i) => {
          const Icon = s.state === "done" ? CheckCircle2 : s.state === "active" ? CircleDot : Circle;
          const iconCls =
            s.state === "done"
              ? "text-emerald-400"
              : s.state === "active"
                ? "text-brand"
                : "text-text-muted";
          return (
            <li key={`${s.label}-${String(i)}`} className="flex items-center gap-2">
              <span className={cn("inline-flex items-center gap-1.5 rounded-lg border border-border/50 bg-surface-primary/35 px-2.5 py-1.5", iconCls)}>
                <Icon className="h-3.5 w-3.5" aria-hidden />
                <WorkflowBadge {...(s.state === "active" ? { className: "border-brand/30 text-brand" } : {})}>
                  {s.label}
                </WorkflowBadge>
              </span>
              {i < stages.length - 1 ? (
                <span aria-hidden className="hidden text-[10px] text-text-muted sm:inline">
                  →
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
