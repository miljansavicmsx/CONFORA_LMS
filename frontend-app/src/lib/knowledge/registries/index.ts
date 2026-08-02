import { GOVERNANCE_REGISTRY_CLAUSES } from "./governance-registry";
import { ISO17024_CLAUSES } from "./iso17024-registry";
import { ISO17065_CLAUSES } from "./iso17065-registry";
import { ISO9001_CLAUSES } from "./iso9001-registry";
import { ISO27001_CLAUSES } from "./iso27001-registry";
import { ISO56001_CLAUSES } from "./iso56001-registry";

import type { KnowledgeRegistryClause, KnowledgeStandardId } from "../knowledge-types";

export function listAllRegistryClauses(): readonly KnowledgeRegistryClause[] {
  return [
    ...ISO17024_CLAUSES,
    ...ISO17065_CLAUSES,
    ...ISO9001_CLAUSES,
    ...ISO27001_CLAUSES,
    ...ISO56001_CLAUSES,
    ...GOVERNANCE_REGISTRY_CLAUSES,
  ];
}

export function clausesByStandard(standardId: KnowledgeStandardId): readonly KnowledgeRegistryClause[] {
  return listAllRegistryClauses().filter((c) => c.standardId === standardId);
}

export function clauseById(id: string): KnowledgeRegistryClause | undefined {
  return listAllRegistryClauses().find((c) => c.id === id);
}

export {
  ISO17024_CLAUSES,
  ISO17065_CLAUSES,
  ISO9001_CLAUSES,
  ISO27001_CLAUSES,
  ISO56001_CLAUSES,
  GOVERNANCE_REGISTRY_CLAUSES,
};
