import { Info, X } from "lucide-react";
import { useId, useState, type JSX, type ReactNode } from "react";
import { Link } from "react-router";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { EnterpriseAiBadge } from "./EnterpriseAiBadge";
import { ds } from "./tokens";

/**
 * UX-only kartica preporuke (nema automatizacije bez korisnika; „Accept” samo navigira).
 */
export function AiSuggestionCard({
  title,
  body,
  confidenceLabel,
  acceptHref,
  acceptLabel,
  className,
  explanationTitle = "Kako su formirani signali koji vode ovaj prijedlog",
  explanationBody,
  auditTrailHref,
  humanApprovalRequired = true,
  rejectLabel = "Odbaci prijedlog",
}: {
  readonly title: string;
  readonly body: ReactNode;
  readonly confidenceLabel: string;
  readonly acceptHref: string;
  readonly acceptLabel: string;
  readonly className?: string;
  readonly explanationTitle?: string;
  readonly explanationBody?: ReactNode;
  /** Opcionalni link na audit pregled ako je dostupan istom korisniku (samo navigacija). */
  readonly auditTrailHref?: string;
  /** @default true */
  readonly humanApprovalRequired?: boolean;
  readonly rejectLabel?: string;
}): JSX.Element | null {
  const [dismissed, setDismissed] = useState(false);
  const explainId = useId();
  if (dismissed) {
    return null;
  }

  const explainContent =
    explanationBody ??
    (
      <p>
        Prijedlog kombinira već učitane signale (aktivni moduli, ispiti, status certifikacije) i eksplicitno traži vašu
        potvrdu prije bilo kakve automatizirane promjene stanja.
      </p>
    );

  return (
    <div
      className={cn(
        "rounded-2xl border bg-gradient-to-br from-violet-500/[0.14] to-surface-secondary/80 p-5 shadow-[0_18px_50px_-30px_rgba(139,92,246,0.55)]",
        ds.semantics.ai.accentBorder,
        className,
      )}
      role="region"
      aria-label="Prijedlog za sljedeći korak"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <EnterpriseAiBadge humanApprovalRequired={humanApprovalRequired}>AI-assisted prijedlog</EnterpriseAiBadge>
        <span className="text-[11px] font-medium uppercase tracking-wide text-text-muted" id={explainId}>
          {confidenceLabel}
        </span>
      </div>
      <h3 className="mt-3 text-base font-semibold text-text-primary">{title}</h3>
      <div className="mt-2 text-sm leading-relaxed text-text-secondary">{body}</div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={cn(ds.focusRing, "border-violet-500/35 text-violet-100 hover:bg-violet-500/10")}
              aria-describedby={explainId}
            >
              <Info className="mr-1.5 h-4 w-4" aria-hidden />
              Objašnjenje AI signala
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto border-border bg-surface-secondary text-text-primary sm:rounded-2xl">
            <DialogHeader>
              <DialogTitle>{explanationTitle}</DialogTitle>
              <DialogDescription asChild>
                <div className="space-y-3 text-sm text-text-secondary">{explainContent}</div>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-6">
              <p className="w-full text-left text-xs leading-relaxed text-text-muted">
                Ovo je transparentan pregled bez automatskih promjena u sustavu dok korisnik ne poduzme eksplicitnu radnju.
              </p>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {auditTrailHref ? (
          <Button asChild type="button" variant="ghost" size="sm" className={ds.focusRing}>
            <Link to={auditTrailHref}>Pregled audit traga</Link>
          </Button>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button asChild type="button" size="sm" className="bg-violet-600 text-white hover:bg-violet-600/90">
          <Link to={acceptHref}>{acceptLabel}</Link>
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className={cn(ds.focusRing, "text-text-muted hover:text-text-primary")}
          onClick={() => setDismissed(true)}
        >
          <X className="mr-1 h-4 w-4" aria-hidden />
          {rejectLabel}
        </Button>
      </div>
    </div>
  );
}
