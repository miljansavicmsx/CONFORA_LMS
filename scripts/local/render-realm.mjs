/**
 * Builds the versioned Keycloak realm export from infra/keycloak/synthetic-users.json.
 * The export contains users and roles. It does not contain passwords or OTP secrets.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const catalog = JSON.parse(
  readFileSync(path.join(root, 'infra/keycloak/synthetic-users.json'), 'utf8'),
);

const ROLES = [
  'USR_CAND',
  'USR_CERT',
  'STAFF_DIR',
  'STAFF_SYSADM',
  'STAFF_TRAINADM',
  'ISSUANCE_OFFICER',
  'LIFECYCLE_OFFICER',
  'COM_TECH',
  'COM_CERT',
  'COM_IMP',
  'COM_APP',
  'STAFF_AUD',
  'SME',
  'EXAMINER',
  'INVIGILATOR',
  'QUALITY_MANAGER',
  'AI_SECURITY_MANAGER',
  'COMPLAINT_HANDLER',
  'STAFF_ROLEADM',
];

function mapper(name, protocolMapper, config) {
  return {
    name,
    protocol: 'openid-connect',
    protocolMapper,
    consentRequired: false,
    config,
  };
}

const realm = {
  id: 'confora',
  realm: 'confora',
  displayName: 'CONFORA local synthetic',
  enabled: true,
  sslRequired: 'none',
  registrationAllowed: false,
  registrationEmailAsUsername: false,
  rememberMe: false,
  verifyEmail: false,
  loginWithEmailAllowed: true,
  duplicateEmailsAllowed: false,
  resetPasswordAllowed: false,
  editUsernameAllowed: false,
  bruteForceProtected: false,
  permanentLockout: false,
  accessTokenLifespan: 300,
  ssoSessionIdleTimeout: 1800,
  ssoSessionMaxLifespan: 36000,
  offlineSessionIdleTimeout: 2592000,
  accessCodeLifespanLogin: 180,
  accessCodeLifespanUserAction: 300,
  otpPolicyType: 'totp',
  otpPolicyAlgorithm: 'HmacSHA1',
  otpPolicyDigits: 6,
  otpPolicyPeriod: 30,
  otpPolicyLookAheadWindow: 1,
  attributes: {
    'confora.realmExportVersion': String(catalog.version),
    'confora.localSyntheticOnly': 'true',
  },
  roles: {
    realm: ROLES.map((name) => ({
      name,
      description: `CONFORA RBAC role ${name}`,
      composite: false,
      clientRole: false,
    })),
  },
  clients: [
    {
      clientId: 'confora-web',
      name: 'CONFORA web',
      enabled: true,
      publicClient: true,
      protocol: 'openid-connect',
      standardFlowEnabled: true,
      implicitFlowEnabled: false,
      directAccessGrantsEnabled: false,
      serviceAccountsEnabled: false,
      frontchannelLogout: true,
      fullScopeAllowed: true,
      redirectUris: [
        'http://localhost:4000/v1/auth/oidc/callback',
        'http://127.0.0.1:4000/v1/auth/oidc/callback',
      ],
      webOrigins: [
        'http://localhost:3001',
        'http://127.0.0.1:3001',
        'http://localhost:4000',
        'http://127.0.0.1:4000',
      ],
      attributes: {
        'pkce.code.challenge.method': 'S256',
        'post.logout.redirect.uris': 'http://localhost:3001/login##http://127.0.0.1:3001/login',
        'use.refresh.tokens': 'true',
      },
      protocolMappers: [
        mapper('audience-confora-web', 'oidc-audience-mapper', {
          'included.client.audience': 'confora-web',
          'access.token.claim': 'true',
          'id.token.claim': 'false',
        }),
        mapper('tenant-id', 'oidc-usermodel-attribute-mapper', {
          'user.attribute': 'tenant_id',
          'claim.name': 'tenant_id',
          'jsonType.label': 'String',
          'access.token.claim': 'true',
          'id.token.claim': 'true',
          'userinfo.token.claim': 'false',
        }),
        mapper('realm-roles', 'oidc-usermodel-realm-role-mapper', {
          'claim.name': 'realm_access.roles',
          'jsonType.label': 'String',
          multivalued: 'true',
          'access.token.claim': 'true',
          'id.token.claim': 'true',
          'userinfo.token.claim': 'false',
        }),
        mapper('email', 'oidc-usermodel-property-mapper', {
          'user.attribute': 'email',
          'claim.name': 'email',
          'jsonType.label': 'String',
          'access.token.claim': 'true',
          'id.token.claim': 'true',
          'userinfo.token.claim': 'false',
        }),
        mapper('username', 'oidc-usermodel-property-mapper', {
          'user.attribute': 'username',
          'claim.name': 'preferred_username',
          'jsonType.label': 'String',
          'access.token.claim': 'true',
          'id.token.claim': 'true',
          'userinfo.token.claim': 'false',
        }),
        mapper('full-name', 'oidc-full-name-mapper', {
          'access.token.claim': 'false',
          'id.token.claim': 'true',
          'userinfo.token.claim': 'false',
        }),
        mapper('amr', 'oidc-amr-mapper', {
          'access.token.claim': 'true',
          'id.token.claim': 'true',
          'introspection.token.claim': 'true',
        }),
      ],
    },
  ],
  users: catalog.users.map((user) => ({
    id: user.keycloakId,
    username: user.username,
    email: user.email,
    emailVerified: true,
    enabled: true,
    firstName: user.givenName,
    lastName: user.familyName,
    attributes: {
      tenant_id: [user.tenantAttribute ?? user.tenantId ?? catalog.tenantId],
    },
    realmRoles: user.roles,
  })),
};

const out = path.join(root, 'infra/keycloak/realm/confora-realm-v1.json');
mkdirSync(path.dirname(out), { recursive: true });
writeFileSync(out, `${JSON.stringify(realm, null, 2)}\n`);
process.stdout.write(`wrote ${path.relative(root, out)}\n`);
