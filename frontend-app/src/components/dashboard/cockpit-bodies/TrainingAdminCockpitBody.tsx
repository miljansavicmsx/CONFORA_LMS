import { Cpu, Library, Sparkles, TrendingUp, Video } from "lucide-react";
import { useMemo, type JSX } from "react";

import { GovernanceCockpitHero } from "@/components/dashboard/enterprise/GovernanceCockpitHero";
import {
  AiSuggestionCard,
  DashboardSection,
  DashboardWidget,
  EnterpriseAlertBanner,
  EnterpriseDataTable,
  EnterpriseKpiCard,
  EnterpriseQuickAction,
  EnterpriseSectionHeader,
} from "@/design-system";
import type { TrainingAdminDashboardPayload } from "@/lib/dashboard-context-api";
import { trainingCompletionTrendLabel } from "@/lib/cockpit-helpers";
import { cn } from "@/lib/utils";

export default function TrainingAdminCockpitBody({ d }: { readonly d: TrainingAdminDashboardPayload }): JSX.Element {
  const trendText = useMemo(
    () => trainingCompletionTrendLabel(d.enrollmentsCompleted, d.enrollmentsActive),
    [d.enrollmentsCompleted, d.enrollmentsActive],
  );

  const courseRows = useMemo(
    () => [
      {
        id: "draft",
        cells: [
          "Nacrti (draft)",
          String(d.pendingPublishDrafts),
          d.pendingPublishDrafts > 0 ? "Čeka objavu" : "Bez otvorenih nacrta",
        ],
        severity: d.pendingPublishDrafts > 0 ? ("warning" as const) : ("success" as const),
        workflowLabel: "Sadržaj",
        href: "/dashboard/admin/kreiraj-kurs",
      },
      {
        id: "validation",
        cells: [
          "Tehnička validacija",
          String(d.coursesPendingValidation),
          "Red tehničkog odbora",
        ],
        severity: d.coursesPendingValidation > 0 ? ("warning" as const) : ("success" as const),
        workflowLabel: "Pregled",
        href: "/dashboard/admin/sadrzaj",
      },
      {
        id: "published",
        cells: ["Objavljeno (katalog)", String(d.coursesPublished), "Vidljivo polaznicima"],
        severity: "success" as const,
        workflowLabel: "Live",
        href: "/dashboard/admin/sadrzaj",
      },
      {
        id: "archive",
        cells: [
          "Arhiva",
          "—",
          "Broj arhiviranih nije u brzom API presjeku — koristite modul sadržaja.",
        ],
        severity: "info" as const,
        href: "/dashboard/admin/sadrzaj",
      },
    ],
    [d.coursesPublished, d.coursesPendingValidation, d.pendingPublishDrafts],
  );

  const examRows = useMemo(
    () => [
      {
        id: "ready",
        cells: [
          "Spremnost za ispit",
          String(d.learnersReadyForExam),
          "Polaznici s napretkom pripremljeni za završni ispit (KPI)",
        ],
        severity: d.learnersReadyForExam > 0 ? ("info" as const) : ("success" as const),
        workflowLabel: "Ispit",
        href: "/dashboard/iso/reports",
      },
      {
        id: "ops",
        cells: [
          "Operativni backlog",
          String(d.pendingSupportTickets),
          "Tiketi / zahtjevi (proxy za procjenu i obradu)",
        ],
        severity: d.pendingSupportTickets > 3 ? ("danger" as const) : d.pendingSupportTickets > 0 ? ("warning" as const) : ("success" as const),
        workflowLabel: "Queue",
        href: "/dashboard/admin/support",
      },
      {
        id: "proctor",
        cells: [
          "AI / integritet ispita",
          "Signal iz modula",
          "Detaljni AI proctoring trag je u modulu ispita — ovdje samo operativni podsjetnik.",
        ],
        severity: "info" as const,
        aiAssisted: true,
        href: "/dashboard/exams",
      },
    ],
    [d.learnersReadyForExam, d.pendingSupportTickets],
  );

  const contentRows = useMemo(
    () => [
      {
        id: "ai-lessons",
        cells: [
          "AI-asistirane lekcije",
          "Pregled u builderu",
          "Broj nije u ovom payloadu — otvorite konstruktor za generirane blokove.",
        ],
        aiAssisted: true,
        severity: "info" as const,
        href: "/dashboard/admin/kreiraj-kurs",
      },
      {
        id: "pending-mod",
        cells: [
          "Moduli s nedostajućim sadržajem",
          String(d.coursesPendingContent),
          "Čeka unos / kontrolu u konstruktoru",
        ],
        severity: d.coursesPendingContent > 0 ? ("warning" as const) : ("success" as const),
        href: "/dashboard/admin/sadrzaj",
      },
      {
        id: "stale",
        cells: [
          "Zastarjeli sadržaj",
          "—",
          "Heuristika dostupna u modulu revizije programa — nije u KPI API-ju.",
        ],
        severity: "info" as const,
        href: "/dashboard/admin/sadrzaj",
      },
    ],
    [d.coursesPendingContent],
  );

  const aiHint =
    d.coursesPendingContent >= 3
      ? `${d.coursesPendingContent} modula još nema potpuni sadržaj — prioritet u konstruktoru.`
      : d.learnersReadyForExam >= 5
        ? "Više polaznika je spremno za ispit — provjerite kapacitet sessija."
        : "Nema izraženih anomaly u brzom presjeku; održavajte validacijski tempo.";

  return (
    <div className="space-y-8">
      <GovernanceCockpitHero
        title="Learning operations center"
        subtitle="Brzi KPI iz istog dashboard payloada — fokus na programe, polaznike i ispitni obrub."
        metrics={[
          { label: "Aktivni polaznici", value: d.activeLearners, href: "/dashboard/admin/analytics" },
          {
            label: "Aktivni programi (obj.)",
            value: d.coursesPublished,
            href: "/dashboard/admin/sadrzaj",
          },
          {
            label: "Spremni za ispit",
            value: d.learnersReadyForExam,
            severity: d.learnersReadyForExam > 0 ? "info" : "success",
            href: "/dashboard/iso/reports",
          },
          {
            label: "Operativni backlog (tiketi)",
            value: d.pendingSupportTickets,
            severity: d.pendingSupportTickets > 3 ? "danger" : d.pendingSupportTickets > 0 ? "warning" : "success",
            href: "/dashboard/admin/support",
            hint: "Signal kašnjenja / obrade",
          },
        ]}
      />
      <p className="text-xs leading-relaxed text-text-muted">{trendText}</p>

      <DashboardSection
        id="cockpit-training-course-ops"
        eyebrow="Programi"
        title="Course operations"
        description="Objava, validacija i katalog — bez novih API polja."
      >
        <div className={cn("-mx-1 flex gap-2 overflow-x-auto pb-1 scrollbar-thin md:mx-0 md:flex-wrap")} aria-label="KPI programa">
          <EnterpriseKpiCard compact label="Ukupno programa" value={d.coursesTotal} hint="katalog" />
          <EnterpriseKpiCard compact label="Nacrti" value={d.pendingPublishDrafts} hint="još neobjavljeni" />
          <EnterpriseKpiCard compact label="Na validaciji" value={d.coursesPendingValidation} hint="tehnički odbor" />
          <EnterpriseKpiCard compact label="Objavljeno" value={d.coursesPublished} hint="live" />
        </div>
        <EnterpriseDataTable
          ariaLabel="Tablica operacija programa"
          caption="Pregled stanja programa"
          columns={[
            { id: "queue", header: "Red / tip" },
            { id: "count", header: "Broj" },
            { id: "note", header: "Operativni komentar" },
          ]}
          rows={courseRows}
          empty={
            <p>
              Nema redova — svi programski statusi su u jednom od modula ili nisu vraćeni u ovom pozivu.
            </p>
          }
        />
      </DashboardSection>

      <DashboardSection eyebrow="Ispiti" title="Exam operations" description="KPI + navigacija prema modulima ispita i podršci.">
        <EnterpriseDataTable
          ariaLabel="Tablica ispita"
          caption="Operacije ispita"
          columns={[
            { id: "q", header: "Tok" },
            { id: "n", header: "Vrijednost" },
            { id: "x", header: "Napomena" },
          ]}
          rows={examRows}
        />
      </DashboardSection>

      <DashboardSection
        eyebrow="Kvaliteta sadržaja"
        title="Content quality"
        description="Šta je u payloadu koristimo eksplicitno; ostalo vodi na konstruktor."
      >
        <EnterpriseDataTable
          ariaLabel="Tablica kvalitete sadržaja"
          caption="Kvaliteta modula"
          columns={[
            { id: "a", header: "Signal" },
            { id: "b", header: "Vrijednost" },
            { id: "c", header: "Pojašnjenje" },
          ]}
          rows={contentRows}
        />
      </DashboardSection>

      <DashboardWidget variant="dense" className="border-violet-500/25 bg-violet-500/[0.06]">
        <EnterpriseSectionHeader
          titleLevel="h3"
          eyebrow="AI asistent (UX)"
          title="Operativni signali"
          description="Heuristike nad postojećim brojkama — bez automatskih odluka na serveru."
        />
        <div className="space-y-3">
          <EnterpriseAlertBanner severity="info" icon={Sparkles} title="ISO 17024 sadržaj">
            AI predlaže reviziju modula ako raste broj nedostajućih blokova ili niska završetnost — potvrda ostaje u
            konstruktoru.
          </EnterpriseAlertBanner>
          <AiSuggestionCard
            title="Brza procjena iz KPI presjeka"
            body={<p>{aiHint}</p>}
            confidenceLabel="Heuristika (vidljivo, ne automatski)"
            acceptHref="/dashboard/admin/sadrzaj"
            acceptLabel="Otvori sadržaj"
            rejectLabel="Sakrij prijedlog"
          />
        </div>
      </DashboardWidget>

      <div>
        <EnterpriseSectionHeader
          titleLevel="h3"
          eyebrow="Brze akcije"
          title="Quick actions"
          description="Tipični sljedeći koraci za tim za učenje."
        />
        <div className="flex flex-wrap gap-2">
          <EnterpriseQuickAction to="/dashboard/admin/kreiraj-kurs" label="Kreiraj program" />
          <EnterpriseQuickAction to="/dashboard/exams" label="Raspored ispita" variant="outline" />
          <EnterpriseQuickAction to="/dashboard/admin/support" label="Pregled tiketa" variant="outline" />
          <EnterpriseQuickAction to="/dashboard/admin/analytics" label="Analitika učenja" variant="outline" />
          <EnterpriseQuickAction to="/dashboard/admin/item-bank" label="Baza pitanja" variant="outline" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardWidget variant="dense" className="flex items-start gap-3">
          <Library className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden />
          <div>
            <p className="text-xs font-semibold uppercase text-text-muted">Financije</p>
            <p className="mt-1 text-lg font-bold text-text-primary">{d.revenuePaidTotalEur.toFixed(2)} €</p>
            <p className="text-xs text-text-muted">Neplaćeno: {d.unpaidInvoices}</p>
          </div>
        </DashboardWidget>
        <DashboardWidget variant="dense" className="flex items-start gap-3">
          <TrendingUp className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" aria-hidden />
          <div>
            <p className="text-xs font-semibold uppercase text-text-muted">Završetak upisa</p>
            <p className="mt-1 text-sm text-text-secondary">{trendText}</p>
          </div>
        </DashboardWidget>
        <DashboardWidget variant="dense" className="flex items-start gap-3">
          <Video className="mt-0.5 h-5 w-5 shrink-0 text-sky-300" aria-hidden />
          <div>
            <p className="text-xs font-semibold uppercase text-text-muted">AI proctoring</p>
            <p className="mt-1 text-sm text-text-secondary">Detalji u modulu ispita i sigurnosnim izvještajima.</p>
          </div>
        </DashboardWidget>
        <DashboardWidget variant="dense" className="flex items-start gap-3">
          <Cpu className="mt-0.5 h-5 w-5 shrink-0 text-violet-300" aria-hidden />
          <div>
            <p className="text-xs font-semibold uppercase text-text-muted">Tehnička validacija</p>
            <p className="mt-1 text-lg font-bold text-text-primary">{d.coursesPendingValidation}</p>
          </div>
        </DashboardWidget>
      </div>
    </div>
  );
}
