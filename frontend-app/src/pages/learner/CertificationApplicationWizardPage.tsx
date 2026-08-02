/**
 * Čarobnjak prijave za certifikaciju osobe (ISO 17024) — koraci, nacrt, predaja.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, ClipboardList, Loader2, Save } from "lucide-react";
import { type FormEvent, type JSX, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";

import { CertificationLexiconBanner } from "@/components/learner/CertificationLexiconBanner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  fetchCertificationApplication,
  patchCertificationApplication,
  submitCertificationApplicationDraft,
} from "@/lib/api-governance";
import {
  submitAccommodationRequest,
  type AccommodationRequestType,
} from "@/lib/api-accommodations";
import { candidateMayEditApplication, statusLabelHr } from "@/lib/candidate-certification";
import { cn } from "@/lib/utils";

const STEPS = [
  "Kontakt i identitet",
  "Pozicija i obrazovanje",
  "Iskustvo i kompetencije",
  "Dokumenti i veze",
  "Potvrđitelji iskustva",
  "Izjava i predaja",
] as const;

/** ISO §9.2.2 e — meaningful accommodation disclosure (>= 100 chars for compliance E2E). */
const ACCOMMODATION_DISCLOSURE_ISO_922E =
  "Imate pravo, u razumnim granicama, zatražiti prilagodbu (accommodation) ispita ili certifikacijskog procesa zbog dokumentiranih posebnih potrebe, invaliditeta ili drugih ograničenja. " +
  "Prilagodba se odnosi na format, vrijeme ili pristupačnost — ne na smanjenje kriterija kompetencija. " +
  "Zahtjev možete podnijeti ovdje ili putem portala za prilagodbe; administracija za obuku (STAFF_TRAINADM) odlučuje, a odlučitelj certifikacije ne može odobriti vašu prilagodbu (segregacija dužnosti).";

function buildRefPayload(
  first: string,
  last: string,
  email: string,
  role: string,
): { firstName: string; lastName: string; email: string; relationship: string } | undefined {
  const em = email.trim();
  const rel = role.trim();
  if (!em || !rel) {
    return undefined;
  }
  const fn = first.trim();
  const ln = last.trim();
  if (!fn && !ln) {
    return undefined;
  }
  return { firstName: fn, lastName: ln, email: em, relationship: rel };
}

