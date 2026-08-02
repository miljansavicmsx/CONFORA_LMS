/**
 * Registar rizika — matrica L×I (ISO 17024 cl. 11.5), tabela i obrazac.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useCallback, useMemo, useState, type JSX } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type RiskAiReviewDecision,
  type RiskRegisterItem,
  type RiskRegisterUpdatePayload,
  type RiskSeverity,
  createRisk,
  reviewRiskAiSuggestion,
  updateRisk,
} from "@/lib/api-governance";
import { cn } from "@/lib/utils";

const RISKS_QUERY_KEY = ["governance", "risks"] as const;

const LIKELIHOOD_ROWS = [3, 2, 1] as const;
const IMPACT_COLS = [1, 2, 3] as const;

function heatmapCellClass(likelihood: number, impact: number): string {
  const s = likelihood * impact;
  if (s <= 2) {
    return "bg-emerald-950/55 ring-1 ring-emerald-500/30";
  }
  if (s <= 4) {
    return "bg-amber-950/45 ring-1 ring-amber-500/25";
  }
  if (s <= 6) {
    return "bg-orange-950/55 ring-1 ring-orange-500/30";
  }
  return "bg-red-950/75 ring-1 ring-red-500/40";
}

function severityBadgeClass(sev: RiskSeverity): string {
  switch (sev) {
    case "LOW":
      return "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/35";
    case "MEDIUM":
      return "bg-amber-500/15 text-amber-100 ring-1 ring-amber-500/35";
    case "HIGH":
      return "bg-red-500/20 text-red-100 ring-1 ring-red-500/40";
    default:
      return "bg-surface-primary text-text-secondary";
  }
}

function severityLabelBc(sev: RiskSeverity): string {
  switch (sev) {
    case "LOW":
      return "Nizak";
    case "MEDIUM":
      return "Srednji";
    case "HIGH":
      return "Visok";
    default:
      return sev;
  }
}

function riskShortLabel(r: RiskRegisterItem): string {
  const t = (r.title ?? "").trim();
  if (t.length >= 2) {
    return t.slice(0, 3).toUpperCase();
  }
  return r.riskId.replace(/-/g, "").slice(0, 6);
}

export interface RiskRegisterProps {
  readonly risks: RiskRegisterItem[];
  readonly risksLoading: boolean;
  readonly risksError: boolean;
  readonly risksFetching: boolean;
}

export function RiskRegister({
  risks,
  risksLoading,
  risksError,
  risksFetching,
}: RiskRegisterProps): JSX.Element {
  const queryClient = useQueryClient();

  const [editingRiskId, setEditingRiskId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [likelihood, setLikelihood] = useState(2);
  const [impact, setImpact] = useState(2);
  const [status, setStatus] = useState("IDENTIFIED");
  const [category, setCategory] = useState("");
  const [owner, setOwner] = useState("");
  const [mitigationSummary, setMitigationSummary] = useState("");
  const [isAiSuggested, setIsAiSuggested] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setEditingRiskId(null);
    setTitle("");
    setDescription("");
    setLikelihood(2);
    setImpact(2);
    setStatus("IDENTIFIED");
    setCategory("");
    setOwner("");
    setMitigationSummary("");
    setIsAiSuggested(false);
    setFormError(null);
  }, []);

  const beginEdit = useCallback((r: RiskRegisterItem) => {
    setEditingRiskId(r.riskId);
    setTitle(r.title ?? "");
    setDescription(r.description ?? "");
    setLikelihood(r.likelihood);
    setImpact(r.impact);
    setStatus(r.status ?? "IDENTIFIED");
    setCategory(r.category ?? "");
    setOwner(r.owner ?? "");
    setMitigationSummary(r.mitigationSummary ?? "");
    setFormError(null);
  }, []);

  const createMutation = useMutation({
    mutationFn: createRisk,
    onSuccess: async () => {
      resetForm();
      await queryClient.invalidateQueries({ queryKey: RISKS_QUERY_KEY });
    },
    onError: () => {
      setFormError("Kreiranje nije uspjelo. Provjeri podatke i API.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ riskId, payload }: { riskId: string; payload: RiskRegisterUpdatePayload }) =>
      updateRisk(riskId, payload),
    onSuccess: async () => {
      resetForm();
      await queryClient.invalidateQueries({ queryKey: RISKS_QUERY_KEY });
    },
    onError: () => {
      setFormError("Ažuriranje nije uspjelo. Provjeri podatke i API.");
    },
  });

  const aiReviewMutation = useMutation({
    mutationFn: ({ riskId, decision }: { riskId: string; decision: RiskAiReviewDecision }) =>
      reviewRiskAiSuggestion(riskId, { decision }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: RISKS_QUERY_KEY });
    },
    onError: () => {
      setFormError("AI review nije uspio. Pokušajte ponovo.");
    },
  });

  const busy = createMutation.isPending || updateMutation.isPending;

  const risksByCell = useMemo(() => {
    const map = new Map<string, RiskRegisterItem[]>();
    for (const r of risks) {
      const L = Math.min(3, Math.max(1, Math.round(Number(r.likelihood)) || 1));
      const I = Math.min(3, Math.max(1, Math.round(Number(r.impact)) || 1));
      const key = `${L}-${I}`;
      const prev = map.get(key) ?? [];
      prev.push({ ...r, likelihood: L, impact: I });
      map.set(key, prev);
    }
    return map;
  }, [risks]);

  const handleSubmit = useCallback(() => {
    setFormError(null);
    if (!title.trim()) {
      setFormError("Naslov je obavezan.");
      return;
    }
    if (editingRiskId) {
      updateMutation.mutate({
        riskId: editingRiskId,
        payload: {
          title: title.trim(),
          description: description.trim() || null,
          likelihood,
          impact,
          status: status.trim() || null,
          category: category.trim() || null,
          owner: owner.trim() || null,
          mitigationSummary: mitigationSummary.trim() || null,
        },
      });
      return;
    }
    createMutation.mutate({
      title: title.trim(),
      description: description.trim() || null,
      likelihood,
      impact,
      status: status.trim() || null,
      category: category.trim() || null,
      owner: owner.trim() || null,
      mitigationSummary: mitigationSummary.trim() || null,
      ...(isAiSuggested ? { isAiSuggested: true as const } : {}),
    });
  }, [
    title,
    description,
    likelihood,
    impact,
    status,
    category,
    owner,
    mitigationSummary,
    isAiSuggested,
    editingRiskId,
    createMutation,
    updateMutation,
  ]);

  const selectClass =
    "h-10 w-full max-w-md rounded-md border border-border/60 bg-surface-primary px-3 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50";

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-border/60 bg-surface-secondary/80"
          onClick={() => {
            void queryClient.invalidateQueries({ queryKey: RISKS_QUERY_KEY });
          }}
          disabled={risksFetching}
        >
          {risksFetching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Osvježi
        </Button>
      </div>

      <section
        className={cn(
          "rounded-2xl border border-border/50 bg-surface-secondary/40 p-6 ring-1 ring-white/[0.04]",
        )}
      >
        <h2 className="text-lg font-semibold text-text-primary">Matrica rizika (3×3)</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Osi: uticaj 1–3 (vodoravno), vjerovatnoća 1–3 (uspravno). Ćelije su obojene prema L×I; oznake
          u ćeliji su aktivni rizici.
        </p>

        <div className="mt-6 overflow-x-auto">
          <div className="inline-block min-w-[320px]">
            <div className="mb-2 flex justify-end gap-1 pr-1 text-[10px] font-medium uppercase tracking-wide text-text-muted">
              <span className="w-24 text-center">Uticaj 1</span>
              <span className="w-24 text-center">Uticaj 2</span>
              <span className="w-24 text-center">Uticaj 3</span>
            </div>
            <div className="flex gap-3">
              <div className="flex w-8 flex-col justify-around py-1 text-[10px] font-medium uppercase tracking-wide text-text-muted">
                <span className="h-20 text-right leading-tight">Vjer. 3</span>
                <span className="h-20 text-right leading-tight">Vjer. 2</span>
                <span className="h-20 text-right leading-tight">Vjer. 1</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {LIKELIHOOD_ROWS.flatMap((L) =>
                  IMPACT_COLS.map((I) => {
                    const key = `${L}-${I}`;
                    const inCell = risksByCell.get(key) ?? [];
                    return (
                      <div
                        key={key}
                        className={cn(
                          "flex h-20 w-24 flex-col items-center justify-center gap-1 rounded-lg p-1.5 text-center transition-colors",
                          heatmapCellClass(L, I),
                        )}
                      >
                        <div className="flex max-h-[4.5rem] w-full flex-wrap content-start justify-center gap-1 overflow-y-auto">
                          {inCell.map((r) => (
                            <span
                              key={r.riskId}
                              title={`${r.riskId} — ${r.title ?? ""}`}
                              className="inline-flex min-w-[1.5rem] max-w-[4.5rem] items-center justify-center truncate rounded-full bg-black/35 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-white/95 ring-1 ring-white/15"
                            >
                              {riskShortLabel(r)}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  }),
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {risksLoading ? (
        <div className="flex min-h-[30vh] items-center justify-center gap-2 text-text-secondary">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
          Učitavanje rizika…
        </div>
      ) : risksError ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-200">
          Ne mogu učitati registar rizika. Potrebna je administratorska uloga.
        </div>
      ) : risks.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border/50 bg-surface-secondary/30 py-16 text-center text-text-muted">
          <AlertTriangle className="h-10 w-10 opacity-40" />
          <p>Nema unesenih rizika u DynamoDB.</p>
          <p className="text-xs">Dodaj prvi rizik putem obrasca ispod ili seedaj demonstracijske podatke.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border/50 bg-surface-secondary/40 ring-1 ring-white/[0.04]">
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-surface-primary/50 text-xs uppercase tracking-wider text-text-muted">
                <th className="px-4 py-3 font-semibold">riskId</th>
                <th className="px-4 py-3 font-semibold">Naslov</th>
                <th className="px-4 py-3 font-semibold">Opis</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">AI / pregled</th>
                <th className="px-4 py-3 font-semibold">Vjerovatnoća</th>
                <th className="px-4 py-3 font-semibold">Uticaj</th>
                <th className="px-4 py-3 font-semibold">Bod (L×I)</th>
                <th className="px-4 py-3 font-semibold">Nivo rizika</th>
                <th className="px-4 py-3 font-semibold">Vlasnik</th>
                <th className="px-4 py-3 font-semibold">Ažurirano</th>
                <th className="px-4 py-3 font-semibold"> </th>
              </tr>
            </thead>
            <tbody>
              {risks.map((r) => (
                <tr
                  key={r.riskId}
                  className="border-b border-border/30 transition-colors hover:bg-surface-primary/30"
                >
                  <td className="px-4 py-3 font-mono text-xs text-brand">{r.riskId}</td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-text-primary">{r.title ?? "—"}</td>
                  <td className="max-w-[220px] px-4 py-3 text-xs text-text-secondary">
                    <span className="line-clamp-2">{r.description?.trim() ? r.description : "—"}</span>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{r.status ?? "—"}</td>
                  <td className="max-w-[180px] px-4 py-3 align-top text-xs text-text-secondary">
                    <div className="flex flex-col gap-1.5">
                      {r.isAiSuggested ? (
                        <span className="w-fit rounded-full border border-violet-500/45 bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-100">
                          AI prijedlog
                        </span>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                      {r.aiReviewStatus ? (
                        <span className="text-[11px] text-text-muted">{r.aiReviewStatus}</span>
                      ) : null}
                      {r.isAiSuggested && r.aiReviewStatus === "PENDING" ? (
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          <Button
                            type="button"
                            size="sm"
                            className="h-7 border-emerald-500/40 bg-emerald-600/90 px-2 text-[11px] text-white hover:bg-emerald-500"
                            disabled={aiReviewMutation.isPending}
                            onClick={() => {
                              aiReviewMutation.mutate({ riskId: r.riskId, decision: "approve" });
                            }}
                          >
                            Prihvati
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-7 border-red-500/40 px-2 text-[11px] text-red-100 hover:bg-red-500/10"
                            disabled={aiReviewMutation.isPending}
                            onClick={() => {
                              if (window.confirm("Odbiti AI prijedlog u registru rizika?")) {
                                aiReviewMutation.mutate({ riskId: r.riskId, decision: "reject" });
                              }
                            }}
                          >
                            Odbij
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-text-secondary">{r.likelihood}</td>
                  <td className="px-4 py-3 tabular-nums text-text-secondary">{r.impact}</td>
                  <td className="px-4 py-3 tabular-nums text-text-secondary">{r.riskScore}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        severityBadgeClass(r.severity),
                      )}
                    >
                      {severityLabelBc(r.severity)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{r.owner ?? "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-text-muted">{r.updatedAt ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-brand hover:bg-brand/10"
                      onClick={() => {
                        beginEdit(r);
                      }}
                    >
                      Uredi
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <section
        className={cn(
          "rounded-2xl border border-border/50 bg-surface-secondary/40 p-6 ring-1 ring-white/[0.04]",
        )}
      >
        <h2 className="text-lg font-semibold text-text-primary">
          {editingRiskId ? "Uredi rizik" : "Novi rizik"}
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          Odaberi vjerovatnoću i uticaj (1–3). Nivo rizika i bod (L×I) računa se automatski.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="risk-title" className="text-text-secondary">
              Naslov
            </Label>
            <Input
              id="risk-title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
              }}
              className="border-border/60 bg-surface-primary text-text-primary"
              placeholder="Kratak opis rizika"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="risk-desc" className="text-text-secondary">
              Detaljni opis rizika
            </Label>
            <textarea
              id="risk-desc"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
              }}
              rows={3}
              className="w-full rounded-md border border-border/60 bg-surface-primary px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
              placeholder="Rizik u kontekstu CB…"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="risk-l" className="text-text-secondary">
              Vjerovatnoća (1–3)
            </Label>
            <select
              id="risk-l"
              value={likelihood}
              onChange={(e) => {
                setLikelihood(Number(e.target.value));
              }}
              className={selectClass}
            >
              <option value={1}>1 — niska</option>
              <option value={2}>2 — srednja</option>
              <option value={3}>3 — visoka</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="risk-i" className="text-text-secondary">
              Uticaj (1–3)
            </Label>
            <select
              id="risk-i"
              value={impact}
              onChange={(e) => {
                setImpact(Number(e.target.value));
              }}
              className={selectClass}
            >
              <option value={1}>1 — nizak</option>
              <option value={2}>2 — srednji</option>
              <option value={3}>3 — visok</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="risk-status" className="text-text-secondary">
              Status
            </Label>
            <Input
              id="risk-status"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
              }}
              className="border-border/60 bg-surface-primary text-text-primary"
              placeholder="npr. IDENTIFIED"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="risk-cat" className="text-text-secondary">
              Kategorija
            </Label>
            <Input
              id="risk-cat"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
              }}
              className="border-border/60 bg-surface-primary text-text-primary"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="risk-owner" className="text-text-secondary">
              Vlasnik
            </Label>
            <Input
              id="risk-owner"
              value={owner}
              onChange={(e) => {
                setOwner(e.target.value);
              }}
              className="border-border/60 bg-surface-primary text-text-primary"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="risk-mit" className="text-text-secondary">
              Sažetak mjera ublažavanja
            </Label>
            <textarea
              id="risk-mit"
              value={mitigationSummary}
              onChange={(e) => {
                setMitigationSummary(e.target.value);
              }}
              rows={3}
              className="w-full rounded-md border border-border/60 bg-surface-primary px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
            />
          </div>
          {!editingRiskId ? (
            <div className="flex items-start gap-3 sm:col-span-2">
              <input
                id="risk-ai-suggested"
                type="checkbox"
                checked={isAiSuggested}
                onChange={(e) => {
                  setIsAiSuggested(e.target.checked);
                }}
                className="mt-1 h-4 w-4 shrink-0 rounded border-border/60"
              />
              <Label htmlFor="risk-ai-suggested" className="cursor-pointer text-sm leading-snug text-text-secondary">
                Predloženo AI-jem — stavka ide na ručni pregled (PENDING) prije konačnog prihvaćanja u registru.
              </Label>
            </div>
          ) : null}
        </div>
        {formError ? <p className="mt-4 text-sm text-red-400">{formError}</p> : null}
        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            type="button"
            className="bg-brand text-white hover:bg-brand/90"
            disabled={busy}
            onClick={handleSubmit}
          >
            {busy ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Spremam…
              </>
            ) : editingRiskId ? (
              "Spremi izmjene"
            ) : (
              "Dodaj rizik"
            )}
          </Button>
          {editingRiskId ? (
            <Button type="button" variant="outline" className="border-border/60" disabled={busy} onClick={resetForm}>
              Otkaži uređivanje
            </Button>
          ) : null}
        </div>
      </section>
    </div>
  );
}
