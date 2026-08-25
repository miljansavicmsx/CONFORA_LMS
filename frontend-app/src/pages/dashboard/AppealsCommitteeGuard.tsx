import type { JSX, ReactNode } from "react";

import { IsoRouteGuard } from "./IsoRouteGuard";
import { canAccessAppealsDomain } from "@/lib/iso-navigation-access";

/** Navigation guard only; appeal authority and SoD remain enforced server-side. */
export function AppealsCommitteeGuard({ children }: { readonly children: ReactNode }): JSX.Element {
  return <IsoRouteGuard allow={canAccessAppealsDomain}>{children}</IsoRouteGuard>;
}
