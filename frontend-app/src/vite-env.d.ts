/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  /** Puni URL na Google / Cognito Hosted UI ili slično */
  readonly VITE_GOOGLE_OAUTH_URL?: string;
  /**
   * Samo uz `vite dev`: zaobiđi token i /auth/me na dashboardu (nema Cognita lokalno).
   * Nikad ne uključivati u produkcijskom buildu.
   */
  readonly VITE_SKIP_AUTH_GUARD?: string;
  /** Javni Next sajt (verifikacija certifikata, linkovi). */
  readonly VITE_PUBLIC_WEB_URL?: string;
  /** CSV uloga za kurikulum / item bank (default uključuje sys_admin, tech_committee). */
  readonly VITE_ADMIN_ROLES?: string;
  /** CSV uloga za odluke certifikacije (default: admin,...,cert_committee,sys_admin). */
  readonly VITE_CERTIFICATION_ROLES?: string;
  /** CSV uloga za governance (default: admin,...,sys_admin; NE tech_committee). */
  readonly VITE_GOVERNANCE_ROLES?: string;
  /** hCaptcha site key (javni obrasci: kontakt, verifikacija, …). */
  readonly VITE_HCAPTCHA_SITEKEY?: string;
  /** CSV Cognito grupa za curriculum admin (default: admins,content-creators). Prazno = samo uloga iz profila. */
  readonly VITE_COGNITO_CONTENT_EDITOR_GROUPS?: string;
  /** Optional auth provider override in hybrid mode: legacy | nest */
  readonly VITE_AUTH_PROVIDER?: string;
  /** Nest auth pilot (P0-E-2a): requires VITE_AUTH_PROVIDER=nest. Default false. */
  readonly VITE_NEST_AUTH_PILOT_ENABLED?: string;
  /** F4-8b: use POST /v1/public/contact-requests (default true). false = legacy /v1/public/contact alias. */
  readonly VITE_CONTACT_CANONICAL_ENABLED?: string;
  /** F4-8c: use B15 v1 complaints routes (default true). false = legacy me|admin complaint aliases. */
  readonly VITE_COMPLAINTS_CANONICAL_ENABLED?: string;
  /** F4-8d: use B14 v1 appeals routes (default true). false = legacy me|admin appeal aliases. */
  readonly VITE_APPEALS_CANONICAL_ENABLED?: string;
  /** F4-8e: use F4 v1 staff reports routes (default true). false = legacy catalog read alias only. */
  readonly VITE_REPORTS_CANONICAL_ENABLED?: string;
  /** F4-8e: enable POST /v1/staff/reports/export (default true). false = hide export controls. */
  readonly VITE_REPORT_EXPORT_ENABLED?: string;
  /** F4-8e: hide legacy report builder UI (default true). */
  readonly VITE_BLOCK_LEGACY_REPORT_BUILDER?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "canvas-confetti" {
  type ConfettiOptions = Record<string, unknown>;
  function confetti(options?: ConfettiOptions): Promise<null> | null;
  export default confetti;
}
