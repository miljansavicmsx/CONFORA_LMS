import type { JSX } from "react";

import { EnterpriseKpiCard, EnterpriseSectionHeader, EnterpriseStatusBadge } from "@/design-system";
import type { AuditReadinessBand, AuditReadinessBundle } from "@/lib/audit-readiness";
import { formatAuditReadinessBandHr, formatAuditReadinessScoreNarration } from "@/lib/audit-readiness";
import type { Severity } from "@/design-system/SeverityBadge";

function bandToStatusSeverity(band: AuditReadinessBand): Severity {
  switch (band) {
    case "audit_ready":
      return "success";
    case "mostly_ready":
      return "info";
    case "at_risk":
      return "warning";
    case "critical":
      return "danger";
    default:
      return "info";
  }
}

function bandBadgeLabel(band: AuditReadinessBand): string {
  switch (band) {
    case "audit_ready":
      return "Traka: spreman za audit (H)";
    case "mostly_ready":
      return "Traka: uglavnom spreman";
    case "at_risk":
      return "Traka: povećan rizik";
    case "critical":
      return "Traka: kritičan pritisak";
    default:
      return `Traka: ${band}`;
  }
}

export function AuditGuidancePanel({ readiness }: { readonly readiness: AuditReadinessBundle }): JSX.Element {
  const scoreText = formatAuditReadinessScoreNarration(readiness);
  const bandText = formatAuditReadinessBandHr(readiness.band);

  return (
    <div className="space-y-3 rounded-2xl border border-border/50 bg-surface-primary/20 p-4" role="region" aria-label="Audit guidance i readiness">
      <div aria-live="polite" className="rounded-lg border border-border/35 bg-surface-secondary/25 px-3 py-2 text-sm text-text-secondary">
        <p className="font-medium text-text-primary" id="audit-readiness-status-text">
          {scoreText}
        </p>
        <p className="mt-1">{bandText}</p>
      </div>
      <EnterpriseSectionHeader title="Audit guidance" description={readiness.narrative} />
      <div className="flex flex-wrap items-center gap-2">
        <EnterpriseStatusBadge severity={bandToStatusSeverity(readiness.band)}>{bandBadgeLabel(readiness.band)}</EnterpriseStatusBadge>
        <span className="text-xs text-text-muted">Badge ima tekst — ne oslanjati se samo na boju.</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <EnterpriseKpiCard label="Readiness skor (heuristika)" value={`${readiness.score} / 100`} hint={bandText.slice(0, 72)} />
        <EnterpriseKpiCard label="Blokeri" value={`${readiness.topBlockers.length}`} hint="Heuristički signal" />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase text-text-muted">Top blokeri</p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-text-secondary">
          {readiness.topBlockers.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase text-text-muted">Fokus područja</p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-text-secondary">
          {readiness.auditFocusAreas.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase text-text-muted">Preporučeni dokazi</p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-text-secondary">
          {readiness.recommendedEvidence.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
