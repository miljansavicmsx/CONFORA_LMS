/**
 * SysAdmin — pregled immutable audit logova (ISO 12.2).
 */

import { useInfiniteQuery } from "@tanstack/react-query";
import { Copy, FileJson, Loader2, Shield } from "lucide-react";
import { useCallback, useMemo, useState, type JSX } from "react";

import { Button as UiButton } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { type AuditLog, fetchAuditLogs } from "@/lib/api-audit";
import { cn } from "@/lib/utils";

const QUERY_ROOT = ["admin", "audit-logs"] as const;

const ENTITY_PRESETS = [
  { value: "", label: "Svi tipovi" },
  { value: "CERTIFICATE", label: "CERTIFICATE" },
  { value: "EXAM_ATTEMPT", label: "EXAM_ATTEMPT" },
  { value: "ITEM_BANK", label: "ITEM_BANK" },
  { value: "ITEM_BANK_QUESTION", label: "ITEM_BANK_QUESTION (HITL AI)" },
  { value: "AI_TUTOR_SESSION", label: "AI_TUTOR_SESSION (AI tutor)" },
  { value: "USER", label: "USER" },
  { value: "COURSE", label: "COURSE" },
] as const;

function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
      return iso;
    }
    return new Intl.DateTimeFormat("hr-HR", {
      dateStyle: "short",
      timeStyle: "medium",
    }).format(d);
  } catch {
    return iso;
  }
}

function actionBadgeClass(action: string): string {
  const a = action.trim().toUpperCase();
  if (a === "CREATE" || a === "ISSUE") {
    return "border-emerald-500/40 bg-emerald-500/15 text-emerald-300";
  }
  if (a === "UPDATE" || a === "SUBMIT") {
    return "border-amber-500/40 bg-amber-500/15 text-amber-200";
  }
  if (a === "DELETE") {
    return "border-red-500/45 bg-red-500/15 text-red-300";
  }
  if (a === "VERIFY") {
    return "border-cyan-500/40 bg-cyan-500/15 text-cyan-200";
  }
  if (a === "APPROVE_AI") {
    return "border-emerald-500/45 bg-emerald-500/15 text-emerald-200";
  }
  return "border-border/60 bg-surface-secondary text-text-secondary";
}

function truncateId(id: string, max = 14): string {
  const s = id.trim();
  if (s.length <= max) {
    return s;
  }
  return `${s.slice(0, max)}…`;
}

async function copyText(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    /* ignore */
  }
}

