import type { MyCertificateItem } from "@/lib/api-certificates";

/** Certificates suitable for CPD / recertification selector (TD-081). */
export function filterCpdSelectorCertificates(items: readonly MyCertificateItem[]): MyCertificateItem[] {
  return items.filter((item) => {
    if (item.credentialWalletCategory !== "certification") {
      return false;
    }
    if (item.cpdEligible === false || item.recertificationEligible === false) {
      return false;
    }
    if (item.cpdEligible === true || item.recertificationEligible === true) {
      return true;
    }
    // Backward compatibility when API omits eligibility flags (legacy wallet).
    return item.certificateKind === "PERSON_CERTIFICATION";
  });
}

export function resolveDefaultCertificateId(
  items: readonly MyCertificateItem[],
  fallbackId?: string | null,
): string | null {
  const eligible = filterCpdSelectorCertificates(items);
  if (eligible.length === 0) {
    return null;
  }
  const trimmedFallback = fallbackId?.trim();
  if (trimmedFallback && eligible.some((c) => c.certificateId === trimmedFallback)) {
    return trimmedFallback;
  }
  if (eligible.length === 1) {
    return eligible[0]?.certificateId ?? null;
  }
  return null;
}
