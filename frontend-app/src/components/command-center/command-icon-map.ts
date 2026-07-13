import {
  AlertOctagon,
  Award,
  BookOpen,
  Building2,
  ClipboardList,
  FileStack,
  Gavel,
  Inbox,
  LayoutDashboard,
  ListChecks,
  MessageSquareWarning,
  ScrollText,
  User,
} from "lucide-react";

import type { CommandEntity, CommandEntityType } from "./command-entity-types";

const MAP: Partial<Record<CommandEntityType, typeof LayoutDashboard>> = {
  course: BookOpen,
  lesson: BookOpen,
  quiz: BookOpen,
  certificate: Award,
  application: FileStack,
  decision: Gavel,
  risk: AlertOctagon,
  capa: ClipboardList,
  complaint: MessageSquareWarning,
  appeal: Inbox,
  management_review: ScrollText,
  scheme: ScrollText,
  audit_event: ListChecks,
  user: User,
  tenant: Building2,
  workflow: ListChecks,
  report: LayoutDashboard,
  clause: ScrollText,
};

export function defaultIconForEntityType(t: CommandEntityType): typeof LayoutDashboard {
  return MAP[t] ?? LayoutDashboard;
}

export function iconForCommandEntity(entity: Pick<CommandEntity, "entityType" | "icon">) {
  if (entity.icon) {
    return entity.icon;
  }
  return defaultIconForEntityType(entity.entityType);
}
