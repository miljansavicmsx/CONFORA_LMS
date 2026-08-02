/**
 * Registar izdanih certifikacija osobe (PERSON_CERTIFICATION) — interni ISO pregled.
 */

import { useQuery } from "@tanstack/react-query";
import { ExternalLink, FileStack, Loader2 } from "lucide-react";
import { useMemo, useState, type ChangeEvent, type JSX } from "react";
import { useOutletContext } from "react-router";

import { StaffCertificateLifecyclePanel } from "@/components/certification/StaffCertificateLifecyclePanel";
import { ControlledDocumentAccessPanel } from "@/components/admin/ControlledDocumentAccessPanel";
import { EntityRelationshipPanel } from "@/components/entity-relations";
import { ContextRibbon } from "@/components/information-disclosure";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buildApiUrl } from "@/lib/api";
import { fetchCertificatesRegistry, resolveEffectiveCertRegistrySourceMode, type CertificateRegistryRow } from "@/lib/api-certificates";
import { fetchCertificateLifecycleStatus } from "@/lib/api-staff-cert-lifecycle";
import { resolveActorNestRoles } from "@/lib/certification-assignment-access";
import { shouldLoadLifecycleQuery } from "@/lib/certification-lifecycle-access";
import { extractRealmRolesFromToken } from "@/lib/jwt-payload";
import type { DashboardOutletContext } from "@/pages/dashboard/dashboard-outlet-context";
import { useAuthStore } from "@/stores/authStore";
import { EntityKind, buildRegistryCertificateRelationships } from "@/lib/entity-relationships";
import { IA_RIBBON_KNOWLEDGE_HUB } from "@/lib/workspace-continuity";
import { cn } from "@/lib/utils";
import { IsoPageShell } from "@/pages/iso/IsoPageShell";

const QUERY_KEY = ["certificates", "registry"] as const;

function statusStyle(st: string): string {
  const u = st.toUpperCase();
  if (u === "ACTIVE") return "border-emerald-500/40 bg-emerald-500/10 text-emerald-100";
  if (u.includes("SUSPEND")) return "border-amber-500/40 bg-amber-500/10 text-amber-100";
  if (u.includes("REVOK") || u.includes("WITHDRAW")) return "border-red-500/40 bg-red-500/10 text-red-100";
  return "border-border/50 bg-surface-primary/60 text-text-secondary";
}

