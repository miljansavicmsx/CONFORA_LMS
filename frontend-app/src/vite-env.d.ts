/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_CONFORA_API_URL?: string;
  readonly VITE_APP_LOCALE?: string;
  readonly VITE_AUTH_PROVIDER?: string;
  readonly VITE_API_PROVIDER?: string;
  readonly VITE_NEST_AUTH_PILOT_ENABLED?: string;
  readonly VITE_COGNITO_CONTENT_EDITOR_GROUPS?: string;
  readonly VITE_ADMIN_ROLES?: string;
  readonly VITE_CERT_REGISTRY_SOURCE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
