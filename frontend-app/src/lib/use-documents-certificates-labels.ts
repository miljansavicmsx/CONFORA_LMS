import { CANDIDATE_PORTAL_NS } from "@confora/i18n";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { MyCertificateItem } from "@/lib/api-certificates";
import { shouldShowPublicVerifyLink } from "@/lib/learner-polish-labels";

export function useDocumentsCertificatesLabels() {
  const { t } = useTranslation(CANDIDATE_PORTAL_NS);

  const learnerDocumentTypeLabel = useCallback(
    (kind: string | null | undefined) => {
      const raw = String(kind ?? "").trim();
      if (!raw) {
        return t("wallet.documentTypes.default");
      }
      const u = raw.toUpperCase();
      return t(`wallet.documentTypes.${u}`, { defaultValue: t("wallet.documentTypes.default") });
    },
    [t],
  );

  const learnerCertificateStatusLabel = useCallback(
    (status: string | null | undefined) => {
      const u = String(status ?? "").trim().toUpperCase();
      if (!u) {
        return t("wallet.status.default");
      }
      return t(`wallet.status.${u}`, { defaultValue: t("wallet.status.default") });
    },
    [t],
  );

  return useMemo(
    () => ({
      learnerDocumentTypeLabel,
      learnerCertificateStatusLabel,
      confirmationSectionNotice: t("wallet.notices.confirmationSection"),
      professionalCertSectionNotice: t("wallet.notices.professionalSection"),
      confirmationEmptyCopy: t("wallet.notices.confirmationEmpty"),
      professionalCertEmptyCopy: t("wallet.notices.professionalEmpty"),
      pdfPendingCopy: t("wallet.notices.pdfPending"),
      digitalSignatureLocalMvpCopy: t("wallet.notices.digitalSignatureLocal"),
      walletFilters: [
        { id: "all" as const, label: t("wallet.filters.all") },
        { id: "exam_pass" as const, label: t("wallet.filters.examPass") },
        { id: "certification" as const, label: t("wallet.filters.certification") },
        { id: "active" as const, label: t("wallet.filters.active") },
        { id: "expired" as const, label: t("wallet.filters.expired") },
        { id: "suspended" as const, label: t("wallet.filters.suspended") },
        { id: "revoked" as const, label: t("wallet.filters.revoked") },
      ],
      heroEyebrow: t("wallet.hero.eyebrow"),
      heroTitle: t("wallet.hero.title"),
      heroDescription: t("wallet.hero.description"),
      loading: t("wallet.loading"),
      refresh: t("wallet.refresh"),
      publicVerify: t("wallet.publicVerify"),
      downloadPdf: t("wallet.downloadPdf"),
    }),
    [t, learnerDocumentTypeLabel, learnerCertificateStatusLabel],
  );
}

/** ISSUED and ACTIVE remain distinct — never collapse ISSUED to ACTIVE in UI. */
export function issuedIsDistinctFromActive(status: string): boolean {
  const u = status.trim().toUpperCase();
  return u === "ISSUED";
}

export function canDownloadPdf(item: Pick<MyCertificateItem, "pdfUrl" | "pdfDownloadAvailable">): boolean {
  if (item.pdfUrl?.trim()) {
    return true;
  }
  return Boolean(item.pdfDownloadAvailable);
}

export function shouldShowPublicVerificationForCertificate(
  item: Pick<MyCertificateItem, "publicVerifyUrl" | "verifyHash">,
): boolean {
  return shouldShowPublicVerifyLink(item.publicVerifyUrl, item.verifyHash);
}
