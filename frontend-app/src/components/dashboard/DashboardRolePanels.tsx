import { motion } from "framer-motion";
import { lazy, Suspense } from "react";
import {
  Activity,
  AlertTriangle,
  Award,
  Ban,
  Briefcase,
  Building2,
  Calendar,
  ClipboardCheck,
  Clock,
  Coins,
  Gavel,
  Inbox,
  Scale,
  ScrollText,
  Shield,
  Sparkles,
  TrendingUp,
  UserRound,
} from "lucide-react";
import { useId, useMemo, type JSX, type ReactNode } from "react";
import { Link } from "react-router";

import { GovernanceCockpitHero } from "@/components/dashboard/enterprise/GovernanceCockpitHero";
import { StatCard } from "@/components/dashboard/StatCard";
import {
  CockpitSectionSkeleton,
  DashboardSection,
  DashboardWidget,
  EnterpriseAlertBanner,
  EnterpriseDataTable,
  EnterpriseEmptyState,
  EnterpriseKpiCard,
  EnterpriseQuickAction,
  EnterpriseSectionHeader,
  EnterpriseTimeline,
  EnterpriseWorkflowRibbon,
  ds,
} from "@/design-system";
import { Button } from "@/components/ui/button";
import type {
  AppealsCommitteeDashboardPayload,
  CertificationCommitteeDashboardPayload,
  DirectorDashboardPayload,
  IsoGovernanceDashboardPayload,
  SysAdminDashboardPayload,
  TechnicalCommitteeDashboardPayload,
  TrainingAdminDashboardPayload,
} from "@/lib/dashboard-context-api";
import { cn } from "@/lib/utils";

const TrainingAdminCockpitBody = lazy(() => import("./cockpit-bodies/TrainingAdminCockpitBody"));
const TechnicalCommitteeCockpitBody = lazy(() => import("./cockpit-bodies/TechnicalCommitteeCockpitBody"));
const CertificationCommitteeCockpitBody = lazy(() => import("./cockpit-bodies/CertificationCommitteeCockpitBody"));
const AppealsCommitteeCockpitBody = lazy(() => import("./cockpit-bodies/AppealsCommitteeCockpitBody"));

export type GovernanceCockpitVariant = "quality_manager" | "auditor" | "default";

function isoGovernancePanelShell(role: GovernanceCockpitVariant): {
  title: string;
  subtitle: string;
  heroTitle: string;
  heroSubtitle: string;
} {
  switch (role) {
    case "quality_manager":
      return {
        title: "Quality management cockpit",
        subtitle:
          "Compliance intelligence — CAPA, rizici, impartiality, MR i kompetencije iz istog governance dashboard payloada.",
        heroTitle: "Governance health & CAPA stream",
        heroSubtitle:
          "Menadžer kvalitete — KPI je identičan API-ju; duboki trag i workflow ostaju u ISO modulima.",
      };
    case "auditor":
      return {
        title: "Audit & compliance intelligence",
        subtitle:
          "Interni nadzor — sažetak rizika, prekoračenja rokova i životnog ciklusa certifikata u jednom Cockpit presjeku.",
        heroTitle: "Audit observability cockpit",
        heroSubtitle: "Isti brojevi kao governance API — strukturirani dokazi i audit trag u ISO stranicama.",
      };
    default:
      return {
        title: "ISO / nadzor i upravljanje",
        subtitle:
          "Presjek certifikata, žalbi, pritužbi, CAPA/NCR-a, rizika, nepristranosti, kompetencija i management reviewa za vašu organizaciju.",
        heroTitle: "Governance cockpit",
        heroSubtitle:
          "Brzi pogled na prekoračenja CAPA/NCR rizike, impartiality i MR — brojčane vrijednosti su identične API payloadu.",
      };
  }
}

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] },
  },
} as const;

function PanelShell({
  title,
  subtitle,
  hero,
  children,
}: {
  readonly title: string;
  readonly subtitle: string;
  readonly hero?: ReactNode;
  readonly children: ReactNode;
}): JSX.Element {
  const headingId = useId();
  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className="space-y-6"
      aria-labelledby={headingId}
    >
      <div className="rounded-2xl border border-border/50 bg-surface-secondary/60 p-6 backdrop-blur-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id={headingId} className="text-2xl font-bold tracking-tight text-text-primary">
              {title}
            </h2>
            <p className="mt-1 max-w-3xl text-sm text-text-secondary">{subtitle}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
            <Shield className="h-3.5 w-3.5" aria-hidden />
            Pristup po ulozi
          </span>
        </div>
      </div>
      {hero}
      {children}
    </motion.section>
  );
}

