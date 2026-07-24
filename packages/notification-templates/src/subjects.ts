import type { NotificationEventKey } from './event-keys';
import { sanitizePlainTextSubject } from './escape';

/**
 * Subject catalog is separate from event-keys (taxonomy only).
 * Subjects notify discrete events and must not imply:
 * - exam pass equals certified status
 * - certification decision equals certificate issuance
 * - ISSUED equals ACTIVE
 * - education equals certification
 * - žalba (appeal) equals prigovor (complaint)
 * - lifecycle equals recertification
 */

export const NOTIFICATION_SUPPORTED_LOCALES = ['en', 'hr'] as const;
export type NotificationLocale = (typeof NOTIFICATION_SUPPORTED_LOCALES)[number];

/** English subject lines — the only fully authored subject locale today. */
const SUBJECT_EN: Record<NotificationEventKey, string> = {
  'user.suspended': 'CONFORA: Account suspended (AMF overdue)',
  'user.reinstated': 'CONFORA: Account reinstated',
  'user.withdrawn': 'CONFORA: Account withdrawn',
  'user.password_reset_required': 'CONFORA: Password reset required',
  'user.mfa_cleared': 'CONFORA: MFA credentials cleared',
  'enrollment.created': 'CONFORA: Enrollment confirmed',
  'enrollment.completed': 'CONFORA: Enrollment completed',
  'exam.scheduled': 'CONFORA: Exam scheduled',
  'exam.passed': 'CONFORA: Exam passed',
  'exam.failed': 'CONFORA: Exam result',
  'exam.retake_window_opens': 'CONFORA: Retake window open',
  'application.submitted': 'CONFORA: Application submitted',
  'application.verifier.invited': 'CONFORA: You are invited as verifier',
  'application.verifier.confirmed': 'CONFORA: Verifier confirmation recorded',
  'application.decision.approved': 'CONFORA: Certification decision — approved',
  'application.decision.rejected': 'CONFORA: Certification decision — rejected',
  'certificate.issued': 'CONFORA: Certificate issued',
  'certificate.expiring': 'CONFORA: Certificate expiring soon',
  'certificate.expired': 'CONFORA: Certificate expired',
  'certificate.recertification.window_opened': 'CONFORA: Recertification window open',
  'certificate.recertification.due_reminder': 'CONFORA: Recertification due soon',
  'certificate.recertification.overdue_reminder': 'CONFORA: Recertification overdue',
  'certificate.recertification.staff_queue': 'CONFORA: Recertification queue notice',
  'appeal.received': 'CONFORA: Appeal received',
  'appeal.decided': 'CONFORA: Appeal decision',
  'complaint.received': 'CONFORA: Complaint received',
  'complaint.resolved': 'CONFORA: Complaint resolved',
  'complaint.subject_notified': 'CONFORA: Complaint process — notice regarding you',
  'contact.received': 'CONFORA: Contact request received',
  'contact.updated': 'CONFORA: Contact request update',
  'contact.resolved': 'CONFORA: Contact request closed',
  'contact.staff_queue': 'CONFORA: Contact queue notice',
  'audit.integrity.failed': 'CRITICAL: Audit ledger integrity failure',
  'report.mr_monthly_digest': 'CONFORA: Monthly management review — reporting inputs',
  'governance.audit_due_reminder': 'CONFORA: Internal audit cycle reminder',
  'governance.mr_due_reminder': 'CONFORA: Management review cycle reminder',
  'governance.mitigation_review_overdue': 'CONFORA: Risk mitigation review overdue',
  'governance.coi_review_due': 'CONFORA: Conflict of interest review due',
  'governance.a11y_ci_threshold_breached':
    'CONFORA: Accessibility CI failures — corrective action required',
  'course.a11y_attestation_expired':
    'CONFORA: Course removed from catalog — embed caption attestation',
};

export type SubjectResolution = {
  /** Plain-text subject (sanitized; not HTML-escaped). */
  readonly subject: string;
  /** Locale string requested by caller. */
  readonly requestedLocale: string;
  /** Locale whose subject catalog was used. */
  readonly resolvedLocale: NotificationLocale;
  /** True when resolved locale differs from an available requested locale catalog. */
  readonly usedFallback: boolean;
  /** Catalog locale used as fallback source, or null when not falling back. */
  readonly fallbackFrom: NotificationLocale | null;
  /** False when subject is not authored for the requested locale (intentional EN fallback). */
  readonly subjectLocalized: boolean;
};

function normalizeLocaleTag(locale: string): string {
  return String(locale).trim().toLowerCase().slice(0, 2);
}

function asSupportedLocale(tag: string): NotificationLocale | null {
  return (NOTIFICATION_SUPPORTED_LOCALES as readonly string[]).includes(tag)
    ? (tag as NotificationLocale)
    : null;
}

/**
 * Resolve a notification subject with explicit, auditable locale fallback.
 * HR (and unknown locales) intentionally fall back to EN until HR subjects are authored.
 */
export function resolveNotificationSubject(
  eventKey: NotificationEventKey,
  requestedLocale: string,
): SubjectResolution {
  const tag = normalizeLocaleTag(requestedLocale);
  const requestedSupported = asSupportedLocale(tag);

  if (requestedSupported === 'en') {
    return {
      subject: sanitizePlainTextSubject(SUBJECT_EN[eventKey]),
      requestedLocale,
      resolvedLocale: 'en',
      usedFallback: false,
      fallbackFrom: null,
      subjectLocalized: true,
    };
  }

  // hr is a supported product locale but subjects are not authored yet —
  // fall back to EN with explicit metadata (not a silent bilingual claim).
  if (requestedSupported === 'hr') {
    return {
      subject: sanitizePlainTextSubject(SUBJECT_EN[eventKey]),
      requestedLocale,
      resolvedLocale: 'en',
      usedFallback: true,
      fallbackFrom: 'en',
      subjectLocalized: false,
    };
  }

  // Unsupported / empty locale → EN fallback
  return {
    subject: sanitizePlainTextSubject(SUBJECT_EN[eventKey]),
    requestedLocale,
    resolvedLocale: 'en',
    usedFallback: true,
    fallbackFrom: 'en',
    subjectLocalized: false,
  };
}
