/**
 * Javni kontakt (ISO Module 5) — bez prijave; CAPTCHA na slanju; do 5 priloga × 10 MiB (samo legacy alias).
 */

import HCaptcha from "@hcaptcha/react-hcaptcha";
import { type FormEvent, type JSX, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getPublicContactRequestStatus,
  isContactCanonicalEnabled,
  isNormalizedApiError,
  submitPublicContact,
  type PublicContactStatusResult,
} from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

const SITE_KEY = (import.meta.env.VITE_HCAPTCHA_SITEKEY ?? "").trim();
const CANONICAL_CONTACT = isContactCanonicalEnabled();

const CATEGORIES: { value: string; label: string }[] = [
  { value: "general", label: "Općenito / podrška polaznicima" },
  { value: "tech_support", label: "Tehnička podrška (sustav)" },
  { value: "new_training", label: "Novi program / osposobljavanje" },
  { value: "improvement", label: "Prijedlog poboljšanja (upravljanje)" },
  { value: "complaint", label: "Prigovor (ISO 9.9)" },
  { value: "appeal", label: "Žalba na odluku (ISO 9.8)" },
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

export default function ContactPage(): JSX.Element {
  const user = useAuthStore((s) => s.user);

  const captchaRef = useRef<HCaptcha>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const [category, setCategory] = useState("general");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [decisionType, setDecisionType] = useState("");
  const [decisionRef, setDecisionRef] = useState("");
  const [isAnonymousComplaint, setIsAnonymousComplaint] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ publicReference: string; nextStep?: string } | null>(null);

  const [statusRef, setStatusRef] = useState("");
  const [statusBusy, setStatusBusy] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [statusResult, setStatusResult] = useState<PublicContactStatusResult | null>(null);

  useEffect(() => {
    if (!user) return;
    if (user.full_name?.trim()) setName(user.full_name.trim());
    if (user.email?.trim()) setEmail(user.email.trim());
  }, [user]);

  function onCaptchaExpire(): void {
    setCaptchaToken(null);
  }

  async function onSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    if (!SITE_KEY) {
      setError("CAPTCHA nije konfiguriran (VITE_HCAPTCHA_SITEKEY).");
      return;
    }
    if (!captchaToken?.trim()) {
      setError("Potvrdite CAPTCHA.");
      return;
    }
    if (category === "complaint" && isAnonymousComplaint) {
      /* email opcionalno */
    } else if (!email.trim()) {
      setError("E-adresa je obavezna.");
      return;
    }
    if (!subject.trim() || !body.trim()) {
      setError("Predmet i poruka su obavezni.");
      return;
    }
    if (CANONICAL_CONTACT && files && files.length > 0) {
      setError("Prilozi trenutačno nisu podržani na kanonskom kontakt API-ju.");
      return;
    }
    if (!CANONICAL_CONTACT && files && files.length > 5) {
      setError("Najviše 5 priloga.");
      return;
    }

    setBusy(true);
    try {
      const data = await submitPublicContact({
        category,
        name,
        email,
        phone,
        subject,
        body,
        decisionType,
        decisionRef,
        isAnonymousComplaint,
        captchaToken: captchaToken.trim(),
        attachments: CANONICAL_CONTACT ? null : files,
      });
      setDone({
        publicReference: data.publicReference,
        ...(data.nextStep ? { nextStep: data.nextStep } : {}),
      });
      setStatusRef(data.publicReference);
      setCaptchaToken(null);
      captchaRef.current?.resetCaptcha();
      setSubject("");
      setBody("");
      setFiles(null);
      setDecisionType("");
      setDecisionRef("");
    } catch (err: unknown) {
      if (isNormalizedApiError(err)) {
        if (err.code === "VALIDATION_ERROR" && err.message === "ATTACHMENTS_NOT_SUPPORTED") {
          setError("Prilozi trenutačno nisu podržani.");
        } else {
          setError(err.details?.join(", ") ?? err.message);
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Slanje nije uspjelo.");
      }
      setCaptchaToken(null);
      captchaRef.current?.resetCaptcha();
    } finally {
      setBusy(false);
    }
  }

  async function onStatusLookup(e: FormEvent): Promise<void> {
    e.preventDefault();
    setStatusError(null);
    setStatusResult(null);
    const ref = statusRef.trim();
    if (!ref) {
      setStatusError("Unesite referencu prijave.");
      return;
    }
    setStatusBusy(true);
    try {
      const result = await getPublicContactRequestStatus(ref);
      setStatusResult(result);
    } catch (err: unknown) {
      if (isNormalizedApiError(err) && err.status === 404) {
        setStatusError("Prijava s tom referencom nije pronađena.");
      } else if (isNormalizedApiError(err)) {
        setStatusError(err.details?.join(", ") ?? err.message);
      } else if (err instanceof Error) {
        setStatusError(err.message);
      } else {
        setStatusError("Provjera statusa nije uspjela.");
      }
    } finally {
      setStatusBusy(false);
    }
  }

  return (
    <section aria-labelledby="contact-heading" className="mx-auto max-w-2xl px-6 py-12">
      <h1 id="contact-heading" className="text-3xl font-bold text-text-primary">
        Kontakt
      </h1>
      <p className="mt-2 text-sm text-text-secondary">
        Javni obrazac bez obveznog računa. Uvjerite sustav da niste robot prije slanja. Prijavljeni korisnici
        mogu automatski biti popunjeni kontakt podaci.
      </p>

      {done ? (
        <div className="mt-8 rounded-lg border border-border bg-background-secondary p-6 text-text-primary">
          <p className="font-semibold">Prijava je zaprimljena.</p>
          <p className="mt-2 text-sm text-text-secondary">
            Referenca prijave:{" "}
            <span className="font-mono text-text-primary">{done.publicReference}</span>. Pohranite je za provjeru
            statusa. Ako ste ostavili e-adresu, poslana je potvrda (kanal ovisi o konfiguraciji poslužitelja).
          </p>
          {done.nextStep ? (
            <p className="mt-2 text-sm text-text-secondary">{done.nextStep}</p>
          ) : null}
          <Button type="button" variant="secondary" className="mt-4" onClick={() => setDone(null)}>
            Novi upit
          </Button>
        </div>
      ) : (
        <form className="mt-8 space-y-5" onSubmit={(ev) => void onSubmit(ev)}>
          <div className="space-y-2">
            <Label htmlFor="contact-category">Kategorija</Label>
            <select
              id="contact-category"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-text-primary"
              value={category}
              onChange={(ev) => setCategory(ev.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {category === "appeal" ? (
            <div className="space-y-3 rounded-md border border-border p-4">
              <p className="text-sm text-text-secondary">
                Za formalni upis žalbe u sustav potrebni su tip odluke i referenca (npr. ID odluke). Ako niste
                prijavljeni ili podaci nedostaju, predmet ide u red žalbene komisije kao obična prijava kontakta.
              </p>
              <div className="space-y-2">
                <Label htmlFor="decision-type">Tip odluke</Label>
                <Input id="decision-type" value={decisionType} onChange={(ev) => setDecisionType(ev.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="decision-ref">Referenca odluke</Label>
                <Input id="decision-ref" value={decisionRef} onChange={(ev) => setDecisionRef(ev.target.value)} />
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="contact-name">Ime i prezime</Label>
            <Input id="contact-name" value={name} onChange={(ev) => setName(ev.target.value)} autoComplete="name" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-email">E-adresa</Label>
            <Input
              id="contact-email"
              type="email"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              autoComplete="email"
              disabled={category === "complaint" && isAnonymousComplaint}
            />
            {category === "complaint" ? (
              <div className="flex items-center gap-2 pt-1">
                <Checkbox
                  id="anon"
                  checked={isAnonymousComplaint}
                  onCheckedChange={(v) => setIsAnonymousComplaint(v === true)}
                />
                <Label htmlFor="anon" className="text-sm font-normal text-text-secondary">
                  Anonimna prigovor — bez pohrane e-adrese (bez e-potvrde)
                </Label>
              </div>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-phone">Telefon (opcionalno)</Label>
            <Input id="contact-phone" value={phone} onChange={(ev) => setPhone(ev.target.value)} autoComplete="tel" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-subject">Predmet</Label>
            <Input id="contact-subject" value={subject} onChange={(ev) => setSubject(ev.target.value)} maxLength={500} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-body">Poruka</Label>
            <textarea
              id="contact-body"
              className="flex min-h-[140px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-text-primary"
              value={body}
              onChange={(ev) => setBody(ev.target.value)}
              maxLength={20_000}
            />
          </div>

          {!CANONICAL_CONTACT ? (
            <div className="space-y-2">
              <Label htmlFor="contact-files">Prilozi (najviše 5, do 10 MiB po datoteci)</Label>
              <Input
                id="contact-files"
                type="file"
                multiple
                onChange={(ev) => setFiles(ev.target.files)}
                accept="*/*"
              />
            </div>
          ) : (
            <p className="text-xs text-text-muted">
              Prilozi trenutačno nisu dostupni putem kanonskog kontakt API-ja. Opis i kontakt podaci ostaju u poruci.
            </p>
          )}

          {SITE_KEY ? (
            <div className="space-y-2">
              <HCaptcha
                sitekey={SITE_KEY}
                ref={captchaRef}
                onVerify={(tok) => setCaptchaToken(tok)}
                onExpire={onCaptchaExpire}
              />
            </div>
          ) : (
            <p className="text-sm text-amber-700 dark:text-amber-400">CAPTCHA site key nedostaje u okruženju.</p>
          )}

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <Button type="submit" disabled={busy || !SITE_KEY}>
            {busy ? "Slanje…" : "Pošalji"}
          </Button>
        </form>
      )}

      <div className="mt-12 rounded-lg border border-border/60 bg-background-secondary/50 p-6">
        <h2 className="text-lg font-semibold text-text-primary">Provjera statusa prijave</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Unesite referencu prijave (npr. CNT-2026-…) koju ste dobili nakon slanja.
        </p>
        <form className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={(ev) => void onStatusLookup(ev)}>
          <div className="flex-1 space-y-2">
            <Label htmlFor="contact-status-ref">Referenca prijave</Label>
            <Input
              id="contact-status-ref"
              value={statusRef}
              onChange={(ev) => setStatusRef(ev.target.value)}
              placeholder="CNT-2026-…"
              autoComplete="off"
            />
          </div>
          <Button type="submit" variant="outline" disabled={statusBusy}>
            {statusBusy ? "Provjera…" : "Provjeri status"}
          </Button>
        </form>
        {statusError ? <p className="mt-3 text-sm text-red-600">{statusError}</p> : null}
        {statusResult ? (
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex flex-wrap gap-x-2">
              <dt className="text-text-muted">Referenca</dt>
              <dd className="font-mono text-text-primary">{statusResult.publicReference}</dd>
            </div>
            <div className="flex flex-wrap gap-x-2">
              <dt className="text-text-muted">Status</dt>
              <dd className="text-text-primary">{statusResult.status}</dd>
            </div>
            <div className="flex flex-wrap gap-x-2">
              <dt className="text-text-muted">Zaprimljeno</dt>
              <dd className="text-text-primary">{formatSubmittedAt(statusResult.submittedAt)}</dd>
            </div>
            {statusResult.nextStep ? (
              <div>
                <dt className="text-text-muted">Sljedeći korak</dt>
                <dd className="mt-1 text-text-secondary">{statusResult.nextStep}</dd>
              </div>
            ) : null}
          </dl>
        ) : null}
      </div>
    </section>
  );
}
