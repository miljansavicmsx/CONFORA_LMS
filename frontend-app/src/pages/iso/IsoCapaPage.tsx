import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ClipboardCheck,
  ClipboardList,
  Eye,
  ListTodo,
  ShieldAlert,
  TimerOff,
} from "lucide-react";
import { type JSX, useMemo, useState } from "react";

import { GovernanceImpactPanel } from "@/components/entity-relations";
import { ContextRibbon } from "@/components/information-disclosure";
import { api } from "@/lib/api";
import { buildCapaModuleGraphEdges } from "@/lib/entity-relationships/relationship-builders";
import { IA_RIBBON_KNOWLEDGE_HUB } from "@/lib/workspace-continuity";
import { cn } from "@/lib/utils";
import { IsoPageShell } from "@/pages/iso/IsoPageShell";

type NonconformityRow = {
  nonconformityId: string;
  tenantId: string;
  sourceType: string;
  sourceReferenceId?: string | null;
  title: string;
  severity: string;
  status: string;
  effectivenessStatus?: string;
  dueDate?: string | null;
  closureBlockedReason?: string | null;
};

type CapaSummary = {
  openNonconformities: number;
  overdueItems: number;
  criticalOpen: number;
  effectivenessEffectiveCount30d: number;
  capaActionsOpen: number;
};

type CapaActionRow = {
  capaId: string;
  actionType: string;
  status: string;
  ownerUserId: string;
  description: string;
  targetDate?: string | null;
};

const tabs = [
  { id: "overview" as const, label: "Pregled", icon: Eye },
  { id: "nonconformities" as const, label: "Neusaglašenosti", icon: ShieldAlert },
  { id: "corrective" as const, label: "Korektivne", icon: ClipboardCheck },
  { id: "preventive" as const, label: "Preventivne", icon: ClipboardList },
  { id: "effectiveness" as const, label: "Effectiveness", icon: ListTodo },
  { id: "overdue" as const, label: "Prekoračenja", icon: TimerOff },
  { id: "severity" as const, label: "Težina", icon: AlertTriangle },
];

function SeverityBadge({ severity }: { readonly severity: string }): JSX.Element {
  const s = String(severity || "").toUpperCase();
  const map: Record<string, string> = {
    LOW: "bg-slate-500/15 text-slate-100 ring-slate-500/30",
    MEDIUM: "bg-amber-500/15 text-amber-100 ring-amber-500/30",
    HIGH: "bg-orange-500/15 text-orange-100 ring-orange-500/30",
    CRITICAL: "bg-rose-600/20 text-rose-50 ring-rose-500/40",
  };
  const cls = map[s] ?? "bg-border/30 text-text-secondary ring-border/40";
  return (
    <span className={cn("inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1", cls)}>{s}</span>
  );
}

function OverdueMarker({ overdue }: { readonly overdue: boolean }): JSX.Element | null {
  if (!overdue) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/15 px-2 py-0.5 text-[11px] font-semibold text-rose-100 ring-1 ring-rose-500/30">
      <TimerOff className="h-3 w-3" aria-hidden />
      Rok
    </span>
  );
}

