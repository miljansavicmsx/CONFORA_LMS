import type { GovernanceHealthResult, HealthBand, HealthFactor, IntelligenceInput } from "./intelligence-types";

function bandFromScore(score: number): HealthBand {
  if (score >= 88) return "excellent";
  if (score >= 72) return "healthy";
  if (score >= 48) return "warning";
  return "critical";
}

export function computeGovernanceHealth(input: IntelligenceInput): GovernanceHealthResult {
  const factors: HealthFactor[] = [];
  let penalty = 0;

  const push = (id: string, label: string, weight: number, value: number, detail: string) => {
    if (value <= 0) return;
    const p = Math.min(weight * value, weight * 12);
    penalty += p;
    factors.push({ id, label, penalty: p, detail: `${detail} (${value})` });
  };

  push("capa_overdue", "CAPA / NCR preko roka", 4, input.capaOverdue, "Prekoračeni rokovi ESU signal curenja operativa.");
  push(
    "risk_review",
    "Rizici — pregledi preko roka",
    3.5,
    input.riskOverdueReviews,
    "Pregledi rizika izvan kalendara smanjuju kontrolu.",
  );
  push(
    "high_critical_risk",
    "Otvoreni HIGH/CRITICAL rizici",
    2.5,
    input.riskOpenHighCritical,
    "Koncentrirani teški rizici podižu izloženost.",
  );
  push("complaints", "Otvorene pritužbe", 1.8, input.openComplaints, "Pritužbe su rani signal reputacijskog pritiska.");
  push("mr_actions", "MR akcije preko roka", 3.2, input.managementReviewOverdueActions, "Akcije pregleda rukovodstva blokiraju ciklus.");
  push(
    "mr_pending",
    "MR na čekanju odobrenja",
    2,
    input.managementReviewPendingApproval,
    "Gomilanje odobrenja usporava zatvaranje ciklusa.",
  );
  push("competence", "Valjanost kompetencija / istek", 2.2, input.competenceProfilesDueValidity, "Profili pred istekom stvaraju audit gap.");
  push("impartiality", "Impartiality prijetnje", 2.8, input.impartialityOpenThreats, "Otvorene prijetnje zahtijevaju brzu obradu.");
  push(
    "quorum",
    "Odbor — kvorum / odluke u čekanju",
    2.4,
    input.decisionsQuorumPending,
    "Kongestija odbora je bottleneck certifikacije.",
  );
  push("cb_finding", "CB audit nalazi (otvoreno)", 2, input.cbOpenFindings, "Interni nalazi bez closure-a povećavaju compliance rizik.");

  const congestion =
    input.applicationsPendingQueue + input.applicationsInReview * 0.65 + input.decisionsOpen * 0.45;
  push("cert_queue", "Certifikacijski red / odluke", 1.2, Math.floor(congestion), "Dug red prijava i odluka stvara zastoje.");

  const score = Math.max(0, Math.min(100, Math.round(100 - penalty)));
  const band = bandFromScore(score);

  const narrative =
    band === "excellent"
      ? "Operativni i governance signali su uravnoteženi; fokus na kontinuirano održavanje i praćenje trendova."
      : band === "healthy"
        ? "Postoje izolirani pritisak tačke — prioritetno riješiti prekoračene CAPA/MR stavke i odborske čekanja."
        : band === "warning"
          ? "Višestruki signali upozorenja: vratiti kapacitet na odbor, risk review i CAPA zatvaranje prije eskalacije."
          : "Kritična koncentracija rizika: hitno uskladiti CAPA, MR akcije, impartiality i certifikacijske čekanje.";

  return { band, score, factors: factors.sort((a, b) => b.penalty - a.penalty), narrative };
}
