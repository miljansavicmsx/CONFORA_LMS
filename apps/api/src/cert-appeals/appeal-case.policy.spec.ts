import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { PRIVILEGED_ROLES, rbacRoleSchema } from '@confora/shared-types';

import { CertAppealsModule } from './cert-appeals.module';
import {
  APPEAL_OPERATION_AUTHORITY,
  AppealCasePolicy,
  classifyAuthenticatedAppellant,
  evaluateAppealCasePolicy,
} from './appeal-case.policy';
import {
  APPEAL_ADMISSIBILITY_AUTHORITY,
  APPEAL_COMMITTEE_AUTHORITY,
  APPEAL_DATA_CLASSES,
  APPEAL_DATA_CLASS_COUNT,
  APPEAL_FILING_DEADLINE,
  APPEAL_IMPLEMENTATION_NONCLAIMS,
  APPEAL_INVESTIGATION_AUTHORITY,
  APPEAL_MUTATION_FORBIDDEN_ROLES,
  APPEAL_NOTIFICATION_POLICY,
  APPEAL_OPERATIONS,
  APPEAL_OUTCOME_AUTHORITY,
  APPEAL_POLICY_DENIAL_CODES,
  APPEAL_RECOMMENDATION_AUTHORITY,
  APPEAL_RECORD_RETENTION_ACTION,
  APPEAL_RECORD_RETENTION_PERIOD,
  APPEAL_RECORD_RETENTION_POLICY,
  APPEAL_RECORD_RETENTION_YEARS,
  APPEAL_RESOLUTION_TARGET,
  APPEAL_RETENTION_SCOPE,
  APPELLANT_AUTHORITY,
  AUTHENTICATED_APPELLANT_ROLES,
  COMMITTEE_CONSTITUTION_PROOF_STATUS,
  COMMITTEE_QUORUM_POLICY,
  CONFLICT_OF_INTEREST_DECLARATION_WORKFLOW,
  DPO_OR_CONTROLLER_VALIDATION_BEFORE_DATA_BEARING_USE,
  LEGACY_APPEALS_COMMITTEE_LABEL,
  OUTCOME_RATIONALE_REQUIREMENT,
  PRIVACY_BASIS_STATUS,
  TECHNICAL_PROCESSING_PURPOSE,
  UNAUTHENTICATED_PUBLIC_APPEAL_INTAKE,
  type AppealOperation,
  type AppealPolicyResult,
} from './appeal-case.types';

const TENANT = 'tenant-a';
const OTHER_TENANT = 'tenant-b';
const CASE_ID = 'case-1';
const ACTOR_ID = 'actor-server-1';
const APPELLANT_ID = 'appellant-server-1';
const DECISION_MAKER_ID = 'decision-maker-server-1';
const DECISION_REFERENCE = 'decision-ref-1';
const COMMITTEE_REFERENCE = 'committee-ref-1';

const FIXTURE_NARRATIVE = 'FIXTURE_NOT_A_CREDENTIAL_APPEAL_NARRATIVE';
const FIXTURE_DECISION_CONTENT = 'FIXTURE_NOT_A_CREDENTIAL_DECISION_CONTENT';
const FIXTURE_PASSWORD = 'FIXTURE_REJECTION_PASSWORD_WORD';
const FIXTURE_TOKEN = 'FIXTURE_REJECTION_TOKEN_WORD';
const FIXTURE_PRIVATE_KEY = 'FIXTURE_REJECTION_PRIVATE_KEY_WORD';

const PRODUCTION_FILES = [
  'appeal-case.types.ts',
  'appeal-case.policy.ts',
  'cert-appeals.module.ts',
] as const;

const UNSUPPORTED_OPERATIONS = [
  'ADMISSIBILITY',
  'INVESTIGATE',
  'RECOMMEND',
  'APPROVE',
  'REJECT',
  'SUBMIT',
  'WITHDRAW',
  'ASSIGN_COMMITTEE',
  'CONSTITUTE_COMMITTEE',
  'NOTIFY',
  'ESCALATE',
  'CLOSE',
  'acknowledge',
  'FINAL_DECISION',
] as const;

