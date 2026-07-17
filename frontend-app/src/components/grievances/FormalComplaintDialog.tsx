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
import { createComplaint, type CaseCategory } from "@/lib/api-grievances";

const CATEGORIES: { value: Exclude<CaseCategory, "appeal">; label: string }[] = [
  { value: "complaint", label: "Prigovor na proces / uslugu" },
  { value: "technical_support", label: "Tehnički prigovor (platforma)" },
  { value: "improvement_proposal", label: "Prijedlog poboljšanja" },
  { value: "training_proposal", label: "Prijedlog obuke" },
];

export type FormalComplaintDialogProps = {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSuccess?: () => void;
  readonly certificationApplicationId?: string;
  readonly certificationDecisionId?: string;
  readonly certificateId?: string;
};

export function FormalComplaintDialog({
  open,
  onOpenChange,
  onSuccess,
  certificationApplicationId,
  certificationDecisionId,
  certificateId,
}: FormalComplaintDialogProps): JSX.Element {
  const qc = useQueryClient();
  const [category, setCategory] = useState<Exclude<CaseCategory, "appeal">>("complaint");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const base = {
        category,
        subject: subject.trim(),
        description: description.trim(),
      };
      const extra: {
        certificationApplicationId?: string;
        certificationDecisionId?: string;
        certificateId?: string;
      } = {};
      const a = certificationApplicationId?.trim();
      const d = certificationDecisionId?.trim();
      const c = certificateId?.trim();
      if (a) {
        extra.certificationApplicationId = a;
      }
      if (d) {
        extra.certificationDecisionId = d;
      }
      if (c) {
        extra.certificateId = c;
      }
      return createComplaint({ ...base, ...extra });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["myComplaints"] });
      onOpenChange(false);
      setSubject("");
      setDescription("");
      setFormError(null);
      onSuccess?.();
    },
    onError: () => {
      setFormError("Prigovor nije zaprimljen. Pokušajte ponovo ili kontaktirajte podršku.");
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!subject.trim() || !description.trim()) {
      return;
    }
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-border/60 bg-surface-primary sm:max-w-lg" data-testid="learner-complaint-dialog">
        <DialogHeader>
          <DialogTitle className="text-text-primary">Novi prigovor</DialogTitle>
          <DialogDescription className="text-text-secondary">
            Prigovor je izraz nezadovoljstva procesom, uslugom ili ponašanjem. Nije žalba na odluku i nije zahtjev za
            podršku / kontakt. Podnošenje prigovora ne mijenja status certifikacije niti rezultat ispita.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-text-secondary">Kategorija</Label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as Exclude<CaseCategory, "appeal">);
              }}
              className="h-10 w-full rounded-md border border-border/60 bg-surface-secondary/80 px-3 text-sm text-text-primary"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fc-subject" className="text-text-secondary">
              Predmet
            </Label>
            <input
              id="fc-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-md border border-border/60 bg-surface-secondary/80 px-3 py-2 text-sm text-text-primary"
              maxLength={500}
              required
              data-testid="learner-complaint-subject"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fc-desc" className="text-text-secondary">
              Opis
            </Label>
            <textarea
              id="fc-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="w-full rounded-md border border-border/60 bg-surface-secondary/80 px-3 py-2 text-sm text-text-primary"
              required
              data-testid="learner-complaint-description"
            />
          </div>
          {formError ? (
            <p className="text-sm text-red-200" role="alert" data-testid="learner-complaint-error">
              {formError}
            </p>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Odustani
            </Button>
            <Button type="submit" disabled={mutation.isPending} data-testid="learner-complaint-submit">
              {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Podnesi prigovor
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
