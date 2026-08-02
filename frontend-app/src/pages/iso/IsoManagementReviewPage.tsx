import { useQuery } from "@tanstack/react-query";
import { ClipboardList, TimerOff } from "lucide-react";
import { type JSX, useMemo, useState } from "react";

import { EntityRelationshipPanel } from "@/components/entity-relations";
import { ContextRibbon } from "@/components/information-disclosure";
import { api } from "@/lib/api";
import { EntityKind, buildManagementReviewTraceabilityRelationships } from "@/lib/entity-relationships";
import { IA_RIBBON_KNOWLEDGE_HUB } from "@/lib/workspace-continuity";
import { cn } from "@/lib/utils";
import { IsoPageShell } from "@/pages/iso/IsoPageShell";

type GovernanceKpi = {
  certificatesTotalSampled?: number;
  examPassActive?: number;
  personCertificationActive?: number;
  appealsOpen?: number;
  complaintsOpen?: number;
  capaClosureRatePct?: number;
  riskOverdueReviews?: number;
  impartialityOpenThreats?: number;
  examPassRatioLabel?: string;
  recertificationPendingLabel?: string;
};

type RegisterSummary = {
  draftCount: number;
  inReviewCount: number;
  pendingApprovalCount: number;
  approvedCount: number;
  openActions: number;
  overdueActions: number;
};

type TenantSummaryResponse = {
  registerSummary: RegisterSummary;
  governanceKpi: GovernanceKpi;
};

type ReviewRow = {
  reviewId: string;
  tenantId: string;
  title: string;
  reviewType: string;
  status: string;
  linkedCapaIds?: string[] | null;
  linkedRiskIds?: string[] | null;
  reviewPeriodFrom?: string;
  reviewPeriodTo?: string;
  overallEffectiveness?: string;
  nextReviewDate?: string | null;
  actionOpenCount?: number;
  actionOverdueCount?: number;
  reviewOverdue?: boolean;
  staleDraftWarning?: boolean;
  kpiSnapshot?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
};

type ActionRow = {
  actionId: string;
  reviewId: string;
  title: string;
  status: string;
  effectivenessStatus?: string;
  dueDate?: string;
  overdue?: boolean;
  ownerUserId?: string;
};

type InputRow = {
  inputId: string;
  title: string;
  inputType: string;
  summary?: string;
};

function EffectivenessBadge({ value }: { value: string | undefined }): JSX.Element {
  const v = String(value || "").toUpperCase();
  const tone =
    v === "EFFECTIVE"
      ? "bg-emerald-500/15 text-emerald-800 ring-emerald-500/25"
      : v === "PARTIAL"
        ? "bg-amber-500/15 text-amber-900 ring-amber-500/25"
        : v === "INEFFECTIVE"
          ? "bg-red-500/15 text-red-900 ring-red-500/25"
          : "bg-surface-secondary text-text-secondary ring-border/40";
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold ring-1", tone)}>{value || "—"}</span>
  );
}

