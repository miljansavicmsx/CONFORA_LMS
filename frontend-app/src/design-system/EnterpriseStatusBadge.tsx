import type { JSX } from "react";

import type { Severity } from "./SeverityBadge";
import { SeverityBadge } from "./SeverityBadge";

/** Enterprise alias oko SeverityBadge za konzistentno imenovanje u proizvodu. */
export function EnterpriseStatusBadge({
  severity,
  children,
}: {
  readonly severity: Severity;
  readonly children: string;
}): JSX.Element {
  return <SeverityBadge severity={severity}>{children}</SeverityBadge>;
}
