import { useQuery } from "@tanstack/react-query";
import { AlertOctagon, Grid3x3, LayoutList, ListChecks, Shield, TimerOff } from "lucide-react";
import { type JSX, useMemo, useState } from "react";

import { EntityRelationshipPanel, RelationshipBadge } from "@/components/entity-relations";
import { ContextRibbon } from "@/components/information-disclosure";
import { api } from "@/lib/api";
import { EntityKind, buildRiskGovernanceRelationships } from "@/lib/entity-relationships";
import { IA_RIBBON_KNOWLEDGE_HUB } from "@/lib/workspace-continuity";
import { MARKETING_BADGE_LABELS } from "@/lib/entity-relationships/relationship-badges";
import { cn } from "@/lib/utils";
import { IsoPageShell } from "@/pages/iso/IsoPageShell";

type RiskRecord = {
  riskId: string;
  tenantId: string;
  title: string;
  description?: string;
  category: string;
  sourceType: string;
  sourceReferenceId?: string | null;
  linkedCapaIds?: string[] | null;
  linkedAuditEventIds?: string[] | null;
  ownerUserId: string;
  likelihood: number;
  impact: number;
  inherentRiskScore: number;
  riskLevel: string;
  mitigationMeasures: string[];
  mitigationStatus: string;
  residualRiskScore?: number | null;
  residualRiskLevel?: string | null;
  status: string;
  nextReviewDate?: string | null;
  lastReviewDate?: string | null;
  acceptedByUserId?: string | null;
  acceptedAt?: string | null;
  reviewOverdue?: boolean;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
};

type RiskSummary = {
  openRisks: number;
  highCriticalOpen: number;
  overdueReviews: number;
  mitigatingCount: number;
  heatmapCounts: Record<string, number>;
};

const tabs = [
  { id: "register" as const, label: "Registar", icon: LayoutList },
  { id: "mitigation" as const, label: "Mitigacija", icon: Shield },
  { id: "reviews" as const, label: "Pregledi", icon: ListChecks },
  { id: "overdue" as const, label: "Prekoračenja", icon: TimerOff },
  { id: "heatmap" as const, label: "Heatmap 5×5", icon: Grid3x3 },
  { id: "category" as const, label: "Kategorije", icon: AlertOctagon },
];

function RiskLevelBadge({ level }: { readonly level: string }): JSX.Element {
  const s = String(level || "").toUpperCase();
  const map: Record<string, string> = {
    LOW: "bg-emerald-500/15 text-emerald-100 ring-emerald-500/35",
    MEDIUM: "bg-amber-500/15 text-amber-100 ring-amber-500/35",
    HIGH: "bg-orange-600/20 text-orange-50 ring-orange-500/40",
    CRITICAL: "bg-rose-600/25 text-rose-50 ring-rose-500/45",
  };
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1",
        map[s] ?? "bg-border/30 text-text-secondary ring-border/45",
      )}
    >
      {s}
    </span>
  );
}

function MitigationBadge({ status }: { readonly status: string }): JSX.Element {
  const s = String(status || "").toUpperCase();
  return (
    <span className="inline-flex rounded-md bg-slate-500/15 px-2 py-0.5 text-[11px] font-medium text-slate-100 ring-1 ring-slate-500/35">
      {s}
    </span>
  );
}