export default function IsoManagementReviewPage(): JSX.Element {
  const [tenantId] = useState(() => localStorage.getItem("confora.tenantId") ?? "default");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const summaryQ = useQuery({
    queryKey: ["iso", "management-review", "summary", tenantId],
    queryFn: async () => {
      const { data } = await api.get<TenantSummaryResponse>("/api/iso/management-review/summary", {
        params: { tenantId },
      });
      return data;
    },
  });

  const reviewsQ = useQuery({
    queryKey: ["iso", "management-review", "reviews", tenantId],
    queryFn: async () => {
      const { data } = await api.get<ReviewRow[]>("/api/iso/management-review/reviews", {
        params: { tenantId },
      });
      return data;
    },
  });

  const detailId = selectedId ?? reviewsQ.data?.[0]?.reviewId ?? null;

  const detailReview = useMemo(
    () => reviewsQ.data?.find((r) => r.reviewId === detailId) ?? null,
    [reviewsQ.data, detailId],
  );

  const actionsQ = useQuery({
    enabled: Boolean(detailId),
    queryKey: ["iso", "management-review", "actions", tenantId, detailId],
    queryFn: async () => {
      const { data } = await api.get<ActionRow[]>(
        `/api/iso/management-review/reviews/${detailId}/actions`,
        { params: { tenantId } },
      );
      return data;
    },
  });

  const inputsQ = useQuery({
    enabled: Boolean(detailId),
    queryKey: ["iso", "management-review", "inputs", tenantId, detailId],
    queryFn: async () => {
      const { data } = await api.get<InputRow[]>(
        `/api/iso/management-review/reviews/${detailId}/inputs`,
        { params: { tenantId } },
      );
      return data;
    },
  });

  const mrTraceEdges = useMemo(() => {
    if (!detailId || !detailReview) return [];
    return buildManagementReviewTraceabilityRelationships(
      {
        reviewId: detailId,
        ...(detailReview.title ? { title: detailReview.title } : {}),
        status: detailReview.status,
        linkedCapaIds: detailReview.linkedCapaIds,
        linkedRiskIds: detailReview.linkedRiskIds,
      },
      inputsQ.data,
      actionsQ.data,
    );
  }, [detailId, detailReview, inputsQ.data, actionsQ.data]);

  const sm = summaryQ.data;
  const kpi = sm?.governanceKpi;
  const reg = sm?.registerSummary;

  const overdueReviews = useMemo(() => (reviewsQ.data ?? []).filter((r) => r.reviewOverdue || r.staleDraftWarning), [
    reviewsQ.data,
  ]);

  return (
    <IsoPageShell
      icon={ClipboardList}
      title="Pregled rukovodstva (ISO / IEC 17024)"
      description="Governance ciklus: KPI iz postojećih modula, formalni ulazi i akcijski planovi. Audit trail: MANAGEMENT_REVIEW_* i MANAGEMENT_ACTION_* događaji."
    >
      <ContextRibbon title="IA trag — upravljački pregled" items={IA_RIBBON_KNOWLEDGE_HUB} />
      <p className="text-xs text-text-muted">
        Tenant: <span className="font-mono text-text-primary">{tenantId}</span>
      </p>

      {reg && kpi ? (
        <section className="mt-4 space-y-3">
          <h2 className="text-sm font-semibold text-text-primary">Governance KPI (agregat tenant)</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
            {[
              { label: "Certifikati (uzorak)", v: kpi.certificatesTotalSampled ?? "—" },
              { label: "EXAM_PASS (akt.)", v: kpi.examPassActive ?? "—" },
              { label: "Osobna cert. (akt.)", v: kpi.personCertificationActive ?? "—" },
              { label: "Žalbe otv.", v: kpi.appealsOpen ?? "—" },
              { label: "Pritužbe otv.", v: kpi.complaintsOpen ?? "—" },
              { label: "CAPA zatv. % (uz.)", v: kpi.capaClosureRatePct ?? "—" },
              { label: "Rizici — rok pregleda", v: kpi.riskOverdueReviews ?? "—" },
              { label: "Impartiality prijetnje", v: kpi.impartialityOpenThreats ?? "—" },
            ].map((c) => (
              <div
                key={c.label}
                className="rounded-xl border border-border/40 bg-surface-secondary/35 p-3 ring-1 ring-border/35"
              >
                <p className="text-xs text-text-muted">{c.label}</p>
                <p className="mt-1 font-semibold tabular-nums text-text-primary">{String(c.v)}</p>
              </div>
            ))}
          </div>
          {(kpi.examPassRatioLabel || kpi.recertificationPendingLabel) && (
            <div className="rounded-xl border border-border/40 bg-surface-secondary/25 p-3 text-sm text-text-secondary">
              <p>{kpi.examPassRatioLabel}</p>
              <p>{kpi.recertificationPendingLabel}</p>
            </div>
          )}
        </section>
      ) : (
        summaryQ.isLoading && <p className="mt-4 text-sm text-text-muted">Učitavanje KPI…</p>
      )}

      {reg && (
        <section className="mt-6">
          <h2 className="text-sm font-semibold text-text-primary">Registar pregleda</h2>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-text-secondary">
            <span>Nacrt: {reg.draftCount}</span>
            <span>U tijeku: {reg.inReviewCount}</span>
            <span>Čeka odobrenje: {reg.pendingApprovalCount}</span>
            <span>Odobreno: {reg.approvedCount}</span>
            <span>Otvorene akcije: {reg.openActions}</span>
            <span className="inline-flex items-center gap-1 text-amber-800">
              <TimerOff className="h-3.5 w-3.5" aria-hidden />
              Prekoračene akcije: {reg.overdueActions}
            </span>
          </div>
        </section>
      )}

      <section className="mt-6 space-y-2">
        <h2 className="text-sm font-semibold text-text-primary">Pregledi i odabrani ciklus</h2>
        <div className="max-h-56 overflow-auto rounded-xl border border-border/40">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-surface-secondary/80 text-xs uppercase text-text-muted">
              <tr>
                <th className="px-3 py-2">Naslov</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Tip</th>
                <th className="px-3 py-2">Efektivnost</th>
                <th className="px-3 py-2">Akcije</th>
              </tr>
            </thead>
            <tbody>
              {(reviewsQ.data ?? []).map((r) => (
                <tr
                  key={r.reviewId}
                  className={cn(
                    "cursor-pointer border-t border-border/30 hover:bg-surface-secondary/50",
                    detailId === r.reviewId && "bg-brand/10",
                  )}
                  onClick={() => setSelectedId(r.reviewId)}
                >
                  <td className="px-3 py-2 font-medium text-text-primary">{r.title}</td>
                  <td className="px-3 py-2">
                    <span className="font-mono text-xs">{r.status}</span>
                    {r.staleDraftWarning ? (
                      <span className="ml-2 text-xs text-amber-800">zastareo nacrt</span>
                    ) : null}
                    {r.reviewOverdue ? (
                      <span className="ml-2 text-xs text-red-800">rok next review</span>
                    ) : null}
                  </td>
                  <td className="px-3 py-2 text-text-secondary">{r.reviewType}</td>
                  <td className="px-3 py-2">
                    <EffectivenessBadge value={r.overallEffectiveness} />
                  </td>
                  <td className="px-3 py-2 text-xs text-text-secondary">
                    otv. {r.actionOpenCount ?? 0} / prek. {r.actionOverdueCount ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {overdueReviews.length > 0 && (
        <section className="mt-6">
          <h2 className="text-sm font-semibold text-text-primary">Upozorenja (rok / zastarelo)</h2>
          <ul className="mt-2 list-inside list-disc text-sm text-text-secondary">
            {overdueReviews.map((r) => (
              <li key={r.reviewId}>
                {r.title}{" "}
                <span className="font-mono text-xs">
                  ({r.reviewId.slice(0, 8)}… / {r.status})
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {detailId && (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section>
            <h2 className="text-sm font-semibold text-text-primary">Ulazi</h2>
            <ul className="mt-2 space-y-2 text-sm">
              {(inputsQ.data ?? []).map((i) => (
                <li key={i.inputId} className="rounded-lg border border-border/40 bg-surface-secondary/30 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-brand/10 px-2 py-0.5 text-xs font-semibold uppercase text-brand">
                      {i.inputType}
                    </span>
                    <span className="font-medium">{i.title}</span>
                  </div>
                  {i.summary ? <p className="mt-1 text-text-secondary">{i.summary}</p> : null}
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="text-sm font-semibold text-text-primary">Akcijski planovi</h2>
            <ul className="mt-2 space-y-2 text-sm">
              {(actionsQ.data ?? []).map((a) => (
                <li key={a.actionId} className="rounded-lg border border-border/40 bg-surface-secondary/30 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">{a.title}</span>
                    <span className="font-mono text-xs text-text-muted">{a.status}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                    <span>Rok: {a.dueDate ?? "—"}</span>
                    {a.overdue ? <span className="text-amber-800">prekoračeno</span> : null}
                    <EffectivenessBadge value={a.effectivenessStatus} />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}

      {detailId ? (
        <EntityRelationshipPanel
          title="Management review — governance traceability"
          subtitle="Povezani CAPA/rizici, ulazi i akcije — iz istog tenant API odgovora."
          centerId={detailId}
          centerType={EntityKind.MANAGEMENT_REVIEW}
          {...(detailReview?.title ? { centerLabel: detailReview.title } : {})}
          edges={mrTraceEdges}
          {...(detailReview
            ? { workflowMeta: { workflowType: "MANAGEMENT_REVIEW", status: detailReview.status } }
            : {})}
        />
      ) : null}

      <section className="mt-8 rounded-xl border border-dashed border-border/50 bg-surface-secondary/20 p-4 text-xs text-text-secondary">
        <p className="font-semibold text-text-primary">Vremenska os</p>
        <p className="mt-1">
          Lifecycle: <span className="font-mono">DRAFT → IN_REVIEW → COMPLETED → APPROVED</span>. SoD blokira kombinacije
          kreator/odobravatelj te vlasnika akcije i verifikatora učinkovitosti.
        </p>
      </section>
    </IsoPageShell>
  );
}
