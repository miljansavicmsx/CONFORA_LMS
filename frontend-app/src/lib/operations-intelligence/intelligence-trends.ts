import type { IntelligenceInput, TrendSeries } from "./intelligence-types";

function series(id: string, label: string, current: number, bias: "up" | "down" | "flat"): TrendSeries {
  const days = ["T-5", "T-4", "T-3", "T-2", "T-1", "T-0"];
  const mult =
    bias === "up" ? [0.72, 0.78, 0.84, 0.9, 0.95, 1] : bias === "down" ? [1.1, 1.06, 1.02, 0.99, 0.98, 1] : [1, 1, 1, 1, 1, 1];
  const points = days.map((t, i) => ({
    t,
    v: Math.max(0, Math.round(current * mult[i]!)),
  }));
  return { id, label, points };
}

/**
 * Trendovi su inferencijski iz trenutnog snimka (nema vremenske serije sa backenda).
 * Koriste se za observability UX — ne predstavljaju historijske podatke.
 */
export function inferTrendsFromSnapshot(input: IntelligenceInput): TrendSeries[] {
  const capaBias =
    input.capaOverdue > input.capaOpen * 0.25 ? ("up" as const) : input.capaOverdue === 0 ? ("down" as const) : ("flat" as const);
  const complaintBias = input.openComplaints > 8 ? ("up" as const) : ("flat" as const);
  const riskBias = input.riskOverdueReviews > 3 ? ("up" as const) : ("flat" as const);
  const auditBias = input.auditEventsRecent > 120 ? ("up" as const) : ("flat" as const);

  return [
    series("cert_pressure", "Certifikacijski pritisak (red + odluke)", input.applicationsPendingQueue + input.decisionsOpen, "up"),
    series("capa_backlog", "CAPA / NCR pritisak", input.capaOpen + input.capaOverdue, capaBias),
    series("complaints", "Otvorene pritužbe", input.openComplaints, complaintBias),
    series("risk_governance", "Rizik governance (otvoreno HIGH/CRIT + pregledi)", input.riskOpenHighCritical + input.riskOverdueReviews, riskBias),
    series("audit_velocity", "Audit događaji (uzorak)", input.auditEventsRecent, auditBias),
    series("mr_cycle", "MR otvoreni ciklusi + prekoračenja", input.managementReviewOpenCycles + input.managementReviewOverdueActions, input.managementReviewOverdueActions > 4 ? "up" : "flat"),
  ];
}

export function textualTrendSummary(seriesList: readonly TrendSeries[]): string {
  return seriesList
    .map((s) => {
      const last = s.points[s.points.length - 1]?.v ?? 0;
      const first = s.points[0]?.v ?? 0;
      const dir = last > first ? "rast" : last < first ? "pad" : "stabilno";
      return `${s.label}: ${dir} (${first} → ${last}).`;
    })
    .join(" ");
}
