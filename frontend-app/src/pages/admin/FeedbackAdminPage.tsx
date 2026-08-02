import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, type JSX } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { assignFeedback, fetchAdminFeedback, resolveFeedback, updateFeedbackStatus } from "@/lib/api-feedback";
import { cn } from "@/lib/utils";

function statusChipClass(s: string): string {
  const u = s.toUpperCase();
  if (u === "OPEN" || u === "NEW") {
    return "border-sky-500/40 bg-sky-500/15 text-sky-100";
  }
  if (u === "IN_PROGRESS" || u === "TRIAGED") {
    return "border-amber-500/40 bg-amber-500/15 text-amber-100";
  }
  if (u === "CLOSED" || u === "RESOLVED") {
    return "border-emerald-500/40 bg-emerald-500/15 text-emerald-100";
  }
  return "border-border/50 bg-surface-primary/80 text-text-secondary";
}

export default function FeedbackAdminPage(): JSX.Element {
  const qc = useQueryClient();
  const [status, setStatus] = useState("");
  const [severity, setSeverity] = useState("");
  const [category, setCategory] = useState("");
  const [ownerById, setOwnerById] = useState<Record<string, string>>({});
  const [assignNoteById, setAssignNoteById] = useState<Record<string, string>>({});
  const [closeNoteById, setCloseNoteById] = useState<Record<string, string>>({});
  const filters = {
    ...(status ? { status } : {}),
    ...(severity ? { severity } : {}),
    ...(category ? { category } : {}),
  };
  const q = useQuery({
    queryKey: ["admin", "feedback", status, severity, category] as const,
    queryFn: () => fetchAdminFeedback(filters),
  });
  const rows = useMemo(() => q.data ?? [], [q.data]);
  const mutation = useMutation({
    mutationFn: ({ id, next, note }: { id: string; next: string; note?: string }) =>
      updateFeedbackStatus(id, next, note),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "feedback"] });
    },
  });
  const assignMutation = useMutation({
    mutationFn: ({ id, owner, note }: { id: string; owner: string; note?: string }) => assignFeedback(id, owner, note),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "feedback"] });
    },
  });
  const resolveMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) => resolveFeedback(id, note),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "feedback"] });
    },
  });

  return (
    <div className="min-h-0 flex-1 overflow-auto px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-bold text-text-primary">Feedback i podrška (pilot)</h1>
        <p className="mt-1 text-sm text-text-secondary">Red čekanja, dodjela vlasnika, status OPEN → IN_PROGRESS → CLOSED.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="kategorija"
            className="rounded border border-border/60 bg-surface-primary px-3 py-2 text-sm"
          />
          <input
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            placeholder="severity"
            className="rounded border border-border/60 bg-surface-primary px-3 py-2 text-sm"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded border border-border/60 bg-surface-primary px-3 py-2 text-sm"
          >
            <option value="">svi statusi</option>
            <option value="OPEN">OPEN</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="CLOSED">CLOSED</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="NEW">NEW (legacy)</option>
          </select>
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl border border-border/50">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead className="border-b border-border/50 bg-surface-secondary/60 text-xs uppercase tracking-wide text-text-muted">
              <tr>
                <th className="px-3 py-2 font-medium">ID</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Naslov / poruka</th>
                <th className="px-3 py-2 font-medium">Vlasnik</th>
                <th className="px-3 py-2 font-medium">Akcije</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((f) => (
                <tr key={f.id} className="border-b border-border/40 align-top hover:bg-surface-secondary/30">
                  <td className="px-3 py-3 font-mono text-xs text-text-muted">{f.id}</td>
                  <td className="px-3 py-3">
                    <Badge variant="outline" className={cn("font-semibold", statusChipClass(f.status))}>
                      {f.status}
                    </Badge>
                  </td>
                  <td className="px-3 py-3">
                    {f.title ? <p className="font-medium text-text-primary">{f.title}</p> : null}
                    <p className="mt-1 whitespace-pre-wrap text-text-secondary">{f.message}</p>
                    <p className="mt-1 text-xs text-text-muted">
                      {f.category} · {f.severity}
                      {f.priority ? ` · prioritet ${f.priority}` : ""} · {f.page ?? "—"} · {f.createdAt}
                    </p>
                    {f.assignmentNote ? (
                      <p className="mt-1 text-xs text-amber-200/90">Bilješka pri dodjeli: {f.assignmentNote}</p>
                    ) : null}
                    {f.internalNote ? (
                      <p className="mt-1 text-xs text-violet-200/90">Interna: {f.internalNote}</p>
                    ) : null}
                    {f.resolutionNote ? (
                      <p className="mt-1 text-xs text-emerald-200/80">Rezolucija: {f.resolutionNote}</p>
                    ) : null}
                  </td>
                  <td className="px-3 py-3 text-xs text-text-secondary">{f.assignedTo ?? "—"}</td>
                  <td className="px-3 py-3">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap gap-1">
                        {(["OPEN", "IN_PROGRESS", "CLOSED"] as const).map((next) => (
                          <Button
                            key={next}
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-7 text-[11px]"
                            onClick={() => {
                              const note = next === "CLOSED" ? closeNoteById[f.id]?.trim() : undefined;
                              mutation.mutate({ id: f.id, next, ...(note ? { note } : {}) });
                            }}
                          >
                            {next}
                          </Button>
                        ))}
                      </div>
                      {(["TRIAGED", "RESOLVED"] as const).map((next) => (
                        <Button
                          key={next}
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-7 justify-start text-[11px] text-text-muted"
                          onClick={() => mutation.mutate({ id: f.id, next })}
                        >
                          → {next}
                        </Button>
                      ))}
                      <input
                        value={ownerById[f.id] ?? ""}
                        onChange={(e) => setOwnerById((prev) => ({ ...prev, [f.id]: e.target.value }))}
                        placeholder="ID vlasnika"
                        className="rounded border border-border/60 bg-surface-primary px-2 py-1 text-xs"
                      />
                      <input
                        value={assignNoteById[f.id] ?? ""}
                        onChange={(e) => setAssignNoteById((prev) => ({ ...prev, [f.id]: e.target.value }))}
                        placeholder="Bilješka pri dodjeli"
                        className="rounded border border-border/60 bg-surface-primary px-2 py-1 text-xs"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="h-8"
                        onClick={() => {
                          const note = assignNoteById[f.id]?.trim();
                          assignMutation.mutate({
                            id: f.id,
                            owner: ownerById[f.id] ?? "",
                            ...(note ? { note } : {}),
                          });
                        }}
                        disabled={!ownerById[f.id]?.trim()}
                      >
                        Dodijeli
                      </Button>
                      <input
                        value={closeNoteById[f.id] ?? ""}
                        onChange={(e) => setCloseNoteById((prev) => ({ ...prev, [f.id]: e.target.value }))}
                        placeholder="Interna bilješka pri zatvaranju"
                        className="rounded border border-border/60 bg-surface-primary px-2 py-1 text-xs"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-8"
                        onClick={() =>
                          resolveMutation.mutate({
                            id: f.id,
                            note: closeNoteById[f.id]?.trim() || assignNoteById[f.id]?.trim() || "Riješeno (RESOLVED)",
                          })
                        }
                      >
                        Označi RESOLVED (legacy)
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && !q.isLoading ? (
          <p className="mt-6 text-sm text-text-muted">Nema stavki za prikazane filtere.</p>
        ) : null}
      </div>
    </div>
  );
}
