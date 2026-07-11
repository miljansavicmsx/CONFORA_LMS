import { CANDIDATE_PORTAL_NS } from "@confora/i18n";
import { Loader2 } from "lucide-react";
import { type JSX, useId } from "react";
import { useTranslation } from "react-i18next";

import type { MyCertificateItem } from "@/lib/api-certificates";
import { useCandidatePortalStatusLabel } from "@/lib/candidate-portal-status-label";

export type CertificateSelectorProps = {
  readonly certificates: readonly MyCertificateItem[];
  readonly selectedId: string | null;
  readonly onSelect: (certificateId: string) => void;
  readonly loading?: boolean;
  readonly error?: boolean;
  readonly fallbackActive?: boolean;
};

export function CertificateSelector({
  certificates,
  selectedId,
  onSelect,
  loading = false,
  error = false,
  fallbackActive = false,
}: CertificateSelectorProps): JSX.Element {
  const { t } = useTranslation(CANDIDATE_PORTAL_NS);
  const labelId = useId();

  if (loading) {
    return (
      <div
        className="rounded-xl border border-border/50 bg-surface-secondary/30 px-4 py-6 text-sm text-text-secondary"
        data-testid="certificate-selector-loading"
        role="status"
      >
        <Loader2 className="mr-2 inline h-4 w-4 animate-spin" aria-hidden />
        {t("certificateSelector.loading")}
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-6 text-sm text-red-300"
        data-testid="certificate-selector-error"
        role="alert"
      >
        {t("certificateSelector.error")}
      </div>
    );
  }

  if (certificates.length === 0) {
    return (
      <div
        className="rounded-xl border border-border/50 bg-surface-secondary/30 px-4 py-8 text-center"
        data-testid="certificate-selector-empty"
      >
        <p className="text-base font-medium text-text-primary">{t("certificateSelector.emptyTitle")}</p>
        <p className="mt-2 text-sm text-text-secondary">{t("certificateSelector.emptyDescription")}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/50 bg-surface-secondary/20 px-4 py-4" data-testid="certificate-selector">
      <label htmlFor={labelId} className="block text-sm font-medium text-text-primary">
        {t("certificateSelector.label")}
      </label>
      {fallbackActive ? (
        <p className="mt-1 text-xs text-amber-400/90" data-testid="certificate-selector-fallback-hint">
          {t("certificateSelector.fallbackHint")}
        </p>
      ) : null}
      <select
        id={labelId}
        className="mt-2 w-full rounded-lg border border-border/60 bg-surface px-3 py-2 text-sm text-text-primary"
        value={selectedId ?? ""}
        onChange={(event) => {
          const next = event.target.value.trim();
          if (next) {
            onSelect(next);
          }
        }}
        data-testid="certificate-selector-select"
      >
        <option value="">{t("certificateSelector.placeholder")}</option>
        {certificates.map((cert) => (
          <option key={cert.certificateId} value={cert.certificateId}>
            {cert.schemeTitle ?? cert.title} — {cert.publicNumber ?? cert.certificateNumber}
          </option>
        ))}
      </select>
      {selectedId ? (
        <CertificateSelectorSummary
          certificate={certificates.find((c) => c.certificateId === selectedId) ?? null}
        />
      ) : null}
    </div>
  );
}

function CertificateSelectorSummary({
  certificate,
}: {
  readonly certificate: MyCertificateItem | null;
}): JSX.Element | null {
  const { t } = useTranslation(CANDIDATE_PORTAL_NS);
  const statusLabel = useCandidatePortalStatusLabel();
  if (!certificate) {
    return null;
  }
  return (
    <dl className="mt-3 grid gap-2 text-xs text-text-secondary sm:grid-cols-3" data-testid="certificate-selector-summary">
      <div>
        <dt className="font-medium text-text-muted">{t("certificateSelector.status")}</dt>
        <dd className="text-text-primary">{statusLabel(certificate.lifecycleStatus)}</dd>
      </div>
      <div>
        <dt className="font-medium text-text-muted">{t("certificateSelector.issuedAt")}</dt>
        <dd className="text-text-primary">{certificate.issuedAt ?? certificate.issueDate ?? "—"}</dd>
      </div>
      <div>
        <dt className="font-medium text-text-muted">{t("certificateSelector.validUntil")}</dt>
        <dd className="text-text-primary">{certificate.validUntil ?? certificate.expiryDate ?? "—"}</dd>
      </div>
    </dl>
  );
}
