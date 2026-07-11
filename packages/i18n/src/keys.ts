/** Namespace for WCAG / assistive-technology copy (skip links, landmarks, chrome). */
export const A11Y_NS = 'a11y' as const;

/** Staff certification workflow copy (P1-B5-2b assignment UI). */
export const CERTIFICATION_STAFF_NS = 'certificationStaff' as const;

/** Candidate portal copy (TD-081 certificate selector, CPD/recertification). */
export const CANDIDATE_PORTAL_NS = 'candidatePortal' as const;

/** Login / registration shell (TD-070-F1). */
export const AUTH_NS = 'auth' as const;

/** Authenticated shell chrome — language switcher labels (TD-070-F1). */
export const SHELL_NS = 'shell' as const;

/** Sidebar, breadcrumbs, mobile nav (TD-070-F2). */
export const NAVIGATION_NS = 'navigation' as const;

/** Dashboard home, role workspace, empty states (TD-070-F2). */
export const DASHBOARD_NS = 'dashboard' as const;

/** Shared loading/retry copy in F2 surfaces (TD-070-F2). */
export const COMMON_NS = 'common' as const;

export const SUPPORTED_LOCALES = ['en', 'bs', 'sr', 'hr', 'sl'] as const;

/** Browser localStorage key for UI locale preference (display only; no API/auth impact). */
export const LOCALE_STORAGE_KEY = 'confora.locale.v1' as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

/** Canonical keys — every locale file must define each entry. */
export const A11Y_KEYS = [
  'skip_to_main',
  'skip_to_navigation',
  'open_menu',
  'close_menu',
  'search',
  'user_menu',
  'loading',
  'error_occurred',
  'nest_auth_pilot_registry_unavailable',
  'dashboard_home',
  'main_navigation',
  'expand_sidebar',
  'collapse_sidebar',
  'workspace_picker',
  'breadcrumb',
  'quick_actions',
  'mobile_navigation',
  'workspace_loading',
  'wallet_filter',
] as const;

export type A11yKey = (typeof A11Y_KEYS)[number];

export type A11yMessages = Record<A11yKey, string>;
