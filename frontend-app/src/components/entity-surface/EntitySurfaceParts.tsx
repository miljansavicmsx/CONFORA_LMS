import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { EnterpriseSectionHeader, EnterpriseWorkflowRibbon } from "@/design-system";
import type { WorkflowRibbonStageState } from "@/design-system/EnterpriseWorkflowRibbon";
import { cn } from "@/lib/utils";

export function EntitySurfaceShell({
  children,
  className,
  labelledBy,
}: {
  readonly children: ReactNode;
  readonly className?: string;
  /** id naslova za landmark (opcionalno). */
  readonly labelledBy?: string;
}): ReactNode {
  return (
    <section
      className={cn("space-y-4 rounded-2xl border border-border/45 bg-surface-primary/15 p-4 md:p-6", className)}
      aria-labelledby={labelledBy}
    >
      {children}
    </section>
  );
}

export function EntityHeader({
  id,
  icon: Icon,
  title,
  eyebrow,
  description,
}: {
  readonly id?: string;
  readonly icon?: LucideIcon;
  readonly title: string;
  readonly eyebrow?: string;
  readonly description?: string;
}): ReactNode {
  return (
    <header className="flex flex-wrap items-start gap-3 border-b border-border/35 pb-4">
      {Icon ? (
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/15 ring-1 ring-brand/25">
          <Icon className="h-5 w-5 text-brand" aria-hidden />
        </div>
      ) : null}
      <div className="min-w-0 flex-1" id={id}>
        <EnterpriseSectionHeader
          {...(eyebrow ? { eyebrow } : {})}
          title={title}
          {...(description ? { description } : {})}
          titleLevel="h2"
        />
      </div>
    </header>
  );
}

export function EntityStatusStrip({ children }: { readonly children: ReactNode }): ReactNode {
  return (
    <div className="flex flex-wrap gap-2 border-b border-border/30 pb-3" role="group" aria-label="Status traka entiteta">
      {children}
    </div>
  );
}

export function EntityEvidencePanel({ children }: { readonly children: ReactNode }): ReactNode {
  return (
    <div className="rounded-xl border border-border/40 bg-surface-secondary/25 p-3" role="region" aria-label="Dokazi">
      {children}
    </div>
  );
}

export function EntityWorkflowPanel({
  stages,
  ariaLabel,
}: {
  readonly stages: readonly { readonly label: string; readonly state: WorkflowRibbonStageState }[];
  readonly ariaLabel?: string;
}): ReactNode {
  return <EnterpriseWorkflowRibbon stages={stages} ariaLabel={ariaLabel ?? "Workflow trag entiteta"} />;
}

export function EntityTraceabilityPanel({ children }: { readonly children: ReactNode }): ReactNode {
  return (
    <div className="rounded-xl border border-border/40 bg-surface-secondary/20 p-3" role="region" aria-label="Tragivost">
      {children}
    </div>
  );
}

export function EntityRelationshipSummary({ children }: { readonly children: ReactNode }): ReactNode {
  return (
    <div className="rounded-xl border border-dashed border-border/50 bg-surface-secondary/15 p-3 text-sm text-text-secondary">
      {children}
    </div>
  );
}

export function EntityInsightPanel({ children }: { readonly children: ReactNode }): ReactNode {
  return (
    <div className="rounded-xl border border-border/45 bg-surface-primary/25 p-3" role="region" aria-label="Uvidi">
      {children}
    </div>
  );
}

export function EntityActionBar({ children }: { readonly children: ReactNode }): ReactNode {
  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-border/35 pt-4" role="toolbar" aria-label="Akcije entiteta">
      {children}
    </div>
  );
}
