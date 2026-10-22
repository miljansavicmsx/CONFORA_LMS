import { type JSX } from "react";
import { Link } from "react-router";

export default function UnauthorizedPage(): JSX.Element {
  return (
    <main className="mx-auto max-w-xl px-4 py-16" data-testid="access-denied">
      <h1 className="text-2xl font-semibold text-text-primary">Pristup nije dozvoljen</h1>
      <p className="mt-3 text-sm text-text-secondary">
        Ovaj nalog nema ovlaštenje za traženu stranicu. Server i dalje provjerava ulogu i organizaciju.
      </p>
      <Link className="mt-6 inline-block text-sm underline" to="/dashboard">
        Nazad na početnu
      </Link>
    </main>
  );
}
