import type { MyCertificateItem } from "@/lib/api-certificates";

export function filterCpdSelectorCertificates(rows: readonly MyCertificateItem[]): readonly MyCertificateItem[] {
  return rows.filter((row) => row.credentialWalletCategory === "certification" && row.cpdEligible === true);
}
export function resolveDefaultCertificateId(rows: readonly MyCertificateItem[], fallback: string | null | undefined): string | null {
  const preferred = typeof fallback === "string" && rows.some((row) => row.certificateId === fallback) ? fallback : rows[0]?.certificateId;
  return preferred ?? null;
}
