import {
  BarChart3,
  ClipboardCheck,
  ClipboardList,
  FolderKanban,
  Gavel,
  LayoutGrid,
  Medal,
  MessageSquareWarning,
  Scale,
  ScrollText,
  Shield,
} from "lucide-react";
import { useMemo, type JSX } from "react";
import { Link } from "react-router";

import { cn } from "@/lib/utils";
import {
  canAccessAppealsDomain,
  canAccessCertificationApplicationsNav,
  canAccessCertificationDecisions,
  canAccessCertificationSchemes,
  canAccessCertificatesRegistry,
  canAccessComplaintsDomain,
  canAccessGovernanceDomain,
  canAccessComplianceWorkspace,
  canAccessKnowledgeWorkspace,
  canAccessCapaManagement,
  canAccessIsoAudit,
  canAccessReportsDomain,
  canAccessRiskManagement,
  isCertificationCandidate,
  type IsoNavContext,
} from "@/lib/iso-navigation-access";
import { useAuthStore } from "@/stores/authStore";

import { IsoPageShell } from "./IsoPageShell";

type Card = {
  readonly to: string;
  readonly title: string;
  readonly description: string;
  readonly visible: (ctx: IsoNavContext) => boolean;
};

const CARDS: readonly Card[] = [
  {
    to: "/dashboard/iso/schemes",
    title: "Sheme certifikacije",
    description: "Definicije shema, verzije i tehnički zahtjevi.",
    visible: canAccessCertificationSchemes,
  },
  {
    to: "/dashboard/iso/applications",
    title: "Prijave za certifikaciju",
    description: "Pregled prijava i tehničkog statusa.",
    visible: (ctx) => canAccessCertificationApplicationsNav(ctx) && !isCertificationCandidate(ctx),
  },
  {
    to: "/dashboard/iso/candidate",
    title: "Moja certifikacija",
    description: "Koraci, status i materijali za kandidate.",
    visible: isCertificationCandidate,
  },
  {
    to: "/dashboard/iso/decisions",
    title: "Odluke o certifikaciji",
    description: "Formalne odluke i zapisnik odbora.",
    visible: canAccessCertificationDecisions,
  },
  {
    to: "/dashboard/iso/certificates",
    title: "Registar certifikata",
    description: "Organizacijski pregled izdanih certifikata.",
    visible: canAccessCertificatesRegistry,
  },
  {
    to: "/dashboard/iso/appeals",
    title: "Žalbe",
    description: "Žalbe na certifikacijske odluke (ISO §11).",
    visible: canAccessAppealsDomain,
  },
  {
    to: "/dashboard/iso/complaints",
    title: "Pritužbe",
    description: "Pritužbe na proces i uslugu.",
    visible: canAccessComplaintsDomain,
  },
  {
    to: "/dashboard/knowledge",
    title: "Standards Intelligence",
    description: "Registry klauzula, knowledge graf, audit guidance i AI navigacija (human-in-the-loop).",
    visible: canAccessKnowledgeWorkspace,
  },
  {
    to: "/dashboard/iso/compliance",
    title: "Compliance OS",
    description: "Matrica zahtjeva, dokazna pokrivenost, audit readiness i akreditacijska izloženost.",
    visible: canAccessComplianceWorkspace,
  },
  {
    to: "/dashboard/iso/governance",
    title: "Governance",
    description: "Rizici, integritet i upravljanje.",
    visible: canAccessGovernanceDomain,
  },
  {
    to: "/dashboard/iso/capa",
    title: "CAPA i neusaglašenosti",
    description: "NCR, korektivne i preventivne mjere, effectiveness review.",
    visible: canAccessCapaManagement,
  },
  {
    to: "/dashboard/iso/management-review",
    title: "Pregled rukovodstva",
    description: "Management review: KPI, ulazi iz rizika/CAPA/neutralnosti, akcijski plan, audit trag.",
    visible: canAccessGovernanceDomain,
  },
  {
    to: "/dashboard/iso/impartiality",
    title: "Nepristranost",
    description: "Registar prijetnji, COI, mitigacija, odbor — odvojeno od općeg rizika.",
    visible: canAccessRiskManagement,
  },
  {
    to: "/dashboard/iso/risks",
    title: "Registar rizika",
    description: "Inherent/residual, mitigacija, pregledi, heatmap — governance sloj.",
    visible: canAccessRiskManagement,
  },
  {
    to: "/dashboard/iso/reports",
    title: "Izvještaji",
    description: "Metrike i izvještaji za odbore i upravu.",
    visible: canAccessReportsDomain,
  },
  {
    to: "/dashboard/iso/audit",
    title: "Audit trail",
    description: "Strukturirana evidencija događaja, governance i izvoz (append-only).",
    visible: canAccessIsoAudit,
  },
] as const;

const ICONS = [ScrollText, FolderKanban, Gavel, Medal, Scale, Shield, ClipboardList, MessageSquareWarning, BarChart3] as const;

export default function Iso17024Home(): JSX.Element {
  const cognitoGroups = useAuthStore((s) => s.cognitoGroups);
  const role = useAuthStore((s) => s.user?.role ?? "");

  const ctx = useMemo<IsoNavContext>(() => ({ role, cognitoGroups }), [role, cognitoGroups]);

  const visibleCards = useMemo(() => CARDS.filter((c) => c.visible(ctx)), [ctx]);

  return (
    <IsoPageShell
      title="ISO 17024 — moduli"
      description="Strukturirani pristup shemama, prijavama, odlukama, žalbama, pritužbama i upravljanju. Prikaz ovisi o vašoj ulozi."
      icon={LayoutGrid}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {visibleCards.map((card, i) => {
          const Icon = ICONS[i % ICONS.length] ?? ClipboardCheck;
          return (
            <Link
              key={card.to}
              to={card.to}
              className={cn(
                "group rounded-2xl border border-border/50 bg-surface-secondary/35 p-5 transition-all",
                "hover:border-brand/35 hover:bg-surface-secondary/60 hover:shadow-md",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
              )}
            >
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand ring-1 ring-brand/20 transition-colors group-hover:bg-brand/15">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0 space-y-1">
                  <p className="font-semibold text-text-primary">{card.title}</p>
                  <p className="text-sm text-text-secondary">{card.description}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </IsoPageShell>
  );
}
