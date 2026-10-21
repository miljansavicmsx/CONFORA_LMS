import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const schemaPath = path.join(packageRoot, 'prisma', 'schema.prisma');
const migrationPath = path.join(
  packageRoot,
  'prisma',
  'migrations',
  '20261019140000_product_plan_domain_baseline',
  'migration.sql',
);

const schema = await readFile(schemaPath, 'utf8');
const migration = await readFile(migrationPath, 'utf8');
const learningRuntimeMigration = await readFile(
  path.join(
    packageRoot,
    'prisma',
    'migrations',
    '20261020120000_learning_catalogue_runtime',
    'migration.sql',
  ),
  'utf8',
);

const REQUIRED_MODELS = [
  'UserProfile',
  'UserAccessibilityNeed',
  'CommitteeMembership',
  'BreakGlassAccess',
  'StaffDeclaration',
  'Competence',
  'ProficiencyLevel',
  'Course',
  'CourseChapter',
  'CourseLesson',
  'ContentBlock',
  'CourseApproval',
  'Enrolment',
  'EnrolmentTrainer',
  'LessonProgress',
  'LearningActivityRecord',
  'ItemScenarioGroup',
  'ItemScenarioMembership',
  'AssessmentItem',
  'AssessmentItemChoice',
  'AssessmentItemCompetence',
  'ItemReview',
  'Quiz',
  'QuizItem',
  'ExamForm',
  'ExamFormItem',
  'ExamFormCourse',
  'ExamFormScheme',
  'IdentityCheck',
  'ExamSession',
  'ExamDutyAssignment',
  'ExamAttempt',
  'ExamAttemptAnswer',
  'ProctorSignal',
  'ProctorSignalReview',
  'CertificationScheme',
  'CertificationSchemeVersion',
  'SchemeCompetenceRequirement',
  'CertificationApplicationDetail',
  'ApplicationExperience',
  'ApplicationReferee',
  'CertificationDecision',
  'DecisionParticipant',
  'Credential',
  'AttendanceCredentialLink',
  'PersonnelCredentialLink',
  'AchievementRecord',
  'CredentialLifecycleEvent',
  'VerificationLog',
  'RecertificationCase',
  'RecertificationOutcome',
  'Invoice',
  'Payment',
  'AmfMembership',
  'AmfSuspensionProposal',
  'AmfSuspensionConfirmation',
  'ControlledDocument',
  'DocumentVersion',
  'DocumentApproval',
  'RiskRecord',
  'InternalAudit',
  'CorrectiveAction',
  'ManagementReview',
  'ImpartialityReport',
  'AiSystem',
  'AiSuggestion',
  'AiSuggestionReview',
  'AiAuditRecord',
  'AiDisclosureAcknowledgement',
] as const;

function modelBlock(source: string, name: string): string {
  const match = new RegExp(`^model ${name} \\{[\\s\\S]*?^\\}`, 'm').exec(source);
  const block = match?.[0];
  assert.ok(block, `model ${name} is missing`);
  return block;
}

function enumMembers(source: string, name: string): string[] {
  const match = new RegExp(`^enum ${name} \\{([\\s\\S]*?)^\\}`, 'm').exec(source);
  const body = match?.[1];
  assert.ok(body, `enum ${name} is missing`);
  return body
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('//'));
}

test('product-plan models exist and are tenant scoped with restrict deletes', () => {
  for (const name of REQUIRED_MODELS) {
    const block = modelBlock(schema, name);
    assert.match(block, /\btenantId\b/, name);
    assert.match(block, /onDelete:\s*Restrict/, name);
    assert.doesNotMatch(block, /onDelete:\s*Cascade/i, name);
  }
});

