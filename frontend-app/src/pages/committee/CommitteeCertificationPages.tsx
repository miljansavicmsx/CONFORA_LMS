import { useMutation, useQuery } from "@tanstack/react-query";
import { type FormEvent, type JSX, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  fetchAssignedCases,
  fetchCommitteeCase,
  signConflictDeclaration,
  voteOnCase,
} from "@/lib/case-public";

export function CommitteeAssignedPage(): JSX.Element {
  const assigned = useQuery({ queryKey: ["committee", "assigned"], queryFn: fetchAssignedCases });
  return (
    <main className="mx-auto max-w-3xl px-4 py-10" data-testid="committee-assigned" aria-labelledby="assigned-heading">
      <h1 id="assigned-heading" className="text-2xl font-semibold">Komitet za certifikaciju</h1>
      <h2 className="mt-6 text-lg font-semibold">Dodijeljeni predmeti</h2>
      {(assigned.data ?? []).length === 0 ? (
        <p>Nema predmeta za prikaz.</p>
      ) : (
        <ul>
          {(assigned.data ?? []).map((row) => (
            <li key={row.caseId} data-testid="assigned-case">
              {row.caseId} — {row.phase}
              {row.assigned ? " (dodijeljeno)" : ""}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export function CommitteeReviewPage(): JSX.Element {
  const [caseId, setCaseId] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const review = useMutation({
    mutationFn: () => fetchCommitteeCase(caseId),
    onSuccess: (result) => {
      const titles = result.evidence.map((item) => item.title).join(", ");
      setNotice(titles.length > 0 ? titles : "Nema dokumenata u dosijeu.");
    },
    onError: () => {
      setNotice("Uvid je odbijen dok izjava o sukobu interesa nije potpisana bez sukoba.");
    },
  });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    review.mutate();
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10" data-testid="committee-review" aria-labelledby="review-heading">
      <h1 id="review-heading" className="text-2xl font-semibold">Komitet za certifikaciju</h1>
      <h2 className="mt-6 text-lg font-semibold">Pregled dokumenata</h2>
      <p>Izjava o sukobu interesa mora biti potpisana prije uvida.</p>
      <form className="mt-4 space-y-3" onSubmit={onSubmit}>
        <label className="block" htmlFor="review-case">
          Predmet
          <input id="review-case" className="mt-1 w-full border px-2 py-1" value={caseId} onChange={(event) => setCaseId(event.target.value)} required />
        </label>
        <Button type="submit">Prikaži dokumente</Button>
      </form>
      {notice ? <p role="status">{notice}</p> : null}
    </main>
  );
}

export function CommitteeConflictPage(): JSX.Element {
  const [caseId, setCaseId] = useState("");
  const [statement, setStatement] = useState("");
  const [hasConflict, setHasConflict] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const sign = useMutation({
    mutationFn: () => signConflictDeclaration(caseId, { hasConflict, statement }),
    onSuccess: (result) => {
      setNotice(result.hasConflict ? "Sukob je zapisan. Uvid i odluka su zatvoreni." : "Izjava bez sukoba je potpisana.");
    },
    onError: () => setNotice("Izjava nije sačuvana."),
  });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    sign.mutate();
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10" data-testid="committee-conflict" aria-labelledby="conflict-heading">
      <h1 id="conflict-heading" className="text-2xl font-semibold">Komitet za certifikaciju</h1>
      <h2 className="mt-6 text-lg font-semibold">Izjava o sukobu interesa</h2>
      <form className="mt-4 space-y-3" onSubmit={onSubmit}>
        <label className="block" htmlFor="conflict-case">
          Predmet
          <input id="conflict-case" className="mt-1 w-full border px-2 py-1" value={caseId} onChange={(event) => setCaseId(event.target.value)} required />
        </label>
        <label className="flex items-center gap-2" htmlFor="conflict-flag">
          <input id="conflict-flag" type="checkbox" checked={hasConflict} onChange={(event) => setHasConflict(event.target.checked)} />
          Imam sukob interesa
        </label>
        <label className="block" htmlFor="conflict-statement">
          Izjava
          <textarea id="conflict-statement" className="mt-1 w-full border px-2 py-1" value={statement} onChange={(event) => setStatement(event.target.value)} required minLength={3} />
        </label>
        <Button type="submit">Potpiši izjavu</Button>
      </form>
      {notice ? <p role="status">{notice}</p> : null}
    </main>
  );
}

export function CommitteeDecisionPage(): JSX.Element {
  const [caseId, setCaseId] = useState("");
  const [reasoning, setReasoning] = useState("");
  const [ballot, setBallot] = useState<"GRANT" | "DENY">("GRANT");
  const [notice, setNotice] = useState<string | null>(null);
  const vote = useMutation({
    mutationFn: () => voteOnCase(caseId, { ballot, reasoning }),
    onSuccess: (result) => setNotice(`Glas je zapisan. Faza: ${result.phase}. Odluku donosi čovjek.`),
    onError: () => setNotice("Glas nije zapisan. Potpisana izjava bez sukoba je uslov."),
  });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    vote.mutate();
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10" data-testid="committee-decision" aria-labelledby="decision-heading">
      <h1 id="decision-heading" className="text-2xl font-semibold">Komitet za certifikaciju</h1>
      <h2 className="mt-6 text-lg font-semibold">Odluka</h2>
      <p>AI ne donosi odluku o certifikaciji. Izjava o sukobu interesa mora biti potpisana prije odluke.</p>
      <form className="mt-4 space-y-3" onSubmit={onSubmit}>
        <label className="block" htmlFor="decision-case">
          Predmet
          <input id="decision-case" className="mt-1 w-full border px-2 py-1" value={caseId} onChange={(event) => setCaseId(event.target.value)} required />
        </label>
        <label className="block" htmlFor="decision-ballot">
          Glas
          <select id="decision-ballot" className="mt-1 w-full border px-2 py-1" value={ballot} onChange={(event) => setBallot(event.target.value === "DENY" ? "DENY" : "GRANT")}>
            <option value="GRANT">Odobriti</option>
            <option value="DENY">Odbiti</option>
          </select>
        </label>
        <label className="block" htmlFor="decision-reasoning">
          Obrazloženje
          <textarea id="decision-reasoning" className="mt-1 w-full border px-2 py-1" value={reasoning} onChange={(event) => setReasoning(event.target.value)} required minLength={3} />
        </label>
        <Button type="submit">Zapiši odluku</Button>
      </form>
      {notice ? <p role="status">{notice}</p> : null}
    </main>
  );
}
