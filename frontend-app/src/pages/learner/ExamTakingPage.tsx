import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type JSX, useEffect, useState } from "react";
import { Link, useParams } from "react-router";

import { Button } from "@/components/ui/button";
import {
  fetchExamSession,
  saveExamAnswers,
  startExamSession,
  submitExamSession,
  type CandidateExamItem,
} from "@/lib/exam-api";

function formatRemaining(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

/** Accessible exam player. The clock and the score are enforced on the server. */
export default function ExamTakingPage(): JSX.Element {
  const { sessionId = "" } = useParams();
  const queryClient = useQueryClient();
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const [ndaAccepted, setNdaAccepted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const sessionQ = useQuery({
    queryKey: ["me", "exam-session", sessionId],
    queryFn: () => fetchExamSession(sessionId),
    enabled: sessionId.length > 0,
    refetchInterval: (query) => (query.state.data?.status === "IN_PROGRESS" ? 15_000 : false),
  });
  useEffect(() => {
    const items = sessionQ.data?.items ?? [];
    if (items.length === 0) {
      return;
    }
    setAnswers((current) => {
      const next = { ...current };
      for (const item of items) {
        if (!next[item.id]) {
          next[item.id] = [...item.selectedKeys];
        }
      }
      return next;
    });
  }, [sessionQ.data]);

  const startM = useMutation({
    mutationFn: () => startExamSession(sessionId),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["me", "exam-session", sessionId] }),
  });
  const saveM = useMutation({
    mutationFn: (items: readonly CandidateExamItem[]) =>
      saveExamAnswers(
        sessionId,
        items.map((item) => ({ itemId: item.id, selectedKeys: answers[item.id] ?? [] })),
      ),
  });
  const submitM = useMutation({
    mutationFn: () => submitExamSession(sessionId),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["me", "exam-session", sessionId] }),
  });

  const session = sessionQ.data;
  const items = session?.items ?? [];
  const inProgress = session?.status === "IN_PROGRESS";

  function toggle(item: CandidateExamItem, key: string) {
    setAnswers((current) => {
      const selected = current[item.id] ?? [];
      const next =
        item.itemType === "SINGLE_CHOICE"
          ? [key]
          : selected.includes(key)
            ? selected.filter((value) => value !== key)
            : [...selected, key];
      return { ...current, [item.id]: next };
    });
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10" data-testid="exam-taking-page" aria-labelledby="exam-taking-heading">
      <a className="sr-only focus:not-sr-only focus:underline" href="#exam-submit">Preskoči na predaju</a>
      <h1 id="exam-taking-heading" className="text-2xl font-bold text-text-primary">Polaganje ispita</h1>
      <p className="mt-3 text-sm text-text-secondary">
        Krećite se tastaturom: Tab bira stavku, strelice biraju jedan odgovor, razmak uključuje višestruki odgovor. Vrijeme mjeri server. Istek čuva sačuvane odgovore i boduje ispit.
      </p>
      <p className="mt-3 text-sm" role="status" aria-live="polite" aria-atomic="true" data-testid="exam-timer">
        Preostalo vrijeme: {inProgress ? formatRemaining(session?.remainingSeconds ?? 0) : "čeka početak"}
      </p>
      {sessionQ.isError ? <p role="alert" className="mt-4 text-sm">Sesija nije dostupna. Provjerite prijavu i rok.</p> : null}
      {!inProgress ? (
        <form
          className="mt-6 space-y-3"
          aria-labelledby="exam-ack-heading"
          onSubmit={(event) => {
            event.preventDefault();
            startM.mutate();
          }}
        >
          <h2 id="exam-ack-heading" className="text-lg font-semibold">Prije početka</h2>
          <p className="text-sm text-text-secondary">Identitet se ne snima. Nadzor je ljudski signal, ne automatska diskvalifikacija. Višefaktorska prijava je obavezna.</p>
          <label className="flex gap-2 text-sm" htmlFor="rules-accepted">
            <input id="rules-accepted" type="checkbox" checked={rulesAccepted} onChange={(event) => setRulesAccepted(event.target.checked)} />
            Prihvatam pravila ispita
          </label>
          <label className="flex gap-2 text-sm" htmlFor="nda-accepted">
            <input id="nda-accepted" type="checkbox" checked={ndaAccepted} onChange={(event) => setNdaAccepted(event.target.checked)} />
            Prihvatam obavezu povjerljivosti
          </label>
          <Button type="submit" disabled={!rulesAccepted || !ndaAccepted || startM.isPending}>Započni ispit</Button>
          {startM.isError ? <p role="alert" className="text-sm">Ispit nije započet. Pravila, povjerljivost i višefaktorska prijava moraju biti potvrđeni.</p> : null}
        </form>
      ) : null}
      {inProgress ? (
        <form
          className="mt-6 space-y-6"
          onSubmit={(event) => {
            event.preventDefault();
            submitM.mutate();
          }}
        >
          <ol className="space-y-6">
            {items.map((item, index) => (
              <li key={item.id}>
                <fieldset className="rounded-lg border border-border/50 p-3">
                  <legend className="px-1 font-medium">{index + 1}. {item.stem}</legend>
                  <div role={item.itemType === "SINGLE_CHOICE" ? "radiogroup" : "group"} aria-label={item.stem} className="mt-2 space-y-2">
                    {item.choices.map((choice) => {
                      const selected = (answers[item.id] ?? []).includes(choice.choiceKey);
                      const inputId = `${item.id}-${choice.choiceKey}`;
                      return (
                        <label key={choice.choiceKey} className="flex gap-2 text-sm" htmlFor={inputId}>
                          <input
                            id={inputId}
                            type={item.itemType === "SINGLE_CHOICE" ? "radio" : "checkbox"}
                            name={item.id}
                            checked={selected}
                            onChange={() => toggle(item, choice.choiceKey)}
                          />
                          {choice.text}
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              </li>
            ))}
          </ol>
          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="secondary" disabled={saveM.isPending} onClick={() => saveM.mutate(items)}>Sačuvaj odgovore</Button>
            <Button id="exam-submit" type="submit" disabled={submitM.isPending}>Predaj ispit</Button>
          </div>
          {saveM.isSuccess ? <p role="status" className="text-sm">Odgovori su sačuvani.</p> : null}
          {submitM.isSuccess ? (
            <p role="status" className="text-sm">
              Ispit je predan. Rezultat je privremen. <Link className="underline" to={`/dashboard/exams/sessions/${sessionId}/result`}>Pogledaj rezultat</Link>
            </p>
          ) : null}
          {submitM.isError ? <p role="alert" className="text-sm">Predaja nije uspjela. Pokušajte ponovo dok vrijeme teče.</p> : null}
        </form>
      ) : null}
    </main>
  );
}
