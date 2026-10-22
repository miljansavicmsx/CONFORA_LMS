/**
 * Local synthetic Keycloak setup. Prints status codes and paths, never secret values.
 */
import { spawn } from 'node:child_process';
import { generateKeyPairSync, randomBytes } from 'node:crypto';
import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const secretsDir = path.join(root, '.secrets');
const envPath = path.join(secretsDir, 'local.env');
const pemPath = path.join(secretsDir, 'vc_ed25519.pem');
const catalogPath = path.join(root, 'infra/keycloak/synthetic-users.json');
const realmPath = path.join(root, 'infra/keycloak/realm/confora-realm-v1.json');
const RBAC_ROLES = new Set([
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
]);

function base32(buffer) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  let output = '';
  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += alphabet[(value << (5 - bits)) & 31];
  return output;
}

function parseEnv(text) {
  const env = {};
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (trimmed === '' || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    env[trimmed.slice(0, eq)] = trimmed.slice(eq + 1);
  }
  return env;
}

function loadEnv() {
  if (!existsSync(envPath)) {
    throw new Error(
      'Missing .secrets/local.env. Run: node scripts/local/oidc-local.mjs init-secrets',
    );
  }
  return parseEnv(readFileSync(envPath, 'utf8'));
}

function catalog() {
  return JSON.parse(readFileSync(catalogPath, 'utf8'));
}

function keycloakBase(env) {
  return (env.KEYCLOAK_BASE_URL ?? 'http://localhost:18080').replace(/\/$/, '');
}

async function adminToken(env) {
  const body = new URLSearchParams({
    grant_type: 'password',
    client_id: 'admin-cli',
    username: env.KEYCLOAK_ADMIN_USERNAME || 'admin',
    password: env.KEYCLOAK_ADMIN_PASSWORD ?? '',
  });
  const response = await fetch(`${keycloakBase(env)}/realms/master/protocol/openid-connect/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!response.ok) {
    throw new Error(`Keycloak admin token request failed with status ${response.status}.`);
  }
  const payload = await response.json();
  if (typeof payload.access_token !== 'string') {
    throw new Error('Keycloak admin token response did not include a token.');
  }
  return payload.access_token;
}

async function kc(env, token, method, pathname, body) {
  const response = await fetch(`${keycloakBase(env)}${pathname}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  return { status: response.status, text };
}

function initSecrets() {
  if (existsSync(envPath)) {
    process.stdout.write('secrets already exist\n');
    return;
  }
  mkdirSync(secretsDir, { mode: 0o700 });
  const users = catalog().users.filter((user) => user.otp === true);
  const postgresPassword = randomBytes(24).toString('base64url');
  const adminPassword = randomBytes(24).toString('base64url');
  const demoPassword = randomBytes(24).toString('base64url');
  const sessionSecret = randomBytes(32).toString('hex');
  const port = process.env.POSTGRES_PORT ?? '5432';
  const lines = [
    `POSTGRES_PASSWORD=${postgresPassword}`,
    'POSTGRES_USER=confora',
    'POSTGRES_DB=confora',
    'POSTGRES_HOST=127.0.0.1',
    `POSTGRES_PORT=${port}`,
    `DATABASE_URL=postgresql://confora:${encodeURIComponent(postgresPassword)}@127.0.0.1:${port}/confora`,
    'KEYCLOAK_ADMIN_USERNAME=admin',
    `KEYCLOAK_ADMIN_PASSWORD=${adminPassword}`,
    `DEMO_USER_PASSWORD=${demoPassword}`,
    `OIDC_SESSION_SECRET=${sessionSecret}`,
    'OIDC_ISSUER_URL=http://localhost:18080/realms/confora',
    'OIDC_CLIENT_ID=confora-web',
    'OIDC_REDIRECT_URI=http://localhost:4000/v1/auth/oidc/callback',
    'OIDC_POST_LOGOUT_REDIRECT_URI=http://localhost:3001/login',
    'OIDC_WEB_ORIGINS=http://localhost:3001',
    'OIDC_SESSION_IDLE_SECONDS=1800',
    'OIDC_SESSION_ABSOLUTE_SECONDS=28800',
    'SESSION_COOKIE_SECURE=true',
    'KEYCLOAK_BASE_URL=http://localhost:18080',
    'EXAM_DEMO_OIDC_ISSUER=http://localhost:18080/realms/confora',
  ];
  for (const user of users) {
    lines.push(
      `OTP_SECRET_${user.username.toUpperCase().replace(/[^A-Z0-9]/g, '_')}=${base32(randomBytes(20))}`,
    );
  }
  writeFileSync(envPath, `${lines.join('\n')}\n`, { mode: 0o600 });
  chmodSync(envPath, 0o600);
  if (!existsSync(pemPath)) {
    const { privateKey } = generateKeyPairSync('ed25519');
    writeFileSync(pemPath, privateKey.export({ type: 'pkcs8', format: 'pem' }), { mode: 0o600 });
    chmodSync(pemPath, 0o600);
  }
  process.stdout.write('wrote .secrets/local.env and signing key\n');
}

function run(command, args, env, cwd = root) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, env, stdio: 'inherit' });
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited ${code ?? 'null'}`));
    });
  });
}

async function psql(sql) {
  await run(
    'sudo',
    ['-u', 'postgres', 'psql', '-v', 'ON_ERROR_STOP=1', '-d', 'postgres', '-c', sql],
    process.env,
  );
}

async function initDatabase() {
  const env = loadEnv();
  const password = env.POSTGRES_PASSWORD.replaceAll("'", "''");
  const user = env.POSTGRES_USER ?? 'confora';
  const db = env.POSTGRES_DB ?? 'confora';
  await psql(
    `DO $$ BEGIN IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${user}') THEN CREATE ROLE ${user} LOGIN PASSWORD '${password}'; ELSE ALTER ROLE ${user} WITH LOGIN PASSWORD '${password}'; END IF; END $$;`,
  );
  const exists = await new Promise((resolve, reject) => {
    const child = spawn(
      'sudo',
      [
        '-u',
        'postgres',
        'psql',
        '-d',
        'postgres',
        '-tAc',
        `SELECT 1 FROM pg_database WHERE datname = '${db}'`,
      ],
      {
        stdio: ['ignore', 'pipe', 'inherit'],
      },
    );
    let out = '';
    child.stdout.on('data', (chunk) => {
      out += String(chunk);
    });
    child.on('exit', (code) => {
      if (code === 0) resolve(out.trim() === '1');
      else reject(new Error('database lookup failed'));
    });
  });
  if (!exists) {
    await psql(`CREATE DATABASE ${db} OWNER ${user};`);
  }
  process.stdout.write('database ready\n');
}

