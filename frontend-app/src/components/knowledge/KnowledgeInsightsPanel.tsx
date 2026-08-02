import { Link } from "react-router";
import type { JSX } from "react";

import { EnterpriseEmptyState, EnterpriseSectionHeader } from "@/design-system";
import type { KnowledgeInsight, KnowledgeWorkspaceTelemetry } from "@/lib/knowledge/knowledge-types";
import { Lightbulb } from "lucide-react";

export function KnowledgeInsightsPanel({
  insights,
  telemetry,
}: {
  readonly insights: readonly KnowledgeInsight[];
  readonly telemetry: KnowledgeWorkspaceTelemetry;
}): JSX.Element {
  return (
    <div className="rounded-2xl border border-border/50 bg-surface-primary/20 p-4">
      <EnterpriseSectionHeader
        title="Knowledge insights"
        description={`Coverage density ${telemetry.coverageDensity}. Orphan evidence ${telemetry.orphanEvidence}.`}
        titleLevel="h3"
      />
      <p className="sr-only" id="knowledge-insights-sr-count">
        {insights.length === 0
          ? "Nema insight zapisa u ovom presjeku."
          : `Broj insighta: ${insights.length}.`}
      </p>
      {insights.length === 0 ? (
        <EnterpriseEmptyState
          icon={Lightbulb}
          title="Nema insighta"
          description="Presjek je miran ili registry nema dodatnih signala za ovaj kontekst."
        />
      ) : (
        <ul className="mt-3 max-h-[min(48vh,320px)] list-none space-y-2 overflow-y-auto pr-1 text-sm" aria-describedby="knowledge-insights-sr-count">
          {insights.map((i) => (
            <li key={i.id} className="rounded-lg border border-border/35 bg-surface-secondary/30 px-3 py-2">
              <p className="font-semibold text-text-primary">
                <span className="sr-only">Težina {i.severity}. </span>[{i.severity}] {i.title}
              </p>
              <p className="text-text-secondary">{i.detail}</p>
              {i.actionRoute ? (
                <Link to={i.actionRoute} className="mt-1 inline-block text-xs text-brand hover:underline">
                  Otvori modul
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
