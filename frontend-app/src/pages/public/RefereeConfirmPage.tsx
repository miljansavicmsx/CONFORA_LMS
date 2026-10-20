import { type FormEvent, type JSX, useState } from "react";
import { useParams } from "react-router";

import { Button } from "@/components/ui/button";
import { respondAsReferee } from "@/lib/case-public";

/** Tokenised referee link. No login. Confirmation does not satisfy the requirement. */
export default function RefereeConfirmPage(): JSX.Element {
  const { token } = useParams();
  const [facts, setFacts] = useState("");
  const [discrepancies, setDiscrepancies] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!token) {
      setError("Veza nije ispravna.");
      return;
    }
    try {
      const result = await respondAsReferee(token, {
        accept: true,
        confirmedFacts: facts,
        ...(discrepancies.trim() ? { discrepancies: discrepancies.trim() } : {}),
      });
      setError(null);
      if (result.requirementsSatisfied !== false) {
        setError("Odgovor nije prihvaćen kao zatvaranje uslova.");
        return;
      }
      setNotice(
        "Odgovor je zabilježen. Certifikacijsko tijelo i dalje ocjenjuje relevantnost i vjerodostojnost.",
      );
    } catch {
      setNotice(null);
      setError("Odgovor nije sačuvan. Veza je možda istekla ili je već iskorištena.");
    }
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-10" data-testid="referee-confirm-page" aria-labelledby="referee-heading">
      <h1 id="referee-heading" className="text-2xl font-bold text-text-primary">Potvrda činjenica o iskustvu</h1>
      <p className="mt-3 text-sm text-text-secondary">
        Veza ne traži prijavu i ima rok. Vaša potvrda ne znači da je uslov šeme ispunjen.
      </p>
      <form className="mt-6 space-y-3" onSubmit={(event) => void onSubmit(event)}>
        <label className="block text-sm" htmlFor="referee-facts">Činjenice koje potvrđujete
          <textarea id="referee-facts" className="mt-1 w-full rounded border border-border px-3 py-2" rows={4} value={facts} onChange={(event) => setFacts(event.target.value)} required />
        </label>
        <label className="block text-sm" htmlFor="referee-gap">Neslaganja, ako ih ima
          <textarea id="referee-gap" className="mt-1 w-full rounded border border-border px-3 py-2" rows={3} value={discrepancies} onChange={(event) => setDiscrepancies(event.target.value)} />
        </label>
        <Button type="submit">Pošalji potvrdu</Button>
      </form>
      {notice ? <p className="mt-4 text-sm" role="status">{notice}</p> : null}
      {error ? <p className="mt-4 text-sm" role="alert">{error}</p> : null}
    </main>
  );
}
