/**
 * DOCUMENTS-CERTIFICATES-1 — Learner document/certificate labels, trust and download helpers.
 */
import { shouldShowPublicVerifyLink } from "@/lib/learner-polish-labels";
import type { MyCertificateItem } from "@/lib/api-certificates";

export const CONFIRMATION_SECTION_NOTICE =
  "Ova potvrda nije ISO/IEC 17024 certifikat osobe.";

export const PROFESSIONAL_CERT_SECTION_NOTICE =
  "Profesionalni certifikat osobe izdaje se tek nakon odvojenog postupka certifikacije, odluke nadležne certifikacione strukture i izdavanja certifikata.";

export const CONFIRMATION_EMPTY_COPY =
  "Trenutno nemate dostupnih potvrda. Potvrde će se prikazati nakon evidentiranog završetka edukacije ili položenog ispita.";

export const PROFESSIONAL_CERT_EMPTY_COPY =
  "Trenutno nemate izdat profesionalni certifikat osobe. Certifikat se prikazuje nakon završetka odvojenog postupka certifikacije i izdavanja.";

export const PDF_PENDING_COPY = "PDF će biti dostupan nakon izdavanja dokumenta.";

export const DIGITAL_SIGNATURE_LOCAL_MVP_COPY =
  "Digitalni potpis nije aktiviran u lokalnom MVP okruženju.";

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  EXAM_PASS_CERTIFICATE: "Potvrda o položenom ispitu",
  EXAM_PASS: "Potvrda o položenom ispitu",
  "EXAM PASS": "Potvrda o položenom ispitu",
  COURSE_COMPLETION_CERTIFICATE: "Potvrda o završenoj edukaciji",
  EDUCATION_COMPLETION: "Potvrda o završenoj edukaciji",
  EDUCATION_COMPLETION_CONFIRMATION: "Potvrda o završenoj edukaciji",
  EDUCATION_COMPLETION_CERTIFICATE: "Potvrda o završenoj edukaciji",
  PERSON_CERTIFICATION: "Profesionalni certifikat osobe",
  "PERSON CERTIFICATION": "Profesionalni certifikat osobe",
  ISO_17024_CERTIFICATE: "ISO/IEC 17024 certifikat osobe",
};

const CERTIFICATE_STATUS_LABELS: Record<string, string> = {
  ISSUED: "Izdat",
  ACTIVE: "Aktivan",
  SUSPENDED: "Suspendovan",
  WITHDRAWN: "Povučen",
  REVOKED: "Opozvan",
  EXPIRED: "Istekao",
  PENDING_ISSUANCE: "Izdavanje u toku",
  DRAFT: "Nacrt",
  SUPERSEDED: "Zamijenjen",
  REPLACED: "Zamijenjen",
  VALID: "Aktivan",
  VALIDAN: "Aktivan",
};

export function learnerDocumentTypeLabel(kind: string | null | undefined): string {
  const raw = String(kind ?? "").trim();
  if (!raw) {
    return "Dokument";
  }
  const u = raw.toUpperCase();
  return DOCUMENT_TYPE_LABELS[u] ?? DOCUMENT_TYPE_LABELS[raw] ?? "Dokument";
}

export function learnerCertificateStatusLabel(status: string | null | undefined): string {
  const u = String(status ?? "").trim().toUpperCase();
  if (!u) {
    return "—";
  }
  return CERTIFICATE_STATUS_LABELS[u] ?? "—";
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
  item: Pick<MyCertificateItem, "credentialWalletCategory" | "lifecycleStatus" | "learnerVerifyPath">,
): boolean {
  if (item.credentialWalletCategory !== "certification") {
    return false;
  }
  if (!item.learnerVerifyPath?.trim()) {
    return false;
  }
  return shouldShowPublicVerifyLink(item.lifecycleStatus);
}

export function hideRawEnumFromLearnerText(text: string): boolean {
  const u = text.toUpperCase();
  return (
    u.includes("EXAM_PASS") ||
    u.includes("PERSON_CERTIFICATION") ||
    u.includes("ISO_17024") ||
    u.includes("EDUCATION_COMPLETION")
  );
}

export const LEARNER_WALLET_FORBIDDEN_KEYS = [
  "pdfStorageKey",
  "tenantId",
  "userId",
  "reviewerNotes",
  "committeeVotes",
  "auditEvents",
  "decisionRationale",
] as const;
