import type { GovernanceCommitteeRow } from "@/lib/api-governance";

import { buildCommitteeInstanceNodes, buildFunctionalBackbone } from "./twin-committees";
import type { EscalationPath, OrganizationalTopologyNode, TopologyEdge, TwinNormalizedInput } from "./twin-types";

export function buildTopologyEdges(): TopologyEdge[] {
  return [
    { from: "quality_management", to: "certification_committee", kind: "owns", label: "Politika i ovlaštenja" },
    { from: "quality_management", to: "appeals_committee", kind: "owns", label: "Politika žalbi" },
    { from: "quality_management", to: "impartiality_committee", kind: "owns", label: "Impartiality okvir" },
    { from: "impartiality_committee", to: "certification_committee", kind: "supports", label: "COI / nepristranost" },
    { from: "impartiality_committee", to: "appeals_committee", kind: "supports", label: "Integritet žalbi" },
    { from: "certification_committee", to: "appeals_committee", kind: "escalates_to", label: "Osporavanje odluke" },
    { from: "auditors", to: "quality_management", kind: "audits", label: "Interni audit MS" },
    { from: "training_administration", to: "certification_committee", kind: "supports", label: "Kompetencija kandidata" },
    { from: "system_administration", to: "quality_management", kind: "depends_on", label: "Platform evidence" },
    { from: "system_administration", to: "training_administration", kind: "supports", label: "LMS operativa" },
  ];
}

export function buildEscalationPaths(): EscalationPath[] {
  return [
    {
      id: "cert-dispute",
      steps: ["certification_committee", "appeals_committee", "quality_management"],
      context: "Nepovoljna odluka → formalna žalba → governance review.",
    },
    {
      id: "impartiality-threat",
      steps: ["impartiality_committee", "quality_management", "certification_committee"],
      context: "Prijetnja nepristranosti mora biti razriješena prije odluke.",
    },
    {
      id: "capa-governance",
      steps: ["quality_management", "auditors", "certification_committee"],
      context: "CAPA i nalazi audita hrpe se kroz MS i odborske tokove.",
    },
  ];
}

export function buildOrganizationalTopology(
  committees: readonly GovernanceCommitteeRow[],
  maxSatelliteCommittees = 12,
): {
  readonly nodes: readonly OrganizationalTopologyNode[];
  readonly edges: readonly TopologyEdge[];
  readonly escalations: readonly EscalationPath[];
} {
  const backbone = buildFunctionalBackbone(committees);
  const satellites = buildCommitteeInstanceNodes(committees, backbone, 4);
  const limited = satellites.slice(0, maxSatelliteCommittees);
  return {
    nodes: [...backbone, ...limited],
    edges: buildTopologyEdges(),
    escalations: buildEscalationPaths(),
  };
}

/** Lagana procjena „povezanosti” digital twin-a za insight tekst. */
export function topologyStressHint(input: TwinNormalizedInput): string {
  if (input.committeeCount === 0) return "Topologija je apstraktna — directory odbora je prazan.";
  if (input.quorumPending + input.decisionsOpen > 24) return "Odborski čvorovi su pod pritiskom kvoruma i otvorenih odluka.";
  if (input.singleMemberCommittees > 0) return "Postoji koncentracija ovisnosti o jednom članu u nekim odborima.";
  return "Strukturni čvorovi su definirani; operativni pritisak je umjeren.";
}
