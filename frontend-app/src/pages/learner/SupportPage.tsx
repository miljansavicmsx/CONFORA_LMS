import type { JSX } from "react";
import { Link } from "react-router";

/** Learner support is informational and remains separate from formal case handling. */
export default function SupportPage(): JSX.Element {
  return (
    <main className="min-h-0 flex-1 overflow-auto px-4 py-8 lg:px-8" data-testid="learner-support-page">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Podrška i kontakt</h1>
        <section className="mt-6 rounded-xl border border-border/50 bg-surface-secondary/30 p-5" aria-labelledby="support-tickets-heading">
          <h2 id="support-tickets-heading" className="text-base font-semibold text-text-primary">Moji zahtjevi za podršku</h2>
          <p className="mt-2 text-sm text-text-secondary" data-testid="learner-support-tickets-unavailable">
            Evidencija zahtjeva za podršku trenutačno nije dostupna u ovom prikazu.
          </p>
        </section>
        <section className="mt-6 rounded-xl border border-border/50 p-5" aria-labelledby="support-formal-heading">
          <h2 id="support-formal-heading" className="text-base font-semibold text-text-primary">ISO — predmeti i žalbe</h2>
          <p className="mt-3 text-sm font-medium text-text-primary">Moje žalbe na odluke</p>
          <p className="mt-1 text-sm text-text-secondary">
            Formalne žalbe ne rješava podrška i njihov se status ne pretpostavlja u ovom prikazu.
          </p>
          <p className="mt-4 text-sm font-medium text-text-primary">Moji formalni predmeti</p>
          <p className="mt-1 text-sm text-text-secondary">
            Prigovori i žalbe vode se u zasebnom postupku s odgovarajućim ovlaštenjem i provjerama neovisnosti.
          </p>
          <Link to="/dashboard/appeals-complaints" className="mt-4 inline-block text-sm font-medium text-brand underline-offset-2 hover:underline" data-testid="learner-support-to-appeals-complaints">
            Otvori žalbe i prigovore
          </Link>
        </section>
      </div>
    </main>
  );
}
