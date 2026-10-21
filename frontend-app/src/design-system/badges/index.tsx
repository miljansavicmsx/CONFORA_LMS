import type { JSX, ReactNode } from "react";

import { cn } from "@/lib/utils";

import { ds, type SemanticStatusKey } from "../tokens";
import type { Severity } from "../SeverityBadge";
import { SeverityBadge } from "../SeverityBadge";
import { WorkflowBadge } from "../WorkflowBadge";

/** Status po životnom ciklusu — HR tekst + aria (ne samo boja). */
const statusTone: Record<SemanticStatusKey, string> = {
  active: "border-emerald-500/45 bg-emerald-500/[0.12] text-emerald-50",
  pending: "border-amber-500/45 bg-amber-500/[0.12] text-amber-50",
  blocked: "border-slate-500/45 bg-slate-600/20 text-slate-100",
  expired: "border-red-500/45 bg-red-500/[0.12] text-red-50",
  suspended: "border-amber-500/50 bg-amber-500/[0.14] text-amber-100",
  verified: "border-emerald-500/50 bg-emerald-500/[0.14] text-emerald-100",
  draft: "border-border/55 bg-surface-tertiary/60 text-text-secondary",
  review: "border-sky-500/45 bg-sky-500/[0.12] text-sky-50",
  approved: "border-emerald-500/40 bg-emerald-500/[0.1] text-emerald-100",
  rejected: "border-rose-500/45 bg-rose-500/[0.12] text-rose-50",
};

export function StatusBadge({
  status,
  className,
  children,
  ariaLabel,
}: {
  readonly status: SemanticStatusKey;
  readonly className?: string;
  readonly children?: ReactNode;
  /** Nadjačava dostupnosni tekst ako je vidljivi tekst prilagođen. */
  readonly ariaLabel?: string;
}): JSX.Element {
  const m = ds.statusLabelsHr[status];
  const tone = statusTone[status];
  const label = children ?? m.label;
  const aria = ariaLabel ?? m.aria;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        tone,
        className,
      )}
      aria-label={aria}
    >
      {label}
    </span>
  );
}

export function SeverityBadgeUi({
  severity,
  children,
  className,
}: {
  readonly severity: Severity;
  readonly children: ReactNode;
  readonly className?: string;
}): JSX.Element {
  return (
    <span aria-label={`Ozbiljnost: ${severity}`}>
      {className === undefined ? (
        <SeverityBadge severity={severity}>{children}</SeverityBadge>
      ) : (
        <SeverityBadge severity={severity} className={className}>
          {children}
        </SeverityBadge>
      )}
    </span>
  );
}

export function WorkflowStatusBadge({
  children,
  className,
}: {
  readonly children: ReactNode;
  readonly className?: string;
}): JSX.Element {
  return (
    className === undefined ? (
      <WorkflowBadge>
        <span className="sr-only">Workflow status:</span>
        {children}
      </WorkflowBadge>
    ) : (
      <WorkflowBadge className={className}>
        <span className="sr-only">Workflow status:</span>
        {children}
      </WorkflowBadge>
    )
  );
}

export function AIBadgeStandard({
  className,
  children,
}: {
  readonly children: ReactNode;
  readonly className?: string;
}): JSX.Element {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-violet-400/35 bg-violet-500/[0.12] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-100",
        className,
      )}
      aria-label={ds.aiCopyHr.generated}
    >
      {children}
    </span>
  );
}

export function TrustBadge({
  verified,
  className,
  children,
}: {
  readonly verified?: boolean;
  readonly className?: string;
  readonly children: ReactNode;
}): JSX.Element {
  const label = verified ? ds.statusLabelsHr.verified.label : ds.statusLabelsHr.pending.label;
  const aria = verified ? ds.statusLabelsHr.verified.aria : ds.statusLabelsHr.pending.aria;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        verified
          ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-100"
          : "border-amber-500/40 bg-amber-500/12 text-amber-100",
        className,
      )}
      aria-label={aria}
    >
      <span aria-hidden>{verified ? "✓ " : "! "}</span>
      {children ?? label}
    </span>
  );
}

export function CertificationBadge({
  scope = "credential",
  className,
  children,
}: {
  readonly scope?: "credential" | "exam_pass";
  readonly className?: string;
  readonly children: ReactNode;
}): JSX.Element {
  const aria =
    scope === "exam_pass"
      ? "Potvrda o položenom ispitu programa"
      : "Certifikacija osobe (ISO shema)";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-brand/35 bg-brand/[0.12] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand",
        className,
      )}
      aria-label={aria}
    >
      {children}
    </span>
  );
}

/**
 * Mapiranje stanja dokumenta iz API-ja na DS status (tekst + boja kao sekundarni signal).
 */
export function CredentialLifecycleBadge({
  lifecycleStatus,
}: {
  readonly lifecycleStatus: string;
}): JSX.Element {
  const s = lifecycleStatus.trim().toUpperCase();
  if (
    s === "ACTIVE" ||
    s === "VALID" ||
    s === "VALIDAN"
  ) {
    return <StatusBadge status="active" />;
  }
  if (s === "RECERTIFICATION_DUE") {
    return (
      <StatusBadge status="pending" ariaLabel="Status: Potrebna recertifikacija">
        Recertifikacija
      </StatusBadge>
    );
  }
  if (s === "UNDER_RECERTIFICATION_REVIEW") {
    return <StatusBadge status="review" />;
  }
  if (s === "RENEWED") {
    return (
      <StatusBadge status="approved" ariaLabel="Status: dokument obnovljen">
        Obnovljeno
      </StatusBadge>
    );
  }
  if (s === "ISSUED") {
    return (
      <StatusBadge status="approved" ariaLabel="Status: izdat">
        Izdat
      </StatusBadge>
    );
  }
  if (s === "PENDING_ISSUANCE") {
    return (
      <StatusBadge status="pending" ariaLabel="Status: izdavanje u toku">
        Izdavanje u toku
      </StatusBadge>
    );
  }
  if (s === "EXPIRED" || s === "ISTEKAO") {
    return <StatusBadge status="expired" />;
  }
  if (s === "SUSPENDED" || s === "SUSPENDIRAN") {
    return <StatusBadge status="suspended" />;
  }
  if (
    s === "REVOKED" ||
    s === "OPOZVAN" ||
    s === "WITHDRAWN" ||
    s === "POVUČEN" ||
    s === "REPLACED" ||
    s === "ZAMIJENJEN"
  ) {
    const withdrawn = s === "WITHDRAWN" || s === "POVUČEN";
    const replaced = s === "REPLACED" || s === "ZAMIJENJEN";
    return (
      <StatusBadge status="rejected" ariaLabel={withdrawn ? "Status: povučeno" : replaced ? "Status: zamijenjeno" : "Status: opozvano"}>
        {withdrawn ? "Povučeno" : replaced ? "Zamijenjeno" : "Opozvano"}
      </StatusBadge>
    );
  }
  if (s === "DRAFT" || s === "NACRT") {
    return <StatusBadge status="draft" />;
  }
  const raw = lifecycleStatus.trim() || "—";
  return (
    <span
      className="inline-flex items-center rounded-full border border-border/55 bg-surface-tertiary/60 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-text-secondary"
      aria-label={`Status u registru: ${raw}`}
    >
      {raw}
    </span>
  );
}
