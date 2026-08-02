import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { type JSX } from "react";

import { Button } from "@/components/ui/button";
import { cancelSubscription, changePlan, fetchMySubscription, requestInvoice } from "@/lib/api-billing";
import { formatApiErrorMessage } from "@/lib/format-api-error";
import { cn } from "@/lib/utils";

export default function BillingPage(): JSX.Element {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["billing", "subscription"] as const, queryFn: fetchMySubscription, retry: false });

  const changeMutation = useMutation({
    mutationFn: (planId: string) => changePlan(planId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["billing", "subscription"] });
    },
  });
  const cancelMutation = useMutation({
    mutationFn: cancelSubscription,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["billing", "subscription"] });
    },
  });
  const invoiceMutation = useMutation({
    mutationFn: (planId: string) => requestInvoice(planId),
  });

  const s = q.data;
  const inactive =
    s != null &&
    (String(s.status).toUpperCase() === "TRIAL" || (s.planId === "trial" && Number(s.priceMonthly) <= 0));

  return (
    <div className="min-h-0 flex-1 overflow-auto px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-2xl font-bold text-text-primary">Billing & Subscription</h1>

        {q.isPending ? (
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Učitavanje…
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

        {s?.providerStatus === "config_blocker" ? (
          <div
            className={cn(
              "rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-sm",
              "text-amber-100",
            )}
            role="status"
          >
            <p className="font-medium text-text-primary">Stripe nije konfigurisan u ovom okruženju.</p>
            {s.providerReason ? <p className="mt-1 text-text-secondary">{s.providerReason}</p> : null}
          </div>
        ) : null}

        {s?.storageStatus === "unavailable" ? (
          <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-sm text-sky-100" role="status">
            <p className="font-medium text-text-primary">Pohrana pretplate</p>
            {s.storageMessage ? <p className="mt-1 text-text-secondary">{s.storageMessage}</p> : null}
          </div>
        ) : null}

        {q.isSuccess && s && inactive ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-surface-secondary/30 px-4 py-6 text-sm text-text-secondary">
            <p className="font-medium text-text-primary">Pretplata nije aktivirana.</p>
            <p className="mt-2">
              Trenutno ste na probnom ili besplatnom planu ({s.planId}). Nakon uplate ili ručne aktivacije od strane
              administratora, status će se ažurirati ovdje.
            </p>
          </div>
        ) : null}

        {q.isSuccess && s ? (
          <div className="rounded-xl border border-border/50 p-4">
            <p className="text-sm text-text-secondary">Plan: {s.planId}</p>
            <p className="text-sm text-text-secondary">Status: {s.status}</p>
            {s.validFrom ? (
              <p className="text-sm text-text-secondary">Važi od: {s.validFrom}</p>
            ) : null}
            {s.validUntil ? (
              <p className="text-sm text-text-secondary">Važi do: {s.validUntil}</p>
            ) : null}
            {s.invoiceReference ? (
              <p className="text-sm text-text-secondary">Referenca računa: {s.invoiceReference}</p>
            ) : null}
            <p className="text-sm text-text-secondary">
              Mjesečno: {s.priceMonthly} {s.currency}
            </p>
            <p className="text-sm text-text-secondary">Obnova: {s.renewAt ?? "—"}</p>
            <p className="mt-1 text-xs text-text-muted">
              Provajder: {s.providerStatus === "live" ? "Stripe (aktivan)" : s.providerStatus ?? "—"}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button onClick={() => changeMutation.mutate("pro")}>Upgrade to PRO</Button>
              <Button variant="secondary" onClick={() => invoiceMutation.mutate(s.planId)}>
                Request invoice
              </Button>
              <Button variant="outline" onClick={() => cancelMutation.mutate()} disabled={inactive}>
                Cancel subscription
              </Button>
            </div>
            {invoiceMutation.data ? (
              <p className="mt-3 text-sm text-emerald-300">Quote requested: {invoiceMutation.data.invoiceId}</p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