async function importRealm() {
  const env = loadEnv();
  if (!existsSync(realmPath)) {
    await run(process.execPath, ['scripts/local/render-realm.mjs'], process.env);
  }
  const token = await adminToken(env);
  const realm = JSON.parse(readFileSync(realmPath, 'utf8'));
  const created = await kc(env, token, 'POST', '/admin/realms', realm);
  if (created.status !== 201 && created.status !== 409) {
    throw new Error(`Realm import failed with status ${created.status}.`);
  }
  process.stdout.write(`realm import status ${created.status}\n`);
}

function otpCredential(secret) {
  return {
    type: 'otp',
    userLabel: 'local-synthetic',
    temporary: false,
    credentialData: JSON.stringify({
      subType: 'totp',
      digits: 6,
      counter: 0,
      period: 30,
      algorithm: 'HmacSHA1',
      secretEncoding: 'BASE32',
    }),
    secretData: JSON.stringify({ value: secret }),
  };
}

function otpEnvKey(username) {
  return `OTP_SECRET_${username.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`;
}

async function provisionUsers() {
  const env = loadEnv();
  const token = await adminToken(env);
  const users = catalog().users;
  for (const user of users) {
    const tenant = user.tenantAttribute ?? user.tenantId ?? catalog().tenantId;
    const secret = user.otp ? env[otpEnvKey(user.username)] : '';
    if (user.otp && !secret) {
      throw new Error(`Missing OTP secret entry for ${user.username}.`);
    }
    const representation = {
      id: user.keycloakId,
      username: user.username,
      email: user.email,
      emailVerified: true,
      enabled: true,
      firstName: user.givenName,
      lastName: user.familyName,
      attributes: { tenant_id: [tenant] },
      credentials: [
        { type: 'password', value: env.DEMO_USER_PASSWORD, temporary: false },
        ...(user.otp ? [otpCredential(secret)] : []),
      ],
    };
    representation.realmRoles = user.roles;
    const search = await kc(
      env,
      token,
      'GET',
      `/admin/realms/confora/users?username=${encodeURIComponent(user.username)}&exact=true`,
    );
    if (search.status === 200) {
      const rows = JSON.parse(search.text);
      for (const row of rows) {
        if (row && row.id && row.id !== user.keycloakId) {
          const removed = await kc(env, token, 'DELETE', `/admin/realms/confora/users/${row.id}`);
          if (removed.status !== 204) {
            throw new Error(
              `Could not remove duplicate ${user.username}; status ${removed.status}.`,
            );
          }
        }
      }
    }
    const imported = await kc(env, token, 'POST', '/admin/realms/confora/partialImport', {
      ifResourceExists: 'OVERWRITE',
      users: [representation],
    });
    if (imported.status !== 200) {
      throw new Error(`Could not import ${user.username}; status ${imported.status}.`);
    }
    const check = await kc(env, token, 'GET', `/admin/realms/confora/users/${user.keycloakId}`);
    if (check.status !== 200) {
      throw new Error(
        `Imported ${user.username} is not at the expected id; status ${check.status}.`,
      );
    }
    for (const roleName of user.roles) {
      const role = await kc(
        env,
        token,
        'GET',
        `/admin/realms/confora/roles/${encodeURIComponent(roleName)}`,
      );
      if (role.status !== 200) {
        throw new Error(`Role ${roleName} missing; status ${role.status}.`);
      }
      const mapped = await kc(
        env,
        token,
        'POST',
        `/admin/realms/confora/users/${user.keycloakId}/role-mappings/realm`,
        [JSON.parse(role.text)],
      );
      if (mapped.status !== 204) {
        throw new Error(`Role map ${user.username}/${roleName} status ${mapped.status}.`);
      }
    }
    const assigned = await kc(
      env,
      token,
      'GET',
      `/admin/realms/confora/users/${user.keycloakId}/role-mappings/realm`,
    );
    if (assigned.status !== 200) {
      throw new Error(`Role lookup ${user.username} status ${assigned.status}.`);
    }
    const stale = JSON.parse(assigned.text).filter(
      (role) => RBAC_ROLES.has(role.name) && !user.roles.includes(role.name),
    );
    if (stale.length > 0) {
      const removed = await kc(
        env,
        token,
        'DELETE',
        `/admin/realms/confora/users/${user.keycloakId}/role-mappings/realm`,
        stale,
      );
      if (removed.status !== 204) {
        throw new Error(`Role removal ${user.username} status ${removed.status}.`);
      }
    }
    if (!user.otp) {
      const credentials = await kc(
        env,
        token,
        'GET',
        `/admin/realms/confora/users/${user.keycloakId}/credentials`,
      );
      if (credentials.status !== 200) {
        throw new Error(`Credential lookup ${user.username} status ${credentials.status}.`);
      }
      for (const credential of JSON.parse(credentials.text)) {
        if (credential.type !== 'otp' || !credential.id) continue;
        const dropped = await kc(
          env,
          token,
          'DELETE',
          `/admin/realms/confora/users/${user.keycloakId}/credentials/${credential.id}`,
        );
        if (dropped.status !== 204) {
          throw new Error(`OTP removal ${user.username} status ${dropped.status}.`);
        }
      }
    }
    process.stdout.write(`provisioned ${user.username}\n`);
  }
}