test('frozen identity scalars stay on User and sensitive profile data stays off User', () => {
  const user = modelBlock(schema, 'User');
  assert.match(user, /\bid\s+String\s+@id/);
  assert.match(user, /\btenantId\s+String/);
  assert.match(user, /\bemail\s+String/);
  assert.match(user, /\bisActive\s+Boolean\s+@default\(false\)/);
  const lowered = user.toLowerCase();
  for (const needle of [
    'createdat',
    'updatedat',
    'deletedat',
    'status',
    'mfa',
    'password',
    'accesstoken',
    'refreshtoken',
    'role',
  ]) {
    assert.equal(lowered.includes(needle), false, needle);
  }
  assert.doesNotMatch(user, /\bnationalIdNumber\b/);
  assert.match(modelBlock(schema, 'UserProfile'), /\bnationalIdNumber\b/);
  assert.match(modelBlock(schema, 'UserAccessibilityNeed'), /\bneedCode\b/);
  assert.match(modelBlock(schema, 'UserAccessibilityNeed'), /\bextraTimePercent\b/);
});

test('local role grant tables stay absent and committee membership is an appointment record', () => {
  for (const name of ['Role', 'UserRole', 'Permission', 'UserPermission', 'TenantRole']) {
    assert.equal(new RegExp(`^model ${name}\\b`, 'm').test(schema), false, name);
  }
  const membership = modelBlock(schema, 'CommitteeMembership');
  assert.match(membership, /\bcanonicalCode\b/);
  assert.match(membership, /\bcommitteeCode\b/);
  assert.doesNotMatch(membership, /\brole\b/i);
});

test('course lifecycle, content kinds and chapter quiz minimum time are present', () => {
  assert.deepEqual(enumMembers(schema, 'CourseLifecycle'), [
    'DRAFT',
    'IN_TC_REVIEW',
    'APPROVED',
    'PUBLISHED',
    'UNPUBLISHED',
  ]);
  assert.deepEqual(enumMembers(schema, 'ContentBlockKind'), ['PDF', 'VIDEO', 'TEXT']);
  const course = modelBlock(schema, 'Course');
  for (const field of [
    'areaCode',
    'imageObjectKey',
    'priceAmount',
    'requiresCertification',
    'language',
    'educationalLevel',
    'targetAudience',
    'typicalLearningTimeMinutes',
    'learningObjectives',
    'minimumTimeSeconds',
  ]) {
    assert.match(course, new RegExp(`\\b${field}\\b`), field);
  }
  assert.match(modelBlock(schema, 'CourseChapter'), /\bminimumTimeSeconds\b/);
  assert.match(modelBlock(schema, 'Quiz'), /\bchapterId\b/);
  assert.match(modelBlock(schema, 'Quiz'), /\bpassMarkPercent\b/);
});

test('xAPI learning records keep statement identity separate from analytics consent', () => {
  const record = modelBlock(schema, 'LearningActivityRecord');
  for (const field of [
    'statementId',
    'verbIri',
    'objectKind',
    'objectId',
    'rawStatement',
    'analyticsConsent',
  ]) {
    assert.match(record, new RegExp(`\\b${field}\\b`), field);
  }
  assert.match(record, /analyticsConsent\s+Boolean\s+@default\(false\)/);
});

test('item bank has one correct key, item time, scenario membership and AI flag', () => {
  const item = modelBlock(schema, 'AssessmentItem');
  assert.match(item, /\bcorrectChoiceKey\b/);
  assert.match(item, /\btimeLimitSeconds\b/);
  assert.match(item, /isAiGenerated\s+Boolean\s+@default\(false\)/);
  assert.match(modelBlock(schema, 'ItemScenarioMembership'), /\bgroupId\b/);
  assert.match(modelBlock(schema, 'ItemScenarioMembership'), /\bitemId\b/);
  assert.match(modelBlock(schema, 'AssessmentItemCompetence'), /\bcompetenceId\b/);
  assert.deepEqual(enumMembers(schema, 'ItemReviewState'), [
    'DRAFT',
    'IN_REVIEW',
    'APPROVED',
    'REJECTED',
  ]);
});

