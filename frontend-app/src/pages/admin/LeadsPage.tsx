import { useQuery } from "@tanstack/react-query";
import { type JSX } from "react";

import { fetchAdminLeads, fetchLaunchStatus } from "@/lib/api-onboarding";

export default function LeadsPage(): JSX.Element {
  const q = useQuery({ queryKey: ["admin", "leads"] as const, queryFn: fetchAdminLeads });
  const launch = useQuery({ queryKey: ["admin", "launch-status"] as const, queryFn: fetchLaunchStatus });
  return (
    <div className="min-h-0 flex-1 overflow-auto px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-bold text-text-primary">Pilot Leads</h1>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          {["launchMode", "slotsUsed", "waitlistCount", "manualApproval"].map((key) => (
            <div key={key} className="rounded-lg border border-border/50 p-3 text-sm">
              <p className="text-text-muted">{key}</p>
              <p className="font-semibold text-text-primary">{String(launch.data?.[key] ?? "—")}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 overflow-hidden rounded-xl border border-border/50">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-secondary/70">
              <tr>
                <th className="px-3 py-2">Created</th>
                <th className="px-3 py-2">Source</th>
                <th className="px-3 py-2">Company</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Plan</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {(q.data ?? []).map((lead) => (
                <tr key={String(lead.id)} className="border-t border-border/40">
                  <td className="px-3 py-2">{String(lead.createdAt ?? "—")}</td>
                  <td className="px-3 py-2">{String(lead.source ?? lead.type ?? "—")}</td>
                  <td className="px-3 py-2">{String(lead.company ?? lead.organizationName ?? "—")}</td>
                  <td className="px-3 py-2">{String(lead.email ?? "—")}</td>
                  <td className="px-3 py-2">{String(lead.planInterest ?? lead.plan ?? "—")}</td>
                  <td className="px-3 py-2">{String(lead.status ?? "—")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

