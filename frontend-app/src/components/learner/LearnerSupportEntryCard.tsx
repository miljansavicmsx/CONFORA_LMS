import { LifeBuoy } from "lucide-react";
import { type JSX } from "react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import {
  LEARNER_SUPPORT_CONTEXT_COPY,
  type LearnerSupportContext,
  learnerSupportHref,
} from "@/lib/support-contact-labels";

export function LearnerSupportEntryCard({
  context,
}: {
  readonly context?: LearnerSupportContext;
}): JSX.Element {
  const copy = context
    ? LEARNER_SUPPORT_CONTEXT_COPY[context]
    : { title: "Trebate pomoć?", detail: "Otvorite podršku za pitanja o edukaciji, prijavi ili verifikaciji." };

  return (
    <section
      aria-labelledby="learner-support-entry-heading"
      className="rounded-xl border border-border/50 bg-surface-secondary/25 p-4"
      data-testid="learner-support-entry"
    >
      <div className="flex items-start gap-3">
        <LifeBuoy className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden />
        <div className="min-w-0 flex-1">
          <h2 id="learner-support-entry-heading" className="text-sm font-semibold text-text-primary">
            {copy.title}
          </h2>
          <p className="mt-1 text-xs text-text-muted">{copy.detail}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" className="border-border/60" asChild>
              <Link to={context ? learnerSupportHref(context) : "/dashboard/support"}>Podrška i kontakt</Link>
            </Button>
            <Button type="button" size="sm" variant="ghost" className="text-text-muted" asChild>
              <Link to="/contact">Javni obrazac</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
