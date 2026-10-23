import type { JSX } from "react";
import { Link } from "react-router";

/** Exam booking has no Nest route. Assigned sessions are the existing sit path. */
export default function ExamRegistrationPage(): JSX.Element {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10" data-testid="learner-exam-registration-page" aria-labelledby="exam-registration-heading">
      <h1 id="exam-registration-heading" className="text-2xl font-bold text-text-primary">Prijava za ispit</h1>
      <p className="mt-3 rounded-lg border border-amber-300/50 bg-amber-50/60 p-3 text-sm text-text-secondary" data-testid="learner-exam-registration-boundary">
        Prijava za ispit nije rezultat ispita, certifikat niti odluka o certifikaciji.
      </p>
      <p className="mt-3 text-sm text-text-secondary" data-testid="learner-exam-registration-results-notice">
        Statusi se prikazuju isključivo prema postojećem odgovoru sistema. Nedostupni podaci nisu potvrda uspjeha.
      </p>
      <p className="mt-6 text-sm text-text-secondary" data-testid="exam-registration-not-implemented">
        Samostalna prijava za ispit još nije provedena. Nema API-ja za zakazivanje. Dodijeljene sesije se otvaraju, polažu i pregledaju na listi sesija.
      </p>
      <section className="mt-6" data-testid="learner-exam-section-available" aria-labelledby="exam-available-heading">
        <h2 id="exam-available-heading" className="text-lg font-semibold text-text-primary">Dostupne prijave</h2>
        <p className="mt-3 text-sm text-text-secondary">Nema prijava za prikaz. Zakazivanje ispita nije provedeno.</p>
      </section>
      <section className="mt-8" data-testid="learner-exam-section-registrations" aria-labelledby="exam-registrations-heading">
        <h2 id="exam-registrations-heading" className="text-lg font-semibold text-text-primary">Moje prijave</h2>
        <p className="mt-3 text-sm text-text-secondary">Nema evidentiranih prijava. Ova stranica ne izmišlja status prijave.</p>
      </section>
      <section className="mt-8" data-testid="learner-exam-section-blocked" aria-labelledby="exam-blocked-heading">
        <h2 id="exam-blocked-heading" className="text-lg font-semibold text-text-primary">Trenutno nedostupne prijave</h2>
        <p className="mt-3 text-sm text-text-secondary">Nema blokiranih prijava jer prijava još nije provedena.</p>
      </section>
      <p className="mt-4 text-sm">
        <Link className="text-brand underline" to="/dashboard/exams/sessions">Moje ispitne sesije</Link>
      </p>
    </main>
  );
}
