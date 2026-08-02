/** Kratak rječnik za command center alias ekspanziju i glossary UI. */

export type GlossaryEntry = {
  readonly term: string;
  readonly definition: string;
  readonly relatedClauseHints: readonly string[];
  readonly aliases: readonly string[];
};

export const KNOWLEDGE_GLOSSARY: readonly GlossaryEntry[] = [
  {
    term: "Nepristranost (impartiality)",
    definition: "Zaštita odluke o certifikaciji od komercijalnih ili osobnih utjecaja.",
    relatedClauseHints: ["17024-imp-struct", "17024-imp-threat-review"],
    aliases: ["impartiality", "nepristranost"],
  },
  {
    term: "Sukob interesa (COI)",
    definition: "Situacija u kojoj interes člana odbora ili ocjenjivača može dovesti do strane odluke.",
    relatedClauseHints: ["17024-imp-struct", "17024-imp-committee-composition"],
    aliases: ["coi", "conflict of interest", "sukob interesa"],
  },
  {
    term: "Nadzor (surveillance)",
    definition: "Aktivnosti nakon certifikacije koje potvrđuju kontinuirano ispunjavanje.",
    relatedClauseHints: ["17024-surv-plan", "17024-surv-noncompliance"],
    aliases: ["surveillance", "nadzor", "post-certification monitoring"],
  },
  {
    term: "Recertifikacija",
    definition: "Proces obnove certifikacije prema shemi.",
    relatedClauseHints: ["17024-recert-triggers", "17024-recert-decision"],
    aliases: ["recertification", "obnova certifikata", "renewal"],
  },
  {
    term: "Valjanost kompetencije",
    definition: "Evidencija da su zahtijevane kompetencije aktivne (edukacija, evaluacija, istek).",
    relatedClauseHints: ["17024-comp-personnel", "17024-comp-assessors"],
    aliases: ["competence validity", "kompetencija istek", "istek kompetencije"],
  },
];
