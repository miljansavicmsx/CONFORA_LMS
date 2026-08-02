/**
 * Odbor / sys_admin — Registar žalbi i support tiketa (ISO 17024).
 */

import { useQuery } from "@tanstack/react-query";
import { Inbox, Loader2 } from "lucide-react";
import { useCallback, useMemo, useState, type JSX } from "react";

import { IsoGrievancesAdminPanel } from "@/components/grievances/IsoGrievancesAdminPanel";
import { TicketResolutionDialog } from "@/components/support/TicketResolutionDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchAllTickets } from "@/lib/api-support-admin";
import type { SupportTicketResponse, TicketStatus } from "@/lib/api-support";
import { formatApiErrorMessage } from "@/lib/format-api-error";
import { cn } from "@/lib/utils";

export type AdminTicketStatusFilter = "ALL" | TicketStatus;

const STATUS_FILTER_OPTIONS: { value: AdminTicketStatusFilter; label: string }[] = [
  { value: "ALL", label: "Svi" },
  { value: "OPEN", label: "OPEN" },
  { value: "IN_PROGRESS", label: "IN_PROGRESS" },
  { value: "WAITING_FOR_USER", label: "WAITING_FOR_USER" },
  { value: "CLOSED", label: "CLOSED" },
  { value: "RESOLVED", label: "RESOLVED (legacy)" },
  { value: "REJECTED", label: "REJECTED (legacy)" },
];

