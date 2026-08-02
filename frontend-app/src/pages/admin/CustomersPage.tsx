import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type JSX } from "react";

import { Button } from "@/components/ui/button";
import { fetchCustomers, upsertCustomer } from "@/lib/api-customers";

export default function CustomersPage(): JSX.Element {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin", "customers"] as const, queryFn: fetchCustomers });
  const [tenantId, setTenantId] = useState("");
  const [company, setCompany] = useState("");
  const mutation = useMutation({
    mutationFn: () =>
      upsertCustomer(tenantId, {
        tenantId,
        company,
        owner: "customer-success",
        status: "LEAD",
        trainingCompleted: false,
        firstValueAchieved: false,
        adoptionScore: 50,
        riskFlag: "watch",
        renewalPotential: "unknown",
        notes: "Created from customer success UI",
      }),
    onSuccess: async () => {
      setTenantId("");
      setCompany("");
      await qc.invalidateQueries({ queryKey: ["admin", "customers"] });
    },
  });

  return (
    <div className="min-h-0 flex-1 overflow-auto px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-bold text-text-primary">Customer success</h1>
        <div className="mt-4 grid gap-2 rounded-xl border border-border/50 p-4 md:grid-cols-3">
          <input value={tenantId} onChange={(e) => setTenantId(e.target.value)} placeholder="tenantId" className="rounded border border-border/60 bg-surface-primary px-3 py-2 text-sm" />
          <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="company" className="rounded border border-border/60 bg-surface-primary px-3 py-2 text-sm" />
          <Button type="button" disabled={!tenantId.trim() || mutation.isPending} onClick={() => mutation.mutate()}>
            Create onboarding record
          </Button>
        </div>
        <div className="mt-6 grid gap-3">
          {(q.data ?? []).map((c) => (
            <section key={c.id} className="rounded-xl border border-border/50 bg-surface-primary/50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-semibold text-text-primary">{c.company ?? c.tenantId}</h2>
                <span className="text-xs text-text-muted">{c.status} · adoption {c.adoptionScore ?? "—"} / risk {c.riskFlag ?? "—"}</span>
              </div>
              <div className="mt-3 grid gap-2 text-sm text-text-secondary md:grid-cols-4">
                <p>Kickoff: {c.kickoffDate ?? "—"}</p>
                <p>Training: {c.trainingCompleted ? "done" : "pending"}</p>
                <p>First usage: {c.firstUsageDate ?? "—"}</p>
                <p>First value: {c.firstValueAchieved ? "yes" : "pending"}</p>
              </div>
              <div className="mt-3 rounded border border-border/40 p-3 text-xs text-text-muted">
                <p>First login: {c.firstLoginAt ?? "—"} · Course: {c.firstCourseCreatedAt ?? "—"} · Certificate: {c.firstCertificateIssuedAt ?? "—"}</p>
                <p>Weekly notes: {c.weeklyNotes ?? "—"}</p>
                <p>Next action: {c.nextAction ?? "—"} · Owner: {c.owner ?? "—"} · Last review: {c.lastReviewDate ?? "—"}</p>
              </div>
              <p className="mt-2 text-xs text-text-muted">Renewal potential: {c.renewalPotential ?? "—"} · {c.notes ?? ""}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
