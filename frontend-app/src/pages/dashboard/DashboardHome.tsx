import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Inbox } from "lucide-react";
import { DASHBOARD_NS } from "@confora/i18n";
import { useCallback, useMemo, useState, type JSX } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useOutletContext } from "react-router";

import type { CourseCardProps } from "@/components/CourseCard";
import {
  AppealsCommitteePanel,
  CertificationCommitteePanel,
  DirectorPanel,
  IsoGovernancePanel,
  SysAdminPanel,
  TechnicalCommitteePanel,
  TrainingAdminPanel,
  type GovernanceCockpitVariant,
} from "@/components/dashboard/DashboardRolePanels";
import { LearnerDashboardEnterprise } from "@/components/dashboard/enterprise/LearnerDashboardEnterprise";
import { Module1LearnerDashboard } from "@/components/dashboard/module1/Module1LearnerDashboard";
import { EnterpriseEmptyState, EnterprisePageShell } from "@/design-system";
import { Button } from "@/components/ui/button";
import { courseMatchesDashboardCategory, type DashboardCategoryId } from "@/lib/course-category-filters";
import {
  DASHBOARD_CONTEXT_QUERY_KEY,
  fetchDashboardContext,
  type DashboardPersona,
  type LearnerDashboardJson,
} from "@/lib/dashboard-context-api";
import type { DashboardActivity } from "@/lib/dashboard-home-api";
import { messagingForDashboardIdle } from "@/lib/dashboard-role-empty-copy";
import { fetchPublishedCourses } from "@/lib/catalog-api";
import type { CourseListRow } from "@/lib/enrich-course-detail";
import {
  courseRowPathwayFlags,
  getCourseListDescriptionPreview,
  pathwayTierForCourseRow,
} from "@/lib/enrich-course-detail";
import { formatUserFacingError } from "@/lib/user-facing-error";
import { isNestAuthPilotActive } from "@/lib/nest-auth-pilot";
import { useCourseStore } from "@/store/courseStore";

import type { DashboardOutletContext } from "./dashboard-outlet-context";

function PilotNestAuthDashboardHome(): JSX.Element {
  const { t } = useTranslation(DASHBOARD_NS);
  return (
    <EnterprisePageShell withBackdrop={false} className="relative min-h-[50vh] text-text-primary">
      <div className="pointer-events-none absolute inset-0 bg-grid-slate-700/05" aria-hidden />
      <Module1LearnerDashboard
        fallback={
          <EnterpriseEmptyState
            icon={Inbox}
            title={t("pilot.title")}
            description={t("pilot.unavailable")}
            primary={{ label: t("pilot.openCatalog"), to: "/courses" }}
          />
        }
      />
    </EnterprisePageShell>
  );
}

type LearnerHomeView = {
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

function normalizeActivityKind(raw: string): DashboardActivity["kind"] {
  if (raw === "lesson" || raw === "quiz" || raw === "enroll") {
    return raw;
  }
  return "lesson";
}

function mapLearnerJsonToHome(learner: LearnerDashboardJson): LearnerHomeView {
  const activities: DashboardActivity[] = (learner.activities ?? []).map((a) => ({
    id: a.id,
    kind: normalizeActivityKind(a.kind),
    title: a.title,
    courseTag: a.courseTag,
    timeLabel: a.timeLabel,
    ...(typeof a.detail === "string" && a.detail.length > 0 ? { detail: a.detail } : {}),
  }));
  return {
    heroSubtitle: learner.heroSubtitle,
    overallProgressPct: learner.overallProgressPct,
    continueCourseId: learner.continueCourseId ?? "",
    stats: {
      ...learner.stats,
      lastExamResultLabel: learner.stats.lastExamResultLabel ?? "",
    },
    activities,
  };
}



const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] },
  },
} as const;

const LEVELS = ["Pocetni", "Srednji", "Napredni", "Ekspertni"] as const;

