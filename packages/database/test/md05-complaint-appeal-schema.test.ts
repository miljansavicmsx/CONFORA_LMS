import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const BASE_SHA = '08d48ac60cc791b1e4f1400e1814b2d4c8405642';
const REVERSE_LABEL = 'MANUAL REVIEWED REVERSE PROCEDURE — NOT EXECUTED BY FORWARD MIGRATION';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(packageRoot, '..', '..');
const schemaPath = path.join(packageRoot, 'prisma', 'schema.prisma');
const migrationPath = path.join(
  packageRoot,
  'prisma',
  'migrations',
  '20261005120000_md05_complaints_appeals_cases',
  'migration.sql',
);

const COMPLAINT_SCALARS = ['id', 'tenantId', 'internalCaseId', 'complainantUserId'] as const;
const APPEAL_SCALARS = [
  'id',
  'tenantId',
  'internalCaseId',
  'appellantUserId',
  'certificationDecisionReference',
  'originalDecisionMakerUserId',
  'committeeIdentifier',
] as const;

const SCALAR_TYPES = new Set([
  'String',
  'Boolean',
  'Int',
  'BigInt',
  'DateTime',
  'Json',
  'Bytes',
  'Float',
  'Decimal',
]);

type ScalarField = {
  readonly name: string;
  readonly typeName: string;
  readonly optional: boolean;
  readonly attributes: string;
};

const schema = await readFile(schemaPath, 'utf8');
const migration = await readFile(migrationPath, 'utf8');
const baseSchema = gitShow('packages/database/prisma/schema.prisma');

function gitShow(repoPath: string): string {
  return execSync(`git show ${BASE_SHA}:${repoPath}`, {
    cwd: repoRoot,
    encoding: 'utf8',
  });
}

function modelBlock(source: string, name: string): string {
  const match = new RegExp(`^model ${name} \\{[\\s\\S]*?^\\}`, 'm').exec(source);
  const block = match?.[0];
  assert.ok(block, `model ${name} is missing`);
  return block;
}

function modelNames(source: string): string[] {
  return [...source.matchAll(/^model\s+([A-Za-z0-9_]+)/gm)]
    .map((match) => match[1])
    .filter((name): name is string => typeof name === 'string');
}

function scalarFields(block: string): ScalarField[] {
  const lines = block.split('\n').slice(1, -1);
  const fields: ScalarField[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (
      trimmed.length === 0 ||
      trimmed.startsWith('//') ||
      trimmed.startsWith('@@') ||
      trimmed.startsWith('///')
    ) {
      continue;
    }
    const match =
      /^([A-Za-z_][A-Za-z0-9_]*)\s+([A-Za-z_][A-Za-z0-9_]*)(\?)?(\[\])?(?:\s+(.*))?$/u.exec(
        trimmed,
      );
    if (!match) {
      continue;
    }
    const name = match[1];
    const typeName = match[2];
    if (!name || !typeName || match[4] === '[]' || !SCALAR_TYPES.has(typeName)) {
      continue;
    }
    fields.push({
      name,
      typeName,
      optional: match[3] === '?',
      attributes: match[5] ?? '',
    });
  }
  return fields;
}

function fieldMap(block: string): Map<string, ScalarField> {
  return new Map(scalarFields(block).map((field) => [field.name, field]));
}

