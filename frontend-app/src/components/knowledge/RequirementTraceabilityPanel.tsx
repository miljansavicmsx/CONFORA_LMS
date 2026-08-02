import { Link } from "react-router";
import type { JSX } from "react";

import { EnterpriseEmptyState, EnterpriseSectionHeader } from "@/design-system";
import { GitBranch } from "lucide-react";
import type { KnowledgeRelationship, KnowledgeRegistryClause } from "@/lib/knowledge/knowledge-types";

export function RequirementTraceabilityPanel({
  clause,
  relationships,
}: {
  readonly clause: KnowledgeRegistryClause | undefined;
  readonly relationships: readonly KnowledgeRelationship[];
}): JSX.Element {
  if (!clause) {
    return (
      <EnterpriseEmptyState
        icon={GitBranch}
        title="Nema odabrane klauzule"
        description="Odaberite stavku u exploreru za trag prema workflowu i entitetima."
      />
    );
  }

  return (
    <div className="rounded-2xl border border-border/50 bg-surface-primary/25 p-4">
      <EnterpriseSectionHeader title="Trag zahtjeva" description={`${clause.clauseRef} — relationship layer (frontend orchestration)`} />
      <ul className="mt-3 space-y-2 text-sm">
        {relationships.map((r) => (
          <li key={r.id} className="rounded-lg border border-border/40 bg-surface-secondary/30 px-3 py-2">
            <p className="font-semibold text-text-primary">
              {r.relationshipType} → {r.label}
            </p>
            <p className="text-xs text-text-muted">{r.explainHint}</p>
            {r.targetKind === "workflow" ? (
              <Link className="mt-1 inline-block text-xs font-medium text-brand hover:underline" to={r.targetId}>
                Otvori rutu: {r.targetId}
              </Link>
            ) : (
              <p className="mt-1 text-[11px] uppercase text-text-muted">Entitet: {r.targetId}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