export function TrainingAdminPanel({ d }: { readonly d: TrainingAdminDashboardPayload }): JSX.Element {
  return (
    <PanelShell
      title="Learning operations center"
      subtitle="Operativni centar programa — polaznici, ispiti, kvaliteta i brze akcije; isti brojevi iz API dashboard konteksta."
    >
      <Suspense fallback={<CockpitSectionSkeleton />}>
        <TrainingAdminCockpitBody d={d} />
      </Suspense>
    </PanelShell>
  );
}

export function TechnicalCommitteePanel({ d }: { readonly d: TechnicalCommitteeDashboardPayload }): JSX.Element {
  return (
    <PanelShell
      title="Content validation center"
      subtitle="Tehnička validacija kurikuluma i baze pitanja — isti KPI iz dashboard konteksta, s vremenskom linijom i AI signalima."
    >
      <Suspense fallback={<CockpitSectionSkeleton />}>
        <TechnicalCommitteeCockpitBody d={d} />
      </Suspense>
    </PanelShell>
  );
}

export function CertificationCommitteePanel({
  d,
}: {
  readonly d: CertificationCommitteeDashboardPayload;
}): JSX.Element {
  return (
    <PanelShell
      title="Certification decision center"
      subtitle="Formalni certifikacijski odbor — red prijava, kvorum, COI i odluke; brojevi iz dashboard API-ja."
    >
      <Suspense fallback={<CockpitSectionSkeleton />}>
        <CertificationCommitteeCockpitBody d={d} />
      </Suspense>
    </PanelShell>
  );
}

export function AppealsCommitteePanel({ d }: { readonly d: AppealsCommitteeDashboardPayload }): JSX.Element {
  return (
    <PanelShell
      title="Dispute resolution center"
      subtitle="Žalbe i pritužbe — case management iz istih KPI polja; detalji su u ISO modulima."
    >
      <Suspense fallback={<CockpitSectionSkeleton />}>
        <AppealsCommitteeCockpitBody d={d} />
      </Suspense>
    </PanelShell>
  );
}

