/**
 * Enterprise relationship orchestration — canonical edge vocabulary (frontend-only).
 */

export const RELATIONSHIP_TYPES = [
  "CREATED_FROM",
  "APPROVED_BY",
  "RESULTED_IN",
  "TRIGGERED",
  "MITIGATES",
  "BLOCKED_BY",
  "REVIEWED_IN",
  "GENERATED",
  "RELATED_TO",
  "PART_OF",
  "SUPERSEDES",
  "RENEWS",
  "EVIDENCE_FOR",
  "LINKED_TO",
  "ESCALATED_TO",
] as const;

export type RelationshipType = (typeof RELATIONSHIP_TYPES)[number];

export type EntityRelationship = {
  sourceId: string;
  sourceType: string;
  targetId: string;
  targetType: string;
  relationshipType: RelationshipType;
  label?: string;
  severity?: string;
  workflowState?: string;
  metadata?: Record<string, unknown>;
};

/** Stable vocabulary for `sourceType` / `targetType` (aligns with ABAC resource hints where possible). */
export const EntityKind = {
  CERTIFICATE: "CERTIFICATE",
  APPLICATION: "APPLICATION",
  SCHEME: "SCHEME",
  DECISION: "DECISION",
  CAPA: "CAPA",
  NONCONFORMITY: "NONCONFORMITY",
  RISK: "RISK",
  COMPLAINT: "COMPLAINT",
  APPEAL: "APPEAL",
  MANAGEMENT_REVIEW: "MANAGEMENT_REVIEW",
  MANAGEMENT_ACTION: "MANAGEMENT_ACTION",
  REVIEW_INPUT: "REVIEW_INPUT",
  AUDIT_EVENT: "AUDIT_EVENT",
  COURSE: "COURSE",
  EXAM: "EXAM",
  IMPARTIALITY: "IMPARTIALITY",
  VERIFICATION_HASH: "VERIFICATION_HASH",
  PROCESS: "PROCESS",
  WORKFLOW_STATE: "WORKFLOW_STATE",
} as const;
