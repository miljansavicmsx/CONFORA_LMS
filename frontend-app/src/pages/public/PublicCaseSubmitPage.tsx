/**
 * Public intake for formal ISO complaints (no session).
 * F4-8c — canonical POST/GET /v1/public/complaints; publicReference only in UI.
 */

import { Loader2 } from "lucide-react";
import { type FormEvent, useState, type JSX } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { isNormalizedApiError } from "@/lib/api";
import {
  getPublicComplaintStatus,
  submitPublicComplaint,
  type CaseCategory,
  type PublicComplaintStatusResult,
} from "@/lib/api-grievances";

const CATEGORIES: { value: Exclude<CaseCategory, "appeal">; label: string }[] = [
  { value: "technical_support", label: "Tehnička podrška" },
  { value: "complaint", label: "Pritužba" },
  { value: "improvement_proposal", label: "Prijedlog poboljšanja" },
  { value: "training_proposal", label: "Prijedlog obuke" },
];

function formatSubmittedAt(iso: string | null | undefined): string {
  if (!iso) {
    return "—";
  }
  try {
    return new Intl.DateTimeFormat("hr-HR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function PublicCaseSubmitPage(): JSX.Element {
  const [category, setCategory] = useState<Exclude<CaseCategory, "appeal">>("complaint");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [hp, setHp] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState<{ publicReference: string; nextStep?: string } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [statusRef, setStatusRef] = useState("");
  const [statusBusy, setStatusBusy] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [statusResult, setStatusResult] = useState<PublicComplaintStatusResult | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (hp.trim()) {
      setErr("Neispravan zahtjev.");
      return;
    }
    setPending(true);
    try {
      const r = await submitPublicComplaint({
        category,
        subject: subject.trim(),
        description: description.trim(),
        submitterName: name.trim(),
        submitterEmail: email.trim(),
      });
      setDone({ publicReference: r.publicReference });
      setStatusRef(r.publicReference);
      setSubject("");
      setDescription("");
      setName("");
      setEmail("");
    } catch (ex: unknown) {
      if (isNormalizedApiError(ex)) {
        setErr(ex.details?.join(", ") ?? ex.message);
      } else if (ex instanceof Error) {
        setErr(ex.message);
      } else {
        setErr("Slanje nije uspjelo.");
      }
    } finally {
      setPending(false);
    }
  };

  async function onStatusLookup(e: FormEvent): Promise<void> {
    e.preventDefault();
    setStatusError(null);
    setStatusResult(null);
    const ref = statusRef.trim();
    if (!ref) {
      setStatusError("Unesite referencu predmeta.");
      return;
    }
    setStatusBusy(true);
    try {
      const result = await getPublicComplaintStatus(ref);
      setStatusResult(result);
    } catch (ex: unknown) {
      if (isNormalizedApiError(ex) && ex.status === 404) {
        setStatusError("Predmet s tom referencom nije pronađen.");
      } else if (isNormalizedApiError(ex)) {
        setStatusError(ex.details?.join(", ") ?? ex.message);
      } else if (ex instanceof Error) {
        setStatusError(ex.message);
      } else {
        setStatusError("Provjera statusa nije uspjela.");
      }
    } finally {
      setStatusBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface-primary px-4 py-12 text-text-primary">
      <div className="mx-auto max-w-lg">
        <h1 className="text-2xl font-bold tracking-tight">Podnesi predmet (javno)</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Bez korisničkog računa. Za žalbu na certifikacijsku odluku potrebna je prijava u sustav.
        </p>

        {done ? (
          <div className="mt-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-sm text-emerald-100">
            <p className="font-semibold">Predmet je zaprimljen.</p>
            <p className="mt-2 text-sm text-emerald-100/90">
              Referenca predmeta:{" "}
              <span className="font-mono text-emerald-50">{done.publicReference}</span>. Pohranite je za provjeru
              statusa.
            </p>
            {done.nextStep ? <p className="mt-3 text-xs text-emerald-200/80">{done.nextStep}</p> : null}
          </div>
        ) : (
          <form onSubmit={(e) => void handleSubmit(e)} className="mt-8 space-y-4">
            <input
              type="text"
              name="website"
              value={hp}
              onChange={(e) => setHp(e.target.value)}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden
            />
            {err ? <p className="text-sm text-red-400">{err}</p> : null}
            <div className="space-y-2">
              <Label>Kategorija</Label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Exclude<CaseCategory, "appeal">)}
                className="h-10 w-full rounded-md border border-border/60 bg-surface-secondary/80 px-3 text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pc-name">Ime i prezime</Label>
              <input
                id="pc-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-md border border-border/60 bg-surface-secondary/80 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pc-email">Email</Label>
              <input
                id="pc-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-md border border-border/60 bg-surface-secondary/80 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pc-sub">Predmet</Label>
              <input
                id="pc-sub"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                maxLength={500}
                className="w-full rounded-md border border-border/60 bg-surface-secondary/80 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pc-desc">Opis</Label>
              <textarea
                id="pc-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={6}
                className="w-full rounded-md border border-border/60 bg-surface-secondary/80 px-3 py-2 text-sm"
              />
            </div>
            <Button type="submit" disabled={pending} className="w-full sm:w-auto">
              {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Pošalji
            </Button>
          </form>
        )}

        <section className="mt-12 border-t border-border/40 pt-8" aria-labelledby="complaint-status-heading">
          <h2 id="complaint-status-heading" className="text-lg font-semibold">
            Provjera statusa predmeta
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Unesite referencu predmeta koju ste dobili nakon slanja.
          </p>
          <form onSubmit={(e) => void onStatusLookup(e)} className="mt-4 space-y-3">
            <div className="space-y-2">
              <Label htmlFor="complaint-status-ref">Referenca predmeta</Label>
              <input
                id="complaint-status-ref"
                value={statusRef}
                onChange={(e) => setStatusRef(e.target.value)}
                className="w-full rounded-md border border-border/60 bg-surface-secondary/80 px-3 py-2 text-sm font-mono"
                autoComplete="off"
              />
            </div>
            {statusError ? <p className="text-sm text-red-400">{statusError}</p> : null}
            <Button type="submit" variant="secondary" disabled={statusBusy}>
              {statusBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Provjeri status
            </Button>
          </form>
          {statusResult ? (
            <div className="mt-4 rounded-lg border border-border/50 bg-surface-secondary/50 p-4 text-sm">
              <p>
                <span className="text-text-muted">Referenca:</span>{" "}
                <span className="font-mono">{statusResult.publicReference}</span>
              </p>
              <p className="mt-2">
                <span className="text-text-muted">Status:</span> {statusResult.status}
              </p>
              <p className="mt-2">
                <span className="text-text-muted">Zaprimljeno:</span> {formatSubmittedAt(statusResult.submittedAt)}
              </p>
              {statusResult.nextStep ? (
                <p className="mt-2 text-text-secondary">{statusResult.nextStep}</p>
              ) : null}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
