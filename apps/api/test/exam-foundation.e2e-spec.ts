import { type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { Server } from 'node:http';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { execSync } from 'node:child_process';
import { PrismaClient } from '@confora/database';
import { ZodValidationPipe } from 'nestjs-zod';

import { AppModule } from '../src/app.module';
import { liveBallotCounts, voteResult } from '../src/certification-flow/certification-flow-rules';
import { openDelivery } from '../src/certification-flow/referee-delivery';
import { startSyntheticJwksFixture } from './helpers/synthetic-jwks.fixture';

const IMAGE =
  'pgvector/pgvector:pg16@sha256:a36250871de0833b8757561c72f2477ef1ddd1101afa4e617fb552e0de514c6b';
const CONTAINER = `confora-exam-e2e-${randomUUID().slice(0, 8)}`;
const STEM = 'POVJERLJIVI_TEKST_STAVKE';

function repoRoot(): string {
  return process.cwd().replace(/[\\/]apps[\\/]api$/, '');
}

function httpServer(app: INestApplication): Server {
  return app.getHttpServer() as Server;
}

function dockerHostPort(container: string): string {
  const raw = execSync(`docker port ${container} 5432`, { encoding: 'utf8' }).trim();
  const match = raw.match(/:(\d+)\s*$/);
  if (!match?.[1]) {
    throw new Error(`Unable to parse docker port mapping: ${raw}`);
  }
  return match[1];
}

describe('certification exam foundation e2e', () => {
  let fixture: Awaited<ReturnType<typeof startSyntheticJwksFixture>> | undefined;
  let app: INestApplication | undefined;
  let prisma: PrismaClient | undefined;
  let stopDatabase: () => void = () => undefined;

  const tenantId = randomUUID();
  const authorId = randomUUID();
  const approverId = randomUUID();
  const candidateId = randomUUID();
  const otherCandidateId = randomUUID();
  const invigilatorId = randomUUID();
  const trainerId = randomUUID();
  const deciderId = randomUUID();
  const issuerId = randomUUID();
  const bystanderId = randomUUID();
  const qualityId = randomUUID();
  const sysadminId = randomUUID();
  const schemeId = randomUUID();
  const versionId = randomUUID();
  const applicationId = randomUUID();
  const otherApplicationId = randomUUID();
  const draftApplicationId = randomUUID();

  const authorSubject = 'exam-author';
  const approverSubject = 'exam-approver';
  const candidateSubject = 'exam-candidate';
  const otherSubject = 'exam-other';
  const trainerSubject = 'exam-trainer';
  const deciderSubject = 'exam-decider';
  const issuerSubject = 'exam-issuer';
  const bystanderSubject = 'exam-bystander';
  const qualitySubject = 'exam-quality';
  const sysadminSubject = 'exam-sysadmin';

  let itemA = '';
  let itemB = '';
  let formId = '';
  let passSessionId = '';
  let failSessionId = '';
  let passResultId = '';

  function requirePrisma(): PrismaClient {
    if (!prisma) {
      throw new Error('Database client is not ready.');
    }
    return prisma;
  }

  function token(subject: string, roles: string[]): string {
    if (!fixture) {
      throw new Error('JWKS fixture is not ready.');
    }
    return fixture.signAccessToken({
      sub: subject,
      tenant_id: tenantId,
      realm_access: { roles },
      mfa_verified: true,
    });
  }

  function auth(subject: string, roles: string[]) {
    return { Authorization: `Bearer ${token(subject, roles)}` };
  }

  beforeAll(async () => {
    fixture = await startSyntheticJwksFixture();
    const external = process.env['EXAM_E2E_DATABASE_URL'];
    let databaseUrl = external;
    if (!databaseUrl) {
      execSync(
        `docker run -d --rm --name ${CONTAINER} -e POSTGRES_USER=confora -e POSTGRES_PASSWORD=confora_dev -e POSTGRES_DB=confora -p 127.0.0.1::5432 ${IMAGE}`,
        { stdio: 'pipe' },
      );
      const hostPort = dockerHostPort(CONTAINER);
      databaseUrl = `postgresql://confora:confora_dev@127.0.0.1:${hostPort}/confora`;
      stopDatabase = () => {
        try {
          execSync(`docker rm -f ${CONTAINER}`, { stdio: 'pipe' });
        } catch {
          /* container already gone */
        }
      };
      for (let attempt = 0; attempt < 40; attempt += 1) {
        try {
          execSync(`docker exec ${CONTAINER} pg_isready -U confora -d confora`, { stdio: 'pipe' });
          break;
        } catch {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    }
    process.env['DATABASE_URL'] = databaseUrl;
    process.env['OIDC_ISSUER_URL'] = fixture.issuer;
    process.env['OIDC_CLIENT_ID'] = fixture.audience;
    execSync('corepack pnpm@9.14.2 --filter @confora/database run db:migrate:deploy', {
      cwd: repoRoot(),
      env: { ...process.env, DATABASE_URL: databaseUrl },
      stdio: 'pipe',
    });
    prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
    await prisma.$connect();
    await prisma.tenant.create({ data: { id: tenantId, isActive: true } });
    const people = [
      [authorId, 'author@exam.test', authorSubject],
      [approverId, 'approver@exam.test', approverSubject],
      [candidateId, 'candidate@exam.test', candidateSubject],
      [otherCandidateId, 'other@exam.test', otherSubject],
      [invigilatorId, 'invigilator@exam.test', 'exam-invigilator'],
      [trainerId, 'trainer@exam.test', trainerSubject],
      [deciderId, 'decider@exam.test', deciderSubject],
      [issuerId, 'issuer@exam.test', issuerSubject],
      [bystanderId, 'bystander@exam.test', bystanderSubject],
      [qualityId, 'quality@exam.test', qualitySubject],
      [sysadminId, 'sysadmin@exam.test', sysadminSubject],
    ] as const;
    for (const [id, email] of people) {
      await prisma.user.create({ data: { id, tenantId, email, isActive: true } });
    }
    for (const [id, , subject] of people) {
      await prisma.externalIdentityLink.create({
        data: { id: randomUUID(), tenantId, userId: id, issuer: fixture.issuer, subject },
      });
    }
    await prisma.certificationScheme.create({
      data: { id: schemeId, tenantId, code: 'DIGCOMP-CERT', title: 'Digitalna kompetencija' },
    });
    await prisma.certificationSchemeVersion.create({
      data: {
        id: versionId,
        tenantId,
        schemeId,
        versionLabel: '1',
        scopeDescription: 'Opseg',
        jobDescription: 'Posao',
        experienceRequirement: 'Nije uslov',
        prerequisites: 'Odobrena prijava',
        abilitiesSummary: 'Sposobnosti',
        publicProcessSummary: 'Javni proces',
      },
    });
    for (const [userId, status, id] of [
      [candidateId, 'APPROVED', applicationId],
      [otherCandidateId, 'APPROVED', otherApplicationId],
      [candidateId, 'DRAFT', draftApplicationId],
    ] as const) {
      await prisma.certificationApplication.create({
        data: { id, tenantId, applicantUserId: userId, status, schemeRef: 'DIGCOMP-CERT' },
      });
    }
    const courseId = randomUUID();
    const enrolmentId = randomUUID();
    await prisma.course.create({
      data: {
        id: courseId,
        tenantId,
        code: `EXAM-${courseId.slice(0, 8)}`,
        title: 'Obuka',
        description: 'Obuka nije uslov za ispit.',
        areaCode: 'DIGCOMP',
        language: 'bs',
        priceAmount: '0.00',
        priceCurrency: 'BAM',
        authorUserId: trainerId,
      },
    });
    await prisma.enrolment.create({
      data: { id: enrolmentId, tenantId, userId: candidateId, courseId, enrolledAt: new Date() },
    });
    await prisma.enrolmentTrainer.create({
      data: {
        id: randomUUID(),
        tenantId,
        enrolmentId,
        trainerUserId: trainerId,
        assignedAt: new Date(),
      },
    });

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('v1');
    app.useGlobalPipes(new ZodValidationPipe());
    await app.init();
    await app.listen(0, '127.0.0.1');
  }, 180_000);

  afterAll(async () => {
    await app?.close();
    await prisma?.$disconnect();
    await fixture?.stop();
    stopDatabase();
  });

  async function choiceItem(domainCode: string): Promise<string> {
    const created = await request(httpServer(app))
      .post('/v1/staff/exams/items')
      .set(auth(authorSubject, ['COM_TECH']))
      .send({
        schemeId,
        stem: `${STEM} ${domainCode}`,
        itemType: 'SINGLE_CHOICE',
        domainCode,
        competenceIds: [],
        choices: [
          { choiceKey: 'A', text: 'Tačno', isCorrect: true },
          { choiceKey: 'B', text: 'Netačno', isCorrect: false },
        ],
      })
      .expect(201);
    const itemId = (created.body as { itemId: string }).itemId;
    await request(httpServer(app))
      .post(`/v1/staff/exams/items/${itemId}/transitions`)
      .set(auth(authorSubject, ['COM_TECH']))
      .send({ toStatus: 'REVIEW' })
      .expect(201);
    await request(httpServer(app))
      .post(`/v1/staff/exams/items/${itemId}/transitions`)
      .set(auth(authorSubject, ['COM_TECH']))
      .send({ toStatus: 'APPROVED' })
      .expect(403);
    await request(httpServer(app))
      .post(`/v1/staff/exams/items/${itemId}/transitions`)
      .set(auth(approverSubject, ['COM_TECH']))
      .send({ toStatus: 'APPROVED' })
      .expect(201);
    return itemId;
  }

  it('separates roles and keeps answer keys off the candidate session', async () => {
    await request(httpServer(app))
      .get('/v1/staff/exams/items')
      .set(auth(candidateSubject, ['USR_CAND']))
      .expect(403);
    await request(httpServer(app))
      .get('/v1/staff/exams/items')
      .set(auth(sysadminSubject, ['STAFF_SYSADM']))
      .expect(403);

    itemA = await choiceItem('A');
    itemB = await choiceItem('B');
    const bank = await request(httpServer(app))
      .get('/v1/staff/exams/items')
      .query({ schemeId })
      .set(auth(approverSubject, ['COM_TECH']))
      .expect(200);
    expect(JSON.stringify(bank.body)).toContain('isCorrect');

    const blueprint = await request(httpServer(app))
      .post('/v1/staff/exams/blueprints')
      .set(auth(authorSubject, ['COM_TECH']))
      .send({
        schemeVersionId: versionId,
        title: 'Obrazac',
        durationSeconds: 3600,
        retakeWindowDays: 90,
      })
      .expect(201);
    const blueprintId = (blueprint.body as { blueprintId: string }).blueprintId;
    await request(httpServer(app))
      .post(`/v1/staff/exams/blueprints/${blueprintId}/domains`)
      .set(auth(authorSubject, ['COM_TECH']))
      .send({
        domains: [
          { domainCode: 'A', title: 'Domena A', weightBasisPoints: 5000, itemCount: 1 },
          { domainCode: 'B', title: 'Domena B', weightBasisPoints: 5000, itemCount: 1 },
        ],
      })
      .expect(201);
    const setting = await request(httpServer(app))
      .post(`/v1/staff/exams/blueprints/${blueprintId}/standard-setting`)
      .set(auth(authorSubject, ['COM_TECH']))
      .send({ note: 'Angoff panel' })
      .expect(201);
    const recordId = (setting.body as { recordId: string }).recordId;
    for (const [subject, itemRatings] of [
      [
        authorSubject,
        [
          { itemId: itemA, probabilityBasisPoints: 7000 },
          { itemId: itemB, probabilityBasisPoints: 5000 },
        ],
      ],
      [
        approverSubject,
        [
          { itemId: itemA, probabilityBasisPoints: 7000 },
          { itemId: itemB, probabilityBasisPoints: 5000 },
        ],
      ],
    ] as const) {
      await request(httpServer(app))
        .post(`/v1/staff/exams/standard-settings/${recordId}/ratings`)
        .set(auth(subject, ['COM_TECH']))
        .send({ ratings: itemRatings })
        .expect(201);
    }
    const cut = await request(httpServer(app))
      .post(`/v1/staff/exams/standard-settings/${recordId}/approve`)
      .set(auth(approverSubject, ['COM_TECH']))
      .expect(201);
    expect((cut.body as { cutScoreBasisPoints: number }).cutScoreBasisPoints).toBe(6000);
    await request(httpServer(app))
      .post(`/v1/staff/exams/blueprints/${blueprintId}/approve`)
      .set(auth(approverSubject, ['COM_TECH']))
      .expect(201);
    const assembled = await request(httpServer(app))
      .post(`/v1/staff/exams/blueprints/${blueprintId}/assemble`)
      .set(auth(approverSubject, ['COM_TECH']))
      .expect(201);
    formId = (assembled.body as { formId: string; itemCount: number }).formId;
    expect((assembled.body as { itemCount: number }).itemCount).toBe(2);

    await request(httpServer(app))
      .post('/v1/staff/exams/sessions')
      .set(auth(approverSubject, ['COM_TECH']))
      .send({
        formId,
        candidateUserId: candidateId,
        certificationApplicationId: draftApplicationId,
        invigilatorUserId: invigilatorId,
        scheduledStartAt: new Date().toISOString(),
      })
      .expect(400);

    const scheduled = await request(httpServer(app))
      .post('/v1/staff/exams/sessions')
      .set(auth(approverSubject, ['COM_TECH']))
      .send({
        formId,
        candidateUserId: candidateId,
        certificationApplicationId: applicationId,
        invigilatorUserId: invigilatorId,
        scheduledStartAt: new Date().toISOString(),
      })
      .expect(201);
    passSessionId = (scheduled.body as { sessionId: string; accreditationReady: boolean })
      .sessionId;
    expect((scheduled.body as { accreditationReady: boolean }).accreditationReady).toBe(false);

    await request(httpServer(app))
      .post(`/v1/me/exams/sessions/${passSessionId}/start`)
      .set(auth(candidateSubject, ['USR_CAND']))
      .send({ rulesAccepted: true, ndaAccepted: true })
      .expect(400);
    await request(httpServer(app))
      .post(`/v1/staff/exams/sessions/${passSessionId}/identity-check`)
      .set(auth(approverSubject, ['COM_TECH']))
      .send({ documentType: 'PASSPORT' })
      .expect(403);
    await request(httpServer(app))
      .post(`/v1/staff/exams/sessions/${passSessionId}/identity-check`)
      .set(auth(sysadminSubject, ['STAFF_SYSADM']))
      .send({ documentType: 'PASSPORT' })
      .expect(403);
    const ready = await request(httpServer(app))
      .post(`/v1/staff/exams/sessions/${passSessionId}/identity-check`)
      .set(auth('exam-invigilator', ['INVIGILATOR']))
      .send({ documentType: 'PASSPORT' })
      .expect(201);
    const readyBody = ready.body as { accreditationReady: boolean; status: string; method: string };
    expect(readyBody.accreditationReady).toBe(true);
    expect(readyBody.status).toBe('READY');
    expect(readyBody.method).toBe('HUMAN_VISUAL');
    expect(JSON.stringify(readyBody)).not.toMatch(/idImage|candidateImage|jmbg/i);

    const listed = await request(httpServer(app))
      .get('/v1/me/exams/sessions')
      .set(auth(candidateSubject, ['USR_CAND']))
      .expect(200);
    expect(JSON.stringify(listed.body)).not.toContain(STEM);
    expect(JSON.stringify(listed.body)).not.toContain('isCorrect');

    const beforeStart = await request(httpServer(app))
      .get(`/v1/me/exams/sessions/${passSessionId}`)
      .set(auth(candidateSubject, ['USR_CAND']))
      .expect(200);
    expect((beforeStart.body as { items: unknown[] }).items).toEqual([]);

    await request(httpServer(app))
      .post(`/v1/me/exams/sessions/${passSessionId}/start`)
      .set(auth(candidateSubject, ['USR_CAND']))
      .send({ rulesAccepted: true, ndaAccepted: true })
      .expect(201);
    const playing = await request(httpServer(app))
      .get(`/v1/me/exams/sessions/${passSessionId}`)
      .set(auth(candidateSubject, ['USR_CAND']))
      .expect(200);
    expect(JSON.stringify(playing.body)).not.toContain('isCorrect');
    expect(JSON.stringify(playing.body)).toContain(STEM);
    await request(httpServer(app))
      .put(`/v1/me/exams/sessions/${passSessionId}/answers`)
      .set(auth(candidateSubject, ['USR_CAND']))
      .send({
        answers: [
          { itemId: itemA, selectedKeys: ['A'] },
          { itemId: itemB, selectedKeys: ['A'] },
        ],
      })
      .expect(200);
    const passed = await request(httpServer(app))
      .post(`/v1/me/exams/sessions/${passSessionId}/submit`)
      .set(auth(candidateSubject, ['USR_CAND']))
      .expect(201);
    const passBody = passed.body as {
      passed: boolean;
      scoreBasisPoints: number;
      provisional: boolean;
      domains: unknown[];
      certificateIssued: boolean;
      resultId?: string;
    };
    expect(passBody.passed).toBe(true);
    expect(passBody.scoreBasisPoints).toBe(10000);
    expect(passBody.provisional).toBe(true);
    expect(passBody.domains).toEqual([]);
    expect(passBody.certificateIssued).toBe(false);
    expect(passBody.resultId).toBeUndefined();
    expect(JSON.stringify(passBody)).not.toContain('isCorrect');

    const hidden = await request(httpServer(app))
      .get(`/v1/me/exams/sessions/${passSessionId}`)
      .set(auth(candidateSubject, ['USR_CAND']))
      .expect(200);
    expect(JSON.stringify(hidden.body)).not.toContain(STEM);

    const afterPass = await request(httpServer(app))
      .post('/v1/staff/exams/sessions')
      .set(auth(approverSubject, ['COM_TECH']))
      .send({
        formId,
        candidateUserId: candidateId,
        certificationApplicationId: applicationId,
        invigilatorUserId: invigilatorId,
        scheduledStartAt: new Date().toISOString(),
      })
      .expect(201);
    expect((afterPass.body as { accreditationReady: boolean }).accreditationReady).toBe(false);

    const second = await request(httpServer(app))
      .post('/v1/staff/exams/sessions')
      .set(auth(approverSubject, ['COM_TECH']))
      .send({
        formId,
        candidateUserId: otherCandidateId,
        certificationApplicationId: otherApplicationId,
        invigilatorUserId: invigilatorId,
        scheduledStartAt: new Date().toISOString(),
      })
      .expect(201);
    failSessionId = (second.body as { sessionId: string }).sessionId;
    await request(httpServer(app))
      .post(`/v1/staff/exams/sessions/${failSessionId}/identity-check`)
      .set(auth('exam-invigilator', ['INVIGILATOR']))
      .send({ documentType: 'ID_CARD' })
      .expect(201);
    await request(httpServer(app))
      .post(`/v1/me/exams/sessions/${failSessionId}/start`)
      .set(auth(otherSubject, ['USR_CAND']))
      .send({ rulesAccepted: true, ndaAccepted: true })
      .expect(201);
    await request(httpServer(app))
      .put(`/v1/me/exams/sessions/${failSessionId}/answers`)
      .set(auth(otherSubject, ['USR_CAND']))
      .send({
        answers: [
          { itemId: itemA, selectedKeys: ['B'] },
          { itemId: itemB, selectedKeys: ['A'] },
        ],
      })
      .expect(200);
    const failed = await request(httpServer(app))
      .post(`/v1/me/exams/sessions/${failSessionId}/submit`)
      .set(auth(otherSubject, ['USR_CAND']))
      .expect(201);
    const failBody = failed.body as {
      passed: boolean;
      scoreBasisPoints: number;
      domains: { domainCode: string; correct: number; total: number }[];
    };
    expect(failBody.passed).toBe(false);
    expect(failBody.scoreBasisPoints).toBe(5000);
    expect(failBody.domains).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ domainCode: 'A', correct: 0, total: 1 }),
        expect.objectContaining({ domainCode: 'B', correct: 1, total: 1 }),
      ]),
    );
    await request(httpServer(app))
      .post('/v1/staff/exams/sessions')
      .set(auth(approverSubject, ['COM_TECH']))
      .send({
        formId,
        candidateUserId: otherCandidateId,
        certificationApplicationId: otherApplicationId,
        invigilatorUserId: invigilatorId,
        scheduledStartAt: new Date().toISOString(),
      })
      .expect(400);

    const stats = await request(httpServer(app))
      .get(`/v1/staff/exams/forms/${formId}/psychometrics`)
      .set(auth(approverSubject, ['COM_TECH']))
      .expect(200);
    const body = stats.body as {
      kr20: string | null;
      flagReason: string | null;
      items: {
        itemId: string;
        pValue: string;
        pointBiserial: string | null;
        flagReason: string | null;
      }[];
    };
    expect(Number(body.kr20)).toBeCloseTo(1, 4);
    expect(body.flagReason).toBeNull();
    const first = body.items.find((item) => item.itemId === itemA);
    const secondItem = body.items.find((item) => item.itemId === itemB);
    expect(Number(first?.pValue)).toBeCloseTo(0.5, 5);
    expect(Number(first?.pointBiserial)).toBeCloseTo(0.7071067811865476, 4);
    expect(first?.flagReason).toBeNull();
    expect(Number(secondItem?.pValue)).toBeCloseTo(1, 5);
    expect(secondItem?.pointBiserial).toBeNull();
    expect(secondItem?.flagReason).toBe('P_VALUE');

    const flagged = await request(httpServer(app))
      .post(`/v1/staff/exams/sessions/${passSessionId}/proctor-flags`)
      .set(auth(approverSubject, ['COM_TECH']))
      .send({ source: 'HUMAN', signalCode: 'LOOK_AWAY' })
      .expect(201);
    expect((flagged.body as { changesScore: boolean }).changesScore).toBe(false);
    const reviewed = await request(httpServer(app))
      .post(`/v1/staff/exams/proctor-flags/${(flagged.body as { flagId: string }).flagId}/reviews`)
      .set(auth(approverSubject, ['COM_TECH']))
      .send({ disposition: 'CONFIRMED_FOR_REVIEW', note: 'Ljudski pregled' })
      .expect(201);
    expect((reviewed.body as { passedAfter: boolean | null }).passedAfter).toBe(true);

    const earlierFail = await request(httpServer(app))
      .post('/v1/staff/exams/sessions')
      .set(auth(approverSubject, ['COM_TECH']))
      .send({
        formId,
        candidateUserId: candidateId,
        certificationApplicationId: applicationId,
        invigilatorUserId: authorId,
        scheduledStartAt: new Date().toISOString(),
      })
      .expect(201);
    const earlierFailSessionId = (earlierFail.body as { sessionId: string }).sessionId;
    await request(httpServer(app))
      .post(`/v1/staff/exams/sessions/${earlierFailSessionId}/identity-check`)
      .set(auth(authorSubject, ['INVIGILATOR']))
      .send({ documentType: 'ID_CARD' })
      .expect(201);
    await request(httpServer(app))
      .post(`/v1/me/exams/sessions/${earlierFailSessionId}/start`)
      .set(auth(candidateSubject, ['USR_CAND']))
      .send({ rulesAccepted: true, ndaAccepted: true })
      .expect(201);
    await request(httpServer(app))
      .put(`/v1/me/exams/sessions/${earlierFailSessionId}/answers`)
      .set(auth(candidateSubject, ['USR_CAND']))
      .send({
        answers: [
          { itemId: itemA, selectedKeys: ['B'] },
          { itemId: itemB, selectedKeys: ['A'] },
        ],
      })
      .expect(200);
    const earlierFailed = await request(httpServer(app))
      .post(`/v1/me/exams/sessions/${earlierFailSessionId}/submit`)
      .set(auth(candidateSubject, ['USR_CAND']))
      .expect(201);
    expect((earlierFailed.body as { passed: boolean }).passed).toBe(false);
    await requirePrisma().certificationExamSession.update({
      where: { tenantId_id: { tenantId, id: earlierFailSessionId } },
      data: {
        scheduledStartAt: new Date('2026-01-01T00:00:00.000Z'),
        submittedAt: new Date('2026-01-01T01:00:00.000Z'),
      },
    });

    const queue = await request(httpServer(app))
      .get('/v1/committee/exams/queue')
      .set(auth(deciderSubject, ['COM_CERT']))
      .expect(200);
    passResultId =
      (queue.body as { sessionId: string; resultId: string }[]).find(
        (row) => row.sessionId === passSessionId,
      )?.resultId ?? '';
    expect(passResultId).not.toBe('');
    await request(httpServer(app))
      .post('/v1/committee/exams/decisions')
      .set(auth(trainerSubject, ['COM_CERT']))
      .send({ resultId: passResultId, outcome: 'GRANT', rationale: 'Trener ne odlučuje.' })
      .expect(403);
    await request(httpServer(app))
      .post('/v1/committee/exams/decisions')
      .set(auth('exam-invigilator', ['COM_CERT']))
      .send({ resultId: passResultId, outcome: 'GRANT', rationale: 'Ispitivač ne odlučuje.' })
      .expect(403);
    await request(httpServer(app))
      .post('/v1/committee/exams/decisions')
      .set(auth(authorSubject, ['COM_CERT']))
      .send({
        resultId: passResultId,
        outcome: 'GRANT',
        rationale: 'Ispitivač ranijeg neuspjelog pokušaja ne odlučuje.',
      })
      .expect(403);
    await request(httpServer(app))
      .post('/v1/committee/exams/decisions')
      .set(auth(approverSubject, ['COM_CERT']))
      .send({
        resultId: passResultId,
        outcome: 'GRANT',
        rationale: 'Pregledač proktorskog signala ne odlučuje.',
      })
      .expect(403);
    const decision = await request(httpServer(app))
      .post('/v1/committee/exams/decisions')
      .set(auth(deciderSubject, ['COM_CERT']))
      .send({ resultId: passResultId, outcome: 'GRANT', rationale: 'Nezavisna odluka odbora.' })
      .expect(201);
    expect(
      (decision.body as { certificateIssued: boolean; independentOfTraining: boolean })
        .certificateIssued,
    ).toBe(false);
    expect((decision.body as { independentOfTraining: boolean }).independentOfTraining).toBe(true);
    expect(await requirePrisma().credential.count({ where: { tenantId } })).toBe(0);
    const decisionId = (decision.body as { decisionId: string }).decisionId;
    await request(httpServer(app))
      .post('/v1/committee/certificates')
      .set(auth(sysadminSubject, ['STAFF_SYSADM']))
      .send({ decisionId, holderDisplayName: 'Demo Kandidat', registryConsent: true })
      .expect(403);
    await request(httpServer(app))
      .post('/v1/committee/certificates')
      .set(auth(trainerSubject, ['COM_CERT']))
      .send({ decisionId, holderDisplayName: 'Demo Kandidat', registryConsent: true })
      .expect(403);
    await request(httpServer(app))
      .post('/v1/committee/certificates')
      .set(auth(deciderSubject, ['COM_CERT']))
      .send({ decisionId, holderDisplayName: 'Krivo Ime', registryConsent: true })
      .expect(403);
    const blocked = await request(httpServer(app))
      .post('/v1/committee/certificates')
      .set(auth(issuerSubject, ['COM_CERT']))
      .send({ decisionId, holderDisplayName: 'Krivo Ime', registryConsent: true })
      .expect(400);
    expect((blocked.body as { message: string }).message).toBe('CASE_NOT_ISSUABLE');
    expect(await requirePrisma().credential.count({ where: { tenantId } })).toBe(0);
    expect(await requirePrisma().attendanceCredentialLink.count({ where: { tenantId } })).toBe(0);
    const result = await requirePrisma().certificationExamResult.findFirst({
      where: { tenantId, id: passResultId },
    });
    expect(result?.provisional).toBe(false);

    await requirePrisma().certificationSchemeVersion.update({
      where: { tenantId_id: { tenantId, id: versionId } },
      data: { lifecycle: 'PUBLISHED' },
    });
    await request(httpServer(app))
      .post(`/v1/staff/schemes/${versionId}/levels`)
      .set(auth(approverSubject, ['COM_TECH']))
      .send({
        code: 'PRACTITIONER',
        title: 'Practitioner',
        rank: 1,
        minExperienceMonths: 0,
        requiresExamPass: true,
      })
      .expect(201);
    await request(httpServer(app))
      .post(`/v1/staff/schemes/${versionId}/case-rules`)
      .set(auth(approverSubject, ['COM_TECH']))
      .send({
        votingQuorum: 1,
        experienceMayFollowExam: true,
        experienceMode: 'INDEPENDENT_REFERENCES',
        referenceCount: 2,
      })
      .expect(201);
    for (const userId of [
      trainerId,
      invigilatorId,
      authorId,
      approverId,
      deciderId,
      issuerId,
      qualityId,
    ]) {
      await request(httpServer(app))
        .post(`/v1/staff/schemes/${versionId}/decision-makers`)
        .set(auth(approverSubject, ['COM_TECH']))
        .send({
          userId,
          competenceNote: 'Imenovan za šemu.',
          authorisedFrom: '2020-01-01T00:00:00.000Z',
          authorisedUntil: '2030-01-01T00:00:00.000Z',
        })
        .expect(201);
    }
    const direct = await request(httpServer(app))
      .post('/v1/me/certification-cases')
      .set(auth(otherSubject, ['USR_CAND']))
      .send({
        schemeVersionId: versionId,
        path: 'DIRECT',
        prerequisitesAcknowledged: true,
        certificationApplicationId: otherApplicationId,
        experienceMonths: 0,
      })
      .expect(201);
    expect((direct.body as { trainingGates: boolean; path: string }).trainingGates).toBe(false);
    expect((direct.body as { path: string }).path).toBe('DIRECT');
    const educated = await request(httpServer(app))
      .post('/v1/me/certification-cases')
      .set(auth(candidateSubject, ['USR_CAND']))
      .send({
        schemeVersionId: versionId,
        path: 'CONFORA_EDUCATION',
        prerequisitesAcknowledged: true,
        certificationApplicationId: applicationId,
        experienceMonths: 0,
      })
      .expect(201);
    expect((educated.body as { trainingGates: boolean }).trainingGates).toBe(false);
    const caseId = (educated.body as { caseId: string }).caseId;
    await request(httpServer(app))
      .post(`/v1/me/certification-cases/${caseId}/link-exam`)
      .set(auth(candidateSubject, ['USR_CAND']))
      .send({ resultId: passResultId })
      .expect(201);
    await request(httpServer(app))
      .post(`/v1/me/certification-cases/${caseId}/dossier`)
      .set(auth(candidateSubject, ['USR_CAND']))
      .send({ experienceMonths: 0 })
      .expect(201);
    const unassignedAction = {
      vote: { ballot: 'GRANT', reasoning: 'Nisam imenovan na predmet.' },
      propose: { reason: 'Pokušaj izmjene sastava.' },
      assist: { purpose: 'summary' },
      confirm: { memberUserId: deciderId },
      assess: {
        refereeId: '44444444-4444-4444-8444-444444444444',
        relevanceNote: 'Nisam imenovan.',
        credible: true,
      },
      issue: {
        holderDisplayName: 'Demo Kandidat',
        registryConsent: false,
        note: 'Nisam imenovan na predmet.',
      },
    };
    await request(httpServer(app))
      .get(`/v1/committee/cases/${caseId}`)
      .set(auth(bystanderSubject, ['COM_CERT']))
      .expect(403);
    await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/conflict-declaration`)
      .set(auth(bystanderSubject, ['COM_CERT']))
      .send({ hasConflict: false, statement: 'Nisam imenovan na predmet.' })
      .expect(403);
    await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/votes`)
      .set(auth(bystanderSubject, ['COM_CERT']))
      .send(unassignedAction.vote)
      .expect(403);
    await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/propose`)
      .set(auth(bystanderSubject, ['COM_CERT']))
      .send(unassignedAction.propose)
      .expect(403);
    await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/assist`)
      .set(auth(bystanderSubject, ['COM_CERT']))
      .send(unassignedAction.assist)
      .expect(403);
    await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/confirm`)
      .set(auth(bystanderSubject, ['COM_CERT']))
      .send(unassignedAction.confirm)
      .expect(403);
    await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/evidence-assessment`)
      .set(auth(bystanderSubject, ['COM_CERT']))
      .send(unassignedAction.assess)
      .expect(403);
    await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/issue-authorization`)
      .set(auth(bystanderSubject, ['COM_CERT']))
      .send(unassignedAction.issue)
      .expect(403);
    await request(httpServer(app))
      .get(`/v1/committee/cases/${caseId}`)
      .set(auth(candidateSubject, ['USR_CAND']))
      .expect(403);
    await request(httpServer(app))
      .get(`/v1/committee/cases/${caseId}`)
      .set(auth(sysadminSubject, ['STAFF_SYSADM']))
      .expect(403);
    await request(httpServer(app))
      .get(`/v1/committee/cases/${caseId}`)
      .set(auth(trainerSubject, ['COM_CERT']))
      .expect(403);
    await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/conflict-declaration`)
      .set(auth(trainerSubject, ['COM_CERT']))
      .send({ hasConflict: true, statement: 'Obučavao sam kandidata.' })
      .expect(403);
    await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/votes`)
      .set(auth(trainerSubject, ['COM_CERT']))
      .send(unassignedAction.vote)
      .expect(403);
    if (!fixture) {
      throw new Error('JWKS fixture is not ready.');
    }
    const outsiderTenantId = randomUUID();
    const outsiderId = randomUUID();
    await requirePrisma().tenant.create({ data: { id: outsiderTenantId, isActive: true } });
    await requirePrisma().user.create({
      data: {
        id: outsiderId,
        tenantId: outsiderTenantId,
        email: 'outsider@exam.test',
        isActive: true,
      },
    });
    await requirePrisma().externalIdentityLink.create({
      data: {
        id: randomUUID(),
        tenantId: outsiderTenantId,
        userId: outsiderId,
        issuer: fixture.issuer,
        subject: 'exam-outsider',
      },
    });
    const outsider = (roles: string[]) => ({
      Authorization: `Bearer ${fixture.signAccessToken({
        sub: 'exam-outsider',
        tenant_id: outsiderTenantId,
        realm_access: { roles },
        mfa_verified: true,
      })}`,
    });
    const isolatedBefore = await requirePrisma().professionalCase.findFirst({
      where: { tenantId, id: caseId },
      select: { phase: true, caseVersion: true },
    });
    const isolatedAudits = await requirePrisma().auditEvent.count({ where: { tenantId } });
    const isolatedDecisions = await requirePrisma().examCertificationDecision.count({
      where: { tenantId, resultId: passResultId },
    });
    const foreignPass = await requirePrisma().examPassAttestation.findFirst({
      where: { tenantId, resultId: passResultId },
      select: { id: true },
    });
    if (!foreignPass) {
      throw new Error('Exam pass was not stored.');
    }
    const foreignCases = [
      request(httpServer(app))
        .get(`/v1/committee/cases/${caseId}`)
        .set(outsider(['COM_CERT'])),
      request(httpServer(app))
        .post(`/v1/committee/cases/${caseId}/propose`)
        .set(outsider(['COM_CERT']))
        .send({ reason: 'Drugi zakup ne predlaže sastav.' }),
      request(httpServer(app))
        .post(`/v1/committee/cases/${caseId}/propose`)
        .set(outsider(['COM_CERT']))
        .send({
          reviewAction: 'OPEN',
          statement: 'Drugi zakup ne otvara pregled predmeta.',
        }),
      request(httpServer(app))
        .post(`/v1/committee/cases/${caseId}/propose`)
        .set(outsider(['COM_CERT']))
        .send({
          reviewAction: 'DECIDE',
          reviewId: randomUUID(),
          outcome: 'SUSTAIN',
          rationale: 'Drugi zakup ne odlučuje pregled predmeta.',
        }),
      request(httpServer(app))
        .post(`/v1/committee/cases/${caseId}/confirm`)
        .set(outsider(['COM_CERT']))
        .send({ memberUserId: deciderId }),
      request(httpServer(app))
        .post(`/v1/committee/cases/${caseId}/votes`)
        .set(outsider(['COM_CERT']))
        .send({ ballot: 'DENY', reasoning: 'Drugi zakup ne glasa.' }),
      request(httpServer(app))
        .post(`/v1/committee/cases/${caseId}/evidence-assessment`)
        .set(outsider(['COM_CERT']))
        .send(unassignedAction.assess),
      request(httpServer(app))
        .post(`/v1/committee/cases/${caseId}/conflict-declaration`)
        .set(outsider(['COM_CERT']))
        .send({ hasConflict: true, statement: 'Drugi zakup ne prijavljuje sukob.' }),
      request(httpServer(app))
        .post(`/v1/committee/cases/${caseId}/issue-authorization`)
        .set(outsider(['COM_CERT']))
        .send({
          holderDisplayName: 'Demo Kandidat',
          registryConsent: false,
          note: 'Drugi zakup ne izdaje.',
        }),
      request(httpServer(app))
        .post(`/v1/committee/cases/${caseId}/assist`)
        .set(outsider(['COM_CERT']))
        .send({ purpose: 'summary' }),
      request(httpServer(app))
        .post(`/v1/committee/exam-passes/${foreignPass.id}/release`)
        .set(outsider(['COM_CERT'])),
      request(httpServer(app))
        .post(`/v1/staff/schemes/${versionId}/decision-makers`)
        .set(outsider(['COM_TECH']))
        .send({
          userId: deciderId,
          kind: 'COMMITTEE_CHAIR',
          competenceNote: 'Ovlaštenje tuđeg zakupa.',
          documentRef: 'Dokument tuđeg zakupa ne prolazi.',
          authorisedFrom: '2020-01-01T00:00:00.000Z',
          authorisedUntil: '2030-01-01T00:00:00.000Z',
        }),
      request(httpServer(app))
        .post('/v1/committee/certificates')
        .set(outsider(['COM_CERT']))
        .send({ decisionId, holderDisplayName: 'Demo Kandidat', registryConsent: false }),
      request(httpServer(app))
        .get(`/v1/me/certification-cases/${caseId}`)
        .set(outsider(['USR_CAND'])),
      request(httpServer(app))
        .post(`/v1/me/certification-cases/${caseId}/dossier`)
        .set(outsider(['USR_CAND']))
        .send({ experienceMonths: 12 }),
      request(httpServer(app))
        .post(`/v1/me/certification-cases/${caseId}/evidence`)
        .set(outsider(['USR_CAND']))
        .send({ kind: 'EXPERIENCE', title: 'Dokaz tuđeg zakupa' }),
      request(httpServer(app))
        .post(`/v1/me/certification-cases/${caseId}/referees`)
        .set(outsider(['USR_CAND']))
        .send({
          refereeName: 'Tudji Referent',
          organization: 'Tudji zakup',
          email: 'foreign-referee@exam.test',
          requestedFacts: 'Drugi zakup ne traži referencu.',
        }),
      request(httpServer(app))
        .post(`/v1/me/certification-cases/${caseId}/link-exam`)
        .set(outsider(['USR_CAND']))
        .send({ resultId: passResultId }),
    ];
    for (const foreignCall of foreignCases) {
      expect((await foreignCall).status).toBe(404);
    }
    const foreignList = await request(httpServer(app))
      .get('/v1/committee/cases')
      .set(outsider(['COM_CERT']))
      .expect(200);
    expect(JSON.stringify(foreignList.body)).not.toContain(caseId);
    expect(
      await requirePrisma().professionalCase.findFirst({
        where: { tenantId, id: caseId },
        select: { phase: true, caseVersion: true },
      }),
    ).toEqual(isolatedBefore);
    expect(await requirePrisma().committeeAssessment.count({ where: { tenantId, caseId } })).toBe(
      0,
    );
    expect(await requirePrisma().auditEvent.count({ where: { tenantId } })).toBe(isolatedAudits);
    expect(
      await requirePrisma().examCertificationDecision.count({
        where: { tenantId, resultId: passResultId },
      }),
    ).toBe(isolatedDecisions);
    expect(
      await requirePrisma().schemeCommitteeAuthority.count({
        where: { tenantId, userId: outsiderId },
      }),
    ).toBe(0);
    expect(await requirePrisma().credential.count({ where: { tenantId } })).toBe(0);
    await request(httpServer(app))
      .get(`/v1/committee/cases/${caseId}`)
      .set(auth(deciderSubject, ['COM_CERT']))
      .expect(403);
    await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/conflict-declaration`)
      .set(auth(candidateSubject, ['USR_CAND']))
      .send({ hasConflict: false, statement: 'Nema sukoba.' })
      .expect(403);
    await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/votes`)
      .set(auth(deciderSubject, ['COM_CERT']))
      .send({ ballot: 'GRANT', reasoning: 'Bez izjave nema glasa.' })
      .expect(403);
    await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/conflict-declaration`)
      .set(auth(deciderSubject, ['COM_CERT']))
      .send({ hasConflict: false, statement: 'Nemam sukob interesa.' })
      .expect(201);
    const visible = await request(httpServer(app))
      .get(`/v1/committee/cases/${caseId}`)
      .set(auth(deciderSubject, ['COM_CERT']))
      .expect(200);
    expect((visible.body as { caseId: string }).caseId).toBe(caseId);
    const unassignedList = await request(httpServer(app))
      .get('/v1/committee/cases')
      .set(auth(bystanderSubject, ['COM_CERT']))
      .expect(200);
    expect(JSON.stringify(unassignedList.body)).not.toContain(caseId);
    expect(JSON.stringify(unassignedList.body)).not.toContain('path');
    const assignedEarly = await request(httpServer(app))
      .get('/v1/committee/cases')
      .set(auth(deciderSubject, ['COM_CERT']))
      .expect(200);
    expect(assignedEarly.body).toEqual([
      expect.objectContaining({ caseId, phase: 'COMMITTEE', assigned: true }),
    ]);
    expect(JSON.stringify(assignedEarly.body)).not.toContain('path');
    await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/conflict-declaration`)
      .set(auth(deciderSubject, ['COM_CERT']))
      .send({
        hasConflict: false,
        statement: 'Član bez ovlaštenja ne može skinuti sukob.',
        subjectUserId: trainerId,
      })
      .expect(403);
    const info = jest.spyOn(console, 'info').mockImplementation(() => undefined);
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    try {
      const requested = await request(httpServer(app))
        .post(`/v1/me/certification-cases/${caseId}/referees`)
        .set(auth(candidateSubject, ['USR_CAND']))
        .send({
          refereeName: 'Referent Test',
          organization: 'Nezavisna kuća',
          email: 'referee@exam.test',
          requestedFacts: 'Trajanje angažmana.',
        })
        .expect(201);
      expect(requested.body).not.toHaveProperty('token');
      const outbox = await requirePrisma().messageOutbox.findFirst({
        where: { tenantId, toAddress: 'referee@exam.test' },
      });
      expect(outbox?.body.startsWith('enc:v1:')).toBe(true);
      const opened = openDelivery(outbox?.body ?? '');
      const refereeToken = opened.split('/').pop() ?? '';
      expect(refereeToken.length).toBeGreaterThan(20);
      expect(JSON.stringify(requested.body)).not.toContain(refereeToken);
      expect(outbox?.body).not.toContain(refereeToken);
      expect(info.mock.calls.flat().join(' ')).not.toContain(refereeToken);
      expect(logSpy.mock.calls.flat().join(' ')).not.toContain(refereeToken);
      const confirmed = await request(httpServer(app))
        .post(`/v1/public/referees/${encodeURIComponent(refereeToken)}`)
        .send({ accept: true, confirmedFacts: 'Tačno.' })
        .expect(201);
      expect(JSON.stringify(confirmed.body)).not.toContain(refereeToken);
      await request(httpServer(app))
        .post(`/v1/public/referees/${encodeURIComponent(refereeToken)}`)
        .send({ accept: true })
        .expect(400);
    } finally {
      info.mockRestore();
      logSpy.mockRestore();
    }
    const proposed = await request(httpServer(app))
      .get(`/v1/committee/cases/${caseId}`)
      .set(auth(deciderSubject, ['COM_CERT']))
      .expect(200);
    const slots = (
      proposed.body as {
        proposals: { userId: string; state: string; exclusionReason: string | null }[];
      }
    ).proposals;
    expect(slots.find((slot) => slot.userId === trainerId)?.exclusionReason).toBe('TRAINER');
    expect(slots.find((slot) => slot.userId === invigilatorId)?.exclusionReason).toBe('EXAMINER');
    expect(slots.find((slot) => slot.userId === authorId)?.state).toBe('EXCLUDED');
    expect(slots.find((slot) => slot.userId === authorId)?.exclusionReason).toBe('EXAMINER');
    expect(slots.find((slot) => slot.userId === approverId)?.exclusionReason).toBe('EXAMINER');
    await request(httpServer(app))
      .post(`/v1/staff/schemes/${versionId}/decision-makers`)
      .set(auth(approverSubject, ['COM_TECH']))
      .send({
        userId: approverId,
        kind: 'COMMITTEE_CHAIR',
        competenceNote: 'Sam sebi ne dodjeljuje ovlaštenje.',
        documentRef: 'Pokušaj samoodobrenja ovlaštenja.',
        authorisedFrom: '2020-01-01T00:00:00.000Z',
        authorisedUntil: '2030-01-01T00:00:00.000Z',
      })
      .expect(403);
    await request(httpServer(app))
      .post(`/v1/staff/schemes/${versionId}/decision-makers`)
      .set(auth(approverSubject, ['COM_TECH']))
      .send({
        userId: bystanderId,
        kind: 'COMMITTEE_CHAIR',
        competenceNote: 'Predsjedava komitetom šeme.',
        documentRef: 'Odluka certifikacionog tijela o predsjedavanju.',
        authorisedFrom: '2020-01-01T00:00:00.000Z',
        authorisedUntil: '2030-01-01T00:00:00.000Z',
      })
      .expect(201);
    await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/conflict-declaration`)
      .set(auth(bystanderSubject, ['COM_CERT']))
      .send({ hasConflict: false, statement: 'Predsjedavajući nema sukob interesa.' })
      .expect(201);
    await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/confirm`)
      .set(auth(deciderSubject, ['COM_CERT']))
      .send({ memberUserId: authorId })
      .expect(403);
    await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/confirm`)
      .set(auth(deciderSubject, ['COM_CERT']))
      .send({ memberUserId: deciderId })
      .expect(403);
    await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/confirm`)
      .set(auth(bystanderSubject, ['COM_CERT']))
      .send({ memberUserId: authorId })
      .expect(400);
    await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/confirm`)
      .set(auth(bystanderSubject, ['COM_CERT']))
      .send({ memberUserId: deciderId })
      .expect(201);
    const assigned = await request(httpServer(app))
      .get('/v1/committee/cases')
      .set(auth(deciderSubject, ['COM_CERT']))
      .expect(200);
    expect(assigned.body).toEqual([
      expect.objectContaining({ caseId, phase: 'COMMITTEE', assigned: true }),
    ]);
    expect(JSON.stringify(assigned.body)).not.toContain('path');
    expect(JSON.stringify(assigned.body)).not.toContain('DIRECT');
    expect(JSON.stringify(assigned.body)).not.toContain('CONFORA_EDUCATION');
    const voteBody = { ballot: 'GRANT' as const, reasoning: 'Kriterij Practitioner je ispunjen.' };
    const raced = await Promise.all([
      request(httpServer(app))
        .post(`/v1/committee/cases/${caseId}/votes`)
        .set(auth(deciderSubject, ['COM_CERT']))
        .send(voteBody),
      request(httpServer(app))
        .post(`/v1/committee/cases/${caseId}/votes`)
        .set(auth(deciderSubject, ['COM_CERT']))
        .send(voteBody),
    ]);
    expect(raced.map((response) => response.status).sort()).toEqual([201, 400]);
    const voted = raced.find((response) => response.status === 201);
    const duplicate = raced.find((response) => response.status === 400);
    expect((voted?.body as { computedLevelCode: string }).computedLevelCode).toBe('PRACTITIONER');
    expect((duplicate?.body as { message: string }).message).toBe('ALREADY_VOTED');
    expect(
      await requirePrisma().committeeAssessment.count({
        where: { tenantId, caseId, memberUserId: deciderId, voidedAt: null },
      }),
    ).toBe(1);
    const racedCase = await requirePrisma().professionalCase.findFirst({
      where: { tenantId, id: caseId },
    });
    const racedVotes = await requirePrisma().committeeAssessment.findMany({
      where: { tenantId, caseId },
    });
    const racedLive = racedVotes.filter(
      (vote) => vote.voidedAt === null && vote.compositionVersion === racedCase?.compositionVersion,
    );
    expect(racedLive).toHaveLength(1);
    const racedQuorum = liveBallotCounts(
      racedVotes.map((vote) => ({
        ballot: vote.ballot,
        voidedAt: vote.voidedAt,
        compositionVersion: vote.compositionVersion,
      })),
      racedCase?.compositionVersion ?? 0,
    );
    expect(racedQuorum).toEqual({ grants: 1, denies: 0 });
    expect(voteResult({ ...racedQuorum, quorum: 1 })).toBe('GRANT');
    expect(racedLive.filter((vote) => vote.ballot === 'GRANT')).toHaveLength(racedQuorum.grants);
    expect(racedLive.filter((vote) => vote.ballot === 'DENY')).toHaveLength(racedQuorum.denies);
    const racedDecisions = await requirePrisma().examCertificationDecision.findMany({
      where: { tenantId, resultId: passResultId },
    });
    expect(racedDecisions.filter((row) => row.supersededAt === null)).toHaveLength(1);
    expect(racedDecisions.some((row) => row.supersedeReason === 'QUORUM_REACHED')).toBe(true);
    expect(
      await requirePrisma().auditEvent.count({
        where: { tenantId, eventType: 'COMMITTEE_VOTE_RECORDED', resourceId: caseId },
      }),
    ).toBe(1);
    const supersededExamDecision = await requirePrisma().examCertificationDecision.findFirst({
      where: { tenantId, id: decisionId },
    });
    expect(supersededExamDecision?.supersededAt).not.toBeNull();
    expect(supersededExamDecision?.supersedeReason).toBe('QUORUM_REACHED');
    await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/issue-authorization`)
      .set(auth(deciderSubject, ['COM_CERT']))
      .send({
        holderDisplayName: 'Demo Kandidat',
        registryConsent: false,
        note: 'Administrativna provjera.',
      })
      .expect(403);
    await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/assist`)
      .set(auth(issuerSubject, ['COM_CERT']))
      .send({ purpose: 'summary' })
      .expect(403);
    await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/conflict-declaration`)
      .set(auth(qualitySubject, ['COM_CERT', 'QUALITY_MANAGER']))
      .send({ hasConflict: false, statement: 'Nemam sukob interesa.' })
      .expect(201);
    await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/conflict-declaration`)
      .set(auth(issuerSubject, ['COM_CERT']))
      .send({ hasConflict: true, statement: 'Imam sukob na ovom predmetu.' })
      .expect(201);
    await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/propose`)
      .set(auth(deciderSubject, ['COM_CERT']))
      .send({
        reason: 'Isključujem kolege iz odbora.',
        declaredConflictUserIds: [issuerId],
      })
      .expect(400);
    await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/propose`)
      .set(auth(deciderSubject, ['COM_CERT']))
      .send({ reason: 'Isključujem kolege iz odbora.' })
      .expect(403);
    await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/propose`)
      .set(auth(qualitySubject, ['COM_CERT', 'QUALITY_MANAGER']))
      .send({ reason: 'Sukob je evidentiran u izjavi člana.' })
      .expect(403);
    await request(httpServer(app))
      .post(`/v1/staff/schemes/${versionId}/decision-makers`)
      .set(auth(approverSubject, ['COM_TECH']))
      .send({
        userId: qualityId,
        kind: 'SCHEME_COMMITTEE_OVERSIGHT',
        competenceNote: 'Nadzor komiteta za ovu šemu.',
        documentRef: 'Ovlaštenje za nadzor komiteta šeme.',
        authorisedFrom: '2020-01-01T00:00:00.000Z',
        authorisedUntil: '2030-01-01T00:00:00.000Z',
      })
      .expect(201);
    const beforeChange = await request(httpServer(app))
      .get(`/v1/committee/cases/${caseId}`)
      .set(auth(deciderSubject, ['COM_CERT']))
      .expect(200);
    const beforeSlots = (
      beforeChange.body as {
        proposals: { userId: string; state: string; exclusionReason: string | null }[];
      }
    ).proposals;
    expect(beforeSlots.find((slot) => slot.userId === issuerId)?.state).not.toBe('EXCLUDED');
    expect(beforeSlots.find((slot) => slot.userId === deciderId)?.state).toBe('CONFIRMED');
    const pending = await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/propose`)
      .set(auth(qualitySubject, ['COM_CERT', 'QUALITY_MANAGER']))
      .send({ reason: 'Sukob je evidentiran u izjavi člana.' })
      .expect(201);
    const pendingBody = pending.body as {
      requestId: string;
      status: string;
      changed: boolean;
      slots: { userId: string; state: string }[];
    };
    expect(pendingBody.status).toBe('PENDING');
    expect(pendingBody.changed).toBe(false);
    expect(pendingBody.slots.find((slot) => slot.userId === issuerId)?.state).not.toBe('EXCLUDED');
    expect(pendingBody.slots.find((slot) => slot.userId === deciderId)?.state).toBe('CONFIRMED');
    const review = {
      requestId: pendingBody.requestId,
      grounds: 'Sukob je evidentiran u izjavi člana.',
      recordedCoiReview: 'Provjerene su zabilježene izjave o sukobu.',
      competenceReview: 'Predloženi članovi imaju važeću kompetentnost.',
      priorVoteImpact: 'Raniji glasovi prestaju važiti i kvorum se ponavlja.',
    };
    for (const approvalBody of [
      review,
      { ...review, requestedSide: 'CHAIR' as const },
      { ...review, requestedSide: 'OVERSIGHT' as const },
    ]) {
      await request(httpServer(app))
        .post(`/v1/committee/cases/${caseId}/propose`)
        .set(auth(qualitySubject, ['COM_CERT', 'QUALITY_MANAGER']))
        .send(approvalBody)
        .expect(403);
    }
    const selfApproval = await requirePrisma().committeeCompositionRequest.findFirst({
      where: { tenantId, id: pendingBody.requestId },
    });
    expect(selfApproval?.status).toBe('PENDING');
    expect(selfApproval?.proposedByUserId).toBe(qualityId);
    expect(selfApproval?.approvedByUserId).toBeNull();
    expect(selfApproval?.approverSide).toBeNull();
    expect(
      (
        await requirePrisma().committeeProposal.findFirst({
          where: { tenantId, caseId, userId: issuerId },
        })
      )?.state,
    ).not.toBe('EXCLUDED');
    await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/conflict-declaration`)
      .set(auth(bystanderSubject, ['COM_CERT']))
      .send({ hasConflict: true, statement: 'Predsjedavajući je naknadno u sukobu.' })
      .expect(201);
    await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/propose`)
      .set(auth(bystanderSubject, ['COM_CERT']))
      .send(review)
      .expect(403);
    await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/propose`)
      .set(auth(deciderSubject, ['COM_CERT']))
      .send(review)
      .expect(403);
    await request(httpServer(app))
      .post(`/v1/staff/schemes/${versionId}/decision-makers`)
      .set(auth(approverSubject, ['COM_TECH']))
      .send({
        userId: trainerId,
        kind: 'CERTIFICATION_BODY_DEPUTY',
        competenceNote: 'Zamjena kada je strana u sukobu.',
        documentRef: 'Posebno ovlaštenje certifikacionog tijela.',
        authorisedFrom: '2020-01-01T00:00:00.000Z',
        authorisedUntil: '2030-01-01T00:00:00.000Z',
      })
      .expect(201);
    await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/conflict-declaration`)
      .set(auth(trainerSubject, ['COM_CERT']))
      .send({ hasConflict: false, statement: 'Zamjena nema sukob na predmetu.' })
      .expect(201);
    const changed = await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/propose`)
      .set(auth(trainerSubject, ['COM_CERT']))
      .send(review)
      .expect(201);
    const changedSlots = (
      changed.body as {
        slots: { userId: string; state: string; exclusionReason: string | null }[];
      }
    ).slots;
    expect(changedSlots.find((slot) => slot.userId === issuerId)?.state).toBe('EXCLUDED');
    expect(changedSlots.find((slot) => slot.userId === issuerId)?.exclusionReason).toBe('CONFLICT');
    expect(changedSlots.find((slot) => slot.userId === deciderId)?.state).toBe('PROPOSED');
    expect((changed.body as { votesInvalidated: number }).votesInvalidated).toBe(1);
    expect((changed.body as { phase: string }).phase).toBe('COMMITTEE');
    const supersededByComposition = await requirePrisma().examCertificationDecision.findFirst({
      where: { tenantId, resultId: passResultId, supersededAt: null },
    });
    expect(supersededByComposition).toBeNull();
    const voidedVote = await requirePrisma().committeeAssessment.findFirst({
      where: { tenantId, caseId, memberUserId: deciderId },
      orderBy: { createdAt: 'asc' },
    });
    expect(voidedVote?.ballot).toBe('GRANT');
    expect(voidedVote?.voidReason).toBe('COMPOSITION_CHANGED');
    expect(voidedVote?.voidedAt).not.toBeNull();
    const voidedBallots = await requirePrisma().committeeAssessment.findMany({
      where: { tenantId, caseId },
    });
    const voidedCase = await requirePrisma().professionalCase.findFirst({
      where: { tenantId, id: caseId },
    });
    const voidedQuorum = liveBallotCounts(
      voidedBallots.map((vote) => ({
        ballot: vote.ballot,
        voidedAt: vote.voidedAt,
        compositionVersion: vote.compositionVersion,
      })),
      voidedCase?.compositionVersion ?? 0,
    );
    expect(voidedQuorum).toEqual({ grants: 0, denies: 0 });
    expect(voteResult({ ...voidedQuorum, quorum: 1 })).toBe('PENDING');
    expect(voidedBallots.some((vote) => vote.voidedAt !== null && vote.ballot === 'GRANT')).toBe(
      true,
    );
    expect(voidedCase?.phase).toBe('COMMITTEE');
    await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/votes`)
      .set(auth(deciderSubject, ['COM_CERT']))
      .send({ ballot: 'GRANT', reasoning: 'Bez ponovne potvrde nema kvoruma.' })
      .expect(403);
    await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/conflict-declaration`)
      .set(auth(qualitySubject, ['COM_CERT', 'QUALITY_MANAGER']))
      .send({
        hasConflict: false,
        statement: 'Sukob člana je uklonjen nakon provjere.',
        subjectUserId: issuerId,
      })
      .expect(201);
    const restored = await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/propose`)
      .set(auth(qualitySubject, ['COM_CERT', 'QUALITY_MANAGER']))
      .send({ reason: 'Sukob je skinut, član se vraća u sastav.' })
      .expect(201);
    await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/propose`)
      .set(auth(trainerSubject, ['COM_CERT']))
      .send({
        requestId: (restored.body as { requestId: string }).requestId,
        grounds: 'Sukob je skinut, član se vraća u sastav.',
        recordedCoiReview: 'Izjava o sukobu je povučena od nezavisne strane.',
        competenceReview: 'Vraćeni član i dalje ima važeću kompetentnost.',
        priorVoteImpact: 'Nema važećeg glasa, pa se sastav samo dopunjuje.',
      })
      .expect(201);
    await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/conflict-declaration`)
      .set(auth(issuerSubject, ['COM_CERT']))
      .send({ hasConflict: true, statement: 'Privremeni sukob za provjeru potvrde.' })
      .expect(201);
    const exclusion = await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/propose`)
      .set(auth(qualitySubject, ['COM_CERT', 'QUALITY_MANAGER']))
      .send({ reason: 'Sukob člana isključuje ga iz sastava.' })
      .expect(201);
    const confirmRace = await Promise.all([
      request(httpServer(app))
        .post(`/v1/committee/cases/${caseId}/confirm`)
        .set(auth(qualitySubject, ['COM_CERT', 'QUALITY_MANAGER']))
        .send({ memberUserId: issuerId }),
      request(httpServer(app))
        .post(`/v1/committee/cases/${caseId}/propose`)
        .set(auth(trainerSubject, ['COM_CERT']))
        .send({
          requestId: (exclusion.body as { requestId: string }).requestId,
          grounds: 'Sukob člana isključuje ga iz sastava.',
          recordedCoiReview: 'Izjava o sukobu je zabilježena prije potvrde.',
          competenceReview: 'Isključeni član se ne potvrđuje u ovom sastavu.',
          priorVoteImpact: 'Nema važećeg glasa, pa se samo sastav mijenja.',
        }),
    ]);
    expect(confirmRace.map((response) => response.status).every((status) => status < 500)).toBe(
      true,
    );
    const excludedIssuer = await requirePrisma().committeeProposal.findFirst({
      where: { tenantId, caseId, userId: issuerId },
    });
    expect(excludedIssuer?.state).toBe('EXCLUDED');
    expect(excludedIssuer?.exclusionReason).toBe('CONFLICT');
    expect(excludedIssuer?.confirmedByUserId).toBeNull();
    expect(
      await requirePrisma().committeeProposal.count({
        where: { tenantId, caseId, state: 'CONFIRMED', exclusionReason: { not: null } },
      }),
    ).toBe(0);
    const confirmCase = await requirePrisma().professionalCase.findFirst({
      where: { tenantId, id: caseId },
    });
    const confirmBallots = await requirePrisma().committeeAssessment.findMany({
      where: { tenantId, caseId },
    });
    const confirmQuorum = liveBallotCounts(
      confirmBallots.map((vote) => ({
        ballot: vote.ballot,
        voidedAt: vote.voidedAt,
        compositionVersion: vote.compositionVersion,
      })),
      confirmCase?.compositionVersion ?? 0,
    );
    expect(confirmQuorum).toEqual({ grants: 0, denies: 0 });
    expect(voteResult({ ...confirmQuorum, quorum: 1 })).toBe('PENDING');
    expect(excludedIssuer?.compositionVersion).toBe(confirmCase?.compositionVersion);
    expect(await requirePrisma().credential.count({ where: { tenantId } })).toBe(0);
    const confirmDecisions = await requirePrisma().examCertificationDecision.findMany({
      where: { tenantId, resultId: passResultId },
    });
    expect(confirmDecisions.filter((row) => row.supersededAt === null)).toHaveLength(0);
    expect(confirmDecisions.every((row) => row.supersededAt === null || row.supersedeReason)).toBe(
      true,
    );
    const appliedExclusion = await requirePrisma().committeeCompositionRequest.findFirst({
      where: { tenantId, id: (exclusion.body as { requestId: string }).requestId },
    });
    expect(appliedExclusion?.status).toBe('APPLIED');
    expect(appliedExclusion?.proposedByUserId).toBe(qualityId);
    expect(appliedExclusion?.approvedByUserId).toBe(trainerId);
    expect(appliedExclusion?.approvedByUserId).not.toBe(appliedExclusion?.proposedByUserId);
    expect(
      await requirePrisma().auditEvent.count({
        where: { tenantId, eventType: 'COMMITTEE_COMPOSITION_CHANGED', resourceId: caseId },
      }),
    ).toBeGreaterThan(0);
    const seatAudits = await requirePrisma().auditEvent.count({
      where: { tenantId, eventType: 'COMMITTEE_SEAT_CONFIRMED', resourceId: caseId },
    });
    if (confirmRace[0].status === 201) {
      expect(seatAudits).toBeGreaterThan(0);
    }
    await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/conflict-declaration`)
      .set(auth(qualitySubject, ['COM_CERT', 'QUALITY_MANAGER']))
      .send({
        hasConflict: false,
        statement: 'Privremeni sukob člana je uklonjen.',
        subjectUserId: issuerId,
      })
      .expect(201);
    const broughtBack = await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/propose`)
      .set(auth(qualitySubject, ['COM_CERT', 'QUALITY_MANAGER']))
      .send({ reason: 'Član se vraća nakon uklonjenog sukoba.' })
      .expect(201);
    await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/propose`)
      .set(auth(trainerSubject, ['COM_CERT']))
      .send({
        requestId: (broughtBack.body as { requestId: string }).requestId,
        grounds: 'Član se vraća nakon uklonjenog sukoba.',
        recordedCoiReview: 'Izjava o sukobu je povučena prije povratka.',
        competenceReview: 'Vraćeni član ima važeću kompetentnost.',
        priorVoteImpact: 'Nema važećeg glasa, sastav se samo dopunjuje.',
      })
      .expect(201);
    await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/confirm`)
      .set(auth(deciderSubject, ['COM_CERT']))
      .send({ memberUserId: deciderId })
      .expect(403);
    await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/confirm`)
      .set(auth(qualitySubject, ['COM_CERT', 'QUALITY_MANAGER']))
      .send({ memberUserId: deciderId })
      .expect(201);
    const revoted = await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/votes`)
      .set(auth(deciderSubject, ['COM_CERT']))
      .send({ ballot: 'GRANT', reasoning: 'Kvorum je ponovo ispunjen.' })
      .expect(201);
    expect((revoted.body as { computedLevelCode: string }).computedLevelCode).toBe('PRACTITIONER');
    const ballots = await requirePrisma().committeeAssessment.findMany({
      where: { tenantId, caseId, memberUserId: deciderId },
    });
    expect(ballots).toHaveLength(2);
    expect(ballots.filter((ballot) => ballot.voidedAt === null)).toHaveLength(1);
    await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/conflict-declaration`)
      .set(auth(issuerSubject, ['COM_CERT']))
      .send({ hasConflict: false, statement: 'Nisam učestvovao u odluci.' })
      .expect(201);
    const suggestion = await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/assist`)
      .set(auth(issuerSubject, ['COM_CERT']))
      .send({ purpose: 'summary' })
      .expect(201);
    expect((suggestion.body as { suggestion: string }).suggestion).toContain('Prijedlog');
    expect((suggestion.body as { decides: boolean }).decides).toBe(false);
    expect((suggestion.body as { humanValidationRequired: boolean }).humanValidationRequired).toBe(
      true,
    );
    const aiUse = await requirePrisma().auditEvent.findFirst({
      where: { tenantId, eventType: 'AI_USE_RECORDED', outcome: 'SUCCESS' },
      select: { metadata: true },
    });
    const pricedMatch = /"costMinor":(\d+)/.exec(JSON.stringify(aiUse?.metadata ?? null));
    const pricedCost = pricedMatch === null ? 0 : Number(pricedMatch[1]);
    expect(pricedCost).toBeGreaterThan(0);
    await requirePrisma().tenantAiBudget.updateMany({
      where: { tenantId },
      data: { unitsUsed: 100_000, unitLimit: 100_000 },
    });
    await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/assist`)
      .set(auth(issuerSubject, ['COM_CERT']))
      .send({ purpose: 'summary' })
      .expect(403);
    await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/conflict-declaration`)
      .set(auth(deciderSubject, ['COM_CERT']))
      .send({ hasConflict: true, statement: 'Kasnije sam uočio sukob.' })
      .expect(201);
    await request(httpServer(app))
      .get(`/v1/committee/cases/${caseId}`)
      .set(auth(deciderSubject, ['COM_CERT']))
      .expect(403);
    await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/conflict-declaration`)
      .set(auth(deciderSubject, ['COM_CERT']))
      .send({ hasConflict: false, statement: 'Sam povlačim sukob.' })
      .expect(403);
    await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/conflict-declaration`)
      .set(auth(issuerSubject, ['COM_CERT']))
      .send({
        hasConflict: false,
        statement: 'Član komiteta bez uloge ne skida sukob.',
        subjectUserId: deciderId,
      })
      .expect(403);
    await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/conflict-declaration`)
      .set(auth(qualitySubject, ['COM_CERT', 'QUALITY_MANAGER']))
      .send({ hasConflict: true, statement: 'Imam vlastiti sukob na predmetu.' })
      .expect(201);
    await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/conflict-declaration`)
      .set(auth(qualitySubject, ['COM_CERT', 'QUALITY_MANAGER']))
      .send({
        hasConflict: false,
        statement: 'Menadžer kvaliteta sa sukobom ne skida tuđi sukob.',
        subjectUserId: deciderId,
      })
      .expect(403);
    await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/conflict-declaration`)
      .set(auth(issuerSubject, ['COM_CERT', 'QUALITY_MANAGER']))
      .send({
        hasConflict: false,
        statement: 'Menadžer kvaliteta skida sukob.',
        subjectUserId: deciderId,
      })
      .expect(201);
    await request(httpServer(app))
      .get(`/v1/committee/cases/${caseId}`)
      .set(auth(deciderSubject, ['COM_CERT']))
      .expect(200);
    expect(
      await requirePrisma().committeeAssessment.count({
        where: { tenantId, caseId, memberUserId: deciderId, voidedAt: null },
      }),
    ).toBe(0);
    expect(
      (
        await requirePrisma().professionalCase.findFirst({
          where: { tenantId, id: caseId },
          select: { phase: true },
        })
      )?.phase,
    ).toBe('COMMITTEE');
    expect(
      await requirePrisma().examCertificationDecision.count({
        where: { tenantId, resultId: passResultId, supersededAt: null },
      }),
    ).toBe(0);
    const decisionsBeforeDeny = await requirePrisma().examCertificationDecision.count({
      where: { tenantId, resultId: passResultId },
    });
    const denied = await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/votes`)
      .set(auth(deciderSubject, ['COM_CERT']))
      .send({ ballot: 'DENY', reasoning: 'Kvorum odbija zahtjev.' })
      .expect(201);
    expect((denied.body as { phase: string }).phase).toBe('DENIED');
    const denyDecision = await requirePrisma().examCertificationDecision.findFirst({
      where: { tenantId, resultId: passResultId, supersededAt: null },
    });
    if (!denyDecision) {
      throw new Error('Denied decision was not stored.');
    }
    expect(denyDecision.outcome).toBe('DENY');
    expect(
      await requirePrisma().examCertificationDecision.count({
        where: { tenantId, resultId: passResultId },
      }),
    ).toBe(decisionsBeforeDeny + 1);
    const closedVote = await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/votes`)
      .set(auth(deciderSubject, ['COM_CERT']))
      .send({ ballot: 'GRANT', reasoning: 'U fazi odbijanja nema novog glasa.' })
      .expect(400);
    expect((closedVote.body as { message: string }).message).toBe('VOTING_CLOSED');
    const denyVotes = await requirePrisma().committeeAssessment.findMany({
      where: { tenantId, caseId },
    });
    const denyCase = await requirePrisma().professionalCase.findFirst({
      where: { tenantId, id: caseId },
    });
    const denyLive = denyVotes.filter(
      (vote) => vote.voidedAt === null && vote.compositionVersion === denyCase?.compositionVersion,
    );
    expect(denyLive.map((vote) => vote.ballot)).toEqual(['DENY']);
    await requirePrisma().noticeJob.create({
      data: {
        id: randomUUID(),
        tenantId,
        recipientUserId: candidateId,
        channel: 'EMAIL',
        kind: 'GENERAL',
        referenceId: denyDecision.id,
        toAddress: 'candidate@exam.test',
        subject: 'Odluka komiteta',
        body: 'Zahtjev je odbijen.',
        status: 'SENT',
        nextAttemptAt: new Date(),
      },
    });
    await requirePrisma().appealCase.create({
      data: {
        id: randomUUID(),
        tenantId,
        internalCaseId: `appeal-${denyDecision.id}`,
        appellantUserId: candidateId,
        certificationDecisionReference: denyDecision.id,
        originalDecisionMakerUserId: denyDecision.decidedByUserId,
      },
    });
    await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/conflict-declaration`)
      .set(auth(deciderSubject, ['COM_CERT']))
      .send({ hasConflict: true, statement: 'Glas koji je donio odbijanje je u sukobu.' })
      .expect(201);
    const setAside = await requirePrisma().examCertificationDecision.findFirst({
      where: { tenantId, id: denyDecision.id },
    });
    expect(setAside?.supersededAt).not.toBeNull();
    expect(setAside?.supersedeReason).toBe('CONFLICT_DECLARED');
    expect(
      await requirePrisma().examCertificationDecision.count({
        where: { tenantId, resultId: passResultId },
      }),
    ).toBe(decisionsBeforeDeny + 1);
    const afterDenyConflict = await requirePrisma().professionalCase.findFirst({
      where: { tenantId, id: caseId },
    });
    expect(afterDenyConflict?.phase).toBe('COMMITTEE');
    const votesAfterDenyConflict = await requirePrisma().committeeAssessment.findMany({
      where: { tenantId, caseId },
    });
    expect(
      votesAfterDenyConflict.filter(
        (vote) =>
          vote.voidedAt === null &&
          vote.compositionVersion === afterDenyConflict?.compositionVersion,
      ),
    ).toEqual([]);
    const denyReview = await requirePrisma().certificationBodyReview.findFirst({
      where: { tenantId, caseId, status: 'OPEN' },
    });
    if (!denyReview) {
      throw new Error('Set-aside review was not opened.');
    }
    expect(
      await requirePrisma().noticeJob.count({
        where: { tenantId, referenceId: denyDecision.id },
      }),
    ).toBe(1);
    expect(
      await requirePrisma().appealCase.count({
        where: { tenantId, certificationDecisionReference: denyDecision.id },
      }),
    ).toBe(1);
    expect(
      await requirePrisma().auditEvent.count({
        where: {
          tenantId,
          eventType: 'COMMITTEE_COMPOSITION_REVIEW_OPENED',
          resourceId: caseId,
        },
      }),
    ).toBeGreaterThan(0);
    await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/conflict-declaration`)
      .set(auth(issuerSubject, ['COM_CERT', 'QUALITY_MANAGER']))
      .send({
        hasConflict: false,
        statement: 'Sukob glasača je uklonjen radi novog postupka.',
        subjectUserId: deciderId,
      })
      .expect(201);
    await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/conflict-declaration`)
      .set(auth(issuerSubject, ['COM_CERT', 'QUALITY_MANAGER']))
      .send({
        hasConflict: false,
        statement: 'Sukob nadzora je uklonjen radi pregleda.',
        subjectUserId: qualityId,
      })
      .expect(201);
    await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/propose`)
      .set(auth(trainerSubject, ['COM_CERT']))
      .send({
        reviewAction: 'DECIDE',
        reviewId: denyReview.id,
        outcome: 'RECOMPOSE_WITHOUT_WITHDRAWAL',
        rationale: 'Odbijanje bez važećeg glasa ide na novu zakonitu odluku.',
      })
      .expect(201);
    const deniedAgain = await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/votes`)
      .set(auth(deciderSubject, ['COM_CERT']))
      .send({ ballot: 'DENY', reasoning: 'Novo odbijanje prije izmjene sastava.' })
      .expect(201);
    expect((deniedAgain.body as { phase: string }).phase).toBe('DENIED');
    const secondDeny = await requirePrisma().examCertificationDecision.findFirst({
      where: { tenantId, resultId: passResultId, supersededAt: null },
    });
    if (!secondDeny) {
      throw new Error('Second denial was not stored.');
    }
    await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/conflict-declaration`)
      .set(auth(issuerSubject, ['COM_CERT']))
      .send({ hasConflict: true, statement: 'Sukob člana mijenja sastav poslije odbijanja.' })
      .expect(201);
    const denyComposition = await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/propose`)
      .set(auth(qualitySubject, ['COM_CERT', 'QUALITY_MANAGER']))
      .send({ reason: 'Sastav se mijenja nakon odbijanja.' })
      .expect(201);
    await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/propose`)
      .set(auth(trainerSubject, ['COM_CERT']))
      .send({
        requestId: (denyComposition.body as { requestId: string }).requestId,
        grounds: 'Sastav se mijenja nakon odbijanja.',
        recordedCoiReview: 'Sukob člana je zabilježen prije nove odluke.',
        competenceReview: 'Preostali članovi imaju važeću kompetentnost.',
        priorVoteImpact: 'Odbijanje bez važećeg glasa ne ostaje prepreka.',
      })
      .expect(201);
    const composedDeny = await requirePrisma().examCertificationDecision.findFirst({
      where: { tenantId, id: secondDeny.id },
    });
    expect(composedDeny?.supersededAt).not.toBeNull();
    expect(composedDeny?.supersedeReason).toBe('COMPOSITION_CHANGED');
    expect(
      await requirePrisma().examCertificationDecision.count({
        where: { tenantId, id: secondDeny.id },
      }),
    ).toBe(1);
    expect(
      (
        await requirePrisma().professionalCase.findFirst({
          where: { tenantId, id: caseId },
          select: { phase: true },
        })
      )?.phase,
    ).toBe('COMMITTEE');
    const composedVotes = await requirePrisma().committeeAssessment.findMany({
      where: { tenantId, caseId },
    });
    const composedCase = await requirePrisma().professionalCase.findFirst({
      where: { tenantId, id: caseId },
    });
    expect(
      composedVotes.filter(
        (vote) =>
          vote.voidedAt === null && vote.compositionVersion === composedCase?.compositionVersion,
      ),
    ).toEqual([]);
    const compositionReview = await requirePrisma().certificationBodyReview.findFirst({
      where: { tenantId, caseId, status: 'OPEN' },
    });
    if (!compositionReview) {
      throw new Error('Composition set-aside review was not opened.');
    }
    await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/propose`)
      .set(auth(trainerSubject, ['COM_CERT']))
      .send({
        reviewAction: 'DECIDE',
        reviewId: compositionReview.id,
        outcome: 'RECOMPOSE_WITHOUT_WITHDRAWAL',
        rationale: 'Osoba koja je otvorila pregled ne može sama da ga odluči.',
      })
      .expect(403);
    expect(
      (
        await requirePrisma().certificationBodyReview.findFirst({
          where: { tenantId, id: compositionReview.id },
        })
      )?.status,
    ).toBe('OPEN');
    await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/propose`)
      .set(auth(qualitySubject, ['COM_CERT', 'QUALITY_MANAGER']))
      .send({
        reviewAction: 'DECIDE',
        reviewId: compositionReview.id,
        outcome: 'RECOMPOSE_WITHOUT_WITHDRAWAL',
        rationale: 'Nakon izmjene sastava odbijanje ne ostaje na snazi.',
      })
      .expect(201);
    await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/conflict-declaration`)
      .set(auth(qualitySubject, ['COM_CERT', 'QUALITY_MANAGER']))
      .send({
        hasConflict: false,
        statement: 'Sukob člana je uklonjen nakon izmjene sastava.',
        subjectUserId: issuerId,
      })
      .expect(201);
    const restoredAfterDeny = await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/propose`)
      .set(auth(qualitySubject, ['COM_CERT', 'QUALITY_MANAGER']))
      .send({ reason: 'Član se vraća nakon prestanka sukoba.' })
      .expect(201);
    await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/propose`)
      .set(auth(trainerSubject, ['COM_CERT']))
      .send({
        requestId: (restoredAfterDeny.body as { requestId: string }).requestId,
        grounds: 'Član se vraća nakon prestanka sukoba.',
        recordedCoiReview: 'Izjava o sukobu je povučena prije povratka.',
        competenceReview: 'Vraćeni član ima važeću kompetentnost.',
        priorVoteImpact: 'Nema važećeg glasa, sastav se dopunjuje.',
      })
      .expect(201);
    await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/confirm`)
      .set(auth(qualitySubject, ['COM_CERT', 'QUALITY_MANAGER']))
      .send({ memberUserId: deciderId })
      .expect(201);
    const confirmedSeat = await requirePrisma().committeeProposal.findFirst({
      where: { tenantId, caseId, userId: deciderId },
    });
    expect(confirmedSeat?.state).toBe('CONFIRMED');
    expect(confirmedSeat?.compositionVersion).toBe(
      (
        await requirePrisma().professionalCase.findFirst({
          where: { tenantId, id: caseId },
          select: { compositionVersion: true },
        })
      )?.compositionVersion,
    );
    await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/conflict-declaration`)
      .set(auth(qualitySubject, ['COM_CERT', 'QUALITY_MANAGER']))
      .send({ hasConflict: true, statement: 'Nadzor ponovo prijavljuje sukob.' })
      .expect(201);
    const revotedAfterConflict = await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/votes`)
      .set(auth(deciderSubject, ['COM_CERT']))
      .send({ ballot: 'GRANT', reasoning: 'Novi kvorum nakon uklonjenog sukoba.' })
      .expect(201);
    expect((revotedAfterConflict.body as { computedLevelCode: string }).computedLevelCode).toBe(
      'PRACTITIONER',
    );
    const issuanceDecision = await requirePrisma().examCertificationDecision.findFirst({
      where: { tenantId, resultId: passResultId, supersededAt: null },
    });
    if (!issuanceDecision) {
      throw new Error('Live certification decision was not stored.');
    }
    let issuanceDecisionId = issuanceDecision.id;
    expect(issuanceDecisionId).not.toBe(decisionId);
    expect(issuanceDecision.decidedByUserId).not.toBe(deciderId);
    const staleDecision = await request(httpServer(app))
      .post('/v1/committee/certificates')
      .set(auth(issuerSubject, ['COM_CERT']))
      .send({ decisionId, holderDisplayName: 'Krivo Ime', registryConsent: true })
      .expect(400);
    expect((staleDecision.body as { message: string }).message).toBe('DECISION_SUPERSEDED');
    const unverified = await request(httpServer(app))
      .post('/v1/committee/certificates')
      .set(auth(issuerSubject, ['COM_CERT']))
      .send({
        decisionId: issuanceDecisionId,
        holderDisplayName: 'Krivo Ime',
        registryConsent: true,
      })
      .expect(400);
    expect((unverified.body as { message: string }).message).toBe('IDENTITY_UNVERIFIED');
    await requirePrisma().userProfile.create({
      data: {
        id: randomUUID(),
        tenantId,
        userId: candidateId,
        givenName: 'Demo',
        familyName: 'Kandidat',
        identityVerificationState: 'VERIFIED',
      },
    });
    const passDoc = await requirePrisma().examPassAttestation.findFirst({
      where: { tenantId, resultId: passResultId },
    });
    expect(passDoc?.state).toBe('ISSUED');
    expect(passDoc?.publicUid.startsWith('EXM-')).toBe(true);
    if (!passDoc?.verificationId || !passDoc.publicUid || !passDoc.issuedAt) {
      throw new Error('Exam pass was not stored.');
    }
    const verificationId = passDoc.verificationId;
    const recordNumber = passDoc.publicUid;
    const issuedOn = passDoc.issuedAt.toISOString().slice(0, 10);
    expect(verificationId).not.toBe(recordNumber);
    const enrolment = await requirePrisma().enrolment.findFirst({
      where: { tenantId, userId: candidateId },
    });
    if (!enrolment) {
      throw new Error('Enrolment was not stored.');
    }
    const eduVerificationId = randomBytes(32).toString('base64url');
    const eduNumber = `EDU-2026-${randomUUID().slice(0, 4)}`;
    await requirePrisma().educationCompletionDocument.create({
      data: {
        id: randomUUID(),
        tenantId,
        enrolmentId: enrolment.id,
        holderUserId: candidateId,
        publicUid: eduNumber,
        verificationId: eduVerificationId,
        courseTitle: 'Skriveni kurs',
        participationSeconds: 3600,
        statement: 'Interna izjava koja ne smije izaći.',
        issuedAt: new Date('2026-10-21T00:00:00.000Z'),
      },
    });
    const hiddenShape = {
      status: 'INVALID',
      documentType: null,
      issuedAt: null,
      holderName: null,
    };
    const byNumber = await request(httpServer(app))
      .get(`/v1/public/documents/${recordNumber}`)
      .expect(200);
    const byUnknown = await request(httpServer(app))
      .get(`/v1/public/documents/${randomUUID()}`)
      .expect(200);
    expect(byNumber.body).toEqual(hiddenShape);
    expect(byUnknown.body).toEqual(hiddenShape);
    const beforeConsent = await request(httpServer(app))
      .get(`/v1/public/documents/${verificationId}`)
      .expect(200);
    expect(beforeConsent.body).toEqual({
      status: 'VALID',
      documentType: 'EXAM_PASS',
      issuedAt: issuedOn,
      holderName: null,
    });
    expect(JSON.stringify(beforeConsent.body)).not.toMatch(
      /passed|statement|participation|položio|email|EXM-|Skriveni/i,
    );
    const educationHidden = await request(httpServer(app))
      .get(`/v1/public/documents/${eduVerificationId}`)
      .expect(200);
    expect(educationHidden.body).toEqual({
      status: 'VALID',
      documentType: 'EDUCATION_COMPLETION',
      issuedAt: '2026-10-21',
      holderName: null,
    });
    expect(JSON.stringify(educationHidden.body)).not.toContain('Interna izjava');
    expect(JSON.stringify(educationHidden.body)).not.toContain('3600');
    const pdfBefore = await request(httpServer(app))
      .get(`/v1/public/documents/${verificationId}/pdf`)
      .expect(200);
    expect(pdfBefore.headers['content-type']).toContain('application/pdf');
    const pdfUnknown = await request(httpServer(app))
      .get(`/v1/public/documents/${randomUUID()}/pdf`)
      .expect(200);
    expect(pdfUnknown.headers['content-type']).toContain('application/pdf');
    await request(httpServer(app))
      .put(`/v1/me/documents/${verificationId}/name-consent`)
      .set(auth(otherSubject, ['USR_CAND']))
      .send({ granted: true })
      .expect(404);
    await request(httpServer(app))
      .put(`/v1/me/documents/${verificationId}/name-consent`)
      .set(auth(candidateSubject, ['USR_CAND']))
      .send({ granted: true })
      .expect(200);
    const named = await request(httpServer(app))
      .get(`/v1/public/documents/${verificationId}`)
      .expect(200);
    expect(named.body).toEqual({
      status: 'VALID',
      documentType: 'EXAM_PASS',
      issuedAt: issuedOn,
      holderName: 'Demo Kandidat',
    });
    expect(JSON.stringify(named.body)).not.toMatch(/passed|položio|statement|participation/i);
    const educationStillHidden = await request(httpServer(app))
      .get(`/v1/public/documents/${eduVerificationId}`)
      .expect(200);
    expect((educationStillHidden.body as { holderName: string | null }).holderName).toBeNull();
    await request(httpServer(app))
      .put(`/v1/me/documents/${verificationId}/name-consent`)
      .set(auth(candidateSubject, ['USR_CAND']))
      .send({ granted: false })
      .expect(200);
    const revoked = await request(httpServer(app))
      .get(`/v1/public/documents/${verificationId}`)
      .expect(200);
    expect(revoked.body).toEqual({
      status: 'VALID',
      documentType: 'EXAM_PASS',
      issuedAt: issuedOn,
      holderName: null,
    });
    const afterRevoke = await requirePrisma().examPassAttestation.findFirst({
      where: { tenantId, id: passDoc.id },
    });
    expect(afterRevoke?.state).toBe('ISSUED');
    expect(afterRevoke?.passed).toBe(true);
    expect(afterRevoke?.nameConsentAt).toBeNull();
    const miss = await requirePrisma().publicDocumentAccessLog.findFirst({
      where: {
        verificationKeyHash: createHash('sha256').update(recordNumber).digest('hex'),
      },
    });
    expect(miss?.outcome).toBe('INVALID');
    expect(miss?.tenantId).toBeNull();
    const hit = await requirePrisma().publicDocumentAccessLog.findFirst({
      where: {
        tenantId,
        verificationKeyHash: createHash('sha256').update(verificationId).digest('hex'),
      },
    });
    expect(hit?.outcome).toBe('VALID');
    expect(hit?.verificationKeyHash).not.toBe(verificationId);

    const assertCertificateInvariant = async () => {
      const current = await requirePrisma().professionalCase.findFirst({
        where: { tenantId, id: caseId },
      });
      if (!current) {
        throw new Error('Case was not stored.');
      }
      const ballots = await requirePrisma().committeeAssessment.findMany({
        where: { tenantId, caseId },
      });
      const quorum = liveBallotCounts(
        ballots.map((vote) => ({
          ballot: vote.ballot,
          voidedAt: vote.voidedAt,
          compositionVersion: vote.compositionVersion,
        })),
        current.compositionVersion,
      );
      const live = ballots.filter(
        (vote) => vote.voidedAt === null && vote.compositionVersion === current.compositionVersion,
      );
      const decisions = await requirePrisma().examCertificationDecision.findMany({
        where: { tenantId, resultId: passResultId },
      });
      const credentials = await requirePrisma().credential.findMany({
        where: { tenantId },
        include: { examPersonnelLink: { include: { examDecision: true } } },
      });
      const active = credentials.filter((credential) => credential.lifecycle === 'ACTIVE');
      const liveDecisions = decisions.filter((row) => row.supersededAt === null);
      expect(live).toHaveLength(quorum.grants + quorum.denies);
      expect(live.filter((vote) => vote.ballot === 'GRANT')).toHaveLength(quorum.grants);
      expect(live.filter((vote) => vote.ballot === 'DENY')).toHaveLength(quorum.denies);
      expect(liveDecisions.length).toBeLessThanOrEqual(1);
      expect(
        decisions.filter((row) => row.supersededAt !== null).every((row) => row.supersedeReason),
      ).toBe(true);
      expect(
        ballots.filter((vote) => vote.voidedAt !== null).every((vote) => vote.voidReason),
      ).toBe(true);
      expect(active.length).toBeLessThanOrEqual(1);
      for (const credential of active) {
        expect(credential.examPersonnelLink?.examDecision.supersededAt).toBeNull();
        expect(credential.examPersonnelLink?.examDecision.outcome).toBe('GRANT');
        expect(current.phase).toBe('ISSUED');
        expect(liveDecisions.map((row) => row.id)).toContain(
          credential.examPersonnelLink?.examDecision.id,
        );
      }
      if (current.phase === 'APPROVED_FOR_ISSUANCE') {
        expect(voteResult({ ...quorum, quorum: 1 })).toBe('GRANT');
        expect(active).toHaveLength(0);
      }
      if (current.phase === 'COMMITTEE' || current.phase === 'DENIED') {
        expect(active).toHaveLength(0);
        expect(voteResult({ ...quorum, quorum: 1 })).toBe(
          current.phase === 'DENIED' ? 'DENY' : 'PENDING',
        );
      }
      return { current, live, quorum, decisions, liveDecisions, credentials, active, ballots };
    };
    const coiRace = await Promise.all([
      request(httpServer(app))
        .post('/v1/committee/certificates')
        .set(auth(issuerSubject, ['COM_CERT']))
        .send({
          decisionId: issuanceDecisionId,
          holderDisplayName: 'Krivo Ime',
          registryConsent: true,
        }),
      request(httpServer(app))
        .post(`/v1/committee/cases/${caseId}/conflict-declaration`)
        .set(auth(deciderSubject, ['COM_CERT']))
        .send({ hasConflict: true, statement: 'Sukob u toku izdavanja certifikata.' }),
    ]);
    expect(coiRace.every((response) => response.status < 500)).toBe(true);
    let racedState = await assertCertificateInvariant();
    const coiIssue = coiRace[0];
    const coiConflict = coiRace[1];
    if (coiIssue.status === 201) {
      expect(racedState.active).toHaveLength(1);
      expect(racedState.current.phase).toBe('ISSUED');
      expect(racedState.liveDecisions).toHaveLength(1);
      expect(
        await requirePrisma().auditEvent.count({
          where: { tenantId, eventType: 'PERSONNEL_CERTIFICATE_ISSUED' },
        }),
      ).toBe(1);
    } else {
      expect(racedState.active).toHaveLength(0);
    }
    if (coiConflict.status === 201) {
      expect(
        racedState.ballots.some(
          (vote) => vote.voidedAt !== null && vote.voidReason === 'CONFLICT_DECLARED',
        ),
      ).toBe(true);
      expect(
        await requirePrisma().auditEvent.count({
          where: { tenantId, eventType: 'CONFLICT_SIGNED', resourceId: caseId },
        }),
      ).toBeGreaterThan(0);
    }
    if (coiConflict.status === 201 && coiIssue.status !== 201) {
      const setAside = racedState.decisions.find((row) => row.id === issuanceDecisionId);
      expect(setAside?.supersededAt).not.toBeNull();
      expect(setAside?.supersedeReason).toBe('CONFLICT_DECLARED');
      expect(racedState.quorum).toEqual({ grants: 0, denies: 0 });
      expect(voteResult({ grants: 0, denies: 0, quorum: 1 })).toBe('PENDING');
      expect(racedState.current.phase).toBe('COMMITTEE');
    }
    if (racedState.active.length === 0) {
      await request(httpServer(app))
        .post(`/v1/committee/cases/${caseId}/conflict-declaration`)
        .set(auth(issuerSubject, ['COM_CERT', 'QUALITY_MANAGER']))
        .send({
          hasConflict: false,
          statement: 'Sukob glasača tokom izdavanja je uklonjen.',
          subjectUserId: deciderId,
        })
        .expect(201);
      const restoredVote = await request(httpServer(app))
        .post(`/v1/committee/cases/${caseId}/votes`)
        .set(auth(deciderSubject, ['COM_CERT']))
        .send({ ballot: 'GRANT', reasoning: 'Kvorum nakon utrke sa sukobom.' })
        .expect(201);
      expect((restoredVote.body as { phase: string }).phase).toBe('APPROVED_FOR_ISSUANCE');
      const restoredDecision = await requirePrisma().examCertificationDecision.findFirst({
        where: { tenantId, resultId: passResultId, supersededAt: null },
      });
      if (!restoredDecision) {
        throw new Error('Decision was not restored after the conflict race.');
      }
      issuanceDecisionId = restoredDecision.id;
    }
    const openAfterConflict = await requirePrisma().certificationBodyReview.findFirst({
      where: { tenantId, caseId, status: 'OPEN' },
    });
    if (openAfterConflict) {
      await request(httpServer(app))
        .post(`/v1/committee/cases/${caseId}/propose`)
        .set(auth(trainerSubject, ['COM_CERT']))
        .send({
          reviewAction: 'DECIDE',
          reviewId: openAfterConflict.id,
          outcome: 'RECOMPOSE_WITHOUT_WITHDRAWAL',
          rationale: 'Pregled otvoren u utrci mora biti zatvoren prije novog kvoruma.',
        })
        .expect(201);
    }
    await request(httpServer(app))
      .post(`/v1/staff/schemes/${versionId}/decision-makers`)
      .set(auth(approverSubject, ['COM_TECH']))
      .send({
        userId: issuerId,
        kind: 'SCHEME_COMMITTEE_OVERSIGHT',
        competenceNote: 'Nadzor za provjeru četiri oka pri izdavanju.',
        documentRef: 'Ovlaštenje nadzora ne zamjenjuje tuđu stranu.',
        authorisedFrom: '2020-01-01T00:00:00.000Z',
        authorisedUntil: '2030-01-01T00:00:00.000Z',
      })
      .expect(201);
    const compositionProposal = await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/propose`)
      .set(auth(trainerSubject, ['COM_CERT']))
      .send({
        reason: 'Sastav se mijenja uporedo sa izdavanjem.',
        requestedSide: 'CHAIR',
      });
    if (compositionProposal.status === 201) {
      const compositionRequestId = (compositionProposal.body as { requestId: string }).requestId;
      const compositionAuditsBefore = await requirePrisma().auditEvent.count({
        where: { tenantId, eventType: 'COMMITTEE_COMPOSITION_CHANGED', resourceId: caseId },
      });
      const compositionRace = await Promise.all([
        request(httpServer(app))
          .post('/v1/committee/certificates')
          .set(auth(issuerSubject, ['COM_CERT']))
          .send({
            decisionId: issuanceDecisionId,
            holderDisplayName: 'Krivo Ime',
            registryConsent: true,
          }),
        request(httpServer(app))
          .post(`/v1/committee/cases/${caseId}/propose`)
          .set(auth(issuerSubject, ['COM_CERT', 'QUALITY_MANAGER']))
          .send({
            requestId: compositionRequestId,
            grounds: 'Sastav se mijenja uporedo sa izdavanjem.',
            recordedCoiReview: 'Sukob nadzora je već zabilježen.',
            competenceReview: 'Izdavanje i izmjena sastava ne smiju se pomiješati.',
            priorVoteImpact: 'Samo stanje koje je još važeće smije dati certifikat.',
          }),
      ]);
      expect(compositionRace.every((response) => response.status < 500)).toBe(true);
      racedState = await assertCertificateInvariant();
      const compositionRequest = await requirePrisma().committeeCompositionRequest.findFirst({
        where: { tenantId, id: compositionRequestId },
      });
      const compositionIssue = compositionRace[0];
      const compositionApproval = compositionRace[1];
      if (compositionApproval.status === 201) {
        expect(compositionRequest?.status).toBe('APPLIED');
        expect(compositionRequest?.proposedByUserId).toBe(trainerId);
        expect(compositionRequest?.approvedByUserId).toBe(issuerId);
        expect(compositionRequest?.approvedByUserId).not.toBe(compositionRequest?.proposedByUserId);
        expect(
          await requirePrisma().auditEvent.count({
            where: { tenantId, eventType: 'COMMITTEE_COMPOSITION_CHANGED', resourceId: caseId },
          }),
        ).toBeGreaterThan(compositionAuditsBefore);
        if (compositionIssue.status !== 201) {
          expect(racedState.active).toHaveLength(0);
          expect(racedState.quorum).toEqual({ grants: 0, denies: 0 });
          expect(voteResult({ ...racedState.quorum, quorum: 1 })).toBe('PENDING');
          expect(
            racedState.decisions.find((row) => row.id === issuanceDecisionId)?.supersedeReason,
          ).toBe('COMPOSITION_CHANGED');
        }
      } else {
        expect(compositionRequest?.status).toBe('PENDING');
        expect(compositionRequest?.approvedByUserId).toBeNull();
      }
      if (compositionIssue.status === 201) {
        expect(racedState.active).toHaveLength(1);
        expect(racedState.current.phase).toBe('ISSUED');
        expect(racedState.liveDecisions[0]?.supersededAt).toBeNull();
        expect(
          await requirePrisma().auditEvent.count({
            where: { tenantId, eventType: 'PERSONNEL_CERTIFICATE_ISSUED' },
          }),
        ).toBeGreaterThan(0);
      }
      if (racedState.active.length === 0 && racedState.current.phase !== 'APPROVED_FOR_ISSUANCE') {
        await request(httpServer(app))
          .post(`/v1/committee/cases/${caseId}/conflict-declaration`)
          .set(auth(issuerSubject, ['COM_CERT', 'QUALITY_MANAGER']))
          .send({
            hasConflict: false,
            statement: 'Sukob nadzora je uklonjen radi nove potvrde.',
            subjectUserId: qualityId,
          })
          .expect(201);
        await request(httpServer(app))
          .post(`/v1/committee/cases/${caseId}/confirm`)
          .set(auth(qualitySubject, ['COM_CERT', 'QUALITY_MANAGER']))
          .send({ memberUserId: deciderId })
          .expect(201);
        await request(httpServer(app))
          .post(`/v1/committee/cases/${caseId}/votes`)
          .set(auth(deciderSubject, ['COM_CERT']))
          .send({ ballot: 'GRANT', reasoning: 'Kvorum nakon utrke sa sastavom.' })
          .expect(201);
        await request(httpServer(app))
          .post(`/v1/committee/cases/${caseId}/conflict-declaration`)
          .set(auth(qualitySubject, ['COM_CERT', 'QUALITY_MANAGER']))
          .send({ hasConflict: true, statement: 'Nadzor ponovo prijavljuje sukob nakon kvoruma.' })
          .expect(201);
        const restoredDecision = await requirePrisma().examCertificationDecision.findFirst({
          where: { tenantId, resultId: passResultId, supersededAt: null },
        });
        if (!restoredDecision) {
          throw new Error('Decision was not restored after the composition race.');
        }
        issuanceDecisionId = restoredDecision.id;
      }
    }
    racedState = await assertCertificateInvariant();
    expect(
      racedState.decisions.filter((row) => row.supersededAt === null).length,
    ).toBeLessThanOrEqual(1);
    const existingCertificate = racedState.credentials.find(
      (credential) => credential.lifecycle === 'ACTIVE',
    );
    const issued = existingCertificate
      ? {
          body: {
            credentialId: existingCertificate.id,
            certificateNumber: existingCertificate.publicUid,
            status: 'VALID',
            attendanceLinked: false,
          },
        }
      : await request(httpServer(app))
          .post('/v1/committee/certificates')
          .set(auth(issuerSubject, ['COM_CERT']))
          .send({
            decisionId: issuanceDecisionId,
            holderDisplayName: 'Krivo Ime',
            registryConsent: true,
          })
          .expect(201);
    if (!existingCertificate) {
      expect(
        await requirePrisma().auditEvent.count({
          where: { tenantId, eventType: 'PERSONNEL_CERTIFICATE_ISSUED' },
        }),
      ).toBeGreaterThan(0);
    }
    const issuedBody = issued.body as {
      credentialId: string;
      certificateNumber: string;
      status: string;
      attendanceLinked: boolean;
    };
    expect(issuedBody.status).toBe('VALID');
    expect(issuedBody.certificateNumber).toMatch(/^CON-\d{4}-\d{4}$/);
    expect(issuedBody.attendanceLinked).toBe(false);
    expect(await requirePrisma().credential.count({ where: { tenantId } })).toBe(1);
    const certificateBeforeForeign = await requirePrisma().credential.findFirst({
      where: { tenantId, id: issuedBody.credentialId },
      select: { lifecycle: true },
    });
    const foreignCertificate = [
      request(httpServer(app))
        .post(`/v1/committee/certificates/${issuedBody.credentialId}/status`)
        .set(outsider(['COM_CERT']))
        .send({ toStatus: 'SUSPENDED', reason: 'Drugi zakup ne mijenja status.' }),
      request(httpServer(app))
        .post(`/v1/committee/certificates/${issuedBody.credentialId}/amf-proposals`)
        .set(outsider(['COM_CERT']))
        .send({ reason: 'Drugi zakup ne predlaže suspenziju.' }),
      request(httpServer(app))
        .post('/v1/committee/annual-fees/non-payment')
        .set(outsider(['COM_CERT']))
        .send({
          credentialId: issuedBody.credentialId,
          year: 2027,
          reason: 'Drugi zakup ne otvara naknadu.',
        }),
      request(httpServer(app))
        .post('/v1/committee/annual-fees/recertification')
        .set(outsider(['COM_CERT']))
        .send({ credentialId: issuedBody.credentialId, year: 2027 }),
      request(httpServer(app))
        .get(`/v1/me/certificates/${issuedBody.credentialId}/pdf`)
        .set(outsider(['USR_CAND'])),
      request(httpServer(app))
        .get(`/v1/me/certificates/${issuedBody.credentialId}/reminders`)
        .set(outsider(['USR_CAND'])),
      request(httpServer(app))
        .post(`/v1/committee/cases/${caseId}/propose`)
        .set(outsider(['COM_CERT']))
        .send({
          reviewAction: 'OPEN',
          statement: 'Drugi zakup ne otvara pregled izdatog certifikata.',
        }),
    ];
    for (const foreignCall of foreignCertificate) {
      expect((await foreignCall).status).toBe(404);
    }
    expect(
      (
        await requirePrisma().credential.findFirst({
          where: { tenantId, id: issuedBody.credentialId },
          select: { lifecycle: true },
        })
      )?.lifecycle,
    ).toBe(certificateBeforeForeign?.lifecycle);
    await request(httpServer(app))
      .post('/v1/committee/certificates')
      .set(auth(deciderSubject, ['COM_CERT']))
      .send({
        decisionId: issuanceDecisionId,
        holderDisplayName: 'Demo Kandidat',
        registryConsent: true,
      })
      .expect(400);
    await request(httpServer(app))
      .get('/v1/public/certificates')
      .query({ name: 'Demo' })
      .expect(401);
    await request(httpServer(app))
      .get('/v1/public/certificates')
      .query({ name: 'De' })
      .set(auth(candidateSubject, ['USR_CAND']))
      .expect(400);
    const directory = await request(httpServer(app))
      .get('/v1/public/certificates')
      .query({ name: 'Demo' })
      .set(auth(candidateSubject, ['USR_CAND']))
      .expect(200);
    expect(JSON.stringify(directory.body)).toContain('Demo Kandidat');
    expect(JSON.stringify(directory.body)).not.toContain('Krivo Ime');
    expect(JSON.stringify(directory.body)).not.toContain('email');
    const hiddenCertificate = {
      status: 'INVALID',
      documentType: null,
      issuedAt: null,
      holderName: null,
    };
    const bySequential = await request(httpServer(app))
      .get(`/v1/public/certificates/${issuedBody.certificateNumber}`)
      .expect(200);
    expect(bySequential.body).toEqual(hiddenCertificate);
    expect(JSON.stringify(bySequential.body)).not.toContain('Demo Kandidat');
    const storedCertificate = await requirePrisma().credential.findFirst({
      where: { id: issuedBody.credentialId },
      select: { qrVerifyToken: true },
    });
    if (!storedCertificate?.qrVerifyToken) {
      throw new Error('Verification token was not stored.');
    }
    expect(storedCertificate.qrVerifyToken).not.toBe(issuedBody.certificateNumber);
    const byToken = await request(httpServer(app))
      .get(`/v1/public/certificates/${storedCertificate.qrVerifyToken}`)
      .expect(200);
    expect(byToken.body).toEqual(
      expect.objectContaining({
        status: 'VALID',
        documentType: 'PERSONNEL_CERTIFICATE',
        holderName: 'Demo Kandidat',
      }),
    );
    expect(JSON.stringify(byToken.body)).not.toContain(issuedBody.certificateNumber);
    expect(JSON.stringify(byToken.body)).not.toContain('email');
    expect(JSON.stringify(byToken.body)).not.toContain('Krivo Ime');
    const unknownToken = await request(httpServer(app))
      .get('/v1/public/certificates/not-a-real-token')
      .expect(200);
    expect(unknownToken.body).toEqual(hiddenCertificate);
    const program = await requirePrisma().course.findFirst({
      where: { tenantId, title: 'Obuka' },
    });
    if (!program) {
      throw new Error('Course was not stored.');
    }
    const previousCatalogTenants = process.env['PUBLIC_CATALOG_TENANT_IDS'];
    const otherOrganization = 'ffffffff-ffff-4fff-8fff-ffffffffffff';
    try {
      process.env['PUBLIC_CATALOG_TENANT_IDS'] = tenantId;
      const hiddenCatalog = await request(httpServer(app))
        .get('/v1/public/catalog/courses')
        .expect(200);
      expect(JSON.stringify(hiddenCatalog.body)).not.toContain(program.id);
      await requirePrisma().course.update({
        where: { tenantId_id: { tenantId, id: program.id } },
        data: { lifecycle: 'PUBLISHED' },
      });
      delete process.env['PUBLIC_CATALOG_TENANT_IDS'];
      const closed = await request(httpServer(app)).get('/v1/public/catalog/courses').expect(200);
      expect(closed.body).toEqual({ courses: [] });
      await request(httpServer(app)).get(`/v1/public/catalog/courses/${program.id}`).expect(404);
      process.env['PUBLIC_CATALOG_TENANT_IDS'] = otherOrganization;
      const foreign = await request(httpServer(app)).get('/v1/public/catalog/courses').expect(200);
      expect(JSON.stringify(foreign.body)).not.toContain(program.id);
      await request(httpServer(app)).get(`/v1/public/catalog/courses/${program.id}`).expect(404);
      process.env['PUBLIC_CATALOG_TENANT_IDS'] = tenantId;
      const published = await request(httpServer(app))
        .get('/v1/public/catalog/courses')
        .expect(200);
      const publishedBody = JSON.stringify(published.body);
      expect(publishedBody).toContain('Obuka');
      expect(publishedBody).toContain(program.id);
      expect(publishedBody).not.toContain(tenantId);
      expect(publishedBody).not.toContain('authorUserId');
      expect(publishedBody).not.toContain('priceAmount');
      expect(publishedBody).not.toContain('enrolment');
      const detail = await request(httpServer(app))
        .get(`/v1/public/catalog/courses/${program.id}`)
        .expect(200);
      expect(detail.body).toEqual(
        expect.objectContaining({ courseId: program.id, title: 'Obuka' }),
      );
      await requirePrisma().course.update({
        where: { tenantId_id: { tenantId, id: program.id } },
        data: { lifecycle: 'DRAFT' },
      });
      await request(httpServer(app)).get(`/v1/public/catalog/courses/${program.id}`).expect(404);
      await request(httpServer(app))
        .get('/v1/public/catalog/courses')
        .query({ tenantId })
        .expect(400);
    } finally {
      if (previousCatalogTenants === undefined) {
        delete process.env['PUBLIC_CATALOG_TENANT_IDS'];
      } else {
        process.env['PUBLIC_CATALOG_TENANT_IDS'] = previousCatalogTenants;
      }
    }
    const wallet = await request(httpServer(app))
      .get('/v1/me/certificates')
      .set(auth(candidateSubject, ['USR_CAND']))
      .expect(200);
    expect(JSON.stringify(wallet.body)).toContain(issuedBody.certificateNumber);
    const pdf = await request(httpServer(app))
      .get(`/v1/me/certificates/${issuedBody.credentialId}/pdf`)
      .set(auth(candidateSubject, ['USR_CAND']))
      .expect(200);
    expect(pdf.headers['content-type']).toContain('application/pdf');
    const pdfBytes = Buffer.isBuffer(pdf.body) ? pdf.body : Buffer.from([]);
    expect(pdfBytes.subarray(0, 4).toString('utf8')).toBe('%PDF');
    const badge = await request(httpServer(app))
      .get(`/v1/me/certificates/${issuedBody.credentialId}/credential`)
      .set(auth(candidateSubject, ['USR_CAND']))
      .expect(200);
    expect((badge.body as { jwt: string }).jwt.split('.')).toHaveLength(3);
    const proposal = await request(httpServer(app))
      .post(`/v1/committee/certificates/${issuedBody.credentialId}/amf-proposals`)
      .set(auth(deciderSubject, ['COM_CERT']))
      .send({ reason: 'Članarina nije plaćena.' })
      .expect(201);
    expect((proposal.body as { suspended: boolean }).suspended).toBe(false);
    const stillValid = await requirePrisma().credential.findFirst({
      where: { tenantId, id: issuedBody.credentialId },
    });
    expect(stillValid?.lifecycle).toBe('ACTIVE');
    const included = await request(httpServer(app))
      .get('/v1/me/annual-fees')
      .set(auth(candidateSubject, ['USR_CAND']))
      .expect(200);
    expect(included.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: 'FIRST_YEAR', status: 'INCLUDED', amountMinor: 9000 }),
      ]),
    );
    await request(httpServer(app))
      .post(`/v1/staff/schemes/${versionId}/annual-fee`)
      .set(auth(candidateSubject, ['USR_CAND']))
      .send({
        annualAmountMinor: 12000,
        currency: 'EUR',
        firstYearIncluded: true,
        recertificationSeparate: true,
      })
      .expect(403);
    await request(httpServer(app))
      .post(`/v1/staff/schemes/${versionId}/annual-fee`)
      .set(auth(sysadminSubject, ['STAFF_SYSADM']))
      .send({
        annualAmountMinor: 12000,
        currency: 'EUR',
        firstYearIncluded: true,
        recertificationSeparate: true,
      })
      .expect(403);
    await request(httpServer(app))
      .post(`/v1/staff/schemes/${versionId}/annual-fee`)
      .set(auth(approverSubject, ['COM_TECH']))
      .send({
        annualAmountMinor: 12000,
        currency: 'EUR',
        firstYearIncluded: true,
        recertificationSeparate: true,
      })
      .expect(201);
    const priced = await request(httpServer(app))
      .get(`/v1/staff/schemes/${versionId}/annual-fee`)
      .set(auth(approverSubject, ['COM_TECH']))
      .expect(200);
    expect((priced.body as { annualAmountMinor: number }).annualAmountMinor).toBe(12000);
    await request(httpServer(app))
      .post('/v1/committee/annual-fees/recertification')
      .set(auth(candidateSubject, ['USR_CAND']))
      .send({ credentialId: issuedBody.credentialId, year: 2027 })
      .expect(403);
    const recertFee = await request(httpServer(app))
      .post('/v1/committee/annual-fees/recertification')
      .set(auth(deciderSubject, ['COM_CERT']))
      .send({ credentialId: issuedBody.credentialId, year: 2027 })
      .expect(201);
    expect(recertFee.body).toMatchObject({
      kind: 'RECERTIFICATION',
      status: 'DUE',
      amountMinor: 12000,
      withdrawn: false,
      lifecycle: 'ACTIVE',
    });
    await request(httpServer(app))
      .post('/v1/committee/annual-fees/non-payment')
      .set(auth(sysadminSubject, ['STAFF_SYSADM']))
      .send({
        credentialId: issuedBody.credentialId,
        year: 2027,
        reason: 'Naknada nije plaćena.',
      })
      .expect(403);
    const openedFee = await request(httpServer(app))
      .post('/v1/committee/annual-fees/non-payment')
      .set(auth(deciderSubject, ['COM_CERT']))
      .send({
        credentialId: issuedBody.credentialId,
        year: 2027,
        reason: 'Naknada nije plaćena.',
      })
      .expect(201);
    expect(openedFee.body).toMatchObject({
      status: 'OPEN_CASE',
      withdrawn: false,
      lifecycle: 'ACTIVE',
    });
    const afterFee = await requirePrisma().credential.findFirst({
      where: { tenantId, id: issuedBody.credentialId },
    });
    expect(afterFee?.lifecycle).toBe('ACTIVE');
    await request(httpServer(app))
      .post('/v1/staff/notices/reminders')
      .set(auth(candidateSubject, ['USR_CAND']))
      .expect(403);
    await request(httpServer(app))
      .post('/v1/staff/notices/reminders')
      .set(auth(approverSubject, ['EXAMINER']))
      .expect(403);
    const reminded = await request(httpServer(app))
      .post('/v1/staff/notices/reminders')
      .set(auth(approverSubject, ['COM_TECH']))
      .expect(201);
    const jobs = (
      reminded.body as { jobs: { id: string; channel: string; kind: string; status: string }[] }
    ).jobs;
    expect(jobs.some((job) => job.kind === 'FEE' && job.status === 'SENT')).toBe(true);
    const emailJob = jobs.find((job) => job.channel === 'EMAIL' && job.kind === 'FEE');
    expect(emailJob).toBeDefined();
    await request(httpServer(app))
      .post(`/v1/staff/notices/${emailJob?.id ?? ''}/bounce`)
      .set(auth(candidateSubject, ['USR_CAND']))
      .expect(403);
    await request(httpServer(app))
      .post(`/v1/staff/notices/${emailJob?.id ?? ''}/bounce`)
      .set(auth(approverSubject, ['COM_TECH']))
      .expect(201);
    const inbox = await request(httpServer(app))
      .get('/v1/me/notices')
      .set(auth(candidateSubject, ['USR_CAND']))
      .expect(200);
    expect(JSON.stringify(inbox.body)).toContain('Godišnja naknada');
    await request(httpServer(app))
      .get('/v1/me/notices')
      .set(auth(deciderSubject, ['COM_CERT']))
      .expect(403);
    const suspended = await request(httpServer(app))
      .post(`/v1/committee/certificates/${issuedBody.credentialId}/status`)
      .set(auth(deciderSubject, ['COM_CERT']))
      .send({ toStatus: 'SUSPENDED', reason: 'Potvrda prijedloga suspenzije.' })
      .expect(201);
    expect((suspended.body as { publicStatus: string }).publicStatus).toBe('SUSPENDED');
    const reminders = await request(httpServer(app))
      .get(`/v1/me/certificates/${issuedBody.credentialId}/reminders`)
      .set(auth(candidateSubject, ['USR_CAND']))
      .expect(200);
    expect(reminders.body).toEqual(
      expect.arrayContaining([expect.objectContaining({ kind: 'NINETY_DAYS' })]),
    );

    await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/conflict-declaration`)
      .set(auth(issuerSubject, ['COM_CERT', 'QUALITY_MANAGER']))
      .send({
        hasConflict: false,
        statement: 'Sukob nadzora je uklonjen nakon provjere.',
        subjectUserId: qualityId,
      })
      .expect(201);
    await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/conflict-declaration`)
      .set(auth(deciderSubject, ['COM_CERT']))
      .send({ hasConflict: true, statement: 'Sukob nakon izdavanja certifikata.' })
      .expect(201);
    const retained = await requirePrisma().examCertificationDecision.findFirst({
      where: { tenantId, id: issuanceDecisionId },
    });
    expect(retained?.supersededAt).toBeNull();
    const pendingIssuedChange = await requirePrisma().committeeCompositionRequest.findFirst({
      where: { tenantId, caseId, status: 'PENDING' },
    });
    const qualityIssuedChange = pendingIssuedChange
      ? null
      : await request(httpServer(app))
          .post(`/v1/committee/cases/${caseId}/propose`)
          .set(auth(qualitySubject, ['COM_CERT', 'QUALITY_MANAGER']))
          .send({ reason: 'Sastav se mijenja nakon izdatog certifikata.' });
    const issuedChange = pendingIssuedChange
      ? { body: { requestId: pendingIssuedChange.id } }
      : qualityIssuedChange?.status === 201
        ? qualityIssuedChange
        : await request(httpServer(app))
            .post(`/v1/committee/cases/${caseId}/propose`)
            .set(auth(trainerSubject, ['COM_CERT']))
            .send({
              reason: 'Sastav se mijenja nakon izdatog certifikata.',
              requestedSide: 'CHAIR',
            })
            .expect(201);
    const blockedChange = await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/propose`)
      .set(auth(trainerSubject, ['COM_CERT']))
      .send({
        requestId: (issuedChange.body as { requestId: string }).requestId,
        grounds: 'Certifikat je izdat pa sastav ne mijenjam automatski.',
        recordedCoiReview: 'Sukob člana je zabilježen nakon izdavanja.',
        competenceReview: 'Kompetentnost ostalih članova ostaje važeća.',
        priorVoteImpact: 'Odluka i certifikat ostaju do odluke tijela.',
      })
      .expect(400);
    expect((blockedChange.body as { message: string }).message).toBe('ISSUED_REVIEW_REQUIRED');
    const openedReview = await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/propose`)
      .set(auth(qualitySubject, ['COM_CERT', 'QUALITY_MANAGER']))
      .send({
        reviewAction: 'OPEN',
        statement: 'Formalni pregled sastava nakon izdatog certifikata.',
      })
      .expect(201);
    await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/propose`)
      .set(auth(qualitySubject, ['COM_CERT', 'QUALITY_MANAGER']))
      .send({
        reviewAction: 'DECIDE',
        reviewId: (openedReview.body as { reviewId: string }).reviewId,
        outcome: 'SUSTAIN',
        rationale: 'Ista osoba ne smije odlučiti o pregledu koji je otvorila.',
      })
      .expect(403);
    const issuerConflict = await requirePrisma().committeeConflictDeclaration.findFirst({
      where: { tenantId, caseId, userId: issuerId },
      orderBy: { signedAt: 'desc' },
    });
    if (issuerConflict?.hasConflict) {
      await request(httpServer(app))
        .post(`/v1/committee/cases/${caseId}/conflict-declaration`)
        .set(auth(qualitySubject, ['COM_CERT', 'QUALITY_MANAGER']))
        .send({
          hasConflict: false,
          statement: 'Sukob izdavaoca je uklonjen prije iste strane pregleda.',
          subjectUserId: issuerId,
        })
        .expect(201);
    }
    const openedReviewId = (openedReview.body as { reviewId: string }).reviewId;
    await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/propose`)
      .set(auth(issuerSubject, ['COM_CERT', 'QUALITY_MANAGER']))
      .send({
        reviewAction: 'DECIDE',
        reviewId: openedReviewId,
        outcome: 'SUSTAIN',
        rationale: 'Ista strana nadzora ne smije odlučiti pregled koji je otvorila.',
      })
      .expect(403);
    const sameSideReview = await requirePrisma().certificationBodyReview.findFirst({
      where: { tenantId, id: openedReviewId },
    });
    expect(sameSideReview?.status).toBe('OPEN');
    expect(sameSideReview?.openedSide).toBe('OVERSIGHT');
    expect(sameSideReview?.decidedByUserId).toBeNull();
    const decidedReview = await request(httpServer(app))
      .post(`/v1/committee/cases/${caseId}/propose`)
      .set(auth(trainerSubject, ['COM_CERT']))
      .send({
        reviewAction: 'DECIDE',
        reviewId: openedReviewId,
        outcome: 'SUSTAIN',
        rationale: 'Certifikat ostaje. Odluka se ne briše i ne povlači automatski.',
      })
      .expect(201);
    expect((decidedReview.body as { decisionRetained: string | null }).decisionRetained).toBe(
      issuanceDecisionId,
    );
    const afterReview = await requirePrisma().credential.findFirst({
      where: { tenantId, id: issuedBody.credentialId },
    });
    expect(afterReview?.lifecycle).toBe('SUSPENDED');
    expect(
      await requirePrisma().examCertificationDecision.count({
        where: { tenantId, id: issuanceDecisionId },
      }),
    ).toBe(1);

    const events = await requirePrisma().auditEvent.findMany({
      where: { tenantId },
      select: { eventType: true, metadata: true },
    });
    const types = new Set(events.map((event) => event.eventType));
    expect(types.has('EXAM_ITEM_APPROVED')).toBe(true);
    expect(types.has('EXAM_CUT_SCORE_APPROVED')).toBe(true);
    expect(types.has('EXAM_BLUEPRINT_APPROVED')).toBe(true);
    expect(types.has('EXAM_SUBMITTED')).toBe(true);
    expect(types.has('EXAM_SCORED')).toBe(true);
    expect(types.has('EXAM_DECISION_RECORDED')).toBe(true);
    expect(types.has('EXAM_IDENTITY_CONFIRMED')).toBe(true);
    expect(types.has('AI_USE_RECORDED')).toBe(true);
    expect(types.has('CONFLICT_SIGNED')).toBe(true);
    expect(types.has('COMMITTEE_COMPOSITION_CHANGED')).toBe(true);
    expect(types.has('COMMITTEE_COMPOSITION_PROPOSED')).toBe(true);
    expect(types.has('SCHEME_COMMITTEE_AUTHORITY_GRANTED')).toBe(true);
    expect(types.has('COMMITTEE_COMPOSITION_REVIEW_OPENED')).toBe(true);
    expect(types.has('COMMITTEE_COMPOSITION_REVIEW_DECIDED')).toBe(true);
    expect(types.has('COMMITTEE_VOTE_RECORDED')).toBe(true);
    const compositionReasons = events
      .filter((event) => event.eventType === 'COMMITTEE_COMPOSITION_CHANGED')
      .map((event) =>
        event.metadata !== null &&
        typeof event.metadata === 'object' &&
        'reason' in event.metadata &&
        typeof event.metadata.reason === 'string'
          ? event.metadata.reason
          : '',
      );
    expect(compositionReasons).toContain('Sukob je evidentiran u izjavi člana.');
    const conflictReasons = events
      .filter((event) => event.eventType === 'CONFLICT_SIGNED')
      .map((event) =>
        event.metadata !== null &&
        typeof event.metadata === 'object' &&
        'reason' in event.metadata &&
        typeof event.metadata.reason === 'string'
          ? event.metadata.reason
          : '',
      );
    expect(conflictReasons).toContain('conflict');
    expect(conflictReasons).toContain('conflict-cleared');
    expect(types.has('FEE_OBLIGATION_OPENED')).toBe(true);
    expect(types.has('NOTICE_RESULT')).toBe(true);

    const statement = await requirePrisma().learningActivityRecord.findFirst({
      where: { tenantId, objectId: passSessionId },
    });
    expect(JSON.stringify(statement?.rawStatement)).not.toContain(STEM);
    const exposed = await requirePrisma().schemeExamItem.findFirst({
      where: { tenantId, id: itemA },
    });
    expect(exposed?.exposureCount).toBe(3);
  });
});
