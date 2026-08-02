/** Enterprise progressive disclosure ladder (UX contract, not workflow). */

export type DisclosureLevel =
  | "SUMMARY"
  | "INSIGHT"
  | "DETAIL"
  | "TRACEABILITY"
  | "EVIDENCE"
  | "AUDIT_LINEAGE";

export const DISCLOSURE_LADDER: readonly DisclosureLevel[] = [
  "SUMMARY",
  "INSIGHT",
  "DETAIL",
  "TRACEABILITY",
  "EVIDENCE",
  "AUDIT_LINEAGE",
];

export function disclosureStepIndex(level: DisclosureLevel): number {
  return DISCLOSURE_LADDER.indexOf(level);
}

export function nextDisclosureLevel(level: DisclosureLevel): DisclosureLevel | null {
  const i = disclosureStepIndex(level);
  return i >= 0 && i < DISCLOSURE_LADDER.length - 1 ? DISCLOSURE_LADDER[i + 1]! : null;
}

export const disclosureLevelLabelHr: Record<DisclosureLevel, string> = {
  SUMMARY: "Sažetak",
  INSIGHT: "Uvid",
  DETAIL: "Detalj",
  TRACEABILITY: "Tragivost",
  EVIDENCE: "Dokaz",
  AUDIT_LINEAGE: "Audit genealogija",
};
