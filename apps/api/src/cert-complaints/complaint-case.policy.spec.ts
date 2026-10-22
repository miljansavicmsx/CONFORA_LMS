import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { LEARNER_ROLES, PRIVILEGED_ROLES } from '@confora/shared-types';

import { CertComplaintsModule } from './cert-complaints.module';
import {
  classifyAuthenticatedLearnerIntake,
  classifyUnauthenticatedPublicIntake,
  COMPLAINT_OPERATION_AUTHORITY,
  ComplaintCasePolicy,
  evaluateComplaintCasePolicy,
} from './complaint-case.policy';
import {
  ACKNOWLEDGE_AUTHORITY,
  AUTHENTICATED_INTAKE_ROLES,
  COMPLAINT_DATA_CLASSES,
  COMPLAINT_DATA_CLASS_COUNT,
  COMPLAINT_MUTATION_FORBIDDEN_ROLES,
  COMPLAINT_OPERATIONS,
  COMPLAINT_RECORD_RETENTION_ACTION,
  COMPLAINT_RECORD_RETENTION_PERIOD,
  COMPLAINT_RECORD_RETENTION_POLICY,
  COMPLAINT_RECORD_RETENTION_YEARS,
  FINAL_DECISION_AUTHORITY,
  INVESTIGATE_AUTHORITY,
  PRIVACY_BASIS_STATUS,
  RECOMMEND_AUTHORITY,
  TECHNICAL_PROCESSING_PURPOSE,
  UNAUTHENTICATED_PUBLIC_INTAKE,
  type ComplaintOperation,
  type ComplaintPolicyResult,
} from './complaint-case.types';

const TENANT = 'tenant-a';
const OTHER_TENANT = 'tenant-b';
const CASE_ID = 'case-1';
const ACTOR_ID = 'actor-server-1';
const INTAKE_ID = 'intake-server-1';
const INVESTIGATOR_ID = 'investigator-server-1';
const FINAL_ID = 'final-server-1';
const SUBJECT_ID = 'subject-server-1';

const FIXTURE_NARRATIVE = 'FIXTURE_NOT_A_CREDENTIAL_COMPLAINT_NARRATIVE';
const FIXTURE_PASSWORD = 'FIXTURE_REJECTION_PASSWORD_WORD';
const FIXTURE_TOKEN = 'FIXTURE_REJECTION_TOKEN_WORD';
const FIXTURE_PRIVATE_KEY = 'FIXTURE_REJECTION_PRIVATE_KEY_WORD';

const PRODUCTION_FILES = [
  'complaint-case.types.ts',
  'complaint-case.policy.ts',
  'cert-complaints.module.ts',
] as const;

const FORBIDDEN_SOURCE_SNIPPETS = [
  'prisma',
  '@prisma/client',
  '@confora/database',
  'AuditService',
  'audit.service',
  'append(',
  'ExternalIdp',
  'external-idp',
  'fetch(',
  'axios',
  'http.request',
  'https.request',
  'process.env',
  'Date.now',
  'new Date',
  'Math.random',
  'fs.',
  'amqplib',
  '@Controller',
  'Controller(',
  'cert-appeals',
  'allowed: true',
  'accepted: true',
  'mutated: true',
] as const;

function authenticatedParty(userId: string): { kind: 'AUTHENTICATED'; userId: string } {
  return { kind: 'AUTHENTICATED', userId };
}

function actor(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    userId: ACTOR_ID,
    tenantId: TENANT,
    roles: ['USR_CAND'],
    mfaVerified: false,
    ...overrides,
  };
}

function complaintInput(
  operation: ComplaintOperation,
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    domain: 'COMPLAINT',
    operation,
    actor: actor(),
    caseTenantId: TENANT,
    internalCaseId: CASE_ID,
    ...overrides,
  };
}

function distinctParties(subjectUserId: string = SUBJECT_ID): Record<string, unknown> {
  return {
    intakeActor: authenticatedParty(INTAKE_ID),
    investigatorActor: authenticatedParty(INVESTIGATOR_ID),
    recommendationActor: authenticatedParty('recommendation-server-1'),
    finalDecisionActor: authenticatedParty(FINAL_ID),
    subjectActor: authenticatedParty(subjectUserId),
  };
}

