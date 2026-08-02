import { motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  ClipboardList,
  GraduationCap,
  Link2,
  RefreshCw,
  Sparkles,
  Timer,
  TrendingUp,
  Bell,
  FileBadge2,
} from "lucide-react";
import { useMemo, type JSX, type ReactNode } from "react";
import { Link } from "react-router";

import { ActivityBlock } from "@/components/dashboard/ActivityBlock";
import { CertificationPathwayStrip } from "@/components/learner/CertificationPathwayStrip";
import { CertificationLexiconBanner } from "@/components/learner/CertificationLexiconBanner";
import { CourseCard, type CourseCardProps } from "@/components/CourseCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import {
  AiSuggestionCard,
  CertificationBadge,
  DashboardSection,
  DashboardWidget,
  EnterpriseAlertBanner,
  EnterpriseAiBadge,
  EnterpriseEmptyState,
  EnterpriseKpiCard,
  EnterpriseSectionHeader,
  EnterpriseStatusBadge,
  EnterpriseTimeline,
  LearningHero,
  ProgressRing,
  ds,
  type EnterpriseTimelineItem,
} from "@/design-system";
import type { CandidateDashboardPayload } from "@/lib/dashboard-context-api";
import type { DashboardActivity } from "@/lib/dashboard-home-api";
import { messagingForDashboardIdle } from "@/lib/dashboard-role-empty-copy";
import {
  DASHBOARD_CATEGORY_FILTERS,
  type DashboardCategoryId,
} from "@/lib/course-category-filters";
import { cn } from "@/lib/utils";

export type LearnerDashboardOverview = {
  readonly heroSubtitle: string;
  readonly overallProgressPct: number;
  readonly continueCourseId: string;
  readonly stats: {
    readonly activeCourses: number;
    readonly totalCourses: number;
    readonly weekLearningLabel: string;
    readonly certificatesCount: number;
    readonly lastCertificateLabel: string;
    readonly lastExamResultLabel: string;
    readonly avgScorePct: number;
    readonly trendActive: "up" | "down";
    readonly trendWeek: "up" | "down";
    readonly trendCerts: "up" | "down";
    readonly trendScore: "up" | "down";
  };
  readonly activities: readonly DashboardActivity[];
};

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] },
  },
} as const;

function AnimatedBlock({
  prefersReducedMotion,
  asSection,
  className,
  children,
}: {
  readonly prefersReducedMotion: boolean;
  readonly asSection?: boolean;
  readonly className?: string;
  readonly children: ReactNode;
}): JSX.Element {
  if (prefersReducedMotion) {
    if (asSection) {
      return <section className={className}>{children}</section>;
    }
    return <div className={className}>{children}</div>;
  }
  const Cmp = asSection ? motion.section : motion.div;
  return (
    <Cmp variants={fadeUp} className={className}>
      {children}
    </Cmp>
  );
}

function barRow(label: string, pct: number): JSX.Element {
  const w = Math.min(100, Math.max(0, pct));
  return (
    <div>
      <div className="flex items-center justify-between gap-2 text-xs text-text-secondary">
        <span>{label}</span>
        <span className="tabular-nums text-text-muted">{w}%</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-tertiary/80">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand/80 to-sky-500/70 motion-reduce:transition-none"
          style={{ width: `${w}%` }}
        />
      </div>
    </div>
  );
}

function buildLearningPathItems(
  cand: CandidateDashboardPayload,
  data: LearnerDashboardOverview,
): EnterpriseTimelineItem[] {
  const { stats, overallProgressPct, continueCourseId } = data;
  const enrollDone = stats.activeCourses > 0;

  const enrollment: EnterpriseTimelineItem["state"] = enrollDone ? "done" : "locked";

  let lessons: EnterpriseTimelineItem["state"];
  if (!enrollDone) lessons = "locked";
  else if (continueCourseId) lessons = "current";
  else if (overallProgressPct >= 85) lessons = "done";
  else lessons = "current";

  const quizDone = cand.examStatus.failedOrIncomplete === 0 && stats.avgScorePct >= 72;
  let quiz: EnterpriseTimelineItem["state"];
  if (!enrollDone) quiz = "locked";
  else if (quizDone) quiz = "done";
  else quiz = "current";

  let exam: EnterpriseTimelineItem["state"];
  if (!enrollDone || overallProgressPct < 55) exam = "locked";
  else if (cand.examStatus.passedCourses > 0) exam = "done";
  else exam = "current";

  let cert: EnterpriseTimelineItem["state"];
  if (cand.examStatus.passedCourses === 0) cert = "locked";
  else if (cand.certificateKinds.certificationActive > 0) cert = "done";
  else cert = "current";

  return [
    {
      id: "enroll",
      title: "Upis i pristup programu",
      subtitle: enrollDone ? "Aktivni program(i) u LMS-u." : "Počnite iz kataloga ispod.",
      state: enrollment,
    },
    {
      id: "lessons",
      title: "Lekcije i moduli",
      subtitle: continueCourseId ? "Nastavite gdje ste stali." : "Tijek lekcija u skladu s napretkom.",
      state: lessons,
    },
    {
      id: "quiz",
      title: "Kviz checkpoint",
      subtitle: "Formativna provjera prije završnog ispita.",
      state: quiz,
      meta:
        quiz === "current" ? (
          <span>
            Nedovršeno / ponovi: {cand.examStatus.failedOrIncomplete} · prosjek {stats.avgScorePct}%
          </span>
        ) : undefined,
    },
    {
      id: "finalexam",
      title: "Završni ispit",
      subtitle: "Formalni uvjeti ostaju na serveru — ovdje je navigacijski signal.",
      state: exam,
    },
    {
      id: "certwallet",
      title: "Certifikat u novčaniku",
      subtitle: "Nakon odluke tijela dokumenti se pojavljuju u novčaniku.",
      state: cert,
    },
  ];
}

