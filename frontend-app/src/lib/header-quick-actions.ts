import {
  Activity,
  BookOpen,
  ClipboardList,
  Gavel,
  LayoutDashboard,
  MessageSquareWarning,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type HeaderQuickAction = {
  readonly href: string;
  readonly label: string;
  readonly icon: LucideIcon;
};

/** Brze veze u zaglavlju — ovisno o ulozi (samo navigacija). */
export function headerQuickActionsForRole(role: string): readonly HeaderQuickAction[] {
  const r = role.trim().toLowerCase() || "learner";
  const home: HeaderQuickAction = {
    href: "/dashboard",
    label: "Početna",
    icon: LayoutDashboard,
  };

  if (r === "sys_admin") {
    return [
      home,
      { href: "/dashboard/admin/users", label: "Korisnici", icon: Users },
      { href: "/dashboard/admin/system-health", label: "Status sustava", icon: Activity },
    ];
  }
  if (r === "training_admin" || r === "admin") {
    return [
      home,
      { href: "/dashboard/admin/sadrzaj", label: "Sadržaj", icon: BookOpen },
      { href: "/dashboard/billing", label: "Finansije", icon: Wallet },
    ];
  }
  if (r === "cert_committee" || r === "certification_committee") {
    return [
      home,
      {
        href: "/dashboard/committee/pilot-applications",
        label: "Prijave",
        icon: ClipboardList,
      },
      { href: "/dashboard/iso/decisions", label: "Odluke odbora", icon: Gavel },
    ];
  }
  if (r === "tech_committee" || r === "technical_committee") {
    return [
      home,
      { href: "/dashboard/admin/sadrzaj", label: "Obuke", icon: BookOpen },
      { href: "/dashboard/admin/item-bank", label: "Baza pitanja", icon: ClipboardList },
    ];
  }
  if (r === "appeals_committee") {
    return [
      home,
      { href: "/dashboard/iso/appeals", label: "Žalbe", icon: ClipboardList },
      { href: "/dashboard/iso/complaints", label: "Prigovori", icon: MessageSquareWarning },
    ];
  }
  if (r === "director" || r === "iso_governance" || r === "auditor") {
    return [
      home,
      { href: "/dashboard/iso/governance", label: "Nadzor", icon: Gavel },
      { href: "/dashboard/billing", label: "Finansije", icon: Wallet },
    ];
  }

  return [
    home,
    { href: "/dashboard/courses", label: "Kursevi", icon: BookOpen },
    { href: "/dashboard/certification/applications", label: "Prijave", icon: ClipboardList },
    { href: "/dashboard/finance", label: "Finansije", icon: Wallet },
  ];
}
