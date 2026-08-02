import type { JSX } from "react";

import { EnterpriseTimeline, type EnterpriseTimelineItemState } from "@/design-system";

export function LearningCertificationPathwayCard({
  completionPercent,
  courseCompleted,
  hasFinalExam,
  leadsToCertification = true,
  quizLessonsTotal,
  quizLessonsCompleted,
}: {
  readonly completionPercent: number;
  readonly courseCompleted: boolean;
  readonly hasFinalExam: boolean;
  /** Ako program ne vodi ka osobnoj certifikaciji, put se prikazuje kao informativan. */
  readonly leadsToCertification?: boolean;
  readonly quizLessonsTotal: number;
  readonly quizLessonsCompleted: number;
}): JSX.Element | null {
  if (!leadsToCertification) {
    return (
      <div className="rounded-xl border border-border/45 bg-surface-secondary/70 p-4" role="region" aria-label="Certifikacija">
        <p className="text-xs text-text-secondary">
          Ovaj program je informativno-edukativni.{" "}
          <span className="font-semibold text-text-primary">PERSON_CERTIFICATION</span> nije predviđen shemom programa.
        </p>
      </div>
    );
  }

  const pct = Math.min(100, Math.max(0, completionPercent));
  const quizzesDone =
    quizLessonsTotal === 0 ? true : quizLessonsCompleted >= quizLessonsTotal;
  const examEligible = hasFinalExam && courseCompleted;

  const lessonStep: EnterpriseTimelineItemState = courseCompleted ? "done" : "current";
  let quizStep: EnterpriseTimelineItemState;
  if (quizLessonsTotal === 0) {
    quizStep = "done";
  } else if (quizzesDone) {
    quizStep = "done";
  } else if (courseCompleted) {
    quizStep = "current";
  } else {
    quizStep = "locked";
  }

  const items: {
    id: string;
    title: string;
    subtitle?: string;
    state: EnterpriseTimelineItemState;
  }[] = [
    {
      id: "e1",
      title: "Upis kursa",
      subtitle: "Pristup materijalima u playeru",
      state: "done",
    },
    {
      id: "e2",
      title: "Završetak lekcija",
      subtitle: `${pct}% obaveznih lekcija (API)`,
      state: lessonStep,
    },
    {
      id: "e3",
      title: "Kviz checkpointi",
      subtitle:
        quizLessonsTotal === 0
          ? "Nema kviz-lekcija u strukturi"
          : `${quizLessonsCompleted}/${quizLessonsTotal} kviz-lekcija označeno u playeru`,
      state: quizStep,
    },
    {
      id: "e4",
      title: "Završni ispit",
      subtitle: hasFinalExam ? "Pristup nakon završetka programa" : "Nije u strukturi programa",
      state: hasFinalExam ? (examEligible ? "current" : "locked") : "locked",
    },
    {
      id: "e5",
      title: "Exam pass (potvrda prolaska)",
      subtitle: "Izdaje se u sklopu edukacije kada su ispunjeni uvjeti — nije osobna certifikacija",
      state: "locked",
    },
    {
      id: "e6",
      title: "Prijava za certifikaciju osobe",
      subtitle: "Odvojena prijava prema shemi",
      state: "locked",
    },
    {
      id: "e7",
      title: "Odbor / odluka",
      state: "locked",
    },
    {
      id: "e8",
      title: "PERSON_CERTIFICATION",
      subtitle: "Formalni certifikat osobe nakon odobrenja — drugačiji artefakt od exam-pass",
      state: "locked",
    },
    {
      id: "e9",
      title: "Javna provjera",
      state: "locked",
    },
  ];

  return (
    <div className="rounded-xl border border-border/45 bg-surface-secondary/70 p-4" role="region" aria-label="Put do certifikacije osobe">
      <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Certification pathway</p>
      <p className="mt-1 text-sm font-medium text-text-primary">Od edukacije do osobnog certifikata</p>
      <p className="mt-2 text-xs leading-relaxed text-text-secondary">
        <span className="font-semibold text-text-primary">Exam pass / EXAM_PASS_CERTIFICATE</span> potvrđuje položen ispit u
        programu.{" "}
        <span className="font-semibold text-text-primary">PERSON_CERTIFICATION</span> je odvojena odluka tijela nakon prijave
        i provjere usklađenosti.
      </p>
      <EnterpriseTimeline ariaLabel="Koraci certifikacijskog puta" items={items} />
    </div>
  );
}
