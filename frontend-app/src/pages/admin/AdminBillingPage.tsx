import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState, type JSX } from "react";

import { Button } from "@/components/ui/button";
import { fetchAnalyticsOverview } from "@/lib/api-analytics";
import { manualActivateTenant } from "@/lib/api-billing";
import { formatApiErrorMessage } from "@/lib/format-api-error";
import { useAuthStore } from "@/stores/authStore";

export default function AdminBillingPage(): JSX.Element {
  const qc = useQueryClient();
  const role = useAuthStore((s) => s.user?.role ?? "");
  const isSysAdmin = role === "sys_admin";

  const q = useQuery({
    queryKey: ["admin", "analytics-overview"] as const,
    queryFn: fetchAnalyticsOverview,
    retry: false,
  });
  const [tenantId, setTenantId] = useState("");
  const [planId, setPlanId] = useState("enterprise");
  const [invoiceReference, setInvoiceReference] = useState("");
  const [validFrom, setValidFrom] = useState(""); // datetime-local
  const [validUntil, setValidUntil] = useState("");
  const toIso = (s: string): string | undefined => {
    const t = s.trim();
    if (!t) {
      return undefined;
    }
    const d = new Date(t);
    return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
  };
  const mutation = useMutation({
    mutationFn: () => {
      const ref = invoiceReference.trim();
      const vf = toIso(validFrom);
      const vu = toIso(validUntil);
      return manualActivateTenant({
        tenantId,
        planId,
        seats: 10,
        priceMonthly: 499,
        ...(ref ? { invoiceReference: ref } : {}),
        ...(vf ? { validFrom: vf } : {}),
        ...(vu ? { validUntil: vu } : {}),
        note: "Manual enterprise activation",
      });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "analytics-overview"] });
    },
  });
  const k = q.data?.kpis ?? {};
  return (
    <div className="min-h-0 flex-1 overflow-auto px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <h1 className="text-2xl font-bold text-text-primary">Revenue operations</h1>

        {q.isPending ? (
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Učitavanje pregleda…
          </div>
        ) : null}

        {q.isError ? (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            <p>{formatApiErrorMessage(q.error)}</p>
            <Button type="button" variant="outline" className="mt-3 border-border/60" onClick={() => void q.refetch()}>
              Pokušaj ponovo
            </Button>
          </div>
        ) : null}

        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          {["mrr", "activePayingCustomers", "invoicesIssued", "invoicesPaid", "unpaidInvoices", "churnRisk", "renewalDueSoon", "arpa"].map((key) => (
            <div key={key} className="rounded-xl border border-border/50 bg-surface-primary/50 p-4">
              <p className="text-xs text-text-muted">{key}</p>
              <p className="mt-1 text-xl font-semibold text-text-primary">{String(k[key] ?? "—")}</p>
            </div>
          ))}
        </div>

        {isSysAdmin ? (
          <div className="mt-6 space-y-3">
            <p className="text-sm text-text-secondary">
              Ručna aktivacija tenanta (invoice / enterprise) — dostupno samo ulozi <span className="font-medium">sys_admin</span>.
            </p>
            <div className="grid gap-2 rounded-xl border border-border/50 p-4 md:grid-cols-3">
              <input value={tenantId} onChange={(e) => setTenantId(e.target.value)} placeholder="tenantId" className="rounded border border-border/60 bg-surface-primary px-3 py-2 text-sm" />
              <input value={planId} onChange={(e) => setPlanId(e.target.value)} placeholder="planId" className="rounded border border-border/60 bg-surface-primary px-3 py-2 text-sm" />
              <input value={invoiceReference} onChange={(e) => setInvoiceReference(e.target.value)} placeholder="invoice reference" className="rounded border border-border/60 bg-surface-primary px-3 py-2 text-sm" />
              <input
                value={validFrom}
                onChange={(e) => setValidFrom(e.target.value)}
                type="datetime-local"
                className="rounded border border-border/60 bg-surface-primary px-3 py-2 text-sm"
                title="validFrom (opciono)"
              />
              <input
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                type="datetime-local"
                className="rounded border border-border/60 bg-surface-primary px-3 py-2 text-sm"
                title="validUntil (opciono)"
              />
              <Button type="button" disabled={!tenantId.trim() || mutation.isPending} onClick={() => mutation.mutate()}>
                Manual activate
              </Button>
            </div>
          </div>
        ) : (
          <p className="mt-6 rounded-xl border border-border/50 bg-surface-secondary/20 px-4 py-3 text-sm text-text-secondary">
            Ručne aktivacije i invoice podaci dostupni su samo sistemskom administratoru.
          </p>
        )}
      </div>
    </div>
  );
}
