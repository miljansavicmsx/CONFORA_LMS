import type { JSX } from "react";

/**
 * A bounded support landing surface. It intentionally contains no case data,
 * decision controls, or client-side appeal/complaint adjudication.
 */
export default function SupportAdminPage(): JSX.Element {
  return (
    <main className="min-h-0 flex-1 overflow-auto px-4 py-8 lg:px-8" data-testid="support-admin-page">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Registar podrške</h1>
        <p className="mt-3 text-sm text-text-secondary" data-testid="support-admin-boundary">
          Podrška vodi komunikaciju i usmjeravanje. Ne odlučuje o žalbama, prigovorima ni rezultatima certifikacije.
        </p>
        <section className="mt-6 rounded-xl border border-border/50 bg-surface-secondary/30 p-5" aria-labelledby="support-admin-unavailable">
          <h2 id="support-admin-unavailable" className="text-base font-semibold text-text-primary">Evidencija podrške nije dostupna u ovom prikazu</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Za formalne žalbe i prigovore koristite zaseban, ovlašteni postupak. Ovaj prikaz ne prikazuje privatne predmete niti dodjeljuje ovlaštenja.
          </p>
        </section>
      </div>
    </main>
  );
}