export function IsoGovernancePanel({
  d,
  governanceRole = "default",
}: {
  readonly d: IsoGovernanceDashboardPayload;
  readonly governanceRole?: GovernanceCockpitVariant;
}): JSX.Element {
  const shell = isoGovernancePanelShell(governanceRole);
  const capaOpen = d.capaOpenNonconformities ?? 0;
  const capaOd = d.capaOverdue ?? 0;
  const rHc = d.riskOpenHighCritical ?? 0;
  const rOd = d.riskOverdueReviews ?? 0;
  const impO = d.impartialityOpenThreats ?? 0;
  const impOd = d.impartialityOverdueReviews ?? 0;
  const mrOd = d.managementReviewOverdueActions ?? 0;
  const mrOpen = d.managementReviewOpenCycles ?? 0;
  const compDue = d.competenceProfilesDueValidity ?? 0;
  const insightRows = useMemo(
    () => [
      {
        id: "capa",
        cells: [
          "CAPA / NCR",
          String(capaOpen),
          capaOd > 0 ? `Prekoračen rok akcija: ${capaOd}` : "Rokovi bez kritičnog prekoračenja u KPI",
        ],
        severity: capaOd > 0 ? ("danger" as const) : capaOpen > 0 ? ("warning" as const) : ("success" as const),
        workflowLabel: "CAPA",
        href: "/dashboard/iso/capa",
      },
      {
        id: "risk",
        cells: [
          "Rizici HIGH/CRITICAL",
          String(rHc),
          rOd > 0 ? `Pregled rok: ${rOd} preko cilja` : "Periodični pregled u kontroli",
        ],
        severity: rHc > 0 ? ("danger" as const) : rOd > 0 ? ("warning" as const) : ("success" as const),
        workflowLabel: "Risk",
        href: "/dashboard/iso/risks",
      },
      {
        id: "imp",
        cells: [
          "Impartiality",
          String(impO),
          impOd > 0 ? `Pregled impartiality (rok): ${impOd}` : "Pregledi roka bez prekoračenja",
        ],
        severity: impO > 0 || impOd > 0 ? ("warning" as const) : ("success" as const),
        workflowLabel: "17024",
        href: "/dashboard/iso/impartiality",
      },
      {
        id: "life",
        cells: [
          "Certifikati / dispute",
          `${d.activeCertificates} / ${d.openAppeals + d.openComplaints}`,
          "Životni ciklus + žalba/pritužba u istom brzom presjeku",
        ],
        severity: d.openAppeals + d.openComplaints > 0 ? ("warning" as const) : ("success" as const),
        workflowLabel: "Lifecycle",
        href: "/dashboard/iso/certificates",
      },
    ],
    [
      capaOpen,
      capaOd,
      rHc,
      rOd,
      impO,
      impOd,
      d.activeCertificates,
      d.openAppeals,
      d.openComplaints,
    ],
  );
  const idle =
    d.activeCertificates === 0 &&
    d.openAppeals === 0 &&
    d.openComplaints === 0 &&
    d.openGovernanceCases === 0 &&
    capaOpen === 0 &&
    capaOd === 0 &&
    rHc === 0 &&
    rOd === 0 &&
    impO === 0 &&
    impOd === 0 &&
    mrOd === 0 &&
    mrOpen === 0 &&
    compDue === 0;
  return (
    <PanelShell
      title={shell.title}
      subtitle={shell.subtitle}
      hero={
        <GovernanceCockpitHero
          title={shell.heroTitle}
          subtitle={shell.heroSubtitle}
          metrics={[
            {
              label: "CAPA prekoračenja",
              value: capaOd,
              severity: capaOd > 0 ? "danger" : "success",
              href: "/dashboard/iso/capa",
            },
            {
              label: "Rizici HIGH/CRITICAL",
              value: rHc,
              severity: rHc > 0 ? "danger" : "success",
              href: "/dashboard/iso/risks",
            },
            {
              label: "Impartiality (aktivno)",
              value: impO,
              severity: impO > 0 ? "warning" : "success",
              href: "/dashboard/iso/impartiality",
            },
            {
              label: "MR akcije (rok)",
              value: mrOd,
              severity: mrOd > 0 ? "danger" : "success",
              href: "/dashboard/iso/management-review",
            },
          ]}
        />
      }
    >
      <EnterpriseWorkflowRibbon
        ariaLabel="Governance operativni tijek"
        stages={[
          {
            label: "Signali i certifikati",
            state: d.activeCertificates > 0 || d.openGovernanceCases > 0 ? "active" : "pending",
          },
          {
            label: "CAPA / rizik",
            state: capaOd > 0 || rHc > 0 || capaOpen > 0 ? "active" : "done",
          },
          {
            label: "Impartiality / MR",
            state: impOd > 0 || mrOd > 0 || impO > 0 ? "active" : "done",
          },
          {
            label: "Trend zatvaranja",
            state: idle ? "done" : "pending",
          },
        ]}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardWidget variant="dense" className="space-y-4 border-amber-500/10 bg-amber-500/[0.03]">
          <EnterpriseSectionHeader
            eyebrow="Risk/CAPA strip"
            title="Mikro-presjek neslaganja"
            description="Od istih brojčanih polja kao i KPI kartice."
            titleLevel="h3"
          />
          <div className={cn(ds.gridKpi, "!grid-cols-2 lg:!grid-cols-2")}>
            <EnterpriseKpiCard compact label="Otvoreni CAPA/NCR" value={capaOpen} hint="CAPA registar" />
            <EnterpriseKpiCard compact label="CAPA prekoračenja" value={capaOd} hint="rokovi akcije" />
            <EnterpriseKpiCard compact label="HIGH/CRITICAL rizici" value={rHc} hint="otvorenost" />
            <EnterpriseKpiCard compact label="Pregled rizika (rok)" value={rOd} hint="periodični pregled" />
          </div>
          {d.riskMitigationTrendLabel ? <p className="text-xs leading-relaxed text-text-muted">{d.riskMitigationTrendLabel}</p> : null}
        </DashboardWidget>
        <DashboardWidget variant="dense" className="space-y-4 border-brand/15">
          <EnterpriseSectionHeader
            eyebrow="Impartiality & MR"
            title="Nepristranost te management review"
            description="Za detaljni monitoring otvaraju se ISO moduli."
            titleLevel="h3"
          />
          <div className={cn(ds.gridKpi, "!grid-cols-2 lg:!grid-cols-2")}>
            <EnterpriseKpiCard compact label="Prijetnje (otv.)" value={impO} />
            <EnterpriseKpiCard compact label="Pregledi impartiality (rok)" value={impOd} />
            <EnterpriseKpiCard compact label="MR ciklusi" value={mrOpen} />
            <EnterpriseKpiCard compact label="MR akcije (rok)" value={mrOd} />
          </div>
          {d.competenceValiditySummaryLabel ? (
            <p className="text-xs text-text-muted">{d.competenceValiditySummaryLabel}</p>
          ) : null}
        </DashboardWidget>
      </div>

      <div className="space-y-3">
        <EnterpriseSectionHeader
          eyebrow="Management review strip"
          title="Efikasnost i nadolazeći ciklusi"
          titleLevel="h3"
          action={<EnterpriseQuickAction to="/dashboard/iso/management-review" label="Otvori MR modul" variant="outline" />}
        />
        <EnterpriseTimeline
          ariaLabel="Management review trag"
          items={[
            {
              id: "mr-open",
              title: `Otvoreni ciklusi: ${mrOpen}`,
              state: mrOpen > 0 ? "current" : "done",
              subtitle: mrOpen ? "Zahtjevaju zaključak ili dokumentaciju" : "Bez blokirajućih ciklusa u brzom pregledu",
            },
            {
              id: "mr-od",
              title: `Akcijske stavke s prekoračenim rokom: ${mrOd}`,
              state: mrOd > 0 ? "current" : "done",
            },
            {
              id: "comp",
              title: `Kompetencije (valjanost / 30 d): ${compDue}`,
              state: compDue > 0 ? "current" : "locked",
            },
          ]}
        />
      </div>

      <DashboardSection
        eyebrow="Analitika"
        title="Audit insights (KPI red)"
        description="Sažetak iz istih polja kao kartice — bez novog API obrasca; dubina u ISO modulima."
      >
        <EnterpriseDataTable
          ariaLabel="Governance audit insights"
          caption="Prioritet i workflow u jednom pregledu"
          columns={[
            { id: "a", header: "Oblast" },
            { id: "b", header: "KPI" },
            { id: "c", header: "Operativni status" },
          ]}
          rows={insightRows}
        />
      </DashboardSection>

      <EnterpriseSectionHeader
        eyebrow="Audit stream kompresija"
        title="Zapis iz governance sažetka"
        description="Nepregledava ABAC trag — samo eksplicitna bilješka iz API poziva ako postoji."
        titleLevel="h3"
      />
      <EnterpriseAlertBanner severity="info" icon={ScrollText} title="Governance / audit trag">
        {d.note || "Za strukturirane tragove pregledajte strukturirane ISO module i audit alate dostupne vašoj ulozi."}
      </EnterpriseAlertBanner>

      {idle ? (
        <EnterpriseEmptyState
          id="governance-idle"
          icon={Inbox}
          title="Operativni presjek je u mirnom stanju"
          description={
            <>
              Nema aktivnih KPI signala u ovom rezimu — tenant može biti u početnom stanju ili su svi predmeti zatvoreni u
              strukturiranim modulima. Za tragove i odluke otvorite{" "}
              <Link className="font-medium text-brand underline" to="/dashboard/iso">
                ISO modul
              </Link>
              .
              <span className="mt-3 block text-xs text-text-muted">
                AI-context: kada certifikati i CAPA porastu, cockpit će automatski pojačati severity trake — predikcija ne
                mijenja backend podatke.
              </span>
            </>
          }
          primary={[
            { label: "Otvori ISO modul", to: "/dashboard/iso" },
            { label: "Izvještaji", to: "/dashboard/iso/reports" },
          ]}
        />
      ) : null}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <StatCard
          icon={Award}
          label="Aktivni certifikati"
          value={d.activeCertificates}
          subtitle="važeći životni ciklus"
          trend={d.activeCertificates > 0 ? "up" : "down"}
          animateCount
          href="/dashboard/iso/certificates"
          tooltip="Broj važećih certifikacija osoba u ovom pregledu."
        />
        <StatCard
          icon={Gavel}
          label="Otvorene žalbe"
          value={d.openAppeals}
          subtitle="pred žalbenom komisijom"
          trend={d.openAppeals > 0 ? "down" : "up"}
          animateCount
          href="/dashboard/iso/appeals"
          tooltip="Žalbe koje još nisu zatvorene."
        />
        <StatCard
          icon={AlertTriangle}
          label="Otvoreni prigovori"
          value={d.openComplaints}
          subtitle="postupak i kvaliteta"
          trend={d.openComplaints > 0 ? "down" : "up"}
          animateCount
          href="/dashboard/iso/complaints"
          tooltip="Pritužbe u obradi."
        />
        <StatCard
          icon={Briefcase}
          label="Predmeti nadzora"
          value={d.openGovernanceCases}
          subtitle="nisu zatvoreni"
          trend={d.openGovernanceCases > 0 ? "down" : "up"}
          animateCount
          href="/dashboard/iso/governance"
          tooltip="Interni predmeti upravljanja koji još traju."
        />
        <StatCard
          icon={ClipboardCheck}
          label="Otvorene NCR (CAPA)"
          value={capaOpen}
          subtitle="neusaglašenosti"
          trend={capaOpen > 0 ? "down" : "up"}
          animateCount
          href="/dashboard/iso/capa"
          tooltip="Broj otvorenih neusaglašenosti za tenant (ISO governance)."
        />
        <StatCard
          icon={AlertTriangle}
          label="CAPA / rokovi"
          value={capaOd}
          subtitle="prekoračenja"
          trend={capaOd > 0 ? "down" : "up"}
          animateCount
          href="/dashboard/iso/capa"
          tooltip="Prekoračeni rokovi NCR ili CAPA akcija."
        />
        <StatCard
          icon={Shield}
          label="Rizici HIGH/CRITICAL"
          value={rHc}
          subtitle="otvoreni registar"
          trend={rHc > 0 ? "down" : "up"}
          animateCount
          href="/dashboard/iso/risks"
          tooltip="Otvoreni formalni rizici ocjene HIGH ili CRITICAL."
        />
        <StatCard
          icon={Clock}
          label="Pregled rizika"
          value={rOd}
          subtitle="prekoračen rok"
          trend={rOd > 0 ? "down" : "up"}
          animateCount
          href="/dashboard/iso/risks"
          tooltip="Rokovi periodičkog pregleda u ISO registru rizika."
        />
        <StatCard
          icon={Scale}
          label="Impartiality — otvoreno"
          value={impO}
          subtitle="prijetnje u aktivnom radu"
          trend={impO > 0 ? "down" : "up"}
          animateCount
          href="/dashboard/iso/impartiality"
          tooltip="Broj prijetnji nepristranosti koje još nisu zatvorene."
        />
        <StatCard
          icon={Calendar}
          label="Management review"
          value={mrOpen}
          subtitle="otvorenih ciklusa"
          trend={mrOpen > 0 ? "down" : "up"}
          animateCount
          href="/dashboard/iso/management-review"
          tooltip="Pregledi rukovodstva koji nisu zaključeni ili arhivirani."
        />
        <StatCard
          icon={ClipboardCheck}
          label="MR akcije — rok"
          value={mrOd}
          subtitle="prekoračenja"
          trend={mrOd > 0 ? "down" : "up"}
          animateCount
          href="/dashboard/iso/management-review"
          tooltip="Akcijske stavke management reviewa s prekoračenim ciljnim datumom."
        />
        <StatCard
          icon={UserRound}
          label="Kompetencije"
          value={compDue}
          subtitle="istek valjanosti (30 d)"
          trend={compDue > 0 ? "down" : "up"}
          animateCount
          href="/dashboard/iso/competence"
          tooltip="Profili aktivne valjanosti s istekom u prozoru 30 dana (ili isteklim datumom)."
        />
      </div>
      {d.riskMitigationTrendLabel ? (
        <p className="rounded-xl border border-border/50 bg-surface-secondary/40 px-4 py-3 text-xs text-text-secondary">
          {d.riskMitigationTrendLabel}
        </p>
      ) : null}
      {d.capaEffectivenessTrendLabel ? (
        <p className="rounded-xl border border-border/50 bg-surface-secondary/40 px-4 py-3 text-xs text-text-secondary">
          {d.capaEffectivenessTrendLabel}
        </p>
      ) : null}
      {d.competenceValiditySummaryLabel ? (
        <p className="rounded-xl border border-border/50 bg-surface-secondary/40 px-4 py-3 text-xs text-text-secondary">
          {d.competenceValiditySummaryLabel}
        </p>
      ) : null}
      {d.managementReviewEffectivenessSampleLabel ? (
        <p className="rounded-xl border border-border/50 bg-surface-secondary/40 px-4 py-3 text-xs text-text-secondary">
          {d.managementReviewEffectivenessSampleLabel}
        </p>
      ) : null}
      {d.note ? (
        <p className="rounded-xl border border-border/50 bg-surface-secondary/40 px-4 py-3 text-xs text-text-secondary">
          {d.note}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <Button asChild type="button" className="bg-brand text-white hover:bg-brand/90">
          <Link to="/dashboard/iso">ISO modul</Link>
        </Button>
        <Button asChild type="button" variant="outline" className="border-border/60">
          <Link to="/dashboard/iso/governance">Upravljanje i rokovi</Link>
        </Button>
        <EnterpriseQuickAction to="/dashboard/iso/audit" label="Audit modul" variant="outline" />
        <EnterpriseQuickAction to="/dashboard/iso/reports" label="Governance izvještaj" variant="outline" />
        <EnterpriseQuickAction to="/dashboard/iso/risks" label="Rizici" variant="outline" />
      </div>
    </PanelShell>
  );
}

export function DirectorPanel({ d }: { readonly d: DirectorDashboardPayload }): JSX.Element {
  return (
    <PanelShell
      title="Uprava — strateški pregled"
      subtitle="Financijski presjek, izdani certifikati i signal upravljanja za brzu procjenu stanja."
      hero={
        <GovernanceCockpitHero
          title="Executive command desk"
          subtitle="Upravljački presjek overdue i etičkih signala zajedno s prihodom tenant-a."
          metrics={[
            {
              label: "Prekoračen rok",
              value: d.governanceOverdue,
              severity: d.governanceOverdue > 0 ? "danger" : "success",
              href: "/dashboard/iso/governance",
            },
            {
              label: "Etički predmeti",
              value: d.governanceOpenEthics,
              severity: d.governanceOpenEthics > 0 ? "warning" : "success",
              href: "/dashboard/iso/governance",
            },
            {
              label: "CAPA prekoračenja",
              value: d.capaOverdue ?? 0,
              severity: (d.capaOverdue ?? 0) > 0 ? "warning" : "success",
              href: "/dashboard/iso/governance",
            },
            {
              label: "Prihod (EUR)",
              value: d.revenuePaidTotalEur.toFixed(0),
              href: "/dashboard/billing",
            },
          ]}
        />
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          icon={Coins}
          label="Prihodi (plaćeno)"
          value={`${d.revenuePaidTotalEur.toFixed(2)} €`}
          subtitle="iz naplate u organizaciji"
          trend={d.revenuePaidTotalEur > 0 ? "up" : "down"}
          href="/dashboard/billing"
          tooltip="Ukupno naplaćeno prema dostupnim fakturama."
        />
        <StatCard
          icon={Award}
          label="Izdane certifikacije osobe"
          value={d.personCertificationsIssued}
          subtitle={`ukupno zapisa u registru: ${d.certificatesTotalSampled}`}
          trend="up"
          animateCount
          href="/dashboard/iso/certificates"
          tooltip="Broj izdatih certifikacija osoba u registru."
        />
        <StatCard
          icon={TrendingUp}
          label="Trend izdavanja"
          value={
            d.certificatesTrendLabel.length > 48
              ? `${d.certificatesTrendLabel.slice(0, 48)}…`
              : d.certificatesTrendLabel
          }
          subtitle="usporedba s prošlim razdobljem"
          trend="up"
          href="/dashboard/iso/reports"
          tooltip="Kretanje broja izdanih certifikata u odnosu na prethodno razdoblje."
        />
        <StatCard
          icon={AlertTriangle}
          label="Prekoračen rok"
          value={d.governanceOverdue}
          subtitle="obveze nadzora"
          trend={d.governanceOverdue > 0 ? "down" : "up"}
          animateCount
          href="/dashboard/iso/governance"
          tooltip="Predmeti gdje je rok već prošao."
        />
        <StatCard
          icon={Scale}
          label="Etički predmeti"
          value={d.governanceOpenEthics}
          subtitle="otvoreno"
          trend={d.governanceOpenEthics > 0 ? "down" : "up"}
          animateCount
          href="/dashboard/iso/governance"
          tooltip="Etička pitanja koja još nisu zatvorena."
        />
        <StatCard
          icon={ScrollText}
          label="Potvrde o položenom ispitu"
          value={d.examPassCertificatesIssued}
          subtitle="dokaz o polaganju"
          trend="up"
          animateCount
          href="/dashboard/iso/certificates"
          tooltip="Broj izdatih potvrda o uspješnom ispitu — nije isto što i certifikacija osobe."
        />
        <StatCard
          icon={Ban}
          label="Suspenzije i opozivi"
          value={d.suspensionsRevocations}
          subtitle="važeće sankcije"
          trend={d.suspensionsRevocations > 0 ? "down" : "up"}
          animateCount
          href="/dashboard/iso/governance"
          tooltip="Broj mjera koje privremeno ili trajno ukidaju važenje certifikata."
        />
      </div>
      {d.governanceRiskTrendLabel ? (
        <p className="rounded-xl border border-border/40 bg-surface-secondary/50 px-4 py-3 text-sm text-text-secondary">
          <span className="font-semibold text-text-primary">Governance (CAPA): </span>
          {d.governanceRiskTrendLabel}
        </p>
      ) : null}
      {d.capaClosureRateLabel ? (
        <p className="rounded-xl border border-border/40 bg-surface-secondary/50 px-4 py-3 text-sm text-text-secondary">
          <span className="font-semibold text-text-primary">CAPA zatvaranje: </span>
          {d.capaClosureRateLabel}
        </p>
      ) : null}
      {d.riskAcceptedCritical != null && d.riskAcceptedCritical > 0 ? (
        <p className="rounded-xl border border-border/40 bg-surface-secondary/50 px-4 py-3 text-sm text-text-secondary">
          <span className="font-semibold text-text-primary">Prihvaćeni CRITICAL rizici: </span>
          {d.riskAcceptedCritical}
        </p>
      ) : null}
      {d.riskGovernanceExposureLabel ? (
        <p className="rounded-xl border border-border/40 bg-surface-secondary/50 px-4 py-3 text-sm text-text-secondary">
          <span className="font-semibold text-text-primary">Governance ekspozicija (rizici): </span>
          {d.riskGovernanceExposureLabel}
        </p>
      ) : null}
      {d.riskReductionTrendLabel ? (
        <p className="rounded-xl border border-border/40 bg-surface-secondary/50 px-4 py-3 text-sm text-text-secondary">
          <span className="font-semibold text-text-primary">Smanjenje residual rizika: </span>
          {d.riskReductionTrendLabel}
        </p>
      ) : null}
      <p className="rounded-xl border border-border/40 bg-surface-secondary/50 px-4 py-3 text-sm text-text-secondary">
        <span className="font-semibold text-text-primary">Rizici: </span>
        {d.strategicRisksPlaceholder}
      </p>
      {d.governanceAlerts.length > 0 ? (
        <ul className="space-y-2 text-sm text-amber-100">
          {d.governanceAlerts.map((a) => (
            <li
              key={a}
              className={cn("rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2")}
            >
              {a}
            </li>
          ))}
        </ul>
      ) : null}
      <Button asChild type="button" variant="outline" className="border-border/60">
        <Link to="/dashboard/iso/governance">Upravljanje</Link>
      </Button>
    </PanelShell>
  );
}

export function SysAdminPanel({ d }: { readonly d: SysAdminDashboardPayload }): JSX.Element {
  const topRoles = Object.entries(d.roleDistribution)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  return (
    <PanelShell
      title="Platform operativni centar"
      subtitle="Tehnički nadzor: dostupnost API-ja, tragovi, distribucija uloga i infrastrukturni signal — bez certifikacijskih odluka odbora."
      hero={
        <GovernanceCockpitHero
          surface="technical"
          title="Operations & security observability"
          subtitle="Živi brojevi iz SysAdmin payloada. Certifikacijske odluke ostaju u governance modulima; ovdje vidite operativni sloj."
          metrics={[
            {
              label: "API status",
              value: d.apiStatus,
              severity: d.apiStatus === "ok" ? "success" : "danger",
              href: "/dashboard/admin/system-health",
            },
            {
              label: "Osjetljivi audit trag",
              value: d.auditSensitiveFlags,
              severity: d.auditSensitiveFlags > 0 ? "warning" : "success",
              href: "/dashboard/admin/audit-logs",
              hint: "signal za dodatnu analizu ABAC pravila ili anomalije",
            },
            {
              label: "Audit zapisi (nedavno)",
              value: d.auditEventsRecent,
              href: "/dashboard/admin/audit-logs",
            },
            {
              label: "Javna provjera (24 h)",
              value: d.verificationHits24h,
              href: "/dashboard/iso/certificates",
            },
          ]}
        />
      }
    >
      <div className="grid gap-3 md:grid-cols-2">
        <DashboardWidget variant="dense" className="border-sky-500/22 bg-surface-primary/35">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-300">Queue / worker health</p>
          <p className="mt-2 font-mono text-sm leading-snug text-text-primary">{d.jobStatusLabel}</p>
          <div className="mt-3">
            <EnterpriseQuickAction to="/dashboard/admin/jobs" label="Otvori poslove" variant="outline" />
          </div>
        </DashboardWidget>
        <DashboardWidget variant="dense" className="border-sky-500/22 bg-surface-primary/35">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-300">Integracije i vanjski servisi</p>
          <p className="mt-2 break-words font-mono text-sm leading-snug text-text-primary">{d.integrationStatusLabel}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <EnterpriseQuickAction to="/dashboard/admin/system-health" label="System health" />
            <EnterpriseQuickAction to="/dashboard/admin/console" label="Konfiguracija platforme" variant="outline" />
          </div>
        </DashboardWidget>
      </div>
      <EnterpriseAlertBanner severity="warning" icon={Shield} title="Sigurnosni trag i volumen zapisa">
        Uzorak nedavnih audit događaja: {d.auditEventsRecent}. Osjetljive zastavice: {d.auditSensitiveFlags}. Koristite audit
        modul za detaljan ABAC trag (ovdje samo KPI).
      </EnterpriseAlertBanner>
      <EnterpriseAlertBanner severity="info" icon={Sparkles} title="AI governance (UX standard, bez automatizacije)">
        AI predlozi ne izvršavaju se sami — svi kritični koraci ostaju uz ljudsku potvrdu ili postojeće workflow module.
      </EnterpriseAlertBanner>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={UserRound}
          label="Registrirani korisnici"
          value={d.usersSampled}
          subtitle="u ovom pregledu"
          trend="up"
          animateCount
          href="/dashboard/admin/users"
          tooltip="Broj korisničkih profila uključenih u brzi pregled."
        />
        <StatCard
          icon={Building2}
          label="Aktivni nalozi organizacija"
          value={d.tenantsActive}
          subtitle="aktivna pretplata"
          trend={d.tenantsActive > 0 ? "up" : "down"}
          animateCount
          href="/dashboard/admin/tenants"
          tooltip="Organizacije s aktivnim statusom u sustavu."
        />
        <StatCard
          icon={Activity}
          label="Status API-ja"
          value={d.apiStatus}
          subtitle="dostupnost servisa"
          trend={d.apiStatus === "ok" ? "up" : "down"}
          href="/dashboard/admin/system-health"
          tooltip="Signal je li glavni API dostupan."
        />
        <StatCard
          icon={ClipboardCheck}
          label="Pozadinski poslovi"
          value={d.jobStatusLabel}
          subtitle="izvršavanje zadataka"
          trend="up"
          href="/dashboard/admin/jobs"
          tooltip="Stanje obrade pozadinskih zadataka."
        />
        <StatCard
          icon={Shield}
          label="Integracije"
          value={
            d.integrationStatusLabel.length > 36
              ? `${d.integrationStatusLabel.slice(0, 36)}…`
              : d.integrationStatusLabel
          }
          subtitle="vanjski servisi"
          trend="up"
          href="/dashboard/admin/system-health"
          tooltip="Sažetak povezanih integracija i obavijesti."
        />
        <StatCard
          icon={ScrollText}
          label="Zapisi u audit tragu"
          value={d.auditEventsRecent}
          subtitle="nedavna aktivnost"
          trend="up"
          animateCount
          href="/dashboard/admin/audit-logs"
          tooltip="Broj značajnih događaja u kratkom razdoblju."
        />
        <StatCard
          icon={AlertTriangle}
          label="Osjetljive radnje"
          value={d.auditSensitiveFlags}
          subtitle="označeno za pregled"
          trend={d.auditSensitiveFlags > 0 ? "down" : "up"}
          animateCount
          href="/dashboard/admin/audit-logs"
          tooltip="Dogodi za koje je potrebna dodatna pažnja."
        />
        <StatCard
          icon={Award}
          label="Javne provjere certifikata"
          value={d.verificationHits24h}
          subtitle="u posljednja 24 sata"
          trend="up"
          animateCount
          href="/dashboard/iso/certificates"
          tooltip="Broj provjera autentičnosti certifikata u kratkom razdoblju."
        />
      </div>
      <div className="rounded-xl border border-border/50 bg-surface-secondary/40 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Integracije — detalji</p>
        <p className="mt-1 break-words text-sm text-text-primary">{d.integrationStatusLabel}</p>
        {topRoles.length > 0 ? (
          <ul className="mt-3 grid gap-1 text-sm text-text-secondary sm:grid-cols-2">
            {topRoles.map(([role, n]) => (
              <li key={role}>
                <span className="font-medium text-text-primary">{role}</span>
                {": "}
                {n}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-text-muted">Distribucija uloga nije dostupna.</p>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button asChild type="button" className="bg-brand text-white hover:bg-brand/90">
          <Link to="/dashboard/admin/console">Sistemska konzola</Link>
        </Button>
        <Button asChild type="button" variant="outline" className="border-border/60">
          <Link to="/dashboard/admin/audit-logs">Audit trag</Link>
        </Button>
        <Button asChild type="button" variant="outline" className="border-border/60">
          <Link to="/dashboard/admin/users">Registar korisnika</Link>
        </Button>
      </div>
    </PanelShell>
  );
}
