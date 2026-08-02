import { useQuery } from "@tanstack/react-query";
import { Suspense, lazy, useMemo, type JSX } from "react";
import { useSearchParams } from "react-router";

import { ContextRibbon } from "@/components/information-disclosure";
import { EnterpriseHero, EnterprisePageShell, EnterpriseWorkflowRibbon } from "@/design-system";
import type { WorkflowRibbonStageState } from "@/design-system/EnterpriseWorkflowRibbon";
import { fetchGovernanceDirectoryCommittees } from "@/lib/api-governance";
import { buildAuditReadinessBundle } from "@/lib/audit-readiness";
import { buildKnowledgeWorkspaceBundle, clauseById, explainRecommendation } from "@/lib/knowledge";
import { buildDefaultKnowledgeGraph } from "@/lib/knowledge-graph";
import { DASHBOARD_CONTEXT_QUERY_KEY, fetchDashboardContext } from "@/lib/dashboard-context-api";
import { normalizeTwinInput } from "@/lib/digital-twin/twin-governance";
import { IA_RIBBON_GOVERNANCE_CORE, readInvestigationSnapshot, relatedWorkspaceJumps } from "@/lib/workspace-continuity";

const StandardsKnowledgeCenter = lazy(async () => {
  const m = await import("@/components/knowledge/StandardsKnowledgeCenter");
  return { default: m.StandardsKnowledgeCenter };
});

export default function KnowledgeWorkspacePage(): JSX.Element {
  const [params] = useSearchParams();
  const focusClauseId = params.get("clause")?.trim() ?? "";

  const ctxQ = useQuery({ queryKey: DASHBOARD_CONTEXT_QUERY_KEY, queryFn: fetchDashboardContext });
  const committeesQ = useQuery({
    queryKey: ["governance", "directory", "committees", "knowledge"],
    queryFn: fetchGovernanceDirectoryCommittees,
  });

  const snapshot = useMemo(() => {
    if (!ctxQ.data) return null;
    return normalizeTwinInput(ctxQ.data, committeesQ.data ?? [], 8, 2, 1);
  }, [ctxQ.data, committeesQ.data]);

  const bundle = useMemo(() => {
    if (!ctxQ.data) return null;
    return buildKnowledgeWorkspaceBundle(ctxQ.data, committeesQ.data ?? [], {
      governanceDocumentCount: 8,
      internalAuditRecords: 2,
      openAuditFindings: 1,
    });
  }, [ctxQ.data, committeesQ.data]);

  const graph = useMemo(() => (snapshot ? buildDefaultKnowledgeGraph(snapshot) : null), [snapshot]);
  const readiness = useMemo(() => (snapshot ? buildAuditReadinessBundle(snapshot, 8) : null), [snapshot]);

  const selectedClause = focusClauseId ? clauseById(focusClauseId) : undefined;
  const aiCard = useMemo(() => {
    if (!snapshot) return null;
    return explainRecommendation("Audit priprema — navigacijski fokus", selectedClause, snapshot);
  }, [snapshot, selectedClause]);

  const ribbonStages = useMemo((): readonly { readonly label: string; readonly state: WorkflowRibbonStageState }[] => {
    if (!readiness) {
      return [
        { label: "Registry", state: "pending" },
        { label: "Tragovi", state: "pending" },
        { label: "Audit", state: "pending" },
      ];
    }
    const b = readiness.band;
    return [
      { label: "Coverage", state: b === "audit_ready" ? "done" : "active" },
      { label: "Evidence", state: b === "critical" ? "active" : b === "audit_ready" ? "done" : "active" },
      { label: "Audit", state: b === "audit_ready" ? "done" : "pending" },
    ];
  }, [readiness]);

  const continuityRibbonItems = useMemo(() => {
    const dyn = relatedWorkspaceJumps(readInvestigationSnapshot()).map((h) => ({
      id: `dyn-${h.route}`,
      label: h.label,
      to: h.route,
      hint: h.rationale,
    }));
    return [...dyn, ...IA_RIBBON_GOVERNANCE_CORE].slice(0, 10);
  }, []);

  if (ctxQ.isError) {
    return (
      <EnterprisePageShell className="p-6 text-text-primary">
        <p className="text-sm text-red-300">Nije moguće učitati kontekst nadzorne ploče.</p>
      </EnterprisePageShell>
    );
  }

  if (!bundle || !snapshot || !graph || !readiness || ctxQ.isLoading) {
    return (
      <EnterprisePageShell className="p-6 text-text-primary">
        <div
          className="rounded-2xl border border-border/45 bg-surface-secondary/20 p-8 motion-safe:animate-pulse motion-reduce:animate-none"
          role="status"
          aria-busy="true"
        >
          <p className="text-sm text-text-muted">Učitavanje Standards Intelligence…</p>
          <span className="sr-only">Knowledge workspace se učitava; sažetak i matrica uskoro.</span>
        </div>
      </EnterprisePageShell>
    );
  }

  return (
    <EnterprisePageShell className="space-y-8 p-4 text-text-primary sm:p-6" withBackdrop={false}>
      <div className="sr-only" id="knowledge-aria-summary">
        {bundle.ariaSummary}
      </div>
      <EnterpriseHero
        id="knowledge-hero"
        eyebrow="Phase G — Knowledge OS"
        title="Standards Intelligence"
        description="Registry klauzula, tragovi, audit priprema i AI navigacija (human-in-the-loop, bez automatskih odluka)."
      />
      <EnterpriseWorkflowRibbon stages={ribbonStages} ariaLabel="Informacijski trag pripreme audita" />
      <ContextRibbon title="Kontinuitet i governance skokovi" items={continuityRibbonItems} />
      <Suspense
        fallback={
          <div
            className="min-h-[200px] rounded-2xl border border-border/50 bg-surface-secondary/30 p-8 text-sm text-text-muted"
            role="status"
          >
            Učitavanje knowledge centra…
          </div>
        }
      >
        <StandardsKnowledgeCenter
          bundle={bundle}
          graph={graph}
          readiness={readiness}
          aiGuidance={aiCard}
          focusClauseId={focusClauseId}
          snapshot={snapshot}
        />
      </Suspense>
    </EnterprisePageShell>
  );
}
