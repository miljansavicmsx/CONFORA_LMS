import type { ReactNode } from "react";

import { EnterpriseAiBadge, EnterpriseKpiCard, EnterpriseSectionHeader, EnterpriseStatusBadge } from "@/design-system";
import type { Severity } from "@/design-system/SeverityBadge";
import type { OperationsIntelligenceBundle } from "@/lib/operations-intelligence";
import { mapHealthToSeverity, observabilityCompositeScore, unifiedReadinessNarration } from "@/lib/observability-model";
import type { AuditReadinessBundle } from "@/lib/audit-readiness";

function A11ySummary({ children }: { readonly children: ReactNode }): ReactNode {
  return <p className="sr-only">{children}</p>;
}

export function ExecutiveSummaryPanel({
  bundle,
}: {
  readonly bundle: OperationsIntelligenceBundle;
}): ReactNode {
  const crit = bundle.alerts.filter((a) => a.severity === "critical").slice(0, 4);
  const sev: Severity = mapHealthToSeverity(bundle.health.band);
  return (
    <div className="rounded-2xl border border-border/45 bg-surface-secondary/25 p-4" role="region" aria-label="Executive summary">
      <EnterpriseSectionHeader
        title="Orkestrirani sažetak"
        description="Signal-first prikaz — agregat iz dashboard konteksta; ljudska potvrda ostaje obavezna."
        titleLevel="h3"
      />
      <A11ySummary>
        Governance zdravlje: {bundle.health.narrative}. Rizik profil: {bundle.risk.label}. Broj kritičnih upozorenja: {crit.length}.
      </A11ySummary>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <EnterpriseKpiCard label="Governance zdravlje" value={`${bundle.health.score}`} hint={bundle.health.band} />
        <EnterpriseKpiCard label="Operativni rizik" value={bundle.risk.label} hint={bundle.risk.drivers[0] ?? ""} />
        <div className="flex items-center gap-2">
          <EnterpriseStatusBadge severity={sev}>Health band</EnterpriseStatusBadge>
          <EnterpriseAiBadge humanApprovalRequired>HITL</EnterpriseAiBadge>
        </div>
      </div>
      {crit.length ? (
        <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-amber-100/90" aria-label="Kritični signali">
          {crit.map((a) => (
            <li key={a.id}>{a.title}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-xs text-text-muted">Nema kritičnih upozorenja u ovom presjeku.</p>
      )}
    </div>
  );
}

export function OperationalSignalPanel({ lines }: { readonly lines: readonly string[] }): ReactNode {
  return (
    <div className="rounded-2xl border border-border/40 bg-surface-primary/20 p-4" role="region" aria-label="Operativni signali">
      <EnterpriseSectionHeader title="Operativni signali" description="High-signal telemetrija (bez realtime backenda)." titleLevel="h3" />
      <ul className="mt-2 list-inside list-disc text-sm text-text-secondary">
        {lines.map((l, i) => (
          <li key={i}>{l}</li>
        ))}
      </ul>
    </div>
  );
}

export function GovernancePressurePanel({ factors }: { readonly factors: readonly { readonly label: string; readonly detail: string }[] }): ReactNode {
  return (
    <div className="rounded-2xl border border-border/40 bg-surface-primary/20 p-4" role="region" aria-label="Governance pritisak">
      <EnterpriseSectionHeader title="Governance pritisak" description="Faktori iz istog konteksta kao control tower." titleLevel="h3" />
      <ul className="mt-2 space-y-2 text-sm">
        {factors.slice(0, 6).map((f) => (
          <li key={f.label} className="rounded-lg border border-border/35 px-2 py-1.5 text-text-secondary">
            <span className="font-medium text-text-primary">{f.label}</span> — {f.detail}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function EvidenceIntegrityPanel({ bullets }: { readonly bullets: readonly string[] }): ReactNode {
  return (
    <div className="rounded-2xl border border-border/40 bg-surface-primary/20 p-4" role="region" aria-label="Integritet dokaza">
      <EnterpriseSectionHeader title="Integritet dokaza" description="Heuristika tragova — nije automatska odluka." titleLevel="h3" />
      <ul className="mt-2 list-inside list-disc text-sm text-text-secondary">
        {bullets.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>
    </div>
  );
}

export function WorkflowCongestionPanel({ items }: { readonly items: readonly string[] }): ReactNode {
  return (
    <div className="rounded-2xl border border-border/40 bg-surface-primary/20 p-4" role="region" aria-label="Workflow zagušenje">
      <EnterpriseSectionHeader title="Workflow pritisak" description="Identificirani uska grla iz inference sloja." titleLevel="h3" />
      <ul className="mt-2 list-inside list-disc text-sm text-text-secondary">
        {items.map((x, i) => (
          <li key={i}>{x}</li>
        ))}
      </ul>
    </div>
  );
}

export function RiskConcentrationPanel({ drivers }: { readonly drivers: readonly string[] }): ReactNode {
  return (
    <div className="rounded-2xl border border-border/40 bg-surface-primary/20 p-4" role="region" aria-label="Koncentracija rizika">
      <EnterpriseSectionHeader title="Koncentracija rizika" description="Vozači rizika u ovom snapshotu." titleLevel="h3" />
      <ul className="mt-2 list-inside list-disc text-sm text-text-secondary">
        {drivers.map((d, i) => (
          <li key={i}>{d}</li>
        ))}
      </ul>
    </div>
  );
}

export function AuditReadinessPanelPhaseH({ readiness }: { readonly readiness: AuditReadinessBundle }): ReactNode {
  return (
    <div className="rounded-2xl border border-border/40 bg-surface-primary/20 p-4" role="region" aria-label="Audit readiness">
      <EnterpriseSectionHeader title="Audit readiness" description={readiness.narrative} titleLevel="h3" />
      <p className="mt-2 text-sm text-text-secondary">{unifiedReadinessNarration(readiness.band)}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums text-text-primary">{readiness.score} / 100</p>
    </div>
  );
}

export function ComplianceConfidencePanel({ score01 }: { readonly score01: number }): ReactNode {
  const composite = observabilityCompositeScore([{ weight: 1, score01 }]);
  return (
    <div className="rounded-2xl border border-border/40 bg-surface-primary/20 p-4" role="region" aria-label="Compliance pouzdanost">
      <EnterpriseSectionHeader title="Compliance pouzdanost" description="Kompozitni heuristički skor (0–100)." titleLevel="h3" />
      <p className="mt-2 text-2xl font-bold tabular-nums text-text-primary">{composite}</p>
      <A11ySummary>Kompozitni skor {composite} od maksimalno sto.</A11ySummary>
    </div>
  );
}

export function EnterpriseNarrativePanel({ title, body }: { readonly title: string; readonly body: string }): ReactNode {
  return (
    <div className="rounded-2xl border border-border/35 bg-surface-secondary/20 p-4" role="region" aria-label="Narativ">
      <EnterpriseSectionHeader title={title} titleLevel="h3" />
      <p className="mt-2 text-sm leading-relaxed text-text-secondary">{body}</p>
    </div>
  );
}
