import { BookOpen, LayoutDashboard } from "lucide-react";
import type { TFunction } from "i18next";

import type { IsoNavContext } from "@/lib/iso-navigation-access";

import type { CommandEntity } from "../command-entity-types";
import { buildSidebarNavCommandEntities } from "./sidebar-nav-command-entities";

export function learningNavProvider(isoCtx: IsoNavContext, t: TFunction): CommandEntity[] {
  return buildSidebarNavCommandEntities(isoCtx, t, { workspace: "learning" });
}

/** Shallow static rows — same routes kao sidebar; dopunjiva točka bez API-ja. */
export function learningStaticProvider(): CommandEntity[] {
  return [
    {
      id: "static:learning:dashboard",
      entityType: "report",
      title: "Learning dashboard",
      subtitle: "Pregled portala za učenje",
      workspace: "learning",
      route: "/dashboard",
      icon: LayoutDashboard,
      source: "nav",
      tags: ["dashboard", "learning"],
      resultBucket: "learning",
    },
    {
      id: "static:learning:courses",
      entityType: "course",
      title: "Kursevi",
      workspace: "learning",
      route: "/dashboard/courses",
      icon: BookOpen,
      source: "nav",
      tags: ["course", "catalog"],
      resultBucket: "learning",
    },
  ];
}
