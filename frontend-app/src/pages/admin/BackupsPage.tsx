import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type JSX } from "react";

import { Button } from "@/components/ui/button";
import { fetchBackupStatus, runRestoreSmoke } from "@/lib/api-backups";

export default function BackupsPage(): JSX.Element {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin", "backups-status"] as const, queryFn: fetchBackupStatus });
  const restore = useMutation({
    mutationFn: runRestoreSmoke,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "backups-status"] });
    },
  });
  const d = q.data;
  return (
    <div className="min-h-0 flex-1 overflow-auto px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-4">
        <h1 className="text-2xl font-bold text-text-primary">Backups & DR</h1>
        <div className="rounded-xl border border-border/50 p-4">
          <p>Enabled: {d?.enabled ? "Yes" : "No"}</p>
          <p>Provider: {d?.provider ?? "—"}</p>
          <p>Last backup: {d?.lastBackupAt ?? "N/A"}</p>
          <p>Retention days: {d?.retentionDays ?? "—"}</p>
          <p>RPO: {d?.rpoHours ?? "—"}h</p>
          <p>RTO: {d?.rtoHours ?? "—"}h</p>
          <p>Last restore test: {String(d?.lastRestoreSmoke?.status ?? "not run")}</p>
          <Button className="mt-4" type="button" onClick={() => restore.mutate()} disabled={restore.isPending}>
            Run restore smoke
          </Button>
          <pre className="mt-3 overflow-auto rounded bg-surface-primary p-2 text-xs text-text-secondary">
            {JSON.stringify(restore.data ?? d?.lastRestoreSmoke ?? {}, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

