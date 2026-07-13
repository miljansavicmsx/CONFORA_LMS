import {
  BookOpenCheck,
  Bot,
  ClipboardList,
  LayoutDashboard,
  ListChecks,
  Medal,
  MessageSquareWarning,
  ScrollText,
  ShieldAlert,
  Users,
} from "lucide-react";

import type { AppWorkspaceId } from "@/lib/app-workspace";

import type { CommandEntity } from "../command-entity-types";

function qa(
  partial: Omit<CommandEntity, "source" | "resultBucket" | "id"> & { readonly id: string },
): CommandEntity {
  return {
    ...partial,
    source: "quick_action",
    resultBucket: "quick_actions",
  };
}

export function quickActionsProvider(workspace: AppWorkspaceId): CommandEntity[] {
  const common: CommandEntity[] = [
    qa({
      id: "qa:dashboard",
      entityType: "report",
      title: "Otvori nadzornu ploču",
      workspace,
      route: "/dashboard",
      icon: LayoutDashboard,
      tags: ["dashboard", "home"],
    }),
  ];

  const learning: CommandEntity[] = [
    qa({
      id: "qa:start-exam",
      entityType: "quiz",
      title: "Započni ispit",
      subtitle: "Brzi pristup ispitima",
      workspace: "learning",
      route: "/dashboard/exams",
      icon: BookOpenCheck,
      tags: ["exam", "quiz"],
    }),
    qa({
      id: "qa:ai-tutor",
      entityType: "report",
      title: "Otvori AI tutora",
      workspace: "learning",
      route: "/dashboard/ai-tutor",
      icon: Bot,
      tags: ["ai", "tutor"],
      aiHint: "Asistirano učenje",
    }),
    qa({
      id: "qa:my-certificates",
      entityType: "certificate",
      title: "Moji dokumenti / certifikati",
      workspace: "learning",
      route: "/dashboard/my-certificates",
      icon: Medal,
      tags: ["certificate", "wallet"],
    }),
  ];

  const governance: CommandEntity[] = [
    qa({
      id: "qa:create-capa",
      entityType: "capa",
      title: "Otvori CAPA",
      subtitle: "Neusaglašenosti i korektivne mjere",
      workspace: "governance",
      route: "/dashboard/iso/capa",
      icon: ClipboardList,
      tags: ["capa", "nonconformance"],
    }),
    qa({
      id: "qa:audit",
      entityType: "audit_event",
      title: "Strukturirani audit",
      workspace: "governance",
      route: "/dashboard/iso/audit",
      icon: ListChecks,
      tags: ["audit", "trail"],
    }),
    qa({
      id: "qa:risks",
      entityType: "risk",
      title: "Registar rizika",
      workspace: "governance",
      route: "/dashboard/iso/risks",
      icon: ShieldAlert,
      tags: ["risk", "iso"],
    }),
    qa({
      id: "qa:complaints",
      entityType: "complaint",
      title: "Prigovori",
      workspace: "governance",
      route: "/dashboard/iso/complaints",
      icon: MessageSquareWarning,
      tags: ["complaint", "feedback"],
    }),
    qa({
      id: "qa:management-review",
      entityType: "management_review",
      title: "Pregled rukovodstva",
      workspace: "governance",
      route: "/dashboard/iso/management-review",
      icon: ScrollText,
      tags: ["management", "review"],
    }),
  ];

  const system: CommandEntity[] = [
    qa({
      id: "qa:users",
      entityType: "user",
      title: "Korisnici",
      workspace: "system",
      route: "/dashboard/admin/users",
      icon: Users,
      tags: ["users", "admin"],
    }),
    qa({
      id: "qa:audit-logs",
      entityType: "audit_event",
      title: "Sigurnosni trag",
      workspace: "system",
      route: "/dashboard/admin/audit-logs",
      icon: ListChecks,
      tags: ["audit", "security"],
    }),
  ];

  if (workspace === "learning") {
    return dedupeById([...common, ...learning]);
  }
  if (workspace === "governance") {
    return dedupeById([...common, ...governance, ...learning.filter((e) => e.id === "qa:ai-tutor" || e.id === "qa:start-exam")]);
  }
  if (workspace === "knowledge") {
    const knowledgeWs: CommandEntity[] = [
      qa({
        id: "qa:knowledge-center",
        entityType: "clause",
        title: "Standards Intelligence",
        subtitle: "Registry, explorer, AI guidance (HITL)",
        workspace: "knowledge",
        route: "/dashboard/knowledge",
        icon: ScrollText,
        tags: ["standards", "registry", "17024"],
      }),
      qa({
        id: "qa:knowledge-compliance",
        entityType: "report",
        title: "Compliance OS",
        subtitle: "Matrica pokrivenosti",
        workspace: "knowledge",
        route: "/dashboard/iso/compliance",
        icon: ClipboardList,
        tags: ["compliance", "coverage"],
      }),
      qa({
        id: "qa:knowledge-iso-hub",
        entityType: "report",
        title: "ISO hub",
        workspace: "knowledge",
        route: "/dashboard/iso",
        icon: LayoutDashboard,
        tags: ["iso", "hub"],
      }),
    ];
    return dedupeById([
      ...common,
      ...knowledgeWs,
      ...governance.filter((e) => ["qa:audit", "qa:management-review", "qa:create-capa"].includes(e.id)),
    ]);
  }
  return dedupeById([...common, ...system, ...governance, ...learning]);
}

function dedupeById(items: CommandEntity[]): CommandEntity[] {
  const seen = new Set<string>();
  const out: CommandEntity[] = [];
  for (const i of items) {
    if (seen.has(i.id)) continue;
    seen.add(i.id);
    out.push(i);
  }
  return out;
}
