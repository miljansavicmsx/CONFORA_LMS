/**
 * Safe public surface for @confora/notification-templates.
 *
 * Intentionally does NOT export `./events` (Node fs + deferred MJML loader).
 * Consumers needing the Node loader must import `./events` via an explicit
 * deep path in a future packaging wave — not through this barrel.
 */
export {
  NOTIFICATION_EVENT_KEYS,
  isNotificationEventKey,
  type NotificationEventKey,
} from './event-keys';

export { escapeHtmlText, sanitizePlainTextSubject } from './escape';

export {
  NOTIFICATION_SUPPORTED_LOCALES,
  resolveNotificationSubject,
  type NotificationLocale,
  type SubjectResolution,
} from './subjects';
