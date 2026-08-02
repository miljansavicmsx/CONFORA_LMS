import { type JSX } from "react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";

export function LearnerDashboardNextAction({
  activeProgrammes = 0,
}: {
  readonly activeProgrammes?: number;
}): JSX.Element {
  return (
    <section
      aria-labelledby="learner-next-action-heading"
      className="rounded-xl border border-border/50 bg-surface-secondary/25 p-4"
      data-testid="learner-dashboard-next-action"
    >
      <h2 id="learner-next-action-heading" className="text-sm font-semibold text-text-primary">
        Sljedeći korak
      </h2>
      <p className="mt-1 text-xs text-text-muted">
        {activeProgrammes > 0
          ? "Nastavite edukaciju ili otvorite certifikacijsku prijavu kada ispunite preduvjete sheme."
          : "Upišite program iz kataloga — edukacija je odvojena od certifikacije."}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" className="border-border/60" asChild>
          <Link to="/dashboard/learner/education">Edukacija i programi</Link>
        </Button>
        <Button type="button" size="sm" variant="outline" className="border-border/60" asChild>
          <Link to="/dashboard/certification/applications">Prijave za certifikaciju</Link>
        </Button>
        <Button type="button" size="sm" variant="outline" className="border-border/60" asChild>
          <Link to="/dashboard/my-certificates">Moji dokumenti</Link>
        </Button>
      </div>
    </section>
  );
}