function formatDate(iso: string | null | undefined): string {
  if (!iso) {
    return "—";
  }
  try {
    return new Intl.DateTimeFormat("hr-HR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function typeBadge(type: string): { label: string; className: string } {
  switch (type) {
    case "TECHNICAL_SUPPORT":
      return {
        label: "Tehnička podrška",
        className: "border-sky-500/50 bg-sky-500/15 text-sky-100",
      };
    case "APPEAL":
      return {
        label: "Žalba",
        className: "border-amber-500/50 bg-amber-500/15 text-amber-100",
      };
    case "COMPLAINT":
      return {
        label: "Prigovor",
        className: "border-orange-500/50 bg-orange-500/15 text-orange-100",
      };
    case "SUGGESTION":
      return {
        label: "Prijedlog",
        className: "border-violet-500/50 bg-violet-500/15 text-violet-100",
      };
    case "IMPROVEMENT_PROPOSAL":
      return {
        label: "Prijedlog poboljšanja",
        className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-100",
      };
    case "TRAINING_PROPOSAL":
      return {
        label: "Prijedlog obuke",
        className: "border-teal-500/40 bg-teal-500/12 text-teal-100",
      };
    default:
      return {
        label: type,
        className: "border-border/60 bg-surface-primary/80 text-text-secondary",
      };
  }
}

function statusBadge(status: string): { label: string; className: string } {
  switch (status) {
    case "OPEN":
      return { label: "Otvoren", className: "border-blue-500/50 bg-blue-500/15 text-blue-100" };
    case "IN_PROGRESS":
      return {
        label: "U obradi",
        className: "border-amber-500/50 bg-amber-500/15 text-amber-100",
      };
    case "WAITING_FOR_USER":
      return {
        label: "Čeka korisnika",
        className: "border-cyan-500/45 bg-cyan-500/12 text-cyan-100",
      };
    case "CLOSED":
      return {
        label: "Zatvoren",
        className: "border-muted-foreground/35 bg-muted-foreground/10 text-muted-foreground",
      };
    case "UNDER_REVIEW":
      return statusBadge("IN_PROGRESS");
    case "AWAITING_RESPONSE":
      return statusBadge("WAITING_FOR_USER");
    case "RESOLVED":
      return statusBadge("CLOSED");
    case "REJECTED":
      return { label: "Odbijeno", className: "border-red-500/50 bg-red-500/15 text-red-200" };
    default:
      return { label: status, className: "border-border/60 bg-surface-primary/80 text-text-secondary" };
  }
}

export default function SupportAdminPage(): JSX.Element {
  const [mainTab, setMainTab] = useState<"tickets" | "iso">("tickets");
  const [statusFilter, setStatusFilter] = useState<AdminTicketStatusFilter>("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<SupportTicketResponse | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const query = useQuery({
    queryKey: ["adminTickets", statusFilter] as const,
    queryFn: () =>
      fetchAllTickets(statusFilter === "ALL" ? undefined : statusFilter),
  });

  const sorted = useMemo(() => {
    const rows = query.data ?? [];
    return [...rows].sort((a, b) => {
      const ta = new Date(a.createdAt).getTime();
      const tb = new Date(b.createdAt).getTime();
      return tb - ta;
    });
  }, [query.data]);
  const terminal = new Set(["CLOSED", "RESOLVED", "REJECTED"]);
  const openCount = sorted.filter((x) => !terminal.has(String(x.status).toUpperCase())).length;
  const highPriority = sorted.filter((x) => String(x.priority ?? "").toUpperCase().includes("HIGH") || String(x.priority ?? "").toUpperCase().includes("SEV")).length;
  const oldestOpen = sorted.find((x) => !terminal.has(String(x.status).toUpperCase()));

  const openResolve = useCallback((t: SupportTicketResponse) => {
    setSelected(t);
    setDialogOpen(true);
  }, []);

  return (
    <div className="min-h-0 flex-1 overflow-auto px-4 py-8 lg:px-8">
      {toast ? (
        <div
          className="fixed bottom-6 left-1/2 z-50 max-w-md -translate-x-1/2 rounded-xl border border-emerald-500/40 bg-emerald-950/90 px-4 py-3 text-sm text-emerald-100 shadow-lg backdrop-blur"
          role="status"
        >
          {toast}
        </div>
      ) : null}

      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-4 border-b border-border/40 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/15 ring-1 ring-brand/25">
              <Inbox className="h-6 w-6 text-brand" aria-hidden />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-text-primary">Registar žalbi</h1>
              <p className="mt-1 max-w-2xl text-sm text-text-secondary">
                Pregled svih zahtjeva, žalbi i prijava podrške. Odgovaraju odbor certifikacije i službeni administratori.
              </p>
            </div>
          </div>
        </header>

        <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as "tickets" | "iso")} className="w-full">
          <TabsList className="mb-6 grid w-full max-w-xl grid-cols-2 bg-surface-secondary/80">
            <TabsTrigger value="tickets">Support tiketi</TabsTrigger>
            <TabsTrigger value="iso">ISO žalbe i predmeti</TabsTrigger>
          </TabsList>

          <TabsContent value="iso" className="mt-0">
            <IsoGrievancesAdminPanel />
          </TabsContent>

          <TabsContent value="tickets" className="mt-0 space-y-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border/50 bg-surface-primary/60 p-4">
            <p className="text-xs text-text-muted">Unresolved cases</p>
            <p className="text-2xl font-semibold text-text-primary">{openCount}</p>
          </div>
          <div className={cn("rounded-xl border p-4", highPriority > 0 ? "border-red-500/50 bg-red-500/10" : "border-border/50 bg-surface-primary/60")}>
            <p className="text-xs text-text-muted">Priority queue / SLA risk</p>
            <p className="text-2xl font-semibold text-text-primary">{highPriority}</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-surface-primary/60 p-4">
            <p className="text-xs text-text-muted">Oldest open / response timer</p>
            <p className="text-sm font-semibold text-text-primary">{oldestOpen ? formatDate(oldestOpen.createdAt) : "—"}</p>
            <p className="mt-1 text-xs text-text-muted">Pilot tenant badge: active when ticket tenant metadata is present.</p>
          </div>
        </div>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <label htmlFor="support-admin-status" className="text-xs font-medium uppercase tracking-wider text-text-muted">
              Filtriraj po statusu
            </label>
            <select
              id="support-admin-status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as AdminTicketStatusFilter);
              }}
              className="h-10 w-full max-w-xs rounded-md border border-border/60 bg-surface-primary px-3 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 sm:w-auto"
            >
              {STATUS_FILTER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-border/60 bg-surface-secondary/80"
            onClick={() => {
              void query.refetch();
            }}
            disabled={query.isFetching}
          >
            {query.isFetching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Osvježi
          </Button>
        </div>

        <div className="overflow-hidden rounded-xl border border-border/50 bg-surface-primary/60 shadow-inner">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-surface-secondary/80">
                  <th className="whitespace-nowrap px-3 py-2.5 font-semibold text-text-muted">Datum</th>
                  <th className="whitespace-nowrap px-3 py-2.5 font-semibold text-text-muted">Korisnik</th>
                  <th className="whitespace-nowrap px-3 py-2.5 font-semibold text-text-muted">Vrsta</th>
                  <th className="min-w-[200px] px-3 py-2.5 font-semibold text-text-muted">Naslov</th>
                  <th className="whitespace-nowrap px-3 py-2.5 font-semibold text-text-muted">Status</th>
                  <th className="whitespace-nowrap px-3 py-2.5 text-right font-semibold text-text-muted">Akcija</th>
                </tr>
              </thead>
              <tbody>
                {query.isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-16 text-center text-text-secondary">
                      <Loader2 className="mx-auto h-8 w-8 animate-spin text-brand" aria-hidden />
                      <p className="mt-3 text-sm">Učitavanje tiketa…</p>
                    </td>
                  </tr>
                ) : query.isError ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-12 text-center text-red-300">
                      <p className="font-medium">Nije moguće učitati tikete.</p>
                      <p className="mt-2 text-sm text-red-200/80">{formatApiErrorMessage(query.error)}</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-4 border-red-500/40 text-red-100 hover:bg-red-500/15"
                        onClick={() => {
                          void query.refetch();
                        }}
                      >
                        Pokušaj ponovo
                      </Button>
                    </td>
                  </tr>
                ) : sorted.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-14 text-center text-text-secondary">
                      {statusFilter === "ALL"
                        ? "Nema otvorenih predmeta."
                        : "Nema tiketa za odabrani filter."}
                    </td>
                  </tr>
                ) : (
                  sorted.map((row) => {
                    const tb = typeBadge(String(row.type).toUpperCase());
                    const sb = statusBadge(String(row.status).toUpperCase());
                    const displayName = row.fullName?.trim() || row.email?.trim() || "—";
                    return (
                      <tr
                        key={row.ticketId}
                        className="border-b border-border/30 transition-colors hover:bg-surface-secondary/50"
                      >
                        <td className="whitespace-nowrap px-3 py-2.5 font-mono text-xs text-text-primary">
                          <time dateTime={row.createdAt}>{formatDate(row.createdAt)}</time>
                        </td>
                        <td className="max-w-[200px] px-3 py-2.5">
                          <span className="font-medium text-text-primary">{displayName}</span>
                          {row.email ? (
                            <p className="truncate text-xs text-text-muted" title={row.email}>
                              {row.email}
                            </p>
                          ) : null}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5">
                          <Badge variant="outline" className={cn("border font-normal", tb.className)}>
                            {tb.label}
                          </Badge>
                        </td>
                        <td className="max-w-[320px] px-3 py-2.5">
                          <p className="line-clamp-2 font-medium text-text-primary" title={row.subject}>
                            {row.subject}
                          </p>
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5">
                          <Badge variant="outline" className={cn("border font-normal", sb.className)}>
                            {sb.label}
                          </Badge>
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-right">
                          <Button type="button" size="sm" variant="secondary" onClick={() => openResolve(row)}>
                            Rješavanje
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
          </TabsContent>
        </Tabs>
      </div>

      <TicketResolutionDialog
        ticket={selected}
        open={dialogOpen}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) {
            setSelected(null);
          }
        }}
        onSuccess={() => {
          showToast("Odluka je spremljena.");
        }}
      />
    </div>
  );
}
