import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type JSX } from "react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  fetchAdminTenants,
  fetchTenantDemoStatus,
  markTenantPilot,
} from "@/lib/api-tenants";

export default function TenantsPage(): JSX.Element {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin", "tenants"] as const, queryFn: fetchAdminTenants });
  const demo = useQuery({ queryKey: ["admin", "tenants", "demo-status"] as const, queryFn: fetchTenantDemoStatus });
  const pilot = useMutation({
    mutationFn: (tenantId: string) => markTenantPilot(tenantId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "tenants"] });
    },
  });
  return (
    <div className="min-h-0 flex-1 overflow-auto px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-text-primary">Tenants</h1>
          {demo.data?.exists &&
          demo.data.launchMode === "pilot" &&
          (demo.data.billingStatus === "ACTIVE" || demo.data.status === "ACTIVE") ? (
            <Badge variant="default" className="bg-emerald-600 text-white hover:bg-emerald-600">
              Demo tenant healthy
            </Badge>
          ) : demo.isError ? (
            <Badge variant="outline">Demo status: n/a</Badge>
          ) : demo.isPending ? (
            <Badge variant="outline">Demo status…</Badge>
          ) : (
            <Badge variant="outline">Demo tenant: provjeri seed</Badge>
          )}
        </div>
        <div className="mt-4 overflow-hidden rounded-xl border border-border/50">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-secondary/70">
              <tr>
                <th className="px-3 py-2">Tenant</th>
                <th className="px-3 py-2">Plan</th>
                <th className="px-3 py-2">Subscription</th>
                <th className="px-3 py-2">Pilot</th>
                <th className="px-3 py-2">Users</th>
                <th className="px-3 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {(q.data ?? []).map((t) => (
                <tr key={t.tenantId} className="border-t border-border/40">
                  <td className="px-3 py-2">{t.tenantId}</td>
                  <td className="px-3 py-2">{t.plan}</td>
                  <td className="px-3 py-2">{t.subscriptionStatus}</td>
                  <td className="px-3 py-2">{t.isPilot ? `Yes (${t.pilotHealthScore ?? "—"})` : "No"}</td>
                  <td className="px-3 py-2">{t.activeUsers}</td>
                  <td className="space-x-2 px-3 py-2 text-right">
                    <Button type="button" size="sm" variant="outline" onClick={() => pilot.mutate(t.tenantId)}>
                      Mark pilot
                    </Button>
                    <Link className="text-brand hover:underline" to={`/dashboard/admin/tenants/${encodeURIComponent(t.tenantId)}`}>
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

