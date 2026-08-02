import { humanizeAuditAction } from "./relationship-evidence";

export type RelationshipTimelineItem = {
  readonly id: string;
  readonly at: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly severity?: string;
  readonly outcome?: string;
};

export function sortNewestFirst(items: readonly RelationshipTimelineItem[]): RelationshipTimelineItem[] {
  return [...items].sort((a, b) => {
    const ta = Date.parse(a.at);
    const tb = Date.parse(b.at);
    const na = Number.isFinite(ta) ? ta : 0;
    const nb = Number.isFinite(tb) ? tb : 0;
    return nb - na;
  });
}

export function auditRowsToTimelineItems(
  rows: readonly {
    eventId: string;
    createdAt: string;
    action: string;
    resourceType?: string;
    resourceId?: string;
    severity?: string;
    outcome?: string;
  }[],
): RelationshipTimelineItem[] {
  return rows.map((r) => ({
    id: r.eventId,
    at: r.createdAt,
    title: humanizeAuditAction(r.action),
    subtitle: [r.resourceType, r.resourceId].filter(Boolean).join(" / "),
    ...(r.severity ? { severity: r.severity } : {}),
    ...(r.outcome ? { outcome: r.outcome } : {}),
  }));
}
