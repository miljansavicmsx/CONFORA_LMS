import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { Download, FileSearch, History, KeyRound, Lock, ScrollText, Settings2, Shield } from "lucide-react";
import { type JSX, useMemo, useState } from "react";

import { RelationshipEvidenceChain } from "@/components/entity-relations";
import { ContextRibbon } from "@/components/information-disclosure";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { IA_RIBBON_KNOWLEDGE_HUB } from "@/lib/workspace-continuity";
import { IsoPageShell } from "@/pages/iso/IsoPageShell";
import { useAuthStore } from "@/stores/authStore";

type AuditEventRow = {
  eventId: string;
  createdAt: string;
  auditCategory?: string;
  action: string;
  severity: string;
  outcome: string;
  actorUserId: string;
  resourceType: string;
  resourceId: string;
  tenantId?: string | null;
};

type AuditListResponse = {
  items: AuditEventRow[];
  nextCursor?: string | null;
};

const tabs = [
  { id: "timeline" as const, label: "Kronologija", icon: History },
  { id: "governance" as const, label: "Governance", icon: Shield },
  { id: "certification" as const, label: "Certifikacija", icon: FileSearch },
  { id: "security" as const, label: "Sigurnost", icon: Lock },
  { id: "access" as const, label: "Pristup", icon: KeyRound },
  { id: "system" as const, label: "Sustav", icon: Settings2 },
  { id: "export" as const, label: "Izvoz", icon: Download },
];

function tabToCategory(
  t: (typeof tabs)[number]["id"],
): "GOVERNANCE" | "SECURITY" | "CERTIFICATION" | "EXAM" | "ACCESS" | "SYSTEM" | undefined {
  if (t === "timeline" || t === "export" || t === "certification") return undefined;
  if (t === "governance") return "GOVERNANCE";
  if (t === "security") return "SECURITY";
  if (t === "access") return "ACCESS";
  if (t === "system") return "SYSTEM";
  return undefined;
}

function severityBadgeClass(sev: string): string {
  const u = (sev || "").toUpperCase();
  if (u === "CRITICAL") return "bg-rose-500/15 text-rose-200 ring-1 ring-rose-500/30";
  if (u === "WARNING") return "bg-amber-500/15 text-amber-100 ring-1 ring-amber-500/25";
  return "bg-emerald-500/10 text-emerald-100 ring-1 ring-emerald-500/20";
}

