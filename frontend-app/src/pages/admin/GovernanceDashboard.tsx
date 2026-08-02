/**
 * Governance hub — struktura CB-a, dokumentacija, etika, rizici, revizije, CAPA (MVP).
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Boxes, Loader2, Radar, Scale } from "lucide-react";
import { useCallback, useMemo, useState, type JSX } from "react";

import { ExecutiveControlTower } from "@/components/control-tower";
import { GovernanceTopologyMap } from "@/components/digital-twin";
import { EnterpriseNarrativePanel } from "@/components/enterprise-panels";
import { ContextRibbon } from "@/components/information-disclosure";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  type CbGovernanceRecordOut,
  type GovernanceDocumentOut,
  fetchCbEthicsReports,
  fetchCbGovernanceDocuments,
  fetchCbGovernanceMetrics,
  fetchCbGovernanceRecords,
  getCbGovernanceTenantId,
  patchGovernanceDocumentMeta,
} from "@/lib/api-cb-governance";
import {
  type GovernanceCommitteeRow,
  type GovernanceLogSubmitPayload,
  type GovernanceLogType,
  type GovernanceOrganizationRow,
  fetchGovernanceDirectoryCommittees,
  fetchGovernanceDirectoryOrganizations,
  fetchGovernanceLogs,
  fetchRisks,
  submitGovernanceLog,
} from "@/lib/api-governance";
import { DASHBOARD_CONTEXT_QUERY_KEY, fetchDashboardContext } from "@/lib/dashboard-context-api";
import { buildDigitalTwinBundle } from "@/lib/digital-twin";
import { relatedWorkspaceJumps, readInvestigationSnapshot } from "@/lib/workspace-continuity";
import { cn } from "@/lib/utils";
import { RiskRegister } from "@/pages/admin/RiskRegister";

const RISKS_QUERY_KEY = ["governance", "risks"] as const;
const LOGS_QUERY_KEY = ["governance", "logs"] as const;

type HubTab =
  | "tower"
  | "twin"
  | "orgs"
  | "committees"
  | "docs"
  | "ethics"
  | "risks"
  | "audits"
  | "review"
  | "capa";

export default function GovernanceDashboard(): JSX.Element {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<HubTab>("orgs");
  const [tenantInput, setTenantInput] = useState(() => getCbGovernanceTenantId());

  const tenant = useMemo(() => tenantInput.trim() || getCbGovernanceTenantId(), [tenantInput]);

  const [logType, setLogType] = useState<GovernanceLogType>("complaint");
  const [logTitle, setLogTitle] = useState("");
  const [logDescription, setLogDescription] = useState("");
  const [relatedCourseId, setRelatedCourseId] = useState("");
  const [contactRef, setContactRef] = useState("");
  const [logFormError, setLogFormError] = useState<string | null>(null);

  const [docMetaId, setDocMetaId] = useState<string | null>(null);
  const [nextReviewAt, setNextReviewAt] = useState("");
  const [aiMetaJson, setAiMetaJson] = useState('{\n  "schemaVersion": "1",\n  "summary": ""\n}');

  const needsCbData = tab !== "orgs" && tab !== "committees" && tab !== "risks";

  const {
    data: risks = [],
    isLoading: risksLoading,
    isError: risksError,
    isFetching: risksFetching,
  } = useQuery({
    queryKey: RISKS_QUERY_KEY,
    queryFn: fetchRisks,
    enabled: tab === "risks",
  });

  const {
    data: governanceLogs = [],
    isLoading: logsLoading,
    isError: logsError,
    isFetching: logsFetching,
  } = useQuery({
    queryKey: LOGS_QUERY_KEY,
    queryFn: fetchGovernanceLogs,
    enabled: tab === "ethics",
  });

  const { data: orgs = [], isLoading: orgsLoading } = useQuery({
    queryKey: ["governance", "directory", "organizations"],
    queryFn: fetchGovernanceDirectoryOrganizations,
    enabled: tab === "orgs",
  });

  const { data: committees = [], isLoading: committeesLoading } = useQuery({
    queryKey: ["governance", "directory", "committees"],
    queryFn: fetchGovernanceDirectoryCommittees,
    enabled: tab === "committees" || tab === "twin",
  });

  const {
    data: dashboardContextTwin,
    isLoading: twinCtxLoading,
    isError: twinCtxError,
  } = useQuery({
    queryKey: DASHBOARD_CONTEXT_QUERY_KEY,
    queryFn: fetchDashboardContext,
    enabled: tab === "twin",
  });

  const { data: metrics } = useQuery({
    queryKey: ["governance-cb", "metrics", tenant],
    queryFn: () => fetchCbGovernanceMetrics(tenant),
    enabled: needsCbData,
  });

  const { data: documents = [], isLoading: docsLoading } = useQuery({
    queryKey: ["governance-cb", "documents", tenant],
    queryFn: () => fetchCbGovernanceDocuments(tenant),
    enabled: (tab === "docs" || tab === "twin") && !!tenant,
  });

  const { data: ethicsReports = [], isLoading: ethicsLoading } = useQuery({
    queryKey: ["governance-cb", "ethics", tenant],
    queryFn: () => fetchCbEthicsReports(tenant),
    enabled: tab === "ethics" && !!tenant,
  });

  const { data: cbRecords = [], isLoading: cbRecordsLoading } = useQuery({
    queryKey: ["governance-cb", "records", tenant],
    queryFn: () => fetchCbGovernanceRecords({ tenantId: tenant }),
    enabled:
      !!tenant &&
      (tab === "ethics" ||
        tab === "audits" ||
        tab === "review" ||
        tab === "capa" ||
        tab === "tower" ||
        tab === "twin"),
  });

  const impartialityRows = useMemo(
    () => cbRecords.filter((r) => r.entityType === "IMPARTIALITY_RISK"),
    [cbRecords],
  );
  const coiRows = useMemo(() => cbRecords.filter((r) => r.entityType === "COI_RECORD"), [cbRecords]);
  const auditRows = useMemo(
    () => cbRecords.filter((r) => r.entityType === "INTERNAL_AUDIT"),
    [cbRecords],
  );
  const findingRows = useMemo(
    () => cbRecords.filter((r) => r.entityType === "AUDIT_FINDING"),
    [cbRecords],
  );
  const reviewRows = useMemo(
    () => cbRecords.filter((r) => r.entityType === "MANAGEMENT_REVIEW"),
    [cbRecords],
  );
  const capaRows = useMemo(() => cbRecords.filter((r) => r.entityType === "CAPA"), [cbRecords]);

  const towerSupplement = useMemo(
    () => ({
      cbCapaRecords: capaRows.length,
      cbOpenFindings: findingRows.length,
      cbOpenImpartiality: impartialityRows.length,
    }),
    [capaRows.length, findingRows.length, impartialityRows.length],
  );

  const iaContinuityRibbon = useMemo(
    () =>
      relatedWorkspaceJumps(readInvestigationSnapshot()).map((h) => ({
        id: `ia-${h.route}`,
        label: h.label,
        to: h.route,
        hint: h.rationale,
      })),
    [tab],
  );

  const digitalTwinBundle = useMemo(
    () =>
      dashboardContextTwin
        ? buildDigitalTwinBundle({
            ctx: dashboardContextTwin,
            committees,
            governanceDocumentCount: documents.length,
            internalAuditRecords: auditRows.length,
            openAuditFindings: findingRows.length,
          })
        : null,
    [
      dashboardContextTwin,
      committees,
      documents.length,
      auditRows.length,
      findingRows.length,
    ],
  );

  const logMutation = useMutation({
    mutationFn: (payload: GovernanceLogSubmitPayload) => submitGovernanceLog(payload),
    onSuccess: async () => {
      setLogTitle("");
      setLogDescription("");
      setRelatedCourseId("");
      setContactRef("");
      setLogFormError(null);
      await queryClient.invalidateQueries({ queryKey: LOGS_QUERY_KEY });
    },
    onError: () => {
      setLogFormError("Slanje nije uspjelo. Provjeri podatke i API.");
    },
  });

  const patchDocMutation = useMutation({
    mutationFn: async () => {
      if (!docMetaId) throw new Error("Odaberi dokument.");
      let meta: Record<string, unknown> | null = null;
      const raw = aiMetaJson.trim();
      if (raw) {
        try {
          meta = JSON.parse(raw) as Record<string, unknown>;
        } catch {
          throw new Error("Neispravan JSON u aiMetadata.");
        }
      }
      return patchGovernanceDocumentMeta(
        docMetaId,
        {
          nextReviewAt: nextReviewAt.trim() || null,
          aiMetadata: meta,
        },
        tenant,
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["governance-cb", "documents", tenant] });
    },
  });

  const saveDocMetaValidated = useCallback(() => {
    patchDocMutation.mutate();
  }, [patchDocMutation]);

  const handleSubmitLog = useCallback(() => {
    setLogFormError(null);
    if (!logTitle.trim() || !logDescription.trim()) {
      setLogFormError("Naslov i opis su obavezni.");
      return;
    }
    const payload: GovernanceLogSubmitPayload = {
      type: logType,
      title: logTitle.trim(),
      description: logDescription.trim(),
      relatedCourseId: relatedCourseId.trim() || null,
      contactReference: contactRef.trim() || null,
    };
    logMutation.mutate(payload);
  }, [logType, logTitle, logDescription, relatedCourseId, contactRef, logMutation]);

  const beginDocMeta = useCallback((d: GovernanceDocumentOut) => {
    setDocMetaId(d.documentId);
    setNextReviewAt(d.nextReviewAt ?? "");
    setAiMetaJson(JSON.stringify(d.aiMetadata && Object.keys(d.aiMetadata).length ? d.aiMetadata : { schemaVersion: "1", summary: "" }, null, 2));
  }, []);

  return (
    <div className="min-h-0 flex-1 overflow-auto px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 border-b border-border/40 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/15 ring-1 ring-brand/25">
              <Scale className="h-6 w-6 text-brand" aria-hidden />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-text-primary">Governance</h1>
              <p className="mt-1 max-w-2xl text-sm text-text-secondary">
                Sloj za tijelo za certifikaciju — struktura, dokumenti, etika, rizici, revizije i korektivne
                mjere. CB podaci koriste tenant ID (zadano iz env ili polje ispod).
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <Label htmlFor="gov-tenant" className="text-xs text-text-muted">
              Tenant (CB governance)
            </Label>
            <Input
              id="gov-tenant"
              value={tenantInput}
              onChange={(e) => {
                setTenantInput(e.target.value);
              }}
              className="h-9 max-w-xs border-border/60 bg-surface-primary font-mono text-sm text-text-primary"
              placeholder={getCbGovernanceTenantId()}
            />
          </div>
        </header>

        <Tabs value={tab} onValueChange={(v) => setTab(v as HubTab)} className="w-full">
          <TabsList className="mb-6 flex h-auto min-h-10 w-full flex-wrap justify-start gap-1 bg-surface-secondary/60 p-1">
            <TabsTrigger value="tower" className="gap-1.5 text-xs sm:text-sm">
              <Radar className="h-3.5 w-3.5 opacity-70" />
              Control tower
            </TabsTrigger>
            <TabsTrigger value="twin" className="gap-1.5 text-xs sm:text-sm">
              <Boxes className="h-3.5 w-3.5 opacity-70" />
              Digital twin
            </TabsTrigger>
            <TabsTrigger value="orgs" className="gap-1.5 text-xs sm:text-sm">
              <Building2 className="h-3.5 w-3.5 opacity-70" />
              Organizacije
            </TabsTrigger>
            <TabsTrigger value="committees" className="text-xs sm:text-sm">
              Odbori
            </TabsTrigger>
            <TabsTrigger value="docs" className="text-xs sm:text-sm">
              Dokumentacija
            </TabsTrigger>
            <TabsTrigger value="ethics" className="text-xs sm:text-sm">
              Etika
            </TabsTrigger>
            <TabsTrigger value="risks" className="text-xs sm:text-sm">
              Rizici
            </TabsTrigger>
            <TabsTrigger value="audits" className="text-xs sm:text-sm">
              Interne revizije
            </TabsTrigger>
            <TabsTrigger value="review" className="text-xs sm:text-sm">
              Upr. pregled
            </TabsTrigger>
            <TabsTrigger value="capa" className="text-xs sm:text-sm">
              CAPA
            </TabsTrigger>
          </TabsList>

          {needsCbData && metrics ? (
            <div className="mb-6 grid gap-3 sm:grid-cols-3">
              <SummaryStat label="Otvorene etičke prijave" value={String(metrics.openEthicsCount)} />
              <SummaryStat label="Kašnjenja (zapisi)" value={String(metrics.overdueCount)} />
              <SummaryStat label="Tenant" value={metrics.tenantId} mono />
            </div>
          ) : null}

          <TabsContent value="tower" className="space-y-4">
            <p className="text-sm text-text-secondary">
              Enterprise operations intelligence — agregat iz platformskog konteksta i CB brojača (bez backend AI).
            </p>
            <ContextRibbon title="Cross-workspace kontinuitet" items={iaContinuityRibbon} />
            {cbRecordsLoading ? <LoadingLine label="Učitavanje CB zapisa za dopunu konteksta…" /> : null}
            <ExecutiveControlTower supplement={towerSupplement} />
          </TabsContent>

          <TabsContent value="twin" className="space-y-4">
            <p className="text-sm text-text-secondary">
              Enterprise governance topology — digitalni model certifikacionog tijela iz dashboard konteksta, directory
              odbora i CB agregata (bez teškog graph backenda).
            </p>
            {twinCtxLoading ? (
              <LoadingLine label="Učitavanje konteksta za digital twin…" />
            ) : twinCtxError || !digitalTwinBundle ? (
              <div
                className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-50"
                role="alert"
              >
                Nije moguće izgraditi digital twin bez <span className="font-mono text-xs">/api/dashboard/context</span>.
              </div>
            ) : (
              <>
                <EnterpriseNarrativePanel
                  title="Digital twin — storytelling"
                  body="Prvo sidrite kontekst u odborima i dokumentima; zatim povezujte čvorove u modelu s operativnim modulima (CAPA, audit, odluke). Bez automatskih governance odluka."
                />
                {(committeesLoading || cbRecordsLoading || docsLoading) ? (
                  <p className="flex items-center gap-2 text-xs text-text-muted">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                    Ažuriranje directory / dokumenata / CB zapisa za model…
                  </p>
                ) : null}
                <GovernanceTopologyMap bundle={digitalTwinBundle} governanceDocumentCount={documents.length} />
              </>
            )}
          </TabsContent>

          <TabsContent value="orgs" className="space-y-4">
            <p className="text-sm text-text-secondary">
              Pravna lica iz registra — čitanje za governance uloge (API:{" "}
              <span className="font-mono text-xs">GET /api/governance/directory/organizations</span>).
            </p>
            {orgsLoading ? (
              <LoadingLine label="Učitavanje organizacija…" />
            ) : (
              <OrgTable rows={orgs} />
            )}
          </TabsContent>

          <TabsContent value="committees" className="space-y-4">
            <p className="text-sm text-text-secondary">
              Sačinjenost odbora i dodijeljeni članovi (čitanje za governance; CRUD ostaje na SysAdmin).
            </p>
            {committeesLoading ? (
              <LoadingLine label="Učitavanje odbora…" />
            ) : (
              <CommitteeSection committees={committees} />
            )}
          </TabsContent>

          <TabsContent value="docs" className="space-y-6">
            <p className="text-sm text-text-secondary">
              Politike / procedure — verzije, sljedeći pregled, AI metapodaci (JSON-LD-friendly struktura u
              JSON polju).
            </p>
            {docsLoading ? (
              <LoadingLine label="Učitavanje dokumenata…" />
            ) : (
              <DocSection
                documents={documents}
                docMetaId={docMetaId}
                nextReviewAt={nextReviewAt}
                aiMetaJson={aiMetaJson}
                onPickDoc={beginDocMeta}
                onNextReviewChange={setNextReviewAt}
                onAiMetaChange={setAiMetaJson}
                onSaveMeta={saveDocMetaValidated}
                patchPending={patchDocMutation.isPending}
                patchError={patchDocMutation.isError}
                patchMutationError={patchDocMutation.error instanceof Error ? patchDocMutation.error.message : null}
              />
            )}
          </TabsContent>

          <TabsContent value="ethics" className="space-y-10">
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-text-primary">Anonimne etičke prijave (CB)</h2>
              {ethicsLoading ? (
                <LoadingLine label="Učitavanje etike…" />
              ) : ethicsReports.length === 0 ? (
                <p className="text-sm text-text-muted">Nema prijava za ovaj tenant.</p>
              ) : (
                <ul className="space-y-2">
                  {ethicsReports.map((row, i) => (
                    <li
                      key={String(row.reportId ?? row.referenceToken ?? i)}
                      className="rounded-xl border border-border/50 bg-surface-secondary/50 p-4 text-sm"
                    >
                      <pre className="max-h-40 overflow-auto whitespace-pre-wrap font-mono text-xs text-text-secondary">
                        {JSON.stringify(row, null, 2)}
                      </pre>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-text-primary">Nepristranost i sukob interesa</h2>
              {cbRecordsLoading ? (
                <LoadingLine label="Učitavanje zapisa…" />
              ) : (
                <div className="grid gap-6 lg:grid-cols-2">
                  <RecordList title="Impartiality risk" rows={impartialityRows} />
                  <RecordList title="COI evidencija" rows={coiRows} />
                </div>
              )}
            </section>

            <GovernanceLogFormSection
              logType={logType}
              setLogType={setLogType}
              logTitle={logTitle}
              setLogTitle={setLogTitle}
              logDescription={logDescription}
              setLogDescription={setLogDescription}
              relatedCourseId={relatedCourseId}
              setRelatedCourseId={setRelatedCourseId}
              contactRef={contactRef}
              setContactRef={setContactRef}
              logFormError={logFormError}
              logMutationPending={logMutation.isPending}
              onSubmit={handleSubmitLog}
            />

            <section>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold text-text-primary">Governance log (žalbe / whistleblowing)</h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-fit border-border/60 bg-surface-secondary/80"
                  onClick={() => {
                    void queryClient.invalidateQueries({ queryKey: LOGS_QUERY_KEY });
                  }}
                  disabled={logsFetching}
                >
                  {logsFetching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Osvježi
                </Button>
              </div>
              {logsLoading ? (
                <LoadingLine label="Učitavanje logova…" />
              ) : logsError ? (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-200">
                  Ne mogu učitati logove (potrebna governance uloga).
                </div>
              ) : governanceLogs.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border/50 bg-surface-secondary/20 p-8 text-center text-sm text-text-muted">
                  Nema zapisa.
                </p>
              ) : (
                <ul className="space-y-3">
                  {governanceLogs.map((row) => (
                    <li
                      key={row.logId}
                      className="rounded-xl border border-border/50 bg-surface-secondary/50 p-4 ring-1 ring-white/[0.03]"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-medium text-text-primary">{row.title}</span>
                        <span className="rounded-full bg-brand/15 px-2 py-0.5 text-xs font-medium text-brand">
                          {row.type}
                        </span>
                      </div>
                      <p className="mt-2 line-clamp-3 text-sm text-text-secondary">{row.description}</p>
                      <p className="mt-2 font-mono text-xs text-text-muted">{row.logId}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </TabsContent>

          <TabsContent value="risks" className="space-y-4">
            <RiskRegister
              risks={risks}
              risksLoading={risksLoading}
              risksError={risksError}
              risksFetching={risksFetching}
            />
          </TabsContent>

          <TabsContent value="audits" className="space-y-6">
            <p className="text-sm text-text-secondary">
              Plan i evidencija internih revizija, nalazi (povezivanje preko{' '}
              <span className="font-mono text-xs">linkedRecordIds</span> u servisu).
            </p>
            {cbRecordsLoading ? (
              <LoadingLine label="Učitavanje…" />
            ) : (
              <>
                <RecordList title="Interne revizije" rows={auditRows} />
                <RecordList title="Nalazi revizije" rows={findingRows} />
              </>
            )}
          </TabsContent>

          <TabsContent value="review" className="space-y-4">
            <p className="text-sm text-text-secondary">Upravljački pregled — datum, dnevni red, bilješke, akcije.</p>
            {cbRecordsLoading ? <LoadingLine label="Učitavanje…" /> : <RecordList title="Management review" rows={reviewRows} />}
          </TabsContent>

          <TabsContent value="capa" className="space-y-4">
            <p className="text-sm text-text-secondary">
              Korektivne mjere — izvor, uzrok, odgovorna osoba, rok, provjera učinkovitosti (payload + polja
              zapisa).
            </p>
            {cbRecordsLoading ? <LoadingLine label="Učitavanje…" /> : <RecordList title="CAPA" rows={capaRows} />}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function SummaryStat(props: { readonly label: string; readonly value: string; readonly mono?: boolean }): JSX.Element {
  return (
    <div className="rounded-xl border border-border/50 bg-surface-secondary/40 px-4 py-3 ring-1 ring-white/[0.04]">
      <p className="text-xs font-medium uppercase tracking-wide text-text-muted">{props.label}</p>
      <p className={cn("mt-1 text-lg font-semibold text-text-primary", props.mono && "font-mono text-sm")}>
        {props.value}
      </p>
    </div>
  );
}

function LoadingLine(props: { readonly label: string }): JSX.Element {
  return (
    <div className="flex items-center gap-2 text-text-secondary">
      <Loader2 className="h-5 w-5 animate-spin text-brand" />
      {props.label}
    </div>
  );
}

function OrgTable(props: { readonly rows: readonly GovernanceOrganizationRow[] }): JSX.Element {
  if (props.rows.length === 0) {
    return <p className="text-sm text-text-muted">Nema organizacija u tablici.</p>;
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-border/50 bg-surface-secondary/40">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border/50 text-xs uppercase tracking-wider text-text-muted">
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">Naziv</th>
            <th className="px-4 py-3">Reg. broj</th>
            <th className="px-4 py-3">Država</th>
          </tr>
        </thead>
        <tbody>
          {props.rows.map((o) => (
            <tr key={o.organizationId} className="border-b border-border/30">
              <td className="px-4 py-3 font-mono text-xs text-brand">{o.organizationId}</td>
              <td className="px-4 py-3 text-text-primary">{o.legalName}</td>
              <td className="px-4 py-3 text-text-secondary">{o.registrationNumber ?? "—"}</td>
              <td className="px-4 py-3 text-text-secondary">{o.country ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CommitteeSection(props: { readonly committees: readonly GovernanceCommitteeRow[] }): JSX.Element {
  if (props.committees.length === 0) {
    return <p className="text-sm text-text-muted">Nema odbora.</p>;
  }
  return (
    <ul className="space-y-4">
      {props.committees.map((c) => (
        <li
          key={c.committeeId}
          className="rounded-2xl border border-border/50 bg-surface-secondary/45 p-5 ring-1 ring-white/[0.04]"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-base font-semibold text-text-primary">{c.name}</h3>
            <span className="rounded-full bg-brand/15 px-2 py-0.5 font-mono text-xs text-brand">{c.committeeType}</span>
          </div>
          <p className="mt-1 text-xs text-text-muted">
            {c.committeeId} · status: {c.status}
          </p>
          <div className="mt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted">Članovi</p>
            {c.members.length === 0 ? (
              <p className="mt-2 text-sm text-text-muted">Nema dodijeljenih članova.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {c.members.map((m) => (
                  <li key={`${c.committeeId}-${m.userId}`} className="flex flex-wrap gap-2 text-sm">
                    <span className="font-mono text-xs text-brand">{m.userId}</span>
                    <span className="text-text-secondary">{m.roleInCommittee}</span>
                    {m.active === false ? <span className="text-xs text-amber-300">neaktivan</span> : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

function DocSection(props: {
  readonly documents: readonly GovernanceDocumentOut[];
  readonly docMetaId: string | null;
  readonly nextReviewAt: string;
  readonly aiMetaJson: string;
  readonly onPickDoc: (d: GovernanceDocumentOut) => void;
  readonly onNextReviewChange: (v: string) => void;
  readonly onAiMetaChange: (v: string) => void;
  readonly onSaveMeta: () => void;
  readonly patchPending: boolean;
  readonly patchError: boolean;
  readonly patchMutationError: string | null;
}): JSX.Element {
  if (props.documents.length === 0) {
    return <p className="text-sm text-text-muted">Nema dokumenata za tenant (API stvara POST /cb-governance/documents).</p>;
  }
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <ul className="space-y-3">
        {props.documents.map((d) => (
          <li key={d.documentId}>
            <button
              type="button"
              onClick={() => props.onPickDoc(d)}
              className={cn(
                "w-full rounded-xl border px-4 py-3 text-left transition-colors",
                props.docMetaId === d.documentId
                  ? "border-brand/50 bg-brand/10 ring-1 ring-brand/30"
                  : "border-border/50 bg-surface-secondary/40 hover:bg-surface-secondary/70",
              )}
            >
              <p className="font-medium text-text-primary">{d.title}</p>
              <p className="mt-1 font-mono text-xs text-text-muted">
                {d.documentId} · {d.docType} · v{d.currentVersion}
              </p>
              {d.nextReviewAt ? (
                <p className="mt-2 text-xs text-text-secondary">Slj. pregled: {d.nextReviewAt}</p>
              ) : null}
            </button>
          </li>
        ))}
      </ul>
      <div className="rounded-2xl border border-border/50 bg-surface-secondary/40 p-6 ring-1 ring-white/[0.04]">
        <h3 className="text-sm font-semibold text-text-primary">Metapodaci (pregled / AI)</h3>
        <p className="mt-1 text-xs text-text-muted">
          ISO-style next review i strukturirani JSON za kasnije RAG / semantičko indeksiranje.
        </p>
        <div className="mt-4 space-y-3">
          <div>
            <Label className="text-text-secondary">Sljedeći pregled (ISO datum)</Label>
            <Input
              value={props.nextReviewAt}
              onChange={(e) => props.onNextReviewChange(e.target.value)}
              className="mt-1 border-border/60 bg-surface-primary font-mono text-sm"
              placeholder="2026-12-31"
            />
          </div>
          <div>
            <Label className="text-text-secondary">aiMetadata (JSON)</Label>
            <textarea
              value={props.aiMetaJson}
              onChange={(e) => props.onAiMetaChange(e.target.value)}
              rows={12}
              className="mt-1 w-full rounded-md border border-border/60 bg-surface-primary px-3 py-2 font-mono text-xs text-text-primary"
            />
          </div>
          {props.patchMutationError ? (
            <p className="text-sm text-red-400">{props.patchMutationError}</p>
          ) : props.patchError ? (
            <p className="text-sm text-red-400">Spremanje nije uspjelo (provjeri ovlasti).</p>
          ) : null}
          <Button
            type="button"
            className="bg-brand text-white hover:bg-brand/90"
            disabled={!props.docMetaId || props.patchPending}
            onClick={props.onSaveMeta}
          >
            {props.patchPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Spremam…
              </>
            ) : (
              "Spremi metapodatke"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function RecordList(props: { readonly title: string; readonly rows: readonly CbGovernanceRecordOut[] }): JSX.Element {
  if (props.rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/50 bg-surface-secondary/20 p-6 text-sm text-text-muted">
        Nema zapisa tipa „{props.title}”.
      </div>
    );
  }
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-text-primary">{props.title}</h3>
      <ul className="space-y-3">
        {props.rows.map((r) => (
          <li
            key={r.recordId}
            className="rounded-xl border border-border/50 bg-surface-secondary/45 p-4 ring-1 ring-white/[0.03]"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium text-text-primary">{r.title}</span>
              <span className="rounded-full bg-brand/15 px-2 py-0.5 text-xs font-medium text-brand">{r.status}</span>
            </div>
            {r.description ? (
              <p className="mt-2 text-sm text-text-secondary">{r.description}</p>
            ) : null}
            <dl className="mt-3 grid gap-1 text-xs text-text-muted sm:grid-cols-2">
              <div>
                <dt className="inline text-text-muted">Rok:</dt>{" "}
                <dd className="inline font-mono text-text-secondary">{r.dueDate ?? "—"}</dd>
              </div>
              <div>
                <dt className="inline text-text-muted">Odgovoran:</dt>{" "}
                <dd className="inline font-mono text-text-secondary">{r.assignedToUserId ?? "—"}</dd>
              </div>
            </dl>
            {Object.keys(r.payload).length > 0 ? (
              <pre className="mt-3 max-h-36 overflow-auto rounded-lg bg-black/30 p-2 font-mono text-[10px] text-text-muted">
                {JSON.stringify(r.payload, null, 2)}
              </pre>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

function GovernanceLogFormSection(props: {
  readonly logType: GovernanceLogType;
  readonly setLogType: (t: GovernanceLogType) => void;
  readonly logTitle: string;
  readonly setLogTitle: (v: string) => void;
  readonly logDescription: string;
  readonly setLogDescription: (v: string) => void;
  readonly relatedCourseId: string;
  readonly setRelatedCourseId: (v: string) => void;
  readonly contactRef: string;
  readonly setContactRef: (v: string) => void;
  readonly logFormError: string | null;
  readonly logMutationPending: boolean;
  readonly onSubmit: () => void;
}): JSX.Element {
  return (
    <section
      className={cn("rounded-2xl border border-border/50 bg-surface-secondary/40 p-6 ring-1 ring-white/[0.04]")}
    >
      <h2 className="text-lg font-semibold text-text-primary">Novi governance log</h2>
      <p className="mt-1 text-sm text-text-secondary">Žalba, pritužba ili whistleblowing kanal.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label className="text-text-secondary">Vrsta</Label>
          <select
            value={props.logType}
            onChange={(e) => {
              props.setLogType(e.target.value as GovernanceLogType);
            }}
            className="h-10 w-full max-w-md rounded-md border border-border/60 bg-surface-primary px-3 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
          >
            <option value="complaint">Pritužba</option>
            <option value="appeal">Žalba</option>
            <option value="whistleblowing">Whistleblowing</option>
          </select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="g-title" className="text-text-secondary">
            Naslov
          </Label>
          <Input
            id="g-title"
            value={props.logTitle}
            onChange={(e) => props.setLogTitle(e.target.value)}
            className="border-border/60 bg-surface-primary text-text-primary"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="g-desc" className="text-text-secondary">
            Opis
          </Label>
          <textarea
            id="g-desc"
            value={props.logDescription}
            onChange={(e) => props.setLogDescription(e.target.value)}
            rows={5}
            className="w-full rounded-md border border-border/60 bg-surface-primary px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="g-course" className="text-text-secondary">
            courseId (opc.)
          </Label>
          <Input
            id="g-course"
            value={props.relatedCourseId}
            onChange={(e) => props.setRelatedCourseId(e.target.value)}
            className="border-border/60 bg-surface-primary text-text-primary"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="g-ref" className="text-text-secondary">
            Referenca (opc.)
          </Label>
          <Input
            id="g-ref"
            value={props.contactRef}
            onChange={(e) => props.setContactRef(e.target.value)}
            className="border-border/60 bg-surface-primary text-text-primary"
          />
        </div>
      </div>
      {props.logFormError ? <p className="mt-4 text-sm text-red-400">{props.logFormError}</p> : null}
      <div className="mt-6">
        <Button
          type="button"
          className="bg-brand text-white hover:bg-brand/90"
          disabled={props.logMutationPending}
          onClick={props.onSubmit}
        >
          {props.logMutationPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Šaljem…
            </>
          ) : (
            "Pošalji zapis"
          )}
        </Button>
      </div>
    </section>
  );
}
