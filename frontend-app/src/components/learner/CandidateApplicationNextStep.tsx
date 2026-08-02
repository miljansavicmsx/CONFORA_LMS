import { ArrowRight } from "lucide-react";
import { type JSX } from "react";

import type { ApplicationStatus } from "@/lib/api-governance";
import { candidateApplicationNextStep } from "@/lib/learner-flow-labels";

export function CandidateApplicationNextStep({
  status,
}: {
  readonly status: ApplicationStatus | string;
}): JSX.Element {
  const step = candidateApplicationNextStep(status);
  return (
    <div
      className="mt-3 rounded-xl border border-border/40 bg-surface-primary/30 px-3 py-2.5 text-sm"
      data-testid="candidate-application-next-step"
    >
      <p className="flex items-center gap-1.5 font-medium text-text-primary">
        <ArrowRight className="h-4 w-4 shrink-0 text-brand" aria-hidden />
        {step.title}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-text-muted">{step.detail}</p>
    </div>
  );
}
