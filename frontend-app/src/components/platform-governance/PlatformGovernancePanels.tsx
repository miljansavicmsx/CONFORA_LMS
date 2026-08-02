import type { ReactNode } from "react";

import {
  AI_DISCLOSURE_STANDARD_HR,
  AI_RECOMMENDATION_KINDS_NON_OUTCOME,
  aiConfidenceNarrationHr,
} from "@/ai-governance";
import { ORCHESTRATION_SURFACES, FRONTEND_BOUNDARIES } from "@/architecture";
import { APPROVED_ENTERPRISE_PRIMITIVES, VARIANT_POLICY } from "@/design-system/governance";
import { EnterpriseSectionHeader } from "@/design-system";
import { KNOWN_ISSUES_REGISTRY } from "@/lib/known-issues";

function SectionCard({
  title,
  description,
  children,
}: {
  readonly title: string;
  readonly description?: string;
  readonly children: ReactNode;
}): ReactNode {
  return (
    <div className="rounded-xl border border-border/45 bg-surface-primary/10 p-4" role="region" aria-label={title}>
      <EnterpriseSectionHeader title={title} {...(description ? { description } : {})} titleLevel="h3" />
      <div className="mt-2 text-sm text-text-secondary">{children}</div>
    </div>
  );
}

export function DomainGovernancePanel(): ReactNode {
  return (
    <SectionCard title="Domain governance" description="Bounded contexts (frontend).">
      <p>
        Aktivnih granica: <strong className="text-text-primary">{FRONTEND_BOUNDARIES.length}</strong>. Core: learning,
        certification, governance cockpit, standards intelligence, observability, trust (public), system ops, command
        orchestration, shared kernel.
      </p>
    </SectionCard>
  );
}

export function ArchitectureHealthPanel(): ReactNode {
  return (
    <SectionCard title="Architecture health" description="Dozvoljeni smjerovi importa (sažetak).">
      <p>Orchestracija: {ORCHESTRATION_SURFACES.length} površina (command center, governance dashboard, knowledge, …).</p>
      <p className="mt-2 text-xs text-text-muted">Detalji: docs/FRONTEND_ARCHITECTURE_GOVERNANCE.md</p>
    </SectionCard>
  );
}

export function DesignSystemCompliancePanel(): ReactNode {
  return (
    <SectionCard title="Design system compliance" description="Odobreni primitivi.">
      <p>
        Broj odobrenih primitiva: {APPROVED_ENTERPRISE_PRIMITIVES.length}. Politika traka:{" "}
        {String(VARIANT_POLICY.ribbons).slice(0, 120)}…
      </p>
    </SectionCard>
  );
}

export function AICompliancePanel(): ReactNode {
  return (
    <SectionCard title="AI compliance" description="HITL i taksonomija preporuka.">
      <p className="text-text-primary">{AI_DISCLOSURE_STANDARD_HR}</p>
      <p className="mt-2">{aiConfidenceNarrationHr("medium")}</p>
      <p className="mt-2 text-xs">
        Non-outcome kinds: {AI_RECOMMENDATION_KINDS_NON_OUTCOME.length} (sve moraju izbjegavati certifikacijski ishod).
      </p>
    </SectionCard>
  );
}

export function PerformanceGovernancePanel(): ReactNode {
  return (
    <SectionCard title="Performance governance" description="Chunk i graf politika.">
      <p>
        Glavni bundle &gt; 500kb gzip upozorenje — vidi PERFORMANCE_GOVERNANCE_MODEL.md. Knowledge graf: prag čvorova za lazy
        mount.
      </p>
    </SectionCard>
  );
}

export function TechnicalDebtPanel(): ReactNode {
  return (
    <SectionCard title="Technical debt (snapshot)" description={`${KNOWN_ISSUES_REGISTRY.length} curated stavki.`}>
      <p>Kratak registry u kodu + puni registar u docs/TECHNICAL_DEBT_REGISTER.md.</p>
    </SectionCard>
  );
}

export function ReleaseGovernancePanel(): ReactNode {
  return (
    <SectionCard title="Release governance" description="Faze RC / pilot.">
      <p>Koristite RELEASE_GOVERNANCE_MODEL.md + Release readiness widget iznad.</p>
    </SectionCard>
  );
}
