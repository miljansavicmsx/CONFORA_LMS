import type { LucideIcon } from "lucide-react";

/** Korisnik u donjoj zoni sidebara (ime + opcionalni profesionalni naslov). */
export type SidebarUser = {
  readonly name: string;
  readonly email?: string;
  readonly avatarUrl?: string | null;
  /** Npr. naslov s LinkedIn profila */
  readonly title?: string | null;
};

/** Nav item definition — label resolved via i18n `navigation:items.{labelKey}`. */
export type SidebarNavItemDef = {
  readonly to: string;
  readonly labelKey: string;
  readonly icon: LucideIcon;
  readonly end?: boolean;
  readonly badge?: number;
  /** AI Tutor — ljubičasti akcent */
  readonly ai?: boolean;
};

/** Resolved nav item for rendering (localized label). */
export type SidebarNavItem = SidebarNavItemDef & {
  readonly label: string;
};

export type SidebarSectionDef = {
  readonly titleKey: string;
  readonly items: readonly SidebarNavItemDef[];
};

export type SidebarSection = {
  readonly title: string;
  readonly items: readonly SidebarNavItem[];
};
