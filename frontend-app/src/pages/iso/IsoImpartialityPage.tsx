import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  LayoutList,
  Link2,
  ListChecks,
  Scale,
  Shield,
  TimerOff,
  Users,
} from "lucide-react";
import { type JSX, useMemo, useState } from "react";

import { ContextRibbon } from "@/components/information-disclosure";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { IA_RIBBON_GOVERNANCE_CORE } from "@/lib/workspace-continuity";
import { IsoPageShell } from "@/pages/iso/IsoPageShell";

type ImpartialityThreat = {
  threatId: string;
  tenantId: string;
  title: string;
  description?: string;
  threatType: string;
  sourceType: string;
  threatLevel: string;
  mitigationStatus: string;
  status: string;
  nextReviewDate?: string | null;
  reviewOverdue?: boolean;
  linkedRiskIds?: string[];
  linkedCapaIds?: string[];
  linkedAuditEventIds?: string[];
  linkedDeclarations?: string[];
  involvedUsers?: string[];
};

type ImpartialitySummary = {
  openThreats: number;
  highCriticalOpen: number;
  overdueReviews: number;
  activeDeclarations: number;
  declarationsExpiringSoon: number;
};

type ConflictDeclaration = {
  declarationId: string;
  tenantId: string;
  userId: string;
  status: string;
  declarationText: string;
  declaredAt: string;
  expiresAt?: string | null;
};

const tabs = [
  { id: "register" as const, label: "Registar prijetnji", icon: LayoutList },
  { id: "declarations" as const, label: "COI deklaracije", icon: Users },
  { id: "mitigation" as const, label: "Mitigacija", icon: Shield },
  { id: "reviews" as const, label: "Pregledi", icon: ListChecks },
  { id: "overdue" as const, label: "Prekoračenja", icon: TimerOff },
  { id: "committee" as const, label: "Odbor", icon: Scale },
];