function expectDeny(result: ComplaintPolicyResult, code: ComplaintPolicyResult['code']): void {
  expect(result).toEqual({
    allowed: false,
    effect: 'POLICY_DENY_ONLY',
    code,
  });
  expect(Object.keys(result).sort()).toEqual(['allowed', 'code', 'effect']);
}

function productionSource(): string {
  return PRODUCTION_FILES.map((file) => readFileSync(join(__dirname, file), 'utf8')).join('\n');
}

describe('PKG-04 complaint case policy', () => {
  const policy = new ComplaintCasePolicy();

  it('denies each operation with authority not assigned for a valid same-tenant context', () => {
    for (const operation of COMPLAINT_OPERATIONS) {
      expectDeny(
        policy.evaluate(complaintInput(operation, distinctParties())),
        'COMPLAINT_OPERATION_AUTHORITY_NOT_ASSIGNED',
      );
    }
  });

  it('denies a cross-tenant context before operation-authority evaluation', () => {
    const result = evaluateComplaintCasePolicy(
      complaintInput('ACKNOWLEDGE', {
        actor: actor({
          roles: ['STAFF_DIR'],
          mfaVerified: false,
          tenantId: TENANT,
        }),
        caseTenantId: OTHER_TENANT,
        ...distinctParties(),
      }),
    );
    expectDeny(result, 'CROSS_TENANT_COMPLAINT_OPERATION_FORBIDDEN');
  });

  it('fails closed when the actor tenant is missing', () => {
    const withoutTenant = actor();
    delete withoutTenant['tenantId'];
    expectDeny(
      policy.evaluate(complaintInput('ACKNOWLEDGE', { actor: withoutTenant })),
      'ACTOR_TENANT_REQUIRED',
    );
    expectDeny(
      policy.evaluate(complaintInput('ACKNOWLEDGE', { actor: actor({ tenantId: '   ' }) })),
      'ACTOR_TENANT_REQUIRED',
    );
  });

  it('fails closed when required actor context is missing or malformed', () => {
    const withoutActor = complaintInput('INVESTIGATE');
    delete withoutActor['actor'];
    expectDeny(policy.evaluate(withoutActor), 'ACTOR_CONTEXT_REQUIRED');
    expectDeny(
      policy.evaluate(complaintInput('INVESTIGATE', { actor: null })),
      'ACTOR_CONTEXT_REQUIRED',
    );
    expectDeny(
      policy.evaluate(complaintInput('INVESTIGATE', { actor: { roles: ['USR_CAND'] } })),
      'ACTOR_CONTEXT_REQUIRED',
    );
  });

  it('fails closed for a malformed or unknown complaint domain', () => {
    expectDeny(
      policy.evaluate({ ...complaintInput('ACKNOWLEDGE'), domain: '' }),
      'INVALID_COMPLAINT_POLICY_INPUT',
    );
    expectDeny(
      policy.evaluate({ ...complaintInput('ACKNOWLEDGE'), domain: 7 }),
      'INVALID_COMPLAINT_POLICY_INPUT',
    );
    expectDeny(
      policy.evaluate({ ...complaintInput('ACKNOWLEDGE'), domain: 'UNKNOWN' }),
      'NON_COMPLAINT_DOMAIN_FORBIDDEN',
    );
  });

  it('rejects an appeal-shaped domain', () => {
    expectDeny(
      policy.evaluate({ domain: 'APPEAL', operation: 'ACKNOWLEDGE' }),
      'NON_COMPLAINT_DOMAIN_FORBIDDEN',
    );
    expectDeny(
      policy.evaluate({ ...complaintInput('FINAL_DECISION'), domain: 'appeal' }),
      'NON_COMPLAINT_DOMAIN_FORBIDDEN',
    );
  });

  it.each(COMPLAINT_MUTATION_FORBIDDEN_ROLES)('denies complaint mutation by %s', (role) => {
    expectDeny(
      policy.evaluate(
        complaintInput('ACKNOWLEDGE', {
          actor: actor({ roles: [role], mfaVerified: true }),
          ...distinctParties(),
        }),
      ),
      'COMPLAINT_MUTATION_ROLE_FORBIDDEN',
    );
  });

  it.each(COMPLAINT_OPERATIONS)('gives COMPLAINT_HANDLER no %s authority', (operation) => {
    expectDeny(
      policy.evaluate(
        complaintInput(operation, {
          actor: actor({ roles: ['COMPLAINT_HANDLER'], mfaVerified: true }),
          ...distinctParties(),
        }),
      ),
      'COMPLAINT_OPERATION_AUTHORITY_NOT_ASSIGNED',
    );
  });

  it('fails closed when a privileged actor has no MFA', () => {
    expectDeny(
      policy.evaluate(
        complaintInput('RECOMMEND', {
          actor: actor({ roles: ['COMPLAINT_HANDLER'], mfaVerified: false }),
        }),
      ),
      'MFA_REQUIRED',
    );
    expectDeny(
      policy.evaluate(
        complaintInput('ACKNOWLEDGE', {
          actor: actor({ roles: ['STAFF_ROLEADM'], mfaVerified: false }),
        }),
      ),
      'MFA_REQUIRED',
    );
  });

  it('denies intake and investigation by the same actor', () => {
    expectDeny(
      policy.evaluate(
        complaintInput('INVESTIGATE', {
          ...distinctParties(),
          intakeActor: authenticatedParty(INTAKE_ID),
          investigatorActor: authenticatedParty(INTAKE_ID),
        }),
      ),
      'INTAKE_INVESTIGATION_ACTOR_CONFLICT',
    );
  });

  it('denies intake and final decision by the same actor', () => {
    expectDeny(
      policy.evaluate(
        complaintInput('FINAL_DECISION', {
          ...distinctParties(),
          intakeActor: authenticatedParty(INTAKE_ID),
          finalDecisionActor: authenticatedParty(INTAKE_ID),
        }),
      ),
      'INTAKE_FINAL_DECISION_ACTOR_CONFLICT',
    );
  });

  it('denies investigation and final decision by the same actor', () => {
    expectDeny(
      policy.evaluate(
        complaintInput('FINAL_DECISION', {
          ...distinctParties(),
          investigatorActor: authenticatedParty(INVESTIGATOR_ID),
          finalDecisionActor: authenticatedParty(INVESTIGATOR_ID),
        }),
      ),
      'INVESTIGATION_FINAL_DECISION_ACTOR_CONFLICT',
    );
  });

  it('denies a final-decision actor who is the complaint subject', () => {
    expectDeny(
      policy.evaluate(
        complaintInput('FINAL_DECISION', {
          ...distinctParties(FINAL_ID),
          finalDecisionActor: authenticatedParty(FINAL_ID),
        }),
      ),
      'COMPLAINT_SUBJECT_DECISION_ACTOR_CONFLICT',
    );
  });

  it('represents unauthenticated public intake without a fabricated user id', () => {
    const intake = classifyUnauthenticatedPublicIntake();
    expect(intake).toEqual({
      kind: 'UNAUTHENTICATED_PUBLIC_INTAKE',
      classification: UNAUTHENTICATED_PUBLIC_INTAKE,
      authority: 'NONE',
    });
    expect(Object.prototype.hasOwnProperty.call(intake, 'userId')).toBe(false);
    expect(JSON.stringify(intake)).not.toContain('userId');
  });

  it.each(AUTHENTICATED_INTAKE_ROLES)(
    'classifies %s intake with the server-derived user identifier',
    (role) => {
      const serverDerivedUserId = `server-derived-${role}`;
      const intake = classifyAuthenticatedLearnerIntake(role, serverDerivedUserId);
      expect(intake).toEqual({
        kind: 'AUTHENTICATED_LEARNER',
        role,
        userId: serverDerivedUserId,
        authority: 'NONE',
      });
    },
  );

  it('returns an identical result for an identical input', () => {
    const input = complaintInput('ACKNOWLEDGE', distinctParties());
    const first = policy.evaluate(input);
    const second = policy.evaluate(input);
    expect(second).toEqual(first);
    expect(evaluateComplaintCasePolicy(input)).toEqual(first);
  });

  it('does not require raw complaint content on the policy input', () => {
    const input = complaintInput('ACKNOWLEDGE', distinctParties());
    expect(input).not.toHaveProperty('complaintContent');
    expect(input).not.toHaveProperty('COMPLAINT_CONTENT');
    expectDeny(policy.evaluate(input), 'COMPLAINT_OPERATION_AUTHORITY_NOT_ASSIGNED');
  });

  it('does not expose raw complaint content on the policy result', () => {
    const result = policy.evaluate({
      ...complaintInput('ACKNOWLEDGE'),
      complaintContent: FIXTURE_NARRATIVE,
      narrative: FIXTURE_NARRATIVE,
    });
    expectDeny(result, 'INVALID_COMPLAINT_POLICY_INPUT');
    expect(JSON.stringify(result)).not.toContain(FIXTURE_NARRATIVE);
  });

  it('omits secret, token and credential fields from the policy result', () => {
    const result = policy.evaluate({
      ...complaintInput('RECOMMEND'),
      password: FIXTURE_PASSWORD,
      token: FIXTURE_TOKEN,
      privateKey: FIXTURE_PRIVATE_KEY,
    });
    const encoded = JSON.stringify(result);
    expectDeny(result, 'INVALID_COMPLAINT_POLICY_INPUT');
    expect(encoded).not.toContain(FIXTURE_PASSWORD);
    expect(encoded).not.toContain(FIXTURE_TOKEN);
    expect(encoded).not.toContain(FIXTURE_PRIVATE_KEY);
    expect(encoded).not.toContain('password');
    expect(encoded).not.toContain('token');
    expect(encoded).not.toContain('privateKey');
  });

  it('has no network, persistence, audit, identity-provider, or role-mutation path', () => {
    const source = productionSource();
    for (const snippet of FORBIDDEN_SOURCE_SNIPPETS) {
      expect(source).not.toContain(snippet);
    }
    expect(source).not.toContain('role-administration');
    expect(source).not.toContain('GRANT');
    expect(source).not.toContain('REVOKE');
  });

  it('records complaint retention as future policy with no clock, deletion, or archive', () => {
    expect(COMPLAINT_RECORD_RETENTION_PERIOD).toBe('P10Y');
    expect(COMPLAINT_RECORD_RETENTION_YEARS).toBe(10);
    expect(COMPLAINT_RECORD_RETENTION_ACTION).toBe('RETAIN');
    expect(COMPLAINT_RECORD_RETENTION_POLICY).toEqual({
      period: 'P10Y',
      years: 10,
      action: 'RETAIN',
      appliesTo: 'COMPLAINT_RECORDS',
      appealRecordsIncluded: false,
      effect: 'FUTURE_POLICY_ONLY',
    });
    expect(Object.isFrozen(COMPLAINT_RECORD_RETENTION_POLICY)).toBe(true);
    expect(Object.keys(COMPLAINT_RECORD_RETENTION_POLICY)).not.toEqual(
      expect.arrayContaining(['deleteAt', 'archiveAt', 'cron', 'job']),
    );
  });

  it('keeps the six data-class identifiers exact', () => {
    expect([...COMPLAINT_DATA_CLASSES]).toEqual([
      'AUTHENTICATED_USER_IDENTIFIER',
      'TENANT_IDENTIFIER',
      'COMPLAINT_CONTENT',
      'PUBLIC_REFERENCE',
      'INTERNAL_CASE_IDENTIFIER',
      'EVIDENCE_ATTACHMENT_METADATA',
    ]);
    expect(COMPLAINT_DATA_CLASS_COUNT).toBe(6);
    expect(Object.isFrozen(COMPLAINT_DATA_CLASSES)).toBe(true);
    expect(new Set(COMPLAINT_DATA_CLASSES).size).toBe(6);
  });

  it('registers complaints and appeals as separate sibling modules', () => {
    const source = readFileSync(join(__dirname, '../app.module.ts'), 'utf8');
    const complaintsModule = readFileSync(join(__dirname, 'cert-complaints.module.ts'), 'utf8');
    const complaintsPolicy = readFileSync(join(__dirname, 'complaint-case.policy.ts'), 'utf8');
    const complaintsTypes = readFileSync(join(__dirname, 'complaint-case.types.ts'), 'utf8');
    expect(source).toContain(
      "import { CertComplaintsModule } from './cert-complaints/cert-complaints.module';",
    );
    expect(source).toContain(
      "import { CertAppealsModule } from './cert-appeals/cert-appeals.module';",
    );
    expect(source.match(/CertComplaintsModule/g)).toEqual([
      'CertComplaintsModule',
      'CertComplaintsModule',
    ]);
    expect(source.match(/CertAppealsModule/g)).toEqual(['CertAppealsModule', 'CertAppealsModule']);
    expect(source).toContain('controllers: [AppController]');
    expect(source).toContain('useClass: JwtAuthGuard');
    expect(source).toContain('useClass: ActiveAssuranceGuard');
    expect(source).toContain('useClass: MfaAssuranceGuard');
    expect(source).toContain("consumer.apply(ClientTenantRejectionMiddleware).forRoutes('*')");
    expect(source).not.toContain('ComplaintCasePolicy');
    expect(source).not.toContain('AppealCasePolicy');
    expect(source).not.toContain('@Controller');
    expect(complaintsModule).not.toContain('cert-appeals');
    expect(complaintsModule).not.toMatch(/from\s+['"][^'"]*appeal/u);
    expect(complaintsPolicy).not.toContain('cert-appeals');
    expect(complaintsPolicy).not.toMatch(/from\s+['"][^'"]*appeal/u);
    expect(complaintsTypes).not.toContain('cert-appeals');
    expect(complaintsTypes).not.toMatch(/from\s+['"][^'"]*appeal/u);
    expect(complaintsPolicy).toContain('COMPLAINT_OPERATION_AUTHORITY_NOT_ASSIGNED');
    expect(complaintsPolicy).toContain('evaluateComplaintCasePolicy');
  });

  it('does not import an appeals module', () => {
    const source = readFileSync(join(__dirname, 'cert-complaints.module.ts'), 'utf8');
    expect(source).toContain('ComplaintCasePolicy');
    expect(source).not.toMatch(/from\s+['"][^'"]*appeal/u);
    expect(source).not.toContain('cert-appeals');
    expect(source).not.toContain('imports:');
    expect(CertComplaintsModule).toBeDefined();
  });

  it('freezes operation authority at none and limits intake roles to learners', () => {
    expect(ACKNOWLEDGE_AUTHORITY).toBe('NONE');
    expect(INVESTIGATE_AUTHORITY).toBe('NONE');
    expect(RECOMMEND_AUTHORITY).toBe('NONE');
    expect(FINAL_DECISION_AUTHORITY).toBe('NONE');
    expect(COMPLAINT_OPERATION_AUTHORITY).toEqual({
      ACKNOWLEDGE: 'NONE',
      INVESTIGATE: 'NONE',
      RECOMMEND: 'NONE',
      FINAL_DECISION: 'NONE',
    });
    expect([...AUTHENTICATED_INTAKE_ROLES]).toEqual([...LEARNER_ROLES]);
    expect(TECHNICAL_PROCESSING_PURPOSE).toBe(
      'IN_MEMORY_AUTHORIZATION_CLASSIFICATION_FOR_A_CERTIFICATION_RELATED_COMPLAINT_CASE',
    );
    expect(PRIVACY_BASIS_STATUS).toBe('TECHNICAL_PURPOSE_RECORDED_LEGAL_BASIS_NOT_CONFIRMED');
    for (const role of COMPLAINT_MUTATION_FORBIDDEN_ROLES) {
      expect(PRIVILEGED_ROLES).toContain(role);
    }
    expect(PRIVILEGED_ROLES).toContain('COMPLAINT_HANDLER');
    expect(COMPLAINT_MUTATION_FORBIDDEN_ROLES).not.toContain('COMPLAINT_HANDLER');
  });
});
