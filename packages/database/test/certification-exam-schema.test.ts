import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const schema = await readFile(path.join(packageRoot, 'prisma', 'schema.prisma'), 'utf8');
const migration = await readFile(
  path.join(
    packageRoot,
    'prisma',
    'migrations',
    '20261020143000_certification_exam_foundation',
    'migration.sql',
  ),
  'utf8',
);
const identityMigration = await readFile(
  path.join(
    packageRoot,
    'prisma',
    'migrations',
    '20261020160000_exam_identity_check_ready',
    'migration.sql',
  ),
  'utf8',
);

function modelBlock(source: string, name: string): string {
  const match = new RegExp(`^model ${name} \\{[\\s\\S]*?^\\}`, 'm').exec(source);
  const block = match?.[0];
  assert.ok(block, `model ${name} is missing`);
  return block;
}

test('certification exam models are tenant scoped and do not store identity images', () => {
  for (const name of [
    'SchemeExamItem',
    'ExamBlueprint',
    'StandardSettingRecord',
    'AssembledExamForm',
    'CertificationExamSession',
    'CertificationExamResult',
    'ExamCertificationDecision',
    'ExamProctorFlag',
    'ExamItemStatistic',
  ]) {
    const block = modelBlock(schema, name);
    assert.match(block, /\btenantId\b/, name);
    assert.match(block, /onDelete:\s*Restrict/, name);
  }
  const session = modelBlock(schema, 'CertificationExamSession');
  assert.match(session, /identityCaptureState\s+IdentityCaptureState/);
  assert.doesNotMatch(session, /image|webcam|jmbg|nationalId/i);
  const flag = modelBlock(schema, 'ExamProctorFlag');
  assert.doesNotMatch(flag, /disqualif|image|webcam/i);
  const decision = modelBlock(schema, 'ExamCertificationDecision');
  assert.match(decision, /\bindependentOfTraining\b/);
  assert.doesNotMatch(decision, /\bCredential\b/);
  const identity = modelBlock(schema, 'IdentityCheck');
  assert.match(identity, /documentType\s+IdentityDocumentType\?/);
  const link = modelBlock(schema, 'CertificationExamIdentityLink');
  assert.match(link, /\bidentityCheckId\b/);
  assert.doesNotMatch(link, /image|webcam|jmbg|nationalId/i);
  assert.match(schema, /READY/);
});

test('exam migration is additive and leaves frozen tables untouched', () => {
  assert.match(migration, /CREATE TABLE "SchemeExamItem"/);
  assert.match(migration, /CREATE TABLE "ExamBlueprint"/);
  assert.match(migration, /CREATE TABLE "CertificationExamSession"/);
  assert.doesNotMatch(migration, /\bINSERT\b/i);
  assert.doesNotMatch(migration, /\bDROP\b/i);
  for (const table of [
    'User',
    'Tenant',
    'CertificationApplication',
    'AuditEvent',
    'ComplaintCase',
    'AppealCase',
    'AssessmentItem',
  ]) {
    assert.doesNotMatch(migration, new RegExp(`ALTER TABLE "${table}"`));
    assert.doesNotMatch(identityMigration, new RegExp(`ALTER TABLE "${table}"`));
  }
  assert.match(identityMigration, /CREATE TABLE "CertificationExamIdentityLink"/);
  assert.match(identityMigration, /ADD COLUMN "documentType"/);
  assert.doesNotMatch(identityMigration, /\bINSERT\b/i);
  assert.doesNotMatch(identityMigration, /\bDROP\b/i);
  assert.doesNotMatch(identityMigration, /image|jmbg/i);
});