function executableSql(sql: string): string {
  const withoutBlocks = sql.replace(/\/\*[\s\S]*?\*\//g, '');
  return withoutBlocks
    .split('\n')
    .map((line) => line.replace(/--.*$/u, ''))
    .join('\n');
}

function sqlStatements(sql: string): string[] {
  return executableSql(sql)
    .split(';')
    .map((statement) => statement.replace(/\s+/g, ' ').trim())
    .filter((statement) => statement.length > 0);
}

function changedPaths(): string[] {
  const tracked = execSync(`git diff --name-only ${BASE_SHA}`, {
    cwd: repoRoot,
    encoding: 'utf8',
  });
  const untracked = execSync('git ls-files --others --exclude-standard', {
    cwd: repoRoot,
    encoding: 'utf8',
  });
  return [...new Set(`${tracked}\n${untracked}`.split('\n').map((line) => line.trim()))]
    .filter((line) => line.length > 0)
    .sort();
}

function assertRequired(fields: Map<string, ScalarField>, name: string): void {
  const field = fields.get(name);
  assert.ok(field, `${name} is missing`);
  assert.equal(field.optional, false, `${name} must be required`);
}

const complaintBlock = modelBlock(schema, 'ComplaintCase');
const appealBlock = modelBlock(schema, 'AppealCase');
const complaintFields = fieldMap(complaintBlock);
const appealFields = fieldMap(appealBlock);
const statements = sqlStatements(migration);
const executable = executableSql(migration);

test('PKG06-01 ComplaintCase exists', () => {
  assert.ok(modelNames(schema).includes('ComplaintCase'));
  assert.match(complaintBlock, /^model ComplaintCase \{/u);
});

test('PKG06-02 AppealCase exists', () => {
  assert.ok(modelNames(schema).includes('AppealCase'));
  assert.match(appealBlock, /^model AppealCase \{/u);
});

test('PKG06-03 no GrievanceCase exists', () => {
  assert.equal(modelNames(schema).includes('GrievanceCase'), false);
  assert.doesNotMatch(executable, /CREATE TABLE "GrievanceCase"/u);
});

test('PKG06-04 no shared complaint or appeal model exists', () => {
  const names = modelNames(schema);
  for (const forbidden of ['Grievance', 'GrievanceCase', 'ComplaintAppealCase', 'Case']) {
    assert.equal(names.includes(forbidden), false, forbidden);
  }
  assert.equal(names.filter((name) => name === 'ComplaintCase' || name === 'AppealCase').length, 2);
  assert.doesNotMatch(schema, /kind\s+String/u);
  assert.doesNotMatch(complaintBlock, /discriminator/iu);
  assert.doesNotMatch(appealBlock, /discriminator/iu);
});

test('PKG06-05 ComplaintCase and AppealCase map to separate tables', () => {
  assert.doesNotMatch(complaintBlock, /@@map\(/u);
  assert.doesNotMatch(appealBlock, /@@map\(/u);
  const tables = statements.filter((statement) => statement.startsWith('CREATE TABLE '));
  assert.deepEqual(
    tables.map((statement) => statement.slice('CREATE TABLE '.length).split(' ')[0]),
    ['"ComplaintCase"', '"AppealCase"'],
  );
});

test('PKG06-06 ComplaintCase requires tenantId', () => {
  assertRequired(complaintFields, 'tenantId');
  assert.match(complaintBlock, /tenant\s+Tenant\s+@relation\([\s\S]*?onDelete:\s*Restrict/u);
  assert.match(executable, /"ComplaintCase"[\s\S]*"tenantId" UUID NOT NULL/u);
});

test('PKG06-07 AppealCase requires tenantId', () => {
  assertRequired(appealFields, 'tenantId');
  assert.match(appealBlock, /tenant\s+Tenant\s+@relation\([\s\S]*?onDelete:\s*Restrict/u);
  assert.match(executable, /"AppealCase"[\s\S]*"tenantId" UUID NOT NULL/u);
});

test('PKG06-08 ComplaintCase requires internalCaseId', () => {
  assertRequired(complaintFields, 'internalCaseId');
  assert.equal(complaintFields.get('internalCaseId')?.typeName, 'String');
  assert.match(executable, /"internalCaseId" VARCHAR\(128\) NOT NULL/u);
});

test('PKG06-09 AppealCase requires internalCaseId', () => {
  assertRequired(appealFields, 'internalCaseId');
  assert.equal(appealFields.get('internalCaseId')?.typeName, 'String');
});

test('PKG06-10 ComplaintCase requires an authenticated complainant identifier', () => {
  assertRequired(complaintFields, 'complainantUserId');
  assert.match(complaintFields.get('complainantUserId')?.attributes ?? '', /@db\.Uuid/u);
  assert.match(
    complaintBlock,
    /complainant\s+User\s+@relation\(fields:\s*\[tenantId,\s*complainantUserId\],\s*references:\s*\[tenantId,\s*id\],\s*onDelete:\s*Restrict\)/u,
  );
  assert.match(
    executable,
    /FOREIGN KEY \("tenantId", "complainantUserId"\) REFERENCES "User"\("tenantId", "id"\) ON DELETE RESTRICT/u,
  );
});

test('PKG06-11 AppealCase requires an authenticated appellant identifier', () => {
  assertRequired(appealFields, 'appellantUserId');
  assert.match(appealFields.get('appellantUserId')?.attributes ?? '', /@db\.Uuid/u);
  assert.match(
    appealBlock,
    /appellant\s+User\s+@relation\("AppealCaseAppellant", fields:\s*\[tenantId,\s*appellantUserId\],\s*references:\s*\[tenantId,\s*id\],\s*onDelete:\s*Restrict\)/u,
  );
});

test('PKG06-12 AppealCase requires a certification-decision reference', () => {
  assertRequired(appealFields, 'certificationDecisionReference');
  assert.match(
    appealFields.get('certificationDecisionReference')?.attributes ?? '',
    /@db\.VarChar\(128\)/u,
  );
  assert.match(executable, /"certificationDecisionReference" VARCHAR\(128\) NOT NULL/u);
});

test('PKG06-13 AppealCase requires the original decision-maker identifier', () => {
  assertRequired(appealFields, 'originalDecisionMakerUserId');
  assert.match(
    appealBlock,
    /originalDecisionMaker\s+User\s+@relation\("AppealCaseOriginalDecisionMaker", fields:\s*\[tenantId,\s*originalDecisionMakerUserId\],\s*references:\s*\[tenantId,\s*id\],\s*onDelete:\s*Restrict\)/u,
  );
  assert.doesNotMatch(executable, /CREATE TRIGGER/iu);
});

test('PKG06-14 committee identifier is optional', () => {
  const field = appealFields.get('committeeIdentifier');
  assert.ok(field);
  assert.equal(field.optional, true);
  assert.doesNotMatch(field.attributes, /@default\(/u);
  assert.match(executable, /"committeeIdentifier" VARCHAR\(128\),/u);
  assert.doesNotMatch(executable, /"committeeIdentifier" VARCHAR\(128\) NOT NULL/u);
});

test('PKG06-15 tenant-scoped complaint uniqueness exists', () => {
  assert.match(complaintBlock, /@@unique\(\[tenantId,\s*internalCaseId\]\)/u);
  assert.match(
    executable,
    /CREATE UNIQUE INDEX "ComplaintCase_tenantId_internalCaseId_key" ON "ComplaintCase"\("tenantId", "internalCaseId"\)/u,
  );
});

test('PKG06-16 tenant-scoped appeal uniqueness exists', () => {
  assert.match(appealBlock, /@@unique\(\[tenantId,\s*internalCaseId\]\)/u);
  assert.match(
    executable,
    /CREATE UNIQUE INDEX "AppealCase_tenantId_internalCaseId_key" ON "AppealCase"\("tenantId", "internalCaseId"\)/u,
  );
});

test('PKG06-17 internal case identifier is not globally unique', () => {
  for (const block of [complaintBlock, appealBlock]) {
    assert.doesNotMatch(block, /@@unique\(\[\s*internalCaseId\s*\]\)/u);
    assert.doesNotMatch(block, /internalCaseId\s+String[^\n]*@unique/u);
  }
  const uniqueIndexes = statements.filter((statement) =>
    statement.startsWith('CREATE UNIQUE INDEX'),
  );
  assert.equal(uniqueIndexes.length, 2);
  for (const index of uniqueIndexes) {
    assert.match(index, /\("tenantId", "internalCaseId"\)/u);
    assert.doesNotMatch(index, /\("internalCaseId"\)/u);
  }
});

test('PKG06-18 complaint model has no narrative', () => {
  assert.deepEqual(
    scalarFields(complaintBlock).map((field) => field.name),
    [...COMPLAINT_SCALARS],
  );
  assert.doesNotMatch(complaintBlock, /\b(narrative|description|reason|body)\b/iu);
});

test('PKG06-19 appeal model has no narrative', () => {
  assert.deepEqual(
    scalarFields(appealBlock).map((field) => field.name),
    [...APPEAL_SCALARS],
  );
  assert.doesNotMatch(appealBlock, /\b(narrative|description|reason|body)\b/iu);
});

test('PKG06-20 neither model has a generic content field', () => {
  for (const fields of [complaintFields, appealFields]) {
    for (const name of ['content', 'body', 'payload', 'data', 'description', 'text']) {
      assert.equal(fields.has(name), false, name);
    }
  }
});

test('PKG06-21 neither model has evidence bytes', () => {
  for (const fields of [complaintFields, appealFields]) {
    for (const field of fields.values()) {
      assert.notEqual(field.typeName, 'Bytes');
      assert.doesNotMatch(field.attributes, /ByteA|Bytes/iu);
    }
    assert.equal(fields.has('evidence'), false);
    assert.equal(fields.has('evidenceUri'), false);
    assert.equal(fields.has('attachmentReference'), false);
  }
  assert.doesNotMatch(executable, /BYTEA/iu);
});

test('PKG06-22 neither model has a free-form JSON business payload', () => {
  for (const fields of [complaintFields, appealFields]) {
    for (const field of fields.values()) {
      assert.notEqual(field.typeName, 'Json');
    }
    assert.equal(fields.has('metadata'), false);
  }
  assert.doesNotMatch(executable, /JSONB|JSON/iu);
});

test('PKG06-23 neither model has a role column', () => {
  for (const fields of [complaintFields, appealFields]) {
    for (const name of fields.keys()) {
      assert.doesNotMatch(name, /role/iu);
    }
  }
});

test('PKG06-24 neither model has a status column', () => {
  for (const fields of [complaintFields, appealFields]) {
    for (const name of ['status', 'state']) {
      assert.equal(fields.has(name), false, name);
    }
  }
  const enums = [...schema.matchAll(/^enum\s+([A-Za-z0-9_]+)/gm)]
    .map((match) => match[1])
    .filter((name): name is string => typeof name === 'string');
  assert.deepEqual(enums, ['AuditOutcome', 'CertificationApplicationStatus']);
  assert.doesNotMatch(executable, /CREATE TYPE/iu);
});

test('PKG06-25 neither model has an operation-result column', () => {
  for (const fields of [complaintFields, appealFields]) {
    for (const name of ['operationResult', 'result', 'outcome']) {
      assert.equal(fields.has(name), false, name);
    }
  }
});

test('PKG06-26 neither model has an outcome body', () => {
  for (const fields of [complaintFields, appealFields]) {
    assert.equal(fields.has('outcomeBody'), false);
    assert.equal(fields.has('decisionBody'), false);
    assert.equal(fields.has('resolutionText'), false);
  }
});

test('PKG06-27 neither model has rationale', () => {
  for (const fields of [complaintFields, appealFields]) {
    assert.equal(fields.has('rationale'), false);
  }
  assert.doesNotMatch(complaintBlock, /\brationale\b/iu);
  assert.doesNotMatch(appealBlock, /\brationale\b/iu);
});

test('PKG06-28 neither model has investigation notes', () => {
  for (const fields of [complaintFields, appealFields]) {
    assert.equal(fields.has('investigationNotes'), false);
    assert.equal(fields.has('notes'), false);
  }
});

test('PKG06-29 neither model has recommendation text', () => {
  for (const fields of [complaintFields, appealFields]) {
    assert.equal(fields.has('recommendation'), false);
    assert.equal(fields.has('recommendationText'), false);
  }
});

test('PKG06-30 neither model has notification state', () => {
  for (const fields of [complaintFields, appealFields]) {
    for (const name of ['notified', 'notificationState', 'notification']) {
      assert.equal(fields.has(name), false, name);
    }
  }
});

test('PKG06-31 neither model has a retention or expiry timestamp', () => {
  for (const fields of [complaintFields, appealFields]) {
    for (const field of fields.values()) {
      assert.notEqual(field.typeName, 'DateTime');
      assert.doesNotMatch(field.name, /retention|expir|archiv|delet/iu);
    }
  }
});

test('PKG06-32 neither model has createdAt or updatedAt', () => {
  for (const fields of [complaintFields, appealFields]) {
    assert.equal(fields.has('createdAt'), false);
    assert.equal(fields.has('updatedAt'), false);
  }
  assert.doesNotMatch(executable, /"createdAt"|"updatedAt"/u);
});

test('PKG06-33 no committee table is created', () => {
  assert.equal(modelNames(schema).includes('Committee'), false);
  assert.equal(modelNames(schema).includes('AppealsCommittee'), false);
  assert.doesNotMatch(executable, /CREATE TABLE "Committee"/u);
  assert.doesNotMatch(executable, /CREATE TABLE "AppealsCommittee"/u);
});

test('PKG06-34 no audit-event definition is added', () => {
  assert.equal(modelBlock(schema, 'AuditEvent'), modelBlock(baseSchema, 'AuditEvent'));
  assert.equal(modelBlock(schema, 'AuditChainHead'), modelBlock(baseSchema, 'AuditChainHead'));
  assert.doesNotMatch(executable, /AuditEvent|AuditChainHead/u);
});

test('PKG06-35 no database trigger is created', () => {
  assert.equal(
    statements.some((statement) => /\bTRIGGER\b/iu.test(statement)),
    false,
  );
  assert.doesNotMatch(executable, /CREATE\s+TRIGGER/iu);
});

test('PKG06-36 no stored procedure is created', () => {
  assert.doesNotMatch(executable, /CREATE\s+(PROCEDURE|FUNCTION)/iu);
});

test('PKG06-37 forward migration creates two separate tables', () => {
  const tables = statements.filter((statement) => statement.startsWith('CREATE TABLE '));
  assert.equal(tables.length, 2);
  assert.match(tables[0] ?? '', /"ComplaintCase"/u);
  assert.match(tables[1] ?? '', /"AppealCase"/u);
});

test('PKG06-38 forward migration is additive', () => {
  assert.ok(statements.length > 0);
  for (const statement of statements) {
    const allowed =
      statement.startsWith('CREATE TABLE "ComplaintCase"') ||
      statement.startsWith('CREATE TABLE "AppealCase"') ||
      statement.startsWith('CREATE UNIQUE INDEX "ComplaintCase_') ||
      statement.startsWith('CREATE UNIQUE INDEX "AppealCase_') ||
      statement.startsWith('ALTER TABLE "ComplaintCase" ADD CONSTRAINT ') ||
      statement.startsWith('ALTER TABLE "AppealCase" ADD CONSTRAINT ');
    assert.equal(allowed, true, statement);
  }
});

test('PKG06-39 forward migration contains no executable DROP', () => {
  assert.doesNotMatch(executable, /\bDROP\b/iu);
});

test('PKG06-40 forward migration contains no reset or truncate', () => {
  assert.doesNotMatch(executable, /\bTRUNCATE\b/iu);
  assert.doesNotMatch(executable, /\bRESET\b/iu);
  assert.doesNotMatch(executable, /\bDROP\s+DATABASE\b/iu);
});

test('PKG06-41 forward migration contains no update or delete', () => {
  for (const statement of statements) {
    const withoutReferentialActions = statement
      .replace(/\bON\s+UPDATE\b/giu, '')
      .replace(/\bON\s+DELETE\b/giu, '');
    assert.doesNotMatch(withoutReferentialActions, /\bUPDATE\b/iu);
    assert.doesNotMatch(withoutReferentialActions, /\bDELETE\b/iu);
    assert.equal(statement.startsWith('UPDATE '), false);
    assert.equal(statement.startsWith('DELETE '), false);
  }
});

test('PKG06-42 manual reverse procedure is present and commented', () => {
  assert.ok(migration.includes(REVERSE_LABEL));
  assert.match(migration, /Prisma migrate deploy remains forward-only\./u);
  assert.match(migration, /not an automatic production rollback/u);
  const labelIndex = migration.indexOf(REVERSE_LABEL);
  const reverseSection = migration.slice(labelIndex);
  assert.match(reverseSection, /^-- /mu);
  assert.doesNotMatch(executable, /REVERSE PROCEDURE/u);
  assert.doesNotMatch(executableSql(reverseSection), /\bDROP\b/iu);
});

test('PKG06-43 reverse procedure drops only the two new tables', () => {
  const dropLines = migration.split('\n').filter((line) => /\bDROP\s+TABLE\b/iu.test(line));
  assert.deepEqual(
    dropLines.map((line) => line.trim()),
    ['-- DROP TABLE "AppealCase";', '-- DROP TABLE "ComplaintCase";'],
  );
  for (const line of dropLines) {
    assert.equal(line.trim().startsWith('--'), true);
  }
});

test('PKG06-44 tenant foreign keys use non-cascading deletion', () => {
  const foreignKeys = statements.filter((statement) => statement.includes('FOREIGN KEY'));
  assert.equal(foreignKeys.length, 5);
  const tenantKeys = foreignKeys.filter((statement) => statement.includes('REFERENCES "Tenant"'));
  assert.equal(tenantKeys.length, 2);
  for (const statement of foreignKeys) {
    assert.match(statement, /ON DELETE RESTRICT/u);
    assert.doesNotMatch(statement, /ON DELETE CASCADE/iu);
  }
});

test('PKG06-45 no production migration command is added', async () => {
  assert.equal(
    gitShow('packages/database/package.json'),
    await readFile(path.join(packageRoot, 'package.json'), 'utf8'),
  );
  assert.equal(
    gitShow('package.json'),
    await readFile(path.join(repoRoot, 'package.json'), 'utf8'),
  );
  const paths = changedPaths();
  assert.equal(
    paths.some((changed) => changed.startsWith('.github/workflows/')),
    false,
  );
  assert.doesNotMatch(executable, /\bprisma\b/iu);
  assert.doesNotMatch(executable, /\bmigrate\b/iu);
});

test('PKG06-46 complaint and appeal schema contract stays self-contained', async () => {
  const focusedTestPath = fileURLToPath(import.meta.url);
  assert.equal((await stat(schemaPath)).isFile(), true);
  assert.equal((await stat(migrationPath)).isFile(), true);
  assert.equal((await stat(focusedTestPath)).isFile(), true);
  assert.equal(
    path.basename(path.dirname(migrationPath)),
    '20261005120000_md05_complaints_appeals_cases',
  );

  const names = modelNames(schema);
  for (const model of ['ComplaintCase', 'AppealCase']) {
    assert.equal(names.includes(model), true, model);
  }
  const createdTables = statements
    .filter((statement) => statement.startsWith('CREATE TABLE '))
    .map((statement) => statement.slice('CREATE TABLE '.length).split(' ')[0]);
  assert.deepEqual(createdTables, ['"ComplaintCase"', '"AppealCase"']);
  for (const forbidden of [
    'Grievance',
    'GrievanceCase',
    'ComplaintAppealCase',
    'CombinedComplaintAppealCase',
    'Case',
  ]) {
    assert.equal(names.includes(forbidden), false, forbidden);
  }

  const prohibitedField = /\b(role|status|state|lifecycle|content|narrative|body|evidence)\b/iu;
  assert.doesNotMatch(complaintBlock, prohibitedField);
  assert.doesNotMatch(appealBlock, prohibitedField);

  const contractSource = `${schema}\n${migration}`;
  for (const runtimePath of [
    'apps/api/',
    'frontend-app/',
    'audit.service',
    'role-administration',
  ]) {
    assert.equal(contractSource.includes(runtimePath), false, runtimePath);
  }

  const historicalBarTests = [
    'bar-p02-schema-invariants.test.ts',
    'bar-p04-active-state-invariants.test.ts',
    'bar-p05-audit-schema-invariants.test.ts',
    'bar-p06-certification-application-schema-invariants.test.ts',
    'bar-p07-schema-zero-delta-invariants.test.ts',
  ];
  for (const fileName of historicalBarTests) {
    const source = await readFile(path.join(packageRoot, 'test', fileName), 'utf8');
    assert.match(source, /\btest\(/u, fileName);
    assert.equal(source.includes('test.skip'), false, fileName);
    assert.equal(source.includes('test.only'), false, fileName);
  }
  // Changed-path review is an external Git gate, not a permanent runtime invariant.
});

test('PKG06-47 no lockfile is changed', async () => {
  const paths = changedPaths();
  for (const lockfile of ['pnpm-lock.yaml', 'package-lock.json', 'yarn.lock']) {
    assert.equal(paths.includes(lockfile), false, lockfile);
  }
  assert.equal(
    gitShow('pnpm-lock.yaml'),
    await readFile(path.join(repoRoot, 'pnpm-lock.yaml'), 'utf8'),
  );
});

test('PKG06-48 complaint and appeal policy files remain unchanged', async () => {
  const policyPaths = [
    'apps/api/src/cert-complaints/complaint-case.policy.ts',
    'apps/api/src/cert-complaints/complaint-case.types.ts',
    'apps/api/src/cert-complaints/complaint-case.policy.spec.ts',
    'apps/api/src/cert-appeals/appeal-case.policy.ts',
    'apps/api/src/cert-appeals/appeal-case.types.ts',
    'apps/api/src/cert-appeals/appeal-case.policy.spec.ts',
  ];
  for (const policyPath of policyPaths) {
    const disk = await readFile(path.join(repoRoot, policyPath), 'utf8');
    assert.equal(disk, gitShow(policyPath), policyPath);
  }
});

test('PKG06-49 existing AuditEvent and AuditChainHead models remain unchanged', () => {
  assert.equal(modelBlock(schema, 'AuditEvent'), modelBlock(baseSchema, 'AuditEvent'));
  assert.equal(modelBlock(schema, 'AuditChainHead'), modelBlock(baseSchema, 'AuditChainHead'));
  assert.equal(
    modelBlock(schema, 'CertificationApplication'),
    modelBlock(baseSchema, 'CertificationApplication'),
  );
});

test('PKG06-50 User receives no role column', () => {
  const userFields = scalarFields(modelBlock(schema, 'User'));
  const baseFields = scalarFields(modelBlock(baseSchema, 'User'));
  assert.deepEqual(
    userFields.map((field) => field.name),
    baseFields.map((field) => field.name),
  );
  for (const field of userFields) {
    assert.doesNotMatch(field.name, /role/iu);
  }
  assert.doesNotMatch(executable, /ALTER TABLE "User"/u);
});

test('PKG06-51 the migration contains no seed data', () => {
  assert.doesNotMatch(executable, /\bINSERT\b/iu);
  assert.doesNotMatch(executable, /\bCOPY\b/iu);
  assert.doesNotMatch(migration, /\bINSERT\s+INTO\b/iu);
});

test('PKG06-52 no client-supplied tenant-authority field is introduced', () => {
  for (const fields of [complaintFields, appealFields]) {
    for (const name of fields.keys()) {
      assert.doesNotMatch(name, /client|authority|supplied/iu);
    }
    assertRequired(fields, 'tenantId');
  }
  assert.doesNotMatch(executable, /clientTenant|tenantAuthority/iu);
});

test('PKG06-53 no appeals_committee role or default is introduced', () => {
  assert.doesNotMatch(schema, /appeals_committee/u);
  assert.doesNotMatch(migration, /appeals_committee/u);
  const committee = appealFields.get('committeeIdentifier');
  assert.ok(committee);
  assert.doesNotMatch(committee.attributes, /@default\(/u);
});

test('PKG06-54 P10Y is not persisted as a row-level retention clock', () => {
  assert.doesNotMatch(schema, /P10Y/u);
  assert.doesNotMatch(migration, /P10Y/u);
  for (const fields of [complaintFields, appealFields]) {
    for (const name of fields.keys()) {
      assert.doesNotMatch(name, /retention|expir|clock/iu);
    }
  }
});

test('PKG06-55 PKG-04 and PKG-05 remain deny-only', async () => {
  const complaintPolicy = await readFile(
    path.join(repoRoot, 'apps/api/src/cert-complaints/complaint-case.policy.ts'),
    'utf8',
  );
  const appealPolicy = await readFile(
    path.join(repoRoot, 'apps/api/src/cert-appeals/appeal-case.policy.ts'),
    'utf8',
  );
  assert.match(complaintPolicy, /allowed:\s*false/u);
  assert.match(complaintPolicy, /COMPLAINT_POLICY_EFFECT/u);
  assert.match(appealPolicy, /allowed:\s*false/u);
  assert.match(appealPolicy, /APPEAL_POLICY_EFFECT/u);
  assert.doesNotMatch(complaintPolicy, /@prisma\/client|prisma\./u);
  assert.doesNotMatch(appealPolicy, /@prisma\/client|prisma\./u);
  assert.equal(complaintPolicy, gitShow('apps/api/src/cert-complaints/complaint-case.policy.ts'));
  assert.equal(appealPolicy, gitShow('apps/api/src/cert-appeals/appeal-case.policy.ts'));
});
