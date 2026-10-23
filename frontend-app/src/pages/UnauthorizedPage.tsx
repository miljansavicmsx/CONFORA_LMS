import { type JSX } from "react";
import { Link } from "react-router";

import { useAuthStore } from "@/stores/authStore";

export default function UnauthorizedPage(): JSX.Element {
  const email = useAuthStore((state) => state.user?.email ?? "");
  return (
    <div className="mx-auto max-w-xl px-4 py-16" data-testid="access-denied">
      <h1 className="text-2xl font-semibold text-text-primary">Pristup nije dozvoljen</h1>
      {email ? (
        <p className="mt-3 text-sm text-text-secondary" data-testid="denied-account">
          {email}
        </p>
      ) : null}
      <p className="mt-3 text-sm text-text-secondary">
        Ovaj nalog nema ovlaštenje za traženu stranicu. Server i dalje provjerava ulogu i organizaciju.
      </p>
      <p className="mt-3 text-sm text-text-secondary" data-testid="chair-not-implemented">
        Ovlaštenje predsjedavajućeg nije dodijeljeno ovom nalogu. Imenovanje predsjedavajućeg još nije
        provedeno i ova stranica ga ne dodjeljuje.
      </p>
      <Link className="mt-6 inline-block text-sm underline" to="/dashboard">
        Nazad na početnu
      </Link>
    </div>
  );
}
