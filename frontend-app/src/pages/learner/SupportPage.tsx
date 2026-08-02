/**
 * Podrška i kontakt — learner support tickets (dashboard).
 * Formal appeals/complaints live on /dashboard/appeals-complaints (APPEALS-COMPLAINTS-1).
 */

import { useQuery } from "@tanstack/react-query";
import { ChevronDown, LifeBuoy, Loader2, Plus } from "lucide-react";
import { useCallback, useState, type JSX } from "react";
import { Link } from "react-router";

import { NewTicketDialog } from "@/components/support/NewTicketDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  fetchLearnerSupportTickets,
  type SupportTicketResponse,
  type TicketStatus,
} from "@/lib/api-support";
import { cn } from "@/lib/utils";

const QUERY_KEY = ["myTickets"] as const;

function formatDate(iso: string | null | undefined): string {
  if (!iso) {
    return "—";
  }
  try {
    return new Date(iso).toLocaleString("bs-BA", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function truncateId(id: string): string {
  const t = id.trim();
  if (t.length <= 12) {
    return t;
  }
  return `${t.slice(0, 8)}…${t.slice(-4)}`;
}

function typeBadge(type: string): { label: string; className: string } {
  switch (type) {
    case "TECHNICAL_SUPPORT":
      return {
        label: "Tehnička podrška",
        className: "border-sky-500/50 bg-sky-500/15 text-sky-100",
      };
    case "SUGGESTION":
      return {
        label: "Prijedlog",
        className: "border-violet-500/50 bg-violet-500/15 text-violet-100",
      };
    default:
      return {
        label: "Zahtjev za podršku",
        className: "border-border/60 bg-surface-primary/80 text-text-secondary",
      };
  }
}

function statusBadge(status: TicketStatus): { label: string; className: string } {
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
        label: "Čeka vas",
        className: "border-cyan-500/45 bg-cyan-500/12 text-cyan-100",
      };
    case "CLOSED":
      return {
        label: "Zatvoren",
        className: "border-muted-foreground/35 bg-muted-foreground/10 text-muted-foreground",
      };
    case "REJECTED":
      return { label: "Odbijeno", className: "border-red-500/50 bg-red-500/15 text-red-200" };
    default:
      return { label: "Status", className: "border-border/60 bg-surface-primary/80 text-text-secondary" };
  }
}

function TicketRow({ ticket }: { readonly ticket: SupportTicketResponse }): JSX.Element {
  const types = typeof ticket.type === "string" ? ticket.type.toUpperCase() : ticket.type;
  const t = typeBadge(types);
  const stRaw = typeof ticket.status === "string" ? ticket.status.toUpperCase() : String(ticket.status);
  let stKey = stRaw as TicketStatus;
  if (stRaw === "RESOLVED" || stRaw === "REJECTED") {
    stKey = "CLOSED";
  }
  if (stRaw === "UNDER_REVIEW") {
    stKey = "IN_PROGRESS";
  }
  if (stRaw === "AWAITING_RESPONSE") {
    stKey = "WAITING_FOR_USER";
  }
  const s = statusBadge(stKey);
  const hasAdmin = Boolean(ticket.adminResponse?.trim());

  return (
    <article className="rounded-xl border border-border/50 bg-surface-secondary/60 p-4 shadow-sm transition-colors hover:border-border/80">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
            <span className="font-mono" title={ticket.ticketId}>
              {truncateId(ticket.ticketId)}
            </span>
            <span aria-hidden>·</span>
            <time dateTime={ticket.createdAt}>{formatDate(ticket.createdAt)}</time>
          </div>
          <h2 className="text-base font-semibold text-text-primary">{ticket.subject}</h2>
          {ticket.message ? (
            <p className="whitespace-pre-wrap text-sm text-text-secondary">{ticket.message}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
          <Badge variant="outline" className={cn("border font-normal", t.className)}>
            {t.label}
          </Badge>
          <Badge variant="outline" className={cn("border font-normal", s.className)}>
            {s.label}
          </Badge>
        </div>
      </div>

      {ticket.supportTimeline?.length ? (
        <details className="mt-4 rounded-lg border border-border/40 bg-surface-primary/45">
          <summary className="cursor-pointer px-3 py-2 text-sm font-medium text-text-muted">
            Povijest komunikacije ({ticket.supportTimeline.length})
          </summary>
          <ul className="max-h-48 space-y-2 overflow-y-auto border-t border-border/30 px-3 py-2 text-xs text-text-secondary">
            {ticket.supportTimeline
              .slice()
              .reverse()
              .map((entry, idx) => (
                <li key={`${ticket.ticketId}-tl-${String(idx)}`} className="rounded border border-border/30 p-2">
                  <span className="font-mono text-text-muted">{entry.at ?? "—"}</span>
                  {" · "}
                  <span className="uppercase tracking-wide text-brand/90">{entry.kind ?? "note"}</span>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-text-primary">{entry.text}</p>
                </li>
              ))}
          </ul>
        </details>
      ) : null}

      {hasAdmin ? (
        <details className="group mt-4 rounded-lg border border-brand/20 bg-brand/5 open:border-brand/35">
          <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2.5 text-sm font-medium text-brand hover:bg-brand/10 [&::-webkit-details-marker]:hidden">
            <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden />
            Odgovor podrške
          </summary>
          <div className="border-t border-brand/15 px-3 py-3 text-sm text-text-primary">
            <p className="whitespace-pre-wrap">{ticket.adminResponse}</p>
          </div>
        </details>
      ) : null}
    </article>
  );
}

export default function SupportPage(): JSX.Element {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const ticketsQ = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchLearnerSupportTickets,
    retry: false,
  });

  const data = ticketsQ.data?.tickets ?? [];
  const ticketsUnavailable = ticketsQ.data?.unavailable ?? false;
  const isLoading = ticketsQ.isLoading;
  const isFetching = ticketsQ.isFetching;
  const refetch = ticketsQ.refetch;

  return (
    <div className="min-h-0 flex-1 overflow-auto px-4 py-8 lg:px-8" data-testid="learner-support-page">
      {toast ? (
        <div
          className="fixed bottom-6 left-1/2 z-50 max-w-md -translate-x-1/2 rounded-xl border border-emerald-500/40 bg-emerald-950/90 px-4 py-3 text-sm text-emerald-100 shadow-lg backdrop-blur"
          role="status"
        >
          {toast}
        </div>
      ) : null}

      <div className="mx-auto max-w-4xl">
        <header className="mb-8 flex flex-col gap-4 border-b border-border/40 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/15 ring-1 ring-brand/25">
              <LifeBuoy className="h-6 w-6 text-brand" aria-hidden />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-text-primary">Podrška i kontakt</h1>
              <p className="mt-1 max-w-2xl text-sm text-text-secondary">
                Tehnička pomoć, pitanja o edukaciji, prijavi ili verifikaciji. Podrška ne donosi odluke o certifikaciji
                niti mijenja status prijave. Zahtjev za podršku nije žalba niti prigovor.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-border/60 bg-surface-secondary/80"
              onClick={() => {
                void refetch();
              }}
              disabled={isFetching}
            >
              {isFetching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Osvježi
            </Button>
            <Button type="button" size="sm" onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" aria-hidden />
              Novi zahtjev
            </Button>
          </div>
        </header>

        <section className="mb-10 rounded-2xl border border-border/50 bg-surface-secondary/30 p-6 ring-1 ring-white/[0.04]">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">Žalbe i prigovori</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Formalne žalbe na odluke i prigovori na proces su odvojeni od zahtjeva za podršku. Kontakt ovdje ne
              postaje automatski žalba ni prigovor.
            </p>
            <p className="mt-2 text-xs text-text-muted" data-testid="learner-support-appeals-link-hint">
              Podnošenje i pregled žalbi/prigovora:{" "}
              <Link
                to="/dashboard/appeals-complaints"
                className="font-medium text-brand underline-offset-2 hover:underline"
                data-testid="learner-support-to-appeals-complaints"
              >
                Žalbe i prigovori
              </Link>
              .
            </p>
          </div>
        </section>

        {isLoading ? (
          <div className="flex min-h-[30vh] items-center justify-center gap-2 text-text-secondary">
            <Loader2 className="h-8 w-8 animate-spin text-brand" aria-hidden />
            <span>Učitavanje tiketa…</span>
          </div>
        ) : null}

        {ticketsUnavailable ? (
          <div
            className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-6 text-sm text-amber-100"
            data-testid="learner-support-tickets-unavailable"
            role="status"
          >
            <p className="font-medium">Trenutno nije moguće učitati zahtjeve.</p>
            <p className="mt-2 text-amber-100/90">
              Pokušajte ponovo ili koristite{" "}
              <Link to="/contact" className="font-medium text-brand underline-offset-2 hover:underline">
                javni kontakt obrazac
              </Link>
              .
            </p>
          </div>
        ) : null}

        {!isLoading && !ticketsUnavailable && data.length === 0 ? (
          <div
            className="rounded-xl border border-dashed border-border/60 bg-surface-secondary/40 p-10 text-center"
            data-testid="learner-support-empty-tickets"
          >
            <p className="text-text-secondary">Još nemate otvorenih zahtjeva za podršku.</p>
            <Button type="button" className="mt-4" onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" aria-hidden />
              Novi zahtjev
            </Button>
          </div>
        ) : null}

        {!isLoading && !ticketsUnavailable && data.length > 0 ? (
          <ul className="flex flex-col gap-4">
            {data.map((ticket) => (
              <li key={ticket.ticketId}>
                <TicketRow ticket={ticket} />
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <NewTicketDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => {
          showToast("Zahtjev je poslan.");
        }}
      />
    </div>
  );
}
