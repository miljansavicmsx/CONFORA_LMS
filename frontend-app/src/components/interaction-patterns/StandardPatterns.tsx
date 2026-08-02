import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { EnterpriseAiBadge, EnterpriseWorkflowRibbon } from "@/design-system";
import type { WorkflowRibbonStageState } from "@/design-system/EnterpriseWorkflowRibbon";
import { EnterpriseStatusBadge } from "@/design-system";
import type { Severity } from "@/design-system/SeverityBadge";
import { SeverityBadge } from "@/design-system/SeverityBadge";
import { WorkflowBadge } from "@/design-system/WorkflowBadge";
import { cn } from "@/lib/utils";

export function StandardRibbon({
  stages,
  ariaLabel,
}: {
  readonly stages: readonly { readonly label: string; readonly state: WorkflowRibbonStageState }[];
  readonly ariaLabel?: string;
}): ReactNode {
  return <EnterpriseWorkflowRibbon stages={stages} ariaLabel={ariaLabel ?? "Ribbon"} />;
}

export function StandardBadgeStrip({
  items,
}: {
  readonly items: readonly { readonly id: string; readonly label: string; readonly severity?: Severity }[];
}): ReactNode {
  return (
    <div className="flex flex-wrap gap-2" role="list" aria-label="Badge traka">
      {items.map((it) => (
        <span key={it.id} role="listitem">
          {it.severity ? (
            <EnterpriseStatusBadge severity={it.severity}>{it.label}</EnterpriseStatusBadge>
          ) : (
            <WorkflowBadge>{it.label}</WorkflowBadge>
          )}
        </span>
      ))}
    </div>
  );
}

export function StandardInsightCard({
  title,
  body,
  className,
}: {
  readonly title: string;
  readonly body: string;
  readonly className?: string;
}): ReactNode {
  return (
    <div className={cn("rounded-xl border border-border/40 bg-surface-secondary/25 p-3", className)} role="article">
      <p className="text-sm font-semibold text-text-primary">{title}</p>
      <p className="mt-1 text-sm text-text-secondary">{body}</p>
    </div>
  );
}

export function StandardWorkflowIndicator({ label }: { readonly label: string }): ReactNode {
  return <WorkflowBadge className="text-[11px]">{label}</WorkflowBadge>;
}

export function StandardEvidenceIndicator({ label }: { readonly label: string }): ReactNode {
  return (
    <span className="inline-flex items-center rounded-md border border-sky-500/35 bg-sky-500/10 px-2 py-0.5 text-[11px] font-medium text-sky-100">
      {label}
    </span>
  );
}

export function StandardTrustIndicator({ label }: { readonly label: string }): ReactNode {
  return <WorkflowBadge className="border-emerald-500/40 bg-emerald-500/10 text-emerald-100">{label}</WorkflowBadge>;
}

export function StandardReadinessIndicator({ label, severity }: { readonly label: string; readonly severity: Severity }): ReactNode {
  return <SeverityBadge severity={severity}>{label}</SeverityBadge>;
}

export function StandardAiIndicator(): ReactNode {
  return <EnterpriseAiBadge humanApprovalRequired>AI HITL</EnterpriseAiBadge>;
}

export type { LucideIcon };
