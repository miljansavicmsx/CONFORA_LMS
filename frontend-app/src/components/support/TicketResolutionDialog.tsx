import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useState, type FormEvent, type JSX } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { resolveTicket, type SupportTicketResolvePayload } from "@/lib/api-support-admin";
import type { SupportTicketResponse, TicketStatus, TicketType } from "@/lib/api-support";

const ADMIN_TICKETS_KEY = ["adminTickets"] as const;

const STATUS_OPTIONS: { value: TicketStatus; label: string }[] = [
  { value: "OPEN", label: "OPEN" },
  { value: "IN_PROGRESS", label: "IN_PROGRESS" },
  { value: "WAITING_FOR_USER", label: "WAITING_FOR_USER" },
  { value: "CLOSED", label: "CLOSED (završeno)" },
  { value: "UNDER_REVIEW", label: "UNDER_REVIEW (legacy)" },
  { value: "AWAITING_RESPONSE", label: "AWAITING_RESPONSE (legacy)" },
  { value: "RESOLVED", label: "RESOLVED (legacy→CLOSED pri spremanju)" },
  { value: "REJECTED", label: "REJECTED (legacy→CLOSED pri spremanju)" },
];

const KNOWN_TICKET_STATUSES = new Set<TicketStatus>(
  STATUS_OPTIONS.map((o) => o.value),
);

function coerceTicketStatus(value: string | undefined): TicketStatus {
  const v = String(value ?? "").trim().toUpperCase() as TicketStatus;
  return KNOWN_TICKET_STATUSES.has(v) ? v : "OPEN";
}

function typeLabel(t: TicketType | string): string {
  switch (String(t).toUpperCase()) {
    case "TECHNICAL_SUPPORT":
      return "Tehnička podrška";
    case "APPEAL":
      return "Žalba";
    case "COMPLAINT":
      return "Prigovor";
    case "TRAINING_PROPOSAL":
      return "Prijedlog obuke";
    case "IMPROVEMENT_PROPOSAL":
      return "Prijedlog poboljšanja";
    default:
      return String(t);
  }
}

export type TicketResolutionDialogProps = {
  readonly ticket: SupportTicketResponse | null;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSuccess?: () => void;
};

