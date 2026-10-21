import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, type JSX, useState } from "react";

import { Button } from "@/components/ui/button";
import { createSchemeItem, fetchSchemeItems, transitionSchemeItem, type SchemeExamItem } from "@/lib/exam-api";

const STATUS_LABEL: Record<SchemeExamItem["status"], string> = {
  DRAFT: "Nacrt",
  REVIEW: "Pregled",
  APPROVED: "Odobreno",
  RETIRED: "Povučeno",
};

/** Staff item bank. Correct keys stay on this screen and are never sent to the learner or the AI tutor. */
export default function ItemBankPage(): JSX.Element {
  const queryClient = useQueryClient();
  const [schemeId, setSchemeId] = useState("");
  const [domainCode, setDomainCode] = useState("");
  const [stem, setStem] = useState("");
  const [itemType, setItemType] = useState<"SINGLE_CHOICE" | "MULTIPLE_CHOICE">("SINGLE_CHOICE");
  const [choiceA, setChoiceA] = useState("");
  const [choiceB, setChoiceB] = useState("");
  const itemsQ = useQuery({
    queryKey: ["staff", "exam-items", schemeId],
    queryFn: () => fetchSchemeItems(schemeId),
    enabled: schemeId.length > 0,
  });
  const createM = useMutation({
    mutationFn: () =>
      createSchemeItem({
        schemeId,
        stem,
        itemType,
        domainCode,
        competenceIds: [],
        choices: [
          { choiceKey: "A", text: choiceA, isCorrect: true },
          { choiceKey: "B", text: choiceB, isCorrect: itemType === "MULTIPLE_CHOICE" },
        ],
      }),
    onSuccess: () => {
      setStem("");
      void queryClient.invalidateQueries({ queryKey: ["staff", "exam-items", schemeId] });
    },
  });
  const transitionM = useMutation({
    mutationFn: (input: { itemId: string; toStatus: SchemeExamItem["status"] }) =>
      transitionSchemeItem(input.itemId, input.toStatus),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["staff", "exam-items", schemeId] }),
  });

  function onCreate(event: FormEvent) {
    event.preventDefault();
    createM.mutate();
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10" data-testid="exam-item-bank-page" aria-labelledby="item-bank-heading">
      <h1 id="item-bank-heading" className="text-2xl font-bold text-text-primary">Baza ispitnih stavki</h1>
      <p className="mt-3 rounded-lg border border-amber-300/50 bg-amber-50/60 p-3 text-sm text-text-secondary">
        Stavke i ključevi ostaju povjerljivi. Ne vraćaju se polazniku izvan aktivne sesije i ne koriste se u AI tutoru. Autor ne odobrava sopstvenu stavku.
      </p>
      <p className="mt-3 text-sm text-text-secondary">Tok: nacrt, pregled, odobreno, povučeno. Odobrenje radi član tehničkog odbora koji nije autor.</p>
      <form className="mt-6 space-y-3" onSubmit={onCreate} aria-labelledby="item-draft-heading">
        <h2 id="item-draft-heading" className="text-lg font-semibold text-text-primary">Nova stavka</h2>
        <label className="block text-sm text-text-primary" htmlFor="scheme-id">Šema (identifikator)
          <input id="scheme-id" className="mt-1 w-full rounded border border-border px-3 py-2" value={schemeId} onChange={(event) => setSchemeId(event.target.value)} required autoComplete="off" />
        </label>
        <label className="block text-sm text-text-primary" htmlFor="domain-code">Domena
          <input id="domain-code" className="mt-1 w-full rounded border border-border px-3 py-2" value={domainCode} onChange={(event) => setDomainCode(event.target.value)} required />
        </label>
        <label className="block text-sm text-text-primary" htmlFor="item-type">Tip
          <select id="item-type" className="mt-1 w-full rounded border border-border px-3 py-2" value={itemType} onChange={(event) => setItemType(event.target.value as "SINGLE_CHOICE" | "MULTIPLE_CHOICE")}>
            <option value="SINGLE_CHOICE">Jedan tačan odgovor</option>
            <option value="MULTIPLE_CHOICE">Više tačnih odgovora</option>
          </select>
        </label>
        <label className="block text-sm text-text-primary" htmlFor="item-stem">Tekst stavke
          <textarea id="item-stem" className="mt-1 w-full rounded border border-border px-3 py-2" value={stem} onChange={(event) => setStem(event.target.value)} required rows={3} />
        </label>
        <label className="block text-sm text-text-primary" htmlFor="choice-a">Odgovor A (tačan)
          <input id="choice-a" className="mt-1 w-full rounded border border-border px-3 py-2" value={choiceA} onChange={(event) => setChoiceA(event.target.value)} required />
        </label>
        <label className="block text-sm text-text-primary" htmlFor="choice-b">Odgovor B
          <input id="choice-b" className="mt-1 w-full rounded border border-border px-3 py-2" value={choiceB} onChange={(event) => setChoiceB(event.target.value)} required />
        </label>
        <Button type="submit" disabled={createM.isPending}>Sačuvaj nacrt</Button>
        {createM.isError ? <p role="alert" className="text-sm text-text-secondary">Nacrt nije sačuvan. Provjerite šemu i ovlaštenje.</p> : null}
      </form>
      <section className="mt-8" aria-labelledby="item-list-heading">
        <h2 id="item-list-heading" className="text-lg font-semibold text-text-primary">Stavke šeme</h2>
        {itemsQ.isPending && schemeId ? <p role="status" className="mt-3 text-sm">Učitavanje stavki…</p> : null}
        {itemsQ.isError ? <p role="alert" className="mt-3 text-sm">Baza stavki trenutno nije dostupna.</p> : null}
        <ul className="mt-3 space-y-3">
          {(itemsQ.data ?? []).map((item) => (
            <li key={item.id} className="rounded-lg border border-border/50 p-3">
              <p className="font-medium text-text-primary">{item.stem}</p>
              <p className="text-sm text-text-secondary">{item.domainCode} · v{item.version} · izloženost {item.exposureCount} · {STATUS_LABEL[item.status]}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {item.status === "DRAFT" ? <Button type="button" size="sm" onClick={() => transitionM.mutate({ itemId: item.id, toStatus: "REVIEW" })}>Pošalji na pregled</Button> : null}
                {item.status === "REVIEW" ? <Button type="button" size="sm" onClick={() => transitionM.mutate({ itemId: item.id, toStatus: "APPROVED" })}>Odobri</Button> : null}
                {item.status === "APPROVED" ? <Button type="button" size="sm" onClick={() => transitionM.mutate({ itemId: item.id, toStatus: "RETIRED" })}>Povuci</Button> : null}
              </div>
            </li>
          ))}
        </ul>
        {itemsQ.data && itemsQ.data.length === 0 ? <p className="mt-3 text-sm text-text-secondary">Nema stavki za unesenu šemu.</p> : null}
      </section>
    </main>
  );
}
