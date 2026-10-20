/**
 * Local certification-exam demo only.
 * Refuses to run unless EXAM_DEMO_SEED=1 and NODE_ENV is not production.
 * Not part of migrations. Does not issue a credential.
 */
import { PrismaClient } from '@prisma/client';

if (process.env.EXAM_DEMO_SEED !== '1' || process.env.NODE_ENV === 'production') {
  console.error('Refusing exam demo seed. Set EXAM_DEMO_SEED=1 outside production.');
  process.exit(1);
}

const prisma = new PrismaClient();
const tenantId = '0a0a0a0a-0a0a-4a0a-8a0a-0a0a0a0a0a0a';
const authorId = '1a1a1a1a-1a1a-4a1a-8a1a-1a1a1a1a1a1a';
const approverId = '1b1b1b1b-1b1b-4b1b-8b1b-1b1b1b1b1b1b';
const candidateId = '1c1c1c1c-1c1c-4c1c-8c1c-1c1c1c1c1c1c';
const invigilatorId = '1d1d1d1d-1d1d-4d1d-8d1d-1d1d1d1d1d1d';
const schemeId = '2a2a2a2a-2a2a-4a2a-8a2a-2a2a2a2a2a2a';
const versionId = '2b2b2b2b-2b2b-4b2b-8b2b-2b2b2b2b2b2b';
const itemA = '3a3a3a3a-3a3a-4a3a-8a3a-3a3a3a3a3a3a';
const itemB = '3b3b3b3b-3b3b-4b3b-8b3b-3b3b3b3b3b3b';
const blueprintId = '4a4a4a4a-4a4a-4a4a-8a4a-4a4a4a4a4a4a';
const domainA = '4b4b4b4b-4b4b-4b4b-8b4b-4b4b4b4b4b4b';
const domainB = '4c4c4c4c-4c4c-4c4c-8c4c-4c4c4c4c4c4c';
const recordId = '5a5a5a5a-5a5a-4a5a-8a5a-5a5a5a5a5a5a';
const formId = '6a6a6a6a-6a6a-4a6a-8a6a-6a6a6a6a6a6a';
const applicationId = '7a7a7a7a-7a7a-4a7a-8a7a-7a7a7a7a7a7a';
const sessionId = '8a8a8a8a-8a8a-4a8a-8a8a-8a8a8a8a8a8a';

async function user(id: string, email: string): Promise<void> {
  await prisma.user.upsert({
    where: { tenantId_id: { tenantId, id } },
    create: { id, tenantId, email, isActive: true },
    update: { isActive: true },
  });
}

async function item(id: string, domainCode: string, stem: string): Promise<void> {
  await prisma.schemeExamItem.upsert({
    where: { tenantId_id: { tenantId, id } },
    create: {
      id,
      tenantId,
      schemeId,
      familyKey: id,
      version: 1,
      stem,
      itemType: 'SINGLE_CHOICE',
      status: 'APPROVED',
      authorUserId: authorId,
      domainCode,
      exposureCount: 0,
    },
    update: { status: 'APPROVED', stem },
  });
  await prisma.schemeExamItemChoice.upsert({
    where: { id: `${id.slice(0, 8)}-0000-4000-8000-00000000000a` },
    create: {
      id: `${id.slice(0, 8)}-0000-4000-8000-00000000000a`,
      tenantId,
      itemId: id,
      choiceKey: 'A',
      text: 'Tačan odgovor za lokalni demo.',
      isCorrect: true,
    },
    update: { isCorrect: true },
  });
  await prisma.schemeExamItemChoice.upsert({
    where: { id: `${id.slice(0, 8)}-0000-4000-8000-00000000000b` },
    create: {
      id: `${id.slice(0, 8)}-0000-4000-8000-00000000000b`,
      tenantId,
      itemId: id,
      choiceKey: 'B',
      text: 'Netačan odgovor za lokalni demo.',
      isCorrect: false,
    },
    update: { isCorrect: false },
  });
}

