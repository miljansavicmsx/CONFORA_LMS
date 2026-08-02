/**
 * Staff-only document key display — no public presigned URL for identity evidence (F5-UI-3).
 */

import { FileKey, Lock } from "lucide-react";
import { type JSX } from "react";

export type DocumentEvidenceKeyPanelProps = {
  readonly title: string;
  readonly storageKey: string | null | undefined;
  readonly statusLabel?: string;
  readonly testIdPrefix?: string;
};

export function DocumentEvidenceKeyPanel({
  title,
  storageKey,
  statusLabel,
  testIdPrefix = "doc-evidence",
}: DocumentEvidenceKeyPanelProps): JSX.Element {
  const key = storageKey?.trim() ?? "";
  const hasKey = key.length > 0;

  return (
    <div
      className="rounded-lg border border-border/40 bg-surface-secondary/40 p-3"
      data-testid={`${testIdPrefix}-panel`}
    >
      <div className="mb-2 flex items-center gap-2">
        <FileKey className="h-4 w-4 text-brand" aria-hidden />
        <p className="text-xs font-semibold text-text-primary">{title}</p>
      </div>
      <p className="break-all font-mono text-xs text-text-secondary" data-testid={`${testIdPrefix}-key`}>
        {hasKey ? key : "— (nema ključa — placeholder demo)"}
      </p>
      <p className="mt-2 flex items-start gap-1.5 text-[11px] text-text-muted" data-testid={`${testIdPrefix}-privacy`}>
        <Lock className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
        Privatni dokument — samo ovlašteni operator; javna verifikacija ne izlaže sadržaj dokumenata.
      </p>
      {statusLabel ? (
        <p className="mt-1 text-xs text-text-secondary" data-testid={`${testIdPrefix}-status`}>
          Status: {statusLabel}
        </p>
      ) : null}
    </div>
  );
}
