import { type FormEvent, type JSX, useState } from "react";
import { Link, useNavigate } from "react-router";

import { Button } from "@/components/ui/button";

/** Public verification entry. The lookup key is the random verification id, not a name or a sequential number. */
export default function PublicRegistryPage(): JSX.Element {
  const navigate = useNavigate();
  const [verificationId, setVerificationId] = useState("");

  function onSearch(event: FormEvent) {
    event.preventDefault();
    const key = verificationId.trim();
    if (!key) return;
    navigate(`/verify/${encodeURIComponent(key)}`);
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10" data-testid="public-registry-page" aria-labelledby="registry-heading">
      <h1 id="registry-heading" className="text-2xl font-bold text-text-primary">Javna provjera dokumenata</h1>
      <p className="mt-2 text-sm text-text-secondary">
        Pregled bez prijave. Prikazuju se status, vrsta dokumenta i datum izdavanja. Ime se vidi samo dok traje poseban pristanak nosioca. Uzastopni broj zapisa nije javni ključ.
      </p>
      <form className="mt-6 space-y-3" onSubmit={onSearch} aria-labelledby="registry-search-heading">
        <h2 id="registry-search-heading" className="text-lg font-semibold text-text-primary">Provjera</h2>
        <label className="block text-sm text-text-primary" htmlFor="registry-verification">
          Identifikator provjere
          <input
            id="registry-verification"
            className="mt-1 w-full rounded border border-border px-3 py-2 font-mono"
            value={verificationId}
            onChange={(event) => setVerificationId(event.target.value)}
            autoComplete="off"
            required
            data-testid="registry-verification-input"
          />
        </label>
        <Button type="submit" disabled={!verificationId.trim()}>Provjeri</Button>
      </form>
      <p className="mt-6 text-sm">
        <Link className="text-brand underline" to="/courses">Javni katalog programa</Link>
      </p>
    </main>
  );
}
