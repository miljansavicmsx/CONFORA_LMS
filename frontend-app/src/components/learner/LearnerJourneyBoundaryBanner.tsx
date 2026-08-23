import type { JSX } from "react";

/** Keeps the learner-facing training record separate from certification decisions. */
export function LearnerJourneyBoundaryBanner(): JSX.Element {
  return (
    <section className="rounded-lg border border-amber-300/50 bg-amber-50/60 p-3 text-sm text-text-secondary" data-testid="learner-education-cert-boundary" aria-label="Granica edukacije i certifikacije">
      Završetak edukacije je evidencija učenja. Ne predstavlja odluku o certifikaciji niti potvrdu stručne osposobljenosti.
    </section>
  );
}
