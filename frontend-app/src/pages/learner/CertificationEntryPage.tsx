/**
 * Kandidatski ulaz u profesionalnu certifikaciju (ISO 17024) za jedan program.
 */

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  FileText,
  Layers,
  Loader2,
  Shield,
  XCircle,
} from "lucide-react";
import { type JSX, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";

import { CertificationLexiconBanner } from "@/components/learner/CertificationLexiconBanner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  fetchCertificationApplicationRequirements,
  fetchCertificationEntryOverview,
  fetchPublicCertificationBodyInfo,
  postCertificationDraft,
  type CertificationApplicationRequirements,
  type CertificationEntryOverview,
} from "@/lib/api-certification-entry";
import { isTerminalCertificationApplicationStatus, statusLabelHr } from "@/lib/candidate-certification";
import { cn } from "@/lib/utils";

const OVERVIEW_KEY = (courseId: string) => ["certification", "entry-overview", courseId] as const;
const PUB_INFO_KEY = ["certification", "public-body-info"] as const;
const REQ_KEY = (courseId: string) => ["certification", "entry-requirements", courseId] as const;

function StepList(): JSX.Element {
  return (
    <ol className="list-decimal space-y-3 pl-5 text-sm leading-relaxed text-text-secondary">
      <li>
        <span className="font-medium text-text-primary">Završite obuku i položite ispit</span> — time dobivate potvrdu o
        položenom ispitu (exam-pass), koja{" "}
        <span className="font-medium text-text-primary">nije ista stvar</span> kao profesionalna certifikacija osobe.
      </li>
      <li>
        <span className="font-medium text-text-primary">Provjerite preduvjete u sustavu</span> — program mora voditi ka
        certifikaciji, ispit mora biti položen (PASSED), a aktivna exam-pass potvrda mora postojati u „Mojim
        dokumentima“.
      </li>
      <li>
        <span className="font-medium text-text-primary">Pokrenite prijavu</span> — kratki opis relevantnog radnog iskustva
        otvara nacrt prijave; zatim dopunjujete dokaze prema shemi i šaljete na pregled odboru.
      </li>
      <li>
        <span className="font-medium text-text-primary">Odluka odbora</span> — pratite status u „Status certifikacije“;
        tek nakon pozitivne odluke izdaje se certifikat osobe po shemi.
      </li>
    </ol>
  );
}

function EligibilityRow({
  ok,
  label,
  detail,
}: {
  readonly ok: boolean;
  readonly label: string;
  readonly detail: string;
}): JSX.Element {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border p-3",
        ok ? "border-emerald-500/30 bg-emerald-500/5" : "border-border/50 bg-surface-primary/25",
      )}
    >
      {ok ? (
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" aria-hidden />
      ) : (
        <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-text-muted" aria-hidden />
      )}
      <div>
        <p className="font-medium text-text-primary">{label}</p>
        <p className="mt-0.5 text-xs text-text-secondary">{detail}</p>
      </div>
    </div>
  );
}