const ROLE_LABELS: Record<string, string> = {
  candidate: "Polaznik",
  training_admin: "Administrator obuke",
  technical_committee: "Tehnički odbor",
  certification_committee: "Certifikacijski odbor",
  appeals_committee: "Žalbena komisija",
  iso_governance: "ISO / nadzor",
  director: "Uprava",
  sys_admin: "Sistem administrator",
  unknown: "Nepoznata uloga",
};

const ROLE_MISSION: Record<string, string> = {
  candidate: "Učenje, ispiti, prijava za certifikaciju i vaši dokumenti.",
  training_admin: "Programi obuke, upisi, ispitna spremnost i podrška polaznicima.",
  technical_committee: "Provjera sadržaja i baze pitanja prije aktivacije u nastavi.",
  certification_committee: "Formalne odluke o certifikaciji, nepristranosti i kvorumu.",
  appeals_committee: "Žalbe i pritužbe — odvojeno od certifikacijskog odbora.",
  iso_governance: "Certifikati, žalbe, pritužbe i otvoreni predmeti nadzora (CAPA, rizici, impartiality, audit).",
  director: "Strateški signal: certifikacija, financije i upravljanje rizikom.",
  sys_admin: "Stabilnost platforme, korisnici i sigurnosni trag.",
  unknown: "Vaša uloga nije prepoznata u sustavu. Obratite se administratoru da profil bude dodijeljen valjanoj ulozi.",
};

function workspaceMission(persona: string, role: string): string {
  const r = role.trim().toLowerCase();
  if (persona === "iso_governance" && r === "quality_manager") {
    return "Menadžment kvalitete: CAPA, rizici, kompetencije, nepristranost, strukturirani audit i management review — bez poslovnih odluka certifikacijskog odbora.";
  }
  return ROLE_MISSION[persona] ?? "Role-based radni prostor za dozvoljene akcije.";
}

function governanceCockpitRoleFromIso(isoRole: string): GovernanceCockpitVariant {
  const r = isoRole.trim().toLowerCase();
  if (r === "quality_manager") {
    return "quality_manager";
  }
  if (r === "internal_auditor" || r === "auditor") {
    return "auditor";
  }
  return "default";
}

function greetingForHour(): string {
  const h = new Date().getHours();
  if (h < 12) {
    return "Dobro jutro";
  }
  if (h < 18) {
    return "Dobar dan";
  }
  return "Dobra večer";
}

function firstName(full: string): string {
  const t = full.trim();
  if (!t) {
    return "Korisniku";
  }
  return t.split(/\s+/)[0] ?? t;
}

function normalizeLevel(raw: string): (typeof LEVELS)[number] {
  const t = raw.trim();
  if (LEVELS.includes(t as (typeof LEVELS)[number])) {
    return t as (typeof LEVELS)[number];
  }
  return "Srednji";
}

function RoleWorkspaceHeader({
  persona,
  role,
  isoRoleLabel,
  onRetry,
}: {
  readonly persona: string;
  readonly role: string;
  readonly isoRoleLabel: string;
  readonly onRetry?: () => void;
}): JSX.Element {
  const label = ROLE_LABELS[persona] ?? (role || "Korisnik");
  const mission = workspaceMission(persona, role);
  return (
    <motion.section variants={fadeUp} className="rounded-2xl border border-border/50 bg-surface-secondary/45 p-5 ring-1 ring-white/[0.04]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Vaš radni prostor</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-text-primary">{label}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-text-secondary">{mission}</p>
          <p className="mt-2 text-sm text-text-secondary">
            <span className="font-semibold text-text-primary">Uloga (ISO/IEC 17024): </span>
            {isoRoleLabel}
          </p>
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <div className="rounded-xl border border-brand/20 bg-brand/5 px-4 py-3 text-xs text-text-secondary">
            <p className="font-semibold text-text-primary">Pristup</p>
            <p className="mt-1">Vidite samo module dozvoljene vašoj ulozi. Osjetljive akcije traže dodatnu provjeru na serveru.</p>
          </div>
          {onRetry ? (
            <Button type="button" variant="outline" className="border-border/60" onClick={onRetry}>
              Osvježi podatke
            </Button>
          ) : null}
        </div>
      </div>
    </motion.section>
  );
}