test('exam session requires rules, NDA, invigilator, identity check, MFA and a 90 day retake window', () => {
  const session = modelBlock(schema, 'ExamSession');
  for (const field of [
    'rulesAcceptedAt',
    'ndaAcceptedAt',
    'invigilatorUserId',
    'identityCheckId',
    'mfaReference',
  ]) {
    assert.match(session, new RegExp(`\\b${field}\\b`), field);
    assert.doesNotMatch(session, new RegExp(`\\b${field}\\s+\\S+\\?`), field);
  }
  assert.match(modelBlock(schema, 'ExamForm'), /retakeWindowDays\s+Int\s+@default\(90\)/);
  assert.deepEqual(enumMembers(schema, 'IdentityCheckMethod'), ['HUMAN_VISUAL']);
  assert.match(modelBlock(schema, 'ProctorSignal'), /\bsource\s+ProctorSignalSource/);
  assert.doesNotMatch(modelBlock(schema, 'ProctorSignal'), /\bdisqualified\b/i);
  assert.match(modelBlock(schema, 'EnrolmentTrainer'), /\btrainerUserId\b/);
});

test('certification path, committee decision and credential types stay distinct from AMF', () => {
  const detail = modelBlock(schema, 'CertificationApplicationDetail');
  assert.match(detail, /\bcertificationApplicationId\b/);
  assert.match(detail, /\bpathway\s+CertificationPathway/);
  assert.doesNotMatch(detail, /\bAmfMembership\b/);
  assert.doesNotMatch(detail, /@relation\([\s\S]*CertificationApplication\b/);
  assert.deepEqual(enumMembers(schema, 'CertificationPathway'), [
    'CONFORA_TRAINING',
    'EXTERNAL_EQUIVALENT',
  ]);
  assert.match(
    modelBlock(schema, 'CertificationSchemeVersion'),
    /refereeCount\s+Int\s+@default\(2\)/,
  );
  assert.match(modelBlock(schema, 'DecisionParticipant'), /\btrainerOfCandidate\b/);
  assert.match(modelBlock(schema, 'DecisionParticipant'), /\bexaminesOwnTrainee\b/);
  assert.match(modelBlock(schema, 'PersonnelCredentialLink'), /\bdecisionId\b/);
  assert.match(modelBlock(schema, 'AttendanceCredentialLink'), /\bcourseId\b/);
  assert.doesNotMatch(modelBlock(schema, 'AttendanceCredentialLink'), /\bdecisionId\b/);
  assert.deepEqual(enumMembers(schema, 'CredentialType'), ['ATTENDANCE', 'PERSONNEL']);
  assert.deepEqual(enumMembers(schema, 'CredentialLifecycle'), [
    'ACTIVE',
    'EXPIRED',
    'SUSPENDED',
    'WITHDRAWN',
    'SCOPE_REDUCED',
  ]);
  const credential = modelBlock(schema, 'Credential');
  assert.match(credential, /\bpublicUid\b/);
  assert.match(credential, /\bpayloadHash\b/);
  assert.match(credential, /\bqrVerifyToken\b/);
  assert.match(modelBlock(schema, 'AchievementRecord'), /\bachievementTitle\b/);
  assert.match(modelBlock(schema, 'AchievementRecord'), /\bcriteriaSummary\b/);
});

test('verification, recertification, AMF proposal and governance records exist', () => {
  const log = modelBlock(schema, 'VerificationLog');
  assert.match(log, /\bsourceIp\b/);
  assert.match(log, /\bverifiedAt\b/);
  assert.match(log, /\bresult\s+VerificationResult/);
  assert.match(modelBlock(schema, 'AmfSuspensionProposal'), /\bproposedByUserId\b/);
  assert.match(modelBlock(schema, 'AmfSuspensionConfirmation'), /\bconfirmedByUserId\b/);
  assert.match(modelBlock(schema, 'DocumentVersion'), /\bnextReviewAt\b/);
  assert.match(modelBlock(schema, 'DocumentVersion'), /\bversionLabel\b/);
  const risk = modelBlock(schema, 'RiskRecord');
  assert.match(risk, /\blikelihood\b/);
  assert.match(risk, /\bimpact\b/);
  assert.match(risk, /\bband\s+RiskBand/);
  assert.deepEqual(enumMembers(schema, 'RiskBand'), ['GREEN', 'YELLOW', 'RED']);
  const report = modelBlock(schema, 'ImpartialityReport');
  assert.match(report, /\bbody\b/);
  assert.doesNotMatch(report, /\buserId\b/);
  assert.match(modelBlock(schema, 'BreakGlassAccess'), /\breason\b/);
  assert.match(modelBlock(schema, 'BreakGlassAccess'), /\bscopeLabel\b/);
});

test('AI suggestion, audit and candidate acknowledgement are separate records', () => {
  assert.match(modelBlock(schema, 'AiSuggestion'), /isAiGenerated\s+Boolean\s+@default\(true\)/);
  assert.match(modelBlock(schema, 'AiSuggestionReview'), /\breviewerUserId\b/);
  const audit = modelBlock(schema, 'AiAuditRecord');
  assert.match(audit, /\bpromptHash\b/);
  assert.match(audit, /\boutputHash\b/);
  assert.match(audit, /\boccurredAt\b/);
  assert.match(modelBlock(schema, 'AiDisclosureAcknowledgement'), /\bnoticeVersion\b/);
  assert.match(modelBlock(schema, 'AiDisclosureAcknowledgement'), /\backnowledgedAt\b/);
  assert.match(
    modelBlock(schema, 'AiSystem'),
    /\bhumanOversightRequired\s+Boolean\s+@default\(true\)/,
  );
});

test('learning runtime adds payment stub, consent and chapter quiz attempts', () => {
  assert.deepEqual(enumMembers(schema, 'EnrolmentPaymentState'), [
    'PENDING_PAYMENT',
    'NOT_REQUIRED',
  ]);
  assert.match(modelBlock(schema, 'EnrolmentPaymentIntent'), /\bstate\s+EnrolmentPaymentState/);
  assert.match(modelBlock(schema, 'LearnerAnalyticsConsent'), /\bgranted\s+Boolean/);
  assert.match(modelBlock(schema, 'ChapterQuizAttempt'), /\bscorePercent\b/);
  assert.match(modelBlock(schema, 'ChapterQuizAttemptAnswer'), /\bselectedChoiceKey\b/);
  assert.match(learningRuntimeMigration, /CREATE TABLE "EnrolmentPaymentIntent"/);
  assert.doesNotMatch(learningRuntimeMigration, /\bINSERT\b/i);
  assert.doesNotMatch(learningRuntimeMigration, /\bDROP\b/i);
  assert.doesNotMatch(learningRuntimeMigration, /ALTER TABLE "User"/);
  assert.doesNotMatch(learningRuntimeMigration, /ALTER TABLE "Enrolment"/);
});

test('domain migration is additive and does not rewrite frozen tables', () => {
  assert.match(migration, /CREATE TABLE "Course"/);
  assert.match(migration, /CREATE TABLE "LearningActivityRecord"/);
  assert.match(migration, /CREATE TABLE "Credential"/);
  assert.match(migration, /CREATE TABLE "AmfSuspensionProposal"/);
  assert.doesNotMatch(migration, /\bINSERT\b/i);
  assert.doesNotMatch(migration, /\bDROP\b/i);
  assert.doesNotMatch(migration, /ALTER TABLE "User"/);
  assert.doesNotMatch(migration, /ALTER TABLE "Tenant"/);
  assert.doesNotMatch(migration, /ALTER TABLE "CertificationApplication"/);
  assert.doesNotMatch(migration, /ALTER TABLE "AuditEvent"/);
  assert.doesNotMatch(migration, /ALTER TABLE "ComplaintCase"/);
  assert.doesNotMatch(migration, /ALTER TABLE "AppealCase"/);
  assert.match(modelBlock(schema, 'CertificationApplication'), /\bschemeRef\b/);
  assert.doesNotMatch(modelBlock(schema, 'CertificationApplication'), /\bpathway\b/);
});
