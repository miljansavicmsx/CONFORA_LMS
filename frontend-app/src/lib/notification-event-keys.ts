/**
 * Must stay aligned with @confora/notification-templates (frontend-app is outside pnpm workspace).
 */
export const NOTIFICATION_EVENT_KEYS = [
  "user.suspended",
  "enrollment.completed",
  "exam.scheduled",
  "exam.passed",
  "exam.failed",
  "exam.retake_window_opens",
  "application.submitted",
  "application.verifier.invited",
  "application.verifier.confirmed",
  "application.decision.approved",
  "application.decision.rejected",
  "certificate.issued",
  "certificate.expiring",
  "certificate.expired",
  "appeal.received",
  "appeal.decided",
  "complaint.received",
  "complaint.resolved",
  "audit.integrity.failed",
] as const;

export type NotificationEventKey = (typeof NOTIFICATION_EVENT_KEYS)[number];
