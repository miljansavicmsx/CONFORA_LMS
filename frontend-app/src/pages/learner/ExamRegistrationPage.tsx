import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { JSX } from "react";

import { Button } from "@/components/ui/button";
import { createExamRegistration, fetchExamRegistrationOptions, type LearnerExamRegistrationAvailableItem } from "@/lib/api-exam-registration";

function safeText(value: string | null | undefined, fallback = "Nije dostupno"): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

/** Learner exam-registration display only. Server eligibility remains authoritative and failures never imply a pass. */
export default function ExamRegistrationPage(): JSX.Element {
  const queryClient = useQueryClient();
  const optionsQ = useQuery({ queryKey: ["learner", "exam-registration-options"], queryFn: fetchExamRegistrationOptions });
  const registrationM = useMutation({
    mutationFn: (item: LearnerExamRegistrationAvailableItem) => createExamRegistration({ courseId: item.courseId, examId: item.examId }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["learner", "exam-registration-options"] }),
  });
  const options = optionsQ.data;

  return (
    <main className="mx-auto max-w-4xl px-4 py-10" data-testid="learner-exam-registration-page" aria-labelledby="exam-registration-heading">
      <h1 id="exam-registration-heading" className="text-2xl font-bold text-text-primary">Prijava za ispit</h1>
      <p className="mt-3 rounded-lg border border-amber-300/50 bg-amber-50/60 p-3 text-sm text-text-secondary" data-testid="learner-exam-registration-boundary">Prijava za ispit nije rezultat ispita, certifikat niti odluka o certifikaciji.</p>
      <p className="mt-3 text-sm text-text-secondary" data-testid="learner-exam-registration-results-notice">Statusi se prikazuju isključivo prema postojećem odgovoru sistema. Nedostupni podaci nisu potvrda uspjeha.</p>
      {optionsQ.isPending ? <p className="mt-6 text-sm text-text-secondary" role="status">Učitavanje dostupnih prijava…</p> : null}
      {optionsQ.isError ? <p className="mt-6 text-sm text-text-secondary" role="alert">Podaci o prijavi za ispit trenutno nisu dostupni. Nije moguće potvrditi podobnost.</p> : null}
      <section className="mt-6" data-testid="learner-exam-section-available" aria-labelledby="exam-available-heading">
        <h2 id="exam-available-heading" className="text-lg font-semibold text-text-primary">Dostupne prijave</h2>
        <ul className="mt-3 space-y-3">
          {(options?.available ?? []).map((item) => <li key={`${item.courseId}-${item.examId}`} className="rounded-lg border border-border/50 p-3"><p className="font-medium text-text-primary">{item.examTitle}</p><p className="text-sm text-text-secondary">{item.courseTitle}</p><p className="mt-1 text-sm text-text-secondary">{safeText(item.learnerLabel)} · {safeText(item.nextStep)}</p><Button className="mt-3" type="button" size="sm" disabled={!item.canRegister || registrationM.isPending} data-testid={`learner-exam-register-btn-${item.examId}`} onClick={() => registrationM.mutate(item)}>Evidentiraj prijavu</Button></li>)}
        </ul>
      </section>
      {registrationM.isSuccess ? <p className="mt-3 text-sm text-text-secondary" role="status">Prijava je evidentirana.</p> : null}
      {registrationM.isError ? <p className="mt-3 text-sm text-text-secondary" role="alert">Prijava nije evidentirana. Pokušajte ponovo kasnije.</p> : null}
      <section className="mt-8" data-testid="learner-exam-section-registrations" aria-labelledby="exam-registrations-heading"><h2 id="exam-registrations-heading" className="text-lg font-semibold text-text-primary">Moje prijave</h2><ul className="mt-3 space-y-2">{(options?.registrations ?? []).map((item) => <li key={item.registrationId} className="rounded-lg border border-border/50 p-3" data-testid={`learner-exam-reg-status-${item.registrationId}`}><p className="font-medium text-text-primary">{item.examTitle}</p><p className="text-sm text-text-secondary">{safeText(item.learnerLabel)} · {safeText(item.nextStep)}</p></li>)}</ul></section>
      <section className="mt-8" data-testid="learner-exam-section-blocked" aria-labelledby="exam-blocked-heading"><h2 id="exam-blocked-heading" className="text-lg font-semibold text-text-primary">Trenutno nedostupne prijave</h2><ul className="mt-3 space-y-2">{(options?.blocked ?? []).map((item) => <li key={`${item.courseId}-${item.examId ?? "none"}`} className="rounded-lg border border-border/50 p-3"><p className="font-medium text-text-primary">{item.examTitle ?? item.courseTitle}</p><p className="text-sm text-text-secondary">{safeText(item.learnerLabel)} · {safeText(item.reason)} · {safeText(item.nextStep)}</p></li>)}</ul></section>
    </main>
  );
}
