export enum EntityKind {
  PROCESS = "PROCESS",
  CREDENTIAL = "CREDENTIAL",
  RECORD = "RECORD",
}

export type EntityRelationshipEdge = {
  readonly sourceId: string;
  readonly sourceLabel: string;
  readonly sourceType: EntityKind;
  readonly targetId: string;
  readonly targetLabel: string;
  readonly targetType: EntityKind;
  readonly relationshipLabel: string;
};

/**
 * Static explanatory relationships only. They are not certificate records and
 * do not make a validity assertion or issue, alter, or expose credentials.
 */
export function buildTrustNavigationExplainerEdges(): readonly EntityRelationshipEdge[] {
  return [
    {
      sourceId: "exam-pass",
      sourceLabel: "EXAM_PASS",
      sourceType: EntityKind.RECORD,
      targetId: "person-certification",
      targetLabel: "PERSON_CERTIFICATION",
      targetType: EntityKind.CREDENTIAL,
      relationshipLabel: "may support",
    },
    {
      sourceId: "person-certification",
      sourceLabel: "PERSON_CERTIFICATION",
      sourceType: EntityKind.CREDENTIAL,
      targetId: "public-verification",
      targetLabel: "public verification hash",
      targetType: EntityKind.PROCESS,
      relationshipLabel: "can be checked with",
    },
  ];
}
