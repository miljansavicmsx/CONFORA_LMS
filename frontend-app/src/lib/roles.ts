/**
 * Kanonski katalog primarnih uloga (usklađeno s backend `core/roles.py`).
 */

export const ROLE_BILLING_ADMIN = "billing_admin" as const;
export const ROLE_CERT_COMMITTEE = "cert_committee" as const;
export const ROLE_SYS_ADMIN = "sys_admin" as const;
export const ROLE_QUALITY_MANAGER = "quality_manager" as const;

export const ROLE_PRIMARY_ALIASES: Readonly<Record<string, string>> = {
  certification_committee: ROLE_CERT_COMMITTEE,
};

const DEPRECATED_LEGACY_PRIMARY_ROLES = new Set(["support", "committee", "sme", "reviewer"]);

const CANONICAL_KNOWN_PRIMARY_ROLES = new Set<string>([
  "learner",
  "candidate",
  "admin",
  ROLE_QUALITY_MANAGER,
  "instructor",
  "author",
  "content_admin",
  "training_admin",
  "tech_committee",
  ROLE_CERT_COMMITTEE,
  ROLE_SYS_ADMIN,
  "director",
  "impartiality_committee",
  "appeals_committee",
  "auditor",
  ROLE_BILLING_ADMIN,
]);

/** Iste vrijednosti kao backend `_FINANCE_INTERNAL_ROLES` (čitanje financija). */
export const FINANCE_INTERNAL_ROLES = new Set<string>([
  "sys_admin",
  "admin",
  "training_admin",
  ROLE_BILLING_ADMIN,
  "director",
]);

export function normalizePrimaryRoleForRbac(rawRole: string | null | undefined): string {
  const r = String(rawRole ?? "")
    .trim()
    .toLowerCase();
  if (!r) {
    return "learner";
  }
  if (DEPRECATED_LEGACY_PRIMARY_ROLES.has(r)) {
    return "unknown";
  }
  const mapped = ROLE_PRIMARY_ALIASES[r] ?? r;
  if (!CANONICAL_KNOWN_PRIMARY_ROLES.has(mapped)) {
    return "unknown";
  }
  return mapped;
}

/** Iste vrijednosti kao backend `CONFORA_TO_ISO_ROLE_MAP` (read-only paralela). */
export const CONFORA_TO_ISO_ROLE_MAP: Readonly<Record<string, string | null>> = {
  admin: "certification_manager",
  [ROLE_QUALITY_MANAGER]: "quality_manager",
  training_admin: "exam_admin",
  instructor: "assessor",
  author: "assessor",
  content_admin: "exam_admin",
  tech_committee: "assessor",
  [ROLE_CERT_COMMITTEE]: "certification_committee",
  appeals_committee: "appeals_committee",
  impartiality_committee: "impartiality_committee",
  auditor: "internal_auditor",
  [ROLE_BILLING_ADMIN]: "finance_officer",
  director: "top_management",
  [ROLE_SYS_ADMIN]: "system_administrator",
  learner: null,
  candidate: null,
};

/** Ljudski nazivi ISO slugova (usklađeno s backend `ISO_ROLE_LABELS`). */
export const ISO_ROLE_LABELS: Readonly<Record<string, string>> = {
  unknown: "Nepoznato",
  certification_manager: "Voditelj certifikacije",
  certification_officer: "Službenik certifikacije",
  assessor: "Ocjenjivač",
  certification_committee: "Certifikacijski odbor",
  appeals_committee: "Žalbena komisija",
  internal_auditor: "Interni auditor",
  quality_manager: "Menadžer kvalitete",
  finance_officer: "Financije",
  system_administrator: "Sistemski administrator",
  top_management: "Vrhunsko rukovodstvo",
  exam_admin: "Administrator ispita",
  certificate_issuer: "Izdavatelj certifikata",
  complaints_officer: "Službenik za pritužbe",
  impartiality_committee: "Odbor za nepristranost",
};

/** Mapiranje CONFORA primarne uloge → ISO slug (null ako nema formalne ISO mape). */
export function mapToIsoRole(role?: string | null): string | null {
  const key = normalizePrimaryRoleForRbac(role);
  if (!Object.prototype.hasOwnProperty.call(CONFORA_TO_ISO_ROLE_MAP, key)) {
    return null;
  }
  const v = CONFORA_TO_ISO_ROLE_MAP[key];
  return v ?? null;
}

/** Oznaka za prikaz iz CONFORA uloge (bez API poziva). */
export function isoRoleLabelForConforaPrimary(role?: string | null): string {
  const iso = mapToIsoRole(role);
  if (!iso) {
    return "Nepoznato";
  }
  const lbl = ISO_ROLE_LABELS[iso];
  return typeof lbl === "string" ? lbl : iso.replaceAll("_", " ");
}
