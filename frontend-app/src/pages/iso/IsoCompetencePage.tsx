import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { AlertTriangle, BadgeCheck, ClipboardList, Clock, Inbox, List, Shield } from "lucide-react";
import { type JSX, useMemo, useState } from "react";

import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { IsoPageShell } from "@/pages/iso/IsoPageShell";

type ProfileRow = {
  profileId: string;
  userId: string;
  fullName?: string | null;
  primaryIsoRole: string;
  status: string;
  validUntil?: string | null;
  nextReviewDate?: string | null;
};

type EvaluationRow = {
  evaluationId: string;
  profileId: string;
  evaluatorUserId: string;
  evaluationType: string;
  decision: string;
  createdAt: string;
};

const tabs = [
  { id: "profiles", label: "Profili", icon: List },
  { id: "evaluations", label: "Evaluacije", icon: ClipboardList },
  { id: "approvals", label: "Odobrenja (review)", icon: Inbox },
  { id: "expirations", label: "Istici", icon: Clock },
  { id: "reminders", label: "Podsjetnici", icon: AlertTriangle },
] as const;

function StatusBadge({ status }: { readonly status: string }): JSX.Element {
  const s = String(status || "").toUpperCase();
  const map: Record<string, string> = {
    ACTIVE: "bg-emerald-500/15 text-emerald-200 ring-emerald-500/40",
    EXPIRED: "bg-amber-500/20 text-amber-100 ring-amber-500/35",
    SUSPENDED: "bg-red-500/15 text-red-100 ring-red-500/35",
    LIMITED: "bg-sky-500/15 text-sky-100 ring-sky-500/35",
    UNDER_REVIEW: "bg-violet-500/15 text-violet-100 ring-violet-500/35",
    DRAFT: "bg-zinc-500/15 text-zinc-200 ring-zinc-500/35",
  };
  const cls = map[s] ?? "bg-border/30 text-text-secondary ring-border/50";
  return (
    <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1", cls)}>
      {s}
    </span>
  );
}

function blockedCompetenceMessage(err: unknown): string | null {
  if (!isAxiosError(err)) return null;
  const d = err.response?.data as { detail?: { code?: string; message?: string } | string } | undefined;
  const detail = d?.detail;
  if (typeof detail === "object" && detail?.code === "COMPETENCE_REQUIRED") {
    return detail.message ?? "Potrebna je aktivna kompetencija za ovu poslovnu aktivnost (ISO 17024).";
  }
  return null;
}

