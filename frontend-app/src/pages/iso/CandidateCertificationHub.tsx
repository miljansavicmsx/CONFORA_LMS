import {
  BookOpen,
  ClipboardList,
  LayoutDashboard,
  LifeBuoy,
  ListChecks,
  Medal,
  Shield,
  UserRound,
} from "lucide-react";
import { type JSX } from "react";
import { Link } from "react-router";

import { cn } from "@/lib/utils";

import { IsoPageShell } from "./IsoPageShell";

const LINKS = [
  {
    to: "/dashboard",
    title: "Dashboard",
    description: "Pregled portala i brzi linkovi.",
    icon: LayoutDashboard,
  },
  {
    to: "/katalog",
    title: "Katalog programa",
    description: "Odaberite program — kupnja sama po sebi ne donosi certifikaciju.",
    icon: BookOpen,
  },
  {
    to: "/dashboard/certification",
    title: "Pregled certifikacije (proces)",
    description:
      "Razlika između exam-pass potvrde i certifikata osobe; sedam koraka procesa i CTA samo ako su preduvjeta ispunjena.",
    icon: Shield,
  },
  {
    to: "/dashboard/certification/entry/iso-27001-id",
    title: "Ulaz u prijavu (konkretan program)",
    description:
      "Detaljan obrazac i shema za pojedini program ID — zamijenite „iso-27001-id” vlastitim ID-em iz LMS kataloga.",
    icon: Shield,
  },
  {
    to: "/dashboard/certification/applications",
    title: "Prijave za certifikaciju",
    description: "Podnesite i pratite prijavu za profesionalnu certifikaciju.",
    icon: ClipboardList,
  },
  {
    to: "/dashboard/certification/status",
    title: "Status certifikacije",
    description: "Tok odbora, odluke i eventualna žalba.",
    icon: ListChecks,
  },
  {
    to: "/dashboard/my-certificates",
    title: "Moji dokumenti",
    description: "Službeni ISO 17024 certifikati (ne potvrda o završetku kursa).",
    icon: Medal,
  },
  {
    to: "/dashboard/support",
    title: "Podrška i kontakt",
    description: "Žalbe, pritužbe i tehnička pomoć.",
    icon: LifeBuoy,
  },
] as const;

export default function CandidateCertificationHub(): JSX.Element {
  return (
    <IsoPageShell
      title="Kandidat za certifikaciju"
      description="Centralno mjesto za učenje, prijavu i praćenje statusa u skladu s ISO/IEC 17024."
      icon={UserRound}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LINKS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "rounded-2xl border border-border/50 bg-surface-secondary/40 p-5 transition-all",
                "hover:border-brand/35 hover:bg-surface-secondary/70 hover:shadow-md",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
              )}
            >
              <Icon className="mb-3 h-8 w-8 text-brand" aria-hidden />
              <p className="font-semibold text-text-primary">{item.title}</p>
              <p className="mt-1 text-sm text-text-secondary">{item.description}</p>
            </Link>
          );
        })}
      </div>
    </IsoPageShell>
  );
}
