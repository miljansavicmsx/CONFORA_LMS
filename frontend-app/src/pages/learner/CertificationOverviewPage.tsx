/**
 * Pregled profesionalne certifikacije (ISO/IEC 17024) — odvojeno od kursa i ispita.
 */

import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  Gavel,
  Info,
  Landmark,
  Loader2,
  Route,
  Shield,
  Users,
} from "lucide-react";
import { useMemo, type JSX } from "react";
import { Link } from "react-router";

import { CertificationLexiconBanner } from "@/components/learner/CertificationLexiconBanner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchCandidateCertificationPathways, type CertificationPathwaySummary } from "@/lib/api-certification-entry";
import {
  isCertificationCandidate,
  isCertificationCommitteeMember,
  isDirector,
  isSysAdmin,
} from "@/lib/iso-navigation-access";
import {
  certificationApplicationBlocksNewSubmission,
  isTerminalCertificationApplicationStatus,
  statusLabelHr,
} from "@/lib/candidate-certification";
import { evaluateCertificationDashboardAccess } from "@/lib/certification-committee-access";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";

const PATHWAYS_KEY = ["certification", "candidate-pathways-overview"] as const;

export const CERTIFICATION_TIMELINE_STEPS_HR: readonly { readonly title: string; readonly detail: string }[] = [
  { title: "Završena obuka", detail: "Formalno usvajanje sadržaja programa u skladu s pravilima dostupnosti ispita." },
  { title: "Položen ispit", detail: "Potvrđuje se kroz ispitni modul; izdaje se potvrda o položenom ispitu — to nije certifikat osobe." },
  { title: "Prijava", detail: "Kandidat podnosi prijavu, biografiju/isustvo i ostale obavezne dokaze prema shemi." },
  { title: "Pregled dokaza", detail: "Administracija i članovi komiteta procjenjuju potpunost i prihvatljivost dokaza." },
  { title: "Odluka komiteta", detail: "Neovisna odluka o ispunjavanju uvjeta za certifikaciju osobe uz zabilježenu obrazloženost." },
  { title: "Certifikat osobe", detail: "Formalni certifikat osobe prema shemi, zasebno od exam-pass potvrde." },
  { title: "Javna verifikacija", detail: "Javni trag za provjeru valjanosti certifikata (npr. pojedinačni identifikator)." },
] as const;