export default function IsoCompetencePage(): JSX.Element {
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("profiles");

  const profilesQ = useQuery({
    queryKey: ["iso", "competence", "profiles"],
    queryFn: async () => {
      const { data } = await api.get<ProfileRow[]>("/api/iso/competence/profiles");
      return data;
    },
  });

  const expQ = useQuery({
    queryKey: ["iso", "competence", "expirations"],
    queryFn: async () => {
      const { data } = await api.get<ProfileRow[]>("/api/iso/competence/summary/expirations");
      return data;
    },
    enabled: tab === "expirations",
  });

  const remQ = useQuery({
    queryKey: ["iso", "competence", "reminders"],
    queryFn: async () => {
      const { data } = await api.get<ProfileRow[]>("/api/iso/competence/summary/reminders");
      return data;
    },
    enabled: tab === "reminders",
  });

  const pendingApproval = useMemo(
    () => (profilesQ.data ?? []).filter((p) => String(p.status).toUpperCase() === "UNDER_REVIEW"),
    [profilesQ.data],
  );

  const evalQ = useQuery({
    queryKey: ["iso", "competence", "evaluations", profilesQ.data?.map((p) => p.profileId).join(",")],
    queryFn: async () => {
      const rows: EvaluationRow[] = [];
      for (const p of (profilesQ.data ?? []).slice(0, 40)) {
        try {
          const { data } = await api.get<EvaluationRow[]>(`/api/iso/competence/profiles/${p.profileId}/evaluations`);
          rows.push(...data);
        } catch (e) {
          if (isAxiosError(e) && e.response?.status === 403) continue;
          throw e;
        }
      }
      rows.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
      return rows.slice(0, 200);
    },
    enabled: tab === "evaluations" && Boolean(profilesQ.data?.length),
  });

  const err = profilesQ.error ?? expQ.error ?? remQ.error ?? evalQ.error;

  return (
    <IsoPageShell
      title="Upravljanje kompetencijama"
      description="Governance sloj iznad RBAC-a: mandat osoblja prema ISO ulozi, životni ciklus profila i evidencija evaluacija."
      icon={Shield}
    >
      {blockedCompetenceMessage(err) ? (
        <div
          className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-50"
          role="alert"
        >
          <div className="flex items-start gap-2">
            <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <div>
              <p className="font-semibold">Kompetencija potrebna</p>
              <p className="mt-1 text-amber-100/95">{blockedCompetenceMessage(err)}</p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2 border-b border-border/30 pb-3">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              tab === t.id
                ? "bg-brand/15 text-brand ring-1 ring-brand/30"
                : "text-text-secondary hover:bg-brand/5 hover:text-text-primary",
            )}
          >
            <t.icon className="h-4 w-4 opacity-80" aria-hidden />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "profiles" && (
        <section className="overflow-x-auto rounded-xl border border-border/40 bg-surface-elevated/40">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border/40 text-[11px] uppercase tracking-wide text-text-muted">
              <tr>
                <th className="px-3 py-2">Profil</th>
                <th className="px-3 py-2">ISO uloga</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Valjan do</th>
                <th className="px-3 py-2">Sljedeći pregled</th>
              </tr>
            </thead>
            <tbody>
              {(profilesQ.data ?? []).map((p) => (
                <tr key={p.profileId} className="border-b border-border/20 last:border-0">
                  <td className="px-3 py-2">
                    <div className="font-medium text-text-primary">{p.fullName || p.userId}</div>
                    <div className="text-[11px] text-text-muted">{p.profileId}</div>
                  </td>
                  <td className="px-3 py-2 text-text-secondary">{p.primaryIsoRole}</td>
                  <td className="px-3 py-2">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-3 py-2 text-text-secondary">{p.validUntil ?? "—"}</td>
                  <td className="px-3 py-2 text-text-secondary">{p.nextReviewDate ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {profilesQ.isLoading ? <p className="p-4 text-sm text-text-muted">Učitavanje…</p> : null}
        </section>
      )}

      {tab === "approvals" && (
        <section className="space-y-3">
          <p className="text-sm text-text-secondary">
            Profili u <strong>UNDER_REVIEW</strong> čekaju formalno odobrenje (certification_manager / admin).
          </p>
          <div className="overflow-x-auto rounded-xl border border-border/40 bg-surface-elevated/40">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="border-b border-border/40 text-[11px] uppercase tracking-wide text-text-muted">
                <tr>
                  <th className="px-3 py-2">Profil</th>
                  <th className="px-3 py-2">ISO uloga</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {pendingApproval.map((p) => (
                  <tr key={p.profileId} className="border-b border-border/20 last:border-0">
                    <td className="px-3 py-2 font-medium text-text-primary">{p.fullName || p.userId}</td>
                    <td className="px-3 py-2 text-text-secondary">{p.primaryIsoRole}</td>
                    <td className="px-3 py-2">
                      <StatusBadge status={p.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === "expirations" && (
        <section className="overflow-x-auto rounded-xl border border-amber-500/25 bg-amber-500/5">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-border/40 text-[11px] uppercase tracking-wide text-text-muted">
              <tr>
                <th className="px-3 py-2">Profil</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Valjan do</th>
              </tr>
            </thead>
            <tbody>
              {(expQ.data ?? []).map((p) => (
                <tr key={p.profileId} className="border-b border-border/20 last:border-0">
                  <td className="px-3 py-2 font-medium text-text-primary">{p.fullName || p.userId}</td>
                  <td className="px-3 py-2">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-3 py-2 text-amber-100">{p.validUntil ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {expQ.isLoading ? <p className="p-4 text-sm text-text-muted">Učitavanje…</p> : null}
        </section>
      )}

      {tab === "reminders" && (
        <section className="overflow-x-auto rounded-xl border border-border/40 bg-surface-elevated/40">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-border/40 text-[11px] uppercase tracking-wide text-text-muted">
              <tr>
                <th className="px-3 py-2">Profil</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Valjan do</th>
              </tr>
            </thead>
            <tbody>
              {(remQ.data ?? []).map((p) => (
                <tr key={p.profileId} className="border-b border-border/20 last:border-0">
                  <td className="px-3 py-2 font-medium text-text-primary">{p.fullName || p.userId}</td>
                  <td className="px-3 py-2">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-3 py-2 text-text-secondary">{p.validUntil ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {remQ.isLoading ? <p className="p-4 text-sm text-text-muted">Učitavanje…</p> : null}
        </section>
      )}

      {tab === "evaluations" && (
        <section className="overflow-x-auto rounded-xl border border-border/40 bg-surface-elevated/40">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-border/40 text-[11px] uppercase tracking-wide text-text-muted">
              <tr>
                <th className="px-3 py-2">Evaluacija</th>
                <th className="px-3 py-2">Profil</th>
                <th className="px-3 py-2">Tip</th>
                <th className="px-3 py-2">Odluka</th>
                <th className="px-3 py-2">Evaluator</th>
              </tr>
            </thead>
            <tbody>
              {(evalQ.data ?? []).map((e) => (
                <tr key={e.evaluationId} className="border-b border-border/20 last:border-0">
                  <td className="px-3 py-2 text-[11px] text-text-muted">{e.evaluationId}</td>
                  <td className="px-3 py-2 text-text-secondary">{e.profileId}</td>
                  <td className="px-3 py-2">{e.evaluationType}</td>
                  <td className="px-3 py-2">{e.decision}</td>
                  <td className="px-3 py-2 text-[11px] text-text-muted">{e.evaluatorUserId}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {evalQ.isLoading ? <p className="p-4 text-sm text-text-muted">Učitavanje…</p> : null}
        </section>
      )}

      <p className="text-[11px] text-text-muted">
        Pristup API-ju: quality_manager (nacrt), admin (odobrenje), auditor (ograničeni read).
      </p>
    </IsoPageShell>
  );
}
