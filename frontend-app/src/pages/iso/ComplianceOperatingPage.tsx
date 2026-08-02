import { useQuery } from "@tanstack/react-query";
import { Loader2, Radar, Shield } from "lucide-react";
import { Suspense, lazy, type JSX, useMemo, useState } from "react";
import { Link } from "react-router";

import {
  AccreditationExposurePanel,
  AuditReadinessPanel,
  ComplianceControlPanel,
  ComplianceFrameworkPanel,
  ComplianceGapPanel,
  ComplianceMaturityPanel,
  ComplianceTelemetryStrip,
  CorrectiveExposurePanel,
  EvidenceCoveragePanel,
  RequirementTraceabilityPanel,
} from "@/components/compliance";
import { Button } from "@/components/ui/button";
import { fetchCbGovernanceDocuments, fetchCbGovernanceRecords, getCbGovernanceTenantId } from "@/lib/api-cb-governance";
import { fetchGovernanceDirectoryCommittees } from "@/lib/api-governance";
import { buildComplianceOperatingBundle } from "@/lib/compliance";
import type { FrameworkId } from "@/lib/compliance";
import { DASHBOARD_CONTEXT_QUERY_KEY, fetchDashboardContext } from "@/lib/dashboard-context-api";

import { IsoPageShell } from "./IsoPageShell";

const RequirementCoverageMatrix = lazy(async () => {
  const m = await import("@/components/compliance/RequirementCoverageMatrix");
  return { default: m.RequirementCoverageMatrix };
});

function MatrixFallback(): JSX.Element {
  return (
    <div
      className="flex min-h-[160px] items-center justify-center rounded-2xl border border-border/40 bg-surface-secondary/30 text-sm text-text-secondary"
      role="status"
      aria-live="polite"
    >
      Učitavanje matrice pokrivenosti…
    </div>
  );
}

export default function ComplianceOperatingPage(): JSX.Element {
  const tenant = useMemo(() => getCbGovernanceTenantId(), []);
  const [framework, setFramework] = useState<FrameworkId>("ISO17024");

  const ctxQ = useQuery({ queryKey: DASHBOARD_CONTEXT_QUERY_KEY, queryFn: fetchDashboardContext });
  const committeesQ = useQuery({ queryKey: ["governance", "directory", "committees", "compliance"], queryFn: fetchGovernanceDirectoryCommittees });
  const docsQ = useQuery({
    queryKey: ["governance-cb", "documents", tenant, "compliance"],
    queryFn: () => fetchCbGovernanceDocuments(tenant),
    enabled: !!tenant,
  });

  const recordsQ = useQuery({
    queryKey: ["governance-cb", "records", tenant, "compliance"],
    queryFn: () => fetchCbGovernanceRecords({ tenantId: tenant }),
    enabled: !!tenant,
  });

  const internalAuditRecords = useMemo(
    () => (recordsQ.data ?? []).filter((r) => r.entityType === "INTERNAL_AUDIT").length,
    [recordsQ.data],
  );
  const openAuditFindings = useMemo(
    () => (recordsQ.data ?? []).filter((r) => r.entityType === "AUDIT_FINDING").length,
    [recordsQ.data],
  );

  const bundle = useMemo(() => {
    if (!ctxQ.data) return null;
    return buildComplianceOperatingBundle(ctxQ.data, committeesQ.data ?? [], {
      governanceDocumentCount: docsQ.data?.length ?? 0,
      internalAuditRecords,
      openAuditFindings,
    });
  }, [ctxQ.data, committeesQ.data, docsQ.data?.length, internalAuditRecords, openAuditFindings]);

  if (ctxQ.isLoading || !bundle) {
    return (
      <IsoPageShell title="Compliance OS" description="Učitavanje konteksta…" icon={Shield}>
        <div className="flex items-center gap-2 py-12 text-text-secondary">
          <Loader2 className="h-6 w-6 animate-spin text-brand" aria-hidden />
          Sinkronizacija dashboard agregata…
        </div>
      </IsoPageShell>
    );
  }

  if (ctxQ.isError) {
    return (
      <IsoPageShell title="Compliance OS" description="Greška konteksta." icon={Shield}>
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-50" role="alert">
          Nije moguće učitati `/api/dashboard/context`.
        </div>
      </IsoPageShell>
    );
  }

  return (
    <IsoPageShell
      title="Accreditation & compliance OS"
      description="Enterprise orchestration pokrivenosti, dokaza i audit readiness — heuristika na frontendu, bez regulatornog motora."
      icon={Shield}
    >
      <p className="sr-only">{bundle.ariaSummary}</p>

      <div className="mb-6 flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" asChild>
          <Link to="/dashboard/iso/audit">
            <Radar className="mr-1.5 h-3.5 w-3.5" aria-hidden />
            Audit trail
          </Link>
        </Button>
        <Button type="button" variant="outline" size="sm" asChild>
          <Link to="/dashboard/iso/capa">CAPA</Link>
        </Button>
        <Button type="button" variant="outline" size="sm" asChild>
          <Link to="/dashboard/iso/management-review">Management review</Link>
        </Button>
        <Button type="button" variant="outline" size="sm" asChild>
          <Link to="/dashboard/iso/governance">Governance hub</Link>
        </Button>
        <Button type="button" variant="outline" size="sm" asChild>
          <Link to="/dashboard/iso/reports">Izvještaji</Link>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            void ctxQ.refetch();
            void committeesQ.refetch();
            void docsQ.refetch();
            void recordsQ.refetch();
          }}
        >
          Osvježi podatke
        </Button>
      </div>

      <ComplianceTelemetryStrip slices={bundle.telemetry} />

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <ComplianceFrameworkPanel activeFramework={framework} onFrameworkChange={setFramework} />
          <Suspense fallback={<MatrixFallback />}>
            <RequirementCoverageMatrix rows={bundle.coverageRows} frameworkId={framework} />
          </Suspense>
          <EvidenceCoveragePanel mappings={bundle.evidenceMappings} />
          <RequirementTraceabilityPanel links={bundle.traceability} />
        </div>
        <div className="space-y-4">
          <ComplianceMaturityPanel maturity={bundle.maturity} />
          <CorrectiveExposurePanel s={bundle.snapshot} />
          <ComplianceControlPanel controls={bundle.controls} />
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <AuditReadinessPanel domains={bundle.domainReadiness} />
        <AccreditationExposurePanel items={bundle.accreditationExposure} />
      </div>

      <div className="mt-6">
        <ComplianceGapPanel gaps={bundle.gaps} />
      </div>
    </IsoPageShell>
  );
}
