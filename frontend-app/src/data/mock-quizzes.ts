import type { QuizPayload, QuizQuestion } from "@/types/quiz";

const DEMO_QUESTIONS: readonly QuizQuestion[] = [
  {
    type: "mcq",
    id: "q-mcq-1",
    prompt: "Što je primarni cilj ISMS-a prema ISO 27001?",
    options: [
      { id: "a", label: "Samo tehnička zaštita mreže" },
      { id: "b", label: "Zaštita povjerljivosti, integriteta i dostupnosti informacija" },
      { id: "c", label: "Isključivo usklađenost s GDPR-om" },
      { id: "d", label: "Smanjenje broja zaposlenih" },
    ],
    correctOptionId: "b",
    explanation:
      "ISMS usmjerava organizaciju na upravljanje informacijskom sigurnošću kroz CIA triad: povjerljivost, integritet i dostupnost.",
  },
  {
    type: "mca",
    id: "q-mca-1",
    prompt: "Koje od navedenog tipično ulazi u procjenu rizika? (Odaberi sve tačne odgovore)",
    options: [
      { id: "a", label: "Identifikacija imovine i prijetnji" },
      { id: "b", label: "Procjena vjerovatnosti i uticaja" },
      { id: "c", label: "Ignorisanje kontrola" },
      { id: "d", label: "Tretman ili prihvatanje rizika" },
    ],
    correctOptionIds: ["a", "b", "d"],
    explanation:
      "Procjena rizika uključuje imovinu, prijetnje, ranjivosti, te analizu vjerovatnosti i posljedica; tretman rizika je sljedeći korak u ciklusu.",
  },
  {
    type: "true_false",
    id: "q-tf-1",
    prompt: "Politika informacijske sigurnosti mora biti dostupna samo IT odjelu.",
    correct: false,
    explanation:
      "Politika se obično komunicira relevantnim zainteresovanim stranama; ograničavanje isključivo na IT nije u skladu s praksom upravljanja ISMS-om.",
  },
  {
    type: "fill_blank",
    id: "q-fb-1",
    prompt: "Trojku CIA na bosanskom često označava skraćenica: povjerljivost, integritet i _______.",
    acceptableAnswers: ["dostupnost", "availability"],
    explanation: "CIA triad: Confidentiality, Integrity, Availability → dostupnost.",
    caseSensitive: false,
  },
  {
    type: "mcq",
    id: "q-mcq-2",
    prompt: "Interni audit ISMS-a ima za cilj prvenstveno:",
    options: [
      { id: "a", label: "Zamjenu menadžmenta" },
      { id: "b", label: "Potvrdu usklađenosti i identifikaciju poboljšanja" },
      { id: "c", label: "Prodaju certifikata" },
      { id: "d", label: "Brisanje logova" },
    ],
    correctOptionId: "b",
    explanation: "Interni audit procjenjuje usklađenost s politikom i standardom te pronalazi prilike za poboljšanje.",
  },
];

const DEFAULT_PAYLOAD: QuizPayload = {
  title: "Demo kviz — informacijska sigurnost",
  questions: [...DEMO_QUESTIONS],
};

/** Fallback kad API nema kviz (npr. lokalni razvoj). */
export function getMockQuizPayload(_quizId: string): QuizPayload {
  return {
    title: DEFAULT_PAYLOAD.title,
    questions: [...DEFAULT_PAYLOAD.questions],
  };
}
