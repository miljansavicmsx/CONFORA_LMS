/**
 * Prikaz rezultata ISO evaluacije roleplay sesije (Claude).
 */

import { Loader2 } from "lucide-react";
import { type JSX } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type RoleplayEvaluateResponse } from "@/lib/api-roleplay";
import { cn } from "@/lib/utils";

export type EvaluationResultDialogProps = {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly loading: boolean;
  readonly result: RoleplayEvaluateResponse | null;
  readonly error: string | null;
  readonly onBackToCatalog?: () => void;
};

export function EvaluationResultDialog({
  open,
  onOpenChange,
  loading,
  result,
  error,
  onBackToCatalog,
}: EvaluationResultDialogProps): JSX.Element {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto border-border/60 bg-surface-secondary text-text-primary sm:rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-text-primary">Evaluacija audita</DialogTitle>
          <DialogDescription className="text-text-secondary">
            Rezultat analize transkripta prema ISO kriterijima scenarija.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-brand" aria-hidden />
            <p className="text-sm text-text-secondary">
              AI analizira transkript prema ISO kriterijima…
            </p>
          </div>
        ) : null}

        {!loading && error ? (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        {!loading && result ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-4 py-1.5 text-sm font-bold uppercase tracking-wide",
                  result.passed
                    ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40"
                    : "bg-red-500/20 text-red-300 ring-1 ring-red-500/40",
                )}
              >
                {result.passed ? "PROLAZ" : "NEPROLAZ"}
              </span>
              <div className="rounded-lg border border-border/50 bg-surface-primary/80 px-4 py-2">
                <p className="text-xs uppercase tracking-wider text-text-muted">Ocjena</p>
                <p className="text-2xl font-semibold tabular-nums text-text-primary">
                  {result.score}
                  <span className="text-lg font-normal text-text-muted">/100</span>
                </p>
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-text-muted">
                Povratna informacija
              </p>
              <div className="max-h-[40vh] overflow-y-auto rounded-lg border border-border/40 bg-surface-primary/60 p-4 text-sm leading-relaxed text-text-secondary">
                {result.feedback}
              </div>
            </div>
          </div>
        ) : null}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="ghost"
            className="text-text-secondary hover:text-text-primary"
            onClick={() => {
              onOpenChange(false);
            }}
          >
            Zatvori
          </Button>
          {onBackToCatalog && result && !loading ? (
            <Button
              type="button"
              className="bg-brand text-white hover:bg-brand/90"
              onClick={() => {
                onBackToCatalog();
              }}
            >
              Natrag na katalog
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