export function TicketResolutionDialog({
  ticket,
  open,
  onOpenChange,
  onSuccess,
}: TicketResolutionDialogProps): JSX.Element {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<TicketStatus>("OPEN");
  const [adminResponse, setAdminResponse] = useState("");
  const [incidentTag, setIncidentTag] = useState("");
  const [priority, setPriority] = useState("");
  const [owner, setOwner] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [timelineEntry, setTimelineEntry] = useState("");

  useEffect(() => {
    if (ticket && open) {
      setStatus(coerceTicketStatus(ticket.status));
      setAdminResponse(ticket.adminResponse?.trim() ?? "");
      setIncidentTag(ticket.incidentTag?.trim() ?? "");
      setPriority(ticket.priority?.trim() ?? "");
      setOwner(ticket.owner?.trim() ?? "");
      setInternalNotes(ticket.notes?.trim() ?? "");
      setTimelineEntry("");
    }
  }, [ticket, open]);

  const mutation = useMutation({
    mutationFn: async ({ id, body }: { id: string; body: SupportTicketResolvePayload }) =>
      resolveTicket(id, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ADMIN_TICKETS_KEY });
      onOpenChange(false);
      onSuccess?.();
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!ticket) {
      return;
    }
    const text = adminResponse.trim();
    if (!text) {
      return;
    }
    const body: SupportTicketResolvePayload = {
      status,
      adminResponse: text,
    };
    const it = incidentTag.trim();
    if (it) {
      body.incidentTag = it;
    }
    const pr = priority.trim();
    if (pr) {
      body.priority = pr;
    }
    const ow = owner.trim();
    if (ow) {
      body.owner = ow;
    }
    const notes = internalNotes.trim();
    if (notes) {
      body.notes = notes;
    }
    const tl = timelineEntry.trim();
    if (tl) {
      body.timelineEntry = tl;
    }
    mutation.mutate({
      id: ticket.ticketId,
      body,
    });
  };

  const userName = ticket?.fullName?.trim() || "—";
  const userEmail = ticket?.email?.trim() || "—";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto border-border/60 bg-surface-secondary text-text-primary sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Rješavanje tiketa</DialogTitle>
          <DialogDescription>
            Pregled zahtjeva učenika i službeni odgovor komiteta. ID:{" "}
            <span className="font-mono text-text-primary/90">{ticket?.ticketId ?? "—"}</span>
          </DialogDescription>
        </DialogHeader>

        {ticket ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-3 rounded-lg border border-border/50 bg-surface-primary/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Korisnik</p>
              <dl className="grid gap-2 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-text-muted">Ime i prezime</dt>
                  <dd className="font-medium text-text-primary">{userName}</dd>
                </div>
                <div>
                  <dt className="text-text-muted">E-pošta</dt>
                  <dd className="break-all font-medium text-text-primary">{userEmail}</dd>
                </div>
                <div>
                  <dt className="text-text-muted">Vrsta</dt>
                  <dd className="font-medium text-text-primary">{typeLabel(ticket.type)}</dd>
                </div>
              </dl>
              <div className="border-t border-border/40 pt-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Predmet</p>
                <p className="mt-1 font-semibold text-text-primary">{ticket.subject}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Poruka učenika</p>
                <p className="mt-2 max-h-48 overflow-y-auto whitespace-pre-wrap rounded-md border border-border/40 bg-surface-primary/80 p-3 text-sm text-text-secondary">
                  {ticket.message?.trim() ? ticket.message : "—"}
                </p>
              </div>
            </div>

            <div className="space-y-4 border-t border-border/40 pt-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Odluka komiteta</p>
              <div className="space-y-1.5">
                <Label htmlFor="resolution-status">Status</Label>
                <select
                  id="resolution-status"
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value as TicketStatus);
                  }}
                  className="h-10 w-full rounded-md border border-border/60 bg-surface-primary px-3 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="resolution-response">Zvanični odgovor komiteta</Label>
                <textarea
                  id="resolution-response"
                  value={adminResponse}
                  onChange={(e) => {
                    setAdminResponse(e.target.value);
                  }}
                  required
                  rows={5}
                  placeholder="Obrazloženje odluke ili upute za učenika…"
                  className="min-h-[120px] w-full resize-y rounded-md border border-border/60 bg-surface-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="incident-tag">Incident tag (opcionalno)</Label>
                  <input
                    id="incident-tag"
                    value={incidentTag}
                    onChange={(e) => setIncidentTag(e.target.value)}
                    className="h-10 w-full rounded-md border border-border/60 bg-surface-primary px-3 text-sm text-text-primary"
                    placeholder="npr. SEV2-billing"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="priority-field">Prioritet</Label>
                  <input
                    id="priority-field"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="h-10 w-full rounded-md border border-border/60 bg-surface-primary px-3 text-sm text-text-primary"
                    placeholder="HIGH / SEV3"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="owner-field">Vlasnik (opcionalno)</Label>
                  <input
                    id="owner-field"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    className="h-10 w-full rounded-md border border-border/60 bg-surface-primary px-3 text-sm text-text-primary"
                    placeholder="email ili id"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="internal-notes-field">Interna bilješka (ne vidi korisnik)</Label>
                  <textarea
                    id="internal-notes-field"
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    rows={3}
                    className="min-h-[72px] w-full resize-y rounded-md border border-border/60 bg-surface-primary px-3 py-2 text-sm text-text-primary"
                    placeholder="Samo osoblje (supportNotes)."
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="timeline-field">Zapis na vremenskoj crti (opcionalno)</Label>
                  <input
                    id="timeline-field"
                    value={timelineEntry}
                    onChange={(e) => setTimelineEntry(e.target.value)}
                    className="h-10 w-full rounded-md border border-border/60 bg-surface-primary px-3 text-sm text-text-primary"
                    placeholder="Kratka interna napomena"
                  />
                </div>
              </div>
            </div>

            {mutation.isError ? (
              <p className="text-sm text-red-300" role="alert">
                {mutation.error instanceof Error ? mutation.error.message : "Ažuriranje nije uspjelo."}
              </p>
            ) : null}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                className="border-border/60"
                onClick={() => onOpenChange(false)}
                disabled={mutation.isPending}
              >
                Odustani
              </Button>
              <Button type="submit" disabled={mutation.isPending || !adminResponse.trim()}>
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                    Spremanje…
                  </>
                ) : (
                  "Spremi odluku"
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <p className="text-sm text-text-secondary">Nije odabran tiket.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
