import { AlertTriangle, Clock, FileSearch, Gavel, Shield } from "lucide-react";
import { useMemo, type JSX } from "react";
import { Link } from "react-router";

import { GovernanceCockpitHero } from "@/components/dashboard/enterprise/GovernanceCockpitHero";
import { Button } from "@/components/ui/button";
import {
  DashboardSection,
  DashboardWidget,
  EnterpriseDataTable,
  EnterpriseEmptyState,
  EnterpriseQuickAction,
  EnterpriseSectionHeader,
  EnterpriseTimeline,
  type Severity,
} from "@/design-system";
import type { AppealsCommitteeDashboardPayload } from "@/lib/dashboard-context-api";

export default function AppealsCommitteeCockpitBody({ d }: { readonly d: AppealsCommitteeDashboardPayload }): JSX.Element {
  const blocked = d.openComplaints > 0 && d.oldestOpenComplaintDays >= 14;

  const caseRows = useMemo(
    () =>
      d.agingSamples.map((s) => ({
        id: s.id,
        cells: [s.label, `${String(s.daysOpen)} d`, s.daysOpen > 14 ? "Prekoračen interni prag" : "Unutar praga"],
        severity: ((): Severity => {
          if (s.daysOpen > 14) {
            return "danger";
          }
          if (s.daysOpen > 7) {
            return "warning";
          }
          return "info";
        })(),
        workflowLabel: "Case",
        href: /prituž|complaint/i.test(s.label) ? "/dashboard/iso/complaints" : "/dashboard/iso/appeals",
      })),
    [d.agingSamples],
  );

  const hasAging = d.agingSamples.length > 0;
  const allQuiet = d.openAppeals === 0 && d.openComplaints === 0 && !hasAging;

  return (
    <div className="space-y-8">
      <GovernanceCockpitHero
        title="Dispute & case resolution center"
        subtitle="Žalbe na certifikacijske odluke i pritužbe na postupak — sažetak iz payloada."
        metrics={[
          {
            label: "Otvorene žalbe",
            value: d.openAppeals,
            severity: d.openAppeals > 0 ? "warning" : "success",
            href: "/dashboard/iso/appeals",
          },
          {
            label: "Otvorene pritužbe",
            value: d.openComplaints,
            severity: d.openComplaints > 0 ? "warning" : "success",
            href: "/dashboard/iso/complaints",
          },
          {
            label: "Najstarija žalba (d)",
            value: d.oldestOpenAppealDays,
            severity: d.oldestOpenAppealDays > 14 ? "danger" : "info",
            href: "/dashboard/iso/appeals",
          },
          {
            label: "Istraga (proxy)",
            value: blocked ? "Prioritet" : "Ok",
            severity: blocked ? "danger" : "success",
            hint: "Pritužbe >14 d",
          },
        ]}
      />

      <EnterpriseTimeline
        ariaLabel="Tijek slučaja žalbe / pritužbe"
        items={[
          { id: "c1", title: "Podnošenje", state: "done" },
          { id: "c2", title: "Istraga", state: d.openComplaints > 0 ? "current" : "done" },
          { id: "c3", title: "Pregled dokaza", state: hasAging ? "current" : "locked" },
          { id: "c4", title: "Odbor / odluka", state: "locked" },
          { id: "c5", title: "Zatvaranje", state: "locked" },
        ]}
      />

      <DashboardSection
        eyebrow="Evidencija"
        title="Evidence review (poveznice)"
        description="Certifikat, audit trag i CAPA detalji su u strukturiranim ISO stranicama."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <DashboardWidget variant="dense" className="flex gap-3">
            <Gavel className="h-8 w-8 shrink-0 text-brand" aria-hidden />
            <div>
              <p className="text-xs font-semibold uppercase text-text-muted">Certifikat / žalba</p>
              <p className="mt-1 text-sm text-text-secondary">
                Predmeti u{" "}
                <Link className="font-medium text-brand underline" to="/dashboard/iso/appeals">
                  žalbenom registru
                </Link>
                .
              </p>
            </div>
          </DashboardWidget>
          <DashboardWidget variant="dense" className="flex gap-3">
            <Shield className="h-8 w-8 shrink-0 text-sky-300" aria-hidden />
            <div>
              <p className="text-xs font-semibold uppercase text-text-muted">Governance / CAPA</p>
              <p className="mt-1 text-sm text-text-secondary">
                <Link className="font-medium text-brand underline" to="/dashboard/iso/governance">
                  Governance modul
                </Link>{" "}
                za trag i povezane CAPA zapise.
              </p>
            </div>
          </DashboardWidget>
        </div>
      </DashboardSection>

      <DashboardSection eyebrow="Stariji predmeti" title="Case aging queue" description="Uzorkovanje starosti predmeta iz API-ja.">
        {hasAging ? (
          <EnterpriseDataTable
            ariaLabel="Red starosti predmeta"
            caption="Pregled starenja"
            columns={[
              { id: "l", header: "Predmet" },
              { id: "d", header: "Dana otvoreno" },
              { id: "n", header: "Signal" },
            ]}
            rows={caseRows}
          />
        ) : (
          <EnterpriseEmptyState
            id="appeals-aging-empty"
            icon={Clock}
            title="Nema uzorkovanih predmeta u ovom presjeku"
            description="Kada API vrati starosne uzorke, pojavit će se u tablici. Do tada koristite registre."
            primary={[
              { to: "/dashboard/iso/appeals", label: "Žalbe" },
              { to: "/dashboard/iso/complaints", label: "Pritužbe" },
            ]}
          />
        )}
      </DashboardSection>

      {allQuiet ? (
        <EnterpriseEmptyState
          icon={FileSearch}
          title="Nema otvorenih žalbi ni pritužbi u KPI presjeku"
          description="Dubinski registri mogu i dalje imati predmete — ovdje je operativni rezime za cockpit."
          primary={[
            { to: "/dashboard/iso/appeals", label: "Registar žalbi" },
            { to: "/dashboard/iso/complaints", label: "Registar pritužbi" },
          ]}
        />
      ) : null}

      <div>
        <EnterpriseSectionHeader titleLevel="h3" eyebrow="Quick actions" title="Sljedeći koraci" />
        <div className="flex flex-wrap gap-2">
          <EnterpriseQuickAction to="/dashboard/iso/appeals" label="Otvori žalbe" />
          <EnterpriseQuickAction to="/dashboard/iso/complaints" label="Otvori pritužbe" variant="outline" />
          <EnterpriseQuickAction to="/dashboard/admin/support" label="Eskalacija / tiket" variant="outline" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardWidget variant="dense">
          <p className="text-[11px] font-semibold uppercase text-text-muted">Žalbe</p>
          <p className="mt-1 text-3xl font-bold text-text-primary">{d.openAppeals}</p>
          <Button asChild type="button" size="sm" variant="outline" className="mt-3 w-full border-border/60">
            <Link to="/dashboard/iso/appeals">Otvori</Link>
          </Button>
        </DashboardWidget>
        <DashboardWidget variant="dense">
          <p className="text-[11px] font-semibold uppercase text-text-muted">Pritužbe</p>
          <p className="mt-1 text-3xl font-bold text-text-primary">{d.openComplaints}</p>
          <Button asChild type="button" size="sm" variant="outline" className="mt-3 w-full border-border/60">
            <Link to="/dashboard/iso/complaints">Otvori</Link>
          </Button>
        </DashboardWidget>
        <DashboardWidget variant="dense">
          <p className="text-[11px] font-semibold uppercase text-text-muted">Najstarija žalba</p>
          <p className="mt-2 text-2xl font-bold">{d.oldestOpenAppealDays} d</p>
        </DashboardWidget>
        <DashboardWidget variant="dense">
          <p className="text-[11px] font-semibold uppercase text-text-muted">Najstarija pritužba</p>
          <p className="mt-2 text-2xl font-bold">{d.oldestOpenComplaintDays} d</p>
        </DashboardWidget>
      </div>

      {blocked ? (
        <DashboardWidget variant="dense" className="border-amber-500/30 bg-amber-500/[0.08]">
          <div className="flex gap-2">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-200" aria-hidden />
            <p className="text-sm text-text-secondary">
              <span className="font-semibold text-text-primary">Prioritet istrage: </span>
              pritužbe s dugim starenjem — otvorite modul pritužbi.
            </p>
          </div>
        </DashboardWidget>
      ) : null}
    </div>
  );
}
