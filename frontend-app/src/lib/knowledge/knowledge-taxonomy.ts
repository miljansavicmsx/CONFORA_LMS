import type { KnowledgeFacetId, KnowledgeStandardId } from "./knowledge-types";

/** Standard → default facet bias for explorer filters. */
export const STANDARD_TAXONOMY_HINTS: Record<KnowledgeStandardId, readonly KnowledgeFacetId[]> = {
  ISO17024: [
    "impartiality",
    "competence",
    "examination",
    "certification_decision",
    "surveillance",
    "recertification",
    "appeals",
    "complaints",
    "management_system",
  ],
  ISO17065: ["management_system", "impartiality", "certification_decision", "complaints", "general"],
  ISO9001: ["management_system", "complaints", "general"],
  ISO27001: ["information_security", "management_system", "general"],
  ISO56001: ["innovation_governance", "management_system"],
  INTERNAL_GRC: ["management_system", "general"],
};

// Fix ISO27001 - remove invalid cast - use valid facets only
// I'll fix in next patch - audit_guidance is not KnowledgeFacetId
