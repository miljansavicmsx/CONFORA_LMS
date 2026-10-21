import { type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { Server } from 'node:http';
import { randomUUID } from 'node:crypto';
import { execSync } from 'node:child_process';
import { PrismaClient } from '@confora/database';
import { ZodValidationPipe } from 'nestjs-zod';

import { AppModule } from '../src/app.module';
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
      .expect(400);
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
    const issued = await request(httpServer(app))
      .post('/v1/committee/certificates')
      .set(auth(deciderSubject, ['COM_CERT']))
      .send({ decisionId, holderDisplayName: 'Krivo Ime', registryConsent: true })
      .expect(201);
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
    expect(await requirePrisma().attendanceCredentialLink.count({ where: { tenantId } })).toBe(0);
    await request(httpServer(app))
      .post('/v1/committee/certificates')
      .set(auth(deciderSubject, ['COM_CERT']))
      .send({ decisionId, holderDisplayName: 'Demo Kandidat', registryConsent: true })
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
    const lookedUp = await request(httpServer(app))
      .get(`/v1/public/certificates/${issuedBody.certificateNumber}`)
      .expect(200);
    expect((lookedUp.body as { status: string; scheme: string }).status).toBe('VALID');
    expect(JSON.stringify(lookedUp.body)).toContain('Demo Kandidat');
    expect(JSON.stringify(lookedUp.body)).not.toContain('Krivo Ime');
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
    const result = await requirePrisma().certificationExamResult.findFirst({
      where: { tenantId, id: passResultId },
    });
    expect(result?.provisional).toBe(false);

    const events = await requirePrisma().auditEvent.findMany({
      where: { tenantId },
      select: { eventType: true },
    });
    const types = new Set(events.map((event) => event.eventType));
    expect(types.has('EXAM_ITEM_APPROVED')).toBe(true);
    expect(types.has('EXAM_CUT_SCORE_APPROVED')).toBe(true);
    expect(types.has('EXAM_BLUEPRINT_APPROVED')).toBe(true);
    expect(types.has('EXAM_SUBMITTED')).toBe(true);
    expect(types.has('EXAM_SCORED')).toBe(true);
    expect(types.has('EXAM_DECISION_RECORDED')).toBe(true);
    expect(types.has('EXAM_IDENTITY_CONFIRMED')).toBe(true);

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