const NON_APPEAL_DOMAINS = [
  'COMPLAINT',
  'COMPLAINT_PROCESS',
  'COMPLAINT_CERTIFIED_PERSON',
  'ANONYMOUS_REPORT',
  'WHISTLEBLOWING',
  'appeal',
] as const;

const INELIGIBLE_APPELLANT_ROLES = ['STAFF_DIR', 'COMPLAINT_HANDLER', 'SME', 'EXAMINER'] as const;

const FORGED_AUTHORITY_FIELDS = [
  'quorum',
  'quorumCount',
  'coiDeclaration',
  'conflictOfInterest',
  'rationale',
  'outcomeRationale',
  'notification',
  'noticeEvent',
  'filingDeadline',
  'resolutionTarget',
  'clientTenantId',
  'clientUserId',
  'clientRoles',
  'narrative',
  'appealContent',
  'password',
  'token',
  'privateKey',
  'allowed',
  'effect',
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
  'cert-complaints',
  'allowed: true',
  'accepted: true',
  'authorized: true',
  'mutated: true',
  'recorded: true',
  "effect: 'APPLIED'",
  ': any',
  'as any',
  'console.',
  'a277a19',
  '@Cron',
  'setInterval',
  'setTimeout',
  'frontend-app',
] as const;

type DenyOnlyAllowed = AppealPolicyResult['allowed'] extends false ? true : false;
type DenyOnlyEffect = AppealPolicyResult['effect'] extends 'POLICY_DENY_ONLY' ? true : false;

const DENY_ONLY_ALLOWED: DenyOnlyAllowed = true;
const DENY_ONLY_EFFECT: DenyOnlyEffect = true;

function actor(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    userId: ACTOR_ID,
    tenantId: TENANT,
    roles: ['USR_CAND'],
    mfaVerified: false,
    ...overrides,
  };
}

function appellant(
  role: (typeof AUTHENTICATED_APPELLANT_ROLES)[number] = 'USR_CAND',
  userId: string = APPELLANT_ID,
): Record<string, unknown> {
  return { kind: 'AUTHENTICATED', role, userId };
}

function appealInput(
  operation: AppealOperation,
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    domain: 'APPEAL',
    operation,
    actor: actor(),
    appealTenantId: TENANT,
    internalCaseId: CASE_ID,
    certificationDecisionReference: DECISION_REFERENCE,
    originalDecisionMakerUserId: DECISION_MAKER_ID,
    appellant: appellant(),
    ...overrides,
  };
}

function expectDeny(result: AppealPolicyResult, code: AppealPolicyResult['code']): void {
  expect(result).toEqual({
    allowed: false,
    effect: 'POLICY_DENY_ONLY',
    code,
  });
  expect(result.allowed).toBe(false);
  expect(result.effect).toBe('POLICY_DENY_ONLY');
  expect(Object.isFrozen(result)).toBe(true);
  expect(Object.keys(result).sort()).toEqual(['allowed', 'code', 'effect']);
  expect(result).not.toHaveProperty('accepted');
  expect(result).not.toHaveProperty('authorized');
  expect(result).not.toHaveProperty('mutated');
  expect(result).not.toHaveProperty('recorded');
}

function productionSource(): string {
  return PRODUCTION_FILES.map((file) => readFileSync(join(__dirname, file), 'utf8')).join('\n');
}

