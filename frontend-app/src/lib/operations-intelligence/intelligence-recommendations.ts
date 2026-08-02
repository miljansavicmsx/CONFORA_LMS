import type { ExecutiveAlert, GovernanceHealthResult, IntelligenceRecommendation } from "./intelligence-types";

export function buildIntelligenceRecommendations(
  health: GovernanceHealthResult,
  alerts: readonly ExecutiveAlert[],
): IntelligenceRecommendation[] {
  const recs: IntelligenceRecommendation[] = [];

  const push = (
    id: string,
    title: string,
    rationale: string,
    confidence: number,
    actionRoute?: string,
  ) => {
    recs.push({ id, title, rationale, confidence, ...(actionRoute ? { actionRoute } : {}) });
  };

  if (health.band === "critical" || health.band === "warning") {
    push(
      "r1",
      "Prioritet: zatvoriti prekoračene CAPA / NCR",
      "Najveći utjecaj na health score dolazi iz operativnog duga korekcija.",
      0.78,
      "/dashboard/iso/capa",
    );
  }

  if (alerts.some((a) => a.id === "committee-congestion")) {
    push(
      "r2",
      "Rasporediti odborsko opterećenje ili dodati termin",
      "Kongestija kvoruma direktno usporava izdavanje certifikata.",
      0.71,
      "/dashboard/iso/decisions",
    );
  }

  if (alerts.some((a) => a.id === "risk-review-debt")) {
    push(
      "r3",
      "Blokirati vrijeme za pregled rizika",
      "Smanjenje risk review duga obnavlja dokaz o kontrolama.",
      0.74,
      "/dashboard/iso/risks",
    );
  }

  if (alerts.some((a) => a.id === "complaint-spike")) {
    push(
      "r4",
      "Istraga klastera pritužbi",
      "Spike pattern traži kategorizaciju uzroka prije SLA probijanja.",
      0.66,
      "/dashboard/iso/complaints",
    );
  }

  if (health.factors.some((f) => f.id === "mr_pending")) {
    push(
      "r5",
      "Eskaliraj MR odobrenja",
      "Čekanja na odobrenje MR akcija blokiraju kontinuirani improvement ciklus.",
      0.7,
      "/dashboard/iso/management-review",
    );
  }

  if (health.band === "excellent") {
    push(
      "r0",
      "Održavati Governance radni ritam",
      "Signal je stabilan — fokus na praćenje micro-trendova i mentorstvo odbora.",
      0.55,
      "/dashboard/iso/reports",
    );
  }

  return recs.slice(0, 8);
}