function OverviewBody({
  data,
  courseId,
  requirements,
  pubSections,
}: {
  readonly data: CertificationEntryOverview;
  readonly courseId: string;
  readonly requirements: CertificationApplicationRequirements | undefined;
  readonly pubSections:
    | readonly { readonly key: string; readonly title: string; readonly contentUrl: string | null; readonly type: string }[]
    | undefined;
}): JSX.Element {
  const navigate = useNavigate();
  const [workExperience, setWorkExperience] = useState("");
  const [biographyOrCv, setBiographyOrCv] = useState("");
  const [competencies, setCompetencies] = useState("");
  const [publicProfileLinks, setPublicProfileLinks] = useState("");
  const [overviewAcknowledged, setOverviewAcknowledged] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const reqWx = requirements?.requireWorkExperience ?? true;
  const reqCv = requirements?.requireCv ?? false;
  const reqComp = requirements?.requireCompetencies ?? false;
  const reqLinks = requirements?.requirePublicEvidenceLinks ?? false;
  const reqRefs = requirements?.requireReferences ?? false;
  const nConfirm = requirements?.requiredConfirmersCount ?? 0;

  const existing = data.existingApplication;
  const hasDraft = existing && String(existing.status).toUpperCase() === "DRAFT";
  const terminalExisting = existing && isTerminalCertificationApplicationStatus(String(existing.status));
  const hasBlockingApp = Boolean(existing && !hasDraft && !terminalExisting);

  const showStartForm = data.eligible && (!existing || Boolean(terminalExisting));
  const showContinueDraft = Boolean(data.eligible && hasDraft);

  const draftMutation = useMutation({
    mutationFn: () =>
      postCertificationDraft({
        courseId,
        workExperience,
        biographyOrCv: biographyOrCv.trim() || null,
        competencies: competencies.trim() || null,
        publicProfileLinks: publicProfileLinks.trim() || null,
        applicationId: hasDraft ? (existing?.applicationId ?? null) : null,
        overviewAcknowledged: overviewAcknowledged,
      }),
    onSuccess: (data) => {
      void navigate(`/dashboard/certification/applications/${encodeURIComponent(data.applicationId)}/wizard`);
    },
    onError: (err: unknown) => {
      let msg = "Spremanje nije uspjelo.";
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response &&
        err.response.data &&
        typeof err.response.data === "object" &&
        "detail" in err.response.data
      ) {
        const d = (err.response.data as { detail?: unknown }).detail;
        msg = Array.isArray(d) ? d.map((x) => String(x)).join("; ") : String(d);
      }
      setFormError(msg);
    },
  });

  const sch = data.scheme;

  const levelLabel = useMemo(() => {
    const lv = sch?.level?.trim();
    if (!lv) {
      return null;
    }
    return lv;
  }, [sch?.level]);

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-text-primary">Kako funkcionira certifikacija ovdje</h2>
        <StepList />
      </section>

      <section className="space-y-4 rounded-2xl border border-border/50 bg-surface-secondary/25 p-5">
        <h2 className="text-lg font-semibold text-text-primary">Pregled postupka (§9.2.1)</h2>
        <p className="text-sm text-text-secondary">
          Prije pokretanja prijave potrebno je upoznati se s javnim informacijama certifikacijskog tijela i specifičnostima
          sheme (opseg, preduvjeti, procjena, prava, dužnosti, naknade).
        </p>
        {pubSections != null && pubSections.length > 0 ? (
          <ul className="divide-y divide-border/40 rounded-xl border border-border/50 bg-surface-primary/20">
            {pubSections.map((s) => (
              <li key={s.key} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm font-medium text-text-primary">{s.title}</span>
                {s.contentUrl ? (
                  <a
                    className="text-sm font-medium text-brand underline-offset-4 hover:underline"
                    href={s.contentUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Otvori dokument
                  </a>
                ) : (
                  <span className="text-xs text-text-muted">Nema poveznice</span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-amber-200/90">
            Javni dokumenti tijela još nisu objavljeni u sustavu — provjerite kasnije ili zatražite od sekretarijata.
          </p>
        )}
        {sch?.scopeText ? (
          <div className="rounded-xl border border-border/40 bg-surface-primary/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Opseg certifikacije (shema)</p>
            <p className="mt-2 text-sm text-text-secondary">{sch.scopeText}</p>
          </div>
        ) : null}
        <p className="text-xs text-text-muted">
          Naknade i detalji naplate: prema cjeniku objavljenom od strane tijela za certifikaciju (nije uvijek u ovom sustavu).
        </p>
        {showStartForm ? (
          <div className="flex items-start gap-3 pt-2">
            <Checkbox
              id="overview-ack"
              checked={overviewAcknowledged}
              onCheckedChange={(c) => setOverviewAcknowledged(c === true)}
            />
            <label htmlFor="overview-ack" className="cursor-pointer text-sm leading-relaxed text-text-secondary">
              Potvrđujem da sam pročitao/la gore navedene informacije i razumijem postupak certifikacije osobe.
            </label>
          </div>
        ) : null}
      </section>

      <CertificationLexiconBanner />

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-brand" aria-hidden />
          <h2 className="text-lg font-semibold text-text-primary">Sažetak sheme</h2>
        </div>
        {sch ? (
          <div className="rounded-2xl border border-border/50 bg-surface-secondary/35 p-5 ring-1 ring-white/[0.04]">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-brand/40 font-mono text-xs">
                {sch.code || sch.schemeId}
              </Badge>
              {sch.status ? (
                <Badge variant="outline" className="text-xs">
                  {sch.status}
                </Badge>
              ) : null}
            </div>
            <p className="mt-2 text-base font-semibold text-text-primary">{sch.name || "Shema certifikacije"}</p>
            {sch.description ? <p className="mt-2 text-sm text-text-secondary">{sch.description}</p> : null}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {levelLabel ? (
                <div className="flex gap-2 rounded-xl border border-border/40 bg-surface-primary/30 p-3">
                  <Layers className="mt-0.5 h-5 w-5 shrink-0 text-sky-400/90" aria-hidden />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Razina sheme</p>
                    <p className="text-sm text-text-primary">{levelLabel}</p>
                  </div>
                </div>
              ) : null}
              {sch.validityMonths != null && sch.validityMonths !== "" ? (
                <div className="flex gap-2 rounded-xl border border-border/40 bg-surface-primary/30 p-3">
                  <FileText className="mt-0.5 h-5 w-5 shrink-0 text-amber-300/90" aria-hidden />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Valjanost (mjeseci)</p>
                    <p className="text-sm text-text-primary">{String(sch.validityMonths)}</p>
                  </div>
                </div>
              ) : null}
            </div>
            {sch.examSchemeNote ? (
              <p className="mt-4 text-xs text-text-muted">{sch.examSchemeNote}</p>
            ) : (
              <p className="mt-4 text-xs text-text-muted">
                Prag prolaznosti ispita u samoj obuci određuje ispitni modul; shema može sadržavati dodatne referentne
                pragove za usklađenost programa.
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-text-secondary">
            Za ovaj program nema javnog sažetka sheme u sustavu (npr. shema nije povezana ili nije objavljena). Kontaktirajte
            sekretarijat ako trebate popis dokumenata.
          </p>
        )}
      </section>

      {sch && sch.mandatoryDocuments.length > 0 ? (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-brand" aria-hidden />
            <h2 className="text-lg font-semibold text-text-primary">Obavezni dokumenti (prema shemi)</h2>
          </div>
          <ul className="divide-y divide-border/40 rounded-2xl border border-border/50 bg-surface-secondary/30">
            {sch.mandatoryDocuments.map((d) => (
              <li key={d.documentType} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-start sm:gap-4">
                <span className="shrink-0 font-mono text-xs font-medium text-brand">{d.documentType}</span>
                <span className="text-sm text-text-secondary">{d.description || "—"}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-text-primary">Preduvjeti i status</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <EligibilityRow
            ok={data.leadsToCertification}
            label="Program vodi ka certifikaciji"
            detail="Administrator je označio ovaj program kao putanju prema formalnoj certifikaciji osobe."
          />
          <EligibilityRow
            ok={data.hasPassedExam}
            label="Položen ispit (PASSED)"
            detail="U evidenciji postoji uspješan pokušaj ispita za ovaj program."
          />
          <EligibilityRow
            ok={data.hasExamPassCertificate}
            label="Aktivna exam-pass potvrda"
            detail="U „Mojim dokumentima“ postoji važeća potvrda o položenom ispitu za ovaj program."
          />
        </div>

        {!data.eligible && data.blockingReasons.length > 0 ? (
          <div
            className="flex gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-text-secondary"
            role="status"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" aria-hidden />
            <div>
              <p className="font-medium text-text-primary">Zašto još ne možete pokrenuti prijavu</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {data.blockingReasons.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}

        {existing ? (
          <div className="rounded-2xl border border-border/50 bg-surface-secondary/40 p-5">
            <p className="text-sm font-medium text-text-primary">Postojeća prijava za ovaj program</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-brand/40">
                {statusLabelHr(existing.status as never)}
              </Badge>
              <span className="font-mono text-xs text-text-muted">{existing.applicationId}</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" className="border-border/60" asChild>
                <Link to="/dashboard/certification/applications">Pregled prijava</Link>
              </Button>
              <Button type="button" variant="outline" size="sm" className="border-border/60" asChild>
                <Link to="/dashboard/certification/status">Status toka</Link>
              </Button>
            </div>
            {hasBlockingApp ? (
              <p className="mt-3 text-xs text-text-muted">
                Aktivna prijava je u obradi — ne možete otvoriti novu dok se ovaj postupak ne završi ili ne vrati za
                dopunu.
              </p>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="space-y-4 border-t border-border/40 pt-8">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-brand" aria-hidden />
          <h2 className="text-lg font-semibold text-text-primary">Pokretanje certifikacijskog postupka</h2>
        </div>

        {showContinueDraft ? (
          <div className="rounded-2xl border border-brand/25 bg-brand/5 p-5">
            <p className="text-sm text-text-secondary">
              Već imate <span className="font-medium text-text-primary">nacrt prijave</span> za ovaj program. Nastavite
              dopunu i predaju putem liste prijava ili kontaktirajte sekretarijat ako trebate pomoć.
            </p>
            <Button type="button" className="mt-4 bg-brand font-semibold text-white hover:bg-brand/90" asChild>
              <Link to="/dashboard/certification/applications">
                Nastavi nacrt <ArrowRight className="ml-2 inline h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </div>
        ) : null}

        {showStartForm ? (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setFormError(null);
              if (reqWx && workExperience.trim().length < 1) {
                setFormError("Unesite opis radnog iskustva (shema ga zahtijeva).");
                return;
              }
              if (!overviewAcknowledged) {
                setFormError("Potvrdite da ste pročitali pregled postupka (§9.2.1).");
                return;
              }
              if (reqCv && (biographyOrCv.trim().length < 20 || !biographyOrCv.trim())) {
                setFormError("Unesite životopis / biografiju (min. 20 znakova) — shema ga zahtijeva.");
                return;
              }
              if (reqComp && competencies.trim().length < 10) {
                setFormError("Unesite kompetencije (min. 10 znakova) — shema ih zahtijeva.");
                return;
              }
              if (reqLinks && publicProfileLinks.trim().length < 5) {
                setFormError("Unesite javne poveznice / dokaze (min. 5 znakova).");
                return;
              }
              draftMutation.mutate();
            }}
          >
            <p className="text-xs text-text-muted">
              Polja označena zvjezdicom ovisne su o konfiguraciji sheme. Nacrt možete spremiti čak i djelomično; pri
              konačnoj predaji sustav provjerava sva obavezna polja i priloge.
            </p>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-text-primary">
                Radno iskustvo relevantno za shemu {reqWx ? <span className="text-red-400">*</span> : null}
              </span>
              <textarea
                value={workExperience}
                onChange={(ev) => setWorkExperience(ev.target.value)}
                placeholder="Opišite uloge, odgovornosti i razdoblje relevantno za traženu certifikaciju…"
                rows={6}
                disabled={draftMutation.isPending}
                className="min-h-[140px] w-full resize-y rounded-md border border-border/60 bg-surface-primary/40 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 disabled:opacity-50"
              />
            </label>
            {reqCv ? (
              <label className="block space-y-2">
                <span className="text-sm font-medium text-text-primary">
                  Životopis / biografija <span className="text-red-400">*</span>
                </span>
                <textarea
                  value={biographyOrCv}
                  onChange={(ev) => setBiographyOrCv(ev.target.value)}
                  placeholder="Sažetak karijere, obrazovanja i relevantnih uloga…"
                  rows={5}
                  disabled={draftMutation.isPending}
                  className="min-h-[120px] w-full resize-y rounded-md border border-border/60 bg-surface-primary/40 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 disabled:opacity-50"
                />
              </label>
            ) : null}
            {reqComp ? (
              <label className="block space-y-2">
                <span className="text-sm font-medium text-text-primary">
                  Kompetencije <span className="text-red-400">*</span>
                </span>
                <textarea
                  value={competencies}
                  onChange={(ev) => setCompetencies(ev.target.value)}
                  placeholder="Popis ključnih kompetencija u skladu sa shemom…"
                  rows={4}
                  disabled={draftMutation.isPending}
                  className="min-h-[100px] w-full resize-y rounded-md border border-border/60 bg-surface-primary/40 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 disabled:opacity-50"
                />
              </label>
            ) : null}
            {reqLinks ? (
              <label className="block space-y-2">
                <span className="text-sm font-medium text-text-primary">
                  Javni dokazi / poveznice (portfolio, profili) <span className="text-red-400">*</span>
                </span>
                <textarea
                  value={publicProfileLinks}
                  onChange={(ev) => setPublicProfileLinks(ev.target.value)}
                  placeholder="URL-ovi ili opis javno dostupnih dokaza…"
                  rows={3}
                  disabled={draftMutation.isPending}
                  className="min-h-[80px] w-full resize-y rounded-md border border-border/60 bg-surface-primary/40 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 disabled:opacity-50"
                />
              </label>
            ) : null}
            {reqRefs || nConfirm > 0 ? (
              <p className="text-sm text-amber-200/90">
                Reference / potvrđivači: potrebno je {Math.max(nConfirm, reqRefs ? 1 : 0)} kontakt(a). Unos referenci
                uskoro u punom obrascu — do tada koristite &quot;Pregled prijava&quot; ili API, ili kontaktirajte
                sekretarijat.
              </p>
            ) : null}
            {formError ? (
              <p className="text-sm text-red-400" role="alert">
                {formError}
              </p>
            ) : null}
            <Button
              type="submit"
              disabled={draftMutation.isPending || !overviewAcknowledged}
              className="bg-brand font-semibold text-white hover:bg-brand/90"
            >
              {draftMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  Spremanje…
                </>
              ) : (
                <>
                  Započni certifikacijski postupak <ArrowRight className="ml-2 inline h-4 w-4" aria-hidden />
                </>
              )}
            </Button>
          </form>
        ) : null}

        {!showStartForm && !showContinueDraft && data.eligible ? (
          <p className="text-sm text-text-muted">Nema dostupne akcije u ovom stanju.</p>
        ) : null}

        {!data.eligible && !existing ? (
          <p className="text-sm text-text-secondary">
            Kad ispunite preduvjete, gumb za pokretanje pojavit će se ovdje. Do tada možete pohađati ispite i provjeriti
            potvrde u „Mojim dokumentima“.
          </p>
        ) : null}

        {existing && !data.eligible && !hasDraft ? (
          <p className="text-xs text-text-muted">
            Preduvjeti iznad odnose se na novo pokretanje; za postojeću prijavu vrijede zapisi u sustavu prijava.
          </p>
        ) : null}
      </section>
    </div>
  );
}

export default function CertificationEntryPage(): JSX.Element {
  const { courseId = "" } = useParams<{ readonly courseId: string }>();
  const cid = courseId.trim();

  const q = useQuery({
    queryKey: OVERVIEW_KEY(cid),
    queryFn: () => fetchCertificationEntryOverview(cid),
    enabled: cid.length > 0,
  });

  const reqQ = useQuery({
    queryKey: REQ_KEY(cid),
    queryFn: () => fetchCertificationApplicationRequirements(cid),
    enabled: cid.length > 0,
  });

  const pubQ = useQuery({
    queryKey: PUB_INFO_KEY,
    queryFn: fetchPublicCertificationBodyInfo,
    enabled: cid.length > 0,
  });

  return (
    <div className="min-h-0 flex-1 overflow-auto px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="flex flex-col gap-4 border-b border-border/40 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand/15 ring-1 ring-brand/25">
              <Shield className="h-6 w-6 text-brand" aria-hidden />
            </div>
            <div>
              <p className="font-mono text-xs text-text-muted">{cid || "—"}</p>
              <h1 className="text-2xl font-bold tracking-tight text-text-primary">Ulaz u certifikaciju</h1>
              <p className="mt-1 max-w-2xl text-sm text-text-secondary">
                Profesionalna certifikacija po ISO/IEC 17024 je <span className="font-medium text-text-primary">odvojena</span>{" "}
                od položenog ispita i exam-pass potvrde. Ovdje vidite shemu, dokumente i možete pokrenuti prijavu kad ste
                podobni.
              </p>
            </div>
          </div>
          <Button type="button" variant="outline" size="sm" className="border-border/60" asChild>
            <Link to="/dashboard/iso/candidate">Natrag na ISO podsjetnik</Link>
          </Button>
        </header>

        {!cid ? (
          <p className="text-sm text-amber-200">
            Nedostaje ID programa u adresi. Koristite npr.{" "}
            <Link className="font-medium underline" to="/dashboard/certification/entry/iso-27001-id">
              /dashboard/certification/entry/iso-27001-id
            </Link>{" "}
            ili zamijenite vlastitim ID-jem iz kataloga.
          </p>
        ) : q.isLoading ? (
          <div className="flex min-h-[30vh] items-center justify-center gap-2 text-text-secondary">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
            Učitavanje ulaza…
          </div>
        ) : q.isError ? (
          <p className="text-sm text-red-400">Pregled trenutačno nije dostupan. Pokušajte ponovno kasnije.</p>
        ) : q.data ? (
          <>
            <p className="text-lg font-semibold text-text-primary">{q.data.courseTitle}</p>
            <OverviewBody
              data={q.data}
              courseId={cid}
              requirements={reqQ.data}
              pubSections={pubQ.data?.sections}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}
