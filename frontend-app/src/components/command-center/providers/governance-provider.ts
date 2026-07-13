import type { TFunction } from "i18next";

import type { IsoNavContext } from "@/lib/iso-navigation-access";

import type { CommandEntity } from "../command-entity-types";
import { buildSidebarNavCommandEntities } from "./sidebar-nav-command-entities";

export function governanceNavProvider(isoCtx: IsoNavContext, t: TFunction): CommandEntity[] {
  return buildSidebarNavCommandEntities(isoCtx, t, {
    workspace: "governance",
    extraTags: ["governance"],
  });
}