export default function IsoCapaPage(): JSX.Element {
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("overview");
  const [tenantId] = useState(() => localStorage.getItem("confora.tenantId") ?? "default");

  const summaryQ = useQuery({
    queryKey: ["iso", "capa", "summary", tenantId],
    queryFn: async () => {
      const { data } = await api.get<CapaSummary>("/api/iso/capa/summary", { params: { tenantId } });
      return data;
    },
  });

  const listQ = useQuery({
    queryKey: ["iso", "capa", "ncr", tenantId],
    queryFn: async () => {
      const { data } = await api.get<NonconformityRow[]>("/api/iso/capa/nonconformities", { params: { tenantId } });
      return data;
    },
  });

  const actionsByNcr = useQuery({
    queryKey: ["iso", "capa", "actions", listQ.data?.map((x) => x.nonconformityId).join(",")],
    queryFn: async () => {
      const rows = listQ.data ?? [];
      const out: Record<string, CapaActionRow[]> = {};
      for (const n of rows) {
        const { data } = await api.get<CapaActionRow[]>(`/api/iso/capa/nonconformities/${n.nonconformityId}/actions`);
        out[n.nonconformityId] = data;
      }
      return out;
    },
    enabled: Boolean(listQ.data?.length),
  });

  const now = useMemo(() => new Date(), []);

  const capaCrossEdges = useMemo(() => {
    const rows = listQ.data ?? [];
    const act = actionsByNcr.data ?? {};
    return buildCapaModuleGraphEdges(rows, act, { maxNcrs: 24 });
  }, [listQ.data, actionsByNcr.data]);

  const overdueIds = useMemo(() => {
    const set = new Set<string>();
    for (const n of listQ.data ?? []) {
      const due = n.dueDate ? new Date(n.dueDate) : null;
      if (due && due < now && n.status !== "CLOSED") set.add(n.nonconformityId);
      const acts = actionsByNcr.data?.[n.nonconformityId] ?? [];
      for (const a of acts) {
        const td = a.targetDate ? new Date(a.targetDate) : null;
        if (td && td < now && !["VERIFIED", "REJECTED"].includes(a.status)) set.add(n.nonconformityId);
      }
    }
    return set;
  }, [listQ.data, actionsByNcr.data, now]);

  const filteredList = useMemo(() => {
    const all = listQ.data ?? [];
    if (tab === "nonconformities") return all;
    if (tab === "overdue") return all.filter((n) => overdueIds.has(n.nonconformityId));
    if (tab === "severity") return [...all].sort((a, b) => String(b.severity).localeCompare(String(a.severity)));
    if (tab === "effectiveness")
      return all.filter((n) => String(n.effectivenessStatus || "").toUpperCase() !== "EFFECTIVE" && n.status !== "CLOSED");
    if (tab === "corrective")
      return all.filter((n) =>
        (actionsByNcr.data?.[n.nonconformityId] ?? []).some((a) => a.actionType === "CORRECTIVE"),
      );
    if (tab === "preventive")
      return all.filter((n) =>
        (actionsByNcr.data?.[n.nonconformityId] ?? []).some((a) => a.actionType === "PREVENTIVE"),
      );
    return all;
  }, [listQ.data, tab, overdueIds, actionsByNcr.data]);

  const s = summaryQ.data;

  return (
    <IsoPageShell
      icon={ClipboardCheck}
      title="CAPA i neusaglašenosti"
      description="ISO/IEC 17024 governance sloj: NCR, korektivne i preventivne mjere, effectiveness review i trag u audit_events — nije HR task manager."
    >
      <ContextRibbon title="IA tragovi — CAPA" items={IA_RIBBON_KNOWLEDGE_HUB} />
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

      {tab === "overview" && s ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Otvorene NCR", value: s.openNonconformities },
            { label: "Prekoračenja (NCR/CAPA)", value: s.overdueItems },
            { label: "Kritične otvorene", value: s.criticalOpen },
            { label: "CAPA akcije otvorene", value: s.capaActionsOpen },
            { label: "Effectiveness uzorak (30d)", value: s.effectivenessEffectiveCount30d },
          ].map((x) => (
            <div
              key={x.label}
              className="rounded-xl border border-border/50 bg-surface-secondary/40 px-4 py-3 text-sm text-text-secondary"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">{x.label}</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-text-primary">{x.value}</p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-text-secondary">
            Tenant: <span className="font-mono text-text-primary">{tenantId}</span>
          </p>
        </div>
        {listQ.isError ? (
          <p className="text-sm text-rose-200">Nije moguće učitati NCR (provjerite ulogu i tenant).</p>
        ) : null}
        <ul className="space-y-2">
          {filteredList.map((n) => (
            <li
              key={n.nonconformityId}
              className="rounded-xl border border-border/50 bg-surface-secondary/35 px-4 py-3 text-sm text-text-secondary"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-text-primary">{n.title}</p>
                  <p className="mt-0.5 font-mono text-[11px] text-text-muted">{n.nonconformityId}</p>
                  {n.sourceReferenceId ? (
                    <p className="mt-1 text-[11px] text-amber-100">
                      Izvor: <span className="font-mono">{n.sourceType}</span> ·{" "}
                      <span className="font-mono">{n.sourceReferenceId}</span>
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <SeverityBadge severity={n.severity} />
                  <span className="rounded-md bg-surface-secondary/80 px-2 py-0.5 text-[11px] font-semibold text-text-primary ring-1 ring-border/40">
                    {n.status}
                  </span>
                  <OverdueMarker overdue={overdueIds.has(n.nonconformityId)} />
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-3 text-xs">
                <span>
                  Effectiveness: <strong className="text-text-primary">{n.effectivenessStatus ?? "—"}</strong>
                </span>
                {n.closureBlockedReason ? (
                  <span className="text-amber-100">
                    Blokada: <strong>{n.closureBlockedReason}</strong>
                  </span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {capaCrossEdges.length ? (
        <section className="mt-10 space-y-3 rounded-xl border border-border/45 bg-surface-secondary/25 p-4 ring-1 ring-white/[0.03]">
          <h2 className="text-sm font-semibold text-text-primary">CAPA — cross-module traceability (uzorak)</h2>
          <p className="text-xs text-text-secondary">
            Veze između NCR, izvornih referenci i akcija — gradivo za žalbe, rizike i audit trag (bez novih API-ja).
          </p>
          <GovernanceImpactPanel edges={capaCrossEdges} />
          <ul className="max-h-56 overflow-auto divide-y divide-border/30 text-[11px] text-text-secondary">
            {capaCrossEdges.slice(0, 36).map((e) => (
              <li key={`${e.sourceId}-${e.targetId}-${e.relationshipType}`} className="py-1.5 font-mono">
                <span className="font-sans font-semibold text-text-primary">{e.relationshipType}</span> ·{" "}
                {e.sourceType}:{e.sourceId} → {e.targetType}:{e.targetId}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </IsoPageShell>
  );
}
