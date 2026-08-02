import { ClipboardCheck, GraduationCap } from "lucide-react";
import type { JSX } from "react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { EnterpriseAlertBanner, EnterpriseWorkflowRibbon } from "@/design-system";

export function ExamReadinessBanner({
  courseId,
  completionPercent,
  mandatoryCompleted,
  mandatoryTotal,
  courseCompleted,
  hasFinalExam,
}: {
  readonly courseId: string;
  readonly completionPercent: number;
  readonly mandatoryCompleted: number;
  readonly mandatoryTotal: number;
  readonly courseCompleted: boolean;
  readonly hasFinalExam: boolean;
}): JSX.Element {
  const pct = Math.min(100, Math.max(0, completionPercent));
  const readyForExamRequest = hasFinalExam && courseCompleted;

  return (
    <div className="space-y-3" role="region" aria-label="Spremnost za ispit" aria-live="polite">
      <EnterpriseWorkflowRibbon
        ariaLabel="Signal spremnosti za ispit"
        stages={[
          { label: "Lekcije", state: pct >= 85 ? "done" : pct > 0 ? "active" : "pending" },
          { label: "Obavezni moduli", state: mandatoryTotal > 0 && mandatoryCompleted >= mandatoryTotal ? "done" : "active" },
          { label: "Program", state: courseCompleted ? "done" : "pending" },
          { label: "Ispit", state: readyForExamRequest ? "active" : "pending" },
        ]}
      />
      <div className="grid gap-2 rounded-xl border border-border/40 bg-surface-secondary/60 p-3 text-xs text-text-secondary sm:grid-cols-2">
        <p>
          <span className="font-semibold text-text-primary">Napredak lekcija: </span>
          {pct}%
        </p>
        <p>
          <span className="font-semibold text-text-primary">Obavezno završeno: </span>
          {mandatoryCompleted}/{mandatoryTotal || "—"}
        </p>
      </div>
      {!courseCompleted ? (
        <EnterpriseAlertBanner severity="warning" icon={ClipboardCheck} title="Još uvjeta za ispit">
          Završite obavezne lekcije u programu. Kviz checkpointi u playeru povećavaju šanse za prolaz završnog ispita —
          detaljna pravila ostaju na serveru.
        </EnterpriseAlertBanner>
      ) : null}
      {courseCompleted && hasFinalExam ? (
        <div className="flex flex-wrap items-center gap-2">
          <GraduationCap className="h-5 w-5 text-brand" aria-hidden />
          <Button asChild size="sm" className="bg-brand text-white hover:bg-brand/90">
            <Link to={`/dashboard/exams?courseId=${encodeURIComponent(courseId)}`}>Pokreni / zatraži ispit</Link>
          </Button>
        </div>
      ) : null}
      {!hasFinalExam ? (
        <p className="text-xs text-text-muted">Ovaj program nema završni ispit u strukturi.</p>
      ) : null}
    </div>
  );
}
