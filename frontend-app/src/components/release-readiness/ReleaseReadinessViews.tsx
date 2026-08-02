import type { ReactNode } from "react";

import { EnterpriseDegradedModeBanner } from "@/components/error-experience";
import { EnterpriseSectionHeader } from "@/design-system";
import { KNOWN_ISSUES_REGISTRY, type KnownIssue } from "@/lib/known-issues";
import { cn } from "@/lib/utils";

const RC_PHASE = "Phase I — Release candidate (frontend hardening)";

export function ReleaseReadinessPanel({ children }: { readonly children?: ReactNode }): ReactNode {
  return (
    <section
      className="rounded-2xl border border-border/50 bg-surface-secondary/30 p-4 ring-1 ring-white/[0.04]"
      aria-label="Release readiness — interni pregled"
    >
      <EnterpriseSectionHeader
        title="Release readiness"
        description="Interni pregled — sys_admin. Ne dijeliti s vanjskim auditorima bez konteksta."
        titleLevel="h2"
      />
      <p className="sr-only">Sažetak spremnosti platforme za pilot i produkciju.</p>
      {children ? <div className="mt-4 space-y-6">{children}</div> : null}
    </section>
  );
}

const MATRIX: readonly { area: string; rc: "yes" | "partial" | "risk"; note: string }[] = [
  { area: "Routing i guardovi", rc: "yes", note: "App.tsx + IsoRouteGuard — bez backend promjena." },
  { area: "Command center", rc: "yes", note: "Continuity snapshot; nema realtime." },
  { area: "Knowledge / disclosure", rc: "yes", note: "Native details + lazy graf." },
  { area: "Digital twin", rc: "partial", note: "Ovisi o volumenu podataka u twin bundleu." },
  { area: "Pilot dokumentacija", rc: "partial", note: "Ažurirati DEMO_SCRIPT po tenantu." },
];

export function PlatformReadinessMatrix(): ReactNode {
  return (
    <div role="region" aria-label="Matrica spremnosti područja">
      <h3 className="text-sm font-semibold text-text-primary">Platform readiness matrix</h3>
      <p className="mt-1 text-xs text-text-muted">{RC_PHASE}</p>
      <ul className="mt-3 space-y-2 text-sm">
        {MATRIX.map((row) => (
          <li
            key={row.area}
            className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-border/40 bg-surface-primary/15 px-3 py-2"
          >
            <span className="font-medium text-text-primary">{row.area}</span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-semibold",
                row.rc === "yes" && "bg-emerald-500/15 text-emerald-100",
                row.rc === "partial" && "bg-amber-500/15 text-amber-100",
                row.rc === "risk" && "bg-red-500/20 text-red-100",
              )}
            >
              {row.rc === "yes" ? "RC" : row.rc === "partial" ? "Djelomično" : "Rizik"}
            </span>
            <span className="w-full text-xs text-text-secondary">{row.note}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const COVERAGE = [
  "Learner LMS + certifikacijski portal",
  "ISO 17024 moduli (CAPA, rizici, audit, …)",
  "Governance dashboard + control tower",
  "Knowledge workspace",
  "Sys admin / tenant operativa",
];

export function FeatureCoveragePanel(): ReactNode {
  return (
    <div role="region" aria-label="Pokrivenost funkcija">
      <h3 className="text-sm font-semibold text-text-primary">Feature coverage (pilot scope)</h3>
      <ul className="mt-2 list-inside list-disc text-sm text-text-secondary">
        {COVERAGE.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  );
}

export function StabilityOverviewPanel(): ReactNode {
  return (
    <div role="region" aria-label="Stabilnost">
      <h3 className="text-sm font-semibold text-text-primary">Stability overview</h3>
      <ul className="mt-2 space-y-1 text-sm text-text-secondary">
        <li>Vitest smoke + postojeći integracijski obrasci — bez novog workflow sloja.</li>
        <li>ABAC/RBAC semantika netaknuta.</li>
        <li>Performanse: veliki grafovi gated; chunk upozorenja dokumentirana.</li>
      </ul>
    </div>
  );
}

function severityLabel(s: KnownIssue["severity"]): string {
  switch (s) {
    case "blocker":
      return "Bloker";
    case "high":
      return "Visoko";
    case "medium":
      return "Srednje";
    case "low":
      return "Nisko";
    default:
      return "Info";
  }
}

export function KnownIssuesPanel(): ReactNode {
  return (
    <div role="region" aria-label="Poznati problemi">
      <h3 className="text-sm font-semibold text-text-primary">Known issues registry</h3>
      <ul className="mt-3 space-y-3">
        {KNOWN_ISSUES_REGISTRY.map((issue) => (
          <li key={issue.id} className="rounded-xl border border-border/45 bg-surface-primary/10 px-3 py-2 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-text-primary">{issue.title}</span>
              <span className="rounded-md bg-border/30 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-text-muted">
                {severityLabel(issue.severity)}
              </span>
            </div>
            <p className="mt-1 text-text-secondary">{issue.summary}</p>
            {issue.workaround ? (
              <p className="mt-1 text-xs text-text-muted">
                <span className="font-medium text-text-primary">Zaobilaz:</span> {issue.workaround}
              </p>
            ) : null}
            <p className="mt-1 text-[11px] text-text-muted">Pilot: {issue.pilotImpact}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PilotStatusPanel(): ReactNode {
  return (
    <div role="region" aria-label="Pilot status">
      <h3 className="text-sm font-semibold text-text-primary">Pilot status</h3>
      <p className="mt-2 text-sm text-text-secondary">
        Preporuka: koristite <strong className="text-text-primary">PILOT_DEMO_SCRIPT.md</strong> i seed skripte iz repozitorija.
        Definirajte vlasnika za svaku ulogu prije GO/NO-GO sastanka.
      </p>
    </div>
  );
}

/** Jedna montaža za Sys admin stranicu */
export function ReleaseReadinessDashboard(): ReactNode {
  return (
    <ReleaseReadinessPanel>
      <EnterpriseDegradedModeBanner message="Interni alat — ne prikazujte kandidatima ili vanjskim reviewerima bez konteksta ograničenja." />
      <div className="grid gap-6 lg:grid-cols-2">
        <PlatformReadinessMatrix />
        <StabilityOverviewPanel />
        <FeatureCoveragePanel />
        <PilotStatusPanel />
      </div>
      <KnownIssuesPanel />
    </ReleaseReadinessPanel>
  );
}