async function configureAmr() {
  const env = loadEnv();
  const token = await adminToken(env);
  const listed = await kc(
    env,
    token,
    'GET',
    '/admin/realms/confora/authentication/flows/browser/executions',
  );
  if (listed.status !== 200) {
    throw new Error(`Browser flow lookup failed with status ${listed.status}.`);
  }
  const executions = JSON.parse(listed.text);
  const wanted = new Map([
    ['auth-otp-form', 'otp'],
    ['auth-username-password-form', 'pwd'],
  ]);
  for (const execution of executions) {
    const value = wanted.get(execution.providerId);
    if (!value || !execution.id) continue;
    const config = {
      alias: `confora-amr-${value}`,
      config: {
        'default.reference.value': value,
        'default.reference.maxAge': '28800',
      },
    };
    if (execution.authenticationConfig) {
      const updated = await kc(
        env,
        token,
        'PUT',
        `/admin/realms/confora/authentication/config/${execution.authenticationConfig}`,
        config,
      );
      if (updated.status !== 204 && updated.status !== 200) {
        throw new Error(`AMR config update for ${execution.providerId} status ${updated.status}.`);
      }
    } else {
      const created = await kc(
        env,
        token,
        'POST',
        `/admin/realms/confora/authentication/executions/${execution.id}/config`,
        config,
      );
      if (created.status !== 201 && created.status !== 204 && created.status !== 409) {
        throw new Error(`AMR config create for ${execution.providerId} status ${created.status}.`);
      }
    }
    process.stdout.write(`amr ${execution.providerId}=${value}\n`);
  }
}

