import { loadAuthConfig } from './auth-config';

describe('loadAuthConfig', () => {
  it('AUTH_28 throws preventing startup when OIDC_ISSUER_URL is missing', () => {
    expect(() =>
      loadAuthConfig({
        OIDC_CLIENT_ID: 'confora-web',
      }),
    ).toThrow(/OIDC_ISSUER_URL/);
  });

  it('AUTH_29 throws preventing startup when OIDC_CLIENT_ID is missing', () => {
    expect(() =>
      loadAuthConfig({
        OIDC_ISSUER_URL: 'http://localhost:18080/realms/confora',
      }),
    ).toThrow(/OIDC_CLIENT_ID/);
  });
});
