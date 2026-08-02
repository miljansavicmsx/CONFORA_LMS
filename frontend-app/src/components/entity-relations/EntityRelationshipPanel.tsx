import { type JSX, lazy, Suspense, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { buildWorkflowTransitionRelationships } from "@/lib/entity-relationships/relationship-builders";
import type { EntityRelationship } from "@/lib/entity-relationships/relationship-types";
import { WORKFLOW_REGISTRY_VERSION } from "@/lib/entity-relationships/workflow-registry-client";
import { mergeEdges } from "@/lib/entity-relationships/relationship-utils";
import { auditRowsToTimelineItems, sortNewestFirst } from "@/lib/entity-relationships/relationship-timeline";

import type { AuditEvidenceRow } from "./RelationshipEvidenceChain";
import { EntityRelationshipList } from "./EntityRelationshipList";
import { EntityRelationshipTimeline } from "./EntityRelationshipTimeline";
import { GovernanceImpactPanel } from "./GovernanceImpactPanel";
import { RelationshipEvidenceChain } from "./RelationshipEvidenceChain";

const EntityRelationshipGraphLazy = lazy(async () => {
  const m = await import("./EntityRelationshipGraph");
  return { default: m.EntityRelationshipGraph };
});

export function EntityRelationshipPanel({
  title = "Enterprise traceability",
  subtitle,
  centerId,
  centerType,
  centerLabel,
  edges,
  auditRows,
  workflowMeta,
  defaultCollapsed = true,
}: {
  readonly title?: string;
  readonly subtitle?: string;
  readonly centerId: string;
  readonly centerType: string;
  readonly centerLabel?: string;
  readonly edges: readonly EntityRelationship[];
  readonly auditRows?: readonly AuditEvidenceRow[];
  workflowMeta?: { readonly workflowType: string; readonly status: string; readonly resourceLabel?: string };
  readonly defaultCollapsed?: boolean;
}): JSX.Element {
  const [open, setOpen] = useState(!defaultCollapsed);
  const mergedEdges = useMemo(() => {
    if (!workflowMeta) return [...edges];
    return mergeEdges(
      [...edges],
      buildWorkflowTransitionRelationships(
        centerId,
        centerType,
        workflowMeta.workflowType,
        workflowMeta.status,
      ),
    );
  }, [edges, workflowMeta, centerId, centerType]);

  const timelineItems = useMemo(
    () => sortNewestFirst(auditRowsToTimelineItems(auditRows ?? [])),
    [auditRows],
  );

  if (!open) {
    return (
      <div className="mt-4 rounded-xl border border-border/40 bg-surface-secondary/25 p-3 ring-1 ring-white/[0.03]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">{title}</p>
            {subtitle ? <p className="text-xs text-text-secondary">{subtitle}</p> : null}
          </div>
          <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>
            Prikaži povezanost
          </Button>
        </div>
      </div>
    );
  }

  return (
    <section
      aria-label={title}
      className="mt-4 rounded-xl border border-brand/25 bg-gradient-to-b from-brand/5 to-surface-secondary/20 p-4 ring-1 ring-brand/15"
    >
      <header className="flex flex-wrap items-start justify-between gap-2 border-b border-border/35 pb-3">
        <div>
          <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
          {subtitle ? <p className="text-xs text-text-secondary">{subtitle}</p> : null}
          <p className="mt-1 text-[10px] text-text-muted">
            Registry snapshot: <span className="font-mono">{WORKFLOW_REGISTRY_VERSION}</span>
            {workflowMeta ? (
              <>
                {" "}
                · workflow <span className="font-mono">{workflowMeta.workflowType}</span> ·{" "}
                <span className="font-mono">{workflowMeta.status}</span>
                {workflowMeta.resourceLabel ? ` · ${workflowMeta.resourceLabel}` : ""}
              </>
            ) : null}
          </p>
        </div>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Sažmi
        </Button>
      </header>

      <Tabs defaultValue="related" className="mt-4">
        <TabsList className="flex w-full flex-wrap gap-1">
          <TabsTrigger value="related">Povezano</TabsTrigger>
          <TabsTrigger value="impact">Utjecaj</TabsTrigger>
          <TabsTrigger value="timeline">Vrijeme</TabsTrigger>
          <TabsTrigger value="graph">Graf</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="related">
          <EntityRelationshipList centerId={centerId} centerType={centerType} edges={mergedEdges} />
        </TabsContent>

        <TabsContent value="impact">
          <GovernanceImpactPanel edges={mergedEdges} />
        </TabsContent>

        <TabsContent value="timeline">
          <EntityRelationshipTimeline items={timelineItems} />
        </TabsContent>

        <TabsContent value="graph">
          <Suspense fallback={<p className="text-sm text-text-muted">Učitavanje grafa…</p>}>
            <EntityRelationshipGraphLazy
              centerId={centerId}
              centerType={centerType}
              {...(centerLabel ? { centerLabel } : {})}
              edges={mergedEdges}
              maxNodes={11}
            />
          </Suspense>
        </TabsContent>

        <TabsContent value="audit">
          <RelationshipEvidenceChain rows={auditRows ?? []} />
        </TabsContent>
      </Tabs>
    </section>
  );
}