export default function IsoRisksPage(): JSX.Element {
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("register");
  const [tenantId] = useState(() => localStorage.getItem("confora.tenantId") ?? "default");
  const [selectedRiskId, setSelectedRiskId] = useState<string | null>(null);

  const listQ = useQuery({
    queryKey: ["iso", "risks", tenantId],
    queryFn: async () => {
      const { data } = await api.get<RiskRecord[]>("/api/iso/risks", { params: { tenantId } });
      return data;
    },
  });

  const summaryQ = useQuery({
    queryKey: ["iso", "risks", "summary", tenantId],
    queryFn: async () => {
      const { data } = await api.get<RiskSummary>("/api/iso/risks/summary", { params: { tenantId } });
      return data;
    },
  });

  const rows = listQ.data ?? [];
  const sm = summaryQ.data;

  const byCategory = useMemo(() => {
    const m = new Map<string, RiskRecord[]>();
    for (const r of rows) {
      const c = String(r.category || "OTHER");
      if (!m.has(c)) m.set(c, []);
      m.get(c)!.push(r);
    }
    return m;
  }, [rows]);

  const heatCells = useMemo(() => {
    const grid: { li: string; c: number }[] = [];
    for (let l = 1; l <= 5; l += 1) {
      for (let i = 1; i <= 5; i += 1) {
        const k = `L${l}I${i}`;
        grid.push({ li: k, c: sm?.heatmapCounts?.[k] ?? 0 });
      }
    }
    return grid;
  }, [sm]);

  const selectedRisk = useMemo(
    () => rows.find((r) => r.riskId === selectedRiskId) ?? null,
    [rows, selectedRiskId],
  );

  const riskTraceEdges = useMemo(
    () => (selectedRisk ? buildRiskGovernanceRelationships(selectedRisk) : []),
    [selectedRisk],
  );

  const filtered = useMemo(() => {
    if (tab === "register") return rows;
    if (tab === "mitigation")
      return rows.filter((r) => String(r.mitigationStatus || "").toUpperCase() !== "NOT_STARTED");
    if (tab === "reviews") return [...rows].filter((r) => r.lastReviewDate);
    if (tab === "overdue") return rows.filter((r) => r.reviewOverdue);
    if (tab === "heatmap") return rows;
    if (tab === "category") return rows;
    return rows;
  }, [rows, tab]);

  return (
    <IsoPageShell
      icon={Shield}
      title="Registar rizika (ISO 17024)"
      description="Governance sloj: inherent/residual procjena, vlasništvo, mitigacija, pregledi i trag u audit_events — odvojeno od CAPA modela i legacy risk registra."
    >
      <ContextRibbon title="IA tragovi — rizici" items={IA_RIBBON_KNOWLEDGE_HUB} />
      <div className="flex flex-wrap gap-2 border-b border-border/40 pb-4">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium ring-1 transition",
              tab === t.id
                ? "bg-brand/15 text-text-primary ring-brand/35"
                : "bg-surface-secondary/40 text-text-secondary ring-border/50 hover:bg-surface-secondary/70",
            )}
          >
            <t.icon className="h-4 w-4" aria-hidden />
            {t.label}
          </button>
        ))}
      </div>

      <p className="mt-3 text-xs text-text-muted">
        Tenant: <span className="font-mono text-text-primary">{tenantId}</span>
      </p>

      {sm ? (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { k: "Otvoreno", v: sm.openRisks },
            { k: "HIGH/CRITICAL (otvoreno)", v: sm.highCriticalOpen },
            { k: "Pregled preko roka", v: sm.overdueReviews },
            { k: "Mitigacija (status)", v: sm.mitigatingCount },
          ].map((x) => (
            <div key={x.k} className="rounded-xl border border-border/45 bg-surface-secondary/35 px-3 py-2">
              <p className="text-[11px] font-medium uppercase tracking-wide text-text-muted">{x.k}</p>
              <p className="mt-1 text-2xl font-semibold text-text-primary">{x.v}</p>
            </div>
          ))}
        </div>
      ) : null}

      {tab === "heatmap" && (
        <div className="mt-6">
          <p className="mb-2 text-sm font-medium text-text-primary">Inherent — vjerojatnost × utjecaj (L×I)</p>
          <div className="grid max-w-md grid-cols-5 gap-1.5">
            {heatCells.map((cell) => (
              <div
                key={cell.li}
                title={cell.li}
                className={cn(
                  "flex aspect-square items-center justify-center rounded-md text-xs font-semibold ring-1",
                  cell.c === 0
                    ? "bg-slate-900/40 text-slate-400 ring-border/40"
                    : cell.c < 3
                      ? "bg-amber-500/20 text-amber-50 ring-amber-500/35"
                      : "bg-rose-600/25 text-rose-50 ring-rose-500/40",
                )}
              >
                {cell.c}
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-text-muted">Čelija = broj rizika s tim inherent L×I parom u uzorku.</p>
        </div>
      )}

      {tab === "category" && (
        <div className="mt-6 space-y-4">
          {[...byCategory.entries()].map(([cat, items]) => (
            <div key={cat} className="rounded-xl border border-border/45 bg-surface-secondary/30 p-3">
              <p className="text-sm font-semibold text-text-primary">
                {cat}{" "}
                <span className="text-xs font-normal text-text-muted">({items.length})</span>
              </p>
              <ul className="mt-2 divide-y divide-border/35 text-sm">
                {items.map((r) => (
                  <li key={r.riskId} className="flex flex-wrap items-center justify-between gap-2 py-2">
                    <span className="font-medium text-text-primary">{r.title}</span>
                    <RiskLevelBadge level={r.riskLevel} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {tab !== "heatmap" && tab !== "category" && (
        <div className="mt-6 overflow-x-auto rounded-xl border border-border/45">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-surface-secondary/40 text-xs uppercase text-text-muted">
                <th className="px-3 py-2">Rizik</th>
                <th className="px-3 py-2">Nivo</th>
                <th className="px-3 py-2">Inherent</th>
                <th className="px-3 py-2">Residual</th>
                <th className="px-3 py-2">Mitigacija</th>
                <th className="px-3 py-2">Pregled</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.riskId}
                  className={cn(
                    "cursor-pointer border-b border-border/35 hover:bg-surface-secondary/40",
                    selectedRiskId === r.riskId && "bg-brand/10",
                  )}
                  onClick={() => setSelectedRiskId(r.riskId)}
                >
                  <td className="px-3 py-2">
                    <div className="font-medium text-text-primary">{r.title}</div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-text-muted">
                      <span>
                        {r.category} · {r.sourceType}
                      </span>
                      {(r.linkedCapaIds?.length ?? 0) > 0 ? (
                        <RelationshipBadge
                          label={`${MARKETING_BADGE_LABELS.linkedCapa} ×${r.linkedCapaIds?.length ?? 0}`}
                          tone="governance"
                        />
                      ) : null}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <RiskLevelBadge level={r.riskLevel} />
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">
                    {r.inherentRiskScore} <span className="text-text-muted">({r.likelihood}×{r.impact})</span>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">
                    {r.residualRiskScore != null ? (
                      <>
                        {r.residualRiskScore}{" "}
                        {r.residualRiskLevel ? <RiskLevelBadge level={r.residualRiskLevel} /> : null}
                      </>
                    ) : (
                      <span className="text-text-muted">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <MitigationBadge status={r.mitigationStatus} />
                  </td>
                  <td className="px-3 py-2">
                    {r.reviewOverdue ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/15 px-2 py-0.5 text-[11px] font-semibold text-rose-100 ring-1 ring-rose-500/35">
                        <TimerOff className="h-3 w-3" aria-hidden />
                        Prekoračeno
                      </span>
                    ) : (
                      <span className="text-xs text-text-muted">{r.nextReviewDate ?? "—"}</span>
                    )}
                    {r.acceptedAt ? (
                      <div className="mt-1 text-[10px] text-emerald-300">Prihvaćeno</div>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 ? (
            <p className="px-4 py-6 text-sm text-text-muted">Nema stavki za odabrani prikaz.</p>
          ) : null}
        </div>
      )}

      {selectedRisk ? (
        <EntityRelationshipPanel
          title={`Rizik — traceability (${selectedRisk.riskId.slice(0, 8)}…)`}
          subtitle="Povezani CAPA, izvor i audit reference kada su prisutni u payloadu."
          centerId={selectedRisk.riskId}
          centerType={EntityKind.RISK}
          centerLabel={selectedRisk.title}
          edges={riskTraceEdges}
          workflowMeta={{ workflowType: "RISK", status: selectedRisk.status }}
        />
      ) : (
        <p className="mt-6 text-xs text-text-muted">Odaberite red u registru za enterprise pregled veza.</p>
      )}
    </IsoPageShell>
  );
}