async function main(): Promise<void> {
  await prisma.tenant.upsert({
    where: { id: tenantId },
    create: { id: tenantId, isActive: true },
    update: { isActive: true },
  });
  await user(authorId, 'exam-author@demo.confora.test');
  await user(approverId, 'exam-approver@demo.confora.test');
  await user(candidateId, 'exam-candidate@demo.confora.test');
  await user(invigilatorId, 'exam-invigilator@demo.confora.test');
  await prisma.certificationScheme.upsert({
    where: { tenantId_id: { tenantId, id: schemeId } },
    create: {
      id: schemeId,
      tenantId,
      code: 'DIGCOMP-CERT',
      title: 'Digitalna kompetencija — osoba',
    },
    update: { title: 'Digitalna kompetencija — osoba' },
  });
  await prisma.certificationSchemeVersion.upsert({
    where: { tenantId_id: { tenantId, id: versionId } },
    create: {
      id: versionId,
      tenantId,
      schemeId,
      versionLabel: '1.0',
      scopeDescription: 'Osnove digitalne kompetencije za certifikaciju osobe.',
      jobDescription: 'Primjena digitalnih vještina u radnom okruženju.',
      experienceRequirement: 'Nije uslov za ovaj demo.',
      prerequisites: 'Odobrena prijava. Obuka nije uslov.',
      abilitiesSummary: 'Pretraga, sigurnost i sadržaj.',
      publicProcessSummary: 'Prijava, ispit, odluka odbora.',
      lifecycle: 'PUBLISHED',
    },
    update: { lifecycle: 'PUBLISHED' },
  });
  await item(itemA, 'PRETRAGA', 'Demo stavka domene pretrage. Nije za produkciju.');
  await item(itemB, 'SIGURNOST', 'Demo stavka domene sigurnosti. Nije za produkciju.');
  await prisma.examBlueprint.upsert({
    where: { tenantId_id: { tenantId, id: blueprintId } },
    create: {
      id: blueprintId,
      tenantId,
      schemeVersionId: versionId,
      title: 'Demo obrazac DIGCOMP-CERT',
      durationSeconds: 3600,
      status: 'APPROVED',
      retakeWindowDays: 90,
      cutScoreBasisPoints: 6000,
    },
    update: { status: 'APPROVED', cutScoreBasisPoints: 6000 },
  });
  await prisma.examBlueprintDomain.upsert({
    where: { tenantId_id: { tenantId, id: domainA } },
    create: {
      id: domainA,
      tenantId,
      blueprintId,
      domainCode: 'PRETRAGA',
      title: 'Pretraga',
      weightBasisPoints: 5000,
      itemCount: 1,
    },
    update: { itemCount: 1 },
  });
  await prisma.examBlueprintDomain.upsert({
    where: { tenantId_id: { tenantId, id: domainB } },
    create: {
      id: domainB,
      tenantId,
      blueprintId,
      domainCode: 'SIGURNOST',
      title: 'Sigurnost',
      weightBasisPoints: 5000,
      itemCount: 1,
    },
    update: { itemCount: 1 },
  });
  await prisma.standardSettingRecord.upsert({
    where: { tenantId_id: { tenantId, id: recordId } },
    create: {
      id: recordId,
      tenantId,
      blueprintId,
      method: 'ANGOFF',
      status: 'APPROVED',
      cutScoreBasisPoints: 6000,
      approvedByUserId: approverId,
      approvedAt: new Date('2026-10-20T10:00:00.000Z'),
      note: 'Demo panel. Autor i odobravatelj su različite osobe.',
    },
    update: { status: 'APPROVED', cutScoreBasisPoints: 6000 },
  });
  for (const [ratingId, panelistUserId, ratedItemId, probability] of [
    ['5b5b5b5b-5b5b-4b5b-8b5b-5b5b5b5b5b5b', authorId, itemA, 7000],
    ['5c5c5c5c-5c5c-4c5c-8c5c-5c5c5c5c5c5c', approverId, itemA, 7000],
    ['5d5d5d5d-5d5d-4d5d-8d5d-5d5d5d5d5d5d', authorId, itemB, 5000],
    ['5e5e5e5e-5e5e-4e5e-8e5e-5e5e5e5e5e5e', approverId, itemB, 5000],
  ] as const) {
    await prisma.standardSettingRating.upsert({
      where: { tenantId_id: { tenantId, id: ratingId } },
      create: {
        id: ratingId,
        tenantId,
        recordId,
        panelistUserId,
        itemId: ratedItemId,
        probabilityBasisPoints: probability,
      },
      update: { probabilityBasisPoints: probability },
    });
  }
  await prisma.assembledExamForm.upsert({
    where: { tenantId_id: { tenantId, id: formId } },
    create: {
      id: formId,
      tenantId,
      blueprintId,
      title: 'Demo obrazac DIGCOMP-CERT',
      shuffleItems: true,
      shuffleChoices: true,
      assembledByUserId: approverId,
      assembledAt: new Date('2026-10-20T10:05:00.000Z'),
    },
    update: { title: 'Demo obrazac DIGCOMP-CERT' },
  });
  await prisma.assembledExamFormItem.upsert({
    where: { tenantId_id: { tenantId, id: '6b6b6b6b-6b6b-4b6b-8b6b-6b6b6b6b6b6b' } },
    create: {
      id: '6b6b6b6b-6b6b-4b6b-8b6b-6b6b6b6b6b6b',
      tenantId,
      formId,
      itemId: itemA,
      domainCode: 'PRETRAGA',
      sequence: 1,
    },
    update: { sequence: 1 },
  });
  await prisma.assembledExamFormItem.upsert({
    where: { tenantId_id: { tenantId, id: '6c6c6c6c-6c6c-4c6c-8c6c-6c6c6c6c6c6c' } },
    create: {
      id: '6c6c6c6c-6c6c-4c6c-8c6c-6c6c6c6c6c6c',
      tenantId,
      formId,
      itemId: itemB,
      domainCode: 'SIGURNOST',
      sequence: 2,
    },
    update: { sequence: 2 },
  });
  await prisma.certificationApplication.upsert({
    where: { id: applicationId },
    create: {
      id: applicationId,
      tenantId,
      applicantUserId: candidateId,
      status: 'APPROVED',
      schemeRef: 'DIGCOMP-CERT',
      submittedAt: new Date('2026-10-01T00:00:00.000Z'),
    },
    update: { status: 'APPROVED', schemeRef: 'DIGCOMP-CERT' },
  });
  await prisma.certificationExamSession.upsert({
    where: { tenantId_id: { tenantId, id: sessionId } },
    create: {
      id: sessionId,
      tenantId,
      formId,
      candidateUserId: candidateId,
      certificationApplicationId: applicationId,
      scheduledStartAt: new Date('2026-10-21T09:00:00.000Z'),
      invigilatorUserId: invigilatorId,
      status: 'SCHEDULED',
      identityCaptureState: 'NOT_COLLECTED_DPIA_PENDING',
    },
    update: { status: 'SCHEDULED' },
  });
  console.log('Exam demo seed stored a scheduled session. No credential was issued.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