export function CertificationProcessTimeline({ className }: { readonly className?: string }): JSX.Element {
  return (
    <ol
      className={cn("relative space-y-0 border-l-2 border-brand/35 pl-6", className)}
      aria-label="Proces certifikacije osobe"
    >
      {CERTIFICATION_TIMELINE_STEPS_HR.map((step, i) => (
        <li key={step.title} className="pb-8 last:pb-0">
          <span className="absolute -left-[11px] mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">
            {i + 1}
          </span>
          <p className="font-semibold text-text-primary">{step.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-text-secondary">{step.detail}</p>
        </li>
      ))}
    </ol>
  );
}

function KnownRestrictionsPanel(): JSX.Element {
  return (
    <section className="rounded-2xl border border-border/50 bg-surface-secondary/35 p-6 ring-1 ring-white/[0.04]">
      <div className="flex items-center gap-2">
        <Info className="h-5 w-5 text-amber-400" aria-hidden />
        <h2 className="text-lg font-semibold text-text-primary">Poznata ograničenja u sustavu</h2>
      </div>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-text-secondary">
        <li>Ova stranica je informativna; konačnu primjenjivost sheme i rokova definira objavljena shema i sporazum s CB-om.</li>
        <li>AI Tutor i automatski ispisi ne predstavljaju odluku komiteta i ne zamjenjuju živi intervju kada je shemom predviđen.</li>
        <li>Odbor može zatražiti dodatne dokaze; status &quot;vraćeno za dopunu&quot; otključava uređivanje gdje je tehnički podržano.</li>
      </ul>
    </section>
  );
}

export function maySubmitCertificationApplication(row: CertificationPathwaySummary): boolean {
  if (!row.leadsToCertification || !row.hasPassedExam || !row.hasExamPassCertificate) {
    return false;
  }
  const ex = row.existingApplication;
  if (!ex) {
    return true;
  }
  const u = String(ex.status).trim().toUpperCase();
  if (u === "DRAFT") {
    return false;
  }
  return isTerminalCertificationApplicationStatus(String(ex.status));
}

function LearnerPathwayRow({ row }: { readonly row: CertificationPathwaySummary }): JSX.Element {
  const existing = row.existingApplication;
  const submitOk = maySubmitCertificationApplication(row);
  const st = existing ? String(existing.status).trim().toUpperCase() : "";

  let cta: JSX.Element | null = null;
  if (existing && st === "DRAFT") {
    cta = (
      <Button type="button" size="sm" className="bg-brand text-white hover:bg-brand/90" asChild>
        <Link to="/dashboard/certification/applications">Nastavi nacrt prijave</Link>
      </Button>
    );
  } else if (existing && certificationApplicationBlocksNewSubmission(existing)) {
    cta = (
      <Button type="button" size="sm" variant="secondary" className="border-border/60" asChild>
        <Link to="/dashboard/certification/status">Pregled prijave u obradi</Link>
      </Button>
    );
  } else if (submitOk) {
    cta = (
      <Button type="button" size="sm" className="bg-brand text-white hover:bg-brand/90" asChild>
        <Link to={row.entryHref}>Podnesi prijavu</Link>
      </Button>
    );
  }

  const statusTone = submitOk ? "border-brand text-brand" : "";

  return (
    <div className="rounded-2xl border border-border/50 bg-surface-secondary/40 p-5 ring-1 ring-white/[0.04]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-semibold text-text-primary">{row.courseTitle}</p>
          <p className="font-mono text-xs text-text-muted">{row.courseId}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Badge variant="outline" className={row.hasPassedExam ? "border-emerald-500/40 text-emerald-200" : ""}>
              Ispit: {row.hasPassedExam ? "položen" : "nije položen"}
            </Badge>
            <Badge variant="outline" className={row.hasExamPassCertificate ? "border-sky-500/40 text-sky-200" : ""}>
              Exam-pass: {row.hasExamPassCertificate ? "ima" : "nema"}
            </Badge>
            <Badge variant="outline" className={statusTone}>
              {submitOk ? "Možete podnijeti prijavu" : "Preduvjeti / tok prijave nisu za novu prijavu"}
            </Badge>
          </div>
        </div>
        {cta ? <div className="shrink-0">{cta}</div> : null}
      </div>
      {existing ? (
        <p className="mt-3 text-xs text-text-muted">
          Status prijave:{" "}
          <span className="font-medium text-text-primary">
            {statusLabelHr(existing.status as never)}
          </span>
        </p>
      ) : null}
      {!submitOk && row.blockingReasons.length > 0 ? (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-amber-100/90">
          {row.blockingReasons.slice(0, 4).map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function CertificationOverviewPage(): JSX.Element {
  const cognitoGroups = useAuthStore((s) => s.cognitoGroups);
  const profileUser = useAuthStore((s) => s.user);

  const isoCtx = useMemo(
    () => ({
      role: profileUser?.role ?? "",
      cognitoGroups,
    }),
    [profileUser?.role, cognitoGroups],
  );

  const showLearnerPanels = isCertificationCandidate(isoCtx);
  const committeeMember = isCertificationCommitteeMember(isoCtx);
  const dashboardOperator = evaluateCertificationDashboardAccess({
    cognitoGroups,
    roleFromProfile: profileUser?.role,
  });

  const pathwaysQ = useQuery({
    queryKey: PATHWAYS_KEY,
    queryFn: fetchCandidateCertificationPathways,
    enabled: showLearnerPanels,
  });

  const eligiblePrograms = pathwaysQ.data?.filter((r) => maySubmitCertificationApplication(r)) ?? [];

  return (
    <div className="min-h-0 flex-1 overflow-auto px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-10 pb-16">
        <header className="flex flex-col gap-4 border-b border-border/40 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand/15 ring-1 ring-brand/25">
              <Shield className="h-6 w-6 text-brand" aria-hidden />
            </div>
            <div>
              <p className="font-mono text-xs text-text-muted">ISO/IEC 17024</p>
              <h1 className="text-2xl font-bold tracking-tight text-text-primary">Certifikacija osobe — pregled</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-secondary">
                Profesionalna certifikacija osobe je pravno-značajan postupak <span className="font-medium text-text-primary">odvojen</span>{" "}
                od završetka programa i ispita unutar LMS-a.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" className="border-border/60" asChild>
              <Link to="/dashboard/my-certificates">Moji dokumenti</Link>
            </Button>
            {committeeMember ? null : (
              <Button type="button" variant="outline" size="sm" className="border-border/60" asChild>
                <Link to="/dashboard/exams">Ispiti</Link>
              </Button>
            )}
          </div>
        </header>

        <div
          role="alert"
          className="flex gap-4 rounded-2xl border border-amber-500/35 bg-amber-500/10 p-4 text-sm leading-relaxed text-amber-50"
        >
          <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-amber-400" aria-hidden />
          <div>
            <p className="font-semibold text-white">Važna razlika</p>
            <p className="mt-1 text-amber-100/95">
              <span className="font-medium text-white">Potvrda o ispitu nije certifikat osobe.</span> Exam-pass potvrduje ishod ispita za program; osobna certifikacija slijedi tek nakon odborske ocjene, izdavanja certifikata i javne tragovne verifikacije.
            </p>
          </div>
        </div>

        <CertificationLexiconBanner />

        {(committeeMember || dashboardOperator || isDirector(isoCtx) || isSysAdmin(isoCtx)) && (
          <section className="rounded-2xl border border-sky-500/25 bg-sky-950/25 p-6 ring-1 ring-sky-500/15">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-sky-300" aria-hidden />
              <h2 className="text-lg font-semibold text-text-primary">
                Operativni pristup odboru / upravljanju certifikacijom
              </h2>
            </div>
            <p className="mt-2 text-sm text-text-secondary">
              Ovu radnu površinu koristi certifikacijski odbor i ovlaštene uloge; nije zamjena za kandidatsku edukaciju.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {dashboardOperator || committeeMember ? (
                <>
                  <Button type="button" size="sm" className="bg-sky-600 text-white hover:bg-sky-600/90" asChild>
                    <Link to="/dashboard/committee/decisions">
                      Red odbora za odluke <ExternalLink className="ml-1 inline h-3.5 w-3.5" aria-hidden />
                    </Link>
                  </Button>
                  <Button type="button" variant="outline" size="sm" className="border-border/60" asChild>
                    <Link to="/dashboard/iso/applications">Prijave (admin pogled)</Link>
                  </Button>
                  <Button type="button" variant="outline" size="sm" className="border-border/60" asChild>
                    <Link to="/dashboard/committee/pilot-applications">Pilot prijave</Link>
                  </Button>
                </>
              ) : null}
              {isDirector(isoCtx) ? (
                <Button type="button" variant="secondary" size="sm" className="border-border/60" asChild>
                  <Link to="/dashboard/iso/decisions">
                    Nadzor — odluke <Landmark className="ml-1 inline h-3.5 w-3.5" aria-hidden />
                  </Link>
                </Button>
              ) : null}
              {isDirector(isoCtx) ? (
                <Button type="button" variant="secondary" size="sm" className="border-border/60" asChild>
                  <Link to="/dashboard/iso/reports">Izvještaji</Link>
                </Button>
              ) : null}
              {isSysAdmin(isoCtx) ? (
                <Button type="button" variant="outline" size="sm" className="border-border/60" asChild>
                  <Link to="/dashboard/admin/console">Sys admin konzola</Link>
                </Button>
              ) : null}
            </div>
          </section>
        )}

        <section className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <div className="flex items-center gap-2 border-b border-border/30 pb-3">
              <Route className="h-5 w-5 text-brand" aria-hidden />
              <h2 className="text-lg font-semibold text-text-primary">Tok postupka</h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">
              Sljedeći koraci grupiraju učenje, vjerifikaciju stručnosti (ispit), formalnu prijavu i odluku neovisnog odbora — u skladu s načelima neutralnosti i dokumentiranosti za ISO/IEC 17024.
            </p>
            <CertificationProcessTimeline className="mt-6" />
          </div>
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Zašto certifikacija nije isto što i obuka</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-text-secondary">
                <li>LMS završište dokumentira usvajanje sadržaja; ispit dokumentira ishod mjerenja znanja.</li>
                <li>Odborska ocjena uključuje radno isustvo i dokaze o primjeni, koje automatika ne može sama potvrditi.</li>
                <li>Izdavanje osobnog certifikata predstavlja obvezu tijela za certifikaciju prema shemi objavljenoj u sustavu.</li>
              </ul>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Uslovi za prijavu (što sustav najčešće provjerava)</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-text-secondary">
                <li>Program mora biti označen kao putanja prema osobnoj certifikaciji (leads-to-cert).</li>
                <li>U evidenciji postoji položen formalni ispit za taj program (PAS).</li>
                <li>Aktivna je exam-pass potvrda u „Moji dokumenti” (&quot;nije osobni certifikat&quot;).</li>
                <li>Nema konkurentnog aktivnog toka za isti program osim dopućenih nacrta/dopuna.</li>
              </ul>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-brand" aria-hidden />
                <h2 className="text-lg font-semibold text-text-primary">Uloge komiteta (opisno)</h2>
              </div>
              <ul className="mt-3 space-y-3 text-sm leading-relaxed text-text-secondary">
                <li>
                  <span className="font-medium text-text-primary">Sekretarijat / administracija:</span>{" "}
                  administrativni prijam, nedostajući dokumenti, termini.
                </li>
                <li>
                  <span className="font-medium text-text-primary">Stručno-neovisni članovi:</span>{" "}
                  procjena dokaza uz izbjegavanje sukoba interesa.
                </li>
                <li>
                  <span className="font-medium text-text-primary">Formalna odluka:</span>{" "}
                  potvrđuje se kroz zaključak odbora, bilježi razlog odobrenja ili odbijanja.
                </li>
              </ul>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Dokumenti koje kandidat dostavlja</h2>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                Popis obaveznih tipova nalazi se u pojedinoj certifikacijskoj shemi (npr. identifikacija, radno isustvo,
                javni tragovi projekata). Nadopuna se uređuje u obrascu za prijavu pojedinog programa.
              </p>
              <Button type="button" variant="outline" size="sm" className="mt-3 border-border/60" asChild>
                <Link to="/dashboard/iso/schemes">Popis tema shema</Link>
              </Button>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Gavel className="h-5 w-5 text-brand" aria-hidden />
                <h2 className="text-lg font-semibold text-text-primary">Rokovi, odluka i žalba</h2>
              </div>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-text-secondary">
                <li>Rokovi komiteta mogu oviseći o složenosti dokumentacije; detaljnije vrijednosti objavljuje shema ili operativni kalendar tijela za certifikaciju.</li>
                <li>Kandidat dobiva strukturiran status u modulu „Status certifikacije” zajedno s obrazloženjem odluke kad je tehnički predano.</li>
                <li>Protiv materijalne odluke moguće je ostvariti proces žalbe u skladu s pravilima platforme i zakona — pogled izbornik ISO 17024 /Žalbe.</li>
              </ul>
              <Button type="button" variant="link" className="mt-3 h-auto p-0 text-brand" asChild>
                <Link to="/dashboard/certification/status">Otvaraj „Status certifikacije” za žalbu i trag odluka</Link>
              </Button>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" aria-hidden />
                <h2 className="text-lg font-semibold text-text-primary">Što slijedi nakon odobrenja</h2>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                Izdaje se certifikat osobe prema aktivnoj shemi, bilježe se početni i istek valjanosti gdje vrijedi, dokument se šalje u novčanik „Moji dokumenti” kao osobni certifikat (ne exam-pass).
                Javnu potvrdu moguće je testirati kroz trag verifikacije.
              </p>
              <Button type="button" size="sm" className="mt-3 bg-emerald-600 text-white hover:bg-emerald-600/90" asChild>
                <Link to="/verify">Javna verifikacija</Link>
              </Button>
            </div>
          </div>
        </section>

        {showLearnerPanels ? (
          <section className="space-y-5 rounded-2xl border border-brand/25 bg-brand/5 p-6 ring-1 ring-brand/15">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/30 pb-4">
              <div className="flex items-start gap-3">
                <ClipboardList className="mt-1 h-5 w-5 text-brand" aria-hidden />
                <div>
                  <h2 className="text-lg font-semibold text-text-primary">Tvoji statusi programa</h2>
                  <p className="text-sm text-text-secondary">
                    Gumb{" "}
                    <span className="font-semibold text-text-primary">„Podnesi prijavu”</span> prikazan je samo kada su
                    preduvjeta ispunjena za odabrani certifikacioni trag.
                  </p>
                </div>
              </div>
              {eligiblePrograms.length > 0 ? (
                <Badge className="bg-brand text-white hover:bg-brand/90">{eligiblePrograms.length} spremnih programa</Badge>
              ) : null}
            </div>
            {pathwaysQ.isLoading ? (
              <div className="flex items-center gap-2 py-12 text-sm text-text-secondary">
                <Loader2 className="h-8 w-8 animate-spin text-brand" aria-hidden />
                Dohvat programa…
              </div>
            ) : pathwaysQ.isError ? (
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                Ne možemo učitati putanje programa. Probaj ponovo kasnije.
              </p>
            ) : (pathwaysQ.data?.length ?? 0) === 0 ? (
              <div className="rounded-xl border border-dashed border-border/50 bg-surface-secondary/30 p-10 text-center text-sm text-text-secondary">
                <p>Niste upisani na program koji otvara osobnu certifikaciju — ili još nije konfigurisan u sustavu.</p>
                <Button type="button" variant="outline" className="mt-6 border-border/60 bg-surface-primary/40" asChild>
                  <Link to="/dashboard/courses">
                    Koristi LMS katalog <ArrowRight className="ml-2 inline h-4 w-4" aria-hidden />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">{pathwaysQ.data?.map((r) => <LearnerPathwayRow key={r.courseId} row={r} />)}</div>
            )}
          </section>
        ) : null}

        <KnownRestrictionsPanel />
      </div>
    </div>
  );
}

export default CertificationOverviewPage;
