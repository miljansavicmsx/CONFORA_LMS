/**
 * SUPPORT-CONTACT-1 — Public/learner support copy, categories and field guards.
 */
import { resolveContactRequestType, type ContactRequestType } from "@/lib/api/contact-category.util";

export type PublicSupportCategoryValue =
  | "general"
  | "education_programme"
  | "cert_application"
  | "cert_verification"
  | "tech_support";

export type LearnerSupportContext = "education" | "certification" | "verification" | "account";

export const PUBLIC_SUPPORT_CATEGORIES: ReadonlyArray<{
  readonly value: PublicSupportCategoryValue;
  readonly label: string;
  readonly description: string;
}> = [
  {
    value: "general",
    label: "Opće pitanje",
    description: "Informacije o platformi, računu ili usluzi.",
  },
  {
    value: "education_programme",
    label: "Edukacija / program",
    description: "Upis, napredak modula ili potvrda o završetku edukacije.",
  },
  {
    value: "cert_application",
    label: "Prijava za certifikaciju",
    description: "Status prijave, potrebni dokazi ili sljedeći koraci (ne odluka).",
  },
  {
    value: "cert_verification",
    label: "Verifikacija certifikata",
    description: "Javna provjera valjanosti ili pitanja o statusu dokumenta.",
  },
  {
    value: "tech_support",
    label: "Tehnička podrška",
    description: "Prijava, pristup sustavu ili tehnički problem.",
  },
];

export const PUBLIC_SUPPORT_DATA_MINIMIZATION_MESSAGE =
  "Tražimo samo podatke potrebne za odgovor. Ne šaljite osobne iskaznice, biometrijske podatke ni osjetljive kategorije podataka putem ovog obrasca.";

export const PUBLIC_SUPPORT_NO_CERT_APPROVAL_MESSAGE =
  "Podrška ne donosi odluke o certifikaciji, ne mijenja status prijave niti izdaje certifikate. Odluke donosi ovlašteno tijelo u zasebnom postupku.";

export const PUBLIC_SUPPORT_PRIVACY_MESSAGE =
  "Poruke se obrađuju radi odgovora i evidencije zahtjeva. Interni bilješki pregleda, odbora i revizije nisu javno dostupne.";

export const LEARNER_SUPPORT_CONTEXT_COPY: Record<
  LearnerSupportContext,
  { readonly title: string; readonly detail: string }
> = {
  education: {
    title: "Pomoć oko edukacije",
    detail: "Pitanja o modulima, napretku ili potvrdi o završetku edukacije (nije ISO/IEC 17024 certifikacija).",
  },
  certification: {
    title: "Pitanje o prijavi",
    detail: "Status prijave, dopuna dokaza ili sljedeći korak — bez pristupa internim bilješkama pregleda.",
  },
  verification: {
    title: "Verifikacija certifikata",
    detail: "Javna provjera dokumenta ili pitanja o statusu izdanog certifikata.",
  },
  account: {
    title: "Pristup računu",
    detail: "Prijava, sesija ili tehnički problem s pristupom platformi.",
  },
};

/** Field names that must never appear on public/learner support forms. */
export const SUPPORT_PROHIBITED_FIELD_NAMES = [
  "identityDocument",
  "idDocument",
  "passport",
  "nationalId",
  "selfie",
  "faceMatch",
  "biometric",
  "fingerprint",
  "reviewerNotes",
  "committeeDeliberation",
  "auditPayload",
  "dossier",
] as const;

export function publicCategoryToRequestType(category: string): ContactRequestType {
  return resolveContactRequestType(category);
}

export function isSupportProhibitedFieldName(name: string): boolean {
  const n = name.trim().toLowerCase();
  return SUPPORT_PROHIBITED_FIELD_NAMES.some((f) => n.includes(f.toLowerCase()));
}

export function learnerSupportHref(context: LearnerSupportContext): string {
  return `/dashboard/support?context=${context}`;
}

declare global {
  interface Window {
    __SUPPORT_CONTACT_E2E__?: boolean;
  }
}

/** Playwright-only: allow submit when API has VERIFY_CAPTCHA_SKIP. */
export function isSupportContactE2eBypass(): boolean {
  return typeof window !== "undefined" && window.__SUPPORT_CONTACT_E2E__ === true;
}
