import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useCallback, useState, type FormEvent, type JSX } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createTicket, type TicketType } from "@/lib/api-support";
import { LEARNER_SUPPORT_REQUEST_OPTIONS } from "@/lib/learner-polish-labels";

const MY_TICKETS_KEY = ["myTickets"] as const;

const TYPE_OPTIONS = LEARNER_SUPPORT_REQUEST_OPTIONS.map((o) => ({
  value: o.id,
  label: o.label,
  ticketType: o.ticketType,
}));

export type NewTicketDialogProps = {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSuccess?: () => void;
};

export function NewTicketDialog({ open, onOpenChange, onSuccess }: NewTicketDialogProps): JSX.Element {
  const queryClient = useQueryClient();
  const [typeId, setTypeId] = useState(TYPE_OPTIONS[0]?.value ?? "tech");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [attachmentKey, setAttachmentKey] = useState("");
  const [gdprOk, setGdprOk] = useState(false);

  const reset = useCallback(() => {
    setTypeId(TYPE_OPTIONS[0]?.value ?? "tech");
    setSubject("");
    setMessage("");
    setFirstName("");
    setLastName("");
    setAttachmentKey("");
    setGdprOk(false);
  }, []);

  const mutation = useMutation({
    mutationFn: createTicket,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: MY_TICKETS_KEY });
      reset();
      onOpenChange(false);
      onSuccess?.();
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const sub = subject.trim();
    const msg = message.trim();
    if (!sub || !msg || !gdprOk) {
      return;
    }
    const fn = firstName.trim();
    const ln = lastName.trim();
    const atk = attachmentKey.trim();
    const selected = TYPE_OPTIONS.find((o) => o.value === typeId) ?? TYPE_OPTIONS[0];
    mutation.mutate({
      type: (selected?.ticketType ?? "TECHNICAL_SUPPORT") as TicketType,
      subject: sub,
      message: msg,
      gdprConsentAccepted: true,
      ...(fn ? { firstName: fn } : {}),
      ...(ln ? { lastName: ln } : {}),
      ...(atk ? { attachmentObjectKey: atk } : {}),
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !mutation.isPending) {
          reset();
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto border-border/60 bg-surface-secondary text-text-primary sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Novi Zahtjev</DialogTitle>
          <DialogDescription>
            Jedinstveni kanal za podršku, pritužbu, žalbu ili prijedlog. Prilog već uploadan pohranjuje se kao ključ
            objekta (nakon uploada dobijete vrijednost).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="support-fn">Ime (opcija)</Label>
              <Input
                id="support-fn"
                value={firstName}
                onChange={(ev) => {
                  setFirstName(ev.target.value);
                }}
                className="border-border/60 bg-surface-primary text-text-primary placeholder:text-text-muted focus-visible:ring-brand/50"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="support-ln">Prezime (opcija)</Label>
              <Input
                id="support-ln"
                value={lastName}
                onChange={(ev) => {
                  setLastName(ev.target.value);
                }}
                className="border-border/60 bg-surface-primary text-text-primary placeholder:text-text-muted focus-visible:ring-brand/50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="support-ticket-type">Vrsta zahtjeva</Label>
            <select
              id="support-ticket-type"
              data-testid="learner-support-request-type"
              value={typeId}
              onChange={(e) => {
                setTypeId(e.target.value);
              }}
              className="h-10 w-full rounded-md border border-border/60 bg-surface-primary px-3 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
            >
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="support-ticket-subject">Predmet</Label>
            <Input
              id="support-ticket-subject"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
              }}
              placeholder="Kratki naslov"
              required
              maxLength={500}
              className="border-border/60 bg-surface-primary text-text-primary placeholder:text-text-muted focus-visible:ring-brand/50"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="support-ticket-message">Opis</Label>
            <textarea
              id="support-ticket-message"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
              }}
              required
              rows={5}
              placeholder="Detaljan opis…"
              className="min-h-[120px] w-full resize-y rounded-md border border-border/60 bg-surface-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="support-attachment">Ključ priloga (opcija)</Label>
            <Input
              id="support-attachment"
              value={attachmentKey}
              onChange={(e) => setAttachmentKey(e.target.value)}
              placeholder="npr. tenant/user/uuid dokument.pdf"
              className="border-border/60 bg-surface-primary font-mono text-xs text-text-primary placeholder:text-text-muted focus-visible:ring-brand/50"
            />
          </div>

          <div className="flex items-start gap-2 rounded-md border border-border/50 bg-surface-primary/60 p-3">
            <Checkbox
              id="support-gdpr"
              checked={gdprOk}
              onCheckedChange={(v) => setGdprOk(v === true)}
              className="mt-0.5"
            />
            <label htmlFor="support-gdpr" className="cursor-pointer text-sm text-text-secondary">
              Sukladno GDPR-u dopuštam obradu ovih osobnih podataka u svrhu odgovora službe podrške.
            </label>
          </div>

          {mutation.isError ? (
            <p className="text-sm text-red-300" role="alert">
              {mutation.error instanceof Error ? mutation.error.message : "Slanje nije uspjelo."}
            </p>
          ) : null}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              className="border-border/60"
              onClick={() => {
                onOpenChange(false);
              }}
              disabled={mutation.isPending}
            >
              Odustani
            </Button>
            <Button type="submit" disabled={mutation.isPending || !subject.trim() || !message.trim() || !gdprOk}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  Šaljem…
                </>
              ) : (
                "Pošalji"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
