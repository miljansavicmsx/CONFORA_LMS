import { type FormEvent, type JSX, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";

import { Button } from "@/components/ui/button";
import {
  formatPersonnelDate,
  personnelStatusLabel,
  searchPublicPersonnelRegistry,
  type PublicPersonnelRecord,
} from "@/lib/personnel-public";

/** Public personnel registry. Name search returns only records with listing consent. */
export default function PublicRegistryPage(): JSX.Element {
  const [params] = useSearchParams();
  const [name, setName] = useState(() => params.get("name") ?? "");
  const [number, setNumber] = useState(() => params.get("number") ?? "");
  const [rows, setRows] = useState<readonly PublicPersonnelRecord[] | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const initialName = params.get("name")?.trim() ?? "";
    const initialNumber = params.get("number")?.trim() ?? "";
    if (!initialName && !initialNumber) {
      return;
    }
    let active = true;
    setBusy(true);
    void searchPublicPersonnelRegistry({
      ...(initialName ? { name: initialName } : {}),
      ...(initialNumber ? { number: initialNumber } : {}),
    }).then((result) => {
      if (!active) return;
      if (result.kind === "ok") {
        setRows(result.data);
        if (result.data.length === 0) {
          setMessage("Nema zapisa za ovu pretragu. Pretraga po imenu prikazuje samo certifikate uz pristanak za registar.");
        }
      } else if (result.kind === "rate_limited") {
        setMessage("Previše zahtjeva. Pokušajte ponovo za koji trenutak.");
      } else {
        setMessage("Registar trenutno nije dostupan.");
      }
    }).catch(() => {
      if (active) setMessage("Registar trenutno nije dostupan.");
    }).finally(() => {
      if (active) setBusy(false);
    });
    return () => { active = false; };
  }, [params]);

  async function onSearch(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    setRows(null);
    try {
      const result = await searchPublicPersonnelRegistry({
        ...(name.trim() ? { name } : {}),
        ...(number.trim() ? { number } : {}),
      });
      if (result.kind === "ok") {
        setRows(result.data);
        if (result.data.length === 0) {
          setMessage("Nema zapisa za ovu pretragu. Pretraga po imenu prikazuje samo certifikate uz pristanak za registar.");
        }
      } else if (result.kind === "rate_limited") {
        setMessage("Previše zahtjeva. Pokušajte ponovo za koji trenutak.");
      } else {
        setMessage("Registar trenutno nije dostupan.");
      }
    } catch {
      setMessage("Registar trenutno nije dostupan.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10" data-testid="public-registry-page" aria-labelledby="registry-heading">
      <h1 id="registry-heading" className="text-2xl font-bold text-text-primary">Javni registar certifikata osoblja</h1>
      <p className="mt-2 text-sm text-text-secondary">
        Pregled bez prijave. Prikazuju se samo ime, šema, status i datumi. Pretraga po imenu zahtijeva pristanak nosioca. Broj certifikata uvijek pokazuje ime radi provjere isprave koja je predočena.
      </p>
      <form className="mt-6 space-y-3" onSubmit={(event) => void onSearch(event)} aria-labelledby="registry-search-heading">
        <h2 id="registry-search-heading" className="text-lg font-semibold text-text-primary">Pretraga</h2>
        <label className="block text-sm text-text-primary" htmlFor="registry-name">
          Ime nosioca
          <input
            id="registry-name"
            className="mt-1 w-full rounded border border-border px-3 py-2"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            data-testid="registry-name-input"
          />
        </label>
        <label className="block text-sm text-text-primary" htmlFor="registry-number">
          Broj certifikata
          <input
            id="registry-number"
            className="mt-1 w-full rounded border border-border px-3 py-2 font-mono"
            value={number}
            onChange={(event) => setNumber(event.target.value)}
            autoComplete="off"
            data-testid="registry-number-input"
          />
        </label>
        <Button type="submit" disabled={busy || (!name.trim() && !number.trim())}>
          {busy ? "Pretraga…" : "Pretraži registar"}
        </Button>
      </form>
      {message ? <p className="mt-4 text-sm text-text-secondary" role="status">{message}</p> : null}
      {rows && rows.length > 0 ? (
        <table className="mt-6 w-full text-sm" data-testid="registry-results">
          <caption className="mb-2 text-left font-medium text-text-primary">Rezultati javnog registra</caption>
          <thead>
            <tr>
              <th scope="col" className="text-left">Ime</th>
              <th scope="col" className="text-left">Šema</th>
              <th scope="col" className="text-left">Status</th>
              <th scope="col" className="text-left">Izdato</th>
              <th scope="col" className="text-left">Ističe</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.certificateNumber}>
                <th scope="row" className="text-left font-normal">{row.holderName ?? "—"}</th>
                <td>{row.scheme}</td>
                <td>{personnelStatusLabel(row.status)}</td>
                <td>{formatPersonnelDate(row.issuedAt)}</td>
                <td>{formatPersonnelDate(row.expiresAt)}</td>
                <td>
                  <Link className="text-brand underline" to={`/verify/${encodeURIComponent(row.certificateNumber)}`}>
                    Provjeri
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
      <p className="mt-6 text-sm">
        <Link className="text-brand underline" to="/verify">Provjera jednog certifikata</Link>
      </p>
    </main>
  );
}
