import type { JSX } from "react";

import { EnterpriseAiBadge, EnterpriseSectionHeader } from "@/design-system";
import type { KnowledgeExplainableRecommendation } from "@/lib/knowledge/knowledge-types";

export function ComplianceGuidancePanel({
  aiGuidance,
}: {
  readonly aiGuidance: KnowledgeExplainableRecommendation | null;
}): JSX.Element {
  if (!aiGuidance) {
    return (
      <div
        className="rounded-2xl border border-dashed border-border/55 p-4 text-sm text-text-muted"
        role="region"
        aria-label="AI guidance"
      >
        AI guidance nije dostupan bez snapshot konteksta.
      </div>
    );
  }

  return (
    <section
      className="rounded-2xl border border-border/50 bg-surface-primary/25 p-4"
      role="region"
      aria-label="AI smjernice uz obaveznu ljudsku provjeru"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <EnterpriseSectionHeader
          title="AI guidance (HITL)"
          description={aiGuidance.explanation}
          titleLevel="h3"
        />
        <EnterpriseAiBadge humanApprovalRequired>Čovjek u petlji</EnterpriseAiBadge>
      </div>
      <p className="mt-2 text-lg font-semibold text-text-primary">{aiGuidance.title}</p>
      <p className="text-xs text-text-muted">
        Pouzdanost (heuristika): {aiGuidance.confidence}% — {aiGuidance.confidenceBand}
      </p>
      <p className="mt-1 text-xs text-text-muted">Povezani standardi: {aiGuidance.relatedStandards.join(", ")}</p>

      <details className="mt-4 rounded-xl border border-border/40 bg-surface-secondary/20 p-3 motion-reduce:transition-none">
        <summary className="cursor-pointer text-sm font-semibold text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-brand">
          Puna objašnjenja i osnova (proširivo)
        </summary>
        <div className="mt-3 border-t border-border/35 pt-3 text-sm text-text-secondary">
          <p className="text-xs font-semibold uppercase text-text-muted">Evidence osnova</p>
          <ul className="mt-1 list-inside list-disc">
            {aiGuidance.evidenceBasis.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
          <p className="mt-2 text-xs font-semibold uppercase text-text-muted">Governance osnova</p>
          <ul className="mt-1 list-inside list-disc">
            {aiGuidance.governanceBasis.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
          <p className="mt-2 text-xs font-semibold uppercase text-text-muted">Audit osnova</p>
          <ul className="mt-1 list-inside list-disc">
            {aiGuidance.auditBasis.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-text-muted">Povezane klauzule: {aiGuidance.relatedClauseRefs.join(", ") || "—"}</p>
        </div>
      </details>

      <p className="mt-3 text-[11px] text-amber-300/90">Obavezna ljudska provjera prije formalnih izjava.</p>
    </section>
  );
}
