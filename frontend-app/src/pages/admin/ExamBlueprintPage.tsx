import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, type JSX, useState } from "react";

import { Button } from "@/components/ui/button";
import { createBlueprint, fetchBlueprints, openStandardSetting, setBlueprintDomains } from "@/lib/exam-api";

/** Blueprint and Angoff standard setting. The cut score is a human-approved panel record. */
export default function ExamBlueprintPage(): JSX.Element {
  const queryClient = useQueryClient();
  const [schemeVersionId, setSchemeVersionId] = useState("");
  const [title, setTitle] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [retakeWindowDays, setRetakeWindowDays] = useState("90");
  const [domainA, setDomainA] = useState("A");
  const [domainB, setDomainB] = useState("B");
  const [note, setNote] = useState("");
  const [activeId, setActiveId] = useState("");
  const blueprintsQ = useQuery({ queryKey: ["staff", "exam-blueprints"], queryFn: fetchBlueprints });
  const createM = useMutation({
    mutationFn: async () => {
      const created = await createBlueprint({
        schemeVersionId,
        title,
        durationSeconds: Number(durationMinutes) * 60,
        retakeWindowDays: Number(retakeWindowDays),
      });
      await setBlueprintDomains(created.blueprintId, [
        { domainCode: domainA, title: `Domena ${domainA}`, weightBasisPoints: 5000, itemCount: 1 },
        { domainCode: domainB, title: `Domena ${domainB}`, weightBasisPoints: 5000, itemCount: 1 },
      ]);
      return created.blueprintId;
    },
    onSuccess: (blueprintId) => {
      setActiveId(blueprintId);
      void queryClient.invalidateQueries({ queryKey: ["staff", "exam-blueprints"] });
    },
  });
  const settingM = useMutation({
    mutationFn: () => openStandardSetting(activeId, note),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["staff", "exam-blueprints"] }),
  });

  function onCreate(event: FormEvent) {
    event.preventDefault();
    createM.mutate();
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10" data-testid="exam-blueprint-page" aria-labelledby="blueprint-heading">
      <h1 id="blueprint-heading" className="text-2xl font-bold text-text-primary">Plan ispita i standard</h1>
      <p className="mt-3 text-sm text-text-secondary">
        Težine domena su u baznim poenima i zbir je 10 000. Prag prolaza dolazi iz Angoff zapisa: članovi panela ocjenjuju odobrene stavke, a čovjek odobrava prag. Najkraći razmak ponovnog polaganja je 90 dana.
      </p>
      <form className="mt-6 space-y-3" onSubmit={onCreate} aria-labelledby="blueprint-form-heading">
        <h2 id="blueprint-form-heading" className="text-lg font-semibold">Novi plan</h2>
        <label className="block text-sm" htmlFor="scheme-version">Verzija šeme
          <input id="scheme-version" className="mt-1 w-full rounded border border-border px-3 py-2" value={schemeVersionId} onChange={(event) => setSchemeVersionId(event.target.value)} required autoComplete="off" />
        </label>
        <label className="block text-sm" htmlFor="blueprint-title">Naziv
          <input id="blueprint-title" className="mt-1 w-full rounded border border-border px-3 py-2" value={title} onChange={(event) => setTitle(event.target.value)} required />
        </label>
        <label className="block text-sm" htmlFor="duration-minutes">Trajanje (minute)
          <input id="duration-minutes" className="mt-1 w-full rounded border border-border px-3 py-2" inputMode="numeric" value={durationMinutes} onChange={(event) => setDurationMinutes(event.target.value)} required />
        </label>
        <label className="block text-sm" htmlFor="retake-days">Razmak ponovnog polaganja (dani)
          <input id="retake-days" className="mt-1 w-full rounded border border-border px-3 py-2" inputMode="numeric" min={90} value={retakeWindowDays} onChange={(event) => setRetakeWindowDays(event.target.value)} required />
        </label>
        <label className="block text-sm" htmlFor="domain-a">Šifra domene A
          <input id="domain-a" className="mt-1 w-full rounded border border-border px-3 py-2" value={domainA} onChange={(event) => setDomainA(event.target.value)} required />
        </label>
        <label className="block text-sm" htmlFor="domain-b">Šifra domene B
          <input id="domain-b" className="mt-1 w-full rounded border border-border px-3 py-2" value={domainB} onChange={(event) => setDomainB(event.target.value)} required />
        </label>
        <Button type="submit" disabled={createM.isPending}>Sačuvaj plan</Button>
        {createM.isError ? <p role="alert" className="text-sm">Plan nije sačuvan. Težine, trajanje i razmak moraju biti u dozvoljenom opsegu.</p> : null}
      </form>
      <form
        className="mt-8 space-y-3"
        aria-labelledby="angoff-heading"
        onSubmit={(event) => {
          event.preventDefault();
          settingM.mutate();
        }}
      >
        <h2 id="angoff-heading" className="text-lg font-semibold">Angoff zapis</h2>
        <label className="block text-sm" htmlFor="blueprint-id">Plan
          <input id="blueprint-id" className="mt-1 w-full rounded border border-border px-3 py-2" value={activeId} onChange={(event) => setActiveId(event.target.value)} required />
        </label>
        <label className="block text-sm" htmlFor="angoff-note">Bilješka panela
          <textarea id="angoff-note" className="mt-1 w-full rounded border border-border px-3 py-2" value={note} onChange={(event) => setNote(event.target.value)} required rows={3} />
        </label>
        <Button type="submit" disabled={settingM.isPending}>Otvori standard-setting</Button>
        {settingM.isSuccess ? <p role="status" className="text-sm">Zapis je otvoren. Ocjene panela i odobrenje praga rade se na serveru, od strane ljudi.</p> : null}
        {settingM.isError ? <p role="alert" className="text-sm">Zapis nije otvoren.</p> : null}
      </form>
      <section className="mt-8" aria-labelledby="blueprint-list-heading">
        <h2 id="blueprint-list-heading" className="text-lg font-semibold">Postojeći planovi</h2>
        {blueprintsQ.isError ? <p role="alert" className="mt-3 text-sm">Planovi trenutno nisu dostupni.</p> : null}
        <ul className="mt-3 space-y-2">
          {(blueprintsQ.data ?? []).map((row) => (
            <li key={row.id} className="rounded-lg border border-border/50 p-3">
              <p className="font-medium">{row.title}</p>
              <p className="text-sm text-text-secondary">{row.schemeCode} · {row.status} · prag {row.cutScoreBasisPoints ?? "nije postavljen"} · ponovo nakon {row.retakeWindowDays} dana</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