export default function IsoAuditPage(): JSX.Element {
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("timeline");
  const [chainId, setChainId] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [filterOutcome, setFilterOutcome] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("");
  const role = useAuthStore((s) => s.user?.role ?? "");
  const isSysAdmin = role === "sys_admin";

  const category = useMemo(() => tabToCategory(tab), [tab]);

  const listQ = useQuery({
    queryKey: ["iso", "audit", "list", category, filterAction, filterOutcome, filterSeverity],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (category) {
        params.auditCategory = category;
      }
      if (filterAction.trim()) params.action = filterAction.trim();
      if (filterOutcome.trim()) params.outcome = filterOutcome.trim();
      if (filterSeverity.trim()) params.severity = filterSeverity.trim();
      const { data } = await api.get<AuditListResponse>("/api/admin/audit", { params });
      return data;
    },
    enabled: tab !== "export",
  });

  const filteredItems = useMemo(() => {
    const items = listQ.data?.items ?? [];
    if (tab === "certification") {
      return items.filter((x) => x.auditCategory === "CERTIFICATION" || x.auditCategory === "EXAM");
    }
    return items;
  }, [listQ.data?.items, tab]);

  const chainQ = useQuery({
    queryKey: ["iso", "audit", "chain", chainId],
    queryFn: async () => {
      const { data } = await api.get<AuditEventRow[]>(
        `/api/admin/audit/person-certification/${encodeURIComponent(chainId)}/evidence-chain`,
      );
      return data;
    },
    enabled: Boolean(chainId.trim()),
  });

  const err = listQ.error ?? chainQ.error;
  const detail = isAxiosError(err) ? err.response?.data : null;

  async function runExport(fmt: "csv" | "json"): Promise<void> {
    const { data } = await api.post(
      "/api/admin/audit/export",
      { format: fmt },
      { responseType: fmt === "csv" ? "blob" : "json" },
    );
    if (fmt === "json") {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "confora-iso-audit.json";
      a.click();
      URL.revokeObjectURL(url);
      return;
    }
    const blob = data as Blob;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "confora-iso-audit.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <IsoPageShell
      title="Strukturirani audit trail"
      description="Append-only evidencija poslovnih i sigurnosnih događaja (ISO 17024). Legacy audit log ostaje odvojen u administraciji."
      icon={ScrollText}
    >
      <ContextRibbon title="IA trag — audit" items={IA_RIBBON_KNOWLEDGE_HUB} />
      {detail ? (
        <div className="rounded-lg border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-sm text-amber-50" role="alert">
          Zahtjev nije uspio. Provjerite ulogu (čitanje za interne auditora / QM / cert) ili povezivanje na API.
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

      {tab === "export" ? (
        <section className="mt-6 space-y-4 rounded-xl border border-border/40 bg-surface-elevated/40 p-5">
          <h2 className="text-sm font-semibold text-text-primary">Izvoz (CSV / JSON)</h2>
          <p className="text-sm text-text-secondary">
            Tehnički izvoz je ograničen na <span className="font-medium text-text-primary">sys_admin</span> (politika
            sustava).
          </p>
          {isSysAdmin ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-lg bg-brand-solid px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover"
                onClick={() => void runExport("json")}
              >
                Preuzmi JSON
              </button>
              <button
                type="button"
                className="rounded-lg border border-border/60 px-4 py-2 text-sm font-medium hover:bg-surface-secondary/50"
                onClick={() => void runExport("csv")}
              >
                Preuzmi CSV
              </button>
            </div>
          ) : (
            <p className="text-sm text-text-muted">Vaša uloga nema ovlast za izvoz (samo sys_admin).</p>
          )}
        </section>
      ) : null}

      {tab !== "export" ? (
        <section className="mt-6 space-y-3">
          <div className="flex flex-wrap gap-3 rounded-xl border border-border/40 bg-surface-elevated/30 p-4 text-sm">
            <label className="flex flex-col gap-1 text-xs text-text-muted">
              Akcija
              <input
                className="min-w-[140px] rounded-md border border-border/50 bg-background px-2 py-1.5 text-text-primary"
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                placeholder="npr. LOGIN_SUCCESS"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-text-muted">
              Ishod
              <select
                className="rounded-md border border-border/50 bg-background px-2 py-1.5 text-text-primary"
                value={filterOutcome}
                onChange={(e) => setFilterOutcome(e.target.value)}
              >
                <option value="">(svi)</option>
                <option value="SUCCESS">SUCCESS</option>
                <option value="FAILURE">FAILURE</option>
                <option value="BLOCKED">BLOCKED</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs text-text-muted">
              Težina
              <select
                className="rounded-md border border-border/50 bg-background px-2 py-1.5 text-text-primary"
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
              >
                <option value="">(sve)</option>
                <option value="INFO">INFO</option>
                <option value="WARNING">WARNING</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </label>
          </div>
          <div className="overflow-x-auto rounded-xl border border-border/40 bg-surface-elevated/40">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="border-b border-border/40 text-[11px] uppercase tracking-wide text-text-muted">
              <tr>
                <th className="px-3 py-2">Vrijeme</th>
                <th className="px-3 py-2">Kategorija</th>
                <th className="px-3 py-2">Težina</th>
                <th className="px-3 py-2">Akcija</th>
                <th className="px-3 py-2">Resurs</th>
                <th className="px-3 py-2">Izvršitelj</th>
                <th className="px-3 py-2">Ishod</th>
              </tr>
            </thead>
            <tbody>
              {(filteredItems ?? []).map((row) => (
                <tr key={row.eventId} className="border-b border-border/20 last:border-0">
                  <td className="px-3 py-2 font-mono text-[11px] text-text-secondary">{row.createdAt}</td>
                  <td className="px-3 py-2 text-text-secondary">{row.auditCategory ?? "—"}</td>
                  <td className="px-3 py-2">
                    <span
                      className={cn(
                        "inline-flex rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                        severityBadgeClass(row.severity),
                      )}
                    >
                      {row.severity}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-medium text-text-primary">{row.action}</td>
                  <td className="px-3 py-2">
                    <div>{row.resourceType}</div>
                    <div className="font-mono text-[11px] text-text-muted">{row.resourceId}</div>
                  </td>
                  <td className="px-3 py-2 font-mono text-[11px] text-text-secondary">{row.actorUserId}</td>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center gap-1.5">
                      {row.outcome}
                      {row.outcome === "BLOCKED" ? (
                        <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-rose-100">
                          Blokirano
                        </span>
                      ) : null}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {listQ.isLoading ? (
            <div className="px-3 py-6 text-sm text-text-muted">Učitavanje…</div>
          ) : null}
          {!listQ.isLoading && filteredItems.length === 0 ? (
            <div className="px-3 py-6 text-sm text-text-muted">Nema događaja za odabranu sekciju.</div>
          ) : null}
          </div>
        </section>
      ) : null}

      <section className="mt-8 space-y-3">
        <h2 className="text-sm font-semibold text-text-primary">Lanac osobne certifikacije (PERSON_CERTIFICATION)</h2>
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-xs text-text-muted">
            ID certifikata / kandidata (resourceId)
            <input
              className="rounded-md border border-border/50 bg-background px-3 py-2 text-sm text-text-primary"
              value={chainId}
              onChange={(e) => setChainId(e.target.value)}
              placeholder="npr. certificateId"
            />
          </label>
        </div>
        <div className="rounded-xl border border-border/40 bg-surface-elevated/30 p-4">
          {chainQ.isLoading ? (
            <p className="text-sm text-text-muted">Učitavanje lanca…</p>
          ) : (chainQ.data ?? []).length === 0 ? (
            <p className="text-sm text-text-muted">Nema zapisa za traženi ID (ili još niste unijeli vrijednost).</p>
          ) : (
            <RelationshipEvidenceChain
              title="Lanac osobne certifikacije (PERSON_CERTIFICATION)"
              rows={chainQ.data ?? []}
            />
          )}
        </div>
      </section>
    </IsoPageShell>
  );
}
