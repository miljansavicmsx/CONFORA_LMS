import type { ResilienceSeverity, ResilienceSignal, TwinNormalizedInput } from "./twin-types";

function maxSev(a: ResilienceSeverity, b: ResilienceSeverity): ResilienceSeverity {
  const rank: ResilienceSeverity[] = ["info", "warning", "critical"];
  return rank[Math.max(rank.indexOf(a), rank.indexOf(b))]!;
}

export function detectResilienceSignals(
  input: TwinNormalizedInput,
  committeeOverloadThreshold = 22,
): { readonly signals: ResilienceSignal[]; readonly aggregateSeverity: ResilienceSeverity } {
  const signals: ResilienceSignal[] = [];

  const committeeLoad = input.certQueue + input.quorumPending * 2;
  if (committeeLoad >= committeeOverloadThreshold) {
    signals.push({
      id: "committee-overload",
      title: "Odborsko opterećenje",
      detail:
        "Kombinacija reda odluka i kvorum pending-a ukazuje na bottleneck koji usporava izdavanje certifikata.",
      severity: committeeLoad >= 36 ? "critical" : "warning",
    });
  }

  if (input.singleMemberCommittees > 0) {
    signals.push({
      id: "single-reviewer-dep",
      title: "Ovisnost o jednom članu u odboru",
      detail: `${input.singleMemberCommittees} odbor(a) s ≤1 članom — rizik jedinstvene točke odluke.`,
      severity: input.singleMemberCommittees >= 2 ? "warning" : "info",
    });
  }

  if (input.competenceDue >= 18) {
    signals.push({
      id: "competence-concentration",
      title: "Koncentracija isteka kompetencija",
      detail: "Veći klaster isteka kompetencija stvara audit i operativni rizik.",
      severity: "warning",
    });
  }

  if (input.managementReviewOverdueActions >= 8 || input.riskOverdueReviews >= 8) {
    signals.push({
      id: "governance-bottleneck",
      title: "Governance bottleneck (MR / rizici)",
      detail: "Prekoračeni MR ili risk pregledi blokiraju kontinuirano poboljšanje.",
      severity: "critical",
    });
  }

  if (input.capaOverdue >= 6 && input.openAuditFindings >= 4) {
    signals.push({
      id: "overdue-cluster",
      title: "Klaster prekoračenja (CAPA + nalazi)",
      detail: "Istovremen pritisak na korekcije i nalaze smanjuje dokaz o učinkovitosti.",
      severity: "critical",
    });
  }

  if (input.openAuditFindings >= 6 || (input.internalAuditRecords < 2 && input.openGovernanceCases > 6)) {
    signals.push({
      id: "audit-evidence-gap",
      title: "Rupe u audit / evidence lanu",
      detail: "Otvoreni nalazi ili slab interni uzorak audita relativno na governance backlog.",
      severity: "warning",
    });
  }

  const escalationProxy = input.openAppeals * 3 + input.openComplaints + input.managementReviewPendingApproval * 2;
  if (escalationProxy >= 28) {
    signals.push({
      id: "escalation-saturation",
      title: "Zasićenje eskalacijskih tokova",
      detail: "Žalbe, pritužbe i čekajuća odobrenja stvaraju paralelne eskalacijske pritiske.",
      severity: "warning",
    });
  }

  let aggregateSeverity: ResilienceSeverity = "info";
  for (const s of signals) aggregateSeverity = maxSev(aggregateSeverity, s.severity);

  return { signals, aggregateSeverity };
}
