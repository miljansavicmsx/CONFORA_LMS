import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Gavel,
  Scale,
  ScrollText,
  Users,
  XCircle,
} from "lucide-react";
import { useMemo, type JSX } from "react";
import { Link } from "react-router";

import { GovernanceCockpitHero } from "@/components/dashboard/enterprise/GovernanceCockpitHero";
import { StatCard } from "@/components/dashboard/StatCard";
import {
  DashboardSection,
  DashboardWidget,
  EnterpriseDataTable,
  EnterpriseQuickAction,
  EnterpriseSectionHeader,
  EnterpriseTimeline,
  EnterpriseWorkflowRibbon,
} from "@/design-system";
import type { CertificationCommitteeDashboardPayload } from "@/lib/dashboard-context-api";

export default function CertificationCommitteeCockpitBody({
  d,
}: {
  readonly d: CertificationCommitteeDashboardPayload;
}): JSX.Element {
  const decisionRows = useMemo(
    () => [
      {
        id: "q",
        cells: ["Red prijava", String(d.applicationsPendingQueue), "Čeka raspored odbora"],
        severity: d.applicationsPendingQueue > 0 ? ("warning" as const) : ("success" as const),
        workflowLabel: "Queue",
        href: "/dashboard/committee/pilot-applications",
      },
      {
        id: "rev",
        cells: ["Formalni pregled", String(d.applicationsInReview), "Predmet u odboru"],
        severity: d.applicationsInReview > 0 ? ("info" as const) : ("success" as const),
        workflowLabel: "Review",
        href: "/dashboard/committee/pilot-applications",
      },
      {
        id: "elig",
        cells: ["Spremno za glas", String(d.applicationsEligible), "Kompetencije / dokazi u postupku"],
        severity: d.applicationsEligible > 0 ? ("warning" as const) : ("success" as const),
        href: "/dashboard/committee/pilot-applications",
      },
      {
        id: "dec",
        cells: ["Odluke u radu", String(d.decisionsOpen), "Nisu zaključene"],
        severity: d.decisionsOpen > 0 ? ("warning" as const) : ("success" as const),
        href: "/dashboard/committee/decisions",
      },
    ],
    [d],
  );

  const coiRows = useMemo(
    () => [
      {
        id: "coi",
        cells: [
          "Nepotpun COI",
          String(d.decisionsCoiIncomplete),
          "Blokira glasanje dok se ne dopuni izjava",
        ],
        severity: d.decisionsCoiIncomplete > 0 ? ("danger" as const) : ("success" as const),
        href: "/dashboard/committee/decisions",
      },
      {
        id: "quorum",
        cells: ["Čeka kvorum", String(d.decisionsQuorumPending), "Broj glasova ispod pravila"],
        severity: d.decisionsQuorumPending > 0 ? ("warning" as const) : ("success" as const),
        href: "/dashboard/iso/decisions",
      },
    ],
    [d.decisionsCoiIncomplete, d.decisionsQuorumPending],
  );

  return (
    <div className="space-y-8">
      <GovernanceCockpitHero
        title="Certification decision center"
        subtitle="Operativni KPI iste vrijednosti kao API — odluke, kvorum, COI i formalni pregled."
        metrics={[
          {
            label: "Prijave na čekanju",
            value: d.applicationsPendingQueue,
            href: "/dashboard/committee/pilot-applications",
          },
          {
            label: "Kvorum (pending)",
            value: d.decisionsQuorumPending,
            severity: d.decisionsQuorumPending > 0 ? "warning" : "success",
            href: "/dashboard/iso/decisions",
          },
          {
            label: "COI nepotpuno",
            value: d.decisionsCoiIncomplete,
            severity: d.decisionsCoiIncomplete > 0 ? "warning" : "success",
            href: "/dashboard/committee/decisions",
          },
          {
            label: "U pregledu",
            value: d.applicationsInReview,
            href: "/dashboard/committee/pilot-applications",
          },
        ]}
      />

      <EnterpriseWorkflowRibbon
        ariaLabel="Certification decision workflow"
        stages={[
          { label: "Podneseno", state: d.applicationsPendingQueue > 0 ? "active" : "pending" },
          { label: "Screening", state: d.applicationsInReview > 0 ? "active" : "pending" },
          { label: "Odbor", state: d.decisionsReviewStarted > 0 ? "active" : "pending" },
          { label: "Glasanje", state: d.decisionsQuorumPending > 0 ? "active" : "pending" },
          { label: "Odluka", state: d.decisionsTodayTotal > 0 ? "done" : "pending" },
        ]}
      />

      <DashboardSection
        eyebrow="Decision queue"
        title="Operativni red odluka"
        description="Sažetak kandidata / dokaza je u modulima — ovdje prioritet i brojčane vrijednosti."
      >
        <EnterpriseDataTable
          ariaLabel="Tablica reda odluka"
          caption="Red certifikacijskih predmeta"
          columns={[
            { id: "x", header: "Tok" },
            { id: "y", header: "KPI" },
            { id: "z", header: "Komentar" },
          ]}
          rows={decisionRows}
        />
      </DashboardSection>

      <DashboardSection eyebrow="COI & nepristranost" title="Impartiality strip" description="Znaci blokade transparentno iz istih brojki.">
        <EnterpriseDataTable
          ariaLabel="COI tablica"
          caption="COI i glasanje"
          columns={[
            { id: "a", header: "Signal" },
            { id: "b", header: "Broj" },
            { id: "c", header: "Efekat" },
          ]}
          rows={coiRows}
        />
        <p className="mt-3 rounded-xl border border-brand/20 bg-brand/5 px-4 py-3 text-sm text-text-secondary">{d.coiReminder}</p>
      </DashboardSection>

      <EnterpriseSectionHeader
        titleLevel="h3"
        eyebrow="Decision timeline"
        title="Formalni trag (pojednostavljeno)"
      />
      <EnterpriseTimeline
        ariaLabel="Tijek odluke o certifikaciji"
        items={[
          { id: "t1", title: "Podnošenje prijave", state: "done", subtitle: "Portal kandidata" },
          { id: "t2", title: "Screening dokumentacije", state: d.applicationsPendingQueue > 0 ? "current" : "done" },
          { id: "t3", title: "Pregled odbora", state: d.applicationsInReview > 0 ? "current" : "locked" },
          { id: "t4", title: "Glasanje / kvorum", state: d.decisionsQuorumPending > 0 ? "current" : "locked" },
          {
            id: "t5",
            title: "Odluka (danas)",
            state: d.decisionsTodayTotal > 0 ? "current" : "locked",
            subtitle: `Odobreno ${d.decisionsTodayApproved} · Odbijeno ${d.decisionsTodayRejected}`,
          },
        ]}
      />

      <div>
        <EnterpriseSectionHeader titleLevel="h3" eyebrow="Quick actions" title="Sljedeći koraci odbora" />
        <div className="flex flex-wrap gap-2">
          <EnterpriseQuickAction to="/dashboard/committee/pilot-applications" label="Otvori prijavu" />
          <EnterpriseQuickAction to="/dashboard/iso/decisions" label="Pregled dokaza" variant="outline" />
          <EnterpriseQuickAction to="/dashboard/committee/decisions" label="Glasanje / odluka" variant="outline" />
          <EnterpriseQuickAction to="/dashboard/iso/impartiality" label="COI deklaracije" variant="outline" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          icon={Clock}
          label="Prijave na čekanju"
          value={d.applicationsPendingQueue}
          subtitle="očekuju obradu"
          trend={d.applicationsPendingQueue > 0 ? "up" : "down"}
          animateCount
          href="/dashboard/committee/pilot-applications"
          tooltip="Nove ili neoobrađene prijave kandidata."
        />
        <StatCard
          icon={CheckCircle2}
          label="U formalnom pregledu"
          value={d.applicationsInReview}
          subtitle="odbor razmatra predmet"
          trend={d.applicationsInReview > 0 ? "up" : "down"}
          animateCount
          href="/dashboard/committee/pilot-applications"
          tooltip="Prijave koje su trenutno u postupku pregleda."
        />
        <StatCard
          icon={Calendar}
          label="Odluke danas"
          value={d.decisionsTodayTotal}
          subtitle="ukupno donesenih odluka"
          trend={d.decisionsTodayTotal > 0 ? "up" : "down"}
          animateCount
          href="/dashboard/iso/decisions"
          tooltip="Broj konačnih odluka donesenih danas."
        />
        <StatCard
          icon={CheckCircle2}
          label="Odobreno danas"
          value={d.decisionsTodayApproved}
          subtitle="pozitivne odluke"
          trend="up"
          animateCount
          href="/dashboard/iso/decisions"
          tooltip="Broj prijava odobrenih danas."
        />
        <StatCard
          icon={XCircle}
          label="Odbijeno danas"
          value={d.decisionsTodayRejected}
          subtitle="negativne odluke"
          trend={d.decisionsTodayRejected > 0 ? "down" : "up"}
          animateCount
          href="/dashboard/iso/decisions"
          tooltip="Broj prijava odbijenih danas."
        />
        <StatCard
          icon={Gavel}
          label="Spremno za odluku"
          value={d.applicationsEligible}
          subtitle="čeka formalnu odluku odbora"
          trend={d.applicationsEligible > 0 ? "up" : "down"}
          animateCount
          href="/dashboard/committee/pilot-applications"
          tooltip="Predmeti koji ispunjavaju uvjete za glasanje ili potpis."
        />
        <StatCard
          icon={Scale}
          label="Odluke u pripremi"
          value={d.decisionsOpen}
          subtitle="još nisu zatvorene"
          trend={d.decisionsOpen > 0 ? "down" : "up"}
          animateCount
          href="/dashboard/committee/decisions"
          tooltip="Odluke koje su otvorene i čekaju raspravu ili glasove."
        />
        <StatCard
          icon={ClipboardCheck}
          label="Pregled odbora započet"
          value={d.decisionsReviewStarted}
          subtitle="u radu"
          trend="up"
          animateCount
          href="/dashboard/committee/decisions"
          tooltip="Predmeti u kojima je formalni pregled već pokrenut."
        />
        <StatCard
          icon={AlertTriangle}
          label="Nepotpun COI"
          value={d.decisionsCoiIncomplete}
          subtitle="nedostaju podaci o sukobu interesa"
          trend={d.decisionsCoiIncomplete > 0 ? "down" : "up"}
          animateCount
          href="/dashboard/committee/decisions"
          tooltip="Odluke gdje nedostaje ili nije dostatna izjava o nepristranosti."
        />
        <StatCard
          icon={Users}
          label="Čeka se kvorum"
          value={d.decisionsQuorumPending}
          subtitle="nedovoljno članova za odluku"
          trend={d.decisionsQuorumPending > 0 ? "down" : "up"}
          animateCount
          href="/dashboard/iso/decisions"
          tooltip="Predmeti u kojima još nije postignut potreban broj glasova."
        />
      </div>

      <DashboardWidget variant="dense">
        <div className="flex items-start gap-2">
          <ScrollText className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden />
          <div className="text-sm text-text-secondary">
            <p className="font-semibold text-text-primary">Poveznica na žalbe</p>
            <p className="mt-1">
              Broj žalbi nije u certifikacijskom payloadu — koristite{" "}
              <Link className="font-medium text-brand underline" to="/dashboard/iso/appeals">
                žalbeni modul
              </Link>{" "}
              za slučajeve povezane s odlukom.
            </p>
          </div>
        </div>
      </DashboardWidget>
    </div>
  );
}
