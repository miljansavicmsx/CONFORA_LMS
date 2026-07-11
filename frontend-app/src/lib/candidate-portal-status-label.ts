import { CANDIDATE_PORTAL_NS } from "@confora/i18n";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

/** Map backend status codes to candidate-portal i18n labels (no raw enums in UI). */
export function useCandidatePortalStatusLabel(): (status: string | null | undefined) => string {
  const { t } = useTranslation(CANDIDATE_PORTAL_NS);
  return useCallback(
    (status: string | null | undefined) => {
      const raw = String(status ?? "").trim();
      if (!raw) return "—";
      const key = `statusLabels.${raw}` as const;
      const translated = t(key);
      return translated === key ? raw : translated;
    },
    [t],
  );
}
