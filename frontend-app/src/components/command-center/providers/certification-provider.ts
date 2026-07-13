import type { TFunction } from "i18next";

import type { IsoNavContext } from "@/lib/iso-navigation-access";

import type { CommandEntity } from "../command-entity-types";
import { buildSidebarNavCommandEntities } from "./sidebar-nav-command-entities";

/**
 * Certifikacija se dijelom mapira na governance/learning sidebar — ovdje filtriramo cert-relevantne rute.
 * Ne uvodi nove permission modele; koristi istu IA kao i sidebar.
 */
export function certificationProvider(isoCtx: IsoNavContext, t: TFunction): CommandEntity[] {
  return buildSidebarNavCommandEntities(isoCtx, t, {
    idPrefix: "cert",
    extraTags: ["certification"],
    resultBucket: "certification",
    includeItem: ({ localizedSection, route }) =>
      route.includes("certif") ||
      route.includes("certificate") ||
      route.includes("committee") ||
      route.includes("recertification") ||
      route.includes("/my-certificates") ||
      localizedSection.title.toLowerCase().includes("certif"),
  });
}
