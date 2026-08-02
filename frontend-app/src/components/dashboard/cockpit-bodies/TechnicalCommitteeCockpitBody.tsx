import { ArrowRight, ClipboardCheck, GitBranch, Library, Sparkles } from "lucide-react";
import { useMemo, type JSX } from "react";
import { Link } from "react-router";

import { GovernanceCockpitHero } from "@/components/dashboard/enterprise/GovernanceCockpitHero";
import { Button } from "@/components/ui/button";
import {
  AiSuggestionCard,
  DashboardSection,
  DashboardWidget,
  EnterpriseAlertBanner,
  EnterpriseDataTable,
  EnterpriseKpiCard,
  EnterpriseQuickAction,
  EnterpriseSectionHeader,
  EnterpriseTimeline,
  EnterpriseWorkflowRibbon,
} from "@/design-system";
import type { TechnicalCommitteeDashboardPayload } from "@/lib/dashboard-context-api";
import { cn } from "@/lib/utils";

export default function TechnicalCommitteeCockpitBody({ d }: { readonly d: TechnicalCommitteeDashboardPayload }): JSX.Element {
  const reviewRows = useMemo(
    () => [
      {
        id: "curriculum",
        cells: [
          "Kurikulum / program",
          String(d.coursesPendingValidation),
          "Čeka tehničku potvrdu",
        ],
        severity: d.coursesPendingValidation > 0 ? ("warning" as const) : ("success" as const),
        workflowLabel: "Validacija",
        href: "/dashboard/admin/sadrzaj",
      },
      {
        id: "itembank",
        cells: [
          "Baza pitanja (AI nacrt)",
          String(d.itemBankDraftAi),
          `Uzorak stavki: ${d.itemBankTotalSampled}`,
        ],
        severity: d.itemBankDraftAi > 0 ? ("warning" as const) : ("success" as const),
        workflowLabel: "Pregled",
        aiAssisted: true,
        href: "/dashboard/admin/item-bank",
      },
    ],
    [d.coursesPendingValidation, d.itemBankDraftAi, d.itemBankTotalSampled],
  );

  const aiNarrative =
    d.itemBankDraftAi > 2
      ? "Više AI generiranih stavki čeka ljudsku verifikaciju u bazi pitanja."
      : "AI predlozi su pod kontrolom — održavajte redovni uzorak pregleda.";

  return (
    <div className="space-y-8">
      <GovernanceCockpitHero
        title="Content validation center"
        subtitle="Tehničko vijeće — validacija kurikuluma i baze pitanja; isti KPI brojevi iz API-ja."
        metrics={[
          {
            label: "Validacija programa",
            value: d.coursesPendingValidation,
            severity: d.coursesPendingValidation > 0 ? "warning" : "success",
            href: "/dashboard/admin/sadrzaj",
          },
          {
            label: "AI nacrt (item bank)",
            value: d.itemBankDraftAi,
            severity: d.itemBankDraftAi > 0 ? "warning" : "success",
            href: "/dashboard/admin/item-bank",
          },
          {
            label: "Uzorak baze",
            value: d.itemBankTotalSampled,
            href: "/dashboard/admin/item-bank",
          },
          {
            label: "Komentari (trag)",
            value: d.coursesPendingValidation + d.itemBankDraftAi > 0 ? "Aktivno" : "Čisto",
            severity: d.coursesPendingValidation + d.itemBankDraftAi > 0 ? "info" : "success",
            hint: "Agregat otvorenih pregleda u brzom presjeku",
          },
        ]}
      />

      <EnterpriseWorkflowRibbon
        ariaLabel="Tehnički tijek validacije"
        stages={[
          { label: "Predano", state: d.coursesPendingValidation > 0 || d.itemBankDraftAi > 0 ? "active" : "pending" },
          { label: "U pregledu", state: d.coursesPendingValidation > 0 ? "active" : "done" },
          { label: "Komentari", state: d.itemBankDraftAi > 0 ? "active" : "pending" },
          { label: "Odobreno", state: d.coursesPendingValidation === 0 && d.itemBankDraftAi === 0 ? "done" : "pending" },
        ]}
      />

      <DashboardSection
        eyebrow="Red čekanja"
        title="Content review queue"
        description="Program i baza pitanja — navigacija vodi u konkretne module."
      >
        <div className={cn("-mx-1 flex gap-2 overflow-x-auto pb-1 scrollbar-thin md:mx-0 md:flex-wrap")}>
          <EnterpriseKpiCard compact label="Programi (validacija)" value={d.coursesPendingValidation} />
          <EnterpriseKpiCard compact label="AI stavke" value={d.itemBankDraftAi} hint="čeka čovjeka" />
          <EnterpriseKpiCard compact label="Uzorak stavki" value={d.itemBankTotalSampled} />
        </div>
        <EnterpriseDataTable
          ariaLabel="Red validacije sadržaja"
          caption="Pregled reda"
          columns={[
            { id: "a", header: "Predmet" },
            { id: "b", header: "KPI" },
            { id: "c", header: "Status" },
          ]}
          rows={reviewRows}
        />
      </DashboardSection>

      <DashboardWidget variant="dense" className="space-y-3 border-violet-500/25 bg-violet-500/[0.06]">
        <EnterpriseSectionHeader
          titleLevel="h3"
          eyebrow="AI content oversight"
          title="Signali uz ljudsku potvrdu"
          description="Confidence i odbijeni prijedlozi detaljno su u modulima — ovdje operativni naglasci."
        />
        <EnterpriseAlertBanner severity="info" icon={Sparkles} title="AI generisani blokovi">
          Svaka objava prolazi kroz WorkflowBadge i ljudsku validaciju prije korištenja u ispitu.
        </EnterpriseAlertBanner>
        <AiSuggestionCard
          title="Prioritet pregleda"
          body={<p>{aiNarrative}</p>}
          confidenceLabel="Heuristika iz KPI (bez automatizacije)"
          acceptHref="/dashboard/admin/item-bank"
          acceptLabel="Otvori bazu pitanja"
          rejectLabel="Sakrij"
        />
      </DashboardWidget>

      <DashboardSection eyebrow="Tijek" title="Workflow timeline (pojednostavljeno)" description="Formalni workflow ostaje na serveru — ovo je navigacijski trag.">
        <EnterpriseTimeline
          ariaLabel="Validacija sadržaja — koraci"
          items={[
            {
              id: "s1",
              title: "Predano autoru / sistemu",
              state: "done",
              subtitle: "KPI pokazuje otvorene stavke",
            },
            {
              id: "s2",
              title: "U tehničkom pregledu",
              state: d.coursesPendingValidation > 0 ? "current" : "done",
            },
            {
              id: "s3",
              title: "Komentari i revizije",
              state: d.itemBankDraftAi > 0 ? "current" : "done",
            },
            {
              id: "s4",
              title: "Odobreno za produkciju",
              state: d.coursesPendingValidation === 0 && d.itemBankDraftAi === 0 ? "done" : "locked",
            },
          ]}
        />
      </DashboardSection>

      <div>
        <EnterpriseSectionHeader titleLevel="h3" eyebrow="Quick actions" title="Brze akcije" />
        <div className="flex flex-wrap gap-2">
          <EnterpriseQuickAction to="/dashboard/admin/sadrzaj" label="Red pregleda programa" />
          <EnterpriseQuickAction to="/dashboard/admin/item-bank" label="Usporedi revizije" variant="outline" />
          <EnterpriseQuickAction to="/dashboard/admin/item-bank" label="Validacija baze" variant="outline" />
          <Button asChild type="button" variant="outline" className="border-border/60">
            <Link to="/dashboard/iso/impartiality">
              COI podsjetnik <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </div>

      <EnterpriseAlertBanner severity="warning" icon={ClipboardCheck} title="Podsjetnik tijela">
        {d.coiReminder}
      </EnterpriseAlertBanner>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <DashboardWidget variant="dense" className="flex gap-3">
          <Library className="h-8 w-8 text-brand" aria-hidden />
          <div>
            <p className="text-xs font-semibold uppercase text-text-muted">Kurikulum</p>
            <p className="mt-1 text-2xl font-bold">{d.coursesPendingValidation}</p>
            <p className="text-xs text-text-muted">na validaciji</p>
          </div>
        </DashboardWidget>
        <DashboardWidget variant="dense" className="flex gap-3">
          <Sparkles className="h-8 w-8 text-violet-300" aria-hidden />
          <div>
            <p className="text-xs font-semibold uppercase text-text-muted">AI nacrti</p>
            <p className="mt-1 text-2xl font-bold">{d.itemBankDraftAi}</p>
          </div>
        </DashboardWidget>
        <DashboardWidget variant="dense" className="flex gap-3">
          <GitBranch className="h-8 w-8 text-sky-300" aria-hidden />
          <div>
            <p className="text-xs font-semibold uppercase text-text-muted">Uzorak stavki</p>
            <p className="mt-1 text-2xl font-bold">{d.itemBankTotalSampled}</p>
          </div>
        </DashboardWidget>
      </div>
    </div>
  );
}
