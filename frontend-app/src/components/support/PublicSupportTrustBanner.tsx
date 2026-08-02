import { type JSX } from "react";

import {
  PUBLIC_SUPPORT_DATA_MINIMIZATION_MESSAGE,
  PUBLIC_SUPPORT_NO_CERT_APPROVAL_MESSAGE,
  PUBLIC_SUPPORT_PRIVACY_MESSAGE,
} from "@/lib/support-contact-labels";

export function PublicSupportTrustBanner(): JSX.Element {
  return (
    <aside
      className="mt-4 space-y-2 rounded-lg border border-border/60 bg-surface-secondary/40 p-4 text-sm text-text-secondary"
      data-testid="public-support-trust-banner"
    >
      <p data-testid="public-support-data-minimization">{PUBLIC_SUPPORT_DATA_MINIMIZATION_MESSAGE}</p>
      <p data-testid="public-support-no-cert-approval">{PUBLIC_SUPPORT_NO_CERT_APPROVAL_MESSAGE}</p>
      <p>{PUBLIC_SUPPORT_PRIVACY_MESSAGE}</p>
    </aside>
  );
}
