/**
 * Non-biometric manual identity review operator panel (ISO §12.1 MVP).
 * Document metadata + operator approve/reject/escalate — no biometrics, selfie, or face-match.
 */

import { AlertTriangle, ShieldCheck } from "lucide-react";
import { type JSX } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { IdentityVerificationStatus, UserRegistryRow } from "@/lib/api-user-registry";
import { cn } from "@/lib/utils";

export type ManualIdentityReviewPanelProps = {
  readonly user: UserRegistryRow;
  readonly onStatusChange: (status: IdentityVerificationStatus) => void;
  readonly onNotesChange: (notes: string) => void;
  readonly disabled?: boolean;
};

function statusBadgeClass(s: IdentityVerificationStatus): string {
  switch (s) {
    case "verified":
      return "border-emerald-500/40 bg-emerald-500/15 text-emerald-200";
    case "pending":
      return "border-amber-500/40 bg-amber-500/15 text-amber-100";
    case "rejected":
      return "border-red-500/40 bg-red-500/15 text-red-200";
    default:
      return "border-border/50 bg-surface-secondary text-text-muted";
  }
}

export function ManualIdentityReviewPanel({
  user,
  onStatusChange,
  onNotesChange,
  disabled = false,
}: ManualIdentityReviewPanelProps): JSX.Element {
  return (
    <section
      className="rounded-xl border border-border/50 bg-surface-primary/50 p-4"
      aria-labelledby="manual-id-review-title"
      data-testid="manual-id-review-panel"
    >
      <div className="mb-3 flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-brand" aria-hidden />
        <h3 id="manual-id-review-title" className="text-sm font-semibold text-text-primary">
          Ručna provjera identiteta (MVP)
        </h3>
      </div>

      <div
        className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100"
        data-testid="manual-id-privacy-notice"
      >
        <p className="font-medium">Ograničenja privatnosti — nije produkcijska verifikacija</p>
        <ul className="mt-1 list-inside list-disc space-y-0.5 text-amber-100/90">
          <li>Bez biometrije, selfija ili face-match</li>
          <li>Bez automatizirane IAL-3 provjere</li>
          <li>Operator pregledava metapodatke dokumenata i bilješke</li>
          <li>Pravna/GDPR odobrenja nisu zatražena u ovom lokalnom demo MVP-u</li>
        </ul>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label className="text-xs text-text-muted">JMBG / nacionalni ID</Label>
          <p className="mt-1 font-mono text-sm text-text-primary" data-testid="manual-id-national-id">
            {user.nationalId?.trim() || "— (nije uneseno)"}
          </p>
        </div>
        <div>
          <Label className="text-xs text-text-muted">Status verifikacije</Label>
          <p className="mt-1">
            <span
              className={cn(
                "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                statusBadgeClass(user.identityVerificationStatus),
              )}
              data-testid="manual-id-status-badge"
            >
              {user.identityVerificationStatus}
            </span>
          </p>
        </div>
        <div className="sm:col-span-2">
          <Label className="text-xs text-text-muted">S3 ključ — sken ID (metapodatak)</Label>
          <p className="mt-1 break-all font-mono text-xs text-text-secondary" data-testid="manual-id-doc-key">
            {user.identityDocumentIdKey?.trim() || "— (placeholder — nema upload pregleda)"}
          </p>
        </div>
        <div className="sm:col-span-2">
          <Label className="text-xs text-text-muted">S3 ključ — diploma (metapodatak)</Label>
          <p className="mt-1 break-all font-mono text-xs text-text-secondary" data-testid="manual-id-diploma-key">
            {user.identityDocumentDiplomaKey?.trim() || "—"}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <Label htmlFor="manual-id-notes">Napomena operatora</Label>
        <textarea
          id="manual-id-notes"
          rows={3}
          className="w-full rounded-md border border-border/60 bg-surface-primary px-3 py-2 text-sm text-text-primary disabled:opacity-60"
          value={user.identityNotes ?? ""}
          onChange={(e) => onNotesChange(e.target.value)}
          disabled={disabled}
          data-testid="manual-id-notes"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2" data-testid="manual-id-action-buttons">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/10"
          disabled={disabled}
          onClick={() => onStatusChange("verified")}
          data-testid="manual-id-approve-button"
        >
          Odobri (verified)
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="border-red-500/40 text-red-200 hover:bg-red-500/10"
          disabled={disabled}
          onClick={() => onStatusChange("rejected")}
          data-testid="manual-id-reject-button"
        >
          Odbij (rejected)
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={disabled}
          onClick={() => onStatusChange("pending")}
          data-testid="manual-id-escalate-button"
        >
          Eskaliraj (pending)
        </Button>
      </div>

      <p className="mt-3 flex items-start gap-2 text-xs text-text-muted">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
        Ručna provjera identiteta ne certificira kandidata automatski i nije korak odluke o certifikaciji.
      </p>
    </section>
  );
}
