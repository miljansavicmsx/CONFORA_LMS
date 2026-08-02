/**
 * Public Equitable Access Statement — ISO §3.22 / WCAG 2.2 AA.
 */
import { useMutation, useQuery } from "@tanstack/react-query";
import { type FormEvent, type JSX, useState } from "react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  fetchEquitableAccessStatement,
  submitAccessibilityFeedback,
} from "@/lib/api-accommodations";

const sectionClass = "mx-auto max-w-3xl px-4 py-12";

export default function EquitableAccessPage(): JSX.Element {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["public", "equitable-access"],
    queryFn: fetchEquitableAccessStatement,
  });

  const [fbName, setFbName] = useState("");
  const [fbEmail, setFbEmail] = useState("");
  const [fbSubject, setFbSubject] = useState("");
  const [fbBody, setFbBody] = useState("");
  const [fbDone, setFbDone] = useState(false);

  const feedbackMutation = useMutation({
    mutationFn: () =>
      submitAccessibilityFeedback({
        subjectLine: fbSubject,
        description: fbBody,
        complainantName: fbName || undefined,
        complainantEmail: fbEmail || undefined,
      }),
    onSuccess: () => setFbDone(true),
  });

  const onFeedback = (e: FormEvent): void => {
    e.preventDefault();
    feedbackMutation.mutate();
  };

  if (isLoading) {
    return (
      <section aria-labelledby="equitable-access-heading" className={sectionClass}>
        <h1 id="equitable-access-heading" className="sr-only">
          Equitable Access Statement
        </h1>
        <p className="text-text-secondary">Učitavanje…</p>
      </section>
    );
  }

  if (isError || !data) {
    return (
      <section aria-labelledby="equitable-access-heading" className={sectionClass}>
        <h1 id="equitable-access-heading" className="text-2xl font-bold">
          Equitable Access Statement
        </h1>
        <p className="mt-4 text-text-secondary">Statement trenutno nije dostupan. Pokušajte kasnije.</p>
      </section>
    );
  }

  return (
    <section aria-labelledby="equitable-access-heading" className={sectionClass}>
      <header className="mb-8 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand">ISO/IEC 17024 · WCAG 2.2 AA</p>
        <h1 id="equitable-access-heading" className="text-3xl font-bold text-text-primary">
          {data.title}
        </h1>
        <p className="text-text-secondary">{data.commitment}</p>
      </header>

      <section className="mb-8 space-y-3">
        <h2 className="text-lg font-semibold">Obuhvaćeni standardi</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-text-secondary">
          {data.standards.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </section>

      <section className="mb-8 rounded-xl border border-border/50 bg-surface-secondary/40 p-5">
        <h2 className="text-lg font-semibold">Trenutna razina pristupačnosti</h2>
        <p className="mt-2 text-sm text-text-secondary">{data.accessibilityLevel}</p>
        {data.latestCiReportUrl ? (
          <p className="mt-2 text-sm">
            <a href={data.latestCiReportUrl} className="text-brand underline" target="_blank" rel="noreferrer">
              Zadnji CI izvještaj pristupačnosti
            </a>
            {data.latestCiRunAt ? (
              <span className="text-text-muted"> · {new Date(data.latestCiRunAt).toLocaleDateString("bs-BA")}</span>
            ) : null}
          </p>
        ) : (
          <p className="mt-2 text-sm text-text-muted">CI izvještaj će biti objavljen nakon prve pipeline run.</p>
        )}
      </section>

      <section className="mb-8 space-y-2">
        <h2 className="text-lg font-semibold">Poznata ograničenja</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-text-secondary">
          {data.knownLimitations.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      </section>

      <section className="mb-8 space-y-3 rounded-xl border border-border/50 p-5">
        <h2 className="text-lg font-semibold">Zahtjev za razumnu prilagodbu (§9.2.2 e)</h2>
        <p className="text-sm text-text-secondary">{data.accommodationChannel.publicApplyNote}</p>
        <p className="text-sm">
          <Link to="/login" className="text-brand underline">
            Prijavite se
          </Link>{" "}
          i otvorite{" "}
          <Link to="/me/accommodations" className="text-brand underline">
            portal prilagodbi
          </Link>
          , ili pišite na{" "}
          <a href={`mailto:${data.accommodationChannel.email}`} className="text-brand underline">
            {data.accommodationChannel.email}
          </a>
          .
        </p>
      </section>

      <section id="feedback" className="mb-8 space-y-4 rounded-xl border border-border/50 p-5">
        <h2 className="text-lg font-semibold">Povratne informacije o pristupačnosti</h2>
        <p className="text-sm text-text-secondary">
          Prijave se usmjeravaju na {data.accessibilityFeedbackChannel.routedTo} (odvojeno od odluka o certifikaciji).
        </p>
        {fbDone ? (
          <p className="text-sm text-green-700 dark:text-green-400">Hvala — vaša prijava je zaprimljena.</p>
        ) : (
          <form onSubmit={onFeedback} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="fb-name">Ime (opcionalno)</Label>
                <Input id="fb-name" value={fbName} onChange={(e) => setFbName(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="fb-email">E-pošta</Label>
                <Input id="fb-email" type="email" required value={fbEmail} onChange={(e) => setFbEmail(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="fb-subject">Predmet</Label>
              <Input id="fb-subject" required value={fbSubject} onChange={(e) => setFbSubject(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="fb-body">Opis problema</Label>
              <textarea
                id="fb-body"
                required
                rows={4}
                className="focus-visible:ring-ring/50 w-full rounded-xl border border-border/60 bg-surface-secondary/80 px-3 py-2 text-sm outline-none focus-visible:ring-2"
                value={fbBody}
                onChange={(e) => setFbBody(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={feedbackMutation.isPending}>
              Pošalji povratnu informaciju
            </Button>
          </form>
        )}
      </section>

      <footer className="border-t border-border/40 pt-6 text-xs text-text-muted">
        <p>
          Zadnji pregled: {data.lastReviewedAt ? new Date(data.lastReviewedAt).toLocaleDateString("bs-BA") : "—"} ·
          Kadenca: {data.reviewCadence}
          {data.nextReviewDate ? ` · Sljedeći pregled: ${data.nextReviewDate}` : ""}
          {data.documentVersion ? ` · ver. ${data.documentVersion}` : ""}
        </p>
      </footer>
    </section>
  );
}
