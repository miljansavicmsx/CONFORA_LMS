import { ListChecks } from "lucide-react";
import type { JSX, ReactNode } from "react";

import { EnterpriseAlertBanner } from "@/design-system";

export function QuizCheckpointCard({
  title = "Kviz checkpoint",
  body,
  passed,
  scoreLabel,
}: {
  readonly title?: string;
  readonly body: ReactNode;
  readonly passed?: boolean;
  readonly scoreLabel?: string;
}): JSX.Element {
  return (
    <div
      role="group"
      aria-labelledby="quiz-checkpoint-title"
      className="rounded-xl border border-sky-500/30 bg-sky-500/[0.08] p-4 ring-1 ring-sky-500/15"
    >
      <div className="flex items-center gap-2">
        <ListChecks className="h-5 w-5 text-sky-300" aria-hidden />
        <h2 id="quiz-checkpoint-title" className="text-sm font-semibold text-text-primary">
          {title}
        </h2>
      </div>
      <div className="mt-2 text-sm text-text-secondary">{body}</div>
      {scoreLabel ? <p className="mt-2 text-xs text-text-muted">{scoreLabel}</p> : null}
      {passed === false ? (
        <div className="mt-3">
          <EnterpriseAlertBanner severity="info" icon={ListChecks} title="Preporuka">
            Ponovite poglavlje i pokušajte kviz ponovo prije završnog ispita — formalni pokušaji se bilježe u modulu ispita.
          </EnterpriseAlertBanner>
        </div>
      ) : null}
    </div>
  );
}
