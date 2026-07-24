/** Browser-safe: no Node builtins. Import from `@confora/notification-templates/event-keys` in clients. */

export const NOTIFICATION_EVENT_KEYS = [
  'user.suspended',
  'user.reinstated',
  'user.withdrawn',
  'user.password_reset_required',
  'user.mfa_cleared',
  'enrollment.created',
  'enrollment.completed',
  'exam.scheduled',
  'exam.passed',
  'exam.failed',
  'exam.retake_window_opens',
  'application.submitted',
  'application.verifier.invited',
  'application.verifier.confirmed',
  'application.decision.approved',
  'application.decision.rejected',
  'certificate.issued',
  'certificate.expiring',
  'certificate.expired',
  'certificate.recertification.window_opened',
  'certificate.recertification.due_reminder',
  'certificate.recertification.overdue_reminder',
  'certificate.recertification.staff_queue',
  'appeal.received',
  'appeal.decided',
  'complaint.received',
  'complaint.resolved',
  'complaint.subject_notified',
  'contact.received',
  'contact.updated',
  'contact.resolved',
  'contact.staff_queue',
  'audit.integrity.failed',
  'report.mr_monthly_digest',
  'governance.audit_due_reminder',
  'governance.mr_due_reminder',
  'governance.mitigation_review_overdue',
  'governance.coi_review_due',
  'governance.a11y_ci_threshold_breached',
  'course.a11y_attestation_expired',
] as const;

export type NotificationEventKey = (typeof NOTIFICATION_EVENT_KEYS)[number];

export function isNotificationEventKey(v: string): v is NotificationEventKey {
  return (NOTIFICATION_EVENT_KEYS as readonly string[]).includes(v);
}
