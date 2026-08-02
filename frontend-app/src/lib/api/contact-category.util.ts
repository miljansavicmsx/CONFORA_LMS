/** Mirrors backend `contact-requests.legacy-category.util.ts` — contact intake only, no B14/B15 cases. */

export const LEGACY_CONTACT_CATEGORIES = [
  "tech_support",
  "appeal",
  "complaint",
  "improvement",
  "new_training",
  "general",
] as const;

export type LegacyContactCategory = (typeof LEGACY_CONTACT_CATEGORIES)[number];

export const CONTACT_REQUEST_TYPES = [
  "GENERAL_INQUIRY",
  "APPLICATION_SUPPORT",
  "EXAM_SUPPORT",
  "CERTIFICATE_VERIFICATION_SUPPORT",
  "RECERTIFICATION_SUPPORT",
  "TECHNICAL_SUPPORT",
  "BILLING_OR_ADMINISTRATIVE",
  "DOCUMENT_REQUEST",
  "DATA_CORRECTION_REQUEST",
  "ROUTE_TO_COMPLAINT_REVIEW",
  "ROUTE_TO_APPEAL_REVIEW",
  "OTHER",
] as const;

export type ContactRequestType = (typeof CONTACT_REQUEST_TYPES)[number];

export function isLegacyContactCategory(v: string): v is LegacyContactCategory {
  return (LEGACY_CONTACT_CATEGORIES as readonly string[]).includes(v);
}

export function legacyCategoryToRequestType(category: LegacyContactCategory): ContactRequestType {
  switch (category) {
    case "tech_support":
      return "TECHNICAL_SUPPORT";
    case "appeal":
      return "ROUTE_TO_APPEAL_REVIEW";
    case "complaint":
      return "ROUTE_TO_COMPLAINT_REVIEW";
    case "improvement":
      return "OTHER";
    case "new_training":
    case "general":
      return "GENERAL_INQUIRY";
  }
}

export function resolveContactRequestType(category: string): ContactRequestType {
  if (isLegacyContactCategory(category)) {
    return legacyCategoryToRequestType(category);
  }
  return "GENERAL_INQUIRY";
}

/** Append optional form fields into messageSummary (canonical API has no separate phone/decision fields). */
export function buildContactMessageSummary(input: {
  readonly body: string;
  readonly phone?: string;
  readonly decisionType?: string;
  readonly decisionRef?: string;
}): string {
  const base = input.body.trim();
  const extras: string[] = [];
  const phone = input.phone?.trim();
  if (phone) {
    extras.push(`Phone: ${phone}`);
  }
  const decisionType = input.decisionType?.trim();
  const decisionRef = input.decisionRef?.trim();
  if (decisionType || decisionRef) {
    extras.push(`Decision type: ${decisionType || "—"}`);
    extras.push(`Decision reference: ${decisionRef || "—"}`);
  }
  if (extras.length === 0) {
    return base.slice(0, 8000);
  }
  const combined = `${base}\n\n---\n${extras.join("\n")}`;
  return combined.slice(0, 8000);
}
