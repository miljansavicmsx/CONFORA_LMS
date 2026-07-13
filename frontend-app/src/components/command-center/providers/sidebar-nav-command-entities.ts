import type { TFunction } from "i18next";

import { localizeSidebarSection } from "@/components/layout/localize-sidebar-sections";
import type { SidebarNavItem, SidebarSection } from "@/components/layout/sidebar-nav-types";
import { collectTaggedSidebarSections } from "@/components/layout/sidebar-sections";
import type { AppWorkspaceId } from "@/lib/app-workspace";
import type { IsoNavContext } from "@/lib/iso-navigation-access";

import type { CommandEntity } from "../command-entity-types";
import { inferEntityTypeFromRoute, inferResultBucket } from "../command-navigation";

type SidebarNavItemContext = {
  readonly localizedSection: SidebarSection;
  readonly item: SidebarNavItem;
  readonly workspace: AppWorkspaceId;
  readonly route: string;
};

type BuildSidebarNavCommandEntitiesOptions = {
  readonly workspace?: AppWorkspaceId;
  readonly idPrefix?: string;
  readonly extraTags?: readonly string[];
  readonly includeItem?: (ctx: SidebarNavItemContext) => boolean;
  readonly resultBucket?: CommandEntity["resultBucket"];
};

export function buildSidebarNavCommandEntities(
  isoCtx: IsoNavContext,
  t: TFunction,
  options: BuildSidebarNavCommandEntitiesOptions = {},
): CommandEntity[] {
  const tagged = collectTaggedSidebarSections(isoCtx).filter(
    (entry) => !options.workspace || entry.workspace === options.workspace,
  );
  const out: CommandEntity[] = [];
  const idPrefix = options.idPrefix ?? "nav";

  for (const { section: sectionDef, workspace } of tagged) {
    const localizedSection = localizeSidebarSection(sectionDef, t);
    for (const item of localizedSection.items) {
      const route = item.to;
      const routeLower = route.toLowerCase();
      const itemCtx: SidebarNavItemContext = {
        localizedSection,
        item,
        workspace,
        route: routeLower,
      };
      if (options.includeItem && !options.includeItem(itemCtx)) {
        continue;
      }
      const entityType = inferEntityTypeFromRoute(route);
      const tags = [localizedSection.title, workspace, ...(options.extraTags ?? [])];
      out.push({
        id: `${idPrefix}:${workspace}:${route}:${item.label}`,
        entityType,
        title: item.label,
        subtitle: localizedSection.title,
        workspace,
        route,
        icon: item.icon,
        tags,
        source: "nav",
        resultBucket:
          options.resultBucket ?? inferResultBucket({ route, entityType, workspace }),
      });
    }
  }
  return out;
}
