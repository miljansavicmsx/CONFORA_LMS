import type { EntityRelationship, RelationshipType } from "./relationship-types";

export type RelationshipBadgeTone = "governance" | "risk" | "trust" | "neutral" | "audit";

export type RelationshipBadgePreset = {
  readonly label: string;
  readonly tone: RelationshipBadgeTone;
};

const TYPE_PRESETS: Partial<Record<RelationshipType, RelationshipBadgePreset>> = {
  TRIGGERED: { label: "Uzrok / okidač", tone: "governance" },
  MITIGATES: { label: "Mitigacija", tone: "risk" },
  EVIDENCE_FOR: { label: "Revizijski dokaz", tone: "audit" },
  SUPERSEDES: { label: "Supersedira", tone: "trust" },
  RENEWS: { label: "Obnavlja", tone: "trust" },
  PART_OF: { label: "Dio procesa", tone: "governance" },
  REVIEWED_IN: { label: "Pregledano u", tone: "governance" },
  RESULTED_IN: { label: "Rezultiralo", tone: "governance" },
  APPROVED_BY: { label: "Odobrio", tone: "trust" },
  CREATED_FROM: { label: "Nastalo iz", tone: "neutral" },
  GENERATED: { label: "Generirano", tone: "neutral" },
  LINKED_TO: { label: "Povezano", tone: "neutral" },
  RELATED_TO: { label: "Srodno", tone: "neutral" },
  BLOCKED_BY: { label: "Blokirano", tone: "risk" },
  ESCALATED_TO: { label: "Eskalirano", tone: "risk" },
};

export function presetForRelationship(rel: Pick<EntityRelationship, "relationshipType">): RelationshipBadgePreset {
  return TYPE_PRESETS[rel.relationshipType] ?? {
    label: rel.relationshipType.replaceAll("_", " ").toLowerCase(),
    tone: "neutral",
  };
}

export const MARKETING_BADGE_LABELS = {
  linkedCapa: "Povezan CAPA",
  auditEvidence: "Audit trag",
  relatedComplaint: "Povezana pritužba",
  governanceImpact: "Governance utjecaj",
  recertified: "Recertificirano",
  superseded: "Supersedirano",
} as const;
