import type { JSX } from "react";
import { Link, useLocation } from "react-router";

export function InactiveLocalDemoPage(): JSX.Element {
  const { state } = useLocation() as { state?: { from?: string } };
  const from = typeof state?.from === "string" ? state.from : null;

  return (
    <div
      className="mx-auto max-w-xl space-y-4 rounded-2xl border border-border/60 bg-surface-secondary/30 p-8"
      data-testid="inactive-local-demo-page"
    >
      <h1 className="text-lg font-semibold text-text-primary">Nije aktivno u lokalnom demou</h1>
      <p className="text-sm leading-relaxed text-text-secondary">
        Tražena funkcija još nije uključena u kontrolirani lokalni demo (backend modul nije povezan ili je
        označena kao interni pregled). Ovo nije produkcijska ili vanjska pilot verzija.
      </p>
      {from ? (
        <p className="text-xs text-text-muted">
          Zatražena ruta: <code className="rounded bg-surface-primary px-1">{from}</code>
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3 pt-2">
        <Link
          to="/dashboard"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Natrag na početak
        </Link>
        <Link to="/courses" className="rounded-lg border border-border px-4 py-2 text-sm text-text-primary">
          Javni katalog
        </Link>
      </div>
    </div>
  );
}
