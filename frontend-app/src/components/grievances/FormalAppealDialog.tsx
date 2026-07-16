import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { type FormEvent, useState, type JSX } from "react";

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
import { submitLearnerAppeal } from "@/lib/api/appeals-client";
import type { AppealCaseType } from "@/lib/api/appeals-types";
import { APPEAL_SECTION_NOTICE, learnerAppealTypeLabel } from "@/lib/appeals-complaints-labels";

const APPEAL_TYPES: { value: AppealCaseType; needs: "decision" | "application" }[] = [
  { value: "CERTIFICATION_DECISION_APPEAL", needs: "decision" },
  { value: "ADMINISTRATIVE_REJECTION_APPEAL", needs: "application" },
];

export type FormalAppealDialogProps = {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSuccess?: () => void;
};

export function FormalAppealDialog({
  open,
  onOpenChange,
  onSuccess,
}: FormalAppealDialogProps): JSX.Element {
  const qc = useQueryClient();
  const [appealType, setAppealType] = useState<AppealCaseType>("CERTIFICATION_DECISION_APPEAL");
  const [subject, setSubject] = useState("");
  const [grounds, setGrounds] = useState("");
  const [relatedRef, setRelatedRef] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const selected = APPEAL_TYPES.find((t) => t.value === appealType) ?? APPEAL_TYPES[0]!;

  const mutation = useMutation({
    mutationFn: async () => {
      const ref = relatedRef.trim();
      if (!ref) {
        throw new Error("RELATED_REF_REQUIRED");
      }
      return submitLearnerAppeal({
        summary: subject.trim(),
        grounds: grounds.trim(),
        certificationDecisionId: selected.needs === "decision" ? ref : "",
        certificationApplicationId: selected.needs === "application" ? ref : undefined,
        appealType,
      });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["myAppeals"] });
      onOpenChange(false);
      setSubject("");
      setGrounds("");
      setRelatedRef("");
      setFormError(null);
      onSuccess?.();
    },
    onError: (err: unknown) => {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Žalba trenutno nije dostupna. Provjerite referencu odluke/prijave.";
      if (msg === "RELATED_REF_REQUIRED") {
        setFormError("Unesite referencu odluke ili prijave na koju se žalite.");
        return;
      }
      setFormError("Žalba nije zaprimljena. Provjerite da referenca postoji i da imate pravo žalbe.");
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!subject.trim() || !grounds.trim()) {
      return;
    }
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto border-border/60 bg-surface-primary sm:max-w-lg"
        data-testid="learner-appeal-dialog"
      >
        <DialogHeader>
          <DialogTitle className="text-text-primary">Nova žalba</DialogTitle>
          <DialogDescription className="text-text-secondary">{APPEAL_SECTION_NOTICE}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-text-secondary">Vrsta žalbe</Label>
            <select
              value={appealType}
              onChange={(e) => setAppealType(e.target.value as AppealCaseType)}
              className="h-10 w-full rounded-md border border-border/60 bg-surface-secondary/80 px-3 text-sm text-text-primary"
              data-testid="learner-appeal-type"
            >
              {APPEAL_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {learnerAppealTypeLabel(t.value)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="appeal-subject" className="text-text-secondary">
              Predmet
            </Label>
            <input
              id="appeal-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-md border border-border/60 bg-surface-secondary/80 px-3 py-2 text-sm text-text-primary"
              maxLength={500}
              required
              data-testid="learner-appeal-subject"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="appeal-grounds" className="text-text-secondary">
              Obrazloženje
            </Label>
            <textarea
              id="appeal-grounds"
              value={grounds}
              onChange={(e) => setGrounds(e.target.value)}
              rows={5}
              className="w-full rounded-md border border-border/60 bg-surface-secondary/80 px-3 py-2 text-sm text-text-primary"
              required
              data-testid="learner-appeal-grounds"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="appeal-ref" className="text-text-secondary">
              {selected.needs === "decision"
                ? "Referenca odluke (UUID)"
                : "Referenca prijave (UUID)"}
            </Label>
            <input
              id="appeal-ref"
              value={relatedRef}
              onChange={(e) => setRelatedRef(e.target.value)}
              className="w-full rounded-md border border-border/60 bg-surface-secondary/80 px-3 py-2 font-mono text-sm text-text-primary"
              required
              data-testid="learner-appeal-related-ref"
            />
            <p className="text-xs text-text-muted">
              Žalba zahtijeva vezu na postojeću odluku ili prijavu. Ne mijenja status certifikacije ni rezultat ispita.
            </p>
          </div>
          {formError ? (
            <p className="text-sm text-red-200" role="alert" data-testid="learner-appeal-error">
              {formError}
            </p>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Odustani
            </Button>
            <Button type="submit" disabled={mutation.isPending} data-testid="learner-appeal-submit">
              {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Podnesi žalbu
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