export default function AuditLogs(): JSX.Element {
  const [entityType, setEntityType] = useState<string>("");
  const [actorIdInput, setActorIdInput] = useState<string>("");
  const [actorApplied, setActorApplied] = useState<string>("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLog, setDetailLog] = useState<AuditLog | null>(null);

  const filters = useMemo(
    () => ({
      entityType: entityType.trim() || undefined,
      actorId: actorApplied.trim() || undefined,
      limit: 50 as const,
    }),
    [entityType, actorApplied],
  );

  const query = useInfiniteQuery({
    queryKey: [...QUERY_ROOT, filters.entityType ?? "", filters.actorId ?? ""] as const,
    queryFn: ({ pageParam }) =>
      fetchAuditLogs({
        limit: 50,
        ...(filters.entityType ? { entityType: filters.entityType } : {}),
        ...(filters.actorId ? { actorId: filters.actorId } : {}),
        ...(pageParam ? { cursor: pageParam } : {}),
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });

  const flatItems = useMemo(
    () => query.data?.pages.flatMap((p) => [...p.items]) ?? [],
    [query.data?.pages],
  );

  const applyActorFilter = useCallback(() => {
    setActorApplied(actorIdInput.trim());
  }, [actorIdInput]);

  const openDetails = useCallback((log: AuditLog) => {
    setDetailLog(log);
    setDetailOpen(true);
  }, []);

  const detailsJson = useMemo(() => {
    if (!detailLog) {
      return "";
    }
    try {
      return JSON.stringify(detailLog.details ?? {}, null, 2);
    } catch {
      return String(detailLog.details);
    }
  }, [detailLog]);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-0 flex-1 overflow-auto px-4 py-8 lg:px-8">
        <div className="mx-auto max-w-[1600px]">
          <header className="mb-8 flex flex-col gap-4 border-b border-border/40 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/15 ring-1 ring-brand/25">
                <Shield className="h-6 w-6 text-brand" aria-hidden />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-text-primary">Audit logovi</h1>
                <p className="mt-1 max-w-2xl text-sm text-text-secondary">
                  Nepromjenjivi zapis kritičnih akcija (certifikati, ispiti, item bank). Pristup samo za
                  sys_admin.
                </p>
              </div>
            </div>
          </header>

          <div className="mb-6 flex flex-col gap-4 rounded-xl border border-border/50 bg-surface-secondary/40 p-4 backdrop-blur-sm sm:flex-row sm:flex-wrap sm:items-end">
            <div className="grid min-w-[200px] flex-1 gap-2 sm:max-w-xs">
              <label htmlFor="audit-entity-type" className="text-xs font-medium text-text-muted">
                Tip entiteta
              </label>
              <select
                id="audit-entity-type"
                value={entityType}
                onChange={(e) => {
                  setEntityType(e.target.value);
                }}
                className={cn(
                  "h-10 w-full rounded-lg border border-border/60 bg-surface-primary px-3 text-sm text-text-primary",
                  "focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand/40",
                )}
              >
                {ENTITY_PRESETS.map((o) => (
                  <option key={o.value || "all"} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid min-w-[220px] flex-1 gap-2 sm:max-w-md">
              <label htmlFor="audit-actor-id" className="text-xs font-medium text-text-muted">
                ID aktera (actorId)
              </label>
              <div className="flex gap-2">
                <input
                  id="audit-actor-id"
                  type="text"
                  value={actorIdInput}
                  onChange={(e) => setActorIdInput(e.target.value)}
                  placeholder="npr. Cognito sub / userId"
                  className={cn(
                    "h-10 min-w-0 flex-1 rounded-lg border border-border/60 bg-surface-primary px-3 text-sm text-text-primary placeholder:text-text-muted",
                    "focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand/40",
                  )}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      applyActorFilter();
                    }
                  }}
                />
                <UiButton
                  type="button"
                  variant="secondary"
                  className="shrink-0 border-border/60 bg-surface-primary"
                  onClick={applyActorFilter}
                >
                  Primijeni
                </UiButton>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-border/50 bg-surface-primary/60 shadow-inner">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-surface-secondary/80">
                    <th className="whitespace-nowrap px-3 py-2.5 font-semibold text-text-muted">
                      Vrijeme
                    </th>
                    <th className="whitespace-nowrap px-3 py-2.5 font-semibold text-text-muted">Akcija</th>
                    <th className="whitespace-nowrap px-3 py-2.5 font-semibold text-text-muted">
                      Tip entiteta
                    </th>
                    <th className="whitespace-nowrap px-3 py-2.5 font-semibold text-text-muted">
                      ID entiteta
                    </th>
                    <th className="whitespace-nowrap px-3 py-2.5 font-semibold text-text-muted">Akter</th>
                    <th className="whitespace-nowrap px-3 py-2.5 text-right font-semibold text-text-muted">
                      Detalji
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {query.isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-16 text-center text-text-secondary">
                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-brand" aria-hidden />
                        <p className="mt-3 text-sm">Učitavanje zapisa…</p>
                      </td>
                    </tr>
                  ) : query.isError ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-12 text-center text-red-400">
                        Došlo je do greške pri dohvaćanju audit loga. Provjeri sesiju (sys_admin) i API.
                      </td>
                    </tr>
                  ) : flatItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-14 text-center text-text-secondary">
                        Nema zapisa za odabrane filtere.
                      </td>
                    </tr>
                  ) : (
                    flatItems.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-border/30 transition-colors hover:bg-surface-secondary/50"
                      >
                        <td className="whitespace-nowrap px-3 py-2 font-mono text-xs text-text-primary">
                          {formatDateTime(row.timestamp)}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={cn(
                              "inline-flex rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                              actionBadgeClass(row.action),
                            )}
                          >
                            {row.action}
                          </span>
                        </td>
                        <td className="max-w-[140px] truncate px-3 py-2 font-medium text-text-primary">
                          {row.entityType}
                        </td>
                        <td className="max-w-[220px] px-3 py-2">
                          <div className="flex items-center gap-1.5">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="cursor-default font-mono text-xs text-text-secondary">
                                  {truncateId(row.entityId, 18)}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent
                                side="top"
                                className="max-w-md break-all font-mono text-xs"
                              >
                                {row.entityId}
                              </TooltipContent>
                            </Tooltip>
                            <UiButton
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 shrink-0 text-text-muted hover:text-brand"
                              aria-label="Kopiraj ID entiteta"
                              onClick={() => void copyText(row.entityId)}
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </UiButton>
                          </div>
                        </td>
                        <td className="max-w-[260px] px-3 py-2">
                          <div className="flex flex-col gap-0.5">
                            <span className="truncate font-mono text-xs text-text-primary" title={row.actorId}>
                              {row.actorId}
                            </span>
                            {row.ipAddress ? (
                              <span className="truncate font-mono text-[11px] text-text-muted">
                                IP: {row.ipAddress}
                              </span>
                            ) : (
                              <span className="text-[11px] text-text-muted/70">—</span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <UiButton
                            type="button"
                            variant="outline"
                            size="sm"
                            className="border-border/60 bg-surface-secondary/80 text-xs"
                            onClick={() => openDetails(row)}
                          >
                            <FileJson className="mr-1.5 h-3.5 w-3.5" />
                            Detalji
                          </UiButton>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {query.hasNextPage ? (
            <div className="mt-6 flex justify-center">
              <UiButton
                type="button"
                variant="secondary"
                className="min-w-[200px] border-border/60"
                disabled={query.isFetchingNextPage}
                onClick={() => void query.fetchNextPage()}
              >
                {query.isFetchingNextPage ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Učitavanje…
                  </>
                ) : (
                  "Učitaj još"
                )}
              </UiButton>
            </div>
          ) : null}

          <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
            <DialogContent className="max-h-[85vh] max-w-3xl overflow-hidden border-border/60 bg-surface-primary p-0 sm:rounded-xl">
              <DialogHeader className="border-b border-border/50 px-6 py-4">
                <DialogTitle className="text-lg text-text-primary">Detalji zapisa</DialogTitle>
                <DialogDescription className="text-text-secondary">
                  JSON payload (stanje prije/poslije, bodovi, AI zastavice, …)
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-[calc(85vh-8rem)] overflow-auto px-6 pb-6 pt-2">
                {detailLog ? (
                  <pre
                    className={cn(
                      "overflow-x-auto rounded-lg border border-border/50 bg-black/40 p-4 text-xs leading-relaxed",
                      "text-emerald-100/95 [tab-size:2]",
                    )}
                  >
                    <code>{detailsJson}</code>
                  </pre>
                ) : null}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </TooltipProvider>
  );
}
