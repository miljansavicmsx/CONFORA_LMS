/**
 * F5-UI-5 — controlled staff document access with audited presigned preview.
 */

import { FileKey, Loader2, Lock, ShieldAlert } from "lucide-react";
import { useState, type JSX } from "react";

import { Button } from "@/components/ui/button";
import {
  requestStaffDocumentPreview,
  type StaffDocumentPreviewKind,
} from "@/lib/api-staff-document-preview";

export type ControlledDocumentAccessPanelProps = {
  readonly title: string;
  readonly storageKey: string | null | undefined;
  readonly statusLabel?: string;
  readonly auditNote?: string;
  readonly testIdPrefix?: string;
  readonly documentKind?: StaffDocumentPreviewKind;
  readonly verificationId?: string;
  readonly certificateId?: string;
  readonly previewEnabled?: boolean;
};

export function ControlledDocumentAccessPanel({
  title,
  storageKey,
  statusLabel,
  auditNote = "Svaki pregled dokumenta bilježi STAFF_DOCUMENT_PREVIEW_ISSUED u audit log.",
  testIdPrefix = "controlled-doc",
  documentKind = "identity_evidence",
  verificationId,
  certificateId,
  previewEnabled = true,
}: ControlledDocumentAccessPanelProps): JSX.Element {
  const key = storageKey?.trim() ?? "";
  const hasKey = key.length > 0;
  const canPreview = previewEnabled && hasKey;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ttlSeconds, setTtlSeconds] = useState<number | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [previewIssued, setPreviewIssued] = useState(false);

  async function handlePreview(): Promise<void> {
    if (!canPreview || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await requestStaffDocumentPreview({
        documentKind,
        storageKey: key,
        ...(verificationId ? { verificationId } : {}),
        ...(certificateId ? { certificateId } : {}),
      });
      setTtlSeconds(res.ttlSeconds);
      setExpiresAt(res.expiresAt);
      setPreviewIssued(true);
      window.open(res.previewUrl, "_blank", "noopener,noreferrer");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Pregled nije dostupan.");
    } finally {
      setLoading(false);
    }
  }

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
        {hasKey ? key : "— (nema ključa)"}
      </p>
      {statusLabel ? (
        <p className="mt-1 text-xs text-text-secondary" data-testid={`${testIdPrefix}-status`}>
          Status: {statusLabel}
        </p>
      ) : null}
      <p className="mt-2 flex items-start gap-1.5 text-[11px] text-text-muted" data-testid={`${testIdPrefix}-privacy`}>
        <Lock className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
        Privatni dokument — samo ovlašteni operator; nema javnog URL-a za identitet.
      </p>
      <p className="mt-1 flex items-start gap-1.5 text-[11px] text-amber-100/90" data-testid={`${testIdPrefix}-audit-note`}>
        <ShieldAlert className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
        {auditNote}
      </p>
      {ttlSeconds != null ? (
        <p className="mt-2 text-[11px] text-text-secondary" data-testid={`${testIdPrefix}-preview-ttl`}>
          Presigned TTL: {ttlSeconds}s
          {expiresAt ? ` · ističe ${new Date(expiresAt).toLocaleTimeString()}` : ""}
        </p>
      ) : null}
      {error ? (
        <p className="mt-2 text-[11px] text-red-300" data-testid={`${testIdPrefix}-preview-error`}>
          {error}
        </p>
      ) : null}
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="mt-3"
        disabled={!canPreview || loading}
        data-testid={canPreview ? `${testIdPrefix}-preview-button` : `${testIdPrefix}-preview-disabled`}
        onClick={() => void handlePreview()}
        title={canPreview ? "Audited staff presigned preview (short TTL)" : "Nema ključa za pregled"}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-3 w-3 animate-spin" aria-hidden />
            Izdavanje pregleda…
          </>
        ) : previewIssued ? (
          "Ponovni pregled (audit + presign)"
        ) : (
          "Pregled dokumenta (audit + presign)"
        )}
      </Button>
      <p className="sr-only" data-testid={`${testIdPrefix}-no-public-url`}>
        No public document URL exposed
      </p>
    </div>
  );
}
