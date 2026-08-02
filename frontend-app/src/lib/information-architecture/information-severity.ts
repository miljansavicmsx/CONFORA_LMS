import type { Severity } from "@/design-system/SeverityBadge";

import type { InformationSignalPriority } from "./information-priority";

/** Map design-system severity to default signal tier. */
export function priorityFromSeverity(sev: Severity): InformationSignalPriority {
  switch (sev) {
    case "danger":
      return "CRITICAL";
    case "warning":
      return "HIGH";
    case "info":
      return "NORMAL";
    case "success":
      return "LOW";
    default:
      return "NORMAL";
  }
}

export function severityForPriority(p: InformationSignalPriority): Severity {
  switch (p) {
    case "CRITICAL":
      return "danger";
    case "HIGH":
      return "warning";
    case "NORMAL":
      return "info";
    case "LOW":
      return "success";
    default:
      return "info";
  }
}
