import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router";
import { Suspense, lazy, memo, useDeferredValue, useEffect, useMemo, useState, type JSX } from "react";

import { AuditGuidancePanel } from "./AuditGuidancePanel";
import { ClauseExplorer } from "./ClauseExplorer";
import { ComplianceGuidancePanel } from "./ComplianceGuidancePanel";
import { EvidenceCoveragePanel } from "./EvidenceCoveragePanel";
import { KnowledgeGraphTextualList } from "./KnowledgeRelationshipGraph";
import { KnowledgeInsightsPanel } from "./KnowledgeInsightsPanel";
import { RequirementCoverageMatrix } from "./RequirementCoverageMatrix";
import { RequirementGapPanel } from "./RequirementGapPanel";
import { RequirementTraceabilityPanel } from "./RequirementTraceabilityPanel";
import { StandardsGlossaryPanel } from "./StandardsGlossaryPanel";
import { ContextRibbon, ProgressivePanel } from "@/components/information-disclosure";
import { DashboardGrid, DashboardSection } from "@/design-system";
import type { AuditReadinessBundle } from "@/lib/audit-readiness";
import type { KnowledgeExplainableRecommendation, KnowledgeWorkspaceBundle } from "@/lib/knowledge/knowledge-types";
import type { KnowledgeGraph } from "@/lib/knowledge-graph/knowledge-graph-types";
import type { TwinNormalizedInput } from "@/lib/digital-twin/twin-types";
import { IA_RIBBON_GOVERNANCE_CORE, IA_RIBBON_KNOWLEDGE_HUB } from "@/lib/workspace-continuity";

const KnowledgeRelationshipGraphLazy = lazy(async () => {
  const m = await import("./KnowledgeRelationshipGraph");
  return { default: m.KnowledgeRelationshipGraph };
});

/** Iznad praga graf se ne montira dok korisnik ne potvrdi (smanjuje TBT na velikim registryjima). */
const GRAPH_VISUAL_AUTOLOAD_MAX_NODES = 52;

function GraphSkeleton(): JSX.Element {
  return (
    <div
      className="min-h-[220px] rounded-2xl border border-border/45 bg-surface-secondary/25 motion-safe:animate-pulse motion-reduce:animate-none"
      role="status"
      aria-busy="true"
    >
      <span className="sr-only">Učitavanje knowledge grafa…</span>
    </div>
  );
}