export default function CertificatesRegistryIsoPage(): JSX.Element {
  const { user } = useOutletContext<DashboardOutletContext>();
  const accessToken = useAuthStore((s) => s.accessToken);
  const nestRoles = useMemo(
    () =>
      resolveActorNestRoles({
        jwtRoles: extractRealmRolesFromToken(accessToken),
        roleFromProfile: user.role,
      }),
    [accessToken, user.role],
  );
  const shouldLoadLifecycle = useMemo(() => shouldLoadLifecycleQuery(nestRoles), [nestRoles]);

  const [statusFilter, setStatusFilter] = useState<string>("");
  const [retryTick, setRetryTick] = useState(0);
  const [selectedCertId, setSelectedCertId] = useState<string | null>(null);

  const [registrySourceMode, setRegistrySourceMode] = useState<string>("dual");

  const query = useQuery({
    queryKey: [...QUERY_KEY, statusFilter, retryTick] as const,
    queryFn: async () => {
      const mode = await resolveEffectiveCertRegistrySourceMode();
      setRegistrySourceMode(mode);
      return fetchCertificatesRegistry(statusFilter.trim() ? statusFilter.trim() : undefined);
    },
  });

  const rows: CertificateRegistryRow[] = query.data ?? [];

  const selectedRow = useMemo(
    () => rows.find((r) => r.certificateId === selectedCertId) ?? null,
    [rows, selectedCertId],
  );

  const lifecycleQ = useQuery({
    queryKey: ["certificates", "lifecycle", selectedCertId] as const,
    queryFn: () => fetchCertificateLifecycleStatus(selectedCertId!),
    enabled: Boolean(selectedCertId) && shouldLoadLifecycle,
  });

  const verifyBase = useMemo(() => {
    try {
      return buildApiUrl("").replace(/\/api\/?$/, "");
    } catch {
      return "";
    }
  }, []);

  return (
    <IsoPageShell
      icon={FileStack}
      title="Registar certifikata"
      headingTestId="certificates-registry-heading"
      description="Pregled izdanih PERSON_CERTIFICATION zapisa za tenant (ili globalno za sys_admin). Javna provjera na /verify/."
    >
      <ContextRibbon title="IA trag — certifikati ↔ znanje" items={IA_RIBBON_KNOWLEDGE_HUB} />
      <section className="rounded-2xl border border-border/50 bg-surface-secondary/35 p-4 ring-1 ring-white/[0.04] md:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">Filtri</h2>
            <p className="mt-1 text-xs text-text-secondary">Status životnog ciklusa (npr. ACTIVE).</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="flex items-center gap-2 text-xs text-text-muted">
              Status
              <input
                value={statusFilter}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setStatusFilter(e.target.value)}
                placeholder="ACTIVE"
                className="w-36 rounded-md border border-border/50 bg-surface-primary/80 px-2 py-1 text-sm text-text-primary"
              />
            </label>
            <Button type="button" variant="outline" size="sm" onClick={() => void query.refetch()}>
              Osvježi
            </Button>
            {query.isError ? (
              <Button type="button" size="sm" onClick={() => setRetryTick((x) => x + 1)}>
                Pokušaj ponovo
              </Button>
            ) : null}
          </div>
        </div>

        <p
          className="mt-3 text-[11px] text-text-muted"
          data-testid="cert-registry-source-mode"
        >
          Izvor registra: <code>{registrySourceMode}</code> (server{" "}
          <code>GET /v1/staff/certificates/registry-config</code> · env{" "}
          <code>VITE_CERT_REGISTRY_SOURCE</code>)
        </p>

        {query.isLoading ? (
          <div className="mt-8 flex items-center justify-center gap-2 text-text-secondary">
            <Loader2 className="h-6 w-6 animate-spin text-brand" aria-hidden />
            Učitavanje…
          </div>
        ) : null}

        {query.isError ? (
          <p className="mt-6 text-sm text-red-400">Ne možemo učitati registar. Provjerite ovlasti (ISO / odbor).</p>
        ) : null}

        {!query.isLoading && !query.isError && rows.length === 0 ? (
          <p className="mt-6 text-sm text-text-secondary" data-testid="cert-registry-empty">
            Nema zapisa u registru za zadane kriterije.
          </p>
        ) : null}

        {rows.length > 0 ? (
          <p
            className="mt-4 text-xs text-text-muted"
            data-testid={
              registrySourceMode === "nest" ? "cert-registry-nest-only-hint" : "cert-registry-source-hint"
            }
          >
            {registrySourceMode === "nest"
              ? "Pilot tenant: Nest PostgreSQL only — legacy DynamoDB read skipped (F5-UI-8 cutover soak)."
              : "Izvor: legacy DynamoDB i/ili Nest PostgreSQL (tenant-scoped). Filtar statusa je opcionalan."}
          </p>
        ) : null}

        {!query.isLoading && rows.length > 0 ? (
          <div className="mt-6 overflow-x-auto rounded-xl border border-border/40">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-surface-primary/40 text-xs uppercase tracking-wide text-text-muted">
                <tr>
                  <th className="px-3 py-2">Certifikat</th>
                  <th className="px-3 py-2">Broj</th>
                  <th className="px-3 py-2">Kandidat</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Izdano</th>
                  <th className="px-3 py-2">Istječe</th>
                  <th className="px-3 py-2">Prijava</th>
                  <th className="px-3 py-2 text-right">Provjera</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const verifyHref = r.publicVerificationUrl?.trim()
                    ? r.publicVerificationUrl
                    : r.verificationHash
                      ? `${verifyBase}/verify/${r.verificationHash}`
                      : r.learnerVerifyPath || "#";
                  return (
                    <tr
                      key={r.certificateId}
                      data-testid={`cert-registry-row-${r.certificateId}`}
                      className={cn(
                        "cursor-pointer border-t border-border/35 hover:bg-surface-secondary/40",
                        selectedCertId === r.certificateId && "bg-brand/10",
                      )}
                      onClick={() => setSelectedCertId(r.certificateId)}
                    >
                      <td className="px-3 py-2 font-mono text-xs text-text-primary">{r.certificateId}</td>
                      <td
                        className="px-3 py-2 font-mono text-xs text-brand"
                        data-testid={`cert-registry-number-${r.certificateId}`}
                      >
                        {r.certificateNumber?.trim() || "—"}
                      </td>
                      <td className="px-3 py-2 text-text-secondary">{r.holderName}</td>
                      <td className="px-3 py-2">
                        <Badge variant="outline" className={statusStyle(r.status)}>
                          {r.status}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 text-xs text-text-muted">{r.issuedAt ?? "—"}</td>
                      <td className="px-3 py-2 text-xs text-text-muted">{r.expiresAt ?? "—"}</td>
                      <td className="px-3 py-2 font-mono text-xs text-text-muted">
                        {r.linkedApplicationId ?? "—"}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <a
                          href={verifyHref}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Verifikacija
                          <ExternalLink className="h-3 w-3" aria-hidden />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}

        {selectedRow ? (
          <>
            {selectedRow.pdfStorageKey ? (
              <ControlledDocumentAccessPanel
                title="PDF certifikat (S3 ključ — staff only)"
                storageKey={selectedRow.pdfStorageKey}
                statusLabel={selectedRow.status}
                testIdPrefix="cert-pdf-evidence"
                documentKind="certificate_pdf"
                certificateId={selectedRow.certificateId}
              />
            ) : null}
            <StaffCertificateLifecyclePanel
              certificateId={selectedRow.certificateId}
              lifecycle={lifecycleQ.data}
              isLoading={lifecycleQ.isLoading}
              isError={lifecycleQ.isError}
              nestRoles={nestRoles}
            />
            <EntityRelationshipPanel
            title="Registar — lineage & prijava"
            subtitle="Veza prema prijavi i javnoj provjeri iz postojećeg API odgovora."
            centerId={selectedRow.certificateId}
            centerType={EntityKind.CERTIFICATE}
            centerLabel={selectedRow.holderName}
            edges={buildRegistryCertificateRelationships(selectedRow)}
            workflowMeta={{
              workflowType: "PERSON_CERTIFICATION",
              status:
                selectedRow.status.toUpperCase() === "VALID" || selectedRow.status.toUpperCase() === "VALIDAN"
                  ? "ACTIVE"
                  : selectedRow.status,
            }}
            defaultCollapsed
          />
          </>
        ) : null}
      </section>
    </IsoPageShell>
  );
}