describe('PKG-05 appeal case policy', () => {
  const policy = new AppealCasePolicy();

  it('pins the technical purpose and unconfirmed legal basis', () => {
    expect(TECHNICAL_PROCESSING_PURPOSE).toBe(
      'IN_MEMORY_AUTHORIZATION_CLASSIFICATION_FOR_A_CERTIFICATION_RELATED_APPEAL_CASE',
    );
    expect(PRIVACY_BASIS_STATUS).toBe('TECHNICAL_PURPOSE_RECORDED_LEGAL_BASIS_NOT_CONFIRMED');
    expect(DPO_OR_CONTROLLER_VALIDATION_BEFORE_DATA_BEARING_USE).toBe('REQUIRED');
    expect(APPEAL_IMPLEMENTATION_NONCLAIMS.legalBasisConfirmed).toBe(false);
  });

  it('keeps the selected option-set authority pins at none or not defined', () => {
    expect(APPELLANT_AUTHORITY).toBe('NONE');
    expect(APPEAL_ADMISSIBILITY_AUTHORITY).toBe('NONE');
    expect(APPEAL_INVESTIGATION_AUTHORITY).toBe('NONE');
    expect(APPEAL_RECOMMENDATION_AUTHORITY).toBe('NONE');
    expect(APPEAL_OUTCOME_AUTHORITY).toBe('NONE');
    expect(APPEAL_COMMITTEE_AUTHORITY).toBe('NONE');
    expect(COMMITTEE_CONSTITUTION_PROOF_STATUS).toBe('NOT_DEFINED');
    expect(COMMITTEE_QUORUM_POLICY).toBe('NOT_DEFINED');
    expect(CONFLICT_OF_INTEREST_DECLARATION_WORKFLOW).toBe('NOT_DEFINED');
    expect(OUTCOME_RATIONALE_REQUIREMENT).toBe('NOT_DEFINED');
    expect(APPEAL_NOTIFICATION_POLICY).toBe('NOT_DEFINED');
    expect(APPEAL_FILING_DEADLINE).toBe('NOT_DEFINED');
    expect(APPEAL_RESOLUTION_TARGET).toBe('NOT_DEFINED');
    expect(UNAUTHENTICATED_PUBLIC_APPEAL_INTAKE).toBe('NOT_AVAILABLE');
    expect(APPEAL_OPERATION_AUTHORITY).toEqual({
      ACKNOWLEDGE: 'NONE',
      VOID: 'NONE',
      START: 'NONE',
      RECORD_OUTCOME: 'NONE',
    });
  });

  it('exposes exactly the four normalized appeal operations', () => {
    expect([...APPEAL_OPERATIONS]).toEqual(['ACKNOWLEDGE', 'VOID', 'START', 'RECORD_OUTCOME']);
    for (const operation of UNSUPPORTED_OPERATIONS) {
      expect(APPEAL_OPERATIONS).not.toContain(operation);
    }
  });

  it.each(APPEAL_OPERATIONS)(
    'denies %s with authority not assigned for a valid same-tenant appeal',
    (operation) => {
      expectDeny(
        policy.evaluate(appealInput(operation, { committeeId: COMMITTEE_REFERENCE })),
        'APPEAL_OPERATION_AUTHORITY_NOT_ASSIGNED',
      );
    },
  );

  it('cannot represent an allow or applied effect', () => {
    expect(DENY_ONLY_ALLOWED).toBe(true);
    expect(DENY_ONLY_EFFECT).toBe(true);
    const result = policy.evaluate(appealInput('RECORD_OUTCOME'));
    expectDeny(result, 'APPEAL_OPERATION_AUTHORITY_NOT_ASSIGNED');
    expect(JSON.stringify(result)).not.toContain('APPLIED');
    expect(JSON.stringify(APPEAL_POLICY_DENIAL_CODES)).not.toContain('APPLIED');
  });

  it('fails closed when actor context is missing', () => {
    const withoutActor = appealInput('ACKNOWLEDGE');
    delete withoutActor['actor'];
    expectDeny(policy.evaluate(withoutActor), 'ACTOR_CONTEXT_REQUIRED');
    expectDeny(
      policy.evaluate(appealInput('ACKNOWLEDGE', { actor: null })),
      'ACTOR_CONTEXT_REQUIRED',
    );
    expectDeny(
      policy.evaluate(appealInput('START', { actor: 'client-supplied' })),
      'ACTOR_CONTEXT_REQUIRED',
    );
  });

  it('fails closed when the actor user identifier is missing', () => {
    const withoutUser = actor();
    delete withoutUser['userId'];
    expectDeny(
      policy.evaluate(appealInput('VOID', { actor: withoutUser })),
      'ACTOR_USER_IDENTIFIER_REQUIRED',
    );
    expectDeny(
      policy.evaluate(appealInput('VOID', { actor: actor({ userId: '   ' }) })),
      'ACTOR_USER_IDENTIFIER_REQUIRED',
    );
  });

  it('fails closed when the actor tenant is missing', () => {
    const withoutTenant = actor();
    delete withoutTenant['tenantId'];
    expectDeny(
      policy.evaluate(appealInput('ACKNOWLEDGE', { actor: withoutTenant })),
      'ACTOR_TENANT_REQUIRED',
    );
    expectDeny(
      policy.evaluate(appealInput('ACKNOWLEDGE', { actor: actor({ tenantId: '' }) })),
      'ACTOR_TENANT_REQUIRED',
    );
  });

  it('fails closed when the appeal tenant is missing', () => {
    const withoutAppealTenant = appealInput('START');
    delete withoutAppealTenant['appealTenantId'];
    expectDeny(policy.evaluate(withoutAppealTenant), 'APPEAL_TENANT_REQUIRED');
    expectDeny(
      policy.evaluate(appealInput('START', { appealTenantId: '   ' })),
      'APPEAL_TENANT_REQUIRED',
    );
  });

  it('denies a cross-tenant appeal before authority evaluation', () => {
    expectDeny(
      policy.evaluate(
        appealInput('RECORD_OUTCOME', {
          actor: actor({
            userId: DECISION_MAKER_ID,
            roles: ['STAFF_DIR'],
            mfaVerified: false,
            tenantId: TENANT,
          }),
          appealTenantId: OTHER_TENANT,
          originalDecisionMakerUserId: DECISION_MAKER_ID,
        }),
      ),
      'CROSS_TENANT_APPEAL_FORBIDDEN',
    );
  });

  it.each(NON_APPEAL_DOMAINS)('rejects non-appeal domain %s', (domain) => {
    expectDeny(
      policy.evaluate({ ...appealInput('ACKNOWLEDGE'), domain }),
      'CERTIFICATION_APPEAL_DOMAIN_REQUIRED',
    );
  });

  it('rejects a missing domain as a certification-appeal domain failure', () => {
    const input = appealInput('ACKNOWLEDGE');
    delete input['domain'];
    expectDeny(policy.evaluate(input), 'CERTIFICATION_APPEAL_DOMAIN_REQUIRED');
  });

  it.each(UNSUPPORTED_OPERATIONS)('rejects unsupported operation %s', (operation) => {
    expectDeny(
      policy.evaluate({ ...appealInput('ACKNOWLEDGE'), operation }),
      'APPEAL_OPERATION_UNSUPPORTED',
    );
  });

  it.each(AUTHENTICATED_APPELLANT_ROLES)(
    'classifies %s with the server-derived identifier and no authority',
    (role) => {
      const serverDerivedUserId = `server-derived-${role}`;
      const classification = classifyAuthenticatedAppellant(role, serverDerivedUserId);
      expect(classification).toEqual({
        kind: 'AUTHENTICATED_APPELLANT',
        role,
        userId: serverDerivedUserId,
        authority: 'NONE',
      });
      expectDeny(
        policy.evaluate(
          appealInput('ACKNOWLEDGE', {
            actor: actor({ roles: [role] }),
            appellant: appellant(role, serverDerivedUserId),
          }),
        ),
        'APPEAL_OPERATION_AUTHORITY_NOT_ASSIGNED',
      );
    },
  );

  it('fails closed when the authenticated appellant is missing', () => {
    const input = appealInput('VOID');
    delete input['appellant'];
    expectDeny(policy.evaluate(input), 'AUTHENTICATED_APPELLANT_REQUIRED');
    expectDeny(
      policy.evaluate(appealInput('VOID', { appellant: null })),
      'AUTHENTICATED_APPELLANT_REQUIRED',
    );
  });

  it('fails closed for an unauthenticated appellant', () => {
    expect(UNAUTHENTICATED_PUBLIC_APPEAL_INTAKE).toBe('NOT_AVAILABLE');
    expectDeny(
      policy.evaluate(
        appealInput('START', {
          appellant: { kind: 'UNAUTHENTICATED', role: 'USR_CAND', userId: APPELLANT_ID },
        }),
      ),
      'AUTHENTICATED_APPELLANT_REQUIRED',
    );
    expectDeny(
      policy.evaluate(
        appealInput('START', {
          appellant: { kind: 'ANONYMOUS' },
        }),
      ),
      'AUTHENTICATED_APPELLANT_REQUIRED',
    );
  });

  it.each(INELIGIBLE_APPELLANT_ROLES)('rejects appellant role %s', (role) => {
    expectDeny(
      policy.evaluate(
        appealInput('ACKNOWLEDGE', {
          appellant: { kind: 'AUTHENTICATED', role, userId: APPELLANT_ID },
        }),
      ),
      'APPELLANT_ROLE_NOT_ELIGIBLE',
    );
  });

  it('does not let a client-forged appellant identifier create authority', () => {
    const forged = classifyAuthenticatedAppellant('USR_CAND', 'client-forged-appellant');
    expect(forged).toMatchObject({ authority: 'NONE', userId: 'client-forged-appellant' });
    expectDeny(
      policy.evaluate(
        appealInput('RECORD_OUTCOME', {
          appellant: appellant('USR_CERT', 'client-forged-appellant'),
          clientAppellantUserId: 'client-forged-appellant',
        }),
      ),
      'INVALID_APPEAL_POLICY_INPUT',
    );
    expectDeny(
      policy.evaluate(
        appealInput('RECORD_OUTCOME', {
          actor: actor({ userId: ACTOR_ID }),
          appellant: appellant('USR_CAND', 'client-forged-appellant'),
        }),
      ),
      'APPEAL_OPERATION_AUTHORITY_NOT_ASSIGNED',
    );
  });

  it('does not let a claimed decision link create authority', () => {
    expectDeny(
      policy.evaluate(
        appealInput('RECORD_OUTCOME', {
          certificationDecisionReference: DECISION_REFERENCE,
          committeeId: COMMITTEE_REFERENCE,
        }),
      ),
      'APPEAL_OPERATION_AUTHORITY_NOT_ASSIGNED',
    );
  });

  it.each(APPEAL_MUTATION_FORBIDDEN_ROLES)('denies appeal mutation by %s', (role) => {
    expect(PRIVILEGED_ROLES).toContain(role);
    expectDeny(
      policy.evaluate(
        appealInput('ACKNOWLEDGE', {
          actor: actor({ roles: [role], mfaVerified: true }),
        }),
      ),
      'APPEAL_MUTATION_ROLE_FORBIDDEN',
    );
  });

  it('does not treat COM_APP as a constituted committee', () => {
    expect(rbacRoleSchema.options).toContain('COM_APP');
    expectDeny(
      policy.evaluate(
        appealInput('RECORD_OUTCOME', {
          actor: actor({ roles: ['COM_APP'], mfaVerified: true }),
          committeeId: COMMITTEE_REFERENCE,
        }),
      ),
      'APPEAL_COMMITTEE_AUTHORITY_NOT_DEFINED',
    );
  });

  it('rejects the legacy appeals_committee label as authority', () => {
    expect(rbacRoleSchema.safeParse(LEGACY_APPEALS_COMMITTEE_LABEL).success).toBe(false);
    expect(rbacRoleSchema.options).not.toContain(LEGACY_APPEALS_COMMITTEE_LABEL);
    expectDeny(
      policy.evaluate(
        appealInput('START', {
          actor: actor({ roles: [LEGACY_APPEALS_COMMITTEE_LABEL], mfaVerified: true }),
        }),
      ),
      'APPEAL_COMMITTEE_AUTHORITY_NOT_DEFINED',
    );
  });

  it('does not authorize from a committee identifier alone', () => {
    expect(COMMITTEE_CONSTITUTION_PROOF_STATUS).toBe('NOT_DEFINED');
    expectDeny(
      policy.evaluate(appealInput('RECORD_OUTCOME', { committeeId: COMMITTEE_REFERENCE })),
      'APPEAL_OPERATION_AUTHORITY_NOT_ASSIGNED',
    );
  });

  it('does not treat a role label as a committee identifier', () => {
    expectDeny(
      policy.evaluate(appealInput('VOID', { committeeId: 'COM_APP' })),
      'APPEAL_COMMITTEE_AUTHORITY_NOT_DEFINED',
    );
    expectDeny(
      policy.evaluate(appealInput('VOID', { committeeId: LEGACY_APPEALS_COMMITTEE_LABEL })),
      'APPEAL_COMMITTEE_AUTHORITY_NOT_DEFINED',
    );
  });

  it.each(APPEAL_OPERATIONS)(
    'denies the original certification decision-maker for %s before no-authority',
    (operation) => {
      const result = policy.evaluate(
        appealInput(operation, {
          actor: actor({ userId: DECISION_MAKER_ID, roles: ['USR_CERT'] }),
          originalDecisionMakerUserId: DECISION_MAKER_ID,
          committeeId: COMMITTEE_REFERENCE,
        }),
      );
      expectDeny(result, 'ORIGINAL_CERTIFICATION_DECISION_MAKER_FORBIDDEN');
      expect(result.code).not.toBe('APPEAL_OPERATION_AUTHORITY_NOT_ASSIGNED');
    },
  );

  it('checks the original decision-maker conflict before the terminal denial', () => {
    const source = readFileSync(join(__dirname, 'appeal-case.policy.ts'), 'utf8');
    const conflictAt = source.indexOf("deny('ORIGINAL_CERTIFICATION_DECISION_MAKER_FORBIDDEN')");
    const terminalAt = source.indexOf("deny('APPEAL_OPERATION_AUTHORITY_NOT_ASSIGNED')");
    expect(conflictAt).toBeGreaterThan(-1);
    expect(terminalAt).toBeGreaterThan(conflictAt);
  });

  it('fails closed when a privileged actor has no MFA', () => {
    expectDeny(
      policy.evaluate(
        appealInput('ACKNOWLEDGE', {
          actor: actor({ roles: ['STAFF_DIR'], mfaVerified: false }),
        }),
      ),
      'MFA_REQUIRED',
    );
    expectDeny(
      policy.evaluate(
        appealInput('START', {
          actor: actor({ roles: ['COMPLAINT_HANDLER'], mfaVerified: false }),
        }),
      ),
      'MFA_REQUIRED',
    );
    expectDeny(
      policy.evaluate(
        appealInput('VOID', {
          actor: actor({ roles: ['COM_APP'], mfaVerified: false }),
        }),
      ),
      'MFA_REQUIRED',
    );
  });

  it('denies an unrelated privileged staff role without granting authority', () => {
    expectDeny(
      policy.evaluate(
        appealInput('ACKNOWLEDGE', {
          actor: actor({ roles: ['STAFF_TRAINADM'], mfaVerified: true }),
        }),
      ),
      'APPEAL_OPERATION_AUTHORITY_NOT_ASSIGNED',
    );
  });

  it.each(FORGED_AUTHORITY_FIELDS)(
    'rejects forged field %s without creating authority',
    (field) => {
      const result = policy.evaluate({
        ...appealInput('RECORD_OUTCOME'),
        [field]: field === 'effect' ? 'APPLIED' : true,
      });
      expectDeny(result, 'INVALID_APPEAL_POLICY_INPUT');
      const encoded = JSON.stringify(result);
      expect(encoded).not.toContain('APPLIED');
      expect(encoded).not.toContain(FIXTURE_NARRATIVE);
      expect(result.allowed).toBe(false);
    },
  );

  it('returns an identical result for an identical input', () => {
    const input = appealInput('ACKNOWLEDGE', { committeeId: COMMITTEE_REFERENCE });
    const before = JSON.stringify(input);
    const first = policy.evaluate(input);
    const second = policy.evaluate(input);
    expect(second).toEqual(first);
    expect(evaluateAppealCasePolicy(input)).toEqual(first);
    expect(JSON.stringify(input)).toBe(before);
    expect(Object.keys(policy)).toEqual([]);
  });

  it('does not require raw appeal narrative on the policy input', () => {
    const input = appealInput('ACKNOWLEDGE');
    expect(input).not.toHaveProperty('narrative');
    expect(input).not.toHaveProperty('appealContent');
    expectDeny(policy.evaluate(input), 'APPEAL_OPERATION_AUTHORITY_NOT_ASSIGNED');
  });

  it('does not reflect raw appeal narrative on the result', () => {
    const result = policy.evaluate({
      ...appealInput('ACKNOWLEDGE'),
      narrative: FIXTURE_NARRATIVE,
      appealContent: FIXTURE_NARRATIVE,
    });
    expectDeny(result, 'INVALID_APPEAL_POLICY_INPUT');
    expect(JSON.stringify(result)).not.toContain(FIXTURE_NARRATIVE);
  });

  it('does not reflect certification-decision content on the result', () => {
    const result = policy.evaluate({
      ...appealInput('RECORD_OUTCOME'),
      certificationDecisionReference: { body: FIXTURE_DECISION_CONTENT },
    });
    expectDeny(result, 'INVALID_APPEAL_POLICY_INPUT');
    expect(JSON.stringify(result)).not.toContain(FIXTURE_DECISION_CONTENT);
  });

  it('omits secret, token and credential fields from the result', () => {
    const result = policy.evaluate({
      ...appealInput('START'),
      password: FIXTURE_PASSWORD,
      token: FIXTURE_TOKEN,
      privateKey: FIXTURE_PRIVATE_KEY,
    });
    const encoded = JSON.stringify(result);
    expectDeny(result, 'INVALID_APPEAL_POLICY_INPUT');
    expect(encoded).not.toContain(FIXTURE_PASSWORD);
    expect(encoded).not.toContain(FIXTURE_TOKEN);
    expect(encoded).not.toContain(FIXTURE_PRIVATE_KEY);
  });

  it.each([...APPEAL_DATA_CLASSES])('includes appeal data class %s', (dataClass) => {
    expect(APPEAL_DATA_CLASSES).toContain(dataClass);
  });

  it('keeps the appeal data-class catalogue at exactly six entries', () => {
    expect([...APPEAL_DATA_CLASSES]).toEqual([
      'AUTHENTICATED_USER_IDENTIFIER',
      'TENANT_IDENTIFIER',
      'APPEAL_CONTENT',
      'CERTIFICATION_DECISION_REFERENCE',
      'COMMITTEE_IDENTIFIER',
      'INTERNAL_CASE_IDENTIFIER',
    ]);
    expect(APPEAL_DATA_CLASS_COUNT).toBe(6);
    expect(APPEAL_DATA_CLASSES).toHaveLength(6);
    expect(Object.isFrozen(APPEAL_DATA_CLASSES)).toBe(true);
    expect(new Set(APPEAL_DATA_CLASSES).size).toBe(6);
    expect(APPEAL_DATA_CLASSES).not.toContain('EVIDENCE_ATTACHMENT_METADATA');
    expect(APPEAL_DATA_CLASSES).not.toContain('PUBLIC_REFERENCE');
    expect(APPEAL_DATA_CLASSES).not.toContain('COMPLAINT_CONTENT');
    expect(APPEAL_DATA_CLASSES).not.toContain('RATIONALE');
  });

  it('records P10Y as future appeal-record policy only', () => {
    expect(APPEAL_RECORD_RETENTION_PERIOD).toBe('P10Y');
    expect(APPEAL_RECORD_RETENTION_YEARS).toBe(10);
    expect(APPEAL_RECORD_RETENTION_ACTION).toBe('RETAIN');
    expect(APPEAL_RETENTION_SCOPE).toBe('FUTURE_APPEAL_RECORDS_ONLY');
    expect(APPEAL_RECORD_RETENTION_POLICY).toEqual({
      period: 'P10Y',
      years: 10,
      action: 'RETAIN',
      scope: 'FUTURE_APPEAL_RECORDS_ONLY',
      complaintRecordsIncluded: false,
      appealRecordsIncluded: true,
    });
    expect(Object.isFrozen(APPEAL_RECORD_RETENTION_POLICY)).toBe(true);
    const complaintRetention = readFileSync(
      join(__dirname, '../cert-complaints/complaint-case.types.ts'),
      'utf8',
    );
    expect(complaintRetention).toContain("appliesTo: 'COMPLAINT_RECORDS'");
    expect(complaintRetention).toContain('appealRecordsIncluded: false');
    expect(complaintRetention).not.toContain('FUTURE_APPEAL_RECORDS_ONLY');
  });

  it.each(Object.keys(APPEAL_IMPLEMENTATION_NONCLAIMS))('keeps nonclaim %s false', (claim) => {
    expect(
      APPEAL_IMPLEMENTATION_NONCLAIMS[claim as keyof typeof APPEAL_IMPLEMENTATION_NONCLAIMS],
    ).toBe(false);
  });

  it('has no network, persistence, audit, identity-provider, route, or role-mutation path', () => {
    const source = productionSource();
    for (const snippet of FORBIDDEN_SOURCE_SNIPPETS) {
      expect(source).not.toContain(snippet);
    }
    expect(source).not.toContain('role-administration');
    expect(source).not.toContain('GRANT');
    expect(source).not.toContain('REVOKE');
    expect(source).not.toMatch(/from\s+['"][^'"]*cert-complaints/u);
  });

  it('registers appeals beside complaints without merging the modules', () => {
    const appModule = readFileSync(join(__dirname, '../app.module.ts'), 'utf8');
    const appealsModule = readFileSync(join(__dirname, 'cert-appeals.module.ts'), 'utf8');
    const complaintsModule = readFileSync(
      join(__dirname, '../cert-complaints/cert-complaints.module.ts'),
      'utf8',
    );
    expect(appModule).toContain(
      "import { CertAppealsModule } from './cert-appeals/cert-appeals.module';",
    );
    expect(appModule).toContain(
      "import { CertComplaintsModule } from './cert-complaints/cert-complaints.module';",
    );
    expect(appModule.match(/CertAppealsModule/g)).toEqual([
      'CertAppealsModule',
      'CertAppealsModule',
    ]);
    expect(appModule.match(/CertComplaintsModule/g)).toEqual([
      'CertComplaintsModule',
      'CertComplaintsModule',
    ]);
    expect(appModule).toContain('controllers: [AppController]');
    expect(appealsModule).toContain('AppealCasePolicy');
    expect(appealsModule).not.toContain('imports:');
    expect(appealsModule).not.toContain('cert-complaints');
    expect(complaintsModule).not.toContain('cert-appeals');
    expect(CertAppealsModule).toBeDefined();
  });

  it('does not derive appeal authority from commit a277a19', () => {
    const source = productionSource();
    expect(source).not.toContain('a277a19');
    expect(source).not.toContain('frontend-app');
    expect(source).not.toContain('content-editor');
    expect(rbacRoleSchema.options).not.toContain('appeals_committee');
  });
});