export function ThreatLevelBadge({ level }: { readonly level: string }): JSX.Element {
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

function GovernanceLinks({ row }: { readonly row: ImpartialityThreat }): JSX.Element {
  const risks = row.linkedRiskIds ?? [];
  const capas = row.linkedCapaIds ?? [];
  const audits = row.linkedAuditEventIds ?? [];
  const decls = row.linkedDeclarations ?? [];
  const n = risks.length + capas.length + audits.length + decls.length;
  if (n === 0) {
    return <span className="text-xs text-text-muted">—</span>;
  }
  return (
    <span className="inline-flex flex-wrap items-center gap-1 text-[10px] text-text-muted">
      <Link2 className="h-3 w-3 shrink-0" aria-hidden />
      {risks.length ? <span>R:{risks.length}</span> : null}
      {capas.length ? <span>C:{capas.length}</span> : null}
      {audits.length ? <span>A:{audits.length}</span> : null}
      {decls.length ? <span>D:{decls.length}</span> : null}
    </span>
  );
}

export default function IsoImpartialityPage(): JSX.Element {
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("register");
  const [tenantId] = useState(() => localStorage.getItem("confora.tenantId") ?? "default");

  const listQ = useQuery({
    queryKey: ["iso", "impartiality", "threats", tenantId],
    queryFn: async () => {
      const { data } = await api.get<ImpartialityThreat[]>("/api/iso/impartiality/threats", {
        params: { tenantId },
      });
      return data;
    },
  });

  const declQ = useQuery({
    queryKey: ["iso", "impartiality", "declarations", tenantId],
    queryFn: async () => {
      const { data } = await api.get<ConflictDeclaration[]>("/api/iso/impartiality/declarations", {
        params: { tenantId },
      });
      return data;
    },
  });

  const summaryQ = useQuery({
    queryKey: ["iso", "impartiality", "summary", tenantId],
    queryFn: async () => {
      const { data } = await api.get<ImpartialitySummary>("/api/iso/impartiality/summary", {
        params: { tenantId },
      });
      return data;
    },
  });

  const rows = listQ.data ?? [];
  const decls = declQ.data ?? [];
  const sm = summaryQ.data;

  const activeDeclForUser = useMemo(() => {
    const m = new Map<string, boolean>();
    for (const d of decls) {
      if (String(d.status).toUpperCase() === "ACTIVE") {
        m.set(d.userId, true);
      }
    }
    return m;
  }, [decls]);

  const filtered = useMemo(() => {
    if (tab === "register") return rows;
    if (tab === "mitigation")
      return rows.filter((r) => String(r.mitigationStatus || "").toUpperCase() !== "NOT_STARTED");
    if (tab === "reviews") return rows.filter((r) => ["MONITORING", "UNDER_REVIEW"].includes(String(r.status || "")));
    if (tab === "overdue") return rows.filter((r) => r.reviewOverdue);
    if (tab === "committee")
      return rows.filter((r) => ["UNDER_REVIEW", "MITIGATION_DEFINED", "MONITORING"].includes(String(r.status || "")));
    return rows;
  }, [rows, tab]);

  return (
    <IsoPageShell
      icon={Scale}
      title="Nepristranost (ISO / IEC 17024)"
      description="Registar prijetnji, COI deklaracije, mitigacija i committee pregledi — odvojeno od općeg ISO registra rizika. Trag u strukturiranom audit trailu."
    >
      <ContextRibbon title="IA trag — nepristranost ↔ governance" items={IA_RIBBON_GOVERNANCE_CORE} />
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
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            { k: "Otvorene prijetnje", v: sm.openThreats },
            { k: "HIGH/CRITICAL (otvoreno)", v: sm.highCriticalOpen },
            { k: "Pregled preko roka", v: sm.overdueReviews },
            { k: "Aktivne COI", v: sm.activeDeclarations },
            { k: "COI ističe (30d)", v: sm.declarationsExpiringSoon },
          ].map((x) => (
            <div key={x.k} className="rounded-xl border border-border/45 bg-surface-secondary/35 px-3 py-2">
              <p className="text-[11px] font-medium uppercase tracking-wide text-text-muted">{x.k}</p>
              <p className="mt-1 text-2xl font-semibold text-text-primary">{x.v}</p>
            </div>
          ))}
        </div>
      ) : null}

      {tab === "declarations" ? (
        <div className="mt-6 overflow-x-auto rounded-xl border border-border/45">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-surface-secondary/40 text-xs uppercase text-text-muted">
                <th className="px-3 py-2">Korisnik</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Tekst</th>
              </tr>
            </thead>
            <tbody>
              {decls.map((d) => (
                <tr key={d.declarationId} className="border-b border-border/35">
                  <td className="px-3 py-2 font-mono text-xs">{d.userId}</td>
                  <td className="px-3 py-2">
                    <span className="rounded-md bg-slate-500/15 px-2 py-0.5 text-[11px] ring-1 ring-slate-500/35">
                      {d.status}
                    </span>
                    {String(d.status).toUpperCase() === "ACTIVE" ? (
                      <span className="ml-2 inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-50 ring-1 ring-amber-500/35">
                        <AlertTriangle className="h-3 w-3" aria-hidden />
                        Aktivna COI
                      </span>
                    ) : null}
                  </td>
                  <td className="max-w-md px-3 py-2 text-xs text-text-secondary">{d.declarationText}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {decls.length === 0 ? (
            <p className="px-4 py-6 text-sm text-text-muted">Nema deklaracija u uzorku.</p>
          ) : null}
        </div>
      ) : null}

      {tab !== "declarations" ? (
        <div className="mt-6 overflow-x-auto rounded-xl border border-border/45">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-surface-secondary/40 text-xs uppercase text-text-muted">
                <th className="px-3 py-2">Prijetnja</th>
                <th className="px-3 py-2">Nivo</th>
                <th className="px-3 py-2">Izvor</th>
                <th className="px-3 py-2">Mitigacija</th>
                <th className="px-3 py-2">Pregled / COI</th>
                <th className="px-3 py-2">Poveznice</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.threatId} className="border-b border-border/35">
                  <td className="px-3 py-2">
                    <div className="font-medium text-text-primary">{r.title}</div>
                    <div className="text-[11px] text-text-muted">
                      {r.threatType} · {r.status}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <ThreatLevelBadge level={r.threatLevel} />
                  </td>
                  <td className="px-3 py-2 text-xs text-text-muted">{r.sourceType}</td>
                  <td className="px-3 py-2">
                    <span className="rounded-md bg-slate-500/15 px-2 py-0.5 text-[11px] ring-1 ring-slate-500/35">
                      {r.mitigationStatus}
                    </span>
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
                    {(r.involvedUsers ?? []).some((u) => activeDeclForUser.get(String(u))) ? (
                      <div className="mt-1 text-[10px] font-medium text-amber-200">COI upozorenje (sudionik)</div>
                    ) : null}
                  </td>
                  <td className="px-3 py-2">
                    <GovernanceLinks row={r} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 ? (
            <p className="px-4 py-6 text-sm text-text-muted">Nema stavki za odabrani prikaz.</p>
          ) : null}
        </div>
      ) : null}
    </IsoPageShell>
  );
}