async function migrateAndSeed() {
  const env = loadEnv();
  const pem = readFileSync(pemPath, 'utf8');
  const childEnv = {
    ...process.env,
    ...env,
    NODE_ENV: 'development',
    EXAM_DEMO_SEED: '1',
    PERSONNEL_VC_ED25519_PKCS8_PEM: pem,
  };
  await run('pnpm', ['--filter', '@confora/database', 'exec', 'prisma', 'generate'], childEnv);
  await run(
    'pnpm',
    ['--filter', '@confora/database', 'exec', 'prisma', 'migrate', 'deploy'],
    childEnv,
  );
  await run('pnpm', ['--filter', '@confora/database', 'run', 'seed'], childEnv);
  await run('pnpm', ['exec', 'tsx', 'scripts/ops/seed-exam-demo.ts'], childEnv);
  process.stdout.write('migrate and seed complete\n');
}

function writeFrontendEnv() {
  const target = path.join(root, 'frontend-app/.env.local');
  writeFileSync(
    target,
    [
      'VITE_API_PROVIDER=nest',
      'VITE_AUTH_PROVIDER=nest',
      'VITE_CONFORA_API_URL=http://localhost:4000',
      'VITE_NEST_AUTH_PILOT_ENABLED=false',
      '',
    ].join('\n'),
  );
  process.stdout.write('wrote frontend-app/.env.local\n');
}

async function status() {
  const ports = [
    ['postgres', process.env.POSTGRES_PORT ?? '5432'],
    ['keycloak', '18080'],
    ['api', '4000'],
    ['frontend', '3001'],
  ];
  for (const [name, port] of ports) {
    const socket = await import('node:net');
    const open = await new Promise((resolve) => {
      const client = socket.connect({ host: '127.0.0.1', port: Number(port) }, () => {
        client.end();
        resolve(true);
      });
      client.on('error', () => resolve(false));
    });
    process.stdout.write(`${name} ${port} ${open ? 'open' : 'closed'}\n`);
  }
}

const command = process.argv[2] ?? 'status';
const actions = {
  'init-secrets': initSecrets,
  'init-database': initDatabase,
  'render-realm': () => run(process.execPath, ['scripts/local/render-realm.mjs'], process.env),
  'import-realm': importRealm,
  'provision-users': provisionUsers,
  'configure-amr': configureAmr,
  'migrate-seed': migrateAndSeed,
  'write-frontend-env': writeFrontendEnv,
  status,
  setup: async () => {
    initSecrets();
    await initDatabase();
    await run(process.execPath, ['scripts/local/render-realm.mjs'], process.env);
    writeFrontendEnv();
    await migrateAndSeed();
  },
};

const action = actions[command];
if (!action) {
  process.stderr.write(
    'commands: init-secrets, init-database, render-realm, import-realm, provision-users, configure-amr, migrate-seed, write-frontend-env, setup, status\n',
  );
  process.exit(1);
}
await action();
