/**
 * Candidate accommodation requests — ISO §9.2.2 e / §3.22.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, type JSX, useState } from "react";
import { Link } from "react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  fetchMyAccommodations,
  submitAccommodationRequest,
  type AccommodationRequestType,
} from "@/lib/api-accommodations";

const TYPES: { value: AccommodationRequestType; label: string }[] = [
  { value: "EXTRA_TIME", label: "Dodatno vrijeme na ispitu" },
  { value: "SCREEN_READER_COMPAT", label: "Kompatibilnost sa čitačem ekrana" },
  { value: "LARGE_PRINT", label: "Uvećani prikaz (veliki font)" },
  { value: "SEPARATE_ROOM", label: "Odvojena prostorija" },
  { value: "SIGN_LANGUAGE", label: "Prevoditelj znakovnog jezika" },
  { value: "OTHER", label: "Ostalo" },
];

export default function MyAccommodationsPage(): JSX.Element {
  const qc = useQueryClient();
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["me", "accommodations"],
    queryFn: fetchMyAccommodations,
  });

  const [requestType, setRequestType] = useState<AccommodationRequestType>("EXTRA_TIME");
  const [detailsText, setDetailsText] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [applicationId, setApplicationId] = useState("");

  const submitMutation = useMutation({
    mutationFn: () =>
      submitAccommodationRequest({
        requestType,
        detailsText,
        evidenceUrl: evidenceUrl.trim() || null,
        applicationId: applicationId.trim() || null,
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["me", "accommodations"] });
      setDetailsText("");
      setEvidenceUrl("");
    },
  });

  const onSubmit = (e: FormEvent): void => {
    e.preventDefault();
    submitMutation.mutate();
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-text-primary">Prilagodbe ispita i certifikacije</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Zahtjevi se pregledavaju od strane administracije za obuku (STAFF_TRAINADM), uz savjetodavnu ulogu COM_IMP.
          Odlučitelj certifikacije ne može odobriti vašu prilagodbu.{" "}
          <Link to="/public/equitable-access" className="text-brand underline">
            Equitable Access Statement
          </Link>
        </p>
      </header>

      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-border/50 bg-surface-secondary/30 p-5">
        <h2 className="text-lg font-semibold">Novi zahtjev</h2>
        <div className="space-y-2">
          <Label htmlFor="acc-type">Vrsta prilagodbe</Label>
          <select
            id="acc-type"
            className="w-full rounded-xl border border-border/60 bg-surface-secondary/80 px-3 py-2 text-sm"
            value={requestType}
            onChange={(e) => setRequestType(e.target.value as AccommodationRequestType)}
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="acc-details">Opis potrebe i tražene mjere</Label>
          <textarea
            id="acc-details"
            required
            minLength={10}
            rows={4}
            className="focus-visible:ring-ring/50 w-full rounded-xl border border-border/60 bg-surface-secondary/80 px-3 py-2 text-sm outline-none focus-visible:ring-2"
            value={detailsText}
            onChange={(e) => setDetailsText(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="acc-evidence">URL dokaza (opcionalno)</Label>
          <Input id="acc-evidence" type="url" value={evidenceUrl} onChange={(e) => setEvidenceUrl(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="acc-app">ID prijave za certifikaciju (opcionalno)</Label>
          <Input id="acc-app" value={applicationId} onChange={(e) => setApplicationId(e.target.value)} />
        </div>
        <Button type="submit" disabled={submitMutation.isPending}>
          Pošalji zahtjev
        </Button>
      </form>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Moji zahtjevi</h2>
        {isLoading ? (
          <p className="text-sm text-text-muted">Učitavanje…</p>
        ) : requests.length === 0 ? (
          <p className="text-sm text-text-muted">Nema podnesenih zahtjeva.</p>
        ) : (
          <ul className="space-y-3">
            {requests.map((r) => (
              <li
                key={r.id}
                data-testid="accommodation-request"
                className="rounded-xl border border-border/50 p-4 text-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{r.requestType}</Badge>
                  <Badge data-testid="accommodation-status">{r.status}</Badge>
                  <span className="font-mono text-xs text-text-muted" data-testid="accommodation-request-id">
                    {r.id}
                  </span>
                  <span className="text-text-muted">{new Date(r.requestedAt).toLocaleString("bs-BA")}</span>
                </div>
                <p className="mt-2 text-text-secondary">{r.detailsText}</p>
                {r.decisionRationale ? (
                  <p className="mt-2 text-xs text-text-muted">Odluka: {r.decisionRationale}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
