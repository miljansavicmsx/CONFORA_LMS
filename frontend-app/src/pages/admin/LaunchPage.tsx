import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type JSX } from "react";

import { Button } from "@/components/ui/button";
import { fetchLaunchStatus, updateLaunchMode } from "@/lib/api-launch";

export default function LaunchPage(): JSX.Element {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin", "launch"] as const, queryFn: fetchLaunchStatus });
  const [maxSlots, setMaxSlots] = useState("10");
  const mutation = useMutation({
    mutationFn: (mode: "pilot" | "limited_ga" | "full_ga") =>
      updateLaunchMode({ mode, maxSlots: Number(maxSlots) || 10, requiresApproval: mode === "limited_ga" }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "launch"] });
    },
  });
  const d = q.data;
  return (
    <div className="min-h-0 flex-1 overflow-auto px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-bold text-text-primary">Launch controls</h1>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          {["mode", "usedSlots", "waitlistCount", "signupEnabled"].map((key) => (
            <div key={key} className="rounded-xl border border-border/50 bg-surface-primary/50 p-4">
              <p className="text-xs text-text-muted">{key}</p>
              <p className="text-xl font-semibold text-text-primary">{String((d as Record<string, unknown> | undefined)?.[key] ?? "—")}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-xl border border-border/50 p-4">
          <p className="text-sm text-text-secondary">Confirmation: changing launch mode affects public CTA and onboarding rules.</p>
          <input value={maxSlots} onChange={(e) => setMaxSlots(e.target.value)} className="mt-3 rounded border border-border/60 bg-surface-primary px-3 py-2 text-sm" placeholder="max slots" />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => mutation.mutate("pilot")}>Switch to pilot</Button>
            <Button onClick={() => mutation.mutate("limited_ga")}>Switch to limited GA</Button>
            <Button variant="secondary" onClick={() => mutation.mutate("full_ga")}>Switch to full GA</Button>
          </div>
          <pre className="mt-4 overflow-auto rounded bg-surface-primary p-2 text-xs text-text-secondary">
            {JSON.stringify(d?.riskChecklist ?? {}, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
