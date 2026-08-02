/** Human-readable public verification status labels (read-only registry view). */

export type PublicVerificationStatusKey =
  | "ACTIVE"
  | "ISSUED"
  | "VALID"
  | "SUSPENDED"
  | "REVOKED"
  | "EXPIRED"
  | "REPLACED"
  | "WITHDRAWN"
  | "UNKNOWN";

export type PublicVerificationStatusPresentation = {
  readonly key: PublicVerificationStatusKey;
  readonly label: string;
  readonly description: string;
  readonly tone: "success" | "warning" | "danger" | "neutral";
};

const STATUS_MAP: Record<PublicVerificationStatusKey, Omit<PublicVerificationStatusPresentation, "key">> = {
  ACTIVE: {
    label: "Aktivan",
    description: "Certifikat je aktivan u registru u trenutku provjere.",
    tone: "success",
  },
  ISSUED: {
    label: "Izdano",
    description:
      "Certifikat je izdan u registru. Izdavanje (ISSUED) nije isto što i aktivacija (ACTIVE) — provjerite status u registru.",
    tone: "neutral",
  },
  VALID: {
    label: "Važeći",
    description: "Zapis je pronađen i važeći u registru u trenutku provjere.",
    tone: "success",
  },
  SUSPENDED: {
    label: "Suspendiran",
    description: "Certifikat je privremeno suspendiran u registru.",
    tone: "warning",
  },
  REVOKED: {
    label: "Opozvan",
    description: "Certifikat je opozvan u registru.",
    tone: "danger",
  },
  EXPIRED: {
    label: "Istekao",
    description: "Certifikat je istekao prema datumu u registru.",
    tone: "danger",
  },
  REPLACED: {
    label: "Zamijenjen",
    description: "Certifikat je zamijenjen novim zapisom u registru.",
    tone: "neutral",
  },
  WITHDRAWN: {
    label: "Povučen",
    description: "Certifikat je povučen iz registra.",
    tone: "danger",
  },
  UNKNOWN: {
    label: "Nepoznat status",
    description: "Status nije prepoznat — kontaktirajte organizatora za službenu potvrdu.",
    tone: "neutral",
  },
};

export function normalizePublicVerificationStatus(raw: string | null | undefined): PublicVerificationStatusKey {
  const u = String(raw ?? "")
    .trim()
    .toUpperCase();
  if (u === "ACTIVE" || u === "AKTIVAN") return "ACTIVE";
  if (u === "ISSUED" || u === "IZDANO") return "ISSUED";
  if (u === "VALID" || u === "VALIDAN") return "VALID";
  if (u === "SUSPENDED" || u === "SUSPENDIRAN") return "SUSPENDED";
  if (u === "REVOKED" || u === "OPOZVAN") return "REVOKED";
  if (u === "EXPIRED" || u === "ISTEKAO") return "EXPIRED";
  if (u === "REPLACED" || u === "ZAMIJENJEN") return "REPLACED";
  if (u === "WITHDRAWN" || u === "POVUČEN" || u === "POVUCEN") return "WITHDRAWN";
  return "UNKNOWN";
}

export function presentPublicVerificationStatus(
  raw: string | null | undefined,
): PublicVerificationStatusPresentation {
  const key = normalizePublicVerificationStatus(raw);
  return { key, ...STATUS_MAP[key] };
}

/** Fields that must never appear on public verification UI. */
export const PUBLIC_VERIFICATION_PRIVATE_FIELD_KEYS = [
  "reviewerNotes",
  "committeeDeliberation",
  "identityDocument",
  "auditPayload",
  "dossier",
  "biometric",
  "internalAudit",
] as const;

export function filterPublicVerificationPayload<T extends Record<string, unknown>>(payload: T): Partial<T> {
  const safe: Partial<T> = {};
  for (const [k, v] of Object.entries(payload)) {
    const lower = k.toLowerCase();
    if (PUBLIC_VERIFICATION_PRIVATE_FIELD_KEYS.some((p) => lower.includes(p.toLowerCase()))) {
      continue;
    }
    safe[k as keyof T] = v as T[keyof T];
  }
  return safe;
}
