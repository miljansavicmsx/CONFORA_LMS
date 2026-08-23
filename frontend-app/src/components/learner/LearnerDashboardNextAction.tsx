import type { JSX } from "react";

/** Learning-only next step; it does not assert examination or certification eligibility. */
export function LearnerDashboardNextAction({ activeProgrammes }: { readonly activeProgrammes: number }): JSX.Element {
  const count = Number.isFinite(activeProgrammes) ? Math.max(0, Math.floor(activeProgrammes)) : 0;

  return (
    <p className="text-sm text-text-secondary" data-testid="learner-dashboard-next-action">
      {count > 0 ? `Imate ${count} aktivnih edukacija. Nastavite s učenjem kada budete spremni.` : "Trenutno nemate aktivnih edukacija."}
    </p>
  );
}
