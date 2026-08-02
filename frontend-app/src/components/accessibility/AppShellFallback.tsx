import type { JSX } from "react";
import { useTranslation } from "react-i18next";

import { A11Y_NS } from "@confora/i18n";

export function AppShellFallback(): JSX.Element {
  const { t } = useTranslation(A11Y_NS);

  return (
    <div className="p-6 text-sm text-text-secondary" role="status" aria-busy="true">
      {t("loading")}…
    </div>
  );
}
