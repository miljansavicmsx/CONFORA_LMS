export type AuthConfig = Readonly<{
  oidcIssuerUrl: string;
  oidcClientId: string;
  jwksUri: string;
}>;

function requireNonBlank(name: string, value: string | undefined): string {
  if (value === undefined || value.trim() === '') {
    throw new Error(`${name} is required and must be a non-blank string.`);
  }
  return value.trim();
}

/**
 * Canonical BAR-P03 runtime auth configuration.
 * Consumes exactly OIDC_ISSUER_URL and OIDC_CLIENT_ID.
 * Fails closed at startup when either is absent or blank.
 */
export function loadAuthConfig(env: NodeJS.ProcessEnv = process.env): AuthConfig {
  const oidcIssuerUrl = requireNonBlank('OIDC_ISSUER_URL', env['OIDC_ISSUER_URL']);
  const oidcClientId = requireNonBlank('OIDC_CLIENT_ID', env['OIDC_CLIENT_ID']);
  return {
    oidcIssuerUrl,
    oidcClientId,
    jwksUri: `${oidcIssuerUrl}/protocol/openid-connect/certs`,
  };
}