export const StandardsKnowledgeCenter = memo(function StandardsKnowledgeCenter({
  bundle,
  graph,
  readiness,
  aiGuidance,
  focusClauseId,
  snapshot,
}: {
  readonly bundle: KnowledgeWorkspaceBundle;
  readonly graph: KnowledgeGraph;
  readonly readiness: AuditReadinessBundle;
  readonly aiGuidance: KnowledgeExplainableRecommendation | null;
  readonly focusClauseId: string;
  readonly snapshot: TwinNormalizedInput;
}): JSX.Element {
  const reduceMotion = useReducedMotion();
  const deferredSnapshot = useDeferredValue(snapshot);
  const clause = focusClauseId ? bundle.clauses.find((c) => c.id === focusClauseId) : undefined;
  const insights = bundle.insights ?? [];

  const [mountVisualGraph, setMountVisualGraph] = useState(
    () => graph.nodes.length <= GRAPH_VISUAL_AUTOLOAD_MAX_NODES,
  );

  useEffect(() => {
    setMountVisualGraph(graph.nodes.length <= GRAPH_VISUAL_AUTOLOAD_MAX_NODES);
  }, [graph.nodes.length]);

  const textualFallbackIds = useMemo(() => new Set(graph.nodes.slice(0, 96).map((n) => n.id)), [graph.nodes]);

  const ribbonItems = useMemo(() => [...IA_RIBBON_KNOWLEDGE_HUB, ...IA_RIBBON_GOVERNANCE_CORE], []);

  const graphBlock =
    graph.nodes.length > GRAPH_VISUAL_AUTOLOAD_MAX_NODES && !mountVisualGraph ? (
      <div className="space-y-3 rounded-2xl border border-border/50 bg-surface-primary/20 p-4">
        <p className="text-sm text-text-secondary">
          Vizualni knowledge graf ({graph.nodes.length} čvorova) nije automatski učitan radi performansi. Tekstualni prikaz
          ispod je uvijek dostupan.
        </p>
        <button
          type="button"
          className="rounded-lg border border-border/50 bg-surface-secondary/30 px-3 py-2 text-xs font-semibold outline-none focus-visible:ring-2 focus-visible:ring-brand"
          onClick={() => setMountVisualGraph(true)}
        >
          Učitaj vizualni graf
        </button>
        <KnowledgeGraphTextualList graph={graph} visibleNodeIds={textualFallbackIds} edgeLimit={48} />
      </div>
    ) : (
      <Suspense fallback={<GraphSkeleton />}>
        <KnowledgeRelationshipGraphLazy graph={graph} />
      </Suspense>
    );

  return (
    <motion.div
      className="space-y-8"
      {...(reduceMotion ? {} : { initial: { opacity: 0.96, y: 6 }, animate: { opacity: 1, y: 0 } })}
    >
      <p className="sr-only">
        Standards knowledge centar: registry, matrica zahtjeva, audit readiness, graf i glossary. Animacije su smanjene ako
        preferirate smanjeno kretanje.
      </p>
      <ProgressivePanel
        summary={
          <p>
            Ovaj entitet orchestration sloj prikazuje registry, tragove i audit pripremu u jednom mirnom cockpit-u — bez novih
            backend odluka.
          </p>
        }
        insight={
          <p>
            {insights[0]?.title ?? "Nema vrhunskog uvida u ovom presjeku — provjerite operativne module za signale."}
            {insights[0]?.detail ? ` — ${insights[0].detail}` : null}
          </p>
        }
        detail={
          <p>
            Odaberite klauzulu u exploreru za detalj o zahtjevima i facetima; matrica ispod daje atomic zahtjeve po standardu.
          </p>
        }
        traceability={
          <p>
            <Link className="font-semibold text-brand hover:underline" to="/dashboard/iso/compliance">
              Compliance OS
            </Link>{" "}
            i <Link className="font-semibold text-brand hover:underline" to="/dashboard/knowledge">
              Knowledge workspace
            </Link>{" "}
            održavaju kontinuitet tragova.
          </p>
        }
        evidence={
          <p>Evidence kanali su u sekciji ispod matrice; svi dokazi zahtijevaju ljudsku potvrdu prije formalnih izjava.</p>
        }
        auditLineage={
          <p>
            <Link className="font-semibold text-brand hover:underline" to="/dashboard/iso/audit">
              Strukturirani audit
            </Link>{" "}
            je ulazna točka za audit genealogiju u operativnom modulu.
          </p>
        }
      />
      <ContextRibbon title="IA skokovi (cross-workspace)" items={ribbonItems} />
      <DashboardSection
        id="knowledge-section-registry"
        title="Registry i explorer"
        description="ISO/IEC 17024 najdetaljniji — ostali standardi kao presjeci."
      >
        <DashboardGrid columns="auto">
          <div id="section-registry" className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Brzi linkovi</p>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/dashboard/iso/compliance"
                className="rounded-lg border border-border/50 bg-surface-secondary/40 px-3 py-2 text-xs font-semibold text-brand hover:border-brand/40"
              >
                Compliance OS
              </Link>
              <Link
                to="/dashboard/iso/audit"
                className="rounded-lg border border-border/50 px-3 py-2 text-xs font-semibold hover:border-brand/35"
              >
                Audit trag
              </Link>
              <Link to="/dashboard/iso/capa" className="rounded-lg border border-border/50 px-3 py-2 text-xs font-semibold hover:border-brand/35">
                CAPA
              </Link>
            </div>
            <ClauseExplorer
              clauses={bundle.clauses}
              selectedId={focusClauseId}
              snapshot={snapshot}
              insights={insights}
              readiness={readiness}
            />
          </div>
          <div id="section-clause-detail">
            <RequirementTraceabilityPanel
              clause={clause}
              relationships={
                clause ? bundle.relationships.filter((r) => r.sourceKind === "clause" && r.sourceId === clause.id) : []
              }
            />
          </div>
        </DashboardGrid>
      </DashboardSection>

      <DashboardSection
        title="Pokrivenost i evidence"
        description="Matrica je rezana prozorom radi performansi; SA sažetak iznad tabele."
      >
        <RequirementCoverageMatrix requirements={bundle.requirements} snapshot={deferredSnapshot} />
        <div className="mt-6">
          <EvidenceCoveragePanel channels={bundle.evidenceChannels} clause={clause} />
        </div>
      </DashboardSection>

      <DashboardSection title="Audit readiness i gapovi" description={readiness.narrative}>
        <DashboardGrid columns="auto">
          <AuditGuidancePanel readiness={readiness} />
          <RequirementGapPanel graphTelemetry={graph.telemetry} readiness={readiness} />
        </DashboardGrid>
      </DashboardSection>

      <DashboardSection title="Grafovi i tragovi" description="Graf se renderira lagano — bez interaktivnog fizičkog ABAC sloja.">
        {graphBlock}
        <div className="mt-6">
          <ComplianceGuidancePanel aiGuidance={aiGuidance} />
        </div>
      </DashboardSection>

      <DashboardGrid columns="auto">
        <KnowledgeInsightsPanel insights={insights} telemetry={graph.telemetry} />
        <StandardsGlossaryPanel />
      </DashboardGrid>
    </motion.div>
  );
});
