import type { GovernanceCommitteeRow } from "@/lib/api-governance";

import type { OrganizationalTopologyNode, TwinFunctionalRoleId } from "./twin-types";

const U = (s: string) => s.toUpperCase();

/** Grupa iz API tipa (heuristika po nazivu/tipu). */
export function classifyCommitteeFamily(
  row: Pick<GovernanceCommitteeRow, "committeeType" | "name">,
): TwinFunctionalRoleId {
  const t = U(row.committeeType);
  const n = U(row.name);
  if (t.includes("APPEAL") || n.includes("ŽALB") || n.includes("APPEAL")) return "appeals_committee";
  if (t.includes("IMPARTIAL") || n.includes("NEPRISTRAN") || n.includes("IMPARTIAL")) return "impartiality_committee";
  if (t.includes("CERTIF") || n.includes("CERTIF") || t.includes("DECISION")) return "certification_committee";
  return "certification_committee";
}

export function countCommitteesByFamily(
  committees: readonly GovernanceCommitteeRow[],
): Readonly<Record<TwinFunctionalRoleId, number>> {
  const out: Record<TwinFunctionalRoleId, number> = {
    certification_committee: 0,
    appeals_committee: 0,
    impartiality_committee: 0,
    quality_management: 0,
    auditors: 0,
    training_administration: 0,
    system_administration: 0,
  };
  for (const c of committees) {
    const fam = classifyCommitteeFamily(c);
    out[fam] += 1;
  }
  return out;
}

export function committeeDependencySummary(committees: readonly GovernanceCommitteeRow[]): string {
  const counts = countCommitteesByFamily(committees);
  const parts = Object.entries(counts)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`);
  return parts.length ? parts.join("; ") : "Nema registriranih odbora u directory API-ju.";
}

/** Pozicija satelita oko roditelja (lagani radial layout). */
export function satellitePosition(
  parent: OrganizationalTopologyNode,
  index: number,
  total: number,
): { xPct: number; yPct: number } {
  if (total <= 0) return parent.position;
  const angle = (index / Math.max(total, 1)) * Math.PI * 2;
  const dx = Math.cos(angle) * 8;
  const dy = Math.sin(angle) * 6;
  return {
    xPct: Math.min(92, Math.max(8, parent.position.xPct + dx)),
    yPct: Math.min(90, Math.max(8, parent.position.yPct + dy)),
  };
}

function functionalNode(
  id: TwinFunctionalRoleId,
  label: string,
  description: string,
  ownershipHint: string,
  xPct: number,
  yPct: number,
): OrganizationalTopologyNode {
  return {
    id,
    label,
    role: id,
    description,
    ownershipHint,
    workloadHint: "",
    position: { xPct, yPct },
  };
}

/** Statički backbone institucionalnog digital twin-a. */
export function buildFunctionalBackbone(committees: readonly GovernanceCommitteeRow[]): OrganizationalTopologyNode[] {
  const counts = countCommitteesByFamily(committees);
  const hint = (id: TwinFunctionalRoleId) => {
    if (id === "certification_committee" || id === "appeals_committee" || id === "impartiality_committee") {
      return counts[id] > 0
        ? `Registrirano odbora (familija): ${counts[id]}.`
        : "Nema odbora ove familije u directory API — čvor je apstraktan do registracije.";
    }
    return "Operativni presjek dolazi iz agregata dashboard konteksta.";
  };

  const base: OrganizationalTopologyNode[] = [
    functionalNode(
      "quality_management",
      "Upravljanje kvalitetom (QM)",
      "MS, politike, CAPA, MR, rizici — integracijski čvor ISO/IEC 17024.",
      "Izvoditelj: voditelj kvaliteta / compliance officer.",
      50,
      10,
    ),
    functionalNode(
      "certification_committee",
      "Odbor za certifikaciju",
      "Odluke o osobi, kvorum, COI — primarni operativni bottleneck certifikacije.",
      "Izvoditelj: predsjednik odbora.",
      16,
      38,
    ),
    functionalNode(
      "appeals_committee",
      "Odbor za žalbe",
      "Prigovori na odluke — eskalacijski put integriteta programa.",
      "Izvoditelj: neovisna žalbena instanca.",
      84,
      38,
    ),
    functionalNode(
      "impartiality_committee",
      "Nepristranost / sukob interesa",
      "Vrednovanje prijetnji i COI mehanizama prije odluka.",
      "Izvoditelj: impartiality officer.",
      50,
      36,
    ),
    functionalNode(
      "auditors",
      "Interni audit",
      "Planovi audita, nalazi, praćenje KG sustava.",
      "Izvoditelj: glavni interni auditor.",
      16,
      62,
    ),
    functionalNode(
      "training_administration",
      "Administracija osposobljavanja",
      "Katalog, ispiti, podrška kandidatima — most prema certifikaciji.",
      "Izvoditelj: training manager.",
      50,
      68,
    ),
    functionalNode(
      "system_administration",
      "Sistemska administracija",
      "Platforma, audit logovi, integracije, sigurnost.",
      "Izvoditelj: sys_admin / IT governance.",
      84,
      66,
    ),
  ];

  return base.map((n) => ({
    ...n,
    workloadHint: hint(n.role as TwinFunctionalRoleId),
  }));
}

/** Do N satelitskih čvorova iz registra odbora (performantno). */
export function buildCommitteeInstanceNodes(
  committees: readonly GovernanceCommitteeRow[],
  backbone: readonly OrganizationalTopologyNode[],
  capPerFamily = 4,
): OrganizationalTopologyNode[] {
  const byFamily = new Map<TwinFunctionalRoleId, GovernanceCommitteeRow[]>();
  for (const c of committees) {
    const fam = classifyCommitteeFamily(c);
    const list = byFamily.get(fam) ?? [];
    list.push(c);
    byFamily.set(fam, list);
  }

  const posMap = new Map(backbone.map((n) => [n.id, n]));
  const nodes: OrganizationalTopologyNode[] = [];

  for (const [, group] of byFamily) {
    const parentId = classifyCommitteeFamily(group[0]!);
    const parent = posMap.get(parentId);
    if (!parent) continue;
    const slice = group.slice(0, capPerFamily);
    slice.forEach((row, i) => {
      const pos = satellitePosition(parent, i, slice.length);
      nodes.push({
        id: `committee:${row.committeeId}`,
        label: row.name,
        role: "committee_instance",
        description: `Tip: ${row.committeeType}. Članovi: ${row.members.length}.`,
        ownershipHint: "Mandat iz politike certifikacionog tijela.",
        workloadHint: parent.workloadHint,
        position: pos,
        committeeId: row.committeeId,
        memberCount: row.members.length,
      });
    });
  }
  return nodes;
}
