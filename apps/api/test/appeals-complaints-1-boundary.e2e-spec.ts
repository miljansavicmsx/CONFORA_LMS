/**
 * APPEALS-COMPLAINTS-1 — Boundary checks on top of B14/B15 foundations.
 * Ensures appeal ≠ complaint, contact remains separate, and no cert/exam mutation.
 */
jest.mock('jwks-rsa', () => ({
  __esModule: true,
  default: {
    passportJwtSecret: () => () => null,
  },
}));

import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { ZodValidationPipe } from 'nestjs-zod';

import { DEFAULT_TENANT_ID } from '@confora/shared-kernel';

import { AppModule } from '../src/app.module';
import { KeycloakTokenService } from '../src/auth/keycloak-token.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { APPEAL_SUBMITTED_AUDIT_ACTION } from '../src/cert-appeals/staff-appeals-audit.constants';
import { COMPLAINT_SUBMITTED_AUDIT_ACTION } from '../src/cert-complaints/staff-complaints-audit.constants';

const HS_SECRET = 'appeals-complaints-1-boundary-e2e-hs256-secret-min-32!';
const ISSUER = 'http://keycloak.test/realms/confora';
const LEARNER_ID = 'c5300000-0000-4000-8000-000000000001';
const OTHER_LEARNER_ID = 'c5300000-0000-4000-8000-000000000002';
const ORIGINAL_DECIDER_ID = 'b6300000-0000-4000-8000-000000000065';
const DECISION_REVIEW_ID = 'd9300001-0000-4000-8000-000000000001';
const APPLICATION_ID = 'a6300001-0000-4000-8000-000000000001';

function token(roles: string[], sub: string, email: string, tenantId = DEFAULT_TENANT_ID) {
  return jwt.sign(
    {
      sub,
      preferred_username: email,
      email,
      realm_access: { roles },
      amr: ['pwd', 'otp'],
      tenant_id: tenantId,
    },
    HS_SECRET,
    { algorithm: 'HS256', issuer: ISSUER, audience: 'confora-api' },
  );
}

