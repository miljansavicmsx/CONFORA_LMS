import type { IntelligenceInput, OperationalRiskProfile } from "./intelligence-types";

export function computeOperationalRiskProfile(input: IntelligenceInput): OperationalRiskProfile {
  const drivers: string[] = [];
  let score = 88;

  if (input.capaOverdue > 0) {
    drivers.push("Prekoračeni CAPA/NCR rokovi povećavaju audit gap.");
    score -= Math.min(22, 2.5 * input.capaOverdue);
  }
  if (input.openComplaints > 6) {
    drivers.push("Pritužbe iznad praga stvaraju reputacijski i regulatorni pritisak.");
    score -= Math.min(12, input.openComplaints);
  }
  if (input.riskOpenHighCritical > 0) {
    drivers.push("Otvoreni visoki rizici bez zatvaranja.");
    score -= Math.min(15, 3 * input.riskOpenHighCritical);
  }
  if (input.decisionsQuorumPending + input.applicationsPendingQueue > 20) {
    drivers.push("Kongestija odbora — bottleneck na certifikacijskom toku.");
    score -= 10;
  }
  if (input.cbOpenFindings > 2) {
    drivers.push("Interni audit nalazi bez closure evidentiranog u CB zapisima.");
    score -= 8;
  }

  score = Math.max(10, Math.min(98, Math.round(score)));
  const label =
    score >= 78 ? "Umeren rizik — fokus na backlog" : score >= 55 ? "Povišen rizik — potrebna intervencija" : "Visok rizik — eskalacija";

  return { complianceScore: score, label, drivers };
}
