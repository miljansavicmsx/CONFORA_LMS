import type { TwinNormalizedInput } from "@/lib/digital-twin/twin-types";

export type AuditReadinessBand = "audit_ready" | "mostly_ready" | "at_risk" | "critical";

export interface AuditReadinessBundle {
  readonly score: number;
  readonly band: AuditReadinessBand;
  readonly topBlockers: readonly string[];
  readonly auditFocusAreas: readonly string[];
  readonly recommendedEvidence: readonly string[];
  readonly narrative: string;
}

function bandFromScore(s: number): AuditReadinessBand {
  if (s >= 82) return "audit_ready";
  if (s >= 64) return "mostly_ready";
  if (s >= 42) return "at_risk";
  return "critical";
}

/** Ljudski čitljiva traka za SR i live region (ne zamjenjuje formalni audit zaključak). */
export function formatAuditReadinessBandHr(band: AuditReadinessBand): string {
  switch (band) {
    case "audit_ready":
      return "Spreman za audit — heuristički signal, potrebna potvrda uzorka dokaza.";
    case "mostly_ready":
      return "Uglavnom spreman — rizici su umjereni; adresirajte blokere prije uzorkovanja.";
    case "at_risk":
      return "Povećan rizik — značajan pritisak na tragove; prioritet CAPA, kompetencije ili odbor.";
    case "critical":
      return "Kritičan pritisak — audit bi trebao fokusirati otvorene tragove i blokere.";
    default:
      return band;
  }
}

/** Tekstualni opis skora uz kontekst trake (ne oslanjati se samo na broj). */
export function formatAuditReadinessScoreNarration(bundle: AuditReadinessBundle): string {
  return `Audit readiness skor ${bundle.score} od 100. Traka: ${formatAuditReadinessBandHr(bundle.band)}`;
}

/**
 * Neovisni audit readiness sloj (Phase G) — koristi isti normalizirani snapshot kao twin/compliance.
 * Nema backend odluka; samo orkestracija za pripremu audita.
 */
export function buildAuditReadinessBundle(snapshot: TwinNormalizedInput, governanceDocSample = 8): AuditReadinessBundle {
  let score = 86;
  const blockers: string[] = [];
  const focus: string[] = [];
  const evidence: string[] = [];

  const capaHit = snapshot.capaOverdue * 3 + snapshot.capaOpen * 0.2;
  score -= capaHit;
  if (snapshot.capaOverdue >= 4) blockers.push(`CAPA preko roka (${snapshot.capaOverdue})`);
  if (snapshot.capaOverdue >= 2) focus.push("CAPA trag i effectiveness");

  const compHit = snapshot.competenceDue * 1.8;
  score -= compHit;
  if (snapshot.competenceDue >= 10) blockers.push(`Kompetencije u isteku (${snapshot.competenceDue})`);
  if (snapshot.competenceDue >= 5) focus.push("Kompetencija — profili i valjanost");

  const impHit = snapshot.impartialityThreats * 4 + snapshot.impartialityReviewsOverdue * 3;
  score -= impHit;
  if (snapshot.impartialityThreats >= 3) blockers.push(`Impartiality prijetnje (${snapshot.impartialityThreats})`);
  focus.push("Impartiality registar i COI uzorak odbora");

  const govHit = snapshot.managementReviewOverdueActions * 2.5 + snapshot.openGovernanceCases * 1.2;
  score -= govHit;
  if (snapshot.managementReviewOverdueActions >= 6) blockers.push("MR akcije izvan kadence");
  focus.push("Management review ulazi/izlazi");

  const traceHit = snapshot.quorumPending + snapshot.coiIncomplete;
  score -= traceHit * 1.2;
  if (traceHit >= 10) blockers.push("Odborski trag (kvorum/COI)");
  focus.push("Decision trace — prijava do certifikata");

  if (governanceDocSample < 4) {
    score -= 12;
    blockers.push("Mali uzorak governance dokumenata u kontekstu");
  }

  const auditGap = Math.max(0, snapshot.openAuditFindings - snapshot.internalAuditRecords);
  if (auditGap >= 3) {
    score -= 8;
    blockers.push("Nalazi vs interni audit uzorak");
  }
  focus.push("Strukturirani audit trail modul");
  evidence.push("Zapis odbora", "CAPA kartice", "MR zapisnik", "Registar kompetencija", "IMP analiza");

  const rounded = Math.max(0, Math.min(100, Math.round(score)));
  return {
    score: rounded,
    band: bandFromScore(rounded),
    topBlockers: blockers.slice(0, 6),
    auditFocusAreas: [...new Set(focus)].slice(0, 8),
    recommendedEvidence: [...new Set(evidence)].slice(0, 10),
    narrative:
      "Procjena je heuristička nad dashboard agregatima. Auditor uvijek potvrđuje reprezentativni uzorak u stvarnim evidencijama.",
  };
}
