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
import { submitCertificationAppeal } from "@/lib/api-grievances";

export type CertificationAppealDialogProps = {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly certificationDecisionId: string;
  readonly onSuccess?: () => void;
};

export function CertificationAppealDialog({
  open,
  onOpenChange,
  certificationDecisionId,
  onSuccess,
}: CertificationAppealDialogProps): JSX.Element {
  const qc = useQueryClient();
  const [summary, setSummary] = useState("");
  const [grounds, setGrounds] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      submitCertificationAppeal({
        certificationDecisionId,
        summary: summary.trim(),
        grounds: grounds.trim(),
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["myAppeals"] });
      onOpenChange(false);
      setSummary("");
      setGrounds("");
      onSuccess?.();
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!summary.trim() || !grounds.trim()) {
      return;
    }
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-border/60 bg-surface-primary sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-text-primary">Žalba na odluku certifikacije</DialogTitle>
          <DialogDescription className="text-text-secondary">
            Podnosite formalnu žalbu protiv konačne odluke. Obradu vodi komitet za žalbe; unutarnje bilješke osoblja nisu
            vidljive podnositelju.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="font-mono text-xs text-text-muted">Odluka: {certificationDecisionId}</p>
          <div className="space-y-2">
            <Label htmlFor="ap-sum" className="text-text-secondary">
              Sažetak
            </Label>
            <input
              id="ap-sum"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full rounded-md border border-border/60 bg-surface-secondary/80 px-3 py-2 text-sm text-text-primary"
              maxLength={2000}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ap-grounds" className="text-text-secondary">
              Obrazloženje
            </Label>
            <textarea
              id="ap-grounds"
              value={grounds}
              onChange={(e) => setGrounds(e.target.value)}
              rows={8}
              className="w-full rounded-md border border-border/60 bg-surface-secondary/80 px-3 py-2 text-sm text-text-primary"
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Odustani
            </Button>
            <Button type="submit" disabled={mutation.isPending} className="bg-amber-700 hover:bg-amber-700/90">
              {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Podnesi žalbu
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