export function LearnerDashboardEnterprise({
  greet,
  name,
  isoRoleLabel,
  data,
  cand,
  goLearn,
  prefersReducedMotion,
  selectedCategory,
  setSelectedCategory,
  catalogPending,
  catalogError,
  catalogErrFormatted,
  refetchCatalog,
  filteredCatalogCards,
}: {
  readonly greet: string;
  readonly name: string;
  readonly isoRoleLabel: string;
  readonly data: LearnerDashboardOverview;
  readonly cand: CandidateDashboardPayload;
  readonly goLearn: (courseId: string) => void;
  readonly prefersReducedMotion: boolean;
  readonly selectedCategory: DashboardCategoryId;
  readonly setSelectedCategory: (id: DashboardCategoryId) => void;
  readonly catalogPending: boolean;
  readonly catalogError: boolean;
  readonly catalogErrFormatted: { readonly message: string; readonly devDetail?: string | null } | null;
  readonly refetchCatalog: () => Promise<unknown>;
  readonly filteredCatalogCards: readonly CourseCardProps[];
}): JSX.Element {
  const { stats } = data;
  const nextLesson = data.activities[0]?.title ?? "—";
  const certifyActive = cand.certificateKinds.certificationActive;
  const certifyIssued = cand.certificateKinds.certificationIssued;
  const examActive = cand.certificateKinds.examPassActive;

  const weakTopicsHint =
    stats.avgScorePct < 70
      ? `Kvizi / ispiti ukazuju na praznine — prosjek je ${stats.avgScorePct}% (cilj > 70%). Razmotrite reviziju modula prije ispita.`
      : `Ukupni trend točnosti (${stats.avgScorePct}%) je zdrav. Održavajte tempom i rezervišite vrijeme za teže module.`;

  const examReadinessLabel =
    cand.examStatus.failedOrIncomplete > 0
      ? `${cand.examStatus.failedOrIncomplete} nedovršeno / ponoviti`
      : "Nema blokirajućih neriješenih pokušaja";

  const walletAlerts =
    certifyActive > 0 && cand.certificationPipeline.decisionStatus
      ? `${certifyActive} aktivnih certifikata · odluka: ${cand.certificationPipeline.decisionStatus}`
      : `${certifyActive} aktivnih certifikacija osobe · ${examActive} aktivnih dokaza o ispitu`;

  const pathItems = useMemo(() => buildLearningPathItems(cand, data), [cand, data]);
  const readinessScore = useMemo(
    () =>
      Math.min(
        100,
        Math.max(
          0,
          Math.round(
            data.overallProgressPct * 0.42 +
              stats.avgScorePct * 0.42 +
              (stats.activeCourses > 0 ? 8 : 0) +
              (cand.examStatus.failedOrIncomplete === 0 ? 6 : -6),
          ),
        ),
      ),
    [data.overallProgressPct, stats.avgScorePct, stats.activeCourses, cand.examStatus.failedOrIncomplete],
  );
  const noEnrollmentCopy = messagingForDashboardIdle("candidate", "");

  const hasWalletDocuments =
    certifyActive > 0 || examActive > 0 || cand.certificateKinds.certificationIssued > 0;

  return (
    <div className="relative pb-24 text-text-primary md:pb-0">
      <div className="relative flex flex-col gap-8 xl:flex-row xl:items-start">
        <div className="min-w-0 flex-1 space-y-8">
          <AnimatedBlock prefersReducedMotion={prefersReducedMotion} className="space-y-5">
            {stats.activeCourses === 0 && noEnrollmentCopy ? (
              <EnterpriseEmptyState
                id="learner-no-enrollment"
                icon={BookOpen}
                title={noEnrollmentCopy.title}
                description={noEnrollmentCopy.description}
                primary={[
                  { to: "/dashboard/courses", label: "Otvori katalog edukacije" },
                  { to: "/dashboard/support", label: "Zatraži pristup programu" },
                ]}
              />
            ) : null}

            <LearningHero
              id="dashboard-learner-hero"
              eyebrow="Polaznik · LMS"
              title={`${greet}, ${name}`}
              trustBadge={<CertificationBadge scope="credential">Put edukacije ISO/IEC 17024</CertificationBadge>}
              aiInsight={<EnterpriseAiBadge humanApprovalRequired={false}>AI tutor i preporuke u cockpit-u</EnterpriseAiBadge>}
              description={
                <div className="space-y-3">
                  <p className="font-medium text-text-primary">{data.heroSubtitle}</p>
                  <p className="text-sm text-text-secondary">
                    <span className="font-semibold text-text-primary">Uloga (ISO/IEC 17024): </span>
                    {isoRoleLabel}
                  </p>
                </div>
              }
              primaryAction={
                <>
                  {data.continueCourseId ? (
                    <Button
                      type="button"
                      className={cn(ds.focusRing, "bg-brand font-semibold text-white hover:bg-brand/90")}
                      onClick={() => goLearn(data.continueCourseId)}
                    >
                      Nastavi učenje
                    </Button>
                  ) : (
                    <Button asChild type="button" className={cn(ds.focusRing, "bg-brand font-semibold text-white hover:bg-brand/90")}>
                      <Link to="/dashboard/courses">Pronađi program</Link>
                    </Button>
                  )}
                  <Button asChild type="button" variant="outline" className={cn(ds.focusRing, "border-border/60")}>
                    <Link to="/dashboard/certification/status">Status certifikacije</Link>
                  </Button>
                  <Button asChild type="button" variant="outline" className={cn(ds.focusRing, "border-border/60")}>
                    <Link to="/dashboard/ai-tutor">AI tutor</Link>
                  </Button>
                </>
              }
              aside={
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/[0.08] bg-surface-primary/25 px-5 py-4 sm:flex-row sm:items-start">
                  <ProgressRing
                    value={data.overallProgressPct}
                    size={104}
                    stroke={9}
                    label="Ukupan napredak programa"
                  />
                  <dl className="space-y-1 text-center text-sm sm:text-left">
                    <dt className="sr-only">Sažetak</dt>
                    <dd className="font-semibold text-text-primary">{stats.activeCourses} aktivnih programa</dd>
                    <dd className="text-text-secondary">{stats.weekLearningLabel} ove sedmice</dd>
                  </dl>
                </div>
              }
            />

            <AiSuggestionCard
              title={cand.nextAction.label}
              body={
                <p>
                  {cand.nextAction.reason} — eksplicitni prijedlagani korak bez automatskih promjena u sustavu (samo
                  navigacija po vašoj potvrdi).
                </p>
              }
              confidenceLabel="Heuristička preporuka (vidljivo, ne automatski)"
              acceptHref={cand.nextAction.href}
              acceptLabel="Prihvati AI prijedlog (otvori)"
              rejectLabel="Odbij AI prijedlog"
            />

            <CertificationLexiconBanner />
            <CertificationPathwayStrip />

            <DashboardSection
              id="dashboard-learner-path"
              eyebrow="Struktura programa"
              title="Put kroz obuku"
              description="Poglavlja su heuristički složena iz napretka i ispita — ne mijenjaju serverske uvjete."
            >
              <EnterpriseTimeline ariaLabel="Redoslijed poglavlja učenja" items={pathItems} />
            </DashboardSection>
          </AnimatedBlock>

          <AnimatedBlock prefersReducedMotion={prefersReducedMotion} className="space-y-6" asSection>
            <DashboardSection
              id="dashboard-learner-overview"
              eyebrow="LMS pregled"
              title="Stanje učenja"
              description="Brzi KPI u horizontalnom traku za skeniranje — identični podaci API-ja kao prije."
            >
              <div
                className="-mx-1 flex gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin scroll-pl-4"
                aria-label="KPI učenja"
              >
                <EnterpriseKpiCard compact label="Upisani programi" value={`${stats.activeCourses}/${stats.totalCourses}`} hint="od ukupnog kataloga" />
                <EnterpriseKpiCard compact label="Završetak (procjena)" value={`${data.overallProgressPct}%`} hint="agregirani tijek" />
                <EnterpriseKpiCard compact label="Sedmični tempo" value={stats.weekLearningLabel} hint="procjena učenja" />
                <EnterpriseKpiCard
                  compact
                  label="Sljedeća stavka"
                  value={nextLesson.length > 28 ? `${nextLesson.slice(0, 28)}…` : nextLesson}
                  hint="iz nedavnog tijeka"
                />
                <EnterpriseKpiCard
                  compact
                  label="Ispiti položeni"
                  value={cand.examStatus.passedCourses}
                  hint={`nezavršeno: ${cand.examStatus.failedOrIncomplete}`}
                />
              </div>

              <div className={cn(ds.gridKpi, "gap-4")}>
                <DashboardWidget variant="dense" className="md:col-span-2 lg:col-span-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Certifikacija u tijeku</p>
                      <p className="mt-2 text-lg font-semibold text-text-primary">
                        {cand.certificationPipeline.applicationStatus}
                      </p>
                      <p className="mt-1 text-sm text-text-secondary">
                        Odluka: {cand.certificationPipeline.decisionStatus || "—"}
                      </p>
                    </div>
                    <FileBadge2 className="mt-1 h-8 w-8 shrink-0 text-brand/80" aria-hidden />
                  </div>
                  <Link
                    to="/dashboard/my-certificates"
                    className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
                  >
                    Otvori novčanik <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </DashboardWidget>
                <DashboardWidget variant="dense">
                  <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Zadnji ispit</p>
                  <p className="mt-2 font-semibold text-text-primary">{stats.lastExamResultLabel.trim() || "—"}</p>
                  <p className="mt-1 text-xs text-text-muted">
                    Posljednji pokušaj: {cand.examStatus.lastExamLabel || "—"}
                  </p>
                </DashboardWidget>
                <DashboardWidget variant="dense">
                  <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Broj dokumenata</p>
                  <p className="mt-2 text-xs text-text-muted">Zapisi u profilu / novčaniku</p>
                  <p className="mt-1 text-2xl font-bold text-brand">{stats.certificatesCount}</p>
                </DashboardWidget>
              </div>
            </DashboardSection>
          </AnimatedBlock>

          <AnimatedBlock prefersReducedMotion={prefersReducedMotion} className="space-y-6" asSection>
            <DashboardSection
              eyebrow="Asistent za učenje"
              title="AI asistent za učenje"
              description="Transparenthost: sve je predloženo eksplicitno; nema pozadinskih odluka."
            >
              <div className="grid gap-4 lg:grid-cols-3">
                <DashboardWidget variant="dense" className="border-violet-500/25 bg-violet-500/[0.05] lg:col-span-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-violet-300" aria-hidden />
                    <h3 className="text-base font-semibold text-text-primary">Preporuka revizije</h3>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">{weakTopicsHint}</p>
                  <p className="mt-3 text-sm text-text-muted">
                    <span className="font-semibold text-text-secondary">Spremnost za ispit:</span> {examReadinessLabel}
                  </p>
                </DashboardWidget>
                <DashboardWidget variant="dense">
                  <h3 className="text-sm font-semibold text-text-primary">Predloženi plan</h3>
                  <ul className="mt-3 list-inside list-decimal space-y-2 text-sm text-text-secondary">
                    <li>15–25 min blokova usmjerenih na modul koji kasni</li>
                    <li>Simulacije ispita nakon što napredak pređe {Math.min(90, data.overallProgressPct + 10)}%</li>
                    <li>AI tutor za konkretna pitanja (ne zamjenjuje službeni ishod)</li>
                  </ul>
                  <Button asChild type="button" size="sm" variant="outline" className="mt-4 w-full border-violet-500/35">
                    <Link to="/dashboard/ai-tutor">Zatraži tutorski kontekst</Link>
                  </Button>
                </DashboardWidget>
              </div>
            </DashboardSection>
          </AnimatedBlock>

          <AnimatedBlock prefersReducedMotion={prefersReducedMotion} className="space-y-6" asSection>
            <DashboardSection
              eyebrow="Digitalni novčanik"
              title="Certifikacija & novčanik dokumenata"
              description={walletAlerts}
            >
              {!hasWalletDocuments ? (
                <EnterpriseEmptyState
                  icon={Award}
                  title="Još nemate dokumente u novčaniku"
                  description={
                    <>
                      Tipičan put: <strong className="text-text-primary">kurs</strong> →{" "}
                      <strong className="text-text-primary">ispit</strong> →{" "}
                      <strong className="text-text-primary">certifikacija</strong> nakon odluke tijela. Javnu provjeru
                      koristite kada vam tijelo dostavi poveznice iz modula certifikata.
                    </>
                  }
                  primary={[
                    { to: "/dashboard/courses", label: "Katalog programa" },
                    { to: "/dashboard/exams", label: "Uvjeti i pokušaji ispita" },
                    { to: "/dashboard/my-certificates", label: "Novčanik i PDF" },
                  ]}
                />
              ) : (
                <>
                  <div className={ds.gridOps}>
                    <DashboardWidget variant="dense">
                      <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                        Aktivni certifikati osobe
                      </p>
                      <p className="mt-2 text-2xl font-bold text-emerald-300">{certifyActive}</p>
                      <p className="mt-1 text-xs text-text-muted">UKUPNO IZDANO: {certifyIssued}</p>
                    </DashboardWidget>
                    <DashboardWidget variant="dense">
                      <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Dokaz o ispitu</p>
                      <p className="mt-2 text-sm text-text-primary">
                        Izdano: <span className="font-semibold">{cand.certificateKinds.examPassIssued}</span>
                        {" · "}
                        aktivno: {examActive}
                      </p>
                    </DashboardWidget>
                    <DashboardWidget variant="dense" className="flex flex-col justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Akciije</p>
                        <p className="mt-2 text-sm text-text-secondary">Portal za preuzimanje i javnu provjeru.</p>
                      </div>
                      <div className="mt-4 flex flex-col gap-2">
                        <Button asChild size="sm" variant="outline" className="border-border/60 justify-start gap-2">
                          <Link to="/dashboard/my-certificates">
                            <Link2 className="h-4 w-4" aria-hidden />
                            Dokumenti & PDF
                          </Link>
                        </Button>
                        <Button asChild size="sm" variant="outline" className="border-border/60 justify-start gap-2">
                          <Link to="/dashboard/certification/status">
                            <ClipboardList className="h-4 w-4" aria-hidden />
                            Status tijeka
                          </Link>
                        </Button>
                      </div>
                    </DashboardWidget>
                  </div>

                  {(cand.reminders.some((r) => r.message.toLowerCase().includes("rok")) ||
                    cand.notifications.some((n) =>
                      /istek|ciklus|obnova|nadzor/i.test(`${n.title} ${n.body}`),
                    )) && (
                    <DashboardWidget variant="dense" className="mt-4 border-amber-500/30 bg-amber-500/[0.06]">
                      <div className="flex items-start gap-2">
                        <Bell className="mt-0.5 h-4 w-4 shrink-0 text-amber-200" aria-hidden />
                        <div>
                          <p className="text-sm font-semibold text-text-primary">Certifikacija uskoro ističe</p>
                          <p className="mt-1 text-sm text-text-secondary">
                            Kombiniramo podsjetnike i inbox poruke koje spominju rok — provjerite novčanik za stvarne
                            datume.
                          </p>
                        </div>
                      </div>
                    </DashboardWidget>
                  )}
                </>
              )}
            </DashboardSection>
          </AnimatedBlock>

          <AnimatedBlock prefersReducedMotion={prefersReducedMotion} className="space-y-6" asSection>
            <DashboardSection
              eyebrow="Ispiti"
              title="Status ispita"
              description="Pregled dostignuća i pravila koja su ostala na serveru (ovdje samo prikaz)."
            >
              <EnterpriseSectionHeader
                titleLevel="h3"
                eyebrow="Spremnost"
                title="Procjena spremnosti za ispit"
                description="Heuristički rezultat iz napretka i točnosti — ne mijenja formalne uvjete tijela."
              />
              <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Signali spremnosti ispita">
                <EnterpriseStatusBadge severity="info">{`Rezultat spremnosti: ${readinessScore}%`}</EnterpriseStatusBadge>
                {cand.examStatus.failedOrIncomplete > 0 ? (
                  <EnterpriseStatusBadge severity="warning">Ponavljanje / dopuna potrebna</EnterpriseStatusBadge>
                ) : (
                  <EnterpriseStatusBadge severity="success">Nema blokirajućih pokušaja</EnterpriseStatusBadge>
                )}
              </div>
              {cand.examStatus.failedOrIncomplete > 0 ? (
                <EnterpriseAlertBanner severity="warning" icon={RefreshCw} title="Retake / ponavljanje">
                  Imate {cand.examStatus.failedOrIncomplete} nedovršenih ili neuspjelih pokušaja. U modulu ispita
                  provjerite koja pravila ponavljanja vrijede za vaš program.
                </EnterpriseAlertBanner>
              ) : null}
              {cand.examStatus.passedCourses === 0 && stats.activeCourses > 0 ? (
                <EnterpriseAlertBanner severity="info" icon={GraduationCap} title="Uvjeti za izlazak na ispit">
                  Završite predviđene module i kvizne kontrolne točke prije zakazivanja završnog ispita. Potpunu listu
                  uvjeta vidite na stranici ispita za svoj program.
                </EnterpriseAlertBanner>
              ) : null}
              <div className="grid gap-4 lg:grid-cols-2">
                <DashboardWidget variant="dense">
                  <h3 className="text-sm font-semibold text-text-primary">Aktuelno</h3>
                  <dl className="mt-4 space-y-2 text-sm text-text-secondary">
                    <div className="flex justify-between gap-2 border-b border-border/40 pb-2">
                      <dt>Položeno (kursevi)</dt>
                      <dd className="font-semibold text-text-primary">{cand.examStatus.passedCourses}</dd>
                    </div>
                    <div className="flex justify-between gap-2 border-b border-border/40 pb-2">
                      <dt>Neuspjeh / nedovršeno</dt>
                      <dd className="font-semibold text-text-primary">{cand.examStatus.failedOrIncomplete}</dd>
                    </div>
                  </dl>
                  <Button asChild type="button" size="sm" variant="outline" className="mt-4 border-border/60">
                    <Link to="/dashboard/exams">Pregled ispita i pokušaja</Link>
                  </Button>
                </DashboardWidget>
                <DashboardWidget variant="dense">
                  <h3 className="text-sm font-semibold text-text-primary">Analitička kutija</h3>
                  <p className="mt-3 text-xs text-text-muted">
                    Bez novih grafikona na klijentu — koristi se prosjek i trend iz statističkog endpointa kao sažeti
                    trag.
                  </p>
                  <div className="mt-6 space-y-4">
                    {barRow("Točnost (prosjek ispita)", stats.avgScorePct)}
                    {barRow("Napredak tijeka", data.overallProgressPct)}
                  </div>
                  <Link
                    className={cn(ds.focusRing, "mt-6 inline-flex text-sm font-medium text-brand")}
                    to="/dashboard/statistics"
                  >
                    Otvori detaljniju statistiku
                  </Link>
                </DashboardWidget>
              </div>
            </DashboardSection>
          </AnimatedBlock>

          <AnimatedBlock prefersReducedMotion={prefersReducedMotion} className="space-y-6" asSection>
            <DashboardSection
              eyebrow="Analitički trag"
              title="U zbiru: učenje & performanse"
              description="Lagani grafovi bez vanjskih paketa."
            >
              <DashboardWidget>
                <div className="grid gap-8 lg:grid-cols-[1fr,minmax(0,220px)]">
                  <div className="space-y-6">
                    {barRow("Aktivni vs ukupni programi", stats.totalCourses ? (stats.activeCourses / stats.totalCourses) * 100 : 0)}
                    {barRow("Dominantni faktor ispita (prosjek bodova)", stats.avgScorePct)}
                    <div className="rounded-xl border border-border/40 bg-surface-primary/30 p-4 text-sm text-text-secondary">
                      <TrendingUp className="mb-2 h-5 w-5 text-emerald-300" aria-hidden />
                      Najjači signal trenutačno je napredak lekcije; najslabije područje odredite kombiniranjem ispita +
                      vlastite revizije.
                    </div>
                  </div>
                  <aside className="rounded-xl border border-border/35 bg-brand/[0.04] p-4 text-sm leading-relaxed text-text-secondary">
                    <Award className="mb-3 h-5 w-5 text-brand" aria-hidden />
                    Dokumentacija u profilu: <strong className="text-text-primary">{stats.lastCertificateLabel}</strong>.
                    Ovaj blok je statički trag iz LMS tablice — pogledaj tečajeve za strukturiranije domene.
                  </aside>
                </div>
              </DashboardWidget>
            </DashboardSection>
          </AnimatedBlock>

          {cand.reminders.length > 0 || cand.notifications.length > 0 ? (
            <AnimatedBlock prefersReducedMotion={prefersReducedMotion} className="space-y-6" asSection>
              <DashboardSection
                id="dashboard-learner-inbox"
                eyebrow="Inbox"
                title="Unified obavještenja"
                description="Podsjetnici tijela za certifikaciju plus primljene poruke — jedinstveni trag."
              >
                {cand.reminders.length > 0 ? (
                  <DashboardWidget variant="dense" className="border-amber-500/20 bg-amber-500/[0.04]">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-200">Podsjetnici tijela</p>
                    <ul className="mt-3 space-y-2 text-sm">
                      {cand.reminders.map((r) => (
                        <li
                          key={r.id}
                          className={cn(
                            "rounded-lg px-2 py-1.5",
                            r.severity === "warning" ? "text-amber-100" : "text-text-secondary",
                          )}
                        >
                          {r.message}
                        </li>
                      ))}
                    </ul>
                  </DashboardWidget>
                ) : null}
                {cand.notifications.length > 0 ? (
                  <DashboardWidget variant="dense">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Poruke za vas</p>
                    <ul className="mt-3 space-y-3 text-sm" role="list">
                      {cand.notifications.map((n) => (
                        <li key={n.id} className="border-b border-border/40 pb-3 last:border-0 last:pb-0">
                          <span className="font-medium text-text-primary">{n.title}</span>
                          {n.body ? <span className="text-text-secondary"> — {n.body}</span> : null}
                        </li>
                      ))}
                    </ul>
                  </DashboardWidget>
                ) : null}
              </DashboardSection>
            </AnimatedBlock>
          ) : null}

          <AnimatedBlock prefersReducedMotion={prefersReducedMotion} className="space-y-5" asSection>
            <div className="rounded-2xl border border-border/50 bg-surface-secondary/60 p-4 backdrop-blur-sm">
              <p className="text-sm font-semibold text-text-primary">Brzi pristup portalu</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {(
                  [
                    { to: "/dashboard/courses", label: "Edukacija / kursevi" },
                    { to: "/dashboard/exams", label: "Ispiti" },
                    { to: "/dashboard/certification/applications", label: "Prijave za certifikaciju" },
                    { to: "/dashboard/certification/status", label: "Odluka komiteta" },
                    { to: "/dashboard/my-certificates", label: "Dokumenti i certifikati" },
                    { to: "/dashboard/statistics", label: "Moja statistika" },
                    { to: "/dashboard/finance", label: "Financije" },
                    { to: "/dashboard/support", label: "Podrška" },
                    { to: "/dashboard/ai-tutor", label: "AI Tutor za učenje" },
                  ] as const
                ).map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    className={cn(
                      ds.focusRing,
                      "rounded-xl border border-border/50 bg-surface-primary/40 px-3 py-2.5 text-sm font-medium text-text-primary transition-colors hover:border-brand/40 hover:bg-brand/5 hover:text-brand",
                    )}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>

            <DashboardWidget variant="dense">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Informacije o platformi</p>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{cand.platformInfo}</p>
            </DashboardWidget>
          </AnimatedBlock>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatCard
              icon={BookOpen}
              label="Aktivni kursevi"
              value={stats.activeCourses}
              subtitle={`od ${stats.totalCourses} ukupno`}
              trend={stats.trendActive}
              animateCount
              href="/dashboard/courses"
              tooltip="Programi u kojima ste trenutno upisani — otvorite katalog za sve dostupno."
            />
            <StatCard
              icon={Timer}
              label="Sati učenja"
              value={stats.weekLearningLabel}
              subtitle="ove sedmice"
              trend={stats.trendWeek}
              href="/dashboard/statistics"
              tooltip="Procjena vremena provedenog u učenju u tekućoj sedmici."
            />
            <StatCard
              icon={BarChart3}
              label="Prosječna ocjena"
              value={`${stats.avgScorePct}%`}
              subtitle="na svim ispitima"
              trend={stats.trendScore}
              href="/dashboard/statistics"
              tooltip="Prosjek postotka na završnim ispitima koje ste pokušali."
            />
          </div>

          <AnimatedBlock prefersReducedMotion={prefersReducedMotion} className="space-y-3" asSection>
            <DashboardSection title="Katalog dostupnog učenja" description="Odaberite oblast i karticu za pregled.">
              {null}
            </DashboardSection>

            <div
              className="scrollbar-hide -mx-1 flex gap-2 overflow-x-auto pb-1 pt-1"
              role="tablist"
              aria-label="Filtri oblasti programskog kataloga"
            >
              {DASHBOARD_CATEGORY_FILTERS.map((c) => {
                const active = selectedCategory === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setSelectedCategory(c.id)}
                    className={cn(
                      ds.focusRing,
                      "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                      active
                        ? "border-brand bg-brand/15 text-brand shadow-sm"
                        : "border-border/60 bg-surface-secondary/80 text-text-secondary hover:border-border hover:bg-surface-secondary hover:text-text-primary",
                    )}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>

            {catalogPending ? (
              <div
                className="grid animate-pulse gap-6 sm:grid-cols-2 xl:grid-cols-3"
                aria-busy
                aria-live="polite"
              >
                {["c1", "c2", "c3", "c4", "c5", "c6"].map((k) => (
                  <div key={k} className="h-96 rounded-xl bg-surface-secondary/80" />
                ))}
              </div>
            ) : catalogError && catalogErrFormatted ? (
              <DashboardWidget variant="dense">
                <p className="font-medium text-text-primary">{catalogErrFormatted.message}</p>
                <Button type="button" className="mt-3 bg-brand text-white hover:bg-brand/90" onClick={() => void refetchCatalog()}>
                  Pokušaj ponovo
                </Button>
                {import.meta.env.DEV && catalogErrFormatted.devDetail ? (
                  <pre className="mt-3 max-h-32 overflow-auto rounded border border-border/50 bg-surface-primary/40 p-2 font-mono text-[10px] text-text-muted">
                    {catalogErrFormatted.devDetail}
                  </pre>
                ) : null}
              </DashboardWidget>
            ) : (
              <div
                className="-mx-1 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-3 pt-1 scrollbar-thin sm:-mx-0 xl:mx-0 xl:grid xl:snap-none xl:grid-cols-3 xl:gap-6 xl:overflow-visible xl:pb-0"
                role="list"
                aria-label="Programi u katalogu"
              >
                {filteredCatalogCards.map((props) => (
                  <div
                    key={props.courseId}
                    className="w-[min(100%,340px)] shrink-0 snap-center sm:w-[308px] xl:w-auto xl:min-w-0"
                    role="listitem"
                  >
                    <CourseCard {...props} />
                  </div>
                ))}
              </div>
            )}
            {!catalogPending && !catalogError && filteredCatalogCards.length === 0 ? (
              <EnterpriseEmptyState
                id="learner-catalog-empty"
                icon={BookOpen}
                title="Nema programa u ovom filteru"
                description="Odaberite drugu oblast u traci iznad ili otvorite puni katalog — CONFORA i dalje filtrira programe prema pravima vašeg tijela."
                primary={[
                  { to: "/dashboard/courses", label: "Otvori katalog kurseva" },
                  { to: "/dashboard/support", label: "Podrška za pristup" },
                ]}
                secondary={{
                  label: "Resetiraj filter (sve oblasti)",
                  onClick: () => setSelectedCategory("all"),
                }}
              />
            ) : null}
          </AnimatedBlock>

          <AnimatedBlock prefersReducedMotion={prefersReducedMotion} className="space-y-4 xl:hidden">
            <div className="rounded-2xl border border-border/50 bg-surface-secondary/80 p-5 backdrop-blur-sm">
              <ActivityBlock activities={data.activities} />
            </div>
          </AnimatedBlock>
        </div>

        {prefersReducedMotion ? (
          <aside
            className="hidden w-full shrink-0 xl:block xl:w-[min(100%,320px)]"
            aria-label="Sažeta aktivnost učenja"
          >
            <div className="sticky top-4 rounded-2xl border border-border/50 bg-surface-secondary/80 p-5 backdrop-blur-sm">
              <ActivityBlock activities={data.activities} />
            </div>
          </aside>
        ) : (
          <motion.aside
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="hidden w-full shrink-0 xl:block xl:w-[min(100%,320px)]"
            aria-label="Sažeta aktivnost učenja"
          >
            <div className="sticky top-4 rounded-2xl border border-border/50 bg-surface-secondary/80 p-5 backdrop-blur-sm">
              <ActivityBlock activities={data.activities} />
            </div>
          </motion.aside>
        )}
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-[32] grid grid-cols-4 gap-0.5 border-t border-border/55 bg-surface-secondary/[0.96] pb-[max(0.55rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-md md:hidden"
        aria-label="Mobilne LMS akcije"
      >
        <Link
          to="/dashboard/courses"
          className={cn(
            ds.focusRing,
            "flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-[11px] font-medium text-text-secondary hover:bg-surface-primary/45 hover:text-brand",
          )}
        >
          <BookOpen className="h-5 w-5" aria-hidden />
          Kursevi
        </Link>
        <Link
          to="/dashboard/exams"
          className={cn(
            ds.focusRing,
            "flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-[11px] font-medium text-text-secondary hover:bg-surface-primary/45 hover:text-brand",
          )}
        >
          <ClipboardList className="h-5 w-5" aria-hidden />
          Ispiti
        </Link>
        <Link
          to="/dashboard/my-certificates"
          className={cn(
            ds.focusRing,
            "flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-[11px] font-medium text-text-secondary hover:bg-surface-primary/45 hover:text-brand",
          )}
        >
          <Award className="h-5 w-5" aria-hidden />
          Dokumenti
        </Link>
        <Link
          to="/dashboard/statistics"
          className={cn(
            ds.focusRing,
            "flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-[11px] font-medium text-text-secondary hover:bg-surface-primary/45 hover:text-brand",
          )}
        >
          <BarChart3 className="h-5 w-5" aria-hidden />
          Statistika
        </Link>
      </nav>

      <div className="pointer-events-none fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom,0px))] right-4 z-[34] md:bottom-8 md:right-8">
        <Button
          asChild
          size="lg"
          className="pointer-events-auto h-12 rounded-full bg-violet-600 px-4 text-white shadow-xl ring-2 ring-violet-500/25 hover:bg-violet-600/90"
        >
          <Link
            to="/dashboard/ai-tutor"
            className="inline-flex items-center gap-2"
            aria-label="Pitaj AI asistenta za učenje"
          >
            <Sparkles className="h-5 w-5 md:mr-0" aria-hidden />
            <span className="hidden md:inline">Pitaj AI asistenta</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