export default function CertificationApplicationWizardPage(): JSX.Element {
  const { applicationId = "" } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const aid = applicationId.trim();

  const { data: app, isLoading, isError, refetch } = useQuery({
    queryKey: ["certification", "application", aid],
    queryFn: () => fetchCertificationApplication(aid),
    enabled: aid.length > 0,
  });

  const [step, setStep] = useState(0);
  const [applicantFullName, setApplicantFullName] = useState("");
  const [applicantEmail, setApplicantEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [educationSummary, setEducationSummary] = useState("");
  const [experienceSummary, setExperienceSummary] = useState("");
  const [workExperience, setWorkExperience] = useState("");
  const [yearsExperience, setYearsExperience] = useState<string>("");
  const [competencies, setCompetencies] = useState("");
  const [publicProfileLinks, setPublicProfileLinks] = useState("");
  const [supportingKeysText, setSupportingKeysText] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [accommodationType, setAccommodationType] = useState<AccommodationRequestType | "">("");
  const [accommodationDetails, setAccommodationDetails] = useState("");
  const [r1First, setR1First] = useState("");
  const [r1Last, setR1Last] = useState("");
  const [r1Email, setR1Email] = useState("");
  const [r1Role, setR1Role] = useState("");
  const [r2First, setR2First] = useState("");
  const [r2Last, setR2Last] = useState("");
  const [r2Email, setR2Email] = useState("");
  const [r2Role, setR2Role] = useState("");
  const [declaration, setDeclaration] = useState(false);
  const [desiredScopeText, setDesiredScopeText] = useState("");
  const [bioUrl, setBioUrl] = useState("");
  const [diplomaUrl, setDiplomaUrl] = useState("");
  const [complianceSignText, setComplianceSignText] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!app) {
      return;
    }
    setApplicantFullName(app.applicantFullName?.trim() ?? "");
    setApplicantEmail(app.applicantEmail?.trim() ?? "");
    setPhone(app.phone?.trim() ?? "");
    setNationalId(app.nationalId?.trim() ?? "");
    setJobTitle(app.jobTitle?.trim() ?? "");
    setCompany(app.company?.trim() ?? "");
    setEducationSummary(app.educationSummary?.trim() ?? "");
    setExperienceSummary(app.experienceSummary?.trim() ?? "");
    setWorkExperience(app.workExperience?.trim() ?? "");
    setYearsExperience(app.yearsOfExperience != null ? String(app.yearsOfExperience) : "");
    setCompetencies(app.competencies?.trim() ?? "");
    setPublicProfileLinks(app.publicProfileLinks?.trim() ?? "");
    setSupportingKeysText((app.supportingEvidenceKeys ?? []).join("\n"));
    setAdditionalNotes(app.additionalNotes?.trim() ?? "");
    setDesiredScopeText(typeof app.desiredScopeText === "string" ? app.desiredScopeText : "");
    setBioUrl(typeof app.bioUrl === "string" ? app.bioUrl : (app.biographyOrCv ?? "").trim());
    setDiplomaUrl(typeof app.diplomaUrl === "string" ? app.diplomaUrl : "");
    setComplianceSignText(typeof app.complianceSignature === "string" ? app.complianceSignature : "");
    const ref1 = app.referencePerson1;
    if (ref1) {
      const parts = (ref1.fullName ?? "").trim().split(/\s+/);
      setR1First(parts[0] ?? "");
      setR1Last(parts.slice(1).join(" "));
      setR1Email(ref1.email?.trim() ?? "");
      setR1Role(ref1.relationship?.trim() ?? "");
    }
    const ref2 = app.referencePerson2;
    if (ref2) {
      const parts = (ref2.fullName ?? "").trim().split(/\s+/);
      setR2First(parts[0] ?? "");
      setR2Last(parts.slice(1).join(" "));
      setR2Email(ref2.email?.trim() ?? "");
      setR2Role(ref2.relationship?.trim() ?? "");
    }
  }, [app]);

  const mayEdit = useMemo(() => (app ? candidateMayEditApplication(app) : false), [app]);

  const patchBody = useMemo(() => {
    const keys = supportingKeysText
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const yoe = yearsExperience.trim() ? Number.parseInt(yearsExperience.trim(), 10) : undefined;
    const body: Record<string, unknown> = {
      applicantFullName: applicantFullName.trim() || undefined,
      applicantEmail: applicantEmail.trim() || undefined,
      phone: phone.trim() || undefined,
      nationalId: nationalId.trim() || undefined,
      jobTitle: jobTitle.trim() || undefined,
      company: company.trim() || undefined,
      educationSummary: educationSummary.trim() || undefined,
      experienceSummary: experienceSummary.trim() || undefined,
      desiredScopeText: desiredScopeText.trim() || undefined,
      bioUrl: bioUrl.trim() || undefined,
      diplomaUrl: diplomaUrl.trim() || undefined,
      workExperience: workExperience.trim() || undefined,
      yearsOfExperience: Number.isFinite(yoe) ? yoe : undefined,
      competencies: competencies.trim() || undefined,
      publicProfileLinks: publicProfileLinks.trim() || undefined,
      supportingEvidenceKeys: keys.length > 0 ? keys : undefined,
      additionalNotes: additionalNotes.trim() || undefined,
    };
    const p1 = buildRefPayload(r1First, r1Last, r1Email, r1Role);
    const p2 = buildRefPayload(r2First, r2Last, r2Email, r2Role);
    if (p1) {
      body.referencePerson1 = p1;
    }
    if (p2) {
      body.referencePerson2 = p2;
    }
    return body;
  }, [
    additionalNotes,
    applicantEmail,
    applicantFullName,
    bioUrl,
    competencies,
    company,
    desiredScopeText,
    diplomaUrl,
    educationSummary,
    experienceSummary,
    jobTitle,
    nationalId,
    phone,
    publicProfileLinks,
    r1Email,
    r1First,
    r1Last,
    r1Role,
    r2Email,
    r2First,
    r2Last,
    r2Role,
    supportingKeysText,
    workExperience,
    yearsExperience,
  ]);

  const submitAccommodationIfNeeded = async (): Promise<void> => {
    if (!accommodationType || accommodationDetails.trim().length < 10) return;
    await submitAccommodationRequest({
      requestType: accommodationType,
      detailsText: accommodationDetails.trim(),
      applicationId: aid,
    });
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      await patchCertificationApplication(aid, patchBody);
      await submitAccommodationIfNeeded();
    },
    onSuccess: () => {
      setFormError(null);
      void queryClient.invalidateQueries({ queryKey: ["certification", "application", aid] });
      void queryClient.invalidateQueries({ queryKey: ["certification", "my-applications"] });
    },
    onError: (err: unknown) => {
      setFormError(err instanceof Error ? err.message : "Spremanje nije uspjelo.");
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      await submitCertificationApplicationDraft(
        aid,
        true,
        complianceSignText.trim() || applicantFullName.trim() || undefined,
      );
      await submitAccommodationIfNeeded();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["certification", "application", aid] });
      void queryClient.invalidateQueries({ queryKey: ["certification", "my-applications"] });
      void navigate("/dashboard/certification/applications");
    },
    onError: (err: unknown) => {
      setFormError(err instanceof Error ? err.message : "Predaja nije uspjela.");
    },
  });

  const onSaveDraft = (e: FormEvent) => {
    e.preventDefault();
    if (!mayEdit) {
      return;
    }
    void saveMutation.mutateAsync();
  };

  const onSubmitApp = (e: FormEvent) => {
    e.preventDefault();
    if (!mayEdit) {
      return;
    }
    if (!declaration) {
      setFormError("Potvrdite izjavu kandidata prije predaje.");
      return;
    }
    const sign = complianceSignText.trim() || applicantFullName.trim();
    if (!sign) {
      setFormError("Unesite elektronički potpis (puno ime).");
      return;
    }
    setFormError(null);
    void submitMutation.mutateAsync();
  };

  if (!aid) {
    return (
      <div className="px-4 py-8 text-sm text-text-secondary">
        Nedostaje ID prijave.{" "}
        <Link className="text-brand underline" to="/dashboard/certification/applications">
          Natrag
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-text-secondary">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
        Učitavanje prijave…
      </div>
    );
  }

  if (isError || !app) {
    return (
      <div className="space-y-4 px-4 py-8">
        <p className="text-sm text-red-300">Prijava se ne može učitati.</p>
        <Button type="button" variant="outline" onClick={() => void refetch()}>
          Pokušaj ponovno
        </Button>
        <Link className="block text-sm text-brand underline" to="/dashboard/certification/applications">
          Natrag na popis prijava
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-auto px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="flex flex-col gap-4 border-b border-border/40 pb-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand/15 ring-1 ring-brand/25">
              <ClipboardList className="h-6 w-6 text-brand" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="font-mono text-xs text-text-muted">{app.applicationId}</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-text-primary">Prijava za certifikaciju</h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="border-brand/40 bg-brand/10 font-medium text-brand" data-testid="candidate-wizard-status">
                  {statusLabelHr(app.status)}
                </Badge>
                <span className="text-xs text-text-muted">Program: {app.courseId}</span>
              </div>
              {!mayEdit ? (
                <p className="mt-4 text-sm text-amber-200/90">
                  Ova prijava je zaključana ili u pregledu — polja više ne možete mijenjati.
                </p>
              ) : null}
            </div>
          </div>
          <CertificationLexiconBanner />
          <nav aria-label="Koraci obrasca">
            <ol className="flex flex-wrap gap-2">
              {STEPS.map((label, idx) => (
                <li key={label}>
                  <button
                    type="button"
                    disabled={!mayEdit}
                    onClick={() => {
                      setStep(idx);
                    }}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                      step === idx ? "border-brand bg-brand/15 text-brand" : "border-border/60 text-text-secondary",
                      !mayEdit && "opacity-60",
                    )}
                  >
                    {idx + 1}. {label}
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        </header>

        {formError ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">{formError}</div>
        ) : null}

        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
          {step === 0 ? (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-text-primary">{STEPS[0]}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="fullName">Puno ime i prezime</Label>
                  <Input
                    id="fullName"
                    value={applicantFullName}
                    onChange={(e) => {
                      setApplicantFullName(e.target.value);
                    }}
                    disabled={!mayEdit}
                    autoComplete="name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-pošta</Label>
                  <Input
                    id="email"
                    type="email"
                    value={applicantEmail}
                    onChange={(e) => {
                      setApplicantEmail(e.target.value);
                    }}
                    disabled={!mayEdit}
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                    }}
                    disabled={!mayEdit}
                    autoComplete="tel"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="nid">JMBG / nacionalni ID</Label>
                  <Input
                    id="nid"
                    value={nationalId}
                    onChange={(e) => {
                      setNationalId(e.target.value);
                    }}
                    disabled={!mayEdit}
                  />
                </div>
              </div>
            </section>
          ) : null}

          {step === 1 ? (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-text-primary">{STEPS[1]}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="job">Trenutna pozicija</Label>
                  <Input id="job" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} disabled={!mayEdit} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Kompanija / organizacija</Label>
                  <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} disabled={!mayEdit} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="edu">Stručna sprema / obrazovanje</Label>
                  <textarea
                    id="edu"
                    rows={4}
                    className="focus-visible:ring-ring/50 w-full rounded-xl border border-border/60 bg-surface-secondary/80 px-3 py-2 text-sm outline-none ring-offset-2 ring-offset-transparent focus-visible:ring-2 disabled:opacity-60"
                    value={educationSummary}
                    onChange={(e) => setEducationSummary(e.target.value)}
                    disabled={!mayEdit}
                  />
                </div>
              </div>
            </section>
          ) : null}

          {step === 2 ? (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-text-primary">{STEPS[2]}</h2>
              <div className="space-y-2">
                <Label htmlFor="expSum">Sažetak iskustva</Label>
                <textarea
                  id="expSum"
                  rows={3}
                  className="focus-visible:ring-ring/50 w-full rounded-xl border border-border/60 bg-surface-secondary/80 px-3 py-2 text-sm outline-none ring-offset-2 ring-offset-transparent focus-visible:ring-2 disabled:opacity-60"
                  value={experienceSummary}
                  onChange={(e) => setExperienceSummary(e.target.value)}
                  disabled={!mayEdit}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wx">Radno iskustvo / reference (detaljno)</Label>
                <textarea
                  id="wx"
                  rows={5}
                  className="focus-visible:ring-ring/50 w-full rounded-xl border border-border/60 bg-surface-secondary/80 px-3 py-2 text-sm outline-none ring-offset-2 ring-offset-transparent focus-visible:ring-2 disabled:opacity-60"
                  value={workExperience}
                  onChange={(e) => setWorkExperience(e.target.value)}
                  disabled={!mayEdit}
                />
              </div>
              <div className="space-y-2 sm:w-40">
                <Label htmlFor="yoe">Godine iskustva</Label>
                <Input
                  id="yoe"
                  inputMode="numeric"
                  value={yearsExperience}
                  onChange={(e) => setYearsExperience(e.target.value)}
                  disabled={!mayEdit}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="comp">Kompetencije</Label>
                <textarea
                  id="comp"
                  rows={3}
                  className="focus-visible:ring-ring/50 w-full rounded-xl border border-border/60 bg-surface-secondary/80 px-3 py-2 text-sm outline-none ring-offset-2 ring-offset-transparent focus-visible:ring-2 disabled:opacity-60"
                  value={competencies}
                  onChange={(e) => setCompetencies(e.target.value)}
                  disabled={!mayEdit}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="links">Javni linkovi (portfolio, profili)</Label>
                <textarea
                  id="links"
                  rows={2}
                  className="focus-visible:ring-ring/50 w-full rounded-xl border border-border/60 bg-surface-secondary/80 px-3 py-2 text-sm outline-none ring-offset-2 ring-offset-transparent focus-visible:ring-2 disabled:opacity-60"
                  value={publicProfileLinks}
                  onChange={(e) => setPublicProfileLinks(e.target.value)}
                  disabled={!mayEdit}
                />
              </div>
            </section>
          ) : null}

          {step === 3 ? (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-text-primary">{STEPS[3]}</h2>
              <div className="space-y-2">
                <Label htmlFor="scope">Željeni opseg certifikacije (prema shemi)</Label>
                <textarea
                  id="scope"
                  rows={3}
                  className="focus-visible:ring-ring/50 w-full rounded-xl border border-border/60 bg-surface-secondary/80 px-3 py-2 text-sm outline-none ring-offset-2 ring-offset-transparent focus-visible:ring-2 disabled:opacity-60"
                  value={desiredScopeText}
                  onChange={(e) => setDesiredScopeText(e.target.value)}
                  disabled={!mayEdit}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bioUrl">Biografija / CV (URL do PDF-a, npr. iz pohrane)</Label>
                <Input
                  id="bioUrl"
                  type="url"
                  placeholder="https://…"
                  value={bioUrl}
                  onChange={(e) => setBioUrl(e.target.value)}
                  disabled={!mayEdit}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dipUrl">Diploma / dokaz o obrazovanju (URL do PDF-a)</Label>
                <Input
                  id="dipUrl"
                  type="url"
                  placeholder="https://…"
                  value={diplomaUrl}
                  onChange={(e) => setDiplomaUrl(e.target.value)}
                  disabled={!mayEdit}
                />
              </div>
              <p className="text-sm text-text-secondary">
                Dodatni prilozi: navedite ključeve objekata u pohrani — jedan po retku ili odvojeni zarezom.
              </p>
              <div className="space-y-2">
                <Label htmlFor="keys">Ključevi podržavajuće dokumentacije</Label>
                <textarea
                  id="keys"
                  rows={5}
                  className="focus-visible:ring-ring/50 font-mono w-full rounded-xl border border-border/60 bg-surface-secondary/80 px-3 py-2 text-xs outline-none ring-offset-2 ring-offset-transparent focus-visible:ring-2 disabled:opacity-60"
                  value={supportingKeysText}
                  onChange={(e) => setSupportingKeysText(e.target.value)}
                  disabled={!mayEdit}
                />
              </div>
              <p className="text-xs text-text-muted">
                Za produkciju: PDF se učitava preko pohrane; ovdje se očekuje javno dostupni ili unaprijed potpisani URL.
              </p>
            </section>
          ) : null}

          {step === 4 ? (
            <section className="space-y-6">
              <h2 className="text-lg font-semibold text-text-primary">{STEPS[4]}</h2>
              <fieldset disabled={!mayEdit} className="space-y-4 rounded-xl border border-border/50 bg-surface-secondary/30 p-4">
                <legend className="px-2 text-sm font-medium text-text-primary">Potvrđitelj 1</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Ime</Label>
                    <Input value={r1First} onChange={(e) => setR1First(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Prezime</Label>
                    <Input value={r1Last} onChange={(e) => setR1Last(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>E-pošta</Label>
                    <Input type="email" value={r1Email} onChange={(e) => setR1Email(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Funkcija / uloga</Label>
                    <Input value={r1Role} onChange={(e) => setR1Role(e.target.value)} />
                  </div>
                </div>
              </fieldset>
              <fieldset disabled={!mayEdit} className="space-y-4 rounded-xl border border-border/50 bg-surface-secondary/30 p-4">
                <legend className="px-2 text-sm font-medium text-text-primary">Potvrđitelj 2</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Ime</Label>
                    <Input value={r2First} onChange={(e) => setR2First(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Prezime</Label>
                    <Input value={r2Last} onChange={(e) => setR2Last(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>E-pošta</Label>
                    <Input type="email" value={r2Email} onChange={(e) => setR2Email(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Funkcija / uloga</Label>
                    <Input value={r2Role} onChange={(e) => setR2Role(e.target.value)} />
                  </div>
                </div>
              </fieldset>
            </section>
          ) : null}

          {step === 5 ? (
            <section className="space-y-6">
              <h2 className="text-lg font-semibold text-text-primary">{STEPS[5]}</h2>
              <div
                className="space-y-3 rounded-xl border border-brand/30 bg-brand/5 p-4"
                data-iso-clause="9.2.2.e"
                data-testid="accommodation-disclosure-922e"
              >
                <h3 className="text-sm font-semibold text-text-primary">Razumna prilagodba (ISO §9.2.2 e)</h3>
                <p className="text-xs text-text-secondary">{ACCOMMODATION_DISCLOSURE_ISO_922E}</p>
                <p className="text-xs text-text-secondary">
                  Više informacija:{" "}
                  <Link to="/public/equitable-access" className="text-brand underline">
                    Equitable Access Statement
                  </Link>
                  .
                </p>
                <div className="space-y-2">
                  <Label htmlFor="acc-wiz-type">Vrsta prilagodbe (opcionalno)</Label>
                  <select
                    id="acc-wiz-type"
                    disabled={!mayEdit}
                    className="w-full rounded-xl border border-border/60 bg-surface-secondary/80 px-3 py-2 text-sm"
                    value={accommodationType}
                    onChange={(e) => setAccommodationType(e.target.value as AccommodationRequestType | "")}
                  >
                    <option value="">— Bez zahtjeva —</option>
                    <option value="EXTRA_TIME">Dodatno vrijeme</option>
                    <option value="SCREEN_READER_COMPAT">Čitač ekrana</option>
                    <option value="LARGE_PRINT">Uvećani prikaz</option>
                    <option value="SEPARATE_ROOM">Odvojena prostorija</option>
                    <option value="SIGN_LANGUAGE">Znakovni jezik</option>
                    <option value="OTHER">Ostalo</option>
                  </select>
                </div>
                {accommodationType ? (
                  <div className="space-y-2">
                    <Label htmlFor="acc-wiz-details">Opis potrebe</Label>
                    <textarea
                      id="acc-wiz-details"
                      rows={3}
                      disabled={!mayEdit}
                      className="focus-visible:ring-ring/50 w-full rounded-xl border border-border/60 bg-surface-secondary/80 px-3 py-2 text-sm outline-none focus-visible:ring-2 disabled:opacity-60"
                      value={accommodationDetails}
                      onChange={(e) => setAccommodationDetails(e.target.value)}
                    />
                  </div>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Dodatne napomene (opcionalno)</Label>
                <textarea
                  id="notes"
                  rows={3}
                  className="focus-visible:ring-ring/50 w-full rounded-xl border border-border/60 bg-surface-secondary/80 px-3 py-2 text-sm outline-none ring-offset-2 ring-offset-transparent focus-visible:ring-2 disabled:opacity-60"
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  disabled={!mayEdit}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="esign">Elektronički potpis (puno ime i prezime)</Label>
                <Input
                  id="esign"
                  value={complianceSignText}
                  onChange={(e) => setComplianceSignText(e.target.value)}
                  disabled={!mayEdit}
                  placeholder={applicantFullName || "Ime Prezime"}
                />
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-border/50 bg-surface-secondary/40 p-4">
                <Checkbox
                  id="decl"
                  checked={declaration}
                  disabled={!mayEdit}
                  onCheckedChange={(c) => setDeclaration(Boolean(c === true))}
                  data-testid="candidate-declaration-checkbox"
                />
                <Label htmlFor="decl" className="cursor-pointer text-sm leading-relaxed text-text-secondary">
                  Izjavljujem da su navedeni podaci istiniti, da sam upoznat/a s posljedicama dostave netočnih informacija te
                  pristajem na obradu osobnih podataka u svrhu certifikacije osobe prema apliciranoj shemi.
                </Label>
              </div>
              <Button
                type="button"
                className="bg-brand text-white hover:bg-brand/90"
                disabled={!mayEdit || submitMutation.isPending}
                onClick={onSubmitApp}
                data-testid="candidate-submit-button"
              >
                {submitMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Predaja…
                  </>
                ) : (
                  "Podnesi prijavu"
                )}
              </Button>
            </section>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-6">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={step === 0}
                onClick={() => setStep((s) => Math.max(0, s - 1))}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Korak nazad
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={step >= STEPS.length - 1}
                onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
              >
                Sljedeći korak
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" size="sm" asChild>
                <Link to="/dashboard/certification/applications">Na popis</Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!mayEdit || saveMutation.isPending}
                onClick={onSaveDraft}
              >
                {saveMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Sačuvaj kao nacrt
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
