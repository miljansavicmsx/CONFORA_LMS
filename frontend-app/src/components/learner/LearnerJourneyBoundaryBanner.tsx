import { Info } from "lucide-react";
import { type JSX } from "react";

import { LEARNER_EDUCATION_CERT_BOUNDARY_MESSAGE } from "@/lib/learner-flow-labels";
import { cn } from "@/lib/utils";

/**
 * Concise education vs certification boundary for learner dashboard and education views.
 */
export function LearnerJourneyBoundaryBanner({
  className,
  testId = "learner-education-cert-boundary",
}: {
  readonly className?: string;
  readonly testId?: string;
}): JSX.Element {
  return (
    <div
      className={cn(
        "rounded-xl border border-sky-500/25 bg-sky-500/10 px-4 py-3 text-sm text-text-secondary",
        className,
      )}
      role="note"
      data-testid={testId}
    >
      <div className="flex gap-2">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" aria-hidden />
        <p>{LEARNER_EDUCATION_CERT_BOUNDARY_MESSAGE}</p>
      </div>
    </div>
  );
}