describe('APPEALS-COMPLAINTS-1 boundary (e2e)', () => {
  let app: INestApplication;

  const appealCaseCreate = jest.fn();
  const appealCaseFindFirst = jest.fn();
  const appealCaseFindMany = jest.fn();
  const appealCaseCount = jest.fn();
  const complaintCaseCreate = jest.fn();
  const complaintCaseFindFirst = jest.fn();
  const complaintCaseFindMany = jest.fn();
  const complaintCaseCount = jest.fn();
  const certificateUpdate = jest.fn();
  const certificateCreate = jest.fn();
  const examResultUpdate = jest.fn();
  const certificationDecisionReviewUpdate = jest.fn();
  const certificationDecisionReviewFindFirst = jest.fn();
  const auditEventCreate = jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'audit-1', ...data }));
  const userFindUnique = jest.fn();
  const contactRequestCreate = jest.fn();
  const legacyAppealCreate = jest.fn();
  const legacyComplaintCreate = jest.fn();

  const appealCases: Record<string, unknown>[] = [];
  const complaintCases: Record<string, unknown>[] = [];

  beforeAll(async () => {
    process.env['DATABASE_URL'] = 'postgresql://mock:mock@127.0.0.1:5432/mock';
    process.env['AUTH_JWT_MODE'] = 'hs256';
    process.env['AUTH_JWT_HS256_SECRET'] = HS_SECRET;
    process.env['KEYCLOAK_ISSUER'] = ISSUER;
    process.env['KEYCLOAK_AUDIENCE'] = 'confora-api';
    process.env['TENANT_ENFORCEMENT'] = 'enforce';
    process.env['VERIFY_CAPTCHA_SKIP'] = 'true';
    process.env['AI_GATEWAY_STUB'] = '1';
    process.env['PUBLIC_COMPLAINT_INTAKE_ENABLED'] = 'true';

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(KeycloakTokenService)
      .useValue({
        passwordGrant: async () => {
          throw new Error('Keycloak mocked');
        },
      })
      .overrideProvider(PrismaService)
      .useValue({
        db: {
          user: { findUnique: userFindUnique },
          appealCase: {
            create: appealCaseCreate,
            findFirst: appealCaseFindFirst,
            findMany: appealCaseFindMany,
            count: appealCaseCount,
            update: jest.fn(),
          },
          complaintCase: {
            create: complaintCaseCreate,
            findFirst: complaintCaseFindFirst,
            findMany: complaintCaseFindMany,
            count: complaintCaseCount,
            update: jest.fn(),
          },
          certificationDecisionReview: {
            findFirst: certificationDecisionReviewFindFirst,
            update: certificationDecisionReviewUpdate,
          },
          recertificationDecisionReview: {
            findFirst: jest.fn().mockResolvedValue(null),
            update: jest.fn(),
          },
          certificateLifecycleEvent: {
            findFirst: jest.fn().mockResolvedValue(null),
            create: jest.fn(),
          },
          certificate: {
            findFirst: jest.fn().mockResolvedValue(null),
            create: certificateCreate,
            update: certificateUpdate,
          },
          examResult: { findFirst: jest.fn().mockResolvedValue(null), update: examResultUpdate },
          certificationApplication: { findFirst: jest.fn().mockResolvedValue(null) },
          eligibilityReview: { findFirst: jest.fn().mockResolvedValue(null) },
          recertificationCase: { findFirst: jest.fn().mockResolvedValue(null) },
          appeal: { create: legacyAppealCreate },
          complaint: { create: legacyComplaintCreate },
          contactRequest: { create: contactRequestCreate, findMany: jest.fn().mockResolvedValue([]) },
          auditEvent: { create: auditEventCreate, findFirst: jest.fn().mockResolvedValue(null) },
          $transaction: jest.fn(async (ops: unknown) => {
            if (typeof ops === 'function') {
              return ops({
                auditEvent: { create: auditEventCreate, findFirst: jest.fn().mockResolvedValue(null) },
                appealCase: { create: appealCaseCreate },
                complaintCase: { create: complaintCaseCreate },
              });
            }
            return ops;
          }),
        },
      })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ZodValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    appealCases.length = 0;
    complaintCases.length = 0;

    auditEventCreate.mockImplementation(({ data }: { data: Record<string, unknown> }) =>
      Promise.resolve({ id: 'audit-1', ...data }),
    );

    userFindUnique.mockImplementation(({ where }: { where: { id?: string; email?: string } }) => {
      const id = where.id ?? LEARNER_ID;
      return Promise.resolve({
        id,
        email: id === OTHER_LEARNER_ID ? 'other@confora.test' : 'learner@confora.test',
        tenantId: DEFAULT_TENANT_ID,
        firstName: 'Pilot',
        lastName: 'Learner',
        keycloakSub: id,
      });
    });

    certificationDecisionReviewFindFirst.mockResolvedValue({
      id: DECISION_REVIEW_ID,
      tenantId: DEFAULT_TENANT_ID,
      status: 'DECIDED',
      outcome: 'CERTIFICATION_DENIED',
      decidedBy: ORIGINAL_DECIDER_ID,
      application: { id: APPLICATION_ID, userId: LEARNER_ID },
      certificateId: null,
    });

    appealCaseFindFirst.mockImplementation(({ where }: { where: Record<string, unknown> }) => {
      const match = appealCases.find((row) => {
        if (where.id && row.id !== where.id) return false;
        if (where.appellantUserId && row.appellantUserId !== where.appellantUserId) return false;
        return true;
      });
      return Promise.resolve(match ?? null);
    });
    appealCaseFindMany.mockImplementation(({ where }: { where: Record<string, unknown> }) => {
      const filtered = appealCases.filter((row) => {
        if (where.appellantUserId && row.appellantUserId !== where.appellantUserId) return false;
        if (where.tenantId && row.tenantId !== where.tenantId) return false;
        return true;
      });
      return Promise.resolve(filtered);
    });
    appealCaseCount.mockImplementation(({ where }: { where: Record<string, unknown> }) => {
      const filtered = appealCases.filter((row) => {
        if (where.appellantUserId && row.appellantUserId !== where.appellantUserId) return false;
        return true;
      });
      return Promise.resolve(filtered.length);
    });
    appealCaseCreate.mockImplementation(({ data }: { data: Record<string, unknown> }) => {
      const created = {
        ...data,
        acknowledgedAt: null,
        voidedAt: null,
        closedAt: null,
        voidReason: null,
        acknowledgedBy: null,
        voidedBy: null,
        requestedRemedy: data.requestedRemedy ?? null,
        submittedEvidenceRefs: data.submittedEvidenceRefs ?? [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      appealCases.push(created);
      return Promise.resolve(created);
    });

    complaintCaseFindFirst.mockResolvedValue(null);
    complaintCaseFindMany.mockResolvedValue([]);
    complaintCaseCount.mockResolvedValue(0);
    complaintCaseCreate.mockImplementation(({ data }: { data: Record<string, unknown> }) => {
      const created = {
        ...data,
        publicReference: `CMP-${String(complaintCases.length + 1).padStart(4, '0')}`,
        acknowledgedAt: null,
        voidedAt: null,
        requestedAction: data.requestedAction ?? null,
        certificateNumber: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      complaintCases.push(created);
      return Promise.resolve(created);
    });
  });

  it('learner can submit complaint without creating an appeal', async () => {
    const learner = token(['USR_CAND'], LEARNER_ID, 'learner@confora.test');
    const res = await request(app.getHttpServer())
      .post('/v1/learner/complaints')
      .set('Authorization', `Bearer ${learner}`)
      .send({
        complaintType: 'PROCESS_COMPLAINT',
        complaintTargetType: 'CERTIFICATION_BODY',
        complaintSummary: 'Kašnjenje komunikacije\n\nOpis prigovora',
      })
      .expect(201);

    expect(res.body.complaint?.status ?? res.body.status).toBeTruthy();
    expect(complaintCaseCreate).toHaveBeenCalled();
    expect(appealCaseCreate).not.toHaveBeenCalled();
    expect(legacyAppealCreate).not.toHaveBeenCalled();
    expect(certificateUpdate).not.toHaveBeenCalled();
    expect(certificateCreate).not.toHaveBeenCalled();
    expect(examResultUpdate).not.toHaveBeenCalled();
    expect(certificationDecisionReviewUpdate).not.toHaveBeenCalled();
    expect(contactRequestCreate).not.toHaveBeenCalled();
    expect(auditEventCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: COMPLAINT_SUBMITTED_AUDIT_ACTION }),
      }),
    );
  });

  it('learner can submit appeal without creating a complaint', async () => {
    const learner = token(['USR_CAND'], LEARNER_ID, 'learner@confora.test');
    const res = await request(app.getHttpServer())
      .post('/v1/learner/appeals')
      .set('Authorization', `Bearer ${learner}`)
      .send({
        appealType: 'CERTIFICATION_DECISION_APPEAL',
        appealReason: 'Ne slažem se s odlukom\n\nObrazloženje',
        relatedCertificationDecisionReviewId: DECISION_REVIEW_ID,
      })
      .expect(201);

    expect(res.body.appeal.status).toBe('SUBMITTED');
    expect(appealCaseCreate).toHaveBeenCalled();
    expect(complaintCaseCreate).not.toHaveBeenCalled();
    expect(legacyComplaintCreate).not.toHaveBeenCalled();
    expect(certificateUpdate).not.toHaveBeenCalled();
    expect(examResultUpdate).not.toHaveBeenCalled();
    expect(certificationDecisionReviewUpdate).not.toHaveBeenCalled();
    expect(contactRequestCreate).not.toHaveBeenCalled();
    expect(auditEventCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: APPEAL_SUBMITTED_AUDIT_ACTION }),
      }),
    );
  });

  it('unauthenticated learner routes are rejected', async () => {
    await request(app.getHttpServer()).get('/v1/learner/appeals').expect(401);
    await request(app.getHttpServer()).get('/v1/learner/complaints').expect(401);
  });

  it('staff appeals list requires staff RBAC', async () => {
    const learner = token(['USR_CAND'], LEARNER_ID, 'learner@confora.test');
    const res = await request(app.getHttpServer())
      .get('/v1/staff/appeals')
      .set('Authorization', `Bearer ${learner}`);
    expect([401, 403]).toContain(res.status);
  });

  it('other learner cannot list first learner appeals', async () => {
    const owner = token(['USR_CAND'], LEARNER_ID, 'learner@confora.test');
    await request(app.getHttpServer())
      .post('/v1/learner/appeals')
      .set('Authorization', `Bearer ${owner}`)
      .send({
        appealType: 'CERTIFICATION_DECISION_APPEAL',
        appealReason: 'Owner appeal',
        relatedCertificationDecisionReviewId: DECISION_REVIEW_ID,
      })
      .expect(201);

    const other = token(['USR_CAND'], OTHER_LEARNER_ID, 'other@confora.test');
    const list = await request(app.getHttpServer())
      .get('/v1/learner/appeals')
      .set('Authorization', `Bearer ${other}`)
      .expect(200);

    const items = list.body.items ?? list.body.appeals ?? [];
    expect(items).toHaveLength(0);
  });
});
