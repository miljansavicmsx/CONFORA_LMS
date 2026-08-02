import type {
  CrossModuleInsight,
  GovernanceTimelineEvent,
  IntelligenceInput,
  WorkflowInsight,
} from "./intelligence-types";

export function buildWorkflowInsights(input: IntelligenceInput): WorkflowInsight[] {
  const items: WorkflowInsight[] = [];

  const stallScore = input.applicationsInReview + input.decisionsOpen * 2;
  if (stallScore > 25) {
    items.push({
      id: "stall-cert",
      severity: "warning",
      title: "Certifikacijski tok usporen",
      detail:
        "Dug boravak u pregledu / otvorenim odlukama sugeriše zastoj u quorum-u, dokumentaciji kandidata ili CAPA vezama.",
    });
  }

  if (input.decisionsQuorumPending > 5 && input.applicationsPendingQueue > 8) {
    items.push({
      id: "approval-congestion",
      severity: "warning",
      title: "Kongestija odobrenja",
      detail: "Raste pritisak istovremeno na red prijava i odluke u čekanju kvoruma.",
    });
  }

  if (input.capaOverdue > 0 && input.openComplaints > 5) {
    items.push({
      id: "complaint-to-capa",
      severity: "info",
      title: "Mogući pritisak pritužbi na CAPA trag",
      detail:
        "Heuristika: paralelno prisustvo pritužbi i prekoračenih CAPA često zahtijeva istragu uzročnosti (bez zaključka iz ovog panela).",
    });
  }

  if (input.riskOpenHighCritical > 2 && input.managementReviewOverdueActions > 3) {
    items.push({
      id: "governance-drill",
      severity: "critical",
      title: "Rizik + MR zastoj",
      detail: "Teški rizici uz prekoračene MR akcije signaliziraju da governance ciklus ne zatvara kontrole.",
    });
  }

  return items;
}

export function buildCrossModuleInsights(input: IntelligenceInput): CrossModuleInsight[] {
  const out: CrossModuleInsight[] = [];

  if (input.openComplaints > 6 && input.capaOpen > 5) {
    out.push({
      id: "xc-complaint-capa",
      title: "Pritužbe i CAPA pritisak u istom trenutku",
      detail: "Predloži tematski pregled: korelacija tipova pritužbi s otvorenim NCR.",
      severity: "warning",
    });
  }
  if (input.decisionsQuorumPending > 4 && input.applicationsPendingQueue > 6) {
    out.push({
      id: "xc-committee",
      title: "Isti odborski sloj pod dualnim opterećenjem",
      detail: "Red prijava i kvorum čekaju paralelno — moguće preusmjeravanje materijala ili dodatna sjednica.",
      severity: "warning",
    });
  }
  if (input.riskOverdueReviews > 2 && input.auditSensitiveFlags > 3) {
    out.push({
      id: "xc-audit-risk",
      title: "Audit signal + rizik dug",
      detail: "Opservabilnost platforme i risk review backlog zajedno zahtijevaju triage sedmicu.",
      severity: "critical",
    });
  }
  return out;
}

export function buildGovernanceTimelineEvents(
  input: IntelligenceInput,
  generatedAtLabel: string,
): GovernanceTimelineEvent[] {
  const ev: GovernanceTimelineEvent[] = [
    {
      id: "snapshot",
      at: generatedAtLabel,
      kind: "INTELLIGENCE_SNAPSHOT",
      title: "Executive snapshot generiran",
      detail: "Inferencija iz dashboard konteksta + lokalnih CB brojača (ako dostupni).",
    },
  ];
  if (input.capaOverdue > 0) {
    ev.push({
      id: "capa-signal",
      at: generatedAtLabel,
      kind: "CAPA",
      title: "Detektovan CAPA/NCR pritisak",
      detail: `${input.capaOverdue} prekoračenih stavki u signalima.`,
    });
  }
  if (input.managementReviewPendingApproval > 0) {
    ev.push({
      id: "mr-pend",
      at: generatedAtLabel,
      kind: "MANAGEMENT_REVIEW",
      title: "Odobrenja na čekanju",
      detail: `${input.managementReviewPendingApproval} MR stavki čeka potpis/odobrenje.`,
    });
  }
  if (input.openComplaints > 0) {
    ev.push({
      id: "cmp",
      at: generatedAtLabel,
      kind: "COMPLAINT",
      title: "Otvoren complaint backlog",
      detail: `${input.openComplaints} otvorenih pritužbi.`,
    });
  }
  return ev;
}