function RoleEmptyState({
  persona,
  role,
  isoRole,
  onRefresh,
}: {
  readonly persona: DashboardPersona;
  readonly role: string;
  readonly isoRole: string;
  readonly onRefresh: () => void;
}): JSX.Element {
  const iso = isoRole.trim().toLowerCase() || role.trim().toLowerCase();
  const idle = messagingForDashboardIdle(persona, iso);
  const messaging =
    idle ?? {
      title: "Sažetak za ovu ulogu trenutno je prazan",
      description:
        "Kada sustav prikupi podatke za vašu ulogu, kartice će se pojaviti automatski. Do tada nastavite u modulima ispod ili osvježite prikaz.",
    };

  const actions: Partial<Record<DashboardPersona, readonly { readonly to: string; readonly label: string }[]>> = {
    training_admin: [
      { to: "/dashboard/admin/kreiraj-kurs", label: "Kreiraj edukaciju" },
      { to: "/dashboard/admin/item-bank", label: "Baza pitanja" },
    ],
    technical_committee: [
      { to: "/dashboard/admin/item-bank", label: "Baza pitanja" },
      { to: "/dashboard/admin/sadrzaj", label: "Sadržaj" },
    ],
    certification_committee: [
      { to: "/dashboard/iso/decisions", label: "Odluke odbora" },
      { to: "/dashboard/committee/pilot-applications", label: "Red prijava" },
    ],
    appeals_committee: [
      { to: "/dashboard/admin/support", label: "Tiketi" },
      { to: "/dashboard/iso/complaints", label: "Pritužbe" },
    ],
    iso_governance: [
      { to: "/dashboard/iso", label: "ISO hub" },
      { to: "/dashboard/knowledge", label: "Standards Intelligence" },
      { to: "/dashboard/iso/governance", label: "Governance" },
    ],
    director: [
      { to: "/dashboard/iso/governance", label: "Governance" },
      { to: "/dashboard/iso/reports", label: "Izvještaji" },
    ],
    sys_admin: [
      { to: "/dashboard/admin/console", label: "Konzola" },
      { to: "/dashboard/admin/audit-logs", label: "Audit trag" },
    ],
  };
  const items =
    actions[persona] ?? [
      { to: "/dashboard/courses", label: "Edukacije" },
      { to: "/dashboard/support", label: "Podrška" },
    ];

  const primaryHref =
    persona === "certification_committee"
      ? "/dashboard/committee/pilot-applications"
      : persona === "sys_admin"
        ? "/dashboard/admin/system-health"
        : persona === "iso_governance"
          ? "/dashboard/iso/governance"
          : items[0]?.to ?? "/dashboard/courses";
  const primaryLabel =
    persona === "certification_committee"
      ? "Red prijava odbora"
      : persona === "sys_admin"
        ? "Status sustava"
        : persona === "iso_governance"
          ? "Governance trag"
          : items[0]?.label ?? "Nastavi u modul";

  return (
    <div className="space-y-5">
      <EnterpriseEmptyState
        id={`role-dashboard-empty-${persona}`}
        icon={Inbox}
        title={messaging.title}
        description={messaging.description}
        primary={{ to: primaryHref, label: primaryLabel }}
        secondary={{ label: "Osvježi podatke", onClick: onRefresh }}
      />
      <div className="rounded-2xl border border-border/50 bg-surface-primary/35 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Česti sljedeći koraci</p>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group flex items-center justify-between gap-2 rounded-xl border border-border/55 bg-surface-secondary/35 px-3 py-2.5 text-sm font-semibold text-text-primary hover:border-brand/35"
            >
              {item.label}
              <ArrowRight className="h-4 w-4 shrink-0 text-text-muted transition group-hover:text-brand" aria-hidden />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function DashboardFallbackWorkspace({
  role,
  onRetry,
}: {
  readonly role: string;
  readonly onRetry: () => void;
}): JSX.Element {
  const normalizedRole = role.trim().toLowerCase() || "learner";
  const isSys = normalizedRole === "sys_admin";
  const isCommittee = ["tech_committee", "cert_committee", "appeals_committee"].includes(normalizedRole);
  const primaryActions = isSys
    ? [
        { to: "/dashboard/admin/system-health", label: "Status sustava", detail: "Pregled dostupnosti servisa i pozadinskih poslova." },
        { to: "/dashboard/admin/audit-logs", label: "Sigurnosni trag", detail: "Pregled značajnih događaja." },
        { to: "/dashboard/admin/users", label: "Korisnici", detail: "Registar korisnika platforme." },
      ]
    : isCommittee
      ? [
          { to: "/dashboard/iso/decisions", label: "Odluke odbora", detail: "Radni predmeti i historija odluka." },
          { to: "/dashboard/iso/reports", label: "Izvještaji", detail: "Sažeci prilagođeni vašoj ulozi." },
          { to: "/dashboard/support", label: "Podrška", detail: "Kontaktirajte operativni tim." },
        ]
      : [
          { to: "/dashboard/courses", label: "Kursevi", detail: "Nastavite učenje ili pronađite program." },
          { to: "/dashboard/exams", label: "Ispiti", detail: "Provjera spremnosti i pokušaja." },
          { to: "/dashboard/certification/status", label: "Status certifikacije", detail: "Gdje se nalazi vaša prijava." },
          { to: "/dashboard/finance", label: "Finansije", detail: "Fakture i stanje plaćanja." },
          { to: "/dashboard/my-certificates", label: "Moji dokumenti", detail: "Potvrde o ispitu i certifikati." },
          { to: "/dashboard/ai-tutor", label: "AI tutor", detail: "Pomoć pri učenju u kontekstu programa." },
        ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">Nadzorna ploča — ograničen prikaz</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-text-primary">Ne možemo učitati sve brojke</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-text-secondary">
          Sažetak za vašu ulogu trenutno nije dostupan. Ostali moduli i dalje rade unutar vaših ovlasti — odaberite akciju
          ispod ili pokušajte ponovo učitati nadzornu ploču.
        </p>
        <Button type="button" className="mt-5 bg-brand text-white hover:bg-brand/90" onClick={onRetry}>
          Pokušaj ponovo
        </Button>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {primaryActions.map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className="group rounded-xl border border-border/50 bg-surface-secondary/45 p-4 transition-colors hover:border-brand/40 hover:bg-brand/5"
          >
            <span className="flex items-center justify-between gap-3 text-sm font-semibold text-text-primary">
              {action.label}
              <ArrowRight className="h-4 w-4 text-text-muted transition-colors group-hover:text-brand" aria-hidden />
            </span>
            <span className="mt-1 block text-xs text-text-secondary">{action.detail}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function catalogRowToCardProps(row: CourseListRow): CourseCardProps {
  const openPanel = useCourseStore.getState().openPanel;
  const price = row.price ?? 0;
  const pf = courseRowPathwayFlags(row);
  return {
    courseId: row.courseId,
    title: row.title,
    slug: row.slug,
    thumbnailUrl:
      row.thumbnailUrl?.trim() ||
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=640&h=360&fit=crop",
    domain: row.domain?.trim() || "Općenito",
    level: normalizeLevel(String(row.level || "Srednji")),
    durationHours: row.durationHours || 1,
    modulesCount: row.moduleCount ?? 4,
    price,
    currency: "EUR",
    pathwayTier: pathwayTierForCourseRow(row),
    catalogStatus: String(row.status || "published"),
    hasFinalExam: pf.hasFinalExam,
    badges: [],
    shortDescription: getCourseListDescriptionPreview(row),
    ctaLabel: price > 0 ? "Kupi" : "Dodaj kurs",
    onClick: () => {
      openPanel(row.slug);
    },
    ctaTone: "brand",
  };
}

function DashboardSkeleton(): JSX.Element {
  const { t } = useTranslation(DASHBOARD_NS);
  return (
    <div
      className="animate-pulse space-y-8"
      aria-busy
      aria-label={t("loading")}
    >
      <div className="h-28 rounded-2xl bg-surface-secondary/80" />
      <div className="h-24 rounded-2xl bg-surface-secondary/80" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {["s1", "s2", "s3"].map((k) => (
          <div key={k} className="h-28 rounded-xl bg-surface-secondary/80" />
        ))}
      </div>
      <div className="h-12 rounded-full bg-surface-secondary/80" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {["a", "b", "c"].map((k) => (
          <div key={k} className="h-96 rounded-xl bg-surface-secondary/80" />
        ))}
      </div>
      <div className="h-64 rounded-xl bg-surface-secondary/80 xl:hidden" />
    </div>
  );
}

export default function DashboardHome(): JSX.Element {
  if (isNestAuthPilotActive()) {
    return <PilotNestAuthDashboardHome />;
  }
  return <LegacyDashboardHome />;
}

function LegacyDashboardHome(): JSX.Element {
  const { user } = useOutletContext<DashboardOutletContext>();
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion() ?? false;
  const [selectedCategory, setSelectedCategory] =
    useState<DashboardCategoryId>("all");

  const {
    data: ctx,
    isPending: ctxPending,
    isError: ctxError,
    error: ctxQueryError,
    refetch: refetchCtx,
  } = useQuery({
    queryKey: DASHBOARD_CONTEXT_QUERY_KEY,
    queryFn: fetchDashboardContext,
  });

  const {
    data: catalogRows,
    isPending: catalogPending,
    isError: catalogError,
    error: catalogQueryError,
    refetch: refetchCatalog,
  } = useQuery({
    queryKey: ["dashboard", "catalog", "courses"],
    queryFn: () => fetchPublishedCourses(),
  });

  const name = useMemo(() => firstName(user.name), [user.name]);
  const greet = useMemo(() => greetingForHour(), []);

  const goLearn = useCallback(
    (courseId: string) => {
      navigate(`/learn/${encodeURIComponent(courseId)}`);
    },
    [navigate],
  );

  const filteredCatalogCards = useMemo(() => {
    const rows = catalogRows ?? [];
    const filtered = rows.filter((row) =>
      courseMatchesDashboardCategory(row, selectedCategory),
    );
    return filtered.map(catalogRowToCardProps);
  }, [catalogRows, selectedCategory]);

  const catalogErrFormatted = useMemo(
    () => (catalogError ? formatUserFacingError(catalogQueryError) : null),
    [catalogError, catalogQueryError],
  );

  if (ctxPending) {
    return (
      <div className="relative min-h-[60vh] text-text-primary">
        <div
          className="pointer-events-none absolute inset-0 bg-grid-slate-700/05 opacity-90"
          aria-hidden
        />
        <DashboardSkeleton />
      </div>
    );
  }

  if (ctxError) {
    const { message, devDetail } = formatUserFacingError(ctxQueryError);
    return (
      <div className="relative min-h-[50vh] space-y-6 text-text-primary">
        <div className="pointer-events-none absolute inset-0 bg-grid-slate-700/05" aria-hidden />
        <div className="relative rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
          <p className="text-sm font-semibold text-text-primary">{message}</p>
          <Button
            type="button"
            className="mt-4 bg-brand text-white hover:bg-brand/90"
            onClick={() => void refetchCtx()}
          >
            Pokušaj ponovo
          </Button>
          {import.meta.env.DEV && devDetail ? (
            <pre className="mt-4 max-h-40 overflow-auto rounded-lg border border-border/50 bg-surface-primary/50 p-3 font-mono text-[11px] text-text-muted">
              {devDetail}
            </pre>
          ) : null}
        </div>
        <DashboardFallbackWorkspace role={user.role} onRetry={() => void refetchCtx()} />
      </div>
    );
  }

  if (ctx.persona === "unknown") {
    return (
      <div className="relative min-h-[50vh] text-text-primary">
        <div className="pointer-events-none absolute inset-0 bg-grid-slate-700/05" aria-hidden />
        <div className="relative space-y-6">
          <RoleWorkspaceHeader
            persona={ctx.persona}
            role={ctx.role}
            isoRoleLabel={ctx.isoRoleLabel}
            onRetry={() => void refetchCtx()}
          />
          <div className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.07] p-6 ring-1 ring-amber-500/15">
            <p className="text-sm font-medium text-text-primary">Vaša uloga nije prepoznata</p>
            <p className="mt-2 text-sm text-text-secondary">
              Kontaktirajte administratora da DynamoDB ulozi tijela za certifikaciju bude ispravno postavljena.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (ctx.persona !== "candidate") {
    const hasPayload =
      (ctx.persona === "training_admin" && ctx.trainingAdmin) ||
      (ctx.persona === "technical_committee" && ctx.technicalCommittee) ||
      (ctx.persona === "certification_committee" && ctx.certificationCommittee) ||
      (ctx.persona === "appeals_committee" && ctx.appealsCommittee) ||
      (ctx.persona === "iso_governance" && ctx.isoGovernance) ||
      (ctx.persona === "director" && ctx.director) ||
      (ctx.persona === "sys_admin" && ctx.sysAdmin);
    return (
      <EnterprisePageShell withBackdrop={false} className="relative min-h-[50vh] text-text-primary">
        <div className="pointer-events-none absolute inset-0 bg-grid-slate-700/05" aria-hidden />
        <div className="relative space-y-6">
          <RoleWorkspaceHeader
            persona={ctx.persona}
            role={ctx.role}
            isoRoleLabel={ctx.isoRoleLabel}
            onRetry={() => void refetchCtx()}
          />
          {!hasPayload ? (
            <RoleEmptyState
              persona={ctx.persona}
              role={ctx.role}
              isoRole={ctx.isoRole}
              onRefresh={() => void refetchCtx()}
            />
          ) : null}
          {ctx.persona === "training_admin" && ctx.trainingAdmin ? (
            <TrainingAdminPanel d={ctx.trainingAdmin} />
          ) : null}
          {ctx.persona === "technical_committee" && ctx.technicalCommittee ? (
            <TechnicalCommitteePanel d={ctx.technicalCommittee} />
          ) : null}
          {ctx.persona === "certification_committee" && ctx.certificationCommittee ? (
            <CertificationCommitteePanel d={ctx.certificationCommittee} />
          ) : null}
          {ctx.persona === "appeals_committee" && ctx.appealsCommittee ? (
            <AppealsCommitteePanel d={ctx.appealsCommittee} />
          ) : null}
          {ctx.persona === "iso_governance" && ctx.isoGovernance ? (
            <IsoGovernancePanel
              d={ctx.isoGovernance}
              governanceRole={governanceCockpitRoleFromIso(ctx.isoRole)}
            />
          ) : null}
          {ctx.persona === "director" && ctx.director ? <DirectorPanel d={ctx.director} /> : null}
          {ctx.persona === "sys_admin" && ctx.sysAdmin ? <SysAdminPanel d={ctx.sysAdmin} /> : null}
        </div>
      </EnterprisePageShell>
    );
  }

  if (!ctx.candidate) {
    return (
      <DashboardFallbackWorkspace role={user.role || "learner"} onRetry={() => void refetchCtx()} />
    );
  }

  const cand = ctx.candidate;
  const data = mapLearnerJsonToHome(cand.learner);

  return (
    <EnterprisePageShell withBackdrop={false} className="text-text-primary">
      <div className="pointer-events-none absolute inset-0 bg-grid-slate-700/05" aria-hidden />
      <Module1LearnerDashboard
        fallback={
          <LearnerDashboardEnterprise
            greet={greet}
            name={name}
            isoRoleLabel={ctx.isoRoleLabel}
            data={data}
            cand={cand}
            goLearn={goLearn}
            prefersReducedMotion={prefersReducedMotion}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            catalogPending={catalogPending}
            catalogError={catalogError}
            catalogErrFormatted={catalogErrFormatted}
            refetchCatalog={refetchCatalog}
            filteredCatalogCards={filteredCatalogCards}
          />
        }
      />
    </EnterprisePageShell>
  );
}
