import { NAVIGATION_NS } from "@confora/i18n";
import type { TFunction } from "i18next";

import type { SidebarNavItem, SidebarNavItemDef, SidebarSection, SidebarSectionDef } from "./sidebar-nav-types";

export function localizeSidebarNavItem(item: SidebarNavItemDef, t: TFunction): SidebarNavItem {
  return {
    ...item,
    label: t(`items.${item.labelKey}`, { ns: NAVIGATION_NS }),
  };
}

export function localizeSidebarSection(section: SidebarSectionDef, t: TFunction): SidebarSection {
  return {
    title: t(`sections.${section.titleKey}`, { ns: NAVIGATION_NS }),
    items: section.items.map((item) => localizeSidebarNavItem(item, t)),
  };
}

export function localizeSidebarSections(
  sections: readonly SidebarSectionDef[],
  t: TFunction,
): SidebarSection[] {
  return sections.map((section) => localizeSidebarSection(section, t));
}
